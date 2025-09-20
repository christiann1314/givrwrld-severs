import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { withRateLimit } from '../rate-limiter/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  return await withRateLimit(req, 'user_data', async (req) => {
    try {
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
      const { email } = await req.json()
      
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Initialize Stripe
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16',
      })

      // Check if customer exists in Stripe
      const customers = await stripe.customers.list({ email, limit: 1 })
      
      if (customers.data.length === 0) {
        return new Response(JSON.stringify({ 
          hasSubscription: false,
          message: 'No customer found'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const customer = customers.data[0]
      
      // Get active subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 10
      })

      const hasActiveSubscription = subscriptions.data.length > 0
      const subscriptionData = hasActiveSubscription ? {
        id: subscriptions.data[0].id,
        status: subscriptions.data[0].status,
        current_period_end: subscriptions.data[0].current_period_end,
        items: subscriptions.data[0].items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval
          }
        }))
      } : null

      return new Response(JSON.stringify({
        hasSubscription: hasActiveSubscription,
        customer: {
          id: customer.id,
          email: customer.email
        },
        subscription: subscriptionData
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Check subscription error:', error)
      return new Response(JSON.stringify({ 
        error: error.message || 'Failed to check subscription' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  })
})