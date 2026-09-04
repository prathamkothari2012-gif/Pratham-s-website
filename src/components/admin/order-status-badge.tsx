import type { OrderStatus } from "@/lib/types";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  confirmed: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  printing: "bg-brand-500/10 text-brand-700 dark:text-brand-300",
  shipped: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
