import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
import { Switch } from '../components/ui/switch';
import UpgradePaymentModal from '../components/UpgradePaymentModal';

const DashboardOrder = () => {
  const [activeTab, setActiveTab] = useState('servers');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

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
      name: 'Minecraft',
      description: 'Build, explore, survive',
      image: '/lovable-uploads/4dfe2f3f-d550-4d2c-a88c-6e072277df93.png',
      configPath: '/configure/minecraft',
      features: [
        'Up to 10 players',
        'Ryzen 9 5950X CPU',
        '75 GB NVMe SSD',
        'DDoS Protection'
      ],
      plans: [
        {
          ram: '2GB',
          price: '$6.99/mo',
          description: 'Perfect for small groups',
          recommended: false
        },
        {
          ram: '4GB',
          price: '$12.99/mo',
          description: 'Great for medium servers',
          recommended: true
        },
        {
          ram: '8GB',
          price: '$24.99/mo',
          description: 'Best for large communities',
          recommended: false
        }
      ]
    },
    {
      name: 'Rust',
      description: 'Survival multiplayer game',
      image: '/lovable-uploads/rust-icon.png',
      configPath: '/configure/rust',
      features: [
        'Up to 32 players',
        'Ryzen 9 5950X CPU',
        '100 GB NVMe SSD',
        'Anti-cheat included'
      ],
      plans: [
        {
          ram: '4GB',
          price: '$15.99/mo',
          description: 'Basic roleplay server',
          recommended: false
        },
        {
          ram: '8GB',
          price: '$29.99/mo',
          description: 'Enhanced performance',
          recommended: true
        },
        {
          ram: '16GB',
          price: '$54.99/mo',
          description: 'Premium roleplay experience',
          recommended: false
        }
      ]
    },
    {
      name: 'Palworld',
      description: 'Creature collection survival',
      image: '/lovable-uploads/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png',
      configPath: '/configure/palworld',
      features: [
        'Up to 8 players',
        'Ryzen 9 5950X CPU',
        '50 GB NVMe SSD',
        'Mod support'
      ],
      plans: [
        {
          ram: '4GB',
          price: '$9.99/mo',
          description: 'Small group adventures',
          recommended: false
        },
        {
          ram: '8GB',
          price: '$18.99/mo',
          description: 'Smooth multiplayer',
          recommended: true
        },
        {
          ram: '12GB',
          price: '$32.99/mo',
          description: 'Large world exploration',
          recommended: false
        }
      ]
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

  const optionalAddons = [
    {
      id: 'automatic-backups',
      name: 'Automatic Backups',
      price: '$2.99/month',
      description: 'Daily backups with 7-day retention to prevent data loss.',
      enabled: false,
      features: [
        'Daily automatic backups',
        '7-day retention period',
        'One-click restore',
        'Data loss prevention'
      ]
    },
    {
      id: 'discord-integration',
      name: 'Discord Integration',
      price: '$1.49/month',
      description: 'Sync server status and chat with your Discord.',
      enabled: false,
      features: [
        'Server status sync',
        'Chat bridge',
        'Player notifications',
        'Admin commands'
      ]
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      price: '$3.99/month',
      description: 'Real-time player activity, mod/resource usage, and crash stats.',
      enabled: false,
      features: [
        'Real-time player tracking',
        'Resource usage monitoring',
        'Crash reporting',
        'Performance insights'
      ]
    },
    {
      id: 'additional-ssd',
      name: 'Additional SSD Storage',
      price: '$2.50/month',
      description: 'Expand your NVMe storage incrementally for more world files or modpacks. (+50 GB per addon)',
      enabled: false,
      features: [
        '+50 GB NVMe storage',
        'High-speed access',
        'Expandable storage',
        'World file backup'
      ]
    }
  ];

  const tabs = [
    { id: 'servers', label: 'Game Servers', icon: Server },
    { id: 'upgrades', label: 'Upgrades & Add-ons', icon: Zap }
  ];

  const handlePurchaseAddon = (addon) => {
    setSelectedPackage({
      name: addon.name,
      price: addon.price,
      features: addon.features
    });
    setPaymentModalOpen(true);
  };

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
              <div className="grid lg:grid-cols-3 gap-8 mb-12">
                {gameServers.map((server) => (
                  <div key={server.name} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl overflow-hidden shadow-xl hover:border-emerald-500/50 transition-all duration-300">
                    {/* Server Header */}
                    <div 
                      className="h-48 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${server.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{server.name}</h3>
                        <p className="text-gray-300 text-sm">{server.description}</p>
                      </div>
                    </div>

                    {/* Server Features */}
                    <div className="p-6">
                      <div className="space-y-2 mb-6">
                        {server.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-300 text-sm">
                            <Check size={16} className="text-emerald-400 mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Plans */}
                      <div className="space-y-4">
                        {server.plans.map((plan, index) => (
                          <div key={index} className={`border rounded-lg p-4 transition-all duration-200 ${
                            plan.recommended 
                              ? 'border-emerald-500/70 bg-emerald-500/10' 
                              : 'border-gray-600/50 bg-gray-700/30'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white">{plan.ram}</span>
                                {plan.recommended && (
                                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-white">{plan.price}</span>
                            </div>
                            <p className="text-gray-400 text-xs mb-3">{plan.description}</p>
                            <Link 
                              to={server.configPath}
                              className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-center"
                            >
                              Deploy Server
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upgrades & Add-ons Tab */}
            {activeTab === 'upgrades' && (
              <div className="space-y-8 mb-12">
                {/* Upgrade Packages */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Upgrade Packages</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          Add Upgrade
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Add-ons */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Optional Add-ons</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {optionalAddons.map((addon) => (
                      <div key={addon.id} className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-white mb-2">{addon.name}</h4>
                            <p className="text-gray-300 text-sm mb-3">{addon.description}</p>
                            <div className="text-emerald-400 font-bold text-lg mb-4">{addon.price}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                          {addon.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-gray-300 text-sm">
                              <Check size={14} className="text-emerald-400 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handlePurchaseAddon(addon)}
                          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300"
                        >
                          Purchase Add-on
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <UpgradePaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPackage(null);
          }}
          packageData={selectedPackage}
        />
      )}
    </div>
  );
};

export default DashboardOrder;
