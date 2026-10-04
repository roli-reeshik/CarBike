import { PrismaClient, VehicleType, LaunchStatus } from '@prisma/client';

const db = new PrismaClient();

async function run() {
  console.log('--- Updating Supabase with exact verified file paths ---');

  // 1. Brands with exact logo paths (URI-encoded space for 'Brand Logos')
  const brands = [
    { name: 'Honda Cars', slug: 'honda-cars', logoUrl: '/vehicles/cars/Brand%20Logos/honda.png' },
    { name: 'Hyundai', slug: 'hyundai', logoUrl: '/vehicles/cars/Brand%20Logos/hyundai.png' },
    { name: 'Škoda', slug: 'skoda', logoUrl: '/vehicles/cars/Brand%20Logos/skoda.png' },
    { name: 'Toyota', slug: 'toyota', logoUrl: '/vehicles/cars/Brand%20Logos/toyota.png' },
    { name: 'Kia', slug: 'kia', logoUrl: '/vehicles/cars/Brand%20Logos/kia.png' },
    { name: 'Volkswagen', slug: 'volkswagen', logoUrl: '/vehicles/cars/Brand%20Logos/volkswagen.png' },
    { name: 'Tata', slug: 'tata', logoUrl: '/vehicles/cars/Brand%20Logos/tata.png' },
    { name: 'Mahindra', slug: 'mahindra', logoUrl: '/vehicles/cars/Brand%20Logos/mahindra.png' },
    { name: 'Maruti Suzuki', slug: 'maruti-suzuki', logoUrl: '/vehicles/cars/Brand%20Logos/maruti.png' },
    { name: 'MG', slug: 'mg', logoUrl: '/vehicles/cars/Brand%20Logos/mg.png' },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brands) {
    const brand = await db.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logoUrl: b.logoUrl },
      create: { name: b.name, slug: b.slug, logoUrl: b.logoUrl, vehicleType: VehicleType.CAR },
    });
    brandMap[b.slug] = brand.id;
  }

  // 2. Vehicles mapped to existing files found on disk
  const showcaseVehicles = [
    // Column 1: New Launch
    {
      name: 'Honda Elevate',
      slug: 'honda-elevate',
      brandId: brandMap['honda-cars'],
      category: VehicleType.CAR,
      bodyType: 'SUV',
      fuelTypes: ['Petrol'],
      transmissionTypes: ['Manual', 'CVT'],
      heroImage: '/vehicles/cars/honda-cars/honda-elevate/hero.jpg',
      priceMin: 1191000,
      priceMax: 1643000,
      budgetRange: '8_15',
      launchStatus: LaunchStatus.NEW_LAUNCH,
      isFeatured: true,
      engineOrBattery: '1.5L i-VTEC',
      powerBhp: '119.35 bhp',
      torqueNm: '145 Nm',
      mileageOrRange: '16.92 kmpl',
    },
    {
      name: 'Honda City',
      slug: 'honda-city',
      brandId: brandMap['honda-cars'],
      category: VehicleType.CAR,
      bodyType: 'Sedan',
      fuelTypes: ['Petrol', 'Hybrid'],
      transmissionTypes: ['Manual', 'Automatic (CVT)'],
      heroImage: '/vehicles/cars/honda-cars/honda-city/hero.png',
      priceMin: 1208000,
      priceMax: 1635000,
      budgetRange: '8_15',
      launchStatus: LaunchStatus.NEW_LAUNCH,
      isFeatured: true,
      engineOrBattery: '1.5L i-VTEC',
      powerBhp: '119.35 bhp',
      torqueNm: '145 Nm',
      mileageOrRange: '18.4 kmpl',
    },
    // Column 2: Upcoming
    {
      name: 'Škoda Kylaq',
      slug: 'skoda-kylaq',
      brandId: brandMap['skoda'],
      category: VehicleType.CAR,
      bodyType: 'Compact SUV',
      fuelTypes: ['Petrol'],
      transmissionTypes: ['Manual', 'Automatic'],
      heroImage: '/vehicles/cars/skoda/Skoda-Kylaq/Kylaq.png',
      priceMin: 789000,
      priceMax: 1440000,
      budgetRange: 'under_8',
      launchStatus: LaunchStatus.UPCOMING,
      isFeatured: true,
      engineOrBattery: '1.0L TSI',
      powerBhp: '114 bhp',
      torqueNm: '178 Nm',
      mileageOrRange: '19.8 kmpl',
    },
    // Column 3: Popular
    {
      name: 'Škoda Slavia',
      slug: 'skoda-slavia',
      brandId: brandMap['skoda'],
      category: VehicleType.CAR,
      bodyType: 'Sedan',
      fuelTypes: ['Petrol', 'Turbo Petrol'],
      transmissionTypes: ['Manual', 'Automatic (TC)'],
      // Candy White exists in your slavia folder
      heroImage: '/vehicles/cars/skoda/skoda-slavia/Candy%20White.png',
      priceMin: 1069000,
      priceMax: 1869000,
      budgetRange: '8_15',
      launchStatus: LaunchStatus.POPULAR,
      isFeatured: true,
      engineOrBattery: '1.0L TSI / 1.5L TSI',
      powerBhp: '147.51 bhp',
      torqueNm: '250 Nm',
      mileageOrRange: '19.36 kmpl',
    },
    {
      name: 'Hyundai Verna',
      slug: 'hyundai-verna',
      brandId: brandMap['hyundai'],
      category: VehicleType.CAR,
      bodyType: 'Sedan',
      fuelTypes: ['Petrol', 'Turbo Petrol'],
      transmissionTypes: ['Manual', 'IVT', 'DCT'],
      heroImage: '/vehicles/cars/hyundai/hyundai-verna/hero.jpg',
      priceMin: 1100000,
      priceMax: 1742000,
      budgetRange: '8_15',
      launchStatus: LaunchStatus.POPULAR,
      isFeatured: true,
      engineOrBattery: '1.5L MPi / 1.5L Turbo GDi',
      powerBhp: '157.57 bhp',
      torqueNm: '253 Nm',
      mileageOrRange: '20.6 kmpl',
    },
    {
      name: 'Hyundai Creta',
      slug: 'hyundai-creta',
      brandId: brandMap['hyundai'],
      category: VehicleType.CAR,
      bodyType: 'SUV',
      fuelTypes: ['Petrol', 'Diesel'],
      transmissionTypes: ['Manual', 'Automatic'],
      heroImage: '/vehicles/cars/hyundai/hyundai-creta/hero.png',
      priceMin: 1100000,
      priceMax: 2015000,
      budgetRange: '8_15',
      launchStatus: LaunchStatus.POPULAR,
      isFeatured: true,
      engineOrBattery: '1.5L MPi',
      powerBhp: '114 bhp',
      torqueNm: '250 Nm',
      mileageOrRange: '18.0 kmpl',
    },
  ];

  for (const v of showcaseVehicles) {
    await db.vehicle.upsert({
      where: { slug: v.slug },
      update: {
        launchStatus: v.launchStatus,
        isFeatured: v.isFeatured,
        heroImage: v.heroImage,
        priceMin: v.priceMin,
        priceMax: v.priceMax,
        engineOrBattery: v.engineOrBattery,
        powerBhp: v.powerBhp,
        torqueNm: v.torqueNm,
        mileageOrRange: v.mileageOrRange,
      },
      create: v,
    });
  }

  console.log('Database successfully updated with matching image paths!');
}

run()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
  });