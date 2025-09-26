import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getGameConfig } from '../../src/config/gameConfigs.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProvisionRequest {
  user_id: string;
  plan_id: string;
  region: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, plan_id, region }: ProvisionRequest = await req.json()

    if (!user_id || !plan_id || !region) {
      return new Response(
        JSON.stringify({ error: 'user_id, plan_id, and region are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      throw new Error(`Plan not found: ${plan_id}`)
    }

    // Get user's external account
    const { data: externalAccount, error: accountError } = await supabase
      .from('external_accounts')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (accountError || !externalAccount) {
      throw new Error('User external account not found. Please create panel account first.')
    }

    // Find best-fit node
    const { data: nodes, error: nodesError } = await supabase
      .from('ptero_nodes')
      .select('*')
      .eq('region', region)
      .eq('enabled', true)

    if (nodesError || !nodes || nodes.length === 0) {
      throw new Error(`No available nodes in region: ${region}`)
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
      name: `${plan.game}-${user_id.slice(0, 8)}`,
      description: `GIVRwrld ${plan.game} server`,
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
      .eq('user_id', user_id)
      .eq('plan_id', plan_id)
      .eq('status', 'paid')

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

