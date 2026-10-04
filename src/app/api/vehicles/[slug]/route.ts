import { NextResponse } from "next/server";
import { resolveVehicle } from "@/lib/vehicle-resolver";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const brand = searchParams.get("brand") || undefined;
  const forceSync =
    searchParams.get("forceSync") === "true" ||
    searchParams.get("forceSync") === "1" ||
    searchParams.get("sync") === "true";

  try {
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
  } catch (error) {
    console.error(`[API /api/vehicles/${slug}] Resolution failure:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resolve vehicle.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
