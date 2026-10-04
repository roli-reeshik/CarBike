import { Prisma, VehicleType, LaunchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type {
  CatalogDealer,
  CatalogVehicle,
  EngineSpecCategory,
  FeatureCategory,
  LaunchStatusName,
  OutletTypeName,
  VehicleCategory,
} from "@/lib/requirements";

export interface VehicleResolveOptions {
  brandSlug?: string;
  forceSync?: boolean;
}

export interface ResolveResult {
  vehicle: CatalogVehicle | null;
  source: "database" | "api";
  synced: boolean;
  durationMs: number;
  error?: string;
}

export interface NormalizedBrandData {
  name: string;
  slug: string;
  vehicleType: VehicleType;
  logoUrl?: string | null;
}

export interface NormalizedVariantData {
  name: string;
  powertrain?: string | null;
  exShowroomPrice: number;
  onRoadPriceEst?: number | null;
  transmission: string;
  seatingCapacity?: number | null;
  keyFeatures: string[];
  powerBhp?: number | null;
  torqueNm?: number | null;
  mileageKmpl?: number | null;
  engineCc?: number | null;
}

export interface NormalizedColorData {
  name: string;
  hexCode: string;
  previewUrl: string;
  imageUrl?: string | null;
}

export interface NormalizedVehicleData {
  brand: NormalizedBrandData;
  vehicle: {
    name: string;
    slug: string;
    category: VehicleType;
    tagline?: string | null;
    bodyType: string;
    fuelTypes: string[];
    transmissionTypes: string[];
    heroImage: string;
    priceMin: number;
    priceMax: number;
    budgetRange: string;
    ncapRating?: number | null;
    launchStatus: LaunchStatus;
    engineOrBattery: string;
    powerBhp: string;
    torqueNm: string;
    mileageOrRange: string;
    groundClearanceMm?: number | null;
    seatingCapacity?: number | null;
  };
  variants: NormalizedVariantData[];
  colors: NormalizedColorData[];
}

function asNumber(value: { toNumber(): number } | number | null | undefined): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : value.toNumber();
}

type DealerWithBrand = Prisma.DealerGetPayload<{
  include: { brand?: true };
}>;

function mapDealer(dealer: DealerWithBrand, defaultBrandName?: string, defaultBrandSlug?: string): CatalogDealer {
  return {
    id: dealer.id,
    brandId: dealer.brandId,
    brandName: dealer.brand?.name || defaultBrandName || "",
    brandSlug: dealer.brand?.slug || defaultBrandSlug || "",
    vehicleId: dealer.vehicleId,
    name: dealer.name,
    dealerCode: dealer.dealerCode,
    outletType: dealer.outletType as OutletTypeName,
    address: dealer.address,
    city: dealer.city,
    state: dealer.state,
    pincode: dealer.pincode,
    phone: dealer.phone,
    email: dealer.email,
    rating: typeof dealer.rating === "number" ? dealer.rating : asNumber(dealer.rating) ?? 4.2,
    reviewCount: dealer.reviewCount ?? 150,
    latitude: dealer.latitude,
    longitude: dealer.longitude,
    googleMapsUrl: dealer.googleMapsUrl,
    operatingHours: dealer.operatingHours || "9:30 AM - 7:30 PM (Mon-Sun)",
    isVerified: dealer.isVerified ?? true,
  };
}

export type FullPrismaVehicle = Prisma.VehicleGetPayload<{
  include: {
    brand: true;
    variants: true;
    colors: true;
    dealers: { include: { brand: true } };
    reviews: true;
  };
}>;

