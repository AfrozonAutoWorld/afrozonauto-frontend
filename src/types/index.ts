export enum UserRole {
  BUYER = "BUYER",
  ADMIN = "ADMIN",
  SELLER = "SELLER",
  AGENT = "AGENT",
}
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  firstName?: string;
  lastName?: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  isSuspended: boolean;
  googleId: string;
  appleId: string;
  isDeleted: boolean;
  suspensionReason: string | null;
  suspensionUntil: string | null;
  walletBalance: number;
  currency: string;
  language: string;
  timezone: string;
  notificationPreferences: NotificationPreferences | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  online: boolean;

  // Optional fields that might be added later
  address: string | null;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  profile: {
    id: string;
    userId: string;
    avatar: string | null;
    dateOfBirth: string | null;
    identificationNumber: string | null;
    identificationType: string | null;
    identificationDocument: string | null;
    businessName: string | null;
    taxId: string | null;
    isVerified: boolean;
    verifiedAt: string | null;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Session {
  token: string;
}
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string;
  state: string | null;
  address: string | null;
  role: UserRole;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export type VehicleType =
  | "CAR"
  | "SUV"
  | "TRUCK"
  | "VAN"
  | "SEDAN"
  | "COUPE"
  | "HATCHBACK"
  | "WAGON"
  | "CONVERTIBLE"
  | "MOTORCYCLE";

type TransmissionType = "Automatic" | "Manual";
type FuelType = "Hybrid" | "Regular Unleaded" | "Diesel" | "Electric";
type DrivetrainType = "FWD" | "RWD" | "AWD" | "4WD";
type VehicleStatus = "AVAILABLE" | "SOLD" | "PENDING" | "RESERVED";
type ApiSyncStatus = "PENDING" | "SYNCED" | "FAILED";
type VehicleSource = "API" | "MANUAL";
interface VehicleDetails {
  confidence?: number;
  cylinders?: number;
  doors?: number;
  drivetrain: DrivetrainType;
  engine: string;
  exteriorColor?: string;
  fuel: FuelType;
  interiorColor?: string;
  make: string;
  model: string;
  seats?: number;
  squishVin: string;
  transmission: TransmissionType;
  trim?: string;
  vin: string;
  year: number;
  baseInvoice?: number;
  baseMsrp?: number;
  bodyStyle?: string;
  series?: string;
  style?: string;
  type?: string;
}

interface RetailListing {
  carfaxUrl: string;
  city: string;
  cpo: boolean;
  dealer: string;
  miles: number;
  photoCount: number;
  price: number;
  primaryImage: string;
  state: string;
  used: boolean;
  vdp: string;
  zip: string;
}

interface WholesaleListing {
  miles?: number;
  price?: number;
  primaryImage?: string;
  [key: string]: any;
}
interface ApiListing {
  "@id": string;
  vin: string;
  createdAt: string;
  location: [number, number];
  online: boolean;
  vehicle: VehicleDetails;
  wholesaleListing: WholesaleListing | null;
  retailListing: RetailListing | null;
  history: unknown | null;
}

export interface VehicleLocation {
  longitude: number;
  latitude: number;
}

interface RetailListing {
  carfaxUrl: string;
  city: string;
  cpo: boolean;
  dealer: string;
  miles: number;
  photoCount: number;
  price: number;
  primaryImage: string;
  state: string;
  used: boolean;
  vdp: string;
  zip: string;
}

interface ApiData {
  listing: ApiListing;
  raw: ApiListing;
  isTemporary: boolean;
  cached: boolean;
}

export interface Vehicle {
  vin: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
  vehicleType: VehicleType;
  exteriorColor?: string;
  interiorColor?: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  engineSize: string;
  drivetrain: DrivetrainType;
  dealerName: string;
  dealerState: string;
  dealerCity: string;
  dealerZipCode: string;
  images: string[];
  features: string[];
  source: VehicleSource;
  apiProvider: string;
  apiListingId: string;
  status: VehicleStatus;
  isActive: boolean;
  isHidden: boolean;
  apiData: ApiData;
  apiSyncStatus: ApiSyncStatus;
  id: string;
  mileage?: number;
  horsepower?: number;
  torque?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  // Basic filters
  make?: string;
  model?: string;
  year?: number;
  yearMin?: number;
  yearMax?: number;

  // Price and mileage
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;

  // Vehicle characteristics
  vehicleType?: VehicleType;
  transmission?: TransmissionType;
  fuelType?: string;
  drivetrain?: string;

  // Status and location
  status?: VehicleStatus;
  state?: string;
  city?: string;
  zipCode?: string;

  // Special filters
  featured?: boolean;
  isActive?: boolean;
  source?: VehicleSource;

  // Search
  search?: string;

  // Pagination
  page?: number;
  limit?: number;

  // API options
  includeApi?: boolean;

  // Sorting
  sortBy?: "price" | "year" | "mileage" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface VehicleMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  fromApi: number;
}

export interface VehiclesApiResponse {
  success: boolean;
  message: string;
  data: {
    data: Vehicle[];
    meta: VehicleMeta;
  };
  timestamp: string;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  meta: VehicleMeta;
}

export interface SingleVehicleApiResponse {
  success: boolean;
  message: string;
  data: Vehicle;
  timestamp: string;
}

export interface VehicleMakesResponse {
  success: boolean;
  data: string[];
}

export interface VehicleModelsResponse {
  success: boolean;
  data: string[];
}

export interface SavedVehicle {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
  vehicle?: Vehicle;
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
  shipping_method: "RoRo" | "Container" | null;
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

export type PaymentType = "deposit" | "full_payment" | "refund" | "balance";
export type PaymentMethod = "card" | "bank_transfer" | "wallet";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type EscrowStatus = "held" | "released" | "refunded";

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

export type InspectionCondition = "excellent" | "good" | "fair" | "poor";

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
  | "pending"
  | "booked"
  | "at_port"
  | "loaded"
  | "in_transit"
  | "arrived"
  | "customs_hold"
  | "cleared"
  | "out_for_delivery"
  | "delivered";

export interface TrackingUpdate {
  date: string;
  status: string;
  location: string;
  description: string;
}

export interface Shipment {
  id: string;
  request_id: string;
  shipping_method: "RoRo" | "Container" | null;
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
  exchange_rate_ngn_usd: number;
  timeline_days_roro: number; // Remove the ?
  timeline_days_container: number;
}

export interface CostBreakdown {
  vehicle_price: number;
  sourcing_fee: number;
  inspection_fee: number;
  us_handling_fee: number;
  shipping_cost: number;
  total_usd: number;
  total_ngn: number;
  exchange_rate: number;
}

export type RequestStatus =
  | "pending_quote"
  | "quote_sent"
  | "deposit_pending"
  | "deposit_paid"
  | "inspection_pending"
  | "inspection_complete"
  | "awaiting_approval"
  | "approved"
  | "purchase_in_progress"
  | "purchased"
  | "export_pending"
  | "shipped"
  | "in_transit"
  | "arrived_port"
  | "customs_clearance"
  | "cleared"
  | "delivery_scheduled"
  | "delivered"
  | "cancelled"
  | "refunded";

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
  shippingMethod: "RoRo" | "Container";
  destinationState: string;
  engineSize?: string;
  vehicleYear?: number;
}
