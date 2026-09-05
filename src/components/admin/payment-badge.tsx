import type { PaymentStatus } from "@/lib/types";

const styles: Record<PaymentStatus, string> = {
  unpaid: "bg-foreground/5 text-muted",
  submitted: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  verified: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  refunded: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const labels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  submitted: "Awaiting check",
  verified: "Paid",
  refunded: "Refunded",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
