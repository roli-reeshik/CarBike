import fs from "fs";
import path from "path";
import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";

const prisma = new PrismaClient();

const BRAND_NAME_MAP: Record<string, string> = {
  // Cars
  "tata": "Tata Motors",
  "maruti": "Maruti Suzuki",
  "mahindra": "Mahindra Auto",
  "hyundai": "Hyundai India",
  "toyota": "Toyota India",
  "kia": "Kia India",
  "mg": "MG Motor",
  "skoda": "Skoda India",
  "honda-cars": "Honda Cars",
  "volkswagen": "Volkswagen India",
  // Bikes
  "bajaj": "Bajaj Auto",
  "hero": "Hero MotoCorp",
  "honda-2wheelers": "Honda 2Wheelers",
  "jawa-yezdi": "Jawa Yezdi",
  "kawasaki": "Kawasaki",
  "ktm": "KTM India",
  "royal-enfield": "Royal Enfield",
  "suzuki-2wheelers": "Suzuki Motorcycle",
  "tvs": "TVS Motor",
  "yamaha": "Yamaha Motor",
};

interface DiskModelAudit {
  category: "cars" | "bikes";
  vehicleType: VehicleType;
  brandSlug: string;
  modelSlug: string;
  dirPath: string;
  allFiles: string[];
  imageFiles: string[];
  actualHeroFilename: string | null;
  heroPath: string;
  hasDetailsJson: boolean;
  isVerified: boolean;
}

function scanDisk(publicDir: string): Map<string, DiskModelAudit> {
  const auditMap = new Map<string, DiskModelAudit>();
  const categories: Array<"cars" | "bikes"> = ["cars", "bikes"];

  for (const category of categories) {
    const categoryPath = path.join(publicDir, "vehicles", category);
    if (!fs.existsSync(categoryPath)) continue;

    const brandDirs = fs.readdirSync(categoryPath).filter((name) => {
      const full = path.join(categoryPath, name);
      return fs.statSync(full).isDirectory();
    });

    for (const brandSlug of brandDirs) {
      const brandPath = path.join(categoryPath, brandSlug);
      const modelDirs = fs.readdirSync(brandPath).filter((name) => {
        const full = path.join(brandPath, name);
        return fs.statSync(full).isDirectory();
      });

      for (const modelSlug of modelDirs) {
        const modelPath = path.join(brandPath, modelSlug);
        const allFiles = fs.readdirSync(modelPath);

        const imageFiles = allFiles.filter((f) =>
          /\.(jpg|jpeg|webp|png)$/i.test(f)
        );

        // Priority 1: hero.*
        let actualHeroFilename =
          imageFiles.find((f) => /^hero\.(jpg|jpeg|webp|png)$/i.test(f)) || null;

        // Priority 2: img_1.*
        if (!actualHeroFilename) {
          actualHeroFilename =
            imageFiles.find((f) => /^img_1\.(jpg|jpeg|webp|png)$/i.test(f)) || null;
        }

        // Priority 3: first available image file
        if (!actualHeroFilename && imageFiles.length > 0) {
          actualHeroFilename = [...imageFiles].sort()[0];
        }

        const isVerified = actualHeroFilename !== null;
        const heroPath = isVerified
          ? `/vehicles/${category}/${brandSlug}/${modelSlug}/${actualHeroFilename}`
          : `/vehicles/${category}/${brandSlug}/${modelSlug}/placeholder.png`;

        const hasDetailsJson = fs.existsSync(
          path.join(modelPath, "complete_model_details.json")
        );

        const key = `${category}/${brandSlug}/${modelSlug}`;
        auditMap.set(key, {
          category,
          vehicleType: category === "cars" ? VehicleType.CAR : VehicleType.BIKE,
          brandSlug,
          modelSlug,
          dirPath: modelPath,
          allFiles,
          imageFiles,
          actualHeroFilename,
          heroPath,
          hasDetailsJson,
          isVerified,
        });
      }
    }
  }

  return auditMap;
}

