
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Check, Gamepad2, Zap, Settings, ArrowLeft } from 'lucide-react';

const GameExpansionPack = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: "Minecraft Server",
      description: "Full-featured game server instance"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Shared Resources", 
      description: "Intelligent resource allocation system"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Unified Management",
      description: "Single dashboard control center"
    }
  ];

  const whatYouGet = [
    "Full Minecraft server instance",
    "Cross-game player management",
    "Load balancing between servers", 
    "Shared backup systems",
    "Shared resource allocation system",
    "Unified control dashboard",
    "Cross-platform chat integration",
    "Multi-game analytics"
  ];

  const gameComparison = {
    gameServer: [
      "Multi-gaming experiences",
      "Seamless switching and scripts",
      "Multiple mods",
      "Economy and job systems",
      "Advanced integrations"
    ],
    minecraft: [
      "Creative and survival gameplay",
      "Classic progression and builds",
      "World generation and building",
      "Mini-games and challenges"
    ]
  };

  const handlePurchase = () => {
    navigate('/purchase-confirmed', { 
      state: { 
        package: 'Game Expansion Pack',
        price: '$14.99/mo',
        features: whatYouGet
      }
    });
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
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
              <Gamepad2 className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Game Expansion Pack
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Cross-deploy to multiple game types and expand your gaming empire
            </p>
          </div>

          {/* Current Setup Display */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Check className="w-5 h-5 text-emerald-400 mr-3" />
                <span className="text-white font-semibold">Your Current Setup</span>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-300">
                  <div className="font-medium">Game Server Setup</div>
                  <div className="text-gray-400">Currently active and running</div>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  $14.99
                  <span className="text-lg font-normal text-gray-400 ml-2">/month</span>
                </div>
                <div className="text-purple-400 font-semibold mb-4">Add Minecraft Server</div>
                <p className="text-gray-300">Expand your gaming portfolio with cross-platform management</p>
              </div>

              {/* Feature Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-purple-400 mb-3 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* What You Get */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-4">What You Get:</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {whatYouGet.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300 text-sm">
                      <Check size={16} className="text-emerald-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mb-8">
                <Button
                  onClick={handlePurchase}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-semibold py-4 px-8 text-lg"
                >
                  Add Minecraft Server for $14.99/mo
                </Button>
              </div>

              {/* Game Server Comparison */}
              <div className="bg-gray-700/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Game Server Comparison</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Choose the gaming experience that best matches your community's needs and watch your server thrive.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-3">Game Server</h4>
                    <ul className="space-y-2">
                      {gameComparison.gameServer.map((item, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-emerald-400 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-3">Minecraft</h4>
                    <ul className="space-y-2">
                      {gameComparison.minecraft.map((item, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default GameExpansionPack;
