import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
  const [needsSetup, setNeedsSetup] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
        setNeedsSetup(false);
      } else {
        setError('No Pterodactyl credentials found');
        setNeedsSetup(true);
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

  const setupPterodactylAccount = async () => {
    if (!user?.email) {
      toast.error('User email not available');
      return;
    }

    setLoading(true);
    try {
      // First create the profile
      const { data: profileData, error: profileError } = await supabase
        .rpc('create_missing_profile_with_pterodactyl', {
          user_id_param: user.id,
          email_param: user.email,
          display_name_param: user.email.split('@')[0]
        });

      if (profileError) {
        throw profileError;
      }

      // Then call the Pterodactyl user creation
      const { data: pterodactylData, error: pterodactylError } = await supabase.functions.invoke('create-pterodactyl-user', {
        body: {
          userId: user.id,
          email: user.email,
          displayName: user.email.split('@')[0]
        }
      });

      if (pterodactylError) {
        throw pterodactylError;
      }

      toast.success('Pterodactyl account created successfully!');
      
      // Refetch credentials
      setTimeout(() => {
        fetchCredentials();
      }, 1000);

    } catch (err) {
      console.error('Error setting up Pterodactyl account:', err);
      toast.error('Failed to set up Pterodactyl account');
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  const fixPterodactylCredentials = async () => {
    if (!isAuthenticated) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-pterodactyl-credentials', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Pterodactyl credentials fixed! You can now login to the panel.');
        setCredentials(data.credentials);
        setNeedsSetup(false);
        setError(null);
      } else {
        throw new Error(data?.message || 'Failed to fix credentials');
      }

    } catch (err) {
      console.error('Error fixing Pterodactyl credentials:', err);
      toast.error('Failed to fix credentials: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setError(err instanceof Error ? err.message : 'Fix failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    credentials,
    loading,
    error,
    needsSetup,
    refetch: fetchCredentials,
    setupPterodactylAccount,
    fixPterodactylCredentials
  };
};