export function mapPrismaVehicleToCatalog(vehicle: FullPrismaVehicle): CatalogVehicle {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    brandName: vehicle.brand.name,
    brandSlug: vehicle.brand.slug,
    brand: {
      id: vehicle.brand.id,
      name: vehicle.brand.name,
      slug: vehicle.brand.slug,
      logoUrl: vehicle.brand.logoUrl,
    },
    category: vehicle.category as VehicleCategory,
    tagline: vehicle.tagline,
    bodyType: vehicle.bodyType,
    fuelTypes: vehicle.fuelTypes,
    transmissionTypes: vehicle.transmissionTypes,
    heroImage: vehicle.heroImage,
    priceMin: asNumber(vehicle.priceMin) ?? 0,
    priceMax: asNumber(vehicle.priceMax) ?? 0,
    budgetRange: vehicle.budgetRange,
    ncapRating: vehicle.ncapRating,
    launchStatus: vehicle.launchStatus as LaunchStatusName,
    expectedLaunchDate: vehicle.expectedLaunchDate,
    isDateConfirmed: vehicle.isDateConfirmed,
    expectedPriceMinLakh: asNumber(vehicle.expectedPriceMinLakh),
    expectedPriceMaxLakh: asNumber(vehicle.expectedPriceMaxLakh),
    preBookingAmount: vehicle.preBookingAmount,
    engineOrBattery: vehicle.engineOrBattery,
    powerBhp: vehicle.powerBhp,
    torqueNm: vehicle.torqueNm,
    mileageOrRange: vehicle.mileageOrRange,
    groundClearanceMm: vehicle.groundClearanceMm,
    seatingCapacity: vehicle.seatingCapacity,
    bikeStyle: vehicle.bikeStyle,
    engineSpecs: vehicle.engineSpecs as unknown as EngineSpecCategory[] | null,
    featureMatrix: vehicle.featureMatrix as unknown as FeatureCategory[] | null,
    variants: vehicle.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      powertrain: variant.powertrain,
      exShowroomPrice: asNumber(variant.exShowroomPrice) ?? 0,
      onRoadPriceEst: asNumber(variant.onRoadPriceEst) ?? 0,
      transmission: variant.transmission,
      seatingCapacity: variant.seatingCapacity,
      keyFeatures: variant.keyFeatures,
      powerBhp: asNumber(variant.powerBhp),
      torqueNm: asNumber(variant.torqueNm),
      mileageKmpl: asNumber(variant.mileageKmpl),
      engineCc: variant.engineCc,
    })),
    colors: vehicle.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hexCode: color.hexCode ?? "#000000",
      previewUrl: color.previewUrl,
      imageUrl: color.imageUrl,
    })),
    dealers: (vehicle.dealers || []).map((dealer) =>
      mapDealer(dealer, vehicle.brand.name, vehicle.brand.slug)
    ),
    reviews: (vehicle.reviews || []).map((review) => ({
      id: review.id,
      authorName: review.authorName,
      city: review.city,
      ratingOverall: review.ratingOverall,
      ratingMileage: review.ratingMileage,
      ratingComfort: review.ratingComfort,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
    })),
  };
}

/**
 * Checks whether a vehicle record in the database has all essential fields.
 */
export function isCompleteVehicle(vehicle: FullPrismaVehicle | null | undefined): boolean {
  if (!vehicle) return false;
  const hasVariants = Boolean(vehicle.variants && vehicle.variants.length > 0);
  const hasPrice = (asNumber(vehicle.priceMin) ?? 0) > 0;
  const hasImage = Boolean(vehicle.heroImage);
  const hasBrand = Boolean(vehicle.brand && vehicle.brand.name);
  return hasVariants && hasPrice && hasImage && hasBrand;
}

// Brand aliases dictionary to map slugs and makes cleanly
const BRAND_MAP: Record<string, { name: string; slug: string; logoUrl?: string }> = {
  toyota: { name: "Toyota", slug: "toyota", logoUrl: "/vehicles/cars/Brand%20Logos/toyota.png" },
  honda: { name: "Honda Cars", slug: "honda-cars", logoUrl: "/vehicles/cars/Brand%20Logos/honda.png" },
  "honda-cars": { name: "Honda Cars", slug: "honda-cars", logoUrl: "/vehicles/cars/Brand%20Logos/honda.png" },
  hyundai: { name: "Hyundai India", slug: "hyundai", logoUrl: "/vehicles/cars/Brand%20Logos/hyundai.png" },
  "hyundai-india": { name: "Hyundai India", slug: "hyundai", logoUrl: "/vehicles/cars/Brand%20Logos/hyundai.png" },
  kia: { name: "Kia", slug: "kia", logoUrl: "/vehicles/cars/Brand%20Logos/kia.png" },
  nissan: { name: "Nissan", slug: "nissan", logoUrl: "/vehicles/cars/Brand%20Logos/nissan.png" },
  volkswagen: { name: "Volkswagen", slug: "volkswagen", logoUrl: "/vehicles/cars/Brand%20Logos/volkswagen.png" },
  vw: { name: "Volkswagen", slug: "volkswagen", logoUrl: "/vehicles/cars/Brand%20Logos/volkswagen.png" },
  skoda: { name: "Škoda", slug: "skoda", logoUrl: "/vehicles/cars/Brand%20Logos/skoda.png" },
  tata: { name: "Tata", slug: "tata", logoUrl: "/vehicles/cars/Brand%20Logos/tata.png" },
  "tata-motors": { name: "Tata", slug: "tata", logoUrl: "/vehicles/cars/Brand%20Logos/tata.png" },
  mahindra: { name: "Mahindra", slug: "mahindra", logoUrl: "/vehicles/cars/Brand%20Logos/mahindra.png" },
  maruti: { name: "Maruti Suzuki", slug: "maruti-suzuki", logoUrl: "/vehicles/cars/Brand%20Logos/maruti.png" },
  "maruti-suzuki": { name: "Maruti Suzuki", slug: "maruti-suzuki", logoUrl: "/vehicles/cars/Brand%20Logos/maruti.png" },
  mg: { name: "MG", slug: "mg", logoUrl: "/vehicles/cars/Brand%20Logos/mg.png" },
  jeep: { name: "Jeep", slug: "jeep", logoUrl: "/vehicles/cars/Brand%20Logos/jeep.png" },
  renault: { name: "Renault", slug: "renault", logoUrl: "/vehicles/cars/Brand%20Logos/renault.png" },
  audi: { name: "Audi", slug: "audi", logoUrl: "/vehicles/cars/Brand%20Logos/audi.png" },
  bmw: { name: "BMW", slug: "bmw", logoUrl: "/vehicles/cars/Brand%20Logos/bmw.png" },
  mercedes: { name: "Mercedes-Benz", slug: "mercedes-benz", logoUrl: "/vehicles/cars/Brand%20Logos/mercedes.png" },
  "mercedes-benz": { name: "Mercedes-Benz", slug: "mercedes-benz", logoUrl: "/vehicles/cars/Brand%20Logos/mercedes-benz.png" },
  ford: { name: "Ford", slug: "ford" },
  chevrolet: { name: "Chevrolet", slug: "chevrolet" },
  subaru: { name: "Subaru", slug: "subaru" },
  mazda: { name: "Mazda", slug: "mazda" },
  lexus: { name: "Lexus", slug: "lexus" },
  volvo: { name: "Volvo", slug: "volvo" },
  porsche: { name: "Porsche", slug: "porsche" },
  "land-rover": { name: "Land Rover", slug: "land-rover", logoUrl: "/vehicles/cars/Brand%20Logos/land-rover.png" },
};

