import { NextResponse } from "next/server";

interface JWTPayload {
  sub?: string;
  userId?: string;
  id?: string;
  role?: string;
  email?: string;
  exp?: number;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

export function extractUser(request: Request): {
  userId: string;
  role: string;
  email?: string;
} | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const payload = decodeJWT(token);
  if (!payload) return null;

  const userId = payload.sub || payload.userId || payload.id;
  if (!userId) return null;

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    userId,
    role: payload.role || "BUYER",
    email: payload.email,
  };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function success(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
