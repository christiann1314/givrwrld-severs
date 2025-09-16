
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Security: Validate input parameters
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }
    
    // Security: Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    // Create Pterodactyl user if signup was successful
    if (!error && data.user) {
      try {
        await supabase.functions.invoke('create-pterodactyl-user', {
          body: {
            userId: data.user.id,
            email: data.user.email,
            displayName: email.split('@')[0] // Default display name
          }
        });
      } catch (pterodactylError) {
        console.error('Failed to create Pterodactyl user:', pterodactylError);
        // Don't fail the signup if Pterodactyl user creation fails
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Security: Validate input parameters
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }
    
    // Security: Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();
    
    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    signUp,
    signIn,
    signOut,
    // Legacy compatibility
    login: signIn,
    logout: signOut
  };
};
