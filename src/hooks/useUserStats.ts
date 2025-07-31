import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface UserStats {
  activeServers: number;
  totalSpent: string;
  supportTickets: number;
  referrals: number;
  loading: boolean;
}

export const useUserStats = (userEmail?: string) => {
  const [userStats, setUserStats] = useState<UserStats>({
    activeServers: 0,
    totalSpent: "$0.00",
    supportTickets: 0,
    referrals: 0,
    loading: false
  });
  const { toast } = useToast();

  const fetchUserStats = async () => {
    if (!userEmail) {
      console.log('No userEmail provided to fetchUserStats');
      return;
    }
    
    console.log('Fetching stats for user:', userEmail);
    setUserStats(prev => ({ ...prev, loading: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setUserStats(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data: statsData, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user stats:', error);
        setUserStats({
          activeServers: 1,
          totalSpent: "$3.50",
          supportTickets: 0,
          referrals: 0,
          loading: false
        });
        return;
      }

      if (statsData) {
        setUserStats({
          activeServers: statsData.active_servers || 0,
          totalSpent: `$${Number(statsData.total_spent || 0).toFixed(2)}`,
          supportTickets: statsData.support_tickets || 0,
          referrals: statsData.referrals || 0,
          loading: false
        });
      } else {
        // No stats record found, use defaults
        setUserStats({
          activeServers: 0,
          totalSpent: "$0.00",
          supportTickets: 0,
          referrals: 0,
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Fallback to default values
      setUserStats({
        activeServers: 1,
        totalSpent: "$3.50",
        supportTickets: 0,
        referrals: 0,
        loading: false
      });
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserStats();
    }
  }, [userEmail]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats'
        },
        () => {
          console.log('Stats data changed, refetching...');
          fetchUserStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return { userStats, refetchStats: fetchUserStats };
};