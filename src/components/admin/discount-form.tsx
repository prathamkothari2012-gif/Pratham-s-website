"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { createDiscount } from "@/lib/server/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function DiscountForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createDiscount(form);
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
      <h2 className="text-sm font-semibold">New code</h2>

      <div className="mt-5 grid gap-4">
        <Field
          label="Code"
          name="code"
          required
          placeholder="WELCOME10"
          className="[&_input]:font-mono [&_input]:uppercase"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="percent">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
        </div>

        <Field
          label={type === "percent" ? "Percent off" : "Amount off"}
          name="value"
          type="number"
          min={1}
          max={type === "percent" ? 100 : undefined}
          required
          placeholder={type === "percent" ? "10" : "500"}
        />

        <Field
          label="Minimum order"
          name="minSubtotal"
          type="number"
          min={0}
          placeholder="0"
          hint="Subtotal required before the code applies."
        />

        <Field
          label="Usage limit"
          name="usageLimit"
          type="number"
          min={1}
          placeholder="Unlimited"
        />

        <Field label="Expires" name="expiresAt" type="date" />
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
            Creating…
          </>
        ) : (
          <>
            <Plus className="size-4" aria-hidden />
            Create code
          </>
        )}
      </Button>
    </form>
  );
}
