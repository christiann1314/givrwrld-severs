import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const user = userData.user;
    const { method } = req;
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    switch (method) {
      case 'GET':
        if (action === 'list') {
          // List user's tickets
          const { data: tickets, error } = await supabaseClient
            .from('support_tickets')
            .select(`
              *,
              support_messages (
                id,
                message,
                created_at,
                is_staff_reply
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify({ tickets }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'POST':
        const body = await req.json();

        if (action === 'create') {
          const { subject, message, category = 'general', priority = 'normal' } = body;

          if (!subject || !message) {
            return new Response(JSON.stringify({ error: 'Subject and message are required' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            });
          }

          // Rate limit check
          const rateLimitResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rate-limiter`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              endpoint: 'support',
              identifier: user.id,
            }),
          });

          const rateLimitData = await rateLimitResponse.json();
          if (!rateLimitData.allowed) {
            return new Response(JSON.stringify({ 
              error: 'Rate limit exceeded. Please wait before creating another ticket.',
              retry_after: rateLimitData.retry_after 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 429,
            });
          }

          // Create ticket
          const { data: ticket, error: ticketError } = await supabaseClient
            .from('support_tickets')
            .insert({
              user_id: user.id,
              subject,
              category,
              priority,
              status: 'open'
            })
            .select()
            .single();

          if (ticketError) throw ticketError;

          // Create initial message
          const { error: messageError } = await supabaseClient
            .from('support_messages')
            .insert({
              ticket_id: ticket.id,
              user_id: user.id,
              message,
              is_staff_reply: false
            });

          if (messageError) throw messageError;

          console.log(`[SUPPORT] New ticket created: ${ticket.id} by user ${user.id}`);

          return new Response(JSON.stringify({ 
            success: true, 
            ticket_id: ticket.id,
            message: 'Support ticket created successfully' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (action === 'reply') {
          const { ticket_id, message } = body;

          if (!ticket_id || !message) {
            return new Response(JSON.stringify({ error: 'Ticket ID and message are required' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            });
          }

          // Verify ticket ownership
          const { data: ticket, error: ticketError } = await supabaseClient
            .from('support_tickets')
            .select('id, user_id, status')
            .eq('id', ticket_id)
            .eq('user_id', user.id)
            .single();

          if (ticketError || !ticket) {
            return new Response(JSON.stringify({ error: 'Ticket not found' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            });
          }

          if (ticket.status === 'closed') {
            return new Response(JSON.stringify({ error: 'Cannot reply to closed ticket' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            });
          }

          // Add reply
          const { error: messageError } = await supabaseClient
            .from('support_messages')
            .insert({
              ticket_id: ticket_id,
              user_id: user.id,
              message,
              is_staff_reply: false
            });

          if (messageError) throw messageError;

          // Update ticket status to 'waiting_for_staff' if it was 'waiting_for_user'
          if (ticket.status === 'waiting_for_user') {
            await supabaseClient
              .from('support_tickets')
              .update({ 
                status: 'waiting_for_staff',
                updated_at: new Date().toISOString()
              })
              .eq('id', ticket_id);
          }

          console.log(`[SUPPORT] Reply added to ticket ${ticket_id} by user ${user.id}`);

          return new Response(JSON.stringify({ 
            success: true,
            message: 'Reply added successfully' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'PUT':
        const updateBody = await req.json();
        const { ticket_id, action: updateAction } = updateBody;

        if (updateAction === 'close') {
          // User closes their own ticket
          const { error } = await supabaseClient
            .from('support_tickets')
            .update({ 
              status: 'closed',
              closed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', ticket_id)
            .eq('user_id', user.id);

          if (error) throw error;

          console.log(`[SUPPORT] Ticket ${ticket_id} closed by user ${user.id}`);

          return new Response(JSON.stringify({ 
            success: true,
            message: 'Ticket closed successfully' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        });
    }

  } catch (error) {
    console.error('[SUPPORT] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});