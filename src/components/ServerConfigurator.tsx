
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';

interface ServerConfiguratorProps {
  gameType: 'minecraft' | 'fivem' | 'palworld';
  gameData: {
    name: string;
    icon: string;
    basePrice: number;
    features: string[];
    planOptions: Array<{
      ram: string;
      price: number;
      description: string;
      recommended?: boolean;
    }>;
  };
}

const ServerConfigurator: React.FC<ServerConfiguratorProps> = ({ gameType, gameData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [serverName, setServerName] = useState(`${gameData.name} Server`);
  const [location, setLocation] = useState('us-west');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(gameData.planOptions[0]);
  const [addOns, setAddOns] = useState({
    automaticBackups: false,
    discordIntegration: false,
    advancedAnalytics: false,
    additionalStorage: false,
  });

  const steps = [
    { number: 1, title: 'Configure', completed: currentStep > 1 },
    { number: 2, title: 'Pick Plan', completed: currentStep > 2 },
    { number: 3, title: 'Review', completed: false },
  ];

  const locations = [
    { value: 'us-east', label: 'US East (Virginia)', ping: '5-15ms avg ping' },
    { value: 'us-west', label: 'US West (California)', ping: '8-20ms avg ping' },
  ];

  const billingOptions = [
    { value: 'monthly', label: 'Monthly', discount: 'No commitment' },
    { value: '3months', label: '3 Months', discount: '3 months upfront saved' },
    { value: '6months', label: '6 Months', discount: '6 months upfront saved', popular: true },
    { value: '12months', label: '12 Months', discount: '12 months upfront saved' },
  ];

  const addOnOptions = [
    {
      key: 'automaticBackups' as keyof typeof addOns,
      name: 'Automatic Backups',
      description: 'Daily backups with 7-day retention to prevent data loss.',
      price: 2.99,
    },
    {
      key: 'discordIntegration' as keyof typeof addOns,
      name: 'Discord Integration',
      description: 'Sync server status and chat with your Discord.',
      price: 1.49,
    },
    {
      key: 'advancedAnalytics' as keyof typeof addOns,
      name: 'Advanced Analytics',
      description: 'Real-time player activity, mod/resource usage, and crash stats.',
      price: 3.99,
    },
    {
      key: 'additionalStorage' as keyof typeof addOns,
      name: 'Additional SSD Storage',
      description: 'Expand your NVMe storage incrementally for more world files or modpacks. (+50 GB per addon)',
      price: 2.50,
    },
  ];

  const calculateTotal = () => {
    let total = selectedPlan.price;
    Object.entries(addOns).forEach(([key, enabled]) => {
      if (enabled) {
        const addOn = addOnOptions.find(option => option.key === key);
        if (addOn) total += addOn.price;
      }
    });
    return total.toFixed(2);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              step.completed 
                ? 'bg-emerald-500 text-white' 
                : currentStep === step.number 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-700 text-gray-300'
            }`}>
              {step.completed ? <Check size={16} /> : step.number}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep === step.number ? 'text-white' : 'text-gray-400'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 ${
              step.completed ? 'bg-emerald-500' : 'bg-gray-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Game & Server Name</h3>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-2xl">
            {gameData.icon}
          </div>
          <div>
            <div className="text-sm text-gray-400">Selected Game</div>
            <div className="text-white font-semibold">{gameData.name}</div>
            <div className="text-xs text-gray-500">Latest version supported</div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Server Name</label>
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
            placeholder="Enter server name"
          />
          <div className="text-xs text-gray-500 mt-1">This will be visible to players</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Server Location</h3>
        <p className="text-gray-400 text-sm mb-4">Choose the location closest to your players for optimal performance</p>
        <RadioGroup value={location} onValueChange={setLocation} className="space-y-3">
          {locations.map((loc) => (
            <div key={loc.value} className="flex items-center space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-600/30">
              <RadioGroupItem value={loc.value} id={loc.value} />
              <label htmlFor={loc.value} className="flex-1 cursor-pointer">
                <div className="text-white font-medium">{loc.label}</div>
                <div className="text-gray-400 text-sm">{loc.ping}</div>
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Billing Period</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {billingOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => setBillingPeriod(option.value)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                billingPeriod === option.value
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-600/50 bg-gray-800/40'
              } ${option.popular ? 'ring-2 ring-emerald-500/30' : ''}`}
            >
              {option.popular && (
                <div className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full w-fit mb-2">
                  POPULAR
                </div>
              )}
              <div className="text-white font-semibold">{option.label}</div>
              <div className="text-gray-400 text-xs">{option.discount}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Optional Add-ons</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {addOnOptions.map((addOn) => (
            <div key={addOn.key} className="flex items-start space-x-3 p-4 bg-gray-800/40 rounded-lg border border-gray-600/30">
              <Switch
                checked={addOns[addOn.key]}
                onCheckedChange={(checked) => setAddOns(prev => ({ ...prev, [addOn.key]: checked }))}
              />
              <div className="flex-1">
                <div className="text-white font-medium">{addOn.name}</div>
                <div className="text-gray-400 text-sm">{addOn.description}</div>
                <div className="text-emerald-400 font-semibold text-sm mt-1">+${addOn.price}/month</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlanStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Pick plan</h3>
        <div className="flex space-x-4 mb-6">
          {gameData.planOptions.map((plan) => (
            <button
              key={plan.ram}
              onClick={() => setSelectedPlan(plan)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedPlan.ram === plan.ram
                  ? 'border-emerald-500 bg-emerald-500/10 text-white'
                  : 'border-gray-600/50 bg-gray-800/40 text-gray-300'
              }`}
            >
              {plan.ram}
            </button>
          ))}
        </div>
        <div className="text-emerald-400 text-sm">{selectedPlan.description}</div>
      </div>

      <div className="bg-gray-800/60 rounded-lg p-6">
        <h4 className="text-white font-semibold mb-4">This server includes:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {gameData.features.map((feature, index) => (
              <div key={index} className="flex items-center text-gray-300 text-sm">
                <Check size={16} className="text-emerald-400 mr-3" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400">{selectedPlan.ram}</div>
              <div className="text-gray-400 text-sm">RAM</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Up to</span>
                <span className="text-white">10 players</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ryzen 9 5950X</span>
                <span className="text-white">Premium CPU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">75 GB NVMe SSD</span>
                <span className="text-white">High-speed storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Review Your Order</h3>
        <p className="text-gray-400">Please review your server configuration before proceeding to payment</p>
      </div>

      <div className="bg-gray-800/60 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-2xl">
            {gameData.icon}
          </div>
          <div>
            <h4 className="text-white font-semibold">{gameData.name} Server</h4>
            <p className="text-gray-400 text-sm">{serverName}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-gray-400 text-sm">Location</div>
            <div className="text-white">US West (California)</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">CPU</div>
            <div className="text-white">Ryzen 5950X</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">RAM</div>
            <div className="text-white">{selectedPlan.ram}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">Storage</div>
            <div className="text-white">75 GB</div>
          </div>
        </div>

        <div className="border-t border-gray-600/50 pt-4">
          <h5 className="text-white font-semibold mb-4">Billing Summary</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Server Resources</span>
              <span className="text-white">${selectedPlan.price.toFixed(2)}/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Billing Period</span>
              <span className="text-white">1 month</span>
            </div>
            {Object.entries(addOns).map(([key, enabled]) => {
              if (!enabled) return null;
              const addOn = addOnOptions.find(option => option.key === key);
              return (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400">{addOn?.name}</span>
                  <span className="text-white">+${addOn?.price.toFixed(2)}/month</span>
                </div>
              );
            })}
            <div className="border-t border-gray-600/50 pt-2 mt-4">
              <div className="flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-emerald-400 font-bold text-xl">${calculateTotal()}</span>
              </div>
              <div className="text-gray-400 text-sm">Effective rate: ${calculateTotal()}/month</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
          <h6 className="text-white font-semibold mb-3">What's Included</h6>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              99.9% uptime SLA
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              DDoS protection
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              24/7 support
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              One-click game updates
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              Control panel access
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              Automatic mod installation
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              Free subdomain
            </div>
            <div className="flex items-center text-gray-300">
              <Check size={14} className="text-emerald-400 mr-2" />
              SSL certificate
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepIndicator()}
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8">
            {currentStep === 1 && renderConfigureStep()}
            {currentStep === 2 && renderPlanStep()}
            {currentStep === 3 && renderReviewStep()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <div className="text-right mb-4">
              <div className="text-3xl font-bold text-white">
                ${calculateTotal()}
                <span className="text-lg font-normal text-gray-400">/mo</span>
              </div>
              <div className="text-gray-400 text-sm">Looking for a lifetime plan? Inquire now</div>
            </div>

            <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 mb-4">
              {currentStep === 3 ? 'Deploy Server' : `Select The ${selectedPlan.ram} Plan`}
            </Button>

            <div className="space-y-3 text-sm">
              <h6 className="text-white font-semibold">Server Configuration</h6>
              <div className="flex justify-between">
                <span className="text-gray-400">Game:</span>
                <span className="text-white">{gameData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RAM:</span>
                <span className="text-white">{selectedPlan.ram}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CPU:</span>
                <span className="text-white">Ryzen 9 5950X</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Storage:</span>
                <span className="text-white">75 GB NVMe SSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">1 month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">${calculateTotal()}</span>
              </div>
              <div className="border-t border-gray-600/50 pt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-emerald-400 font-bold">${calculateTotal()}</span>
                </div>
                <div className="text-gray-400 text-xs">${calculateTotal()}/month effective rate</div>
              </div>
            </div>

            <div className="flex items-center mt-4 text-xs text-gray-400">
              <span className="mr-2">🔒</span>
              Secure payment processing
            </div>
          </div>

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </Button>
            )}
            {currentStep < 3 && (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center space-x-2 ml-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerConfigurator;
