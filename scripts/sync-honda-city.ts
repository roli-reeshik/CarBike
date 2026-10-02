import fs from "fs";
import path from "path";
import { PrismaClient, VehicleType, LaunchStatus } from "@prisma/client";

const prisma = new PrismaClient();

const CITY_DIR = path.join(
  process.cwd(),
  "public",
  "vehicles",
  "cars",
  "honda-cars",
  "honda-city",
  "City"
);

const PARENT_DIR = path.join(
  process.cwd(),
  "public",
  "vehicles",
  "cars",
  "honda-cars",
  "honda-city"
);

async function main() {
  console.log("Starting Honda City synchronization...");

  // 1. Load parsed Excel JSON
  const jsonPath = path.join(process.cwd(), "scripts", "honda_city_parsed.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Parsed JSON not found at ${jsonPath}. Run scripts/parse_honda_city_excel.py first.`);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(rawData);

  // 2. Ensure Hero image exists in parent directory as well
  const whitePearlSource = path.join(CITY_DIR, "Platinum White Pearl.png");
  if (fs.existsSync(whitePearlSource)) {
    fs.copyFileSync(whitePearlSource, path.join(PARENT_DIR, "hero.png"));
    fs.copyFileSync(whitePearlSource, path.join(PARENT_DIR, "hero.jpg"));
    console.log("Copied Platinum White Pearl to hero.png and hero.jpg");
  }

  // 3. Find or Create Honda Brand
  let brand = await prisma.brand.findUnique({
    where: { slug: "honda-cars" },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        name: "Honda Cars",
        slug: "honda-cars",
        vehicleType: VehicleType.CAR,
        logoUrl: "/brands/honda.svg",
      },
    });
    console.log("Created Honda Cars brand:", brand.id);
  }

  // 4. Upsert Vehicle: Honda City
  const heroImage = "/vehicles/cars/honda-cars/honda-city/City/Platinum White Pearl.png";

  const vehicle = await prisma.vehicle.upsert({
    where: { slug: "honda-city" },
    update: {
      name: "Honda City",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Supreme Performance. Iconic Comfort.",
      bodyType: "Sedan",
      fuelTypes: ["Petrol", "Strong Hybrid"],
      transmissionTypes: ["Manual", "Automatic", "CVT", "e-CVT"],
      heroImage: heroImage,
      priceMin: 1208000,
      priceMax: 2143800,
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
      engineSpecs: parsed.engineSpecs,
      featureMatrix: parsed.featureMatrix,
    },
    create: {
      name: "Honda City",
      slug: "honda-city",
      brandId: brand.id,
      category: VehicleType.CAR,
      tagline: "Supreme Performance. Iconic Comfort.",
      bodyType: "Sedan",
      fuelTypes: ["Petrol", "Strong Hybrid"],
      transmissionTypes: ["Manual", "Automatic", "CVT", "e-CVT"],
      heroImage: heroImage,
      priceMin: 1208000,
      priceMax: 2143800,
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
      engineSpecs: parsed.engineSpecs,
      featureMatrix: parsed.featureMatrix,
    },
  });

  console.log(`Updated Vehicle: ${vehicle.name} (${vehicle.id})`);

  // 5. Delete old variants and colors to insert clean, verified data
  await prisma.variant.deleteMany({ where: { vehicleId: vehicle.id } });
  await prisma.vehicleColor.deleteMany({ where: { vehicleId: vehicle.id } });

  // 6. Ingest Color Palette
  const colorsData = [
    {
      name: "Crystal Black Pearl",
      hexCode: "#0F1115",
      filename: "Crystal Black Pearl.png",
    },
    {
      name: "Lunar Silver Metallic",
      hexCode: "#C2C6CD",
      filename: "Lunar Silvar Metalic.png",
    },
    {
      name: "Meteoroid Gray Metallic",
      hexCode: "#52565E",
      filename: "Meteoroid Gray Metalic.png",
    },
    {
      name: "Obsidian Blue Pearl",
      hexCode: "#1B2C4B",
      filename: "Obsidian Blue Pearl.png",
    },
    {
      name: "Platinum White Pearl",
      hexCode: "#F3F4F6",
      filename: "Platinum White Pearl.png",
    },
    {
      name: "Radiant Red Metallic",
      hexCode: "#9B1B28",
      filename: "Radiant Red Metalic.png",
    },
  ];

  for (const c of colorsData) {
    const url = `/vehicles/cars/honda-cars/honda-city/City/${c.filename}`;
    await prisma.vehicleColor.create({
      data: {
        vehicleId: vehicle.id,
        name: c.name,
        hexCode: c.hexCode,
        previewUrl: url,
        imageUrl: url,
      },
    });
  }
  console.log(`Ingested ${colorsData.length} colors.`);

  // 7. Ingest Variants (From Price-Ex-ShowRoom.txt & standard lineup)
  const variantsData = [
    {
      name: "e:HEV ZX+",
      powertrain: "e:HEV (Strong Hybrid)",
      transmission: "e-CVT",
      exShowroomPrice: 2143800,
      onRoadPriceEst: 2465370,
      powerBhp: 126,
      torqueNm: 253,
      mileageKmpl: 27.26,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "Self-Charging Strong Hybrid SHEV",
        "Honda SENSING ADAS with Low Speed Follow",
        "Electric Parking Brake with Auto Brake Hold",
        "All 4 Disc Brakes & Regenerative Deceleration",
        "Active Ventilation System (Front Seats)",
        "Exclusive Sporty Leather Seat Design",
        "360-degree Surround-Vision Camera",
        "Wireless Charger (Centre Console Tray)",
      ],
    },
    {
      name: "i-VTEC CVT ZX+",
      powertrain: "i-VTEC (Petrol)",
      transmission: "CVT",
      exShowroomPrice: 1743700,
      onRoadPriceEst: 2005255,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.97,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "Honda SENSING ADAS Suite",
        "360-degree Surround-Vision Camera",
        "7-Speed Paddle Shifters with Remote Engine Start",
        "One-Touch Electric Sunroof with Anti-Pinch",
        "Full LED Headlamps & Z-Edge LED Tail Lamps",
        "Luxurious Ivory & Black Leather Upholstery",
        "R16 Aero-Blade Diamond Cut Alloys",
      ],
    },
    {
      name: "i-VTEC CVT ZX",
      powertrain: "i-VTEC (Petrol)",
      transmission: "CVT",
      exShowroomPrice: 1654700,
      onRoadPriceEst: 1902905,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.97,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "Honda SENSING ADAS Suite",
        "One-Touch Electric Sunroof",
        "LaneWatch™ Blind Spot Camera",
        "7-Speed Paddle Shifters",
        "Leather Shift Lever & Steering Wheel",
        "R16 Aero-Blade Diamond Cut Alloys",
        "Multi-Angle Rear Camera",
      ],
    },
    {
      name: "i-VTEC MT ZX+",
      powertrain: "i-VTEC (Petrol)",
      transmission: "MT",
      exShowroomPrice: 1643700,
      onRoadPriceEst: 1890255,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.77,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "6-Speed Manual Transmission",
        "Honda SENSING ADAS Suite",
        "360-degree Surround-Vision Camera",
        "One-Touch Electric Sunroof",
        "Full LED Headlamps with Split DRL",
        "Luxurious Ivory & Black Leather Upholstery",
        "R16 Diamond Cut Alloys",
      ],
    },
    {
      name: "i-VTEC MT ZX",
      powertrain: "i-VTEC (Petrol)",
      transmission: "MT",
      exShowroomPrice: 1554700,
      onRoadPriceEst: 1787905,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.77,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "6-Speed Manual Transmission",
        "Honda SENSING ADAS Suite",
        "One-Touch Electric Sunroof",
        "LaneWatch™ Blind Spot Camera",
        "Full LED Headlamps",
        "Multi-Angle Rear Camera",
        "R16 Diamond Cut Alloys",
      ],
    },
    {
      name: "i-VTEC CVT V",
      powertrain: "i-VTEC (Petrol)",
      transmission: "CVT",
      exShowroomPrice: 1458700,
      onRoadPriceEst: 1677505,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.97,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "CVT Automatic with 7-Speed Paddle Shifters",
        "Remote Engine Start",
        "Honda SENSING ADAS Suite",
        "Multi-Angle Rear Camera with Guidelines",
        "Touch-Sensor Based Smart Keyless Access",
        "6 Airbags Standard",
        "R15 Gray Painted Multi-Spoke Alloys",
      ],
    },
    {
      name: "i-VTEC MT VX",
      powertrain: "i-VTEC (Petrol)",
      transmission: "MT",
      exShowroomPrice: 1392000,
      onRoadPriceEst: 1599800,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.77,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "One-Touch Electric Sunroof",
        "LaneWatch™ Blind Spot Camera",
        "Honda SENSING ADAS Suite",
        "Wireless Smartphone Charger",
        "Front Grille Connected Light Bar",
        "Rear Sunshade",
      ],
    },
    {
      name: "i-VTEC MT V",
      powertrain: "i-VTEC (Petrol)",
      transmission: "MT",
      exShowroomPrice: 1270000,
      onRoadPriceEst: 1460500,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.77,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "Honda SENSING ADAS Suite",
        "Touch-Sensor Based Smart Keyless Access",
        "Multi-Angle Rear Camera",
        "6 Airbags Standard",
        "Automatic Climate Control",
        "R15 Multi-Spoke Alloy Wheels",
      ],
    },
    {
      name: "i-VTEC MT SV",
      powertrain: "i-VTEC (Petrol)",
      transmission: "MT",
      exShowroomPrice: 1208000,
      onRoadPriceEst: 1389200,
      powerBhp: 121,
      torqueNm: 145,
      mileageKmpl: 17.77,
      engineCc: 1498,
      seatingCapacity: 5,
      keyFeatures: [
        "6 Airbags (Dual Front, Side & Curtain)",
        "Vehicle Stability Assist (VSA)",
        "Hill Start Assist (HSA)",
        "Rear Parking Sensors",
        "Automatic Climate Control with MAX COOL",
        "All 4 Power Windows",
      ],
    },
  ];

  for (const v of variantsData) {
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
        mileageKmpl: v.mileageKmpl,
        engineCc: v.engineCc,
        seatingCapacity: v.seatingCapacity,
        keyFeatures: v.keyFeatures,
      },
    });
  }
  console.log(`Ingested ${variantsData.length} variants.`);

  console.log("Honda City synchronization finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
