import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/overview", "/chat", "/members", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    token &&
    (pathname === "/" || pathname === "/login" || pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
