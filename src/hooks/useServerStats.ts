import { useEffect, useRef, useState } from "react";

type Stats = {
  state: string | null;
  is_suspended: boolean;
  cpu_percent: number | null;
  memory_bytes: number | null;
  disk_bytes: number | null;
  uptime_ms: number | null;
  network?: { rx_bytes?: number; tx_bytes?: number } | null;
  fetched_at: string;
  server_identifier: string;
};

export function useServerStats({ orderId, serverIdentifier, token, fnBase }: {
  orderId?: string;
  serverIdentifier?: string;
  token: string;                       // Supabase session access_token
  fnBase: string;                      // e.g. https://<PROJECT-REF>.functions.supabase.co
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    console.log('useServerStats - orderId:', orderId);
    console.log('useServerStats - serverIdentifier:', serverIdentifier);
    console.log('useServerStats - token:', token ? 'present' : 'missing');
    console.log('useServerStats - fnBase:', fnBase);
    
    if (!orderId && !serverIdentifier) {
      console.log('useServerStats - no orderId or serverIdentifier, returning');
      return;
    }
    if (!token) {
      console.log('useServerStats - no token, returning');
      return;
    }
    
    const params = orderId ? `order_id=${orderId}` : `server_identifier=${serverIdentifier}`;
    console.log('useServerStats - params:', params);
    
    const fetchStats = async () => {
      try {
        const url = `${fnBase}/server-stats?${params}`;
        console.log('useServerStats - fetching from URL:', url);
        
        const res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw"
          }
        });
        
        console.log('useServerStats - response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.log('useServerStats - error response:', errorText);
          throw new Error(`${res.status}: ${errorText}`);
        }
        
        const json = await res.json();
        console.log('useServerStats - received stats:', json);
        setStats(json);
        setError(null);
      } catch (e:any) {
        console.error('useServerStats - fetch error:', e);
        setError(e.message || "Failed to load stats");
      }
    };

    fetchStats();
    timer.current = window.setInterval(fetchStats, 5000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [orderId, serverIdentifier, token, fnBase]);

  return { stats, error };
}