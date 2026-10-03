import { PrismaClient, Prisma } from '@prisma/client';
import * as XLSX_NS from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const XLSX = (XLSX_NS as any).default || XLSX_NS;
const db = new PrismaClient();

async function main() {
  const filePath = path.join(
    process.cwd(),
    'public',
    'vehicles',
    'cars',
    'hyundai',
    'hyundai-creta',
    'Price-Ex-ShowRoom.xlsx'
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Pricing workbook not found at: ${filePath}`);
  }

  console.log(`Reading price sheet from: ${filePath}`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['All Variants'] || workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`Parsed ${rows.length} variants from workbook.`);

  // 1. Locate the Hyundai Creta vehicle record
  const vehicle = await db.vehicle.findUnique({
    where: { slug: 'hyundai-creta' },
  });

  if (!vehicle) {
    throw new Error("Vehicle with slug 'hyundai-creta' not found in database. Seed the base vehicle first.");
  }

  // 2. Extract min & max price bounds
  const numericPrices = rows
    .map((r) => Number(r['Ex-Showroom Price (INR)']))
    .filter((p) => !isNaN(p) && p > 0);

  const minPrice = Math.min(...numericPrices);
  const maxPrice = Math.max(...numericPrices);

  // Update vehicle boundary prices
  await db.vehicle.update({
    where: { id: vehicle.id },
    data: {
      priceMin: new Prisma.Decimal(minPrice),
      priceMax: new Prisma.Decimal(maxPrice),
    },
  });
  console.log(`Updated Hyundai Creta price range: ₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`);

  // 3. Clear existing variants for clean idempotency
  const deleted = await db.variant.deleteMany({
    where: { vehicleId: vehicle.id },
  });
  console.log(`Cleared ${deleted.count} legacy variants.`);

  // 4. Batch create all variants
  for (const row of rows) {
    const variantName = String(row['Trim / Variant']).trim();
    const fuelType = String(row['Fuel Type'] || '').trim();
    const engineType = String(row['Engine Type'] || '').trim();
    const transmission = String(row['Transmission'] || '').trim();
    const price = Number(row['Ex-Showroom Price (INR)']);
    const displacementStr = String(row['Displacement'] || '').replace(/\D/g, '');
    const engineCc = displacementStr ? parseInt(displacementStr, 10) : null;
    const edition = String(row['Edition / Theme'] || 'Standard').trim();

    // Map engine power/torque based on powertrain type
    let powerBhp = 113.18;
    let torqueNm = 143.8;
    let mileageKmpl = 17.4;

    if (fuelType.includes('Diesel')) {
      powerBhp = 114.4;
      torqueNm = 250.0;
      mileageKmpl = transmission.includes('Manual') ? 21.8 : 19.1;
    } else if (fuelType.includes('Turbo')) {
      powerBhp = 157.57;
      torqueNm = 253.0;
      mileageKmpl = 18.4;
    } else if (transmission.includes('CVT') || transmission.includes('IVT')) {
      mileageKmpl = 17.7;
    }

    // Key trim features summary
    const keyFeatures: string[] = [
      `${engineType} (${transmission})`,
      `${fuelType} Engine`,
    ];
    if (edition !== 'Standard') {
      keyFeatures.push(`${edition} Exclusive Styling`);
    }

    await db.variant.create({
      data: {
        vehicleId: vehicle.id,
        name: variantName,
        powertrain: engineType,
        exShowroomPrice: new Prisma.Decimal(price),
        onRoadPriceEst: new Prisma.Decimal(Math.round(price * 1.14)),
        engineCc: engineCc,
        powerBhp: new Prisma.Decimal(powerBhp),
        torqueNm: new Prisma.Decimal(torqueNm),
        mileageKmpl: new Prisma.Decimal(mileageKmpl),
        transmission: transmission,
        seatingCapacity: 5,
        keyFeatures: keyFeatures,
      },
    });
  }

  console.log(`Successfully imported all ${rows.length} Hyundai Creta variants into Supabase.`);
}

main()
  .catch((err) => {
    console.error('Failed to import Creta prices:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
