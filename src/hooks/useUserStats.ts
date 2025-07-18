import { useState, useEffect } from 'react';
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
    if (!userEmail) return;
    
    setUserStats(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/user/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats({
          activeServers: data.active_servers || 0,
          totalSpent: data.total_spent || "$0.00",
          supportTickets: data.support_tickets || 0,
          referrals: data.referrals || 0,
          loading: false
        });
      } else {
        // Fallback to default values if API is not available
        setUserStats({
          activeServers: 1,
          totalSpent: "$3.50",
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

  return { userStats, refetchStats: fetchUserStats };
};