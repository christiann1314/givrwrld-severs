import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DynamicServerConfigurator from '../components/DynamicServerConfigurator';
import palworldWallpaper from '../assets/palworld-wallpaper-hd.jpg';

const PalworldConfig = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Palworld Game Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${palworldWallpaper})`,
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
            <h1 className="text-4xl font-bold text-white mb-4">Configure Your Palworld Server</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Create your perfect Palworld adventure with customizable servers
              designed for multiplayer creature collection and survival.
            </p>
          </div>
          
          <DynamicServerConfigurator gameType="palworld" />
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default PalworldConfig;