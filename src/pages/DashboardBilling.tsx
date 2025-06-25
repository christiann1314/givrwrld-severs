
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ArrowLeft,
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Edit3,
  RefreshCw
} from 'lucide-react';

const DashboardBilling = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const billingStats = [
    { label: 'Current Balance', value: '$0.00', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'This Month', value: '$29.99', icon: Calendar, color: 'text-blue-400' },
    { label: 'Next Payment', value: 'Jan 15, 2025', icon: Clock, color: 'text-purple-400' },
    { label: 'Total Spent', value: '$149.95', icon: CreditCard, color: 'text-pink-400' }
  ];

  const invoices = [
    {
      id: 'INV-2024-001',
      date: 'Dec 15, 2024',
      amount: '$29.99',
      status: 'paid',
      description: 'Palworld Server - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-002',
      date: 'Nov 15, 2024',
      amount: '$29.99',
      status: 'paid',
      description: 'Palworld Server - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-003',
      date: 'Oct 15, 2024',
      amount: '$29.99',
      status: 'paid',
      description: 'Palworld Server - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-004',
      date: 'Sep 15, 2024',
      amount: '$29.99',
      status: 'paid',
      description: 'FiveM Server - Monthly',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-005',
      date: 'Aug 15, 2024',
      amount: '$29.99',
      status: 'failed',
      description: 'FiveM Server - Monthly',
      downloadUrl: '#'
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      last4: '8888',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ];

  const subscriptions = [
    {
      id: 1,
      name: 'Palworld HQ Server',
      plan: '8GB RAM • 4 vCPU',
      price: '$29.99',
      interval: 'monthly',
      nextBilling: 'Jan 15, 2025',
      status: 'active'
    },
    {
      id: 2,
      name: 'FiveM RP City',
      plan: '8GB RAM • 4 vCPU',
      price: '$29.99',
      interval: 'monthly',
      nextBilling: 'Suspended',
      status: 'suspended'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'suspended':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return <CheckCircle size={16} />;
      case 'failed':
        return <AlertCircle size={16} />;
      case 'pending':
      case 'suspended':
        return <Clock size={16} />;
      default:
        return <AlertCircle size={16} />;
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
                Billing & Payments
              </span>
            </h1>
            <p className="text-gray-300">Manage your subscriptions, payment methods, and billing history</p>
          </div>

          {/* Billing Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {billingStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6 text-center">
                  <Icon className={`mx-auto mb-3 ${stat.color}`} size={32} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Tabs Navigation */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl mb-6">
            <div className="flex border-b border-gray-600/30">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'subscriptions', label: 'Subscriptions' },
                { id: 'invoices', label: 'Invoices' },
                { id: 'payment-methods', label: 'Payment Methods' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Current Usage</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Servers</span>
                          <span className="text-white font-semibold">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Cost</span>
                          <span className="text-white font-semibold">$29.99</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Next Billing</span>
                          <span className="text-white font-semibold">Jan 15, 2025</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-4 py-3 rounded-lg transition-colors text-left">
                          <div className="flex items-center space-x-3">
                            <Plus size={16} />
                            <span>Add Payment Method</span>
                          </div>
                        </button>
                        <button className="w-full bg-gray-600/30 hover:bg-gray-600/50 text-gray-300 px-4 py-3 rounded-lg transition-colors text-left">
                          <div className="flex items-center space-x-3">
                            <Download size={16} />
                            <span>Download Invoices</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscriptions Tab */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Active Subscriptions</h3>
                    <Link
                      to="/dashboard/order"
                      className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                      <span>New Subscription</span>
                    </Link>
                  </div>

                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-white font-semibold">{subscription.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                              {getStatusIcon(subscription.status)}
                              <span className="ml-1 capitalize">{subscription.status}</span>
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{subscription.plan}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-400">
                              {subscription.price}/{subscription.interval}
                            </span>
                            <span className="text-gray-400">
                              Next billing: {subscription.nextBilling}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Billing History</h3>
                    <button className="flex items-center space-x-2 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 px-4 py-2 rounded-lg transition-colors">
                      <Download size={16} />
                      <span>Export All</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-600/30">
                          <th className="text-left py-3 text-gray-400 font-medium">Invoice</th>
                          <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                          <th className="text-left py-3 text-gray-400 font-medium">Description</th>
                          <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                          <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-gray-700/30">
                            <td className="py-4 text-white font-mono text-sm">{invoice.id}</td>
                            <td className="py-4 text-gray-300">{invoice.date}</td>
                            <td className="py-4 text-gray-300">{invoice.description}</td>
                            <td className="py-4 text-white font-semibold">{invoice.amount}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                                {getStatusIcon(invoice.status)}
                                <span className="ml-1 capitalize">{invoice.status}</span>
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <button className="p-1 text-gray-400 hover:text-emerald-400 transition-colors">
                                  <Download size={14} />
                                </button>
                                {invoice.status === 'failed' && (
                                  <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                                    <RefreshCw size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment-methods' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
                    <button className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                      <Plus size={16} />
                      <span>Add Card</span>
                    </button>
                  </div>

                  {paymentMethods.map((method) => (
                    <div key={method.id} className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                            <CreditCard className="text-white" size={16} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-semibold">
                                {method.brand} •••• {method.last4}
                              </span>
                              {method.isDefault && (
                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button className="text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardBilling;
