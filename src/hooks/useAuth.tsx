
import { useState, useEffect } from 'react';

// Simple authentication hook - in a real app this would connect to your auth service
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userEmail = localStorage.getItem('userEmail') || "customer@example.com";
      
      setIsAuthenticated(authStatus === 'true');
      if (authStatus === 'true') {
        setUser({ email: userEmail });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    const userEmail = localStorage.getItem('userEmail') || 'customer@example.com';
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', userEmail);
    setIsAuthenticated(true);
    setUser({ email: userEmail });
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    user
  };
};
