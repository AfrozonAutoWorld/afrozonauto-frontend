import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Car, Clock, CheckCircle, Package, Ship, CreditCard, Heart, User,
  ChevronRight, AlertCircle, FileText, Truck, MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/pricingCalculator';
import type { VehicleRequest, Vehicle, Payment } from '../types';
import { useAuthStore } from '../lib/authStore';
import { useAuthQuery } from '../hooks/useAuth';
import { useAddressMutate, useGetAddresses, useGetDefaultAddress } from '../hooks/useAddress';
import { AddAddressModal } from './AddAddressModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { UpdateAddressModal } from './UpdateAddressModal';
import { showToast } from '../lib/showNotification';

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
  const { forgotPassword } = useAuthQuery();
  const { deleteAddress } = useAddressMutate();

  const [activeTab, setActiveTab] = useState<'requests' | 'saved' | 'payments' | 'profile'>('requests');
  const [requests, setRequests] = useState<(VehicleRequest & { vehicle: Vehicle })[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [updateAddModal, setUpdateAddModal] = useState(false);
  const [delAddModal, setDelAddModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);



  // In your Dashboard component, update the logic:

  const {
    defaultAddresses,
    isLoading: defaultLoading,
    isError: defaultError,
    isNotFound
  } = useGetDefaultAddress();

  const {
    addresses,
    isLoading: addressesLoading,
    isError: addressesError,
    refetch: refetchAddresses,
  } = useGetAddresses();

  const primaryDefault = Array.isArray(defaultAddresses) && defaultAddresses.length > 0
    ? defaultAddresses[0]
    : null;

  const otherAddresses = Array.isArray(addresses)
    ? addresses.filter((a: any) => a.id !== primaryDefault?.id)
    : [];


  const { user, isAuthenticated } = useAuthStore();


  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch requests & payments
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
      setShowResetPasswordModal(true);

    } finally {
      setChangingPassword(false);
    }
  };

  const handleOpenUpdate = (addr: any) => {
    setSelectedAddress(addr);
    setUpdateAddModal(true);
  };

  const handleOpenDelete = (addr: any) => {
    setSelectedAddress(addr);
    setDelAddModal(true);
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
        {/* HEADER */}
        <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-8">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user.fullName || user.email.split('@')[0]}
              </h1>
              <p className="text-gray-300 mt-1">Manage your vehicle imports</p>
            </div>
            <Link to="/vehicles" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-500">
              Browse Vehicles
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="max-w-7xl mx-auto px-4 -mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
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


          {/* PROFILE TAB ONLY (rest unchanged) */}
          {activeTab === 'profile' && (
            <div className="max-w-7xl mx-auto px-4 py-8 bg-white rounded-xl shadow-sm mt-6">

              <div className="flex justify-between">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="flex gap-4">
                  <button onClick={() => setShowConfirmModal(true)} className="text-emerald-600 font-medium hover:underline">
                    Change Password
                  </button>
                  <button onClick={() => setShowAddAddress(true)} className="text-emerald-600 font-medium hover:underline">
                    Add Address
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
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
                      value={user?.email || ''}
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
                      value={user?.phone || ''}
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
                      value={user?.country || 'Nigeria'}
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
                      value={user?.state || ''}
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
                      value={user?.address || ''}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4">Default Address</h3>

                {defaultLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p>Loading default address...</p>
                  </div>
                ) : defaultError && !isNotFound ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Failed to load default address. Please try again.</p>
                  </div>
                ) : !primaryDefault ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-blue-900 font-medium mb-1">No default address set</p>
                        <p className="text-blue-700 text-sm mb-3">
                          Set a default address to speed up your checkout process and vehicle deliveries.
                        </p>
                        <button
                          onClick={() => setShowAddAddress(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add Default Address
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md">
                    <AddressCard
                      addr={primaryDefault}
                      onEdit={handleOpenUpdate}
                      onDelete={handleOpenDelete}
                    />
                  </div>
                )}
              </div>

              {/* Other Addresses Section */}
              <div className="mt-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Other Saved Addresses</h3>
                  <span className="text-sm text-gray-500">
                    {otherAddresses.length} {otherAddresses.length === 1 ? 'address' : 'addresses'}
                  </span>
                </div>

                {addressesLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p>Loading addresses...</p>
                  </div>
                ) : addressesError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Failed to load addresses. Please try again.</p>
                  </div>
                ) : otherAddresses.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">No additional addresses saved.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {otherAddresses.map((addr: any) => (
                      <AddressCard
                        key={addr.id}
                        addr={addr}
                        onEdit={handleOpenUpdate}
                        onDelete={handleOpenDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmPasswordModal
          loading={changingPassword}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmChangePassword}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          onClose={() => setShowResetPasswordModal(false)}
          onSuccess={() => {
            setShowResetPasswordModal(false);
          }}
        />

      )}

      {showAddAddress && (
        <AddAddressModal
          onClose={() => setShowAddAddress(false)}
          onSuccess={refetchAddresses}
        />
      )}

      {updateAddModal && selectedAddress && (
        <UpdateAddressModal
          address={selectedAddress}
          onClose={() => {
            setUpdateAddModal(false);
            setSelectedAddress(null);
          }}
          onSuccess={refetchAddresses}
        />
      )}


      {delAddModal && selectedAddress && (
        <DelAddressModal
          loading={false}
          address={selectedAddress}
          onClose={() => {
            setDelAddModal(false);
            setSelectedAddress(null);
          }}
          onConfirm={async () => {
            if (!selectedAddress?.id) {
              console.error('No address ID found!');
              showToast({ type: "error", message: 'Error: No address ID found' });
              return;
            }

            try {
              await deleteAddress({ id: selectedAddress.id });
              refetchAddresses();
              setDelAddModal(false);
              setSelectedAddress(null);
            } catch (error) {
              console.error('Delete failed:', error);
              showToast({
                type: "error", message: 'Failed to delete address'
              });
            }
          }}
        />
      )}

    </>
  );
}

