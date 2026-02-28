import type { LucideIcon } from 'lucide-react';
import {
  Clock,
  CheckCircle,
  Package,
  Ship,
  CreditCard,
  FileText,
  AlertCircle,
  Truck,
  MapPin,
} from 'lucide-react';

export function getOrderPrimaryImage(order: Record<string, unknown>): string {
  const fallback =
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800';
  const snapshot = order.vehicleSnapshot as Record<string, unknown> | undefined;
  const vehicle = order.vehicle as Record<string, unknown> | undefined;

  const apiData = snapshot?.apiData as Record<string, unknown> | undefined;
  const listing = apiData?.listing as Record<string, unknown> | undefined;
  const retail = listing?.retailListing as Record<string, unknown> | undefined;
  const wholesale = listing?.wholesaleListing as Record<string, unknown> | undefined;
  const img = (retail?.primaryImage || wholesale?.primaryImage) as string | undefined;
  if (img) return img;

  const images = snapshot?.images as string[] | undefined;
  if (images?.length) return images[0];

  const vehicleImages = vehicle?.images as string[] | undefined;
  if (vehicleImages?.length) return vehicleImages[0];

  return fallback;
}

export function getOrderVehicleName(order: Record<string, unknown>): string {
  const snapshot = order.vehicleSnapshot as Record<string, unknown> | undefined;
  const vehicle = order.vehicle as Record<string, unknown> | undefined;

  if (snapshot?.year && snapshot?.make && snapshot?.model) {
    return `${snapshot.year} ${snapshot.make} ${snapshot.model}`;
  }
  if (vehicle?.year && vehicle?.make && vehicle?.model) {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  }
  return (order.requestNumber as string) || `Order #${order.id}`;
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: LucideIcon }
> = {
  pending_quote: { label: 'Pending Quote', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PENDING_QUOTE: { label: 'Pending Quote', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  quote_sent: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: FileText },
  QUOTE_SENT: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: FileText },
  deposit_pending: { label: 'Deposit Pending', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  DEPOSIT_PENDING: { label: 'Deposit Pending', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  deposit_paid: { label: 'Deposit Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  DEPOSIT_PAID: { label: 'Deposit Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  balance_paid: { label: 'Balance Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  BALANCE_PAID: { label: 'Balance Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inspection_pending: { label: 'Inspection Pending', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  INSPECTION_PENDING: { label: 'Inspection Pending', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  inspection_complete: { label: 'Inspection Complete', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  INSPECTION_COMPLETE: { label: 'Inspection Complete', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  awaiting_approval: { label: 'Awaiting Approval', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  purchase_in_progress: { label: 'Purchasing', color: 'bg-blue-100 text-blue-700', icon: Package },
  PURCHASE_IN_PROGRESS: { label: 'Purchasing', color: 'bg-blue-100 text-blue-700', icon: Package },
  purchased: { label: 'Purchased', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PURCHASED: { label: 'Purchased', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  export_pending: { label: 'Export Pending', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  EXPORT_PENDING: { label: 'Export Pending', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Ship },
  SHIPPED: { label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Ship },
  in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Ship },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-blue-100 text-blue-700', icon: Ship },
  arrived_port: { label: 'Arrived at Port', color: 'bg-green-100 text-green-700', icon: MapPin },
  ARRIVED_PORT: { label: 'Arrived at Port', color: 'bg-green-100 text-green-700', icon: MapPin },
  customs_clearance: { label: 'Customs Clearance', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  CUSTOMS_CLEARANCE: { label: 'Customs Clearance', color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  cleared: { label: 'Cleared', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLEARED: { label: 'Cleared', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  delivery_scheduled: { label: 'Delivery Scheduled', color: 'bg-blue-100 text-blue-700', icon: Truck },
  DELIVERY_SCHEDULED: { label: 'Delivery Scheduled', color: 'bg-blue-100 text-blue-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: CreditCard },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: CreditCard },
};
