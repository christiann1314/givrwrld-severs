
import React from 'react';
// Header and Footer are included in App.tsx
import ServerConfigurator from '../components/ServerConfigurator';
import { Link } from 'react-router-dom';
import minecraftWallpaper from '../assets/minecraft-gameplay-wallpaper.jpg';

const MinecraftConfig = () => {
  const minecraftData = {
    name: 'Minecraft',
    icon: <img src="/images/be7a6e57-bd8a-4d13-9a0e-55f7ae367b09.png" alt="Minecraft" className="w-8 h-8 rounded" />,
    basePrice: 3.99,
    features: [
      '99.9% uptime SLA',
      'Anti-DDoS Game protection',
      'NVMe SSD storage',
      'Ryzen 9 5950X CPU',
      '24/7 support and Discord community access'
    ],
    serverTypes: [
      { key: 'vanilla', name: 'Vanilla Minecraft', description: 'Pure vanilla Minecraft server', surcharge: 0 },
      { key: 'paper', name: 'Paper', description: 'High-performance server with optimizations', surcharge: 0, recommended: true },
      { key: 'spigot', name: 'Spigot', description: 'Plugin-compatible server platform', surcharge: 0 },
      { key: 'forge', name: 'Forge', description: 'Mod support with Minecraft Forge', surcharge: 0 },
      { key: 'fabric', name: 'Fabric', description: 'Lightweight mod support with Fabric', surcharge: 0 }
    ],
    modpacks: [
      { key: 'vanilla', name: 'Vanilla', description: 'Pure Minecraft experience', surcharge: 0 },
      { key: 'rlcraft', name: 'RLCraft', description: 'Hardcore survival modpack with dragons', surcharge: 4.99, recommended: true },
      { key: 'atm9', name: 'All The Mods 9', description: 'Kitchen sink modpack with 400+ mods', surcharge: 5.99 },
      { key: 'create', name: 'Create Above & Beyond', description: 'Engineering and automation focused', surcharge: 4.99 },
      { key: 'skyfactory', name: 'Sky Factory 4', description: 'Skyblock with tech progression', surcharge: 3.99 },
      { key: 'custom', name: 'Custom Modpack', description: 'Upload your own modpack', surcharge: 2.99 }
    ],
    planOptions: [
      { id: 'minecraft-1gb', ram: '1GB', cpu: '0.5 vCPU', disk: '10GB SSD', price: 3.99, description: 'Perfect for small groups and testing' },
      { id: 'minecraft-2gb', ram: '2GB', cpu: '1 vCPU', disk: '20GB SSD', price: 6.99, description: 'Great for friends and small communities' },
      { id: 'minecraft-4gb', ram: '4GB', cpu: '2 vCPU', disk: '40GB SSD', price: 13.99, description: 'Ideal for medium-sized servers with mods', recommended: true },
      { id: 'minecraft-8gb', ram: '8GB', cpu: '4 vCPU', disk: '80GB SSD', price: 27.99, description: 'Perfect for large communities and heavy modpacks' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Minecraft Game Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${minecraftWallpaper})`,
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
        {/* Header is included in App.tsx */}
        
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

        {/* Footer is included in App.tsx */}
      </div>
    </div>
  );
};

export default MinecraftConfig;
