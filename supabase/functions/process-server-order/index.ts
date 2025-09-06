import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook verified", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await processCompletedCheckout(session, supabaseClient);
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      await processSuccessfulPayment(invoice, supabaseClient);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function processCompletedCheckout(session: Stripe.Checkout.Session, supabase: any) {
  logStep("Processing completed checkout", { sessionId: session.id });

  const orderPayloadStr = session.metadata?.order_payload;
  if (!orderPayloadStr) {
    throw new Error("No order payload found in session metadata");
  }

  const orderPayload = JSON.parse(orderPayloadStr);
  logStep("Order payload parsed", orderPayload);

  // Update order status
  await supabase
    .from("orders")
    .update({ 
      status: "paid",
      stripe_subscription_id: session.subscription
    })
    .eq("stripe_session_id", session.id);

  // Provision server
  await provisionServer(orderPayload, session, supabase);
}

async function processSuccessfulPayment(invoice: Stripe.Invoice, supabase: any) {
  logStep("Processing successful payment", { invoiceId: invoice.id });
  // Handle recurring payment logic here if needed
}

async function provisionServer(orderPayload: any, session: Stripe.Checkout.Session, supabase: any) {
  logStep("Starting server provisioning", orderPayload);

  try {
    // Fetch catalog data to build server configuration
    const [planData, bundleData, modpackData, addonsData] = await Promise.all([
      supabase.from("plans").select("*, games(*)").eq("id", orderPayload.plan_id).single(),
      orderPayload.bundle_id && orderPayload.bundle_id !== "none" 
        ? supabase.from("bundles").select("*").eq("id", orderPayload.bundle_id).single()
        : { data: null },
      orderPayload.modpack_id 
        ? supabase.from("modpacks").select("*").eq("id", orderPayload.modpack_id).single()
        : { data: null },
      orderPayload.addon_ids?.length > 0
        ? supabase.from("addons").select("*").in("id", orderPayload.addon_ids)
        : { data: [] }
    ]);

    const plan = planData.data;
    const bundle = bundleData.data;
    const modpack = modpackData.data;
    const addons = addonsData.data || [];

    if (!plan) throw new Error("Plan not found");

    logStep("Catalog data fetched", { plan: plan.name, bundle: bundle?.name, modpack: modpack?.name, addons: addons.length });

    // Merge environment variables and limits
    const envVars = {
      ...plan.pterodactyl_env,
      ...(bundle?.pterodactyl_env || {}),
      ...(modpack?.pterodactyl_env || {}),
      ...addons.reduce((acc: any, addon: any) => ({ ...acc, ...addon.pterodactyl_env }), {}),
      SERVER_NAME: orderPayload.server_name,
      LOCATION: orderPayload.location
    };

    const serverLimits = {
      ...plan.pterodactyl_limits,
      ...(bundle?.pterodactyl_limits_patch || {}),
      ...addons.reduce((acc: any, addon: any) => ({ ...acc, ...addon.pterodactyl_limits_patch }), {})
    };

    logStep("Configuration merged", { envVars, serverLimits });

    // Create server in Pterodactyl
    const pterodactylResponse = await createPterodactylServer({
      name: orderPayload.server_name,
      game: plan.games,
      plan,
      envVars,
      serverLimits,
      location: orderPayload.location
    });

    logStep("Pterodactyl server created", { serverId: pterodactylResponse.attributes.id });

    // Create user_servers record
    const { data: userServer, error: serverError } = await supabase
      .from("user_servers")
      .insert({
        user_id: orderPayload.user_id,
        server_name: orderPayload.server_name,
        game_type: plan.games.slug,
        ram: `${plan.ram_gb}GB`,
        cpu: `${plan.cpu_cores} cores`,
        disk: `${plan.disk_gb}GB`,
        location: orderPayload.location,
        status: "provisioning",
        subscription_id: session.subscription,
        pterodactyl_server_id: pterodactylResponse.attributes.id.toString(),
        plan_id: orderPayload.plan_id,
        bundle_id: orderPayload.bundle_id,
        modpack_id: orderPayload.modpack_id,
        addon_ids: orderPayload.addon_ids,
        billing_term: orderPayload.billing_term,
        env_vars: envVars,
        server_limits: serverLimits,
        stripe_session_id: session.id,
        order_payload: orderPayload
      })
      .select()
      .single();

    if (serverError) throw serverError;

    // Update order with server reference
    await supabase
      .from("orders")
      .update({ server_id: userServer.id })
      .eq("stripe_session_id", session.id);

    // Execute post-install scripts if any addons have them
    if (addons.length > 0) {
      await executePostInstallScripts(addons, pterodactylResponse.attributes.id, userServer.id, supabase);
    }

    // Update server status to active
    await supabase
      .from("user_servers")
      .update({ status: "active" })
      .eq("id", userServer.id);

    logStep("Server provisioning completed", { userServerId: userServer.id });

  } catch (error) {
    logStep("Provisioning failed", { error: error.message });
    
    // Update server status to failed
    await supabase
      .from("user_servers")
      .update({ status: "failed" })
      .eq("user_id", orderPayload.user_id)
      .eq("stripe_session_id", session.id);
    
    throw error;
  }
}

async function createPterodactylServer(config: any) {
  const pterodactylUrl = Deno.env.get("PTERODACTYL_URL");
  const pterodactylKey = Deno.env.get("PTERODACTYL_API_KEY");

  if (!pterodactylUrl || !pterodactylKey) {
    throw new Error("Pterodactyl configuration missing");
  }

  const serverData = {
    name: config.name,
    user: 1, // Default admin user ID
    egg: config.game.egg_id || 1,
    docker_image: config.game.docker_image,
    startup: config.game.startup_command,
    environment: config.envVars,
    limits: {
      memory: config.serverLimits.memory || config.plan.ram_gb * 1024,
      swap: 0,
      disk: config.serverLimits.disk || config.plan.disk_gb * 1024,
      io: 500,
      cpu: config.serverLimits.cpu || config.plan.cpu_cores * 100
    },
    feature_limits: {
      databases: 1,
      allocations: 1,
      backups: config.serverLimits.feature_limits?.backups || 0
    },
    allocation: {
      default: 1 // Default allocation
    }
  };

  const response = await fetch(`${pterodactylUrl}/api/application/servers`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${pterodactylKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(serverData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pterodactyl API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

async function executePostInstallScripts(addons: any[], pterodactylServerId: number, userServerId: string, supabase: any) {
  logStep("Executing post-install scripts", { addons: addons.length });

  for (const addon of addons) {
    if (addon.post_install_script) {
      try {
        // Update server status to show script execution
        await supabase
          .from("user_servers")
          .update({ status: `installing_${addon.slug}` })
          .eq("id", userServerId);

        // Execute script via Pterodactyl client API
        await executePterodactylCommand(pterodactylServerId, addon.post_install_script);
        
        logStep("Post-install script executed", { addon: addon.name });
      } catch (error) {
        logStep("Post-install script failed", { addon: addon.name, error: error.message });
        // Continue with other scripts even if one fails
      }
    }
  }
}

async function executePterodactylCommand(serverId: number, command: string) {
  const pterodactylUrl = Deno.env.get("PTERODACTYL_URL");
  const pterodactylKey = Deno.env.get("PTERODACTYL_API_KEY");

  const response = await fetch(`${pterodactylUrl}/api/client/servers/${serverId}/command`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${pterodactylKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ command })
  });

  if (!response.ok) {
    throw new Error(`Failed to execute command: ${response.status}`);
  }
}