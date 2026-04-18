/**
 * Broad make list for marketplace / filters. Auto.dev’s `/models` reference does not include every
 * global OEM; we union this with API keys so users can still pick e.g. BYD, Lucid, etc.
 *
 * **Models for these makes:** add lineups in `vehicleModelsCatalog.ts` (`MODELS_BY_MAKE_EXTENDED`);
 * the main `carModels` map covers many common brands separately. When Auto.dev returns models for
 * a make, those take precedence in the UI.
 */
const MAKES_BY_LETTER: Record<string, readonly string[]> = {
  A: ['Acura', 'Alfa Romeo', 'Aston Martin', 'Audi'],
  B: ['Bentley', 'BMW', 'Bugatti', 'Buick', 'BYD'],
  C: ['Cadillac', 'Chevrolet', 'Chrysler', 'Citroën'],
  D: ['Dacia', 'Daewoo', 'Daihatsu', 'Dodge'],
  E: ['Ferrari'],
  F: ['Fiat', 'Ford', 'Fisker'],
  G: ['Geely', 'Genesis', 'GMC', 'Great Wall'],
  H: ['Haval', 'Honda', 'Hyundai'],
  I: ['Infiniti', 'Isuzu'],
  J: ['Jaguar', 'Jeep'],
  K: ['Kia', 'Koenigsegg'],
  L: [
    'Lamborghini',
    'Lancia',
    'Land Rover',
    'Lexus',
    'Lincoln',
    'Lotus',
    'Lucid',
  ],
  M: [
    'Maserati',
    'Maybach',
    'Mazda',
    'McLaren',
    'Mercedes-Benz',
    'Mini',
    'Mitsubishi',
  ],
  N: ['Nissan', 'Nio'],
  O: ['Oldsmobile', 'Opel'],
  P: ['Pagani', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche'],
  Q: ['Qoros'],
  R: ['Ram', 'Renault', 'Rivian', 'Rolls-Royce'],
  S: ['Saab', 'Saturn', 'Scion', 'Seat', 'Skoda', 'Smart', 'Subaru', 'Suzuki'],
  T: ['Tesla', 'Toyota'],
  U: ['UAZ'],
  V: ['Vauxhall', 'Volkswagen', 'Volvo'],
  W: ['Wuling'],
  X: ['XPeng'],
  Y: ['Yugo'],
  Z: ['Zotye'],
};

/** Deduplicated, sorted list for merging into make pickers. */
export const VEHICLE_MAKES_EXTENDED: readonly string[] = Array.from(
  new Set(Object.values(MAKES_BY_LETTER).flat())
).sort((a, b) => a.localeCompare(b));
