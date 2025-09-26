// Environment configuration for GIVRWRLD Servers
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://mjhvkvnshnbnxojnandf.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable___jaqpjR0s2bgEMxG9gjsg_pgaezEI4',
    functionsUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://mjhvkvnshnbnxojnandf.functions.supabase.co'
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.givrwrldservers.com/api'
  },
  
  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51Qj8jR0s2bgEMxG9gjsg_pgaezEI4'
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'GIVRWRLD Servers',
    url: import.meta.env.VITE_APP_URL || 'https://givrwrldservers.com'
  }
};

export default config;
