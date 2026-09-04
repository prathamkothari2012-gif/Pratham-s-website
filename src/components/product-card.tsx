import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Product } from "@/content/catalog";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-brand-400/60 hover:shadow-lg hover:shadow-brand-900/5">
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        {/* Code-drawn artwork stands in until product photography exists. */}
        <div
          className="relative aspect-4/3 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${product.accent[0]}, ${product.accent[1]})`,
          }}
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,.6) 0 1px, transparent 1px 9px)",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="size-24 rounded-2xl border-2 border-white/50 bg-white/10 backdrop-blur-sm transition duration-300 group-hover:scale-105 group-hover:rotate-6" />
          </div>
          <span className="absolute top-3 left-3 rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {product.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="flex items-start justify-between gap-2 font-semibold">
            {product.name}
            <ArrowUpRight
              className="size-4 shrink-0 text-muted transition group-hover:text-brand-500"
              aria-hidden
            />
          </h3>
          <p className="mt-2 flex-1 text-sm/6 text-muted">{product.summary}</p>

          <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted">From</p>
              <p className="text-lg font-semibold">{formatPrice(product.basePrice)}</p>
              <p className="text-xs text-muted">{product.unit}</p>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Clock className="size-3.5" aria-hidden />
              {product.turnaround}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
