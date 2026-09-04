import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place your 3D printing order.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Checkout
      </h1>
      <CheckoutForm />
    </Container>
  );
}
