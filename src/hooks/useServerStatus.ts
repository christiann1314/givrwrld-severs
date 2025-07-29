import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { API_BASE_URL } from '../config/api';

interface ServerStatus {
  hasServer: boolean;
  serverInfo?: {
    id: string;
    name: string;
    status: string;
    ip: string;
    port: string;
  };
  loading: boolean;
}

export const useServerStatus = (userEmail?: string) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    hasServer: false,
    loading: false
  });
  const { toast } = useToast();

  const checkServerStatus = async () => {
    if (!userEmail) return;
    
    setServerStatus(prev => ({ ...prev, loading: true }));
    
    try {
      // This would call your Laravel API to check Pterodactyl server status
      const response = await fetch(`${API_BASE_URL}/user/server-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setServerStatus({
          hasServer: data.has_server,
          serverInfo: data.server_info,
          loading: false
        });
        
        if (data.has_server && !serverStatus.hasServer) {
          toast({
            title: "Server Ready!",
            description: "Your game server has been provisioned and is ready to use.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to check server status:', error);
      setServerStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Poll every 10 seconds when no server is detected
  useEffect(() => {
    if (!userEmail) return;
    
    checkServerStatus();
    
    const interval = setInterval(() => {
      if (!serverStatus.hasServer) {
        checkServerStatus();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [userEmail, serverStatus.hasServer]);

  return { serverStatus, checkServerStatus };
};