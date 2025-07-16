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
                    'locations' => [1], // Update to your location ID
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
        switch ($amount) {
            case 999: // $9.99 - Basic Plan
                return [
                    'memory' => 2048,
                    'disk' => 10240,
                    'cpu' => 100,
                    'egg' => 5, // Minecraft Java egg ID - adjust as needed
                    'docker_image' => 'ghcr.io/pterodactyl/yolks:java_17',
                    'startup' => 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
                    'environment' => [
                        'SERVER_JARFILE' => 'server.jar',
                        'VANILLA_VERSION' => 'latest'
                    ]
                ];
            case 1999: // $19.99 - Premium Plan
                return [
                    'memory' => 4096,
                    'disk' => 20480,
                    'cpu' => 200,
                    'egg' => 5,
                    'docker_image' => 'ghcr.io/pterodactyl/yolks:java_17',
                    'startup' => 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
                    'environment' => [
                        'SERVER_JARFILE' => 'server.jar',
                        'VANILLA_VERSION' => 'latest'
                    ]
                ];
            case 3999: // $39.99 - Enterprise Plan
                return [
                    'memory' => 8192,
                    'disk' => 40960,
                    'cpu' => 400,
                    'egg' => 5,
                    'docker_image' => 'ghcr.io/pterodactyl/yolks:java_17',
                    'startup' => 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
                    'environment' => [
                        'SERVER_JARFILE' => 'server.jar',
                        'VANILLA_VERSION' => 'latest'
                    ]
                ];
            default: // Default to basic
                return [
                    'memory' => 1024,
                    'disk' => 5120,
                    'cpu' => 50,
                    'egg' => 5,
                    'docker_image' => 'ghcr.io/pterodactyl/yolks:java_17',
                    'startup' => 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
                    'environment' => [
                        'SERVER_JARFILE' => 'server.jar',
                        'VANILLA_VERSION' => 'latest'
                    ]
                ];
        }
    }
}