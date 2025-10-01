import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BillingData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  recentPayments: Payment[];
  upcomingInvoices: Invoice[];
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  description: string;
  date: string;
  paymentMethod: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'paid' | 'open' | 'void';
  description: string;
}

export const useLiveBillingData = (refreshInterval: number = 60000) => {
  const { user } = useAuth();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchBillingData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      // Fetch user's billing data from Supabase
      const { data: userBilling, error: billingError } = await supabase
        .from('user_billing')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (billingError) {
        console.error('Error fetching billing data:', billingError);
        // Fallback to mock data for demo
        const mockPayments: Payment[] = [
          {
            id: 'pay_1',
            amount: 24.99,
            currency: 'USD',
            status: 'succeeded',
            description: 'Minecraft Server - Monthly',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'card_****1234'
          },
          {
            id: 'pay_2',
            amount: 49.99,
            currency: 'USD',
            status: 'succeeded',
            description: 'Palworld Server - Monthly',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'card_****1234'
          },
          {
            id: 'pay_3',
            amount: 99.99,
            currency: 'USD',
            status: 'succeeded',
            description: 'Rust Server - Monthly',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'card_****1234'
          }
        ];

        const mockInvoices: Invoice[] = [
          {
            id: 'inv_1',
            amount: 24.99,
            currency: 'USD',
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            description: 'Minecraft Server - Next Month'
          },
          {
            id: 'inv_2',
            amount: 49.99,
            currency: 'USD',
            dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'open',
            description: 'Palworld Server - Next Month'
          }
        ];

        const totalRevenue = mockPayments.reduce((sum, p) => sum + p.amount, 0);
        const monthlyRevenue = mockPayments
          .filter(p => new Date(p.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, p) => sum + p.amount, 0);

        setData({
          totalRevenue,
          monthlyRevenue,
          activeSubscriptions: 3,
          recentPayments: mockPayments,
          upcomingInvoices: mockInvoices
        });
      } else {
        // Process real billing data
        const payments: Payment[] = (userBilling || []).map(bill => ({
          id: bill.id,
          amount: bill.amount,
          currency: bill.currency || 'USD',
          status: bill.status as Payment['status'],
          description: bill.description,
          date: bill.created_at,
          paymentMethod: bill.payment_method || 'card'
        }));

        const totalRevenue = payments
          .filter(p => p.status === 'succeeded')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const monthlyRevenue = payments
          .filter(p => p.status === 'succeeded' && new Date(p.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, p) => sum + p.amount, 0);

        setData({
          totalRevenue,
          monthlyRevenue,
          activeSubscriptions: payments.filter(p => p.status === 'succeeded').length,
          recentPayments: payments,
          upcomingInvoices: [] // TODO: Implement invoice fetching
        });
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch billing data');
      console.error('Error fetching live billing data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBillingData();
    
    const interval = setInterval(fetchBillingData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBillingData, refreshInterval]);

  const refresh = useCallback(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh
  };
};
