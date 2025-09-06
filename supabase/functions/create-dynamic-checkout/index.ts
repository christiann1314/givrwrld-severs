import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DYNAMIC-CHECKOUT] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    const {
      server_name,
      game_id,
      plan_id,
      bundle_id,
      modpack_id,
      addon_ids = [],
      billing_term = "monthly",
      location = "us-west"
    } = requestBody;

    logStep("Request payload", requestBody);

    // Fetch catalog data from Supabase
    const { data: plan, error: planError } = await supabaseClient
      .from("plans")
      .select("*, games(*)")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) throw new Error("Plan not found");

    const lineItems = [];
    let totalAmount = 0;

    // Add base plan
    const planPrice = getPriceForTerm(plan.price_monthly, billing_term);
    totalAmount += planPrice;
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${plan.games.name} - ${plan.name} Plan`,
          description: `${plan.cpu_cores} CPU cores, ${plan.ram_gb}GB RAM, ${plan.disk_gb}GB storage`
        },
        unit_amount: Math.round(planPrice * 100),
        recurring: billing_term === "monthly" ? { interval: "month" } : undefined
      },
      quantity: 1,
    });

    // Add bundle if selected
    if (bundle_id && bundle_id !== "none") {
      const { data: bundle } = await supabaseClient
        .from("bundles")
        .select("*")
        .eq("id", bundle_id)
        .single();

      if (bundle) {
        const bundlePrice = getPriceForTerm(bundle.price_monthly, billing_term);
        totalAmount += bundlePrice;
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: bundle.name,
              description: bundle.description
            },
            unit_amount: Math.round(bundlePrice * 100),
            recurring: billing_term === "monthly" ? { interval: "month" } : undefined
          },
          quantity: 1,
        });
      }
    }

    // Add modpack if selected and has price
    if (modpack_id) {
      const { data: modpack } = await supabaseClient
        .from("modpacks")
        .select("*")
        .eq("id", modpack_id)
        .single();

      if (modpack && modpack.price_monthly > 0) {
        const modpackPrice = getPriceForTerm(modpack.price_monthly, billing_term);
        totalAmount += modpackPrice;
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${modpack.name} Modpack`,
              description: modpack.description
            },
            unit_amount: Math.round(modpackPrice * 100),
            recurring: billing_term === "monthly" ? { interval: "month" } : undefined
          },
          quantity: 1,
        });
      }
    }

    // Add addons
    if (addon_ids.length > 0) {
      const { data: addons } = await supabaseClient
        .from("addons")
        .select("*")
        .in("id", addon_ids);

      for (const addon of addons || []) {
        const addonPrice = getPriceForTerm(addon.price_monthly, billing_term);
        totalAmount += addonPrice;
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: addon.name,
              description: addon.description
            },
            unit_amount: Math.round(addonPrice * 100),
            recurring: billing_term === "monthly" ? { interval: "month" } : undefined
          },
          quantity: 1,
        });
      }
    }

    logStep("Line items calculated", { lineItems, totalAmount });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const orderPayload = {
      server_name,
      game_id,
      plan_id,
      bundle_id,
      modpack_id,
      addon_ids,
      billing_term,
      location,
      user_id: user.id,
      timestamp: new Date().toISOString()
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: billing_term === "monthly" ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/deploy`,
      metadata: {
        order_payload: JSON.stringify(orderPayload),
        user_id: user.id,
        server_name
      }
    });

    // Create order record
    await supabaseClient.from("orders").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      amount: totalAmount,
      status: "pending",
      order_payload: orderPayload
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function getPriceForTerm(monthlyPrice: number, term: string): number {
  const discounts = {
    monthly: 1,
    quarterly: 0.95, // 5% off
    biannual: 0.90,  // 10% off
    annual: 0.85     // 15% off
  };

  const multipliers = {
    monthly: 1,
    quarterly: 3,
    biannual: 6,
    annual: 12
  };

  const discount = discounts[term as keyof typeof discounts] || 1;
  const multiplier = multipliers[term as keyof typeof multipliers] || 1;
  
  return monthlyPrice * multiplier * discount;
}