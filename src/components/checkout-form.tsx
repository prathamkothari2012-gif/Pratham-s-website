"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { validateCustomer, type FieldErrors } from "@/lib/validation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OrderSummary } from "@/components/order-summary";
import { UpiPayment, type PaymentInfo } from "@/components/upi-payment";

type Status = "idle" | "submitting" | "done";

export function CheckoutForm() {
  const { resolved, lines, discount, clear, ready } = useCart();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [placed, setPlaced] = useState<{
    reference: string;
    accessToken: string;
    payment: PaymentInfo;
  } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const form = new FormData(event.currentTarget);
    const customer = Object.fromEntries(form.entries());

    // Validate up front so obvious mistakes never cost a round trip. The
    // server runs the same checks regardless.
    const { errors: clientErrors } = validateCustomer(customer);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          lines,
          discountCode: discount?.code ?? null,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setFailure(data.error ?? "Please correct the highlighted fields.");
        setStatus("idle");
        return;
      }

      setPlaced({
        reference: data.reference,
        accessToken: data.accessToken,
        payment: data.payment,
      });
      setStatus("done");
      clear();
    } catch {
      setFailure(
        "We could not reach the server. Check your connection and try again.",
      );
      setStatus("idle");
    }
  }

  if (status === "done" && placed) {
    const orderUrl = `/order/${placed.reference}?t=${placed.accessToken}`;

    return (
      <div className="mx-auto mt-12 max-w-2xl">
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-10 text-brand-500" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold">Order received</h2>
          <p className="mt-2 text-sm/6 text-muted">
            Your reference is{" "}
            <span className="font-mono font-semibold text-foreground">
              {placed.reference}
            </span>
            . Pay below to put it in the print queue.
          </p>
        </div>

        <div className="mt-8">
          <UpiPayment
            reference={placed.reference}
            accessToken={placed.accessToken}
            payment={placed.payment}
          />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href={orderUrl}
            className="text-brand-600 hover:underline dark:text-brand-400"
          >
            Bookmark this order page
          </Link>{" "}
          to come back and pay later.
        </p>

        <div className="mt-6 text-center">
          <ButtonLink href="/shop" variant="secondary">
            Back to the shop
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="mt-10 h-64 animate-pulse rounded-2xl bg-surface" />;
  }

  if (resolved.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border py-20 text-center">
        <p className="font-medium">There is nothing to check out</p>
        <p className="mt-1 text-sm text-muted">
          Add a service to your cart first.
        </p>
        <ButtonLink href="/shop" className="mt-6">
          Browse services
        </ButtonLink>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start"
    >
      <div className="space-y-8">
        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Your details</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" required autoComplete="name" error={errors.name} />
            <Field
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              error={errors.email}
            />
            <Field
              label="Phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              error={errors.phone}
              className="sm:col-span-2"
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Delivery address</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Address"
              name="address"
              required
              autoComplete="street-address"
              error={errors.address}
              className="sm:col-span-2"
            />
            <Field label="City" name="city" required autoComplete="address-level2" error={errors.city} />
            <Field
              label="PIN code"
              name="postcode"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              error={errors.postcode}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Your model</legend>
          <div className="grid gap-4">
            <Field
              label="Link to your file"
              name="fileUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              hint="Share a Drive, Dropbox or WeTransfer link to your STL, STEP or 3MF. No file yet? Describe it below instead."
              error={errors.fileUrl}
            />
            <Field
              label="Notes for the workshop"
              name="notes"
              as="textarea"
              placeholder="Dimensions, colour, deadline, how the part will be used…"
              error={errors.notes}
            />
          </div>
        </fieldset>

        {failure && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {failure}
          </p>
        )}
      </div>

      <OrderSummary>
        <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted">
          {resolved.map((line) => (
            <li key={line.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {line.quantity} × {line.product.name}
              </span>
              <span className="tabular-nums">{formatPrice(line.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Placing order…
            </>
          ) : (
            "Place order"
          )}
        </Button>

        <Link
          href="/cart"
          className="mt-3 block text-center text-sm text-muted hover:text-foreground"
        >
          Back to cart
        </Link>
      </OrderSummary>
    </form>
  );
}
