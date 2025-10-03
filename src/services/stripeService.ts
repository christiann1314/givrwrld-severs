
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutSessionData {
  item_type: 'game' | 'vps';
  plan_id: string;
  region: string;
  server_name: string;
  modpack_id?: string;
  term: 'monthly' | 'quarterly' | 'yearly';
  addons?: string[];
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
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

    // Function returns { url }. Normalize to { checkout_url }
    const checkoutUrl = (response as any)?.url || (response as any)?.checkout_url;
    if (!checkoutUrl) {
      throw new Error('No checkout URL received from server');
    }

    return { checkout_url: checkoutUrl };
  }
};
