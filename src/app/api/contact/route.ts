import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
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
