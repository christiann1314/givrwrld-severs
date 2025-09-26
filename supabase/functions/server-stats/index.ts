import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ServerStats {
  state: string;
  cpu_percent: number;
  memory_bytes: number;
  disk_bytes: number;
  uptime_ms: number;
  server_identifier: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const orderId = url.searchParams.get('order_id')
    const serverIdentifier = url.searchParams.get('server_identifier')

    if (!orderId && !serverIdentifier) {
      return new Response(
        JSON.stringify({ error: 'order_id or server_identifier is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get order details
    let order
    if (orderId) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (orderError || !orderData) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      order = orderData
    } else {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('pterodactyl_server_identifier', serverIdentifier)
        .eq('user_id', user.id)
        .single()

      if (orderError || !orderData) {
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      order = orderData
    }

    if (!order.pterodactyl_server_identifier) {
      return new Response(
        JSON.stringify({ error: 'Server not provisioned yet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get server stats from Pterodactyl
    const panelUrl = Deno.env.get('PANEL_URL')!
    const pteroClientKey = Deno.env.get('PTERO_CLIENT_KEY')!

    const statsResponse = await fetch(`${panelUrl}/api/client/servers/${order.pterodactyl_server_identifier}/resources`, {
      headers: {
        'Authorization': `Bearer ${pteroClientKey}`,
        'Accept': 'application/json'
      }
    })

    if (!statsResponse.ok) {
      // If server not found or error, return cached stats or default
      const { data: cachedStats } = await supabase
        .from('server_stats_cache')
        .select('*')
        .eq('order_id', order.id)
        .single()

      if (cachedStats) {
        return new Response(
          JSON.stringify({
            state: cachedStats.state,
            cpu_percent: cachedStats.cpu_percent,
            memory_bytes: cachedStats.memory_bytes,
            disk_bytes: cachedStats.disk_bytes,
            uptime_ms: cachedStats.uptime_ms,
            server_identifier: order.pterodactyl_server_identifier
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch server stats' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const statsData = await statsResponse.json()
    const stats: ServerStats = {
      state: statsData.attributes.current_state || 'unknown',
      cpu_percent: statsData.attributes.resources.cpu_absolute || 0,
      memory_bytes: statsData.attributes.resources.memory_bytes || 0,
      disk_bytes: statsData.attributes.resources.disk_bytes || 0,
      uptime_ms: statsData.attributes.resources.uptime || 0,
      server_identifier: order.pterodactyl_server_identifier
    }

    // Cache the stats
    await supabase
      .from('server_stats_cache')
      .upsert({
        order_id: order.id,
        state: stats.state,
        cpu_percent: stats.cpu_percent,
        memory_bytes: stats.memory_bytes,
        disk_bytes: stats.disk_bytes,
        uptime_ms: stats.uptime_ms,
        last_updated: new Date().toISOString()
      })

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Server stats error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

