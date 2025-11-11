// Updated useAuth hook - Uses new API instead of Supabase
import * as React from 'react';
import { api } from '@/lib/api';
import { analytics } from '@/services/analytics';

interface User {
  id: string;
  email: string;
  display_name?: string;
  is_email_verified?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for existing session on mount
  React.useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    // Validate input
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    try {
      const response = await api.signUp(sanitizedEmail, password, firstName, lastName);

      if (response.success && response.data) {
        setUser(response.data.user);
        // Track signup
        await analytics.trackUserSignup(response.data.user.id);
        return { error: null };
      } else {
        return { error: { message: response.error || 'Signup failed' } };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { error: { message: error instanceof Error ? error.message : 'Signup failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Validate input
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    try {
      const response = await api.signIn(sanitizedEmail, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        // Track login
        await analytics.trackUserLogin(response.data.user.id);
        
        // TODO: Create Pterodactyl user if needed
        // This was previously done via Edge Function
        // You may want to create an API endpoint for this
        
        return { error: null };
      } else {
        return { error: { message: response.error || 'Login failed' } };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: { message: error instanceof Error ? error.message : 'Login failed' } };
    }
  };

  const signOut = async () => {
    try {
      await api.signOut();
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: { message: error instanceof Error ? error.message : 'Logout failed' } };
    }
  };

  return {
    user,
    session: user ? { user, access_token: api['token'] } : null,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    // Legacy compatibility
    login: signIn,
    logout: signOut,
  };
};


