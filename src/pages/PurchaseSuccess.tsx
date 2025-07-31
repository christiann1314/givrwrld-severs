import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Server, ExternalLink, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseData {
  id: string;
  plan_name: string;
  amount: number;
  created_at: string;
  pterodactyl_url?: string;
}

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch the latest purchase for this user
        const { data: purchases, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching purchase:', error);
          setLoading(false);
          return;
        }

        if (purchases && purchases.length > 0) {
          const purchase = purchases[0];
          
          // Also fetch server data to get pterodactyl URL
          const { data: servers } = await supabase
            .from('user_servers')
            .select('pterodactyl_url')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

          setPurchaseData({
            ...purchase,
            pterodactyl_url: servers?.[0]?.pterodactyl_url
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch purchase data:', error);
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/lovable-uploads/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Payment Successful!
              </span>
            </h1>
            <p className="text-xl text-gray-300">Your server is being set up and will be ready shortly.</p>
          </div>

          {purchaseData && (
            <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Order Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Server Plan</h3>
                  <p className="text-white text-xl">{purchaseData.plan_name}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Amount Paid</h3>
                  <p className="text-white text-xl">${Number(purchaseData.amount).toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Order ID</h3>
                  <p className="text-white font-mono">{purchaseData.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Purchase Date</h3>
                  <p className="text-white">{new Date(purchaseData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/dashboard/services"
              className="flex items-center justify-between p-6 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl transition-all group"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">View My Servers</h3>
                <p className="text-gray-300">Manage and monitor your game servers</p>
              </div>
              <ArrowRight size={24} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            {purchaseData?.pterodactyl_url && (
              <a
                href={purchaseData.pterodactyl_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl transition-all group"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Game Panel</h3>
                  <p className="text-gray-300">Access your server control panel</p>
                </div>
                <ExternalLink size={24} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
              </a>
            )}
          </div>

          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">What's Next?</h3>
            <div className="space-y-3 text-gray-300">
              <p>• Your server is being automatically provisioned and will be ready within 5-10 minutes</p>
              <p>• You'll receive connection details via email once setup is complete</p>
              <p>• Visit your dashboard to monitor setup progress and access server controls</p>
              <p>• Need help? Our support team is available 24/7 to assist you</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
            >
              <Server size={20} />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default PurchaseSuccess;