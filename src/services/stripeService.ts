
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutSessionData {
  price_id?: string;
  plan_name?: string;
  amount?: number;
  ram?: string;
  cpu?: string;
  disk?: string;
  location?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export const stripeService = {
  async createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSessionResponse> {
    console.log('Creating Stripe checkout session with Supabase:', data);
    
    const { data: response, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        ...data,
        success_url: data.success_url || `${window.location.origin}/success`,
        cancel_url: data.cancel_url || `${window.location.origin}/dashboard`,
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }

    if (!response?.checkout_url) {
      throw new Error('No checkout URL received from server');
    }

    return response;
  }
};
