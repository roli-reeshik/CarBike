import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";

const prisma = new PrismaClient();

const BRAND_LOGOS = [
  { name: "Honda Cars", slug: "honda-cars", logoUrl: "/vehicles/cars/Brand Logos/honda.png" },
  { name: "Hyundai India", slug: "hyundai", logoUrl: "/vehicles/cars/Brand Logos/hyundai.png" },
  { name: "Škoda Auto India", slug: "skoda", logoUrl: "/vehicles/cars/Brand Logos/skoda.png" },
  { name: "Toyota India", slug: "toyota", logoUrl: "/vehicles/cars/Brand Logos/toyota.png" },
  { name: "Kia India", slug: "kia", logoUrl: "/vehicles/cars/Brand Logos/kia.png" },
  { name: "Maruti Suzuki", slug: "maruti", logoUrl: "/vehicles/cars/Brand Logos/maruti-suzuki.png" },
  { name: "Tata Motors", slug: "tata", logoUrl: "/vehicles/cars/Brand Logos/tata.png" },
  { name: "Mahindra Auto", slug: "mahindra", logoUrl: "/vehicles/cars/Brand Logos/mahindra.png" },
  { name: "MG Motor", slug: "mg", logoUrl: "/vehicles/cars/Brand Logos/mg.png" },
  { name: "Volkswagen India", slug: "volkswagen", logoUrl: "/vehicles/cars/Brand Logos/volkswagen.png" },
  { name: "Nissan India", slug: "nissan", logoUrl: "/vehicles/cars/Brand Logos/nissan.png" },
  { name: "Renault India", slug: "renault", logoUrl: "/vehicles/cars/Brand Logos/renault.png" },
  { name: "Jeep India", slug: "jeep", logoUrl: "/vehicles/cars/Brand Logos/jeep.png" },
  { name: "Citroën India", slug: "citroen", logoUrl: "/vehicles/cars/Brand Logos/citroen.png" },
  { name: "Force Motors", slug: "force", logoUrl: "/vehicles/cars/Brand Logos/force.png" },
  { name: "Isuzu India", slug: "isuzu", logoUrl: "/vehicles/cars/Brand Logos/isuzu.png" },
  { name: "BMW India", slug: "bmw", logoUrl: "/vehicles/cars/Brand Logos/bmw.png" },
  { name: "Audi India", slug: "audi", logoUrl: "/vehicles/cars/Brand Logos/audi.png" },
  { name: "Mercedes-Benz India", slug: "mercedes-benz", logoUrl: "/vehicles/cars/Brand Logos/mercedes-benz.png" },
];

const NEW_LAUNCH_SLUGS = [
  "skoda-slavia",
  "honda-city",
  "hyundai-verna",
  "tata-curvv",
  "mg-windsor-ev",
  "maruti-dzire",
  "hyundai-creta",
];

const POPULAR_SLUGS = [
  "mahindra-xuv700",
  "mahindra-thar",
  "tata-nexon",
  "tata-punch",
  "toyota-fortuner",
  "toyota-innova-hycross",
  "kia-seltos",
  "maruti-brezza",
  "maruti-swift",
  "volkswagen-virtus",
];

