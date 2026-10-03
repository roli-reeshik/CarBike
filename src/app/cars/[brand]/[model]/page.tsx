import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Calendar,
  CheckCircle2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { LeadCapture } from '@/components/lead-capture';
import { dealerCityOptions } from '@/lib/requirements';

interface PageProps {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      slug: modelSlug,
      brand: {
        slug: {
          in: [brandSlug, brandSlug.replace(/-cars$/, ''), `${brandSlug}-cars`],
        },
      },
    },
    include: {
      brand: true,
    },
  });

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found — CarBikeKharido',
    };
  }

  const minPriceLakh = vehicle.priceMin
    ? (Number(vehicle.priceMin) / 100000).toFixed(2)
    : null;
  const maxPriceLakh = vehicle.priceMax
    ? (Number(vehicle.priceMax) / 100000).toFixed(2)
    : null;

  const priceText =
    minPriceLakh && maxPriceLakh
      ? `₹ ${minPriceLakh} - ${maxPriceLakh} Lakh`
      : minPriceLakh
      ? `₹ ${minPriceLakh} Lakh onwards`
      : 'Price Expected Soon';

  return {
    title: `${vehicle.name} Price, Specs, Variants & Colors — CarBikeKharido`,
    description: `Explore the ${vehicle.name} with estimated ex-showroom price ${priceText}, technical specifications, engine options, variant lineup, and color palette on CarBikeKharido.`,
    openGraph: {
      title: `${vehicle.name} — CarBikeKharido`,
      description: `Official technical specifications, variant details, and pricing for ${vehicle.name}.`,
      images: vehicle.heroImage
        ? [
            {
              url: vehicle.heroImage,
              width: 1200,
              height: 630,
              alt: vehicle.name,
            },
          ]
        : [],
    },
  };
}

