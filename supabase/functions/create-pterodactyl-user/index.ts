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

    const { userId, email, displayName } = await req.json()
    
    // Pterodactyl Panel API configuration
    const pterodactylUrl = Deno.env.get('PTERODACTYL_URL')
    const pterodactylKey = Deno.env.get('PTERODACTYL_API_KEY')

    if (!pterodactylUrl || !pterodactylKey) {
      console.error('Pterodactyl configuration missing')
      return new Response('Pterodactyl configuration missing', { status: 500 })
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
        // User already exists, update profile with Pterodactyl ID
        const pterodactylUserId = existingData.data[0].attributes.id;
        
        await supabase
          .from('profiles')
          .update({ pterodactyl_user_id: pterodactylUserId })
          .eq('user_id', userId)
        
        return new Response(JSON.stringify({ pterodactylUserId }), { 
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
      username: displayName || email.split('@')[0],
      first_name: displayName?.split(' ')[0] || email.split('@')[0],
      last_name: displayName?.split(' ')[1] || '',
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
    
    // Encrypt the password before storing (SECURITY FIX)
    const { data: encryptedPassword, error: encryptError } = await supabase
      .rpc('encrypt_sensitive_data', { data: password })
    
    if (encryptError) {
      console.error('Error encrypting password:', encryptError)
      return new Response('Password encryption failed', { status: 500, headers: corsHeaders })
    }

    // Update profile with Pterodactyl details (using encrypted password)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        pterodactyl_user_id: pterodactylUserId,
        pterodactyl_password_encrypted: encryptedPassword
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating profile with Pterodactyl details:', updateError)
    }

    return new Response(JSON.stringify({ pterodactylUserId }), { 
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