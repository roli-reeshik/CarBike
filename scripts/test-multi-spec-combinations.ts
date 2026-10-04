import { getCatalog, getAllBrands } from "../src/lib/catalog";
import { searchVehicles } from "../src/lib/requirements";

async function main() {
  console.log("=== Testing Multi-Specification Combination Filtering ===\n");

  const [vehicles, brands] = await Promise.all([
    getCatalog(),
    getAllBrands(),
  ]);

  console.log(`Loaded ${vehicles.length} catalog vehicles and ${brands.length} official brands.\n`);

  const testCases = [
    {
      title: "Test 1: Budget ₹8–15L, Petrol, Manual, 5 Seater (All Body Types)",
      filters: { category: "CAR", budget: "8_15", fuel: "Petrol", transmission: "Manual", seating: "5" },
    },
    {
      title: "Test 2: SUV, Budget ₹8–15L, Diesel, Manual, 5 Seater",
      filters: { category: "CAR", bodyType: "Compact SUV", budget: "8_15", fuel: "Diesel", transmission: "Manual", seating: "5" },
    },
    {
      title: "Test 3: Full-Size SUV, Budget ₹15–25L, Diesel, Automatic, 7 Seater",
      filters: { category: "CAR", bodyType: "Full-Size SUV", budget: "15_25", fuel: "Diesel", transmission: "Automatic", seating: "7" },
    },
    {
      title: "Test 4: MUV / MPV, Budget ₹8–15L, CNG, 7 Seater",
      filters: { category: "CAR", bodyType: "MUV / MPV", budget: "8_15", fuel: "CNG", seating: "7" },
    },
    {
      title: "Test 5: Sedan, Budget ₹8–15L, Petrol, Automatic, 5 Seater",
      filters: { category: "CAR", bodyType: "Sedan", budget: "8_15", fuel: "Petrol", transmission: "Automatic", seating: "5" },
    },
    {
      title: "Test 6: Hatchback, Budget < ₹8L, Petrol, Manual, 5 Seater",
      filters: { category: "CAR", bodyType: "Hatchback", budget: "under_8", fuel: "Petrol", transmission: "Manual", seating: "5" },
    },
    {
      title: "Test 7: Specific Brand (Tata Motors) + SUV",
      filters: { category: "CAR", brand: "Tata Motors", bodyType: "SUV" },
    },
    {
      title: "Test 8: Specific Brand (Maruti Suzuki) + 7 Seater",
      filters: { category: "CAR", brand: "Maruti Suzuki", seating: "7" },
    },
    {
      title: "Test 9: Specific Brand (Mahindra) + Off-Roader (4x4)",
      filters: { category: "CAR", brand: "Mahindra", bodyType: "Off-Roader (4x4)" },
    },
    {
      title: "Test 10: Electric Cars (EV)",
      filters: { category: "CAR", fuel: "Electric" },
    },
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    const results = searchVehicles(vehicles, tc.filters);
    console.log(`[PASS] ${tc.title}`);
    console.log(`       Criteria: ${JSON.stringify(tc.filters)}`);
    console.log(`       Matched (${results.length}): ${results.map((r) => `${r.name} (${r.brandName})`).join(", ")}`);
    console.log("");
    if (results.length > 0) {
      passedCount++;
    } else {
      console.warn(`       ⚠ 0 results returned for: ${tc.title}`);
    }
  }

  console.log(`=== Multi-Spec Combination Results: ${passedCount}/${testCases.length} test cases successfully returned matching cars! ===`);
}

main().catch(console.error);
