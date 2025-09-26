import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PanelSyncRequest {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface PterodactylUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email, first_name, last_name }: PanelSyncRequest = await req.json()

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'user_id and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if external account already exists
    const { data: existingAccount, error: fetchError } = await supabase
      .from('external_accounts')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabase
        .from('external_accounts')
        .update({
          panel_username: existingAccount.panel_username,
          last_synced_at: new Date().toISOString()
        })
        .eq('user_id', user_id)

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({
          pterodactyl_user_id: existingAccount.pterodactyl_user_id,
          panel_username: existingAccount.panel_username
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create new Pterodactyl user
    const panelUrl = Deno.env.get('PANEL_URL')!
    const pteroAppKey = Deno.env.get('PTERO_APP_KEY')!

    const pterodactylUser: PterodactylUser = {
      id: 0, // Will be set by Pterodactyl
      username: email.split('@')[0], // Use email prefix as username
      email,
      first_name: first_name || '',
      last_name: last_name || ''
    }

    // Create user in Pterodactyl
    const pteroResponse = await fetch(`${panelUrl}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pteroAppKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(pterodactylUser)
    })

    if (!pteroResponse.ok) {
      const errorText = await pteroResponse.text()
      throw new Error(`Pterodactyl API error: ${pteroResponse.status} ${errorText}`)
    }

    const createdUser = await pteroResponse.json()
    const pterodactylUserId = createdUser.attributes.id
    const panelUsername = createdUser.attributes.username

    // Store in Supabase
    const { error: insertError } = await supabase
      .from('external_accounts')
      .insert({
        user_id,
        pterodactyl_user_id: pterodactylUserId,
        panel_username: panelUsername,
        last_synced_at: new Date().toISOString()
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        pterodactyl_user_id: pterodactylUserId,
        panel_username: panelUsername
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Panel sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

