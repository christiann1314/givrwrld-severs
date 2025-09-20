import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withRateLimit } from '../rate-limiter/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  return await withRateLimit(req, 'user_data', async (req) => {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      )

      // Parse request body
      const { email } = await req.json()
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get user ID from email
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single()

      if (!profile) {
        return new Response(JSON.stringify({
          servers: [],
          message: 'User not found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get user servers with all details
      const { data: servers, error } = await supabase
        .from('user_servers')
        .select(`
          id,
          server_name,
          game_type,
          ram,
          cpu,
          disk,
          location,
          status,
          ip,
          port,
          pterodactyl_server_id,
          pterodactyl_url,
          subscription_id,
          billing_term,
          created_at,
          updated_at,
          live_stats
        `)
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching servers:', error)
        return new Response(JSON.stringify({ error: 'Failed to fetch servers' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        servers: servers || [],
        total_count: servers?.length || 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Get user servers error:', error)
      return new Response(JSON.stringify({ 
        error: error.message || 'Failed to get user servers' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  })
})