import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { withRateLimit } from '../rate-limiter/index.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  return await withRateLimit(req, 'payment', async (req) => {
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
      const { email, return_url } = await req.json()
      
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
          error: 'No customer found. Please make a purchase first.' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const customer = customers.data[0]
      
      // Create billing portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: return_url || `${req.headers.get('origin')}/dashboard`
      })

      return new Response(JSON.stringify({
        url: portalSession.url
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Customer portal error:', error)
      return new Response(JSON.stringify({ 
        error: error.message || 'Failed to create customer portal session' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  })
})