export default async function CarModelPage({ params }: PageProps) {
  // 1. Resolve asynchronous route parameters (Next.js 15+)
  const { brand: brandSlug, model: modelSlug } = await params;

  // 2. Fetch vehicle record with relations
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      slug: modelSlug,
      brand: {
        slug: {
          in: [brandSlug, brandSlug.replace(/-cars$/, ''), `${brandSlug}-cars`],
        },
      },
    },
    include: {
      brand: true,
      variants: {
        orderBy: { exShowroomPrice: 'asc' },
      },
      colors: true,
      dealers: true,
      reviews: true,
    },
  });

  if (!vehicle) {
    notFound();
  }

  // 3. Defensive fallbacks for partial or pending vehicle data
  const variants = vehicle.variants || [];
  const colors = vehicle.colors || [];
  const minPriceLakh = vehicle.priceMin
    ? (Number(vehicle.priceMin) / 100000).toFixed(2)
    : null;
  const maxPriceLakh = vehicle.priceMax
    ? (Number(vehicle.priceMax) / 100000).toFixed(2)
    : null;

  const cities = dealerCityOptions(vehicle.dealers || []);

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-sm text-stone-500 mb-6 flex items-center flex-wrap gap-1">
        <Link href="/" className="hover:text-stone-900 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-stone-400">/</span>
        <Link href="/cars" className="hover:text-stone-900 transition-colors">
          Cars
        </Link>
        <span className="mx-2 text-stone-400">/</span>
        <span className="capitalize">{vehicle.brand?.name || brandSlug}</span>
        <span className="mx-2 text-stone-400">/</span>
        <span className="text-stone-900 font-semibold">{vehicle.name}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            {vehicle.launchStatus ? vehicle.launchStatus.replace(/_/g, ' ') : 'LAUNCHED'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {vehicle.name}
          </h1>
          <p className="text-stone-500 mt-1">
            {vehicle.tagline || `${vehicle.bodyType || 'Vehicle'} by ${vehicle.brand?.name || 'Manufacturer'}`}
          </p>

          <div className="mt-6">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {minPriceLakh && maxPriceLakh
                ? `₹ ${minPriceLakh} - ${maxPriceLakh} Lakh`
                : minPriceLakh
                ? `₹ ${minPriceLakh} Lakh onwards`
                : 'Price Coming Soon'}
            </span>
            <span className="text-xs text-stone-400 block mt-0.5">Estimated Ex-Showroom</span>
          </div>

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-100 text-center">
            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-xs text-stone-400 uppercase font-medium">Engine</span>
              <p className="text-sm font-bold text-stone-800 truncate mt-0.5">
                {vehicle.engineOrBattery || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-xs text-stone-400 uppercase font-medium">Power</span>
              <p className="text-sm font-bold text-stone-800 truncate mt-0.5">
                {vehicle.powerBhp || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-xs text-stone-400 uppercase font-medium">Torque</span>
              <p className="text-sm font-bold text-stone-800 truncate mt-0.5">
                {vehicle.torqueNm || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl">
              <span className="text-xs text-stone-400 uppercase font-medium">Mileage</span>
              <p className="text-sm font-bold text-stone-800 truncate mt-0.5">
                {vehicle.mileageOrRange || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Image Container */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-100">
          {vehicle.heroImage ? (
            <Image
              src={vehicle.heroImage}
              alt={vehicle.name}
              fill
              className="object-contain p-4 transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="text-stone-400 text-sm font-medium">No Image Available</div>
          )}
        </div>
      </div>

      {/* Vehicle Highlights & Key Dimensions */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
            Body Type
          </span>
          <span className="text-sm font-bold text-stone-900 mt-1 block">
            {vehicle.bodyType || 'SUV'}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
            Fuel Types
          </span>
          <span className="text-sm font-bold text-stone-900 mt-1 block truncate">
            {vehicle.fuelTypes?.length ? vehicle.fuelTypes.join(', ') : 'Petrol'}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
            Transmission
          </span>
          <span className="text-sm font-bold text-stone-900 mt-1 block truncate">
            {vehicle.transmissionTypes?.length ? vehicle.transmissionTypes.join(', ') : 'Manual / Auto'}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
            Seating
          </span>
          <span className="text-sm font-bold text-stone-900 mt-1 block">
            {vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seater` : '5 Seater'}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
            Ground Clearance
          </span>
          <span className="text-sm font-bold text-stone-900 mt-1 block">
            {vehicle.groundClearanceMm ? `${vehicle.groundClearanceMm} mm` : '188 mm (Est.)'}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
            Safety NCAP
          </span>
          <span className="text-sm font-bold text-emerald-700 mt-1 block">
            {vehicle.ncapRating ? `${vehicle.ncapRating} Star Global NCAP` : '5-Star Expected'}
          </span>
        </div>
      </section>

      {/* Variants & Trims Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              {vehicle.name} Variants & Prices
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Compare powertrain, transmission options, and ex-showroom price configurations
            </p>
          </div>
          {variants.length > 0 && (
            <span className="text-xs font-semibold px-3 py-1 bg-stone-200 text-stone-700 rounded-full">
              {variants.length} {variants.length === 1 ? 'Variant' : 'Variants'} Available
            </span>
          )}
        </div>

        {variants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {variants.map((variant) => {
              const priceLakh = variant.exShowroomPrice
                ? (Number(variant.exShowroomPrice) / 100000).toFixed(2)
                : null;
              const formattedPrice = variant.exShowroomPrice
                ? Number(variant.exShowroomPrice).toLocaleString('en-IN')
                : 'TBA';

              return (
                <div
                  key={variant.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:border-stone-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-stone-900 text-base leading-snug">
                        {variant.name}
                      </h3>
                      {variant.powertrain && (
                        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200/60">
                          {variant.powertrain}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                      <span>{variant.transmission || 'Manual'}</span>
                      {variant.mileageKmpl && (
                        <>
                          <span>•</span>
                          <span>{Number(variant.mileageKmpl)} kmpl</span>
                        </>
                      )}
                      {variant.seatingCapacity && (
                        <>
                          <span>•</span>
                          <span>{variant.seatingCapacity} Seater</span>
                        </>
                      )}
                    </div>

                    {variant.keyFeatures && variant.keyFeatures.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                        {variant.keyFeatures.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="truncate max-w-[180px]">{feat}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                        Ex-Showroom
                      </span>
                      <span className="text-lg font-extrabold text-stone-900">
                        {priceLakh ? `₹ ${priceLakh} Lakh` : `₹ ${formattedPrice}`}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      Delhi Ex-Showroom
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Defensive Fallback Empty State Banner */
          <div className="bg-white rounded-3xl p-10 border border-dashed border-stone-300 text-center shadow-sm">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-amber-200/60">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">
              Trim Configurations &amp; Variants Coming Soon
            </h3>
            <p className="text-sm text-stone-500 max-w-xl mx-auto mt-2 leading-relaxed">
              Official variant-level specifications, transmission configurations, and variant ex-showroom prices for the{" "}
              <strong className="text-stone-700 font-semibold">{vehicle.name}</strong> will be announced closer to its nationwide rollout.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 bg-stone-100 text-stone-700 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Expected Launch: {vehicle.expectedLaunchDate || 'Upcoming'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 bg-stone-100 text-stone-700 rounded-full">
                <Tag className="w-3.5 h-3.5 text-emerald-600" /> Indicative Price: {minPriceLakh ? `₹ ${minPriceLakh} Lakh onwards` : 'TBA'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Exterior Colors Section */}
      {colors.length > 0 && (
        <section className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              {vehicle.name} Exterior Color Palette
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Available factory shades and dual-tone combinations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {colors.map((color) => (
              <div
                key={color.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex flex-col items-center text-center group hover:border-stone-300 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-full border-2 border-stone-200 shadow-inner mb-3 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: color.hexCode || '#666',
                    background:
                      color.previewUrl &&
                      !color.previewUrl.startsWith('http') &&
                      !color.previewUrl.startsWith('/')
                        ? color.previewUrl
                        : color.hexCode || '#94a3b8',
                  }}
                />
                <span className="text-xs font-semibold text-stone-800 leading-snug line-clamp-2">
                  {color.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pre-Booking & Test Drive Inquiry */}
      <section className="mt-12 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Priority Access
          </span>
          <h3 className="text-2xl font-bold tracking-tight">
            Interested in the {vehicle.name}?
          </h3>
          <p className="text-stone-300 text-sm mt-1 max-w-lg">
            Register your interest to get official launch dates, exclusive price release alerts, and priority test drive booking notifications.
          </p>
        </div>
        <div className="shrink-0">
          <LeadCapture
            vehicleId={vehicle.id}
            vehicleName={vehicle.name}
            launchStatus={vehicle.launchStatus}
            cities={cities}
          />
        </div>
      </section>
    </div>
  );
}
