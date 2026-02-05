import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  Ship,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  Package,
  FileText,
  Download,
  Shield,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/pricingCalculator';
import { useGetOrder } from '../hooks/useOrders';
import { usePaymentInit } from '../hooks/usePayments';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
  PENDING_QUOTE: {
    label: 'Pending Quote',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    description: 'Our team is preparing your detailed quote'
  },
  QUOTE_SENT: {
    label: 'Quote Sent',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FileText,
    description: 'Quote has been sent. Please review and approve'
  },
  DEPOSIT_PENDING: {
    label: 'Payment Pending',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: CreditCard,
    description: 'Waiting for payment'
  },
  DEPOSIT_PAID: {
    label: 'Payment Received',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Payment received. Processing your order'
  },
  INSPECTION_PENDING: {
    label: 'Inspection Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: FileText,
    description: 'Vehicle inspection in progress'
  },
  INSPECTION_COMPLETE: {
    label: 'Inspection Complete',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle,
    description: 'Inspection report ready for review'
  },
  AWAITING_APPROVAL: {
    label: 'Awaiting Approval',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertCircle,
    description: 'Please review and approve the inspection report'
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Order approved. Proceeding with purchase'
  },
  PURCHASE_IN_PROGRESS: {
    label: 'Purchasing',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Package,
    description: 'Purchasing your vehicle from dealer'
  },
  PURCHASED: {
    label: 'Purchased',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Vehicle purchased successfully'
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Ship,
    description: 'Vehicle has been shipped'
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Ship,
    description: 'Vehicle is on the way'
  },
  ARRIVED_PORT: {
    label: 'Arrived at Port',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: MapPin,
    description: 'Vehicle has arrived at destination port'
  },
  CUSTOMS_CLEARANCE: {
    label: 'Customs Clearance',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: FileText,
    description: 'Clearing customs formalities'
  },
  CLEARED: {
    label: 'Cleared',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Customs clearance complete'
  },
  DELIVERY_SCHEDULED: {
    label: 'Delivery Scheduled',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Truck,
    description: 'Delivery date has been scheduled'
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
    description: 'Vehicle successfully delivered'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertCircle,
    description: 'Order has been cancelled'
  },
};

