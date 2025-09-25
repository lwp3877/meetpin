import { NextResponse } from "next/server";

export const config = {
  matcher: ["/status", "/api/:path*"]
};

export function middleware() {
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, stale-while-revalidate=0");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}