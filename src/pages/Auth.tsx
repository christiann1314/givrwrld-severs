import React, { useState, useEffect } from 'react';
import { UserPlus, ArrowLeft, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp, signIn, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = location.state?.returnTo || '/dashboard';
  const message = location.state?.message;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've been logged in successfully.",
          });
          navigate('/'); // Always redirect to home page after login
        }
      } else {
        // Sign up
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration.",
          });
          setIsLogin(true); // Switch to login view
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden flex items-center justify-center">
      {/* Fantasy Forest Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/lovable-uploads/d7519b8a-ef97-4e1a-a24e-a446d044f2ac.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-emerald-900/30"></div>
      </div>

      {/* Back Button */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Auth Form */}
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/9dd7d65a-1866-4205-bcbb-df3788eea144.png"
                alt="GIVRwrld"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-white">GIVRwrld</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Join the Movement'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to your gaming account' : 'Create your gaming account today'}
            </p>
            
            {/* Show message if redirected from purchase */}
            {message && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-300 text-sm">{message}</p>
              </div>
            )}
          </div>

          {/* Toggle between Login/Signup */}
          <div className="flex mb-6 bg-gray-700/50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
                Forgot your password?
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;