import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple rate limiting for this function
const rateLimitStore: { [key: string]: { count: number; resetTime: number } } = {}

function checkRateLimit(identifier: string, maxRequests: number = 30, windowMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now()
  const key = `user_data:${identifier}`
  
  // Clean up expired entries
  Object.keys(rateLimitStore).forEach(k => {
    if (rateLimitStore[k].resetTime < now) {
      delete rateLimitStore[k]
    }
  })
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
    return true
  }
  
  if (rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
    return true
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return false
  }
  
  rateLimitStore[key].count++
  return true
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  try {
    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || 'unknown'
    
    if (!checkRateLimit(identifier)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

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