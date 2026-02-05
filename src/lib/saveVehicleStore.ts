interface SavedVehicleInfo {
  id: string;
  vin: string;
  savedAt: string;
}

const STORAGE_KEY = "afrozon_saved_vehicles";

export const savedVehiclesStore = {
  getSavedVehicleIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return new Set();

      const vehicles: SavedVehicleInfo[] = JSON.parse(saved);
      return new Set(vehicles.map((v) => v.id));
    } catch (error) {
      console.error("Error reading saved vehicles:", error);
      return new Set();
    }
  },

  getSavedVehicles(): SavedVehicleInfo[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error reading saved vehicles:", error);
      return [];
    }
  },

  addSavedVehicle(id: string, vin: string): void {
    if (typeof window === 'undefined') return;
    try {
      const vehicles = this.getSavedVehicles();

      if (vehicles.some((v) => v.id === id || v.vin === vin)) {
        return;
      }

      vehicles.push({
        id,
        vin,
        savedAt: new Date().toISOString(),
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  },

  removeSavedVehicle(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const vehicles = this.getSavedVehicles();
      const filtered = vehicles.filter((v) => v.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing saved vehicle:", error);
    }
  },

  isVehicleSaved(id: string): boolean {
    return this.getSavedVehicleIds().has(id);
  },
};
