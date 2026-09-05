import { NextResponse } from "next/server";
import { createCode, isValidTarget, normalise, purgeExpired } from "@/lib/server/otp";
import { deliverCode } from "@/lib/server/notify";
import { honeypotTripped, verifyChallenge } from "@/lib/server/pow";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { isRecord } from "@/lib/validation";

/**
 * Sends a one-time code. This endpoint costs real money once an SMS provider
 * is wired up and can be used to spam a stranger's inbox, so it carries the
 * heaviest protection on the site: proof of work, a honeypot, a timing check,
 * and limits per IP *and* per target.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};

  // Silent success for obvious bots: telling them why they failed only helps
  // them adapt.
  if (honeypotTripped(data)) {
    return NextResponse.json({ sent: true, delivered: false });
  }

  const pow = verifyChallenge("verify", data.challenge, data.solution);
  if (!pow.ok) {
    return NextResponse.json({ error: pow.reason }, { status: 400 });
  }

  const channel = data.channel === "phone" ? "phone" : "email";
  const raw = typeof data.value === "string" ? data.value : "";
  const value = normalise(channel, raw);

  if (!isValidTarget(channel, value)) {
    return NextResponse.json(
      {
        error:
          channel === "email"
            ? "Enter a valid email address."
            : "Enter a valid 10-digit Indian mobile number.",
      },
      { status: 422 },
    );
  }

  const ip = clientIp(request);
  // Per-IP: stops one machine blasting many addresses.
  const byIp = await rateLimit(`otp-send-ip:${ip}`, 10, 60 * 60 * 1000);
  if (!byIp.allowed) {
    return tooManyRequests(byIp.retryAfter, "Too many codes requested. Try again later.");
  }

  // Per-target: stops one address being used to harass someone.
  const byTarget = await rateLimit(`otp-send:${channel}:${value}`, 5, 60 * 60 * 1000);
  if (!byTarget.allowed) {
    return tooManyRequests(
      byTarget.retryAfter,
      "Too many codes sent to this address. Try again later.",
    );
  }

  await purgeExpired();
  const code = await createCode(channel, value);
  const result = await deliverCode(channel, value, code);

  return NextResponse.json({
    sent: true,
    delivered: result.delivered,
    ...(result.devCode ? { devCode: result.devCode } : {}),
  });
}
