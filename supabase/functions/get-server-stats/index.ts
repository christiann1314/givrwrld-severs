import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { server_id } = await req.json();
    
    if (!server_id) {
      return new Response(JSON.stringify({ error: 'Server ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const pterodactylUrl = Deno.env.get('PTERODACTYL_URL');
    const clientApiKey = Deno.env.get('PTERO_CLIENT_KEY');

    if (!pterodactylUrl || !clientApiKey) {
      console.error('Missing Pterodactyl configuration');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Fetching stats for server ${server_id}`);

    // Fetch server details and stats from Pterodactyl Client API
    const [serverResponse, resourcesResponse] = await Promise.all([
      fetch(`${pterodactylUrl}/api/client/servers/${server_id}`, {
        headers: {
          'Authorization': `Bearer ${clientApiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }),
      fetch(`${pterodactylUrl}/api/client/servers/${server_id}/resources`, {
        headers: {
          'Authorization': `Bearer ${clientApiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
    ]);

    if (!serverResponse.ok || !resourcesResponse.ok) {
      console.error('Failed to fetch server data:', {
        serverStatus: serverResponse.status,
        resourcesStatus: resourcesResponse.status
      });
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch server data from Pterodactyl' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const serverData = await serverResponse.json();
    const resourcesData = await resourcesResponse.json();

    // Process the data into a consistent format
    const stats = {
      server_id: server_id,
      status: serverData.attributes.status,
      is_suspended: serverData.attributes.is_suspended,
      
      // Current resource usage
      current_state: resourcesData.attributes.current_state,
      resources: {
        memory_bytes: resourcesData.attributes.resources.memory_bytes,
        cpu_absolute: resourcesData.attributes.resources.cpu_absolute,
        disk_bytes: resourcesData.attributes.resources.disk_bytes,
        network_rx_bytes: resourcesData.attributes.resources.network_rx_bytes,
        network_tx_bytes: resourcesData.attributes.resources.network_tx_bytes,
        uptime: resourcesData.attributes.resources.uptime
      },
      
      // Server limits
      limits: {
        memory: serverData.attributes.limits.memory,
        swap: serverData.attributes.limits.swap,
        disk: serverData.attributes.limits.disk,
        io: serverData.attributes.limits.io,
        cpu: serverData.attributes.limits.cpu
      },
      
      // Feature limits
      feature_limits: {
        databases: serverData.attributes.feature_limits.databases,
        allocations: serverData.attributes.feature_limits.allocations,
        backups: serverData.attributes.feature_limits.backups
      },

      // Server details
      name: serverData.attributes.name,
      description: serverData.attributes.description,
      uuid: serverData.attributes.uuid,
      identifier: serverData.attributes.identifier,
      
      last_updated: new Date().toISOString()
    };

    console.log('Successfully fetched server stats:', {
      server_id,
      status: stats.status,
      memory_usage: stats.resources.memory_bytes,
      cpu_usage: stats.resources.cpu_absolute
    });

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching server stats:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});