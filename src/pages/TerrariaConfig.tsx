import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../hooks/useAction';
import { stripeService } from '../services/stripeService';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';

const TerrariaConfig = () => {
  const { user } = useAuth();
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-west');
  const [planId, setPlanId] = useState('terraria-2gb');
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
      cancel_url: `${window.location.origin}/configure/terraria`
    });

    window.location.href = response.checkout_url;
  });

  const plans = [
    { id: 'terraria-1gb', name: '1GB', ram: '1GB', cpu: '0.5 vCPU', disk: '10GB SSD', price: 2.99, players: '4-8', description: 'Small survival servers, 4-8 players' },
    { id: 'terraria-2gb', name: '2GB', ram: '2GB', cpu: '1 vCPU', disk: '20GB SSD', price: 4.99, players: '8-16', description: 'Medium servers with plugins, 8-16 players', recommended: true },
    { id: 'terraria-4gb', name: '4GB', ram: '4GB', cpu: '2 vCPU', disk: '40GB SSD', price: 7.99, players: '16-32', description: 'Large servers with mods, 16-32 players' }
  ];

  const serverTypes = [
    { id: 'vanilla', name: 'Vanilla Terraria', description: 'Official Terraria server without modifications', price: 'Free' },
    { id: 'tmodloader', name: 'tModLoader', description: 'Mod support with tModLoader', price: 'Free' },
    { id: 'custom', name: 'Custom', description: 'Custom server configuration', price: 'Free' }
  ];

  const modpacks = [
    { id: 'vanilla', name: 'Vanilla', description: 'Pure Terraria experience', price: 'Free' },
    { id: 'calamity', name: 'Calamity', description: 'Massive content expansion mod', price: 'Free' },
    { id: 'thorium', name: 'Thorium', description: 'Quality of life improvements', price: 'Free' },
    { id: 'spirit', name: 'Spirit', description: 'Spirit mod with new biomes', price: 'Free' }
  ];

  const billingTerms = [
    { id: 'monthly', name: 'Monthly', discount: 0 },
    { id: 'quarterly', name: '3 Months', discount: 5 },
    { id: 'semiannual', name: '6 Months', discount: 10 },
    { id: 'yearly', name: '12 Months', discount: 20 }
  ];

  const addonOptions = [
    { id: 'backups', name: 'Automatic Backups', description: 'Daily backups with 7 day retention', price: 2.99 },
    { id: 'discord', name: 'Discord Integration', description: 'Sync server status with Discord', price: 2.99 },
    { id: 'analytics', name: 'Advanced Analytics', description: 'Real-time player and performance stats', price: 2.99 },
    { id: 'storage', name: 'Additional SSD Storage (+10GB)', description: 'Expand your storage capacity', price: 2.99 }
  ];

  const selectedPlan = plans.find(p => p.id === planId);
  const selectedTerm = billingTerms.find(t => t.id === billingTerm);
  const totalAddons = Object.values(addons).filter(Boolean).length * 2.99;
  const basePrice = selectedPlan?.price || 0;
  const discount = (basePrice * selectedTerm?.discount || 0) / 100;
  const finalPrice = (basePrice - discount + totalAddons) * (selectedTerm?.id === 'quarterly' ? 3 : selectedTerm?.id === 'semiannual' ? 6 : selectedTerm?.id === 'yearly' ? 12 : 1);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${medievalBackdrop})` }}
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
              Terraria Server
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
                
                <div className="mt-4">
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-lg inline-block">
                    {selectedPlan?.ram} + Vanilla Terraria = Optimal Performance
                  </div>
                </div>
              </div>

              {/* Service Bundles */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">Service Bundles</h2>
                <p className="text-gray-400 mb-4">Bundles are optional. You can add or change them later.</p>
                
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">None</span>
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">Start custom only</p>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">GIVWorld Essentials</span>
                      <span className="text-purple-400 font-bold">$4.99/mo</span>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Daily server backups</li>
                      <li>• Automatic modpack integration</li>
                      <li>• Priority support queue</li>
                      <li>• Custom server dashboard</li>
                    </ul>
                    <button className="text-purple-400 text-sm mt-2">What's included?</button>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">Game Expansion</span>
                      <span className="text-purple-400 font-bold">$10.99/mo</span>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Direct access to supporter game types</li>
                      <li>• Community server boosts</li>
                      <li>• Exclusive server giveaways</li>
                    </ul>
                    <button className="text-purple-400 text-sm mt-2">What's included?</button>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">Community Pack</span>
                      <span className="text-purple-400 font-bold">$5.99/mo</span>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Priority support queue</li>
                      <li>• Discord spotlight eligibility</li>
                      <li>• Hosting server events</li>
                      <li>• Custom Discord channel roles</li>
                    </ul>
                    <button className="text-purple-400 text-sm mt-2">What's included?</button>
                  </div>
                </div>
              </div>

              {/* Server Software Type */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-500 rounded mr-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Server Software Type</h2>
                </div>
                
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setServerType('vanilla')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      serverType === 'vanilla' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Vanilla Terraria
                  </button>
                  <button
                    onClick={() => setServerType('tmodloader')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      serverType === 'tmodloader' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    tModLoader
                  </button>
                </div>
                
                <select
                  value={serverType}
                  onChange={(e) => setServerType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                >
                  {serverTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    {serverTypes.find(s => s.id === serverType)?.description}
                  </p>
                  <span className="text-purple-400 font-semibold">Free</span>
                </div>
              </div>

              {/* Modpack Selection */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-500 rounded mr-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Modpack Selection</h2>
                </div>
                
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setModpack('vanilla')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      modpack === 'vanilla' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Vanilla
                  </button>
                  <button
                    onClick={() => setModpack('calamity')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      modpack === 'calamity' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Calamity
                  </button>
                </div>
                
                <select
                  value={modpack}
                  onChange={(e) => setModpack(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                >
                  {modpacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>{pack.name}</option>
                  ))}
                </select>
                
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    {modpacks.find(p => p.id === modpack)?.description}
                  </p>
                  <span className="text-purple-400 font-semibold">Free</span>
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

              {/* Optional Add-ons */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-purple-500 rounded mr-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
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
                              ? 'bg-purple-500 border-purple-500'
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
                      <div className="text-purple-400 font-bold">+${addon.price.toFixed(2)}/month</div>
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
                    <span className="text-gray-300">Server Plan ({selectedPlan?.name})</span>
                    <span className="text-white">${selectedPlan?.price}/mo</span>
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
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed"
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

export default TerrariaConfig;