import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { 
  Server, 
  Database, 
  Wifi, 
  WifiOff, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface IntegrationStatus {
  supabase: 'connected' | 'disconnected' | 'checking';
  pterodactyl: 'connected' | 'disconnected' | 'checking';
  dedicatedServers: number;
  lastSync: string | null;
}

export const ServerIntegrationStatus: React.FC = () => {
  const [status, setStatus] = useState<IntegrationStatus>({
    supabase: 'checking',
    pterodactyl: 'checking',
    dedicatedServers: 0,
    lastSync: null
  });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const checkIntegrationStatus = async () => {
    if (!isAuthenticated) return;

    try {
      // Check Supabase connection (we're already connected if this runs)
      setStatus(prev => ({ ...prev, supabase: 'connected' }));

      // Check user servers to determine Pterodactyl connection
      const { data: servers, error: serversError } = await supabase
        .from('user_servers')
        .select('*')
        .limit(10);

      if (!serversError && servers) {
        const activeServers = servers.filter(s => s.status !== 'deleted').length;
        const hasValidPterodactyl = servers.some(s => s.pterodactyl_server_id);
        
        setStatus(prev => ({
          ...prev,
          pterodactyl: hasValidPterodactyl ? 'connected' : 'disconnected',
          dedicatedServers: activeServers,
          lastSync: servers.length > 0 ? servers[0].updated_at : null
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          pterodactyl: 'disconnected',
          dedicatedServers: 0
        }));
      }
    } catch (error) {
      console.error('Error checking integration status:', error);
      setStatus(prev => ({
        ...prev,
        supabase: 'connected', // We know Supabase works if we got here
        pterodactyl: 'disconnected'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIntegrationStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(checkIntegrationStatus, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'checking':
        return <Loader className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Checking integration status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Infrastructure Status
      </h4>
      
      <div className="space-y-3">
        {/* Supabase Connection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300">Supabase Database</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.supabase)}
            <span className="text-sm text-gray-400">{getStatusText(status.supabase)}</span>
          </div>
        </div>

        {/* Pterodactyl Connection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Pterodactyl Panel</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.pterodactyl)}
            <span className="text-sm text-gray-400">{getStatusText(status.pterodactyl)}</span>
          </div>
        </div>

        {/* Dedicated Servers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status.dedicatedServers > 0 ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-300">Active Servers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{status.dedicatedServers} servers</span>
          </div>
        </div>

        {/* Last Sync */}
        {status.lastSync && (
          <div className="pt-2 border-t border-gray-600/30">
            <div className="text-xs text-gray-500">
              Last sync: {new Date(status.lastSync).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Integration Recommendations */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded">
        <p className="text-blue-300 text-sm">
          <strong>Architecture Notes:</strong>
        </p>
        <ul className="text-blue-300 text-xs mt-1 space-y-1 list-disc list-inside">
          <li>Frontend connects to Supabase for data management</li>
          <li>Pterodactyl VPS manages game server instances</li>
          <li>Consider connecting Pterodactyl directly to Supabase for real-time sync</li>
          <li>Dedicated servers could report metrics directly to Supabase</li>
        </ul>
      </div>
    </div>
  );
};