
import React from 'react';
import { Play, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServerCard from './ServerCard';

const HeroSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Hero Content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="bg-gray-800/60 backdrop-blur-sm text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-500/30">
                Game Server Hosting
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                High-Performance Game Servers On Demand
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Deploy your custom game server in seconds. Premium hardware, instant setup, and 24/7 support for the ultimate gaming experience.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/deploy" className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25">
              <div className="flex items-center justify-center space-x-2">
                <Play size={20} />
                <span>Start Your Server</span>
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            
            <Link to="/about" className="bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border border-gray-600/50 hover:border-emerald-500/50 text-center">
              Learn More
            </Link>
          </div>

          {/* Server Stats */}
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <div className="flex space-x-1">
                {[1,2,3,4].map((dot) => (
                  <div key={dot} className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                ))}
              </div>
              <span className="text-white font-medium">+2,000 active servers</span>
            </div>
            <span className="text-gray-400">—</span>
            <span className="text-white font-medium">Excellent</span>
          </div>
        </div>

        {/* Right Column - Server Cards */}
        <div className="space-y-6">
          <ServerCard
            game="Minecraft"
            icon={<img src="/lovable-uploads/efe9d97d-94d9-4596-b1d7-99f242301c96.png" alt="Minecraft" className="w-8 h-8 rounded" />}
            title="Minecraft Server"
            description="Unlimited creativity"
            price="$3.99"
            buttonColor="emerald"
          />
          
          <ServerCard
            game="Rust"
            icon={<img src="/lovable-uploads/fb115f3f-774a-4094-a15a-b21b90860c1c.png" alt="Rust" className="w-8 h-8 rounded" />}
            title="Rust Server"
            description="Survival multiplayer"
            price="$8.99"
            buttonColor="blue"
          />
          
          <ServerCard
            game="Palworld"
            icon={<img src="/lovable-uploads/814df140-2c65-4cb3-bf50-c135fd795979.png" alt="Palworld" className="w-8 h-8 rounded" />}
            title="Palworld Server"
            description="Creature survival"
            price="$11.99"
            buttonColor="emerald"
          />

          {/* Configure Server Bar */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4 mt-6">
            <Link to="/deploy" className="w-full flex items-center justify-between text-white hover:text-emerald-400 transition-colors group">
              <span className="font-medium">Configure Your Server</span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
