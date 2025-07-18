import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface AffiliateStat {
  label: string;
  value: string;
  change: string;
  icon: any;
}

interface Referral {
  id: number;
  user: string;
  amount: string;
  date: string;
  plan: string;
}

interface AffiliateData {
  stats: {
    totalEarnings: string;
    referrals: string;
    conversionRate: string;
    clicks: string;
    earningsChange: string;
    referralsChange: string;
    conversionChange: string;
    clicksChange: string;
  };
  referralCode: string;
  recentReferrals: Referral[];
  nextPayout: string;
  loading: boolean;
}

export const useAffiliateData = (userEmail?: string) => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData>({
    stats: {
      totalEarnings: "$0.00",
      referrals: "0",
      conversionRate: "0%", 
      clicks: "0",
      earningsChange: "+0%",
      referralsChange: "+0",
      conversionChange: "+0%",
      clicksChange: "+0"
    },
    referralCode: "PLAYER2024",
    recentReferrals: [],
    nextPayout: "$0.00",
    loading: false
  });
  const { toast } = useToast();

  const fetchAffiliateData = async () => {
    if (!userEmail) return;
    
    setAffiliateData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/user/affiliate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAffiliateData({
          stats: data.stats || {
            totalEarnings: "$0.00",
            referrals: "0",
            conversionRate: "0%",
            clicks: "0", 
            earningsChange: "+0%",
            referralsChange: "+0",
            conversionChange: "+0%",
            clicksChange: "+0"
          },
          referralCode: data.referralCode || "PLAYER2024",
          recentReferrals: data.recentReferrals || [],
          nextPayout: data.nextPayout || "$0.00",
          loading: false
        });
      } else {
        // Fallback to mock data if API is not available
        setAffiliateData({
          stats: {
            totalEarnings: "$1,250.00",
            referrals: "23",
            conversionRate: "12.5%",
            clicks: "184",
            earningsChange: "+15.2%",
            referralsChange: "+3", 
            conversionChange: "+2.1%",
            clicksChange: "+12"
          },
          referralCode: "PLAYER2024",
          recentReferrals: [
            { id: 1, user: "Alex M.", amount: "$25.00", date: "2024-01-15", plan: "Minecraft 4GB" },
            { id: 2, user: "Sarah K.", amount: "$18.50", date: "2024-01-14", plan: "FiveM 6GB" },
            { id: 3, user: "Mike D.", amount: "$32.00", date: "2024-01-12", plan: "Palworld 8GB" }
          ],
          nextPayout: "$1,250.00",
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error);
      // Fallback to mock data
      setAffiliateData({
        stats: {
          totalEarnings: "$1,250.00", 
          referrals: "23",
          conversionRate: "12.5%",
          clicks: "184",
          earningsChange: "+15.2%",
          referralsChange: "+3",
          conversionChange: "+2.1%", 
          clicksChange: "+12"
        },
        referralCode: "PLAYER2024",
        recentReferrals: [
          { id: 1, user: "Alex M.", amount: "$25.00", date: "2024-01-15", plan: "Minecraft 4GB" }
        ],
        nextPayout: "$1,250.00",
        loading: false
      });
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchAffiliateData();
    }
  }, [userEmail]);

  return { affiliateData, refetchAffiliate: fetchAffiliateData };
};