
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/PaymentModal';
import UpgradePaymentModal from '../components/UpgradePaymentModal';
import {
  ArrowLeft,
  ShoppingCart,
  Server,
  Zap,
  Shield,
  Users,
  Star,
  Check,
  Plus
} from 'lucide-react';

const DashboardOrder = () => {
  const [activeTab, setActiveTab] = useState('games');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const gameServers = [
    {
      id: 'minecraft',
      name: 'Minecraft',
      subtitle: 'Build, explore, survive',
      icon: '🎮',
      image: '/lovable-uploads/efe9d97d-94d9-4596-b1d7-99f242301c96.png',
      basePrice: 6.99,
      features: ['Up to 10 players', 'Ryzen 9 5950X CPU', '75 GB NVMe SSD', 'DDoS Protection'],
      plans: [
        { ram: '2GB', price: 6.99, description: 'Perfect for small groups', recommended: false },
        { ram: '4GB', price: 12.99, description: 'Great for medium servers', recommended: true },
        { ram: '8GB', price: 24.99, description: 'Best for large communities', recommended: false }
      ]
    },
    {
      id: 'fivem',
      name: 'FiveM',
      subtitle: 'GTA roleplay server',
      icon: '🚗',
      image: '/lovable-uploads/5dcb91b3-751c-4277-8656-bd80aecfe343.png',
      basePrice: 15.99,
      features: ['Up to 32 players', 'Ryzen 9 5950X CPU', '100 GB NVMe SSD', 'Anti-cheat included'],
      plans: [
        { ram: '4GB', price: 15.99, description: 'Basic roleplay server', recommended: false },
        { ram: '8GB', price: 29.99, description: 'Enhanced performance', recommended: true },
        { ram: '16GB', price: 54.99, description: 'Premium roleplay experience', recommended: false }
      ]
    },
    {
      id: 'palworld',
      name: 'Palworld',
      subtitle: 'Creature collection survival',
      icon: '🐾',
      image: '/lovable-uploads/814df140-2c65-4cb3-bf50-c135fd795979.png',
      basePrice: 9.99,
      features: ['Up to 8 players', 'Ryzen 9 5950X CPU', '50 GB NVMe SSD', 'Mod support'],
      plans: [
        { ram: '4GB', price: 9.99, description: 'Small group adventures', recommended: false },
        { ram: '8GB', price: 18.99, description: 'Smooth multiplayer', recommended: true },
        { ram: '12GB', price: 32.99, description: 'Large world exploration', recommended: false }
      ]
    }
  ];

  const upgradePackages = [
    {
      name: "GIVRwrld Essentials",
      price: "$6.99",
      monthlyPrice: 6.99,
      features: [
        "Complete server management toolkit",
        "Daily automatic backups",
        "Discord bridge integration",
        "Analytics dashboard",
        "Priority support queue",
        "Custom domain support"
      ],
      color: "emerald",
      popular: false
    },
    {
      name: "Game Expansion Pack",
      price: "$14.99",
      monthlyPrice: 14.99,
      features: [
        "Cross-deploy to multiple game types",
        "Shared resource allocation",
        "Cross-game player management",
        "Advanced networking tools",
        "Multi-server dashboard",
        "Load balancing"
      ],
      color: "blue",
      popular: true
    },
    {
      name: "Community Pack",
      price: "$4.99",
      monthlyPrice: 4.99,
      features: [
        "Connect with creators",
        "Creator spotlights",
        "Dev blog access",
        "Priority support",
        "Community forums access",
        "Beta feature access"
      ],
      color: "purple",
      popular: false
    }
  ];

  const addOnOptions = [
    {
      key: 'backup',
      name: 'Extra Backups',
      description: 'Additional backup slots and retention',
      price: 2.99
    },
    {
      key: 'ddos',
      name: 'Enhanced DDoS Protection',
      description: 'Premium DDoS mitigation',
      price: 4.99
    },
    {
      key: 'priority',
      name: 'Priority Support',
      description: 'Faster response times',
      price: 3.99
    }
  ];

  const handleGameSelect = (game: any, plan: any) => {
    setSelectedGame({
      ...game,
      selectedPlan: plan
    });
    setShowPaymentModal(true);
  };

  const handleUpgradeSelect = (upgrade: any) => {
    setSelectedUpgrade(upgrade);
    setShowUpgradeModal(true);
  };

  const getColorStyles = (color: string) => {
    const styles = {
      emerald: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500",
      blue: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500",
      purple: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
    };
    return styles[color as keyof typeof styles] || styles.emerald;
  };

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
                Order Services
              </span>
            </h1>
            <p className="text-gray-300">Deploy new servers and upgrade your existing services</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-8">
            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'games'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Server size={20} />
              <span>Game Servers</span>
            </button>
            <button
              onClick={() => setActiveTab('upgrades')}
              className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                activeTab === 'upgrades'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Zap size={20} />
              <span>Upgrades & Add-ons</span>
            </button>
          </div>

          {activeTab === 'games' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameServers.map((game) => (
                <div key={game.id} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                  {/* Game Image */}
                  <div 
                    className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${game.image}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-1">{game.name}</h3>
                      <p className="text-gray-200 text-sm">{game.subtitle}</p>
                    </div>
                  </div>

                  {/* Game Details */}
                  <div className="p-6">
                    <div className="space-y-2 mb-4">
                      {game.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-300 text-sm">
                          <Check size={14} className="text-emerald-400 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {game.plans.map((plan, index) => (
                        <div key={index} className={`p-4 rounded-lg border transition-all duration-200 ${
                          plan.recommended 
                            ? 'border-emerald-500/50 bg-emerald-500/10' 
                            : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{plan.ram}</span>
                              {plan.recommended && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                  <Star size={10} className="mr-1" />
                                  Recommended
                                </span>
                              )}
                            </div>
                            <span className="text-lg font-bold text-white">${plan.price}/mo</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{plan.description}</p>
                          <button
                            onClick={() => handleGameSelect(game, plan)}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                          >
                            Deploy Server
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upgrades' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upgradePackages.map((upgrade, index) => (
                <div key={index} className={`bg-gray-800/60 backdrop-blur-md border rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300 relative ${
                  upgrade.popular ? 'border-emerald-500/50' : 'border-gray-600/50'
                }`}>
                  {upgrade.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{upgrade.name}</h3>
                    <div className="text-3xl font-bold text-emerald-400 mb-4">{upgrade.price}</div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {upgrade.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2 text-gray-300 text-sm">
                        <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleUpgradeSelect(upgrade)}
                    className={`w-full ${getColorStyles(upgrade.color)} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modals */}
        {showPaymentModal && selectedGame && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            gameData={{
              name: selectedGame.name,
              icon: selectedGame.icon,
              basePrice: selectedGame.basePrice,
              features: selectedGame.features
            }}
            selectedPlan={selectedGame.selectedPlan}
            billingPeriod="monthly"
            addOns={{}}
            addOnOptions={addOnOptions}
            serverName={`${selectedGame.name} Server`}
            location="US West"
          />
        )}

        {showUpgradeModal && selectedUpgrade && (
          <UpgradePaymentModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            packageData={selectedUpgrade}
          />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default DashboardOrder;
