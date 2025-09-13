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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret!)
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err)
      return new Response(`Webhook Error: ${err}`, { status: 400 })
    }

    // Handle successful payment completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('Processing successful payment:', session.id)

      // Extract metadata
      const metadata = session.metadata
      if (!metadata?.user_id) {
        console.error('No user_id in session metadata')
        return new Response('No user_id in metadata', { status: 400 })
      }

      // Get bundle, addon, and modpack IDs from database if they exist
      let bundleId = null
      let addonIds: string[] = []
      let modpackId = null

      if (metadata.bundle_id && metadata.bundle_id !== 'none') {
        const { data: bundle } = await supabase
          .from('bundles')
          .select('id')
          .eq('slug', metadata.bundle_id)
          .single()
        bundleId = bundle?.id || null
      }

      if (metadata.addon_ids) {
        try {
          const addonSlugs = JSON.parse(metadata.addon_ids)
          if (Array.isArray(addonSlugs) && addonSlugs.length > 0) {
            const { data: addons } = await supabase
              .from('addons')
              .select('id')
              .in('slug', addonSlugs)
            addonIds = addons?.map(a => a.id) || []
          }
        } catch (e) {
          console.error('Error parsing addon_ids:', e)
        }
      }

      if (metadata.modpack_id && metadata.modpack_id !== 'vanilla') {
        const { data: modpack } = await supabase
          .from('modpacks')
          .select('id')
          .eq('slug', metadata.modpack_id)
          .single()
        modpackId = modpack?.id || null
      }

      // Create server record
      const { data: server, error: serverError } = await supabase
        .from('user_servers')
        .insert({
          user_id: metadata.user_id,
          server_name: metadata.server_name || 'Game Server',
          game_type: metadata.game_type || 'minecraft',
          ram: metadata.ram || '2GB',
          cpu: metadata.cpu || '1 vCPU',
          disk: metadata.disk || '20GB',
          location: metadata.location || 'US-East',
          bundle_id: bundleId,
          addon_ids: addonIds,
          modpack_id: modpackId,
          billing_term: metadata.billing_term || 'monthly',
          stripe_session_id: session.id,
          env_vars: metadata.bundle_env ? JSON.parse(metadata.bundle_env) : {},
          server_limits: metadata.bundle_limits_patch ? JSON.parse(metadata.bundle_limits_patch) : {},
          order_payload: metadata,
          status: 'provisioning'
        })
        .select()
        .single()

      if (serverError) {
        console.error('Error creating server record:', serverError)
        return new Response('Error creating server', { status: 500 })
      }

      console.log('Server record created:', server.id)

      // Start server provisioning
      try {
        const provisionResponse = await supabase.functions.invoke('pterodactyl-provision', {
          body: { serverId: server.id }
        })

        if (provisionResponse.error) {
          console.error('Provisioning error:', provisionResponse.error)
          // Update server status to error
          await supabase
            .from('user_servers')
            .update({ status: 'error' })
            .eq('id', server.id)
        } else {
          console.log('Server provisioning started for:', server.id)
        }
      } catch (provisionError) {
        console.error('Failed to start provisioning:', provisionError)
        await supabase
          .from('user_servers')
          .update({ status: 'error' })
          .eq('id', server.id)
      }

      // Create order record for tracking
      await supabase
        .from('orders')
        .insert({
          user_id: metadata.user_id,
          server_id: server.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'usd',
          stripe_session_id: session.id,
          order_payload: metadata,
          status: 'completed'
        })
    }

    return new Response('Webhook processed', { 
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