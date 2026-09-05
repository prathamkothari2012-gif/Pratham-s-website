"use client";

import { useTransition } from "react";
import { Pause, Play, Trash2 } from "lucide-react";
import { deleteDiscount, toggleDiscount } from "@/lib/server/actions";

export function DiscountRowActions({
  code,
  active,
}: {
  code: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleDiscount(code))}
        aria-label={active ? `Pause ${code}` : `Activate ${code}`}
        className="rounded-lg p-2 text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
      >
        {active ? (
          <Pause className="size-4" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm(`Delete the code ${code}? This cannot be undone.`)) {
            startTransition(() => deleteDiscount(code));
          }
        }}
        aria-label={`Delete ${code}`}
        className="rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
