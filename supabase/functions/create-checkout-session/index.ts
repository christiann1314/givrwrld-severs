import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple rate limiting for this function
const rateLimitStore: { [key: string]: { count: number; resetTime: number } } = {}

function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const key = `payment:${identifier}`
  
  // Clean up expired entries
  Object.keys(rateLimitStore).forEach(k => {
    if (rateLimitStore[k].resetTime < now) {
      delete rateLimitStore[k]
    }
  })
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
    return true
  }
  
  if (rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs }
    return true
  }
  
  if (rateLimitStore[key].count >= maxRequests) {
    return false
  }
  
  rateLimitStore[key].count++
  return true
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting check
    const authHeader = req.headers.get('Authorization') || ''
    const identifier = authHeader ? authHeader.slice(-10) : req.headers.get('x-forwarded-for') || 'unknown'
    
    if (!checkRateLimit(identifier)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Parse request body
    const { 
      plan_name, 
      amount, 
      ram, 
      cpu, 
      disk, 
      location, 
      success_url, 
      cancel_url, 
      bundle_id, 
      bundle_env, 
      bundle_limits_patch,
      addon_ids,
      modpack_id,
      server_name,
      game_type,
      billing_term
    } = await req.json()

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single()

    const userEmail = profile?.email || user.email

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 })
    let customerId
    if (customers.data.length > 0) {
      customerId = customers.data[0].id
    }

    // Build line items array starting with base plan
    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: plan_name || 'Game Server',
          description: `${ram} RAM, ${cpu} CPU, ${disk} Storage - ${location}`
        },
        unit_amount: Math.round(amount * 100),
        recurring: billing_term !== 'one-time' && billing_term !== 'monthly' ? { 
          interval: billing_term === 'annual' ? 'year' : 'month' 
        } : billing_term === 'monthly' ? { interval: 'month' } : undefined,
      },
      quantity: 1,
    }]

    // Add bundle to line items if selected
    if (bundle_id && bundle_id !== 'none') {
      const { data: bundle } = await supabase
        .from('bundles')
        .select('name, price_monthly, stripe_price_id_monthly, stripe_price_id_annual')
        .eq('slug', bundle_id)
        .single()
      
      if (bundle) {
        const bundleStripeId = billing_term === 'annual' ? bundle.stripe_price_id_annual : bundle.stripe_price_id_monthly
        
        if (bundleStripeId) {
          lineItems.push({
            price: bundleStripeId,
            quantity: 1,
          })
        } else {
          // Fallback to price_data if no Stripe ID
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { name: bundle.name },
              unit_amount: Math.round((bundle.price_monthly || 0) * 100),
              recurring: billing_term !== 'one-time' ? { 
                interval: billing_term === 'annual' ? 'year' : 'month' 
              } : undefined,
            },
            quantity: 1,
          })
        }
      }
    }

    // Add addons to line items
    if (addon_ids && Array.isArray(addon_ids)) {
      const { data: addons } = await supabase
        .from('addons')
        .select('name, price_monthly, stripe_price_id_monthly')
        .in('slug', addon_ids)
      
      if (addons) {
        for (const addon of addons) {
          if (addon.stripe_price_id_monthly) {
            lineItems.push({
              price: addon.stripe_price_id_monthly,
              quantity: 1,
            })
          } else {
            // Fallback to price_data if no Stripe ID
            lineItems.push({
              price_data: {
                currency: 'usd',
                product_data: { name: addon.name },
                unit_amount: Math.round((addon.price_monthly || 0) * 100),
                recurring: billing_term !== 'one-time' ? { 
                  interval: billing_term === 'annual' ? 'year' : 'month' 
                } : undefined,
              },
              quantity: 1,
            })
          }
        }
      }
    }

    // Add modpack to line items if selected
    if (modpack_id && modpack_id !== 'vanilla') {
      const { data: modpack } = await supabase
        .from('modpacks')
        .select('name, price_monthly, stripe_price_id_monthly')
        .eq('slug', modpack_id)
        .single()
      
      if (modpack && modpack.price_monthly > 0) {
        if (modpack.stripe_price_id_monthly) {
          lineItems.push({
            price: modpack.stripe_price_id_monthly,
            quantity: 1,
          })
        } else {
          // Fallback to price_data if no Stripe ID
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { name: modpack.name },
              unit_amount: Math.round((modpack.price_monthly || 0) * 100),
              recurring: billing_term !== 'one-time' ? { 
                interval: billing_term === 'annual' ? 'year' : 'month' 
              } : undefined,
            },
            quantity: 1,
          })
        }
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: billing_term === 'one-time' ? 'payment' : 'subscription',
      metadata: {
        user_id: user.id,
        user_email: userEmail,
        server_name: server_name || 'Game Server',
        plan_name: plan_name || 'Game Server',
        game_type: game_type || 'minecraft',
        ram: ram || '2GB',
        cpu: cpu || '1 vCPU', 
        disk: disk || '20GB',
        location: location || 'US-East',
        bundle_id: bundle_id || 'none',
        addon_ids: addon_ids ? JSON.stringify(addon_ids) : '[]',
        modpack_id: modpack_id || 'vanilla',
        billing_term: billing_term || 'monthly',
        bundle_env: bundle_env ? JSON.stringify(bundle_env) : '{}',
        bundle_limits_patch: bundle_limits_patch ? JSON.stringify(bundle_limits_patch) : '{}'
      },
      success_url: success_url || `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/dashboard`,
    })

    return new Response(JSON.stringify({ 
      checkout_url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Checkout session error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create checkout session' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})