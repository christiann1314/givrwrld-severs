
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServerConfigurator from '../components/ServerConfigurator';
import { Link } from 'react-router-dom';

const RustConfig = () => {
  const rustData = {
    name: 'Rust',
    icon: <img src="/lovable-uploads/fb115f3f-774a-4094-a15a-b21b90860c1c.png" alt="Rust" className="w-8 h-8 rounded" />,
    basePrice: 8.50,
    features: [
      '99.9% uptime SLA',
      'Anti-DDoS Game protection',
      'NVMe SSD storage',
      'Ryzen 9 5950X CPU',
      '24/7 support and Discord community access'
    ],
    planOptions: [
      { ram: '3GB', cpu: '2 vCPU', disk: '20GB SSD', price: 8.50, description: 'Small survival servers, 50-100 players' },
      { ram: '6GB', cpu: '3 vCPU', disk: '40GB SSD', price: 16.50, description: 'Medium servers with plugins, 100-200 players' },
      { ram: '8GB', cpu: '4 vCPU', disk: '60GB SSD', price: 24.50, description: 'Large servers with mods, 200-300 players', recommended: true },
      { ram: '12GB', cpu: '6 vCPU', disk: '80GB SSD', price: 36.50, description: 'High-pop servers with extensive mods, 300+ players' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Forest Background with Rust Logo */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/lovable-uploads/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20"></div>
        
        {/* Rust Logo Background Element */}
        <div 
          className="absolute inset-0 opacity-10 bg-no-repeat bg-center bg-contain"
          style={{
            backgroundImage: 'url("/lovable-uploads/fb115f3f-774a-4094-a15a-b21b90860c1c.png")',
            backgroundSize: '40%',
            filter: 'blur(1px)',
          }}
        ></div>
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gray-900/40"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link to="/deploy" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
              ← Back to Servers
            </Link>
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Configure Your Server
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Customize your server settings to match your gaming needs
            </p>
          </div>

          <ServerConfigurator gameType="rust" gameData={rustData} />
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default RustConfig;
