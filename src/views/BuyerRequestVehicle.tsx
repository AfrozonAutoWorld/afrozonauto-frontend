'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Car,
  MapPin,
  DollarSign,
  Shield,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useMarketplaceVehicle, useCreateRequest } from '@/hooks/useMarketplace';
import { DEFAULT_DEPOSIT_AMOUNT } from '@/lib/marketplace/constants';
import { showToast } from '@/lib/showNotification';

interface Props {
  vehicleId: string;
}

export function BuyerRequestVehicle({ vehicleId }: Props) {
  const router = useRouter();
  const { data: vehicle, isLoading, error } = useMarketplaceVehicle(vehicleId);
  const createRequest = useCreateRequest();
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Not Found</h2>
        <p className="text-gray-500 mb-6">This vehicle may no longer be available.</p>
        <Link href="/vehicles" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Browse Vehicles
        </Link>
      </div>
    );
  }

  const primaryImage = vehicle.images?.find((i) => i.is_primary)?.url || vehicle.images?.[0]?.url;
  const depositAmount = DEFAULT_DEPOSIT_AMOUNT;
  const remainingAmount = vehicle.price_usd - depositAmount;

  const handleSubmit = async () => {
    try {
      await createRequest.mutateAsync({
        vehicle_id: vehicleId,
        notes,
      });
      setSubmitted(true);
      showToast({ type: 'success', message: 'Request created! Pay your deposit to proceed.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create request';
      showToast({ type: 'error', message });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Request Created</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your request for the {vehicle.year} {vehicle.make} {vehicle.model} has been created.
          Head to your dashboard to pay the deposit and proceed with the purchase.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <Link href="/vehicles" className="text-gray-600 hover:text-gray-900 font-medium">
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-emerald-900 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Request Vehicle</h1>
          <p className="text-emerald-200">
            Submit a purchase request and pay a deposit to secure this vehicle.
          </p>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="w-full md:w-48 h-36 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              {primaryImage ? (
                <img src={primaryImage} alt={vehicle.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {vehicle.title || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </h2>
              <p className="text-gray-500 mb-3">
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.transmission} - {vehicle.fuel_type}
              </p>
              {(vehicle.location_city || vehicle.location_state) && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  {[vehicle.location_city, vehicle.location_state].filter(Boolean).join(', ')}
                </div>
              )}
              <p className="text-2xl font-bold text-emerald-600">
                ${Number(vehicle.price_usd).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">Payment Breakdown</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit (due now)</span>
                  <span className="font-semibold text-gray-900">${depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining balance</span>
                  <span className="font-semibold text-gray-900">${remainingAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-emerald-700">${Number(vehicle.price_usd).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">How It Works</h3>
              </div>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-medium">1</span>
                  Pay a refundable deposit to show commitment
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-medium">2</span>
                  Our team verifies the vehicle availability
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-medium">3</span>
                  Pay the remaining balance to complete your purchase
                </li>
              </ol>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific questions or requirements..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              A deposit of <strong>${depositAmount.toLocaleString()}</strong> is required to proceed.
              You will be able to pay after creating the request.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={createRequest.isPending}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createRequest.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Submit Purchase Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
