import { NextRequest, NextResponse } from "next/server";

const COOKIE = "tt_pin_ok";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/pin") ||
    pathname === "/pin" ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next();
  }

  const ok = req.cookies.get(COOKIE)?.value === "1";
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/pin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
