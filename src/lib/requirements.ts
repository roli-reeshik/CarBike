export type VehicleCategory = "CAR" | "BIKE";

export type LaunchStatusName =
  | "UPCOMING"
  | "PRE_BOOKING_OPEN"
  | "NEW_LAUNCH"
  | "POPULAR"
  | "LAUNCHED"
  | "DISCONTINUED";

export type EngineSpecRow = {
  parameter: string;
  eHev?: string;
  iVtec?: string;
  [key: string]: string | undefined;
};

export type EngineSpecCategory = {
  category: string;
  headers: string[];
  specs: EngineSpecRow[];
};

export type FeatureRow = {
  feature: string;
  trims: Record<string, string>;
};

export type FeatureCategory = {
  category: string;
  trims: string[];
  features: FeatureRow[];
};

export type CatalogVariant = {
  id: string;
  name: string;
  powertrain?: string | null;
  exShowroomPrice: number;
  onRoadPriceEst: number;
  transmission: string;
  seatingCapacity: number | null;
  keyFeatures: string[];
  powerBhp?: number | null;
  torqueNm?: number | null;
  mileageKmpl?: number | null;
  engineCc?: number | null;
};

export type CatalogColor = {
  id: string;
  name: string;
  hexCode: string;
  previewUrl: string;
  imageUrl?: string | null;
};

export type OutletTypeName = "SHOWROOM" | "SERVICE" | "THREE_S_FACILITY";

export type CatalogDealer = {
  id: string;
  brandId?: string;
  brandName?: string;
  brandSlug?: string;
  vehicleId?: string | null;
  name: string;
  dealerCode?: string | null;
  outletType?: OutletTypeName;
  address: string;
  city: string;
  state?: string;
  pincode?: string | null;
  phone: string;
  email?: string | null;
  rating: number;
  reviewCount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  operatingHours?: string | null;
  isVerified?: boolean;
};

export type CatalogReview = {
  id: string;
  authorName: string;
  city: string;
  ratingOverall: number;
  ratingMileage: number | null;
  ratingComfort: number | null;
  title: string;
  comment: string;
  isVerified: boolean;
};

export type CatalogVehicle = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  brandSlug?: string;
  brand?: {
    id?: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
  category: VehicleCategory;
  tagline: string | null;
  bodyType: string;
  fuelTypes: string[];
  transmissionTypes: string[];
  heroImage: string;
  priceMin: number;
  priceMax: number;
  budgetRange: string;
  ncapRating: number | null;
  launchStatus: LaunchStatusName;
  expectedLaunchDate: string | null;
  isDateConfirmed: boolean;
  expectedPriceMinLakh: number | null;
  expectedPriceMaxLakh: number | null;
  preBookingAmount: string | null;
  engineOrBattery: string;
  powerBhp: string;
  torqueNm: string;
  mileageOrRange: string;
  groundClearanceMm?: number | null;
  seatingCapacity: number | null;
  bikeStyle: string | null;
  engineSpecs?: EngineSpecCategory[] | null;
  featureMatrix?: FeatureCategory[] | null;
  variants: CatalogVariant[];
  colors: CatalogColor[];
  dealers: CatalogDealer[];
  reviews: CatalogReview[];
};

export type RequirementFilters = {
  category: VehicleCategory;
  brand?: string;
  budget: string;
  fuel: string;
  transmission: string;
  seating: string;
  riding: string;
  bodyType: string;
};

export const CAR_BUDGETS = [
  { value: "under_8", label: "< ₹8L" },
  { value: "8_15", label: "₹8–15L" },
  { value: "15_25", label: "₹15–25L" },
  { value: "25_plus", label: "₹25L+" },
] as const;

export const BIKE_BUDGETS = [
  { value: "under_1.5", label: "< ₹1.5L" },
  { value: "1.5_2.5", label: "₹1.5–2.5L" },
  { value: "2.5_plus", label: "₹2.5L+" },
] as const;

