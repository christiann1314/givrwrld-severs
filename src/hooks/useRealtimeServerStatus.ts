import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ServerStatus {
  id: string;
  status: string;
  pterodactyl_server_id?: string;
  ip?: string;
  port?: string;
  updated_at: string;
}

export const useRealtimeServerStatus = () => {
  const { user } = useAuth();
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setServers([]);
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchServers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_servers')
          .select('id, status, pterodactyl_server_id, ip, port, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServers(data || []);
      } catch (error) {
        console.error('Failed to fetch servers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();

    // Set up real-time subscription
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
          console.log('Real-time server update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setServers(prev => [payload.new as ServerStatus, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setServers(prev => 
              prev.map(server => 
                server.id === payload.new.id 
                  ? { ...server, ...payload.new }
                  : server
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setServers(prev => 
              prev.filter(server => server.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  return { servers, isLoading };
};

// Hook for individual server status monitoring
export const useServerStatusMonitoring = (serverId?: string) => {
  const [status, setStatus] = useState<string>('unknown');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    if (!serverId) return;

    // Set up real-time subscription for specific server
    const channel = supabase
      .channel(`server-${serverId}-status`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_servers',
          filter: `id=eq.${serverId}`
        },
        (payload) => {
          console.log('Server status update:', payload);
          setStatus(payload.new.status);
          setLastUpdate(payload.new.updated_at);
        }
      )
      .subscribe();

    // Initial fetch
    const fetchInitialStatus = async () => {
      const { data } = await supabase
        .from('user_servers')
        .select('status, updated_at')
        .eq('id', serverId)
        .single();

      if (data) {
        setStatus(data.status);
        setLastUpdate(data.updated_at);
      }
    };

    fetchInitialStatus();

    return () => {
      channel.unsubscribe();
    };
  }, [serverId]);

  return { status, lastUpdate };
};