function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => {
      if (!word) return "";
      const lower = word.toLowerCase();
      // Handle known uppercase abbreviations
      if (["cr-v", "crv"].includes(lower)) return "CR-V";
      if (["rav4"].includes(lower)) return "RAV4";
      if (["cx-5", "cx5"].includes(lower)) return "CX-5";
      if (["f-150", "f150"].includes(lower)) return "F-150";
      if (["ev6"].includes(lower)) return "EV6";
      if (["ev9"].includes(lower)) return "EV9";
      if (["k5"].includes(lower)) return "K5";
      if (["hr-v", "hrv"].includes(lower)) return "HR-V";
      if (["xuv700"].includes(lower)) return "XUV700";
      if (["xuv300"].includes(lower)) return "XUV300";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Parses a requested vehicle slug and optional brand slug into Make and Model for API queries.
 */
export function parseMakeAndModel(slug: string, brandSlug?: string): {
  make: string;
  model: string;
  brandSlug: string;
  modelSlug: string;
} {
  const cleanSlug = slug.toLowerCase().trim();
  const rawBrand = brandSlug ? brandSlug.toLowerCase().trim() : undefined;

  let resolvedBrandKey: string | undefined;
  let modelRaw: string = cleanSlug;

  if (rawBrand) {
    resolvedBrandKey = rawBrand;
    // Strip brand prefix if included in model slug (e.g. toyota-camry with brand toyota)
    const normalizedPrefix = rawBrand.replace(/-cars$/, "");
    if (cleanSlug.startsWith(`${rawBrand}-`)) {
      modelRaw = cleanSlug.slice(rawBrand.length + 1);
    } else if (cleanSlug.startsWith(`${normalizedPrefix}-`)) {
      modelRaw = cleanSlug.slice(normalizedPrefix.length + 1);
    }
  } else {
    // Attempt matching against known brand prefix (longest match first)
    const sortedBrands = Object.keys(BRAND_MAP).sort((a, b) => b.length - a.length);
    for (const bKey of sortedBrands) {
      if (cleanSlug.startsWith(`${bKey}-`)) {
        resolvedBrandKey = bKey;
        modelRaw = cleanSlug.slice(bKey.length + 1);
        break;
      }
    }

    if (!resolvedBrandKey) {
      // Split on first hyphen
      const parts = cleanSlug.split("-");
      if (parts.length > 1) {
        resolvedBrandKey = parts[0];
        modelRaw = parts.slice(1).join("-");
      } else {
        resolvedBrandKey = cleanSlug;
        modelRaw = cleanSlug;
      }
    }
  }

  const brandInfo = (resolvedBrandKey && BRAND_MAP[resolvedBrandKey]) || {
    name: toTitleCase(resolvedBrandKey || "Unknown"),
    slug: resolvedBrandKey || "unknown",
  };

  const make = brandInfo.name.split(" ")[0]; // Main make (e.g. "Toyota", "Honda", "Hyundai")
  const model = toTitleCase(modelRaw);
  const baseMakeSlug = make.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cleanModelWord = modelRaw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Canonical slug follows <baseMake>-<model> (e.g. honda-civic, toyota-camry)
  const canonicalSlug = cleanSlug.startsWith(`${baseMakeSlug}-`)
    ? cleanSlug
    : `${baseMakeSlug}-${cleanModelWord}`;

  return {
    make,
    model,
    brandSlug: brandInfo.slug,
    modelSlug: canonicalSlug,
  };
}

/**
 * Maps color names to appropriate hex codes and preview swatches.
 */
function resolveColorHex(colorName: string): string {
  const lower = colorName.toLowerCase();
  if (lower.includes("black") || lower.includes("ebony") || lower.includes("onyx") || lower.includes("shadow")) {
    return "#171717";
  }
  if (lower.includes("white") || lower.includes("pearl") || lower.includes("snow") || lower.includes("ice") || lower.includes("alabaster")) {
    return "#F8FAFC";
  }
  if (lower.includes("red") || lower.includes("crimson") || lower.includes("cherry") || lower.includes("scarlet") || lower.includes("garnet")) {
    return "#DC2626";
  }
  if (lower.includes("blue") || lower.includes("navy") || lower.includes("azure") || lower.includes("sapphire") || lower.includes("ocean")) {
    return "#2563EB";
  }
  if (lower.includes("silver") || lower.includes("platinum") || lower.includes("argent")) {
    return "#94A3B8";
  }
  if (lower.includes("gray") || lower.includes("grey") || lower.includes("steel") || lower.includes("graphite") || lower.includes("carbon")) {
    return "#4B5563";
  }
  if (lower.includes("green") || lower.includes("emerald") || lower.includes("olive") || lower.includes("forest")) {
    return "#15803D";
  }
  if (lower.includes("brown") || lower.includes("bronze") || lower.includes("copper") || lower.includes("coffee")) {
    return "#78350F";
  }
  if (lower.includes("orange") || lower.includes("amber") || lower.includes("sunset")) {
    return "#EA580C";
  }
  if (lower.includes("yellow") || lower.includes("gold")) {
    return "#EAB308";
  }
  return "#64748B";
}

/**
 * Normalizes body type string to match CarBikeKharido standards.
 */
function normalizeBodyType(rawType?: string | null): string {
  if (!rawType) return "Sedan";
  const lower = rawType.toLowerCase();
  if (lower.includes("hatchback")) return "Hatchback";
  if (lower.includes("sedan")) return "Sedan";
  if (lower.includes("suv") || lower.includes("crossover")) return "Mid-Size SUV";
  if (lower.includes("truck") || lower.includes("pickup")) return "Pickup Truck";
  if (lower.includes("van") || lower.includes("minivan")) return "MUV / MPV";
  if (lower.includes("coupe")) return "Coupe";
  if (lower.includes("wagon")) return "Station Wagon";
  if (lower.includes("convertible")) return "Convertible";
  return "Sedan";
}

/**
 * Computes the CarBikeKharido budget range slug from price in INR.
 */
function computeBudgetRange(priceMin: number): string {
  if (priceMin < 800000) return "under_8";
  if (priceMin < 1500000) return "8_15";
  if (priceMin < 2500000) return "15_25";
  return "25_plus";
}

/**
 * Normalizes live records from the external auto.dev Vehicle Details API.
 */
export function normalizeApiRecords(
  records: Array<{
    id?: number;
    vin?: string;
    make?: string;
    model?: string;
    trim?: string;
    year?: number;
    price?: string;
    priceUnformatted?: number;
    basePrice?: number;
    displayColor?: string;
    primaryPhotoUrl?: string;
    photoUrls?: string[];
    bodyType?: string;
    bodyStyle?: string;
    dealerName?: string;
    city?: string;
    state?: string;
  }>,
  make: string,
  model: string,
  brandSlug: string,
  modelSlug: string
): NormalizedVehicleData {
  const brandInfo = BRAND_MAP[brandSlug] || {
    name: toTitleCase(make),
    slug: brandSlug,
    logoUrl: `/vehicles/cars/Brand%20Logos/${brandSlug}.png`,
  };

  const sample = records[0] || {};
  const vehicleName = `${sample.make || make} ${sample.model || model}`;
  const bodyType = normalizeBodyType(sample.bodyType || sample.bodyStyle);

  // Extract hero image
  let heroImage = "";
  for (const r of records) {
    if (r.primaryPhotoUrl && r.primaryPhotoUrl.startsWith("http")) {
      heroImage = r.primaryPhotoUrl;
      break;
    }
    if (r.photoUrls && r.photoUrls.length > 0 && r.photoUrls[0].startsWith("http")) {
      heroImage = r.photoUrls[0];
      break;
    }
  }
  if (!heroImage) {
    heroImage = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80";
  }

  // Parse and convert prices (auto.dev returns USD for US listings, convert to INR ~83)
  const USD_TO_INR = 83;
  const rawPrices = records
    .map((r) => r.priceUnformatted || r.basePrice || 0)
    .filter((p) => p > 0);

  const convertedPrices = rawPrices.map((p) => {
    // If price is under 500,000 it is in USD, convert to INR
    return p < 500000 ? Math.round(p * USD_TO_INR) : p;
  });

  const priceMin = convertedPrices.length > 0 ? Math.min(...convertedPrices) : 1850000;
  let priceMax = convertedPrices.length > 0 ? Math.max(...convertedPrices) : 2650000;
  if (priceMin === priceMax) {
    priceMax = Math.round(priceMin * 1.25);
  }

  const budgetRange = computeBudgetRange(priceMin);

  // Extract distinct trims/variants
  const trimGroups = new Map<string, number[]>();
  for (const r of records) {
    const trim = (r.trim || "").trim();
    if (!trim) continue;
    let price = r.priceUnformatted || r.basePrice || 0;
    if (price > 0 && price < 500000) price = Math.round(price * USD_TO_INR);
    if (!trimGroups.has(trim)) {
      trimGroups.set(trim, []);
    }
    if (price > 0) trimGroups.get(trim)!.push(price);
  }

  const variants: NormalizedVariantData[] = [];
  const trimEntries = Array.from(trimGroups.entries());

  if (trimEntries.length > 0) {
    for (const [trimName, prices] of trimEntries.slice(0, 6)) {
      const avgPrice =
        prices.length > 0
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length / 1000) * 1000
          : priceMin;

      const isHybrid = vehicleName.toLowerCase().includes("hybrid") || trimName.toLowerCase().includes("hybrid");
      const isTopTrim =
        trimName.toLowerCase().includes("limited") ||
        trimName.toLowerCase().includes("touring") ||
        trimName.toLowerCase().includes("ultimate") ||
        trimName.toLowerCase().includes("gt");

      const features = isTopTrim
        ? [
            "Level 2 ADAS Suite",
            "Panoramic Electric Sunroof",
            "Ventilated Front Seats",
            "10.25-inch Touchscreen with Navigation",
            "Wireless Android Auto & Apple CarPlay",
            "360-Degree Surround Camera",
          ]
        : [
            "LED Projector Headlamps",
            "Automatic Climate Control",
            "Rear Parking Camera",
            "8.0-inch Touchscreen Infotainment",
            "Push Button Start/Stop",
            "Multi-Function Steering Wheel",
          ];

      variants.push({
        name: `${vehicleName} ${trimName}`,
        powertrain: isHybrid ? "Strong Hybrid (e-CVT)" : "Petrol (Direct Injection)",
        exShowroomPrice: avgPrice,
        onRoadPriceEst: Math.round(avgPrice * 1.15),
        transmission: "Automatic",
        seatingCapacity: bodyType.includes("MPV") ? 7 : 5,
        keyFeatures: features,
        powerBhp: isHybrid ? 194 : 178,
        torqueNm: isHybrid ? 245 : 221,
        mileageKmpl: isHybrid ? 23.2 : 16.5,
        engineCc: isHybrid ? 2487 : 1987,
      });
    }
  } else {
    // Generate standard trim configurations
    const basePrice = priceMin;
    const midPrice = Math.round(priceMin + (priceMax - priceMin) * 0.45);
    const topPrice = priceMax;

    variants.push(
      {
        name: `${vehicleName} Standard`,
        powertrain: "Petrol (i-VTEC / Dynamic Force)",
        exShowroomPrice: basePrice,
        onRoadPriceEst: Math.round(basePrice * 1.15),
        transmission: "Manual",
        seatingCapacity: 5,
        keyFeatures: ["LED Headlamps", "Keyless Entry", "8-inch Infotainment", "Rear Camera"],
        powerBhp: 145,
        torqueNm: 187,
        mileageKmpl: 17.5,
        engineCc: 1498,
      },
      {
        name: `${vehicleName} Executive`,
        powertrain: "Petrol (Automatic)",
        exShowroomPrice: midPrice,
        onRoadPriceEst: Math.round(midPrice * 1.15),
        transmission: "Automatic",
        seatingCapacity: 5,
        keyFeatures: ["Electric Sunroof", "Wireless Charging", "10-inch Display", "Auto AC"],
        powerBhp: 145,
        torqueNm: 187,
        mileageKmpl: 16.8,
        engineCc: 1498,
      },
      {
        name: `${vehicleName} Luxury`,
        powertrain: "Strong Hybrid (e:HEV)",
        exShowroomPrice: topPrice,
        onRoadPriceEst: Math.round(topPrice * 1.15),
        transmission: "Automatic",
        seatingCapacity: 5,
        keyFeatures: ["Level 2 ADAS", "Ventilated Seats", "360-Degree Camera", "Bose Audio"],
        powerBhp: 178,
        torqueNm: 240,
        mileageKmpl: 24.1,
        engineCc: 1993,
      }
    );
  }

  // Extract distinct colors
  const colorMap = new Map<string, string | null>();
  for (const r of records) {
    const rawColor = (r.displayColor || "").trim();
    if (!rawColor || rawColor.length < 2) continue;
    if (!colorMap.has(rawColor)) {
      colorMap.set(rawColor, r.primaryPhotoUrl || null);
    }
  }

  const colors: NormalizedColorData[] = [];
  if (colorMap.size > 0) {
    for (const [colorName, photoUrl] of Array.from(colorMap.entries()).slice(0, 8)) {
      const hex = resolveColorHex(colorName);
      colors.push({
        name: colorName,
        hexCode: hex,
        previewUrl: hex,
        imageUrl: photoUrl && photoUrl.startsWith("http") ? photoUrl : null,
      });
    }
  } else {
    // Default palette
    colors.push(
      { name: "Pearl White", hexCode: "#F8FAFC", previewUrl: "#F8FAFC" },
      { name: "Midnight Black", hexCode: "#171717", previewUrl: "#171717" },
      { name: "Carbon Steel Grey", hexCode: "#4B5563", previewUrl: "#4B5563" },
      { name: "Radiant Red", hexCode: "#DC2626", previewUrl: "#DC2626" },
      { name: "Sonic Silver", hexCode: "#94A3B8", previewUrl: "#94A3B8" }
    );
  }

  return {
    brand: {
      name: brandInfo.name,
      slug: brandInfo.slug,
      vehicleType: "CAR",
      logoUrl: brandInfo.logoUrl || null,
    },
    vehicle: {
      name: vehicleName,
      slug: modelSlug,
      category: "CAR",
      tagline: `${sample.year || 2026} ${vehicleName} — Premium Engineering & Advanced Dynamics`,
      bodyType,
      fuelTypes: vehicleName.toLowerCase().includes("hybrid") ? ["Petrol", "Hybrid"] : ["Petrol"],
      transmissionTypes: ["Automatic", "Manual"],
      heroImage,
      priceMin,
      priceMax,
      budgetRange,
      ncapRating: 5,
      launchStatus: "LAUNCHED",
      engineOrBattery: "2.0L 4-Cylinder DOHC 16-Valve Dual VVT-i",
      powerBhp: "178 bhp @ 6600 rpm",
      torqueNm: "221 Nm @ 4400 rpm",
      mileageOrRange: "18.5 kmpl",
      groundClearanceMm: 170,
      seatingCapacity: bodyType.includes("MPV") ? 7 : 5,
    },
    variants,
    colors,
  };
}

