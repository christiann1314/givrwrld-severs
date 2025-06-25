
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Copy, 
  Eye,
  Calendar,
  Share2
} from 'lucide-react';

const DashboardAffiliate = () => {
  const [referralCode] = useState('PLAYER2024');
  const [timeFrame, setTimeFrame] = useState('month');

  const stats = [
    { label: "Total Earnings", value: "$1,250.00", change: "+15.2%", icon: DollarSign },
    { label: "Referrals", value: "23", change: "+3", icon: Users },
    { label: "Conversion Rate", value: "12.5%", change: "+2.1%", icon: TrendingUp },
    { label: "Clicks", value: "184", change: "+12", icon: Eye }
  ];

  const recentReferrals = [
    { id: 1, user: "Alex M.", amount: "$25.00", date: "2024-01-15", plan: "Minecraft 4GB" },
    { id: 2, user: "Sarah K.", amount: "$18.50", date: "2024-01-14", plan: "FiveM 6GB" },
    { id: 3, user: "Mike D.", amount: "$32.00", date: "2024-01-12", plan: "Palworld 8GB" }
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://givrwrld.com/signup?ref=${referralCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Fantasy Forest Background */}
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Affiliate Program
                </span>
              </h1>
              <p className="text-gray-300">Track your referrals and earnings</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="bg-gray-800/60 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="text-emerald-400" size={24} />
                  <span className="text-emerald-400 text-sm font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Referral Link */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1 bg-gray-700/50 border border-gray-600/30 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
                    https://givrwrld.com/signup?ref={referralCode}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm">
                    <Share2 size={16} className="mr-2" />
                    Share on Twitter
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm">
                    <Share2 size={16} className="mr-2" />
                    Share on Discord
                  </button>
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Referrals</h2>
                <div className="space-y-4">
                  {recentReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{referral.user}</div>
                        <div className="text-gray-400 text-sm">{referral.plan}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-semibold">{referral.amount}</div>
                        <div className="text-gray-400 text-sm">{referral.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Affiliate Info */}
            <div className="space-y-6">
              {/* Commission Info */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Commission Structure</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commission Rate:</span>
                    <span className="text-emerald-400 font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cookie Duration:</span>
                    <span className="text-white">90 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Payout:</span>
                    <span className="text-white">$50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Schedule:</span>
                    <span className="text-white">Monthly</span>
                  </div>
                </div>
              </div>

              {/* Next Payout */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Next Payout</h2>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">$1,250.00</div>
                  <div className="text-gray-300 mb-4">Available for withdrawal</div>
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors w-full">
                    Request Payout
                  </button>
                  <p className="text-gray-400 text-sm mt-2">
                    Next automatic payout: February 1st
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Tips for Success</h2>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Share your link in gaming communities</li>
                  <li>• Create content about server hosting</li>
                  <li>• Be transparent about your affiliate status</li>
                  <li>• Focus on helping others find the right plan</li>
                </ul>
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