function normalizePrice(val: number | string | undefined | null): number {
  if (val == null) return 0;
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return 0;
  // If price is in Lakhs (e.g. 8.15), convert to rupees (815000)
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
  console.log("=== Step 1: Auditing Physical Disk Assets under public/vehicles/ ===");
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, "public");
  const diskMap = scanDisk(publicDir);
  console.log(`Audited ${diskMap.size} vehicle directories on disk.`);

  // Load scraped seed data
  const scrapedDataPath = path.join(projectRoot, "prisma", "scraped_seed_data.json");
  let scrapedItems: any[] = [];
  if (fs.existsSync(scrapedDataPath)) {
    scrapedItems = JSON.parse(fs.readFileSync(scrapedDataPath, "utf-8"));
    console.log(`Loaded ${scrapedItems.length} curated vehicle profiles from scraped_seed_data.json`);
  }

  console.log("\n=== Step 2: Normalizing Brands and Enforcing Folder-Matched Slugs ===");
  const brandCategories = new Map<string, { type: VehicleType; name: string }>();

  for (const item of scrapedItems) {
    const slug = item.brand.slug;
    brandCategories.set(slug, {
      type: item.brand.vehicleType === "CAR" ? VehicleType.CAR : VehicleType.BIKE,
      name: BRAND_NAME_MAP[slug] || item.brand.name,
    });
  }

  // Also include brands for models with complete_model_details.json on disk
  for (const audit of diskMap.values()) {
    if (audit.hasDetailsJson && !brandCategories.has(audit.brandSlug)) {
      const mappedName =
        BRAND_NAME_MAP[audit.brandSlug] ||
        audit.brandSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      brandCategories.set(audit.brandSlug, {
        type: audit.vehicleType,
        name: mappedName,
      });
    }
  }

  const brandIdMap = new Map<string, string>();

  for (const [brandSlug, meta] of brandCategories.entries()) {
    let brand = await prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) {
      brand = await prisma.brand.findUnique({
        where: { name: meta.name },
      });

      if (brand) {
        brand = await prisma.brand.update({
          where: { id: brand.id },
          data: { slug: brandSlug, vehicleType: meta.type },
        });
        console.log(`[BRAND] Normalized existing brand "${brand.name}" slug to "${brandSlug}"`);
      } else {
        brand = await prisma.brand.create({
          data: {
            name: meta.name,
            slug: brandSlug,
            vehicleType: meta.type,
          },
        });
        console.log(`[BRAND] Created brand "${brand.name}" with slug "${brandSlug}"`);
      }
    } else {
      brand = await prisma.brand.update({
        where: { id: brand.id },
        data: { name: meta.name, vehicleType: meta.type },
      });
    }

    brandIdMap.set(brandSlug, brand.id);
  }

  console.log("\n=== Step 3: Enforcing Strict 1:1 Vehicle & Asset Synchronization ===");
  const validVehicleSlugs = new Set<string>();

  for (const item of scrapedItems) {
    const brandSlug = item.brand.slug;
    const vehicleSlug = item.vehicle.slug;
    const categoryFolder =
      item.vehicle.category.toLowerCase() === "car" ? "cars" : "bikes";
    const diskKey = `${categoryFolder}/${brandSlug}/${vehicleSlug}`;
    const diskAudit = diskMap.get(diskKey);

    const brandId = brandIdMap.get(brandSlug);
    if (!brandId) {
      console.warn(`[WARN] Brand not found for slug: ${brandSlug}`);
      continue;
    }

    // STRICT ASSET RULE:
    // Under no circumstances should a model point to an image path containing a different brand or model slug.
    let heroImage: string;
    let isVerified = false;

    if (diskAudit && diskAudit.isVerified) {
      heroImage = diskAudit.heroPath;
      isVerified = true;
    } else {
      heroImage = `/vehicles/${categoryFolder}/${brandSlug}/${vehicleSlug}/placeholder.png`;
      isVerified = false;
    }

    const category =
      item.vehicle.category === "CAR" ? VehicleType.CAR : VehicleType.BIKE;
    const priceMin = normalizePrice(item.vehicle.priceMin);
    const priceMax = normalizePrice(item.vehicle.priceMax);
    const budgetRange =
      item.vehicle.budgetRange || computeBudgetRange(category, priceMin);

    validVehicleSlugs.add(vehicleSlug);

    const vehicleScalarData = {
      brandId,
      name: item.vehicle.name,
      slug: vehicleSlug,
      category,
      tagline: item.vehicle.tagline || null,
      bodyType: item.vehicle.bodyType || (category === VehicleType.CAR ? "SUV" : "Commuter"),
      fuelTypes: item.vehicle.fuelTypes || ["Petrol"],
      transmissionTypes: item.vehicle.transmissionTypes || ["Manual"],
      heroImage,
      priceMin,
      priceMax,
      budgetRange,
      ncapRating: item.vehicle.ncapRating ?? null,
      isFeatured: Boolean(item.vehicle.isFeatured),
      launchStatus: (item.vehicle.launchStatus as LaunchStatus) || LaunchStatus.LAUNCHED,
      expectedLaunchDate: item.vehicle.expectedLaunchDate || null,
      isDateConfirmed: Boolean(item.vehicle.isDateConfirmed),
      expectedPriceMinLakh: item.vehicle.expectedPriceMinLakh != null ? Number(item.vehicle.expectedPriceMinLakh) : null,
      expectedPriceMaxLakh: item.vehicle.expectedPriceMaxLakh != null ? Number(item.vehicle.expectedPriceMaxLakh) : null,
      preBookingAmount: item.vehicle.preBookingAmount ? String(item.vehicle.preBookingAmount) : null,
      spyShotGallery: item.vehicle.spyShotGallery || [],
      engineOrBattery: item.vehicle.engineOrBattery || "Standard Engine",
      powerBhp: item.vehicle.powerBhp || "N/A",
      torqueNm: item.vehicle.torqueNm || "N/A",
      mileageOrRange: item.vehicle.mileageOrRange || "N/A",
      groundClearanceMm: item.vehicle.groundClearanceMm ?? null,
      seatingCapacity: item.vehicle.seatingCapacity ?? null,
      bikeStyle: item.vehicle.bikeStyle ?? null,
    };

    const variantCreates = (item.vehicle.variants || []).map((v: any) => ({
      name: v.name,
      exShowroomPrice: normalizePrice(v.exShowroomPrice),
      onRoadPriceEst: normalizePrice(v.onRoadPriceEst),
      transmission: v.transmission || "Manual",
      keyFeatures: v.keyFeatures || [],
      seatingCapacity: v.seatingCapacity ?? item.vehicle.seatingCapacity ?? null,
    }));

    const colorCreates = (item.vehicle.colors || []).map((c: any) => {
      let previewUrl = c.previewUrl;
      if (!previewUrl || !previewUrl.includes(`/${brandSlug}/${vehicleSlug}/`)) {
        previewUrl = heroImage;
      }
      return {
        name: c.name || "Default Color",
        hexCode: c.hexCode || "#3b82f6",
        previewUrl,
      };
    });

    await prisma.vehicle.upsert({
      where: { slug: vehicleSlug },
      create: {
        ...vehicleScalarData,
        variants: { create: variantCreates },
        colors: { create: colorCreates },
      },
      update: {
        ...vehicleScalarData,
        variants: {
          deleteMany: {},
          create: variantCreates,
        },
        colors: {
          deleteMany: {},
          create: colorCreates,
        },
      },
    });

    console.log(
      `[VEHICLE] Upserted: ${item.vehicle.name} (${vehicleSlug}) -> ${heroImage} ${isVerified ? "✓ Verified Disk Asset" : "⚠ Placeholder"}`
    );
  }

  // Also include models with complete_model_details.json on disk not yet in scrapedItems (e.g. jawa-350, kawasaki-ninja-300)
  for (const [key, audit] of diskMap.entries()) {
    if (validVehicleSlugs.has(audit.modelSlug)) continue;
    if (!audit.hasDetailsJson) continue;

    const detailsPath = path.join(audit.dirPath, "complete_model_details.json");
    let details: any = null;
    try {
      details = JSON.parse(fs.readFileSync(detailsPath, "utf-8"));
    } catch {
      continue;
    }

    const brandId = brandIdMap.get(audit.brandSlug);
    if (!brandId) continue;

    const modelName =
      details?.model ||
      audit.modelSlug
        .split("-")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const priceMin = details?.variants?.[0]?.exShowroomPrice
      ? normalizePrice(details.variants[0].exShowroomPrice)
      : audit.vehicleType === VehicleType.CAR
      ? 1000000
      : 150000;

    const priceMax = details?.variants?.slice(-1)[0]?.exShowroomPrice
      ? normalizePrice(details.variants.slice(-1)[0].exShowroomPrice)
      : priceMin * 1.25;

    const budgetRange = computeBudgetRange(audit.vehicleType, priceMin);

    validVehicleSlugs.add(audit.modelSlug);

    const vehicleScalarData = {
      brandId,
      name: modelName,
      slug: audit.modelSlug,
      category: audit.vehicleType,
      tagline: `${modelName} with verified performance.`,
      bodyType: audit.vehicleType === VehicleType.CAR ? "SUV" : "Commuter",
      fuelTypes: ["Petrol"],
      transmissionTypes: ["Manual"],
      heroImage: audit.heroPath,
      priceMin,
      priceMax,
      budgetRange,
      launchStatus: LaunchStatus.LAUNCHED,
      engineOrBattery: "Standard Engine",
      powerBhp: "N/A",
      torqueNm: "N/A",
      mileageOrRange: "N/A",
    };

    const variantCreates = (details?.variants || []).map((v: any) => ({
      name: v.name || `${modelName} Standard`,
      exShowroomPrice: normalizePrice(v.exShowroomPrice),
      onRoadPriceEst: normalizePrice(v.onRoadPriceEst),
      transmission: v.transmission || "Manual",
      keyFeatures: v.keyFeatures || [],
    }));

    const colorCreates = (details?.colors || []).map((c: any) => ({
      name: c.name || "Standard Color",
      hexCode: c.hexCode || "#111111",
      previewUrl: c.previewUrl && c.previewUrl.includes(`/${audit.brandSlug}/${audit.modelSlug}/`)
        ? c.previewUrl
        : audit.heroPath,
    }));

    await prisma.vehicle.upsert({
      where: { slug: audit.modelSlug },
      create: {
        ...vehicleScalarData,
        variants: { create: variantCreates },
        colors: { create: colorCreates },
      },
      update: {
        ...vehicleScalarData,
        variants: { deleteMany: {}, create: variantCreates },
        colors: { deleteMany: {}, create: colorCreates },
      },
    });

    console.log(
      `[VEHICLE] Upserted from complete_model_details: ${modelName} (${audit.modelSlug}) -> ${audit.heroPath}`
    );
  }

  console.log("\n=== Step 4: Cleaning up Obsolete / Unsynchronized Records ===");
  const allVehicles = await prisma.vehicle.findMany({
    select: { id: true, slug: true, heroImage: true, name: true },
  });

  let removedCount = 0;
  for (const v of allVehicles) {
    if (!validVehicleSlugs.has(v.slug) || v.heroImage.startsWith("http")) {
      console.log(`[CLEANUP] Removing obsolete / desynchronized vehicle: "${v.name}" (${v.slug})`);
      await prisma.vehicle.delete({ where: { id: v.id } });
      removedCount++;
    }
  }

  const remainingBrands = await prisma.brand.findMany({
    include: { _count: { select: { vehicles: true } } },
  });
  for (const b of remainingBrands) {
    if (b._count.vehicles === 0) {
      console.log(`[CLEANUP] Removing empty brand "${b.name}" (${b.slug})`);
      await prisma.brand.delete({ where: { id: b.id } });
    }
  }

  console.log(`\n=== Asset Synchronization Complete! ===`);
  console.log(`Active synchronized vehicles: ${validVehicleSlugs.size}`);
  console.log(`Removed obsolete records: ${removedCount}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Asset sync failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
