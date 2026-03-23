'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { XCircle } from 'lucide-react';
import {
  useMarketplaceVehicles,
  useSubmitVehicle,
  useDeleteVehicle,
} from '@/hooks/useMarketplace';
import { showToast } from '@/lib/showNotification';
import { canUseSellerFeatures } from '@/lib/sellerAccess';
import { SellerDashboardBanner } from '@/components/seller/dashboard/SellerDashboardBanner';
import {
  SellerDashboardTopBar,
  type DateRangeFilter,
} from '@/components/seller/dashboard/SellerDashboardTopBar';
import { SellerDashboardStats } from '@/components/seller/dashboard/SellerDashboardStats';
import {
  SellerDashboardListingsTable,
  type SellerStatusFilter,
} from '@/components/seller/dashboard/SellerDashboardListingsTable';

function isDateInRange(dateStr: string, range: DateRangeFilter): boolean {
  if (range === 'all_time') return true;
  const created = new Date(dateStr);
  if (Number.isNaN(created.getTime())) return false;

  const now = new Date();
  if (range === 'this_month') {
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }

  const threshold = new Date(now);
  threshold.setMonth(now.getMonth() - 2);
  threshold.setDate(1);
  return created >= threshold;
}

export function SellerDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const canAccessSellerDashboard = canUseSellerFeatures(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilter>('this_month');
  const [statusFilter, setStatusFilter] = useState<SellerStatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data: vehicles, isLoading, isError, error, refetch } = useMarketplaceVehicles(
    canAccessSellerDashboard ? 'seller' : undefined,
  );
  const submitVehicle = useSubmitVehicle();
  const deleteVehicle = useDeleteVehicle();

  const periodVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter((v) => isDateInRange(v.created_at, dateRange));
  }, [vehicles, dateRange]);

  const stats = useMemo(() => {
    if (!periodVehicles.length) {
      return { earnings: 0, active: 0, sold: 0, pending: 0 };
    }
    const soldVehicles = periodVehicles.filter((v) => v.status === 'SOLD');
    const earnings = soldVehicles.reduce((sum, v) => sum + (v.price_usd || 0), 0);
    const pending = periodVehicles.filter(
      (v) => v.status === 'PENDING_REVIEW',
    ).length;
    const active = periodVehicles.filter(
      (v) =>
        v.status === 'APPROVED' ||
        v.status === 'PENDING_REVIEW' ||
        v.status === 'DRAFT',
    ).length;
    return {
      earnings,
      active,
      sold: soldVehicles.length,
      pending,
    };
  }, [periodVehicles]);

  const filteredVehicles = useMemo(() => {
    const base = periodVehicles.filter((v) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const searchable = [
        v.title,
        v.make,
        v.model,
        String(v.year),
        v.vin,
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
    if (statusFilter === 'all') return base;
    return base.filter((v) => v.status === statusFilter);
  }, [periodVehicles, searchTerm, statusFilter]);

  async function handleSubmit(id: string) {
    setSubmittingId(id);
    try {
      await submitVehicle.mutateAsync(id);
      showToast({ type: 'success', message: 'Vehicle submitted for review.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit vehicle.';
      showToast({ type: 'error', message });
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteVehicle.mutateAsync(id);
      showToast({ type: 'success', message: 'Listing deleted successfully.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete listing.';
      showToast({ type: 'error', message });
    } finally {
      setDeletingId(null);
    }
  }

  // --- Access control ---
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading seller dashboard...</div>
      </div>
    );
  }

  if (!canAccessSellerDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md px-4 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            Seller access required
          </h1>
          <p className="text-gray-600 mb-6">
            This area is for seller accounts. Sign in with a seller profile or
            register to sell with Afrozon.
          </p>
          <Link
            href="/seller/landing"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Learn about selling
          </Link>
        </div>
      </div>
    );
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-gray-200 rounded" />
              <div className="h-10 w-44 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <SellerDashboardBanner
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8">
        <SellerDashboardTopBar
          firstName={user?.profile?.firstName}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <SellerDashboardStats
          totalEarningsUsd={stats.earnings}
          activeListings={stats.active}
          totalCarsSold={stats.sold}
          pendingReview={stats.pending}
        />

        <SellerDashboardListingsTable
          vehicles={filteredVehicles}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          deletingId={deletingId}
          submittingId={submittingId}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
