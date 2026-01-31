import { useState } from 'react';
import { Calculator, Ship, Truck, Info } from 'lucide-react';
import type { VehicleType } from '../../types';
import {
  formatCurrency,
  getEstimatedDeliveryDate,
  formatDate,
  NIGERIAN_STATES,
} from '../../lib/pricingCalculator';
import { CostBreakdown } from '../../lib/api/orders';

interface PriceCalculatorProps {
  vehiclePrice: number;
  vehicleType: VehicleType;
  costBreakdown?: CostBreakdown | null;
  isLoading?: boolean;
  onShippingMethodChange?: (method: 'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS') => void;
}

export function PriceCalculator({ costBreakdown, isLoading }: PriceCalculatorProps) {
  const [shippingMethod, setShippingMethod] = useState<'RORO' | 'CONTAINER' | 'AIR_FREIGHT' | 'EXPRESS'>('RORO');
  const [destinationState, setDestinationState] = useState('Lagos');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const paymentData = costBreakdown?.paymentBreakdown;
  const defaultPricing = costBreakdown?.defaultPricing;

  const estimatedDeliveryDays = shippingMethod === 'RORO' ? 45 :
    shippingMethod === 'CONTAINER' ? 60 :
      shippingMethod === 'AIR_FREIGHT' ? 15 : 7;



  const costItems = paymentData ? [
    {
      label: 'Vehicle Price',
      value: paymentData.breakdown.vehiclePriceUsd,
      info: 'Base price of the vehicle in USD'
    },
    {
      label: 'Afrozon Sourcing Fee',
      value: paymentData.breakdown.sourcingFee,
      info: '5% of vehicle price (min $500)'
    },
    {
      label: 'Pre-Purchase Inspection',
      value: paymentData.breakdown.prePurchaseInspectionUsd,
      info: 'Professional vehicle inspection'
    },
    {
      label: 'US Handling Fee',
      value: paymentData.breakdown.usHandlingFeeUsd,
      info: 'Documentation and export prep'
    },
    {
      label: 'Shipping Cost',
      value: paymentData.breakdown.shippingCostUsd,
      info: `${shippingMethod} shipping method`
    },
  ] : [];

  // Calculate exchange rate from default pricing if available
  const exchangeRate = defaultPricing ? 1550 : 1550; // Fallback to 1600 if not available

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <Calculator className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Landed Cost Calculator</h3>
        </div>
        <p className="text-emerald-100 text-sm mt-1">
          Calculate your total cost including shipping to Nigeria
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Shipping Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShippingMethod('RORO')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${shippingMethod === 'RORO'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Ship className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">RoRo</div>
                <div className="text-xs text-gray-500">Roll-on/Roll-off</div>
              </div>
            </button>
            <button
              onClick={() => setShippingMethod('CONTAINER')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${shippingMethod === 'CONTAINER'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <Truck className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Container</div>
                <div className="text-xs text-gray-500">Full container</div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Location
          </label>
          <select
            value={destinationState}
            onChange={(e) => setDestinationState(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="bg-gray-50 rounded-xl p-5 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Calculating costs...</p>
            </div>
          </div>
        ) : paymentData ? (
          <>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Landed Cost</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(paymentData.totalUsd)}
                  </p>
                  <p className="text-lg text-emerald-600 font-medium">
                    {formatCurrency(paymentData.totalUsd * exchangeRate, 'NGN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Est. Delivery</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {estimatedDeliveryDays} days
                  </p>
                  <p className="text-sm text-gray-500">
                    ~{formatDate(getEstimatedDeliveryDate(estimatedDeliveryDays))}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1"
            >
              {showBreakdown ? 'Hide' : 'Show'} Cost Breakdown
              <Info className="w-4 h-4" />
            </button>

            {showBreakdown && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {costItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 text-gray-600">{item.label}</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.value)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 font-semibold">
                      <td className="px-4 py-3 text-emerald-800">Total</td>
                      <td className="px-4 py-3 text-right text-emerald-800">
                        {formatCurrency(paymentData.totalUsd)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-gray-500 text-center">
              Exchange rate: $1 = {formatCurrency(exchangeRate, 'NGN').replace('NGN', '').trim()} NGN
              <br />
              Prices are estimates and may vary based on market conditions.
            </p>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 text-center">
              Unable to load pricing information. Please try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
