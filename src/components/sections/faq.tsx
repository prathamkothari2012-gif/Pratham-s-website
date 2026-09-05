import { Plus } from "lucide-react";
import { faqs, site } from "@/content/site";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="Questions we get asked most"
          body={`Still stuck? Email ${site.contact.email} and a human will answer.`}
        />

        <div className="mx-auto mt-14 max-w-3xl divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            // <details> gives us an accessible accordion with no JavaScript.
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-medium marker:hidden">
                {faq.q}
                <Plus
                  className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 max-w-2xl text-sm/7 text-muted text-pretty">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
