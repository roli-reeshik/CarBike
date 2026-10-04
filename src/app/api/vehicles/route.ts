import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { resolveVehicle } from "@/lib/vehicle-resolver";
import { searchVehicles } from "@/lib/requirements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Direct vehicle slug resolution
  const slug = searchParams.get("slug");
  if (slug) {
    const brand = searchParams.get("brand") || undefined;
    const forceSync =
      searchParams.get("forceSync") === "true" ||
      searchParams.get("forceSync") === "1" ||
      searchParams.get("sync") === "true";

    const result = await resolveVehicle(slug, {
      brandSlug: brand,
      forceSync,
    });

    if (!result.vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Vehicle "${slug}" could not be found or resolved.`,
          source: result.source,
          synced: result.synced,
          durationMs: result.durationMs,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      source: result.source,
      synced: result.synced,
      durationMs: result.durationMs,
      vehicle: result.vehicle,
    });
  }

  const category = searchParams.get("category");
  if (category && category !== "CAR" && category !== "BIKE") {
    return NextResponse.json(
      { error: "category must be CAR or BIKE." },
      { status: 400 },
    );
  }


  try {
    const vehicles = await getCatalog();
    const matches = searchVehicles(vehicles, {
      category,
      brand: searchParams.get("brand"),
      budget: searchParams.get("budget"),
      fuel: searchParams.get("fuel"),
      transmission: searchParams.get("transmission"),
      seating: searchParams.get("seating"),
      riding: searchParams.get("riding"),
      bodyType: searchParams.get("bodyType"),
      q: searchParams.get("q"),
    });
    return NextResponse.json({ vehicles: matches });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "The catalogue is unavailable." },
      { status: 503 },
    );
  }
}
