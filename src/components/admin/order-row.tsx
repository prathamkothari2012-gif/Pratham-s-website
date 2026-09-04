"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { setOrderStatus, setPaymentStatus } from "@/lib/server/actions";
import { ORDER_STATUSES, type Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PaymentBadge } from "@/components/admin/payment-badge";

export function OrderRow({
  order,
  revenue,
  cost,
  profit,
}: {
  order: Order;
  revenue: string;
  cost: string;
  profit: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <article
      id={order.reference}
      className="overflow-hidden rounded-2xl border border-border bg-surface scroll-mt-24"
    >
      <div className="flex flex-wrap items-center gap-4 p-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold">{order.reference}</p>
            <p className="truncate text-xs text-muted">
              {order.customer.name} ·{" "}
              {new Date(order.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </button>

        <PaymentBadge status={order.payment.status} />
        <OrderStatusBadge status={order.status} />

        <p className="text-sm font-semibold tabular-nums">
          {formatPrice(order.totals.total)}
        </p>

        <label className="sr-only" htmlFor={`status-${order.id}`}>
          Order status
        </label>
        <select
          id={`status-${order.id}`}
          value={order.status}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            startTransition(() => setOrderStatus(order.id, next));
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize focus:border-brand-500 focus:outline-none disabled:opacity-50"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      {open && (
        <div className="grid gap-6 border-t border-border p-5 lg:grid-cols-[1fr_20rem]">
          <div>
            <h3 className="text-sm font-semibold">Items</h3>
            <ul className="mt-3 divide-y divide-border">
              {order.lines.map((line, i) => (
                <li key={`${line.slug}-${i}`} className="py-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium">
                      {line.quantity} × {line.name}
                    </span>
                    <span className="tabular-nums">{formatPrice(line.lineTotal)}</span>
                  </div>
                  {line.options.length > 0 && (
                    <ul className="mt-1 text-xs text-muted">
                      {line.options.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 text-xs text-muted">
                    Unit cost {formatPrice(line.unitCost)} · margin{" "}
                    {line.unitPrice > 0
                      ? `${(((line.unitPrice - line.unitCost) / line.unitPrice) * 100).toFixed(0)}%`
                      : "—"}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold">Customer</h3>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd>
                  <a
                    className="hover:text-brand-600 dark:hover:text-brand-400"
                    href={`mailto:${order.customer.email}`}
                  >
                    {order.customer.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd>
                  <a
                    className="hover:text-brand-600 dark:hover:text-brand-400"
                    href={`tel:${order.customer.phone}`}
                  >
                    {order.customer.phone}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Delivery address</dt>
                <dd>
                  {order.customer.address}, {order.customer.city}{" "}
                  {order.customer.postcode}
                </dd>
              </div>
              {order.customer.fileUrl && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted">Model file</dt>
                  <dd>
                    <a
                      href={order.customer.fileUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Open link
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </dd>
                </div>
              )}
              {order.customer.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted">Notes</dt>
                  <dd className="whitespace-pre-wrap">{order.customer.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold">Payment</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Method" value="UPI" />
                <Row label="Paid to" value={order.payment.payeeVpa} />
                <Row
                  label="Customer's reference"
                  value={order.payment.utr ?? "not sent yet"}
                />
                {order.payment.submittedAt && (
                  <Row
                    label="Reported"
                    value={new Date(order.payment.submittedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  />
                )}
              </dl>

              <label className="sr-only" htmlFor={`payment-${order.id}`}>
                Payment status
              </label>
              <select
                id={`payment-${order.id}`}
                value={order.payment.status}
                disabled={pending}
                onChange={(e) => {
                  const next = e.target.value;
                  startTransition(() => setPaymentStatus(order.id, next));
                }}
                className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
              >
                <option value="unpaid">Unpaid</option>
                <option value="submitted">Customer says paid</option>
                <option value="verified">Paid — confirmed in my account</option>
                <option value="refunded">Refunded</option>
              </select>
              <p className="mt-2 text-xs text-muted">
                Check the amount against your UPI app before marking it paid.
              </p>
            </div>

            <div className="rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold">Money</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(order.totals.subtotal)} />
              {order.totals.discount > 0 && (
                <Row
                  label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
                  value={`−${formatPrice(order.totals.discount)}`}
                />
              )}
              <Row label="Shipping" value={formatPrice(order.totals.shipping)} />
              <Row label="GST collected" value={formatPrice(order.totals.tax)} />
              <Row label="Charged" value={formatPrice(order.totals.total)} strong />
              <div className="border-t border-border pt-2">
                <Row label="Revenue (excl. GST)" value={revenue} />
                <Row label="Cost of goods" value={cost} />
                <Row label="Gross profit" value={profit} strong />
              </div>
            </dl>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-3",
        strong ? "font-semibold" : "text-muted",
      )}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
