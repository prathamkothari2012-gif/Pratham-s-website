import { NextResponse } from "next/server";
import { checkCode, normalise } from "@/lib/server/otp";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { isRecord } from "@/lib/validation";

/** Exchanges a correct code for a signed token proving the address or number
 *  was verified. Per-code attempts are capped in `checkCode`; this adds a
 *  per-IP cap so a bot cannot grind many targets at once. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};
  const channel = data.channel === "phone" ? "phone" : "email";
  const value = normalise(channel, typeof data.value === "string" ? data.value : "");
  const code = typeof data.code === "string" ? data.code.trim() : "";

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 422 });
  }

  const ip = clientIp(request);
  const limit = await rateLimit(`otp-check:${ip}`, 30, 60 * 60 * 1000);
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Too many attempts. Try again later.");
  }

  const result = await checkCode(channel, value, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({ verified: true, token: result.token });
}
