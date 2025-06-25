
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UpgradePaymentModal from '../components/UpgradePaymentModal';
import { ArrowLeft, Gamepad2, Download, Users, CheckCircle, Star } from 'lucide-react';

const GameExpansionPack = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const features = [
    {
      icon: Gamepad2,
      title: "Pre-installed Game Mods",
      description: "Popular mods and plugins pre-configured for optimal performance"
    },
    {
      icon: Download,
      title: "One-Click Mod Installation",
      description: "Install new mods with just one click from our curated library"
    },
    {
      icon: Users,
      title: "Custom Game Modes",
      description: "Access to exclusive custom game modes and scenarios"
    }
  ];

  const benefits = [
    "50+ pre-installed popular mods",
    "One-click mod installation system",
    "Custom game modes and scenarios",
    "Regular mod updates and patches",
    "Mod compatibility testing",
    "Performance optimization tools",
    "Community-created content access",
    "Mod conflict resolution"
  ];

  const packageData = {
    name: "Game Expansion Pack",
    price: 9.99,
    originalPrice: 14.99,
    features: features,
    benefits: benefits
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Gamepad2 className="text-blue-400 mr-2" size={32} />
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Game Expansion Pack
                </span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Expand your gaming experience with pre-installed mods and custom content
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">What's Included</h2>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6">
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="text-blue-400 flex-shrink-0" size={20} />
                      <span className="text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="text-gray-400 line-through text-lg">${packageData.originalPrice}/month</div>
              <div className="text-4xl font-bold text-blue-400 mb-2">${packageData.price}/month</div>
              <div className="text-red-400 font-semibold">Save 33%</div>
            </div>
            
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg w-full max-w-md"
            >
              Get Expansion Pack
            </button>
            
            <p className="text-gray-400 text-sm mt-4">
              30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>

        <Footer />
      </div>

      {showPaymentModal && (
        <UpgradePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          packageData={packageData}
        />
      )}
    </div>
  );
};

export default GameExpansionPack;
