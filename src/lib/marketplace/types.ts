export type VehicleStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'ARCHIVED';

export type RequestStatus =
  | 'NEW_REQUEST'
  | 'DEPOSIT_PENDING'
  | 'DEPOSIT_PAID'
  | 'ADMIN_VERIFYING'
  | 'VERIFIED_AVAILABLE'
  | 'FINAL_PAYMENT_PENDING'
  | 'FINAL_PAID'
  | 'COMPLETED'
  | 'CANCELED';

export type PaymentType = 'DEPOSIT' | 'FINAL';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface MarketplaceVehicle {
  id: string;
  seller_id: string;
  status: VehicleStatus;
  title: string;
  make: string;
  model: string;
  year: number;
  price_usd: number;
  vehicle_type: string;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  drivetrain: string;
  mileage: number;
  vin: string;
  description: string;
  features: string[];
  location_city: string;
  location_state: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  images?: VehicleImage[];
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface VehicleRequest {
  id: string;
  buyer_id: string;
  vehicle_id: string;
  status: RequestStatus;
  deposit_amount: number;
  final_amount: number;
  cancel_reason: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  vehicle?: MarketplaceVehicle;
}

export interface MarketplacePayment {
  id: string;
  request_id: string;
  payer_id: string;
  payment_type: PaymentType;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface VehicleFormData {
  title: string;
  make: string;
  model: string;
  year: number;
  price_usd: number;
  vehicle_type: string;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  drivetrain: string;
  mileage: number;
  vin: string;
  description: string;
  features: string[];
  location_city: string;
  location_state: string;
  image_urls: string[];
}
