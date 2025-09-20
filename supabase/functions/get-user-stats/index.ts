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
          active_servers: 0,
          total_spent: 0,
          support_tickets: 0,
          referrals: 0
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', profile.user_id)
        .single()

      if (!stats) {
        // Create default stats if they don't exist
        const { data: newStats } = await supabase
          .from('user_stats')
          .insert({
            user_id: profile.user_id,
            active_servers: 0,
            total_spent: 0,
            support_tickets: 0,
            referrals: 0
          })
          .select()
          .single()

        return new Response(JSON.stringify({
          active_servers: newStats?.active_servers || 0,
          total_spent: parseFloat(newStats?.total_spent || '0'),
          support_tickets: newStats?.support_tickets || 0,
          referrals: newStats?.referrals || 0
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        active_servers: stats.active_servers || 0,
        total_spent: parseFloat(stats.total_spent || '0'),
        support_tickets: stats.support_tickets || 0,
        referrals: stats.referrals || 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Get user stats error:', error)
      return new Response(JSON.stringify({ 
        error: error.message || 'Failed to get user stats' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  })
})