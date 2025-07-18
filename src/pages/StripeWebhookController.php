<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('Invalid payload in webhook', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Invalid signature in webhook', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        // Handle the event
        switch ($event['type']) {
            case 'checkout.session.completed':
                $session = $event['data']['object'];
                Log::info('Payment successful', ['session_id' => $session['id']]);
                
                // Create Pterodactyl server
                $this->createPterodactylServer($session);
                break;
            
            default:
                Log::info('Unhandled event type', ['type' => $event['type']]);
        }

        return response('Success');
    }

    private function createPterodactylServer($session)
    {
        $email = $session['customer_details']['email'];
        $name = explode('@', $email)[0]; // Simple name
        $pterodactylUrl = env('PTERODACTYL_URL');
        $apiKey = env('PTERODACTYL_API_KEY');
        
        // Determine server config based on amount
        $amount = $session['amount_total'];
        $config = $this->getServerConfig($amount);
        
        Log::info('Creating Pterodactyl server', [
            'email' => $email,
            'amount' => $amount,
            'config' => $config
        ]);

        try {
            // Step 1: Check if user exists
            $users = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/users', [
                'filter[email]' => $email
            ]);

            if (!$users->successful()) {
                Log::error('Failed to fetch Pterodactyl users', ['response' => $users->json()]);
                return;
            }

            $user = collect($users->json()['data'])->firstWhere('attributes.email', $email);
            
            if (!$user) {
                // Step 2: Create User
                $userResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Accept' => 'application/json',
                ])->post($pterodactylUrl . '/api/application/users', [
                    'email' => $email,
                    'username' => $name,
                    'first_name' => $name,
                    'last_name' => 'Customer',
                    'password' => Str::random(12),
                ]);
                
                if (!$userResponse->successful()) {
                    Log::error('Failed to create Pterodactyl user', ['response' => $userResponse->json()]);
                    return;
                }

                $user = $userResponse->json()['attributes'];
                Log::info('Created new Pterodactyl user', ['user_id' => $user['id']]);
            } else {
                $user = $user['attributes'];
                Log::info('Found existing Pterodactyl user', ['user_id' => $user['id']]);
            }

            // Step 3: Create Server
            $serverResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->post($pterodactylUrl . '/api/application/servers', [
                'name' => 'GameServer-' . $user['id'] . '-' . time(),
                'user' => $user['id'],
                    'egg' => $config['egg'],
                    'docker_image' => $config['docker_image'],
                    'startup' => $config['startup'],
                    'description' => 'Game server created via Stripe payment',
                'limits' => [
                    'memory' => $config['memory'],
                    'swap' => 0,
                    'disk' => $config['disk'],
                    'io' => 500,
                    'cpu' => $config['cpu'],
                ],
                'feature_limits' => [
                    'databases' => 1,
                    'allocations' => 1,
                ],
                'environment' => $config['environment'],
                'allocation' => [
                    'default' => 1
                ],
                'deploy' => [
                    'locations' => [1], // Update to your actual location ID
                    'dedicated_ip' => false,
                    'port_range' => []
                ],
                'start_on_completion' => true,
            ]);

            if (!$serverResponse->successful()) {
                Log::error('Failed to create Pterodactyl server', ['response' => $serverResponse->json()]);
                return;
            }

            $server = $serverResponse->json()['attributes'];
            Log::info('Server created successfully', [
                'server_id' => $server['id'],
                'server_name' => $server['name'],
                'user_email' => $email
            ]);

        } catch (\Exception $e) {
            Log::error('Exception in createPterodactylServer', [
                'error' => $e->getMessage(),
                'email' => $email
            ]);
        }
    }

    private function getServerConfig($amount)
    {
        // Configure server specs based on payment amount (in cents)
        // Supports $0.00 - $5000.00 with dynamic scaling
        
        $amountInDollars = $amount / 100; // Convert cents to dollars
        
        // Ensure amount is within valid range
        if ($amountInDollars < 0) $amountInDollars = 0;
        if ($amountInDollars > 5000) $amountInDollars = 5000;
        
        // Dynamic scaling formulas based on payment amount
        // Base specs for $1 and scale up from there
        
        // RAM: Start at 512MB for $1, scale to 64GB at $5000
        $memory = max(512, min(65536, 512 + ($amountInDollars - 1) * 13.1)); // MB
        
        // Disk: Start at 2GB for $1, scale to 1TB at $5000
        $disk = max(2048, min(1048576, 2048 + ($amountInDollars - 1) * 210)); // MB
        
        // CPU: Start at 25% for $1, scale to 800% at $5000
        $cpu = max(25, min(800, 25 + ($amountInDollars - 1) * 0.155)); // Percentage
        
        // Round values to reasonable increments
        $memory = round($memory / 512) * 512; // Round to nearest 512MB
        $disk = round($disk / 1024) * 1024;   // Round to nearest GB
        $cpu = round($cpu / 25) * 25;         // Round to nearest 25%
        
        // Determine game type and egg based on common patterns
        $egg = 5; // Default to Minecraft Java
        $dockerImage = 'ghcr.io/pterodactyl/yolks:java_17';
        $startup = 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}';
        $environment = [
            'SERVER_JARFILE' => 'server.jar',
            'VANILLA_VERSION' => 'latest'
        ];
        
        // Special configurations for specific amounts or ranges
        if ($amountInDollars >= 50) {
            // Premium features for higher tier servers
            $environment['BUILD_NUMBER'] = 'latest';
            $environment['FORGE_VERSION'] => 'recommended';
        }
        
        return [
            'memory' => (int)$memory,
            'disk' => (int)$disk,
            'cpu' => (int)$cpu,
            'egg' => $egg,
            'docker_image' => $dockerImage,
            'startup' => $startup,
            'environment' => $environment
        ];
    }
}