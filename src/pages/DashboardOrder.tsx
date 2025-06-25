
import React from 'react';
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
  ChevronLeft
} from 'lucide-react';

const DashboardOrder = () => {
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
      price: '$6.50',
      buttonColor: 'blue' as const
    },
    {
      game: 'palworld',
      icon: '🎮',
      title: 'Palworld',
      description: 'Creature collection survival',
      price: '$15.40',
      buttonColor: 'emerald' as const
    }
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
                  Game Servers
                </span>
              </h2>
              <p className="text-gray-300 text-lg">
                Deploy new servers and upgrade your existing services
              </p>
            </div>

            {/* Server Selection Grid */}
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
