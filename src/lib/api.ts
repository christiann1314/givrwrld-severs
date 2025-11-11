// API Client - Replacement for Supabase Client
// Self-hosted API server client

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  public token: string | null = null; // Made public for useAuth hook

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth methods
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    const response = await this.request<{
      user: { id: string; email: string; display_name: string };
      token: string;
      refreshToken: string;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async signIn(email: string, password: string) {
    const response = await this.request<{
      user: { id: string; email: string; display_name: string };
      token: string;
      refreshToken: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async signOut() {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
    });

    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request<{
      user: { id: string; email: string; display_name: string; is_email_verified: boolean };
    }>('/api/auth/me');
  }

  // Plans
  async getPlans() {
    return this.request<{ plans: any[] }>('/api/plans');
  }

  // Orders
  async getOrders() {
    return this.request<{ orders: any[] }>('/api/orders');
  }

  // Servers
  async getServers() {
    return this.request<{ servers: any[] }>('/api/servers');
  }

  // Checkout
  async createCheckoutSession(data: {
    plan_id: string;
    item_type: string;
    term?: string;
    region?: string;
    server_name?: string;
    addons?: any[];
  }) {
    return this.request<{ sessionId: string; url: string }>('/api/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Server actions
  async startServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/start`, {
      method: 'POST',
    });
  }

  async stopServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/stop`, {
      method: 'POST',
    });
  }

  // Generic function invocation (for compatibility)
  async invoke(functionName: string, options: { body?: any } = {}) {
    // Map old Supabase function names to new API routes
    const routeMap: Record<string, string> = {
      'get-user-servers': '/api/servers',
      'get-user-orders': '/api/orders',
      'get-plans': '/api/plans',
      'create-checkout-session': '/api/checkout/create-session',
      'servers-provision': '/api/servers/provision',
    };

    const route = routeMap[functionName] || `/api/${functionName}`;
    const method = options.body ? 'POST' : 'GET';

    return this.request(route, {
      method,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
