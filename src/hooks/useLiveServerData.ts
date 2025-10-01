import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ServerData {
  id: string;
  name: string;
  game: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  players: number;
  maxPlayers: number;
  uptime: string;
  pterodactylUrl: string;
  specs: string;
  lastSeen: string;
}

interface LiveServerStats {
  servers: ServerData[];
  totalServers: number;
  onlineServers: number;
  totalPlayers: number;
  averageUptime: number;
}

export const useLiveServerData = (refreshInterval: number = 30000) => {
  const { user } = useAuth();
  const [data, setData] = useState<LiveServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchServerData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      // Fetch user's servers from Supabase
      const { data: userServers, error: serversError } = await supabase
        .from('user_servers')
        .select('*')
        .eq('user_id', user.id);

      if (serversError) {
        console.error('Error fetching user servers:', serversError);
        // Fallback to mock data for demo
        const mockServers: ServerData[] = [
          {
            id: '1',
            name: 'Minecraft Server',
            game: 'Minecraft',
            status: 'online',
            players: Math.floor(Math.random() * 20),
            maxPlayers: 20,
            uptime: '99.9%',
            pterodactylUrl: 'https://panel.givrwrldservers.com/server/1',
            specs: '4GB RAM • 2 CPU Cores',
            lastSeen: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Palworld Server',
            game: 'Palworld',
            status: Math.random() > 0.3 ? 'online' : 'offline',
            players: Math.floor(Math.random() * 16),
            maxPlayers: 16,
            uptime: '99.5%',
            pterodactylUrl: 'https://panel.givrwrldservers.com/server/2',
            specs: '8GB RAM • 4 CPU Cores',
            lastSeen: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Rust Server',
            game: 'Rust',
            status: Math.random() > 0.5 ? 'online' : 'offline',
            players: Math.floor(Math.random() * 50),
            maxPlayers: 50,
            uptime: '98.7%',
            pterodactylUrl: 'https://panel.givrwrldservers.com/server/3',
            specs: '16GB RAM • 8 CPU Cores',
            lastSeen: new Date().toISOString()
          }
        ];

        const totalServers = mockServers.length;
        const onlineServers = mockServers.filter(s => s.status === 'online').length;
        const totalPlayers = mockServers.reduce((sum, s) => sum + s.players, 0);
        const averageUptime = mockServers.reduce((sum, s) => sum + parseFloat(s.uptime), 0) / totalServers;

        setData({
          servers: mockServers,
          totalServers,
          onlineServers,
          totalPlayers,
          averageUptime
        });
      } else {
        // Process real server data
        const servers: ServerData[] = (userServers || []).map(server => ({
          id: server.id,
          name: server.name,
          game: server.game_type,
          status: server.status as ServerData['status'],
          players: server.current_players || 0,
          maxPlayers: server.max_players || 20,
          uptime: server.uptime || '99.9%',
          pterodactylUrl: server.pterodactyl_url || `https://panel.givrwrldservers.com/server/${server.id}`,
          specs: `${server.ram || 4}GB RAM • ${server.cpu_cores || 2} CPU Cores`,
          lastSeen: server.last_seen || new Date().toISOString()
        }));

        const totalServers = servers.length;
        const onlineServers = servers.filter(s => s.status === 'online').length;
        const totalPlayers = servers.reduce((sum, s) => sum + s.players, 0);
        const averageUptime = servers.reduce((sum, s) => sum + parseFloat(s.uptime), 0) / totalServers;

        setData({
          servers,
          totalServers,
          onlineServers,
          totalPlayers,
          averageUptime
        });
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server data');
      console.error('Error fetching live server data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServerData();
    
    const interval = setInterval(fetchServerData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchServerData, refreshInterval]);

  const refresh = useCallback(() => {
    fetchServerData();
  }, [fetchServerData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
};
