
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface UpgradePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    name: string;
    price: string;
    features: string[];
  };
}

const UpgradePaymentModal: React.FC<UpgradePaymentModalProps> = ({
  isOpen,
  onClose,
  packageData,
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCompletePurchase = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      navigate('/purchase-confirmed', { 
        state: { 
          package: packageData.name,
          price: packageData.price,
          features: packageData.features
        }
      });
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Complete Your Purchase</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Package Summary */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">{packageData.name}</h3>
            <div className="text-3xl font-bold text-emerald-400 mb-4">{packageData.price}</div>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium">Included Features:</h4>
              <div className="grid gap-1">
                {packageData.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-300 text-sm">
                    <Check size={14} className="text-emerald-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {packageData.features.length > 4 && (
                  <div className="text-gray-400 text-sm">
                    +{packageData.features.length - 4} more features
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Payment Method</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-700/50 rounded-lg border border-emerald-500 cursor-pointer">
                <div className="text-center">
                  <div className="text-emerald-400 font-semibold text-sm">Credit Card</div>
                  <div className="text-xs text-gray-400 mt-1">Visa, Mastercard</div>
                </div>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer hover:border-gray-500">
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">PayPal</div>
                  <div className="text-xs text-gray-400 mt-1">Secure payment</div>
                </div>
              </div>
              <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600 cursor-pointer hover:border-gray-500">
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">Crypto</div>
                  <div className="text-xs text-gray-400 mt-1">Bitcoin, ETH</div>
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
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompletePurchase}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white"
            >
              {isProcessing ? 'Processing...' : `Purchase for ${packageData.price}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePaymentModal;
