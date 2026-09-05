import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Proof-of-work bot protection.
 *
 * Before a form can be submitted, the browser must find a number whose
 * SHA-256 hash (together with a server-issued challenge) starts with a run of
 * zero bits. A visitor's machine does this in well under a second and never
 * notices; a bot posting thousands of times pays that cost every single time,
 * which is what makes bulk abuse uneconomical.
 *
 * Chosen over a hosted CAPTCHA because it needs no third-party account, sends
 * no visitor data anywhere, shows no puzzle to solve, and works for people
 * using screen readers or blocking trackers. It is not a silver bullet — a
 * determined attacker can pay the cost — so it sits alongside rate limiting
 * and honeypots rather than replacing them.
 *
 * The challenge is HMAC-signed and carries its own timestamp, so the server
 * stores nothing between issuing and verifying it.
 */

const CHALLENGE_TTL_MS = 10 * 60 * 1000;
/** Leading zero bits required. 16 is a few hundred ms of work in a browser. */
export const DIFFICULTY = 16;

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

export type Challenge = {
  challenge: string;
  difficulty: number;
  expiresIn: number;
};

/** `<purpose>.<nonce>.<issuedAt>.<signature>` */
export function issueChallenge(purpose: string): Challenge {
  const nonce = randomBytes(16).toString("hex");
  const issuedAt = Date.now();
  const payload = `${purpose}.${nonce}.${issuedAt}`;

  return {
    challenge: `${payload}.${sign(payload)}`,
    difficulty: DIFFICULTY,
    expiresIn: Math.floor(CHALLENGE_TTL_MS / 1000),
  };
}

/** Counts leading zero bits of the hash of `challenge + solution`. */
function leadingZeroBits(challenge: string, solution: string): number {
  const digest = createHash("sha256").update(`${challenge}${solution}`).digest();

  let bits = 0;
  for (const byte of digest) {
    if (byte === 0) {
      bits += 8;
      continue;
    }
    bits += Math.clz32(byte) - 24;
    break;
  }
  return bits;
}

export type PowResult = { ok: true } | { ok: false; reason: string };

/**
 * A form filled in by a person takes a moment. The challenge is fetched when
 * the form mounts, so its age is how long the visitor spent on the page —
 * and because the server issued and signed that timestamp, a bot cannot
 * shortcut it by sending a fake one, which a client-supplied "renderedAt"
 * would have allowed.
 */
const MIN_AGE_MS = 1500;

/** Only forms a person genuinely has to fill in. Requesting a code is a
 *  single click and legitimately fast. */
const TIMED_PURPOSES = new Set(["order", "contact"]);

export function verifyChallenge(
  purpose: string,
  challenge: unknown,
  solution: unknown,
): PowResult {
  if (typeof challenge !== "string" || typeof solution !== "string") {
    return { ok: false, reason: "Missing bot check. Reload the page and try again." };
  }

  const parts = challenge.split(".");
  if (parts.length !== 4) {
    return { ok: false, reason: "Invalid bot check. Reload the page and try again." };
  }

  const [challengePurpose, nonce, issuedAt, signature] = parts;
  if (!safeEqual(signature, sign(`${challengePurpose}.${nonce}.${issuedAt}`))) {
    return { ok: false, reason: "Invalid bot check. Reload the page and try again." };
  }

  // A challenge issued for one form must not be replayed against another.
  if (challengePurpose !== purpose) {
    return { ok: false, reason: "Invalid bot check. Reload the page and try again." };
  }

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > CHALLENGE_TTL_MS) {
    return { ok: false, reason: "Bot check expired. Reload the page and try again." };
  }

  if (TIMED_PURPOSES.has(purpose) && age < MIN_AGE_MS) {
    return { ok: false, reason: "That was too quick — please try again." };
  }

  if (leadingZeroBits(challenge, solution) < DIFFICULTY) {
    return { ok: false, reason: "Bot check failed. Reload the page and try again." };
  }

  return { ok: true };
}

/**
 * A hidden field real people never fill in and naive form-filling bots do.
 * Costs nothing and catches the cheapest attacks before they reach anything
 * expensive.
 */
export function honeypotTripped(body: Record<string, unknown>): boolean {
  const value = body.company;
  return typeof value === "string" && value.trim().length > 0;
}
