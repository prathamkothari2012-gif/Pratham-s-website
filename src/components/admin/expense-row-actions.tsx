"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/lib/server/actions";

export function ExpenseRowActions({
  id,
  description,
}: {
  id: string;
  description: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Delete the expense "${description}"?`)) {
          startTransition(() => deleteExpense(id));
        }
      }}
      aria-label={`Delete expense ${description}`}
      className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}
