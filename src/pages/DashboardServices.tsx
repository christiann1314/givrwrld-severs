
import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUserServers } from '../hooks/useUserServers';
import { useAuth } from '../hooks/useAuth';
import { useServerStats } from '../hooks/useServerStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Server,
  Power,
  PowerOff,
  Settings,
  Database,
  Users,
  Activity,
  Calendar,
  Download,
  Upload,
  Trash2,
  Edit3,
  Monitor
} from 'lucide-react';
import BundleBadge from '../components/BundleBadge';
import LiveServerCard from '../components/LiveServerCard';

import ServerCardSkeleton from '../components/ServerCardSkeleton';

const DashboardServices = () => {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [serverOperations, setServerOperations] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { serversData, refetchServers } = useUserServers(user?.email);
  // toast is now imported directly from sonner

  const handleServerAction = async (serverId: string, action: 'start' | 'stop' | 'console', serverName: string) => {
    setServerOperations(prev => ({ ...prev, [serverId]: true }));
    
    try {
      if (action === 'console') {
        const { data, error } = await supabase.functions.invoke('get-server-console', {
          body: { serverId }
        });
        
        if (error) throw error;
        
        // Open console in new tab
        window.open(data.consoleUrl, '_blank');
        toast({
          title: 'Console opened',
          description: `Opened console for ${serverName}`,
        });
      } else {
        const functionName = action === 'start' ? 'start-server' : 'stop-server';
        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { serverId }
        });
        
        if (error) throw error;
        
        toast({
          title: `Server ${action} initiated`,
          description: `${serverName} is ${action === 'start' ? 'starting' : 'stopping'}...`,
        });
        
        // Refresh server data after a short delay
        setTimeout(() => refetchServers(), 2000);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} server:`, error);
      toast({
        title: `Failed to ${action} server`,
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setServerOperations(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const syncWithPterodactyl = async () => {
    setRepairing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-server-status');
      if (error) throw error;
      
      toast({
        title: 'Live data refreshed',
        description: data.message || 'Dashboard synced with Pterodactyl panel',
      });
      
      // Refresh server list immediately
      setTimeout(() => refetchServers(), 500);
    } catch (error: any) {
      toast({
        title: 'Refresh failed',
        description: error.message || 'Failed to sync with Pterodactyl',
        variant: 'destructive'
      });
    } finally {
      setRepairing(false);
    }
  };

  // Get servers from Supabase data
  console.log('DashboardServices - serversData:', serversData);
  console.log('DashboardServices - user:', user);
  const GameIcon = ({ game }: { game: string }) => {
    const [imageError, setImageError] = useState(false);
    
    const getGameIcon = (game: string) => {
      const gameIcons: { [key: string]: string } = {
        'minecraft': '/images/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png',
        'palworld': '/images/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png',
        'rust': '/images/fb115f3f-774a-4094-a15a-b21b90860c1c.png',
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
  
  const servers = serversData.servers.map(server => {
    const liveStats = server.live_stats || {};
    
    // Use live stats if available, otherwise fall back to static data
    const cpuUsage = liveStats.cpu_percent !== undefined ? `${liveStats.cpu_percent}%` : '0%';
    const ramUsage = liveStats.memory_used_mb && liveStats.memory_limit_mb 
      ? `${Math.round(liveStats.memory_used_mb / 1024 * 100) / 100}GB/${Math.round(liveStats.memory_limit_mb / 1024 * 100) / 100}GB`
      : `0GB/${server.ram}`;
    const diskUsage = liveStats.disk_used_mb
      ? `${Math.round(liveStats.disk_used_mb / 1024 * 100) / 100}GB/${server.disk}`
      : `0GB/${server.disk}`;
    const uptime = liveStats.uptime 
      ? `${Math.floor(liveStats.uptime / 3600)} hours`
      : '0 hours';
    
    return {
      id: server.id,
      name: server.name || server.server_name,
      game: server.game_type || server.game,
      status: server.status.toLowerCase(),
      players: '0/8', // TODO: Get from live stats when available
      uptime,
      cpu: cpuUsage,
      ram: ramUsage,
      storage: diskUsage,
      location: server.location,
      ip: server.ip && server.port ? `${server.ip}:${server.port}` : 'Setting up...',
      lastBackup: 'Never',
      plan: `${server.ram} • ${server.cpu}`,
      pterodactylUrl: server.pterodactyl_url || server.pterodactylUrl,
      bundle: server.bundle_id || 'none',
      bundleName: getBundleName(server.bundle_id || 'none'),
      isLiveData: !!liveStats.last_updated,
      lastUpdated: liveStats.last_updated
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'offline': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'suspended': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} />;
      case 'offline': return <AlertCircle size={16} />;
      case 'suspended': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Forest Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                My Services
              </span>
            </h1>
            <p className="text-gray-300">Manage your active servers and configurations</p>
          </div>

          {/* Servers Grid */}
          {serversData.loading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, index) => (
                <ServerCardSkeleton key={index} />
              ))}
            </div>
          ) : serversData.servers.length === 0 ? (
            <div className="text-center py-12">
              <Server size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Servers Yet</h3>
              <p className="text-gray-400 mb-6">Deploy your first game server to get started</p>
              <Link 
                to="/dashboard/order"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Server size={20} />
                <span>Create Your First Server</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
            {serversData.servers.map((server) => (
              <LiveServerCard 
                key={server.id}
                server={server}
                onServerAction={handleServerAction}
              />
            ))}
            </div>
          )}


          {/* Quick Actions */}
          <div className="mt-8 bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/dashboard/order"
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all"
              >
                <Server className="text-emerald-400" size={24} />
                <div>
                  <div className="text-white font-semibold">Deploy New Server</div>
                  <div className="text-gray-400 text-sm">Add another game server</div>
                </div>
              </Link>
              
              <button className="flex items-center space-x-3 p-4 bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/30 rounded-lg transition-all">
                <Download className="text-blue-400" size={24} />
                <div>
                  <div className="text-white font-semibold">Download Backups</div>
                  <div className="text-gray-400 text-sm">Export server data</div>
                </div>
              </button>
              
              <Link
                to="/dashboard/support"
                className="flex items-center space-x-3 p-4 bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/30 rounded-lg transition-all"
              >
                <Users className="text-purple-400" size={24} />
                <div>
                  <div className="text-white font-semibold">Get Support</div>
                  <div className="text-gray-400 text-sm">Create support ticket</div>
                </div>
              </Link>
              
              <button
                onClick={syncWithPterodactyl}
                className="flex items-center space-x-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all disabled:opacity-60"
                disabled={repairing}
              >
                <Monitor className="text-blue-400" size={24} />
                <div>
                  <div className="text-white font-semibold">{repairing ? 'Refreshing…' : 'Refresh Live Data'}</div>
                  <div className="text-gray-400 text-sm">Sync with Pterodactyl panel</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardServices;
