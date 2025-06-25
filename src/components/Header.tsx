
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, HelpCircle, MessageCircle, User, LogIn, UserPlus, ChevronDown } from 'lucide-react';

const Header = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/70 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-2xl font-bold text-white">GIVRwrld</span>
            <span className="bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Servers
            </span>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-white hover:text-emerald-400 transition-colors">
              <Home size={16} />
              <span>Home</span>
            </Link>
            <Link to="/discord" className="flex items-center space-x-1 text-gray-300 hover:text-emerald-400 transition-colors">
              <MessageCircle size={16} />
              <span>Discord</span>
            </Link>
            <Link to="/faq" className="flex items-center space-x-1 text-gray-300 hover:text-emerald-400 transition-colors">
              <HelpCircle size={16} />
              <span>FAQ</span>
            </Link>
            <Link to="/support" className="flex items-center space-x-1 text-gray-300 hover:text-emerald-400 transition-colors">
              <Users size={16} />
              <span>Support</span>
            </Link>
          </nav>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <User size={16} />
              <span>Account</span>
              <ChevronDown size={14} />
            </button>
            
            {isAccountOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-lg border border-emerald-500/20 shadow-xl z-50">
                <div className="py-2">
                  <Link to="/login" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-colors">
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/signup" className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-colors">
                    <UserPlus size={16} />
                    <span>Sign Up</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
