import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

interface ServerSpec {
  id: string;
  name: string;
  server_name: string;
  game: string;
  game_type: string;
  status: string;
  ram: string;
  cpu: string;
  disk: string;
  location: string;
  ip?: string;
  port?: string;
  pterodactylUrl: string;
  pterodactyl_url?: string;
  pterodactyl_server_id?: number | null;
  pterodactyl_server_identifier?: string | null;
  bundle_id?: string;
  live_stats?: {
    cpu_percent?: number;
    memory_used_mb?: number;
    memory_limit_mb?: number;
    disk_used_mb?: number;
    network_rx_bytes?: number;
    network_tx_bytes?: number;
    uptime?: number;
    is_suspended?: boolean;
    last_updated?: string;
  };
}

interface UserServersData {
  servers: ServerSpec[];
  loading: boolean;
}

export const useUserServers = (userEmail?: string) => {
  const [serversData, setServersData] = useState<UserServersData>({
    servers: [],
    loading: false
  });
  // toast is now imported directly from sonner

  const fetchUserServers = async (skipSync = false) => {
    if (!userEmail) {
      console.log('No userEmail provided to fetchUserServers');
      return;
    }
    
    console.log('🔄 Fetching servers for user:', userEmail);
    setServersData(prev => ({ ...prev, loading: true }));

    try {
      // Get current user from API
      const userResponse = await api.getCurrentUser();
      
      if (!userResponse.success || !userResponse.data) {
        console.log('No authenticated user found');
        setServersData(prev => ({ ...prev, loading: false }));
        return;
      }

      const user = userResponse.data.user;
      console.log('🔍 Fetching servers from API for user:', user.id);
      
      // Fetch from API
      const response = await api.getServers();
      
      if (!response.success || !response.data) {
        console.error('Error fetching user servers from API:', response.error);
        setServersData({ servers: [], loading: false });
        return;
      }

      const sbServers = response.data.servers || [];
      console.log('📊 Raw server data from API:', sbServers);

      const formattedServers = (sbServers || []).map((order: any) => ({
        id: order.id,
        name: order.server_name,
        server_name: order.server_name,
        game: order.plan_id?.split('-')[0] || 'unknown', // Extract game from plan_id like 'minecraft-4gb'
        game_type: order.plan_id?.split('-')[0] || 'unknown',
        status: order.status,
        ram: order.plan_id?.includes('1gb') ? '1GB' : 
             order.plan_id?.includes('2gb') ? '2GB' :
             order.plan_id?.includes('4gb') ? '4GB' :
             order.plan_id?.includes('8gb') ? '8GB' :
             order.plan_id?.includes('12gb') ? '12GB' :
             order.plan_id?.includes('16gb') ? '16GB' : 'Unknown',
        cpu: '2 vCPU', // Default CPU
        disk: '40GB SSD', // Default disk
        location: order.region,
        ip: order.ptero_identifier ? `server-${order.ptero_identifier}.givrwrldservers.com` : '',
        port: order.ptero_identifier ? '25565' : '',
        pterodactylUrl: order.ptero_identifier ? `https://panel.givrwrldservers.com/server/${order.ptero_identifier}` : '',
        pterodactyl_url: order.ptero_identifier ? `https://panel.givrwrldservers.com/server/${order.ptero_identifier}` : '',
        pterodactyl_server_id: order.ptero_server_id,
        pterodactyl_server_identifier: order.ptero_identifier,
        bundle_id: 'none',
        live_stats: {}
      }));

      console.log('🎮 Formatted servers for display:', formattedServers);
      setServersData({ servers: formattedServers, loading: false });

      // Sync is now handled by the API - no need for separate sync call
      // Server data is fetched directly from MySQL orders table

    } catch (error) {
      console.error('Failed to fetch user servers:', error);
      setServersData({ servers: [], loading: false });
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserServers();
    }
  }, [userEmail]);

  // Set up periodic refresh (MySQL doesn't have real-time subscriptions)
  useEffect(() => {
    if (!userEmail) return;

    // Refresh every 30 seconds (MySQL doesn't have real-time subscriptions)
    const interval = setInterval(() => {
      fetchUserServers(true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [userEmail]);

  return { serversData, refetchServers: fetchUserServers };
};