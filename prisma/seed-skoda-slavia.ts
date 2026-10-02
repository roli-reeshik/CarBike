import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as XLSX_NS from "xlsx";

const XLSX = (XLSX_NS as any).default || XLSX_NS;
const prisma = new PrismaClient();

const SLAVIA_DIR = path.join(
  process.cwd(),
  "public",
  "vehicles",
  "cars",
  "skoda",
  "skoda-slavia"
);

function resolveFilePath(fileName: string): string {
  const p = path.join(SLAVIA_DIR, fileName);
  if (fs.existsSync(p)) return p;
  throw new Error(`File not found: ${fileName} in ${SLAVIA_DIR}`);
}

async function main() {
  console.log("=== Starting Škoda Slavia Seeding (prisma/seed-skoda-slavia.ts) ===");

  // Ensure brochure aliases exist
  const originalBrochure = path.join(SLAVIA_DIR, "Slavia-Brochure-2026-08-18.pdf");
  const slaviaPdf = path.join(SLAVIA_DIR, "slavia.pdf");
  const brochurePdf = path.join(SLAVIA_DIR, "brochure.pdf");
  if (fs.existsSync(originalBrochure)) {
    if (!fs.existsSync(slaviaPdf)) {
      fs.copyFileSync(originalBrochure, slaviaPdf);
      console.log("Copied slavia.pdf from original brochure.");
    }
    if (!fs.existsSync(brochurePdf)) {
      fs.copyFileSync(originalBrochure, brochurePdf);
      console.log("Copied brochure.pdf from original brochure.");
    }
  }

  // Ensure Tornado Red exists as alias of Cherry Red
  const cherryRed = path.join(SLAVIA_DIR, "Cherry Red.png");
  const tornadoRed = path.join(SLAVIA_DIR, "Tornado Red.png");
  if (fs.existsSync(cherryRed) && !fs.existsSync(tornadoRed)) {
    fs.copyFileSync(cherryRed, tornadoRed);
    console.log("Copied Tornado Red.png from Cherry Red.png.");
  }

  // 1. Setup Brand: Škoda Auto India
  console.log("Upserting Brand: Škoda Auto India (slug: skoda)...");
  const brand = await prisma.brand.upsert({
    where: { slug: "skoda" },
    update: {
      name: "Škoda Auto India",
      vehicleType: VehicleType.CAR,
    },
    create: {
      name: "Škoda Auto India",
      slug: "skoda",
      vehicleType: VehicleType.CAR,
    },
  });

  // 2. Ingest Engine.xlsx (4 worksheets)
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
        const val = String(row[c] !== undefined && row[c] !== null ? row[c] : "—").trim();
        rowObj[colHeader] = val;
        // Helpful key aliases
        if (colHeader.includes("1.0L")) {
          rowObj["tsi10"] = val;
        } else if (colHeader.includes("1.5L")) {
          rowObj["tsi15"] = val;
        }
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

  // 3. Ingest Features.xlsx (4 worksheets)
  const featuresPath = resolveFilePath("Features.xlsx");
  console.log(`Reading Features workbook from ${featuresPath}...`);
  const featuresWb = XLSX.readFile(featuresPath);

  const featureMatrix: Array<{
    category: string;
    trims: string[];
    features: Array<{ feature: string; trims: Record<string, string> }>;
  }> = [];

  const defaultTrims = ["Classic", "Signature", "Sportline", "Prestige", "Monte Carlo"];

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
  console.log(
    `Parsed ${featureMatrix.length} Feature categories (${featureMatrix.reduce(
      (acc, c) => acc + c.features.length,
      0
    )} total features).`
  );

  // 4. Ingest Price-Ex-ShowRoom.xlsx
  const pricePath = resolveFilePath("Price-Ex-ShowRoom.xlsx");
  console.log(`Reading Prices from ${pricePath}...`);
  const priceWb = XLSX.readFile(pricePath);
  const summarySheet = priceWb.Sheets["Slavia Price List"] || priceWb.Sheets[priceWb.SheetNames[0]];

  const priceRows: any[][] = XLSX.utils.sheet_to_json(summarySheet, { header: 1 });
  const parsedVariants: Array<{
    name: string;
    powertrain: string;
    transmission: string;
    exShowroomPrice: number;
    onRoadPriceEst: number;
    powerBhp: number;
    torqueNm: number;
    engineCc: number;
    mileageKmpl: number;
    keyFeatures: string[];
  }> = [];

  // Headers: Variant Name, Engine, Transmission, Ex-Showroom Price (INR), Ex-Showroom (Lakh), Est. On-Road Delhi (INR)
  for (let r = 1; r < priceRows.length; r++) {
    const row = priceRows[r];
    if (!row || row.length < 4) continue;

    const variantName = String(row[0] || "").trim();
    if (!variantName || variantName.startsWith("Note:")) continue;

    const engine = String(row[1] || "").trim();
    const rawTrans = String(row[2] || "").trim();
    const exShowroom = Number(row[3]) || 0;
    const onRoad = Number(row[5]) || Math.round(exShowroom * 1.15);

    if (exShowroom <= 0) continue;

    const is15L = variantName.includes("1.5L") || engine.includes("1.5");
    const powerBhp = is15L ? 150 : 115;
    const torqueNm = is15L ? 250 : 178;
    const engineCc = is15L ? 1498 : 999;

    let mileageKmpl = 20.32;
    if (is15L) {
      mileageKmpl = 19.36; // 7-DSG
    } else if (rawTrans.includes("AT") || rawTrans.includes("Automatic")) {
      mileageKmpl = 18.73; // 6-AT
    } else {
      mileageKmpl = 20.32; // 6-MT
    }

    // Curate key features based on trim
    const keyFeatures: string[] = [];
    if (variantName.includes("Monte Carlo")) {
      keyFeatures.push(
        "Sporty Black Radiator Grille & Gloss Black Rear Spoiler",
        "16\" Dual-Tone Monte Carlo Alloys & Red Brake Calipers",
        "Škoda 380W Sound System (8 Speakers + Subwoofer)",
        "8\" Virtual Cockpit with Sporty Red Theme",
        "Front Ventilated Seats & Powered Front Seats Adjustment",
        "10\" HD Touchscreen with Wireless Apple CarPlay & Android Auto"
      );
    } else if (variantName.includes("Prestige")) {
      keyFeatures.push(
        "Perforated Leatherette Upholstery & Dual-Tone Theme",
        "Front Ventilated Seats & Powered Driver and Co-Driver Seats",
        "Škoda 380W Sound System (8 Speakers + Subwoofer)",
        "8\" Digital Virtual Cockpit",
        "Electric Single-Pane Sunroof with Anti-Pinch",
        "16\" Diamond Cut Alloy Wheels & Full LED Headlamps"
      );
    } else if (variantName.includes("Sportline")) {
      keyFeatures.push(
        "Glossy Black Radiator Grille & Boot Lip Spoiler",
        "16\" Glossy Black Alloy Wheels & Black Beltline Moulding",
        "8\" Digital Virtual Cockpit",
        "Electric Single-Pane Sunroof with Anti-Pinch",
        "10\" HD Touchscreen with Wireless Apple CarPlay & Android Auto",
        "6 Airbags & Electronic Stability Control (ESC) Standard"
      );
    } else if (variantName.includes("Signature")) {
      keyFeatures.push(
        "10\" HD Touchscreen with Wireless Apple CarPlay & Android Auto",
        "Electric Sunroof with Anti-Pinch",
        "Rear View Camera with Guidelines & Rear Sensors",
        "Climatronic Auto AC with Rear AC Vents",
        "16\" Silver Alloy Wheels & LED Headlamps",
        "6 Airbags Standard & Hill Hold Control"
      );
    } else {
      // Classic
      keyFeatures.push(
        "6 Airbags Standard (Front, Side & Curtain)",
        "Electronic Stability Control (ESC) & Multi-Collision Braking (MKB)",
        "Electronic Differential Lock System (EDS, XDS & XDS+)",
        "7\" Touchscreen Infotainment System",
        "Rear AC Vents & Cooled Glovebox",
        "15\" Steel Wheels with Full Wheel Covers"
      );
    }

    parsedVariants.push({
      name: variantName,
      powertrain: engine,
      transmission: rawTrans,
      exShowroomPrice: exShowroom,
      onRoadPriceEst: onRoad,
      powerBhp,
      torqueNm,
      engineCc,
      mileageKmpl,
      keyFeatures,
    });
  }

  console.log(`Parsed ${parsedVariants.length} variants from Price-Ex-ShowRoom.xlsx.`);

  const allPrices = parsedVariants.map((v) => v.exShowroomPrice);
  const priceMin = Math.min(...allPrices);
  const priceMax = Math.max(...allPrices);

  // 5. Upsert Vehicle Record
  const heroImage = "/vehicles/cars/skoda/skoda-slavia/Candy White.png";
  console.log(`Upserting Vehicle "Škoda Slavia" (price range: ₹${priceMin} - ₹${priceMax})...`);

  const vehicle = await prisma.vehicle.upsert({
    where: { slug: "skoda-slavia" },
    update: {
      name: "Škoda Slavia",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Drive the Legend. European Engineering & 5-Star Safety.",
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
      engineOrBattery: "1.0L TSI Petrol (115 PS) / 1.5L TSI EVO Petrol (150 PS)",
      powerBhp: "115 PS (1.0L) / 150 PS (1.5L EVO)",
      torqueNm: "178 Nm (1.0L) / 250 Nm (1.5L EVO)",
      mileageOrRange: "20.32 kmpl (1.0 MT) / 19.36 kmpl (1.5 DSG)",
      groundClearanceMm: 179,
      seatingCapacity: 5,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
    create: {
      name: "Škoda Slavia",
      slug: "skoda-slavia",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Drive the Legend. European Engineering & 5-Star Safety.",
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
      engineOrBattery: "1.0L TSI Petrol (115 PS) / 1.5L TSI EVO Petrol (150 PS)",
      powerBhp: "115 PS (1.0L) / 150 PS (1.5L EVO)",
      torqueNm: "178 Nm (1.0L) / 250 Nm (1.5L EVO)",
      mileageOrRange: "20.32 kmpl (1.0 MT) / 19.36 kmpl (1.5 DSG)",
      groundClearanceMm: 179,
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
      name: "Candy White",
      hexCode: "#F8FAFC",
      fileName: "Candy White.png",
    },
    {
      name: "Brilliant Silver",
      hexCode: "#D1D5DB",
      fileName: "Brilliant Silver.png",
    },
    {
      name: "Carbon Steel",
      hexCode: "#4B5563",
      fileName: "Carbon Steel.png",
    },
    {
      name: "Tornado Red",
      hexCode: "#DC2626",
      fileName: "Tornado Red.png",
    },
    {
      name: "Cherry Red",
      hexCode: "#991B1B",
      fileName: "Cherry Red.png",
    },
    {
      name: "Deep Black",
      hexCode: "#0F172A",
      fileName: "Carbon Steel.png",
    },
    {
      name: "Lava Blue",
      hexCode: "#1E3A8A",
      fileName: "Candy White.png",
    },
  ];

  for (const c of colorDefinitions) {
    const webPath = `/vehicles/cars/skoda/skoda-slavia/${c.fileName}`;
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
        powerBhp: v.powerBhp,
        torqueNm: v.torqueNm,
        engineCc: v.engineCc,
        mileageKmpl: v.mileageKmpl,
        keyFeatures: v.keyFeatures,
        seatingCapacity: 5,
      },
    });
  }
  console.log(`Ingested ${parsedVariants.length} variants.`);

  console.log("=== Škoda Slavia Seeding Complete! ===");
}

main()
  .catch((e) => {
    console.error("Error seeding Škoda Slavia:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
