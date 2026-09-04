import type { MonthPoint } from "@/lib/server/analytics";
import { formatPrice } from "@/lib/utils";

/**
 * Twelve-month revenue and profit, drawn as bars. Deliberately dependency-free
 * SVG-less CSS so it stays legible in both themes and needs no chart library.
 */
export function ProfitChart({ months }: { months: MonthPoint[] }) {
  // Scale to the largest absolute value so losses render below the baseline.
  const peak = Math.max(
    1,
    ...months.map((m) => Math.max(m.revenue, Math.abs(m.profit))),
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Revenue and profit</h2>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-500" aria-hidden />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-emerald-500" aria-hidden />
            Profit
          </span>
        </div>
      </div>

      <div className="mt-8 flex h-56 items-end gap-2 sm:gap-3">
        {months.map((month) => {
          const revenueHeight = (month.revenue / peak) * 100;
          const profitHeight = (Math.abs(month.profit) / peak) * 100;
          const loss = month.profit < 0;

          return (
            <div
              key={month.month}
              className="group flex h-full flex-1 flex-col justify-end gap-1.5"
            >
              <div className="relative flex h-full items-end justify-center gap-1">
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs whitespace-nowrap shadow-lg group-hover:block">
                  <p className="font-medium">{month.label}</p>
                  <p className="mt-1 text-muted">
                    Revenue {formatPrice(month.revenue)}
                  </p>
                  <p className={loss ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}>
                    {loss ? "Loss" : "Profit"} {formatPrice(Math.abs(month.profit))}
                  </p>
                </div>

                <div
                  className="w-full max-w-3 rounded-t bg-brand-500/80 transition group-hover:bg-brand-500"
                  style={{ height: `${Math.max(revenueHeight, month.revenue > 0 ? 2 : 0)}%` }}
                />
                <div
                  className={`w-full max-w-3 rounded-t transition ${
                    loss ? "bg-red-500/80 group-hover:bg-red-500" : "bg-emerald-500/80 group-hover:bg-emerald-500"
                  }`}
                  style={{ height: `${Math.max(profitHeight, month.profit !== 0 ? 2 : 0)}%` }}
                />
              </div>
              <p className="text-center text-[11px] text-muted">{month.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
