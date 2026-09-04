import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  change,
  /** For costs, a rise is bad — flip which direction reads as positive. */
  invertTrend = false,
}: {
  label: string;
  value: string;
  hint?: string;
  change?: number | null;
  invertTrend?: boolean;
}) {
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const up = hasChange && change > 0.0001;
  const down = hasChange && change < -0.0001;
  const good = invertTrend ? down : up;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {hasChange && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
              !up && !down && "bg-foreground/5 text-muted",
              (up || down) &&
                (good
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"),
            )}
          >
            {up ? (
              <ArrowUpRight className="size-3" aria-hidden />
            ) : down ? (
              <ArrowDownRight className="size-3" aria-hidden />
            ) : (
              <Minus className="size-3" aria-hidden />
            )}
            {Math.abs(change * 100).toFixed(0)}%
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </div>
  );
}

/** Percentage change from `before` to `after`, or null when there is no
 *  meaningful baseline. */
export function delta(after: number, before: number): number | null {
  if (!Number.isFinite(before) || before === 0) return null;
  return (after - before) / Math.abs(before);
}
