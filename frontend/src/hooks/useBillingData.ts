 import { useState, useEffect, useCallback } from 'react';
 import { api } from '@/lib/api';
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

   const fetchBillingData = useCallback(async () => {
    if (!userEmail) return;
    
    setBillingData(prev => ({ ...prev, loading: true }));
    
    try {
       const response = await api.getOrders();
       
       if (!response.success || !response.data) {
        setBillingData(prev => ({ ...prev, loading: false }));
        return;
      }

       const orders = response.data.orders || [];

      // Calculate stats from real data
       const thisMonthSpent = orders.filter((o: any) => {
         const orderDate = new Date(o.created_at);
        const now = new Date();
         return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
       }).reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

      // Transform purchases to billing history
       const billingHistory = orders.map((order: any) => {
         const bundleText = order.bundle_id && order.bundle_id !== 'none' 
           ? ` + ${getBundleName(order.bundle_id)}` 
          : '';
        return {
           id: order.id,
           date: new Date(order.created_at).toISOString().split('T')[0],
           description: `${order.server_name} - ${order.plan_id}${bundleText}`,
           amount: `$${Number(order.total_amount || 0).toFixed(2)}`,
           status: order.status,
          method: 'Card Payment'
        };
       });

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
   }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchBillingData();
    }
   }, [userEmail, fetchBillingData]);

  return { billingData, refetchBilling: fetchBillingData };
};