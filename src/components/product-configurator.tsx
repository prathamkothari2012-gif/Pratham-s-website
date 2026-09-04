"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/content/catalog";
import { useCart } from "@/lib/cart";
import { priceLine } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ProductConfigurator({ product }: { product: Product }) {
  // Default every group to its first option so a price always shows.
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.optionGroups.map((g) => [g.id, g.options[0]?.id ?? ""]),
    ),
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const { unitPrice } = useMemo(
    () => priceLine(product, selection),
    [product, selection],
  );

  function handleAdd() {
    add(product.slug, selection, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
      <div className="space-y-6">
        {product.optionGroups.map((group) => (
          <fieldset key={group.id}>
            <legend className="text-sm font-semibold">{group.label}</legend>
            {group.hint && (
              <p className="mt-1 text-xs text-muted">{group.hint}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {group.options.map((option) => {
                const active = selection[group.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSelection((s) => ({ ...s, [group.id]: option.id }))
                    }
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm transition",
                      active
                        ? "border-brand-500 bg-brand-500/10 font-medium text-brand-700 dark:text-brand-300"
                        : "border-border hover:border-brand-400",
                    )}
                  >
                    {option.label}
                    {option.priceDelta !== 0 && (
                      <span className="ml-1.5 text-xs text-muted">
                        {option.priceDelta > 0 ? "+" : "−"}
                        {formatPrice(Math.abs(option.priceDelta))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Quantity</span>
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="grid size-9 place-items-center rounded-l-full transition hover:bg-foreground/5 disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="w-10 text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
              className="grid size-9 place-items-center rounded-r-full transition hover:bg-foreground/5"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-muted">Total</p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatPrice(unitPrice * quantity)}
          </p>
        </div>
      </div>

      <Button onClick={handleAdd} size="lg" className="mt-6 w-full">
        {added ? (
          <>
            <Check className="size-4" aria-hidden />
            Added to cart
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" aria-hidden />
            Add to cart
          </>
        )}
      </Button>

      {added && (
        <p className="mt-3 text-center text-sm text-muted" role="status">
          <Link href="/cart" className="font-medium text-brand-600 underline dark:text-brand-400">
            View cart and check out
          </Link>
        </p>
      )}
    </div>
  );
}
