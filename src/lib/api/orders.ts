import { apiClient } from "./client";

export interface RequestVehicle {
  identifier: string;
  type: string;
  shippingMethod: string;
  destinationCountry?: string;
  destinationState?: string;
  destinationCity?: string;
  destinationAddress?: string;
  deliveryInstructions?: string;
  customerNotes?: string;
}

export interface VehicleSnapshot {
  id: string;
  vin: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;

  priceUsd: number;
  originalPriceUsd: number;
  priceHistory: any[];

  mileage: number;
  engineSize: string | null;
  transmission: string;
  fuelType: string;
  drivetrain: string | null;

  exteriorColor: string | null;
  interiorColor: string | null;
  bodyStyle: string | null;

  dealerName: string | null;
  dealerState: string | null;
  dealerCity: string | null;
  dealerZipCode: string | null;
  dealerCountry: string | null;
  dealerPhone: string | null;
  dealerWebsite: string | null;

  images: string[];
  videos: string[];
  thumbnail: string | null;
  features: string[];
  specifications: any | null;

  source: string;
  apiProvider: string | null;
  apiListingId: string | null;
  apiData: any | null;
  lastApiSync: string | null;
  apiSyncStatus: string;
  apiSyncError: string | null;

  addedBy: string;
  addedByName: string;
  manualNotes: string | null;

  status: string;
  availability: string;

  featured: boolean;
  featuredUntil: string | null;

  isActive: boolean;
  isHidden: boolean;
  hideReason: string | null;

  viewCount: number;
  saveCount: number;
  requestCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface OrderUser {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
}

export interface VehicleOrder {
  id: string;
  requestNumber: string;
  userId: string;

  vehicleId: string | null;
  vehicleSource: string | null;
  externalVehicleId: string | null;
  externalProvider: string | null;

  vehicleSnapshot: VehicleSnapshot;

  status: string;
  previousStatus: any[];

  statusChangedAt: string | null;
  statusChangedBy: string | null;

  quotedPriceUsd: number | null;
  depositAmountUsd: number | null;
  totalLandedCostUsd: number | null;
  totalLandedCostLocal: number | null;

  localCurrency: string | null;
  exchangeRate: number | null;
  exchangeRateDate: string | null;

  costBreakdown: any | null;

  shippingMethod: string;

  originPort: string | null;
  destinationPort: string | null;
  destinationCountry: string | null;
  destinationState: string | null;
  destinationCity: string | null;
  destinationAddress: string | null;

  deliveryInstructions: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;

  quoteExpiresAt: string | null;

  customerNotes: string | null;
  specialRequests: string | null;

  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;

  refundRequested: boolean;
  refundApproved: boolean;
  refundAmount: number | null;

  priority: string;
  tags: string[];

  createdAt: string;
  updatedAt: string;

  user: OrderUser;
  vehicle: any | null;
}

export interface PaginatedOrders {
  orders: VehicleOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Order {
  id: string;
  requestNumber: string;
  userId: string;
  vehicleId: string | null;
  vehicleSource: string | null;
  externalVehicleId: string | null;
  externalProvider: string | null;
  vehicleSnapshot: {
    id: string;
    vin: string;
    slug: string;
    make: string;
    model: string;
    year: number;
    vehicleType: string;
    priceUsd: number;
    mileage: number;
    transmission: string;
    fuelType: string;
    images: string[];
    dealerName: string | null;
    dealerState: string | null;
    dealerCity: string | null;
    apiData?: {
      listing?: {
        retailListing?: {
          primaryImage?: string;
          miles?: number;
        };
        wholesaleListing?: {
          primaryImage?: string;
          miles?: number;
        };
      };
    };
    [key: string]: any;
  };
  paymentBreakdown: PaymentPricing | null;
  status: string;
  quotedPriceUsd: number | null;
  depositAmountUsd: number | null;
  totalLandedCostUsd: number | null;
  totalLandedCostLocal: number | null;
  localCurrency: string | null;
  costBreakdown: {
    vehicle_price: number;
    sourcing_fee: number;
    inspection_fee: number;
    shipping_cost: number;
    [key: string]: any;
  } | null;
  shippingMethod: string;
  destinationCountry: string;
  destinationState: string;
  destinationCity: string;
  destinationAddress: string;
  deliveryInstructions: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  customerNotes: string | null;
  statusChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string;
  };
  vehicle: any | null;
  payments: Payment[];
  inspection: any | null;
  shipment: any | null;
  messages: any[];
  adminNotes: any[];
  activityLogs: any[];
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount_usd: number;
  amountUsd?: number;
  payment_type: string;
  paymentType?: string;
  status: string;
  reference: string | null;
  paymentReference?: string | null;
  created_at: string;
  createdAt?: string;
  [key: string]: any;
}

export interface DefualtPrices {
  id: string;
  createdAt: string;
  updatedAt: string;
  importDutyPercent: number;
  vatPercent: number;
  cissPercent: number;
  sourcingFee: number;
  prePurchaseInspectionUsd: number;
  usHandlingFeeUsd: number;
  shippingCostUsd: number;
  clearingFeeUsd: number;
  portChargesUsd: number;
  localDeliveryUsd: number;
}

export interface PaymentPricing {
  totalUsd: number;
  totalUsedDeposit: number;
  shippingMethod: string;
  breakdown: {
    vehiclePriceUsd: number;
    prePurchaseInspectionUsd: number;
    usHandlingFeeUsd: number;
    sourcingFee: number;
    shippingCostUsd: number;
  };
}

export interface CostBreakdown {
  defaultPricing: DefualtPrices;
  paymentBreakdown: PaymentPricing;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T;
  };
}

export const ordersApi = {
  getAllOrder: async (): Promise<PaginatedOrders> => {
    const response =
      await apiClient.get<ApiSuccessResponse<PaginatedOrders>>(
        `/orders/my-orders`,
      );

    return response.data.data;
  },

  requestVehicle: async (payload: RequestVehicle): Promise<VehicleOrder> => {
    const response = await apiClient.post<ApiSuccessResponse<VehicleOrder>>(
      "/orders",
      payload,
    );

    return response.data.data; // returns the created order
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiSuccessResponse<Order>>(
      `/orders/${id}`,
    );

    return response.data.data;
  },

  getPredefinePrices: async (
    id: string,
    shippingMethod: string,
  ): Promise<CostBreakdown> => {
    const response = await apiClient.get<ApiSuccessResponse<CostBreakdown>>(
      `/orders/order-summary/${id}/?shippingMethod=${shippingMethod}`,
    );

    return response.data.data;
  },
};
