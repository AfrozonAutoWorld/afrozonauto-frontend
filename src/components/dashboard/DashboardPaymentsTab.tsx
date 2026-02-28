'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CreditCard, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/pricingCalculator';
import { usePayments } from '@/hooks/usePaymentQuery';
import { Payment } from '@/lib/api/payment';
import { Paginator, PAGE_SIZE } from './Paginator';

export function DashboardPaymentsTab() {
  const [paymentsPage, setPaymentsPage] = useState(1);
  const {
    payments: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = usePayments();

  const sortedPayments = useMemo(() => {
    if (!Array.isArray(paymentsData)) return [];
    return [...paymentsData].sort(
      (a: Payment, b: Payment) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [paymentsData]);

  const paymentsTotalPages = Math.ceil(sortedPayments.length / PAGE_SIZE);
  const paginatedPayments = useMemo(() => {
    const start = (paymentsPage - 1) * PAGE_SIZE;
    return sortedPayments.slice(start, start + PAGE_SIZE);
  }, [sortedPayments, paymentsPage]);

  if (paymentsLoading) {
    return (
      <div className="overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-emerald-600 animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className="overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="p-12 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to Load Payments</h3>
          <p className="mb-4 text-gray-600">
            There was an error loading your payment history. Please try again.
          </p>
          <button
            onClick={() => refetchPayments()}
            className="px-6 py-3 font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (sortedPayments.length === 0) {
    return (
      <div className="overflow-hidden bg-white rounded-xl shadow-sm">
        <div className="p-12 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No payments yet</h3>
          <p className="mb-4 text-gray-600">
            Your payment history will appear here once you make your first payment.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex gap-2 items-center px-6 py-3 font-medium text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
          >
            Browse Vehicles
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Order
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Vehicle
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedPayments.map((payment: Payment) => {
              const vehicle = payment.order?.vehicleSnapshot;
              const vehicleName = vehicle
                ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                : 'N/A';
              const paymentAmount =
                payment.metadata?.calculation?.paymentAmount ??
                payment.amountUsd ??
                0;

              return (
                <tr key={payment.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {payment.order ? (
                      <Link
                        href={`/marketplace/buyer/order/${payment.orderId}`}
                        className="font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        {payment.order.requestNumber}
                      </Link>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{vehicleName}</p>
                      {vehicle?.vin && (
                        <p className="text-xs text-gray-500 truncate">VIN: {vehicle.vin}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    <span className="capitalize">
                      {payment.paymentType?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatCurrency(paymentAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : payment.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {payment.status === 'COMPLETED' && <CheckCircle className="mr-1 w-3 h-3" />}
                      {payment.status === 'PENDING' && <Clock className="mr-1 w-3 h-3" />}
                      {payment.status === 'FAILED' && <AlertCircle className="mr-1 w-3 h-3" />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
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
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {Math.min((paymentsPage - 1) * PAGE_SIZE + 1, sortedPayments.length)}–
          {Math.min(paymentsPage * PAGE_SIZE, sortedPayments.length)} of {sortedPayments.length}{' '}
          {sortedPayments.length === 1 ? 'payment' : 'payments'}
        </p>
      </div>
      <Paginator
        currentPage={paymentsPage}
        totalPages={paymentsTotalPages}
        onPageChange={setPaymentsPage}
      />
    </div>
  );
}
