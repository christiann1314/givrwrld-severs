import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

function cors(req: Request) {
  const allowList = (Deno.env.get("ALLOW_ORIGINS") ?? "").split(",").map(s => s.trim());
  const origin = req.headers.get("origin") ?? "";
  const allow = allowList.includes(origin) ? origin : allowList[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

interface CheckoutRequest {
  item_type: 'game' | 'vps';
  plan_id: string;
  region: string;
  server_name: string;
  modpack_id?: string;
  term: 'monthly' | 'quarterly' | 'yearly';
  addons?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(req) })
  }

  try {
    const { item_type, plan_id, region, server_name, modpack_id, term, addons }: CheckoutRequest = await req.json()

    // Validate required fields
    if (!item_type || !plan_id || !region || !server_name || !term) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: item_type, plan_id, region, server_name, term' }),
        { status: 400, headers: { ...cors(req), 'Content-Type': 'application/json' } }
      )
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...cors(req), 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...cors(req), 'Content-Type': 'application/json' } }
      )
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('item_type', item_type)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found or inactive' }),
        { status: 404, headers: { ...cors(req), 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Build line items
    const lineItems = [{ price: plan.stripe_price_id, quantity: 1 }]
    
    // Add addon line items if specified
    if (addons && addons.length > 0) {
      const { data: addonData } = await supabase
        .from('addons')
        .select('*')
        .in('id', addons)
        .eq('item_type', item_type)

      if (addonData) {
        addonData.forEach(addon => {
          lineItems.push({ price: addon.stripe_price_id, quantity: 1 })
        })
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/purchase`,
      metadata: {
        user_id: user.id,
        item_type,
        plan_id,
        region,
        server_name,
        modpack_id: modpack_id || '',
        term,
        addons: JSON.stringify(addons || [])
      },
      customer_email: user.email,
      subscription_data: {
        metadata: {
          user_id: user.id,
          item_type,
          plan_id,
          region,
          server_name,
          modpack_id: modpack_id || '',
          term,
          addons: JSON.stringify(addons || [])
        },
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...cors(req), 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Checkout session error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...cors(req), 'Content-Type': 'application/json' } }
    )
  }
})