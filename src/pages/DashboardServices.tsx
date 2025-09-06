
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUserServers } from '../hooks/useUserServers';
import { useAuth } from '../hooks/useAuth';
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
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  Gamepad2,
  Monitor
} from 'lucide-react';
import BundleBadge from '../components/BundleBadge';
import { getBundleName } from '../utils/bundleUtils';

const DashboardServices = () => {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const { user } = useAuth();
  const { serversData } = useUserServers(user?.email);

  // Get servers from Supabase data
  console.log('DashboardServices - serversData:', serversData);
  console.log('DashboardServices - user:', user);

  const getGameIcon = (game: string) => {
    const gameIcons: { [key: string]: string } = {
      'minecraft': '/lovable-uploads/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png',
      'palworld': '/lovable-uploads/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png',
      'rust': '/lovable-uploads/fb115f3f-774a-4094-a15a-b21b90860c1c.png',
    };
    
    const iconPath = gameIcons[game.toLowerCase()];
    if (iconPath) {
      return (
        <img 
          src={iconPath} 
          alt={game}
          className="w-8 h-8 object-cover rounded-md"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = '<div class="text-emerald-400"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H21V9M3 19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V11H3V19Z"/></svg></div>';
          }}
        />
      );
    }
    
    return <Gamepad2 className="text-emerald-400" size={32} />;
  };
  
  const servers = serversData.servers.map(server => ({
    id: server.id,
    name: server.name || server.server_name,
    game: server.game_type || server.game, // Use game_type from database
    status: server.status.toLowerCase(),
    players: '0/8',
    uptime: '0 hours',
    cpu: '0%', 
    ram: `0GB/${server.ram}`,
    storage: `0GB/${server.disk}`,
    location: server.location,
    ip: server.ip && server.port ? `${server.ip}:${server.port}` : 'Setting up...',
    lastBackup: 'Never',
    plan: `${server.ram} • ${server.cpu}`,
    pterodactylUrl: server.pterodactyl_url || server.pterodactylUrl, // Add pterodactyl URL
    bundle: server.bundle_id || 'none', // Add bundle info
    bundleName: getBundleName(server.bundle_id || 'none')
  }));

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
          backgroundImage: 'url("/lovable-uploads/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
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
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading your servers...</p>
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center py-12">
              <Server size={48} className="mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Servers Yet</h3>
              <p className="text-gray-400 mb-6">Deploy your first game server to get started</p>
              <Link 
                to="/dashboard/order"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Server size={20} />
                <span>Deploy New Server</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
            {servers.map((server) => (
              <div key={server.id} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                {/* Server Header */}
                <div className="p-6 border-b border-gray-600/30">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                       <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                         {getGameIcon(server.game)}
                       </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{server.name}</h3>
                        <p className="text-gray-400">{server.game} • {server.plan}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(server.status)}`}>
                            {getStatusIcon(server.status)}
                            <span className="ml-1 capitalize">{server.status}</span>
                          </span>
                          <span className="text-sm text-gray-400">{server.location}</span>
                          <BundleBadge bundleId={server.bundle} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                      <div className="text-2xl font-bold text-white mb-1">{server.players}</div>
                      <div className="text-sm text-gray-400">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{server.cpu}</div>
                      <div className="text-sm text-gray-400">CPU Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{server.ram}</div>
                      <div className="text-sm text-gray-400">RAM Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">{server.uptime}</div>
                      <div className="text-sm text-gray-400">Uptime</div>
                    </div>
                  </div>

                  {/* Server Info */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Server IP:</span>
                        <span className="text-white font-mono">{server.ip}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Storage:</span>
                        <span className="text-white">{server.storage}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last Backup:</span>
                        <span className="text-white">{server.lastBackup}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">{server.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {server.status === 'online' ? (
                      <button className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg transition-colors">
                        <PowerOff size={16} />
                        <span>Stop Server</span>
                      </button>
                    ) : (
                      <button className="flex items-center space-x-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg transition-colors">
                        <Power size={16} />
                        <span>Start Server</span>
                      </button>
                    )}
                    
                    {server.pterodactylUrl ? (
                      <a 
                        href={server.pterodactylUrl}
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
                    
                    <button className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                      <Database size={16} />
                      <span>Backup</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                      <Users size={16} />
                      <span>Players</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                      <Activity size={16} />
                      <span>Console</span>
                    </button>
                  </div>
                </div>
              </div>
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
              
              <button className="flex items-center space-x-3 p-4 bg-gray-700/30 hover:bg-gray-600/30 border border-gray-600/30 rounded-lg transition-all">
                <Calendar className="text-pink-400" size={24} />
                <div>
                  <div className="text-white font-semibold">Schedule Restart</div>
                  <div className="text-gray-400 text-sm">Automated maintenance</div>
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
