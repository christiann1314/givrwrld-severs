
import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

const Index = () => {
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
        <HeroSection />
        <FeaturesSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
