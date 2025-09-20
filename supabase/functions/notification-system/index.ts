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
    const action = url.searchParams.get('action') || 'list';

    switch (req.method) {
      case 'GET':
        if (action === 'list') {
          // Get user notifications
          const { data: notifications, error } = await supabaseClient
            .from('user_notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          return new Response(JSON.stringify({ notifications }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (action === 'unread-count') {
          // Get unread notification count
          const { count, error } = await supabaseClient
            .from('user_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false);

          if (error) throw error;

          return new Response(JSON.stringify({ unread_count: count || 0 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'PUT':
        const body = await req.json();
        
        if (action === 'mark-read') {
          const { notification_ids } = body;
          
          if (!notification_ids || !Array.isArray(notification_ids)) {
            return new Response(JSON.stringify({ error: 'notification_ids array required' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            });
          }

          const { error } = await supabaseClient
            .from('user_notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .in('id', notification_ids);

          if (error) throw error;

          console.log(`[NOTIFICATIONS] Marked ${notification_ids.length} notifications as read for user ${user.id}`);

          return new Response(JSON.stringify({ 
            success: true,
            message: `${notification_ids.length} notifications marked as read`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (action === 'mark-all-read') {
          const { error } = await supabaseClient
            .from('user_notifications')
            .update({ read: true, read_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('read', false);

          if (error) throw error;

          console.log(`[NOTIFICATIONS] All notifications marked as read for user ${user.id}`);

          return new Response(JSON.stringify({ 
            success: true,
            message: 'All notifications marked as read'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'DELETE':
        const deleteBody = await req.json();
        const { notification_ids } = deleteBody;

        if (!notification_ids || !Array.isArray(notification_ids)) {
          return new Response(JSON.stringify({ error: 'notification_ids array required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        const { error } = await supabaseClient
          .from('user_notifications')
          .delete()
          .eq('user_id', user.id)
          .in('id', notification_ids);

        if (error) throw error;

        console.log(`[NOTIFICATIONS] Deleted ${notification_ids.length} notifications for user ${user.id}`);

        return new Response(JSON.stringify({ 
          success: true,
          message: `${notification_ids.length} notifications deleted`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        });
    }

  } catch (error) {
    console.error('[NOTIFICATIONS] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});