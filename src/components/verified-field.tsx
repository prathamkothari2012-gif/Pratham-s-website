"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Loader2, Pencil } from "lucide-react";
import { useBotShield } from "@/lib/bot-shield";
import { cn } from "@/lib/utils";

type Stage = "entry" | "code" | "verified";

/**
 * An email or phone input that has to be confirmed by one-time code before
 * checkout will accept it. The parent receives a signed token, not a boolean:
 * the server re-checks that signature against the exact value when the order
 * is placed, so nothing here can be faked from the browser.
 */
export function VerifiedField({
  channel,
  label,
  placeholder,
  hint,
  value,
  onValueChange,
  onVerified,
  token,
}: {
  channel: "email" | "phone";
  label: string;
  placeholder?: string;
  hint?: string;
  value: string;
  onValueChange: (value: string) => void;
  onVerified: (token: string | null) => void;
  token: string | null;
}) {
  const [stage, setStage] = useState<Stage>("entry");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const { solveNow } = useBotShield("verify");
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (stage === "code") codeInput.current?.focus();
  }, [stage]);

  const inputId = `${channel}-field`;

  async function sendCode() {
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      const { challenge, solution } = await solveNow();
      const response = await fetch("/api/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          value,
          challenge,
          solution,
          company: "",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not send the code.");
        return;
      }

      setStage("code");
      setCooldown(30);
      setNotice(
        data.devCode
          ? `No email or SMS provider is set up yet, so here is the code: ${data.devCode}`
          : `We sent a 6-digit code to ${value}.`,
      );
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/verify/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, value, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "That code did not work.");
        return;
      }

      onVerified(data.token);
      setStage("verified");
      setNotice(null);
      setCode("");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function edit() {
    onVerified(null);
    setStage("entry");
    setCode("");
    setNotice(null);
    setError(null);
  }

  if (stage === "verified" && token) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <BadgeCheck className="size-4 shrink-0 text-emerald-500" aria-hidden />
            <span className="truncate">{value}</span>
            <span className="sr-only">verified</span>
          </span>
          <button
            type="button"
            onClick={edit}
            className="flex shrink-0 items-center gap-1 text-xs text-muted transition hover:text-foreground"
          >
            <Pencil className="size-3" aria-hidden />
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          id={inputId}
          type={channel === "email" ? "email" : "tel"}
          inputMode={channel === "email" ? "email" : "numeric"}
          autoComplete={channel === "email" ? "email" : "tel"}
          value={value}
          disabled={stage === "code"}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={cn(
            "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none disabled:opacity-60",
            error && "border-red-500",
          )}
        />
        {stage === "entry" && (
          <button
            type="button"
            onClick={sendCode}
            disabled={busy || !value.trim()}
            className="shrink-0 rounded-xl border border-border px-4 text-sm font-medium whitespace-nowrap transition hover:border-brand-400 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Send code"}
          </button>
        )}
      </div>

      {stage === "code" && (
        <div className="mt-2 rounded-xl border border-border bg-background p-3">
          <label htmlFor={`${inputId}-code`} className="text-xs font-medium">
            Enter the 6-digit code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={`${inputId}-code`}
              ref={codeInput}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-32 rounded-xl border border-border bg-background px-3.5 py-2.5 text-center font-mono text-sm tracking-widest focus:border-brand-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={submitCode}
              disabled={busy || code.length !== 6}
              className="shrink-0 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-500 disabled:opacity-50"
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Verify"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={sendCode}
              disabled={busy || cooldown > 0}
              className="text-brand-600 hover:underline disabled:text-muted disabled:no-underline dark:text-brand-400"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={edit}
              className="text-muted hover:text-foreground"
            >
              Use a different {channel === "email" ? "address" : "number"}
            </button>
          </div>
        </div>
      )}

      {notice && <p className="text-xs text-muted">{notice}</p>}
      {hint && !notice && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
