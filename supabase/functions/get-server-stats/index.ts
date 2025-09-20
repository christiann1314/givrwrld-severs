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

  // Require Supabase auth
  const auth = req.headers.get("authorization") ?? "";
  const apikey = req.headers.get("apikey") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: cors(req) });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");
    const serverIdentifier = url.searchParams.get("server_identifier");

    if (!orderId && !serverIdentifier) {
      return new Response(JSON.stringify({ error: "bad_request", detail: "order_id or server_identifier required" }),
        { status: 400, headers: cors(req) });
    }

    let identifier = serverIdentifier;

    // Verify ownership and resolve identifier from your user_servers table
    if (orderId) {
      const restBase = req.url.replace("/functions/v1/get-server-stats", "");
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
    const resp = await fetch(`${PANEL_URL}/api/client/servers/${identifier}/resources`, {
      headers: {
        "Authorization": `Bearer ${CLIENT_KEY}`,
        "Accept": "application/json"
      }
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: "panel_error", detail: txt }), { status: 502, headers: cors(req) });
    }

    const data = await resp.json();
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

    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json", ...cors(req) }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "internal", detail: String(e) }), {
      status: 500, headers: cors(req)
    });
  }
});