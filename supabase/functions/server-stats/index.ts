<<<<<<< HEAD
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

=======
// Deno Edge Function: GET /server-stats?order_id=...  OR  ?server_identifier=...
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PANEL_URL = Deno.env.get("PANEL_URL")!;
const CLIENT_KEY = Deno.env.get("PTERO_CLIENT_KEY")!;

function cors(req: Request) {
  const allowList = (Deno.env.get("ALLOW_ORIGINS") ?? "").split(",").map(s=>s.trim());
  const origin = req.headers.get("origin") ?? "";
  const allow = allowList.includes(origin) ? origin : allowList[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Vary": "Origin"
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });

  console.log(`[server-stats] Request: ${req.method} ${req.url}`);

  // Require Supabase auth
  const auth = req.headers.get("authorization") ?? "";
  const apikey = req.headers.get("apikey") ?? "";
  if (!auth.startsWith("Bearer ")) {
    console.log("[server-stats] ERROR: No Bearer token provided");
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors(req) });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");
    const serverIdentifier = url.searchParams.get("server_identifier");

    console.log(`[server-stats] Parameters: orderId=${orderId}, serverIdentifier=${serverIdentifier}`);

    if (!orderId && !serverIdentifier) {
      console.log("[server-stats] ERROR: Missing required parameters");
      return new Response(JSON.stringify({ error: "bad_request", detail: "order_id or server_identifier required" }),
        { status: 400, headers: cors(req) });
    }

    let identifier = serverIdentifier;

    // Verify ownership and resolve identifier from your user_servers table
    if (orderId) {
      const restBase = req.url.replace("/functions/v1/server-stats", "");
      const r = await fetch(`${restBase}/rest/v1/user_servers?select=user_id,pterodactyl_server_id&id=eq.${orderId}`, {
        headers: { "apikey": apikey, "Authorization": auth }
      });
      const rows = await r.json() as Array<{user_id: string; pterodactyl_server_id: string | null;}>;
      if (!Array.isArray(rows) || rows.length === 0) {
        return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: cors(req) });
      }
      const row = rows[0];
      if (!row.pterodactyl_server_id) {
        return new Response(JSON.stringify({ error: "not_provisioned" }), { status: 409, headers: cors(req) });
      }
      identifier = row.pterodactyl_server_id;
    }

    // Fetch live resources from Pterodactyl Client API
    const pterodactylUrl = `${PANEL_URL}/api/client/servers/${identifier}/resources`;
    console.log(`[server-stats] Fetching from Pterodactyl: ${pterodactylUrl}`);
    console.log(`[server-stats] Using identifier: ${identifier}`);
    
    const resp = await fetch(pterodactylUrl, {
      headers: {
        "Authorization": `Bearer ${CLIENT_KEY}`,
        "Accept": "application/json"
      }
    });

    console.log(`[server-stats] Pterodactyl response status: ${resp.status}`);

    if (!resp.ok) {
      const txt = await resp.text();
      console.log(`[server-stats] ERROR: Pterodactyl API error: ${txt}`);
      return new Response(JSON.stringify({ error: "panel_error", detail: txt }), { status: 502, headers: cors(req) });
    }

    const data = await resp.json();
    console.log(`[server-stats] Pterodactyl data received:`, JSON.stringify(data, null, 2));
    
    // Normalize a minimal payload for your UI
    const res = {
      state: data?.attributes?.current_state ?? data?.attributes?.state,
      is_suspended: data?.attributes?.is_suspended ?? false,
      cpu_percent: data?.attributes?.resources?.cpu_absolute ?? null,
      memory_bytes: data?.attributes?.resources?.memory_bytes ?? null,
      disk_bytes: data?.attributes?.resources?.disk_bytes ?? null,
      network: data?.attributes?.resources?.network ?? null,
      uptime_ms: data?.attributes?.resources?.uptime ?? null,
      fetched_at: new Date().toISOString(),
      server_identifier: identifier
    };

    console.log(`[server-stats] Normalized response:`, JSON.stringify(res, null, 2));

    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json", ...cors(req) }
    });
  } catch (e) {
    console.log(`[server-stats] ERROR: Exception caught: ${String(e)}`);
    return new Response(JSON.stringify({ error: "internal", detail: String(e) }), {
      status: 500, headers: cors(req)
    });
  }
});
>>>>>>> fbe4cec62cfebef6a387d2395acb20ca3aa5d0d0
