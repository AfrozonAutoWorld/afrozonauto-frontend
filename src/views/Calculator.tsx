import { useState } from 'react';
import Link from 'next/link';
import { Calculator as CalcIcon, Ship, Truck, ArrowRight, Info } from 'lucide-react';
import {
  calculateLandedCost,
  formatCurrency,
  formatDate,
  getEstimatedDeliveryDate,
  NIGERIAN_STATES,
} from '../lib/pricingCalculator';
import type { VehicleType } from '../types';

const vehicleTypes: VehicleType[] = ['CAR', 'SUV', 'TRUCK', 'VAN', 'SEDAN', 'COUPE', 'HATCHBACK', 'WAGON', 'CONVERTIBLE'];

export function Calculator() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(20000);
  const [vehicleType, setVehicleType] = useState<VehicleType>('SUV');
  const [shippingMethod, setShippingMethod] = useState<'RORO' | 'CONTAINER'>('RORO');
  const [destinationState, setDestinationState] = useState('Lagos');

  const result = calculateLandedCost(vehiclePrice, vehicleType, shippingMethod);
  const { breakdown, estimatedDeliveryDays, depositAmount } = result;

  const costItems = [
    { label: 'Vehicle Price', value: breakdown.vehicle_price, description: 'Base price of the vehicle' },
    { label: 'Afrozon Sourcing Fee', value: breakdown.sourcing_fee, description: '5% of vehicle price (min $500)' },
    { label: 'Pre-Purchase Inspection', value: breakdown.inspection_fee, description: 'Professional 150+ point inspection' },
    { label: 'US Handling Fee', value: breakdown.us_handling_fee, description: 'Export prep and documentation' },
    { label: `Shipping (${shippingMethod})`, value: breakdown.shipping_cost, description: `${shippingMethod} shipping to Nigeria` },
    //   { label: 'Import Duty (35%)', value: breakdown.customs_duty, description: 'Nigerian customs duty on CIF value' },
    //   { label: 'VAT (7.5%)', value: breakdown.vat, description: 'Value Added Tax' },
    //   { label: 'CISS Levy (15%)', value: breakdown.levy, description: 'Comprehensive Import Supervision Scheme' },
    //   { label: 'Clearing & Documentation', value: breakdown.clearing_fee, description: 'Port clearance services' },
    //   { label: 'Port Charges', value: breakdown.port_charges, description: 'Terminal handling charges' },
    //   { label: `Delivery to ${destinationState}`, value: breakdown.local_delivery, description: 'Door-to-door delivery' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CalcIcon className="w-4 h-4" />
            Landed Cost Calculator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Calculate Your Import Costs
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get an accurate estimate of the total cost to import a vehicle from the US to Nigeria
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={vehiclePrice}
                      onChange={(e) => setVehiclePrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10000, 20000, 30000, 50000].map((price) => (
                      <button
                        key={price}
                        onClick={() => setVehiclePrice(price)}
                        className={`px-3 py-1 rounded-full text-sm ${vehiclePrice === price
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ${price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Options</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShippingMethod('RORO')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${shippingMethod === 'RORO'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Ship className={`w-6 h-6 ${shippingMethod === 'RORO' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className="font-semibold text-gray-900">RoRo</span>
                    </div>
                    <p className="text-sm text-gray-500">Roll-on/Roll-off</p>
                    <p className="text-sm font-medium text-emerald-600 mt-1">~45 days</p>
                  </button>

                  <button
                    onClick={() => setShippingMethod('CONTAINER')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${shippingMethod === 'CONTAINER'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className={`w-6 h-6 ${shippingMethod === 'CONTAINER' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span className="font-semibold text-gray-900">Container</span>
                    </div>
                    <p className="text-sm text-gray-500">Full container</p>
                    <p className="text-sm font-medium text-emerald-600 mt-1">~60 days</p>
                  </button>
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
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Cost Breakdown</h2>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {costItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="text-gray-700">{item.label}</span>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-emerald-100 text-sm">Total Landed Cost</p>
                  <p className="text-4xl font-bold">{formatCurrency(breakdown.total_usd)}</p>
                  <p className="text-xl text-emerald-100 font-medium mt-1">
                    {formatCurrency(breakdown.total_ngn, 'NGN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm">Est. Delivery</p>
                  <p className="text-2xl font-bold">{estimatedDeliveryDays} days</p>
                  <p className="text-sm text-emerald-100">
                    ~{formatDate(getEstimatedDeliveryDate(estimatedDeliveryDays))}
                  </p>
                </div>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-emerald-100 text-sm">Required Deposit (30%)</p>
                    <p className="text-2xl font-bold">{formatCurrency(depositAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/vehicles"
              className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors"
            >
              Browse Vehicles
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Estimate Only</p>
                  <p className="mt-1">
                    This calculator provides estimates based on current rates. Actual costs may vary based on
                    market conditions, exchange rates, and specific vehicle requirements.
                    Exchange rate: $1 = {formatCurrency(breakdown.exchange_rate, 'NGN').replace('NGN', '').trim()} NGN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
