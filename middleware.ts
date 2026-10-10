import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Next.js runs this file BEFORE every page/API request matched below.
// No valid login cookie = you get sent to /login instead of the page.

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(COOKIE_NAME)?.value, process.env.SESSION_SECRET);

  if (pathname === "/login") {
    // Already logged in? No need to see the login page.
    return authed ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }

  if (authed) return NextResponse.next();

  // Scripts calling /api/... want an error code, not a login page.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

// Run on everything except Next's own static files and the favicon.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
