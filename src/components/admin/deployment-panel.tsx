import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DeploymentCheck } from "@/lib/server/deployment";

const icons = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  blocked: XCircle,
} as const;

const tones = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  blocked: "text-red-600 dark:text-red-400",
} as const;

/** Shown only while something is unfinished — a fully wired deployment does
 *  not need a panel telling it so. */
export function DeploymentPanel({ checks }: { checks: DeploymentCheck[] }) {
  const problems = checks.filter((c) => c.level !== "ok");
  if (problems.length === 0) return null;

  const blocked = problems.some((c) => c.level === "blocked");

  return (
    <section
      className={`mt-6 rounded-2xl border p-5 ${
        blocked
          ? "border-red-500/30 bg-red-500/5"
          : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      <h2 className="text-sm font-semibold">
        {blocked ? "Not ready to take orders yet" : "Setup not finished"}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {problems.map((check) => {
          const Icon = icons[check.level];
          return (
            <li key={check.label} className="flex items-start gap-2.5 text-sm">
              <Icon
                className={`mt-0.5 size-4 shrink-0 ${tones[check.level]}`}
                aria-hidden
              />
              <span>
                <span className="font-medium">{check.label}:</span>{" "}
                <span className="text-muted">{check.detail}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
