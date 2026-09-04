import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review the 3D printing services in your cart before checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Your cart
      </h1>
      <CartView />
    </Container>
  );
}
