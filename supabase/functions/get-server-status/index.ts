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
          has_server: false,
          message: 'User not found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get user servers
      const { data: servers } = await supabase
        .from('user_servers')
        .select('id, server_name, status, ip, port, game_type, pterodactyl_server_id')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })

      if (!servers || servers.length === 0) {
        return new Response(JSON.stringify({
          has_server: false,
          message: 'No servers found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Return the first/main server info
      const mainServer = servers[0]
      
      return new Response(JSON.stringify({
        has_server: true,
        server_info: {
          id: mainServer.id,
          name: mainServer.server_name,
          status: mainServer.status,
          ip: mainServer.ip || 'dedicated.givrwrldservers.com',
          port: mainServer.port || '25565',
          game_type: mainServer.game_type,
          pterodactyl_id: mainServer.pterodactyl_server_id
        },
        total_servers: servers.length
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Get server status error:', error)
      return new Response(JSON.stringify({ 
        error: error.message || 'Failed to get server status' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
})