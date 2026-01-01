import { useState, useEffect } from 'react';
import { Calculator, Ship, Truck, Info } from 'lucide-react';
import type { VehicleType, CostBreakdown } from '../../types';
import {
  calculateLandedCost,
  formatCurrency,
  getEstimatedDeliveryDate,
  formatDate,
  NIGERIAN_STATES,
} from '../../lib/pricingCalculator';

interface PriceCalculatorProps {
  vehiclePrice: number;
  vehicleType: VehicleType;
  onCalculate?: (breakdown: CostBreakdown, deliveryDays: number) => void;
}

export function PriceCalculator({ vehiclePrice, vehicleType, onCalculate }: PriceCalculatorProps) {
  const [shippingMethod, setShippingMethod] = useState<'RoRo' | 'Container'>('RoRo');
  const [destinationState, setDestinationState] = useState('Lagos');
  const [showBreakdown, setShowBreakdown] = useState(false);

  const result = calculateLandedCost(vehiclePrice, vehicleType, shippingMethod, destinationState);
  const { breakdown, estimatedDeliveryDays, depositAmount } = result;

  useEffect(() => {
    if (onCalculate) {
      onCalculate(breakdown, estimatedDeliveryDays);
    }
  }, [vehiclePrice, vehicleType, shippingMethod, destinationState]);

  const costItems = [
    { label: 'Vehicle Price', value: breakdown.vehicle_price, info: 'Base price of the vehicle in USD' },
    { label: 'Afrozon Sourcing Fee', value: breakdown.sourcing_fee, info: '5% of vehicle price (min $500)' },
    { label: 'Pre-Purchase Inspection', value: breakdown.inspection_fee, info: 'Professional vehicle inspection' },
    { label: 'US Handling Fee', value: breakdown.us_handling_fee, info: 'Documentation and export prep' },
    { label: 'Shipping Cost', value: breakdown.shipping_cost, info: `${shippingMethod} shipping to Nigeria` },
    { label: 'Import Duty (35%)', value: breakdown.customs_duty, info: 'Nigerian customs duty' },
    { label: 'VAT (7.5%)', value: breakdown.vat, info: 'Value Added Tax' },
    { label: 'CISS Levy (15%)', value: breakdown.levy, info: 'Comprehensive Import Supervision Scheme' },
    { label: 'Clearing & Documentation', value: breakdown.clearing_fee, info: 'Port clearance services' },
    { label: 'Port Charges', value: breakdown.port_charges, info: 'Terminal handling charges' },
    { label: 'Local Delivery', value: breakdown.local_delivery, info: `Delivery to ${destinationState}` },
  ];

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
              onClick={() => setShippingMethod('RoRo')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                shippingMethod === 'RoRo'
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
              onClick={() => setShippingMethod('Container')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                shippingMethod === 'Container'
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

        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Landed Cost</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(breakdown.total_usd)}
              </p>
              <p className="text-lg text-emerald-600 font-medium">
                {formatCurrency(breakdown.total_ngn, 'NGN')}
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

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Required Deposit (30%)</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(depositAmount)}
                </p>
              </div>
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
                    {formatCurrency(breakdown.total_usd)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Exchange rate: $1 = {formatCurrency(breakdown.exchange_rate, 'NGN').replace('NGN', '').trim()} NGN
          <br />
          Prices are estimates and may vary based on market conditions.
        </p>
      </div>
    </div>
  );
}