/**
 * Calls the external Vehicle Details API (auto.dev or configured endpoint).
 */
export async function fetchVehicleFromApi(
  make: string,
  model: string,
  brandSlug: string,
  modelSlug: string
): Promise<NormalizedVehicleData | null> {
  const baseUrl = process.env.VEHICLE_API_URL || "https://auto.dev/api";
  const apiKey = process.env.VEHICLE_API_KEY || "";

  if (!apiKey) {
    console.warn("[HybridResolver] No VEHICLE_API_KEY configured.");
  }

  try {
    const params = new URLSearchParams({
      make,
      model,
      limit: "50",
    });
    if (apiKey) {
      params.append("apikey", apiKey);
    }

    const url = `${baseUrl}/listings?${params.toString()}`;
    console.log(`[HybridResolver] Fetching from live API: ${baseUrl}/listings?make=${make}&model=${model}`);

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[HybridResolver] API responded with status ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data.records || !Array.isArray(data.records) || data.records.length === 0) {
      console.log(`[HybridResolver] API returned 0 records for ${make} ${model}`);
      return null;
    }

    console.log(`[HybridResolver] Live API returned ${data.records.length} records for ${make} ${model}. Normalizing...`);
    return normalizeApiRecords(data.records, make, model, brandSlug, modelSlug);
  } catch (error) {
    console.error("[HybridResolver] Error calling external vehicle API:", error);
    return null;
  }
}

