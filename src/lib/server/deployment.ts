import "server-only";
import { site } from "@/content/site";
import { backendName } from "@/lib/server/db";
import { emailConfigured, smsConfigured } from "@/lib/server/notify";
import { usingDevCredentials } from "@/lib/server/auth";

/**
 * What is and is not wired up in this deployment. Surfaced in the dashboard so
 * the owner can see at a glance why something is not working, instead of
 * discovering it when a customer cannot check out.
 */

export type CheckLevel = "ok" | "warn" | "blocked";

export type DeploymentCheck = {
  label: string;
  level: CheckLevel;
  detail: string;
};

/**
 * The public address. Netlify exposes the site's primary URL as `URL`, so a
 * deploy gets correct canonical links and sitemap entries without anyone
 * editing the code. `SITE_URL` overrides it once a real domain is attached.
 */
export function siteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    site.url
  ).replace(/\/$/, "");
}

export function deploymentChecks(): DeploymentCheck[] {
  const checks: DeploymentCheck[] = [];

  const backend = backendName();
  checks.push({
    label: "Storage",
    level: "ok",
    detail:
      backend === "netlify-blobs"
        ? "Netlify Blobs — orders survive redeploys."
        : "JSON file on disk — needs a persistent volume to survive restarts.",
  });

  checks.push(
    emailConfigured()
      ? { label: "Email codes", level: "ok", detail: "Sending through Resend." }
      : {
          label: "Email codes",
          level: "blocked",
          detail:
            "No email provider. Verification codes are written to the server log, so customers cannot complete checkout. Set RESEND_API_KEY.",
        },
  );

  checks.push(
    smsConfigured()
      ? { label: "SMS codes", level: "ok", detail: "Sending through your SMS provider." }
      : {
          label: "SMS codes",
          level: "blocked",
          detail:
            "No SMS provider. Phone codes are written to the server log. Needs DLT registration and an SMS account.",
        },
  );

  checks.push(
    usingDevCredentials()
      ? {
          label: "Dashboard password",
          level: "warn",
          detail:
            "Running on the built-in development password. Set ADMIN_PASSWORD and AUTH_SECRET.",
        }
      : { label: "Dashboard password", level: "ok", detail: "Set from the environment." },
  );

  return checks;
}
