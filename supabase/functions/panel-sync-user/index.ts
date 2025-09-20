import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PANEL_URL = Deno.env.get("PTERODACTYL_URL")!;
const APP_KEY = Deno.env.get("PTERODACTYL_API_KEY")!;
const PTERO = (path: string, init: RequestInit = {}) =>
  fetch(`${PANEL_URL}/api/application${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${APP_KEY}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

export const cors = (req: Request) => {
  const origins = (Deno.env.get("ALLOW_ORIGINS") ?? "").split(",");
  const o = req.headers.get("origin") ?? "";
  const allow = origins.map(s => s.trim()).includes(o) ? o : origins[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });

  // Require a Supabase JWT so only signed-in users can call this
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401, headers: cors(req) });

  const body = await req.json().catch(() => ({}));
  const { user_id, email, first_name = "GIVR", last_name = "User" } = body ?? {};
  if (!user_id || !email) return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers: cors(req) });

  console.log(`[PANEL-SYNC] Starting sync for user ${user_id} (${email})`);

  try {
    // 1) Try to find an existing Pterodactyl user by email
    // NOTE: Pterodactyl doesn't have a direct "get by email" endpoint; list + filter (small scale OK).
    const list = await PTERO("/users?per_page=50");
    if (!list.ok) {
      console.error(`[PANEL-SYNC] Failed to list users: ${list.status}`);
      return new Response(JSON.stringify({ error: "pterodactyl_list_failed" }), { status: 500, headers: cors(req) });
    }

    const users = (await list.json()).data as any[];
    const found = users?.find(u => u.attributes?.email?.toLowerCase() === email.toLowerCase());

    let pteroUserId: number;
    let username: string;

    if (found) {
      pteroUserId = found.attributes.id;
      username = found.attributes.username;
      console.log(`[PANEL-SYNC] Found existing Pterodactyl user ${pteroUserId} (${username})`);
      
      // Optional: keep email in sync
      const updateResp = await PTERO(`/users/${pteroUserId}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          email,
          first_name,
          last_name 
        }),
      });
      
      if (!updateResp.ok) {
        console.warn(`[PANEL-SYNC] Failed to update user ${pteroUserId}: ${updateResp.status}`);
      } else {
        console.log(`[PANEL-SYNC] Updated user ${pteroUserId} details`);
      }
    } else {
      // 2) Create the panel user (password null → user will use "Forgot Password" on panel)
      const safeUsername = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 20) || "user";
      console.log(`[PANEL-SYNC] Creating new Pterodactyl user with username: ${safeUsername}`);
      
      const created = await PTERO("/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          username: safeUsername,
          first_name,
          last_name,
          password: null,
        }),
      });
      
      if (!created.ok) {
        const err = await created.text();
        console.error(`[PANEL-SYNC] Failed to create user: ${created.status} - ${err}`);
        return new Response(JSON.stringify({ error: "pterodactyl_create_failed", detail: err }), { status: 500, headers: cors(req) });
      }
      
      const data = (await created.json()).attributes;
      pteroUserId = data.id;
      username = data.username;
      console.log(`[PANEL-SYNC] Created Pterodactyl user ${pteroUserId} (${username})`);
    }

    // 3) Upsert mapping in Supabase (use service role via REST)
    const supaKey = req.headers.get("apikey")!; // functions receive anon key in proxied requests
    const { origin } = new URL(req.url);
    const supabaseUrl = origin.replace("/functions/v1", "");
    
    console.log(`[PANEL-SYNC] Upserting mapping for user ${user_id} -> pterodactyl ${pteroUserId}`);
    
    const up = await fetch(`${supabaseUrl}/rest/v1/external_accounts`, {
      method: "POST",
      headers: {
        "apikey": supaKey,
        "Authorization": auth,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id,
        pterodactyl_user_id: pteroUserId,
        panel_username: username,
        last_synced_at: new Date().toISOString(),
      }),
    });

    if (!up.ok) {
      const t = await up.text();
      console.error(`[PANEL-SYNC] Failed to upsert mapping: ${up.status} - ${t}`);
      return new Response(JSON.stringify({ error: "mapping_failed", detail: t }), { status: 500, headers: cors(req) });
    }

    console.log(`[PANEL-SYNC] Successfully synced user ${user_id}`);

    return new Response(JSON.stringify({ 
      ok: true, 
      pterodactyl_user_id: pteroUserId, 
      panel_username: username,
      action: found ? "updated" : "created"
    }), {
      headers: { "Content-Type": "application/json", ...cors(req) },
    });

  } catch (error) {
    console.error('[PANEL-SYNC] Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'internal_server_error',
      message: error.message 
    }), {
      headers: { "Content-Type": "application/json", ...cors(req) },
      status: 500,
    });
  }
});
