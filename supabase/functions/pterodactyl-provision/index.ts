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
      return "ghcr.io/pterodactyl/yolks:java_21";
    case 'rust':
      return "ghcr.io/pterodactyl/yolks:rust_latest";
    case 'palworld':
      return "ghcr.io/pterodactyl/yolks:steamcmd_debian";
    default:
      return "ghcr.io/pterodactyl/yolks:java_21";
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

// Dynamically resolve the best Minecraft egg to avoid proxy eggs like Bungeecord
async function resolveMinecraftEgg(pterodactylUrl: string, apiKey: string) {
  try {
    const nestsRes = await fetch(`${pterodactylUrl}/api/application/nests`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });
    if (!nestsRes.ok) return null;
    const nests = await nestsRes.json();
    const mcNest = nests.data.find((n: any) => (n.attributes.name || '').toLowerCase().includes('minecraft')) || nests.data.find((n: any) => n.attributes.id === 1);
    if (!mcNest) return null;

    const eggsRes = await fetch(`${pterodactylUrl}/api/application/nests/${mcNest.attributes.id}/eggs`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });
    if (!eggsRes.ok) return null;
    const eggs = await eggsRes.json();

    const priority = ['paper', 'vanilla', 'purpur', 'fabric', 'forge'];
    const avoid = ['bunge', 'waterfall', 'velocity', 'proxy'];
    let chosen = eggs.data.find((e: any) => {
      const name = (e.attributes.name || '').toLowerCase();
      return priority.some(p => name.includes(p));
    }) || eggs.data.find((e: any) => {
      const name = (e.attributes.name || '').toLowerCase();
      return !avoid.some(a => name.includes(a));
    });
    if (!chosen) return null;

    let dockerImage: string;
    const di = chosen.attributes.docker_image;
    if (typeof di === 'string') dockerImage = di;
    else if (di && typeof di === 'object') {
      const values = Object.values(di as Record<string, string>);
      dockerImage = (values[0] as string) || 'ghcr.io/pterodactyl/yolks:java_21';
    } else dockerImage = 'ghcr.io/pterodactyl/yolks:java_21';

    // Normalize deprecated quay images to GHCR yolks
    if (dockerImage.includes('quay.io/pterodactyl/core')) {
      dockerImage = 'ghcr.io/pterodactyl/yolks:java_21';
    }

    const startup = chosen.attributes.startup || "java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}";
    const env: Record<string, string> = {
      EULA: 'TRUE',
      MINECRAFT_VERSION: 'latest',
      VANILLA_VERSION: 'latest',
      VERSION: 'latest',
      SERVER_JARFILE: 'server.jar'
    };

    return { eggId: chosen.attributes.id, dockerImage, startup, env };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Pterodactyl provisioning started')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const requestBody = await req.json()
    console.log('📝 Request body:', requestBody)
    
    const { serverId } = requestBody
    if (!serverId) {
      console.error('❌ No serverId provided')
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
      console.error('❌ Server not found or fetch error:', fetchError)
      return new Response('Server not found', { status: 404 })
    }

    // Fetch profile (optional)
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, email, display_name, pterodactyl_user_id, pterodactyl_password')
      .eq('user_id', server.user_id)
      .maybeSingle()

    // Fetch bundle configuration if bundle is selected
    let bundleConfig = { env: {}, limits: {} }
    if (server.bundle_id) {
      const { data: bundle } = await supabase
        .from('bundles')
        .select('pterodactyl_env, pterodactyl_limits_patch')
        .eq('id', server.bundle_id)
        .single()
      
      if (bundle) {
        bundleConfig = {
          env: bundle.pterodactyl_env || {},
          limits: bundle.pterodactyl_limits_patch || {}
        }
      }
    }

    // Fetch addon configurations if addons are selected
    let addonConfigs = { env: {}, limits: {} }
    if (server.addon_ids && server.addon_ids.length > 0) {
      const { data: addons } = await supabase
        .from('addons')
        .select('pterodactyl_env, pterodactyl_limits_patch')
        .in('id', server.addon_ids)
      
      if (addons) {
        addons.forEach(addon => {
          addonConfigs.env = { ...addonConfigs.env, ...(addon.pterodactyl_env || {}) }
          addonConfigs.limits = { ...addonConfigs.limits, ...(addon.pterodactyl_limits_patch || {}) }
        })
      }
    }

    // Fetch modpack configuration if modpack is selected
    let modpackConfig = { env: {} }
    if (server.modpack_id) {
      const { data: modpack } = await supabase
        .from('modpacks')
        .select('pterodactyl_env')
        .eq('id', server.modpack_id)
        .single()
      
      if (modpack) {
        modpackConfig = {
          env: modpack.pterodactyl_env || {}
        }
      }
    }

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

    // Resolve Pterodactyl user (profile optional)
    let pterodactylUserId = (profile as any)?.pterodactyl_user_id as number | undefined;
    let userEmail = (profile as any)?.email as string | undefined;
    let displayName = (profile as any)?.display_name as string | undefined;
    
    if (!userEmail) {
      const { data: adminUser } = await supabase.auth.admin.getUserById(server.user_id);
      userEmail = adminUser?.user?.email || userEmail;
      if (!displayName && userEmail) displayName = userEmail.split('@')[0];
    }
    
    if (!pterodactylUserId) {
      // Create Pterodactyl user if doesn't exist
      const createUserResponse = await supabase.functions.invoke('create-pterodactyl-user', {
        body: {
          userId: server.user_id,
          email: userEmail,
          displayName
        }
      });
      
      if (createUserResponse.error) {
        console.error('Failed to create Pterodactyl user:', createUserResponse.error)
        return new Response('Failed to create Pterodactyl user', { status: 500 })
      }
      
      // Prefer the ID returned by the function to avoid relying on profile schema columns
      const returnedId = (createUserResponse.data as any)?.pterodactylUserId as number | undefined
      
      if (returnedId) {
        pterodactylUserId = returnedId
      } else {
        // Fallback: fetch updated profile
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('pterodactyl_user_id, email, display_name')
          .eq('user_id', server.user_id)
          .single()
        
        pterodactylUserId = updatedProfile?.pterodactyl_user_id as number | undefined;
        userEmail = userEmail || (updatedProfile as any)?.email;
        displayName = displayName || (updatedProfile as any)?.display_name as string | undefined;
      }
    }

    if (!pterodactylUserId) {
      console.error('Unable to resolve Pterodactyl user ID')
      return new Response('Unable to resolve Pterodactyl user ID', { status: 500 })
    }

    // Merge all environment variables (base + bundle + addons + modpack + stored env_vars)
    const baseEnv = getEnvironmentVars(server.game_type)
    const storedEnv = server.env_vars || {}
    const mergedEnv = {
      ...baseEnv,
      ...bundleConfig.env,
      ...addonConfigs.env,
      ...modpackConfig.env,
      ...storedEnv
    }

    // Merge server limits with bundle and addon patches
    const baseLimits = {
      memory: ramGB * 1024, // Convert GB to MB
      swap: 0,
      disk: diskGB * 1024, // Convert GB to MB
      io: 500,
      cpu: cpuCores * 100 // Convert cores to percentage
    }
    
    const storedLimits = server.server_limits || {}
    const mergedLimits = {
      ...baseLimits,
      ...bundleConfig.limits,
      ...addonConfigs.limits,
      ...storedLimits
    }

    // Set feature limits based on bundle level
    let featureLimits = {
      databases: 2,
      allocations: 1,
      backups: 5
    }

    // Enhance limits based on bundle
    if (server.bundle_id) {
      const { data: bundle } = await supabase
        .from('bundles')
        .select('slug')
        .eq('id', server.bundle_id)
        .single()
      
      if (bundle?.slug === 'essentials') {
        featureLimits.backups = 10 // Daily backups with longer retention
      } else if (bundle?.slug === 'expansion') {
        featureLimits.databases = 5
        featureLimits.allocations = 3
        featureLimits.backups = 15
      } else if (bundle?.slug === 'community') {
        featureLimits.backups = 7
      }
    }

    // Create server in Pterodactyl Panel
    // Resolve egg/image/startup dynamically for Minecraft to avoid proxy eggs
    let targetEgg = getEggId(server.game_type);
    let targetDocker = getDockerImage(server.game_type);
    let targetStartup = getStartupCommand(server.game_type);
    let environment = { ...mergedEnv } as Record<string, any>;

    if ((server.game_type || '').toLowerCase() === 'minecraft') {
      const resolved = await resolveMinecraftEgg(pterodactylUrl, pterodactylKey);
      if (resolved) {
        targetEgg = resolved.eggId ?? targetEgg;
        targetDocker = resolved.dockerImage ?? targetDocker;
        targetStartup = resolved.startup ?? targetStartup;
        environment = { ...environment, ...(resolved.env || {}) };
      }
      // Normalize deprecated quay images to GHCR yolks
      if (targetDocker.includes('quay.io/pterodactyl/core')) {
        targetDocker = 'ghcr.io/pterodactyl/yolks:java_21';
      }
      // Always accept the EULA and provide safe defaults so the API doesn't fail on required vars
      environment = {
        EULA: 'TRUE',
        MINECRAFT_VERSION: environment.MINECRAFT_VERSION || environment.VERSION || 'latest',
        VANILLA_VERSION: environment.VANILLA_VERSION || 'latest',
        VERSION: environment.VERSION || 'latest',
        BUNGEE_VERSION: environment.BUNGEE_VERSION || 'latest',
        SERVER_JARFILE: environment.SERVER_JARFILE || 'server.jar',
        ...environment,
      };
    }

    const serverData = {
      name: server.server_name,
      description: `${server.game_type} server for ${userEmail || 'unknown user'}`,
      user: pterodactylUserId, // Use actual user instead of admin
      egg: targetEgg,
      docker_image: targetDocker,
      startup: targetStartup,
      environment,
      limits: mergedLimits,
      feature_limits: featureLimits,
      allocation: {
        default: availableAllocation.attributes.id
      },
      start_on_completion: true,
      skip_scripts: false
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
        status: 'installing',
        pterodactyl_url: `${pterodactylUrl}/server/${pterodactylServer.attributes.identifier}`,
        ip: 'dedicated.givrwrldservers.com', // Your server FQDN
        port: availableAllocation.attributes.port.toString(),
        pterodactyl_server_id: pterodactylServer.attributes.id.toString()
      })
      .eq('id', serverId)

    if (updateError) {
      console.error('Error updating server:', updateError)
    }

    console.log('✅ Server created successfully in Pterodactyl, installation will begin automatically');

    return new Response('Server provisioned successfully', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('❌ Provisioning error:', error)
    console.error('Error stack:', error.stack)
    return new Response(JSON.stringify({ 
      error: 'Provisioning failed', 
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})