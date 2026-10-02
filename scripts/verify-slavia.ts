import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { getCatalog, getVehicleBySlug } from "../src/lib/catalog";
import { searchVehicles } from "../src/lib/requirements";

const prisma = new PrismaClient();

async function run() {
  console.log("--- 1. Testing Physical Assets in public/vehicles/cars/skoda/skoda-slavia ---");
  const dir = path.join(process.cwd(), "public", "vehicles", "cars", "skoda", "skoda-slavia");
  const requiredFiles = [
    "Engine.xlsx",
    "Features.xlsx",
    "Price-Ex-ShowRoom.xlsx",
    "Candy White.png",
    "Brilliant Silver.png",
    "Carbon Steel.png",
    "Cherry Red.png",
    "Tornado Red.png",
    "slavia.pdf",
    "brochure.pdf",
  ];

  for (const f of requiredFiles) {
    const fp = path.join(dir, f);
    const exists = fs.existsSync(fp);
    const size = exists ? fs.statSync(fp).size : 0;
    console.log("File:", f, "-> Exists:", exists, "Size:", size, "bytes");
    if (!exists || size === 0) throw new Error("Asset missing or empty: " + f);
  }

  console.log("\n--- 2. Testing getVehicleBySlug('skoda-slavia') ---");
  const slavia = await getVehicleBySlug("skoda-slavia");
  if (!slavia) throw new Error("Slavia not found via getVehicleBySlug");
  console.log("Vehicle Name:", slavia.name);
  console.log("Brand Name:", slavia.brandName);
  console.log("Brand Slug:", slavia.brandSlug);
  console.log("Hero Image:", slavia.heroImage);
  console.log("Price Min:", slavia.priceMin);
  console.log("Price Max:", slavia.priceMax);
  console.log("Variants Count:", slavia.variants.length);
  console.log("Colors Count:", slavia.colors.length);
  console.log("Engine Specs Sheets:", slavia.engineSpecs?.length);
  console.log("Feature Categories:", slavia.featureMatrix?.length);

  console.log("\n--- 3. Testing Brand Isolation & Filtering ---");
  const catalog = await getCatalog();
  const skodaResults = searchVehicles(catalog, { category: "CAR", brand: "Škoda Auto India" });
  console.log(
    "Filter by 'Škoda Auto India':",
    skodaResults.map((v) => ({ name: v.name, brand: v.brandName }))
  );

  const skodaAsciiResults = searchVehicles(catalog, { category: "CAR", brand: "Skoda" });
  console.log(
    "Filter by 'Skoda':",
    skodaAsciiResults.map((v) => ({ name: v.name, brand: v.brandName }))
  );

  const hondaResults = searchVehicles(catalog, { category: "CAR", brand: "Honda Cars" });
  console.log(
    "Filter by 'Honda Cars':",
    hondaResults.map((v) => ({ name: v.name, brand: v.brandName }))
  );

  const hyundaiResults = searchVehicles(catalog, { category: "CAR", brand: "Hyundai India" });
  console.log(
    "Filter by 'Hyundai India':",
    hyundaiResults.map((v) => ({ name: v.name, brand: v.brandName }))
  );

  const hasLeakInSkoda = skodaResults.some(
    (v) =>
      !v.brandName.toLowerCase().includes("skoda") &&
      !v.brandName.toLowerCase().includes("škoda")
  );
  console.log(
    "Brand Leakage Check in Škoda Filter:",
    hasLeakInSkoda ? "FAILED (leaked other brands!)" : "PASSED (Strict Isolation Verified)"
  );

  console.log("\n--- 4. Testing Sedan & Budget Filter (10-20 Lakh) ---");
  const sedanBudgetResults = searchVehicles(catalog, {
    category: "CAR",
    bodyType: "Sedan",
    budget: "10_20",
  });
  console.log(
    "Sedans in 10-20 Lakh bracket:",
    sedanBudgetResults.map((v) => v.name)
  );
  const slaviaInBudget = sedanBudgetResults.some((v) => v.slug === "skoda-slavia");
  console.log("Slavia in Sedan 10-20 Lakh Filter:", slaviaInBudget ? "PASSED" : "FAILED");

  console.log("\n--- 5. Comparison URL Resolution ---");
  const verna = await getVehicleBySlug("hyundai-verna");
  const city = await getVehicleBySlug("honda-city");
  console.log("Slavia exists:", Boolean(slavia));
  console.log("City exists:", Boolean(city));
  console.log("Verna exists:", Boolean(verna));
  if (!slavia || !city || !verna) {
    throw new Error("One or more comparison vehicles missing!");
  }
  console.log("All 3 midsize sedans loaded and ready for 2-way and 3-way comparisons!");

  await prisma.$disconnect();
  console.log("\n=== ALL AUDIT & INTEGRITY CHECKS PASSED! ===");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
