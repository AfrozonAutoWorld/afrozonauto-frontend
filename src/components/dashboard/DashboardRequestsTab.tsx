'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Car, ChevronRight, AlertCircle, MoreVertical } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/pricingCalculator';
import { useOrders } from '@/hooks/useOrderQueries';
import { Paginator, PAGE_SIZE } from './Paginator';
import { getOrderPrimaryImage, getOrderVehicleName, STATUS_CONFIG } from './orderHelpers';
import { VehicleOrder } from '@/lib/api/orders';

export function DashboardRequestsTab() {
  const [ordersPage, setOrdersPage] = useState(1);
  const { orders, isLoading: ordersLoading, isError: ordersError } = useOrders();
console.log(orders);
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
      <div className="overflow-hidden bg-white rounded-xl border border-[#E5E7EB]">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr_0.9fr] gap-6 border-b border-[#E5E7EB] bg-[#FAFAFA] px-4 py-4">
              <span className="font-jakarta text-sm font-medium text-[#111827]">Vehicle Details</span>
              <span className="font-jakarta text-sm font-medium text-[#111827]">Status</span>
              <span className="font-jakarta text-sm font-medium text-[#111827]">Date Listed</span>
              <span className="font-jakarta text-sm font-medium text-[#111827]">Total Cost</span>
              <span className="font-jakarta text-sm font-medium text-[#111827]">Shipping</span>
              <span className="font-jakarta text-sm font-medium text-[#111827]">Action</span>
            </div>

            {paginatedOrders.map((order: any) => {
              const statusConfig = STATUS_CONFIG[order.status as string];
              const StatusIcon = statusConfig?.icon || STATUS_CONFIG.pending_quote.icon;
              const vehicleName = getOrderVehicleName(order);
              const vehicleImage = getOrderPrimaryImage(order);

              const totalCost = formatCurrency(
                (order.paymentBreakdown as any)?.totalUsd ||
                  (order.totalLandedCostUsd as number) ||
                  (order.quotedPriceUsd as number) ||
                  (order.vehicleSnapshot as Record<string, unknown>)?.priceUsd ||
                  0
              );

              return (
                <div
                  key={String(order.id)}
                  className="grid grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr_0.9fr] gap-6 border-b border-[#E3EBF0] px-4 py-4"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <img
                      src={vehicleImage}
                      alt={vehicleName}
                      className="h-[60px] w-20 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-body text-xs font-semibold text-[#343A40]">
                        {vehicleName}
                      </p>
                      <p className="mt-0.5 truncate font-body text-xs text-[#6B7280]">
                        #{order.requestNumber || order.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                        statusConfig?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig?.label || String(order.status)}
                    </span>
                  </div>

                  <div className="flex items-center font-jakarta text-sm text-[#6B7280]">
                    {formatDate(order.createdAt as string)}
                  </div>

                  <div className="flex items-center font-jakarta text-sm text-[#6B7280]">
                    {totalCost}
                  </div>

                  <div className="flex items-center font-jakarta text-sm text-[#6B7280]">
                    {String(order.shippingMethod || 'N/A')}
                  </div>

                  <div className="flex gap-1 items-center">
                    <Link
                      href={`/marketplace/buyer/order/${order.id}`}
                      className="inline-flex items-center rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827]"
                      aria-label={`View ${vehicleName}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {/* <span className="inline-flex items-center rounded-full p-1.5 text-[#6B7280]">
                      <MoreVertical className="w-4 h-4" />
                    </span> */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
