"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Smartphone } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PaymentInfo = {
  upiId: string;
  payeeName: string;
  amount: number;
  link: string;
  qrSvg: string;
};

export function UpiPayment({
  reference,
  accessToken,
  payment,
  initialStatus = "unpaid",
  initialUtr = null,
}: {
  reference: string;
  accessToken: string;
  payment: PaymentInfo;
  initialStatus?: string;
  initialUtr?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [utr, setUtr] = useState(initialUtr ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Could not copy — please select and copy it manually.");
    }
  }

  async function submitUtr(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, accessToken, utr }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not record that reference.");
        return;
      }

      setStatus(data.status);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "verified") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <Check className="mx-auto size-8 text-emerald-500" aria-hidden />
        <h2 className="mt-3 font-semibold">Payment confirmed</h2>
        <p className="mt-1 text-sm text-muted">
          We have your {formatPrice(payment.amount)} and your print is in the
          queue. We will email you when it ships.
        </p>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <Check className="mx-auto size-8 text-brand-500" aria-hidden />
        <h2 className="mt-3 font-semibold">Thanks — we&rsquo;re checking</h2>
        <p className="mt-1 text-sm text-muted">
          You told us you paid {formatPrice(payment.amount)}
          {utr && (
            <>
              {" "}
              with reference{" "}
              <span className="font-mono text-foreground">{utr}</span>
            </>
          )}
          . We confirm against our account and start printing, usually within a
          few hours.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Pay by UPI</h2>
        <p className="text-2xl font-semibold tabular-nums">
          {formatPrice(payment.amount)}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">
        Paid directly to us — no card details and no gateway fee.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* The QR is generated on our own server, so no third party sees the
            amount or the order reference. */}
        <div className="mx-auto w-44 rounded-xl bg-white p-3 shadow-sm sm:mx-0">
          <div
            className="[&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: payment.qrSvg }}
          />
        </div>

        <div>
          <p className="text-sm font-medium">Scan with any UPI app</p>
          <p className="mt-1 text-sm text-muted">
            Google Pay, PhonePe, Paytm, BHIM — whichever you use.
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Paying</dt>
              <dd className="font-medium">{payment.payeeName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">UPI ID</dt>
              <dd className="flex items-center gap-2">
                <span className="font-mono">{payment.upiId}</span>
                <button
                  type="button"
                  onClick={() => copy(payment.upiId, "upi")}
                  aria-label="Copy UPI ID"
                  className="rounded-lg p-1.5 text-muted transition hover:bg-foreground/5 hover:text-foreground"
                >
                  {copied === "upi" ? (
                    <Check className="size-3.5 text-emerald-500" aria-hidden />
                  ) : (
                    <Copy className="size-3.5" aria-hidden />
                  )}
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Reference</dt>
              <dd className="font-mono">{reference}</dd>
            </div>
          </dl>

          {/* On a phone this opens the UPI app chooser with everything
              pre-filled. On a laptop it does nothing, hence the QR above. */}
          <a
            href={payment.link}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-medium text-white transition hover:bg-brand-500 sm:w-auto"
          >
            <Smartphone className="size-4" aria-hidden />
            Open my UPI app
          </a>
        </div>
      </div>

      <form onSubmit={submitUtr} className="mt-8 border-t border-border pt-6">
        <label htmlFor="utr" className="text-sm font-medium">
          Already paid? Enter the UPI reference number
        </label>
        <p className="mt-1 text-xs text-muted">
          Your UPI app shows a 12-digit UTR or transaction ID after payment.
          Sending it lets us match your payment straight away.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="utr"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 412345678901"
            inputMode="numeric"
            aria-invalid={!!error}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm placeholder:font-sans placeholder:text-muted/70 focus:border-brand-500 focus:outline-none"
          />
          <Button type="submit" disabled={busy || !utr.trim()} className="shrink-0">
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              "I've paid"
            )}
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-500">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
