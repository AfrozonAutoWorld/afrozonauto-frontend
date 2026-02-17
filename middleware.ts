import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/onboarding",
  "/verify",
  "/complete-profile",
  "/forgot-password",
  "/reset-password",
  "/marketplace",
  "/vehicles",
  "/calculator",
  "/how-it-works",
];

const ROLE_ROUTES = {
  BUYER: ["/marketplace/buyer"],
  SELLER: ["/seller"],
  ADMIN: ["/admin"],
  SUPER_ADMIN: ["/admin"],
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string; exp?: number };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Get token from cookies or header
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("__Secure-accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  // No token → redirect login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token cryptographically
  const decoded = await verifyToken(token);

  if (!decoded) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("invalid", "true");
    return NextResponse.redirect(loginUrl);
  }

  // Expiry check
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "true");
    return NextResponse.redirect(loginUrl);
  }

  const role = decoded.role?.toUpperCase() || "BUYER";

  // Role-based protection
  for (const [allowedRole, routes] of Object.entries(ROLE_ROUTES)) {
    for (const route of routes) {
      if (
        pathname.startsWith(route) &&
        role !== allowedRole &&
        role !== "SUPER_ADMIN"
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
