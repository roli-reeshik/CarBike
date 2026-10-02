import * as fs from "fs";
import * as path from "path";
import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";
import * as XLSX_NS from "xlsx";

// Support both ESM and CJS interop for xlsx
const XLSX = (XLSX_NS as any).default || XLSX_NS;

const prisma = new PrismaClient();

const BASE_DIR = process.cwd();
const HONDA_CITY_DIR = path.join(
  BASE_DIR,
  "public",
  "vehicles",
  "cars",
  "honda-cars",
  "honda-city"
);
const CITY_SUBDIR = path.join(HONDA_CITY_DIR, "City");

// Helper to find a file in HONDA_CITY_DIR or HONDA_CITY_DIR/City
function resolveFilePath(filename: string): string {
  const directPath = path.join(HONDA_CITY_DIR, filename);
  if (fs.existsSync(directPath)) return directPath;
  const subPath = path.join(CITY_SUBDIR, filename);
  if (fs.existsSync(subPath)) return subPath;
  throw new Error(`File ${filename} not found in ${HONDA_CITY_DIR} or ${CITY_SUBDIR}`);
}

async function main() {
  console.log("=== Starting Honda City Seeding (prisma/seed-honda-city.ts) ===");

  // Ensure files in City subfolder are also present in parent folder
  if (fs.existsSync(CITY_SUBDIR)) {
    const files = fs.readdirSync(CITY_SUBDIR);
    for (const f of files) {
      const src = path.join(CITY_SUBDIR, f);
      const dest = path.join(HONDA_CITY_DIR, f);
      if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${f} to parent directory`);
      }
    }
  }

  // 1. Brand & Model Setup
  console.log("Setting up Brand & Vehicle...");
  const brand = await prisma.brand.upsert({
    where: { slug: "honda-cars" },
    update: {
      name: "Honda Cars",
      vehicleType: VehicleType.CAR,
    },
    create: {
      name: "Honda Cars",
      slug: "honda-cars",
      vehicleType: VehicleType.CAR,
      logoUrl: "/brands/honda.svg",
    },
  });

  // 2. Ingest Engine.xlsx (7 worksheets)
  const enginePath = resolveFilePath("Engine.xlsx");
  console.log(`Reading Engine workbook from ${enginePath}...`);
  const engineWb = XLSX.readFile(enginePath);
  const engineSpecs: Array<{
    category: string;
    headers: string[];
    specs: Array<{ parameter: string; eHev: string; iVtec: string }>;
  }> = [];

  for (const sheetName of engineWb.SheetNames) {
    const sheet = engineWb.Sheets[sheetName];
    const data: Array<Array<string | number | undefined | null>> = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });
    if (!data || data.length === 0) continue;

    const headers = (data[0] || []).map((h) => String(h || "").trim());
    const specs: Array<{ parameter: string; eHev: string; iVtec: string }> = [];

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;
      const parameter = String(row[0] || "").trim();
      if (!parameter) continue;
      const eHev = String(row[1] || "—").trim();
      const iVtec = String(row[2] || "—").trim();
      specs.push({ parameter, eHev, iVtec });
    }

    engineSpecs.push({
      category: sheetName,
      headers: headers.length ? headers : ["Parameter", "e:HEV (Self-Charging Strong Hybrid)", "i-VTEC (Petrol)"],
      specs,
    });
  }
  console.log(`Parsed ${engineSpecs.length} Engine worksheets.`);

  // 3. Ingest Features.xlsx (4 worksheets)
  const featuresPath = resolveFilePath("Features.xlsx");
  console.log(`Reading Features workbook from ${featuresPath}...`);
  const featuresWb = XLSX.readFile(featuresPath);
  const featureMatrix: Array<{
    category: string;
    trims: string[];
    features: Array<{ feature: string; trims: Record<string, string> }>;
  }> = [];

  for (const sheetName of featuresWb.SheetNames) {
    const sheet = featuresWb.Sheets[sheetName];
    const data: Array<Array<string | number | undefined | null>> = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });
    if (!data || data.length === 0) continue;

    const headers = (data[0] || []).map((h) => String(h || "").trim());
    const trimColumns = headers.slice(1); // ["SV", "V", "VX", "ZX", "ZX+"]
    const featuresList: Array<{ feature: string; trims: Record<string, string> }> = [];

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;
      const featureName = String(row[0] || "").trim();
      if (!featureName) continue;

      const trimsObj: Record<string, string> = {};
      for (let c = 0; c < trimColumns.length; c++) {
        const colName = trimColumns[c];
        const val = String(row[c + 1] || "—").trim();
        trimsObj[colName] = val;
      }
      featuresList.push({ feature: featureName, trims: trimsObj });
    }

    featureMatrix.push({
      category: sheetName,
      trims: trimColumns.length ? trimColumns : ["SV", "V", "VX", "ZX", "ZX+"],
      features: featuresList,
    });
  }
  console.log(`Parsed ${featureMatrix.length} Feature categories.`);

  // 4. Ingest Price-Ex-ShowRoom.txt & Variants
  const pricePath = resolveFilePath("Price-Ex-ShowRoom.txt");
  console.log(`Reading Prices from ${pricePath}...`);
  const priceContent = fs.readFileSync(pricePath, "utf-8");
  const priceLines = priceContent.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const parsedVariants: Array<{
    name: string;
    powertrain: string;
    transmission: string;
    exShowroomPrice: number;
    onRoadPriceEst: number;
    keyFeatures: string[];
  }> = [];

  for (const line of priceLines) {
    // Correctly handle hyphens in "i-VTEC", e.g. "i-VTEC CVT ZX+-17,43,700(Ex Showroom Delhi)"
    const match = line.match(/^(.*?)[–\-]\s*([\d,]+)\s*(?:\(|$)/);
    if (!match) continue;

    const rawName = match[1].trim();
    const rawPrice = match[2].replace(/,/g, "").trim();
    const exPrice = parseFloat(rawPrice);
    if (isNaN(exPrice)) continue;

    // Calculate on-road price (1.14 * exShowroomPrice)
    const onRoad = Math.round(1.14 * exPrice);

    let powertrain = "i-VTEC (Petrol)";
    let transmission = "Manual";

    if (rawName.startsWith("e:HEV")) {
      powertrain = "e:HEV (Strong Hybrid)";
      transmission = "e-CVT";
    } else if (rawName.includes("CVT")) {
      powertrain = "i-VTEC (Petrol)";
      transmission = "CVT";
    } else if (rawName.includes("MT")) {
      powertrain = "i-VTEC (Petrol)";
      transmission = "Manual";
    }

    // Assign verified key features
    const keyFeatures: string[] = [];
    if (rawName.includes("e:HEV")) {
      keyFeatures.push(
        "Self-Charging Strong Hybrid",
        "Honda SENSING ADAS with Low Speed Follow",
        "Electric Parking Brake with Auto Hold",
        "All 4 Disc Brakes",
        "Active Front Seat Ventilation"
      );
    } else if (rawName.includes("ZX+")) {
      keyFeatures.push(
        "360 Surround-Vision Camera",
        "Honda SENSING ADAS Suite",
        "Full LED Headlamps & Tail Lamps",
        "One-Touch Electric Sunroof",
        "LaneWatch™ Camera"
      );
    } else if (rawName.includes("ZX")) {
      keyFeatures.push(
        "Honda SENSING ADAS Suite",
        "One-Touch Electric Sunroof",
        "LaneWatch™ Blind Spot Camera",
        "Full LED Headlamps",
        "R16 Aero-Blade Diamond Cut Alloys"
      );
    } else {
      keyFeatures.push(
        "Honda SENSING ADAS Suite",
        "Multi-Angle Rear Camera",
        "Touch-Sensor Smart Keyless Access",
        "6 Airbags Standard",
        "Automatic Climate Control"
      );
    }

    parsedVariants.push({
      name: rawName,
      powertrain,
      transmission,
      exShowroomPrice: exPrice,
      onRoadPriceEst: onRoad,
      keyFeatures,
    });
  }

  // Include remaining trims so all 5 trims (SV, V, VX, ZX, ZX+) have representative variant pricing
  const standardExtraTrims = [
    {
      name: "i-VTEC MT VX",
      powertrain: "i-VTEC (Petrol)",
      transmission: "Manual",
      exShowroomPrice: 1392000,
      onRoadPriceEst: Math.round(1.14 * 1392000),
      keyFeatures: [
        "One-Touch Electric Sunroof",
        "LaneWatch™ Blind Spot Camera",
        "Honda SENSING ADAS Suite",
        "Wireless Smartphone Charger",
        "R16 Diamond Cut Alloys",
      ],
    },
    {
      name: "i-VTEC MT V",
      powertrain: "i-VTEC (Petrol)",
      transmission: "Manual",
      exShowroomPrice: 1270000,
      onRoadPriceEst: Math.round(1.14 * 1270000),
      keyFeatures: [
        "Honda SENSING ADAS Suite",
        "Touch-Sensor Smart Keyless Access",
        "Multi-Angle Rear Camera",
        "6 Airbags Standard",
        "R15 Multi-Spoke Alloys",
      ],
    },
    {
      name: "i-VTEC MT SV",
      powertrain: "i-VTEC (Petrol)",
      transmission: "Manual",
      exShowroomPrice: 1208000,
      onRoadPriceEst: Math.round(1.14 * 1208000),
      keyFeatures: [
        "6 Airbags Standard",
        "Vehicle Stability Assist (VSA)",
        "Hill Start Assist (HSA)",
        "Rear Parking Sensors",
        "Automatic Climate Control",
      ],
    },
  ];

  for (const extra of standardExtraTrims) {
    if (!parsedVariants.some((v) => v.name === extra.name)) {
      parsedVariants.push(extra);
    }
  }

  // Determine min and max prices
  const allPrices = parsedVariants.map((v) => v.exShowroomPrice);
  const priceMin = Math.min(...allPrices);
  const priceMax = Math.max(...allPrices);

  // 5. Upsert Vehicle Record
  const heroImage = "/vehicles/cars/honda-cars/honda-city/Platinum White Pearl.png";
  console.log(`Upserting Vehicle "Honda City" (price range: ₹${priceMin} - ₹${priceMax})...`);

  const vehicle = await prisma.vehicle.upsert({
    where: { slug: "honda-city" },
    update: {
      name: "Honda City",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Supreme Performance. Iconic Comfort.",
      bodyType: "Sedan",
      fuelTypes: ["Petrol", "Hybrid"],
      transmissionTypes: ["Manual", "Automatic"],
      heroImage: heroImage,
      priceMin: priceMin,
      priceMax: priceMax,
      budgetRange: "10_20",
      ncapRating: 5,
      isFeatured: true,
      launchStatus: LaunchStatus.LAUNCHED,
      engineOrBattery: "1.5L i-VTEC DOHC / 1.5L Atkinson Cycle e:HEV",
      powerBhp: "121 PS (Petrol) / 126 PS Combined (Hybrid)",
      torqueNm: "145 Nm (Petrol) / 253 Nm Motor (Hybrid)",
      mileageOrRange: "17.77 - 18.0 km/l (Petrol) / 27.26 km/l (Hybrid)",
      groundClearanceMm: 165,
      seatingCapacity: 5,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
    create: {
      name: "Honda City",
      slug: "honda-city",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Supreme Performance. Iconic Comfort.",
      bodyType: "Sedan",
      fuelTypes: ["Petrol", "Hybrid"],
      transmissionTypes: ["Manual", "Automatic"],
      heroImage: heroImage,
      priceMin: priceMin,
      priceMax: priceMax,
      budgetRange: "10_20",
      ncapRating: 5,
      isFeatured: true,
      launchStatus: LaunchStatus.LAUNCHED,
      engineOrBattery: "1.5L i-VTEC DOHC / 1.5L Atkinson Cycle e:HEV",
      powerBhp: "121 PS (Petrol) / 126 PS Combined (Hybrid)",
      torqueNm: "145 Nm (Petrol) / 253 Nm Motor (Hybrid)",
      mileageOrRange: "17.77 - 18.0 km/l (Petrol) / 27.26 km/l (Hybrid)",
      groundClearanceMm: 165,
      seatingCapacity: 5,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
  });

  // 6. Delete existing colors & variants to recreate clean verified rows
  await prisma.variant.deleteMany({ where: { vehicleId: vehicle.id } });
  await prisma.vehicleColor.deleteMany({ where: { vehicleId: vehicle.id } });

  // 7. Ingest Color Options with exact requested hex codes
  const colorsConfig = [
    { name: "Crystal Black Pearl", filename: "Crystal Black Pearl.png", hexCode: "#0D0D0D" },
    { name: "Lunar Silvar Metalic", filename: "Lunar Silvar Metalic.png", hexCode: "#C0C0C0" },
    { name: "Meteoroid Gray Metalic", filename: "Meteoroid Gray Metalic.png", hexCode: "#5A5D60" },
    { name: "Obsidian Blue Pearl", filename: "Obsidian Blue Pearl.png", hexCode: "#1B2A4A" },
    { name: "Platinum White Pearl", filename: "Platinum White Pearl.png", hexCode: "#F5F5F5" },
    { name: "Radiant Red Metalic", filename: "Radiant Red Metalic.png", hexCode: "#A81C24" },
  ];

  for (const c of colorsConfig) {
    const imageUrl = `/vehicles/cars/honda-cars/honda-city/${c.filename}`;
    await prisma.vehicleColor.create({
      data: {
        vehicleId: vehicle.id,
        name: c.name,
        hexCode: c.hexCode,
        previewUrl: imageUrl,
        imageUrl: imageUrl,
      },
    });
  }
  console.log(`Ingested ${colorsConfig.length} colors.`);

  // 8. Ingest Variant rows
  for (const v of parsedVariants) {
    await prisma.variant.create({
      data: {
        vehicleId: vehicle.id,
        name: v.name,
        powertrain: v.powertrain,
        transmission: v.transmission,
        exShowroomPrice: v.exShowroomPrice,
        onRoadPriceEst: v.onRoadPriceEst,
        seatingCapacity: 5,
        keyFeatures: v.keyFeatures,
      },
    });
  }
  console.log(`Ingested ${parsedVariants.length} variants.`);

  console.log("=== Honda City Seeding Complete! ===");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
