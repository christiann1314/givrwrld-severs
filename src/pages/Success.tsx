
import React from 'react';
import { CheckCircle, Cpu, HardDrive, MapPin, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useServerStatus } from '../hooks/useServerStatus';
import { useUserServers } from '../hooks/useUserServers';

const Success = () => {
  // For demo - in production you'd get this from URL params or auth context
  const userEmail = "customer@example.com"; 
  const { serverStatus, checkServerStatus } = useServerStatus(userEmail);
  const { serversData } = useUserServers(userEmail);
  
  // Get the latest server specs from the user's servers
  const latestServer = serversData.servers[0];
  const serverSpecs = latestServer ? {
    ram: latestServer.ram,
    cpu: latestServer.cpu,
    game: latestServer.game,
    location: latestServer.location
  } : {
    ram: "1GB",
    cpu: "0.5 vCPU", 
    game: "Minecraft",
    location: "US East"
  };
  const upgradePackages = [
    {
      name: "GIVRwrld Essentials",
      price: "$6.99",
      features: ["Complete server management toolkit", "Daily automatic backups", "Discord bridge integration", "Analytics dashboard"],
      color: "emerald",
      route: "/upgrade/givrwrld-essentials"
    },
    {
      name: "Game Expansion Pack", 
      price: "$14.99",
      features: ["Cross-deploy to multiple game types", "Shared resource allocation", "Cross-game player management"],
      color: "blue",
      route: "/upgrade/game-expansion-pack"
    },
    {
      name: "Community Pack",
      price: "$4.99", 
      features: ["Connect with creators", "Creator spotlights, dev blog access", "Priority support"],
      color: "purple",
      route: "/upgrade/community-pack"
    }
  ];

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
          backgroundImage: 'url("/lovable-uploads/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              {serverStatus.loading ? (
                <Loader size={80} className="text-emerald-400 animate-spin" />
              ) : (
                <CheckCircle size={80} className="text-emerald-400" />
              )}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent">
                {serverStatus.hasServer ? "Welcome to GIVRwrld" : "Setting Up Your Server..."}
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {serverStatus.hasServer 
                ? "🎮 ⚡ Your server is live and ready! ⚡ 🎮"
                : "⏳ Your payment was successful! We're provisioning your server..."
              }
            </p>
            
            {serverStatus.hasServer && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/dashboard"
                  className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                >
                  Access Your Dashboard
                </Link>
                <a
                  href="https://panel.givrwrldservers.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                >
                  Open Game Panel
                </a>
              </div>
            )}
            
            {!serverStatus.hasServer && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={checkServerStatus}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Check Status
                </button>
                <p className="text-gray-400 text-sm">Usually takes 1-3 minutes</p>
              </div>
            )}
          </div>

          {/* Server Specs */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <HardDrive className="text-emerald-400 mb-2 mx-auto" size={24} />
                <div className="text-2xl font-bold text-white">{serverSpecs.ram}</div>
                <div className="text-gray-400 text-sm">RAM</div>
              </div>
              <div className="text-center">
                <Cpu className="text-emerald-400 mb-2 mx-auto" size={24} />
                <div className="text-2xl font-bold text-white">{serverSpecs.cpu}</div>
                <div className="text-gray-400 text-sm">CPU</div>
              </div>
              <div className="text-center">
                <div className="text-emerald-400 mb-2 mx-auto text-2xl">🎮</div>
                <div className="text-2xl font-bold text-white">{serverSpecs.game}</div>
                <div className="text-gray-400 text-sm">Game</div>
              </div>
              <div className="text-center">
                <MapPin className="text-emerald-400 mb-2 mx-auto" size={24} />
                <div className="text-2xl font-bold text-white">{serverSpecs.location}</div>
                <div className="text-gray-400 text-sm">Location</div>
              </div>
            </div>
          </div>

          {/* Upgrade Experience Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">🛠️ Upgrade Your Experience</h2>
              <p className="text-gray-300">Take your gaming server to the next level with our premium add-ons</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {upgradePackages.map((pkg, index) => (
                <div key={index} className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-emerald-400 mb-4">{pkg.price}</div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2 text-gray-300 text-sm">
                        <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to={pkg.route}
                    className={`block w-full ${getColorStyles(pkg.color)} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center`}
                  >
                    Upgrade Now
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Server Identity Footer */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-emerald-400 mb-4">🧩 Your GIVR Identity</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Server Name:</span>
                <div className="text-white font-medium">GIVRwrld-Server-MVXZ</div>
              </div>
              <div>
                <span className="text-gray-400">GIVR ID:</span>
                <div className="text-emerald-400 font-mono">GIVR-FTDB785E</div>
              </div>
              <div>
                <span className="text-gray-400">Subdomain:</span>
                <div className="text-white font-medium">mvxz.givr.world</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600/30">
              <p className="text-gray-400 text-xs">
                💡 You're now part of 2,000+ active GIVR instances
              </p>
            </div>
            
            <div className="mt-4">
              <Link
                to="/dashboard"
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                📊 Manage Your Servers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
