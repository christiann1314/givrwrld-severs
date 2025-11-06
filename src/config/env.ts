// Environment configuration for the app
// These values are set during build time via environment variables
// Use VITE_* prefix for Vite environment variables

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://mjhvkvnshnbnxojnandf.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_FUNCTIONS_URL: import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://mjhvkvnshnbnxojnandf.functions.supabase.co',
  PANEL_URL: import.meta.env.VITE_PANEL_URL || 'https://panel.givrwrldservers.com',
  API_BASE: import.meta.env.VITE_API_BASE_URL || 'https://mjhvkvnshnbnxojnandf.functions.supabase.co'
} as const;

// Type-safe access to environment variables
export const getEnvVar = (key: keyof typeof ENV): string => {
  const value = ENV[key];
  if (!value && key === 'SUPABASE_ANON_KEY') {
    // Fallback to config if not set (for backward compatibility)
    console.warn('VITE_SUPABASE_ANON_KEY not set, using fallback');
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw';
  }
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};