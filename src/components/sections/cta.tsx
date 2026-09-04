import { ArrowRight, MessageCircle } from "lucide-react";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Cta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(40rem 20rem at 50% 0%, color-mix(in oklab, var(--color-brand-500) 25%, transparent), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Ready to print something?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base/7 text-muted text-pretty">
              Browse our services and order online, or send a file and we will
              come back with a fixed price the same day.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/shop" size="lg">
                Browse services
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <a
                href={whatsappLink(`Hi ${site.name}, I'd like a quote for a 3D print.`)}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonClass("secondary", "lg")}
              >
                <MessageCircle className="size-4" aria-hidden />
                Message us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
