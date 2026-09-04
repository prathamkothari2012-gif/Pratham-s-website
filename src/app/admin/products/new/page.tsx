import type { Metadata } from "next";
import { createProduct } from "@/lib/server/actions";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
      <p className="mt-1 text-sm text-muted">
        It goes live in the shop as soon as you save, unless you untick
        &ldquo;visible in the shop&rdquo;.
      </p>

      <ProductForm action={createProduct} submitLabel="Create product" />
    </div>
  );
}
