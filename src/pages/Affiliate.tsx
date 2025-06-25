
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, DollarSign, Calendar, Trophy, Target, Gift } from 'lucide-react';

const Affiliate = () => {
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
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-emerald-900/20"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="block text-emerald-400 text-lg mb-2">TURN YOUR AUDIENCE</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
                INTO A SERVER-OWNING EMPIRE
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              GIVRwrld is built on partnership, education, and community. Join our affiliate program and get rewarded for 
              sharing what you already love while helping others discover the power of custom game servers.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Join the Affiliate Program
            </button>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <Trophy className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-3xl font-bold text-center">How It Works</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-4">1️⃣</div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Sign Up</h3>
                <p className="text-gray-300 text-sm">Apply to become an affiliate partner</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-4">2️⃣</div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Share</h3>
                <p className="text-gray-300 text-sm">Promote GIVRwrld servers to your audience</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-4">3️⃣</div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Earn</h3>
                <p className="text-gray-300 text-sm">Get paid for every referral</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-4">4️⃣</div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Scale</h3>
                <p className="text-gray-300 text-sm">Build your server-owning empire</p>
              </div>
            </div>
          </div>

          {/* Commission Rates */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <DollarSign className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-3xl font-bold text-center">Commission Rates</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/60 backdrop-blur-md border border-emerald-500/50 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-emerald-400 mb-4">Bronze</h3>
                <div className="text-4xl font-bold text-white mb-2">15%</div>
                <p className="text-gray-300 mb-4">First-time referrals</p>
                <div className="text-sm text-gray-400">
                  <p>• Standard commission rate</p>
                  <p>• Monthly payouts</p>
                  <p>• Basic analytics</p>
                </div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-blue-500/50 rounded-xl p-8 text-center relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Silver</h3>
                <div className="text-4xl font-bold text-white mb-2">20%</div>
                <p className="text-gray-300 mb-4">10+ monthly referrals</p>
                <div className="text-sm text-gray-400">
                  <p>• Higher commission rate</p>
                  <p>• Priority support</p>
                  <p>• Advanced analytics</p>
                </div>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-purple-500/50 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-purple-400 mb-4">Gold</h3>
                <div className="text-4xl font-bold text-white mb-2">25%</div>
                <p className="text-gray-300 mb-4">25+ monthly referrals</p>
                <div className="text-sm text-gray-400">
                  <p>• Highest commission rate</p>
                  <p>• Custom promotional materials</p>
                  <p>• Direct partnership manager</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Methods */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <Calendar className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-3xl font-bold text-center">Payout & Bonuses</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-8">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">Payout Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">PayPal (Minimum $50)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">Bank Transfer (Minimum $100)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">Crypto (Minimum $25)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">GIVRwrld Credits (No minimum)</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-8">
                <h3 className="text-xl font-bold text-purple-400 mb-4">Bonus Structure</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">$500 bonus at 50 referrals</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">$1,000 bonus at 100 referrals</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">Custom partnership at 200+</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    <span className="text-gray-200">Revenue sharing opportunities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Who Should Join */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <Users className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-3xl font-bold text-center">Perfect For</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-all duration-300">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-white mb-2">Content Creators</h3>
                <p className="text-gray-300 text-sm">YouTubers, streamers, and gaming influencers</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all duration-300">
                <div className="text-4xl mb-4">🎭</div>
                <h3 className="text-lg font-semibold text-white mb-2">Community Leaders</h3>
                <p className="text-gray-300 text-sm">Discord admins and gaming community managers</p>
              </div>
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all duration-300">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-lg font-semibold text-white mb-2">Gaming Enthusiasts</h3>
                <p className="text-gray-300 text-sm">Anyone passionate about gaming and servers</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-md border border-gray-600/30 rounded-xl p-12">
            <div className="flex items-center justify-center mb-6">
              <Gift className="w-12 h-12 text-emerald-400 mr-4" />
              <h2 className="text-3xl font-bold">Ready to Start Earning?</h2>
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already earning with GIVRwrld. 
              Start your affiliate journey today and turn your passion into profit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Apply Now
              </button>
              <Link 
                to="/about"
                className="inline-flex items-center border border-gray-600 hover:border-emerald-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300"
              >
                Learn More About Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Affiliate;
