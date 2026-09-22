import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/sell",
  "/dashboard",
  "/profile",
  "/chat",
  "/checkout",
  "/listings/my",
  "/listings/saved",
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const authCookie =
    request.cookies.get("access_token") ||
    request.cookies.get("token") ||
    request.cookies.get("session");

  if (isProtectedRoute && !authCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && authCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sell/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/checkout/:path*",
    "/listings/my/:path*",
    "/listings/saved/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
