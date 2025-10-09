import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../hooks/useAction';
import { stripeService } from '../services/stripeService';
const velorenBackdrop = 'https://veloren.net/assets/images/veloren-title-screen.png';

const VelorenConfig = () => {
  const { user } = useAuth();
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-west');
  const [planId, setPlanId] = useState('veloren-4gb');
  const [gameType, setGameType] = useState('veloren');
  const [billingTerm, setBillingTerm] = useState('monthly');

  const { run: createCheckout, loading } = useAction(async () => {
    if (!user) throw new Error('Please sign in to continue');
    if (!serverName.trim()) throw new Error('Server name is required');

    const response = await stripeService.createCheckoutSession({
      item_type: 'game',
      plan_id: planId,
      region,
      server_name: serverName.trim(),
      modpack_id: gameType,
      term: billingTerm,
      success_url: `${window.location.origin}/purchase-success`,
      cancel_url: `${window.location.origin}/configure/veloren`
    });

    window.location.href = response.checkout_url;
  });

  const plans = [
    { id: 'veloren-2gb', name: '2GB', ram: '2GB', cpu: '1 vCPU', disk: '20GB SSD', price: 4.99, players: '2-4', description: 'Small voxel RPG servers, 2-4 players' },
    { id: 'veloren-4gb', name: '4GB', ram: '4GB', cpu: '2 vCPU', disk: '40GB SSD', price: 7.99, players: '4-8', description: 'Medium voxel RPG servers, 4-8 players', recommended: true },
    { id: 'veloren-8gb', name: '8GB', ram: '8GB', cpu: '3 vCPU', disk: '80GB SSD', price: 12.99, players: '8-16', description: 'Large voxel RPG servers, 8-16 players' }
  ];

  const gameTypes = [
    { id: 'veloren', name: 'Veloren', description: 'Multiplayer voxel RPG written in Rust, inspired by Cube World and Minecraft' }
  ];

  const billingTerms = [
    { id: 'monthly', name: 'Monthly', discount: 0 },
    { id: 'quarterly', name: '3 Months', discount: 5 },
    { id: 'semiannual', name: '6 Months', discount: 10 },
    { id: 'yearly', name: '12 Months', discount: 20 }
  ];

  const selectedPlan = plans.find(p => p.id === planId);
  const selectedTerm = billingTerms.find(t => t.id === billingTerm);
  const basePrice = selectedPlan?.price || 0;
  const discount = (basePrice * selectedTerm?.discount || 0) / 100;
  const finalPrice = (basePrice - discount) * (selectedTerm?.id === 'quarterly' ? 3 : selectedTerm?.id === 'semiannual' ? 6 : selectedTerm?.id === 'yearly' ? 12 : 1);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${velorenBackdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/50"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link to="/deploy" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4">
              ← Back to Servers
            </Link>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gray-300">Configure Your</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Veloren Server
            </span>
          </h1>
          
          <p className="text-lg text-gray-300 max-w-3xl mb-8">
            Customize your server settings to match your gaming needs
          </p>

          {/* Current Selection Banner */}
          <div className="bg-purple-500 text-white px-6 py-3 rounded-lg mb-8 inline-block">
            High-performance, moddable server, 100+ players
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* Server Configuration */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-500 rounded mr-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Server Configuration</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Server Name</label>
                    <input
                      type="text"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="Enter your server name"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">Server Location</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setRegion('us-west')}
                        className={`px-4 py-3 rounded-lg transition-colors ${
                          region === 'us-west'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        US West (California)
                      </button>
                      <button
                        onClick={() => setRegion('us-east')}
                        className={`px-4 py-3 rounded-lg transition-colors ${
                          region === 'us-east'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        US East (New York)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Type Selection */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Game Type</h2>
                
                <div className="space-y-3">
                  {gameTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setGameType(type.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        gameType === type.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">{type.name}</h3>
                          <p className="text-gray-300 text-sm">{type.description}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          {gameType === type.id && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Choose Your Plan */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Choose Your Plan</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setPlanId(plan.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        planId === plan.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">${plan.price}</div>
                          <div className="text-gray-400 text-sm">per month</div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{plan.description}</p>
                      <div className="text-purple-400 text-sm font-semibold">
                        {plan.ram} RAM • {plan.cpu} • {plan.disk} SSD
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Period */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Billing Period</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {billingTerms.map((term) => (
                    <button
                      key={term.id}
                      onClick={() => setBillingTerm(term.id)}
                      className={`px-4 py-3 rounded-lg transition-colors text-center ${
                        billingTerm === term.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{term.name}</div>
                      {term.discount > 0 && (
                        <div className="text-xs text-purple-300">Save {term.discount}%</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Server Plan ({selectedPlan?.name})</span>
                    <span className="text-white">${selectedPlan?.price}/mo</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Game Type</span>
                    <span className="text-white">{gameTypes.find(t => t.id === gameType)?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billing</span>
                    <span className="text-white">{selectedTerm?.name}</span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-purple-400">${finalPrice.toFixed(2)}</span>
                  </div>
                  {selectedTerm?.id !== 'monthly' && (
                    <div className="text-sm text-purple-300 text-right mt-1">
                      Save ${discount.toFixed(2)} ({selectedTerm?.discount}% off)
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Included Features</h4>
                  <div className="space-y-2">
                    {[
                      '99.9% uptime SLA',
                      'Anti-DDoS Game protection',
                      'Instant setup & SSD',
                      'Ryzen 9 5950X CPU',
                      '24/7 support and Discord community access'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mr-3 flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createCheckout}
                  disabled={loading || !serverName.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Server...' : 'Sign Up to Deploy Server'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelorenConfig;