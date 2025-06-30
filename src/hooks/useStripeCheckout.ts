
import { useState } from 'react';
import { stripeService, CheckoutSessionData } from '../services/stripeService';
import { useToast } from './use-toast';

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = async (data: CheckoutSessionData) => {
    setIsLoading(true);
    try {
      const response = await stripeService.createCheckoutSession(data);
      
      // Redirect to Stripe Checkout in a new tab
      window.open(response.checkout_url, '_blank');
      
      toast({
        title: "Redirecting to Stripe",
        description: "Please complete your payment in the new tab.",
      });
      
      return response;
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    isLoading,
  };
};
