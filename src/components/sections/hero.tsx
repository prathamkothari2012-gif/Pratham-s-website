import { ArrowRight, Check } from "lucide-react";
import { hero } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PrintVisual } from "@/components/sections/print-visual";

export function Hero() {
  // Split the headline so the closing phrase can carry the gradient.
  const accentAt = hero.headline.lastIndexOf(hero.headlineAccent);
  const lead = accentAt >= 0 ? hero.headline.slice(0, accentAt) : hero.headline;
  const accent = accentAt >= 0 ? hero.headlineAccent : "";

  return (
    <section className="relative overflow-hidden">
      {/* Ambient background wash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60rem 40rem at 70% -10%, color-mix(in oklab, var(--color-brand-500) 22%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] dark:opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(50rem 30rem at 50% 0%, black, transparent)",
        }}
      />

      <Container className="grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-2 lg:gap-10 lg:py-28">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
            {hero.badge}
          </span>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {lead}
            {accent && (
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-200">
                {accent}
              </span>
            )}
          </h1>

          <p className="mt-6 max-w-xl text-lg/8 text-muted text-pretty">
            {hero.subhead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {hero.trustLine.split("·").map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-4 text-brand-500" aria-hidden />
                {item.trim()}
              </li>
            ))}
          </ul>
        </div>

        <PrintVisual />
      </Container>
    </section>
  );
}
