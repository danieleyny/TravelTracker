import { NextRequest, NextResponse } from "next/server";
import { geocodeOne, drivingMiles, LatLng } from "@/lib/geo";

type Loc = string | { text: string; latLng?: LatLng | null };

async function resolve(loc: Loc): Promise<LatLng> {
  if (typeof loc === "string") return (await geocodeOne(loc));
  if (loc.latLng) return loc.latLng;
  return await geocodeOne(loc.text);
}

export async function POST(req: NextRequest) {
  const { from, to } = (await req.json()) as { from: Loc; to: Loc };
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });
  try {
    const [a, b] = await Promise.all([resolve(from), resolve(to)]);
    const miles = await drivingMiles(a, b);
    return NextResponse.json({ miles });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Distance lookup failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
