import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Prisma.TripUpdateInput = {};
  if ("driverName" in body) data.driverName = String(body.driverName).trim();
  if ("vehicleId" in body) data.vehicle = { connect: { id: String(body.vehicleId) } };
  if ("tripDate" in body) data.tripDate = new Date(`${body.tripDate}T12:00:00`);
  if ("fromAddress" in body) data.fromAddress = String(body.fromAddress).trim();
  if ("toAddress" in body) data.toAddress = String(body.toAddress).trim();
  if ("distanceMiles" in body) {
    const d = Number(body.distanceMiles);
    if (!Number.isFinite(d) || d <= 0) {
      return NextResponse.json({ error: "Distance must be > 0" }, { status: 400 });
    }
    data.distanceMiles = d;
  }
  if ("isRoundTrip" in body) data.isRoundTrip = Boolean(body.isRoundTrip);
  if ("purposeCategory" in body) data.purposeCategory = String(body.purposeCategory);
  if ("purposeNotes" in body) data.purposeNotes = body.purposeNotes ? String(body.purposeNotes).trim() : null;

  try {
    const trip = await prisma.trip.update({ where: { id: params.id }, data });
    return NextResponse.json(trip);
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.trip.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
}
