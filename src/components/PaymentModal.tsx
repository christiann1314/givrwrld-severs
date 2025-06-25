
import React, { useState } from 'react';
import { X, CreditCard, Shield } from 'lucide-react';
import { Button } from './ui/button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameData: {
    name: string;
    icon: string;
  };
  selectedPlan: {
    ram: string;
    price: number;
  };
  billingPeriod: string;
  addOns: { [key: string]: boolean };
  addOnOptions: Array<{
    key: string;
    name: string;
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
  location
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
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
    switch (billingPeriod) {
      case '3months': return 0.05; // 5% discount
      case '6months': return 0.10; // 10% discount
      case '12months': return 0.20; // 20% discount
      default: return 0;
    }
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

  const subtotal = calculateSubtotal();
  const multiplier = getBillingMultiplier();
  const discount = getBillingDiscount();
  const discountAmount = subtotal * multiplier * discount;
  const totalBeforeDiscount = subtotal * multiplier;
  const finalTotal = totalBeforeDiscount - discountAmount;

  const getBillingLabel = () => {
    switch (billingPeriod) {
      case '3months': return '3 Months';
      case '6months': return '6 Months';
      case '12months': return '12 Months';
      default: return 'Monthly';
    }
  };

  const handlePurchase = () => {
    // Simulate purchase completion
    alert('Purchase completed successfully! Your server will be deployed shortly.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-600/50 rounded-lg flex items-center justify-center text-xl">
                  {gameData.icon}
                </div>
                <div>
                  <div className="text-white font-medium">{gameData.name} Server</div>
                  <div className="text-gray-400 text-sm">{serverName}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bundle:</span>
                  <span className="text-white">{gameData.name} Server</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{getBillingLabel()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RAM:</span>
                  <span className="text-white">{selectedPlan.ram}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{location === 'us-west' ? 'US West' : 'US East'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Billing Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Resources ({getBillingLabel()})</span>
                  <span className="text-white">${totalBeforeDiscount.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-600/50 pt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-emerald-400 font-bold text-lg">${finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-gray-400 text-xs">${finalTotal.toFixed(2)} {multiplier > 1 ? `for ${multiplier} months` : 'monthly effective rate'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-gray-600/50 bg-gray-700/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'
                  }`} />
                  <CreditCard size={20} className="text-gray-300" />
                  <span className="text-white">Credit / Debit Card</span>
                </div>
              </div>
              
              <div
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'paypal' 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-gray-600/50 bg-gray-700/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'paypal' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'
                  }`} />
                  <span className="text-blue-400 font-bold">PayPal</span>
                </div>
              </div>
              
              <div
                onClick={() => setPaymentMethod('crypto')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'crypto' 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-gray-600/50 bg-gray-700/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'crypto' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'
                  }`} />
                  <span className="text-orange-400">₿ Cryptocurrency</span>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4 mt-6">
                <h4 className="text-white font-medium">Payment Details</h4>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
                    placeholder="XXXX XXXX XXXX XXXX"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Expiration Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">CVV</label>
                    <input
                      type="text"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <p className="text-xs text-gray-400 mb-4 flex items-center">
                <Shield size={14} className="mr-2" />
                By proceeding with this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
              
              <Button
                onClick={handlePurchase}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3"
              >
                Complete Purchase
              </Button>
              
              <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
                <Shield size={12} className="mr-1" />
                Secure payment processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
