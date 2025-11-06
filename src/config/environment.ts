// Environment configuration for GIVRWRLD Servers
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://mjhvkvnshnbnxojnandf.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw',
    functionsUrl: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://mjhvkvnshnbnxojnandf.functions.supabase.co'
  },
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.givrwrldservers.com/api'
  },
  
  // Stripe Configuration
  stripe: {
    // IMPORTANT: Use LIVE key in production (pk_live_...)
    // Set VITE_STRIPE_PUBLISHABLE_KEY environment variable
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51RZPGzB3VffY65l6PSOmZdnbQsnPQmXdaHvXkPwzq2Ieq5CvzY9PlQaxf97C8PMLj8YfhQtW9AUrK4rofbj7ZXTY004OFKWBqh'
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'GIVRWRLD Servers',
    url: import.meta.env.VITE_APP_URL || 'https://givrwrldservers.com'
  },
  
  // Pterodactyl Configuration
  pterodactyl: {
    panelUrl: import.meta.env.VITE_PANEL_URL || 'https://panel.givrwrldservers.com',
    clientKey: import.meta.env.VITE_PTERO_CLIENT_KEY || ''
  }
};

export default config;
