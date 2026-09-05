import { NextResponse } from "next/server";
import { honeypotTripped, verifyChallenge } from "@/lib/server/pow";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { isRecord, validateContact } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};

  // Accept-and-drop for obvious bots: a spammer told it failed just retries.
  if (honeypotTripped(data)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const pow = verifyChallenge("contact", data.challenge, data.solution);
  if (!pow.ok) {
    return NextResponse.json({ error: pow.reason }, { status: 400 });
  }

  const limit = await rateLimit(`contact:${clientIp(request)}`, 8, 60 * 60 * 1000);
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Too many messages. Try again later.");
  }

  const { errors, value } = validateContact(body);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // INTEGRATION POINT — send this somewhere real (Resend, Postmark, SES, a
  // Slack webhook, a CRM). Until then enquiries land in the server logs.
  console.info("[contact]", JSON.stringify(value));

  return NextResponse.json({ ok: true }, { status: 200 });
}
