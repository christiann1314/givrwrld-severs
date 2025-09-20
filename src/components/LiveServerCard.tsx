import React, { useState } from 'react';
import { useServerStats } from '../hooks/useServerStats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import {
  Power,
  PowerOff,
  Settings,
  Database,
  Users,
  Activity,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import BundleBadge from './BundleBadge';
import { getBundleName } from '../utils/bundleUtils';

interface LiveServerCardProps {
  server: {
    id: string;
    name?: string;
    server_name: string;
    game_type: string;
    status: string;
    ram: string;
    cpu: string;
    disk: string;
    location: string;
    ip?: string;
    port?: string;
    pterodactyl_url?: string;
    pterodactyl_server_id?: string;
    bundle_id?: string;
  };
  onServerAction?: (serverId: string, action: 'start' | 'stop' | 'console', serverName: string) => void;
}

const LiveServerCard: React.FC<LiveServerCardProps> = ({ server, onServerAction }) => {
  const [imageError, setImageError] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { toast } = useToast();
  
  // Use live stats hook
  const { 
    stats, 
    loading, 
    error, 
    fetchStats,
    getMemoryUsage,
    getDiskUsage,
    getCpuUsage,
    isOnline,
    uptime,
    status: liveStatus
  } = useServerStats(server.pterodactyl_server_id, true);

  const GameIcon = ({ game }: { game: string }) => {
    const getGameIcon = (game: string) => {
      const gameIcons: { [key: string]: string } = {
        'minecraft': '/lovable-uploads/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png',
        'palworld': '/lovable-uploads/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png',
        'rust': '/lovable-uploads/fb115f3f-774a-4094-a15a-b21b90860c1c.png',
      };
      return gameIcons[game.toLowerCase()];
    };
    
    const iconPath = getGameIcon(game);
    
    if (iconPath && !imageError) {
      return (
        <img 
          src={iconPath} 
          alt={game}
          className="w-8 h-8 object-cover rounded-md"
          onError={() => setImageError(true)}
        />
      );
    }
    
    return (
      <div className="text-emerald-400">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H21V9M3 19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V11H3V19Z"/>
        </svg>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    if (stats?.state === 'running') {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    switch (status) {
      case 'online': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'offline': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'suspended': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    if (stats?.state === 'running') {
      return <CheckCircle size={16} />;
    }
    switch (status) {
      case 'online': return <CheckCircle size={16} />;
      case 'offline': return <AlertCircle size={16} />;
      case 'suspended': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getDisplayStatus = () => {
    if (stats?.state) {
      return stats.state;
    }
    return server.status;
  };

  const memoryUsage = getMemoryUsage(server.ram);
  const diskUsage = getDiskUsage(server.disk);
  const cpuUsage = getCpuUsage();

  const handleRefreshStats = () => {
    setLocalLoading(true);
    fetchStats().finally(() => {
      setLocalLoading(false);
      toast({
        title: 'Stats refreshed',
        description: `Updated live data for ${server.name || server.server_name}`,
      });
    });
  };

  const handleServerAction = async (action: 'start' | 'stop' | 'console') => {
    if (onServerAction) {
      onServerAction(server.id, action, server.name || server.server_name);
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
      {/* Server Header */}
      <div className="p-6 border-b border-gray-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
              <GameIcon game={server.game_type} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{server.name || server.server_name}</h3>
              <p className="text-gray-400">{server.game_type} • {server.ram} • {server.cpu}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(getDisplayStatus())}`}>
                  {getStatusIcon(getDisplayStatus())}
                  <span className="ml-1 capitalize">{getDisplayStatus()}</span>
                  {stats && (
                    <span className="ml-1 text-emerald-400 animate-pulse">●</span>
                  )}
                </span>
                <span className="text-sm text-gray-400">{server.location}</span>
                <BundleBadge bundleId={server.bundle_id || 'none'} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefreshStats}
              disabled={loading || localLoading}
              className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh live stats"
            >
              <RefreshCw size={16} className={loading || localLoading ? 'animate-spin' : ''} />
            </button>
            <button className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Server Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">0/8</div>
            <div className="text-sm text-gray-400">Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {stats ? `${cpuUsage}%` : '0%'}
            </div>
            <div className="text-sm text-gray-400">CPU Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {stats ? `${memoryUsage.used}/${memoryUsage.total}` : `0MB/${server.ram}`}
            </div>
            <div className="text-sm text-gray-400">RAM Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {stats ? uptime : '0 minutes'}
            </div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>

        {/* Server Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Server IP:</span>
              <span className="text-white font-mono">
                {server.ip && server.port ? `${server.ip}:${server.port}` : 'Setting up...'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Storage:</span>
              <span className="text-white">
                {stats ? `${diskUsage.used}/${diskUsage.total}` : `0GB/${server.disk}`}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Last Backup:</span>
              <span className="text-white">Never</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Location:</span>
              <span className="text-white">{server.location}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {isOnline() ? (
            <button 
              onClick={() => handleServerAction('stop')}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-colors"
            >
              <PowerOff size={16} />
              <span>Stop Server</span>
            </button>
          ) : (
            <button 
              onClick={() => handleServerAction('start')}
              className="flex items-center space-x-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Power size={16} />
              <span>Start Server</span>
            </button>
          )}
          
          {server.pterodactyl_url ? (
            <a 
              href={server.pterodactyl_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Settings size={16} />
              <span>Game Panel</span>
            </a>
          ) : (
            <button className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-colors">
              <Settings size={16} />
              <span>Configure</span>
            </button>
          )}
          
          <button className="flex items-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-lg transition-colors">
            <Database size={16} />
            <span>Backup</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg transition-colors">
            <Users size={16} />
            <span>Players</span>
          </button>
          
          <button 
            onClick={() => handleServerAction('console')}
            className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            <Activity size={16} />
            <span>Console</span>
          </button>
        </div>

        {/* Live Stats Indicator */}
        {stats && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-400 flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                Live data from Pterodactyl panel
              </span>
              <span className="text-gray-400">
                Updated: {new Date(stats.fetched_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 text-sm">
              Failed to load live stats: {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveServerCard;