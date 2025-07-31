import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

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
    
    console.log('Fetching servers for user:', userEmail);
    setServersData(prev => ({ ...prev, loading: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setServersData(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data: serversData, error } = await supabase
        .from('user_servers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user servers:', error);
        setServersData({
          servers: [],
          loading: false
        });
        return;
      }

      const formattedServers = serversData.map(server => ({
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

      setServersData({
        servers: formattedServers,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch user servers:', error);
      setServersData({
        servers: [],
        loading: false
      });
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
            console.log('Server data changed, refetching...', payload);
            fetchUserServers();
          }
        )
        .subscribe();

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