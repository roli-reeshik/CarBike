import { db } from "../src/lib/db";

async function run() {
  const brands = await db.brand.findMany({
    select: { id: true, name: true, slug: true, logoUrl: true, vehicleType: true },
    orderBy: { name: "asc" },
  });
  console.log("ALL BRANDS:");
  for (const b of brands) {
    console.log(`- ${b.name} (slug: ${b.slug}, type: ${b.vehicleType}, logo: ${b.logoUrl})`);
  }
  process.exit(0);
}

run();
