import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/server/auth";

/**
 * An optimistic check only: it bounces obviously-unauthenticated visitors
 * away from /admin without touching the database. The real authorization
 * happens in `src/app/admin/layout.tsx`, which verifies the cookie signature
 * on every request — as the Next.js auth guidance recommends.
 */
export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has(SESSION_COOKIE);

  if (!hasCookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
