import type { Metadata } from "next";
import { getAnalytics, PERIODS, type Period } from "@/lib/server/analytics";
import { readDb } from "@/lib/server/db";
import { formatPrice } from "@/lib/utils";
import { StatCard, delta } from "@/components/admin/stat-card";
import { ProfitChart } from "@/components/admin/profit-chart";
import { ExpenseForm } from "@/components/admin/expense-form";
import { ExpenseRowActions } from "@/components/admin/expense-row-actions";

export const metadata: Metadata = { title: "Profit & loss" };

type Props = { searchParams: Promise<{ period?: string }> };

export default async function AnalyticsPage({ searchParams }: Props) {
  const { period: raw } = await searchParams;
  const period = (PERIODS.find((p) => p.id === raw)?.id ?? "12m") as Period;

  const [{ pnl, previous, months, topProducts, outstanding }, db] = await Promise.all([
    getAnalytics(period),
    readDb(),
  ]);

  const expenses = db.expenses.slice(0, 20);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Profit &amp; loss
          </h1>
          <p className="mt-1 text-sm text-muted">
            Revenue counts only orders you have confirmed as paid. GST is
            excluded — it is collected for the government, not earned.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODS.map((option) => (
            <a
              key={option.id}
              href={`/admin/analytics?period=${option.id}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                period === option.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-muted hover:border-brand-400 hover:text-foreground"
              }`}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(pnl.revenue)}
          hint="paid orders, excl. GST"
          change={previous ? delta(pnl.revenue, previous.revenue) : null}
        />
        <StatCard
          label="Cost of goods"
          value={formatPrice(pnl.cogs)}
          hint="materials & machine time"
          invertTrend
          change={previous ? delta(pnl.cogs, previous.cogs) : null}
        />
        <StatCard
          label="Gross profit"
          value={formatPrice(pnl.grossProfit)}
          hint={`${(pnl.grossMargin * 100).toFixed(0)}% margin`}
          change={previous ? delta(pnl.grossProfit, previous.grossProfit) : null}
        />
        <StatCard
          label="Net profit"
          value={formatPrice(pnl.netProfit)}
          hint={`after ${formatPrice(pnl.expenses)} expenses`}
          change={previous ? delta(pnl.netProfit, previous.netProfit) : null}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          <ProfitChart months={months} />

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Statement</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Line label="Revenue (excl. GST)" value={formatPrice(pnl.revenue)} />
              <Line
                label="Less cost of goods sold"
                value={`−${formatPrice(pnl.cogs)}`}
              />
              <Line
                label="Gross profit"
                value={formatPrice(pnl.grossProfit)}
                strong
              />
              <Line
                label="Less operating expenses"
                value={`−${formatPrice(pnl.expenses)}`}
              />
              <div className="border-t border-border pt-3">
                <Line
                  label="Net profit"
                  value={formatPrice(pnl.netProfit)}
                  strong
                  tone={pnl.netProfit >= 0 ? "good" : "bad"}
                />
              </div>
              <div className="mt-4 space-y-3 border-t border-border pt-4 text-xs">
                <Line
                  label="Outstanding (placed, not yet paid)"
                  value={formatPrice(outstanding.amount)}
                />
                <Line
                  label="GST collected (owed, not income)"
                  value={formatPrice(pnl.taxCollected)}
                />
                <Line
                  label="Discounts given"
                  value={formatPrice(pnl.discountsGiven)}
                />
                <Line label="Orders" value={String(pnl.orderCount)} />
                <Line label="Units sold" value={String(pnl.unitsSold)} />
                <Line
                  label="Average order value"
                  value={formatPrice(Math.round(pnl.averageOrderValue))}
                />
              </div>
            </dl>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <div className="p-6 pb-0">
              <h2 className="font-semibold">Profit by product</h2>
            </div>

            {topProducts.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-muted">
                No sales in this period.
              </p>
            ) : (
              <table className="mt-4 w-full min-w-2xl text-sm">
                <thead className="border-y border-border text-left text-xs text-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 text-right font-medium">Units</th>
                    <th className="px-6 py-3 text-right font-medium">Revenue</th>
                    <th className="px-6 py-3 text-right font-medium">Cost</th>
                    <th className="px-6 py-3 text-right font-medium">Profit</th>
                    <th className="px-6 py-3 text-right font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topProducts.map((product) => (
                    <tr key={product.slug}>
                      <td className="px-6 py-3 font-medium">{product.name}</td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {product.units}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {formatPrice(product.revenue)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted">
                        {formatPrice(product.cost)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium">
                        {formatPrice(product.profit)}
                      </td>
                      <td
                        className={`px-6 py-3 text-right tabular-nums ${
                          product.margin < 0.25
                            ? "text-amber-600 dark:text-amber-400"
                            : ""
                        }`}
                      >
                        {(product.margin * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-8">
          <ExpenseForm />

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold">Recent expenses</h2>

            {expenses.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Nothing logged yet. Add filament purchases, rent, electricity
                and machine maintenance to see true net profit.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted">
                        {expense.category} ·{" "}
                        {new Date(expense.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm tabular-nums">
                      {formatPrice(expense.amount)}
                    </p>
                    <ExpenseRowActions
                      id={expense.id}
                      description={expense.description}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "good" | "bad";
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? "font-semibold" : "text-muted"}>{label}</dt>
      <dd
        className={`tabular-nums ${strong ? "font-semibold" : ""} ${
          tone === "bad"
            ? "text-red-500"
            : tone === "good"
              ? "text-emerald-600 dark:text-emerald-400"
              : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
