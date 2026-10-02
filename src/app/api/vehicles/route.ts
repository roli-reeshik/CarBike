import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { searchVehicles } from "@/lib/requirements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
