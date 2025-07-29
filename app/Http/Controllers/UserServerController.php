<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class UserServerController extends Controller
{
    public function getServerStatus(Request $request)
    {
        $email = $request->input('email');
        
        if (!$email) {
            return response()->json(['error' => 'Email is required'], 400);
        }

        $pterodactylUrl = env('PTERODACTYL_URL');
        $apiKey = env('PTERODACTYL_API_KEY');

        try {
            // Check if user exists in Pterodactyl
            $users = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/users', [
                'filter[email]' => $email
            ]);

            if (!$users->successful()) {
                Log::error('Failed to fetch Pterodactyl users', ['response' => $users->json()]);
                return response()->json(['has_server' => false], 200);
            }

            $user = collect($users->json()['data'])->firstWhere('attributes.email', $email);
            
            if (!$user) {
                return response()->json(['has_server' => false], 200);
            }

            // Get servers for this user
            $servers = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/servers', [
                'filter[owner_id]' => $user['attributes']['id']
            ]);

            if (!$servers->successful()) {
                Log::error('Failed to fetch user servers', ['response' => $servers->json()]);
                return response()->json(['has_server' => false], 200);
            }

            $serverData = $servers->json()['data'];
            
            if (empty($serverData)) {
                return response()->json(['has_server' => false], 200);
            }

            // Return the first server info
            $server = $serverData[0]['attributes'];
            $allocations = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/servers/' . $server['id'] . '/allocations');

            $allocation = null;
            if ($allocations->successful() && !empty($allocations->json()['data'])) {
                $allocation = $allocations->json()['data'][0]['attributes'];
            }

            return response()->json([
                'has_server' => true,
                'server_info' => [
                    'id' => $server['id'],
                    'name' => $server['name'],
                    'status' => $server['status'] ?? 'installing',
                    'ip' => $allocation['ip'] ?? 'panel.givrwrldservers.com',
                    'port' => $allocation['port'] ?? '25565'
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Exception in getServerStatus', [
                'error' => $e->getMessage(),
                'email' => $email
            ]);
            return response()->json(['has_server' => false], 200);
        }
    }

    public function getUserStats(Request $request)
    {
        try {
            $email = $request->input('email');
            
            if (!$email) {
                return response()->json(['error' => 'Email is required'], 400);
            }

            Log::info('Getting user stats for email: ' . $email);

            $pterodactylUrl = env('PTERODACTYL_URL');
            $apiKey = env('PTERODACTYL_API_KEY');

            // Get user from Pterodactyl
            $userResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/users', [
                'filter[email]' => $email
            ]);

            $serverCount = 0;
            if ($userResponse->successful() && !empty($userResponse->json()['data'])) {
                $userData = $userResponse->json()['data'][0];
                $userId = $userData['attributes']['id'];

                // Get user's servers
                $serversResponse = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Accept' => 'application/json',
                ])->get($pterodactylUrl . '/api/application/servers', [
                    'filter[owner_id]' => $userId
                ]);

                if ($serversResponse->successful()) {
                    $serverCount = count($serversResponse->json()['data']);
                }
            }

            return response()->json([
                'active_servers' => $serverCount,
                'total_spent' => $serverCount > 0 ? '$3.50' : '$0.00',
                'support_tickets' => 0,
                'referrals' => 0
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting user stats: ' . $e->getMessage());
            return response()->json([
                'active_servers' => 0,
                'total_spent' => '$0.00',
                'support_tickets' => 0,
                'referrals' => 0
            ]);
        }
    }

    public function getUserServers(Request $request)
    {
        try {
            $email = $request->input('email');
            
            if (!$email) {
                return response()->json(['error' => 'Email is required'], 400);
            }

            Log::info('Getting user servers for email: ' . $email);

            $pterodactylUrl = env('PTERODACTYL_URL');
            $apiKey = env('PTERODACTYL_API_KEY');

            // Get user from Pterodactyl
            $userResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/users', [
                'filter[email]' => $email
            ]);

            if (!$userResponse->successful() || empty($userResponse->json()['data'])) {
                return response()->json([
                    'servers' => [],
                    'loading' => false
                ]);
            }

            $userData = $userResponse->json()['data'][0];
            $userId = $userData['attributes']['id'];

            // Get user's servers
            $serversResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json',
            ])->get($pterodactylUrl . '/api/application/servers', [
                'filter[owner_id]' => $userId
            ]);

            $servers = [];
            if ($serversResponse->successful()) {
                $serversData = $serversResponse->json()['data'];
                
                foreach ($serversData as $server) {
                    $attributes = $server['attributes'];
                    
                    // Get allocations for IP/Port
                    $allocationsResponse = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $apiKey,
                        'Accept' => 'application/json',
                    ])->get($pterodactylUrl . '/api/application/servers/' . $attributes['id'] . '/allocations');
                    
                    $ip = 'panel.givrwrldservers.com';
                    $port = '25565';
                    if ($allocationsResponse->successful() && !empty($allocationsResponse->json()['data'])) {
                        $primaryAllocation = $allocationsResponse->json()['data'][0]['attributes'];
                        $ip = $primaryAllocation['ip'];
                        $port = $primaryAllocation['port'];
                    }

                    $servers[] = [
                        'id' => $attributes['identifier'],
                        'name' => $attributes['name'],
                        'game' => $this->determineGameType($attributes),
                        'status' => $this->mapServerStatus($attributes['status'] ?? 'installing'),
                        'ram' => $this->formatMemory($attributes['limits']['memory'] ?? 1024),
                        'cpu' => ($attributes['limits']['cpu'] ?? 50) . '%',
                        'disk' => $this->formatDisk($attributes['limits']['disk'] ?? 5120),
                        'location' => 'US East',
                        'pterodactyl_url' => $pterodactylUrl . '/server/' . $attributes['identifier'],
                        'ip' => $ip,
                        'port' => $port
                    ];
                }
            }

            return response()->json([
                'servers' => $servers,
                'loading' => false
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting user servers: ' . $e->getMessage());
            return response()->json([
                'servers' => [],
                'loading' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function determineGameType($attributes)
    {
        $name = strtolower($attributes['name'] ?? '');
        $description = strtolower($attributes['description'] ?? '');
        
        if (strpos($name, 'minecraft') !== false || strpos($description, 'minecraft') !== false) {
            return 'minecraft';
        } elseif (strpos($name, 'fivem') !== false || strpos($description, 'fivem') !== false) {
            return 'fivem';
        } elseif (strpos($name, 'palworld') !== false || strpos($description, 'palworld') !== false) {
            return 'palworld';
        }
        
        return 'minecraft'; // Default
    }

    private function mapServerStatus($status)
    {
        switch ($status) {
            case 'installing':
                return 'Setting up';
            case 'offline':
                return 'Offline';
            case 'starting':
                return 'Starting';
            case 'running':
                return 'Online';
            case 'stopping':
                return 'Stopping';
            default:
                return 'Setting up';
        }
    }

    private function formatMemory($memory)
    {
        if ($memory >= 1024) {
            return round($memory / 1024, 1) . 'GB';
        }
        return $memory . 'MB';
    }

    private function formatDisk($disk)
    {
        if ($disk >= 1024) {
            return round($disk / 1024, 1) . 'GB';
        }
        return $disk . 'MB';
    }
}