
import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';

const Index = () => {
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
        <Header />
        <HeroSection />
        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