export const FUEL_OPTIONS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"] as const;

export const TRANSMISSION_OPTIONS = ["Manual", "Automatic"] as const;

export const SEATING_OPTIONS = [
  { value: "5", label: "5 Seater" },
  { value: "7", label: "7 Seater" },
] as const;

export const RIDING_OPTIONS = ["Commuter", "Cruiser", "Sport", "Scooter"] as const;

export const DEALER_CITIES = [
  "Delhi/NCR",
  "Mumbai",
  "Bengaluru",
  "Lucknow",
];

const FUEL_ALIASES: Record<string, string[]> = {
  electric: ["ev", "electric"],
  petrol: ["petrol"],
  diesel: ["diesel"],
  cng: ["cng"],
  hybrid: ["hybrid", "strong hybrid", "mild hybrid", "e:hev", "shev"],
};

export function budgetsFor(category: VehicleCategory) {
  return category === "CAR" ? CAR_BUDGETS : BIKE_BUDGETS;
}

function bodyTypeMatches(vehicleBody: string, filterBody: string): boolean {
  if (!filterBody || filterBody === "any") return true;
  const vb = (vehicleBody || "").toLowerCase().trim();
  const fb = filterBody.toLowerCase().trim();
  if (vb === fb) return true;

  // SUV variations
  if (fb.includes("suv") || fb.includes("off-roader")) {
    if (
      vb.includes("suv") ||
      vb.includes("crossover") ||
      vb.includes("off-roader") ||
      vb.includes("4x4")
    ) {
      if (fb === "suv" || vb === "suv") return true;
      if (vb.includes(fb) || fb.includes(vb)) return true;
      if (
        (fb.includes("compact") || fb.includes("mid-size") || fb.includes("micro")) &&
        (vb.includes("compact") || vb.includes("mid-size") || vb.includes("micro") || vb.includes("suv"))
      ) {
        return true;
      }
    }
  }

  // MUV / MPV
  if (fb.includes("muv") || fb.includes("mpv")) {
    return vb.includes("muv") || vb.includes("mpv");
  }

  // Sedan
  if (fb === "sedan") {
    return vb.includes("sedan");
  }

  // Hatchback
  if (fb === "hatchback") {
    return vb.includes("hatchback");
  }

  // Off-Roader
  if (fb.includes("off-roader") || fb.includes("4x4")) {
    return vb.includes("off-roader") || vb.includes("4x4") || vb.includes("thar");
  }

  return vb.includes(fb) || fb.includes(vb);
}

function budgetMatches(vehicle: CatalogVehicle, budget: string): boolean {
  if (!budget) return true;
  if (vehicle.budgetRange === budget) return true;

  const minLakh = vehicle.priceMin
    ? vehicle.priceMin / 100000
    : (vehicle.expectedPriceMinLakh ?? 0);
  const maxLakh = vehicle.priceMax
    ? vehicle.priceMax / 100000
    : (vehicle.expectedPriceMaxLakh ?? minLakh);

  let inRange = false;
  if (budget === "under_8") inRange = minLakh < 8;
  else if (budget === "8_15") inRange = minLakh <= 15 && maxLakh >= 8;
  else if (budget === "10_20") inRange = minLakh <= 20 && maxLakh >= 10;
  else if (budget === "15_25") inRange = minLakh <= 25 && maxLakh >= 15;
  else if (budget === "25_plus") inRange = maxLakh >= 25;
  else if (budget === "under_1.5") inRange = minLakh < 1.5;
  else if (budget === "1.5_2.5") inRange = minLakh <= 2.5 && maxLakh >= 1.5;
  else if (budget === "2.5_plus") inRange = maxLakh >= 2.5;

  if (inRange) return true;

  // Variant price matching
  if (vehicle.variants && vehicle.variants.length > 0) {
    return vehicle.variants.some((v) => {
      const vLakh = v.exShowroomPrice / 100000;
      if (budget === "under_8") return vLakh < 8;
      if (budget === "8_15") return vLakh >= 8 && vLakh <= 15;
      if (budget === "10_20") return vLakh >= 10 && vLakh <= 20;
      if (budget === "15_25") return vLakh >= 15 && vLakh <= 25;
      if (budget === "25_plus") return vLakh >= 25;
      if (budget === "under_1.5") return vLakh < 1.5;
      if (budget === "1.5_2.5") return vLakh >= 1.5 && vLakh <= 2.5;
      if (budget === "2.5_plus") return vLakh >= 2.5;
      return false;
    });
  }

  return false;
}

