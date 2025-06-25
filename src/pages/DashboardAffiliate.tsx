
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Share2,
  Copy,
  TrendingUp,
  Calendar,
  Gift,
  ExternalLink,
  Trophy
} from 'lucide-react';

const DashboardAffiliate = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  const affiliateLink = "https://givrwrld.com/ref/christian-nelson";
  
  const stats = [
    { label: 'Total Referrals', value: '23', icon: Users, color: 'text-emerald-400', change: '+5 this month' },
    { label: 'Total Earnings', value: '$234.50', icon: DollarSign, color: 'text-blue-400', change: '+$45.20 this month' },
    { label: 'Active Customers', value: '18', icon: TrendingUp, color: 'text-purple-400', change: '+3 this month' },
    { label: 'Commission Rate', value: '15%', icon: Gift, color: 'text-pink-400', change: 'Standard rate' }
  ];

  const recentReferrals = [
    { email: 'john.doe@email.com', date: '2024-01-15', status: 'Active', commission: '$15.00', plan: 'Premium' },
    { email: 'jane.smith@email.com', date: '2024-01-12', status: 'Active', commission: '$10.50', plan: 'Basic' },
    { email: 'mike.wilson@email.com', date: '2024-01-10', status: 'Pending', commission: '$0.00', plan: 'Premium' },
    { email: 'sarah.johnson@email.com', date: '2024-01-08', status: 'Active', commission: '$15.00', plan: 'Premium' },
    { email: 'alex.brown@email.com', date: '2024-01-05', status: 'Active', commission: '$7.50', plan: 'Starter' }
  ];

  const payoutHistory = [
    { date: '2024-01-01', amount: '$125.50', status: 'Completed', method: 'PayPal' },
    { date: '2023-12-01', amount: '$89.20', status: 'Completed', method: 'Bank Transfer' },
    { date: '2023-11-01', amount: '$156.80', status: 'Completed', method: 'PayPal' },
    { date: '2023-10-01', amount: '$78.90', status: 'Completed', method: 'PayPal' }
  ];

  const copyAffiliateLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/20 text-emerald-400';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'Completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Forest Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Affiliate Program
              </span>
            </h1>
            <p className="text-gray-300">Earn commissions by referring new customers to GIVRwrld</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={stat.color} size={24} />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{stat.change}</div>
                </div>
              );
            })}
          </div>

          {/* Affiliate Link Section */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Share2 className="mr-2 text-emerald-400" size={24} />
              Your Affiliate Link
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                <code className="text-emerald-400 text-sm break-all">{affiliateLink}</code>
              </div>
              <button
                onClick={copyAffiliateLink}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center ${
                  copiedLink
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Copy size={16} className="mr-2" />
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <p className="text-emerald-400 text-sm">
                💡 <strong>Tip:</strong> Share this link on social media, forums, or with friends to start earning commissions!
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 mb-8">
            <div className="flex space-x-6 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <TrendingUp size={20} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                  activeTab === 'referrals'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Users size={20} />
                <span>Referrals</span>
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
                  activeTab === 'payouts'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <DollarSign size={20} />
                <span>Payouts</span>
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">How it Works</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Share2 className="text-emerald-400" size={24} />
                      </div>
                      <h5 className="font-medium text-white mb-2">1. Share Your Link</h5>
                      <p className="text-sm text-gray-400">Share your unique affiliate link with friends and on social media</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="text-blue-400" size={24} />
                      </div>
                      <h5 className="font-medium text-white mb-2">2. People Sign Up</h5>
                      <p className="text-sm text-gray-400">When someone signs up using your link, they become your referral</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="text-purple-400" size={24} />
                      </div>
                      <h5 className="font-medium text-white mb-2">3. Earn Commission</h5>
                      <p className="text-sm text-gray-400">Earn 15% commission on their first payment and 5% on renewals</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Commission Structure</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">First Payment</span>
                      <span className="text-emerald-400 font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Recurring Payments</span>
                      <span className="text-blue-400 font-semibold">5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Minimum Payout</span>
                      <span className="text-purple-400 font-semibold">$50</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-white">Recent Referrals</h4>
                  <span className="text-sm text-gray-400">Last 30 days</span>
                </div>
                <div className="space-y-3">
                  {recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="text-white font-medium">{referral.email}</div>
                        <div className="text-sm text-gray-400">
                          {referral.date} • {referral.plan} Plan
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">{referral.commission}</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-white">Payout History</h4>
                  <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                    Request Payout
                  </button>
                </div>
                <div className="space-y-3">
                  {payoutHistory.map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{payout.amount}</div>
                        <div className="text-sm text-gray-400">{payout.date} • {payout.method}</div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Promotional Materials */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="mr-2 text-emerald-400" size={24} />
              Promotional Materials
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Banners & Graphics</h4>
                <div className="space-y-2">
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <span className="text-gray-300">728x90 Banner</span>
                    <ExternalLink className="text-emerald-400" size={16} />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <span className="text-gray-300">300x250 Square</span>
                    <ExternalLink className="text-emerald-400" size={16} />
                  </a>
                  <a href="#" className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <span className="text-gray-300">Social Media Kit</span>
                    <ExternalLink className="text-emerald-400" size={16} />
                  </a>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Text & Copy</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-sm text-gray-300 mb-2">Email Template</div>
                    <div className="text-xs text-gray-500">Ready-to-use email templates for promotion</div>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-sm text-gray-300 mb-2">Social Media Posts</div>
                    <div className="text-xs text-gray-500">Pre-written posts for Twitter, Facebook, and more</div>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-sm text-gray-300 mb-2">Review Templates</div>
                    <div className="text-xs text-gray-500">Templates for writing reviews and testimonials</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardAffiliate;
