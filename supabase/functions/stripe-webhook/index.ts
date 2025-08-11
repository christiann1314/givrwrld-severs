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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Verify webhook signature with Stripe
    const stripeSigningSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })
    
    if (!stripeSigningSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeSigningSecret)
      console.log('Verified Stripe webhook event:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response('Webhook signature verification failed', { status: 400 })
    }
    
    console.log('Received Stripe event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      // Extract user info and plan details
      const userEmail = session.customer_details?.email || session.metadata?.user_email
      const userId = session.metadata?.user_id as string | undefined
      const planName = session.metadata?.plan_name || 'Minecraft Server'
      const ram = session.metadata?.ram || '1GB'
      const cpu = session.metadata?.cpu || '0.5 vCPU'
      const disk = session.metadata?.disk || '10GB'
      const location = session.metadata?.location || 'US East'
      const amount = session.amount_total / 100 // Convert from cents
      
      // Resolve user id – prefer metadata.user_id, fallback to email lookup
      let resolvedUserId = userId
      if (!resolvedUserId && userEmail) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', userEmail)
          .single()
        resolvedUserId = profileByEmail?.user_id || undefined
      }
      
      if (!resolvedUserId) {
        console.error('Unable to resolve user id from Stripe session. Email:', userEmail)
        return new Response('User not found', { status: 400 })
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: resolvedUserId,
          plan_name: planName,
          amount: amount,
          status: 'completed'
        })

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError)
      }

      // Create server record
      const { data: server, error: serverError } = await supabase
        .from('user_servers')
        .insert({
          user_id: resolvedUserId,
          server_name: `${planName} - ${userEmail}`,
          game_type: 'Minecraft',
          ram: ram,
          cpu: cpu,
          disk: disk,
          location: location,
          status: 'provisioning'
        })
        .select()
        .single()

      if (serverError) {
        console.error('Error creating server:', serverError)
        return new Response('Server creation failed', { status: 500 })
      }

      // Get current user stats first
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('active_servers, total_spent')
        .eq('user_id', resolvedUserId)
        .single()

      // Update user stats by incrementing values
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: resolvedUserId,
          active_servers: (currentStats?.active_servers || 0) + 1,
          total_spent: (currentStats?.total_spent || 0) + amount
        })

      if (statsError) {
        console.error('Error updating stats:', statsError)
      }

      // Provision server in Pterodactyl Panel
      try {
        const { data: provisionResult, error: provisionError } = await supabase.functions.invoke('pterodactyl-provision', {
          body: { serverId: server.id }
        })
        
        if (provisionError) {
          console.error('Error provisioning server:', provisionError)
          // Update server status to failed
          await supabase
            .from('user_servers')
            .update({ status: 'failed' })
            .eq('id', server.id)
        } else {
          console.log('Server provisioning initiated for:', server.id)
        }
      } catch (provisionError) {
        console.error('Failed to call pterodactyl-provision:', provisionError)
        // Update server status to failed
        await supabase
          .from('user_servers')
          .update({ status: 'failed' })
          .eq('id', server.id)
      }

      console.log('Successfully processed payment and created server for:', userEmail)
    }

    return new Response('Webhook processed', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})