function normalizeBrandName(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function brandMatches(vehicle: CatalogVehicle, filterBrand: string): boolean {
  if (!filterBrand || filterBrand.trim() === "") return true;
  const bNorm = normalizeBrandName(filterBrand);
  const vBrandNorm = normalizeBrandName(vehicle.brandName);
  const vSlugNorm = normalizeBrandName(vehicle.brandSlug || "");

  if (
    vBrandNorm === bNorm ||
    vBrandNorm.includes(bNorm) ||
    bNorm.includes(vBrandNorm) ||
    vSlugNorm === bNorm ||
    vSlugNorm.includes(bNorm)
  ) {
    return true;
  }

  const aliasMap: Record<string, string[]> = {
    tata: ["tata", "tata motors"],
    maruti: ["maruti", "maruti suzuki"],
    mahindra: ["mahindra", "mahindra auto"],
    hyundai: ["hyundai", "hyundai india"],
    toyota: ["toyota", "toyota india"],
    kia: ["kia", "kia india"],
    mg: ["mg", "mg motor"],
    skoda: ["skoda", "skoda india", "škoda"],
    honda: ["honda", "honda cars", "honda 2wheelers"],
    volkswagen: ["volkswagen", "volkswagen india", "vw"],
  };

  for (const aliases of Object.values(aliasMap)) {
    const filterMatches = aliases.some((a) => bNorm.includes(a) || a.includes(bNorm));
    const vehicleMatches = aliases.some(
      (a) => vBrandNorm.includes(a) || a.includes(vBrandNorm) || vSlugNorm.includes(a)
    );
    if (filterMatches && vehicleMatches) return true;
  }

  return false;
}

function fuelMatches(vehicle: CatalogVehicle, fuel: string): boolean {
  if (!fuel) return true;
  const fLower = fuel.toLowerCase();
  const aliases = FUEL_ALIASES[fLower] ?? [fLower];

  const check = (str?: string | null) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return aliases.some((a) => s.includes(a));
  };

  if ((vehicle.fuelTypes || []).some(check)) return true;
  if (check(vehicle.engineOrBattery)) return true;
  if ((vehicle.variants || []).some((v) => check(v.powertrain) || check(v.name))) return true;

  return false;
}

function transmissionMatches(vehicle: CatalogVehicle, transmission: string): boolean {
  if (!transmission) return true;
  const wanted = transmission.toLowerCase();
  const isAutoWanted = wanted.includes("auto");
  const isManualWanted = wanted.includes("man");

  const check = (str?: string | null) => {
    if (!str) return false;
    const norm = str.toLowerCase();
    if (isAutoWanted) {
      return (
        norm.includes("auto") ||
        norm.includes("at") ||
        norm.includes("cvt") ||
        norm.includes("dct") ||
        norm.includes("dsg") ||
        norm.includes("ivt") ||
        norm.includes("amt") ||
        norm.includes("tc") ||
        norm.includes("direct drive")
      );
    }
    if (isManualWanted) {
      return norm.includes("man") || norm.includes("mt") || norm.includes("imt");
    }
    return norm.includes(wanted);
  };

  if ((vehicle.transmissionTypes || []).some(check)) return true;
  if ((vehicle.variants || []).some((v) => check(v.transmission) || check(v.name))) return true;

  return false;
}

