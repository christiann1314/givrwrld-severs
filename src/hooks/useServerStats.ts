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
    if (!orderId && !serverIdentifier) return;
    if (!token) return;
    
    const params = orderId ? `order_id=${orderId}` : `server_identifier=${serverIdentifier}`;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${fnBase}/server-stats?${params}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw"
          }
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setStats(json);
        setError(null);
      } catch (e:any) {
        setError(e.message || "Failed to load stats");
      }
    };

    fetchStats();
    timer.current = window.setInterval(fetchStats, 5000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [orderId, serverIdentifier, token, fnBase]);

  return { stats, error };
}