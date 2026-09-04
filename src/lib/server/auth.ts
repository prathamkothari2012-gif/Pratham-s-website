import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-owner authentication: one shared password, exchanged for an
 * HMAC-signed, httpOnly session cookie. There is no user table because there
 * is exactly one user — the shop owner.
 */

export const SESSION_COOKIE = "spoolhouse_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/** Dev fallbacks keep `npm run dev` working on a fresh clone. Both MUST be set
 *  in the environment before deploying — `assertConfigured` enforces it. */
const DEV_PASSWORD = "spoolhouse";
const DEV_SECRET = "dev-only-insecure-secret";

function password(): string {
  return process.env.ADMIN_PASSWORD || DEV_PASSWORD;
}

function secret(): string {
  return process.env.AUTH_SECRET || DEV_SECRET;
}

/** True when the deployment is still running on the built-in dev credentials. */
export function usingDevCredentials(): boolean {
  return !process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET;
}

export function assertConfigured(): void {
  if (process.env.NODE_ENV === "production" && usingDevCredentials()) {
    throw new Error(
      "ADMIN_PASSWORD and AUTH_SECRET must be set in production. See .env.example.",
    );
  }
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Constant-time compare that tolerates length differences. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(candidate: string): boolean {
  return safeEqual(candidate, password());
}

export function createToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `owner.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [subject, expires, signature] = parts;
  const payload = `${subject}.${expires}`;
  if (!safeEqual(signature, sign(payload))) return false;

  const expiresAt = Number(expires);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/** The real authorization check, run in the admin layout on every request. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
