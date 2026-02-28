'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Car, ChevronRight, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/pricingCalculator';
import { useOrders } from '@/hooks/useOrderQueries';
import { Paginator, PAGE_SIZE } from './Paginator';
import { getOrderPrimaryImage, getOrderVehicleName, STATUS_CONFIG } from './orderHelpers';
import { VehicleOrder } from '@/lib/api/orders';

export function DashboardRequestsTab() {
  const [ordersPage, setOrdersPage] = useState(1);
  const { orders, isLoading: ordersLoading, isError: ordersError } = useOrders();

  const sortedOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return [...orders].sort(
      (a: VehicleOrder, b: VehicleOrder) =>
        new Date((b.createdAt as string) || 0).getTime() -
        new Date((a.createdAt as string) || 0).getTime()
    );
  }, [orders]);

  const ordersTotalPages = Math.ceil(sortedOrders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * PAGE_SIZE;
    return sortedOrders.slice(start, start + PAGE_SIZE);
  }, [sortedOrders, ordersPage]);

  if (ordersError) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200">
        <div className="flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-900">Failed to load orders</p>
            <p className="mt-1 text-sm text-red-700">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-xl">
        <div className="flex flex-col gap-4 justify-center items-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (sortedOrders.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl">
        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full">
          <Car className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No orders yet</h3>
        <p className="mb-4 text-gray-600">
          Start browsing vehicles to make your first import request.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex gap-2 items-center px-6 py-3 font-medium text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
        >
          Browse Vehicles
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedOrders.map((order: any) => {
        const statusConfig = STATUS_CONFIG[order.status as string];
        const StatusIcon = statusConfig?.icon || STATUS_CONFIG.pending_quote.icon;
        const vehicleName = getOrderVehicleName(order);
        const vehicleImage = getOrderPrimaryImage(order);

        return (
          <div
            key={String(order.id)}
            className="overflow-hidden bg-white rounded-xl shadow-sm"
          >
            <div className="p-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <img
                  src={vehicleImage}
                  alt={vehicleName}
                  className="object-cover w-full h-32 rounded-lg md:w-48"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-4 justify-between items-start mb-3">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">
                        Order #{order.requestNumber || order.id}
                      </p>
                      <h3 className="text-xl font-semibold text-gray-900">{vehicleName}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        statusConfig?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig?.label || String(order.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-gray-500">Total Cost</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(
                          (order.paymentBreakdown as any)?.totalUsd ||
                            (order.totalLandedCostUsd as number) ||
                            (order.quotedPriceUsd as number) ||
                            (order.vehicleSnapshot as Record<string, unknown>)?.priceUsd ||
                            0
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Shipping</p>
                      <p className="font-semibold text-gray-900">
                        {String(order.shippingMethod || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Destination</p>
                      <p className="font-semibold text-gray-900">
                        {String(order.destinationState || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Est. Delivery</p>
                      <p className="font-semibold text-gray-900">
                        {order.estimatedDeliveryDate
                          ? formatDate(order.estimatedDeliveryDate as string)
                          : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center px-6 py-3 bg-gray-50">
              <p className="text-sm text-gray-500">
                Submitted {formatDate(order.createdAt as string)}
              </p>
              <Link
                href={`/marketplace/buyer/order/${order.id}`}
                className="flex gap-1 items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
      <div className="overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {Math.min((ordersPage - 1) * PAGE_SIZE + 1, sortedOrders.length)}–
            {Math.min(ordersPage * PAGE_SIZE, sortedOrders.length)} of {sortedOrders.length} orders
          </p>
        </div>
        <Paginator
          currentPage={ordersPage}
          totalPages={ordersTotalPages}
          onPageChange={setOrdersPage}
        />
      </div>
    </div>
  );
}
