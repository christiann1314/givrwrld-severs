
const API_BASE_URL = 'https://your-laravel-domain.com/api'; // Replace with your actual Laravel API URL

export interface CheckoutSessionData {
  price_id?: string;
  plan_name?: string;
  amount?: number;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export const stripeService = {
  async createCheckoutSession(data: CheckoutSessionData): Promise<CheckoutSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add authorization header if using JWT/Sanctum
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        success_url: data.success_url || `${window.location.origin}/success`,
        cancel_url: data.cancel_url || `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return response.json();
  },

  // Add method to check subscription status if needed
  async checkSubscriptionStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/subscription-status`, {
      headers: {
        'Accept': 'application/json',
        // Add authorization header
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check subscription status');
    }

    return response.json();
  }
};