const FULLY_PAID_STATUSES = ['BALANCE_PAID', 'DELIVERED', 'CANCELLED'];

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { order, isLoading, isError, refetch } = useGetOrder(id ?? '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find the order you're looking for.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-4">
            There was an error fetching your order details. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }



  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig?.icon || Clock;
  const vehicleName = getOrderVehicleName(order);
  const vehicleImage = getOrderPrimaryImage(order);

  const totalCost =
    order.paymentBreakdown?.totalUsd ??
    order.totalLandedCostUsd ??
    order.quotedPriceUsd ??
    0;

  const depositAmount = order.depositAmountUsd ?? order.paymentBreakdown?.totalUsedDeposit ?? 0;

  const totalPaid = order.payments?.reduce((sum: number, payment: any) => {
    return payment.status?.toUpperCase() === 'COMPLETED'
      ? sum + (payment.amountUsd ?? payment.amount_usd ?? 0)
      : sum;
  }, 0) ?? 0;

  const remainingBalance = Math.max(totalCost - totalPaid, 0);

  const depositAlreadyPaid = order.status === 'DEPOSIT_PAID' || FULLY_PAID_STATUSES.includes(order.status);

  const showPaymentButton = !FULLY_PAID_STATUSES.includes(order.status) && remainingBalance > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${statusConfig?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-lg">
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{statusConfig?.label || order.status}</h2>
                <p className="text-sm opacity-90">{statusConfig?.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-75">Order Number</p>
              <p className="text-xl font-bold">{order.requestNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={vehicleImage}
                    alt={vehicleName}
                    className="w-full md:w-64 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{vehicleName}</h4>
                    {order.vehicleSnapshot?.vin && (
                      <p className="text-sm text-gray-500 mb-4">VIN: {order.vehicleSnapshot.vin}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {order.vehicleSnapshot?.vehicleType && (
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-semibold text-gray-900">{order.vehicleSnapshot.vehicleType}</p>
                        </div>
                      )}
                      {order.vehicleSnapshot?.transmission && (
                        <div>
                          <p className="text-gray-500">Transmission</p>
                          <p className="font-semibold text-gray-900">{order.vehicleSnapshot.transmission}</p>
                        </div>
                      )}
                      {order.vehicleSnapshot?.fuelType && (
                        <div>
                          <p className="text-gray-500">Fuel Type</p>
                          <p className="font-semibold text-gray-900">{order.vehicleSnapshot.fuelType}</p>
                        </div>
                      )}
                      {order.vehicleSnapshot?.apiData?.listing?.retailListing?.miles && (
                        <div>
                          <p className="text-gray-500">Mileage</p>
                          <p className="font-semibold text-gray-900">
                            {order.vehicleSnapshot.apiData.listing.retailListing.miles.toLocaleString()} mi
                          </p>
                        </div>
                      )}
                    </div>

                    {order.vehicleSnapshot?.dealerName && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Dealer</p>
                        <p className="font-medium text-gray-900">{order.vehicleSnapshot.dealerName}</p>
                        <p className="text-sm text-gray-600">
                          {order.vehicleSnapshot.dealerCity}, {order.vehicleSnapshot.dealerState}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Shipping & Delivery</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Ship className="w-6 h-6 text-emerald-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Shipping Method</p>
                    <p className="text-gray-600">{order.shippingMethod || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-emerald-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Delivery Address</p>
                    <p className="text-gray-600">{order.destinationAddress}</p>
                    <p className="text-gray-600">
                      {order.destinationCity}, {order.destinationState}
                    </p>
                    <p className="text-gray-600">{order.destinationCountry}</p>
                  </div>
                </div>

                {order.estimatedDeliveryDate && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-emerald-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Estimated Delivery</p>
                      <p className="text-gray-600">{formatDate(order.estimatedDeliveryDate)}</p>
                    </div>
                  </div>
                )}

                {order.deliveryInstructions && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Delivery Instructions</p>
                    <p className="text-sm text-gray-600">{order.deliveryInstructions}</p>
                  </div>
                )}

                {order.customerNotes && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Notes</p>
                    <p className="text-sm text-gray-600">{order.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.payments.map((payment: any) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(payment.createdAt || payment.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {payment.paymentType || payment.payment_type}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amountUsd || payment.amount_usd)}
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
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {payment.reference || payment.paymentReference || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h3>

              {order.paymentBreakdown?.breakdown ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle Price</span>
                    <span className="font-medium">{formatCurrency(order.paymentBreakdown.breakdown.vehiclePriceUsd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sourcing Fee</span>
                    <span className="font-medium">{formatCurrency(order.paymentBreakdown.breakdown.sourcingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inspection</span>
                    <span className="font-medium">{formatCurrency(order.paymentBreakdown.breakdown.prePurchaseInspectionUsd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">US Handling Fee</span>
                    <span className="font-medium">{formatCurrency(order.paymentBreakdown.breakdown.usHandlingFeeUsd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatCurrency(order.paymentBreakdown.breakdown.shippingCostUsd)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">{formatCurrency(order.vehicleSnapshot?.priceUsd || 0)}</span>
                  </div>
                  {order.quotedPriceUsd && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quoted Price</span>
                      <span className="font-medium">{formatCurrency(order.quotedPriceUsd)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between text-lg mb-2">
                  <span className="font-semibold text-gray-900">Total Cost</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.paymentBreakdown?.totalUsd ?? 0)}</span>
                </div>

                {order.totalLandedCostLocal && order.localCurrency && (
                  <p className="text-right text-sm text-gray-600">
                    ≈ {formatCurrency(
                      order.totalLandedCostLocal,
                      order.localCurrency === 'USD' || order.localCurrency === 'NGN'
                        ? order.localCurrency
                        : undefined
                    )}
                  </p>
                )}
              </div>

              {/* Payment Progress */}
              <div className="mt-6 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Paid</span>
                    <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((totalPaid / totalCost) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {remainingBalance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-medium text-orange-600">{formatCurrency(remainingBalance)}</span>
                  </div>
                )}
              </div>

              {/* Payment Actions */}
              {totalCost === 0 && order.status === 'PENDING_QUOTE' && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-1">Quote Pending</p>
                  <p className="text-xs text-blue-600">
                    Our team is preparing your detailed quote. Payment options will be available once the quote is ready.
                  </p>
                </div>
              )}


              {showPaymentButton && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Make Payment
                  </button>
                </div>
              )}


              {/* Fully paid indicator */}
              {FULLY_PAID_STATUSES.includes(order.status) && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">Payment complete</p>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Request Submitted</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {order.statusChangedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <StatusIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{statusConfig?.label}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.statusChangedAt)}</p>
                    </div>
                  </div>
                )}

                {order.estimatedDeliveryDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Estimated Delivery</p>
                      <p className="text-sm text-gray-500">{formatDate(order.estimatedDeliveryDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Quote Document</span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Inspection Report</span>
                  </div>
                  <span className="text-xs text-gray-500">Not available</span>
                </button>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Our support team is here to assist you with your order.
                  </p>
                  <Link
                    href="/contact"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          orderId={order.id}
          depositAmount={depositAmount}
          totalCost={totalCost}
          remainingBalance={remainingBalance}
          depositAlreadyPaid={depositAlreadyPaid}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

    </div>
  );
}

// Payment Modal Component
function PaymentModal({
  orderId,
  depositAmount,
  totalCost,
  remainingBalance,
  depositAlreadyPaid,
  onClose,
}: {
  orderId: string;
  depositAmount: number;
  totalCost: number;
  remainingBalance: number;
  depositAlreadyPaid: boolean;
  onClose: () => void;
}) {
  // Determine which options are available
  const canPayDeposit = !depositAlreadyPaid && depositAmount > 0;
  const canPayFull = !depositAlreadyPaid && totalCost > 0;
  const canPayBalance = depositAlreadyPaid && remainingBalance > 0;

  // Default selection logic:
  //   – If deposit is still owed, default to deposit
  //   – If only balance remains, default to balance
  //   – Otherwise default to full
  const getDefault = (): 'deposit' | 'full' | 'balance' => {
    if (canPayDeposit) return 'deposit';
    if (canPayBalance) return 'balance';
    return 'full';
  };

  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full' | 'balance'>(getDefault);
  const { mutateAsync: initializePayment, isPending } = usePaymentInit();

  // Map selected option → amount shown & paymentType sent to API
  const optionConfig = {
    deposit: { amount: depositAmount, paymentType: 'DEPOSIT' as const },
    full: { amount: totalCost, paymentType: 'FULL_PAYMENT' as const },
    balance: { amount: remainingBalance, paymentType: 'FULL_PAYMENT' as const },
  };

  const selected = optionConfig[paymentOption];

  const handlePayment = async () => {
    try {
      await initializePayment({
        orderId,
        paymentType: selected.paymentType,
        provider: 'paystack',
        callbackUrl: `${process.env.NEXT_PUBLIC_PAY_CALLBACK_URL}`,
      });
    } catch (error) {
      console.error('Payment initialization failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Make Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isPending}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3 flex-1">

          {/* Option A: Pay Deposit (only when deposit not yet paid) */}
          {canPayDeposit && (
            <button
              onClick={() => setPaymentOption('deposit')}
              disabled={isPending}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${paymentOption === 'deposit'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Pay Deposit</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Secure your order now, pay the rest later
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600 whitespace-nowrap ml-4">
                  {formatCurrency(depositAmount)}
                </p>
              </div>
            </button>
          )}

          {/* Option B: Pay Full Amount (only when deposit not yet paid) */}
          {canPayFull && (
            <button
              onClick={() => setPaymentOption('full')}
              disabled={isPending}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${paymentOption === 'full'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Pay Full Amount</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Complete the entire payment at once
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600 whitespace-nowrap ml-4">
                  {formatCurrency(totalCost)}
                </p>
              </div>
            </button>
          )}

          {/* Option C: Pay Remaining Balance (only after deposit is paid) */}
          {canPayBalance && (
            <button
              onClick={() => setPaymentOption('balance')}
              disabled={isPending}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all border-emerald-500 bg-emerald-50 ${isPending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Pay Remaining Balance</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Complete your outstanding balance
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600 whitespace-nowrap ml-4">
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Pay button */}
        <div className="p-6 pt-0">
          <button
            onClick={handlePayment}
            disabled={isPending || selected.amount === 0}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Pay {formatCurrency(selected.amount)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}