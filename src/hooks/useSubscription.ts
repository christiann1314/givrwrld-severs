import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  loading: boolean;
}

export const useSubscription = (userEmail?: string) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: false
  });
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!userEmail) return;
    
    setSubscriptionStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/check-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus({
          subscribed: data.subscribed,
          subscription_tier: data.subscription_tier,
          subscription_end: data.subscription_end,
          loading: false
        });
      } else {
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const createCheckout = async (planName: string, amount: number) => {
    if (!userEmail) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          plan_name: planName,
          amount: amount,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/cancel`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Stripe",
          description: "Please complete your subscription in the new tab.",
        });
        
        return data;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
      return null;
    }
  };

  const openCustomerPortal = async () => {
    if (!userEmail) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to manage your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          return_url: window.location.origin
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
        
        toast({
          title: "Opening Customer Portal",
          description: "Manage your subscription in the new tab.",
        });
      } else {
        throw new Error('Failed to open customer portal');
      }
    } catch (error) {
      toast({
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userEmail) {
      checkSubscription();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(checkSubscription, 30000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  return {
    subscriptionStatus,
    checkSubscription,
    createCheckout,
    openCustomerPortal
  };
};