
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
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const servers = [
    {
      id: 1,
      name: "Minecraft Creative Server",
      game: "Minecraft",
      status: "Running",
      players: "12/50",
      uptime: "99.9%",
      plan: "4GB RAM"
    },
    {
      id: 2,
      name: "FiveM Roleplay",
      game: "FiveM",
      status: "Running",
      players: "24/32",
      uptime: "99.8%",
      plan: "8GB RAM"
    }
  ];

  const quickActions = [
    { icon: Server, title: "Deploy New Server", link: "/deploy", color: "emerald" },
    { icon: CreditCard, title: "Billing & Payments", link: "/dashboard/billing", color: "blue" },
    { icon: LifeBuoy, title: "Support Center", link: "/dashboard/support", color: "purple" },
    { icon: Settings, title: "Account Settings", link: "/dashboard/settings", color: "gray" }
  ];

  const stats = [
    { label: "Total Servers", value: "2", icon: Server },
    { label: "Active Players", value: "36", icon: Users },
    { label: "Uptime", value: "99.9%", icon: Activity },
    { label: "Support Tickets", value: "1", icon: LifeBuoy }
  ];

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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Welcome back, Player!
              </span>
            </h1>
            <p className="text-gray-300">Manage your servers and account from your dashboard</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="text-emerald-400" size={24} />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Servers */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Servers</h2>
                  <Link 
                    to="/deploy"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm"
                  >
                    <Plus size={16} className="mr-2" />
                    New Server
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {servers.map((server) => (
                    <div key={server.id} className="bg-gray-700/50 border border-gray-600/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{server.name}</h3>
                          <p className="text-gray-400 text-sm">{server.game} • {server.plan}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                            {server.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Players: </span>
                          <span className="text-white">{server.players}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Uptime: </span>
                          <span className="text-white">{server.uptime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="flex items-center justify-between p-3 bg-gray-700/30 hover:bg-gray-600/30 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <action.icon className="text-emerald-400" size={20} />
                        <span className="text-white">{action.title}</span>
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={16} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Account Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan:</span>
                    <span className="text-white">Professional</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Billing:</span>
                    <span className="text-white">Jan 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance:</span>
                    <span className="text-emerald-400">$25.00</span>
                  </div>
                </div>
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
