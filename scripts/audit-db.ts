import { db } from "../src/lib/db";

async function run() {
  try {
    const brands = await db.brand.findMany({
      where: { vehicleType: "CAR" },
      select: { id: true, name: true, slug: true, logoUrl: true, vehicleType: true },
      orderBy: { name: "asc" },
    });
    console.log("CAR BRANDS (" + brands.length + "):", JSON.stringify(brands, null, 2));

    const cars = await db.vehicle.findMany({
      where: { category: "CAR" },
      select: {
        id: true,
        name: true,
        slug: true,
        launchStatus: true,
        isFeatured: true,
        priceMin: true,
        priceMax: true,
        brand: { select: { name: true, slug: true } },
      },
      orderBy: { name: "asc" },
    });
    console.log("CARS (" + cars.length + "):", JSON.stringify(cars, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
