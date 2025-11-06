import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authenticated user from JWT (if JWT verification is enabled)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the authenticated user matches the userId in request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId, email: requestEmail, displayName } = await req.json()
    
    // Verify userId matches authenticated user
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use email from authenticated user (more reliable than request body)
    const email = user.email || requestEmail
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Pterodactyl Panel API configuration
    const pterodactylUrl = Deno.env.get('PTERODACTYL_URL')
    const pterodactylKey = Deno.env.get('PTERODACTYL_API_KEY')

    if (!pterodactylUrl || !pterodactylKey) {
      console.error('Pterodactyl configuration missing')
      return new Response('Pterodactyl configuration missing', { status: 500 })
    }

    // First check if user already has an external_accounts entry - if so, return it
    const { data: existingAccount } = await supabaseService
      .from('external_accounts')
      .select('pterodactyl_user_id, panel_username')
      .eq('user_id', userId)
      .single()

    if (existingAccount?.pterodactyl_user_id) {
      console.log('User already has panel account, returning existing mapping')
      return new Response(JSON.stringify({ 
        pterodactylUserId: existingAccount.pterodactyl_user_id,
        panel_username: existingAccount.panel_username
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user already exists in Pterodactyl
    const existingUserResponse = await fetch(`${pterodactylUrl}/api/application/users?filter[email]=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      }
    });

    if (existingUserResponse.ok) {
      const existingData = await existingUserResponse.json();
      if (existingData.data && existingData.data.length > 0) {
        // User already exists in Pterodactyl but not in external_accounts
        // Link them without resetting password (user can use password reset if needed)
        const pterodactylUserId = existingData.data[0].attributes.id;
        const panelUsername = existingData.data[0].attributes.username;
        
        // Create external_accounts entry without password reset
        const { error: accountError } = await supabaseService
          .from('external_accounts')
          .upsert({
            user_id: userId,
            pterodactyl_user_id: pterodactylUserId,
            panel_username: panelUsername,
            last_synced_at: new Date().toISOString()
          })

        if (accountError) {
          console.error('Error creating external_accounts entry:', accountError)
          return new Response('Failed to link existing panel account', { status: 500 })
        }
        
        return new Response(JSON.stringify({ 
          pterodactylUserId,
          panel_username: panelUsername,
          message: 'Existing panel account linked successfully'
        }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Generate a secure random password for Pterodactyl
    const password = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(36))
      .join('')
      .substring(0, 16);

    // Create user in Pterodactyl
    const userData = {
      email: email,
      username: (displayName || email.split('@')[0]),
      first_name: displayName?.split(' ')[0] || email.split('@')[0],
      // Ensure last_name is always provided to satisfy Pterodactyl validation
      last_name: (displayName?.split(' ').slice(1).join(' ') || 'User'),
      password: password
    }

    const response = await fetch(`${pterodactylUrl}/api/application/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pterodactylKey}`,
        'Content-Type': 'application/json',
        'Accept': 'Application/vnd.pterodactyl.v1+json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pterodactyl user creation error:', errorText)
      return new Response('Failed to create user in Pterodactyl', { status: 500 })
    }

    const pterodactylUser = await response.json()
    const pterodactylUserId = pterodactylUser.attributes.id
    const panelUsername = pterodactylUser.attributes.username
    
    // Encrypt the password before storing (SECURITY FIX)
    const { data: encryptedPassword, error: encryptError } = await supabaseService
      .rpc('encrypt_sensitive_data', { data: password })
    
    if (encryptError) {
      console.error('Error encrypting password:', encryptError)
      return new Response('Password encryption failed', { status: 500, headers: corsHeaders })
    }

    // Create external_accounts entry
    const { error: accountError } = await supabaseService
      .from('external_accounts')
      .upsert({
        user_id: userId,
        pterodactyl_user_id: pterodactylUserId,
        panel_username: panelUsername,
        last_synced_at: new Date().toISOString()
      })

    if (accountError) {
      console.error('Error creating external_accounts entry:', accountError)
      return new Response('Failed to create account mapping', { status: 500 })
    }

    // Update profile with Pterodactyl details (using encrypted password)
    const { error: updateError } = await supabaseService
      .from('profiles')
      .update({ 
        pterodactyl_user_id: pterodactylUserId,
        pterodactyl_password_encrypted: encryptedPassword
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating profile with Pterodactyl details:', updateError)
    }

    return new Response(JSON.stringify({ 
      pterodactylUserId,
      panel_username: panelUsername
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Pterodactyl user creation error:', error)
    return new Response('User creation failed', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})