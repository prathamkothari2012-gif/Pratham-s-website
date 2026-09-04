import { materials } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/** Static classes per tone — Tailwind cannot see dynamically built names. */
const tones: Record<string, string> = {
  brand: "from-brand-500 to-brand-300",
  emerald: "from-emerald-500 to-teal-300",
  amber: "from-amber-500 to-orange-300",
  sky: "from-sky-500 to-cyan-300",
  violet: "from-violet-500 to-fuchsia-300",
  rose: "from-rose-500 to-pink-300",
};

export function Materials() {
  return (
    <section id="materials" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Materials"
          title="Pick the right plastic for the job"
          body="Not sure which to choose? Tell us how the part will be used and we will recommend one — it is part of every quote."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <article
              key={material.name}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div
                className={`h-1.5 bg-gradient-to-r ${tones[material.tone] ?? tones.brand}`}
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold">{material.name}</h3>
                <p className="mt-2 text-sm/6 text-muted">{material.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {material.specs.map((spec) => (
                    <li
                      key={spec}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
                    >
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
