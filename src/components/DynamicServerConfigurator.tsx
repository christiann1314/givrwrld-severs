import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Info, Check } from 'lucide-react';
import { useGames, usePlans, useBundles, useModpacks, useAddons, useDynamicCheckout, Game, Plan, Bundle, Modpack, Addon } from '../hooks/useCatalogData';

interface DynamicServerConfiguratorProps {
  gameType: string;
}

const DynamicServerConfigurator: React.FC<DynamicServerConfiguratorProps> = ({ gameType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createCheckout } = useDynamicCheckout();

  // Hooks for catalog data
  const { data: games = [] } = useGames();
  const selectedGame = games.find(g => g.slug === gameType);
  const { data: plans = [] } = usePlans(selectedGame?.id);
  const { data: bundles = [] } = useBundles();
  const { data: modpacks = [] } = useModpacks(selectedGame?.id);
  const { data: addons = [] } = useAddons();

  // Form state
  const [serverName, setServerName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [selectedModpack, setSelectedModpack] = useState<Modpack | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [billingTerm, setBillingTerm] = useState<'monthly' | 'quarterly' | 'biannual' | 'annual'>('monthly');
  const [location, setLocation] = useState('us-west');
  const [isLoading, setIsLoading] = useState(false);

  // Set default plan when plans load
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      setSelectedPlan(plans[0]); // Select first plan by default
    }
  }, [plans, selectedPlan]);

  // Set default modpack (vanilla) when modpacks load
  useEffect(() => {
    if (modpacks.length > 0 && !selectedModpack) {
      const vanilla = modpacks.find(m => m.slug === 'vanilla');
      setSelectedModpack(vanilla || modpacks[0]);
    }
  }, [modpacks, selectedModpack]);

  const calculateTotal = () => {
    let total = 0;
    
    if (selectedPlan) {
      total += getPriceForTerm(selectedPlan.price_monthly, billingTerm);
    }
    
    if (selectedBundle) {
      total += getPriceForTerm(selectedBundle.price_monthly, billingTerm);
    }
    
    if (selectedModpack && selectedModpack.price_monthly > 0) {
      total += getPriceForTerm(selectedModpack.price_monthly, billingTerm);
    }
    
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        total += getPriceForTerm(addon.price_monthly, billingTerm);
      }
    });
    
    return total;
  };

  const getPriceForTerm = (monthlyPrice: number, term: string): number => {
    const discounts = {
      monthly: 1,
      quarterly: 0.95, // 5% off
      biannual: 0.90,  // 10% off
      annual: 0.85     // 15% off
    };

    const multipliers = {
      monthly: 1,
      quarterly: 3,
      biannual: 6,
      annual: 12
    };

    const discount = discounts[term as keyof typeof discounts] || 1;
    const multiplier = multipliers[term as keyof typeof multipliers] || 1;
    
    return monthlyPrice * multiplier * discount;
  };

  const getDiscountPercentage = (term: string): number => {
    const discounts = { monthly: 0, quarterly: 5, biannual: 10, annual: 15 };
    return discounts[term as keyof typeof discounts] || 0;
  };

  const toggleAddon = (addonId: string) => {
    const newSelectedAddons = new Set(selectedAddons);
    if (newSelectedAddons.has(addonId)) {
      newSelectedAddons.delete(addonId);
    } else {
      newSelectedAddons.add(addonId);
    }
    setSelectedAddons(newSelectedAddons);
  };

  const handleDeploy = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!serverName.trim()) {
      toast.error('Please enter a server name');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        server_name: serverName.trim(),
        game_id: selectedGame?.id,
        plan_id: selectedPlan.id,
        bundle_id: selectedBundle?.id || 'none',
        modpack_id: selectedModpack?.id,
        addon_ids: Array.from(selectedAddons),
        billing_term: billingTerm,
        location
      };

      const { url } = await createCheckout(orderPayload);
      
      if (url) {
        // Open Stripe checkout in a new tab
        window.open(url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Deploy failed:', error);
      toast.error('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedGame) {
    return <div>Game not found</div>;
  }

  const total = calculateTotal();

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Server Name */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Server Configuration</CardTitle>
            <CardDescription>Configure your {selectedGame.name} server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Server Name</label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="Enter your server name"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-west">US West</SelectItem>
                    <SelectItem value="us-east">US East</SelectItem>
                    <SelectItem value="eu-west">EU West</SelectItem>
                    <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Choose Your Plan */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
            <CardDescription>Select the resources for your server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                    <div className="text-2xl font-bold text-green-400 mb-3">
                      ${plan.price_monthly}/mo
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>{plan.cpu_cores} CPU Cores</div>
                      <div>{plan.ram_gb}GB RAM</div>
                      <div>{plan.disk_gb}GB Storage</div>
                      <div>Up to {plan.max_players} players</div>
                    </div>
                    {selectedPlan?.id === plan.id && (
                      <div className="mt-3">
                        <Badge className="bg-green-500">Selected</Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Service Bundles */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Service Bundles</CardTitle>
            <CardDescription>
              Bundles are optional. You can add or change them later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* None Option */}
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  !selectedBundle
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedBundle(null)}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">None</h3>
                  <p className="text-gray-400 text-sm mb-3">No additional services</p>
                  <div className="text-2xl font-bold text-green-400 mb-3">$0/mo</div>
                  {!selectedBundle && (
                    <Badge className="bg-green-500">Selected</Badge>
                  )}
                </div>
              </div>

              {bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBundle?.id === bundle.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedBundle(bundle)}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{bundle.name}</h3>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <p className="font-semibold mb-2">What's included:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {(bundle.features as string[]).map((feature, index) => (
                                <li key={index} className="text-sm">{feature}</li>
                              ))}
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{bundle.description}</p>
                    <div className="text-2xl font-bold text-green-400 mb-3">
                      ${bundle.price_monthly}/mo
                    </div>
                    <div className="space-y-1 text-sm text-gray-300">
                      {(bundle.features as string[]).slice(0, 3).map((feature, index) => (
                        <div key={index}>• {feature}</div>
                      ))}
                    </div>
                    {selectedBundle?.id === bundle.id && (
                      <div className="mt-3">
                        <Badge className="bg-green-500">Selected</Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modpack Selection */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Modpack Selection</CardTitle>
            <CardDescription>Choose your preferred modpack or go vanilla</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select 
                value={selectedModpack?.id || ''} 
                onValueChange={(value) => {
                  const modpack = modpacks.find(m => m.id === value);
                  setSelectedModpack(modpack || null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a modpack" />
                </SelectTrigger>
                <SelectContent>
                  {modpacks.map((modpack) => (
                    <SelectItem key={modpack.id} value={modpack.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{modpack.name}</span>
                        {modpack.price_monthly > 0 && (
                          <span className="text-green-400 ml-4">+${modpack.price_monthly}/mo</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedModpack && (
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <h4 className="font-semibold text-white">{selectedModpack.name}</h4>
                  <p className="text-gray-400 text-sm">{selectedModpack.description}</p>
                  {selectedModpack.price_monthly > 0 && (
                    <p className="text-green-400 font-medium">+${selectedModpack.price_monthly}/month</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Optional Add-ons */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Optional Add-ons</CardTitle>
            <CardDescription>Enhance your server with additional features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">{addon.name}</h4>
                      <Badge variant="outline" className="text-xs">{addon.category}</Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{addon.description}</p>
                    <p className="text-green-400 font-medium">${addon.price_monthly}/month</p>
                  </div>
                  <Switch
                    checked={selectedAddons.has(addon.id)}
                    onCheckedChange={() => toggleAddon(addon.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Period */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Billing Period</CardTitle>
            <CardDescription>Choose your billing frequency to save money</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 'monthly', label: 'Monthly', discount: 0 },
                { value: 'quarterly', label: '3 Months', discount: 5 },
                { value: 'biannual', label: '6 Months', discount: 10 },
                { value: 'annual', label: '12 Months', discount: 15 }
              ].map((term) => (
                <div
                  key={term.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    billingTerm === term.value
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setBillingTerm(term.value as any)}
                >
                  <div className="text-white font-semibold">{term.label}</div>
                  {term.discount > 0 && (
                    <div className="text-green-400 text-sm">Save {term.discount}%</div>
                  )}
                  {billingTerm === term.value && (
                    <div className="mt-2">
                      <Badge className="bg-green-500">Selected</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedPlan && (
                <div className="flex justify-between items-center">
                  <span className="text-white">{selectedGame.name} - {selectedPlan.name} Plan</span>
                  <span className="text-green-400">${getPriceForTerm(selectedPlan.price_monthly, billingTerm).toFixed(2)}</span>
                </div>
              )}
              
              {selectedBundle && (
                <div className="flex justify-between items-center">
                  <span className="text-white">{selectedBundle.name}</span>
                  <span className="text-green-400">+${getPriceForTerm(selectedBundle.price_monthly, billingTerm).toFixed(2)}</span>
                </div>
              )}
              
              {selectedModpack && selectedModpack.price_monthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white">{selectedModpack.name} Modpack</span>
                  <span className="text-green-400">+${getPriceForTerm(selectedModpack.price_monthly, billingTerm).toFixed(2)}</span>
                </div>
              )}
              
              {Array.from(selectedAddons).map(addonId => {
                const addon = addons.find(a => a.id === addonId);
                return addon ? (
                  <div key={addon.id} className="flex justify-between items-center">
                    <span className="text-white">{addon.name}</span>
                    <span className="text-green-400">+${getPriceForTerm(addon.price_monthly, billingTerm).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
              
              {getDiscountPercentage(billingTerm) > 0 && (
                <div className="flex justify-between items-center text-green-400">
                  <span>Billing Discount ({getDiscountPercentage(billingTerm)}% off)</span>
                  <span>-${(calculateTotal() / (1 - getDiscountPercentage(billingTerm) / 100) - calculateTotal()).toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">${total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-400 text-right">
                  {billingTerm === 'monthly' ? 'per month' : `per ${billingTerm.replace('ly', '').replace('al', '')} period`}
                </div>
              </div>
              
              {selectedBundle && (
                <div className="mt-4">
                  <h4 className="font-semibold text-white mb-2">Included Features:</h4>
                  <div className="space-y-1">
                    {(selectedBundle.features as string[]).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleDeploy}
              disabled={isLoading || !selectedPlan}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Creating Checkout...' : `Deploy Server - $${total.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default DynamicServerConfigurator;