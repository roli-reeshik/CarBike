import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const API_KEY = "ci_98cee377cdd0b4da8ed2513d4d31c6354aec589c0a337653fd49c120";
const BASE_URL = "https://carimagesapi.com";

function isLocalFileExists(filePath?: string | null): boolean {
  if (!filePath) return false;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) return true;
  try {
    const decoded = decodeURIComponent(filePath.split("?")[0]);
    const normalized = decoded.startsWith("/") ? decoded.slice(1) : decoded;
    const fullPath = path.join(process.cwd(), "public", normalized);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

async function fix() {
  console.log("=== Fixing Maruti Ertiga, Maruti Models and Vehicle Colors ===");

  // 1. Fix Maruti Models explicitly with verified local assets
  const marutiFixes = [
    {
      slug: "maruti-ertiga",
      heroImage: "/vehicles/cars/maruti/maruti-ertiga/Eartiga.png",
      colors: [
        { name: "Magma Grey", hexCode: "#4A4D4E" },
        { name: "Pearl Arctic White", hexCode: "#FFFFFF" },
        { name: "Splendid Silver", hexCode: "#94A3B8" },
        { name: "Auburn Red", hexCode: "#991B1B" },
        { name: "Oxford Blue", hexCode: "#1E3A8A" },
      ],
    },
    {
      slug: "maruti-dzire",
      heroImage: "/vehicles/cars/maruti/maruti-dzire/Dezire.png",
      colors: [
        { name: "Arctic White", hexCode: "#FFFFFF" },
        { name: "Magma Grey", hexCode: "#4A4D4E" },
        { name: "Splendid Silver", hexCode: "#94A3B8" },
        { name: "Alluring Blue", hexCode: "#1E3A8A" },
      ],
    },
    {
      slug: "maruti-swift",
      heroImage: "/vehicles/cars/maruti/maruti-swift/Swift-1.png",
      colors: [
        { name: "Sizzling Red", hexCode: "#DC2626" },
        { name: "Luster Blue", hexCode: "#2563EB" },
        { name: "Pearl Arctic White", hexCode: "#FFFFFF" },
        { name: "Magma Grey", hexCode: "#4A4D4E" },
      ],
    },
    {
      slug: "maruti-brezza",
      heroImage: "/vehicles/cars/maruti/maruti-brezza/hero.png",
      colors: [
        { name: "Pearl Arctic White", hexCode: "#FFFFFF" },
        { name: "Exuberant Blue", hexCode: "#2563EB" },
        { name: "Magma Grey", hexCode: "#4A4D4E" },
        { name: "Sizzling Red", hexCode: "#DC2626" },
      ],
    },
  ];

  for (const item of marutiFixes) {
    const v = await db.vehicle.findUnique({ where: { slug: item.slug } });
    if (v) {
      // Update hero image
      await db.vehicle.update({
        where: { id: v.id },
        data: { heroImage: item.heroImage },
      });

      // Clear old colors and insert clean color palette using the real car heroImage
      await db.vehicleColor.deleteMany({ where: { vehicleId: v.id } });
      for (const col of item.colors) {
        await db.vehicleColor.create({
          data: {
            vehicleId: v.id,
            name: col.name,
            hexCode: col.hexCode,
            previewUrl: item.heroImage,
          },
        });
      }
      console.log(`✓ Fixed ${item.slug} heroImage to ${item.heroImage} and regenerated ${item.colors.length} colors.`);
    }
  }

  // 2. Fix all other vehicles across the entire database:
  // If color.previewUrl is a scraper artifact (img_1, img_2, img_3, hero.jpg) or missing from disk,
  // replace previewUrl with vehicle.heroImage!
  const allVehicles = await db.vehicle.findMany({
    include: { colors: true },
  });

  let totalColorsFixed = 0;
  for (const veh of allVehicles) {
    for (const c of veh.colors) {
      const isBadImage =
        !c.previewUrl ||
        c.previewUrl.includes("img_") ||
        c.previewUrl.includes("hero.jpg") ||
        !isLocalFileExists(c.previewUrl);

      if (isBadImage) {
        await db.vehicleColor.update({
          where: { id: c.id },
          data: { previewUrl: veh.heroImage },
        });
        totalColorsFixed++;
      }
    }
  }

  console.log(`✓ Cleaned and fixed ${totalColorsFixed} vehicle colors to point to verified vehicle images!`);
  console.log("=== Fix Complete ===");
}

fix()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });
