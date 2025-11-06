import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Authenticate user via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create authenticated client to get user from JWT
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🚀 Server start request received for user:', user.id)
    
    // Use service role for database queries after authentication
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const requestBody = await req.json()
    const { serverId } = requestBody
    
    if (!serverId) {
      return new Response('No serverId provided', { status: 400, headers: corsHeaders })
    }
    
    console.log('🔍 Looking for server:', serverId)
    
    // Get server details and verify ownership
    const { data: server, error: fetchError } = await supabase
      .from('orders')
      .select('*, user_id')
      .eq('id', serverId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !server) {
      console.error('❌ Server not found or access denied:', fetchError)
      return new Response(JSON.stringify({ error: 'Server not found or access denied' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!server.pterodactyl_server_id) {
      console.error('❌ Server has no Pterodactyl ID')
      return new Response(JSON.stringify({ error: 'Server not properly provisioned' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Pterodactyl configuration
    const pterodactylUrl = Deno.env.get('PTERODACTYL_URL')
    const pterodactylKey = Deno.env.get('PTERODACTYL_API_KEY')

    if (!pterodactylUrl || !pterodactylKey) {
      console.error('❌ Pterodactyl configuration missing')
      return new Response('Pterodactyl configuration missing', { status: 500, headers: corsHeaders })
    }

    // Get server identifier from Pterodactyl
    const serverDetailsResponse = await fetch(`${pterodactylUrl}/api/application/servers/${server.pterodactyl_server_id}`, {
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });

    if (!serverDetailsResponse.ok) {
      console.error('❌ Failed to get server details from Pterodactyl')
      return new Response('Failed to get server details', { status: 500, headers: corsHeaders })
    }

    const serverDetails = await serverDetailsResponse.json()
    const serverIdentifier = serverDetails.attributes.identifier

    console.log('🚀 Starting server:', serverIdentifier)

    // Start the server using client API
    const startResponse = await fetch(`${pterodactylUrl}/api/client/servers/${serverIdentifier}/power`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      },
      body: JSON.stringify({ signal: 'start' })
    })
    
    if (startResponse.ok) {
      console.log('✅ Server start command sent successfully')
      
      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'starting' })
        .eq('id', serverId)
      
      return new Response('Server start command sent', { 
        status: 200,
        headers: corsHeaders 
      })
    } else {
      const errorText = await startResponse.text()
      console.error('❌ Failed to start server:', errorText)
      return new Response('Failed to start server', { status: 500, headers: corsHeaders })
    }

  } catch (error) {
    console.error('❌ Start server error:', error)
    return new Response(JSON.stringify({ 
      error: 'Start server failed', 
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})