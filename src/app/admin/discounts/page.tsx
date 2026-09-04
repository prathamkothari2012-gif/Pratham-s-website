import type { Metadata } from "next";
import { listDiscounts } from "@/lib/server/discounts";
import { formatPrice } from "@/lib/utils";
import { DiscountForm } from "@/components/admin/discount-form";
import { DiscountRowActions } from "@/components/admin/discount-row-actions";

export const metadata: Metadata = { title: "Discounts" };

const STATE_LABELS = {
  active: "Active",
  paused: "Paused",
  expired: "Expired",
  exhausted: "Used up",
} as const;

export default async function AdminDiscountsPage() {
  const discounts = await listDiscounts();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Discounts</h1>
      <p className="mt-1 text-sm text-muted">
        Codes customers can enter at checkout. Every redemption is re-checked on
        the server, so an expired or exhausted code cannot be reused.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
        <DiscountForm />

        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-3xl text-sm">
            <thead className="border-b border-border text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Minimum</th>
                <th className="px-5 py-3 font-medium">Used</th>
                <th className="px-5 py-3 font-medium">Expires</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discounts.map((discount) => {
                const live = discount.state === "active";

                return (
                  <tr key={discount.code}>
                    <td className="px-5 py-4 font-mono font-semibold">
                      {discount.code}
                    </td>
                    <td className="px-5 py-4">
                      {discount.type === "percent"
                        ? `${discount.value}% off`
                        : `${formatPrice(discount.value)} off`}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {discount.minSubtotal > 0
                        ? formatPrice(discount.minSubtotal)
                        : "—"}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-muted">
                      {discount.usedCount}
                      {discount.usageLimit !== null && ` / ${discount.usageLimit}`}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {discount.expiresAt
                        ? new Date(discount.expiresAt).toLocaleDateString("en-IN")
                        : "Never"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          live
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-foreground/5 text-muted"
                        }`}
                      >
                        {STATE_LABELS[discount.state]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <DiscountRowActions
                        code={discount.code}
                        active={discount.active}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {discounts.length === 0 && (
            <p className="px-5 py-16 text-center text-sm text-muted">
              No discount codes yet. Create one on the left.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
