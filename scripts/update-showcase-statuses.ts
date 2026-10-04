import { PrismaClient, LaunchStatus, VehicleType } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("=== Updating Vehicles Launch Statuses and Seeding Upcoming EVs ===");

  // 1. Slavia must be POPULAR (it is an existing car launched in 2022)
  await db.vehicle.update({
    where: { slug: "skoda-slavia" },
    data: {
      launchStatus: LaunchStatus.POPULAR,
      isFeatured: true,
    },
  });
  console.log("✓ Updated Škoda Slavia -> POPULAR");

  // 2. Toyota Camry -> POPULAR
  const camry = await db.vehicle.findUnique({ where: { slug: "toyota-camry" } });
  if (camry) {
    await db.vehicle.update({
      where: { slug: "toyota-camry" },
      data: {
        launchStatus: LaunchStatus.POPULAR,
        isFeatured: true,
      },
    });
    console.log("✓ Updated Toyota Camry -> POPULAR");
  }

  // 3. Škoda Kylaq -> UPCOMING + Add Variants
  const kylaq = await db.vehicle.findUnique({
    where: { slug: "skoda-kylaq" },
    include: { variants: true },
  });

  if (kylaq) {
    await db.vehicle.update({
      where: { slug: "skoda-kylaq" },
      data: {
        launchStatus: LaunchStatus.UPCOMING,
        expectedLaunchDate: "March 2025",
        isDateConfirmed: true,
        expectedPriceMinLakh: 7.89,
        expectedPriceMaxLakh: 14.40,
        priceMin: 789000,
        priceMax: 1440000,
        budgetRange: "under_8",
        isFeatured: true,
      },
    });

    if (kylaq.variants.length === 0) {
      console.log("Seeding Škoda Kylaq official variants...");
      const kylaqVariants = [
        {
          name: "Classic 1.0 TSI MT",
          exShowroomPrice: 789000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 19.8,
          transmission: "Manual",
          seatingCapacity: 5,
          keyFeatures: ["6 Airbags standard", "LED DRLs", "Electronic Stability Control", "Central Locking"],
        },
        {
          name: "Signature 1.0 TSI MT",
          exShowroomPrice: 959000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 19.8,
          transmission: "Manual",
          seatingCapacity: 5,
          keyFeatures: ["16-inch Alloys", "8-inch Infotainment", "Rear AC Vents", "Cruise Control"],
        },
        {
          name: "Signature 1.0 TSI AT",
          exShowroomPrice: 1059000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 18.5,
          transmission: "Automatic",
          seatingCapacity: 5,
          keyFeatures: ["6-Speed Torque Converter", "Paddle Shifters", "Hill Hold Assist", "Rear AC Vents"],
        },
        {
          name: "Signature+ 1.0 TSI MT",
          exShowroomPrice: 1140000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 19.8,
          transmission: "Manual",
          seatingCapacity: 5,
          keyFeatures: ["Electric Sunroof", "10-inch Touchscreen", "Wireless Android Auto / Apple CarPlay"],
        },
        {
          name: "Signature+ 1.0 TSI AT",
          exShowroomPrice: 1240000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 18.5,
          transmission: "Automatic",
          seatingCapacity: 5,
          keyFeatures: ["Electric Sunroof", "6-Speed AT", "Paddle Shifters", "Wireless Phone Charging"],
        },
        {
          name: "Prestige 1.0 TSI MT",
          exShowroomPrice: 1335000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 19.8,
          transmission: "Manual",
          seatingCapacity: 5,
          keyFeatures: ["Ventilated Front Seats", "Auto Dimming IRVM", "Leatherette Upholstery", "Sunroof"],
        },
        {
          name: "Prestige 1.0 TSI AT",
          exShowroomPrice: 1440000,
          engineCc: 999,
          powerBhp: 114,
          torqueNm: 178,
          mileageKmpl: 18.5,
          transmission: "Automatic",
          seatingCapacity: 5,
          keyFeatures: ["Full Digital Cockpit", "Ventilated Front Seats", "Connected Car Tech", "Subwoofer"],
        },
      ];

      for (const v of kylaqVariants) {
        await db.variant.create({
          data: {
            vehicleId: kylaq.id,
            ...v,
          },
        });
      }
      console.log(`✓ Seeded ${kylaqVariants.length} variants for Škoda Kylaq`);
    }
  }

  // 4. Honda Elevate Variants
  const elevate = await db.vehicle.findUnique({
    where: { slug: "honda-elevate" },
    include: { variants: true },
  });

  if (elevate && elevate.variants.length === 0) {
    console.log("Seeding Honda Elevate official variants...");
    const elevateVariants = [
      {
        name: "Elevate SV MT",
        exShowroomPrice: 1169000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "Manual",
        seatingCapacity: 5,
        keyFeatures: ["Dual Front Airbags", "LED Projector Headlamps", "Push Button Start"],
      },
      {
        name: "Elevate V MT",
        exShowroomPrice: 1241000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "Manual",
        seatingCapacity: 5,
        keyFeatures: ["8-inch Touchscreen", "Wireless Apple CarPlay/Android Auto", "Connected Car"],
      },
      {
        name: "Elevate V CVT",
        exShowroomPrice: 1351000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "CVT",
        seatingCapacity: 5,
        keyFeatures: ["7-step CVT Automatic", "Paddle Shifters", "8-inch Touchscreen"],
      },
      {
        name: "Elevate VX MT",
        exShowroomPrice: 1380000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "Manual",
        seatingCapacity: 5,
        keyFeatures: ["Single-pane Sunroof", "17-inch Alloy Wheels", "Wireless Charger"],
      },
      {
        name: "Elevate VX CVT",
        exShowroomPrice: 1490000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "CVT",
        seatingCapacity: 5,
        keyFeatures: ["Single-pane Sunroof", "Paddle Shifters", "17-inch Alloy Wheels"],
      },
      {
        name: "Elevate ZX MT",
        exShowroomPrice: 1521000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "Manual",
        seatingCapacity: 5,
        keyFeatures: ["Honda Sensing ADAS Suite", "10.25-inch Touchscreen", "6 Airbags", "Auto Dimming IRVM"],
      },
      {
        name: "Elevate ZX CVT",
        exShowroomPrice: 1643000,
        engineCc: 1498,
        powerBhp: 119,
        torqueNm: 145,
        mileageKmpl: 16.92,
        transmission: "CVT",
        seatingCapacity: 5,
        keyFeatures: ["Honda Sensing ADAS Suite", "Leatherette Seats", "8-speaker Premium Sound"],
      },
    ];

    for (const v of elevateVariants) {
      await db.variant.create({
        data: {
          vehicleId: elevate.id,
          ...v,
        },
      });
    }
    console.log(`✓ Seeded ${elevateVariants.length} variants for Honda Elevate`);
  }

  // 5. Brands needed for upcoming cars
  const brandsToEnsure = [
    { name: "Maruti Suzuki", slug: "maruti-suzuki", logoUrl: "/vehicles/cars/Brand%20Logos/maruti.png" },
    { name: "Mahindra", slug: "mahindra", logoUrl: "/vehicles/cars/Brand%20Logos/mahindra.png" },
    { name: "Tata", slug: "tata", logoUrl: "/vehicles/cars/Brand%20Logos/tata.png" },
    { name: "Hyundai India", slug: "hyundai", logoUrl: "/vehicles/cars/Brand%20Logos/hyundai.png" },
  ];

  const brandRecords: Record<string, string> = {};
  for (const b of brandsToEnsure) {
    const rec = await db.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, logoUrl: b.logoUrl },
      create: { name: b.name, slug: b.slug, logoUrl: b.logoUrl, vehicleType: VehicleType.CAR },
    });
    brandRecords[b.slug] = rec.id;
  }

  // 6. Upcoming Cars / EVs
  const upcomingEVs = [
    {
      name: "Maruti Suzuki e Vitara",
      slug: "maruti-suzuki-e-vitara",
      brandId: brandRecords["maruti-suzuki"],
      category: VehicleType.CAR,
      bodyType: "Electric SUV",
      fuelTypes: ["Electric"],
      transmissionTypes: ["Automatic"],
      heroImage: "/vehicles/cars/Brand%20Logos/maruti.png",
      priceMin: 2000000,
      priceMax: 2500000,
      budgetRange: "20_above",
      launchStatus: LaunchStatus.UPCOMING,
      expectedLaunchDate: "March 2025",
      isDateConfirmed: true,
      expectedPriceMinLakh: 20.00,
      expectedPriceMaxLakh: 25.00,
      isFeatured: true,
      engineOrBattery: "49 kWh / 61 kWh Blade Battery",
      powerBhp: "174 bhp",
      torqueNm: "189 Nm",
      mileageOrRange: "500 km range",
    },
    {
      name: "Mahindra BE 6e",
      slug: "mahindra-be-6e",
      brandId: brandRecords["mahindra"],
      category: VehicleType.CAR,
      bodyType: "Electric Coupe SUV",
      fuelTypes: ["Electric"],
      transmissionTypes: ["Automatic"],
      heroImage: "/vehicles/cars/mahindra/mahindra-xuv-3xo-ev-price-colors-specifications-features/img_1.png",
      priceMin: 1890000,
      priceMax: 2600000,
      budgetRange: "15_25",
      launchStatus: LaunchStatus.UPCOMING,
      expectedLaunchDate: "January 2025",
      isDateConfirmed: true,
      expectedPriceMinLakh: 18.90,
      expectedPriceMaxLakh: 26.00,
      isFeatured: true,
      engineOrBattery: "59 kWh / 79 kWh INGLO Architecture",
      powerBhp: "282 bhp",
      torqueNm: "380 Nm",
      mileageOrRange: "550 km range",
    },
    {
      name: "Tata Sierra EV",
      slug: "tata-sierra-ev",
      brandId: brandRecords["tata"],
      category: VehicleType.CAR,
      bodyType: "Electric SUV",
      fuelTypes: ["Electric"],
      transmissionTypes: ["Automatic"],
      heroImage: "/vehicles/cars/tata/tata-curvv/hero.jpg",
      priceMin: 2500000,
      priceMax: 3200000,
      budgetRange: "20_above",
      launchStatus: LaunchStatus.UPCOMING,
      expectedLaunchDate: "Late 2025",
      isDateConfirmed: false,
      expectedPriceMinLakh: 25.00,
      expectedPriceMaxLakh: 32.00,
      isFeatured: true,
      engineOrBattery: "60 kWh Acti.ev Gen2 Architecture",
      powerBhp: "204 bhp",
      torqueNm: "310 Nm",
      mileageOrRange: "520 km range",
    },
    {
      name: "Hyundai Creta EV",
      slug: "hyundai-creta-ev",
      brandId: brandRecords["hyundai"],
      category: VehicleType.CAR,
      bodyType: "Electric SUV",
      fuelTypes: ["Electric"],
      transmissionTypes: ["Automatic"],
      heroImage: "/vehicles/cars/hyundai/hyundai-creta/hero.png",
      priceMin: 2200000,
      priceMax: 2800000,
      budgetRange: "20_above",
      launchStatus: LaunchStatus.UPCOMING,
      expectedLaunchDate: "January 2025",
      isDateConfirmed: true,
      expectedPriceMinLakh: 22.00,
      expectedPriceMaxLakh: 28.00,
      isFeatured: true,
      engineOrBattery: "45 kWh Lithium-ion Pack",
      powerBhp: "138 bhp",
      torqueNm: "255 Nm",
      mileageOrRange: "450 km range",
    },
  ];

  for (const v of upcomingEVs) {
    await db.vehicle.upsert({
      where: { slug: v.slug },
      update: {
        launchStatus: v.launchStatus,
        expectedLaunchDate: v.expectedLaunchDate,
        expectedPriceMinLakh: v.expectedPriceMinLakh,
        expectedPriceMaxLakh: v.expectedPriceMaxLakh,
        heroImage: v.heroImage,
        isFeatured: v.isFeatured,
      },
      create: v,
    });
    console.log(`✓ Upserted Upcoming EV: ${v.name}`);
  }

  console.log("=== Successfully updated vehicle statuses and upcoming cars! ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
