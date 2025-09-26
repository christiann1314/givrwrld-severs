import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  'auth': { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 30 * 60 * 1000 }, // 5 requests per 15 min, block for 30 min
  'api': { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  'payment': { windowMs: 60 * 1000, maxRequests: 10, blockDurationMs: 5 * 60 * 1000 }, // 10 requests per minute, block for 5 min
  'support': { windowMs: 60 * 1000, maxRequests: 5 }, // 5 support requests per minute
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, identifier } = await req.json();
    
    if (!endpoint || !identifier) {
      return new Response(JSON.stringify({ 
        error: 'Missing endpoint or identifier',
        allowed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const config = rateLimitConfigs[endpoint];
    if (!config) {
      return new Response(JSON.stringify({ 
        error: 'Unknown endpoint',
        allowed: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);
    const rateLimitKey = `${endpoint}:${identifier}`;

    // Check for existing rate limit violations
    const { data: existingViolations } = await supabaseClient
      .from('rate_limit_violations')
      .select('blocked_until')
      .eq('rate_limit_key', rateLimitKey)
      .gte('blocked_until', now.toISOString())
      .single();

    if (existingViolations) {
      console.log(`[RATE-LIMITER] Blocked request for ${rateLimitKey} until ${existingViolations.blocked_until}`);
      return new Response(JSON.stringify({
        allowed: false,
        reason: 'blocked',
        blocked_until: existingViolations.blocked_until,
        retry_after: Math.ceil((new Date(existingViolations.blocked_until).getTime() - now.getTime()) / 1000)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    // Count requests in the current window
    const { count, error: countError } = await supabaseClient
      .from('rate_limit_requests')
      .select('*', { count: 'exact', head: true })
      .eq('rate_limit_key', rateLimitKey)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      console.error('[RATE-LIMITER] Error counting requests:', countError);
      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestCount = count || 0;

    if (requestCount >= config.maxRequests) {
      // Rate limit exceeded - create violation record if block duration is configured
      if (config.blockDurationMs) {
        const blockedUntil = new Date(now.getTime() + config.blockDurationMs);
        await supabaseClient
          .from('rate_limit_violations')
          .upsert({
            rate_limit_key: rateLimitKey,
            endpoint,
            identifier,
            blocked_until: blockedUntil.toISOString(),
            violation_count: 1
          }, {
            onConflict: 'rate_limit_key'
          });
      }

      console.log(`[RATE-LIMITER] Rate limit exceeded for ${rateLimitKey}: ${requestCount}/${config.maxRequests}`);
      
      return new Response(JSON.stringify({
        allowed: false,
        reason: 'rate_limit_exceeded',
        limit: config.maxRequests,
        window_ms: config.windowMs,
        current_count: requestCount,
        retry_after: Math.ceil(config.windowMs / 1000)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    // Record this request
    await supabaseClient
      .from('rate_limit_requests')
      .insert({
        rate_limit_key: rateLimitKey,
        endpoint,
        identifier,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

    console.log(`[RATE-LIMITER] Request allowed for ${rateLimitKey}: ${requestCount + 1}/${config.maxRequests}`);

    return new Response(JSON.stringify({
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - requestCount - 1,
      window_ms: config.windowMs,
      reset_time: new Date(windowStart.getTime() + config.windowMs).toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RATE-LIMITER] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      allowed: true // Fail open for availability
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});