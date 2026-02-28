'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAddressMutate, useGetAddresses, useGetDefaultAddress } from '@/hooks/useAddress';
import { useAuthMutations } from '@/hooks/useAuthMutations';
import { showToast } from '@/lib/showNotification';
import { AddAddressModal } from '@/views/AddAddressModal';
import { ResetPasswordModal } from '@/views/ResetPasswordModal';
import { UpdateAddressModal } from '@/views/UpdateAddressModal';
import { AddressCard } from './AddressCard';
import { ConfirmPasswordModal } from './ConfirmPasswordModal';
import { DelAddressModal } from './DelAddressModal';

export function DashboardProfileTab() {
  const { data: session } = useSession();
  const user = session?.user;
  const { forgotPassword } = useAuthMutations();
  const { deleteAddress } = useAddressMutate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [updateAddModal, setUpdateAddModal] = useState(false);
  const [delAddModal, setDelAddModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Record<string, unknown> | null>(null);

  const {
    defaultAddresses,
    isLoading: defaultLoading,
    isError: defaultError,
    refetch: refetchDefault,
  } = useGetDefaultAddress();

  const {
    addresses,
    isLoading: addressesLoading,
    isError: addressesError,
    refetch: refetchAddresses,
  } = useGetAddresses();

  const primaryDefault =
    Array.isArray(defaultAddresses) && defaultAddresses.length > 0
      ? (defaultAddresses[0] as Record<string, unknown>)
      : null;

  const otherAddresses = Array.isArray(addresses)
    ? addresses.filter(
        (a: Record<string, unknown>) => a.id !== primaryDefault?.id
      )
    : [];

  const handleConfirmChangePassword = async () => {
    if (!user?.email) return;
    try {
      setChangingPassword(true);
      await forgotPassword({ email: user.email });
      setShowConfirmModal(false);
      setShowResetPasswordModal(true);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddAddressSuccess = () => {
    refetchAddresses();
    refetchDefault();
  };

  const handleOpenUpdate = (addr: Record<string, unknown>) => {
    setSelectedAddress(addr);
    setUpdateAddModal(true);
  };

  const handleOpenDelete = (addr: Record<string, unknown>) => {
    setSelectedAddress(addr);
    setDelAddModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAddress?.id) {
      showToast({ type: 'error', message: 'Error: No address ID found' });
      return;
    }
    try {
      await deleteAddress({ id: String(selectedAddress.id) });
      refetchAddresses();
      refetchDefault();
      setDelAddModal(false);
      setSelectedAddress(null);
    } catch {
      showToast({ type: 'error', message: 'Failed to delete address' });
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 bg-white rounded-xl shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="text-emerald-600 font-medium hover:underline"
            >
              Change Password
            </button>
            <button
              onClick={() => setShowAddAddress(true)}
              className="text-emerald-600 font-medium hover:underline"
            >
              Add Address
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={(user as { profile?: { firstName?: string } })?.profile?.firstName ?? ''}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={(user as { phone?: string })?.phone ?? ''}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={(user as { country?: string })?.country ?? 'Nigeria'}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Address</h3>
          {defaultLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p>Loading default address...</p>
            </div>
          ) : defaultError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Failed to load default address. Please try again.</p>
            </div>
          ) : !primaryDefault || !primaryDefault.id ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-900 font-medium mb-1">No default address set</p>
                  <p className="text-blue-700 text-sm mb-3">
                    Set a default address to speed up your checkout process and vehicle deliveries.
                  </p>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Default Address
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md">
              <AddressCard
                addr={primaryDefault}
                onEdit={handleOpenUpdate}
                onDelete={handleOpenDelete}
              />
            </div>
          )}
        </div>

        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Other Saved Addresses</h3>
            <span className="text-sm text-gray-500">
              {otherAddresses.length} {otherAddresses.length === 1 ? 'address' : 'addresses'}
            </span>
          </div>
          {addressesLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p>Loading addresses...</p>
            </div>
          ) : addressesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Failed to load addresses. Please try again.</p>
            </div>
          ) : otherAddresses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No additional addresses saved.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {otherAddresses.map((addr: Record<string, unknown>) => (
                <AddressCard
                  key={String(addr.id)}
                  addr={addr}
                  onEdit={handleOpenUpdate}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmPasswordModal
          loading={changingPassword}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmChangePassword}
        />
      )}
      {showResetPasswordModal && (
        <ResetPasswordModal
          onClose={() => setShowResetPasswordModal(false)}
          onSuccess={() => setShowResetPasswordModal(false)}
        />
      )}
      {showAddAddress && (
        <AddAddressModal
          onClose={() => setShowAddAddress(false)}
          onSuccess={handleAddAddressSuccess}
        />
      )}
      {updateAddModal && selectedAddress && (
        <UpdateAddressModal
          address={selectedAddress}
          onClose={() => {
            setUpdateAddModal(false);
            setSelectedAddress(null);
          }}
          onSuccess={handleAddAddressSuccess}
        />
      )}
      {delAddModal && selectedAddress && (
        <DelAddressModal
          loading={false}
          address={selectedAddress}
          onClose={() => {
            setDelAddModal(false);
            setSelectedAddress(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