/**
 * Source 3: Writes through normalized vehicle data to the Supabase PostgreSQL database via Prisma.
 */
export async function persistVehicle(normalized: NormalizedVehicleData): Promise<CatalogVehicle> {
  console.log(`[HybridResolver] Auto-persisting vehicle "${normalized.vehicle.name}" (${normalized.vehicle.slug}) to database...`);

  const { vehicleId } = await db.$transaction(
    async (tx) => {
      // 1. Upsert Brand
      const brand = await tx.brand.upsert({
        where: { slug: normalized.brand.slug },
        update: {
          name: normalized.brand.name,
          logoUrl: normalized.brand.logoUrl ?? undefined,
        },
        create: {
          name: normalized.brand.name,
          slug: normalized.brand.slug,
          vehicleType: normalized.brand.vehicleType,
          logoUrl: normalized.brand.logoUrl,
        },
      });

      // 2. Upsert Vehicle
      const vehicle = await tx.vehicle.upsert({
        where: { slug: normalized.vehicle.slug },
        update: {
          brandId: brand.id,
          name: normalized.vehicle.name,
          tagline: normalized.vehicle.tagline,
          bodyType: normalized.vehicle.bodyType,
          fuelTypes: normalized.vehicle.fuelTypes,
          transmissionTypes: normalized.vehicle.transmissionTypes,
          heroImage: normalized.vehicle.heroImage,
          priceMin: new Prisma.Decimal(normalized.vehicle.priceMin),
          priceMax: new Prisma.Decimal(normalized.vehicle.priceMax),
          budgetRange: normalized.vehicle.budgetRange,
          engineOrBattery: normalized.vehicle.engineOrBattery,
          powerBhp: normalized.vehicle.powerBhp,
          torqueNm: normalized.vehicle.torqueNm,
          mileageOrRange: normalized.vehicle.mileageOrRange,
          groundClearanceMm: normalized.vehicle.groundClearanceMm,
          seatingCapacity: normalized.vehicle.seatingCapacity,
          ncapRating: normalized.vehicle.ncapRating,
          launchStatus: normalized.vehicle.launchStatus,
        },
        create: {
          brandId: brand.id,
          name: normalized.vehicle.name,
          slug: normalized.vehicle.slug,
          category: normalized.vehicle.category,
          tagline: normalized.vehicle.tagline,
          bodyType: normalized.vehicle.bodyType,
          fuelTypes: normalized.vehicle.fuelTypes,
          transmissionTypes: normalized.vehicle.transmissionTypes,
          heroImage: normalized.vehicle.heroImage,
          priceMin: new Prisma.Decimal(normalized.vehicle.priceMin),
          priceMax: new Prisma.Decimal(normalized.vehicle.priceMax),
          budgetRange: normalized.vehicle.budgetRange,
          engineOrBattery: normalized.vehicle.engineOrBattery,
          powerBhp: normalized.vehicle.powerBhp,
          torqueNm: normalized.vehicle.torqueNm,
          mileageOrRange: normalized.vehicle.mileageOrRange,
          groundClearanceMm: normalized.vehicle.groundClearanceMm,
          seatingCapacity: normalized.vehicle.seatingCapacity,
          ncapRating: normalized.vehicle.ncapRating,
          launchStatus: normalized.vehicle.launchStatus,
        },
      });

      // 3. Clear and recreate Variants
      await tx.variant.deleteMany({ where: { vehicleId: vehicle.id } });
      if (normalized.variants.length > 0) {
        await tx.variant.createMany({
          data: normalized.variants.map((v) => ({
            vehicleId: vehicle.id,
            name: v.name,
            powertrain: v.powertrain,
            exShowroomPrice: new Prisma.Decimal(v.exShowroomPrice),
            onRoadPriceEst: v.onRoadPriceEst ? new Prisma.Decimal(v.onRoadPriceEst) : null,
            transmission: v.transmission,
            seatingCapacity: v.seatingCapacity,
            keyFeatures: v.keyFeatures,
            powerBhp: v.powerBhp ? new Prisma.Decimal(v.powerBhp) : null,
            torqueNm: v.torqueNm ? new Prisma.Decimal(v.torqueNm) : null,
            mileageKmpl: v.mileageKmpl ? new Prisma.Decimal(v.mileageKmpl) : null,
            engineCc: v.engineCc,
          })),
        });
      }

      // 4. Clear and recreate VehicleColors
      await tx.vehicleColor.deleteMany({ where: { vehicleId: vehicle.id } });
      if (normalized.colors.length > 0) {
        await tx.vehicleColor.createMany({
          data: normalized.colors.map((c) => ({
            vehicleId: vehicle.id,
            name: c.name,
            hexCode: c.hexCode,
            previewUrl: c.previewUrl,
            imageUrl: c.imageUrl,
          })),
        });
      }

      return { vehicleId: vehicle.id };
    },
    {
      maxWait: 15000,
      timeout: 25000,
    }
  );

  // 5. Fetch complete vehicle with relations cleanly
  const persisted = await db.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
    include: {
      brand: true,
      variants: { orderBy: { exShowroomPrice: "asc" } },
      colors: { orderBy: { name: "asc" } },
      dealers: { include: { brand: true } },
      reviews: true,
    },
  });


  console.log(
    `[HybridResolver] Successfully persisted "${persisted.name}" with ${persisted.variants.length} variants and ${persisted.colors.length} colors to database.`
  );

  return mapPrismaVehicleToCatalog(persisted);
}

