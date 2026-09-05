import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { footerLinks, site } from "@/content/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <Logo className="size-8" />
              {site.name}
            </Link>
            <p className="mt-4 max-w-sm text-sm/6 text-muted">{site.description}</p>

            <ul className="mt-6 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0" aria-hidden />
                <a className="hover:text-foreground" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0" aria-hidden />
                <a
                  className="hover:text-foreground"
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                >
                  {site.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <InstagramIcon className="size-4 shrink-0" />
                <a
                  className="hover:text-foreground"
                  href={site.contact.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  @3dspoolhouse
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {site.contact.address}
              </li>
            </ul>
          </div>

          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold">{group.heading}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link className="hover:text-foreground" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{site.contact.hours}</p>
        </div>
      </Container>
    </footer>
  );
}