function seatingMatches(vehicle: CatalogVehicle, seating: string): boolean {
  if (!seating) return true;
  const seats = Number(seating);
  if (seats === 5) {
    if (vehicle.seatingCapacity === 5 || vehicle.seatingCapacity === 4) return true;
    if ((vehicle.variants || []).some((v) => v.seatingCapacity === 5 || v.seatingCapacity === 4)) return true;
    if (vehicle.seatingCapacity == null) {
      const body = (vehicle.bodyType || "").toLowerCase();
      const isMuv = body.includes("muv") || body.includes("mpv") || body.includes("7-seater");
      return !isMuv;
    }
    return false;
  }
  if (seats === 7) {
    if (vehicle.seatingCapacity != null && vehicle.seatingCapacity >= 6) return true;
    if ((vehicle.variants || []).some((v) => v.seatingCapacity != null && v.seatingCapacity >= 6)) return true;
    const body = (vehicle.bodyType || "").toLowerCase();
    return body.includes("muv") || body.includes("mpv") || body.includes("7-seater");
  }
  return true;
}

export function matchVehicles(
  vehicles: CatalogVehicle[],
  filters: RequirementFilters,
) {
  return vehicles.filter((vehicle) => {
    if (vehicle.category !== filters.category) return false;
    if (!brandMatches(vehicle, filters.brand ?? "")) return false;
    if (!budgetMatches(vehicle, filters.budget)) return false;
    if (!bodyTypeMatches(vehicle.bodyType, filters.bodyType)) return false;
    if (!fuelMatches(vehicle, filters.fuel)) return false;
    if (!transmissionMatches(vehicle, filters.transmission)) return false;
    if (filters.category === "CAR" && !seatingMatches(vehicle, filters.seating)) return false;
    if (filters.category === "BIKE" && filters.riding) {
      const style = (vehicle.bikeStyle ?? vehicle.bodyType).toLowerCase();
      const rLower = filters.riding.toLowerCase();
      if (!style.includes(rLower) && !rLower.includes(style)) return false;
    }
    return true;
  });
}

export function searchVehicles(
  vehicles: CatalogVehicle[],
  query: {
    category?: string | null;
    brand?: string | null;
    budget?: string | null;
    fuel?: string | null;
    transmission?: string | null;
    seating?: string | null;
    riding?: string | null;
    bodyType?: string | null;
    q?: string | null;
  },
) {
  const category =
    query.category === "CAR" || query.category === "BIKE" ? query.category : null;
  const categories: VehicleCategory[] = category ? [category] : ["CAR", "BIKE"];
  const filters = {
    brand: query.brand ?? "",
    budget: query.budget ?? "",
    fuel: query.fuel ?? "",
    transmission: query.transmission ?? "",
    seating: query.seating ?? "",
    riding: query.riding ?? "",
    bodyType: query.bodyType ?? "",
  };
  const rawNeedle = (query.q ?? "").trim();
  const needleNorm = normalizeBrandName(rawNeedle);
  const seen = new Set<string>();
  const results: CatalogVehicle[] = [];

  for (const itemCategory of categories) {
    for (const vehicle of matchVehicles(vehicles, {
      ...filters,
      category: itemCategory,
    })) {
      if (seen.has(vehicle.id)) continue;
      const haystack = `${vehicle.name} ${vehicle.brandName} ${vehicle.slug} ${vehicle.tagline ?? ""}`;
      const haystackNorm = normalizeBrandName(haystack);
      if (needleNorm && !haystackNorm.includes(needleNorm)) continue;
      seen.add(vehicle.id);
      results.push(vehicle);
    }
  }

  return results;
}

export function dealerCityOptions(dealers: { city: string }[]) {
  const extras = [...new Set(dealers.map((dealer) => dealer.city))]
    .filter((city) => !DEALER_CITIES.includes(city))
    .sort((a, b) => a.localeCompare(b));
  return [...DEALER_CITIES, ...extras];
}
