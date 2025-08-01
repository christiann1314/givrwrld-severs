import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { serverId } = await req.json()
    
    // Get server details from Supabase
    const { data: server, error: fetchError } = await supabase
      .from('user_servers')
      .select('*')
      .eq('id', serverId)
      .single()

    if (fetchError || !server) {
      return new Response('Server not found', { status: 404 })
    }

    // Pterodactyl Panel API configuration
    const pterodactylUrl = Deno.env.get('PTERODACTYL_URL')
    const pterodactylKey = Deno.env.get('PTERODACTYL_API_KEY')

    if (!pterodactylUrl || !pterodactylKey) {
      console.error('Pterodactyl configuration missing')
      return new Response('Pterodactyl configuration missing', { status: 500 })
    }

    // Parse RAM and CPU values more reliably
    const ramMatch = server.ram.match(/(\d+)/);
    const ramGB = ramMatch ? parseInt(ramMatch[1]) : 1;
    const cpuMatch = server.cpu.match(/(\d+(?:\.\d+)?)/);
    const cpuValue = cpuMatch ? parseFloat(cpuMatch[1]) : 0.5;
    const diskMatch = server.disk.match(/(\d+)/);
    const diskGB = diskMatch ? parseInt(diskMatch[1]) : 10;

    // Create server in Pterodactyl Panel
    const serverData = {
      name: server.server_name,
      description: `${server.game_type} server for user ${server.user_id}`,
      user: 1, // Default user ID in Pterodactyl - you may need to adjust this
      egg: server.game_type === 'Minecraft' ? 1 : 1, // Adjust egg IDs based on your setup
      docker_image: "quay.io/pterodactyl/core:java",
      startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}",
      environment: {
        SERVER_JARFILE: "server.jar",
        VANILLA_VERSION: "latest"
      },
      limits: {
        memory: ramGB * 1024, // Convert GB to MB
        swap: 0,
        disk: diskGB * 1024, // Convert GB to MB
        io: 500,
        cpu: cpuValue * 100 // Convert to percentage
      },
      feature_limits: {
        databases: 1,
        allocations: 1,
        backups: 2
      },
      allocation: {
        default: 1 // You may need to adjust this to a valid allocation ID
      }
    }

    const response = await fetch(`${pterodactylUrl}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      },
      body: JSON.stringify(serverData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pterodactyl API error:', errorText)
      return new Response('Failed to create server in Pterodactyl', { status: 500 })
    }

    const pterodactylServer = await response.json()
    
    // Update server record with Pterodactyl details
    const { error: updateError } = await supabase
      .from('user_servers')
      .update({
        status: 'online',
        pterodactyl_url: `${pterodactylUrl}/server/${pterodactylServer.attributes.identifier}`,
        ip: 'server.givrwrldservers.com', // Your server IP
        port: '25565' // Default Minecraft port
      })
      .eq('id', serverId)

    if (updateError) {
      console.error('Error updating server:', updateError)
    }

    return new Response('Server provisioned successfully', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Provisioning error:', error)
    return new Response('Provisioning failed', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})