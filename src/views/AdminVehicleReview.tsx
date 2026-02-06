'use client';

import { useState, useMemo, useCallback } from 'react';
import { Check, X, Eye, AlertCircle, ChevronDown } from 'lucide-react';
import {
  useMarketplaceVehicles,
  useApproveVehicle,
  useRejectVehicle,
} from '@/hooks/useMarketplace';
import { VehicleStatusBadge } from '@/components/marketplace/StatusBadge';
import { showToast } from '@/lib/showNotification';
import type { MarketplaceVehicle } from '@/lib/marketplace/types';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400';

function getVehiclePrimaryImage(vehicle: MarketplaceVehicle): string {
  if (vehicle.images && vehicle.images.length > 0) {
    const primary = vehicle.images.find((img) => img.is_primary);
    return primary ? primary.url : vehicle.images[0].url;
  }
  return FALLBACK_IMAGE;
}

/* -------------------------------------------------------------------------- */
/* Tab definitions                                                            */
/* -------------------------------------------------------------------------- */

type TabId = 'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING_REVIEW', label: 'Pending Review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
];

/* -------------------------------------------------------------------------- */
/* Reject Modal                                                               */
/* -------------------------------------------------------------------------- */

function RejectModal({
  vehicle,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  vehicle: MarketplaceVehicle;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please provide a reason for rejection.');
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Reject Vehicle</h3>
          <p className="text-sm text-gray-500 mt-1">
            Rejecting &quot;{vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}&quot;
          </p>
        </div>

        <div className="p-6">
          <label
            htmlFor="reject-reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reject-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Explain why this vehicle listing is being rejected..."
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {error && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Reject Vehicle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Vehicle Card                                                               */
/* -------------------------------------------------------------------------- */

function VehicleCard({
  vehicle,
  onApprove,
  onReject,
  approvingId,
}: {
  vehicle: MarketplaceVehicle;
  onApprove: (id: string) => void;
  onReject: (vehicle: MarketplaceVehicle) => void;
  approvingId: string | null;
}) {
  const imageUrl = getVehiclePrimaryImage(vehicle);
  const isApproving = approvingId === vehicle.id;
  const isPending = vehicle.status === 'PENDING_REVIEW';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 lg:w-56 flex-shrink-0">
          <img
            src={imageUrl}
            alt={vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-40 sm:h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {vehicle.make} {vehicle.model} &middot; {vehicle.year}
              </p>
            </div>
            <VehicleStatusBadge status={vehicle.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(vehicle.price_usd)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Seller ID</p>
              <p className="font-mono text-xs text-gray-700 truncate">
                {vehicle.seller_id.slice(0, 12)}...
              </p>
            </div>
            <div>
              <p className="text-gray-500">Submitted</p>
              <p className="text-gray-700">{formatDate(vehicle.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="text-gray-700">
                {vehicle.location_city && vehicle.location_state
                  ? `${vehicle.location_city}, ${vehicle.location_state}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Rejection reason display */}
          {vehicle.status === 'REJECTED' && vehicle.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600">{vehicle.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => onApprove(vehicle.id)}
                disabled={isApproving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={() => onReject(vehicle)}
                disabled={isApproving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function AdminVehicleReview() {
  const [activeTab, setActiveTab] = useState<TabId>('ALL');
  const [rejectTarget, setRejectTarget] = useState<MarketplaceVehicle | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const {
    data: vehicles,
    isLoading,
    isError,
    refetch,
  } = useMarketplaceVehicles('admin');

  const approveMutation = useApproveVehicle();
  const rejectMutation = useRejectVehicle();

  const filteredVehicles = useMemo(() => {
    const list = vehicles || [];
    if (activeTab === 'ALL') return list;
    return list.filter((v: MarketplaceVehicle) => v.status === activeTab);
  }, [vehicles, activeTab]);

  const tabCounts = useMemo(() => {
    const list = vehicles || [];
    return {
      ALL: list.length,
      PENDING_REVIEW: list.filter((v: MarketplaceVehicle) => v.status === 'PENDING_REVIEW').length,
      APPROVED: list.filter((v: MarketplaceVehicle) => v.status === 'APPROVED').length,
      REJECTED: list.filter((v: MarketplaceVehicle) => v.status === 'REJECTED').length,
    };
  }, [vehicles]);

  const handleApprove = useCallback(
    async (id: string) => {
      setApprovingId(id);
      try {
        await approveMutation.mutateAsync(id);
        showToast({ type: 'success', message: 'Vehicle approved successfully' });
        refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to approve vehicle';
        showToast({ type: 'error', message });
      } finally {
        setApprovingId(null);
      }
    },
    [approveMutation, refetch]
  );

  const handleReject = useCallback(
    async (reason: string) => {
      if (!rejectTarget) return;
      try {
        await rejectMutation.mutateAsync({ id: rejectTarget.id, reason });
        showToast({ type: 'success', message: 'Vehicle rejected successfully' });
        setRejectTarget(null);
        refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to reject vehicle';
        showToast({ type: 'error', message });
      }
    },
    [rejectTarget, rejectMutation, refetch]
  );

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Vehicles
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error fetching the vehicle list. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-1">
            <Eye className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Vehicle Review</h1>
          </div>
          <p className="text-gray-300 mt-1">
            Review, approve, or reject vehicle listings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Vehicle list */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-600">
              {activeTab === 'ALL'
                ? 'No vehicles have been submitted yet.'
                : `No vehicles with status "${TABS.find((t) => t.id === activeTab)?.label}" found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle: MarketplaceVehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onApprove={handleApprove}
                onReject={setRejectTarget}
                approvingId={approvingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          vehicle={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          isSubmitting={rejectMutation.isPending}
        />
      )}
    </div>
  );
}
