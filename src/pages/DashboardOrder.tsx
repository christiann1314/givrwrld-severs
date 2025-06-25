
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  Search,
  Filter
} from 'lucide-react';

const DashboardOrder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = [
    {
      id: 'ORD-001',
      service: 'Minecraft Server - 4GB RAM',
      status: 'active',
      amount: '$14.00',
      date: '2024-01-15',
      nextBilling: '2024-02-15',
      duration: '1 month'
    },
    {
      id: 'ORD-002',
      service: 'FiveM Server - 8GB RAM',
      status: 'active',
      amount: '$24.50',
      date: '2024-01-10',
      nextBilling: '2024-02-10',
      duration: '1 month'
    },
    {
      id: 'ORD-003',
      service: 'GIVRwrld Essentials Package',
      status: 'completed',
      amount: '$14.99',
      date: '2024-01-05',
      nextBilling: '2024-02-05',
      duration: '1 month'
    },
    {
      id: 'ORD-004',
      service: 'Palworld Server - 16GB RAM',
      status: 'cancelled',
      amount: '$48.00',
      date: '2023-12-20',
      nextBilling: '-',
      duration: '1 month'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Orders", value: "4", icon: Package },
    { label: "Active Services", value: "2", icon: CheckCircle },
    { label: "This Month", value: "$53.49", icon: Clock },
    { label: "Total Spent", value: "$101.49", icon: Package }
  ];

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Order History
              </span>
            </h1>
            <p className="text-gray-300">View and manage your service orders</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="text-emerald-400" size={24} />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Orders Section */}
          <div className="bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-xl p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-semibold">{order.service}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>Order #{order.id}</span>
                        <span>Duration: {order.duration}</span>
                        <span>Ordered: {order.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white mb-1">{order.amount}</div>
                      {order.nextBilling !== '-' && (
                        <div className="text-gray-400 text-sm">Next: {order.nextBilling}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {order.status === 'active' && (
                        <span className="text-emerald-400 text-sm">
                          ✓ Service Running
                        </span>
                      )}
                      {order.status === 'completed' && (
                        <span className="text-blue-400 text-sm">
                          ✓ Service Completed
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="text-red-400 text-sm">
                          ✗ Service Cancelled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center">
                        <Eye size={16} className="mr-1" />
                        View Details
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
                        <Download size={16} className="mr-1" />
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'You haven\'t placed any orders yet.'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link 
                    to="/deploy"
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Deploy Your First Server
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardOrder;
