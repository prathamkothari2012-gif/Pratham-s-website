"use client";

import { useMemo, useState } from "react";
import { categories, type Category, type Product } from "@/content/catalog";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";

type Filter = Category | "All";

export function ShopGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () => (filter === "All" ? products : products.filter((p) => p.category === filter)),
    [filter, products],
  );

  const filters: Filter[] = ["All", ...categories];

  return (
    <>
      <div
        role="group"
        aria-label="Filter services by category"
        className="flex flex-wrap gap-2"
      >
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              filter === option
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border bg-surface text-muted hover:border-brand-400 hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-12 text-center text-muted">
          Nothing in this category yet.
        </p>
      )}
    </>
  );
}
