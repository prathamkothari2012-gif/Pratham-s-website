"use client";

import { useCart } from "@/lib/cart";
import { calculateTotals, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { DiscountField } from "@/components/discount-field";

export function OrderSummary({ children }: { children?: React.ReactNode }) {
  const { subtotal, discount } = useCart();
  const totals = calculateTotals(subtotal, discount?.amount ?? 0);
  const remainingForFreeShipping =
    FREE_SHIPPING_THRESHOLD - (totals.subtotal - totals.discount);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">Order summary</h2>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-brand-600 dark:text-brand-400">
            <dt>Discount{discount ? ` (${discount.code})` : ""}</dt>
            <dd className="tabular-nums">−{formatPrice(totals.discount)}</dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="tabular-nums">
            {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">
            GST ({Math.round(TAX_RATE * 100)}%)
          </dt>
          <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      <DiscountField />

      {totals.shipping > 0 && remainingForFreeShipping > 0 && (
        <p className="mt-4 rounded-lg bg-brand-500/10 px-3 py-2 text-xs text-brand-700 dark:text-brand-300">
          Spend {formatPrice(remainingForFreeShipping)} more for free shipping.
        </p>
      )}

      {children}

      <p className="mt-4 text-xs/5 text-muted">
        Prices shown are starting rates. We review your file after ordering and
        confirm the final total before printing — you are never charged more
        without approving it first.
      </p>
    </div>
  );
}
