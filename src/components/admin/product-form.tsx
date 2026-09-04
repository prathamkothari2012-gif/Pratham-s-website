"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { categories } from "@/content/catalog";
import type { StoredProduct } from "@/lib/types";
import type { ActionResult } from "@/lib/server/actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const OPTIONS_PLACEHOLDER = `Layer height | Finer layers take longer to print
0.28 mm draft = -100
0.20 mm standard = 0
0.12 mm fine = 250

Finishing
Supports removed = 0
Sanded smooth = 350`;

export function ProductForm({
  action,
  product,
  optionGroupsText,
  submitLabel,
}: {
  action: (form: FormData) => Promise<ActionResult>;
  product?: StoredProduct;
  optionGroupsText?: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Live margin preview as the owner types.
  const [price, setPrice] = useState(product?.basePrice ?? 0);
  const [cost, setCost] = useState(product?.costPrice ?? 0);
  const margin = price > 0 ? (price - cost) / price : 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await action(form);
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="space-y-6">
        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Basics</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              name="name"
              required
              defaultValue={product?.name}
              className="sm:col-span-2"
            />

            {product ? (
              // The slug is the product's URL and the key past orders point at,
              // so it is fixed once created.
              <input type="hidden" name="slug" value={product.slug} />
            ) : (
              <Field
                label="URL slug"
                name="slug"
                hint="Leave blank to build one from the name."
                placeholder="custom-pla-print"
                className="sm:col-span-2"
              />
            )}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={product?.category ?? categories[0]}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Card summary"
              name="summary"
              required
              defaultValue={product?.summary}
              hint="One line, shown on the shop grid."
              className="sm:col-span-2"
            />
            <Field
              label="Full description"
              name="description"
              as="textarea"
              defaultValue={product?.description}
              className="sm:col-span-2"
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Pricing</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Sale price"
              name="basePrice"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product?.basePrice}
              onChange={(e) => setPrice(Number(e.target.value))}
              hint="Starting price before options."
            />
            <Field
              label="Cost price"
              name="costPrice"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product?.costPrice}
              onChange={(e) => setCost(Number(e.target.value))}
              hint="Material, machine time and labour."
            />
            <Field
              label="Price unit"
              name="unit"
              defaultValue={product?.unit}
              placeholder="per part, up to 100 mm"
            />
            <Field
              label="Turnaround"
              name="turnaround"
              defaultValue={product?.turnaround}
              placeholder="2–3 working days"
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-6">
          <legend className="px-2 text-sm font-semibold">Details</legend>
          <div className="grid gap-4">
            <Field
              label="Highlights"
              name="highlights"
              as="textarea"
              defaultValue={product?.highlights.join("\n")}
              hint="One per line. Shown as a checklist on the product page."
            />
            <Field
              label="Options"
              name="optionGroups"
              as="textarea"
              defaultValue={optionGroupsText}
              placeholder={OPTIONS_PLACEHOLDER}
              hint="One group per block, blank line between. Header is the group name, with an optional | hint. Each row is: Label = price change."
              className="[&_textarea]:min-h-56 [&_textarea]:font-mono [&_textarea]:text-xs"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Card colour, from"
                name="accentFrom"
                type="color"
                defaultValue={product?.accent[0] ?? "#3282b8"}
                className="[&_input]:h-11 [&_input]:p-1"
              />
              <Field
                label="Card colour, to"
                name="accentTo"
                type="color"
                defaultValue={product?.accent[1] ?? "#8cc6e8"}
                className="[&_input]:h-11 [&_input]:p-1"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="space-y-4 lg:sticky lg:top-8">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold">Margin</h2>
          <p
            className={`mt-3 text-3xl font-semibold tabular-nums ${
              margin < 0 ? "text-red-500" : margin < 0.25 ? "text-amber-500" : ""
            }`}
          >
            {(margin * 100).toFixed(0)}%
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatPrice(Math.max(price - cost, 0))} profit per unit
          </p>
          {margin < 0 && (
            <p className="mt-3 text-xs text-red-500">
              Cost price is above the sale price — every order loses money.
            </p>
          )}

          <div className="mt-6 space-y-3 border-t border-border pt-5">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product?.active ?? true}
                className="size-4 rounded border-border accent-brand-600"
              />
              Visible in the shop
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={product?.featured ?? false}
                className="size-4 rounded border-border accent-brand-600"
              />
              Feature on the home page
            </label>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4" aria-hidden />
              {submitLabel}
            </>
          )}
        </Button>

        <Link
          href="/admin/products"
          className="block text-center text-sm text-muted hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
