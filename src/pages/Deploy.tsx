import React from 'react';
// Header and Footer are included in App.tsx
import { Link } from 'react-router-dom';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';

const Deploy = () => {
  const gameServers = [
    {
      id: 'minecraft',
      name: 'Minecraft',
      subtitle: 'Build, explore, survive',
      image: '/images/efe9d97d-94d9-4596-b1d7-99f242301c96.png',
      features: [
        'Up to 10',
        'Ryzen 9 5950X CPU',
        '75 GB NVMe SSD'
      ],
      price: '$3.99',
      buttonText: 'Deploy Minecraft Server',
      buttonColor: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
      configPath: '/configure/minecraft'
    },
    {
      id: 'rust',
      name: 'Rust',
      subtitle: 'Survival multiplayer game',
      image: '/images/fb115f3f-774a-4094-a15a-b21b90860c1c.png',
      features: [
        'Small to large servers',
        'Plugin & mod support',
        'Ryzen 9 5950X CPU'
      ],
      price: '$8.99',
      buttonText: 'Deploy Rust Server',
      buttonColor: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500',
      configPath: '/configure/rust'
    },
    {
      id: 'palworld',
      name: 'Palworld',
      subtitle: 'Creature collection survival',
      image: '/images/814df140-2c65-4cb3-bf50-c135fd795979.png',
      features: [
        '4-6 players',
        'Ryzen 9 5950X CPU',
        'Xbox Game Pass not supported'
      ],
      price: '$11.99',
      buttonText: 'Deploy Palworld Server',
      buttonColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500',
      configPath: '/configure/palworld'
    },
    {
      id: 'ark',
      name: 'Ark: Survival Evolved',
      subtitle: 'Tame, build, survive the prehistoric world',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/2399830/header.jpg',
      features: [
        'Medium to large servers',
        'Mod & workshop support',
        'High CPU performance'
      ],
      price: '$14.99',
      buttonText: 'Deploy Ark Server',
      buttonColor: 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500',
      configPath: '/configure/ark'
    },
    {
      id: 'terraria',
      name: 'Terraria',
      subtitle: '2D sandbox adventure game',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
      features: [
        '2D sandbox adventure',
        'Mod support available',
        'Low resource usage'
      ],
      price: '$2.99',
      buttonText: 'Deploy Terraria Server',
      buttonColor: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500',
      configPath: '/configure/terraria'
    },
    {
      id: 'factorio',
      name: 'Factorio',
      subtitle: 'Automation and factory building',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/427520/header.jpg',
      features: [
        'Factory automation game',
        'Mod support available',
        'CPU intensive'
      ],
      price: '$6.99',
      buttonText: 'Deploy Factorio Server',
      buttonColor: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500',
      configPath: '/configure/factorio'
    },
    {
      id: 'mindustry',
      name: 'Mindustry',
      subtitle: 'Tower defense meets factory building',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1127400/header.jpg',
      features: [
        'Tower defense + factory',
        'Open source game',
        'Mod support available'
      ],
      price: '$3.99',
      buttonText: 'Deploy Mindustry Server',
      buttonColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
      configPath: '/configure/mindustry'
    },
    {
      id: 'rimworld',
      name: 'Rimworld',
      subtitle: 'Colony simulation and management',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/294100/header.jpg',
      features: [
        'Colony simulation',
        'Mod support available',
        'Story-driven gameplay'
      ],
      price: '$5.99',
      buttonText: 'Deploy Rimworld Server',
      buttonColor: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500',
      configPath: '/configure/rimworld'
    },
    {
      id: 'vintage-story',
      name: 'Vintage Story',
      subtitle: 'Survival crafting with realistic mechanics',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/1608230/header.jpg',
      features: [
        'Realistic survival crafting',
        'Beautiful voxel graphics',
        'Mod support available'
      ],
      price: '$7.99',
      buttonText: 'Deploy Vintage Story Server',
      buttonColor: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500',
      configPath: '/configure/vintage-story'
    },
    {
      id: 'teeworlds',
      name: 'Teeworlds',
      subtitle: '2D multiplayer shooter platformer',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/380840/header.jpg',
      features: [
        '2D multiplayer shooter',
        'Fast-paced gameplay',
        'Low resource usage'
      ],
      price: '$2.49',
      buttonText: 'Deploy Teeworlds Server',
      buttonColor: 'bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-400 hover:to-green-500',
      configPath: '/configure/teeworlds'
    },
    {
      id: 'among-us',
      name: 'Among Us',
      subtitle: 'Social deduction multiplayer game',
      image: 'https://cdn.akamai.steamstatic.com/steam/apps/945360/header.jpg',
      features: [
        'Social deduction game',
        '4-15 players',
        'Low resource usage'
      ],
      price: '$1.99',
      buttonText: 'Deploy Among Us Server',
      buttonColor: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500',
      configPath: '/configure/among-us'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Forest Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${medievalBackdrop}")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/15 via-transparent to-amber-800/10"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header is included in App.tsx */}
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
              ← Back to Home
            </Link>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Deploy Your Game Server
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            Choose your game and get started instantly. Premium hosting with 
            instant setup and 24/7 support.
          </p>
        </section>

        {/* Game Server Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {gameServers.map((server) => (
              <div key={server.id} className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/10">
                {/* Game Image - Responsive Height */}
                <div className="h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                  <img 
                    src={server.image}
                    alt={server.name}
                    className="w-full h-full object-contain bg-gray-800"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{server.name}</h3>
                    <p className="text-gray-200 text-base drop-shadow-lg">{server.subtitle}</p>
                  </div>
                </div>

                {/* Server Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {server.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-300 text-sm">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-white mb-1">
                      Starting at {server.price}
                      <span className="text-sm font-normal text-gray-400 ml-1">/month</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      2GB RAM • 75 GB SSD • Ryzen 9 5950X
                    </div>
                  </div>

                  {/* Deploy Button */}
                  <Link 
                    to={server.configPath}
                    className={`block w-full ${server.buttonColor} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center`}
                  >
                    {server.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Not sure which to choose?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              All options come with 24/7 support, instant setup, and premium hardware. You 
              can always upgrade or switch plans later.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/discord"
                className="bg-gray-700/60 hover:bg-gray-600/60 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-600/50 hover:border-emerald-500/50"
              >
                Ask Our Community
              </Link>
              <Link 
                to="/support"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* Footer is included in App.tsx */}
      </div>
    </div>
  );
};

export default Deploy;
