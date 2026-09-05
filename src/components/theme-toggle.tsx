"use client";

import { Moon, Sun } from "lucide-react";

/** Kept in sync with the inline script in `layout.tsx` that applies the stored
 *  theme before first paint. */
const STORAGE_KEY = "spoolhouse.theme";

export function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Ignore storage failures — the toggle still applies for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className="inline-flex size-10 items-center justify-center rounded-full text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
    >
      {/* Which icon shows is decided by CSS, not state — so there is nothing to
          read from the DOM on mount and no hydration mismatch to avoid. */}
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
