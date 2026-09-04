import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, ShieldCheck } from "lucide-react";
import { getActiveProduct } from "@/lib/server/catalog";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { ProductConfigurator } from "@/components/product-configurator";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getActiveProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.summary,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: product.name, description: product.summary },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getActiveProduct(slug);
  if (!product) notFound();

  // Structured data so the service shows rich results in search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      price: product.basePrice,
      priceCurrency: site.currency.code,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <Container className="py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All services
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div
            className="relative aspect-square overflow-hidden rounded-3xl"
            style={{
              background: `linear-gradient(135deg, ${product.accent[0]}, ${product.accent[1]})`,
            }}
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,.6) 0 1px, transparent 1px 10px)",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <div className="size-40 rounded-3xl border-2 border-white/50 bg-white/10 backdrop-blur-sm" />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <Clock className="size-3.5" aria-hidden />
                Turnaround
              </dt>
              <dd className="mt-1 text-sm font-medium">{product.turnaround}</dd>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <dt className="flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck className="size-3.5" aria-hidden />
                Included
              </dt>
              <dd className="mt-1 text-sm font-medium">Free file check</dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-400">
            {product.category}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base/7 text-muted text-pretty">
            {product.description}
          </p>

          <p className="mt-6 text-sm text-muted">
            From{" "}
            <span className="text-xl font-semibold text-foreground">
              {formatPrice(product.basePrice)}
            </span>{" "}
            {product.unit}
          </p>

          <ul className="mt-6 space-y-2.5">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-brand-500"
                  aria-hidden
                />
                {highlight}
              </li>
            ))}
          </ul>

          <ProductConfigurator product={product} />
        </div>
      </div>
    </Container>
  );
}
