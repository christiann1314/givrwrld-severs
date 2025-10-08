import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../hooks/useAction';
import { stripeService } from '../services/stripeService';
import palworldWallpaper from '../assets/palworld-wallpaper-hd.jpg';

const PalworldConfig = () => {
  const { user } = useAuth();
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [planId, setPlanId] = useState('palworld-8gb');
  const [serverType, setServerType] = useState('vanilla');
  const [modpack, setModpack] = useState('vanilla');
  const [billingTerm, setBillingTerm] = useState('monthly');
  const [addons, setAddons] = useState({
    backups: false,
    discord: false,
    analytics: false,
    storage: false
  });

  const { run: createCheckout, loading } = useAction(async () => {
    if (!user) throw new Error('Please sign in to continue');
    if (!serverName.trim()) throw new Error('Server name is required');

    const response = await stripeService.createCheckoutSession({
      item_type: 'game',
      plan_id: planId,
      region,
      server_name: serverName.trim(),
      term: billingTerm,
      success_url: `${window.location.origin}/purchase-success`,
      cancel_url: `${window.location.origin}/configure/palworld`
    });

    window.location.href = response.checkout_url;
  });

  const plans = [
    { id: 'palworld-4gb', name: '4GB', ram: '4GB', cpu: '2 vCPU', disk: '40GB SSD', price: 11.99, players: '4-8' },
    { id: 'palworld-8gb', name: '8GB', ram: '8GB', cpu: '3 vCPU', disk: '80GB SSD', price: 23.99, players: '8-16', recommended: true },
    { id: 'palworld-16gb', name: '16GB', ram: '16GB', cpu: '4 vCPU', disk: '160GB SSD', price: 47.99, players: '16-32' }
  ];

  const serverTypes = [
    { id: 'vanilla', name: 'Vanilla Palworld', description: 'Official Palworld server without modifications' },
    { id: 'modded', name: 'Modded', description: 'Server with mod support enabled' },
    { id: 'custom', name: 'Custom', description: 'Custom server configuration' }
  ];

  const modpacks = [
    { id: 'vanilla', name: 'Vanilla', description: 'Pure Palworld experience' },
    { id: 'enhanced', name: 'Enhanced', description: 'Enhanced gameplay with quality of life improvements' },
    { id: 'hardcore', name: 'Hardcore', description: 'Hardcore survival experience' },
    { id: 'creative', name: 'Creative', description: 'Creative building focused' }
  ];

  const billingTerms = [
    { id: 'monthly', name: 'Monthly', discount: 0 },
    { id: 'quarterly', name: '3 Months', discount: 5 },
    { id: 'semiannual', name: '6 Months', discount: 10 },
    { id: 'yearly', name: '12 Months', discount: 20 }
  ];

  const addonOptions = [
    { id: 'backups', name: 'Automatic Backups', description: 'Daily backups with 7 day retention', price: 2.00 },
    { id: 'discord', name: 'Discord Integration', description: 'Sync server status with Discord', price: 2.00 },
    { id: 'analytics', name: 'Advanced Analytics', description: 'Real-time player and performance stats', price: 2.00 },
    { id: 'storage', name: 'Additional SSD Storage (+10GB)', description: 'Expand your storage capacity', price: 2.00 }
  ];

  const selectedPlan = plans.find(p => p.id === planId);
  const selectedTerm = billingTerms.find(t => t.id === billingTerm);
  const totalAddons = Object.values(addons).filter(Boolean).length * 2.00;
  const basePrice = selectedPlan?.price || 0;
  const discount = (basePrice * selectedTerm?.discount || 0) / 100;
  const finalPrice = (basePrice - discount + totalAddons) * (selectedTerm?.id === 'quarterly' ? 3 : selectedTerm?.id === 'semiannual' ? 6 : selectedTerm?.id === 'yearly' ? 12 : 1);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${palworldWallpaper})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/50"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-8">
            <Link to="/deploy" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
              ← Back to Games
            </Link>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-clip-text text-transparent">
              Configure Your Palworld Server
              </span>
            </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            High-performance, moddable server with 100+ players
            </p>

          {/* Current Selection Bar */}
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg mb-8 inline-block">
            {selectedPlan?.ram} + {serverTypes.find(s => s.id === serverType)?.name} + Optimal Performance
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-8">
              {/* Service Bundles */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-white">Service Bundles</h2>
                </div>
                <p className="text-gray-400 mb-6">Bundles are optional. You can add or change them later.</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border-2 border-emerald-500 bg-emerald-500/10 rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">None</span>
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">Start custom only</p>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">GIVWorld Basic</span>
                      <span className="text-emerald-400 font-bold">$4.99/mo</span>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Basic server with 100+ players</li>
                      <li>• Automatic backups</li>
                      <li>• 24/7 support</li>
                    </ul>
                    <button className="text-emerald-400 text-sm mt-2">What's included?</button>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">Game Expansion</span>
                      <span className="text-emerald-400 font-bold">$10.99/mo</span>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Access to all supported game types</li>
                      <li>• Unlimited modpack support</li>
                      <li>• Custom game plugins</li>
                    </ul>
                    <button className="text-emerald-400 text-sm mt-2">What's included?</button>
                  </div>
                </div>
              </div>

              {/* Server Software Type */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-white">Server Software Type</h2>
                </div>
                
                <select
                  value={serverType}
                  onChange={(e) => setServerType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                >
                  {serverTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setServerType('vanilla')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      serverType === 'vanilla' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Vanilla Palworld
                  </button>
                  <button
                    onClick={() => setServerType('modded')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      serverType === 'modded' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Modded
                  </button>
                </div>
                
                <p className="text-gray-400 text-sm">
                  {serverTypes.find(s => s.id === serverType)?.description}
                </p>
              </div>

              {/* Modpack Selection */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-white">Modpack Selection</h2>
                </div>
                
                <select
                  value={modpack}
                  onChange={(e) => setModpack(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                >
                  {modpacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>{pack.name}</option>
                  ))}
                </select>
                
                <p className="text-gray-400 text-sm">
                  {modpacks.find(p => p.id === modpack)?.description}
                </p>
              </div>

              {/* Billing Period */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-white">Billing Period</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {billingTerms.map((term) => (
                    <button
                      key={term.id}
                      onClick={() => setBillingTerm(term.id)}
                      className={`px-4 py-3 rounded-lg transition-colors text-center ${
                        billingTerm === term.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{term.name}</div>
                      {term.discount > 0 && (
                        <div className="text-xs text-emerald-300">Save {term.discount}%</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Add-ons */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  <h2 className="text-xl font-bold text-white">Optional Add-ons</h2>
                </div>
                
                <div className="space-y-4">
                  {addonOptions.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center">
                        <button
                          onClick={() => setAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                          className={`w-6 h-6 rounded-full border-2 mr-4 transition-colors ${
                            addons[addon.id as keyof typeof addons]
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {addons[addon.id as keyof typeof addons] && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
                          )}
                        </button>
                        <div>
                          <div className="font-semibold text-white">{addon.name}</div>
                          <div className="text-sm text-gray-400">{addon.description}</div>
                        </div>
                      </div>
                      <div className="text-emerald-400 font-bold">+${addon.price.toFixed(2)}/month</div>
                    </div>
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
                    <span className="text-gray-300">Server Name</span>
                    <input
                      type="text"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="My Palworld Server"
                      className="bg-gray-700/50 border border-gray-600 rounded px-3 py-1 text-white text-sm w-32"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan</span>
                    <span className="text-white">{selectedPlan?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Software</span>
                    <span className="text-white">{serverTypes.find(s => s.id === serverType)?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Modpack</span>
                    <span className="text-white">{modpacks.find(p => p.id === modpack)?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billing</span>
                    <span className="text-white">{selectedTerm?.name}</span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-400">${finalPrice.toFixed(2)}</span>
                  </div>
                  {selectedTerm?.id !== 'monthly' && (
                    <div className="text-sm text-emerald-300 text-right mt-1">
                      Save ${discount.toFixed(2)} ({selectedTerm?.discount}% off)
                    </div>
                  )}
                </div>

                <button
                  onClick={createCheckout}
                  disabled={loading || !serverName.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed mt-6"
                >
                  {loading ? 'Creating Server...' : 'Deploy Palworld Server'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalworldConfig;