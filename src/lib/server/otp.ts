import "server-only";
import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { newId, readDb, writeDb } from "@/lib/server/db";

/**
 * One-time codes for verifying a customer's email address and phone number.
 *
 * A successful check returns a short-lived, HMAC-signed token bound to that
 * exact address or number. Checkout must present those tokens, so the browser
 * cannot simply claim to be verified — the signature is what proves it, and it
 * only covers the value that was actually confirmed.
 */

const CODE_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function secret(): string {
  return process.env.AUTH_SECRET || "dev-only-insecure-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function hashCode(code: string): string {
  return createHash("sha256").update(`${secret()}:${code}`).digest("hex");
}

/** Lower-cased email, or digits-only phone, so "+91 74832 91876" and
 *  "07483291876" cannot be verified separately and used interchangeably. */
export function normalise(channel: "email" | "phone", value: string): string {
  const trimmed = value.trim();
  if (channel === "email") return trimmed.toLowerCase();

  const digits = trimmed.replace(/\D/g, "");
  // Reduce Indian numbers to their 10 significant digits.
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidTarget(channel: "email" | "phone", value: string): boolean {
  if (channel === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  return /^[6-9]\d{9}$/.test(value); // Indian mobile numbers
}

/** Creates and stores a code, superseding any earlier unused one. */
export async function createCode(
  channel: "email" | "phone",
  value: string,
): Promise<string> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = Date.now();

  await writeDb((db) => {
    // Drop this target's outstanding codes, plus anything long expired.
    db.verifications = db.verifications.filter(
      (v) =>
        !(v.channel === channel && v.value === value) &&
        new Date(v.expiresAt).getTime() > now - CODE_TTL_MS,
    );

    db.verifications.push({
      id: newId("otp"),
      channel,
      value,
      codeHash: hashCode(code),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + CODE_TTL_MS).toISOString(),
      attempts: 0,
      consumedAt: null,
    });
  });

  return code;
}

export type CheckResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

export async function checkCode(
  channel: "email" | "phone",
  value: string,
  code: string,
): Promise<CheckResult> {
  const now = Date.now();

  const outcome = await writeDb((db) => {
    const record = db.verifications.find(
      (v) => v.channel === channel && v.value === value && !v.consumedAt,
    );

    if (!record) return { ok: false as const, reason: "Request a new code." };

    if (new Date(record.expiresAt).getTime() <= now) {
      return { ok: false as const, reason: "That code has expired. Request a new one." };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return { ok: false as const, reason: "Too many wrong attempts. Request a new code." };
    }

    if (!safeEqual(record.codeHash, hashCode(code))) {
      record.attempts += 1;
      const left = MAX_ATTEMPTS - record.attempts;
      return {
        ok: false as const,
        reason:
          left > 0
            ? `That code is not right. ${left} attempt${left === 1 ? "" : "s"} left.`
            : "Too many wrong attempts. Request a new code.",
      };
    }

    record.consumedAt = new Date(now).toISOString();
    return { ok: true as const };
  });

  if (!outcome.ok) return outcome;
  return { ok: true, token: issueToken(channel, value) };
}

/** `<channel>.<value>.<expiry>.<signature>` */
export function issueToken(channel: "email" | "phone", value: string): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${channel}.${value}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Confirms a token really was issued for this exact value and has not expired.
 * Called when an order is placed, so a forged or reused-for-another-address
 * token cannot get an order through.
 */
export function verifyToken(
  channel: "email" | "phone",
  value: string,
  token: unknown,
): boolean {
  if (typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length < 4) return false;

  const signature = parts[parts.length - 1];
  const expires = parts[parts.length - 2];
  // The value itself may contain dots (an email always does), so rebuild it
  // from everything between the channel and the expiry.
  const tokenValue = parts.slice(1, parts.length - 2).join(".");
  const tokenChannel = parts[0];

  if (tokenChannel !== channel) return false;
  if (tokenValue !== normalise(channel, value)) return false;

  const payload = `${tokenChannel}.${tokenValue}.${expires}`;
  if (!safeEqual(signature, sign(payload))) return false;

  return Number(expires) > Date.now();
}

/** Housekeeping so the store does not accumulate dead codes. */
export async function purgeExpired(): Promise<void> {
  const now = Date.now();
  const db = await readDb();
  const stale = db.verifications.some(
    (v) => new Date(v.expiresAt).getTime() <= now - CODE_TTL_MS,
  );
  if (!stale) return;

  await writeDb((db) => {
    db.verifications = db.verifications.filter(
      (v) => new Date(v.expiresAt).getTime() > now - CODE_TTL_MS,
    );
  });
}
