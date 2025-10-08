import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../hooks/useAction';
import { stripeService } from '../services/stripeService';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';

const VintageStoryConfig = () => {
  const { user } = useAuth();
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [planId, setPlanId] = useState('vintage-story-4gb');
  const [term, setTerm] = useState('monthly');

  const { run: createCheckout, loading } = useAction(async () => {
    if (!user) throw new Error('Please sign in to continue');
    if (!serverName.trim()) throw new Error('Server name is required');

    const response = await stripeService.createCheckoutSession({
      item_type: 'game',
      plan_id: planId,
      region,
      server_name: serverName.trim(),
      term,
      success_url: `${window.location.origin}/purchase-success`,
      cancel_url: `${window.location.origin}/configure/vintage-story`
    });

    window.location.href = response.checkout_url;
  });

  const plans = [
    { id: 'vintage-story-2gb', name: 'Vintage Story 2GB', price: '$5.99', ram: '2GB', players: '2-4' },
    { id: 'vintage-story-4gb', name: 'Vintage Story 4GB', price: '$7.99', ram: '4GB', players: '4-8' },
    { id: 'vintage-story-8gb', name: 'Vintage Story 8GB', price: '$12.99', ram: '8GB', players: '8-16' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${medievalBackdrop}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/30 to-gray-900/50"></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-8">
            <Link to="/deploy" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
              ← Back to Games
            </Link>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
              Configure Your Vintage Story Server
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mb-12">
            Set up your Vintage Story server for realistic survival crafting.
          </p>

          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Server Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="My Vintage Story World"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Plan
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        planId === plan.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setPlanId(plan.id)}
                    >
                      <div className="font-semibold text-white">{plan.name}</div>
                      <div className="text-amber-400 font-bold">{plan.price}/month</div>
                      <div className="text-sm text-gray-400">{plan.ram} RAM • {plan.players} players</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="us-east-1">US East (Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Billing Term
                </label>
                <div className="flex space-x-4">
                  {['monthly', 'quarterly', 'yearly'].map((termOption) => (
                    <label key={termOption} className="flex items-center">
                      <input
                        type="radio"
                        value={termOption}
                        checked={term === termOption}
                        onChange={(e) => setTerm(e.target.value)}
                        className="mr-2 text-amber-500"
                      />
                      <span className="capitalize">{termOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={createCheckout}
                disabled={loading || !serverName.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Server...' : 'Deploy Vintage Story Server'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VintageStoryConfig;
