import { ArrowRight } from "lucide-react";
import { getActiveProducts } from "@/lib/server/catalog";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/product-card";

export async function Featured() {
  const products = await getActiveProducts();
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Order online"
            title="Popular services"
            body="Configure the options, add to your cart and check out. Every order still gets a free file review before we print."
            className="max-w-xl"
          />
          <ButtonLink href="/shop" variant="secondary" className="shrink-0">
            View all services
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
