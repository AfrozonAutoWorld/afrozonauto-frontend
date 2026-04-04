import type { SellerListingVehicle } from '@/lib/marketplace/mapSellerVehicle';
import type { SellVehicleStep1Value } from '@/components/seller/sell-vehicle/SellVehicleStep1';
import type { SellVehicleStep2Value } from '@/components/seller/sell-vehicle/SellVehicleStep2';
import type { SellVehicleStep3Value } from '@/components/seller/sell-vehicle/SellVehicleStep3';
import type { SellVehicleStep4Value } from '@/components/seller/sell-vehicle/SellVehicleStep4';

function keysNumberToLabel(n: number | null | undefined): string | null {
  if (n === 1) return '1 key';
  if (n === 2) return '2 keys';
  if (n != null && n >= 3) return '3+ keys';
  return null;
}

/** Map API accidentHistory to form option labels */
function mapAccidentFromApi(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.trim();
  if (t === 'Minor' || t === 'Minor accident') return 'Minor accident';
  if (t === 'Major' || t === 'Major accident') return 'Major accident';
  if (t === 'No accidents' || t.toLowerCase().includes('no accident')) return 'No accidents';
  if (t === 'Unknown') return 'Unknown';
  return t;
}

/** Condition: EXCELLENT -> excellent for Step2 card keys */
function mapConditionFromApi(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.toLowerCase();
}

export type PrefilledSellForm = {
  vehicle: SellVehicleStep1Value;
  condition: SellVehicleStep2Value;
  photosPrice: SellVehicleStep3Value;
  contact: SellVehicleStep4Value;
};

export function prefillSellFormFromListing(raw: SellerListingVehicle): PrefilledSellForm {
  const titleStatus =
    Array.isArray(raw.titleStatus) && raw.titleStatus.length > 0
      ? raw.titleStatus[0]
      : null;

  const known = new Set<string>();
  if (Array.isArray(raw.knownIssues)) {
    for (const issue of raw.knownIssues) {
      const id = String(issue).toLowerCase();
      if (['engine', 'transmission', 'electrical', 'body', 'none'].includes(id)) {
        known.add(id);
      }
    }
  }

  const images = Array.isArray(raw.images) ? raw.images : [];
  const photos: SellVehicleStep3Value['photos'] = Array.from({ length: 9 }, (_, i) => {
    const url = images[i];
    return url ? { existingUrl: url } : null;
  });

  const preferred = raw.preferredContact?.trim();
  const contactMethods = new Set<string>();
  if (preferred === 'Email') contactMethods.add('Email');
  if (preferred === 'SMS' || preferred === 'Phone') contactMethods.add('Text Message');
  if (preferred === 'Phone') contactMethods.add('Text Message');

  return {
    vehicle: {
      year: raw.year != null ? String(raw.year) : '',
      make: raw.make ?? '',
      model: raw.model ?? '',
      trim: raw.trim ?? '',
      bodyStyle: raw.bodyStyle ?? '',
      mileage: raw.mileage != null ? String(raw.mileage) : '',
      drivetrain: raw.drivetrain ?? '',
      transmission: raw.transmission ?? '',
      fuelType: raw.fuelType ?? '',
      exteriorColor: raw.exteriorColor ?? '',
      keysCount: keysNumberToLabel(raw.keys ?? undefined),
    },
    condition: {
      condition: mapConditionFromApi(raw.condition ?? undefined),
      titleStatus,
      accidentHistory: mapAccidentFromApi(raw.accidentHistory ?? undefined),
      knownIssues: known,
      modifications: raw.modifications ?? '',
    },
    photosPrice: {
      photos,
      askingPrice: raw.priceUsd != null ? String(Math.round(raw.priceUsd)) : '',
      additionalNotes: raw.manualNotes ?? '',
      hasAskingPrice: raw.showAskingPrice !== false,
    },
    contact: {
      firstName: raw.contactFirstName ?? '',
      lastName: raw.contactLastName ?? '',
      email: raw.contactEmail ?? '',
      phone: raw.contactPhone ?? '',
      cityState: raw.city ?? '',
      zipCode: raw.zipCode ?? '',
      bestTime: raw.bestTimeToReach ?? '',
      contactMethods,
    },
  };
}
