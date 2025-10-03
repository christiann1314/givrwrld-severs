import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '../config/api';

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
      // Primary source: Supabase (more reliable than Laravel API)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        setServersData(prev => ({ ...prev, loading: false }));
        return;
      }

      console.log('🔍 Fetching servers from Supabase for user:', user.id);
      
      const { data: sbServers, error } = await supabase
        .from('orders')
        .select(`
          *,
          pterodactyl_server_id,
          pterodactyl_server_identifier
        `)
        .eq('user_id', user.id)
        .eq('item_type', 'game')
        .in('status', ['paid', 'provisioned', 'active']);

      if (error) {
        console.error('Error fetching user servers from Supabase:', error);
        setServersData({ servers: [], loading: false });
        return;
      }

      console.log('📊 Raw server data from Supabase:', sbServers);

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
        ip: order.pterodactyl_server_identifier ? `server-${order.pterodactyl_server_identifier}.givrwrldservers.com` : '',
        port: order.pterodactyl_server_identifier ? '25565' : '',
        pterodactylUrl: order.pterodactyl_server_identifier ? `https://panel.givrwrldservers.com/server/${order.pterodactyl_server_identifier}` : '',
        pterodactyl_url: order.pterodactyl_server_identifier ? `https://panel.givrwrldservers.com/server/${order.pterodactyl_server_identifier}` : '',
        pterodactyl_server_id: order.pterodactyl_server_id,
        pterodactyl_server_identifier: order.pterodactyl_server_identifier,
        bundle_id: 'none',
        live_stats: {}
      }));

      console.log('🎮 Formatted servers for display:', formattedServers);
      setServersData({ servers: formattedServers, loading: false });

      // One-time sync on initial load only (prevent infinite loops)
      if (!skipSync && formattedServers.length > 0) {
        try {
          console.log('🔄 Initial sync with Pterodactyl...');
          await supabase.functions.invoke('sync-server-status');
          console.log('✅ Initial sync completed');
        } catch (syncError) {
          console.warn('Initial sync failed, using cached data:', syncError);
        }
      }

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

  // Set up real-time subscription and periodic sync
  useEffect(() => {
    if (!userEmail) return;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔗 Setting up real-time subscription for user:', user.id);

      const channel = supabase
        .channel('user-servers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🚨 Server data changed! Payload:', payload);
            console.log('📡 Refetching server data...');
            // Skip sync on realtime updates to prevent loops
            fetchUserServers(true);
            
            // Auto-start servers that just finished installing
            if (payload.eventType === 'UPDATE' && 
                payload.new?.status === 'installing' && 
                payload.old?.status === 'provisioning' &&
                payload.new?.pterodactyl_server_id) {
              console.log('🚀 Server finished provisioning, attempting auto-start in 30 seconds...');
              setTimeout(async () => {
                try {
                  const response = await supabase.functions.invoke('start-server', {
                    body: { serverId: payload.new.id }
                  });
                  if (response.error) {
                    console.error('❌ Auto-start failed:', response.error);
                  } else {
                    console.log('✅ Auto-start successful');
                  }
                } catch (error) {
                  console.error('❌ Auto-start error:', error);
                }
              }, 30000); // Wait 30 seconds for installation to complete
            }
          }
        )
        .subscribe((status) => {
          console.log('📻 Subscription status:', status);
        });

      // Set up periodic live sync every 5 minutes (reduced frequency)
      const syncInterval = setInterval(async () => {
        try {
          console.log('🔄 Periodic live sync...');
          await supabase.functions.invoke('sync-server-status');
          // Wait a bit then refresh data without triggering another sync
          setTimeout(() => fetchUserServers(true), 2000);
        } catch (error) {
          console.log('Periodic sync failed:', error);
        }
      }, 300000); // 5 minutes instead of 2

      return () => {
        supabase.removeChannel(channel);
        clearInterval(syncInterval);
      };
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [userEmail]);

  return { serversData, refetchServers: fetchUserServers };
};