import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const vehicle = await prisma.vehicle.create({
    data: {
      title,
      make: body.make?.trim() || null,
      model: body.model?.trim() || null,
      year: body.year ? Number(body.year) : null,
      licensePlate: body.licensePlate?.trim() || null,
      vin: body.vin?.trim() || null,
      yearStartOdo: body.yearStartOdo != null ? Number(body.yearStartOdo) : null,
      yearEndOdo: body.yearEndOdo != null ? Number(body.yearEndOdo) : null,
    },
  });
  return NextResponse.json(vehicle, { status: 201 });
}
