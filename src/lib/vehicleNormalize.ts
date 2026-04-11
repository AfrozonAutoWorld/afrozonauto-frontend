import type { Vehicle } from "@/types";

type Raw = Record<string, unknown>;
type VehicleApiData = Vehicle["apiData"];
type ListingShape = VehicleApiData["listing"];

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  const s = String(v).trim();
  return s || fallback;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asObj(v: unknown): Raw | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : null;
}

function emptyApiData(): VehicleApiData {
  return {
    listing: {} as unknown as ListingShape,
    raw: {} as unknown as ListingShape,
    isTemporary: false,
    cached: false,
  };
}

/**
 * Coalesces manual Mongo vehicle docs and Auto.dev partial rows (+ nested apiData)
 * into one shape the UI can rely on (images, dealer fields, safe apiData).
 */
export function normalizeVehicleForUi(raw: unknown): Vehicle {
  if (!raw || typeof raw !== "object") {
    return minimalVehicle("unknown");
  }

  const r = raw as Raw;
  const api = asObj(r.apiData);
  const listing = api ? asObj(api.listing) : null;
  const vehicleNode = listing ? asObj(listing.vehicle) : null;
  const retail = listing ? asObj(listing.retailListing) : null;

  const vin = str(r.vin || vehicleNode?.vin) || "—";
  const make = str(r.make || vehicleNode?.make) || "Unknown";
  const model = str(r.model || vehicleNode?.model) || "";

  let images: string[] = [];
  if (Array.isArray(r.images)) {
    images = r.images.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  if (images.length === 0 && retail?.primaryImage && typeof retail.primaryImage === "string") {
    images = [retail.primaryImage];
  }

  const thumbnail =
    typeof r.thumbnail === "string" && r.thumbnail.length > 0
      ? r.thumbnail
      : images[0] ?? "";

  let apiData: VehicleApiData;
  if (api) {
    apiData = {
      listing: (listing ?? {}) as unknown as ListingShape,
      raw: (asObj(api.raw) ?? listing ?? {}) as unknown as ListingShape,
      isTemporary: Boolean(api.isTemporary),
      cached: Boolean(api.cached),
    };
  } else {
    apiData = emptyApiData();
  }

  const vehicle: Vehicle = {
    id: str(r.id) || "unknown",
    vin,
    slug: str(r.slug) || `vehicle-${str(r.id)}`,
    make,
    model,
    year: num(r.year ?? vehicleNode?.year, new Date().getFullYear()),
    priceUsd: num(r.priceUsd ?? retail?.price, 0),
    vehicleType: (str(r.vehicleType || vehicleNode?.type) || "SUV") as Vehicle["vehicleType"],
    bodyStyle: str(r.bodyStyle) || undefined,
    exteriorColor: str(r.exteriorColor ?? vehicleNode?.exteriorColor) || undefined,
    interiorColor: str(r.interiorColor ?? vehicleNode?.interiorColor) || undefined,
    transmission: (str(r.transmission ?? vehicleNode?.transmission) || "Automatic") as Vehicle["transmission"],
    fuelType: (str(r.fuelType ?? vehicleNode?.fuel) || "Regular Unleaded") as Vehicle["fuelType"],
    engineSize: str(r.engineSize ?? vehicleNode?.engine),
    drivetrain: (str(r.drivetrain ?? vehicleNode?.drivetrain) || "FWD") as Vehicle["drivetrain"],
    dealerName: str(r.dealerName ?? retail?.dealer),
    dealerState: str(r.dealerState ?? retail?.state),
    dealerCity: str(r.dealerCity ?? retail?.city),
    dealerZipCode: str(r.dealerZipCode ?? retail?.zip),
    images,
    thumbnail: thumbnail || undefined,
    features: Array.isArray(r.features) ? (r.features as string[]) : [],
    source: (str(r.source) || "API") as Vehicle["source"],
    apiProvider: str(r.apiProvider ?? "autodev"),
    apiListingId: str(r.apiListingId ?? vin),
    status: (str(r.status) || "AVAILABLE") as Vehicle["status"],
    isActive: r.isActive !== false,
    isHidden: Boolean(r.isHidden),
    apiData,
    apiSyncStatus: (str(r.apiSyncStatus) || "PENDING") as Vehicle["apiSyncStatus"],
    mileage:
      r.mileage != null
        ? num(r.mileage, 0)
        : retail?.miles != null
          ? num(retail.miles, 0)
          : undefined,
    horsepower: r.horsepower != null ? num(r.horsepower, 0) : undefined,
    torque: r.torque != null ? num(r.torque, 0) : undefined,
    createdAt: str(r.createdAt) || new Date().toISOString(),
    updatedAt: str(r.updatedAt) || new Date().toISOString(),
    featured: typeof r.featured === "boolean" ? r.featured : undefined,
    specialty: typeof r.specialty === "boolean" ? r.specialty : undefined,
    recommended: typeof r.recommended === "boolean" ? r.recommended : undefined,
    isTemporaryListing: Boolean(api?.isTemporary),
  };

  return vehicle;
}

export function normalizeVehiclesForUi(items: unknown[]): Vehicle[] {
  return items.map((v) => normalizeVehicleForUi(v));
}

function minimalVehicle(id: string): Vehicle {
  const now = new Date().toISOString();
  return {
    id,
    vin: "—",
    slug: `vehicle-${id}`,
    make: "Unknown",
    model: "",
    year: new Date().getFullYear(),
    priceUsd: 0,
    vehicleType: "SUV",
    transmission: "Automatic",
    fuelType: "Regular Unleaded",
    engineSize: "",
    drivetrain: "FWD",
    dealerName: "",
    dealerState: "",
    dealerCity: "",
    dealerZipCode: "",
    images: [],
    features: [],
    source: "API",
    apiProvider: "autodev",
    apiListingId: "",
    status: "AVAILABLE",
    isActive: true,
    isHidden: false,
    apiData: emptyApiData(),
    apiSyncStatus: "PENDING",
    createdAt: now,
    updatedAt: now,
  };
}
