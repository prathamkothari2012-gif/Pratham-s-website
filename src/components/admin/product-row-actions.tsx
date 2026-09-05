"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, toggleProduct } from "@/lib/server/actions";

export function ProductRowActions({
  slug,
  name,
  active,
}: {
  slug: string;
  name: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${slug}`}
        aria-label={`Edit ${name}`}
        className="rounded-lg p-2 text-muted transition hover:bg-foreground/5 hover:text-foreground"
      >
        <Pencil className="size-4" aria-hidden />
      </Link>

      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleProduct(slug))}
        aria-label={active ? `Hide ${name} from the shop` : `Show ${name} in the shop`}
        className="rounded-lg p-2 text-muted transition hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"
      >
        {active ? (
          <Eye className="size-4" aria-hidden />
        ) : (
          <EyeOff className="size-4" aria-hidden />
        )}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            window.confirm(
              `Delete "${name}"? Past orders keep their record, but the product is removed from the catalog. This cannot be undone.`,
            )
          ) {
            startTransition(() => deleteProduct(slug));
          }
        }}
        aria-label={`Delete ${name}`}
        className="rounded-lg p-2 text-muted transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
