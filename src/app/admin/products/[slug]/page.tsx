import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { updateProduct } from "@/lib/server/actions";
import { getAllProducts } from "@/lib/server/catalog";
import { formatOptionGroups } from "@/lib/product-format";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ slug: string }> };

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  const product = (await getAllProducts()).find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        <Link
          href={`/shop/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          View in shop
          <ExternalLink className="size-3.5" aria-hidden />
        </Link>
      </div>

      <ProductForm
        action={updateProduct}
        product={product}
        optionGroupsText={formatOptionGroups(product.optionGroups)}
        submitLabel="Save changes"
      />
    </div>
  );
}
