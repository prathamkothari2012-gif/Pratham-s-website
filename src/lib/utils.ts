import { site } from "@/content/site";

/** Minimal class-name joiner — falsy entries are dropped. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const priceFormatter = new Intl.NumberFormat(site.currency.locale, {
  style: "currency",
  currency: site.currency.code,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
