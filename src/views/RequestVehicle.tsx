import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  Ship,
  Truck,
  Shield,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  getEstimatedDeliveryDate,
} from '../lib/pricingCalculator';
import { useVehicle } from '../hooks/useVehicles';
import { useAuthQuery } from '../hooks/useAuth';
import { useRequestOrderVehicle } from '../hooks/useVehicleMutate';
import { useCostBreakdown } from '../hooks/useOrders';


export function RequestVehicle() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthQuery();
  const router = useRouter();

  // Fetch the vehicle via API
  const { vehicle, isLoading: isVehicleLoading } = useVehicle(id ?? "");
  const requestMutate = useRequestOrderVehicle();

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS'>('RORO');
  // const [destinationState, setDestinationState] = useState(user?.state || "Lagos");
  // const [destinationAddress, setDestinationAddress] = useState(user?.address || "");
  // const [destinationCity, setDestinationCity] = useState(user?.city || "");
  // const [destinationCountry, setDestinationCountry] = useState(user?.country || "Nigeria");
  // const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToInspection, setAgreeToInspection] = useState(false);
  const [agreeToNoRefund, setAgreeToNoRefund] = useState(false);
  // const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  // const [success, setSuccess] = useState(false);


  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router, id]);

  if (isVehicleLoading || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  const { costBreakdown, isLoading: isCostBreakdownLoading } = useCostBreakdown(id, shippingMethod);

  const paymentData = costBreakdown?.paymentBreakdown;
  const defaultPricing = costBreakdown?.defaultPricing;

  const breakdown = paymentData?.breakdown;

  const depositAmount = paymentData?.totalUsedDeposit ?? 0

  const estimatedDeliveryDays = shippingMethod === 'RORO' ? 45 :
    shippingMethod === 'CONTAINER' ? 60 :
      shippingMethod === 'AIR_FREIGHT' ? 15 : 7;


  const exchangeRate = defaultPricing ? 1550 : 1550;


  const handleSubmit = async () => {
    if (!user) return;

    if (!agreeToTerms || !agreeToInspection || !agreeToNoRefund) {
      setError('Please agree to all terms and conditions');
      return;
    }

    setError('');

    try {
      await requestMutate.mutateAsync({
        identifier: vehicle.id,
        type: vehicle.vin || vehicle.id,
        shippingMethod,
      });

    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    }
  };

  // if (success) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
  //         <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <CheckCircle className="w-8 h-8 text-emerald-600" />
  //         </div>
  //         <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
  //         <p className="text-gray-600 mb-4">
  //           Your vehicle request has been received. Our team will review it and send you a detailed quote shortly.
  //         </p>
  //         <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Vehicle
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Vehicle</h1>
          <p className="text-gray-600">
            Complete the form below to request this vehicle for import to Nigeria
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-2 rounded-full ${s <= step ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
              />
              <p
                className={`text-xs mt-1 ${s <= step ? 'text-emerald-600' : 'text-gray-400'
                  }`}
              >
                {s === 1 && 'Shipping'}
                {s === 2 && 'Confirm'}
              </p>
            </div>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <img
                  src={vehicle.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
                  <p className="text-emerald-600 font-semibold">{formatCurrency(vehicle.priceUsd)}</p>
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => setShippingMethod('RORO')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${shippingMethod === 'RORO'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${shippingMethod === 'RORO' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <Ship className={`w-6 h-6 ${shippingMethod === 'RORO' ? 'text-emerald-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">RoRo Shipping</h3>
                            <p className="text-sm text-gray-500">Roll-on/Roll-off vessel</p>
                          </div>
                          <span className="text-emerald-600 font-semibold">~45 days</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Most cost-effective option. Vehicle is driven onto the ship.
                          Suitable for standard vehicles.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShippingMethod('CONTAINER')}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${shippingMethod === 'CONTAINER'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${shippingMethod === 'CONTAINER' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <Truck className={`w-6 h-6 ${shippingMethod === 'CONTAINER' ? 'text-emerald-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">Container Shipping</h3>
                            <p className="text-sm text-gray-500">Full container load</p>
                          </div>
                          <span className="text-emerald-600 font-semibold">~60 days</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Maximum protection for your vehicle. Ideal for luxury cars
                          or multiple vehicles.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}


            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Ship className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Shipping: {shippingMethod}</p>
                      <p className="text-sm text-gray-500">Est. {estimatedDeliveryDays} days to arrival</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Ship className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Shipping Method: {shippingMethod}</p>
                      <p className="text-sm text-gray-500">
                        Estimated arrival in {estimatedDeliveryDays} days
                      </p>
                    </div>
                  </div>

                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-emerald-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-emerald-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToInspection}
                      onChange={(e) => setAgreeToInspection(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600">
                      I understand that Afrozon will conduct a professional inspection
                      and I will review the report before approving the purchase.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToNoRefund}
                      onChange={(e) => setAgreeToNoRefund(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-600">
                      I understand that once I approve the purchase and Afrozon buys the
                      vehicle, refunds are not available except as outlined in the policy.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={requestMutate.isPending || !agreeToTerms || !agreeToInspection || !agreeToNoRefund}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {requestMutate.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Cost Summary</h3>

              {isCostBreakdownLoading ? (
                <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Calculating costs...</p>
                  </div>
                </div>
              ) : paymentData && breakdown ? (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Price</span>
                      <span className="font-medium">
                        {formatCurrency(breakdown.vehiclePriceUsd ?? 0)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Sourcing Fee</span>
                      <span className="font-medium">
                        {formatCurrency(breakdown.sourcingFee ?? 0)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Inspection</span>
                      <span className="font-medium">
                        {formatCurrency(breakdown.prePurchaseInspectionUsd ?? 0)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping ({shippingMethod})</span>
                      <span className="font-medium">
                        {formatCurrency(breakdown.shippingCostUsd ?? 0)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-900">Total (USD)</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(paymentData.totalUsd)}
                      </span>
                    </div>
                    <p className="text-right text-emerald-600 font-medium mt-1">
                      {formatCurrency(paymentData.totalUsd * exchangeRate, 'NGN')}
                    </p>
                  </div>

                  <div className="bg-emerald-50 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-800 font-medium">Deposit (30%)</span>
                      <span className="text-xl font-bold text-emerald-700">
                        {formatCurrency(depositAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Pay after quote approval
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Cost data unavailable.</p>
              )}
            </div>
          </div>



          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Estimated Timeline</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Ship className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{estimatedDeliveryDays} Days</p>
                <p className="text-sm text-gray-500">
                  Est. {formatDate(getEstimatedDeliveryDate(estimatedDeliveryDays))}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
