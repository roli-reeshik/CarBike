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

function budgetMatches(vehicle: CatalogVehicle, budget: string) {
  if (vehicle.budgetRange === budget) return true;
  const minLakh = vehicle.priceMin / 100000;
  const maxLakh = vehicle.priceMax / 100000;
  if (budget === "under_8") return minLakh < 8;
  if (budget === "8_15") return minLakh <= 15 && maxLakh >= 8;
  if (budget === "10_20") return minLakh <= 20 && maxLakh >= 10;
  if (budget === "15_25") return minLakh <= 25 && maxLakh >= 15;
  if (budget === "25_plus") return maxLakh >= 25;
  if (budget === "under_1.5") return minLakh < 1.5;
  if (budget === "1.5_2.5") return minLakh <= 2.5 && maxLakh >= 1.5;
  if (budget === "2.5_plus") return maxLakh >= 2.5;
  return false;
}

function normalizeBrandName(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchVehicles(
  vehicles: CatalogVehicle[],
  filters: RequirementFilters,
) {
  return vehicles.filter((vehicle) => {
    if (vehicle.category !== filters.category) return false;
    if (filters.brand && filters.brand.trim() !== "") {
      const bNorm = normalizeBrandName(filters.brand);
      const vBrandNorm = normalizeBrandName(vehicle.brandName);
      const vSlugNorm = normalizeBrandName(vehicle.brandSlug || "");
      const matchBrand =
        vBrandNorm === bNorm ||
        vBrandNorm.includes(bNorm) ||
        bNorm.includes(vBrandNorm) ||
        vSlugNorm === bNorm ||
        vSlugNorm.includes(bNorm);
      if (!matchBrand) return false;
    }
    if (filters.budget && !budgetMatches(vehicle, filters.budget)) return false;
    if (
      filters.bodyType &&
      filters.bodyType !== "any" &&
      vehicle.bodyType.toLowerCase() !== filters.bodyType.toLowerCase()
    ) {
      return false;
    }
    if (filters.fuel && !fuelMatches(vehicle.fuelTypes, filters.fuel)) {
      return false;
    }
    if (
      filters.transmission &&
      !transmissionMatches(vehicle, filters.transmission)
    ) {
      return false;
    }
    if (filters.category === "CAR" && filters.seating) {
      const seats = Number(filters.seating);
      const onVehicle = vehicle.seatingCapacity === seats;
      const onVariant = vehicle.variants.some(
        (variant) => variant.seatingCapacity === seats,
      );
      if (!onVehicle && !onVariant) return false;
    }
    if (filters.category === "BIKE" && filters.riding) {
      const style = (vehicle.bikeStyle ?? vehicle.bodyType).toLowerCase();
      if (style !== filters.riding.toLowerCase()) return false;
    }
    return true;
  });
}

function fuelMatches(fuelTypes: string[], fuel: string) {
  const aliases = FUEL_ALIASES[fuel.toLowerCase()] ?? [fuel.toLowerCase()];
  return fuelTypes.some((type) => {
    const t = type.toLowerCase();
    return aliases.some((alias) => t.includes(alias) || alias.includes(t));
  });
}

function transmissionMatches(vehicle: CatalogVehicle, transmission: string) {
  const wanted = transmission.toLowerCase();
  const onVehicle = vehicle.transmissionTypes.some(
    (type) => type.toLowerCase() === wanted,
  );
  const onVariant = vehicle.variants.some(
    (variant) => variant.transmission.toLowerCase() === wanted,
  );
  return onVehicle || onVariant;
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
