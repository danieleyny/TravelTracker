import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Prisma.VehicleUpdateInput = {};
  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    data.title = t;
  }
  if ("make" in body) data.make = body.make?.trim() || null;
  if ("model" in body) data.model = body.model?.trim() || null;
  if ("year" in body) data.year = body.year ? Number(body.year) : null;
  if ("licensePlate" in body) data.licensePlate = body.licensePlate?.trim() || null;
  if ("vin" in body) data.vin = body.vin?.trim() || null;
  if ("yearStartOdo" in body) data.yearStartOdo = body.yearStartOdo != null ? Number(body.yearStartOdo) : null;
  if ("yearEndOdo" in body) data.yearEndOdo = body.yearEndOdo != null ? Number(body.yearEndOdo) : null;

  try {
    const v = await prisma.vehicle.update({ where: { id: params.id }, data });
    return NextResponse.json(v);
  } catch {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json(
        { error: "Can't delete — this vehicle has trips logged. Remove those first." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
