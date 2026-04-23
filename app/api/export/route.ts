import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const yearParam = url.searchParams.get("year");
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const trips = await prisma.trip.findMany({
    where: { tripDate: { gte: start, lt: end } },
    orderBy: { tripDate: "asc" },
    include: { vehicle: true },
  });

  const headers = [
    "Date",
    "Driver",
    "Vehicle",
    "Make",
    "Model",
    "Year",
    "License Plate",
    "VIN",
    "From",
    "To",
    "Distance (miles)",
    "Start Odometer",
    "End Odometer",
    "Purpose",
    "Notes",
  ];
  const rows = trips.map((t) => [
    t.tripDate.toISOString().slice(0, 10),
    t.driverName,
    t.vehicle.title,
    t.vehicle.make ?? "",
    t.vehicle.model ?? "",
    t.vehicle.year ?? "",
    t.vehicle.licensePlate ?? "",
    t.vehicle.vin ?? "",
    t.fromAddress,
    t.toAddress,
    t.distanceMiles.toFixed(2),
    t.startOdometer ?? "",
    t.endOdometer ?? "",
    t.purposeCategory,
    t.purposeNotes ?? "",
  ]);

  const total = trips.reduce((s, t) => s + t.distanceMiles, 0);
  rows.push([]);
  rows.push(["", "", "", "", "", "", "", "", "", "TOTAL", total.toFixed(2), "", "", "", ""]);

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mileage-${year}.csv"`,
    },
  });
}
