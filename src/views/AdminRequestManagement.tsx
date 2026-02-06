'use client';

import { useState, useMemo, useCallback } from 'react';
import { Check, X, Eye, DollarSign, User, Car } from 'lucide-react';
import {
  useVehicleRequests,
  useVerifyRequest,
} from '@/hooks/useMarketplace';
import { RequestStatusBadge } from '@/components/marketplace/StatusBadge';
import { showToast } from '@/lib/showNotification';
import type { VehicleRequest } from '@/lib/marketplace/types';

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

/* -------------------------------------------------------------------------- */
/* Tab definitions                                                            */
/* -------------------------------------------------------------------------- */

type TabId = 'ALL' | 'DEPOSIT_PAID' | 'VERIFIED_AVAILABLE' | 'COMPLETED' | 'CANCELED';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'DEPOSIT_PAID', label: 'Deposit Paid' },
  { id: 'VERIFIED_AVAILABLE', label: 'Verified' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELED', label: 'Canceled' },
];

/* -------------------------------------------------------------------------- */
/* Cancel Modal                                                               */
/* -------------------------------------------------------------------------- */

function CancelModal({
  request,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  request: VehicleRequest;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  const vehicleLabel = request.vehicle
    ? `${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`
    : `Request #${request.id.slice(0, 8)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Cancel Request</h3>
          <p className="text-sm text-gray-500 mt-1">
            Canceling request for &quot;{vehicleLabel}&quot;
          </p>
        </div>

        <div className="p-6">
          <label
            htmlFor="cancel-reason"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reason for cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Explain why this request is being canceled..."
            className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
          />
          {error && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <X className="w-3.5 h-3.5" />
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
            Go Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Canceling...
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Cancel Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Request Card                                                               */
/* -------------------------------------------------------------------------- */

function RequestCard({
  request,
  onVerify,
  onCancel,
  verifyingId,
}: {
  request: VehicleRequest;
  onVerify: (id: string) => void;
  onCancel: (request: VehicleRequest) => void;
  verifyingId: string | null;
}) {
  const isVerifying = verifyingId === request.id;
  const isDepositPaid = request.status === 'DEPOSIT_PAID';

  const vehicleLabel = request.vehicle
    ? `${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`
    : `Vehicle #${request.vehicle_id.slice(0, 8)}`;

  const vehicleTitle = request.vehicle?.title || vehicleLabel;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Car className="w-4 h-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicleTitle}
              </h3>
            </div>
            <p className="text-sm text-gray-500">{vehicleLabel}</p>
          </div>
          <RequestStatusBadge status={request.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Buyer ID
            </p>
            <p className="font-mono text-xs text-gray-700 truncate mt-0.5">
              {request.buyer_id.slice(0, 12)}...
            </p>
          </div>
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Deposit
            </p>
            <p className="font-semibold text-gray-900 mt-0.5">
              {formatCurrency(request.deposit_amount)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Final Amount
            </p>
            <p className="font-semibold text-gray-900 mt-0.5">
              {request.final_amount > 0
                ? formatCurrency(request.final_amount)
                : 'TBD'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="text-gray-700 mt-0.5">{formatDate(request.created_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Updated</p>
            <p className="text-gray-700 mt-0.5">{formatDate(request.updated_at)}</p>
          </div>
        </div>

        {/* Notes */}
        {request.notes && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Buyer Notes</p>
            <p className="text-sm text-gray-700">{request.notes}</p>
          </div>
        )}

        {/* Cancel reason */}
        {request.status === 'CANCELED' && request.cancel_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-red-700 mb-1">
              Cancellation Reason
            </p>
            <p className="text-sm text-red-600">{request.cancel_reason}</p>
          </div>
        )}

        {/* Actions for DEPOSIT_PAID */}
        {isDepositPaid && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onVerify(request.id)}
              disabled={isVerifying}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Verify Available
                </>
              )}
            </button>
            <button
              onClick={() => onCancel(request)}
              disabled={isVerifying}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function AdminRequestManagement() {
  const [activeTab, setActiveTab] = useState<TabId>('ALL');
  const [cancelTarget, setCancelTarget] = useState<VehicleRequest | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const {
    data: requests,
    isLoading,
    isError,
    refetch,
  } = useVehicleRequests('admin');

  const verifyMutation = useVerifyRequest();

  const filteredRequests = useMemo(() => {
    const list = requests || [];
    if (activeTab === 'ALL') return list;
    return list.filter((r: VehicleRequest) => r.status === activeTab);
  }, [requests, activeTab]);

  const tabCounts = useMemo(() => {
    const list = requests || [];
    return {
      ALL: list.length,
      DEPOSIT_PAID: list.filter((r: VehicleRequest) => r.status === 'DEPOSIT_PAID').length,
      VERIFIED_AVAILABLE: list.filter((r: VehicleRequest) => r.status === 'VERIFIED_AVAILABLE').length,
      COMPLETED: list.filter((r: VehicleRequest) => r.status === 'COMPLETED').length,
      CANCELED: list.filter((r: VehicleRequest) => r.status === 'CANCELED').length,
    };
  }, [requests]);

  const handleVerify = useCallback(
    async (id: string) => {
      setVerifyingId(id);
      try {
        await verifyMutation.mutateAsync({ id, action: 'verify' });
        showToast({
          type: 'success',
          message: 'Request verified successfully. Vehicle marked as available.',
        });
        refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to verify request';
        showToast({ type: 'error', message });
      } finally {
        setVerifyingId(null);
      }
    },
    [verifyMutation, refetch]
  );

  const handleCancel = useCallback(
    async (reason: string) => {
      if (!cancelTarget) return;
      try {
        await verifyMutation.mutateAsync({
          id: cancelTarget.id,
          action: 'cancel',
          reason,
        });
        showToast({ type: 'success', message: 'Request canceled successfully' });
        setCancelTarget(null);
        refetch();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to cancel request';
        showToast({ type: 'error', message });
      }
    },
    [cancelTarget, verifyMutation, refetch]
  );

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading requests...</p>
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
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Requests
          </h2>
          <p className="text-gray-600 mb-6">
            There was an error fetching the request list. Please try again.
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
            <DollarSign className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Request Management</h1>
          </div>
          <p className="text-gray-300 mt-1">
            Verify deposits and manage vehicle purchase requests
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

        {/* Request list */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600">
              {activeTab === 'ALL'
                ? 'No purchase requests have been created yet.'
                : `No requests with status "${TABS.find((t) => t.id === activeTab)?.label}" found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request: VehicleRequest) => (
              <RequestCard
                key={request.id}
                request={request}
                onVerify={handleVerify}
                onCancel={setCancelTarget}
                verifyingId={verifyingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelTarget && (
        <CancelModal
          request={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          isSubmitting={verifyMutation.isPending}
        />
      )}
    </div>
  );
}
