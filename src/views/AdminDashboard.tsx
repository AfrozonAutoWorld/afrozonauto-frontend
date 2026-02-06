'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Car,
  ClipboardList,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  useMarketplaceVehicles,
  useVehicleRequests,
} from '@/hooks/useMarketplace';
import type { MarketplaceVehicle, VehicleRequest } from '@/lib/marketplace/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function AdminDashboard() {
  const {
    data: vehicles,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useMarketplaceVehicles('admin');

  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useVehicleRequests('admin');

  const isLoading = vehiclesLoading || requestsLoading;
  const isError = vehiclesError || requestsError;

  const stats = useMemo(() => {
    const vehicleList = vehicles || [];
    const requestList = requests || [];

    const pendingReviews = vehicleList.filter(
      (v: MarketplaceVehicle) => v.status === 'PENDING_REVIEW'
    ).length;

    const activeRequests = requestList.filter(
      (r: VehicleRequest) =>
        !['COMPLETED', 'CANCELED'].includes(r.status)
    ).length;

    const depositsPaid = requestList.filter(
      (r: VehicleRequest) => r.status === 'DEPOSIT_PAID'
    ).length;

    const completedSales = requestList.filter(
      (r: VehicleRequest) => r.status === 'COMPLETED'
    ).length;

    return { pendingReviews, activeRequests, depositsPaid, completedSales };
  }, [vehicles, requests]);

  const recentActivity = useMemo(() => {
    const vehicleList = vehicles || [];
    const requestList = requests || [];

    type ActivityItem = {
      id: string;
      type: 'vehicle' | 'request';
      title: string;
      description: string;
      date: string;
      status: string;
    };

    const vehicleItems: ActivityItem[] = vehicleList
      .slice()
      .sort(
        (a: MarketplaceVehicle, b: MarketplaceVehicle) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 5)
      .map((v: MarketplaceVehicle) => ({
        id: v.id,
        type: 'vehicle' as const,
        title: v.title || `${v.year} ${v.make} ${v.model}`,
        description: `${v.make} ${v.model} - ${formatCurrency(v.price_usd)}`,
        date: v.updated_at,
        status: v.status,
      }));

    const requestItems: ActivityItem[] = requestList
      .slice()
      .sort(
        (a: VehicleRequest, b: VehicleRequest) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 5)
      .map((r: VehicleRequest) => ({
        id: r.id,
        type: 'request' as const,
        title: r.vehicle
          ? `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}`
          : `Request #${r.id.slice(0, 8)}`,
        description: `Deposit: ${formatCurrency(r.deposit_amount)}`,
        date: r.updated_at,
        status: r.status,
      }));

    return [...vehicleItems, ...requestItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [vehicles, requests]);

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error fetching admin data. Please check your permissions
            and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Stat cards config
  // -------------------------------------------------------------------------
  const statCards = [
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-700',
    },
    {
      label: 'Active Requests',
      value: stats.activeRequests,
      icon: ClipboardList,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      label: 'Deposits Paid',
      value: stats.depositsPaid,
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Completed Sales',
      value: stats.completedSales,
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500',
      textColor: 'text-green-700',
    },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-300 mt-1">
            Manage vehicles, requests, and marketplace operations
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.iconBg} p-3 rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/admin/vehicles"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-600 transition-colors">
                  <Car className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Review Vehicles
                  </h3>
                  <p className="text-sm text-gray-500">
                    {stats.pendingReviews > 0
                      ? `${stats.pendingReviews} vehicle${stats.pendingReviews !== 1 ? 's' : ''} awaiting review`
                      : 'All vehicles reviewed'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </Link>

          <Link
            href="/admin/requests"
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-600 transition-colors">
                  <ClipboardList className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Requests
                  </h3>
                  <p className="text-sm text-gray-500">
                    {stats.depositsPaid > 0
                      ? `${stats.depositsPaid} deposit${stats.depositsPaid !== 1 ? 's' : ''} awaiting verification`
                      : 'No pending verifications'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500">
              Latest vehicles and requests across the marketplace
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-600">
                Recent vehicle submissions and requests will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentActivity.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        item.type === 'vehicle'
                          ? 'bg-emerald-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {item.type === 'vehicle' ? (
                        <Car
                          className={`w-4 h-4 ${
                            item.type === 'vehicle'
                              ? 'text-emerald-600'
                              : 'text-blue-600'
                          }`}
                        />
                      ) : (
                        <ClipboardList className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(item.date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {recentActivity.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/admin/vehicles"
                className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
              >
                View all vehicles
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/admin/requests"
                className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
              >
                View all requests
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helper: small status pill for the activity list                            */
/* -------------------------------------------------------------------------- */
const STATUS_PILL_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  SOLD: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
  NEW_REQUEST: 'bg-blue-100 text-blue-700',
  DEPOSIT_PENDING: 'bg-amber-100 text-amber-700',
  DEPOSIT_PAID: 'bg-emerald-100 text-emerald-700',
  ADMIN_VERIFYING: 'bg-cyan-100 text-cyan-700',
  VERIFIED_AVAILABLE: 'bg-teal-100 text-teal-700',
  FINAL_PAYMENT_PENDING: 'bg-amber-100 text-amber-700',
  FINAL_PAID: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
};

function StatusPill({ status }: { status: string }) {
  const color = STATUS_PILL_COLORS[status] || 'bg-gray-100 text-gray-600';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
