import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/server/catalog";
import { Container } from "@/components/ui/container";
import { ShopGrid } from "@/components/shop-grid";

export const metadata: Metadata = {
  title: "Shop 3D printing services",
  description:
    "Browse and order 3D printing services online — PLA, PETG, TPU, resin, batch production, CAD design and 3D scanning.",
  alternates: { canonical: "/shop" },
};

/** The catalog is edited from the dashboard, so this renders per request
 *  rather than being frozen at build time. It also keeps the build from
 *  needing the datastore, which is not reachable while building. */
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <>
      <section className="border-b border-border bg-surface/60 py-14 sm:py-20">
        <Container>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Order a print
          </h1>
          <p className="mt-4 max-w-2xl text-lg/8 text-muted text-pretty">
            Pick a service, configure the options and check out. Listed prices
            are starting rates — we confirm the final total after reviewing your
            file, and you approve it before we print.
          </p>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <ShopGrid products={products} />
      </Container>
    </>
  );
}
