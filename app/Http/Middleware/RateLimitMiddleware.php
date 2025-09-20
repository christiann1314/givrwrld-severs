<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Response;

class RateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $limitType
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $limitType = 'general')
    {
        $limits = $this->getLimits($limitType);
        $identifier = $this->getClientIdentifier($request);
        $key = "rate_limit:{$limitType}:{$identifier}";
        
        // Get current count from cache
        $current = Cache::get($key, 0);
        
        // Check if limit exceeded
        if ($current >= $limits['max_requests']) {
            return response()->json([
                'error' => 'Rate limit exceeded',
                'message' => "Too many requests. Limit: {$limits['max_requests']} requests per {$limits['window_minutes']} minutes.",
                'retry_after' => $limits['window_minutes'] * 60
            ], 429, [
                'X-RateLimit-Limit' => $limits['max_requests'],
                'X-RateLimit-Remaining' => 0,
                'X-RateLimit-Reset' => time() + ($limits['window_minutes'] * 60),
                'Retry-After' => $limits['window_minutes'] * 60
            ]);
        }
        
        // Increment counter
        $newCount = $current + 1;
        $ttl = $limits['window_minutes'] * 60;
        
        if ($current === 0) {
            // First request in window
            Cache::put($key, $newCount, $ttl);
        } else {
            // Increment existing counter
            Cache::put($key, $newCount, Cache::get($key . '_ttl', $ttl));
        }
        
        // Process request
        $response = $next($request);
        
        // Add rate limit headers
        $remaining = max(0, $limits['max_requests'] - $newCount);
        $resetTime = time() + $ttl;
        
        if ($response instanceof Response) {
            $response->headers->set('X-RateLimit-Limit', $limits['max_requests']);
            $response->headers->set('X-RateLimit-Remaining', $remaining);
            $response->headers->set('X-RateLimit-Reset', $resetTime);
        }
        
        return $response;
    }
    
    /**
     * Get rate limiting configuration based on type
     */
    private function getLimits(string $type): array
    {
        $limits = [
            'payment' => [
                'max_requests' => 5,
                'window_minutes' => 15
            ],
            'user_data' => [
                'max_requests' => 30,
                'window_minutes' => 5
            ],
            'general' => [
                'max_requests' => 100,
                'window_minutes' => 1
            ],
            'sensitive' => [
                'max_requests' => 3,
                'window_minutes' => 60
            ]
        ];
        
        return $limits[$type] ?? $limits['general'];
    }
    
    /**
     * Generate unique identifier for the client
     */
    private function getClientIdentifier(Request $request): string
    {
        // Try to use authenticated user ID first
        if ($request->user()) {
            return 'user:' . $request->user()->id;
        }
        
        // Fallback to IP address
        $ip = $request->ip();
        $userAgent = substr(md5($request->header('User-Agent', '')), 0, 8);
        
        return "ip:{$ip}:ua:{$userAgent}";
    }
}