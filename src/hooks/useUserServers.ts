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
      // 1) Try Laravel API (Pterodactyl as source of truth)
      const apiRes = await fetch(`${API_BASE_URL}/user/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (apiRes.ok) {
        const apiJson = await apiRes.json();
        const list = Array.isArray(apiJson) ? apiJson : (apiJson.servers || []);

        if (Array.isArray(list) && list.length > 0) {
          const formattedFromApi = list.map((s: any, idx: number) => ({
            id: s.id || `${s.name || 'server'}-${idx}`,
            name: s.name || s.server_name,
            server_name: s.name || s.server_name,
            game: s.game_type || s.game,
            game_type: s.game_type || s.game,
            status: (s.status || 'unknown').toString(),
            ram: s.ram || s.memory || '—',
            cpu: s.cpu || '—',
            disk: s.disk || '—',
            location: s.location || s.node || '—',
            ip: s.ip,
            port: s.port,
            pterodactylUrl: s.pterodactyl_url || s.panel_url || '',
            pterodactyl_url: s.pterodactyl_url || s.panel_url || ''
          }));

          console.log('🛰️ Servers from Laravel/Pterodactyl:', formattedFromApi);
          setServersData({ servers: formattedFromApi, loading: false });
          return;
        }
      }

      // 2) Fallback to Supabase table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setServersData(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data: sbServers, error } = await supabase
        .from('user_servers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user servers:', error);
        setServersData({ servers: [], loading: false });
        return;
      }

      console.log('📊 Raw server data from Supabase:', sbServers);

      const formattedServers = (sbServers || []).map((server: any) => ({
        id: server.id,
        name: server.server_name,
        server_name: server.server_name,
        game: server.game_type,
        game_type: server.game_type, // Include both for compatibility
        status: server.status,
        ram: server.ram,
        cpu: server.cpu,
        disk: server.disk,
        location: server.location,
        ip: server.ip,
        port: server.port,
        pterodactylUrl: server.pterodactyl_url,
        pterodactyl_url: server.pterodactyl_url
      }));

      console.log('🎮 Formatted servers for display:', formattedServers);

      setServersData({ servers: formattedServers, loading: false });
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