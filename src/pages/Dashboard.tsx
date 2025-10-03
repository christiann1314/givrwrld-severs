
import * as React from 'react';
import { Link } from 'react-router-dom';
// Footer is included in App.tsx
import { useUserServers } from '../hooks/useUserServers';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';
import { useUserStats } from '../hooks/useUserStats';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { analytics } from '../services/analytics';
import { useLiveServerData } from '../hooks/useLiveServerData';
import { useLiveBillingData } from '../hooks/useLiveBillingData';
import { 
  Server, 
  CreditCard, 
  Settings, 
  LifeBuoy, 
  Activity,
  Plus,
  ChevronRight,
  BarChart3,
  ShoppingCart,
  UserPlus,
  Users,
  HeadphonesIcon,
  Menu,
  X
} from 'lucide-react';

// Secure server icon component to prevent XSS
const ServerIcon = ({ server }: { server: any }) => {
  const [imageError, setImageError] = React.useState(false);
  
  return (
    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 border-emerald-500/50 bg-gray-800/50 flex items-center justify-center">
      {!imageError ? (
        <img 
          src={server.gameIcon} 
          alt={server.game}
          className="w-8 h-8 lg:w-12 lg:h-12 object-cover rounded-md"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xl lg:text-2xl">{server.icon}</span>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Import useAuth to get authenticated user
  const { user } = useAuth();
  const { profile } = useProfile();
  const userEmail = user?.email || null;
  const { serversData } = useUserServers(userEmail);
  const { userStats } = useUserStats(userEmail);
  const { data: liveServerData, refresh: refreshServers } = useLiveServerData(30000);
  const { data: liveBillingData, refresh: refreshBilling } = useLiveBillingData(60000);

  // Show loading state when no user email
  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading user data...</div>
      </div>
    );
  }

  // Game icon mapping based on game type
  const getGameIcon = (gameType: string) => {
    const gameIcons: { [key: string]: string } = {
    'minecraft': '/images/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png',
    'palworld': '/images/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png',
    'rust': '/images/fb115f3f-774a-4094-a15a-b21b90860c1c.png',
      // Add more game icons as needed
    };
    return gameIcons[gameType.toLowerCase()] || '/images/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png';
  };

  // Format servers data for display with live status
  const servers = serversData.servers.map(server => {
    // Get live status from live data if available
    const liveServer = liveServerData?.servers?.find(s => s.id === server.id);
    const liveStatus = liveServer?.status || server.status;
    const livePlayers = liveServer?.players || 0;
    const liveMaxPlayers = liveServer?.maxPlayers || 20;
    
    return {
      ...server,
      status: liveStatus, // Use live status
      players: livePlayers, // Use live player count
      maxPlayers: liveMaxPlayers, // Use live max players
      specs: `${server.ram} RAM • ${server.cpu} • ${server.location}`,
      icon: "🎮",
      gameIcon: getGameIcon(server.game_type || server.game) // Use game_type preferentially
    };
  });

  const quickActions = [
    { title: "Order New Server", icon: Plus, color: "emerald", link: "/dashboard/order" },
    { title: "View Billing", icon: CreditCard, color: "blue", link: "/dashboard/billing" },
    { title: "Create Support Ticket", icon: LifeBuoy, color: "gray", link: "/dashboard/support" },
    { title: "View Affiliate Program", icon: UserPlus, color: "purple", link: "/dashboard/affiliate" }
  ];

  const sidebarItems = [
    { name: "Overview", icon: BarChart3, link: "/dashboard", active: true },
    { name: "Billing", icon: CreditCard, link: "/dashboard/billing" },
    { name: "Support", icon: HeadphonesIcon, link: "/dashboard/support" },
    { name: "Affiliate", icon: Users, link: "/dashboard/affiliate" },
    { name: "Order Services", icon: ShoppingCart, link: "/dashboard/order" },
    { name: "Settings", icon: Settings, link: "/dashboard/settings" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Sword Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${medievalBackdrop}")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/15 via-transparent to-amber-800/10"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed lg:relative 
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform duration-300 ease-in-out
            w-80 lg:w-80 min-h-screen 
            glass-panel-strong border-r border-gray-600/50 
            z-50 lg:z-auto
            overflow-y-auto
          `}>
            <div className="p-4 lg:p-6">
              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="mb-6 lg:mb-8">
                <h1 className="text-xl lg:text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Welcome back, {profile?.first_name || user?.user_metadata?.first_name || 'User'}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm">Manage your servers, billing, and account settings</p>
              </div>

              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.link}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      item.active 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8 w-full">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mb-4 p-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white"
            >
              <Menu size={20} />
            </button>

            {/* Welcome Section */}
            <div className="glass-panel-strong rounded-xl p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Welcome back, {profile?.first_name || user?.user_metadata?.first_name || 'User'}!
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Manage your servers, billing, and account settings
                  </p>
                  <div className="mt-2 text-sm text-emerald-400">
                    🚀 Live Data Active - Last Updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{liveServerData?.onlineServers || servers.length}</div>
                    <div className="text-gray-400 text-sm">Online Servers</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">${liveBillingData?.totalRevenue?.toFixed(2) || userStats?.totalSpent || '0.00'}</div>
                    <div className="text-gray-400 text-sm">Total Spent</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Status */}
            <div className="glass-panel-strong rounded-xl p-6 lg:p-8 mb-6 lg:mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Server className="mr-3 text-emerald-400" size={24} />
                  Your Servers
                </h2>
                <button
                  onClick={() => refreshServers()}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Refresh Status
                </button>
              </div>
              <div className="grid gap-4">
                {servers.length > 0 ? (
                  servers.map((server) => (
                    <div key={server.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <ServerIcon server={server} />
                        <div>
                          <h3 className="text-white font-medium text-lg">{server.name}</h3>
                          <p className="text-gray-400 text-sm">{server.game} • {server.players}/{server.maxPlayers} players</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          server.status === 'online' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {server.status.toUpperCase()}
                        </span>
                        <button 
                          onClick={() => {
                            analytics.trackGamePanelAccess(user?.id || '', server.id);
                            window.open(server.pterodactylUrl || `https://panel.givrwrldservers.com/server/${server.pterodactyl_server_id}`, '_blank');
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Game Panel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-lg">No servers found</p>
                    <p className="text-gray-500 text-sm mt-2">Your servers will appear here once you order them</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="glass-panel-strong rounded-xl p-6 lg:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Activity className="mr-3 text-emerald-400" size={24} />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-600/30 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          action.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                          action.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                          action.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          <action.icon size={20} />
                        </div>
                        <span className="text-white font-medium">{action.title}</span>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Summary */}
              <div className="glass-panel-strong rounded-xl p-6 lg:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <BarChart3 className="mr-3 text-emerald-400" size={24} />
                  Account Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Total Spent</span>
                    <span className="text-white font-bold">${liveBillingData?.totalRevenue?.toFixed(2) || userStats?.totalSpent || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Online Servers</span>
                    <span className="text-white font-bold">{liveServerData?.onlineServers || servers.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Support Tickets</span>
                    <span className="text-white font-bold">{userStats?.supportTickets || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Referrals</span>
                    <span className="text-white font-bold">{userStats?.referrals || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Servers */}
            <div className="mt-6 lg:mt-8 glass-panel-strong rounded-xl p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-4">
                <div className="flex items-center">
                  <Server className="text-emerald-400 mr-3" size={20} />
                  <h2 className="text-lg lg:text-xl font-bold text-white">Your Active Servers</h2>
                </div>
                <Link 
                  to="/dashboard/order"
                  className="btn-primary text-white px-4 py-2 rounded-lg transition-all flex items-center text-sm justify-center sm:justify-start"
                >
                  <Plus size={16} className="mr-2" />
                  Order New Server
                </Link>
              </div>
              
              <div className="space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-700/30 rounded-lg gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-shrink-0">
                          <ServerIcon server={server} />
                        </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-base lg:text-lg truncate">{server.name}</h3>
                        <p className="text-gray-400 text-sm">{server.game}</p>
                        <p className="text-gray-500 text-xs truncate">{server.specs}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 justify-between sm:justify-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {server.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={server.pterodactylUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            analytics.trackGamePanelAccess(user?.id || '', server.id);
                          }}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-lg text-sm font-medium transition-colors border border-emerald-500/30"
                        >
                          Game Panel
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer is included in App.tsx */}
      </div>
    </div>
  );
};

export default Dashboard;
