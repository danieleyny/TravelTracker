import { NextRequest, NextResponse } from "next/server";
import { geocode, drivingMiles } from "@/lib/geo";

export async function POST(req: NextRequest) {
  const { from, to } = await req.json();
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });
  try {
    const [a, b] = await Promise.all([geocode(String(from)), geocode(String(to))]);
    const miles = await drivingMiles(a, b);
    return NextResponse.json({ miles, fromResolved: a.display, toResolved: b.display });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Distance lookup failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
