import type { VehicleType, CostBreakdown, PricingConfig } from "../types";

const DEFAULT_CONFIG: PricingConfig = {
  sourcing_fee_percent: 5,
  sourcing_fee_min_usd: 500,
  inspection_fee_usd: 150,
  us_handling_fee_usd: 350,
  shipping_roro_base_usd: 1800,
  shipping_container_base_usd: 2500,
  //customs_duty_percent: 35,
  //vat_percent: 7.5,
  //levy_percent: 15,
  //clearing_fee_usd: 800,
  //port_charges_usd: 400,
  //local_delivery_base_usd: 200,
  exchange_rate_ngn_usd: 1550,
  timeline_days_roro: 45,
  timeline_days_container: 60,
};

const VEHICLE_TYPE_MULTIPLIERS: Record<VehicleType, number> = {
  CAR: 1.0,
  SEDAN: 1.0,
  COUPE: 1.0,
  HATCHBACK: 1.0,
  WAGON: 1.05,
  CONVERTIBLE: 1.05,
  SUV: 1.15,
  TRUCK: 1.25,
  VAN: 1.2,
  MOTORCYCLE: 0,
};

// const STATE_DELIVERY_COSTS: Record<string, number> = {
//   Lagos: 200,
//   Abuja: 450,
//   "Port Harcourt": 350,
//   Kano: 600,
//   Ibadan: 300,
//   Enugu: 400,
//   Kaduna: 550,
//   "Benin City": 350,
//   Warri: 380,
//   Calabar: 420,
// };

export interface CalculationResult {
  breakdown: CostBreakdown;
  estimatedDeliveryDays: number;
  depositAmount: number;
}

export function calculateLandedCost(
  vehiclePrice: number,
  vehicleType: VehicleType,
  shippingMethod: "RORO" | "CONTAINER" | "AIR_FREIGHT" | "EXPRESS",
  //destinationState: string,
  config: PricingConfig = DEFAULT_CONFIG,
): CalculationResult {
  const typeMultiplier = VEHICLE_TYPE_MULTIPLIERS[vehicleType] || 1.0;

  const sourcingFee = Math.max(
    vehiclePrice * (config.sourcing_fee_percent / 100),
    config.sourcing_fee_min_usd,
  );

  const inspectionFee = config.inspection_fee_usd;
  const usHandlingFee = config.us_handling_fee_usd;

  const baseShipping =
    shippingMethod === "RORO"
      ? config.shipping_roro_base_usd
      : config.shipping_container_base_usd;
  const shippingCost = baseShipping * typeMultiplier;

  //const cifValue = vehiclePrice + shippingCost;

  // const customsDuty = cifValue * (config.customs_duty_percent / 100);
  // const vat = (cifValue + customsDuty) * (config.vat_percent / 100);
  // const levy = cifValue * (config.levy_percent / 100);

  // const clearingFee = config.clearing_fee_usd;
  // const portCharges = config.port_charges_usd;

  // const localDelivery = STATE_DELIVERY_COSTS[destinationState] || config.local_delivery_base_usd;

  const totalUsd =
    vehiclePrice + sourcingFee + inspectionFee + usHandlingFee + shippingCost;
  // customsDuty +
  // vat +
  // levy +
  //clearingFee +
  //portCharges +
  //localDelivery;

  const totalNgn = totalUsd * config.exchange_rate_ngn_usd;

  const breakdown: CostBreakdown = {
    vehicle_price: vehiclePrice,
    sourcing_fee: sourcingFee,
    inspection_fee: inspectionFee,
    us_handling_fee: usHandlingFee,
    shipping_cost: shippingCost,
    // customs_duty: customsDuty,
    // vat: vat,
    // levy: levy,
    // clearing_fee: clearingFee,
    // port_charges: portCharges,
    // local_delivery: localDelivery,
    total_usd: totalUsd,
    total_ngn: totalNgn,
    exchange_rate: config.exchange_rate_ngn_usd,
  };

  const estimatedDeliveryDays =
    shippingMethod === "RORO"
      ? config.timeline_days_roro!
      : config.timeline_days_container!;

  const depositAmount = totalUsd * 0.3;

  return {
    breakdown,
    estimatedDeliveryDays,
    depositAmount,
  };
}

export function formatCurrency(
  amount: number,
  currency: "USD" | "NGN" = "USD",
): string {
  if (currency === "NGN") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getEstimatedDeliveryDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const NIGERIAN_STATES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Enugu",
  "Kaduna",
  "Benin City",
  "Warri",
  "Calabar",
  "Aba",
  "Jos",
  "Ilorin",
  "Onitsha",
  "Abeokuta",
  "Uyo",
  "Owerri",
  "Akure",
  "Bauchi",
  "Sokoto",
];

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const VEHICLE_MAKES = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "BMW",
  "Mercedes-Benz",
  "Lexus",
  "Nissan",
  "Hyundai",
  "Kia",
  "Mazda",
  "Volkswagen",
  "Audi",
  "Subaru",
  "Jeep",
  "Dodge",
  "Ram",
  "GMC",
  "Acura",
  "Infiniti",
  "Cadillac",
  "Lincoln",
  "Volvo",
  "Land Rover",
  "Porsche",
];

export { DEFAULT_CONFIG };
