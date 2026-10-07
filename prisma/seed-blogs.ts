import { PrismaClient, BlogCategory, BlogStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding automotive blog posts...");

  // Fetch some vehicles to associate
  const tataCurvv = await prisma.vehicle.findFirst({ where: { slug: "tata-curvv" } });
  const cretaEv = await prisma.vehicle.findFirst({ where: { slug: "hyundai-creta-ev" } });
  const himalayan = await prisma.vehicle.findFirst({ where: { slug: "royal-enfield-himalayan-450" } });
  const slavia = await prisma.vehicle.findFirst({ where: { slug: "skoda-slavia" } });
  const thar = await prisma.vehicle.findFirst({ where: { slug: "mahindra-thar" } });

  const posts = [
    {
      title: "2026 Tata Curvv Long-Term Review: Is the Coupe-SUV Style Worth It?",
      slug: "2026-tata-curvv-long-term-review",
      excerpt: "We drove the Tata Curvv across 2,500 km of city traffic and expressway sprints. Here is our unfiltered assessment of its boot practicality, turbo-petrol punch, and highway composure.",
      category: BlogCategory.REVIEWS,
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date("2026-09-15T10:00:00Z"),
      readingTime: 5,
      viewCount: 1420,
      featuredImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      vehicleId: tataCurvv?.id,
      brandId: tataCurvv?.brandId,
      tags: ["Tata Motors", "Coupe SUV", "Review", "Mileage Test"],
      content: `## The Coupe-SUV Disruption in India

When Tata Motors unveiled the production-ready **Curvv**, critics wondered if Indian families would embrace the sloping coupe silhouette in a segment historically dominated by boxy stance and high upright rooflines.

After living with the vehicle across congested Mumbai corridors and wide expressways to Pune, the verdict is definitive: style does not come at the expense of family road-trip capability.

### Powertrain & Driving Dynamics

The new 1.2-litre direct-injection turbo petrol delivers crisp mid-range urge. Mated to the 7-speed wet-clutch DCA (dual-clutch automatic), downshifts in sport mode happen without the annoying head-nod delay common in entry automated manual transmissions.

- **Power Output:** 125 PS @ 5,000 RPM
- **Peak Torque:** 225 Nm @ 1,750 - 4,000 RPM
- **Real-World Fuel Efficiency:** 12.8 kmpl (City) | 17.4 kmpl (Highway)

### Ride Comfort & Ground Clearance

With 208 mm of unladen ground clearance, broken monsoon roads and aggressive municipal speed breakers pose zero intimidation. The suspension setup is firmly damped, keeping high-speed body float strictly in check without jarring passenger spines.

### The Verdict

For buyers seeking distinctive curb presence without sacrificing 500 liters of luggage volume, the Curvv hits an enviable sweet spot in India's mid-size crossover market.`,
    },
    {
      title: "Hyundai Creta EV vs Competitors: Indian Real-World Highway Range Guide",
      slug: "hyundai-creta-ev-highway-range-guide",
      excerpt: "Can the Creta EV genuinely deliver 380 km between fast chargers in 40-degree heat? We break down thermal management, DC fast-charging curve, and regeneration modes.",
      category: BlogCategory.EV_INSIGHTS,
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date("2026-09-22T08:30:00Z"),
      readingTime: 6,
      viewCount: 2890,
      featuredImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
      vehicleId: cretaEv?.id,
      brandId: cretaEv?.brandId,
      tags: ["Hyundai", "EV", "Electric Cars", "Fast Charging", "Range"],
      content: `## Electrifying India's Best-Selling Nameplate

Hyundai's transition of its crown jewel to pure electric drive marks a monumental shift in mass-market EV adoption across tier-1 and tier-2 Indian metros.

### Battery Architecture and Real-World Range

Equipped with a liquid-cooled 45 kWh LFP pack tailored for Indian tropical ambient peaks, the Creta EV claims an ARAI range of 475 km. However, real-world highway driving at triple-digit cruising speeds yields distinct metrics.

| Driving Condition | Air Conditioning | Average Speed | Achieved Real Range |
| ----------------- | ---------------- | ------------- | -------------------- |
| City Stop-Go      | Eco 24°C         | 28 km/h       | 395 km               |
| Expressway Cruise | Normal 22°C      | 95 km/h       | 315 km               |
| Mixed Monsoon Run | Auto 23°C        | 45 km/h       | 350 km               |

### Fast-Charging Infrastructure Compatibility

Plugging into 60 kW CCS2 DC dispensers, the vehicle throttles from 10% to 80% charge in approximately 52 minutes. The pre-conditioning loop successfully prevents thermal saturation during sustained highway quick-stops.

### Who Should Buy It?

If your daily commute spans 40 to 80 km with regular inter-city weekend journeys along electrified corridors, the Creta EV delivers supreme quietness and zero tailpipe emissions with familiar ergonomics.`,
    },
    {
      title: "Royal Enfield Himalayan 450: Essential Maintenance & Spares for Leh-Ladakh",
      slug: "himalayan-450-maintenance-and-spares-leh-ladakh",
      excerpt: "Preparing your Himalayan 450 for the unforgiving mountain passes? Essential checklist covering coolant bleed, chain tension, clutch cable routing, and altitude tuning.",
      category: BlogCategory.MAINTENANCE,
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date("2026-09-28T14:15:00Z"),
      readingTime: 4,
      viewCount: 1980,
      featuredImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
      vehicleId: himalayan?.id,
      brandId: himalayan?.brandId,
      tags: ["Royal Enfield", "Adventure", "Motorcycle Maintenance", "Ladakh"],
      content: `## High-Altitude Preparation for the Sherpa 450 Engine

The liquid-cooled Sherpa 450 platform represents a generational leap in Royal Enfield engineering. However, traversing Khardung La and Chang La demands preventive vigilance.

### 1. Coolant & Thermal Oversight
High altitude decreases the boiling point of liquids. Ensure your expansion tank uses 50:50 distilled water / ethylene glycol mix. Check radiator fins for caked mud after crossing river beds like Pagal Nallah.

### 2. Chain Lubrication and O-ring Protection
Fine dust from sand dunes in Nubra Valley acts like grinding paste. Use a heavy-duty synthetic chain paste rather than thin spray lubes, and inspect rear sprocket wear every 400 km.

### 3. Critical Spare Kit
Carry the following under your pillion seat:
- Spare clutch cable pre-routed alongside the existing line
- Front and rear replacement brake pads
- 5A and 15A mini blade fuses
- Tubeless repair kit if running cross-spoke tubeless wheels`,
    },
    {
      title: "Best Mid-Size Sedans Under ₹20 Lakh in 2026: Slavia, Verna or City?",
      slug: "best-mid-size-sedans-under-20-lakh-2026",
      excerpt: "SUVs rule sales charts, but for purists who value driving poise, highway balance, and expansive legroom, the classic sedan war between Škoda, Honda, and Hyundai remains fierce.",
      category: BlogCategory.BUYING_GUIDES,
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date("2026-10-01T11:00:00Z"),
      readingTime: 5,
      viewCount: 3120,
      featuredImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      vehicleId: slavia?.id,
      brandId: slavia?.brandId,
      tags: ["Sedan", "Buying Guide", "Skoda Slavia", "Comparison"],
      content: `## The Great Indian Sedan Showdown

While compact SUVs capture market share, the executive sedan triumvirate—**Škoda Slavia**, **Hyundai Verna**, and **Honda City**—offers superior high-speed poise, aerodynamic efficiency, and boot capacities exceeding 520 liters.

### Performance & Engine Hierarchy

- **Škoda Slavia 1.5 TSI:** 150 PS and cylinder deactivation technology. The purist's darling with a planted European chassis.
- **Hyundai Verna 1.5 Turbo:** 160 PS with rapid-fire 7-speed DCT. Outright fastest 0-100 km/h sprint times in the segment.
- **Honda City 1.5 i-VTEC & e:HEV:** Smooth linear naturally aspirated roar or benchmark-shattering 26+ kmpl strong-hybrid thrift.

### Which One Belongs in Your Garage?

1. Choose the **Slavia** if you prioritize solid European door thuds, 5-star NCAP structural integrity, and twisty mountain roads.
2. Choose the **Verna** if you love feature-loaded cabin tech, Level 2 ADAS calibrations, and aggressive passing punch.
3. Choose the **City** for long-term stress-free reliability, plush rear couch seating, and unmatched resale value.`,
    },
    {
      title: "India Automotive Industry News: Stricter Safety Norms & GST Updates for 2027",
      slug: "india-auto-industry-safety-norms-gst-updates-2027",
      excerpt: "The Ministry of Road Transport and Highways (MoRTH) announces updated Bharat NCAP test protocols alongside proposed rate harmonizations for hybrid vehicles.",
      category: BlogCategory.NEWS,
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date("2026-10-04T09:00:00Z"),
      readingTime: 3,
      viewCount: 950,
      featuredImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      vehicleId: thar?.id,
      brandId: thar?.brandId,
      tags: ["Car News", "Bharat NCAP", "MoRTH", "Government Policy"],
      content: `## New Crash Test Benchmarks Announced

The Ministry of Road Transport and Highways has unveiled Version 2.0 of the **Bharat New Car Assessment Programme (Bharat NCAP)**.

Starting mid-2027, the standard evaluation suite will incorporate mandatory active safety assessments including Autonomous Emergency Braking (AEB) and pedestrian protection tests.

### Key Highlights:
- Mandatory 6 airbags now enforced across all passenger car sub-categories.
- Three-point seatbelts with audible reminders for every occupant.
- Proposed GST concessions under review for strong hybrids and alternative flex-fuel engines.`,
    },
  ];

  for (const postData of posts) {
    const { tags, ...rest } = postData;
    await prisma.blogPost.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        tags: {
          set: [],
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: {
              name,
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            },
          })),
        },
      },
      create: {
        ...rest,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: {
              name,
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            },
          })),
        },
      },
    });
  }

  console.log("Successfully seeded blog posts!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
