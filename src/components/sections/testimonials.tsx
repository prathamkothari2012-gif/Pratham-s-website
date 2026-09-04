import { Quote } from "lucide-react";
import { testimonials } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Customers"
          title="What people print with us"
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6"
            >
              <Quote className="size-6 text-brand-500/50" aria-hidden />
              <blockquote className="mt-4 flex-1 text-sm/7 text-pretty">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-sm text-muted">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
