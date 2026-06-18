import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/library", "/movie", "/profile", "/settings"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const TOKEN_KEY = "hypertube_token";

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const isLoggedIn = !!token;

  // 1. Protected routes redirect to login
  if (!isLoggedIn && matchesAny(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Auth routes redirect logged in users to library
  if (isLoggedIn && matchesAny(pathname, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL("/library", request.url));
  }

  // 3. Root "/" landing page (public, no redirect)
  // Landing page is accessible to everyone

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).)*",
  ],
};