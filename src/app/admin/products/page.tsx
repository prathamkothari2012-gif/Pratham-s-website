import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProducts } from "@/lib/server/catalog";
import { formatPrice } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/product-row-actions";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} in the catalog. Cost price drives every margin
            figure in the dashboard.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-500"
        >
          <Plus className="size-4" aria-hidden />
          Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-3xl text-sm">
          <thead className="border-b border-border text-left text-xs text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 text-right font-medium">Price</th>
              <th className="px-5 py-3 text-right font-medium">Cost</th>
              <th className="px-5 py-3 text-right font-medium">Margin</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const margin =
                product.basePrice > 0
                  ? (product.basePrice - product.costPrice) / product.basePrice
                  : 0;

              return (
                <tr key={product.slug}>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="font-medium hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      /shop/{product.slug}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted">{product.category}</td>
                  <td className="px-5 py-4 text-right tabular-nums">
                    {formatPrice(product.basePrice)}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted">
                    {formatPrice(product.costPrice)}
                  </td>
                  <td
                    className={`px-5 py-4 text-right tabular-nums ${
                      margin < 0.25 ? "text-amber-600 dark:text-amber-400" : ""
                    }`}
                  >
                    {(margin * 100).toFixed(0)}%
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.active
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-foreground/5 text-muted"
                      }`}
                    >
                      {product.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ProductRowActions
                      slug={product.slug}
                      name={product.name}
                      active={product.active}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">
          No products yet. Add your first one to open the shop.
        </p>
      )}
    </div>
  );
}
