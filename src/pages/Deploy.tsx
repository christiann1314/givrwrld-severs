
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Deploy = () => {
  const gameServers = [
    {
      id: 'minecraft',
      name: 'Minecraft',
      subtitle: 'Build, explore, survive',
      image: '/lovable-uploads/15be664c-b249-4de1-bac0-3bb10b545fab.png',
      features: [
        'Up to 10',
        'Ryzen 9 5950X CPU',
        '75 GB NVMe SSD'
      ],
      price: '$6.99',
      buttonText: 'Deploy Minecraft Server',
      buttonColor: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500',
      configPath: '/configure/minecraft'
    },
    {
      id: 'fivem',
      name: 'FiveM',
      subtitle: 'GTA roleplay server',
      image: '/lovable-uploads/15be664c-b249-4de1-bac0-3bb10b545fab.png',
      features: [
        'Low pop',
        '1x server & 8-pack Protected',
        'Ryzen 9 5950X CPU'
      ],
      price: '$6.5',
      buttonText: 'Deploy FiveM Server',
      buttonColor: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500',
      configPath: '/configure/fivem'
    },
    {
      id: 'palworld',
      name: 'Palworld',
      subtitle: 'Creature collection survival',
      image: '/lovable-uploads/15be664c-b249-4de1-bac0-3bb10b545fab.png',
      features: [
        '4-6 players',
        'Ryzen 9 5950X CPU',
        'Xbox Game Pass not supported'
      ],
      price: '$15.4',
      buttonText: 'Deploy Palworld Server',
      buttonColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500',
      configPath: '/configure/palworld'
    }
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
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {gameServers.map((server) => (
              <div key={server.id} className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/10">
                {/* Game Image */}
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-2xl font-bold text-white mb-1">{server.name}</h3>
                    <p className="text-gray-300 text-sm">{server.subtitle}</p>
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

        <Footer />
      </div>
    </div>
  );
};

export default Deploy;
