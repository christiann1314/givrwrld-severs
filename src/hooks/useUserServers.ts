import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ServerSpec {
  id: string;
  name: string;
  game: string;
  status: string;
  ram: string;
  cpu: string;
  disk: string;
  location: string;
  ip?: string;
  port?: string;
  pterodactylUrl: string;
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
        game: server.game_type,
        status: server.status,
        ram: server.ram,
        cpu: server.cpu,
        disk: server.disk,
        location: server.location,
        ip: server.ip,
        port: server.port,
        pterodactylUrl: server.pterodactyl_url
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

  return { serversData, refetchServers: fetchUserServers };
};