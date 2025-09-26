import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  // toast is now imported directly from sonner

  const fetchUserStats = async () => {
    if (!userEmail) {
      console.log('No userEmail provided to fetchUserStats');
      return;
    }

    console.log('Fetching stats for user (derived):', userEmail);
    setUserStats(prev => ({ ...prev, loading: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setUserStats(prev => ({ ...prev, loading: false }));
        return;
      }

      // Derive live values from source tables to avoid stale user_stats
      const [serversRes, purchasesRes, extraStatsRes] = await Promise.all([
        supabase.from('user_servers').select('id').eq('user_id', user.id),
        supabase.from('purchases').select('amount').eq('user_id', user.id),
        supabase.from('user_stats').select('support_tickets, referrals').eq('user_id', user.id).maybeSingle()
      ]);

      const activeServers = Array.isArray(serversRes.data) ? serversRes.data.length : 0;
      const totalSpentNum = Array.isArray(purchasesRes.data)
        ? purchasesRes.data.reduce((sum: number, row: any) => sum + (row?.amount ? Number(row.amount) : 0), 0)
        : 0;
      const supportTickets = (extraStatsRes.data as any)?.support_tickets ?? 0;
      const referrals = (extraStatsRes.data as any)?.referrals ?? 0;

      setUserStats({
        activeServers,
        totalSpent: `$${Number(totalSpentNum || 0).toFixed(2)}`,
        supportTickets,
        referrals,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch derived user stats:', error);
      setUserStats({
        activeServers: 0,
        totalSpent: "$0.00",
        supportTickets: 0,
        referrals: 0,
        loading: false,
      });
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserStats();
    }
  }, [userEmail]);

  // Set up real-time subscription to keep dashboard numbers in sync
  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_servers' },
        () => { console.log('user_servers changed, refetching...'); fetchUserStats(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchases' },
        () => { console.log('purchases changed, refetching...'); fetchUserStats(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_stats' },
        () => { console.log('user_stats changed, refetching...'); fetchUserStats(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return { userStats, refetchStats: fetchUserStats };
};