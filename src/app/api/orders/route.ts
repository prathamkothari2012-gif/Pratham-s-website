import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { calculateTotals, priceLine } from "@/lib/pricing";
import { newId, writeDb, type Order, type OrderLine } from "@/lib/server/db";
import { buildPaymentInstructions } from "@/lib/server/payment";
import { verifyToken } from "@/lib/server/otp";
import { honeypotTripped, verifyChallenge } from "@/lib/server/pow";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { isRecord, parseLines, validateCustomer } from "@/lib/validation";

/** Human-friendly order reference, e.g. SH-4F2A9C. */
function orderReference(): string {
  return `SH-${randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bot checks first: they are cheap and reject the bulk of junk before any
  // pricing work happens.
  if (honeypotTripped(body)) {
    return NextResponse.json({ error: "Could not place that order." }, { status: 400 });
  }

  const pow = verifyChallenge("order", body.challenge, body.solution);
  if (!pow.ok) {
    return NextResponse.json({ error: pow.reason }, { status: 400 });
  }

  const limit = await rateLimit(`order:${clientIp(request)}`, 12, 60 * 60 * 1000);
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Too many orders from this connection.");
  }

  const { errors, value: customer } = validateCustomer(body.customer);

  // The browser sends signed tokens, not a "verified: true" flag. Each one is
  // re-checked here against the exact address and number on the order, so a
  // forged token — or one issued for a different address — is refused.
  if (!verifyToken("email", customer.email, body.emailToken)) {
    errors.email = "Please verify your email address with the code we send you.";
  }
  if (!verifyToken("phone", customer.phone, body.phoneToken)) {
    errors.phone = "Please verify your phone number with the code we send you.";
  }

  const paymentMethod = body.paymentMethod === "cod" ? "cod" : "upi";
  const incoming = parseLines(body.lines);
  const discountCode =
    typeof body.discountCode === "string" ? body.discountCode : "";

  if (incoming.length === 0) errors.lines = "Your cart is empty.";
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // Everything below is priced from the database. Nothing the client said
  // about money is trusted, so a tampered request cannot change what is owed.
  const order = await writeDb((db) => {
    const lines: OrderLine[] = incoming.flatMap((line) => {
      const product = db.products.find(
        (p) => p.slug === line.slug && p.active,
      );
      if (!product) return [];
      const { unitPrice, optionLabels } = priceLine(product, line.options);
      return [
        {
          slug: product.slug,
          name: product.name,
          quantity: line.quantity,
          unitPrice,
          lineTotal: unitPrice * line.quantity,
          // Snapshot the cost so later repricing cannot rewrite past margins.
          unitCost: product.costPrice,
          options: optionLabels,
        },
      ];
    });

    if (lines.length === 0) return null;

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

    // Re-check the code here rather than trusting the amount from the browser.
    let discountAmount = 0;
    let appliedCode: string | null = null;
    if (discountCode) {
      const code = discountCode.trim().toUpperCase();
      const found = db.discounts.find((d) => d.code === code);
      const usable =
        found &&
        found.active &&
        (!found.expiresAt || new Date(found.expiresAt).getTime() >= Date.now()) &&
        (found.usageLimit === null || found.usedCount < found.usageLimit) &&
        subtotal >= found.minSubtotal;

      if (found && usable) {
        discountAmount =
          found.type === "percent"
            ? Math.round((subtotal * found.value) / 100)
            : Math.min(found.value, subtotal);
        appliedCode = found.code;
        found.usedCount += 1;
      }
    }

    const totals = calculateTotals(subtotal, discountAmount);

    const reference = orderReference();
    const record: Order = {
      id: newId("ord"),
      reference,
      createdAt: new Date().toISOString(),
      status: "pending",
      // Unguessable, so the payment page cannot be found by trying references.
      accessToken: randomBytes(16).toString("hex"),
      payment: {
        method: paymentMethod,
        status: "unpaid",
        // Nothing to pay online for cash on delivery.
        payeeVpa: paymentMethod === "upi" ? site.payment.upiId : "",
        amount: totals.total,
        utr: null,
        submittedAt: null,
        verifiedAt: null,
      },
      customer,
      lines,
      discountCode: appliedCode,
      totals,
    };

    db.orders.unshift(record);
    return record;
  });

  if (!order) {
    return NextResponse.json(
      { errors: { lines: "None of these services are available any more." } },
      { status: 422 },
    );
  }

  // UPI is paid straight to the shop's VPA. Nothing calls back to say the
  // money arrived, so the order stays "unpaid" until the customer reports a
  // UTR and the owner verifies it. COD is collected on delivery, so there is
  // nothing to show now.
  const payment =
    order.payment.method === "upi"
      ? await buildPaymentInstructions({
          amount: order.totals.total,
          reference: order.reference,
        })
      : null;

  // INTEGRATION POINT — to automate payment confirmation, swap this for a
  // Razorpay/Stripe session and mark the order paid from their webhook.
  // To email the customer their payment link, send it from here.

  return NextResponse.json(
    {
      reference: order.reference,
      accessToken: order.accessToken,
      totals: order.totals,
      paymentMethod: order.payment.method,
      payment,
    },
    { status: 201 },
  );
}
