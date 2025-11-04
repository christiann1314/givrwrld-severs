import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Verify webhook signature (async version required for Deno)
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Create order record with new schema
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: session.metadata.user_id,
              item_type: session.metadata.item_type,
              plan_id: session.metadata.plan_id,
              term: session.metadata.term,
              region: session.metadata.region,
              server_name: session.metadata.server_name,
              modpack_id: session.metadata.modpack_id || null,
              addons: JSON.parse(session.metadata.addons || '[]'),
              stripe_sub_id: subscription.id,
              status: 'paid'
            })
            .select()
            .single()

          if (orderError) {
            console.error('Error creating order:', orderError)
            throw orderError
          }

          // Send alert
          const alertsWebhook = Deno.env.get('ALERTS_WEBHOOK')
          if (alertsWebhook) {
            try {
              await fetch(alertsWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: `✅ New order: ${session.metadata.item_type} ${session.metadata.plan_id} for ${session.metadata.server_name} in ${session.metadata.region}`
                })
              })
            } catch (alertError) {
              console.error('Failed to send alert:', alertError)
            }
          }

          // Trigger server provisioning for game servers
          if (session.metadata.item_type === 'game') {
            try {
              const functionsUrl = Deno.env.get('SUPABASE_URL')!.replace('https://', 'https://').replace('.supabase.co', '.functions.supabase.co')
              await fetch(`${functionsUrl}/servers-provision`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  order_id: order.id
                })
              })
            } catch (provisionError) {
              console.error('Failed to trigger server provisioning:', provisionError)
            }
          }
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update order status
        const status = event.type === 'customer.subscription.deleted' ? 'canceled' : 'paid'
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status })
          .eq('stripe_sub_id', subscription.id)

        if (updateError) {
          console.error('Error updating order status:', updateError)
          throw updateError
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Mark order as error
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'error' })
            .eq('stripe_sub_id', invoice.subscription as string)

          if (updateError) {
            console.error('Error updating order status:', updateError)
            throw updateError
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})