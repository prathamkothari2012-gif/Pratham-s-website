import Link from "next/link";
import { ArrowRight, PackageX } from "lucide-react";
import { getAnalytics } from "@/lib/server/analytics";
import { readDb } from "@/lib/server/db";
import { formatPrice } from "@/lib/utils";
import { StatCard, delta } from "@/components/admin/stat-card";
import { ProfitChart } from "@/components/admin/profit-chart";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";

export default async function AdminOverviewPage() {
  const [analytics, db] = await Promise.all([getAnalytics("30d"), readDb()]);
  const { pnl, previous, months, topProducts, recentOrders } = analytics;

  const lowMarginProducts = db.products.filter(
    (p) => p.active && p.basePrice > 0 && (p.basePrice - p.costPrice) / p.basePrice < 0.25,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            Last 30 days, compared with the 30 days before.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Full profit &amp; loss
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(pnl.revenue)}
          hint="excl. GST"
          change={previous ? delta(pnl.revenue, previous.revenue) : null}
        />
        <StatCard
          label="Net profit"
          value={formatPrice(pnl.netProfit)}
          hint={`${(pnl.netMargin * 100).toFixed(0)}% margin`}
          change={previous ? delta(pnl.netProfit, previous.netProfit) : null}
        />
        <StatCard
          label="Orders"
          value={String(pnl.orderCount)}
          hint={`${pnl.unitsSold} unit${pnl.unitsSold === 1 ? "" : "s"}`}
          change={previous ? delta(pnl.orderCount, previous.orderCount) : null}
        />
        <StatCard
          label="Average order"
          value={formatPrice(Math.round(pnl.averageOrderValue))}
          change={
            previous ? delta(pnl.averageOrderValue, previous.averageOrderValue) : null
          }
        />
      </div>

      <div className="mt-6">
        <ProfitChart months={months} />
      </div>

      {lowMarginProducts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <PackageX className="size-4" aria-hidden />
            {lowMarginProducts.length} product
            {lowMarginProducts.length === 1 ? "" : "s"} earning under 25% margin
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lowMarginProducts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="rounded-full border border-amber-500/30 px-3 py-1 text-xs hover:bg-amber-500/10"
                >
                  {p.name} · {formatPrice(p.basePrice - p.costPrice)} per unit
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              No orders yet. They will appear here the moment one comes in.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/orders#${order.reference}`}
                      className="font-mono text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {order.reference}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {order.customer.name} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-medium tabular-nums">
                    {formatPrice(order.totals.total)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Best sellers</h2>

          {topProducts.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Nothing sold in this period yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {topProducts.slice(0, 5).map((product) => (
                <li key={product.slug}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{product.name}</span>
                    <span className="shrink-0 tabular-nums">
                      {formatPrice(product.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{
                        width: `${(product.revenue / topProducts[0].revenue) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {product.units} unit{product.units === 1 ? "" : "s"} ·{" "}
                    {(product.margin * 100).toFixed(0)}% margin
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
