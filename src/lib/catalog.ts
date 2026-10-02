import type { Prisma } from "@prisma/client";
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

function asNumber(value: { toNumber(): number } | number | null | undefined) {
  if (value == null) return null;
  return typeof value === "number" ? value : value.toNumber();
}

type DealerEntity = Prisma.DealerGetPayload<{
  include: { brand?: true };
}>;

function mapDealer(dealer: DealerEntity, defaultBrandName?: string, defaultBrandSlug?: string): CatalogDealer {
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

export async function getCatalog(): Promise<CatalogVehicle[]> {
  const vehicles = await db.vehicle.findMany({
    include: {
      brand: true,
      variants: { orderBy: { exShowroomPrice: "asc" } },
      colors: { orderBy: { name: "asc" } },
      dealers: {
        include: { brand: true },
        orderBy: [{ city: "asc" }, { name: "asc" }],
      },
      reviews: { orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ isFeatured: "desc" }, { priceMin: "asc" }],
  });

  return vehicles.map((vehicle) => ({
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    brandName: vehicle.brand.name,
    brandSlug: vehicle.brand.slug,
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
    dealers: vehicle.dealers.map((dealer) =>
      mapDealer(dealer, vehicle.brand.name, vehicle.brand.slug)
    ),
    reviews: vehicle.reviews.map((review) => ({
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
  }));
}

export async function getVehicleBySlug(slug: string): Promise<CatalogVehicle | null> {
  const vehicle = await db.vehicle.findUnique({
    where: { slug },
    include: {
      brand: true,
      variants: { orderBy: { exShowroomPrice: "asc" } },
      colors: { orderBy: { name: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!vehicle) return null;

  const dealers = await db.dealer.findMany({
    where: {
      OR: [
        { vehicleId: vehicle.id },
        { brandId: vehicle.brandId },
      ],
    },
    include: { brand: true },
    orderBy: [{ city: "asc" }, { rating: "desc" }, { name: "asc" }],
  });

  return {
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    brandName: vehicle.brand.name,
    brandSlug: vehicle.brand.slug,
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
    dealers: dealers.map((dealer) =>
      mapDealer(dealer, vehicle.brand.name, vehicle.brand.slug)
    ),
    reviews: vehicle.reviews.map((review) => ({
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

export async function getDealers(filters?: {
  brandSlug?: string;
  city?: string;
  state?: string;
  outletType?: string;
  q?: string;
}): Promise<CatalogDealer[]> {
  const where: Prisma.DealerWhereInput = {};

  if (filters?.brandSlug && filters.brandSlug !== "all") {
    where.brand = { slug: filters.brandSlug };
  }

  if (filters?.city && filters.city !== "all") {
    where.city = { equals: filters.city, mode: "insensitive" };
  }

  if (filters?.state && filters.state !== "all") {
    where.state = { equals: filters.state, mode: "insensitive" };
  }

  if (filters?.outletType && filters.outletType !== "all") {
    where.outletType = filters.outletType as Prisma.EnumOutletTypeFilter<"Dealer">;
  }

  if (filters?.q && filters.q.trim()) {
    const query = filters.q.trim();
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { pincode: { contains: query } },
    ];
  }

  const dealers = await db.dealer.findMany({
    where,
    include: {
      brand: true,
      vehicle: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ city: "asc" }, { rating: "desc" }, { name: "asc" }],
  });

  return dealers.map((d) => mapDealer(d));
}

export async function getDealersByBrandSlug(brandSlug: string): Promise<CatalogDealer[]> {
  return getDealers({ brandSlug });
}

export async function getDealersByVehicleSlug(vehicleSlug: string): Promise<CatalogDealer[]> {
  const vehicle = await db.vehicle.findUnique({
    where: { slug: vehicleSlug },
    select: { brandId: true, id: true, brand: { select: { slug: true } } },
  });

  if (!vehicle) return [];

  // Return dealers linked to vehicle OR its brand
  const dealers = await db.dealer.findMany({
    where: {
      OR: [
        { vehicleId: vehicle.id },
        { brandId: vehicle.brandId },
      ],
    },
    include: {
      brand: true,
    },
    orderBy: [{ city: "asc" }, { rating: "desc" }, { name: "asc" }],
  });

  return dealers.map((d) => mapDealer(d));
}

export async function getDealerNetworkBrands(): Promise<
  Array<{ id: string; name: string; slug: string; dealerCount: number }>
> {
  const brands = await db.brand.findMany({
    where: {
      dealers: { some: {} },
    },
    include: {
      _count: { select: { dealers: true } },
    },
    orderBy: { name: "asc" },
  });

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    dealerCount: b._count.dealers,
  }));
}

export interface HomeCarItem {
  id: string;
  name: string;
  brandName: string;
  brandSlug: string;
  priceFormatted: string;
  launchDate?: string;
  fuelType?: string;
  imageUrl: string;
  href: string;
}

export interface HomeBrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  vehicleCount: number;
}

function formatCarPrice(min: number, max: number, isUpcoming = false): string {
  if (!min && !max) return "Price on Request";
  const minLakh = (min / 100000).toFixed(2);
  const maxLakh = (max / 100000).toFixed(2);
  const prefix = isUpcoming ? "Est. " : "";
  if (min === max || !max) return `${prefix}₹ ${minLakh} Lakh`;
  return `${prefix}₹ ${minLakh} - ${maxLakh} Lakh`;
}

function getVehicleHref(slug: string, brandSlug: string): string {
  if (slug === "skoda-slavia") return "/cars/skoda/skoda-slavia";
  if (slug === "hyundai-verna") return "/cars/hyundai/hyundai-verna";
  if (slug === "honda-city") return "/cars/honda-cars/honda-city";
  return `/cars/${brandSlug}/${slug}`;
}

export async function getHomeShowcaseData(): Promise<{
  brands: HomeBrandItem[];
  newLaunches: HomeCarItem[];
  upcoming: HomeCarItem[];
  popular: HomeCarItem[];
}> {
  // 1. Fetch popular car brands with logos
  const rawBrands = await db.brand.findMany({
    where: {
      vehicleType: "CAR",
      logoUrl: { not: null },
    },
    include: {
      _count: { select: { vehicles: true } },
    },
    orderBy: [{ vehicles: { _count: "desc" } }, { name: "asc" }],
  });

  const brands: HomeBrandItem[] = rawBrands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl || "/vehicles/cars/Brand Logos/skoda.png",
    vehicleCount: b._count.vehicles,
  }));

  // 2. Fetch cars by launchStatus
  const allCars = await db.vehicle.findMany({
    where: { category: "CAR" },
    include: { brand: true },
    orderBy: [{ isFeatured: "desc" }, { priceMin: "asc" }],
  });

  const mapToHomeCar = (v: typeof allCars[0], isUpcoming = false): HomeCarItem => {
    const min = asNumber(v.priceMin) ?? 0;
    const max = asNumber(v.priceMax) ?? 0;
    const priceFormatted =
      isUpcoming && v.expectedPriceMinLakh && v.expectedPriceMaxLakh
        ? `Est. ₹ ${asNumber(v.expectedPriceMinLakh)?.toFixed(2)} - ${asNumber(v.expectedPriceMaxLakh)?.toFixed(2)} Lakh`
        : formatCarPrice(min, max, isUpcoming);

    return {
      id: v.id,
      name: v.name,
      brandName: v.brand.name,
      brandSlug: v.brand.slug,
      priceFormatted,
      launchDate: v.expectedLaunchDate || undefined,
      fuelType: v.fuelTypes?.[0] ? `${v.fuelTypes.join(", ")} · ${v.bodyType}` : v.bodyType,
      imageUrl: v.heroImage || "/vehicles/cars/skoda/skoda-slavia/Candy White.png",
      href: getVehicleHref(v.slug, v.brand.slug),
    };
  };

  const newLaunches = allCars
    .filter((v) => v.launchStatus === "NEW_LAUNCH")
    .map((v) => mapToHomeCar(v));

  const upcoming = allCars
    .filter((v) => v.launchStatus === "UPCOMING")
    .map((v) => mapToHomeCar(v, true));

  const popular = allCars
    .filter((v) => v.launchStatus === "POPULAR")
    .map((v) => mapToHomeCar(v));

  return {
    brands,
    newLaunches,
    upcoming,
    popular,
  };
}
