import type { VehicleType } from '../types';

const vehicleImages: Record<string, string[]> = {
  'Toyota Camry': [
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'Honda Accord': [
    'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'Toyota RAV4': [
    'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'Ford F-150': [
    'https://images.pexels.com/photos/2920064/pexels-photo-2920064.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'Honda CR-V': [
    'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'BMW 3 Series': [
    'https://images.pexels.com/photos/892522/pexels-photo-892522.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'Mercedes-Benz E-Class': [
    'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'Lexus RX': [
    'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  'default': [
    'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

function getVehicleImages(make: string, model: string): string[] {
  const key = `${make} ${model}`;
  return vehicleImages[key] || vehicleImages['default'];
}

function generateVIN(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return vin;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const vehicleData: Array<{
  make: string;
  model: string;
  type: VehicleType;
  basePrice: number;
  features: string[];
}> = [
  {
    make: 'Toyota',
    model: 'Camry',
    type: 'SEDAN',
    basePrice: 18000,
    features: ['Backup Camera', 'Bluetooth', 'Lane Departure Warning', 'Adaptive Cruise Control'],
  },
  {
    make: 'Toyota',
    model: 'RAV4',
    type: 'SUV',
    basePrice: 24000,
    features: ['All-Wheel Drive', 'Apple CarPlay', 'Safety Sense', 'Sunroof'],
  },
  {
    make: 'Toyota',
    model: 'Corolla',
    type: 'SEDAN',
    basePrice: 15000,
    features: ['Fuel Efficient', 'Backup Camera', 'Bluetooth', 'USB Ports'],
  },
  {
    make: 'Toyota',
    model: 'Highlander',
    type: 'SUV',
    basePrice: 32000,
    features: ['Third Row Seating', 'Premium Audio', 'Navigation', 'Heated Seats'],
  },
  {
    make: 'Honda',
    model: 'Accord',
    type: 'SEDAN',
    basePrice: 20000,
    features: ['Honda Sensing', 'Wireless Charging', 'LED Headlights', 'Remote Start'],
  },
  {
    make: 'Honda',
    model: 'CR-V',
    type: 'SUV',
    basePrice: 26000,
    features: ['Turbocharged Engine', 'Hands-Free Liftgate', 'Heated Seats', 'Apple CarPlay'],
  },
  {
    make: 'Honda',
    model: 'Civic',
    type: 'SEDAN',
    basePrice: 16000,
    features: ['Sport Mode', 'Backup Camera', 'Bluetooth', 'Collision Warning'],
  },
  {
    make: 'Honda',
    model: 'Pilot',
    type: 'SUV',
    basePrice: 34000,
    features: ['8 Passenger', 'DVD Entertainment', 'Navigation', 'Leather Seats'],
  },
  {
    make: 'Ford',
    model: 'F-150',
    type: 'TRUCK',
    basePrice: 35000,
    features: ['EcoBoost Engine', 'Pro Trailer Backup', 'SYNC 4', 'Bed Liner'],
  },
  {
    make: 'Ford',
    model: 'Explorer',
    type: 'SUV',
    basePrice: 38000,
    features: ['Third Row', 'Co-Pilot360', 'Panoramic Roof', 'B&O Sound System'],
  },
  {
    make: 'Ford',
    model: 'Escape',
    type: 'SUV',
    basePrice: 25000,
    features: ['Hybrid Option', 'SYNC 3', 'Heated Seats', 'Lane Keeping'],
  },
  {
    make: 'Chevrolet',
    model: 'Silverado 1500',
    type: 'TRUCK',
    basePrice: 36000,
    features: ['Durabed', 'Trailering Package', 'MyLink Infotainment', 'Rear Camera'],
  },
  {
    make: 'Chevrolet',
    model: 'Equinox',
    type: 'SUV',
    basePrice: 24000,
    features: ['Turbocharged', 'Teen Driver Mode', 'Apple CarPlay', 'Safety Alert Seat'],
  },
  {
    make: 'BMW',
    model: '3 Series',
    type: 'SEDAN',
    basePrice: 32000,
    features: ['M Sport Package', 'iDrive 7.0', 'Live Cockpit', 'Harman Kardon Audio'],
  },
  {
    make: 'BMW',
    model: 'X5',
    type: 'SUV',
    basePrice: 48000,
    features: ['xDrive', 'Panoramic Sky Lounge', 'Gesture Control', 'Adaptive M Suspension'],
  },
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    type: 'SEDAN',
    basePrice: 45000,
    features: ['AMG Line', 'MBUX', 'Burmester Audio', 'Air Body Control'],
  },
  {
    make: 'Mercedes-Benz',
    model: 'GLE',
    type: 'SUV',
    basePrice: 55000,
    features: ['4MATIC', 'E-Active Body Control', 'MBUX Augmented Reality', 'Premium Package'],
  },
  {
    make: 'Lexus',
    model: 'RX 350',
    type: 'SUV',
    basePrice: 42000,
    features: ['Lexus Safety System+', 'Mark Levinson Audio', 'Heads-Up Display', 'Adaptive Suspension'],
  },
  {
    make: 'Lexus',
    model: 'ES 350',
    type: 'SEDAN',
    basePrice: 38000,
    features: ['F Sport Package', 'Navigation', 'Premium Audio', 'Memory Seats'],
  },
  {
    make: 'Nissan',
    model: 'Altima',
    type: 'SEDAN',
    basePrice: 17000,
    features: ['ProPILOT Assist', 'Safety Shield 360', 'Bose Audio', 'Dual Zone Climate'],
  },
  {
    make: 'Nissan',
    model: 'Pathfinder',
    type: 'SUV',
    basePrice: 32000,
    features: ['7 Passenger', 'Intelligent 4WD', 'Motion Activated Liftgate', 'Zero Gravity Seats'],
  },
  {
    make: 'Hyundai',
    model: 'Sonata',
    type: 'SEDAN',
    basePrice: 19000,
    features: ['SmartSense', 'Wireless Android Auto', 'Digital Key', 'Highway Driving Assist'],
  },
  {
    make: 'Hyundai',
    model: 'Tucson',
    type: 'SUV',
    basePrice: 25000,
    features: ['HTRAC AWD', '10.25" Display', 'Smart Park', 'Remote Smart Parking'],
  },
  {
    make: 'Kia',
    model: 'Sorento',
    type: 'SUV',
    basePrice: 28000,
    features: ['X-Line Package', 'Dual Sunroof', 'Harman Kardon', 'Remote Start'],
  },
  {
    make: 'Jeep',
    model: 'Grand Cherokee',
    type: 'SUV',
    basePrice: 42000,
    features: ['Quadra-Lift', 'McIntosh Audio', 'Night Vision', 'Head-Up Display'],
  },
  {
    make: 'Jeep',
    model: 'Wrangler',
    type: 'SUV',
    basePrice: 35000,
    features: ['4x4', 'Removable Top', 'Trail Rated', 'Rock-Trac 4WD'],
  },
  {
    make: 'Mazda',
    model: 'CX-5',
    type: 'SUV',
    basePrice: 26000,
    features: ['Skyactiv-G', 'i-Activsense', 'Bose Audio', 'Premium Leather'],
  },
  {
    make: 'Subaru',
    model: 'Outback',
    type: 'WAGON',
    basePrice: 28000,
    features: ['Symmetrical AWD', 'EyeSight', 'X-Mode', 'StarLink'],
  },
  {
    make: 'Volkswagen',
    model: 'Tiguan',
    type: 'SUV',
    basePrice: 27000,
    features: ['4MOTION', 'Digital Cockpit', 'IQ.DRIVE', 'Panoramic Sunroof'],
  },
  {
    make: 'Audi',
    model: 'Q5',
    type: 'SUV',
    basePrice: 44000,
    features: ['Quattro', 'Virtual Cockpit', 'Bang & Olufsen', 'S Line Package'],
  },
];

const usStates = ['TX', 'CA', 'FL', 'NY', 'GA', 'IL', 'PA', 'OH', 'NC', 'AZ'];
const usCities: Record<string, string[]> = {
  'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
  'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
  'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  'NY': ['New York', 'Buffalo', 'Rochester', 'Albany'],
  'GA': ['Atlanta', 'Savannah', 'Augusta', 'Columbus'],
  'IL': ['Chicago', 'Springfield', 'Peoria', 'Rockford'],
  'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie'],
  'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
  'NC': ['Charlotte', 'Raleigh', 'Durham', 'Greensboro'],
  'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'],
};

const dealers = [
  'AutoNation',
  'Sewell Automotive',
  'Hendrick Motors',
  'Penske Auto Group',
  'Sonic Automotive',
  'Group 1 Auto',
  'Lithia Motors',
  'Asbury Auto Group',
  'CarMax',
  'Carvana',
];

const transmissions: ('Automatic' | 'Manual')[] = ['Automatic', 'Manual'];
const fuelTypes = ['Gasoline', 'Hybrid', 'Diesel'];
const colors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Brown', 'Green'];
const engineSizes = ['1.5L', '2.0L', '2.4L', '2.5L', '3.0L', '3.5L', '5.0L'];

export function generateMockVehicles(count: number = 50): any[] {
  const vehicles: any[] = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const vehicleInfo = vehicleData[i % vehicleData.length];
    const year = currentYear - Math.floor(Math.random() * 8);
    const mileage = Math.floor(Math.random() * 80000) + 10000;
    const priceVariation = (Math.random() - 0.5) * 0.3;
    const price = Math.round(vehicleInfo.basePrice * (1 + priceVariation) * (1 - (currentYear - year) * 0.05));
    const state = usStates[Math.floor(Math.random() * usStates.length)];
    const cities = usCities[state];
    const city = cities[Math.floor(Math.random() * cities.length)];

    vehicles.push({
      id: generateUUID(),
      vin: generateVIN(),
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      year,
      price_usd: Math.max(price, 8000),
      mileage,
      vehicle_type: vehicleInfo.type,
      engine_size: engineSizes[Math.floor(Math.random() * engineSizes.length)],
      transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
      fuel_type: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      exterior_color: colors[Math.floor(Math.random() * colors.length)],
      interior_color: colors[Math.floor(Math.random() * colors.length)],
      dealer_name: dealers[Math.floor(Math.random() * dealers.length)],
      dealer_state: state,
      dealer_city: city,
      images: getVehicleImages(vehicleInfo.make, vehicleInfo.model),
      features: vehicleInfo.features,
      source: 'API',
      status: 'AVAILABLE',
      api_listing_id: `API-${generateUUID().substring(0, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return vehicles;
}

export const mockVehicles = generateMockVehicles(50);