const UPCOMING_VEHICLES = [
  {
    slug: "skoda-kylaq",
    name: "Škoda Kylaq",
    brandSlug: "skoda",
    category: VehicleType.CAR,
    bodyType: "Compact SUV",
    tagline: "Sub-4m German engineering with 1.0L TSI power and 5-Star Safety.",
    fuelTypes: ["Petrol"],
    transmissionTypes: ["Manual", "Automatic"],
    heroImage: "/vehicles/cars/skoda/skoda-slavia/Candy White.png",
    priceMin: 789000,
    priceMax: 1425000,
    budgetRange: "under_8",
    ncapRating: 5,
    isFeatured: true,
    launchStatus: LaunchStatus.UPCOMING,
    expectedLaunchDate: "Q4 2026",
    isDateConfirmed: true,
    expectedPriceMinLakh: 7.89,
    expectedPriceMaxLakh: 14.25,
    preBookingAmount: "₹ 11,000",
    engineOrBattery: "1.0L TSI Turbo-Petrol (115 PS)",
    powerBhp: "115 bhp",
    torqueNm: "178 Nm",
    mileageOrRange: "19.5 kmpl expected",
  },
  {
    slug: "hyundai-creta-ev",
    name: "Hyundai Creta EV",
    brandSlug: "hyundai",
    category: VehicleType.CAR,
    bodyType: "Electric SUV",
    tagline: "India's beloved SUV in a pure-electric guise with 450+ km range.",
    fuelTypes: ["EV"],
    transmissionTypes: ["Automatic"],
    heroImage: "/vehicles/cars/hyundai/hyundai-creta/hero.png",
    priceMin: 1850000,
    priceMax: 2450000,
    budgetRange: "15_25",
    ncapRating: 5,
    isFeatured: true,
    launchStatus: LaunchStatus.UPCOMING,
    expectedLaunchDate: "Q1 2027",
    isDateConfirmed: true,
    expectedPriceMinLakh: 18.5,
    expectedPriceMaxLakh: 24.5,
    preBookingAmount: "₹ 25,000",
    engineOrBattery: "45 kWh Lithium-Ion Battery Pack",
    powerBhp: "138 bhp",
    torqueNm: "255 Nm",
    mileageOrRange: "450 km per charge",
  },
  {
    slug: "tata-sierra-ev",
    name: "Tata Sierra EV",
    brandSlug: "tata",
    category: VehicleType.CAR,
    bodyType: "SUV",
    tagline: "The legendary Sierra reborn with lounge rear seating and Acti.ev DNA.",
    fuelTypes: ["EV"],
    transmissionTypes: ["Automatic"],
    heroImage: "/vehicles/cars/tata/tata-harrier/hero.png",
    priceMin: 2100000,
    priceMax: 2800000,
    budgetRange: "15_25",
    ncapRating: 5,
    isFeatured: true,
    launchStatus: LaunchStatus.UPCOMING,
    expectedLaunchDate: "Mid 2027",
    isDateConfirmed: false,
    expectedPriceMinLakh: 21.0,
    expectedPriceMaxLakh: 28.0,
    preBookingAmount: "₹ 21,000",
    engineOrBattery: "Dual-Motor AWD Electric Architecture",
    powerBhp: "204 bhp",
    torqueNm: "310 Nm",
    mileageOrRange: "500 km per charge",
  },
  {
    slug: "honda-elevate-ev",
    name: "Honda Elevate EV",
    brandSlug: "honda-cars",
    category: VehicleType.CAR,
    bodyType: "Electric SUV",
    tagline: "Honda's first mass-market electric SUV for India with Honda SENSING.",
    fuelTypes: ["EV"],
    transmissionTypes: ["Automatic"],
    heroImage: "/vehicles/cars/honda-cars/honda-elevate/hero.jpg",
    priceMin: 1650000,
    priceMax: 2200000,
    budgetRange: "15_25",
    ncapRating: 5,
    isFeatured: true,
    launchStatus: LaunchStatus.UPCOMING,
    expectedLaunchDate: "Late 2027",
    isDateConfirmed: false,
    expectedPriceMinLakh: 16.5,
    expectedPriceMaxLakh: 22.0,
    preBookingAmount: "₹ 21,000",
    engineOrBattery: "50 kWh Battery Pack with liquid cooling",
    powerBhp: "140 bhp",
    torqueNm: "260 Nm",
    mileageOrRange: "420 km per charge",
  },
  {
    slug: "mahindra-xev-9e",
    name: "Mahindra XEV 9e",
    brandSlug: "mahindra",
    category: VehicleType.CAR,
    bodyType: "Coupe SUV",
    tagline: "Futuristic INGLO-platform luxury electric coupe with triple panoramic screens.",
    fuelTypes: ["EV"],
    transmissionTypes: ["Automatic"],
    heroImage: "/vehicles/cars/mahindra/mahindra-xuv700/hero.png",
    priceMin: 2250000,
    priceMax: 3000000,
    budgetRange: "25_plus",
    ncapRating: 5,
    isFeatured: true,
    launchStatus: LaunchStatus.UPCOMING,
    expectedLaunchDate: "Late 2026",
    isDateConfirmed: true,
    expectedPriceMinLakh: 22.5,
    expectedPriceMaxLakh: 30.0,
    preBookingAmount: "₹ 25,000",
    engineOrBattery: "79 kWh LFP Blade Battery with 175 kW DC Fast Charge",
    powerBhp: "286 bhp",
    torqueNm: "380 Nm",
    mileageOrRange: "550 km WLTP",
  },
];

