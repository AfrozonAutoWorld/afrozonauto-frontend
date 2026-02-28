'use client';

export interface DelAddressModalProps {
  loading: boolean;
  address: Record<string, unknown> | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DelAddressModal({
  loading,
  address,
  onClose,
  onConfirm,
}: DelAddressModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Address</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this address?
        </p>
        {address && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
            <p className="font-medium text-gray-900">
              {String(address.firstName)} {String(address.lastName)}
            </p>
            <p className="text-gray-600">{String(address.street)}</p>
            <p className="text-gray-600">
              {String(address.city)}, {String(address.state)}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
