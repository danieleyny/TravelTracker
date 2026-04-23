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

  const [trips, vehicles] = await Promise.all([
    prisma.trip.findMany({
      where: { tripDate: { gte: start, lt: end } },
      orderBy: { tripDate: "asc" },
      include: { vehicle: true },
    }),
    prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const tripHeaders = [
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
    "Purpose",
    "Notes",
  ];
  const tripRows = trips.map((t) => [
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
    t.purposeCategory,
    t.purposeNotes ?? "",
  ]);

  const total = trips.reduce((s, t) => s + t.distanceMiles, 0);
  tripRows.push([]);
  tripRows.push(["", "", "", "", "", "", "", "", "", "TOTAL", total.toFixed(2), "", ""]);

  const odoHeader = ["Vehicle", "Year-start odometer", "Year-end odometer", "Miles from odometer"];
  const odoRows = vehicles.map((v) => {
    const diff = v.yearStartOdo != null && v.yearEndOdo != null ? (v.yearEndOdo - v.yearStartOdo).toFixed(0) : "";
    return [v.title, v.yearStartOdo ?? "", v.yearEndOdo ?? "", diff];
  });

  const lines: string[] = [];
  lines.push(`Travel Tracker — Mileage report for ${year}`);
  lines.push("");
  lines.push("Yearly odometer readings (per vehicle)");
  lines.push(odoHeader.map(csvEscape).join(","));
  odoRows.forEach((r) => lines.push(r.map(csvEscape).join(",")));
  lines.push("");
  lines.push("Trip log");
  lines.push(tripHeaders.map(csvEscape).join(","));
  tripRows.forEach((r) => lines.push(r.map(csvEscape).join(",")));

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mileage-${year}.csv"`,
    },
  });
}
