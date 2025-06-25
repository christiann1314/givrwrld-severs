
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Server, Brain, Puzzle, Rocket, Globe, Mail, Heart } from 'lucide-react';

const Blog = () => {
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
        
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-6">
              ← Back to Home
            </Link>
          </div>
          
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-2xl block mb-4">✨</span>
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Inside GIVRwrld
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the latest updates, drops, and innovations powering your gaming world.
            </p>
          </div>

          {/* Server Rentals Section */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <Server className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-3xl font-bold text-white">Server Rentals Just Got Smarter</h2>
            </div>
            <p className="text-gray-300 text-lg mb-6">
              GIVRwrld's new backend update slashes deploy time and simplifies your dashboard.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/40 rounded-lg p-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mb-2"></div>
                <p className="text-gray-200">Instant server deployment</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mb-2"></div>
                <p className="text-gray-200">Easier RAM/CPU configuration</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mb-2"></div>
                <p className="text-gray-200">Streamlined upgrade system</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-300 mb-4">Ready to launch? 🚀</p>
              <Link 
                to="/deploy"
                className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Your Server
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* What Makes GIVRwrld Different */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <Brain className="w-8 h-8 text-purple-400 mr-3" />
              <h2 className="text-3xl font-bold text-white">What Makes GIVRwrld Different</h2>
            </div>
            <p className="text-gray-300 text-lg mb-4">
              This isn't just tech — it's cultural infrastructure.
            </p>
            <p className="text-gray-300 text-lg mb-4">
              We're building a platform for creators, educators, and digital visionaries to shape the future of multiplayer.
            </p>
            <p className="text-gray-300 text-lg mb-8">
              You don't just play — you help shape a living economy of experience and reward.
            </p>
            <div className="text-center">
              <Link 
                to="/about"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                💡 Read Our Philosophy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Choose Your Server Type */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <Puzzle className="w-8 h-8 text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold text-white">Choose Your Server Type Wisely</h2>
            </div>
            <p className="text-gray-300 text-lg mb-8">
              Each GIVRwrld server is a canvas. Which one suits your playstyle?
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/40 rounded-lg p-6">
                <h3 className="text-xl font-bold text-emerald-400 mb-3">Minecraft</h3>
                <p className="text-gray-200">Building, mods, custom adventures</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-3">FiveM</h3>
                <p className="text-gray-200">Roleplay, missions, cinematic worlds</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-3">Palworld</h3>
                <p className="text-gray-200">Creature survival, chaos & creativity</p>
              </div>
            </div>
            <div className="text-center">
              <Link 
                to="/deploy"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                🎮 Compare Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Upgrade Packs */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <Rocket className="w-8 h-8 text-orange-400 mr-3" />
              <h2 className="text-3xl font-bold text-white">Upgrade Packs Are Here</h2>
            </div>
            <p className="text-gray-300 text-lg mb-8">
              Get more out of your server with our three new add-ons:
            </p>
            <div className="space-y-6 mb-8">
              <div className="bg-gray-700/40 rounded-lg p-6">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Essentials</h3>
                <p className="text-gray-200 mb-3">Auto backups, whitelist panel, analytics</p>
                <p className="text-2xl font-bold text-white">$6.99<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-2">Expansion Pack</h3>
                <p className="text-gray-200 mb-3">GTA RP server support, dev mode</p>
                <p className="text-2xl font-bold text-white">$14.99<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-2">Community Pack</h3>
                <p className="text-gray-200 mb-3">Creator credits, blog access, and priority support</p>
                <p className="text-2xl font-bold text-white">$4.99<span className="text-sm font-normal text-gray-400">/mo</span></p>
              </div>
            </div>
            <div className="text-center">
              <Link 
                to="/deploy"
                className="inline-flex items-center text-orange-400 hover:text-orange-300 font-semibold transition-colors"
              >
                ⚙️ View Upgrade Options
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Join the Movement */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-emerald-400 mr-3" />
              <h2 className="text-3xl font-bold text-white">Join the Movement</h2>
            </div>
            <blockquote className="text-xl text-gray-300 italic mb-8 text-center">
              "You're not just hosting a game — you're building a world."
            </blockquote>
            <p className="text-gray-300 text-lg mb-8 text-center">
              Start your journey now. Whether you're launching a server, managing a game panel, or upgrading your experience — GIVRwrld is the launchpad.
            </p>
            <div className="text-center">
              <Link 
                to="/deploy"
                className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔥 Build Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>

          {/* Stay in the Loop */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <Mail className="w-8 h-8 text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold text-white">Stay in the Loop</h2>
            </div>
            <p className="text-gray-300 text-lg mb-6">Sign up to receive:</p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700/40 rounded-lg p-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mb-2"></div>
                <p className="text-gray-200">New upgrade pack announcements</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mb-2"></div>
                <p className="text-gray-200">Behind-the-scenes creator highlights</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mb-2"></div>
                <p className="text-gray-200">Early access to beta tools</p>
              </div>
            </div>
            <div className="text-center">
              <Link 
                to="/signup"
                className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📧 Subscribe to GIVR News
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center">
            <p className="text-gray-300 text-lg mb-4 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400 mr-2" />
              Built with purpose, powered by community.
            </p>
            <p className="text-xl text-gray-200 font-semibold">
              The world you're shaping starts here.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Blog;
