import "server-only";
import { writeDb } from "@/lib/server/db";

/**
 * Fixed-window rate limiting, persisted in the datastore.
 *
 * It lives in the database rather than a module-level Map because Next.js
 * gives each route bundle its own module instance — a counter incremented by
 * one endpoint would be invisible to another, and a caller could dodge the
 * limit just by alternating endpoints.
 */

export type RateLimitResult = {
  allowed: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** Seconds until the window resets — surfaced as Retry-After. */
  retryAfter: number;
};

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();

  return writeDb((db) => {
    // Opportunistically drop expired buckets so the file cannot grow forever.
    db.throttles = db.throttles.filter(
      (t) => new Date(t.resetAt).getTime() > now || t.key === key,
    );

    const existing = db.throttles.find((t) => t.key === key);

    if (!existing || new Date(existing.resetAt).getTime() <= now) {
      const resetAt = new Date(now + windowMs).toISOString();
      if (existing) {
        existing.count = 1;
        existing.resetAt = resetAt;
      } else {
        db.throttles.push({ key, count: 1, resetAt });
      }
      return {
        allowed: true,
        remaining: limit - 1,
        retryAfter: Math.ceil(windowMs / 1000),
      };
    }

    existing.count += 1;
    const retryAfter = Math.max(
      1,
      Math.ceil((new Date(existing.resetAt).getTime() - now) / 1000),
    );

    return {
      allowed: existing.count <= limit,
      remaining: Math.max(0, limit - existing.count),
      retryAfter,
    };
  });
}

/** Best-effort client IP. Behind a proxy the left-most X-Forwarded-For entry
 *  is the client; with no proxy header we fall back to a single shared bucket,
 *  which is stricter rather than looser. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyRequests(retryAfter: number, message: string) {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
