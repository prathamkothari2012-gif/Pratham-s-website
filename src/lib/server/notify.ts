import "server-only";

/**
 * Where one-time codes actually get delivered.
 *
 * No email or SMS provider is wired up, so the default transport logs the code
 * to the server console and reports that it did not really send. That keeps
 * the whole verification flow working end to end on a fresh clone, while being
 * honest that nothing left the machine.
 *
 * To send for real, fill in one of the adapters below. Email is the cheap one
 * (Resend, Postmark, SES, or plain SMTP). SMS costs per message in India —
 * MSG91, Twilio and Gupshup all work; DLT registration is required for
 * transactional SMS to Indian numbers.
 */

export type DeliveryResult = {
  /** False when no provider is configured and the code was only logged. */
  delivered: boolean;
  /** Returned only when nothing was really sent, so a developer can carry on
   *  without an email provider. Never populated in production. */
  devCode?: string;
};

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function smsConfigured(): boolean {
  return !!(process.env.SMS_API_KEY && process.env.SMS_SENDER_ID);
}

async function sendEmail(to: string, code: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "orders@3dspoolhouse.com",
      to,
      subject: `${code} is your 3D Spool House verification code`,
      text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    }),
  });

  return response.ok;
}

async function sendSms(to: string, code: string): Promise<boolean> {
  // Left as a stub on purpose: every Indian SMS provider has a different
  // request shape and requires DLT-approved templates, so guessing one would
  // be worse than nothing. Fill this in against your provider's docs.
  void to;
  void code;
  return false;
}

export async function deliverCode(
  channel: "email" | "phone",
  value: string,
  code: string,
): Promise<DeliveryResult> {
  try {
    const sent =
      channel === "email" ? await sendEmail(value, code) : await sendSms(value, code);
    if (sent) return { delivered: true };
  } catch (error) {
    console.error("[notify] delivery failed", error);
  }

  // Nothing configured (or the send failed). Log it so local development and
  // a misconfigured deployment both remain debuggable.
  console.info(`[notify] ${channel} code for ${value}: ${code}`);

  return {
    delivered: false,
    // Surfacing the code to the browser is only safe while no provider exists
    // and we are not in production — otherwise anyone could verify any address.
    ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
  };
}
