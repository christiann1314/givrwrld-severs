import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Server, MapPin, Zap, Package, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '../hooks/useAuth';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import PaymentModal from './PaymentModal';

interface ModpackOption {
  key: string;
  name: string;
  description: string;
  surcharge: number;
  recommended?: boolean;
}

interface GameData {
  name: string;
  icon: string | React.ReactNode;
  basePrice: number;
  features: string[];
  modpacks: ModpackOption[];
  planOptions: Array<{
    ram: string;
    cpu: string;
    disk: string;
    price: number;
    description: string;
    recommended?: boolean;
  }>;
}

interface ServerConfiguratorProps {
  gameType: string;
  gameData: GameData;
}

const ServerConfigurator: React.FC<ServerConfiguratorProps> = ({ gameType, gameData }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { createCheckoutSession, isLoading } = useStripeCheckout();
  const [selectedPlan, setSelectedPlan] = useState(gameData.planOptions.find(plan => plan.recommended) || gameData.planOptions[0]);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [serverName, setServerName] = useState('');
  const [location, setLocation] = useState('us-west');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Modpack state
  const [selectedModpack, setSelectedModpack] = useState(gameData.modpacks.find(pack => pack.key === 'vanilla') || gameData.modpacks[0]);
  const [customModpackUrl, setCustomModpackUrl] = useState('');
  
  // Add-ons state
  const [addOns, setAddOns] = useState({
    'automatic-backups': false,
    'discord-integration': false,
    'advanced-analytics': false,
    'additional-ssd': false
  });

  const addOnOptions = [
    {
      key: 'automatic-backups',
      name: 'Automatic Backups',
      description: 'Daily backups with 7-day retention',
      price: 2.99
    },
    {
      key: 'discord-integration', 
      name: 'Discord Integration',
      description: 'Sync server status with Discord',
      price: 1.49
    },
    {
      key: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Real-time player and performance stats',
      price: 3.99
    },
    {
      key: 'additional-ssd',
      name: 'Additional SSD Storage (+50GB)',
      description: 'Expand your storage capacity',
      price: 2.50
    }
  ];

  const billingOptions = [
    { value: 'monthly', label: 'Monthly', discountPercent: 0 },
    { value: '3months', label: '3 Months', discountPercent: 5 },
    { value: '6months', label: '6 Months', discountPercent: 10 },
    { value: '12months', label: '12 Months', discountPercent: 20 },
  ];

  const locationOptions = [
    { value: 'us-west', label: 'US West (California)' },
    { value: 'us-east', label: 'US East (New York)' }
  ];

  const getBillingMultiplier = () => {
    switch (billingPeriod) {
      case '3months': return 3;
      case '6months': return 6;
      case '12months': return 12;
      default: return 1;
    }
  };

  const getBillingDiscount = () => {
    const option = billingOptions.find(opt => opt.value === billingPeriod);
    return option ? option.discountPercent / 100 : 0;
  };

  const calculateSubtotal = () => {
    let total = selectedPlan.price;
    
    // Add modpack surcharge
    total += selectedModpack.surcharge;
    
    // Add-ons
    Object.entries(addOns).forEach(([key, enabled]) => {
      if (enabled) {
        const addOn = addOnOptions.find(option => option.key === key);
        if (addOn) total += addOn.price;
      }
    });
    return total;
  };

  const getRecommendedCombo = () => {
    if (selectedPlan.recommended && selectedModpack.recommended) {
      return `${selectedPlan.ram} + ${selectedModpack.name} = Optimal Performance`;
    }
    return null;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const multiplier = getBillingMultiplier();
    const discount = getBillingDiscount();
    const totalBeforeDiscount = subtotal * multiplier;
    const discountAmount = totalBeforeDiscount * discount;
    return totalBeforeDiscount - discountAmount;
  };

  const handleAddOnToggle = (key: string) => {
    setAddOns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeploy = async () => {
    // Check if user is authenticated before allowing deployment
    if (!isAuthenticated) {
      navigate('/signup', { 
        state: { 
          returnTo: window.location.pathname,
          message: 'Please create an account to deploy your server'
        }
      });
      return;
    }

    try {
      await createCheckoutSession({
        plan_name: `${gameData.name} - ${selectedPlan.ram}`,
        amount: calculateTotal(), // Send actual dollar amount, not cents
        ram: selectedPlan.ram,
        cpu: selectedPlan.cpu,
        disk: selectedPlan.disk,
        location: location,
        success_url: `${window.location.origin}/success?plan=${gameData.name}&ram=${selectedPlan.ram}`,
        cancel_url: `${window.location.origin}/dashboard`,
      });
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">!</span>
            </div>
            <h4 className="text-yellow-400 font-semibold">Account Required</h4>
          </div>
          <p className="text-yellow-300 text-sm">
            You'll need to create an account to deploy your server. Click "Deploy Server" to sign up.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Server Details */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Server className="mr-3 text-emerald-400" size={24} />
              Server Configuration
            </h2>
            
            <div className="space-y-6">
              {/* Server Name */}
              <div>
                <label htmlFor="serverName" className="block text-sm font-medium text-gray-300 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  id="serverName"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                  placeholder="Enter your server name"
                />
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="inline mr-2" size={16} />
                  Server Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {locationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLocation(option.value)}
                      className={`p-4 rounded-lg border transition-all ${
                        location === option.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Choose Your Plan</h3>
            <div className="grid gap-4">
              {gameData.planOptions.map((plan) => (
                <div
                  key={plan.ram}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPlan.ram === plan.ram
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{plan.ram}</span>
                      {plan.recommended && (
                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-white">${plan.price.toFixed(2)}/mo</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
              ))}
            </div>
            
            {/* Recommended Combo Badge */}
            {getRecommendedCombo() && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">Recommended</span>
                  <span className="text-emerald-400 text-sm font-medium">{getRecommendedCombo()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Modpack Selection */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Package className="mr-2 text-emerald-400" size={20} />
              Modpack Selection
            </h3>
            <div className="space-y-4">
              <TooltipProvider>
                <Select value={selectedModpack.key} onValueChange={(value) => {
                  const modpack = gameData.modpacks.find(m => m.key === value);
                  if (modpack) setSelectedModpack(modpack);
                }}>
                  <SelectTrigger className="w-full bg-gray-700/50 border-gray-600/50 text-white">
                    <SelectValue placeholder="Select a modpack" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    {gameData.modpacks.map((modpack) => (
                      <SelectItem key={modpack.key} value={modpack.key} className="hover:bg-gray-700">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <span>{modpack.name}</span>
                            {modpack.recommended && (
                              <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                                Recommended
                              </span>
                            )}
                            <Tooltip>
                              <TooltipTrigger>
                                <Info size={14} className="text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-700 border-gray-600 text-white">
                                <p>{modpack.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-emerald-400 font-semibold ml-4">
                            {modpack.surcharge > 0 ? `+$${modpack.surcharge.toFixed(2)}/mo` : 'Free'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipProvider>
              
              {/* Custom URL Input */}
              {selectedModpack.key === 'custom' && (
                <div className="mt-4 animate-fade-in">
                  <label htmlFor="customUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    {gameType === 'minecraft' ? 'Modpack/CurseForge URL' : 
                     gameType === 'rust' ? 'Plugin URLs (one per line)' : 
                     'Mod URLs (one per line)'}
                  </label>
                  <textarea
                    id="customUrl"
                    value={customModpackUrl}
                    onChange={(e) => setCustomModpackUrl(e.target.value)}
                    className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all resize-none"
                    placeholder={gameType === 'minecraft' ? 'https://www.curseforge.com/minecraft/modpacks/your-modpack' :
                                gameType === 'rust' ? 'https://umod.org/plugins/plugin-name\nhttps://umod.org/plugins/another-plugin' :
                                'https://steamcommunity.com/sharedfiles/filedetails/?id=123456\nhttps://mod-site.com/mod-link'}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Billing Period */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Billing Period</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {billingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBillingPeriod(option.value)}
                  className={`p-4 rounded-lg border transition-all ${
                    billingPeriod === option.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{option.label}</div>
                  {option.discountPercent > 0 && (
                    <div className="text-xs text-emerald-400">Save {option.discountPercent}%</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="mr-2 text-emerald-400" size={20} />
              Optional Add-ons
            </h3>
            <div className="space-y-4">
              {addOnOptions.map((addOn) => (
                <div key={addOn.key} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{addOn.name}</h4>
                    <p className="text-gray-400 text-sm">{addOn.description}</p>
                    <span className="text-emerald-400 font-semibold text-sm">+${addOn.price.toFixed(2)}/month</span>
                  </div>
                  <Switch
                    checked={addOns[addOn.key]}
                    onCheckedChange={() => handleAddOnToggle(addOn.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 sticky top-8">
            <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Server Plan ({selectedPlan.ram})</span>
                <span className="text-white">${selectedPlan.price.toFixed(2)}/mo</span>
              </div>
              
              {selectedModpack.surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {selectedModpack.name} Modpack
                    {selectedModpack.recommended && (
                      <span className="bg-emerald-500 text-white text-xs px-1 py-0.5 rounded ml-2">Rec</span>
                    )}
                  </span>
                  <span className="text-white">${selectedModpack.surcharge.toFixed(2)}/mo</span>
                </div>
              )}
              
              {Object.entries(addOns).map(([key, enabled]) => {
                if (!enabled) return null;
                const addOn = addOnOptions.find(option => option.key === key);
                if (!addOn) return null;
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-400">{addOn.name}</span>
                    <span className="text-white">${addOn.price.toFixed(2)}/mo</span>
                  </div>
                );
              })}
              
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-emerald-400 font-bold text-lg">${calculateTotal().toFixed(2)}</span>
                </div>
                {getBillingDiscount() > 0 && (
                  <div className="text-emerald-400 text-sm mt-1">
                    You save ${(calculateSubtotal() * getBillingMultiplier() * getBillingDiscount()).toFixed(2)}!
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-white font-medium">Included Features:</h4>
              {gameData.features.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-300 text-sm">
                  <Check size={16} className="text-emerald-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleDeploy}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
            >
              {isLoading ? 'Creating Checkout...' : !isAuthenticated ? 'Sign Up to Deploy Server' : 'Deploy Server'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerConfigurator;
