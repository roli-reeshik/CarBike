import { resolveVehicle } from "../src/lib/vehicle-resolver";
import { db } from "../src/lib/db";

async function main() {
  console.log("===============================================================");
  console.log("       HYBRID VEHICLE DATA RESOLVER VERIFICATION SUITE       ");
  console.log("===============================================================\n");

  // -------------------------------------------------------------------------
  // TEST 1: Source 1 (Database / Primary) - Existing Complete Vehicle
  // -------------------------------------------------------------------------
  console.log("TEST 1: Testing Source 1 (Database Hit) for 'skoda-slavia'...");
  const t1Start = performance.now();
  const res1 = await resolveVehicle("skoda-slavia");
  const t1Time = (performance.now() - t1Start).toFixed(2);

  if (!res1.vehicle) {
    throw new Error("FAILED: 'skoda-slavia' was not found in the database!");
  }
  if (res1.source !== "database") {
    throw new Error(`FAILED: Expected source 'database', got '${res1.source}'`);
  }
  if (res1.synced) {
    throw new Error("FAILED: Existing vehicle should not trigger re-sync!");
  }

  console.log(`✓ Source 1 HIT Verified:`);
  console.log(`  - Vehicle: ${res1.vehicle.name}`);
  console.log(`  - Source: ${res1.source} (synced=${res1.synced})`);
  console.log(`  - Execution Time: ${t1Time}ms (resolver durationMs: ${res1.durationMs}ms)`);
  console.log(`  - Variants: ${res1.vehicle.variants.length}`);
  console.log(`  - Colors: ${res1.vehicle.colors.length}`);
  console.log(`  - Price: ₹ ${(res1.vehicle.priceMin / 100000).toFixed(2)} - ${(res1.vehicle.priceMax / 100000).toFixed(2)} Lakh\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Source 2 (External API Fallback & Hydration) - New Vehicle
  // -------------------------------------------------------------------------
  const testSlug = "toyota-camry";
  console.log(`TEST 2: Testing Source 2 (API Fallback & Write-Through) for '${testSlug}'...`);

  // First, verify whether it's in the DB or remove if present to test fresh hydration
  const existing = await db.vehicle.findUnique({ where: { slug: testSlug } });
  if (existing) {
    console.log(`  (Cleaning pre-existing '${testSlug}' from DB for clean hydration test...)`);
    await db.variant.deleteMany({ where: { vehicleId: existing.id } });
    await db.vehicleColor.deleteMany({ where: { vehicleId: existing.id } });
    await db.vehicle.delete({ where: { id: existing.id } });
  }

  const res2 = await resolveVehicle(testSlug, { brandSlug: "toyota" });

  if (!res2.vehicle) {
    throw new Error(`FAILED: '${testSlug}' could not be resolved via external API fallback!`);
  }
  if (res2.source !== "api") {
    throw new Error(`FAILED: Expected source 'api' for uncached vehicle, got '${res2.source}'`);
  }
  if (!res2.synced) {
    throw new Error("FAILED: Expected synced=true after external API hydration!");
  }

  console.log(`✓ Source 2 Fallback & Auto-Hydrate Verified:`);
  console.log(`  - Vehicle: ${res2.vehicle.name} (${res2.vehicle.slug})`);
  console.log(`  - Brand: ${res2.vehicle.brandName} (${res2.vehicle.brandSlug})`);
  console.log(`  - Source: ${res2.source} (synced=${res2.synced})`);
  console.log(`  - Resolver duration: ${res2.durationMs}ms`);
  console.log(`  - Hero Image: ${res2.vehicle.heroImage.slice(0, 70)}...`);
  console.log(`  - Price Min: ₹ ${(res2.vehicle.priceMin / 100000).toFixed(2)} Lakh`);
  console.log(`  - Price Max: ₹ ${(res2.vehicle.priceMax / 100000).toFixed(2)} Lakh`);
  console.log(`  - Budget Slab: ${res2.vehicle.budgetRange}`);
  console.log(`  - Variants Generated: ${res2.vehicle.variants.length}`);
  res2.vehicle.variants.forEach((v, i) => {
    console.log(`    [${i + 1}] ${v.name} — ₹ ${(v.exShowroomPrice / 100000).toFixed(2)} Lakh (${v.powertrain})`);
  });
  console.log(`  - Colors Generated: ${res2.vehicle.colors.length}`);
  res2.vehicle.colors.slice(0, 4).forEach((c, i) => {
    console.log(`    [${i + 1}] ${c.name} (${c.hexCode})`);
  });
  console.log();

  // -------------------------------------------------------------------------
  // TEST 3: Database Persist Verification (Direct DB Check)
  // -------------------------------------------------------------------------
  console.log(`TEST 3: Verifying write-through persistence in PostgreSQL/Supabase...`);
  const persistedDbVehicle = await db.vehicle.findUnique({
    where: { slug: testSlug },
    include: {
      brand: true,
      variants: true,
      colors: true,
    },
  });

  if (!persistedDbVehicle) {
    throw new Error(`FAILED: '${testSlug}' was NOT persisted in the database!`);
  }
  if (!persistedDbVehicle.brand) {
    throw new Error("FAILED: Persisted vehicle is missing brand relation!");
  }
  if (persistedDbVehicle.variants.length === 0) {
    throw new Error("FAILED: Persisted vehicle has 0 variants!");
  }
  if (persistedDbVehicle.colors.length === 0) {
    throw new Error("FAILED: Persisted vehicle has 0 colors!");
  }

  console.log(`✓ Direct DB Persist Check PASSED:`);
  console.log(`  - DB Record ID: ${persistedDbVehicle.id}`);
  console.log(`  - Brand: ${persistedDbVehicle.brand.name} (ID: ${persistedDbVehicle.brand.id})`);
  console.log(`  - Variants in DB: ${persistedDbVehicle.variants.length}`);
  console.log(`  - Colors in DB: ${persistedDbVehicle.colors.length}\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Source 1 Subsequent Visit (Fast Sub-millisecond Load)
  // -------------------------------------------------------------------------
  console.log(`TEST 4: Testing subsequent visit for '${testSlug}' (Should hit Source 1 Database)...`);
  const t4Start = performance.now();
  const res4 = await resolveVehicle(testSlug, { brandSlug: "toyota" });
  const t4Time = (performance.now() - t4Start).toFixed(2);

  if (!res4.vehicle) {
    throw new Error("FAILED: Vehicle not returned on subsequent call!");
  }
  if (res4.source !== "database") {
    throw new Error(`FAILED: Expected source 'database' on subsequent visit, got '${res4.source}'`);
  }
  if (res4.synced) {
    throw new Error("FAILED: Subsequent visit should not trigger sync!");
  }

  console.log(`✓ Subsequent Load HIT Verified:`);
  console.log(`  - Source: ${res4.source} (Instant Cache Hit)`);
  console.log(`  - Execution Time: ${t4Time}ms (resolver durationMs: ${res4.durationMs}ms)`);
  console.log(`  - Performance: ${Number(t4Time) < 50 ? "SUB-MILLISECOND / ULTRA-FAST (<50ms)" : "Fast"}\n`);

  // -------------------------------------------------------------------------
  // TEST 5: Force Sync Flag (forceSync=true)
  // -------------------------------------------------------------------------
  console.log(`TEST 5: Testing explicit forceSync=true flag on '${testSlug}'...`);
  const res5 = await resolveVehicle(testSlug, { brandSlug: "toyota", forceSync: true });

  if (!res5.vehicle) {
    throw new Error("FAILED: forceSync returned null vehicle!");
  }
  if (res5.source !== "api") {
    throw new Error(`FAILED: Expected source 'api' with forceSync=true, got '${res5.source}'`);
  }
  if (!res5.synced) {
    throw new Error("FAILED: Expected synced=true with forceSync=true!");
  }

  console.log(`✓ forceSync=true Re-Hydration Verified:`);
  console.log(`  - Source: ${res5.source} (synced=${res5.synced})`);
  console.log(`  - Fresh Variants: ${res5.vehicle.variants.length}`);
  console.log(`  - Fresh Colors: ${res5.vehicle.colors.length}\n`);

  console.log("===============================================================");
  console.log("           ALL 5 HYBRID RESOLVER TESTS PASSED!                 ");
  console.log("===============================================================");
}

main()
  .catch((err) => {
    console.error("\n❌ SUITE ERROR:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
