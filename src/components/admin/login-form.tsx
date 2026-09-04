"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Logo } from "@/components/logo";

export function LoginForm({
  next,
  showDevHint,
}: {
  next: string;
  showDevHint: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const password = new FormData(event.currentTarget).get("password");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Could not sign in.");
        setBusy(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
    >
      <div className="flex flex-col items-center text-center">
        <Logo className="size-10" />
        <h1 className="mt-4 text-xl font-semibold">{site.name}</h1>
        <p className="mt-1 text-sm text-muted">Owner dashboard</p>
      </div>

      <div className="mt-8">
        <Field
          label="Password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          <>
            <Lock className="size-4" aria-hidden />
            Sign in
          </>
        )}
      </Button>

      {showDevHint && (
        <p className="mt-5 rounded-xl bg-amber-500/10 px-4 py-3 text-xs/5 text-amber-700 dark:text-amber-400">
          <strong>Development mode.</strong> The password is{" "}
          <code className="font-mono">spoolhouse</code>. Set{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> and{" "}
          <code className="font-mono">AUTH_SECRET</code> before deploying — see{" "}
          <code className="font-mono">.env.example</code>.
        </p>
      )}
    </form>
  );
}
