import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Clock,
  CheckCircle,
  Package,
  Ship,
  CreditCard,
  Heart,
  User,
  ChevronRight,
  AlertCircle,
  FileText,
  Truck,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDate } from '../lib/pricingCalculator';
import type { VehicleRequest, Vehicle, Payment } from '../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_quote: { label: 'Pending Quote', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  quote_sent: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: FileText },
  deposit_pending: { label: 'Deposit Pending', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  deposit_paid: { label: 'Deposit Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inspection_pending: { label: 'Inspection Pending', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  inspection_complete: { label: 'Inspection Complete', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  awaiting_approval: { label: 'Awaiting Approval', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  purchase_in_progress: { label: 'Purchasing', color: 'bg-blue-100 text-blue-700', icon: Package },
  purchased: { label: 'Purchased', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  export_pending: { label: 'Export Pending', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Ship },
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Ship },
  arrived_port: { label: 'Arrived at Port', color: 'bg-green-100 text-green-700', icon: MapPin },
  customs_clearance: { label: 'Customs Clearance', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  cleared: { label: 'Cleared', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  delivery_scheduled: { label: 'Delivery Scheduled', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: CreditCard },
};

export function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'saved' | 'payments' | 'profile'>('requests');
  const [requests, setRequests] = useState<(VehicleRequest & { vehicle: Vehicle })[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Requests',
      value: requests.filter(r => !['delivered', 'cancelled', 'refunded'].includes(r.status)).length,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      label: 'In Transit',
      value: requests.filter(r => ['shipped', 'in_transit'].includes(r.status)).length,
      icon: Ship,
      color: 'bg-emerald-500',
    },
    {
      label: 'Delivered',
      value: requests.filter(r => r.status === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount_usd, 0)),
      icon: CreditCard,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {profile?.full_name || 'User'}
              </h1>
              <p className="text-gray-300 mt-1">Manage your vehicle imports</p>
            </div>
            <Link
              to="/vehicles"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-500 transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'requests', label: 'My Requests', icon: Car },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'saved', label: 'Saved', icon: Heart },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600 mb-4">
                  Start browsing vehicles to make your first import request.
                </p>
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Browse Vehicles
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              requests.map((request) => {
                const statusConfig = STATUS_CONFIG[request.status];
                const StatusIcon = statusConfig?.icon || Clock;

                return (
                  <div key={request.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <img
                          src={request.vehicle?.images?.[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={`${request.vehicle?.year} ${request.vehicle?.make} ${request.vehicle?.model}`}
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                Request #{request.request_number}
                              </p>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {request.vehicle?.year} {request.vehicle?.make} {request.vehicle?.model}
                              </h3>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig?.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusConfig?.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Total Cost</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(request.total_landed_cost_usd || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Shipping</p>
                              <p className="font-semibold text-gray-900">
                                {request.shipping_method}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Destination</p>
                              <p className="font-semibold text-gray-900">
                                {request.destination_state}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Est. Delivery</p>
                              <p className="font-semibold text-gray-900">
                                {request.estimated_delivery_date
                                  ? formatDate(request.estimated_delivery_date)
                                  : 'TBD'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Submitted {formatDate(request.created_at)}
                      </p>
                      <Link
                        to={`/request-details/${request.id}`}
                        className="text-emerald-600 font-medium text-sm hover:text-emerald-700 flex items-center gap-1"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
                <p className="text-gray-600">
                  Your payment history will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                        {payment.payment_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount_usd)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved vehicles</h3>
            <p className="text-gray-600 mb-4">
              Save vehicles you're interested in to view them later.
            </p>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={profile?.country || 'Nigeria'}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={profile?.state || ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={profile?.address || ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
