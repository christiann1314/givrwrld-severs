import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper functions for game-specific configurations
function getEggId(gameType: string): number {
  switch (gameType.toLowerCase()) {
    case 'minecraft':
      return 1; // Minecraft egg ID
    case 'rust':
      return 4; // Rust egg ID
    case 'palworld':
      return 15; // Palworld egg ID
    default:
      return 1; // Default to Minecraft
  }
}

function getDockerImage(gameType: string): string {
  switch (gameType.toLowerCase()) {
    case 'minecraft':
      return "quay.io/pterodactyl/core:java";
    case 'rust':
      return "quay.io/parkervcp/pterodactyl-images:debian_rust";
    case 'palworld':
      return "steamcmd_debianghcr_io/parkervcp/steamcmd-debian";
    default:
      return "quay.io/pterodactyl/core:java";
  }
}

function getStartupCommand(gameType: string): string {
  switch (gameType.toLowerCase()) {
    case 'minecraft':
      return "java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}";
    case 'rust':
      return "./RustDedicated -batchmode -nographics -silent-crashes +server.port {{SERVER_PORT}} +server.identity \"rust\" +rcon.port {{RCON_PORT}} +rcon.web true +server.hostname \"{{HOSTNAME}}\" +server.level \"{{LEVEL}}\" +server.description \"{{DESCRIPTION}}\" +server.url \"{{SERVER_URL}}\" +server.headerimage \"{{SERVER_IMG}}\" +server.maxplayers {{MAX_PLAYERS}} +rcon.password \"{{RCON_PASS}}\" +server.saveinterval {{SAVEINTERVAL}} +app.port {{APP_PORT}}";
    case 'palworld':
      return "./PalServer.sh -port={{SERVER_PORT}} -publicport={{SERVER_PORT}} -servername=\"{{SERVER_NAME}}\" -players={{MAX_PLAYERS}} -adminpassword=\"{{ADMIN_PASSWORD}}\" -serverpassword=\"{{SERVER_PASSWORD}}\"";
    default:
      return "java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}";
  }
}

function getEnvironmentVars(gameType: string): object {
  switch (gameType.toLowerCase()) {
    case 'minecraft':
      return {
        SERVER_JARFILE: "server.jar",
        VANILLA_VERSION: "latest",
        SERVER_MEMORY: "1024"
      };
    case 'rust':
      return {
        HOSTNAME: "Rust Server",
        LEVEL: "Procedural Map",
        DESCRIPTION: "A Rust server hosted by GivrWorld",
        SERVER_URL: "https://givrwrldservers.com",
        RCON_PASS: "password",
        SAVEINTERVAL: "300",
        MAX_PLAYERS: "100"
      };
    case 'palworld':
      return {
        SERVER_NAME: "Palworld Server",
        ADMIN_PASSWORD: "password123",
        SERVER_PASSWORD: "",
        MAX_PLAYERS: "32",
        SRCDS_PORT: "8211",
        SRCDS_APPID: "2394010"
      };
    default:
      return {
        SERVER_JARFILE: "server.jar",
        VANILLA_VERSION: "latest"
      };
  }
}

function getDefaultPort(gameType: string): string {
  switch (gameType.toLowerCase()) {
    case 'minecraft':
      return '25565';
    case 'rust':
      return '28015';
    case 'palworld':
      return '8211';
    default:
      return '25565';
  }
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

    // Parse server specifications from database
    const ramGB = parseInt(server.ram.toString().replace(/[^\d]/g, '')) || 2;
    const cpuCores = parseInt(server.cpu.toString().replace(/[^\d]/g, '')) || 1;
    const diskGB = parseInt(server.disk.toString().replace(/[^\d]/g, '')) || 10;

    // Get node information (using your Dedicated-East node)
    const nodeResponse = await fetch(`${pterodactylUrl}/api/application/nodes`, {
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });

    if (!nodeResponse.ok) {
      console.error('Failed to fetch nodes')
      return new Response('Failed to fetch nodes', { status: 500 })
    }

    const nodesData = await nodeResponse.json();
    const dedicatedNode = nodesData.data.find((node: any) => 
      node.attributes.name === 'Dedicated-East' || 
      node.attributes.fqdn === 'dedicated.givrwrldservers.com'
    );

    if (!dedicatedNode) {
      console.error('Dedicated-East node not found')
      return new Response('Dedicated node not found', { status: 500 })
    }

    const nodeId = dedicatedNode.attributes.id;

    // Get available allocations for the node
    const allocationsResponse = await fetch(`${pterodactylUrl}/api/application/nodes/${nodeId}/allocations`, {
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });

    if (!allocationsResponse.ok) {
      console.error('Failed to fetch allocations')
      return new Response('Failed to fetch allocations', { status: 500 })
    }

    const allocationsData = await allocationsResponse.json();
    const availableAllocation = allocationsData.data.find((alloc: any) => !alloc.attributes.assigned);

    if (!availableAllocation) {
      console.error('No available allocations')
      return new Response('No available allocations', { status: 500 })
    }

    // Create server in Pterodactyl Panel
    const serverData = {
      name: server.server_name,
      description: `${server.game_type} server for user ${server.user_id}`,
      user: 1, // Default admin user in Pterodactyl
      egg: getEggId(server.game_type),
      docker_image: getDockerImage(server.game_type),
      startup: getStartupCommand(server.game_type),
      environment: getEnvironmentVars(server.game_type),
      limits: {
        memory: ramGB * 1024, // Convert GB to MB
        swap: 0,
        disk: diskGB * 1024, // Convert GB to MB
        io: 500,
        cpu: cpuCores * 100 // Convert cores to percentage
      },
      feature_limits: {
        databases: 2,
        allocations: 1,
        backups: 5
      },
      allocation: {
        default: availableAllocation.attributes.id
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
        ip: 'dedicated.givrwrldservers.com', // Your server FQDN
        port: availableAllocation.attributes.port.toString(),
        pterodactyl_server_id: pterodactylServer.attributes.id.toString()
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