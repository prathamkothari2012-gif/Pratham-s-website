import { CartProvider } from "@/lib/cart";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** Chrome for the public-facing site. The admin dashboard sits outside this
 *  group so it gets neither the storefront navigation nor the cart. */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </CartProvider>
  );
}
