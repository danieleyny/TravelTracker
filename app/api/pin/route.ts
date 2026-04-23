import { NextRequest, NextResponse } from "next/server";

const PIN = process.env.APP_PIN ?? "0000";

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  if (String(code) !== PIN) {
    return NextResponse.json({ error: "Wrong code" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("tt_pin_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
