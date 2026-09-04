import type { Metadata } from "next";
import { readDb } from "@/lib/server/db";
import { orderCost, orderRevenue } from "@/lib/server/analytics";
import { formatPrice } from "@/lib/utils";
import { OrderRow } from "@/components/admin/order-row";

export const metadata: Metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ status?: string; payment?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, payment } = await searchParams;
  const db = await readDb();

  const orders = db.orders.filter(
    (o) =>
      (!status || o.status === status) &&
      (!payment || o.payment.status === payment),
  );

  const filters = [
    { id: "", label: "All", count: db.orders.length },
    ...["pending", "confirmed", "printing", "shipped", "cancelled"].map((s) => ({
      id: s,
      label: s[0].toUpperCase() + s.slice(1),
      count: db.orders.filter((o) => o.status === s).length,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        {db.orders.length} order{db.orders.length === 1 ? "" : "s"} all time.
        Change a status and the profit figures update with it.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted">Payment</span>
        {[
          { id: "", label: "Any" },
          { id: "unpaid", label: "Unpaid" },
          { id: "submitted", label: "Awaiting check" },
          { id: "verified", label: "Paid" },
        ].map((option) => {
          const active = (payment ?? "") === option.id;
          const count = option.id
            ? db.orders.filter((o) => o.payment.status === option.id).length
            : db.orders.length;
          return (
            <a
              key={option.id || "any"}
              href={option.id ? `/admin/orders?payment=${option.id}` : "/admin/orders"}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-muted hover:border-brand-400 hover:text-foreground"
              }`}
            >
              {option.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </a>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-muted">Stage</span>
        {filters.map((filter) => {
          const active = (status ?? "") === filter.id;
          return (
            <a
              key={filter.id || "all"}
              href={filter.id ? `/admin/orders?status=${filter.id}` : "/admin/orders"}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-muted hover:border-brand-400 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span className="ml-1.5 opacity-70">{filter.count}</span>
            </a>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="font-medium">No orders here yet</p>
          <p className="mt-1 text-sm text-muted">
            Orders placed through the shop appear on this page immediately.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              revenue={formatPrice(orderRevenue(order))}
              cost={formatPrice(orderCost(order))}
              profit={formatPrice(orderRevenue(order) - orderCost(order))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
