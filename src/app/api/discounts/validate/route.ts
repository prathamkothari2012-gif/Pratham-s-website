import { NextResponse } from "next/server";
import { evaluateDiscount } from "@/lib/server/discounts";
import { isRecord } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data = isRecord(body) ? body : {};
  const code = typeof data.code === "string" ? data.code : "";
  const subtotal = Number(data.subtotal);

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid subtotal." }, { status: 400 });
  }

  const result = await evaluateDiscount(code, subtotal);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 422 });
  }

  return NextResponse.json({
    code: result.discount.code,
    type: result.discount.type,
    value: result.discount.value,
    amount: result.amount,
  });
}
