
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUserServers } from '../hooks/useUserServers';
import { useUserStats } from '../hooks/useUserStats';
import { 
  Server, 
  CreditCard, 
  Settings, 
  LifeBuoy, 
  TrendingUp, 
  Users,
  Activity,
  Clock,
  Plus,
  ChevronRight,
  BarChart3,
  ShoppingCart,
  UserPlus,
  HeadphonesIcon,
  Menu,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // For demo - in production you'd get this from auth context
  const userEmail = "customer@example.com";
  const { serversData } = useUserServers(userEmail);
  const { userStats } = useUserStats(userEmail);

  // Format servers data for display
  const servers = serversData.servers.map(server => ({
    ...server,
    specs: `${server.ram} RAM • ${server.cpu} • ${server.location}`,
    icon: "🎮",
    gameIcon: "/lovable-uploads/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png"
  }));

  const stats = [
    { label: "Active Servers", value: userStats.activeServers.toString(), icon: Server },
    { label: "Total Spent", value: userStats.totalSpent, icon: CreditCard },
    { label: "Support Tickets", value: userStats.supportTickets.toString(), icon: LifeBuoy },
    { label: "Referrals", value: userStats.referrals.toString(), icon: Users }
  ];

  const quickActions = [
    { title: "Order New Server", icon: Plus, color: "emerald", link: "/dashboard/order" },
    { title: "Create Support Ticket", icon: LifeBuoy, color: "gray", link: "/dashboard/support" },
    { title: "View Affiliate Program", icon: UserPlus, color: "purple", link: "/dashboard/affiliate" }
  ];

  const recentActivity = [
    { 
      title: "Server Started", 
      description: "Palworld HQ server was started", 
      time: "2 hours ago",
      type: "success"
    },
    { 
      title: "Payment Processed", 
      description: "Monthly billing for $24.99", 
      time: "1 day ago",
      type: "info"
    },
    { 
      title: "Backup Created", 
      description: "Automatic backup completed", 
      time: "2 days ago",
      type: "success"
    },
    { 
      title: "Server Upgraded", 
      description: "RAM upgraded to 8GB", 
      time: "1 week ago",
      type: "info"
    }
  ];

  const sidebarItems = [
    { name: "Overview", icon: BarChart3, link: "/dashboard", active: true },
    { name: "My Services", icon: Server, link: "/dashboard/services" },
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
          backgroundImage: 'url("/lovable-uploads/6da1a729-a66c-4bed-bc67-af6d75baa23a.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-cyan-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
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
                    Welcome back, Christian
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="glass-panel rounded-xl p-4 lg:p-6 text-center">
                  <stat.icon className="mx-auto mb-2 lg:mb-3 text-emerald-400" size={24} />
                  <div className="text-lg lg:text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-xs lg:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Quick Actions */}
              <div className="glass-panel-strong rounded-xl p-4 lg:p-6">
                <div className="flex items-center mb-4 lg:mb-6">
                  <Activity className="text-emerald-400 mr-3" size={20} />
                  <h2 className="text-lg lg:text-xl font-bold text-white">Quick Actions</h2>
                </div>
                
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="flex items-center justify-between p-3 lg:p-4 bg-gray-700/30 hover:bg-gray-600/30 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          action.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                          action.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          <action.icon size={16} />
                        </div>
                        <span className="text-white font-medium text-sm lg:text-base">{action.title}</span>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={16} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-panel-strong rounded-xl p-4 lg:p-6">
                <div className="flex items-center mb-4 lg:mb-6">
                  <Clock className="text-emerald-400 mr-3" size={20} />
                  <h2 className="text-lg lg:text-xl font-bold text-white">Recent Activity</h2>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{activity.title}</div>
                        <div className="text-gray-400 text-xs truncate">{activity.description}</div>
                        <div className="text-gray-500 text-xs mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
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
                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 border-emerald-500/50 bg-gray-800/50 flex items-center justify-center">
                          <img 
                            src={server.gameIcon} 
                            alt={server.game}
                            className="w-8 h-8 lg:w-12 lg:h-12 object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<span class="text-xl lg:text-2xl">${server.icon}</span>`;
                            }}
                          />
                        </div>
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
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-lg text-sm font-medium transition-colors border border-emerald-500/30"
                        >
                          Game Panel
                        </a>
                        <Link 
                          to="/dashboard/services"
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
