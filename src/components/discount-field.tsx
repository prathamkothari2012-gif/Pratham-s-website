"use client";

import { useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export function DiscountField() {
  const { subtotal, discount, applyDiscount } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "That code could not be applied.");
        return;
      }

      applyDiscount(data);
      setCode("");
    } catch {
      setError("Could not check that code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (discount) {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-brand-500/40 bg-brand-500/10 px-3.5 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Tag className="size-4 text-brand-500" aria-hidden />
          {discount.code}
          <span className="text-muted">−{formatPrice(discount.amount)}</span>
        </span>
        <button
          type="button"
          onClick={() => applyDiscount(null)}
          aria-label="Remove discount code"
          className="rounded-lg p-1 text-muted transition hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* A nested <form> is invalid HTML, and this sits inside the checkout
          form — so it is a div with an explicit submit handler on the button. */}
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Discount code"
          aria-label="Discount code"
          aria-invalid={!!error}
          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm uppercase placeholder:text-muted/70 placeholder:normal-case focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !code.trim()}
          className="shrink-0 rounded-xl border border-border px-4 text-sm font-medium transition hover:border-brand-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Apply"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
