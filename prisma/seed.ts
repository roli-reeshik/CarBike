import {
  LaunchStatus,
  Prisma,
  PrismaClient,
  VehicleType,
} from "@prisma/client";

const prisma = new PrismaClient();

const img = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=80`;

const images = {
  nexon: img("photo-1519641471654-76ce0107ad1b"),
  nexonRed: img("photo-1541899481282-d53bffe3c35d"),
  nexonGrey: img("photo-1492144534655-ae79c964c9d7"),
  nexonBlue: img("photo-1552519507-da3b142c6e3d"),
  xuv700: img("photo-1533473359331-0135ef1b58bf"),
  xuvBlack: img("photo-1511919884226-fd3cad34687c"),
  xuvRed: img("photo-1503376780353-7e6692767b70"),
  classic350: img("photo-1558981403-c5f9899a28bc"),
  classicSand: img("photo-1449426468159-d96dbf08f19f"),
  classicRed: img("photo-1558981806-ec527fa84c39"),
  raider: img("photo-1568772585407-9361f9bf3a87"),
  raiderRed: img("photo-1525160354320-d8e92641c563"),
  raiderBlack: img("photo-1558981806-ec527fa84c39"),
  curvv: img("photo-1593941707882-a5bba14938c7"),
  curvvWhite: img("photo-1560958089-b8a1929cea89"),
  brezza: img("photo-1549317661-bd32c8ce0db2"),
  brezzaSilver: img("photo-1606664515524-ed2f786a0bd6"),
  spy1: img("photo-1503376780353-7e6692767b70"),
  spy2: img("photo-1492144534655-ae79c964c9d7"),
};

type VariantSeed = {
  name: string;
  exShowroomPrice: number;
  engineCc?: number;
  powerBhp?: number;
  torqueNm?: number;
  mileageKmpl?: number;
  transmission: string;
  seatingCapacity?: number;
  keyFeatures: string[];
};

type ColorSeed = {
  name: string;
  hexCode: string;
  previewUrl: string;
};

type DealerSeed = {
  name: string;
  city: string;
  state?: string;
  address: string;
  phone: string;
  rating: number;
};

type ReviewSeed = {
  authorName: string;
  city: string;
  ratingOverall: number;
  ratingMileage?: number;
  ratingComfort?: number;
  title: string;
  comment: string;
};

type VehicleSeed = {
  slug: string;
  name: string;
  category: VehicleType;
  tagline: string;
  bodyType: string;
  fuelTypes: string[];
  transmissionTypes: string[];
  heroImage: string;
  priceMin: number;
  priceMax: number;
  budgetRange: string;
  ncapRating?: number;
  isFeatured?: boolean;
  launchStatus?: LaunchStatus;
  expectedLaunchDate?: string;
  isDateConfirmed?: boolean;
  expectedPriceMinLakh?: number;
  expectedPriceMaxLakh?: number;
  preBookingAmount?: string;
  spyShotGallery?: string[];
  engineOrBattery: string;
  powerBhp: string;
  torqueNm: string;
  mileageOrRange: string;
  groundClearanceMm?: number;
  seatingCapacity?: number;
  bikeStyle?: string;
  variants: VariantSeed[];
  colors: ColorSeed[];
  dealers?: DealerSeed[];
  reviews?: ReviewSeed[];
};

type BrandSeed = {
  name: string;
  slug: string;
  vehicleType: VehicleType;
  vehicles: VehicleSeed[];
};

const money = (rupees: number) => rupees.toFixed(2);

const onRoad = (exShowroom: number) => Math.round(exShowroom * 1.14).toFixed(2);

const brands: BrandSeed[] = [
  {
    name: "Tata Motors",
    slug: "tata-motors",
    vehicleType: VehicleType.CAR,
    vehicles: [
      {
        slug: "tata-nexon-facelift",
        name: "Tata Nexon Facelift",
        category: VehicleType.CAR,
        tagline: "India's bestselling compact SUV, refreshed.",
        bodyType: "Compact SUV",
        fuelTypes: ["Petrol"],
        transmissionTypes: ["Manual", "Automatic"],
        heroImage: images.nexon,
        priceMin: 731890,
        priceMax: 1216690,
        budgetRange: "under_8",
        ncapRating: 5,
        isFeatured: true,
        launchStatus: LaunchStatus.LAUNCHED,
        engineOrBattery: "1.2L Revotron turbo petrol",
        powerBhp: "118 bhp",
        torqueNm: "170 Nm",
        mileageOrRange: "17.4 kmpl",
        groundClearanceMm: 208,
        seatingCapacity: 5,
        variants: [
          {
            name: "Smart",
            exShowroomPrice: 731890,
            engineCc: 1199,
            powerBhp: 118.35,
            torqueNm: 170,
            mileageKmpl: 17.44,
            transmission: "Manual",
            seatingCapacity: 5,
            keyFeatures: [
              "7-inch touchscreen",
              "Dual airbags",
              "Rear parking sensors",
              "LED DRLs",
            ],
          },
          {
            name: "Creative DCA",
            exShowroomPrice: 1149990,
            engineCc: 1199,
            powerBhp: 118.35,
            torqueNm: 170,
            mileageKmpl: 16.5,
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: [
              "10.25-inch touchscreen",
              "Dual-clutch automatic",
              "Ventilated front seats",
              "Wireless Android Auto and Apple CarPlay",
              "6 airbags",
            ],
          },
          {
            name: "Fearless+ S",
            exShowroomPrice: 1216690,
            engineCc: 1199,
            powerBhp: 118.35,
            torqueNm: 170,
            mileageKmpl: 17.01,
            transmission: "Manual",
            seatingCapacity: 5,
            keyFeatures: [
              "Sunroof",
              "360-degree camera",
              "ADAS",
              "JBL sound system",
              "6 airbags",
            ],
          },
        ],
        colors: [
          { name: "Flame Red", hexCode: "#C8102E", previewUrl: images.nexonRed },
          { name: "Daytona Grey", hexCode: "#4B4F54", previewUrl: images.nexonGrey },
          { name: "Creative Ocean", hexCode: "#1F4E79", previewUrl: images.nexonBlue },
        ],
        dealers: [
          {
            name: "Tata Motors, Moti Nagar",
            city: "Delhi/NCR",
            address: "Najafgarh Road, Moti Nagar, New Delhi",
            phone: "011-4000-1101",
            rating: 4.5,
          },
          {
            name: "Tata Motors Showroom, Andheri",
            city: "Mumbai",
            address: "Veera Desai Road, Andheri West, Mumbai",
            phone: "022-4000-1102",
            rating: 4.6,
          },
          {
            name: "Tata Motors, Indiranagar",
            city: "Bengaluru",
            address: "100 Feet Road, Indiranagar, Bengaluru",
            phone: "080-4000-1103",
            rating: 4.4,
          },
          {
            name: "Tata Motors, Gomti Nagar",
            city: "Lucknow",
            address: "Vibhuti Khand, Gomti Nagar, Lucknow",
            phone: "0522-4000-1104",
            rating: 4.3,
          },
        ],
        reviews: [
          {
            authorName: "Amit Sharma",
            city: "Pune",
            ratingOverall: 5,
            ratingMileage: 4,
            ratingComfort: 5,
            title: "City SUV that finally feels premium",
            comment:
              "The facelift cabin is a big step up. Creative DCA is smooth in Pune traffic and the ride stays composed over broken patches.",
          },
        ],
      },
      {
        slug: "tata-curvv-ev",
        name: "Tata Curvv EV",
        category: VehicleType.CAR,
        tagline: "Coupe-SUV electric. Pre-booking is open.",
        bodyType: "SUV Coupe",
        fuelTypes: ["EV"],
        transmissionTypes: ["Automatic"],
        heroImage: images.curvv,
        priceMin: 1749000,
        priceMax: 2199000,
        budgetRange: "15_25",
        ncapRating: 5,
        isFeatured: true,
        launchStatus: LaunchStatus.PRE_BOOKING_OPEN,
        expectedLaunchDate: "Q2 2027",
        isDateConfirmed: false,
        expectedPriceMinLakh: 17.49,
        expectedPriceMaxLakh: 21.99,
        preBookingAmount: "21000",
        spyShotGallery: [images.spy1, images.curvv],
        engineOrBattery: "55 kWh battery",
        powerBhp: "167 bhp",
        torqueNm: "215 Nm",
        mileageOrRange: "585 km ARAI",
        groundClearanceMm: 190,
        seatingCapacity: 5,
        variants: [
          {
            name: "Creative",
            exShowroomPrice: 1749000,
            powerBhp: 150,
            torqueNm: 215,
            mileageKmpl: 502,
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: [
              "45 kWh battery pack",
              "DC fast charging",
              "10.25-inch touchscreen",
              "Ventilated front seats",
            ],
          },
          {
            name: "Empowered",
            exShowroomPrice: 2199000,
            powerBhp: 167,
            torqueNm: 215,
            mileageKmpl: 585,
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: [
              "55 kWh battery pack",
              "ADAS",
              "Panoramic sunroof",
              "V2L power outlet",
            ],
          },
        ],
        colors: [
          { name: "Empowered Oxide", hexCode: "#E8772E", previewUrl: images.curvv },
          { name: "Pristine White", hexCode: "#F5F5F5", previewUrl: images.curvvWhite },
        ],
        dealers: [
          {
            name: "Tata EV Studio, Connaught Place",
            city: "Delhi/NCR",
            address: "Connaught Place, New Delhi",
            phone: "011-4000-2101",
            rating: 4.6,
          },
          {
            name: "Tata EV Studio, Bandra",
            city: "Mumbai",
            address: "Linking Road, Bandra West, Mumbai",
            phone: "022-4000-2102",
            rating: 4.5,
          },
        ],
      },
    ],
  },
  {
    name: "Mahindra",
    slug: "mahindra",
    vehicleType: VehicleType.CAR,
    vehicles: [
      {
        slug: "mahindra-xuv700-7-seater",
        name: "Mahindra XUV700 7-Seater",
        category: VehicleType.CAR,
        tagline: "Three-row presence with AX5 and AX7 automatic.",
        bodyType: "Mid-Size SUV",
        fuelTypes: ["Petrol"],
        transmissionTypes: ["Automatic"],
        heroImage: images.xuv700,
        priceMin: 1897000,
        priceMax: 1993000,
        budgetRange: "15_25",
        ncapRating: 5,
        isFeatured: true,
        launchStatus: LaunchStatus.LAUNCHED,
        engineOrBattery: "2.0L mStallion turbo petrol",
        powerBhp: "200 bhp",
        torqueNm: "380 Nm",
        mileageOrRange: "12.4 kmpl",
        groundClearanceMm: 200,
        seatingCapacity: 7,
        variants: [
          {
            name: "AX5 AT",
            exShowroomPrice: 1897000,
            engineCc: 1997,
            powerBhp: 200,
            torqueNm: 380,
            mileageKmpl: 12.4,
            transmission: "Automatic",
            seatingCapacity: 7,
            keyFeatures: [
              "7 seats",
              "Panoramic sunroof",
              "AdrenoX dual screens",
              "6 airbags",
            ],
          },
          {
            name: "AX7 AT",
            exShowroomPrice: 1993000,
            engineCc: 1997,
            powerBhp: 200,
            torqueNm: 380,
            mileageKmpl: 12.2,
            transmission: "Automatic",
            seatingCapacity: 7,
            keyFeatures: [
              "7 seats",
              "ADAS",
              "Sony 3D sound",
              "Ventilated seats",
              "Wireless charging",
            ],
          },
        ],
        colors: [
          { name: "Midnight Black", hexCode: "#121212", previewUrl: images.xuvBlack },
          { name: "Dazzling Silver", hexCode: "#C5C7C9", previewUrl: images.xuv700 },
          { name: "Red Rage", hexCode: "#9B1B30", previewUrl: images.xuvRed },
        ],
        dealers: [
          {
            name: "Mahindra Arena, Dwarka",
            city: "Delhi/NCR",
            address: "Sector 12, Dwarka, New Delhi",
            phone: "011-4000-2201",
            rating: 4.6,
          },
          {
            name: "Mahindra Arena, Andheri",
            city: "Mumbai",
            address: "Andheri East, Mumbai",
            phone: "022-4000-2202",
            rating: 4.5,
          },
          {
            name: "Mahindra Arena, Whitefield",
            city: "Bengaluru",
            address: "Whitefield Main Road, Bengaluru",
            phone: "080-4000-2203",
            rating: 4.7,
          },
          {
            name: "Mahindra Arena, Gomti Nagar",
            city: "Lucknow",
            address: "Gomti Nagar, Lucknow",
            phone: "0522-4000-2204",
            rating: 4.4,
          },
        ],
        reviews: [
          {
            authorName: "Neha Iyer",
            city: "Bengaluru",
            ratingOverall: 5,
            ratingMileage: 3,
            ratingComfort: 5,
            title: "The highway car the family asked for",
            comment:
              "AX7 AT in the third row is usable for kids, and the petrol automatic has real overtaking pace on the NICE Road.",
          },
        ],
      },
    ],
  },
  {
    name: "Royal Enfield",
    slug: "royal-enfield",
    vehicleType: VehicleType.BIKE,
    vehicles: [
      {
        slug: "royal-enfield-classic-350-j-series",
        name: "Classic 350 J-Series",
        category: VehicleType.BIKE,
        tagline: "The J-series thump, easier to live with every day.",
        bodyType: "Cruiser",
        fuelTypes: ["Petrol"],
        transmissionTypes: ["Manual"],
        heroImage: images.classic350,
        priceMin: 193000,
        priceMax: 224000,
        budgetRange: "1.5_2.5",
        isFeatured: true,
        launchStatus: LaunchStatus.LAUNCHED,
        engineOrBattery: "349cc air-oil cooled single",
        powerBhp: "20.2 bhp",
        torqueNm: "27 Nm",
        mileageOrRange: "35 kmpl",
        groundClearanceMm: 170,
        bikeStyle: "Cruiser",
        variants: [
          {
            name: "Redditch",
            exShowroomPrice: 193000,
            engineCc: 349,
            powerBhp: 20.2,
            torqueNm: 27,
            mileageKmpl: 35,
            transmission: "Manual",
            keyFeatures: ["Single-channel ABS", "Tripper navigation pod", "Halcyon paint"],
          },
          {
            name: "Dark",
            exShowroomPrice: 216000,
            engineCc: 349,
            powerBhp: 20.2,
            torqueNm: 27,
            mileageKmpl: 35,
            transmission: "Manual",
            keyFeatures: ["Blacked-out finish", "Dual-channel ABS", "USB charging"],
          },
          {
            name: "Signals",
            exShowroomPrice: 224000,
            engineCc: 349,
            powerBhp: 20.2,
            torqueNm: 27,
            mileageKmpl: 35,
            transmission: "Manual",
            keyFeatures: ["Signals edition colours", "Dual-channel ABS", "LED headlamp"],
          },
        ],
        colors: [
          { name: "Halcyon Black", hexCode: "#1A1A1A", previewUrl: images.classic350 },
          { name: "Signals Desert Sand", hexCode: "#C2A878", previewUrl: images.classicSand },
          { name: "Chrome Red", hexCode: "#7A1F2B", previewUrl: images.classicRed },
        ],
        dealers: [
          {
            name: "Royal Enfield, Khan Market",
            city: "Delhi/NCR",
            address: "Khan Market, New Delhi",
            phone: "011-4000-3301",
            rating: 4.7,
          },
          {
            name: "Royal Enfield, Bandra",
            city: "Mumbai",
            address: "Turner Road, Bandra West, Mumbai",
            phone: "022-4000-3302",
            rating: 4.6,
          },
          {
            name: "Royal Enfield Showroom, Indiranagar",
            city: "Bengaluru",
            address: "100 Feet Road, Indiranagar, Bengaluru",
            phone: "080-4000-3303",
            rating: 4.8,
          },
          {
            name: "Royal Enfield, Hazratganj",
            city: "Lucknow",
            address: "Hazratganj, Lucknow",
            phone: "0522-4000-3304",
            rating: 4.5,
          },
        ],
        reviews: [
          {
            authorName: "Rahul Menon",
            city: "Jaipur",
            ratingOverall: 4,
            ratingMileage: 4,
            ratingComfort: 4,
            title: "Still the Sunday-morning classic",
            comment:
              "J-series is lighter in traffic than the older UCE bike. Signals gets the looks; the thump is the reason you keep it.",
          },
        ],
      },
    ],
  },
  {
    name: "TVS",
    slug: "tvs",
    vehicleType: VehicleType.BIKE,
    vehicles: [
      {
        slug: "tvs-raider-125-tft-connected",
        name: "Raider 125 TFT Connected",
        category: VehicleType.BIKE,
        tagline: "125cc commuter with a TFT dash and SmartXonnect.",
        bodyType: "Commuter",
        fuelTypes: ["Petrol"],
        transmissionTypes: ["Manual"],
        heroImage: images.raider,
        priceMin: 99000,
        priceMax: 108000,
        budgetRange: "under_1.5",
        isFeatured: false,
        launchStatus: LaunchStatus.LAUNCHED,
        engineOrBattery: "124.8cc air-oil cooled single",
        powerBhp: "11.4 bhp",
        torqueNm: "11.2 Nm",
        mileageOrRange: "56 kmpl",
        groundClearanceMm: 180,
        bikeStyle: "Commuter",
        variants: [
          {
            name: "Disc",
            exShowroomPrice: 99000,
            engineCc: 125,
            powerBhp: 11.38,
            torqueNm: 11.2,
            mileageKmpl: 56,
            transmission: "Manual",
            keyFeatures: ["Front disc brake", "Digital console", "Adjustable mono-shock"],
          },
          {
            name: "TFT Connected",
            exShowroomPrice: 108000,
            engineCc: 125,
            powerBhp: 11.38,
            torqueNm: 11.2,
            mileageKmpl: 56,
            transmission: "Manual",
            keyFeatures: [
              "TFT display",
              "SmartXonnect",
              "Turn-by-turn navigation",
              "Single-channel ABS",
            ],
          },
        ],
        colors: [
          { name: "Racing Blue", hexCode: "#1B4F9C", previewUrl: images.raider },
          { name: "Striking Red", hexCode: "#D7263D", previewUrl: images.raiderRed },
          { name: "Gloss Black", hexCode: "#111111", previewUrl: images.raiderBlack },
        ],
        dealers: [
          {
            name: "TVS, Karol Bagh",
            city: "Delhi/NCR",
            address: "Ajmal Khan Road, Karol Bagh, New Delhi",
            phone: "011-4000-4401",
            rating: 4.3,
          },
          {
            name: "TVS, Andheri",
            city: "Mumbai",
            address: "S V Road, Andheri West, Mumbai",
            phone: "022-4000-4402",
            rating: 4.4,
          },
          {
            name: "TVS, Jayanagar",
            city: "Bengaluru",
            address: "4th Block, Jayanagar, Bengaluru",
            phone: "080-4000-4403",
            rating: 4.5,
          },
          {
            name: "TVS, Alambagh",
            city: "Lucknow",
            address: "Kanpur Road, Alambagh, Lucknow",
            phone: "0522-4000-4404",
            rating: 4.2,
          },
        ],
        reviews: [
          {
            authorName: "Karthik Rao",
            city: "Chennai",
            ratingOverall: 4,
            ratingMileage: 5,
            ratingComfort: 4,
            title: "Best commuter screen in the class",
            comment:
              "TFT Connected is worth the step up. Navigation on the dash is useful, and the 125 still returns mid-50s on my Anna Nagar loop.",
          },
        ],
      },
    ],
  },
  {
    name: "Maruti Suzuki",
    slug: "maruti-suzuki",
    vehicleType: VehicleType.CAR,
    vehicles: [
      {
        slug: "maruti-brezza-hybrid",
        name: "Maruti Brezza Hybrid",
        category: VehicleType.CAR,
        tagline: "The compact SUV, expected with a stronger hybrid assist.",
        bodyType: "Compact SUV",
        fuelTypes: ["Petrol"],
        transmissionTypes: ["Automatic"],
        heroImage: images.brezza,
        priceMin: 1250000,
        priceMax: 1580000,
        budgetRange: "8_15",
        ncapRating: 4,
        isFeatured: false,
        launchStatus: LaunchStatus.UPCOMING,
        expectedLaunchDate: "H2 2027",
        isDateConfirmed: false,
        expectedPriceMinLakh: 12.5,
        expectedPriceMaxLakh: 15.8,
        spyShotGallery: [images.spy2, images.brezza],
        engineOrBattery: "1.5L mild-hybrid petrol",
        powerBhp: "103 bhp",
        torqueNm: "137 Nm",
        mileageOrRange: "22 kmpl expected",
        groundClearanceMm: 198,
        seatingCapacity: 5,
        variants: [
          {
            name: "VXi Hybrid",
            exShowroomPrice: 1250000,
            engineCc: 1462,
            powerBhp: 103,
            torqueNm: 137,
            mileageKmpl: 21.5,
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: ["Smart hybrid", "7-inch touchscreen", "Rear camera"],
          },
          {
            name: "ZXi+ Hybrid",
            exShowroomPrice: 1580000,
            engineCc: 1462,
            powerBhp: 103,
            torqueNm: 137,
            mileageKmpl: 22,
            transmission: "Automatic",
            seatingCapacity: 5,
            keyFeatures: [
              "Heads-up display",
              "360-degree camera",
              "6 airbags",
              "Sunroof",
            ],
          },
        ],
        colors: [
          { name: "Brave Khaki", hexCode: "#8B7D4E", previewUrl: images.brezza },
          { name: "Splendid Silver", hexCode: "#D9D9D9", previewUrl: images.brezzaSilver },
        ],
        dealers: [
          {
            name: "Maruti Suzuki Arena, Lajpat Nagar",
            city: "Delhi/NCR",
            address: "Ring Road, Lajpat Nagar, New Delhi",
            phone: "011-4000-5501",
            rating: 4.5,
          },
          {
            name: "Maruti Suzuki Arena, Hazratganj",
            city: "Lucknow",
            address: "Hazratganj, Lucknow",
            phone: "0522-4000-5502",
            rating: 4.4,
          },
        ],
      },
    ],
  },
];

function variantCreate(
  variant: VariantSeed,
): Prisma.VariantCreateWithoutVehicleInput {
  return {
    name: variant.name,
    exShowroomPrice: money(variant.exShowroomPrice),
    onRoadPriceEst: onRoad(variant.exShowroomPrice),
    engineCc: variant.engineCc,
    powerBhp: variant.powerBhp?.toFixed(2),
    torqueNm: variant.torqueNm?.toFixed(2),
    mileageKmpl: variant.mileageKmpl?.toFixed(2),
    transmission: variant.transmission,
    seatingCapacity: variant.seatingCapacity,
    keyFeatures: variant.keyFeatures,
  };
}

function vehicleData(
  brandId: string,
  vehicle: VehicleSeed,
): Prisma.VehicleCreateInput {
  return {
    brand: { connect: { id: brandId } },
    name: vehicle.name,
    slug: vehicle.slug,
    category: vehicle.category,
    tagline: vehicle.tagline,
    bodyType: vehicle.bodyType,
    fuelTypes: vehicle.fuelTypes,
    transmissionTypes: vehicle.transmissionTypes,
    heroImage: vehicle.heroImage,
    priceMin: money(vehicle.priceMin),
    priceMax: money(vehicle.priceMax),
    budgetRange: vehicle.budgetRange,
    ncapRating: vehicle.ncapRating,
    isFeatured: vehicle.isFeatured ?? false,
    launchStatus: vehicle.launchStatus ?? LaunchStatus.LAUNCHED,
    expectedLaunchDate: vehicle.expectedLaunchDate,
    isDateConfirmed: vehicle.isDateConfirmed ?? false,
    expectedPriceMinLakh: vehicle.expectedPriceMinLakh?.toFixed(2),
    expectedPriceMaxLakh: vehicle.expectedPriceMaxLakh?.toFixed(2),
    preBookingAmount: vehicle.preBookingAmount,
    spyShotGallery: vehicle.spyShotGallery ?? [],
    engineOrBattery: vehicle.engineOrBattery,
    powerBhp: vehicle.powerBhp,
    torqueNm: vehicle.torqueNm,
    mileageOrRange: vehicle.mileageOrRange,
    groundClearanceMm: vehicle.groundClearanceMm,
    seatingCapacity: vehicle.seatingCapacity,
    bikeStyle: vehicle.bikeStyle,
  };
}

async function upsertVehicle(brandId: string, vehicle: VehicleSeed) {
  const scalar = vehicleData(brandId, vehicle);
  const dealerCreates = (vehicle.dealers ?? []).map((d) => ({
    name: d.name,
    city: d.city,
    state: d.state || "Delhi",
    address: d.address,
    phone: d.phone,
    rating: d.rating,
    brandId,
  }));
  const children = {
    variants: { create: vehicle.variants.map(variantCreate) },
    colors: { create: vehicle.colors },
    dealers: { create: dealerCreates },
    reviews: { create: vehicle.reviews ?? [] },
  };

  await prisma.vehicle.upsert({
    where: { slug: vehicle.slug },
    create: { ...scalar, ...children },
    update: {
      ...scalar,
      variants: { deleteMany: {}, ...children.variants },
      colors: { deleteMany: {}, ...children.colors },
      dealers: { deleteMany: {}, ...children.dealers },
      reviews: { deleteMany: {}, ...children.reviews },
    },
  });
}

async function main() {
  for (const brand of brands) {
    const savedBrand = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, vehicleType: brand.vehicleType },
      create: {
        name: brand.name,
        slug: brand.slug,
        vehicleType: brand.vehicleType,
      },
    });

    for (const vehicle of brand.vehicles) {
      await upsertVehicle(savedBrand.id, vehicle);
      console.log(`Seeded ${brand.name} / ${vehicle.name}`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
