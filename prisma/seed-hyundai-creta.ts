import { PrismaClient, VehicleType, LaunchStatus, OutletType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const CRETA_DIR = path.join(
  process.cwd(),
  "public",
  "vehicles",
  "cars",
  "hyundai",
  "hyundai-creta"
);

function parseCretaEngine(): Array<{
  category: string;
  headers: string[];
  specs: Array<Record<string, string>>;
}> {
  const filePath = path.join(CRETA_DIR, "Creta Engine.txt");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Engine specs file not found: ${filePath}`);
  }

  const engineHeaders = [
    "Parameter",
    "1.5 l MPi Petrol",
    "1.5 l U2 CRDi Diesel",
    "1.5 l Turbo GDi Petrol",
  ];

  return [
    {
      category: "Engine & Performance",
      headers: engineHeaders,
      specs: [
        {
          parameter: "Engine Type",
          "1.5 l MPi Petrol": "1.5 l MPi (Multi Point Injection)",
          "1.5 l U2 CRDi Diesel": "1.5 l U2 CRDi (Common Rail Direct Injection)",
          "1.5 l Turbo GDi Petrol": "1.5 l Turbo GDi (Gasoline Direct Injection)",
        },
        {
          parameter: "Displacement",
          "1.5 l MPi Petrol": "1 497 cm³ (1.5L)",
          "1.5 l U2 CRDi Diesel": "1 493 cm³ (1.5L)",
          "1.5 l Turbo GDi Petrol": "1 482 cm³ (1.5L)",
        },
        {
          parameter: "Max. Power",
          "1.5 l MPi Petrol": "84.4 kW (115 PS) @ 6 300 r/min",
          "1.5 l U2 CRDi Diesel": "85 kW (116 PS) @ 4 000 r/min",
          "1.5 l Turbo GDi Petrol": "117.5 kW (160 PS) @ 5 500 r/min",
        },
        {
          parameter: "Max. Torque",
          "1.5 l MPi Petrol": "143.8 Nm (14.7 kgm) @ 4 500 r/min",
          "1.5 l U2 CRDi Diesel": "250 Nm (25.5 kgm) @ 1 500 - 2 750 r/min",
          "1.5 l Turbo GDi Petrol": "253 Nm (25.8 kgm) @ 1 500 - 3 500 r/min",
        },
        {
          parameter: "Configuration",
          "1.5 l MPi Petrol": "4 cylinders, 16 valves",
          "1.5 l U2 CRDi Diesel": "4 cylinders, 16 valves",
          "1.5 l Turbo GDi Petrol": "4 cylinders, 16 valves",
        },
        {
          parameter: "Valvetrain Type",
          "1.5 l MPi Petrol": "DOHC (Dual Overhead Camshaft)",
          "1.5 l U2 CRDi Diesel": "DOHC (Dual Overhead Camshaft)",
          "1.5 l Turbo GDi Petrol": "DOHC (Dual Overhead Camshaft)",
        },
        {
          parameter: "Fuel Type",
          "1.5 l MPi Petrol": "Petrol",
          "1.5 l U2 CRDi Diesel": "Diesel",
          "1.5 l Turbo GDi Petrol": "Petrol",
        },
        {
          parameter: "Fuel Tank Capacity",
          "1.5 l MPi Petrol": "50 L",
          "1.5 l U2 CRDi Diesel": "50 L",
          "1.5 l Turbo GDi Petrol": "50 L",
        },
        {
          parameter: "ARAI Certified Mileage",
          "1.5 l MPi Petrol": "17.4 km/l (MT) / 17.7 km/l (IVT)",
          "1.5 l U2 CRDi Diesel": "21.8 km/l (MT) / 19.1 km/l (AT)",
          "1.5 l Turbo GDi Petrol": "18.4 km/l (DCT)",
        },
      ],
    },
    {
      category: "Transmission & Drivetrain",
      headers: engineHeaders,
      specs: [
        {
          parameter: "Transmission Options",
          "1.5 l MPi Petrol": "6-speed Manual & Intelligent Variable Transmission (IVT)",
          "1.5 l U2 CRDi Diesel": "6-speed Manual & 6-speed Automatic (Torque Converter)",
          "1.5 l Turbo GDi Petrol": "7-speed Dual Clutch Transmission (DCT)",
        },
        {
          parameter: "Drive Type",
          "1.5 l MPi Petrol": "Front Wheel Drive (FWD)",
          "1.5 l U2 CRDi Diesel": "Front Wheel Drive (FWD)",
          "1.5 l Turbo GDi Petrol": "Front Wheel Drive (FWD)",
        },
        {
          parameter: "Drive Modes",
          "1.5 l MPi Petrol": "Eco, Normal, Sport (Available on IVT)",
          "1.5 l U2 CRDi Diesel": "Eco, Normal, Sport (Available on AT)",
          "1.5 l Turbo GDi Petrol": "Eco, Normal, Sport (Standard with DCT)",
        },
        {
          parameter: "Traction Modes",
          "1.5 l MPi Petrol": "Snow, Mud, Sand (Available on IVT)",
          "1.5 l U2 CRDi Diesel": "Snow, Mud, Sand (Available on AT)",
          "1.5 l Turbo GDi Petrol": "Snow, Mud, Sand (Standard with DCT)",
        },
        {
          parameter: "Paddle Shifters",
          "1.5 l MPi Petrol": "Available with IVT",
          "1.5 l U2 CRDi Diesel": "Available with 6-speed AT",
          "1.5 l Turbo GDi Petrol": "Standard with 7-speed DCT",
        },
      ],
    },
    {
      category: "Suspension, Brakes & Steering",
      headers: engineHeaders,
      specs: [
        {
          parameter: "Front Suspension",
          "1.5 l MPi Petrol": "McPherson strut with coil spring",
          "1.5 l U2 CRDi Diesel": "McPherson strut with coil spring",
          "1.5 l Turbo GDi Petrol": "McPherson strut with coil spring",
        },
        {
          parameter: "Rear Suspension",
          "1.5 l MPi Petrol": "Coupled torsion beam axle",
          "1.5 l U2 CRDi Diesel": "Coupled torsion beam axle",
          "1.5 l Turbo GDi Petrol": "Coupled torsion beam axle",
        },
        {
          parameter: "Front Brakes",
          "1.5 l MPi Petrol": "Disc",
          "1.5 l U2 CRDi Diesel": "Disc",
          "1.5 l Turbo GDi Petrol": "Disc (Red painted calipers on Knight)",
        },
        {
          parameter: "Rear Brakes",
          "1.5 l MPi Petrol": "Disc (All-wheel disc brakes standard)",
          "1.5 l U2 CRDi Diesel": "Disc (All-wheel disc brakes standard)",
          "1.5 l Turbo GDi Petrol": "Disc (All-wheel disc brakes standard)",
        },
        {
          parameter: "Steering Type",
          "1.5 l MPi Petrol": "Motor Driven Power Steering (MDPS) with Tilt & Telescopic",
          "1.5 l U2 CRDi Diesel": "Motor Driven Power Steering (MDPS) with Tilt & Telescopic",
          "1.5 l Turbo GDi Petrol": "Motor Driven Power Steering (MDPS) with Tilt & Telescopic",
        },
      ],
    },
    {
      category: "Dimensions & Capacity",
      headers: engineHeaders,
      specs: [
        {
          parameter: "Overall Length",
          "1.5 l MPi Petrol": "4 330 mm",
          "1.5 l U2 CRDi Diesel": "4 330 mm",
          "1.5 l Turbo GDi Petrol": "4 330 mm",
        },
        {
          parameter: "Overall Width",
          "1.5 l MPi Petrol": "1 790 mm",
          "1.5 l U2 CRDi Diesel": "1 790 mm",
          "1.5 l Turbo GDi Petrol": "1 790 mm",
        },
        {
          parameter: "Overall Height",
          "1.5 l MPi Petrol": "1 635 mm (with roof rails)",
          "1.5 l U2 CRDi Diesel": "1 635 mm (with roof rails)",
          "1.5 l Turbo GDi Petrol": "1 635 mm (with roof rails)",
        },
        {
          parameter: "Wheelbase",
          "1.5 l MPi Petrol": "2 610 mm",
          "1.5 l U2 CRDi Diesel": "2 610 mm",
          "1.5 l Turbo GDi Petrol": "2 610 mm",
        },
        {
          parameter: "Ground Clearance",
          "1.5 l MPi Petrol": "190 mm",
          "1.5 l U2 CRDi Diesel": "190 mm",
          "1.5 l Turbo GDi Petrol": "190 mm",
        },
        {
          parameter: "Seating Capacity",
          "1.5 l MPi Petrol": "5 Seater",
          "1.5 l U2 CRDi Diesel": "5 Seater",
          "1.5 l Turbo GDi Petrol": "5 Seater",
        },
        {
          parameter: "Boot Space",
          "1.5 l MPi Petrol": "433 Litres",
          "1.5 l U2 CRDi Diesel": "433 Litres",
          "1.5 l Turbo GDi Petrol": "433 Litres",
        },
      ],
    },
    {
      category: "Wheels & Tyres",
      headers: engineHeaders,
      specs: [
        {
          parameter: "Wheel Size Options",
          "1.5 l MPi Petrol": "205/65 R16 Steel / 215/60 R17 Alloy",
          "1.5 l U2 CRDi Diesel": "205/65 R16 Steel / 215/60 R17 Alloy",
          "1.5 l Turbo GDi Petrol": "215/55 R18 Diamond Cut / Matte Black Alloy",
        },
        {
          parameter: "Spare Wheel",
          "1.5 l MPi Petrol": "205/65 R16 Steel",
          "1.5 l U2 CRDi Diesel": "205/65 R16 Steel",
          "1.5 l Turbo GDi Petrol": "215/60 R17 Steel",
        },
      ],
    },
  ];
}

function parseCretaFeatures(): Array<{
  category: string;
  trims: string[];
  features: Array<{ feature: string; trims: Record<string, string> }>;
}> {
  const filePath = path.join(CRETA_DIR, "Hyundai CRETA Car Features.txt");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Features file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const trims = [
    "E",
    "EX",
    "EX(O)",
    "S(O)",
    "S(O) Knight",
    "SX",
    "SX Premium",
    "King",
    "King Knight",
    "Lounge Edition",
  ];

  const categories: Array<{
    category: string;
    trims: string[];
    features: Array<{ feature: string; trims: Record<string, string> }>;
  }> = [];

  let currentCategory = "Powertrain & Trim Availability";
  let currentFeatures: Array<{ feature: string; trims: Record<string, string> }> = [];
  let prefix = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      line.startsWith("New Hyundai CRETA") ||
      line.startsWith("^^") ||
      line.startsWith("*") ||
      line.startsWith("#") ||
      line.startsWith("~") ||
      line.startsWith("Disclaimer") ||
      line.startsWith("•")
    ) {
      continue;
    }

    if (line.startsWith("Engine & Trim Plan")) {
      currentCategory = "Powertrain & Trim Availability";
      prefix = "";
      continue;
    }

    if (line === "Safety") {
      if (currentFeatures.length) {
        categories.push({ category: currentCategory, trims, features: currentFeatures });
        currentFeatures = [];
      }
      currentCategory = "Safety & ADAS (Level 2)";
      prefix = "";
      continue;
    }

    if (line === "EXTERIOR") {
      if (currentFeatures.length) {
        categories.push({ category: currentCategory, trims, features: currentFeatures });
        currentFeatures = [];
      }
      currentCategory = "Exterior Styling";
      prefix = "";
      continue;
    }

    if (line === "INTERIOR") {
      continue;
    }

    if (line === "COMFORT & CONVENIENCE") {
      if (currentFeatures.length) {
        categories.push({ category: currentCategory, trims, features: currentFeatures });
        currentFeatures = [];
      }
      currentCategory = "Comfort & Convenience";
      prefix = "";
      continue;
    }

    if (line === "INFOTAINMENT AND CONNECTIVITY") {
      if (currentFeatures.length) {
        categories.push({ category: currentCategory, trims, features: currentFeatures });
        currentFeatures = [];
      }
      currentCategory = "Infotainment & Connectivity";
      prefix = "";
      continue;
    }

    if (line.startsWith("Feature\t")) {
      continue;
    }

    const parts = line.split("\t").map((p) => p.trim());
    if (parts.length < 2) continue;

    let featureName = "";
    let trimValues: string[] = [];

    if (parts.length >= 12) {
      prefix = parts[0];
      featureName = `${prefix} — ${parts[1]}`;
      trimValues = parts.slice(2, 12);
    } else if (parts.length === 11) {
      if (parts[0] === "Passenger side" && prefix) {
        featureName = `${prefix} (Passenger side)`;
      } else if (parts[0] === "Rear(x2)" && prefix) {
        featureName = `${prefix} (Rear x2)`;
      } else if (parts[0] === "Telescopic function" && prefix) {
        featureName = `${prefix} (Telescopic)`;
      } else {
        featureName = parts[0];
      }
      trimValues = parts.slice(1, 11);
    } else if (parts.length === 10) {
      featureName = parts[0];
      trimValues = parts.slice(1, 10);
      trimValues.push("-");
    }

    if (featureName && trimValues.length > 0) {
      const trimsObj: Record<string, string> = {};
      for (let t = 0; t < trims.length; t++) {
        const tName = trims[t];
        const val = trimValues[t] || "—";
        trimsObj[tName] = val === "S" ? "Standard" : val === "●" ? "Available" : val === "-" ? "—" : val;
      }
      currentFeatures.push({ feature: featureName, trims: trimsObj });
    }
  }

  if (currentFeatures.length) {
    categories.push({ category: currentCategory, trims, features: currentFeatures });
  }

  return categories;
}

async function main() {
  console.log("=== Starting Hyundai Creta Seeding (prisma/seed-hyundai-creta.ts) ===");

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

  // 2. Parse Engine Specs
  console.log("Parsing Engine specifications from Creta Engine.txt...");
  const engineSpecs = parseCretaEngine();
  console.log(`Parsed ${engineSpecs.length} Engine specification categories.`);

  // 3. Parse Car Features
  console.log("Parsing Feature Matrix from Hyundai CRETA Car Features.txt...");
  const featureMatrix = parseCretaFeatures();
  const totalFeatures = featureMatrix.reduce((acc, c) => acc + c.features.length, 0);
  console.log(`Parsed ${featureMatrix.length} Feature categories (${totalFeatures} total features).`);

  // 4. Upsert Vehicle Record
  const heroImage = "/vehicles/cars/hyundai/hyundai-creta/hero.png";
  const priceMin = 1100000.0;
  const priceMax = 2015000.0;

  console.log(`Upserting Vehicle "Hyundai Creta" (price range: ₹${priceMin} - ₹${priceMax})...`);
  const vehicle = await prisma.vehicle.upsert({
    where: { slug: "hyundai-creta" },
    update: {
      name: "Hyundai Creta",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "The Undisputed King of SUVs",
      bodyType: "SUV",
      fuelTypes: ["Petrol", "Diesel", "Turbo Petrol"],
      transmissionTypes: ["Manual", "Automatic (IVT)", "Automatic (AT)", "DCT"],
      heroImage: heroImage,
      priceMin: priceMin,
      priceMax: priceMax,
      budgetRange: "8_15",
      ncapRating: 5,
      isFeatured: true,
      launchStatus: LaunchStatus.POPULAR,
      engineOrBattery: "1.5L MPi Petrol / 1.5L CRDi Diesel / 1.5L Turbo GDi",
      powerBhp: "113 - 158 bhp",
      torqueNm: "144 - 253 Nm",
      mileageOrRange: "17.4 - 21.8 kmpl",
      seatingCapacity: 5,
      groundClearanceMm: 190,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
    create: {
      name: "Hyundai Creta",
      slug: "hyundai-creta",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "The Undisputed King of SUVs",
      bodyType: "SUV",
      fuelTypes: ["Petrol", "Diesel", "Turbo Petrol"],
      transmissionTypes: ["Manual", "Automatic (IVT)", "Automatic (AT)", "DCT"],
      heroImage: heroImage,
      priceMin: priceMin,
      priceMax: priceMax,
      budgetRange: "8_15",
      ncapRating: 5,
      isFeatured: true,
      launchStatus: LaunchStatus.POPULAR,
      engineOrBattery: "1.5L MPi Petrol / 1.5L CRDi Diesel / 1.5L Turbo GDi",
      powerBhp: "113 - 158 bhp",
      torqueNm: "144 - 253 Nm",
      mileageOrRange: "17.4 - 21.8 kmpl",
      seatingCapacity: 5,
      groundClearanceMm: 190,
      engineSpecs: engineSpecs,
      featureMatrix: featureMatrix,
    },
  });

  // 5. Clean Re-sync for Variants & Colors
  console.log("Cleaning up old variants and colors for Hyundai Creta...");
  await prisma.variant.deleteMany({ where: { vehicleId: vehicle.id } });
  await prisma.vehicleColor.deleteMany({ where: { vehicleId: vehicle.id } });

  // 6. Seed Colors
  console.log("Seeding Vehicle Colors...");
  const colorDefinitions = [
    {
      name: "Robust Emerald Pearl",
      hexCode: "#0B3B24",
      imageFileName: "Robust Emerald Pearl.png",
    },
    {
      name: "Ranger Khaki",
      hexCode: "#4B5320",
      imageFileName: "Ranger Khaki.png",
    },
    {
      name: "Abyss Black",
      hexCode: "#0A0A0A",
      imageFileName: "Abyss Black.png",
    },
    {
      name: "Atlas White",
      hexCode: "#F2F2F2",
      imageFileName: "Atlas White.png",
    },
    {
      name: "Atlas White with Abyss Black Roof",
      hexCode: "#E5E7EB",
      imageFileName: "Atlas White with Titanium Black.png",
    },
    {
      name: "Titan Grey",
      hexCode: "#58595B",
      imageFileName: "Titan Grey.png",
    },
    {
      name: "Fiery Red",
      hexCode: "#B22222",
      imageFileName: "Fiery Red.png",
    },
    {
      name: "Starry Night",
      hexCode: "#1B263B",
      imageFileName: "Starry Night.png",
    },
  ];

  for (const c of colorDefinitions) {
    const webPath = `/vehicles/cars/hyundai/hyundai-creta/${c.imageFileName}`;
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

  // 7. Seed Variants
  console.log("Seeding Variant Ladder...");
  const variantDefinitions = [
    {
      name: "Creta E 1.5 Petrol MT",
      powertrain: "1.5L MPi Petrol",
      transmission: "Manual",
      engineCc: 1497,
      powerBhp: 115,
      torqueNm: 143.8,
      mileageKmpl: 17.4,
      exShowroomPrice: 1100000.0,
      onRoadPriceEst: 1254000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "6 Airbags Standard (Front, Side & Curtain)",
        "All 4 Disc Brakes with ABS & EBD",
        "Electronic Stability Control (ESC) & Hill-Start Assist (HAC)",
        "Front & Rear Power Windows",
        "Dual Tone Interior with Fabric Seats",
      ],
    },
    {
      name: "Creta E 1.5 Diesel MT",
      powertrain: "1.5L U2 CRDi Diesel",
      transmission: "Manual",
      engineCc: 1493,
      powerBhp: 116,
      torqueNm: 250,
      mileageKmpl: 21.8,
      exShowroomPrice: 1256000.0,
      onRoadPriceEst: 1445000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "1.5 l U2 CRDi Clean Diesel (250 Nm Torque)",
        "6 Airbags Standard & Vehicle Stability Management (VSM)",
        "Tyre Pressure Monitoring System (TPMS) Highline",
        "Central Locking & Speed-Sensing Door Lock",
        "Idle Stop & Go (ISG)",
      ],
    },
    {
      name: "Creta EX 1.5 Petrol MT",
      powertrain: "1.5L MPi Petrol",
      transmission: "Manual",
      engineCc: 1497,
      powerBhp: 115,
      torqueNm: 143.8,
      mileageKmpl: 17.4,
      exShowroomPrice: 1228000.0,
      onRoadPriceEst: 1405000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "20.32 cm (8.0\") Touchscreen Infotainment",
        "Wireless Android Auto & Apple CarPlay",
        "Steering Mounted Audio & Bluetooth Controls",
        "Electrically Adjustable Outside Mirrors",
        "Shark Fin Antenna & Sunglass Holder",
      ],
    },
    {
      name: "Creta EX 1.5 Diesel MT",
      powertrain: "1.5L U2 CRDi Diesel",
      transmission: "Manual",
      engineCc: 1493,
      powerBhp: 116,
      torqueNm: 250,
      mileageKmpl: 21.8,
      exShowroomPrice: 1379000.0,
      onRoadPriceEst: 1585000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "20.32 cm (8.0\") Touchscreen Infotainment",
        "Rear AC Vents & Front/Rear USB C-Type Ports",
        "Smart Key with Push Button Start",
        "Map Lamps & Sunglass Holder",
        "R16 Steel Wheels with Full Wheel Covers",
      ],
    },
    {
      name: "Creta S(O) 1.5 Petrol MT",
      powertrain: "1.5L MPi Petrol",
      transmission: "Manual",
      engineCc: 1497,
      powerBhp: 115,
      torqueNm: 143.8,
      mileageKmpl: 17.4,
      exShowroomPrice: 1432000.0,
      onRoadPriceEst: 1645000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Smart Panoramic Sunroof",
        "Dual Zone Automatic Climate Control (DATC)",
        "R17 Black Alloy Wheels",
        "Quad Beam LED Headlamps & Horizon LED DRLs",
        "Rear Camera with Dynamic Guidelines",
      ],
    },
    {
      name: "Creta S(O) 1.5 Petrol IVT",
      powertrain: "1.5L MPi Petrol",
      transmission: "Automatic (IVT)",
      engineCc: 1497,
      powerBhp: 115,
      torqueNm: 143.8,
      mileageKmpl: 17.7,
      exShowroomPrice: 1582000.0,
      onRoadPriceEst: 1815000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Intelligent Variable Transmission (IVT)",
        "Electric Parking Brake (EPB) with Auto Hold",
        "Drive Mode Select (Eco, Normal, Sport)",
        "Traction Control Modes (Snow, Mud, Sand)",
        "Paddle Shifters & Cruise Control",
      ],
    },
    {
      name: "Creta S(O) 1.5 Diesel AT",
      powertrain: "1.5L U2 CRDi Diesel",
      transmission: "Automatic (AT)",
      engineCc: 1493,
      powerBhp: 116,
      torqueNm: 250,
      mileageKmpl: 19.1,
      exShowroomPrice: 1732000.0,
      onRoadPriceEst: 1985000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "6-Speed Torque Converter Automatic Transmission",
        "Smart Panoramic Sunroof",
        "Electric Parking Brake with Auto Hold",
        "Drive Modes & Traction Control Modes",
        "Paddle Shifters & Dual Zone AC",
      ],
    },
    {
      name: "Creta SX 1.5 Petrol MT",
      powertrain: "1.5L MPi Petrol",
      transmission: "Manual",
      engineCc: 1497,
      powerBhp: 115,
      torqueNm: 143.8,
      mileageKmpl: 17.4,
      exShowroomPrice: 1530000.0,
      onRoadPriceEst: 1755000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Voice-Enabled Smart Panoramic Sunroof",
        "26.03 cm (10.25\") HD Navigation Infotainment",
        "Hyundai Bluelink Connected Car Suite (70+ Features)",
        "Smartphone Wireless Charger",
        "R17 Diamond Cut Alloy Wheels",
      ],
    },
    {
      name: "Creta SX Tech 1.5 Petrol IVT",
      powertrain: "1.5L MPi Petrol",
      transmission: "Automatic (IVT)",
      engineCc: 1497,
      powerBhp: 115,
      torqueNm: 143.8,
      mileageKmpl: 17.7,
      exShowroomPrice: 1748000.0,
      onRoadPriceEst: 2005000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Hyundai SmartSense Level 2 ADAS (Camera-based)",
        "Forward Collision-Avoidance Assist (FCA) & LKA",
        "26.03 cm (10.25\") Multi-Display Digital Cluster",
        "Bose Premium 8-Speaker Sound System",
        "Electric Parking Brake with Auto Hold",
      ],
    },
    {
      name: "Creta SX Premium 1.5 Diesel AT",
      powertrain: "1.5L U2 CRDi Diesel",
      transmission: "Automatic (AT)",
      engineCc: 1493,
      powerBhp: 116,
      torqueNm: 250,
      mileageKmpl: 19.1,
      exShowroomPrice: 1880000.0,
      onRoadPriceEst: 2155000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Front Row Ventilated Seats",
        "Surround View Monitor (360° Camera)",
        "Blind-Spot View Monitor (BVM)",
        "Bose Premium 8-Speaker Sound System with Subwoofer",
        "Front Parking Sensors",
      ],
    },
    {
      name: "Creta King 1.5 Turbo Petrol DCT",
      powertrain: "1.5L Turbo GDi Petrol",
      transmission: "DCT",
      engineCc: 1482,
      powerBhp: 160,
      torqueNm: 253,
      mileageKmpl: 18.4,
      exShowroomPrice: 2000000.0,
      onRoadPriceEst: 2295000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Segment Best 160 PS Turbo GDi Engine with 7-Speed DCT",
        "Hyundai SmartSense Full Level 2 ADAS (19 Features)",
        "Surround View Monitor (360° Camera) & BVM",
        "8-Way Power Adjustable Driver Seat",
        "R18 Diamond Cut Alloy Wheels",
        "Front Ventilated Seats & Bose 8-Speaker Audio",
      ],
    },
    {
      name: "Creta King 1.5 Diesel AT (Dual Tone)",
      powertrain: "1.5L U2 CRDi Diesel",
      transmission: "Automatic (AT)",
      engineCc: 1493,
      powerBhp: 116,
      torqueNm: 250,
      mileageKmpl: 19.1,
      exShowroomPrice: 2015000.0,
      onRoadPriceEst: 2317000.0,
      seatingCapacity: 5,
      keyFeatures: [
        "Dual Tone Styling Pack with Black Painted Roof",
        "Hyundai SmartSense Full Level 2 ADAS Suite",
        "Surround View 360° Camera & Blind-Spot View Monitor",
        "Voice-Enabled Smart Panoramic Sunroof",
        "Front Ventilated Seats & Bose 8-Speaker Audio",
        "Electrochromic Mirror (ECM) with Telematics Switches",
      ],
    },
  ];

  for (const v of variantDefinitions) {
    await prisma.variant.create({
      data: {
        vehicleId: vehicle.id,
        name: v.name,
        powertrain: v.powertrain,
        transmission: v.transmission,
        engineCc: v.engineCc,
        powerBhp: v.powerBhp,
        torqueNm: v.torqueNm,
        mileageKmpl: v.mileageKmpl,
        exShowroomPrice: v.exShowroomPrice,
        onRoadPriceEst: v.onRoadPriceEst,
        seatingCapacity: v.seatingCapacity,
        keyFeatures: v.keyFeatures,
      },
    });
  }
  console.log(`Ingested ${variantDefinitions.length} variants.`);

  // 8. Seed Authorized Hyundai Dealers for Dealer Locator tab
  console.log("Ensuring Authorized Hyundai Dealers exist for Dealer Locator...");
  const hyundaiDealers = [
    {
      name: "Koncept Hyundai — Green Park",
      dealerCode: "HYU-DEL-01",
      outletType: OutletType.THREE_S_FACILITY,
      address: "A-23, Green Park Main, Near Green Park Metro Station",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110016",
      phone: "+91 98110 54321",
      email: "sales.greenpark@koncepthyundai.com",
      rating: 4.8,
      reviewCount: 520,
      latitude: 28.5589,
      longitude: 77.2028,
      googleMapsUrl: "https://maps.google.com/?q=Koncept+Hyundai+Green+Park+New+Delhi",
    },
    {
      name: "Capital Hyundai — Okhla Phase I",
      dealerCode: "HYU-DEL-02",
      outletType: OutletType.THREE_S_FACILITY,
      address: "B-224, Okhla Industrial Area Phase I",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110020",
      phone: "+91 98100 98765",
      email: "sales@capitalhyundai.in",
      rating: 4.7,
      reviewCount: 460,
      latitude: 28.5312,
      longitude: 77.2798,
      googleMapsUrl: "https://maps.google.com/?q=Capital+Hyundai+Okhla+Delhi",
    },
    {
      name: "Himgiri Hyundai — Sector 63 Noida",
      dealerCode: "HYU-NOI-03",
      outletType: OutletType.THREE_S_FACILITY,
      address: "C-56/32, Sector 62 / 63 Main Road",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      phone: "+91 98188 12345",
      email: "sales.noida@himgirihyundai.com",
      rating: 4.6,
      reviewCount: 390,
      latitude: 28.628,
      longitude: 77.376,
      googleMapsUrl: "https://maps.google.com/?q=Himgiri+Hyundai+Noida",
    },
    {
      name: "Orion Hyundai — Gurugram Golf Course Ext.",
      dealerCode: "HYU-GGN-04",
      outletType: OutletType.THREE_S_FACILITY,
      address: "Golf Course Extension Road, Sector 56",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122011",
      phone: "+91 99100 45678",
      email: "sales.gurugram@orionhyundai.com",
      rating: 4.7,
      reviewCount: 340,
      latitude: 28.423,
      longitude: 77.105,
      googleMapsUrl: "https://maps.google.com/?q=Orion+Hyundai+Gurugram",
    },
    {
      name: "Trident Hyundai — Indiranagar",
      dealerCode: "HYU-BLR-05",
      outletType: OutletType.THREE_S_FACILITY,
      address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 98450 11223",
      email: "sales.indiranagar@tridenthyundai.com",
      rating: 4.8,
      reviewCount: 610,
      latitude: 12.9716,
      longitude: 77.6412,
      googleMapsUrl: "https://maps.google.com/?q=Trident+Hyundai+Indiranagar+Bangalore",
    },
    {
      name: "Shreenath Hyundai — Andheri West",
      dealerCode: "HYU-MUM-06",
      outletType: OutletType.THREE_S_FACILITY,
      address: "Link Road, Opp Oshiwara Police Station, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
      phone: "+91 98200 67890",
      email: "sales@shreenathhyundai.com",
      rating: 4.7,
      reviewCount: 480,
      latitude: 19.143,
      longitude: 72.834,
      googleMapsUrl: "https://maps.google.com/?q=Shreenath+Hyundai+Andheri+Mumbai",
    },
  ];

  for (const d of hyundaiDealers) {
    const existing = await prisma.dealer.findFirst({
      where: { brandId: brand.id, name: d.name },
    });
    if (!existing) {
      await prisma.dealer.create({
        data: {
          brandId: brand.id,
          vehicleId: vehicle.id,
          name: d.name,
          dealerCode: d.dealerCode,
          outletType: d.outletType,
          address: d.address,
          city: d.city,
          state: d.state,
          pincode: d.pincode,
          phone: d.phone,
          email: d.email,
          rating: d.rating,
          reviewCount: d.reviewCount,
          latitude: d.latitude,
          longitude: d.longitude,
          googleMapsUrl: d.googleMapsUrl,
          operatingHours: "9:30 AM - 7:30 PM (Mon-Sun)",
          isVerified: true,
        },
      });
    } else {
      await prisma.dealer.update({
        where: { id: existing.id },
        data: {
          vehicleId: vehicle.id,
        },
      });
    }
  }

  console.log("=== Hyundai Creta Seeding Complete! ===");
}

main()
  .catch((e) => {
    console.error("Error during Hyundai Creta seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
