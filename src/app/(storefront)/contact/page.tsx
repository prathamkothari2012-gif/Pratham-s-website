import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Get a quote",
  description:
    "Send us your model or describe the part you need and we will come back with a fixed price.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Get a quote
          </h1>
          <p className="mt-4 text-lg/8 text-muted text-pretty">
            Tell us what you need printed. Send a file link if you have one, or
            just describe the part — we will reply with a fixed price, usually
            the same day.
          </p>

          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-3.5">
              <Mail className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-sm text-muted hover:text-foreground"
                >
                  {site.contact.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <Phone className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="text-sm text-muted hover:text-foreground"
                >
                  {site.contact.phone}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <a
                  href={whatsappLink(`Hi ${site.name}, I'd like a quote for a 3D print.`)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted hover:text-foreground"
                >
                  Start a chat
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <InstagramIcon className="mt-0.5 size-5 shrink-0 text-brand-500" />
              <div>
                <p className="text-sm font-medium">Instagram</p>
                <a
                  href={site.contact.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted hover:text-foreground"
                >
                  @3dspoolhouse
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
              <div>
                <p className="text-sm font-medium">Workshop</p>
                <p className="text-sm text-muted">{site.contact.address}</p>
                <p className="text-sm text-muted">{site.contact.hours}</p>
              </div>
            </li>
          </ul>
        </div>

        <ContactForm />
      </div>
    </Container>
  );
}