async function main() {
  console.log("Seeding and updating Brand Logos in database...");
  for (const b of BRAND_LOGOS) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {
        logoUrl: b.logoUrl,
        name: b.name,
      },
      create: {
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        vehicleType: VehicleType.CAR,
      },
    });
    console.log(`Updated brand ${brand.name} -> logo: ${brand.logoUrl}`);
  }

  console.log("\nUpdating launchStatus for NEW_LAUNCH cars...");
  for (const slug of NEW_LAUNCH_SLUGS) {
    await prisma.vehicle.updateMany({
      where: { slug },
      data: {
        launchStatus: LaunchStatus.NEW_LAUNCH,
        isFeatured: true,
      },
    });
    console.log(`Marked ${slug} as NEW_LAUNCH`);
  }

  console.log("\nUpdating launchStatus for POPULAR cars...");
  for (const slug of POPULAR_SLUGS) {
    await prisma.vehicle.updateMany({
      where: { slug },
      data: {
        launchStatus: LaunchStatus.POPULAR,
      },
    });
    console.log(`Marked ${slug} as POPULAR`);
  }

  console.log("\nUpserting UPCOMING cars...");
  for (const v of UPCOMING_VEHICLES) {
    const brand = await prisma.brand.findUnique({
      where: { slug: v.brandSlug },
    });
    if (!brand) continue;

    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: {
        name: v.name,
        tagline: v.tagline,
        bodyType: v.bodyType,
        fuelTypes: v.fuelTypes,
        transmissionTypes: v.transmissionTypes,
        heroImage: v.heroImage,
        priceMin: v.priceMin,
        priceMax: v.priceMax,
        budgetRange: v.budgetRange,
        ncapRating: v.ncapRating,
        isFeatured: v.isFeatured,
        launchStatus: v.launchStatus,
        expectedLaunchDate: v.expectedLaunchDate,
        isDateConfirmed: v.isDateConfirmed,
        expectedPriceMinLakh: v.expectedPriceMinLakh,
        expectedPriceMaxLakh: v.expectedPriceMaxLakh,
        preBookingAmount: v.preBookingAmount,
        engineOrBattery: v.engineOrBattery,
        powerBhp: v.powerBhp,
        torqueNm: v.torqueNm,
        mileageOrRange: v.mileageOrRange,
      },
      create: {
        brandId: brand.id,
        name: v.name,
        slug: v.slug,
        category: v.category,
        tagline: v.tagline,
        bodyType: v.bodyType,
        fuelTypes: v.fuelTypes,
        transmissionTypes: v.transmissionTypes,
        heroImage: v.heroImage,
        priceMin: v.priceMin,
        priceMax: v.priceMax,
        budgetRange: v.budgetRange,
        ncapRating: v.ncapRating,
        isFeatured: v.isFeatured,
        launchStatus: v.launchStatus,
        expectedLaunchDate: v.expectedLaunchDate,
        isDateConfirmed: v.isDateConfirmed,
        expectedPriceMinLakh: v.expectedPriceMinLakh,
        expectedPriceMaxLakh: v.expectedPriceMaxLakh,
        preBookingAmount: v.preBookingAmount,
        engineOrBattery: v.engineOrBattery,
        powerBhp: v.powerBhp,
        torqueNm: v.torqueNm,
        mileageOrRange: v.mileageOrRange,
      },
    });
    console.log(`Upserted upcoming car: ${v.name} (${v.expectedLaunchDate})`);
  }

  console.log("\nFinished seeding Brand Logos and Launch Statuses successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding brand logos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
