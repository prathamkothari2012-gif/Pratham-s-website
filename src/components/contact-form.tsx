"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useBotShield } from "@/lib/bot-shield";
import { validateContact, type FieldErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Honeypot } from "@/components/ui/honeypot";

type Status = "idle" | "submitting" | "done";

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const { solveNow } = useBotShield("contact");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

    const { errors: clientErrors } = validateContact(payload);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const { challenge, solution } = await solveNow();
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          challenge,
          solution,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setFailure(data.error ?? "Please correct the highlighted fields.");
        setStatus("idle");
        return;
      }

      setStatus("done");
    } catch {
      setFailure(
        "We could not reach the server. Check your connection and try again.",
      );
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-10 text-center">
        <CheckCircle2 className="size-10 text-brand-500" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">Message sent</h2>
        <p className="mt-2 max-w-sm text-sm/6 text-muted">
          Thanks for getting in touch. We read every enquiry and usually reply
          within one working day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <Honeypot />

      <div className="grid gap-5">
        <Field label="Your name" name="name" required autoComplete="name" error={errors.name} />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={errors.email}
        />
        <Field
          label="What do you need printed?"
          name="message"
          as="textarea"
          required
          placeholder="Describe the part, its size, the material you have in mind and when you need it. Paste a file link if you have one."
          error={errors.message}
        />
      </div>

      {failure && (
        <p role="alert" className="mt-5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {failure}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden />
            Send enquiry
          </>
        )}
      </Button>

      <p className="mt-4 text-xs/5 text-muted">
        We never share or resell your files. Happy to sign an NDA before you
        send anything across.
      </p>
    </form>
  );
}
