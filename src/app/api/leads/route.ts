import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leadRequestSchema } from "@/lib/leads";
import { normalizeIndianMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON lead." }, { status: 400 });
  }

  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Check the lead details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const phone = normalizeIndianMobile(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      {
        error: "Enter a 10-digit Indian mobile number.",
        fieldErrors: { phone: ["Enter a 10-digit Indian mobile number."] },
      },
      { status: 400 },
    );
  }

  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id: parsed.data.vehicleId },
      select: { id: true, launchStatus: true },
    });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    if (
      vehicle.launchStatus !== "LAUNCHED" &&
      parsed.data.leadType === "TEST_DRIVE"
    ) {
      return NextResponse.json(
        { error: "Upcoming models take a launch alert, not a test drive." },
        { status: 400 },
      );
    }

    let variantId: string | null = null;
    if (parsed.data.variantId) {
      const variant = await db.variant.findFirst({
        where: { id: parsed.data.variantId, vehicleId: vehicle.id },
        select: { id: true },
      });
      if (!variant) {
        return NextResponse.json(
          { error: "That trim does not belong to this vehicle." },
          { status: 400 },
        );
      }
      variantId = variant.id;
    }

    const lead = await db.lead.create({
      data: {
        userName: parsed.data.userName,
        phone,
        city: parsed.data.city,
        vehicleId: vehicle.id,
        variantId,
        leadType: parsed.data.leadType,
      },
      select: { id: true, leadType: true, status: true },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "The lead could not be saved." },
      { status: 503 },
    );
  }
}
