import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as XLSX_NS from "xlsx";

const XLSX = (XLSX_NS as any).default || XLSX_NS;
const prisma = new PrismaClient();

const VERNA_DIR_PRIMARY = path.join(
  process.cwd(),
  "public",
  "vehicles",
  "cars",
  "hyundai",
  "hyundai-verna",
  "Verna"
);

const VERNA_DIR_FALLBACK = path.join(
  process.cwd(),
  "public",
  "vehicles",
  "cars",
  "hyundai",
  "hyundai-verna"
);

function resolveFilePath(fileName: string): string {
  const p1 = path.join(VERNA_DIR_PRIMARY, fileName);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(VERNA_DIR_FALLBACK, fileName);
  if (fs.existsSync(p2)) return p2;
  throw new Error(`File not found: ${fileName} in ${VERNA_DIR_PRIMARY} or ${VERNA_DIR_FALLBACK}`);
}

async function main() {
  console.log("=== Starting Hyundai Verna Seeding (prisma/seed-hyundai-verna.ts) ===");

  // 1. Setup Brand
  console.log("Upserting Brand: Hyundai India (slug: hyundai)...");
  const brand = await prisma.brand.upsert({
    where: { slug: "hyundai" },
    update: {
      name: "Hyundai India",
      vehicleType: VehicleType.CAR,
    },
    create: {
      name: "Hyundai India",
      slug: "hyundai",
      vehicleType: VehicleType.CAR,
    },
  });

  // 2. Ingest Engine.xlsx
  const enginePath = resolveFilePath("Engine.xlsx");
  console.log(`Reading Engine workbook from ${enginePath}...`);
  const engineWb = XLSX.readFile(enginePath);

  const engineSpecs: Array<{
    category: string;
    headers: string[];
    specs: Array<Record<string, string>>;
  }> = [];

  for (const sheetName of engineWb.SheetNames) {
    const ws = engineWb.Sheets[sheetName];
    if (!ws) continue;
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!data || data.length === 0) continue;

    const headers = (data[0] || []).map((h: any) => String(h || "").trim());
    const specsList: Array<Record<string, string>> = [];

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;
      const paramName = String(row[0] || "").trim();
      if (!paramName) continue;

      const rowObj: Record<string, string> = { parameter: paramName };
      for (let c = 1; c < headers.length; c++) {
        const colHeader = headers[c] || `col_${c}`;
        rowObj[colHeader] = String(row[c] !== undefined && row[c] !== null ? row[c] : "—").trim();
      }
      specsList.push(rowObj);
    }

    engineSpecs.push({
      category: sheetName,
      headers,
      specs: specsList,
    });
  }
  console.log(`Parsed ${engineSpecs.length} Engine worksheets.`);

  // 3. Ingest Features.xlsx
  const featuresPath = resolveFilePath("Features.xlsx");
  console.log(`Reading Features workbook from ${featuresPath}...`);
  const featuresWb = XLSX.readFile(featuresPath);

  const featureMatrix: Array<{
    category: string;
    trims: string[];
    features: Array<{ feature: string; trims: Record<string, string> }>;
  }> = [];

  const defaultTrims = ["HX 2", "HX 4", "HX 6", "HX 6+", "HX 8", "HX 10"];

  for (const sheetName of featuresWb.SheetNames) {
    const ws = featuresWb.Sheets[sheetName];
    if (!ws) continue;
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!data || data.length === 0) continue;

    const headers = (data[0] || []).map((h: any) => String(h || "").trim());
    const trimColumns = headers.slice(1).length ? headers.slice(1) : defaultTrims;
    const featuresList: Array<{ feature: string; trims: Record<string, string> }> = [];

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length === 0) continue;
      const featureName = String(row[0] || "").trim();
      if (!featureName) continue;

      // Skip footer notes if encountered
      if (featureName.startsWith("S -") || featureName.startsWith("Note:") || featureName.startsWith("Disclaimer:")) {
        continue;
      }

      const trimsObj: Record<string, string> = {};
      for (let c = 0; c < trimColumns.length; c++) {
        const colName = trimColumns[c];
        const val = String(row[c + 1] !== undefined && row[c + 1] !== null ? row[c + 1] : "—").trim();
        trimsObj[colName] = val;
      }
      featuresList.push({ feature: featureName, trims: trimsObj });
    }

    featureMatrix.push({
      category: sheetName,
      trims: trimColumns,
      features: featuresList,
    });
  }
  console.log(`Parsed ${featureMatrix.length} Feature categories (${featureMatrix.reduce((acc, c) => acc + c.features.length, 0)} total features).`);

  // 4. Ingest Price-Ex-ShowRoom.xlsx
  const pricePath = resolveFilePath("Price-Ex-ShowRoom.xlsx");
  console.log(`Reading Prices from ${pricePath}...`);
  const priceWb = XLSX.readFile(pricePath);
  const summarySheet = priceWb.Sheets["All Variants Summary"] || priceWb.Sheets[priceWb.SheetNames[0]];

  const priceRows: any[][] = XLSX.utils.sheet_to_json(summarySheet, { header: 1 });
  const parsedVariants: Array<{
    name: string;
    powertrain: string;
    transmission: string;
    exShowroomPrice: number;
    onRoadPriceEst: number;
    keyFeatures: string[];
  }> = [];

  // Headers: Model, Variant Description, Powertrain, Transmission, Ex-Showroom Price (INR), Numeric Price, City / State
  for (let r = 1; r < priceRows.length; r++) {
    const row = priceRows[r];
    if (!row || row.length < 6) continue;

    const variantDesc = String(row[1] || "").trim();
    if (!variantDesc || variantDesc.startsWith("Note:")) continue;

    const powertrain = String(row[2] || "").trim();
    const rawTrans = String(row[3] || "").trim().toUpperCase();
    const transmission = rawTrans.includes("DCT") ? "Automatic (DCT)" : rawTrans.includes("IVT") ? "Automatic (IVT)" : "Manual";
    const numericPrice = Number(row[5]) || 0;
    if (numericPrice <= 0) continue;

    const onRoad = Math.round(numericPrice * 1.14);

    // Dynamic key features by trim tier
    const keyFeatures: string[] = [];
    if (variantDesc.includes("HX 10")) {
      keyFeatures.push(
        "Hyundai SmartSense Level 2 ADAS (17 Features)",
        "Surround View Monitor (360 Camera) & Blind-Spot View Monitor",
        "26.03 cm (10.25\") Multi-Display Digital Cluster & HD Nav",
        "Bose Premium 8-Speaker Audio System",
        "Front Ventilated Seats & Powered Driver Seat with Memory"
      );
    } else if (variantDesc.includes("HX 8")) {
      if (variantDesc.includes("Turbo")) {
        keyFeatures.push(
          "1.5 l Turbo GDi Petrol (160 PS / 253 Nm)",
          "Hyundai SmartSense Level 2 ADAS",
          "Black Interiors with Red Accents & Metal Pedals",
          "R16 Dark Grey Alloys & Red Front Brake Calipers",
          "Electric Parking Brake (EPB) with Auto Hold"
        );
      } else {
        keyFeatures.push(
          "Hyundai Blue Link Connected Car Suite",
          "Electric Sunroof with One-Touch Operation",
          "Bose Premium 8-Speaker Sound System",
          "Front Ventilated Seats & Smart Trunk",
          "R16 Diamond Cut Alloy Wheels"
        );
      }
    } else if (variantDesc.includes("HX 6+")) {
      keyFeatures.push(
        "Electric Sunroof with Voice Assist",
        "Leatherette Seat Upholstery",
        "Front Ventilated Seats",
        "Smartphone Wireless Charger",
        "Dual Tone Styling Package Available"
      );
    } else if (variantDesc.includes("HX 6")) {
      keyFeatures.push(
        "Smart Key with Push Button Start",
        "Rear View Camera with Dynamic Guidelines",
        "Electrochromic Inside Rear View Mirror (ECM)",
        "Ambient Lighting & Shark Fin Antenna",
        "R16 Diamond Cut Alloy Wheels"
      );
    } else if (variantDesc.includes("HX 4")) {
      keyFeatures.push(
        "8.0\" Touchscreen Infotainment with Wireless Phone Projection",
        "Digital Cluster with Color TFT MID",
        "Automatic Climate Control with Rear AC Vents",
        "Idle Stop & Go (ISG) & Cruise Control",
        "R15 Silver Alloy Wheels"
      );
    } else {
      keyFeatures.push(
        "6 Airbags Standard (Front, Side, Curtain)",
        "Electronic Stability Control (ESC) & VSM",
        "Hill-Start Assist Control (HAC)",
        "All 4 Power Windows & Dual Horn",
        "Projector Headlamps with Escort Function"
      );
    }

    parsedVariants.push({
      name: variantDesc,
      powertrain,
      transmission,
      exShowroomPrice: numericPrice,
      onRoadPriceEst: onRoad,
      keyFeatures,
    });
  }

  console.log(`Parsed ${parsedVariants.length} variants from Price-Ex-ShowRoom.xlsx.`);

  const allPrices = parsedVariants.map((v) => v.exShowroomPrice);
  const priceMin = Math.min(...allPrices);
  const priceMax = Math.max(...allPrices);

  // 5. Upsert Vehicle Record
  const heroImage = "/vehicles/cars/hyundai/hyundai-verna/Verna/Atlas White.png";
  console.log(`Upserting Vehicle "Hyundai Verna" (price range: ₹${priceMin} - ₹${priceMax})...`);

  const vehicle = await prisma.vehicle.upsert({
    where: { slug: "hyundai-verna" },
    update: {
      name: "Hyundai Verna",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Futuristic. Ferocious. Fast.",
      bodyType: "Sedan",
      fuelTypes: ["Petrol"],
      transmissionTypes: ["Manual", "Automatic"],
      heroImage: heroImage,
      priceMin: priceMin,
      priceMax: priceMax,
      budgetRange: "10_20",
      ncapRating: 5,
      isFeatured: true,
      launchStatus: LaunchStatus.LAUNCHED,
      engineOrBattery: "1.5L MPi Petrol (115 PS) / 1.5L Turbo GDi Petrol (160 PS)",
      powerBhp: "115 PS (MPi) / 160 PS (Turbo GDi)",
      torqueNm: "143.8 Nm (MPi) / 253 Nm (Turbo GDi)",
      mileageOrRange: "18.60 km/l (MPi) / 20.00 km/l (Turbo GDi)",
      groundClearanceMm: 165,
      seatingCapacity: 5,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
    create: {
      name: "Hyundai Verna",
      slug: "hyundai-verna",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Futuristic. Ferocious. Fast.",
      bodyType: "Sedan",
      fuelTypes: ["Petrol"],
      transmissionTypes: ["Manual", "Automatic"],
      heroImage: heroImage,
      priceMin: priceMin,
      priceMax: priceMax,
      budgetRange: "10_20",
      ncapRating: 5,
      isFeatured: true,
      launchStatus: LaunchStatus.LAUNCHED,
      engineOrBattery: "1.5L MPi Petrol (115 PS) / 1.5L Turbo GDi Petrol (160 PS)",
      powerBhp: "115 PS (MPi) / 160 PS (Turbo GDi)",
      torqueNm: "143.8 Nm (MPi) / 253 Nm (Turbo GDi)",
      mileageOrRange: "18.60 km/l (MPi) / 20.00 km/l (Turbo GDi)",
      groundClearanceMm: 165,
      seatingCapacity: 5,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
  });

  // 6. Delete old variants & colors for a clean re-sync
  await prisma.variant.deleteMany({ where: { vehicleId: vehicle.id } });
  await prisma.vehicleColor.deleteMany({ where: { vehicleId: vehicle.id } });

  // 7. Seed Colors
  const colorDefinitions = [
    {
      name: "Atlas White",
      hexCode: "#F8FAFC",
      fileName: "Atlas White.png",
    },
    {
      name: "Atlas White with Black Roof",
      hexCode: "#E2E8F0",
      fileName: "Atlas White with Black Roof.png",
    },
    {
      name: "Classy Blue",
      hexCode: "#1E3A8A",
      fileName: "Classy Blue.png",
    },
    {
      name: "Titan Grey",
      hexCode: "#64748B",
      fileName: "Titan Grey.png",
    },
    {
      name: "Titanium Black",
      hexCode: "#111827",
      fileName: "Titanium Black.png",
    },
  ];

  for (const c of colorDefinitions) {
    const webPath = `/vehicles/cars/hyundai/hyundai-verna/Verna/${c.fileName}`;
    await prisma.vehicleColor.create({
      data: {
        vehicleId: vehicle.id,
        name: c.name,
        hexCode: c.hexCode,
        imageUrl: webPath,
        previewUrl: webPath,
      },
    });
  }
  console.log(`Ingested ${colorDefinitions.length} colors.`);

  // 8. Seed Variants
  for (const v of parsedVariants) {
    await prisma.variant.create({
      data: {
        vehicleId: vehicle.id,
        name: v.name,
        powertrain: v.powertrain,
        transmission: v.transmission,
        exShowroomPrice: v.exShowroomPrice,
        onRoadPriceEst: v.onRoadPriceEst,
        keyFeatures: v.keyFeatures,
        seatingCapacity: 5,
      },
    });
  }
  console.log(`Ingested ${parsedVariants.length} variants.`);

  console.log("=== Hyundai Verna Seeding Complete! ===");
}

main()
  .catch((e) => {
    console.error("Error during Hyundai Verna seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
