import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { assertConfigured, isAuthenticated } from "@/lib/server/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s — Dashboard" },
  robots: { index: false, follow: false },
};

/** Admin pages read live data on every request. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Refuse to serve the dashboard in production on the built-in dev password.
  assertConfigured();

  // The real authorization boundary. `src/proxy.ts` only does a cheap
  // cookie-presence check; the signature is verified here, on every request.
  if (!(await isAuthenticated())) redirect("/login");

  return <AdminShell>{children}</AdminShell>;
}
