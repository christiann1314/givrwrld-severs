
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData: {
    name: string;
    icon: string | React.ReactNode;
    basePrice: number;
    features: string[];
  };
  selectedPlan: {
    ram: string;
    price: number;
    description: string;
    recommended?: boolean;
  };
  billingPeriod: string;
  addOns: Record<string, boolean>;
  addOnOptions: Array<{
    key: string;
    name: string;
    description: string;
    price: number;
  }>;
  serverName: string;
  location: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  gameData,
  selectedPlan,
  billingPeriod,
  addOns,
  addOnOptions,
  serverName,
  location,
}) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  if (!isOpen) return null;

  const getBillingMultiplier = () => {
    switch (billingPeriod) {
      case '3months': return 3;
      case '6months': return 6;
      case '12months': return 12;
      default: return 1;
    }
  };

  const getBillingDiscount = () => {
    const billingOptions = [
      { value: 'monthly', discountPercent: 0 },
      { value: '3months', discountPercent: 5 },
      { value: '6months', discountPercent: 10 },
      { value: '12months', discountPercent: 20 },
    ];
    const option = billingOptions.find(opt => opt.value === billingPeriod);
    return option ? option.discountPercent / 100 : 0;
  };

  const calculateSubtotal = () => {
    let total = selectedPlan.price;
    Object.entries(addOns).forEach(([key, enabled]) => {
      if (enabled) {
        const addOn = addOnOptions.find(option => option.key === key);
        if (addOn) total += addOn.price;
      }
    });
    return total;
  };

  const calculateActualTotal = () => {
    const subtotal = calculateSubtotal();
    const multiplier = getBillingMultiplier();
    const discount = getBillingDiscount();
    const totalBeforeDiscount = subtotal * multiplier;
    const discountAmount = totalBeforeDiscount * discount;
    return totalBeforeDiscount - discountAmount;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Complete Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Server Summary */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-600/50 rounded-lg flex items-center justify-center">
                {typeof gameData.icon === 'string' ? gameData.icon : gameData.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold">{gameData.name} Server</h3>
                <p className="text-gray-400 text-sm">{serverName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">RAM:</span>
                <span className="text-white ml-2">{selectedPlan.ram}</span>
              </div>
              <div>
                <span className="text-gray-400">Location:</span>
                <span className="text-white ml-2">US West</span>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Billing Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Server Plan</span>
                <span className="text-white">${selectedPlan.price.toFixed(2)}/month</span>
              </div>
              
              {Object.entries(addOns).map(([key, enabled]) => {
                if (!enabled) return null;
                const addOn = addOnOptions.find(option => option.key === key);
                if (!addOn) return null;
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-400">{addOn.name}</span>
                    <span className="text-white">${addOn.price.toFixed(2)}/month</span>
                  </div>
                );
              })}
              
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-emerald-400 font-bold">${calculateActualTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Payment Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Card Number"
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="MM/YY"
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="CVC"
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="ZIP Code"
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
            >
              Complete Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
