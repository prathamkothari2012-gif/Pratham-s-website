import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { site } from "@/content/site";
import { readDb } from "@/lib/server/db";
import { buildPaymentInstructions } from "@/lib/server/payment";
import { formatPrice, whatsappLink } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { UpiPayment } from "@/components/upi-payment";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

/** Always reflects the live payment status. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { reference } = await params;
  const { t } = await searchParams;

  const db = await readDb();
  const order = db.orders.find((o) => o.reference === reference);

  // The token is what authorises viewing this page — a bare reference is not
  // enough, so orders cannot be enumerated.
  if (!order || !t || order.accessToken !== t) notFound();

  const payment = await buildPaymentInstructions({
    amount: order.payment.amount,
    reference: order.reference,
  });

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-brand-500" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Order {order.reference}
        </h1>
        <p className="mt-2 text-sm/6 text-muted">
          Placed{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            dateStyle: "medium",
          })}
          . Keep this page bookmarked — it is where you pay and check progress.
        </p>
      </div>

      <div className="mt-8">
        <UpiPayment
          reference={order.reference}
          accessToken={order.accessToken}
          payment={payment}
          initialStatus={order.payment.status}
          initialUtr={order.payment.utr}
        />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">What you ordered</h2>
        <ul className="mt-4 divide-y divide-border">
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
                  {line.options.map((option) => (
                    <li key={option}>{option}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <Row label="Subtotal" value={formatPrice(order.totals.subtotal)} />
          {order.totals.discount > 0 && (
            <Row
              label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
              value={`−${formatPrice(order.totals.discount)}`}
            />
          )}
          <Row label="Shipping" value={formatPrice(order.totals.shipping)} />
          <Row label="GST" value={formatPrice(order.totals.tax)} />
          <Row label="Total" value={formatPrice(order.totals.total)} strong />
        </dl>
      </section>

      <p className="mt-8 text-center text-sm text-muted">
        Something not right?{" "}
        <a
          className="text-brand-600 hover:underline dark:text-brand-400"
          href={whatsappLink(`Hi ${site.name}, I have a question about order ${order.reference}.`)}
          target="_blank"
          rel="noreferrer noopener"
        >
          Message us on WhatsApp
        </a>{" "}
        or email{" "}
        <a
          className="text-brand-600 hover:underline dark:text-brand-400"
          href={`mailto:${site.contact.email}?subject=Order ${order.reference}`}
        >
          {site.contact.email}
        </a>
        .
      </p>

      <p className="mt-4 text-center text-sm">
        <Link href="/shop" className="text-muted hover:text-foreground">
          Back to the shop
        </Link>
      </p>
    </Container>
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
    <div className="flex justify-between gap-4">
      <dt className={strong ? "font-semibold" : "text-muted"}>{label}</dt>
      <dd className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
