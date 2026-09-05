import type { Product } from "@/content/catalog";

/** Order maths in one place, so the cart, checkout and API agree. */

export const SHIPPING_FLAT = 149;
export const FREE_SHIPPING_THRESHOLD = 5000;
/** GST rate applied to the order. Set to 0 to remove tax from the totals. */
export const TAX_RATE = 0.18;

export type OrderTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

/**
 * Order maths, in the order the customer sees it: discount comes off the
 * subtotal, shipping is judged on the discounted amount, and tax applies to
 * both.
 */
export function calculateTotals(subtotal: number, discount = 0): OrderTotals {
  const cappedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const discounted = subtotal - cappedDiscount;
  const shipping =
    discounted === 0 || discounted >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round((discounted + shipping) * TAX_RATE);

  return {
    subtotal,
    discount: cappedDiscount,
    shipping,
    tax,
    total: discounted + shipping + tax,
  };
}

/** Base price plus every selected option's delta. Lives here rather than in
 *  `cart.tsx` so server code (the orders route) can re-price without pulling
 *  in a client module. */
export function priceLine(
  product: Product,
  options: Record<string, string>,
): { unitPrice: number; optionLabels: string[] } {
  let unitPrice = product.basePrice;
  const optionLabels: string[] = [];

  for (const group of product.optionGroups) {
    const chosen = group.options.find((o) => o.id === options[group.id]);
    if (!chosen) continue;
    unitPrice += chosen.priceDelta;
    optionLabels.push(`${group.label}: ${chosen.label}`);
  }

  return { unitPrice: Math.max(unitPrice, 0), optionLabels };
}
