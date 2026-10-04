import { RequirementSelector } from "@/components/requirement-selector";
import { BrandLogoGrid } from "@/components/home/BrandLogoGrid";
import { HomeCarShowcase } from "@/components/home/HomeCarShowcase";
import { getCatalog, getHomeShowcaseData, getAllBrands } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [vehicles, showcaseData, allBrands] = await Promise.all([
    getCatalog(),
    getHomeShowcaseData(),
    getAllBrands(),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-8 pb-20 sm:px-6 space-y-12">
      {/* Hero Header */}
      <header className="border-b border-line pb-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">
          CARBIKEKHARIDO
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-ink sm:text-6xl">
          Find the one that fits.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Match cars, bikes, and upcoming EVs in India by budget, fuel, and how you drive. Official ex-showroom pricing, genuine variant feature matrices, and verified OEM touchpoints.
        </p>
      </header>

      {/* 1. Filter & Compare Vehicle Catalog & 2. Cars Match, with all variants */}
      <section id="catalog-filters" className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Filter &amp; Compare Vehicle Catalog
          </h2>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Fine-tune vehicle recommendations by price, body silhouette, fuel type, and transmission.
          </p>
        </div>
        <RequirementSelector vehicles={vehicles} allBrands={allBrands} />
      </section>

      {/* 3. Explore by Official Manufacturers */}
      <section id="official-manufacturers" className="pt-4 border-t border-line/70">
        <BrandLogoGrid
          brands={showcaseData.brands}
          title="Explore by Official Manufacturers"
          subtitle="Click any brand to explore all available models, variant price ladders, and authorized dealer networks."
        />
      </section>

      {/* 4. Cars in India — Explore Brands & New Launches */}
      <section id="market-showcase" className="pt-4 border-t border-line/70">
        <HomeCarShowcase
          brands={showcaseData.brands}
          newLaunches={showcaseData.newLaunches}
          upcoming={showcaseData.upcoming}
          popular={showcaseData.popular}
        />
      </section>
    </main>
  );
}
