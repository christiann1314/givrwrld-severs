import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { API_BASE_URL } from '../config/api';

interface ServerSpec {
  id: string;
  name: string;
  server_name: string; // Add this field for database mapping
  game: string;
  game_type: string; // Add this field
  status: string;
  ram: string;
  cpu: string;
  disk: string;
  location: string;
  ip?: string;
  port?: string;
  pterodactylUrl: string;
  pterodactyl_url?: string; // Add this for database mapping
  bundle_id?: string; // Add bundle support
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
  const { toast } = useToast();

  const fetchUserServers = async () => {
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
        .from('user_servers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user servers from Supabase:', error);
        setServersData({ servers: [], loading: false });
        return;
      }

      console.log('📊 Raw server data from Supabase:', sbServers);

      const formattedServers = (sbServers || []).map((server: any) => ({
        id: server.id,
        name: server.server_name,
        server_name: server.server_name,
        game: server.game_type,
        game_type: server.game_type,
        status: server.status,
        ram: server.ram,
        cpu: server.cpu,
        disk: server.disk,
        location: server.location,
        ip: server.ip,
        port: server.port,
        pterodactylUrl: server.pterodactyl_url || '',
        pterodactyl_url: server.pterodactyl_url || '',
        bundle_id: server.bundle_id || 'none'
      }));

      console.log('🎮 Formatted servers for display:', formattedServers);
      setServersData({ servers: formattedServers, loading: false });

      // Optional: Try Laravel API as backup for real-time status updates
      try {
        const apiRes = await fetch(`${API_BASE_URL}/user/servers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });

        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          const list = Array.isArray(apiJson) ? apiJson : (apiJson.servers || []);
          console.log('🛰️ Laravel API response (backup):', list);
          // Could merge status updates here if needed
        }
      } catch (apiError) {
        console.log('Laravel API unavailable (using Supabase data):', apiError);
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

  // Set up real-time subscription
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
            table: 'user_servers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🚨 Server data changed! Payload:', payload);
            console.log('📡 Refetching server data...');
            fetchUserServers();
            
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

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [userEmail]);

  return { serversData, refetchServers: fetchUserServers };
};