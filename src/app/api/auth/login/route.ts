import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  createToken,
  sessionCookieOptions,
} from "@/lib/server/auth";
import { isRecord } from "@/lib/validation";

/** Rate limiting keyed by IP, held in memory. Enough to blunt a brute-force
 *  against a single shared password on a single-instance deployment. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};
  const password = typeof data.password === "string" ? data.password : "";

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  attempts.delete(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createToken(), sessionCookieOptions());
  return response;
}
