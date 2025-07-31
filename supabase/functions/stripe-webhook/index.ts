import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    // Parse the Stripe event
    const event = JSON.parse(body)
    
    console.log('Received Stripe event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      // Extract user info and plan details
      const userEmail = session.customer_details?.email
      const planName = session.metadata?.plan_name || 'Minecraft Server'
      const ram = session.metadata?.ram || '1GB'
      const cpu = session.metadata?.cpu || '0.5 vCPU'
      const disk = session.metadata?.disk || '10GB'
      const amount = session.amount_total / 100 // Convert from cents
      
      // Get user_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', userEmail)
        .single()
      
      if (!profile) {
        console.error('User profile not found for email:', userEmail)
        return new Response('User not found', { status: 400 })
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: profile.user_id,
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
          user_id: profile.user_id,
          server_name: `${planName} - ${userEmail}`,
          game_type: 'Minecraft',
          ram: ram,
          cpu: cpu,
          disk: disk,
          location: 'US East',
          status: 'provisioning'
        })
        .select()
        .single()

      if (serverError) {
        console.error('Error creating server:', serverError)
        return new Response('Server creation failed', { status: 500 })
      }

      // Update user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: profile.user_id,
          active_servers: 1,
          total_spent: amount
        })

      if (statsError) {
        console.error('Error updating stats:', statsError)
      }

      // TODO: Integrate with Pterodactyl Panel to actually provision the server
      // This would require Pterodactyl API calls to create the server instance

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