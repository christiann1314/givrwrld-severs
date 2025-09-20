import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { API_BASE_URL } from '../config/api';
import { toast } from '@/components/ui/use-toast';
import { getBundleName } from '../utils/bundleUtils';

interface PaymentMethod {
  id: number;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  method: string;
}

interface UpcomingBill {
  service: string;
  amount: string;
  dueDate: string;
  status: string;
}

interface BillingStats {
  currentBalance: string;
  nextPayment: string;
  thisMonth: string;
  paymentMethods: string;
}

interface BillingData {
  stats: BillingStats;
  paymentMethods: PaymentMethod[];
  billingHistory: BillingHistoryItem[];
  upcomingBills: UpcomingBill[];
  loading: boolean;
}

export const useBillingData = (userEmail?: string) => {
  const [billingData, setBillingData] = useState<BillingData>({
    stats: {
      currentBalance: "$0.00",
      nextPayment: "N/A",
      thisMonth: "$0.00",
      paymentMethods: "0"
    },
    paymentMethods: [],
    billingHistory: [],
    upcomingBills: [],
    loading: false
  });
  // toast is now imported directly from sonner

  const fetchBillingData = async () => {
    if (!userEmail) return;
    
    setBillingData(prev => ({ ...prev, loading: true }));
    
    try {
      // Fetch real data from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setBillingData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch purchases from Supabase
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        setBillingData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Calculate stats from real data
      const totalSpent = purchases?.reduce((sum, purchase) => sum + Number(purchase.amount), 0) || 0;
      const thisMonthSpent = purchases?.filter(p => {
        const purchaseDate = new Date(p.created_at);
        const now = new Date();
        return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
      }).reduce((sum, purchase) => sum + Number(purchase.amount), 0) || 0;

      // Transform purchases to billing history
      const billingHistory = purchases?.map(purchase => {
        const bundleText = (purchase as any).bundle_id && (purchase as any).bundle_id !== 'none' 
          ? ` + ${getBundleName((purchase as any).bundle_id)}` 
          : '';
        return {
          id: purchase.id,
          date: new Date(purchase.created_at).toISOString().split('T')[0],
          description: `${purchase.plan_name}${bundleText}`,
          amount: `$${Number(purchase.amount).toFixed(2)}`,
          status: purchase.status,
          method: 'Card Payment'
        };
      }) || [];

      setBillingData({
        stats: {
          currentBalance: "$0.00",
          nextPayment: "N/A",
          thisMonth: `$${thisMonthSpent.toFixed(2)}`,
          paymentMethods: "1"
        },
        paymentMethods: [
          {
            id: 1,
            type: 'card',
            brand: 'Visa',
            last4: '4242',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true
          }
        ],
        billingHistory,
        upcomingBills: [],
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setBillingData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchBillingData();
    }
  }, [userEmail]);

  // Set up real-time subscription for purchases table
  useEffect(() => {
    if (!userEmail) return;

    const channel = supabase
      .channel('billing-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        () => {
          console.log('Billing data changed, refetching...');
          fetchBillingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail]);

  return { billingData, refetchBilling: fetchBillingData };
};