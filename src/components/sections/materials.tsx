import { materials } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/** Static classes per tone — Tailwind cannot see dynamically built names.
 *  All six sit in the brand's blue-to-teal range so the row reads as a set
 *  rather than six unrelated colours. */
const tones: Record<string, string> = {
  primary: "from-brand-500 to-brand-300",
  deep: "from-brand-700 to-brand-500",
  teal: "from-[#1d7a8c] to-[#5ec5c5]",
  pale: "from-brand-400 to-brand-200",
  indigo: "from-[#2d5f9e] to-[#7cb8e8]",
  slate: "from-[#3d5866] to-[#92abbd]",
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
                className={`h-1.5 bg-gradient-to-r ${tones[material.tone] ?? tones.primary}`}
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
