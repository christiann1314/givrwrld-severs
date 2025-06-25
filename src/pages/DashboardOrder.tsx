
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServerCard from '../components/ServerCard';
import { Link } from 'react-router-dom';
import { 
  Server, 
  CreditCard, 
  Settings, 
  LifeBuoy, 
  Users,
  BarChart3,
  ShoppingCart,
  UserPlus,
  HeadphonesIcon,
  ChevronLeft,
  Zap,
  Check
} from 'lucide-react';

const DashboardOrder = () => {
  const [activeTab, setActiveTab] = useState('servers');

  const sidebarItems = [
    { name: "Overview", icon: BarChart3, link: "/dashboard", active: false },
    { name: "My Services", icon: Server, link: "/dashboard/services" },
    { name: "Billing", icon: CreditCard, link: "/dashboard/billing" },
    { name: "Support", icon: HeadphonesIcon, link: "/dashboard/support" },
    { name: "Affiliate", icon: Users, link: "/dashboard/affiliate" },
    { name: "Order Services", icon: ShoppingCart, link: "/dashboard/order", active: true },
    { name: "Settings", icon: Settings, link: "/dashboard/settings" }
  ];

  const gameServers = [
    {
      game: 'minecraft',
      icon: '⛏️',
      title: 'Minecraft',
      description: 'Build, explore, survive',
      price: '$6.99',
      buttonColor: 'emerald' as const
    },
    {
      game: 'fivem',
      icon: '🚗',
      title: 'FiveM',
      description: 'GTA roleplay server',
      price: '$15.99',
      buttonColor: 'blue' as const
    },
    {
      game: 'palworld',
      icon: '🎮',
      title: 'Palworld',
      description: 'Creature collection survival',
      price: '$9.99',
      buttonColor: 'emerald' as const
    }
  ];

  const upgradePackages = [
    {
      id: 'givrwrld-essentials',
      name: 'GIVRwrld Essentials',
      price: '$6.99',
      description: 'per month',
      features: [
        'Complete server management toolkit',
        'Daily automatic backups',
        'Discord bridge integration',
        'Analytics dashboard',
        'Priority support queue',
        'Custom domain support'
      ],
      buttonColor: 'emerald',
      link: '/upgrade/givrwrld-essentials'
    },
    {
      id: 'game-expansion',
      name: 'Game Expansion Pack',
      price: '$14.99',
      description: 'per month',
      features: [
        'Cross-deploy to multiple game types',
        'Shared resource allocation',
        'Cross-game player management',
        'Advanced networking tools',
        'Multi-server dashboard',
        'Load balancing'
      ],
      buttonColor: 'blue',
      popular: true,
      link: '/upgrade/game-expansion-pack'
    },
    {
      id: 'community-pack',
      name: 'Community Pack',
      price: '$4.99',
      description: 'per month',
      features: [
        'Connect with creators',
        'Creator spotlights',
        'Dev blog access',
        'Priority support',
        'Community forums access',
        'Beta feature access'
      ],
      buttonColor: 'purple',
      link: '/upgrade/community-pack'
    }
  ];

  const tabs = [
    { id: 'servers', label: 'Game Servers', icon: Server },
    { id: 'upgrades', label: 'Upgrades & Add-ons', icon: Zap }
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
                <Link 
                  to="/dashboard"
                  className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Order Services
                  </span>
                </h1>
                <p className="text-gray-400 text-sm">Deploy new servers and upgrade your existing services</p>
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
            {/* Header Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Order Services
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Deploy new servers and upgrade your existing services
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex space-x-4 border-b border-gray-600/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                      activeTab === tab.id
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Servers Tab */}
            {activeTab === 'servers' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {gameServers.map((server) => (
                  <ServerCard
                    key={server.game}
                    game={server.game}
                    icon={server.icon}
                    title={server.title}
                    description={server.description}
                    price={server.price}
                    buttonColor={server.buttonColor}
                  />
                ))}
              </div>
            )}

            {/* Upgrades & Add-ons Tab */}
            {activeTab === 'upgrades' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {upgradePackages.map((pkg) => (
                  <div key={pkg.id} className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/10 relative">
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-emerald-400 mb-1">{pkg.price}</div>
                      <div className="text-gray-400 text-sm">{pkg.description}</div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-300 text-sm">
                          <Check size={16} className="text-emerald-400 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link 
                      to={pkg.link}
                      className={`block w-full text-center font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                        pkg.buttonColor === 'emerald' 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/25'
                          : pkg.buttonColor === 'blue'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-blue-500/25'
                          : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-purple-500/25'
                      }`}
                    >
                      Add to Cart
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Help Section */}
            <div className="glass-panel-strong rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Need Help Choosing?</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                All our game servers come with premium hardware, instant setup, and 24/7 support. 
                You can always upgrade or modify your plan later.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/discord"
                  className="bg-gray-700/60 hover:bg-gray-600/60 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-600/50 hover:border-emerald-500/50"
                >
                  Join Our Discord
                </Link>
                <Link 
                  to="/dashboard/support"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardOrder;
