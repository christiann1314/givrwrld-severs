import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../hooks/useAction';
import { stripeService } from '../services/stripeService';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';

const FactorioConfig = () => {
  const { user } = useAuth();
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [planId, setPlanId] = useState('factorio-4gb');
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
      cancel_url: `${window.location.origin}/configure/factorio`
    });

    window.location.href = response.checkout_url;
  });

  const plans = [
    { id: 'factorio-2gb', name: 'Factorio 2GB', price: '$4.99', ram: '2GB', players: '2-4' },
    { id: 'factorio-4gb', name: 'Factorio 4GB', price: '$6.99', ram: '4GB', players: '4-8' },
    { id: 'factorio-8gb', name: 'Factorio 8GB', price: '$12.99', ram: '8GB', players: '8-16' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
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
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Configure Your Factorio Server
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mb-12">
            Set up your Factorio server for factory automation and optimization challenges.
          </p>

          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Server Configuration</h2>
            
            <div className="space-y-6">
              {/* Server Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="My Factory Empire"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Plan Selection */}
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
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setPlanId(plan.id)}
                    >
                      <div className="font-semibold text-white">{plan.name}</div>
                      <div className="text-yellow-400 font-bold">{plan.price}/month</div>
                      <div className="text-sm text-gray-400">{plan.ram} RAM • {plan.players} players</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="us-east-1">US East (Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">Europe (Ireland)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                </select>
              </div>

              {/* Billing Term */}
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
                        className="mr-2 text-yellow-500"
                      />
                      <span className="capitalize">{termOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deploy Button */}
              <button
                onClick={createCheckout}
                disabled={loading || !serverName.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Server...' : 'Deploy Factorio Server'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactorioConfig;
