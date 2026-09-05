"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";

export function CartView() {
  const { resolved, setQuantity, remove, ready } = useCart();

  // The cart is restored from localStorage after mount; hold the layout
  // steady until then rather than flashing the empty state.
  if (!ready) {
    return <div className="mt-10 h-64 animate-pulse rounded-2xl bg-surface" />;
  }

  if (resolved.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border py-20 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted" aria-hidden />
        <p className="mt-4 font-medium">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted">
          Browse our printing services to get started.
        </p>
        <ButtonLink href="/shop" className="mt-6">
          Browse services
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {resolved.map((line) => (
          <li key={line.id} className="flex gap-4 p-5">
            <div
              className="size-20 shrink-0 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${line.product.accent[0]}, ${line.product.accent[1]})`,
              }}
              aria-hidden
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/shop/${line.slug}`}
                    className="font-medium hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {line.product.name}
                  </Link>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted">
                    {line.optionLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.id)}
                  aria-label={`Remove ${line.product.name} from cart`}
                  className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-foreground/5 hover:text-red-500"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    aria-label={`Decrease quantity of ${line.product.name}`}
                    className="grid size-8 place-items-center rounded-l-full transition hover:bg-foreground/5"
                  >
                    <Minus className="size-3.5" aria-hidden />
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    aria-label={`Increase quantity of ${line.product.name}`}
                    className="grid size-8 place-items-center rounded-r-full transition hover:bg-foreground/5"
                  >
                    <Plus className="size-3.5" aria-hidden />
                  </button>
                </div>

                <p className="text-sm font-semibold tabular-nums">
                  {formatPrice(line.lineTotal)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <OrderSummary>
        <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
          Continue to checkout
        </ButtonLink>
        <Link
          href="/shop"
          className="mt-3 block text-center text-sm text-muted hover:text-foreground"
        >
          Keep browsing
        </Link>
      </OrderSummary>
    </div>
  );
}
