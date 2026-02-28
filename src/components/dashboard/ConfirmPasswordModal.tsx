'use client';

export interface ConfirmPasswordModalProps {
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmPasswordModal({
  loading,
  onClose,
  onConfirm,
}: ConfirmPasswordModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
        <p className="text-sm text-gray-600 mb-6">
          A reset link will be sent to your email.
        </p>
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
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Yes, Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
