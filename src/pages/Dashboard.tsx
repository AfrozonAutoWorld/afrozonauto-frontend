import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
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
import { formatCurrency } from '../lib/pricingCalculator';
import type { VehicleRequest, Vehicle, Payment } from '../types';
import { useAuthStore } from '../lib/authStore';
import { useAuthQuery } from '../hooks/useAuth';

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
  const { user, isAuthenticated } = useAuthStore();
  const { forgotPassword } = useAuthQuery();

  const [activeTab, setActiveTab] = useState<'requests' | 'saved' | 'payments' | 'profile'>('requests');
  const [requests, setRequests] = useState<(VehicleRequest & { vehicle: Vehicle })[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Early return with redirect - NO useEffect needed
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Fetch data when user is available
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch requests and payments here
      // const requestsData = await api.getRequests();
      // const paymentsData = await api.getPayments();
      // setRequests(requestsData);
      // setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmChangePassword = async () => {
    if (!user?.email) return;

    try {
      setChangingPassword(true);
      await forgotPassword({ email: user.email });
      setShowConfirmModal(false);
    } finally {
      setChangingPassword(false);
    }
  };


  if (loading) {
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
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user.fullName || user.email.split('@')[0]}
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
                      {/* Request card content */}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className='flex justify-between'>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Change Password
                </button>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user.fullName || ''}
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
                    value={user.email || ''}
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
                    value={user.phone || ''}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="tel"
                    value={user.role || ''}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Change Password
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to change your password?
              A reset link will be sent to your email.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={changingPassword}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmChangePassword}
                disabled={changingPassword}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {changingPassword ? 'Sending...' : 'Yes, Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
