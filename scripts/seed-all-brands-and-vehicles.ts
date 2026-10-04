import fs from "fs";
import path from "path";
import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";

const db = new PrismaClient();

function normalizePrice(val: number | string | undefined | null): number {
  if (val == null) return 0;
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return 0;
  // If price is in Lakhs (e.g. 8.15), convert to INR (815000)
  if (num > 0 && num < 1000) {
    return Math.round(num * 100000);
  }
  return Math.round(num);
}

function computeBudgetRange(category: VehicleType, priceMin: number): string {
  if (category === VehicleType.CAR) {
    if (priceMin < 800000) return "under_8";
    if (priceMin <= 1500000) return "8_15";
    if (priceMin <= 2500000) return "15_25";
    return "25_plus";
  } else {
    if (priceMin < 150000) return "under_1.5";
    if (priceMin <= 250000) return "1.5_2.5";
    return "2.5_plus";
  }
}

async function main() {
  console.log("=== Seeding All Brands and Vehicles for Complete Multi-Spec Filtering ===");

  // 1. Ensure all official brands exist with verified logos
  const carBrands = [
    { name: "Honda Cars", slug: "honda-cars", logoUrl: "/vehicles/cars/Brand%20Logos/honda.png" },
    { name: "Hyundai India", slug: "hyundai", logoUrl: "/vehicles/cars/Brand%20Logos/hyundai.png" },
    { name: "Jeep", slug: "jeep", logoUrl: "/vehicles/cars/Brand%20Logos/jeep.png" },
    { name: "Kia", slug: "kia", logoUrl: "/vehicles/cars/Brand%20Logos/kia.png" },
    { name: "Mahindra", slug: "mahindra", logoUrl: "/vehicles/cars/Brand%20Logos/mahindra.png" },
    { name: "Maruti Suzuki", slug: "maruti-suzuki", logoUrl: "/vehicles/cars/Brand%20Logos/maruti.png" },
    { name: "MG Motor", slug: "mg", logoUrl: "/vehicles/cars/Brand%20Logos/mg.png" },
    { name: "Nissan", slug: "nissan", logoUrl: "/vehicles/cars/Brand%20Logos/nissan.png" },
    { name: "Renault", slug: "renault", logoUrl: "/vehicles/cars/Brand%20Logos/renault.png" },
    { name: "Škoda", slug: "skoda", logoUrl: "/vehicles/cars/Brand%20Logos/skoda.png" },
    { name: "Tata Motors", slug: "tata", logoUrl: "/vehicles/cars/Brand%20Logos/tata.png" },
    { name: "Toyota", slug: "toyota", logoUrl: "/vehicles/cars/Brand%20Logos/toyota.png" },
    { name: "Volkswagen", slug: "volkswagen", logoUrl: "/vehicles/cars/Brand%20Logos/volkswagen.png" },
  ];

  const bikeBrands = [
    { name: "Bajaj Auto", slug: "bajaj", logoUrl: "/vehicles/bikes/Brand%20Logos/bajaj.png" },
    { name: "Hero MotoCorp", slug: "hero", logoUrl: "/vehicles/bikes/Brand%20Logos/hero.png" },
    { name: "Honda 2Wheelers", slug: "honda-2wheelers", logoUrl: "/vehicles/bikes/Brand%20Logos/honda.png" },
    { name: "Jawa Yezdi", slug: "jawa-yezdi", logoUrl: "/vehicles/bikes/Brand%20Logos/jawa.png" },
    { name: "Kawasaki", slug: "kawasaki", logoUrl: "/vehicles/bikes/Brand%20Logos/kawasaki.png" },
    { name: "KTM India", slug: "ktm", logoUrl: "/vehicles/bikes/Brand%20Logos/ktm.png" },
    { name: "Royal Enfield", slug: "royal-enfield", logoUrl: "/vehicles/bikes/Brand%20Logos/royal-enfield.png" },
    { name: "Suzuki Motorcycle", slug: "suzuki-2wheelers", logoUrl: "/vehicles/bikes/Brand%20Logos/suzuki.png" },
    { name: "TVS Motor", slug: "tvs", logoUrl: "/vehicles/bikes/Brand%20Logos/tvs.png" },
    { name: "Yamaha Motor", slug: "yamaha", logoUrl: "/vehicles/bikes/Brand%20Logos/yamaha.png" },
  ];

  const brandIdMap: Record<string, string> = {};

  for (const b of carBrands) {
    const brand = await db.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logoUrl: b.logoUrl, vehicleType: VehicleType.CAR },
      create: { name: b.name, slug: b.slug, logoUrl: b.logoUrl, vehicleType: VehicleType.CAR },
    });
    brandIdMap[b.slug] = brand.id;
    brandIdMap[b.name.toLowerCase()] = brand.id;
  }

  for (const b of bikeBrands) {
    const brand = await db.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logoUrl: b.logoUrl, vehicleType: VehicleType.BIKE },
      create: { name: b.name, slug: b.slug, logoUrl: b.logoUrl, vehicleType: VehicleType.BIKE },
    });
    brandIdMap[b.slug] = brand.id;
    brandIdMap[b.name.toLowerCase()] = brand.id;
  }

  console.log(`✓ Upserted ${carBrands.length} car brands and ${bikeBrands.length} bike brands.`);

  // 2. Read scraped seed data
  const scrapedDataPath = path.join(process.cwd(), "prisma", "scraped_seed_data.json");
  const scrapedItems = JSON.parse(fs.readFileSync(scrapedDataPath, "utf-8"));
  console.log(`Loaded ${scrapedItems.length} vehicles from scraped_seed_data.json`);

  // Brand slug aliases to match DB brands
  const brandSlugAlias: Record<string, string> = {
    "tata": "tata",
    "tata-motors": "tata",
    "maruti": "maruti-suzuki",
    "maruti-suzuki": "maruti-suzuki",
    "mahindra": "mahindra",
    "mahindra-auto": "mahindra",
    "hyundai": "hyundai",
    "hyundai-india": "hyundai",
    "toyota": "toyota",
    "toyota-india": "toyota",
    "kia": "kia",
    "kia-india": "kia",
    "mg": "mg",
    "mg-motor": "mg",
    "skoda": "skoda",
    "skoda-india": "skoda",
    "honda-cars": "honda-cars",
    "volkswagen": "volkswagen",
    "volkswagen-india": "volkswagen",
    "bajaj": "bajaj",
    "hero": "hero",
    "honda-2wheelers": "honda-2wheelers",
    "ktm": "ktm",
    "royal-enfield": "royal-enfield",
    "suzuki-2wheelers": "suzuki-2wheelers",
    "tvs": "tvs",
    "yamaha": "yamaha",
  };

  for (const item of scrapedItems) {
    if (!item.vehicle || !item.brand) continue;

    const rawBrandSlug = (item.brand.slug || "").toLowerCase();
    const resolvedBrandSlug = brandSlugAlias[rawBrandSlug] || rawBrandSlug;
    const brandId = brandIdMap[resolvedBrandSlug] || brandIdMap[item.brand.name?.toLowerCase()];

    if (!brandId) {
      console.warn(`[WARN] No brandId found for: ${item.brand.name} (${rawBrandSlug})`);
      continue;
    }

    const v = item.vehicle;
    const slug = v.slug;
    const category = v.category === "CAR" || item.brand.vehicleType === "CAR" ? VehicleType.CAR : VehicleType.BIKE;

    // Determine launch status
    let launchStatus: LaunchStatus = LaunchStatus.LAUNCHED;
    if (slug === "skoda-slavia" || slug === "hyundai-creta" || slug === "hyundai-verna" || slug === "toyota-camry") {
      launchStatus = LaunchStatus.POPULAR;
    } else if (slug === "honda-elevate" || slug === "honda-city") {
      launchStatus = LaunchStatus.NEW_LAUNCH;
    } else if (slug === "skoda-kylaq") {
      launchStatus = LaunchStatus.UPCOMING;
    } else if (v.launchStatus && Object.values(LaunchStatus).includes(v.launchStatus as LaunchStatus)) {
      launchStatus = v.launchStatus as LaunchStatus;
    }

    // Determine seating capacity
    let seatingCapacity = v.seatingCapacity ?? (category === VehicleType.CAR ? 5 : null);
    const bodyLower = (v.bodyType || "").toLowerCase();
    if (bodyLower.includes("ertiga") || bodyLower.includes("innova") || bodyLower.includes("fortuner") ||
        bodyLower.includes("scorpio") || bodyLower.includes("xuv700") || bodyLower.includes("safari") ||
        slug.includes("ertiga") || slug.includes("innova") || slug.includes("fortuner") ||
        slug.includes("scorpio-n") || slug.includes("xuv700")) {
      seatingCapacity = 7;
    }

    // Determine fuel types
    let fuelTypes = v.fuelTypes || ["Petrol"];
    if (slug.includes("ertiga") || slug.includes("dzire") || slug.includes("swift") || slug.includes("brezza") || slug.includes("punch")) {
      if (!fuelTypes.includes("CNG")) fuelTypes = [...fuelTypes, "CNG"];
    }
    if (slug.includes("innova-hycross") || slug.includes("hyryder") || slug.includes("city")) {
      if (!fuelTypes.includes("Hybrid")) fuelTypes = [...fuelTypes, "Hybrid"];
    }
    if (slug.includes("windsor-ev") || slug.includes("curvv-ev") || slug.includes("nexon-ev")) {
      fuelTypes = ["Electric"];
    }

    // Determine transmission types
    let transmissionTypes = v.transmissionTypes || ["Manual", "Automatic"];
    if (slug.includes("innova-hycross") || slug.includes("windsor-ev")) {
      transmissionTypes = ["Automatic"];
    }

    const priceMin = normalizePrice(v.priceMin);
    const priceMax = normalizePrice(v.priceMax);
    const budgetRange = computeBudgetRange(category, priceMin);

    // Skip if vehicle already has high fidelity data like Slavia / Creta / Verna / Kylaq with 10+ variants
    const existing = await db.vehicle.findUnique({
      where: { slug },
      include: { variants: true, colors: true },
    });

    if (existing && existing.variants.length > 5) {
      // Just update scalar fields to keep variants intact
      await db.vehicle.update({
        where: { slug },
        data: {
          brandId,
          launchStatus,
          seatingCapacity,
          fuelTypes,
          transmissionTypes,
          priceMin: existing.priceMin || priceMin,
          priceMax: existing.priceMax || priceMax,
          budgetRange: existing.budgetRange || budgetRange,
        },
      });
      console.log(`[UPDATE] Preserved rich variants for ${v.name} (${slug})`);
      continue;
    }

    const variantCreates = (v.variants || []).map((vt: any) => ({
      name: vt.name,
      exShowroomPrice: normalizePrice(vt.exShowroomPrice),
      onRoadPriceEst: normalizePrice(vt.onRoadPriceEst),
      transmission: vt.transmission || "Manual",
      keyFeatures: vt.keyFeatures || [],
      seatingCapacity: vt.seatingCapacity ?? seatingCapacity,
    }));

    // If variants array was empty, generate base and top variants
    if (variantCreates.length === 0) {
      variantCreates.push(
        {
          name: `${v.name} Base MT`,
          exShowroomPrice: priceMin,
          onRoadPriceEst: Math.round(priceMin * 1.14),
          transmission: "Manual",
          keyFeatures: ["Front Power Windows", "Dual Airbags", "ABS with EBD"],
          seatingCapacity,
        },
        {
          name: `${v.name} Top AT`,
          exShowroomPrice: priceMax,
          onRoadPriceEst: Math.round(priceMax * 1.15),
          transmission: "Automatic",
          keyFeatures: ["Touchscreen Infotainment", "Alloy Wheels", "Sunroof", "Connected Car"],
          seatingCapacity,
        }
      );
    }

    const colorCreates = (v.colors || []).map((c: any) => ({
      name: (c.name || "Default Color").replace(/[\n\r]+/g, " ").slice(0, 40).trim(),
      hexCode: c.hexCode || "#1e293b",
      previewUrl: c.previewUrl || v.heroImage || "/vehicles/cars/Brand%20Logos/skoda.png",
    }));

    await db.vehicle.upsert({
      where: { slug },
      create: {
        brandId,
        name: v.name,
        slug,
        category,
        tagline: v.tagline || null,
        bodyType: v.bodyType || (category === VehicleType.CAR ? "SUV" : "Commuter"),
        fuelTypes,
        transmissionTypes,
        heroImage: v.heroImage || `/vehicles/cars/${resolvedBrandSlug}/${slug}/hero.png`,
        priceMin,
        priceMax,
        budgetRange,
        launchStatus,
        engineOrBattery: v.engineOrBattery || "Standard Engine",
        powerBhp: v.powerBhp || "N/A",
        torqueNm: v.torqueNm || "N/A",
        mileageOrRange: v.mileageOrRange || "N/A",
        groundClearanceMm: v.groundClearanceMm ?? null,
        seatingCapacity,
        bikeStyle: v.bikeStyle ?? null,
        variants: { create: variantCreates },
        colors: { create: colorCreates },
      },
      update: {
        brandId,
        name: v.name,
        category,
        tagline: v.tagline || null,
        bodyType: v.bodyType || (category === VehicleType.CAR ? "SUV" : "Commuter"),
        fuelTypes,
        transmissionTypes,
        heroImage: v.heroImage || `/vehicles/cars/${resolvedBrandSlug}/${slug}/hero.png`,
        priceMin,
        priceMax,
        budgetRange,
        launchStatus,
        seatingCapacity,
        variants: {
          deleteMany: {},
          create: variantCreates,
        },
      },
    });

    console.log(`[UPSERT] ${v.name} (${slug}) -> ${category} | ${v.bodyType} | Seats: ${seatingCapacity} | Min: ₹${priceMin}`);
  }

  // 3. Ensure Upcoming EVs are preserved
  const upcomingEVs = [
    { slug: "skoda-kylaq", status: LaunchStatus.UPCOMING },
    { slug: "maruti-suzuki-e-vitara", status: LaunchStatus.UPCOMING },
    { slug: "mahindra-be-6e", status: LaunchStatus.UPCOMING },
    { slug: "tata-sierra-ev", status: LaunchStatus.UPCOMING },
    { slug: "hyundai-creta-ev", status: LaunchStatus.UPCOMING },
  ];

  for (const u of upcomingEVs) {
    await db.vehicle.updateMany({
      where: { slug: u.slug },
      data: { launchStatus: u.status },
    });
  }

  // 4. Ensure Slavia is POPULAR
  await db.vehicle.update({
    where: { slug: "skoda-slavia" },
    data: { launchStatus: LaunchStatus.POPULAR },
  });

  const totalVehicles = await db.vehicle.count();
  const totalBrands = await db.brand.count();
  console.log(`\n=== Seeding Finished! Total Brands: ${totalBrands}, Total Vehicles: ${totalVehicles} ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
