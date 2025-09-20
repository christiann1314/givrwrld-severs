import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PterodactylCredentials {
  email: string;
  password: string;
  pterodactyl_user_id: number;
  panel_url: string;
}

export const usePterodactylCredentials = () => {
  const [credentials, setCredentials] = useState<PterodactylCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCredentials = async () => {
    if (!isAuthenticated) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_my_pterodactyl_credentials');

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.length > 0) {
        setCredentials(data[0]);
      } else {
        setError('No Pterodactyl credentials found');
      }
    } catch (err) {
      console.error('Error fetching Pterodactyl credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCredentials();
    }
  }, [isAuthenticated]);

  return {
    credentials,
    loading,
    error,
    refetch: fetchCredentials
  };
};