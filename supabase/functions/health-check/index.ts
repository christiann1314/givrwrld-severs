import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    functions: boolean;
  };
  metrics: {
    response_time: number;
    active_connections: number;
    cpu_usage?: number;
    memory_usage?: number;
  };
  uptime: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        auth: false,
        storage: false,
        functions: false,
      },
      metrics: {
        response_time: 0,
        active_connections: 0,
      },
      uptime: 0,
    };

    // Database health check
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('count(*)')
        .limit(1);
      healthStatus.checks.database = !error;
    } catch {
      healthStatus.checks.database = false;
    }

    // Auth health check
    try {
      const { data: { users }, error } = await supabaseClient.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      healthStatus.checks.auth = !error;
    } catch {
      healthStatus.checks.auth = false;
    }

    // Storage health check
    try {
      const { data, error } = await supabaseClient.storage.listBuckets();
      healthStatus.checks.storage = !error;
    } catch {
      healthStatus.checks.storage = false;
    }

    // Functions health check (self-check)
    healthStatus.checks.functions = true;

    // Calculate metrics
    healthStatus.metrics.response_time = Date.now() - startTime;
    
    // Determine overall status
    const failedChecks = Object.values(healthStatus.checks).filter(check => !check).length;
    if (failedChecks === 0) {
      healthStatus.status = 'healthy';
    } else if (failedChecks <= 1) {
      healthStatus.status = 'degraded';
    } else {
      healthStatus.status = 'critical';
    }

    // Log health status
    console.log(`[HEALTH-CHECK] Status: ${healthStatus.status}, Response Time: ${healthStatus.metrics.response_time}ms`);

    return new Response(JSON.stringify(healthStatus), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: healthStatus.status === 'critical' ? 503 : 200,
    });

  } catch (error) {
    console.error('[HEALTH-CHECK] Critical error:', error);
    
    const errorStatus: HealthStatus = {
      status: 'critical',
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        auth: false,
        storage: false,
        functions: false,
      },
      metrics: {
        response_time: Date.now() - startTime,
        active_connections: 0,
      },
      uptime: 0,
    };

    return new Response(JSON.stringify(errorStatus), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 503,
    });
  }
});