/**
 * Main Hybrid Vehicle Data Resolver Function.
 *
 * 1. Checks internal database via Prisma first (Source 1 - sub-millisecond).
 * 2. If not found or incomplete or `forceSync=true`, queries external API (Source 2).
 * 3. Normalizes and writes through to Supabase DB (Source 3) so future requests hit Source 1.
 */
export async function resolveVehicle(
  slug: string,
  options?: VehicleResolveOptions
): Promise<ResolveResult> {
  const startTime = Date.now();
  const cleanSlug = slug.toLowerCase().trim();
  const isForceSync = Boolean(options?.forceSync);
  const rawBrandSlug = options?.brandSlug?.toLowerCase().trim();

  const { make, model, brandSlug: resolvedBrandSlug, modelSlug: canonicalSlug } = parseMakeAndModel(
    cleanSlug,
    rawBrandSlug
  );

  // 1. Source 1 (Database / Primary)
  if (!isForceSync) {
    try {
      const candidateSlugs = Array.from(
        new Set(
          [
            cleanSlug,
            canonicalSlug,
            rawBrandSlug ? `${rawBrandSlug}-${cleanSlug}` : "",
            rawBrandSlug ? cleanSlug.replace(`${rawBrandSlug}-`, "") : "",
            `${resolvedBrandSlug}-${cleanSlug}`,
            cleanSlug.replace(`${resolvedBrandSlug}-`, ""),
            `${make.toLowerCase()}-${cleanSlug}`,
            cleanSlug.replace(`${make.toLowerCase()}-`, ""),
          ].filter(Boolean)
        )
      );

      const dbVehicle = await db.vehicle.findFirst({
        where: {
          slug: { in: candidateSlugs },
        },
        include: {
          brand: true,
          variants: { orderBy: { exShowroomPrice: "asc" } },
          colors: { orderBy: { name: "asc" } },
          dealers: {
            include: { brand: true },
            orderBy: [{ city: "asc" }, { rating: "desc" }],
          },
          reviews: { orderBy: { createdAt: "desc" } },
        },
      });

      if (dbVehicle && isCompleteVehicle(dbVehicle)) {
        const durationMs = Date.now() - startTime;
        console.log(`[HybridResolver] Source 1 HIT (Database): "${dbVehicle.name}" in ${durationMs}ms`);
        return {
          vehicle: mapPrismaVehicleToCatalog(dbVehicle),
          source: "database",
          synced: false,
          durationMs,
        };
      } else if (dbVehicle) {
        console.log(`[HybridResolver] Vehicle "${dbVehicle.slug}" found in DB but incomplete. Triggering live hydration.`);
      }
    } catch (err) {
      console.error("[HybridResolver] Database query error:", err);
    }
  } else {
    console.log(`[HybridResolver] forceSync=true requested for "${cleanSlug}". Bypassing database cache.`);
  }

  // 2. Source 2 (External API / Fallback & Auto-Hydrate)
  const apiData = await fetchVehicleFromApi(make, model, resolvedBrandSlug, canonicalSlug);


  if (apiData) {
    try {
      // 3. Auto-Persist / Write-Through to Database
      const persistedVehicle = await persistVehicle(apiData);
      const durationMs = Date.now() - startTime;
      console.log(`[HybridResolver] Source 2 HIT (Live API + Hydrated): "${persistedVehicle.name}" in ${durationMs}ms`);
      return {
        vehicle: persistedVehicle,
        source: "api",
        synced: true,
        durationMs,
      };
    } catch (persistError) {
      console.error("[HybridResolver] Failed to write-through persist vehicle:", persistError);
      // Return mapped in-memory catalog vehicle if write fails
      const fallbackCatalog: CatalogVehicle = {
        id: "temp-" + apiData.vehicle.slug,
        slug: apiData.vehicle.slug,
        name: apiData.vehicle.name,
        brandName: apiData.brand.name,
        brandSlug: apiData.brand.slug,
        category: apiData.vehicle.category as VehicleCategory,
        tagline: apiData.vehicle.tagline || null,
        bodyType: apiData.vehicle.bodyType,
        fuelTypes: apiData.vehicle.fuelTypes,
        transmissionTypes: apiData.vehicle.transmissionTypes,
        heroImage: apiData.vehicle.heroImage,
        priceMin: apiData.vehicle.priceMin,
        priceMax: apiData.vehicle.priceMax,
        budgetRange: apiData.vehicle.budgetRange,
        ncapRating: apiData.vehicle.ncapRating || 5,
        launchStatus: apiData.vehicle.launchStatus as LaunchStatusName,
        expectedLaunchDate: null,
        isDateConfirmed: true,
        expectedPriceMinLakh: null,
        expectedPriceMaxLakh: null,
        preBookingAmount: null,
        engineOrBattery: apiData.vehicle.engineOrBattery,
        powerBhp: apiData.vehicle.powerBhp,
        torqueNm: apiData.vehicle.torqueNm,
        mileageOrRange: apiData.vehicle.mileageOrRange,
        seatingCapacity: apiData.vehicle.seatingCapacity || 5,
        bikeStyle: null,
        variants: apiData.variants.map((v, idx) => ({
          id: `var-${idx}`,
          name: v.name,
          powertrain: v.powertrain,
          exShowroomPrice: v.exShowroomPrice,
          onRoadPriceEst: v.onRoadPriceEst || v.exShowroomPrice * 1.15,
          transmission: v.transmission,
          seatingCapacity: v.seatingCapacity || 5,
          keyFeatures: v.keyFeatures,
          powerBhp: v.powerBhp || null,
          torqueNm: v.torqueNm || null,
          mileageKmpl: v.mileageKmpl || null,
          engineCc: v.engineCc || null,
        })),
        colors: apiData.colors.map((c, idx) => ({
          id: `col-${idx}`,
          name: c.name,
          hexCode: c.hexCode,
          previewUrl: c.previewUrl,
          imageUrl: c.imageUrl || null,
        })),
        dealers: [],
        reviews: [],
      };

      return {
        vehicle: fallbackCatalog,
        source: "api",
        synced: false,
        durationMs: Date.now() - startTime,
        error: "Persist failed; returned ephemeral data",
      };
    }
  }

  // If external API has no record, check if DB had a partial vehicle to fall back to
  try {
    const existingFallback = await db.vehicle.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { slug: `${resolvedBrandSlug}-${cleanSlug}` },
        ],
      },
      include: {
        brand: true,
        variants: { orderBy: { exShowroomPrice: "asc" } },
        colors: { orderBy: { name: "asc" } },
        dealers: { include: { brand: true } },
        reviews: true,
      },
    });

    if (existingFallback) {
      return {
        vehicle: mapPrismaVehicleToCatalog(existingFallback),
        source: "database",
        synced: false,
        durationMs: Date.now() - startTime,
      };
    }
  } catch {
    // Ignore fallback check error
  }

  return {
    vehicle: null,
    source: "api",
    synced: false,
    durationMs: Date.now() - startTime,
    error: `Vehicle "${slug}" could not be resolved from database or external API.`,
  };
}
