import { NextResponse } from "next/server";
import { calculateTotals, priceLine } from "@/lib/pricing";
import { newId, writeDb, type Order, type OrderLine } from "@/lib/server/db";
import { isRecord, parseLines, validateCustomer } from "@/lib/validation";

/** Human-friendly order reference, e.g. SH-4F2A9C. */
function orderReference(): string {
  return `SH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
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

  const { errors, value: customer } = validateCustomer(body.customer);
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

    const record: Order = {
      id: newId("ord"),
      reference: orderReference(),
      createdAt: new Date().toISOString(),
      status: "pending",
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

  // INTEGRATION POINT — the order is now persisted and visible in /admin.
  // To take payment, create a Razorpay/Stripe session here and return its
  // redirect URL, then mark the order confirmed from the payment webhook.
  // To notify, send mail from here (Resend, Postmark, SES).

  return NextResponse.json(
    { reference: order.reference, totals: order.totals },
    { status: 201 },
  );
}