/* ---------------- MODALS & CARDS ---------------- */
function DelAddressModal({ loading, onClose, onConfirm, address }: any) {
  console.log('DelAddressModal received address:', address);
  console.log('Address ID in modal:', address?.id);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Delete Address</h3>
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this address?</p>
        {address && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <p className="font-medium">{address.firstName} {address.lastName}</p>
            <p className="text-gray-600">{address.street}</p>
            <p className="text-gray-600">{address.city}, {address.state}</p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}


function ConfirmPasswordModal({ loading, onClose, onConfirm }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>
        <p className="text-sm text-gray-600 mb-6">A reset link will be sent to your email.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
            {loading ? 'Sending...' : 'Yes, Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddressCard({ addr, onEdit, onDelete }: any) {
  return (
    <div className="border rounded-lg p-4">
      <p className="font-semibold">{addr.firstName} {addr.lastName}</p>
      <p>{addr.street}</p>
      <p>{addr.city}, {addr.state} {addr.postalCode}</p>
      <p>{addr.country}</p>
      <p className="text-sm text-gray-500">{addr.phoneNumber}</p>

      <div className="flex gap-4 mt-3">
        <button
          onClick={() => {
            console.log('Edit clicked for address:', addr);
            onEdit(addr);
          }}
          className="text-emerald-600 text-sm font-medium hover:underline"
        >
          Update
        </button>
        <button
          onClick={() => {
            console.log('Delete clicked for address:', addr);
            console.log('Address ID being passed:', addr?.id);
            onDelete(addr);
          }}
          className="text-red-600 text-sm font-medium hover:underline"
        >
          Delete
        </button>
      </div>

      {addr.isDefault && (
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded mt-2 inline-block">
          Default
        </span>
      )}
    </div>
  );
}