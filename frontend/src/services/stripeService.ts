
import { api } from '@/lib/api';

export type BillingTerm = 'monthly' | 'quarterly' | 'semiannual' | 'yearly';

export interface CheckoutSessionData {
  item_type: 'game' | 'vps' | 'upgrade' | 'bundle';
  plan_id: string;
  region: string;
  server_name: string;
  modpack_id?: string;
  term: BillingTerm;
  addons?: string[];
  success_url?: string;
  cancel_url?: string;
  amount?: number;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
}

export const stripeService = {
  async createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSessionResponse> {
    console.log('Creating Stripe checkout session with API:', data);
    
    const response = await api.createCheckoutSession({
      ...data,
      success_url: data.success_url || `${window.location.origin}/success`,
      cancel_url: data.cancel_url || `${window.location.origin}/dashboard`,
    });

    if (!response.success || !response.data) {
      console.error('API error:', response.error);
      throw new Error(response.error || 'Failed to create checkout session');
    }

    // API returns { sessionId, url }
    const checkoutUrl = (response.data as any)?.url || (response.data as any)?.checkout_url;
    if (!checkoutUrl) {
      throw new Error('No checkout URL received from server');
    }

    return { checkout_url: checkoutUrl };
  }
};
