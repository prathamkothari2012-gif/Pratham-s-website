import "server-only";
import QRCode from "qrcode";
import { site } from "@/content/site";

/**
 * UPI payments, paid directly to the shop's UPI ID.
 *
 * There is no payment gateway in the loop, which has one consequence worth
 * being explicit about: nothing tells the server when money arrives. UPI
 * intent links have no callback without a registered PSP. So the customer
 * pays, reports the UTR from their app, and the owner confirms it against
 * their bank before printing. That is the honest flow for a direct-to-VPA
 * setup — see the README for what changes if a gateway is added later.
 */

/**
 * Builds a UPI intent URL per the NPCI deep-linking spec. Every UPI app on
 * the phone registers this scheme, so the link opens an app chooser with the
 * amount and payee already filled in.
 */
export function buildUpiLink({
  amount,
  reference,
}: {
  amount: number;
  reference: string;
}): string {
  const params: Array<[string, string]> = [
    ["pa", site.payment.upiId], // payee address (the VPA)
    ["pn", site.payment.payeeName], // payee name
    ["am", amount.toFixed(2)], // amount — UPI wants two decimals
    ["cu", "INR"],
    ["tn", `${site.shortName} order ${reference}`], // transaction note
    ["tr", reference], // transaction reference
  ];

  // Built by hand rather than with URLSearchParams for two reasons:
  //   - URLSearchParams encodes a space as "+", which some UPI apps render
  //     literally in the payee name. encodeURIComponent gives %20 instead.
  //   - "@" is percent-encoded to %40 by both, and while a conforming parser
  //     decodes that back, UPI links in the wild carry a literal "@" and it
  //     is legal in a query string (RFC 3986), so it is restored below.
  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%40/g, "@")}`)
    .join("&");

  return `upi://pay?${query}`;
}

/**
 * Renders the same link as a QR code, so a customer on a laptop can scan it
 * with their phone. Generated inline as SVG rather than fetched from an image
 * service — no third party ever sees an order's amount or reference.
 */
export async function buildUpiQr(link: string): Promise<string> {
  return QRCode.toString(link, {
    type: "svg",
    margin: 1,
    // Medium recovery keeps the code scannable if the screen is a bit dirty
    // without making the pattern needlessly dense.
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export type PaymentInstructions = {
  upiId: string;
  payeeName: string;
  amount: number;
  link: string;
  qrSvg: string;
};

export async function buildPaymentInstructions({
  amount,
  reference,
}: {
  amount: number;
  reference: string;
}): Promise<PaymentInstructions> {
  const link = buildUpiLink({ amount, reference });
  return {
    upiId: site.payment.upiId,
    payeeName: site.payment.payeeName,
    amount,
    link,
    qrSvg: await buildUpiQr(link),
  };
}

/** UPI reference numbers (UTRs) are 12 digits. Some banks show a longer
 *  alphanumeric reference, so this stays deliberately permissive. */
export function isValidUtr(value: string): boolean {
  return /^[A-Za-z0-9]{6,32}$/.test(value.trim());
}
