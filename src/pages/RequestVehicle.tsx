
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Ship, Truck, Shield, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateLandedCost, formatCurrency, formatDate, getEstimatedDeliveryDate, NIGERIAN_STATES } from '../lib/pricingCalculator';
import type { Vehicle } from '../types';

export function RequestVehicle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(location.state?.vehicle || null);
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<'RoRo' | 'Container'>('RoRo');
  const [destinationState, setDestinationState] = useState(profile?.state || 'Lagos');
  const [destinationAddress, setDestinationAddress] = useState(profile?.address || '');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToInspection, setAgreeToInspection] = useState(false);
  const [agreeToNoRefund, setAgreeToNoRefund] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/request/${id}` } });
    }
  }, [user, navigate, id]);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const result = calculateLandedCost(vehicle.price_usd, vehicle.vehicle_type, shippingMethod, destinationState);
  const { breakdown, estimatedDeliveryDays, depositAmount } = result;

  const handleSubmit = () => {
    if (!agreeToTerms || !agreeToInspection || !agreeToNoRefund) {
      setError('Please agree to all terms and conditions');
      return;
    }
    if (!destinationState || !destinationAddress) {
      setError('Please provide complete delivery information');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate successful request submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { state: { newRequest: 'SIMULATED_REQUEST_123' } });
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your vehicle request has been received. Our team will review it and send you a detailed quote shortly.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Vehicle
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${s <= step ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1 ${s <= step ? 'text-emerald-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Shipping' : s === 2 ? 'Delivery' : 'Confirm'}
              </p>
            </div>
          ))}
        </div>

        {/* Steps UI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Vehicle Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <img
                  src={vehicle.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>
                  <p className="text-emerald-600 font-semibold">{formatCurrency(vehicle.price_usd)}</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>
                <div className="space-y-4">
                  {['RoRo', 'Container'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setShippingMethod(method as 'RoRo' | 'Container')}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${shippingMethod === method ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${shippingMethod === method ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          {method === 'RoRo' ? <Ship className={`w-6 h-6 ${shippingMethod === method ? 'text-emerald-600' : 'text-gray-500'}`} /> : <Truck className={`w-6 h-6 ${shippingMethod === method ? 'text-emerald-600' : 'text-gray-500'}`} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{method} Shipping</h3>
                              <p className="text-sm text-gray-500">{method === 'RoRo' ? 'Roll-on/Roll-off vessel' : 'Full container load'}</p>
                            </div>
                            <span className="text-emerald-600 font-semibold">{method === 'RoRo' ? '~45 days' : '~60 days'}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => setStep(2)} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">Continue</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destination State</label>
                    <select value={destinationState} onChange={(e) => setDestinationState(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      {NIGERIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} rows={3} placeholder="Enter your full delivery address" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any special requests or preferences?" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
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
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Delivery: {destinationState}</p>
                      <p className="text-sm text-gray-500">{destinationAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link> and{' '}
                      <Link to="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeToInspection} onChange={(e) => setAgreeToInspection(e.target.checked)} className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="text-sm text-gray-600">
                      I understand that Afrozon will conduct a professional inspection and I will review the report before approving the purchase.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeToNoRefund} onChange={(e) => setAgreeToNoRefund(e.target.checked)} className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                    <span className="text-sm text-gray-600">
                      I understand that once I approve the purchase and Afrozon buys the vehicle, refunds are not available except as outlined in the policy.
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
                  <button onClick={() => setStep(2)} className="text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">Back</button>
                  <button onClick={handleSubmit} disabled={isSubmitting || !agreeToTerms || !agreeToInspection || !agreeToNoRefund} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {isSubmitting ? (
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

          {/* Sidebar: Cost & Timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Cost Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Vehicle Price</span><span className="font-medium">{formatCurrency(breakdown.vehicle_price)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sourcing Fee</span><span className="font-medium">{formatCurrency(breakdown.sourcing_fee)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Inspection</span><span className="font-medium">{formatCurrency(breakdown.inspection_fee)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping ({shippingMethod})</span><span className="font-medium">{formatCurrency(breakdown.shipping_cost)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Duties & Taxes</span><span className="font-medium">{formatCurrency(breakdown.customs_duty + breakdown.vat + breakdown.levy)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Clearing & Delivery</span><span className="font-medium">{formatCurrency(breakdown.clearing_fee + breakdown.port_charges + breakdown.local_delivery)}</span></div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between text-lg"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-gray-900">{formatCurrency(breakdown.total_usd)}</span></div>
                  <p className="text-right text-emerald-600 font-medium mt-1">{formatCurrency(breakdown.total_ngn, 'NGN')}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center"><span className="text-emerald-800 font-medium">Deposit (30%)</span><span className="text-xl font-bold text-emerald-700">{formatCurrency(depositAmount)}</span></div>
                  <p className="text-xs text-emerald-600 mt-1">Pay after quote approval</p>
                </div>
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
                  <p className="text-sm text-gray-500">Est. {formatDate(getEstimatedDeliveryDate(estimatedDeliveryDays))}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

