import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: Request) => string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting (could be replaced with Redis in production)
const rateLimitStore: RateLimitStore = {}

class RateLimiter {
  private config: RateLimitConfig
  
  constructor(config: RateLimitConfig) {
    this.config = config
  }
  
  private cleanupExpired() {
    const now = Date.now()
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key]
      }
    })
  }
  
  private getClientIdentifier(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req)
    }
    
    // Try to get user ID from auth header
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      return `user:${authHeader.slice(-10)}` // Use last 10 chars of token as identifier
    }
    
    // Fallback to IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return `ip:${ip}`
  }
  
  async isAllowed(req: Request): Promise<{ allowed: boolean; limit: number; remaining: number; resetTime: number }> {
    this.cleanupExpired()
    
    const identifier = this.getClientIdentifier(req)
    const now = Date.now()
    const resetTime = now + this.config.windowMs
    
    if (!rateLimitStore[identifier]) {
      rateLimitStore[identifier] = {
        count: 1,
        resetTime
      }
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime
      }
    }
    
    const entry = rateLimitStore[identifier]
    
    // Reset if window has expired
    if (entry.resetTime < now) {
      entry.count = 1
      entry.resetTime = resetTime
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      }
    }
    
    // Increment counter
    entry.count++
    
    const allowed = entry.count <= this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    
    return {
      allowed,
      limit: this.config.maxRequests,
      remaining,
      resetTime: entry.resetTime
    }
  }
  
  createResponse(result: { allowed: boolean; limit: number; remaining: number; resetTime: number }, response?: Response): Response {
    const headers = new Headers(response?.headers || {})
    
    // Add rate limit headers
    headers.set('X-RateLimit-Limit', result.limit.toString())
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${result.limit} requests per window.`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers
        }
      )
    }
    
    if (response) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      })
    }
    
    return new Response(null, { headers })
  }
}

// Rate limiting configurations for different endpoints
export const rateLimitConfigs = {
  // Strict limits for payment endpoints
  payment: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  }),
  
  // Medium limits for user data endpoints
  userData: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30
  }),
  
  // Loose limits for general endpoints
  general: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100
  }),
  
  // Very strict for sensitive operations
  sensitive: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  })
}

// Rate limiter utility function
export async function withRateLimit(
  req: Request, 
  limiterType: keyof typeof rateLimitConfigs,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  const limiter = rateLimitConfigs[limiterType]
  const rateLimitResult = await limiter.isAllowed(req)
  
  if (!rateLimitResult.allowed) {
    console.log(`Rate limit exceeded for ${limiterType}: ${req.url}`)
    return limiter.createResponse(rateLimitResult)
  }
  
  try {
    const response = await handler(req)
    return limiter.createResponse(rateLimitResult, response)
  } catch (error) {
    console.error('Error in rate-limited handler:', error)
    return limiter.createResponse(rateLimitResult, new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ))
  }
}

// Main function for testing the rate limiter
Deno.serve(async (req) => {
  return await withRateLimit(req, 'general', async () => {
    return new Response(
      JSON.stringify({ 
        message: 'Rate limiter is working!',
        timestamp: new Date().toISOString() 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  })
})