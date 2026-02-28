'use client';

export interface AddressCardProps {
  addr: Record<string, unknown>;
  onEdit: (addr: Record<string, unknown>) => void;
  onDelete: (addr: Record<string, unknown>) => void;
}

export function AddressCard({ addr, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <p className="font-semibold text-gray-900">
        {String(addr.firstName ?? '')} {String(addr.lastName ?? '')}
      </p>
      <p className="text-gray-700">{String(addr.street ?? '')}</p>
      <p className="text-gray-600">
        {String(addr.city ?? '')}, {String(addr.state ?? '')} {String(addr.postalCode ?? '')}
      </p>
      <p className="text-gray-600">{String(addr.country ?? '')}</p>
      {addr.phoneNumber != null && addr.phoneNumber !== '' ? (
        <p className="text-sm text-gray-500 mt-1">{String(addr.phoneNumber)}</p>
      ) : null}
      <div className="flex gap-4 mt-3">
        <button
          onClick={() => onEdit(addr)}
          className="text-emerald-600 text-sm font-medium hover:underline"
        >
          Update
        </button>
        <button
          onClick={() => onDelete(addr)}
          className="text-red-600 text-sm font-medium hover:underline"
        >
          Delete
        </button>
      </div>
      {addr.isDefault ? (
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded mt-2 inline-block">
          Default
        </span>
      ) : null}
    </div>
  );
}
