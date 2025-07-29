import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useToast } from './use-toast';

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
  const { toast } = useToast();

  const fetchBillingData = async () => {
    if (!userEmail) return;
    
    setBillingData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBillingData({
          stats: data.stats || {
            currentBalance: "$0.00",
            nextPayment: "N/A", 
            thisMonth: "$0.00",
            paymentMethods: "0"
          },
          paymentMethods: data.paymentMethods || [],
          billingHistory: data.billingHistory || [],
          upcomingBills: data.upcomingBills || [],
          loading: false
        });
      } else {
        // Fallback to mock data if API is not available
        setBillingData({
          stats: {
            currentBalance: "$0.00",
            nextPayment: "Feb 10",
            thisMonth: "$3.50", 
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
          billingHistory: [
            {
              id: 'INV-001',
              date: '2024-01-29',
              description: 'Minecraft Server - 1GB RAM',
              amount: '$3.50',
              status: 'paid',
              method: 'Visa •••• 4242'
            }
          ],
          upcomingBills: [
            {
              service: 'Minecraft Server - 1GB RAM',
              amount: '$3.50',
              dueDate: '2024-02-29',
              status: 'scheduled'
            }
          ],
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      // Fallback to mock data
      setBillingData({
        stats: {
          currentBalance: "$0.00",
          nextPayment: "Feb 10", 
          thisMonth: "$3.50",
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
        billingHistory: [
          {
            id: 'INV-001',
            date: '2024-01-29',
            description: 'Minecraft Server - 1GB RAM',
            amount: '$3.50',
            status: 'paid',
            method: 'Visa •••• 4242'
          }
        ],
        upcomingBills: [
          {
            service: 'Minecraft Server - 1GB RAM',
            amount: '$3.50',
            dueDate: '2024-02-29',
            status: 'scheduled'
          }
        ],
        loading: false
      });
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchBillingData();
    }
  }, [userEmail]);

  return { billingData, refetchBilling: fetchBillingData };
};