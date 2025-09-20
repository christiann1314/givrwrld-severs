import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServerStats {
  state: string;
  is_suspended: boolean;
  cpu_percent: number | null;
  memory_bytes: number | null;
  disk_bytes: number | null;
  network: any | null;
  uptime_ms: number | null;
  fetched_at: string;
  server_identifier: string;
}

export const useServerStats = (pterodactylServerId: string | null, autoRefresh: boolean = true) => {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!pterodactylServerId) return;

    setLoading(true);
    setError(null);

    try {
      // Use GET with query parameters instead of POST with body
      const response = await fetch(
        `${window.location.origin}/functions/v1/get-server-stats?server_identifier=${encodeURIComponent(pterodactylServerId)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaHZrdm5zaG5ibnhvam5hbmRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTU0MTksImV4cCI6MjA2OTM5MTQxOX0.GxI1VdNCKD0nxJ3Tlkvy63PHEqoiPlJUlfLMrSoM6Tw',
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching server stats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch server stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pterodactylServerId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh && pterodactylServerId) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh, pterodactylServerId]);

  // Helper functions to format the data
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (milliseconds: number): string => {
    if (milliseconds === 0) return '0 minutes';
    
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMemoryUsage = (serverRamLimit?: string): { used: string; total: string; percentage: number } => {
    if (!stats?.memory_bytes) return { used: '0 MB', total: serverRamLimit || '0 MB', percentage: 0 };
    
    const usedMB = Math.round(stats.memory_bytes / 1024 / 1024);
    
    // Extract total MB from server limit (e.g., "1GB" -> 1024)
    let totalMB = 0;
    if (serverRamLimit) {
      const match = serverRamLimit.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        totalMB = unit === 'GB' ? value * 1024 : value;
      }
    }
    
    const percentage = totalMB > 0 ? (usedMB / totalMB) * 100 : 0;
    
    return {
      used: `${usedMB} MB`,
      total: serverRamLimit || '0 MB', 
      percentage: Math.round(percentage)
    };
  };

  const getDiskUsage = (serverDiskLimit?: string): { used: string; total: string; percentage: number } => {
    if (!stats?.disk_bytes) return { used: '0 MB', total: serverDiskLimit || '0 MB', percentage: 0 };
    
    const usedMB = Math.round(stats.disk_bytes / 1024 / 1024);
    
    // Extract total MB from server limit (e.g., "10GB SSD" -> 10240)
    let totalMB = 0;
    if (serverDiskLimit) {
      const match = serverDiskLimit.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        totalMB = unit === 'GB' ? value * 1024 : value;
      }
    }
    
    const percentage = totalMB > 0 ? (usedMB / totalMB) * 100 : 0;
    
    return {
      used: `${usedMB} MB`,
      total: serverDiskLimit || '0 MB',
      percentage: Math.round(percentage)
    };
  };

  const getCpuUsage = (): number => {
    if (!stats?.cpu_percent) return 0;
    return Math.round(stats.cpu_percent);
  };

  const isOnline = (): boolean => {
    return stats?.state === 'running';
  };

  return {
    stats,
    loading,
    error,
    fetchStats,
    // Helper methods
    formatBytes,
    formatUptime,
    getMemoryUsage,
    getDiskUsage, 
    getCpuUsage,
    isOnline,
    // Quick access to common data
    uptime: stats?.uptime_ms ? formatUptime(stats.uptime_ms) : '0 minutes',
    status: stats?.state || 'unknown'
  };
};