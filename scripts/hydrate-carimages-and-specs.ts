import fs from "fs";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";

const db = new PrismaClient();
const API_KEY = "ci_98cee377cdd0b4da8ed2513d4d31c6354aec589c0a337653fd49c120";
const BASE_URL = "https://carimagesapi.com";

function isLocalFileExists(filePath?: string | null): boolean {
  if (!filePath) return false;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return true;
  try {
    const decoded = decodeURIComponent(filePath.split("?")[0]);
    const normalized = decoded.startsWith("/") ? decoded.slice(1) : decoded;
    const fullPath = path.join(process.cwd(), "public", normalized);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

async function fetchCarImagesSignedUrl(
  make: string,
  model?: string,
  type: "car" | "moto" = "car"
): Promise<string | null> {
  // Clean names
  const cleanMake = make
    .replace(/[Šš]/g, "S")
    .replace(/\s+Motors|\s+India|\s+Cars|\s+2Wheelers|\s+Two\s+Wheelers/gi, "")
    .trim();

  let cleanModel = (model || "").trim();
  const makeWords = cleanMake.split(/\s+/);
  for (const w of makeWords) {
    if (w.length > 2 && cleanModel.toLowerCase().startsWith(w.toLowerCase())) {
      cleanModel = cleanModel.slice(w.length).trim();
    }
  }
  cleanModel = cleanModel
    .replace(/\s+(SUV|EV|Classic|OG|Car|Motorcycle|Bike|Standard)$/i, "")
    .trim();

  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      make: cleanMake,
      type,
      width: "800",
      format: "webp",
      view: "front34",
    });
    if (cleanModel) {
      params.append("model", cleanModel);
    }

    const endpoint = `${BASE_URL}/api/v1/signed-url?${params.toString()}`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[CarImagesAPI] ${res.status} for ${cleanMake} ${cleanModel}`);
      return null;
    }
    const data = (await res.json()) as { url?: string };
    return data.url || null;
  } catch (err) {
    console.error(`[CarImagesAPI] Error fetching signed URL for ${make} ${model}:`, err);
    return null;
  }
}

async function hydrate() {
  console.log("=== Starting CarImagesAPI Hydration & Vehicle Details Enrichment ===");

  // 1. Enrich & Fix Brand Logos
  const brands = await db.brand.findMany();
  console.log(`Checking ${brands.length} brands...`);
  for (const brand of brands) {
    const needsLogoFix = !brand.logoUrl || !isLocalFileExists(brand.logoUrl);
    if (needsLogoFix) {
      const cleanMake = brand.name
        .replace(/[Šš]/g, "S")
        .replace(/\s+Motors|\s+India|\s+Cars|\s+2Wheelers/gi, "")
        .trim();
      const newLogo = `${BASE_URL}/brand-logo?make=${encodeURIComponent(cleanMake)}`;
      await db.brand.update({
        where: { id: brand.id },
        data: { logoUrl: newLogo },
      });
      console.log(`✓ Updated Brand Logo for "${brand.name}": ${newLogo}`);
    }
  }

  // 2. Enrich & Fix Vehicle Images
  const vehicles = await db.vehicle.findMany({
    include: { brand: true, variants: true, colors: true },
  });
  console.log(`Checking ${vehicles.length} vehicles...`);

  for (const v of vehicles) {
    let updatedHero = v.heroImage;

    // Special fix for Creta local image
    if (v.slug === "hyundai-creta" && v.heroImage.endsWith("hero.jpg")) {
      updatedHero = "/vehicles/cars/hyundai/hyundai-creta/hero.png";
    }

    // Check if hero image is missing on disk or is placeholder
    const isImageBroken =
      !updatedHero ||
      updatedHero.includes("placeholder.png") ||
      !isLocalFileExists(updatedHero);

    if (isImageBroken) {
      console.log(`Resolving image for "${v.name}" (${v.brand.name}) via CarImagesAPI...`);
      const type = v.category === "BIKE" ? "moto" : "car";
      const signedUrl = await fetchCarImagesSignedUrl(v.brand.name, v.name, type);
      if (signedUrl) {
        updatedHero = signedUrl;
        console.log(`✓ Got CarImagesAPI URL for "${v.name}": ${signedUrl.slice(0, 60)}...`);
      } else {
        // Fallback to brand logo or default vehicle image
        const cleanMake = v.brand.name.replace(/[Šš]/g, "S").trim();
        updatedHero = `${BASE_URL}/brand-logo?make=${encodeURIComponent(cleanMake)}`;
      }
    }

    // Update vehicle image if changed
    if (updatedHero !== v.heroImage) {
      await db.vehicle.update({
        where: { id: v.id },
        data: { heroImage: updatedHero },
      });
      console.log(`✓ Updated heroImage for "${v.name}"`);
    }

    // 3. Hydrate Variants if 0 variants exist
    if (v.variants.length === 0) {
      console.log(`Hydrating variants for "${v.name}" (${v.slug})...`);
      const minPrice = Number(v.priceMin) || 800000;
      const maxPrice = Number(v.priceMax) || 1500000;

      const variantList: Array<{
        name: string;
        powertrain: string;
        exShowroomPrice: number;
        onRoadPriceEst: number;
        transmission: string;
        seatingCapacity: number;
        keyFeatures: string[];
        powerBhp: number;
        torqueNm: number;
        mileageKmpl: number;
        engineCc?: number;
      }> = [];

      if (v.fuelTypes.includes("EV") || v.slug.includes("-ev")) {
        // EV Trims
        variantList.push(
          {
            name: `${v.name} Standard (MR)`,
            powertrain: "Electric (Permanent Magnet Motor)",
            exShowroomPrice: minPrice,
            onRoadPriceEst: Math.round(minPrice * 1.05),
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: ["10.25-inch Touchscreen", "Connected Car Tech", "Multi-Level Regenerative Braking", "Fast DC Charging Support"],
            powerBhp: 138,
            torqueNm: 255,
            mileageKmpl: 450, // Range
          },
          {
            name: `${v.name} Long Range (LR)`,
            powertrain: "Electric (Extended Range Pack)",
            exShowroomPrice: maxPrice,
            onRoadPriceEst: Math.round(maxPrice * 1.05),
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: ["Level 2 ADAS", "Panoramic Sunroof", "Ventilated Front Seats", "V2L Power Output", "360-Degree Camera"],
            powerBhp: 168,
            torqueNm: 310,
            mileageKmpl: 550, // Range
          }
        );
      } else {
        // ICE Trims
        const midPrice = Math.round(minPrice + (maxPrice - minPrice) * 0.5);
        variantList.push(
          {
            name: `${v.name} Classic MT`,
            powertrain: "1.0L Turbo / NA Petrol",
            exShowroomPrice: minPrice,
            onRoadPriceEst: Math.round(minPrice * 1.15),
            transmission: "Manual",
            seatingCapacity: 5,
            keyFeatures: ["LED DRLs", "Dual Front Airbags", "Rear Parking Sensors", "8-inch Infotainment", "ESC"],
            powerBhp: 115,
            torqueNm: 178,
            mileageKmpl: 19.8,
            engineCc: 999,
          },
          {
            name: `${v.name} Signature AT`,
            powertrain: "1.0L Turbo Petrol (6-Speed Torque Converter)",
            exShowroomPrice: midPrice,
            onRoadPriceEst: Math.round(midPrice * 1.15),
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: ["Electric Sunroof", "Wireless Apple CarPlay / Android Auto", "Cruise Control", "Rear AC Vents"],
            powerBhp: 115,
            torqueNm: 178,
            mileageKmpl: 18.4,
            engineCc: 999,
          },
          {
            name: `${v.name} Prestige Top AT`,
            powertrain: "1.5L Turbo Petrol DSG",
            exShowroomPrice: maxPrice,
            onRoadPriceEst: Math.round(maxPrice * 1.15),
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: ["6 Airbags Standard", "10-inch Touchscreen", "Ventilated Front Seats", "Digital Cockpit", "Paddle Shifters"],
            powerBhp: 150,
            torqueNm: 250,
            mileageKmpl: 17.2,
            engineCc: 1498,
          }
        );
      }

      for (const item of variantList) {
        await db.variant.create({
          data: {
            vehicleId: v.id,
            name: item.name,
            powertrain: item.powertrain,
            exShowroomPrice: new Prisma.Decimal(item.exShowroomPrice),
            onRoadPriceEst: new Prisma.Decimal(item.onRoadPriceEst),
            transmission: item.transmission,
            seatingCapacity: item.seatingCapacity,
            keyFeatures: item.keyFeatures,
            powerBhp: new Prisma.Decimal(item.powerBhp),
            torqueNm: new Prisma.Decimal(item.torqueNm),
            mileageKmpl: new Prisma.Decimal(item.mileageKmpl),
            engineCc: item.engineCc,
          },
        });
      }
      console.log(`✓ Created ${variantList.length} variants for "${v.name}"`);
    }

    // 4. Hydrate Colors if 0 colors exist
    if (v.colors.length === 0) {
      const defaultColors = [
        { name: "Polar White", hexCode: "#F8FAFC", previewUrl: "#F8FAFC" },
        { name: "Cosmic Black", hexCode: "#111827", previewUrl: "#111827" },
        { name: "Daytona Grey", hexCode: "#4B5563", previewUrl: "#4B5563" },
        { name: "Flame Red", hexCode: "#DC2626", previewUrl: "#DC2626" },
      ];
      for (const c of defaultColors) {
        await db.vehicleColor.create({
          data: {
            vehicleId: v.id,
            name: c.name,
            hexCode: c.hexCode,
            previewUrl: c.previewUrl,
          },
        });
      }
      console.log(`✓ Created ${defaultColors.length} colors for "${v.name}"`);
    }
  }

  console.log("=== Hydration Completed Successfully ===");
}

hydrate()
  .catch((e) => {
    console.error("Hydration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
