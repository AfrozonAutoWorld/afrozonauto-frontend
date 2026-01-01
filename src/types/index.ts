export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string;
  state: string | null;
  address: string | null;
  role: 'buyer' | 'admin';
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price_usd: number;
  mileage: number | null;
  vehicle_type: VehicleType;
  engine_size: string | null;
  transmission: string | null;
  fuel_type: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  dealer_name: string | null;
  dealer_state: string | null;
  dealer_city: string | null;
  images: string[];
  features: string[];
  source: string;
  status: VehicleStatus;
  api_listing_id: string | null;
  created_at: string;
  updated_at: string;
}

export type VehicleType = 'Car' | 'SUV' | 'Truck' | 'Van' | 'Coupe' | 'Sedan' | 'Hatchback' | 'Wagon' | 'Convertible';
export type VehicleStatus = 'AVAILABLE' | 'PENDING' | 'SOLD' | 'UNAVAILABLE';

export interface SavedVehicle {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
  vehicle?: Vehicle;
}

export type RequestStatus =
  | 'pending_quote'
  | 'quote_sent'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'inspection_pending'
  | 'inspection_complete'
  | 'awaiting_approval'
  | 'approved'
  | 'purchase_in_progress'
  | 'purchased'
  | 'export_pending'
  | 'shipped'
  | 'in_transit'
  | 'arrived_port'
  | 'customs_clearance'
  | 'cleared'
  | 'delivery_scheduled'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface CostBreakdown {
  vehicle_price: number;
  sourcing_fee: number;
  inspection_fee: number;
  us_handling_fee: number;
  shipping_cost: number;
  customs_duty: number;
  vat: number;
  levy: number;
  clearing_fee: number;
  port_charges: number;
  local_delivery: number;
  total_usd: number;
  total_ngn: number;
  exchange_rate: number;
}

export interface VehicleRequest {
  id: string;
  request_number: string;
  user_id: string;
  vehicle_id: string;
  status: RequestStatus;
  quoted_price_usd: number | null;
  deposit_amount_usd: number | null;
  total_landed_cost_usd: number | null;
  total_landed_cost_ngn: number | null;
  shipping_method: 'RoRo' | 'Container' | null;
  destination_country: string;
  destination_state: string | null;
  destination_address: string | null;
  estimated_delivery_date: string | null;
  cost_breakdown: CostBreakdown | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  payments?: Payment[];
  inspection?: Inspection;
  shipment?: Shipment;
}

export type PaymentType = 'deposit' | 'full_payment' | 'refund' | 'balance';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type EscrowStatus = 'held' | 'released' | 'refunded';

export interface Payment {
  id: string;
  request_id: string;
  user_id: string;
  amount_usd: number;
  amount_ngn: number | null;
  payment_type: PaymentType;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  transaction_ref: string | null;
  escrow_status: EscrowStatus;
  created_at: string;
  updated_at: string;
}

export type InspectionCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface InspectionFinding {
  category: string;
  item: string;
  condition: string;
  notes: string;
}

export interface Inspection {
  id: string;
  request_id: string;
  inspector_name: string | null;
  inspection_date: string | null;
  vin_report_url: string | null;
  inspection_report_url: string | null;
  overall_condition: InspectionCondition | null;
  findings: InspectionFinding[];
  recommended: boolean;
  customer_approved: boolean | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ShipmentStatus =
  | 'pending'
  | 'booked'
  | 'at_port'
  | 'loaded'
  | 'in_transit'
  | 'arrived'
  | 'customs_hold'
  | 'cleared'
  | 'out_for_delivery'
  | 'delivered';

export interface TrackingUpdate {
  date: string;
  status: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: string;
  request_id: string;
  shipping_method: 'RoRo' | 'Container' | null;
  origin_port: string | null;
  destination_port: string | null;
  vessel_name: string | null;
  container_number: string | null;
  bill_of_lading: string | null;
  status: ShipmentStatus;
  departed_date: string | null;
  eta_port: string | null;
  arrived_port_date: string | null;
  cleared_customs_date: string | null;
  delivered_date: string | null;
  tracking_updates: TrackingUpdate[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  request_id: string | null;
  sender_id: string;
  recipient_id: string | null;
  subject: string | null;
  content: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

export interface PricingConfig {
  sourcing_fee_percent: number;
  sourcing_fee_min_usd: number;
  inspection_fee_usd: number;
  us_handling_fee_usd: number;
  shipping_roro_base_usd: number;
  shipping_container_base_usd: number;
  customs_duty_percent: number;
  vat_percent: number;
  levy_percent: number;
  clearing_fee_usd: number;
  port_charges_usd: number;
  local_delivery_base_usd: number;
  exchange_rate_ngn_usd: number;
  timeline_days_roro: number;
  timeline_days_container: number;
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  vehicleType?: VehicleType;
  state?: string;
}

export interface CalculatorInputs {
  vehiclePrice: number;
  vehicleType: VehicleType;
  shippingMethod: 'RoRo' | 'Container';
  destinationState: string;
  engineSize?: string;
  vehicleYear?: number;
}
