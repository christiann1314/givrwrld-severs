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
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'export-data':
        // Export all user data
        const userData_export = {
          user_id: user.id,
          email: user.email,
          created_at: user.created_at,
          export_date: new Date().toISOString(),
          data: {}
        };

        // Get profile data
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile) userData_export.data.profile = profile;

        // Get user stats
        const { data: stats } = await supabaseClient
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (stats) userData_export.data.stats = stats;

        // Get user servers
        const { data: servers } = await supabaseClient
          .from('user_servers')
          .select('*')
          .eq('user_id', user.id);
        
        if (servers) userData_export.data.servers = servers;

        // Get orders
        const { data: orders } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('user_id', user.id);
        
        if (orders) userData_export.data.orders = orders;

        // Get support tickets
        const { data: tickets } = await supabaseClient
          .from('support_tickets')
          .select(`
            *,
            support_messages (*)
          `)
          .eq('user_id', user.id);
        
        if (tickets) userData_export.data.support_tickets = tickets;

        // Log data export request
        await supabaseClient
          .from('gdpr_requests')
          .insert({
            user_id: user.id,
            request_type: 'data_export',
            status: 'completed',
            completed_at: new Date().toISOString()
          });

        console.log(`[GDPR] Data export completed for user ${user.id}`);

        return new Response(JSON.stringify(userData_export), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="user-data-${user.id}.json"`
          },
        });

      case 'delete-account':
        // Handle account deletion request
        const deleteBody = await req.json();
        const { confirmation } = deleteBody;

        if (confirmation !== 'DELETE_MY_ACCOUNT') {
          return new Response(JSON.stringify({ 
            error: 'Invalid confirmation. Please type "DELETE_MY_ACCOUNT" to confirm.' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        // Create deletion request (admin will process it)
        const { data: deletionRequest, error: requestError } = await supabaseClient
          .from('gdpr_requests')
          .insert({
            user_id: user.id,
            request_type: 'account_deletion',
            status: 'pending',
            request_details: {
              confirmation_text: confirmation,
              ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
              user_agent: req.headers.get('user-agent')
            }
          })
          .select()
          .single();

        if (requestError) throw requestError;

        console.log(`[GDPR] Account deletion requested for user ${user.id}`);

        return new Response(JSON.stringify({ 
          success: true,
          message: 'Account deletion request submitted. This will be processed within 30 days.',
          request_id: deletionRequest.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'consent-status':
        // Get user's consent status
        const { data: consents } = await supabaseClient
          .from('user_consents')
          .select('*')
          .eq('user_id', user.id);

        return new Response(JSON.stringify({ 
          consents: consents || [],
          last_updated: consents?.[0]?.updated_at || null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update-consent':
        // Update user consent preferences
        const consentBody = await req.json();
        const { marketing_emails, analytics, cookies } = consentBody;

        const { error: consentError } = await supabaseClient
          .from('user_consents')
          .upsert({
            user_id: user.id,
            marketing_emails: marketing_emails ?? false,
            analytics: analytics ?? false,
            cookies: cookies ?? true, // Essential cookies always true
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (consentError) throw consentError;

        console.log(`[GDPR] Consent updated for user ${user.id}`);

        return new Response(JSON.stringify({ 
          success: true,
          message: 'Consent preferences updated successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'data-retention':
        // Show user data retention information
        const retentionPolicy = {
          account_data: '2 years after account closure',
          server_data: '1 year after server termination',
          payment_data: '7 years (legal requirement)',
          support_tickets: '3 years after resolution',
          logs: '90 days',
          analytics: '14 months'
        };

        return new Response(JSON.stringify({ 
          retention_policy: retentionPolicy,
          user_registered: user.created_at,
          estimated_deletion: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }

  } catch (error) {
    console.error('[GDPR] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});