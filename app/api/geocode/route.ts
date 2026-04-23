import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q");
  if (!q || q.trim().length < 4) return NextResponse.json([]);
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&countrycodes=us,ca&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TravelTracker/1.0 (mileage logger)", "Accept-Language": "en" },
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data = (await res.json()) as Array<{ display_name: string }>;
    return NextResponse.json(data.map((d) => ({ display_name: d.display_name })));
  } catch {
    return NextResponse.json([]);
  }
}
