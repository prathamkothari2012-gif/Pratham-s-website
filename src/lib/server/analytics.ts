import "server-only";
import { readDb, type Order } from "@/lib/server/db";

/**
 * Profit and loss for the shop.
 *
 * Three deliberate accounting choices:
 *  - GST is excluded from revenue. It is collected on the government's behalf
 *    and is a liability, not income, so it is reported separately.
 *  - Cancelled orders are excluded entirely.
 *  - Only orders whose payment the owner has *verified* count as revenue.
 *    An order placed but not yet paid is not money, so it is reported
 *    separately as "outstanding" rather than inflating profit.
 */

export type Period = "30d" | "90d" | "12m" | "all";

export const PERIODS: { id: Period; label: string }[] = [
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "12m", label: "Last 12 months" },
  { id: "all", label: "All time" },
];

function since(period: Period): number {
  const day = 24 * 60 * 60 * 1000;
  switch (period) {
    case "30d":
      return Date.now() - 30 * day;
    case "90d":
      return Date.now() - 90 * day;
    case "12m":
      return Date.now() - 365 * day;
    case "all":
      return 0;
  }
}

/** Revenue excluding tax: what the business actually earns on an order. */
export function orderRevenue(order: Order): number {
  return order.totals.subtotal - order.totals.discount + order.totals.shipping;
}

export function orderCost(order: Order): number {
  return order.lines.reduce((sum, l) => sum + l.unitCost * l.quantity, 0);
}

export type ProfitAndLoss = {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  expenses: number;
  netProfit: number;
  netMargin: number;
  taxCollected: number;
  discountsGiven: number;
  orderCount: number;
  unitsSold: number;
  averageOrderValue: number;
};

export type Outstanding = {
  /** Charged totals for orders placed but not yet confirmed as paid. */
  amount: number;
  orderCount: number;
  /** Customer has reported a UTR and is waiting on the owner to check it. */
  awaitingCheck: number;
};

export type MonthPoint = {
  /** YYYY-MM */
  month: string;
  label: string;
  revenue: number;
  cogs: number;
  expenses: number;
  profit: number;
};

export type ProductPerformance = {
  slug: string;
  name: string;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
};

export type AnalyticsSnapshot = {
  pnl: ProfitAndLoss;
  outstanding: Outstanding;
  /** Same figures for the immediately preceding window, for trend arrows.
   *  Null when the period is "all time" and there is nothing to compare to. */
  previous: ProfitAndLoss | null;
  months: MonthPoint[];
  topProducts: ProductPerformance[];
  statusCounts: Record<string, number>;
  recentOrders: Order[];
};

function summarise(
  orders: Order[],
  expenseTotal: number,
): ProfitAndLoss {
  const revenue = orders.reduce((sum, o) => sum + orderRevenue(o), 0);
  const cogs = orders.reduce((sum, o) => sum + orderCost(o), 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenseTotal;
  const unitsSold = orders.reduce(
    (sum, o) => sum + o.lines.reduce((n, l) => n + l.quantity, 0),
    0,
  );

  return {
    revenue,
    cogs,
    grossProfit,
    grossMargin: revenue > 0 ? grossProfit / revenue : 0,
    expenses: expenseTotal,
    netProfit,
    netMargin: revenue > 0 ? netProfit / revenue : 0,
    taxCollected: orders.reduce((sum, o) => sum + o.totals.tax, 0),
    discountsGiven: orders.reduce((sum, o) => sum + o.totals.discount, 0),
    orderCount: orders.length,
    unitsSold,
    averageOrderValue: orders.length > 0 ? revenue / orders.length : 0,
  };
}

export async function getAnalytics(
  period: Period = "12m",
): Promise<AnalyticsSnapshot> {
  const db = await readDb();

  // Revenue means money received, so an order only counts once its payment
  // has been verified against the account.
  const billable = db.orders.filter(
    (o) => o.status !== "cancelled" && o.payment.status === "verified",
  );

  const unpaid = db.orders.filter(
    (o) =>
      o.status !== "cancelled" &&
      (o.payment.status === "unpaid" || o.payment.status === "submitted"),
  );
  const outstanding: Outstanding = {
    amount: unpaid.reduce((sum, o) => sum + o.totals.total, 0),
    orderCount: unpaid.length,
    awaitingCheck: unpaid.filter((o) => o.payment.status === "submitted").length,
  };
  const from = since(period);
  const windowMs = from === 0 ? 0 : Date.now() - from;

  const inWindow = billable.filter(
    (o) => new Date(o.createdAt).getTime() >= from,
  );
  const expensesInWindow = db.expenses
    .filter((e) => new Date(e.date).getTime() >= from)
    .reduce((sum, e) => sum + e.amount, 0);

  // The equivalent window immediately before this one.
  let previous: ProfitAndLoss | null = null;
  if (windowMs > 0) {
    const prevFrom = from - windowMs;
    const prevOrders = billable.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= prevFrom && t < from;
    });
    const prevExpenses = db.expenses
      .filter((e) => {
        const t = new Date(e.date).getTime();
        return t >= prevFrom && t < from;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    previous = summarise(prevOrders, prevExpenses);
  }

  // Last 12 calendar months, including empty ones so the chart has no gaps.
  const months: MonthPoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthOrders = billable.filter((o) => o.createdAt.slice(0, 7) === key);
    const monthExpenses = db.expenses
      .filter((e) => e.date.slice(0, 7) === key)
      .reduce((sum, e) => sum + e.amount, 0);
    const revenue = monthOrders.reduce((sum, o) => sum + orderRevenue(o), 0);
    const cogs = monthOrders.reduce((sum, o) => sum + orderCost(o), 0);

    months.push({
      month: key,
      label: d.toLocaleString("en", { month: "short" }),
      revenue,
      cogs,
      expenses: monthExpenses,
      profit: revenue - cogs - monthExpenses,
    });
  }

  // Per-product performance across the selected window.
  const byProduct = new Map<string, ProductPerformance>();
  for (const order of inWindow) {
    for (const line of order.lines) {
      const entry = byProduct.get(line.slug) ?? {
        slug: line.slug,
        name: line.name,
        units: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        margin: 0,
      };
      entry.units += line.quantity;
      entry.revenue += line.lineTotal;
      entry.cost += line.unitCost * line.quantity;
      entry.profit = entry.revenue - entry.cost;
      entry.margin = entry.revenue > 0 ? entry.profit / entry.revenue : 0;
      byProduct.set(line.slug, entry);
    }
  }

  const statusCounts: Record<string, number> = {};
  for (const order of db.orders) {
    statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
  }

  return {
    pnl: summarise(inWindow, expensesInWindow),
    outstanding,
    previous,
    months,
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue),
    statusCounts,
    recentOrders: db.orders.slice(0, 8),
  };
}
