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

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload =
      typeof atob === "function"
        ? decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        : Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const authCookie =
    request.cookies.get("token") ||
    request.cookies.get("access_token") ||
    request.cookies.get("session");

  const refreshCookie = request.cookies.get("refreshToken");

  const hasValidAccess = Boolean(authCookie && isTokenValid(authCookie.value));
  const hasValidRefresh = Boolean(refreshCookie && isTokenValid(refreshCookie.value));
  const hasValidSession = hasValidAccess || hasValidRefresh;

  // If user tries to access a protected route without any valid access or refresh token:
  if (isProtectedRoute && !hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);

    if (authCookie) {
      response.cookies.delete("token");
      response.cookies.delete("access_token");
      response.cookies.delete("session");
    }
    if (refreshCookie) {
      response.cookies.delete("refreshToken");
    }
    return response;
  }

  // If user tries to access an auth route (e.g. /login, /register):
  if (isAuthRoute) {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/", request.url));
    } else if (authCookie || refreshCookie) {
      // Stale cookies present: allow user to reach /login and clear stale cookies
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("access_token");
      response.cookies.delete("session");
      response.cookies.delete("refreshToken");
      return response;
    }
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
