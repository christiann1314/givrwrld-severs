import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Server, MapPin, Zap, Package, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '../hooks/useAuth';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { serviceBundles, getBundleEnvVars } from '../utils/bundleUtils';

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

  // Service Bundle state
  const [selectedBundle, setSelectedBundle] = useState<string>('none');

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
    
    // Add service bundle
    const bundle = serviceBundles.find(b => b.id === selectedBundle);
    if (bundle) total += bundle.price;
    
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
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!serverName.trim()) {
      alert('Please enter a server name');
      return;
    }

    try {
      // Convert add-ons object to array of enabled addon keys
      const enabledAddons = Object.entries(addOns)
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => key);

      await createCheckoutSession({
        plan_name: `${gameData.name} - ${selectedPlan.ram}`,
        amount: calculateTotal(),
        ram: selectedPlan.ram,
        cpu: selectedPlan.cpu,
        disk: selectedPlan.disk,
        location,
        server_name: serverName,
        game_type: gameType,
        bundle_id: selectedBundle,
        addon_ids: enabledAddons,
        modpack_id: selectedModpack?.key || 'vanilla',
        billing_term: billingPeriod,
        bundle_env: getBundleEnvVars(selectedBundle),
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/dashboard`
      });
    } catch (error) {
      console.error('Deployment error:', error);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Server Details */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Server className="h-6 w-6 text-primary" />
                Server Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Server Name</label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="My Awesome Server"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Server Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                Choose Your Plan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {gameData.planOptions.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                      selectedPlan === plan
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-background/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                          Recommended
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">{plan.ram}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>
                      <div className="space-y-1 text-sm">
                        <div>{plan.cpu}</div>
                        <div>{plan.disk} Storage</div>
                      </div>
                      <div className="mt-4">
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </div>
                    
                    {selectedPlan === plan && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Service Bundles */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                Service Bundles
              </h2>
              <p className="text-muted-foreground mb-6">Bundles are optional. You can add or change them later.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
                    selectedBundle === 'none'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-background/30 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedBundle('none')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center text-xl">
                        ⚪
                      </div>
                      <div>
                        <h3 className="font-semibold">None</h3>
                        <p className="text-muted-foreground text-sm">Basic server only</p>
                      </div>
                    </div>
                  </div>
                </div>

                {serviceBundles.slice(1).map((bundle) => (
                  <div
                    key={bundle.id}
                    className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
                      selectedBundle === bundle.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-background/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedBundle(bundle.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                          {bundle.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{bundle.name}</h3>
                          <p className="text-muted-foreground text-sm">{bundle.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          ${bundle.price.toFixed(2)}/mo
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">What's included?</div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {bundle.inclusions.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Modpack Selection */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                Modpack Selection
              </h2>
              
              <div className="space-y-4">
                <Select
                  value={selectedModpack.key}
                  onValueChange={(value) => {
                    const modpack = gameData.modpacks.find(m => m.key === value);
                    if (modpack) setSelectedModpack(modpack);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>{selectedModpack.name}</span>
                          {selectedModpack.recommended && (
                            <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {selectedModpack.surcharge > 0 ? `+$${selectedModpack.surcharge.toFixed(2)}/mo` : 'Free'}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {gameData.modpacks.map((modpack) => (
                      <SelectItem key={modpack.key} value={modpack.key}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span>{modpack.name}</span>
                            {modpack.recommended && (
                              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                                Recommended
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground ml-4">
                            {modpack.surcharge > 0 ? `+$${modpack.surcharge.toFixed(2)}/mo` : 'Free'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <p className="text-sm text-muted-foreground">{selectedModpack.description}</p>
              </div>
            </div>

            {/* Add-ons */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                Optional Add-ons
              </h2>
              
              <div className="space-y-4">
                {addOnOptions.map((addOn) => (
                  <div
                    key={addOn.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">{addOn.name}</h3>
                        <p className="text-muted-foreground text-sm">{addOn.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">
                          +${addOn.price.toFixed(2)}/month
                        </div>
                      </div>
                      <Switch
                        checked={addOns[addOn.key as keyof typeof addOns]}
                        onCheckedChange={() => handleAddOnToggle(addOn.key)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Period */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h2 className="text-2xl font-bold mb-6">Billing Period</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {billingOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`rounded-xl border-2 p-4 cursor-pointer transition-all text-center ${
                      billingPeriod === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-background/30 hover:border-primary/50'
                    }`}
                    onClick={() => setBillingPeriod(option.value)}
                  >
                    <div className="font-semibold">{option.label}</div>
                    {option.discountPercent > 0 && (
                      <div className="text-sm text-primary mt-1">
                        Save {option.discountPercent}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Base Plan ({selectedPlan.ram})</span>
                  <span>${selectedPlan.price.toFixed(2)}</span>
                </div>
                
                {selectedModpack.surcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Modpack ({selectedModpack.name})</span>
                    <span>${selectedModpack.surcharge.toFixed(2)}</span>
                  </div>
                )}

                {selectedBundle !== 'none' && (
                  <div className="flex justify-between">
                    <span>Service Bundle</span>
                    <span>${serviceBundles.find(b => b.id === selectedBundle)?.price.toFixed(2)}</span>
                  </div>
                )}

                {Object.entries(addOns).map(([key, enabled]) => {
                  if (!enabled) return null;
                  const addOn = addOnOptions.find(option => option.key === key);
                  return addOn ? (
                    <div key={key} className="flex justify-between text-sm">
                      <span>{addOn.name}</span>
                      <span>${addOn.price.toFixed(2)}</span>
                    </div>
                  ) : null;
                })}

                <hr className="border-border/50" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Monthly Total</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>

                {billingPeriod !== 'monthly' && (
                  <>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Billing Period ({getBillingMultiplier()} months)</span>
                      <span>${(calculateSubtotal() * getBillingMultiplier()).toFixed(2)}</span>
                    </div>
                    
                    {getBillingDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Discount ({(getBillingDiscount() * 100).toFixed(0)}%)</span>
                        <span>-${(calculateSubtotal() * getBillingMultiplier() * getBillingDiscount()).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <hr className="border-border/50" />
                    
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </>
                )}

                {getRecommendedCombo() && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Recommended Combo</span>
                    </div>
                    <p className="text-muted-foreground mt-1">{getRecommendedCombo()}</p>
                  </div>
                )}
              </div>

              {!isAuthenticated && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                    <Info className="w-4 h-4 inline mr-1" />
                    Authentication Required
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You need to sign in or create an account to deploy a server.
                  </p>
                </div>
              )}

              <Button
                onClick={handleDeploy}
                disabled={isLoading || !serverName.trim()}
                className="w-full mt-6"
                size="lg"
              >
                {isLoading ? 'Processing...' : isAuthenticated ? 'Deploy Server' : 'Sign In to Deploy'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerConfigurator;