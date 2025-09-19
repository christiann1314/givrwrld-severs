import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    })

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!signature || !webhookSecret) {
      console.log('⚠️  Missing Stripe signature or webhook secret')
      return new Response('Missing signature', { status: 400 })
    }

    let event

    try {
      // Use async verification in edge/Deno runtime
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.log(`⚠️  Webhook signature verification failed.`, message)
      return new Response('Webhook signature verification failed', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log(`🔔 Event received: ${event.type}`)

    // Handle successful checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata!
      
      console.log('Processing successful checkout:', {
        sessionId: session.id,
        userId: metadata.user_id,
        serverName: metadata.server_name
      })

      // Resolve optional identifiers (slugs -> UUIDs)
      let resolvedModpackId: string | null = null
      if (metadata.modpack_id && metadata.modpack_id !== 'vanilla') {
        const ident = String(metadata.modpack_id)
        const { data: mp } = await supabase
          .from('modpacks')
          .select('id')
          .or(`slug.eq.${ident},modpack_id.eq.${ident},id.eq.${ident}`)
          .maybeSingle()
        resolvedModpackId = mp?.id ?? null
        if (!resolvedModpackId) {
          console.log('Modpack not found for identifier:', ident)
        }
      }

      let resolvedBundleId: string | null = null
      if (metadata.bundle_id && metadata.bundle_id !== 'none') {
        const ident = String(metadata.bundle_id)
        const { data: b } = await supabase
          .from('bundles')
          .select('id')
          .or(`slug.eq.${ident},id.eq.${ident}`)
          .maybeSingle()
        resolvedBundleId = b?.id ?? null
      }

      // Create server record in user_servers table
      const { data: server, error: serverError } = await supabase
        .from('user_servers')
        .insert({
          user_id: metadata.user_id,
          server_name: metadata.server_name || 'Game Server',
          game_type: metadata.game_type || 'minecraft',
          ram: metadata.ram || '2GB',
          cpu: metadata.cpu || '1 vCPU', 
          disk: metadata.disk || '20GB',
          location: metadata.location || 'us-west',
          bundle_id: resolvedBundleId,
          addon_ids: metadata.addon_ids ? JSON.parse(metadata.addon_ids) : [],
          modpack_id: resolvedModpackId,
          env_vars: metadata.bundle_env ? JSON.parse(metadata.bundle_env) : {},
          server_limits: metadata.bundle_limits_patch ? JSON.parse(metadata.bundle_limits_patch) : {},
          billing_term: metadata.billing_term || 'monthly',
          stripe_session_id: session.id,
          subscription_id: session.subscription?.toString(),
          status: 'provisioning',
          order_payload: {
            plan_name: metadata.plan_name,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency
          }
        })
        .select()
        .single()

      if (serverError) {
        console.error('Error creating server record:', serverError)
        return new Response('Failed to create server record', { status: 500 })
      }

      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: metadata.user_id,
          server_id: server.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'usd',
          stripe_session_id: session.id,
          stripe_subscription_id: session.subscription?.toString(),
          status: 'completed',
          order_payload: {
            plan_name: metadata.plan_name,
            server_config: {
              ram: metadata.ram,
              cpu: metadata.cpu,
              disk: metadata.disk,
              location: metadata.location
            },
            bundle_id: metadata.bundle_id,
            addon_ids: metadata.addon_ids ? JSON.parse(metadata.addon_ids) : [],
            modpack_id: metadata.modpack_id
          }
        })

      if (orderError) {
        console.error('Error creating order record:', orderError)
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: metadata.user_id,
          plan_name: metadata.plan_name || 'Game Server',
          amount: session.amount_total ? session.amount_total / 100 : 0,
          status: 'completed'
        })

      if (purchaseError) {
        console.error('Error creating purchase record:', purchaseError)
      }

      // Update user stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('active_servers, total_spent')
        .eq('user_id', metadata.user_id)
        .maybeSingle()

      const currentActive = currentStats?.active_servers ?? 0
      const currentTotal = currentStats?.total_spent ? parseFloat(String(currentStats.total_spent)) : 0
      const newTotal = currentTotal + (session.amount_total ? session.amount_total / 100 : 0)

      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: metadata.user_id,
          active_servers: currentActive + 1,
          total_spent: newTotal,
        }, { onConflict: 'user_id' })

      if (statsError) {
        console.error('Error updating user stats:', statsError)
      }

      // Trigger server provisioning
      console.log('Triggering server provisioning for server:', server.id)
      const provisionResponse = await supabase.functions.invoke('pterodactyl-provision', {
        body: { serverId: server.id }
      })

      if (provisionResponse.error) {
        console.error('Error provisioning server:', provisionResponse.error)
        // Update server status to failed
        await supabase
          .from('user_servers')
          .update({ status: 'failed' })
          .eq('id', server.id)
      }

      console.log('Checkout processing completed successfully')
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      
      // Find and suspend servers linked to this subscription
      const { error: suspendError } = await supabase
        .from('user_servers')
        .update({ status: 'suspended' })
        .eq('subscription_id', subscription.id)

      if (suspendError) {
        console.error('Error suspending servers:', suspendError)
      }
    }

    return new Response('Webhook processed successfully', {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Webhook processing failed', {
      status: 500,
      headers: corsHeaders
    })
  }
})