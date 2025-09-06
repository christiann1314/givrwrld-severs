
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServerConfigurator from '../components/ServerConfigurator';
import { Link } from 'react-router-dom';

const MinecraftConfig = () => {
  const minecraftData = {
    name: 'Minecraft',
    icon: <img src="/lovable-uploads/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png" alt="Minecraft" className="w-8 h-8 rounded" />,
    basePrice: 3.99,
    features: [
      '99.9% uptime SLA',
      'Anti-DDoS Game protection',
      'NVMe SSD storage',
      'Ryzen 9 5950X CPU',
      '24/7 support and Discord community access'
    ],
    planOptions: [
      { ram: '1GB', cpu: '0.5 vCPU', disk: '10GB SSD', price: 3.99, description: 'Perfect for small groups and testing' },
      { ram: '2GB', cpu: '1 vCPU', disk: '20GB SSD', price: 6.99, description: 'Great for friends and small communities' },
      { ram: '4GB', cpu: '2 vCPU', disk: '40GB SSD', price: 13.99, description: 'Ideal for medium-sized servers with mods', recommended: true },
      { ram: '8GB', cpu: '4 vCPU', disk: '80GB SSD', price: 27.99, description: 'Perfect for large communities and heavy modpacks' },
    ]
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
