import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Game configuration inline for now
const getGameConfig = (game: string, resources: { ram_gb: number; vcores: number; ssd_gb: number }) => {
  const configs = {
    minecraft: {
      eggId: 1, // Update with your actual Minecraft egg ID
      dockerImage: 'ghcr.io/pterodactyl/yolks:java_17',
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}',
      environment: {
        SERVER_JARFILE: 'server.jar',
        VERSION: 'latest'
      },
      limits: {
        memory: resources.ram_gb * 1024,
        swap: 0,
        disk: resources.ssd_gb * 1024,
        io: 500,
        cpu: resources.vcores * 100
      }
    },
    rust: {
      eggId: 2, // Update with your actual Rust egg ID
      dockerImage: 'ghcr.io/pterodactyl/games:rust',
      startup: './RustDedicated -batchmode +server.port {{SERVER_PORT}} +server.identity "rust" +rcon.port {{RCON_PORT}} +rcon.web true +server.hostname "{{HOSTNAME}}" +server.level "{{LEVEL}}" +server.description "{{DESCRIPTION}}" +server.url "{{SERVER_URL}}" +server.headerimage "{{SERVER_IMG}}" +server.maxplayers {{MAX_PLAYERS}} +rcon.password "{{RCON_PASS}}" +server.saveinterval {{SAVEINTERVAL}} {{ADDITIONAL_ARGS}}',
      environment: {
        HOSTNAME: 'GIVRwrld Rust Server',
        LEVEL: 'Procedural Map',
        DESCRIPTION: 'Powered by GIVRwrld',
        MAX_PLAYERS: '100'
      },
      limits: {
        memory: resources.ram_gb * 1024,
        swap: 0,
        disk: resources.ssd_gb * 1024,
        io: 500,
        cpu: resources.vcores * 100
      }
    },
    palworld: {
      eggId: 3, // Update with your actual Palworld egg ID
      dockerImage: 'ghcr.io/pterodactyl/games:palworld',
      startup: './PalServer.sh',
      environment: {
        SERVER_NAME: 'GIVRwrld Palworld Server',
        MAX_PLAYERS: '32'
      },
      limits: {
        memory: resources.ram_gb * 1024,
        swap: 0,
        disk: resources.ssd_gb * 1024,
        io: 500,
        cpu: resources.vcores * 100
      }
    }
  }
  
  return configs[game as keyof typeof configs] || configs.minecraft
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProvisionRequest {
  order_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id }: ProvisionRequest = await req.json()

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get order details with plan and user info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        plans (*)
      `)
      .eq('id', order_id)
      .eq('status', 'paid')
      .single()

    if (orderError || !order) {
      throw new Error(`Order not found or not paid: ${order_id}`)
    }

    const plan = order.plans

    // Update order status to provisioning
    await supabase
      .from('orders')
      .update({ status: 'provisioning' })
      .eq('id', order_id)

    // Get user's external account
    const { data: externalAccount, error: accountError } = await supabase
      .from('external_accounts')
      .select('*')
      .eq('user_id', order.user_id)
      .single()

    if (accountError || !externalAccount) {
      throw new Error('User external account not found. Please create panel account first.')
    }

    // Find best-fit node
    const { data: nodes, error: nodesError } = await supabase
      .from('ptero_nodes')
      .select('*')
      .eq('region', order.region)
      .eq('enabled', true)

    if (nodesError || !nodes || nodes.length === 0) {
      throw new Error(`No available nodes in region: ${order.region}`)
    }

    // Calculate available capacity for each node
    const nodesWithCapacity = await Promise.all(
      nodes.map(async (node) => {
        const { data: orders } = await supabase
          .from('orders')
          .select('plans(ram_gb)')
          .eq('node_id', node.id)
          .eq('status', 'provisioned')

        const usedRam = orders?.reduce((sum, order) => sum + (order.plans?.ram_gb || 0), 0) || 0
        const availableRam = node.max_ram_gb - node.reserved_headroom_gb - usedRam

        return {
          ...node,
          available_ram: availableRam,
          used_ram: usedRam
        }
      })
    )

    // Find best-fit node
    const suitableNodes = nodesWithCapacity.filter(node => node.available_ram >= plan.ram_gb)
    if (suitableNodes.length === 0) {
      throw new Error(`No available capacity for plan ${plan_id} in region ${region}`)
    }

    const bestNode = suitableNodes.reduce((best, current) => 
      current.available_ram < best.available_ram ? current : best
    )

    // Get available allocation/port
    const panelUrl = Deno.env.get('PANEL_URL')!
    const pteroAppKey = Deno.env.get('PTERO_APP_KEY')!

    const allocationsResponse = await fetch(`${panelUrl}/api/application/nodes/${bestNode.pterodactyl_node_id}/allocations`, {
      headers: {
        'Authorization': `Bearer ${pteroAppKey}`,
        'Accept': 'application/json'
      }
    })

    if (!allocationsResponse.ok) {
      throw new Error(`Failed to fetch allocations: ${allocationsResponse.status}`)
    }

    const allocationsData = await allocationsResponse.json()
    const availableAllocation = allocationsData.data.find((alloc: any) => 
      !alloc.attributes.assigned && alloc.attributes.port >= 25565 && alloc.attributes.port <= 65535
    )

    if (!availableAllocation) {
      throw new Error('No available ports on selected node')
    }

    // Get game configuration
    const gameConfig = getGameConfig(plan.game, {
      ram_gb: plan.ram_gb,
      vcores: plan.vcores,
      ssd_gb: plan.ssd_gb
    })

    // Create server in Pterodactyl
    const serverData = {
      name: order.server_name,
      description: `GIVRwrld ${plan.game} server for ${order.server_name}`,
      user: externalAccount.pterodactyl_user_id,
      egg: gameConfig.eggId,
      docker_image: gameConfig.dockerImage,
      startup: gameConfig.startup,
      environment: gameConfig.environment,
      limits: gameConfig.limits,
      feature_limits: {
        databases: 0,
        allocations: 1
      },
      allocation: {
        default: availableAllocation.attributes.id
      }
    }

    const serverResponse = await fetch(`${panelUrl}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pteroAppKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(serverData)
    })

    if (!serverResponse.ok) {
      const errorText = await serverResponse.text()
      throw new Error(`Failed to create server: ${serverResponse.status} ${errorText}`)
    }

    const serverResult = await serverResponse.json()
    const serverId = serverResult.attributes.id
    const serverIdentifier = serverResult.attributes.identifier

    // Update order with server details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'provisioned',
        pterodactyl_server_id: serverId,
        pterodactyl_server_identifier: serverIdentifier,
        node_id: bestNode.id
      })
      .eq('id', order_id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({
        id: serverId,
        identifier: serverIdentifier,
        node: bestNode.name,
        allocation: availableAllocation.attributes.port
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Server provisioning error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

