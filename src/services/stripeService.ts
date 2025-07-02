
const API_BASE_URL = 'https://api.givrwrldservers.com/api'; // Update this to your Laravel API URL

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
    console.log('Calling Laravel API:', `${API_BASE_URL}/create-checkout-session`);
    console.log('Request data:', data);
    
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add CORS headers if needed
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
  // Get more detailed error information
  let errorMessage = 'Failed to create checkout session';
  let errorDetails = null;
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
     } catch (parseError) {
         // If JSON parsing fails, use HTTP status text
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
     }
  
     console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorDetails
      });
  
      throw new Error(errorMessage);
    }

    return response.json();
  }
};
