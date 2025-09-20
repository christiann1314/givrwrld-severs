import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServerResources {
  memory_bytes: number;
  cpu_absolute: number;
  disk_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  uptime: number;
}

interface ServerLimits {
  memory: number;
  swap: number;
  disk: number;
  io: number;
  cpu: number;
}

interface ServerStats {
  server_id: string;
  status: string;
  is_suspended: boolean;
  current_state: string;
  resources: ServerResources;
  limits: ServerLimits;
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  name: string;
  description: string;
  uuid: string;
  identifier: string;
  last_updated: string;
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
      const { data, error: functionError } = await supabase.functions.invoke('get-server-stats', {
        body: { server_id: pterodactylServerId }
      });

      if (functionError) {
        throw functionError;
      }

      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch server stats');
      }
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

  const formatUptime = (seconds: number): string => {
    if (seconds === 0) return '0 minutes';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMemoryUsage = (): { used: string; total: string; percentage: number } => {
    if (!stats) return { used: '0 MB', total: '0 MB', percentage: 0 };
    
    const usedMB = Math.round(stats.resources.memory_bytes / 1024 / 1024);
    const totalMB = stats.limits.memory;
    const percentage = totalMB > 0 ? (usedMB / totalMB) * 100 : 0;
    
    return {
      used: `${usedMB} MB`,
      total: `${totalMB} MB`, 
      percentage: Math.round(percentage)
    };
  };

  const getDiskUsage = (): { used: string; total: string; percentage: number } => {
    if (!stats) return { used: '0 MB', total: '0 MB', percentage: 0 };
    
    const usedMB = Math.round(stats.resources.disk_bytes / 1024 / 1024);
    const totalMB = stats.limits.disk;
    const percentage = totalMB > 0 ? (usedMB / totalMB) * 100 : 0;
    
    return {
      used: `${usedMB} MB`,
      total: `${totalMB} MB`,
      percentage: Math.round(percentage)
    };
  };

  const getCpuUsage = (): number => {
    if (!stats) return 0;
    const percentage = stats.limits.cpu > 0 ? (stats.resources.cpu_absolute / stats.limits.cpu) * 100 : 0;
    return Math.round(percentage);
  };

  const isOnline = (): boolean => {
    return stats?.current_state === 'running';
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
    uptime: stats ? formatUptime(stats.resources.uptime / 1000) : '0 minutes',
    status: stats?.current_state || 'unknown'
  };
};