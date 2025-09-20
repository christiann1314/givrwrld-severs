import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withRateLimit } from '../rate-limiter/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  return await withRateLimit(req, 'userData', async (req) => {

  try {
    console.log('🚀 Server start request received')
    
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
    
    // Get server details
    const { data: server, error: fetchError } = await supabase
      .from('user_servers')
      .select('*')
      .eq('id', serverId)
      .single()

    if (fetchError || !server) {
      console.error('❌ Server not found:', fetchError)
      return new Response('Server not found', { status: 404, headers: corsHeaders })
    }

    if (!server.pterodactyl_server_id) {
      console.error('❌ Server has no Pterodactyl ID')
      return new Response('Server not properly provisioned', { status: 400, headers: corsHeaders })
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
      
      // Update server status
      await supabase
        .from('user_servers')
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
})