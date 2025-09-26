
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServerConfigurator from '../components/ServerConfigurator';
import { Link } from 'react-router-dom';
import rustWallpaper from '../assets/rust-wallpaper-hd.jpg';

const RustConfig = () => {
  const rustData = {
    name: 'Rust',
    icon: <img src="/images/fb115f3f-774a-4094-a15a-b21b90860c1c.png" alt="Rust" className="w-8 h-8 rounded" />,
    basePrice: 8.99,
    features: [
      '99.9% uptime SLA',
      'Anti-DDoS Game protection',
      'NVMe SSD storage',
      'Ryzen 9 5950X CPU',
      '24/7 support and Discord community access'
    ],
    serverTypes: [
      { key: 'vanilla', name: 'Vanilla Rust', description: 'Official Rust server without modifications', surcharge: 0, recommended: true },
      { key: 'umod', name: 'uMod/Oxide', description: 'Plugin framework for enhanced gameplay', surcharge: 0 }
    ],
    modpacks: [
      { key: 'vanilla', name: 'Vanilla', description: 'Pure Rust experience', surcharge: 0 },
      { key: 'essential', name: 'Essential Plugins', description: 'Admin tools, teleportation, economics', surcharge: 3.99, recommended: true },
      { key: 'pvp', name: 'PvP Enhancement Pack', description: 'Combat plugins, tournaments, clans', surcharge: 4.99 },
      { key: 'pve', name: 'PvE/RP Pack', description: 'NPCs, quests, role-playing features', surcharge: 4.99 },
      { key: 'custom', name: 'Custom Plugins', description: 'Specify your own plugin collection', surcharge: 2.99 }
    ],
    planOptions: [
      { ram: '3GB', cpu: '2 vCPU', disk: '20GB SSD', price: 8.99, description: 'Small survival servers, 50-100 players' },
      { ram: '6GB', cpu: '3 vCPU', disk: '40GB SSD', price: 16.99, description: 'Medium servers with plugins, 100-200 players' },
      { ram: '8GB', cpu: '4 vCPU', disk: '60GB SSD', price: 24.99, description: 'Large servers with mods, 200-300 players', recommended: true },
      { ram: '12GB', cpu: '6 vCPU', disk: '80GB SSD', price: 36.99, description: 'High-pop servers with extensive mods, 300+ players' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Rust Game Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${rustWallpaper})`,
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

          <ServerConfigurator gameType="rust" gameData={rustData} />
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default RustConfig;
