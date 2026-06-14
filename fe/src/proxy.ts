import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware Next.js — proteksi route berdasarkan auth token.
 *
 * Cara kerja:
 * - Cek apakah cookie `auth_token` ada
 * - Route yang butuh login → redirect ke /login jika tidak ada token
 * - Route yang butuh role spesifik → tidak bisa dicek di middleware
 *   karena butuh API call. Role check dilakukan di dalam komponen
 *   (ModerationLogic & AdminLogic) dengan redirect programatik.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const pathname = request.nextUrl.pathname;

  // Route yang butuh login
  const authRequiredRoutes = [
    "/profile",
    "/bookmarks",
    "/notifications",
    "/questions/ask",
    "/moderation",
    "/admin",
  ];

  const needsAuth = authRequiredRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect ke login jika belum punya token
  if (needsAuth && !token) {
    const loginUrl = new URL("/login", request.url);
    // Simpan URL tujuan agar bisa redirect balik setelah login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware hanya pada route yang relevan, skip _next & static files
  matcher: [
    "/profile/:path*",
    "/bookmarks/:path*",
    "/notifications/:path*",
    "/questions/ask/:path*",
    "/moderation/:path*",
    "/admin/:path*",
  ],
};
