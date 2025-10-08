import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAction } from '../hooks/useAction';
import { stripeService } from '../services/stripeService';
import medievalBackdrop from '../assets/medieval-throne-backdrop.jpg';

const TeeworldsConfig = () => {
  const { user } = useAuth();
  const [serverName, setServerName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [planId, setPlanId] = useState('teeworlds-1gb');
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
      cancel_url: `${window.location.origin}/configure/teeworlds`
    });

    window.location.href = response.checkout_url;
  });

  const plans = [
    { id: 'teeworlds-1gb', name: 'Teeworlds 1GB', price: '$2.49', ram: '1GB', players: '8-16' },
    { id: 'teeworlds-2gb', name: 'Teeworlds 2GB', price: '$3.99', ram: '2GB', players: '16-32' },
    { id: 'teeworlds-4gb', name: 'Teeworlds 4GB', price: '$6.99', ram: '4GB', players: '32-64' }
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
            <span className="bg-gradient-to-r from-lime-400 via-green-400 to-lime-400 bg-clip-text text-transparent">
              Configure Your Teeworlds Server
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mb-12">
            Set up your Teeworlds server for fast-paced 2D multiplayer action.
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
                  placeholder="My Teeworlds Arena"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
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
                          ? 'border-lime-500 bg-lime-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setPlanId(plan.id)}
                    >
                      <div className="font-semibold text-white">{plan.name}</div>
                      <div className="text-lime-400 font-bold">{plan.price}/month</div>
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
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
                        className="mr-2 text-lime-500"
                      />
                      <span className="capitalize">{termOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={createCheckout}
                disabled={loading || !serverName.trim()}
                className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Server...' : 'Deploy Teeworlds Server'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeeworldsConfig;
