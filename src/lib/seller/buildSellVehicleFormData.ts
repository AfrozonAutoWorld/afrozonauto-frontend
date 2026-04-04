import type { PhotoSlotValue } from '@/components/seller/sell-vehicle/SellVehicleStep3';

type VehicleDetails = {
  year: string;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  mileage: string;
  drivetrain?: string;
  transmission?: string;
  fuelType?: string;
  exteriorColor?: string;
  keysCount?: string | null;
};

type ConditionDetails = {
  condition: string | null;
  titleStatus: string | null;
  accidentHistory: string | null;
  knownIssues: Set<string>;
  modifications?: string;
};

type PhotosPrice = {
  photos: PhotoSlotValue[];
  askingPrice: string;
  additionalNotes: string;
  hasAskingPrice?: boolean;
};

type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityState: string;
  bestTime: string;
  zipCode: string;
  contactMethods: Set<string>;
};

/**
 * Shared FormData for create (POST /submit) and update (PATCH /:id).
 */
export function buildSellVehicleFormData(
  vehicleDetails: VehicleDetails,
  conditionDetails: ConditionDetails,
  photosPrice: PhotosPrice,
  contactDetails: ContactDetails,
): FormData {
  const formData = new FormData();

  formData.append('vehicleType', 'OTHER');

  formData.append('year', vehicleDetails.year);
  formData.append('make', vehicleDetails.make);
  formData.append('model', vehicleDetails.model);
  if (vehicleDetails.trim) formData.append('trim', vehicleDetails.trim);
  if (vehicleDetails.bodyStyle) formData.append('bodyStyle', vehicleDetails.bodyStyle);
  formData.append('mileage', vehicleDetails.mileage);
  if (vehicleDetails.drivetrain) formData.append('drivetrain', vehicleDetails.drivetrain);
  if (vehicleDetails.transmission) formData.append('transmission', vehicleDetails.transmission);
  if (vehicleDetails.fuelType) formData.append('fuelType', vehicleDetails.fuelType);
  if (vehicleDetails.exteriorColor) formData.append('exteriorColor', vehicleDetails.exteriorColor);
  if (vehicleDetails.keysCount) {
    const parsedKeys =
      vehicleDetails.keysCount === '1 key'
        ? 1
        : vehicleDetails.keysCount === '2 keys'
          ? 2
          : vehicleDetails.keysCount === '3+ keys'
            ? 3
            : undefined;
    if (parsedKeys != null) {
      formData.append('keys', String(parsedKeys));
    }
  }

  if (conditionDetails.condition) {
    formData.append('condition', conditionDetails.condition.toUpperCase());
  }
  if (conditionDetails.titleStatus) {
    formData.append('titleStatus[0]', conditionDetails.titleStatus);
  }
  if (conditionDetails.accidentHistory) {
    const mappedAccident =
      conditionDetails.accidentHistory === 'Minor accident'
        ? 'Minor'
        : conditionDetails.accidentHistory === 'Major accident'
          ? 'Major'
          : conditionDetails.accidentHistory;
    formData.append('accidentHistory', mappedAccident);
  }
  Array.from(conditionDetails.knownIssues).forEach((issue, index) => {
    formData.append(`knownIssues[${index}]`, issue);
  });
  if (conditionDetails.modifications) {
    formData.append('modifications', conditionDetails.modifications);
  }

  photosPrice.photos.forEach((slot) => {
    if (slot instanceof File) {
      formData.append('files', slot);
    }
  });

  const slots = photosPrice.photos.map((p) => {
    if (!p) return '';
    if (p instanceof File) return '';
    return p.existingUrl;
  });
  formData.append('existingImageUrls', JSON.stringify(slots));

  if (photosPrice.hasAskingPrice !== false) {
    if (!photosPrice.askingPrice) {
      throw new Error('Please enter your asking price.');
    }
    formData.append('askingPrice', photosPrice.askingPrice);
  } else {
    formData.append('askingPrice', '0');
  }
  formData.append('showAskingPrice', 'true');
  formData.append('allowOffers', 'true');
  if (photosPrice.additionalNotes) {
    formData.append('additionalNotes', photosPrice.additionalNotes);
  }

  formData.append('contactFirstName', contactDetails.firstName);
  formData.append('contactLastName', contactDetails.lastName);
  formData.append('contactEmail', contactDetails.email);
  formData.append('contactPhone', contactDetails.phone);
  formData.append('city', contactDetails.cityState);
  formData.append('zipCode', contactDetails.zipCode);

  let preferred: string | null = null;
  if (contactDetails.contactMethods.has('Email')) {
    preferred = 'Email';
  } else if (contactDetails.contactMethods.has('Text Message')) {
    preferred = 'SMS';
  } else if (contactDetails.contactMethods.has('WhatsApp')) {
    preferred = 'SMS';
  }
  if (preferred) {
    formData.append('preferredContact', preferred);
  }
  if (contactDetails.bestTime) {
    formData.append('bestTimeToReach', contactDetails.bestTime);
  }

  return formData;
}
