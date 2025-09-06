
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServerConfigurator from '../components/ServerConfigurator';
import { Link } from 'react-router-dom';

const PalworldConfig = () => {
  const palworldData = {
    name: 'Palworld',
    icon: <img src="/lovable-uploads/a7264f37-06a0-45bc-8cd0-62289aa4eff8.png" alt="Palworld" className="w-8 h-8 rounded" />,
    basePrice: 11.99,
    features: [
      '99.9% uptime SLA',
      'Anti-DDoS Game protection',
      'NVMe SSD storage',
      'Ryzen 9 5950X CPU',
      '24/7 support and Discord community access'
    ],
    modpacks: [
      { key: 'vanilla', name: 'Vanilla', description: 'Pure Palworld experience', surcharge: 0 },
      { key: 'popular', name: 'Popular Mods', description: 'Curated collection of popular mods', surcharge: 3.99, recommended: true },
      { key: 'workshop', name: 'Workshop IDs', description: 'Steam Workshop mod IDs', surcharge: 2.99 },
      { key: 'custom', name: 'Custom', description: 'Paste your mod URLs', surcharge: 2.99 }
    ],
    planOptions: [
      { ram: '4GB', cpu: '2 vCPU', disk: '25GB SSD', price: 11.99, description: 'Small co-op sessions (2-4 players)' },
      { ram: '8GB', cpu: '4 vCPU', disk: '50GB SSD', price: 23.99, description: 'Medium multiplayer servers (8-16 players)', recommended: true },
      { ram: '16GB', cpu: '8 vCPU', disk: '100GB SSD', price: 47.99, description: 'Large dedicated servers (32+ players)' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Palworld Game Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/lovable-uploads/8430e76d-3327-46f6-b93f-c841c7f17de1.png")',
          backgroundSize: 'cover',
          minHeight: '100vh',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.65) 100%)'
          }}
        ></div>
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

          <ServerConfigurator gameType="palworld" gameData={palworldData} />
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default PalworldConfig;
