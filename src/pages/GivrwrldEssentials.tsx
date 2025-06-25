
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UpgradePaymentModal from '../components/UpgradePaymentModal';
import { Button } from '../components/ui/button';
import { Check, Shield, BarChart3, Users, ArrowLeft } from 'lucide-react';

const GivrwrldEssentials = () => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Daily Backups",
      description: "Automatic daily backups with 7-day retention"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Discord Bridge", 
      description: "Real-time chat integration with Discord"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Whitelist Panel",
      description: "Advanced player management control"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Detailed server performance insights"
    }
  ];

  const completeFeatures = [
    "Automated daily backups",
    "Advanced whitelist management", 
    "Performance monitoring",
    "Automated maintenance tasks",
    "Discord server integration",
    "Real-time analytics dashboard",
    "Player activity reports",
    "Priority customer support"
  ];

  const packageData = {
    name: 'GIVRwrld Essentials',
    price: '$6.99/mo',
    features: completeFeatures
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
        
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                GIVRwrld Essentials
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Complete server management toolkit for serious server administrators
            </p>
            <p className="text-gray-400 mb-8">
              Most Popular Package
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-white mb-2">
                  $6.99
                  <span className="text-lg font-normal text-gray-400 ml-2">/month</span>
                </div>
                <div className="text-emerald-400 font-semibold mb-4">Complete Management Package</div>
                <p className="text-gray-300">Everything you need for professional server management</p>
              </div>

              {/* Feature Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-emerald-400 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-300 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete Feature List */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-4">Complete Feature Set:</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {completeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300 text-sm">
                      <Check size={16} className="text-emerald-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-4 px-8 text-lg"
                >
                  Upgrade for $6.99/mo
                </Button>
              </div>
            </div>

            {/* Why Choose Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Professional Management</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Take your server administration to the next level with enterprise-grade tools designed for serious server operators.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Check size={14} className="text-emerald-400 mr-2" />
                    <span>Advanced monitoring</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Check size={14} className="text-emerald-400 mr-2" />
                    <span>Automated backups</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-600/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Community Integration</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Seamlessly connect your server with Discord and other platforms to build a thriving gaming community.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Check size={14} className="text-emerald-400 mr-2" />
                    <span>Discord chat integration</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Check size={14} className="text-emerald-400 mr-2" />
                    <span>Real-time notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <UpgradePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        packageData={packageData}
      />
    </div>
  );
};

export default GivrwrldEssentials;
