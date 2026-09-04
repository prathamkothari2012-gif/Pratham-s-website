import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated, usingDevCredentials } from "@/lib/server/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Owner sign in",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await isAuthenticated()) redirect("/admin");

  const { next } = await searchParams;
  // Only allow same-site relative paths, so `?next=` cannot be used as an
  // open redirect.
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <LoginForm next={destination} showDevHint={usingDevCredentials()} />
    </div>
  );
}
