
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  User,
  Settings,
  HelpCircle,
  Users,
  ShoppingCart,
  Server,
  CreditCard,
  FileText,
  BarChart3,
  Bell,
  Calendar,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'services', label: 'My Services', icon: Server },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'affiliate', label: 'Affiliate', icon: Users },
    { id: 'order', label: 'Order Services', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const stats = [
    { label: 'Active Servers', value: '2', icon: Server, color: 'text-emerald-400' },
    { label: 'Total Spent', value: '$49.98', icon: CreditCard, color: 'text-blue-400' },
    { label: 'Support Tickets', value: '0', icon: HelpCircle, color: 'text-purple-400' },
    { label: 'Referrals', value: '3', icon: Users, color: 'text-pink-400' }
  ];

  const recentActivity = [
    { type: 'Server Started', description: 'Palworld HQ server was started', time: '2 hours ago', color: 'text-emerald-400' },
    { type: 'Payment Processed', description: 'Monthly billing for $29.99', time: '1 day ago', color: 'text-blue-400' },
    { type: 'Backup Created', description: 'Automatic backup completed', time: '2 days ago', color: 'text-purple-400' },
    { type: 'Server Upgraded', description: 'RAM upgraded to 8GB', time: '1 week ago', color: 'text-emerald-400' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Forest Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop")',
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
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Welcome back, Christian
              </span>
            </h1>
            <p className="text-gray-300">Manage your servers, billing, and account settings</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-4 sticky top-4">
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        to={item.id === 'overview' ? '/dashboard' : `/dashboard/${item.id}`}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 text-center">
                      <Icon className={`mx-auto mb-3 ${stat.color}`} size={32} />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Activity className="mr-2 text-emerald-400" size={24} />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Link
                      to="/dashboard/order"
                      className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-center"
                    >
                      🎮 Order New Server
                    </Link>
                    <Link
                      to="/dashboard/support"
                      className="block w-full bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                    >
                      💬 Create Support Ticket
                    </Link>
                    <Link
                      to="/dashboard/affiliate"
                      className="block w-full bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                    >
                      👥 View Affiliate Program
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Bell className="mr-2 text-blue-400" size={24} />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')} mt-2`}></div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{activity.type}</div>
                          <div className="text-gray-400 text-xs">{activity.description}</div>
                          <div className="text-gray-500 text-xs mt-1">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Server Status */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Server className="mr-2 text-emerald-400" size={24} />
                  Your Active Servers
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        🎮
                      </div>
                      <div>
                        <div className="text-white font-semibold">Palworld HQ</div>
                        <div className="text-gray-400 text-sm">8GB RAM • 4 vCPU • US East</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                        Online
                      </span>
                      <Link
                        to="/dashboard/services"
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        🚗
                      </div>
                      <div>
                        <div className="text-white font-semibold">FiveM RP City</div>
                        <div className="text-gray-400 text-sm">8GB RAM • 4 vCPU • US East</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        Suspended
                      </span>
                      <Link
                        to="/dashboard/services"
                        className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                      >
                        Manage
                      </Link>
                    </div>
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
