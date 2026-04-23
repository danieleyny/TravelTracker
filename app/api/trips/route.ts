import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ["driverName", "vehicleId", "tripDate", "fromAddress", "toAddress", "distanceMiles", "purposeCategory"];
  for (const k of required) {
    if (body[k] == null || body[k] === "") {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }
  const distance = Number(body.distanceMiles);
  if (!Number.isFinite(distance) || distance <= 0) {
    return NextResponse.json({ error: "Distance must be > 0" }, { status: 400 });
  }

  const trip = await prisma.trip.create({
    data: {
      driverName: String(body.driverName).trim(),
      vehicleId: String(body.vehicleId),
      tripDate: new Date(`${body.tripDate}T12:00:00`),
      fromAddress: String(body.fromAddress).trim(),
      toAddress: String(body.toAddress).trim(),
      distanceMiles: distance,
      startOdometer: body.startOdometer != null ? Number(body.startOdometer) : null,
      endOdometer: body.endOdometer != null ? Number(body.endOdometer) : null,
      purposeCategory: String(body.purposeCategory),
      purposeNotes: body.purposeNotes ? String(body.purposeNotes).trim() : null,
    },
  });

  return NextResponse.json(trip, { status: 201 });
}
