import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface ServerSpec {
  id: string;
  name: string;
  game: string;
  status: string;
  ram: string;
  cpu: string;
  disk: string;
  location: string;
  ip?: string;
  port?: string;
  pterodactylUrl: string;
}

interface UserServersData {
  servers: ServerSpec[];
  loading: boolean;
}

export const useUserServers = (userEmail?: string) => {
  const [serversData, setServersData] = useState<UserServersData>({
    servers: [],
    loading: false
  });
  const { toast } = useToast();

  const fetchUserServers = async () => {
    if (!userEmail) return;
    
    setServersData(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch(`https://api.givrwrldservers.com/api/user/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (response.ok) {
        const data = await response.json();
        setServersData({
          servers: data.servers || [],
          loading: false
        });
      } else {
        // Fallback to mock data if API is not available
        setServersData({
          servers: [
            {
              id: 'palworld-hq',
              name: "Palworld HQ",
              game: "Palworld", 
              status: "Online",
              ram: "1GB",
              cpu: "0.5 vCPU",
              disk: "10GB",
              location: "US East",
              pterodactylUrl: "https://panel.givrwrldservers.com"
            }
          ],
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch user servers:', error);
      // Fallback to mock data
      setServersData({
        servers: [
          {
            id: 'palworld-hq',
            name: "Palworld HQ",
            game: "Palworld",
            status: "Online", 
            ram: "1GB",
            cpu: "0.5 vCPU",
            disk: "10GB",
            location: "US East",
            pterodactylUrl: "https://panel.givrwrldservers.com"
          }
        ],
        loading: false
      });
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUserServers();
    }
  }, [userEmail]);

  return { serversData, refetchServers: fetchUserServers };
};