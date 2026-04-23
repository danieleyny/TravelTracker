import { NextRequest, NextResponse } from "next/server";
import { photonSearch } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q");
  if (!q || q.trim().length < 3) return NextResponse.json([]);
  try {
    const results = await photonSearch(q, 6);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
