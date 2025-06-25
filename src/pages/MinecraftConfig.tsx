
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServerConfigurator from '../components/ServerConfigurator';
import { Link } from 'react-router-dom';

const MinecraftConfig = () => {
  const minecraftData = {
    name: 'Minecraft',
    icon: '🎮',
    basePrice: 6.99,
    features: [
      '99.9% uptime SLA',
      'Anti-DDoS Game protection',
      'NVMe SSD storage',
      'Ryzen 9 5950X CPU',
      '24/7 support and Discord community access'
    ],
    planOptions: [
      { ram: '2GB', price: 6.99, description: 'Great for vanilla survival or light creative' },
      { ram: '4GB', price: 12.99, description: 'Perfect for modded servers and small communities' },
      { ram: '6GB', price: 18.99, description: 'Ideal for heavily modded servers' },
      { ram: '8GB', price: 24.99, description: 'Best for large communities and complex modpacks' },
      { ram: '10GB', price: 30.99, description: 'Premium performance for demanding setups' },
      { ram: '12GB', price: 36.99, description: 'Maximum performance for large-scale servers' },
      { ram: '14GB', price: 42.99, description: 'Enterprise-level hosting solution' },
      { ram: '16GB', price: 48.99, description: 'Ultimate performance for massive communities' },
    ]
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

          <ServerConfigurator gameType="minecraft" gameData={minecraftData} />
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default MinecraftConfig;
