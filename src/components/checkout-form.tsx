"use client";

import { useState } from "react";
import Link from "next/link";
import { Banknote, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { INDIAN_STATES } from "@/content/states";
import { useCart } from "@/lib/cart";
import { useBotShield } from "@/lib/bot-shield";
import { formatPrice } from "@/lib/utils";
import { validateCustomer, type FieldErrors } from "@/lib/validation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Honeypot } from "@/components/ui/honeypot";
import { OrderSummary } from "@/components/order-summary";
import { UpiPayment, type PaymentInfo } from "@/components/upi-payment";
import { VerifiedField } from "@/components/verified-field";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "done";
type PaymentMethod = "upi" | "cod";

type Placed = {
  reference: string;
  accessToken: string;
  paymentMethod: PaymentMethod;
  payment: PaymentInfo | null;
  total: number;
};

export function CheckoutForm() {
  const { resolved, lines, discount, clear, ready } = useCart();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // Contact details are verified before the order can go through, so they live
  // in state rather than being read off the form at submit time.
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const { solveNow } = useBotShield("order");

  const verified = !!emailToken && !!phoneToken;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const form = new FormData(event.currentTarget);
    const customer = {
      ...Object.fromEntries(form.entries()),
      email,
      phone,
    };

    const { errors: clientErrors } = validateCustomer(customer);
    if (!emailToken) clientErrors.email = "Verify your email address first.";
    if (!phoneToken) clientErrors.phone = "Verify your phone number first.";

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setFailure("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const { challenge, solution } = await solveNow();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          lines,
          discountCode: discount?.code ?? null,
          paymentMethod: method,
          emailToken,
          phoneToken,
          challenge,
          solution,
          company: form.get("company") ?? "",
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
        paymentMethod: data.paymentMethod,
        payment: data.payment,
        total: data.totals.total,
      });
      setStatus("done");
      clear();
    } catch {
      setFailure("We could not reach the server. Check your connection and try again.");
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
            . We have emailed nothing yet — bookmark this page.
          </p>
        </div>

        <div className="mt-8">
          {placed.paymentMethod === "upi" && placed.payment ? (
            <UpiPayment
              reference={placed.reference}
              accessToken={placed.accessToken}
              payment={placed.payment}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center">
              <Banknote className="mx-auto size-8 text-brand-500" aria-hidden />
              <h3 className="mt-3 font-semibold">Paying cash on delivery</h3>
              <p className="mt-2 text-sm/6 text-muted">
                Have{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(placed.total)}
                </span>{" "}
                ready when your parcel arrives. We will call you on the number
                you verified before dispatching.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href={orderUrl}
            className="text-brand-600 hover:underline dark:text-brand-400"
          >
            Bookmark this order page
          </Link>{" "}
          to check progress later.
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
        <p className="mt-1 text-sm text-muted">Add a service to your cart first.</p>
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
      <Honeypot />

      <div className="space-y-8">
        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Your details</legend>
          <p className="mb-5 text-xs text-muted">
            We verify both so delivery updates actually reach you, and so
            nobody can order in your name.
          </p>

          <div className="grid gap-5">
            <Field
              label="Full name"
              name="name"
              required
              autoComplete="name"
              error={errors.name}
            />
            <VerifiedField
              channel="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              onVerified={setEmailToken}
              token={emailToken}
              hint="We send a 6-digit code to confirm it."
            />
            <VerifiedField
              channel="phone"
              label="Mobile number"
              placeholder="10-digit number"
              value={phone}
              onValueChange={setPhone}
              onVerified={setPhoneToken}
              token={phoneToken}
              hint="Used for delivery updates and the courier call."
            />
            {(errors.email || errors.phone) && (
              <p className="text-xs text-red-500" role="alert">
                {errors.email ?? errors.phone}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Delivery address</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Flat / house number, building, street, area"
              name="address"
              required
              autoComplete="street-address"
              error={errors.address}
              className="sm:col-span-2"
            />
            <Field
              label="Landmark"
              name="landmark"
              placeholder="Near…"
              autoComplete="address-line3"
              className="sm:col-span-2"
            />
            <Field
              label="City"
              name="city"
              required
              autoComplete="address-level2"
              error={errors.city}
            />
            <Field
              label="PIN code"
              name="postcode"
              required
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              error={errors.postcode}
            />
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="state" className="text-sm font-medium">
                State
              </label>
              <select
                id="state"
                name="state"
                defaultValue="Karnataka"
                autoComplete="address-level1"
                aria-invalid={!!errors.state}
                className={cn(
                  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none",
                  errors.state && "border-red-500",
                )}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state}</p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Payment</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentOption
              id="upi"
              checked={method === "upi"}
              onSelect={() => setMethod("upi")}
              icon={<QrCode className="size-5" aria-hidden />}
              title="Pay online by UPI"
              body="Scan a QR or open your UPI app. Goes into the print queue as soon as we confirm it."
            />
            <PaymentOption
              id="cod"
              checked={method === "cod"}
              onSelect={() => setMethod("cod")}
              icon={<Banknote className="size-5" aria-hidden />}
              title="Cash on delivery"
              body="Pay the courier when your parcel arrives. We call to confirm before dispatch."
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
          <p
            role="alert"
            className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
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
          disabled={status === "submitting" || !verified}
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Placing order…
            </>
          ) : method === "cod" ? (
            "Place order — pay on delivery"
          ) : (
            "Place order — pay by UPI"
          )}
        </Button>

        {!verified && (
          <p className="mt-3 text-center text-xs text-muted">
            Verify your email and mobile number to continue.
          </p>
        )}

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

function PaymentOption({
  id,
  checked,
  onSelect,
  icon,
  title,
  body,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <label
      htmlFor={`pay-${id}`}
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border p-4 transition",
        checked
          ? "border-brand-500 bg-brand-500/5"
          : "border-border hover:border-brand-400",
      )}
    >
      <input
        id={`pay-${id}`}
        type="radio"
        name="paymentMethod"
        value={id}
        checked={checked}
        onChange={onSelect}
        className="mt-1 size-4 shrink-0 accent-brand-600"
      />
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className={checked ? "text-brand-600 dark:text-brand-400" : "text-muted"}>
            {icon}
          </span>
          {title}
        </span>
        <span className="mt-1 block text-xs/5 text-muted">{body}</span>
      </span>
    </label>
  );
}
