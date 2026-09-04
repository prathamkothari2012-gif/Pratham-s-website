import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/server/db";
import { isValidUtr } from "@/lib/server/payment";
import { isRecord } from "@/lib/validation";

/** Constant-time-ish compare, so a wrong token cannot be found by timing. */
function tokensMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The customer reports the UPI reference they got from their app. This only
 *  records a claim — the owner still verifies it against the bank in /admin,
 *  because nothing here can prove money actually moved. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};
  const reference = typeof data.reference === "string" ? data.reference : "";
  const accessToken = typeof data.accessToken === "string" ? data.accessToken : "";
  const utr = typeof data.utr === "string" ? data.utr.trim() : "";

  if (!isValidUtr(utr)) {
    return NextResponse.json(
      { error: "That does not look like a UPI reference number." },
      { status: 422 },
    );
  }

  const db = await readDb();
  const existing = db.orders.find((o) => o.reference === reference);

  // Same response whether the order is missing or the token is wrong, so this
  // endpoint cannot be used to discover which references exist.
  if (!existing || !tokensMatch(existing.accessToken ?? "", accessToken)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (existing.payment.status === "verified") {
    return NextResponse.json({ status: "verified" });
  }

  const status = await writeDb((db) => {
    const order = db.orders.find((o) => o.reference === reference);
    if (!order) return null;
    order.payment.utr = utr;
    order.payment.status = "submitted";
    order.payment.submittedAt = new Date().toISOString();
    return order.payment.status;
  });

  if (!status) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ status });
}
