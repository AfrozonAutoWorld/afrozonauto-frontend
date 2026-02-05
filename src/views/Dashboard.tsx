import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car, Clock, CheckCircle, Package, Ship, CreditCard, Heart, User,
  ChevronRight, ChevronLeft, AlertCircle, FileText, Truck, MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/pricingCalculator';
import { useAuthQuery } from '../hooks/useAuth';
import { useAddressMutate, useGetAddresses, useGetDefaultAddress } from '../hooks/useAddress';
import { AddAddressModal } from './AddAddressModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { UpdateAddressModal } from './UpdateAddressModal';
import { showToast } from '../lib/showNotification';
import { useAllOrders } from '../hooks/useOrders';
import { useAllPayments } from '../hooks/usePayments';
import { Payment } from '../lib/api/payment';
import { useAuthStore } from '../lib/authStore';

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Reusable pagination component
// ---------------------------------------------------------------------------
function Paginator({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build the page numbers to render, with ellipsis logic
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 px-6 py-4 bg-gray-50 border-t border-gray-200">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${currentPage === page
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-200'
              }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getOrderPrimaryImage(order: any): string {
  const fallbackImage = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';

  const primaryImage = order.vehicleSnapshot?.apiData?.listing?.retailListing?.primaryImage
    || order.vehicleSnapshot?.apiData?.listing?.wholesaleListing?.primaryImage;

  if (primaryImage) return primaryImage;

  if (order.vehicleSnapshot?.images && order.vehicleSnapshot.images.length > 0) {
    return order.vehicleSnapshot.images[0];
  }

  if (order.vehicle?.images && order.vehicle.images.length > 0) {
    return order.vehicle.images[0];
  }

  return fallbackImage;
}

function getOrderVehicleName(order: any): string {
  const snapshot = order.vehicleSnapshot;
  const vehicle = order.vehicle;

  if (snapshot?.year && snapshot?.make && snapshot?.model) {
    return `${snapshot.year} ${snapshot.make} ${snapshot.model}`;
  }

  if (vehicle?.year && vehicle?.make && vehicle?.model) {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  }

  return order.requestNumber || `Order #${order.id}`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_quote: { label: 'Pending Quote', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PENDING_QUOTE: { label: 'Pending Quote', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  quote_sent: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: FileText },
  QUOTE_SENT: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: FileText },
  deposit_pending: { label: 'Deposit Pending', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  DEPOSIT_PENDING: { label: 'Deposit Pending', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  deposit_paid: { label: 'Deposit Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DEPOSIT_PAID: { label: 'Deposit Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  balance_paid: { label: 'Balance Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  BALANCE_PAID: { label: 'Balance Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inspection_pending: { label: 'Inspection Pending', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  INSPECTION_PENDING: { label: 'Inspection Pending', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  inspection_complete: { label: 'Inspection Complete', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  INSPECTION_COMPLETE: { label: 'Inspection Complete', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  awaiting_approval: { label: 'Awaiting Approval', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  purchase_in_progress: { label: 'Purchasing', color: 'bg-blue-100 text-blue-700', icon: Package },
  PURCHASE_IN_PROGRESS: { label: 'Purchasing', color: 'bg-blue-100 text-blue-700', icon: Package },
  purchased: { label: 'Purchased', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PURCHASED: { label: 'Purchased', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  export_pending: { label: 'Export Pending', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  EXPORT_PENDING: { label: 'Export Pending', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Ship },
  SHIPPED: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Ship },
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Ship },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Ship },
  arrived_port: { label: 'Arrived at Port', color: 'bg-green-100 text-green-700', icon: MapPin },
  ARRIVED_PORT: { label: 'Arrived at Port', color: 'bg-green-100 text-green-700', icon: MapPin },
  customs_clearance: { label: 'Customs Clearance', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  CUSTOMS_CLEARANCE: { label: 'Customs Clearance', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  cleared: { label: 'Cleared', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLEARED: { label: 'Cleared', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  delivery_scheduled: { label: 'Delivery Scheduled', color: 'bg-blue-100 text-blue-700', icon: Truck },
  DELIVERY_SCHEDULED: { label: 'Delivery Scheduled', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: CreditCard },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: CreditCard },
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, forgotPassword } = useAuthQuery();
  const { isInitialized } = useAuthStore();

  const { deleteAddress } = useAddressMutate();

  const [activeTab, setActiveTab] = useState<'requests' | 'saved' | 'payments' | 'profile'>('requests');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [updateAddModal, setUpdateAddModal] = useState(false);
  const [delAddModal, setDelAddModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  // Pagination state — one per paginated tab
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);

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

  const {
    orders,
    isLoading: _ordersLoading,
    isError: ordersError
  } = useAllOrders();

  const {
    allPayments: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = useAllPayments();

  const primaryDefault = Array.isArray(defaultAddresses) && defaultAddresses.length > 0
    ? defaultAddresses[0]
    : null;

  const otherAddresses = Array.isArray(addresses)
    ? addresses.filter((a: any) => a.id !== primaryDefault?.id)
    : [];

  // ---------------------------------------------------------------------------
  // Sorted & paginated slices — memoised so they only recompute when the
  // source data or the current page changes.
  // ---------------------------------------------------------------------------

  // Orders: sort newest first by createdAt
  const sortedOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return [...orders].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders]);

  const ordersTotalPages = Math.ceil(sortedOrders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * PAGE_SIZE;
    return sortedOrders.slice(start, start + PAGE_SIZE);
  }, [sortedOrders, ordersPage]);

  // Payments: sort newest first by createdAt
  const sortedPayments = useMemo(() => {
    if (!Array.isArray(paymentsData)) return [];
    return [...paymentsData].sort(
      (a: Payment, b: Payment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [paymentsData]);

  const paymentsTotalPages = Math.ceil(sortedPayments.length / PAGE_SIZE);
  const paginatedPayments = useMemo(() => {
    const start = (paymentsPage - 1) * PAGE_SIZE;
    return sortedPayments.slice(start, start + PAGE_SIZE);
  }, [sortedPayments, paymentsPage]);

  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
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
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }


  const totalSpent = paymentsData
    ?.filter((p: Payment) => p.paymentType === 'FULL_PAYMENT' || p.paymentType === 'DEPOSIT')
    .reduce((sum: number, p: Payment) => sum + (p.metadata?.calculation?.paymentAmount || 0), 0) || 0;

  const stats = [
    {
      label: 'Active Orders',
      value: orders.filter((o: any) => {
        const status = o.status?.toLowerCase();
        return !['delivered', 'cancelled', 'refunded'].includes(status);
      }).length,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      label: 'In Transit',
      value: orders.filter((o: any) => {
        const status = o.status?.toLowerCase();
        return ['shipped', 'in_transit'].includes(status);
      }).length,
      icon: Ship,
      color: 'bg-emerald-500',
    },
    {
      label: 'Delivered',
      value: orders.filter((o: any) => o.status?.toLowerCase() === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
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
                Welcome back, {user?.profile?.firstName || user.email.split('@')[0]}
              </h1>
              <p className="text-gray-300 mt-1">Manage your vehicle imports</p>
            </div>
            <Link href="/vehicles" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-500">
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

          {/* ================================================================
              MY REQUESTS TAB
              ================================================================ */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {ordersError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-900 font-medium">Failed to load orders</p>
                      <p className="text-red-700 text-sm mt-1">Please try refreshing the page.</p>
                    </div>
                  </div>
                </div>
              ) : sortedOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start browsing vehicles to make your first import request.
                  </p>
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Browse Vehicles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  {paginatedOrders.map((order: any) => {
                    const statusConfig = STATUS_CONFIG[order.status];
                    const StatusIcon = statusConfig?.icon || Clock;
                    const vehicleName = getOrderVehicleName(order);
                    const vehicleImage = getOrderPrimaryImage(order);

                    return (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <img
                              src={vehicleImage}
                              alt={vehicleName}
                              className="w-full md:w-48 h-32 object-cover rounded-lg"
                            />

                            <div className="flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">
                                    Order #{order.requestNumber || order.id}
                                  </p>
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {vehicleName}
                                  </h3>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-700'}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  {statusConfig?.label || order.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Total Cost</p>
                                  <p className="font-semibold text-gray-900">
                                    {formatCurrency(
                                      order.paymentBreakdown?.totalUsd ||
                                      order.totalLandedCostUsd ||
                                      order.quotedPriceUsd ||
                                      order.vehicleSnapshot?.priceUsd ||
                                      0
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Shipping</p>
                                  <p className="font-semibold text-gray-900">
                                    {order.shippingMethod || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Destination</p>
                                  <p className="font-semibold text-gray-900">
                                    {order.destinationState || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Est. Delivery</p>
                                  <p className="font-semibold text-gray-900">
                                    {order.estimatedDeliveryDate
                                      ? formatDate(order.estimatedDeliveryDate)
                                      : 'TBD'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            Submitted {formatDate(order.createdAt)}
                          </p>
                          <Link
                            href={`/request-details/${order.id}`}
                            className="text-emerald-600 font-medium text-sm hover:text-emerald-700 flex items-center gap-1"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {/* Requests pagination */}
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Showing {Math.min((ordersPage - 1) * PAGE_SIZE + 1, sortedOrders.length)}–{Math.min(ordersPage * PAGE_SIZE, sortedOrders.length)} of {sortedOrders.length} orders
                      </p>
                    </div>
                    <Paginator
                      currentPage={ordersPage}
                      totalPages={ordersTotalPages}
                      onPageChange={setOrdersPage}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================================================================
              PAYMENTS TAB
              ================================================================ */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {paymentsLoading ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading payments...</p>
                </div>
              ) : paymentsError ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Payments</h3>
                  <p className="text-gray-600 mb-4">
                    There was an error loading your payment history. Please try again.
                  </p>
                  <button
                    onClick={() => refetchPayments()}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700"
                  >
                    Retry
                  </button>
                </div>
              ) : sortedPayments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-600 mb-4">
                    Your payment history will appear here once you make your first payment.
                  </p>
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Browse Vehicles
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedPayments.map((payment: Payment) => {
                          const vehicle = payment.order?.vehicleSnapshot;
                          const vehicleName = vehicle
                            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                            : 'N/A';

                          // Use the per-payment calculation amount; fall back to amountUsd
                          const paymentAmount =
                            payment.metadata?.calculation?.paymentAmount ??
                            payment.amountUsd ??
                            0;

                          return (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(payment.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {payment.order ? (
                                  <Link
                                    href={`/request-details/${payment.orderId}`}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                                  >
                                    {payment.order.requestNumber}
                                  </Link>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs">
                                  <p className="truncate font-medium">{vehicleName}</p>
                                  {vehicle?.vin && (
                                    <p className="text-xs text-gray-500 truncate">
                                      VIN: {vehicle.vin}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="capitalize">
                                  {payment.paymentType?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(paymentAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${payment.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-700'
                                    : payment.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : payment.status === 'FAILED'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                  {payment.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {payment.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                  {payment.status === 'FAILED' && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="max-w-xs">
                                  <p className="font-mono text-xs truncate">
                                    {payment.transactionRef || payment.providerTransactionId || '-'}
                                  </p>
                                  {payment.paymentProvider && (
                                    <p className="text-xs text-gray-400 capitalize">
                                      {payment.paymentProvider}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Payments footer + pagination */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {Math.min((paymentsPage - 1) * PAGE_SIZE + 1, sortedPayments.length)}–{Math.min(paymentsPage * PAGE_SIZE, sortedPayments.length)} of {sortedPayments.length} {sortedPayments.length === 1 ? 'payment' : 'payments'}
                    </p>
                  </div>
                  <Paginator
                    currentPage={paymentsPage}
                    totalPages={paymentsTotalPages}
                    onPageChange={setPaymentsPage}
                  />
                </>
              )}
            </div>
          )}

          {/* ================================================================
              SAVED TAB
              ================================================================ */}
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
                href="/vehicles"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Browse Vehicles
              </Link>
            </div>
          )}

          {/* ================================================================
              PROFILE TAB
              ================================================================ */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={user.fullName || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={user?.email || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" value={user?.phone || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input type="text" value={user?.country || 'Nigeria'} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" value={user?.state || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input type="text" value={user?.address || ''} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50" />
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
                    <AddressCard addr={primaryDefault} onEdit={handleOpenUpdate} onDelete={handleOpenDelete} />
                  </div>
                )}
              </div>

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
                      <AddressCard key={addr.id} addr={addr} onEdit={handleOpenUpdate} onDelete={handleOpenDelete} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          MODALS
          ============================================================ */}
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
          onSuccess={() => setShowResetPasswordModal(false)}
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
          onClose={() => { setUpdateAddModal(false); setSelectedAddress(null); }}
          onSuccess={refetchAddresses}
        />
      )}

      {delAddModal && selectedAddress && (
        <DelAddressModal
          loading={false}
          address={selectedAddress}
          onClose={() => { setDelAddModal(false); setSelectedAddress(null); }}
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
              showToast({ type: "error", message: 'Failed to delete address' });
            }
          }}
        />
      )}
    </>
  );
}

/* ---------------- MODALS & CARDS ---------------- */
function DelAddressModal({ loading, onClose, onConfirm, address }: any) {
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
        <button onClick={() => onEdit(addr)} className="text-emerald-600 text-sm font-medium hover:underline">Update</button>
        <button onClick={() => onDelete(addr)} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
      </div>

      {addr.isDefault && (
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded mt-2 inline-block">Default</span>
      )}
    </div>
  );
}