import { process } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function Process() {
  return (
    <section id="process" className="border-y border-border bg-surface/60 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps from file to finished part"
          body="No account required and no commitment until you have seen the price."
        />

        <ol className="relative mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {/* Connecting rule behind the steps on wide screens. */}
          <div
            aria-hidden
            className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          {process.map((item) => (
            <li key={item.step} className="relative">
              <div className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-semibold text-brand-600 dark:text-brand-400">
                {item.step}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm/6 text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
