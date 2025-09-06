import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DynamicServerConfigurator from '../components/DynamicServerConfigurator';
import minecraftWallpaper from '../assets/minecraft-gameplay-wallpaper.jpg';

const MinecraftConfig = () => {
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
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Configure Your Minecraft Server</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Create the perfect Minecraft experience with our customizable hosting plans, 
              modpacks, and add-ons tailored for your community.
            </p>
          </div>
          
          <DynamicServerConfigurator gameType="minecraft" />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default MinecraftConfig;