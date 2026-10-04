import { getCatalog, getHomeShowcaseData } from "../src/lib/catalog";

async function main() {
  console.log("=== Verifying Home Page Showcase & Categories ===");

  const [catalog, showcase] = await Promise.all([
    getCatalog(),
    getHomeShowcaseData(),
  ]);

  console.log(`\n1. Catalog Vehicles Loaded for Filter & Match: ${catalog.length} vehicles`);

  console.log("\n2. Component 4 Categories Verification:");
  console.log("-----------------------------------------");

  console.log(`a. New Launch Cars (${showcase.newLaunches.length}):`);
  for (const car of showcase.newLaunches) {
    console.log(`   - ${car.name} (${car.brandName}) | ${car.priceFormatted}`);
  }

  console.log(`\nb. Upcoming Cars (${showcase.upcoming.length}):`);
  for (const car of showcase.upcoming) {
    console.log(`   - ${car.name} (${car.brandName}) | ${car.priceFormatted} | Expected: ${car.launchDate || "TBA"}`);
  }

  console.log(`\nc. Popular Cars (${showcase.popular.length}):`);
  for (const car of showcase.popular) {
    console.log(`   - ${car.name} (${car.brandName}) | ${car.priceFormatted}`);
  }

  // Strict Assertion Checks
  console.log("\n3. Running Safety & Constraint Checks:");
  console.log("-----------------------------------------");

  const existingCars = [
    "Škoda Slavia",
    "Hyundai Verna",
    "Hyundai Creta",
    "Honda City",
    "Honda Civic",
    "Toyota Camry",
  ];

  let upcomingHasExistingCar = false;
  for (const car of showcase.upcoming) {
    if (existingCars.includes(car.name)) {
      console.error(`❌ CRITICAL FAILURE: Existing car "${car.name}" was found in Upcoming Cars!`);
      upcomingHasExistingCar = true;
    }
  }

  if (!upcomingHasExistingCar) {
    console.log("✓ SUCCESS: No existing or launched car found in Upcoming Cars!");
  }

  const slaviaInPopular = showcase.popular.some((c) => c.name === "Škoda Slavia");
  if (slaviaInPopular) {
    console.log("✓ SUCCESS: Škoda Slavia is properly categorized under Popular Cars!");
  } else {
    console.error("❌ ERROR: Škoda Slavia is missing from Popular Cars!");
  }

  const kylaqInUpcoming = showcase.upcoming.some((c) => c.name === "Škoda Kylaq");
  if (kylaqInUpcoming) {
    console.log("✓ SUCCESS: Škoda Kylaq is present in Upcoming Cars!");
  } else {
    console.error("❌ ERROR: Škoda Kylaq is missing from Upcoming Cars!");
  }

  console.log("\n=== All Homepage Component Validations Complete ===");
}

main().catch(console.error);
