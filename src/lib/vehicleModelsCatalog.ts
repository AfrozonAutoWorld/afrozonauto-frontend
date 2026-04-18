/**
 * Model lineups for makes that appear in `vehicleMakesCatalog` / merged make lists but are missing
 * from `carModels`, or when GET /vehicles/reference/models is empty or unavailable for that OEM.
 *
 * Keys should match display names from `VEHICLE_MAKES_EXTENDED` where possible. Lookup is
 * case- and punctuation-insensitive. Add or edit rows as you expand the make list.
 */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const MODELS_BY_MAKE_EXTENDED: Readonly<Record<string, readonly string[]>> = {
  BYD: ['Atto 3', 'Dolphin', 'Seal', 'Han', 'Tang', 'Song Plus', 'Yuan Plus', 'Sealion 7'],
  Lucid: ['Air', 'Gravity'],
  Rivian: ['R1T', 'R1S'],
  Polestar: ['1', '2', '3', '4'],
  Nio: ['ET5', 'ET7', 'EL6', 'EL7', 'ES6', 'ES8', 'EC6', 'EP9'],
  XPeng: ['G6', 'G7', 'G9', 'P5', 'P7'],
  Genesis: ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', '4C'],
  'Aston Martin': ['DB11', 'DB12', 'DBX', 'Vantage', 'DBS', 'Valhalla'],
  Bentley: ['Bentayga', 'Continental GT', 'Flying Spur', 'Mulsanne'],
  Cadillac: ['CT4', 'CT5', 'CT6', 'Escalade', 'Lyriq', 'XT4', 'XT5', 'XT6'],
  Chrysler: ['300', 'Pacifica', 'Voyager'],
  'Great Wall': ['Cannon', 'Haval H6', 'Poer', 'Tank 300'],
  Haval: ['H2', 'H6', 'H9', 'Jolion'],
  Infiniti: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  McLaren: ['720S', '750S', 'Artura', 'GT'],
  Mini: ['Clubman', 'Convertible', 'Countryman', 'Cooper', 'Cooper S', 'Electric'],
  Ram: ['1500', '2500', '3500', 'ProMaster'],
  Seat: ['Arona', 'Ateca', 'Ibiza', 'Leon'],
  Skoda: ['Enyaq', 'Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Superb'],
  Cupra: ['Born', 'Formentor', 'Leon', 'Tavascan'],
};

/** Sorted model names for an extended-only make, or empty if none configured. */
export function getExtendedModelNamesForMake(make: string): string[] {
  const n = norm(make.trim());
  if (!n) return [];
  for (const [k, models] of Object.entries(MODELS_BY_MAKE_EXTENDED)) {
    if (norm(k) === n) {
      return [...models].sort((a, b) => a.localeCompare(b));
    }
  }
  return [];
}
