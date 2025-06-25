import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
  HeadphonesIcon
} from 'lucide-react';

const Dashboard = () => {
  const servers = [
    {
      id: 'palworld-hq',
      name: "Palworld HQ",
      game: "Palworld",
      status: "Online",
      specs: "8GB RAM • 4 vCPU • US East",
      icon: "🎮",
      gameIcon: "/lovable-uploads/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png" // Palworld game icon
    }
  ];

  const stats = [
    { label: "Active Servers", value: "2", icon: Server },
    { label: "Total Spent", value: "$49.98", icon: CreditCard },
    { label: "Support Tickets", value: "0", icon: LifeBuoy },
    { label: "Referrals", value: "3", icon: Users }
  ];

  const quickActions = [
    { title: "Order New Server", icon: Plus, color: "emerald", link: "/deploy" },
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
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-80 min-h-screen glass-panel-strong border-r border-gray-600/50">
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">
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
          <div className="flex-1 p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="glass-panel rounded-xl p-6 text-center">
                  <stat.icon className="mx-auto mb-3 text-emerald-400" size={32} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="glass-panel-strong rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <Activity className="text-emerald-400 mr-3" size={24} />
                  <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                </div>
                
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
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          <action.icon size={16} />
                        </div>
                        <span className="text-white font-medium">{action.title}</span>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={16} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-panel-strong rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <Clock className="text-emerald-400 mr-3" size={24} />
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{activity.title}</div>
                        <div className="text-gray-400 text-xs">{activity.description}</div>
                        <div className="text-gray-500 text-xs mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Servers */}
            <div className="mt-8 glass-panel-strong rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Server className="text-emerald-400 mr-3" size={24} />
                  <h2 className="text-xl font-bold text-white">Your Active Servers</h2>
                </div>
                <Link 
                  to="/deploy"
                  className="btn-primary text-white px-4 py-2 rounded-lg transition-all flex items-center text-sm"
                >
                  <Plus size={16} className="mr-2" />
                  Order New Server
                </Link>
              </div>
              
              <div className="space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {server.gameIcon ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-500/50 bg-gray-800/50 flex items-center justify-center">
                            <img 
                              src={server.gameIcon} 
                              alt={server.game}
                              className="w-12 h-12 object-cover rounded-md"
                              onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = `<span class="text-2xl">${server.icon}</span>`;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center text-2xl border-2 border-emerald-500/50">
                            {server.icon}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{server.name}</h3>
                        <p className="text-gray-400 text-sm">{server.game}</p>
                        <p className="text-gray-500 text-xs">{server.specs}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {server.status}
                      </span>
                      <Link 
                        to="/dashboard/services"
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                      >
                        Manage
                      </Link>
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
