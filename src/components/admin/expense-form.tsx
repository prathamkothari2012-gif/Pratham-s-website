"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createExpense } from "@/lib/server/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const CATEGORIES = [
  "Filament & resin",
  "Machine maintenance",
  "Electricity",
  "Rent",
  "Packaging & shipping",
  "Marketing",
  "Software",
  "Other",
];

export function ExpenseForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createExpense(form);
      if (result.ok) {
        formRef.current?.reset();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-6"
    >
      <h2 className="text-sm font-semibold">Log an expense</h2>
      <p className="mt-1 text-xs text-muted">
        Anything that is not a per-order material cost.
      </p>

      <div className="mt-5 grid gap-4">
        <Field
          label="Description"
          name="description"
          required
          placeholder="5 kg PLA restock"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="expense-category"
            name="category"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <Field label="Amount" name="amount" type="number" min={1} required />
        <Field
          label="Date"
          name="date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden />
            Add expense
          </>
        )}
      </Button>
    </form>
  );
}
