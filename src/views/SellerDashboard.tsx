'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Car,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  useMarketplaceVehicles,
  useSubmitVehicle,
  useDeleteVehicle,
} from '@/hooks/useMarketplace';
import { VehicleStatusBadge } from '@/components/marketplace/StatusBadge';
import { showToast } from '@/lib/showNotification';
import type { MarketplaceVehicle } from '@/lib/marketplace/types';

type FilterTab = 'all' | 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PENDING_REVIEW', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SellerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data: vehicles, isLoading, isError, error, refetch } = useMarketplaceVehicles('seller');
  const submitVehicle = useSubmitVehicle();
  const deleteVehicle = useDeleteVehicle();

  const stats = useMemo(() => {
    if (!vehicles) return { total: 0, draft: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      total: vehicles.length,
      draft: vehicles.filter((v) => v.status === 'DRAFT').length,
      pending: vehicles.filter((v) => v.status === 'PENDING_REVIEW').length,
      approved: vehicles.filter((v) => v.status === 'APPROVED').length,
      rejected: vehicles.filter((v) => v.status === 'REJECTED').length,
    };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    if (activeTab === 'all') return vehicles;
    return vehicles.filter((v) => v.status === activeTab);
  }, [vehicles, activeTab]);

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

  function getVehicleImage(vehicle: MarketplaceVehicle): string | null {
    if (vehicle.images && vehicle.images.length > 0) {
      const primary = vehicle.images.find((img) => img.is_primary);
      return primary ? primary.url : vehicle.images[0].url;
    }
    return null;
  }

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-gray-200 rounded" />
              <div className="h-10 w-36 bg-gray-200 rounded" />
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

  const statCards = [
    {
      label: 'Total Listings',
      value: stats.total,
      icon: Car,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="mt-1 text-gray-500">Manage your vehicle listings</p>
          </div>
          <Link
            href="/seller/vehicles/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Create Listing
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px">
              {FILTER_TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`whitespace-nowrap px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.key === 'all' && vehicles ? (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {vehicles.length}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Vehicle List */}
          <div className="divide-y divide-gray-100">
            {filteredVehicles.length === 0 ? (
              <div className="py-16 text-center">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No listings found</h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'all'
                    ? "You haven't created any listings yet. Get started by creating your first one."
                    : `You have no ${activeTab.toLowerCase().replace('_', ' ')} listings.`}
                </p>
                {activeTab === 'all' && (
                  <Link
                    href="/seller/vehicles/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Listing
                  </Link>
                )}
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const imageUrl = getVehicleImage(vehicle);
                const isDeleting = deletingId === vehicle.id;
                const isSubmitting = submittingId === vehicle.id;

                return (
                  <div
                    key={vehicle.id}
                    className={`p-4 sm:p-5 hover:bg-gray-50 transition-colors ${
                      isDeleting ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={vehicle.title}
                            className="w-full sm:w-40 h-28 object-cover rounded-lg bg-gray-100"
                          />
                        ) : (
                          <div className="w-full sm:w-40 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Car className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {vehicle.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <VehicleStatusBadge status={vehicle.status} />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(vehicle.price_usd)}
                          </span>
                          {vehicle.mileage > 0 && (
                            <span>{vehicle.mileage.toLocaleString()} mi</span>
                          )}
                          <span>Listed {formatDate(vehicle.created_at)}</span>
                        </div>

                        {/* Rejection Reason */}
                        {vehicle.status === 'REJECTED' && vehicle.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700 mt-0.5">{vehicle.rejection_reason}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {/* View - always available */}
                          <Link
                            href={`/marketplace/${vehicle.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>

                          {/* Edit - for DRAFT and REJECTED */}
                          {(vehicle.status === 'DRAFT' || vehicle.status === 'REJECTED') && (
                            <Link
                              href={`/seller/vehicles/${vehicle.id}/edit`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Link>
                          )}

                          {/* Submit for Review - for DRAFT */}
                          {vehicle.status === 'DRAFT' && (
                            <button
                              onClick={() => handleSubmit(vehicle.id)}
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                            </button>
                          )}

                          {/* Resubmit - for REJECTED */}
                          {vehicle.status === 'REJECTED' && (
                            <button
                              onClick={() => handleSubmit(vehicle.id)}
                              disabled={isSubmitting}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                              {isSubmitting ? 'Resubmitting...' : 'Resubmit'}
                            </button>
                          )}

                          {/* Delete - for DRAFT and REJECTED */}
                          {(vehicle.status === 'DRAFT' || vehicle.status === 'REJECTED') && (
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
