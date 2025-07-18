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
}