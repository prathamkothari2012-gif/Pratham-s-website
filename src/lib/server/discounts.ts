import "server-only";
import { readDb, type Discount } from "@/lib/server/db";

export type DiscountResult =
  | { ok: true; discount: Discount; amount: number }
  | { ok: false; reason: string };

/** The single source of truth for whether a code applies. The storefront calls
 *  it to preview a discount; the orders route calls it again before charging,
 *  so a stale or edited client value can never win. */
export async function evaluateDiscount(
  rawCode: string,
  subtotal: number,
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a code." };

  const db = await readDb();
  const discount = db.discounts.find((d) => d.code === code);

  if (!discount) return { ok: false, reason: "That code was not recognised." };
  if (!discount.active) return { ok: false, reason: "That code is no longer active." };

  if (discount.expiresAt && new Date(discount.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "That code has expired." };
  }

  if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
    return { ok: false, reason: "That code has been fully redeemed." };
  }

  if (subtotal < discount.minSubtotal) {
    return {
      ok: false,
      reason: `Spend at least ${discount.minSubtotal} to use this code.`,
    };
  }

  const amount =
    discount.type === "percent"
      ? Math.round((subtotal * discount.value) / 100)
      : Math.min(discount.value, subtotal);

  return { ok: true, discount, amount };
}

export type DiscountState = "active" | "paused" | "expired" | "exhausted";

export type AnnotatedDiscount = Discount & { state: DiscountState };

/** Annotates each code with its current state. Doing this here keeps the
 *  time-dependent comparison out of component render. */
export async function listDiscounts(): Promise<AnnotatedDiscount[]> {
  const db = await readDb();
  const now = Date.now();

  return db.discounts.map((discount) => {
    let state: DiscountState = "active";

    if (discount.expiresAt && new Date(discount.expiresAt).getTime() < now) {
      state = "expired";
    } else if (
      discount.usageLimit !== null &&
      discount.usedCount >= discount.usageLimit
    ) {
      state = "exhausted";
    } else if (!discount.active) {
      state = "paused";
    }

    return { ...discount, state };
  });
}
