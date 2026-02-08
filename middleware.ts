import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJWT(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = {
    buyer: ["/marketplace/buyer"],
    seller: ["/seller"],
    admin: ["/admin"],
  };

  const publicRoutes = [
    "/marketplace",
    "/vehicles",
    "/calculator",
    "/how-it-works",
    "/",
    "/login",
    "/onboarding",
    "/verify",
    "/complete-profile",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get tokens from cookies or headers
  const accessToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = decodeJWT(accessToken);

  if (!decoded) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("expired", "true");
    return NextResponse.redirect(loginUrl);
  }

  const userRole = decoded.role?.toUpperCase() || "BUYER";

  if (pathname.startsWith("/marketplace/buyer")) {
    if (userRole !== "BUYER") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/seller")) {
    if (
      userRole !== "SELLER" &&
      userRole !== "ADMIN" &&
      userRole !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
