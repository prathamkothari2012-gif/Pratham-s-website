import {
  Box,
  Layers,
  PenTool,
  ScanLine,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { services } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const icons: Record<string, LucideIcon> = {
  Box,
  Wrench,
  Sparkles,
  Layers,
  PenTool,
  ScanLine,
};

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title="One workshop, every kind of print job"
          body="From a single replacement part to a production run of five hundred, it is the same team, the same machines and the same quality check."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.icon] ?? Box;
            return (
              <article
                key={service.title}
                className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-brand-400/60 hover:shadow-lg hover:shadow-brand-900/5"
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white dark:text-brand-400">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm/6 text-muted">{service.body}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
