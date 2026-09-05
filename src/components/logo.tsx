import { cn } from "@/lib/utils";

/** A filament spool seen head-on, drawn rather than shipped as an asset so it
 *  inherits the brand colour and stays crisp at any size. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("text-brand-600 dark:text-brand-400", className)}
    >
      <circle cx="16" cy="16" r="14" className="fill-current opacity-15" />
      <circle
        cx="16"
        cy="16"
        r="10.5"
        className="stroke-current"
        strokeWidth="2.5"
      />
      <circle cx="16" cy="16" r="4" className="fill-current" />
      <path
        d="M16 5.5v3M26.5 16h-3M16 26.5v-3M5.5 16h3"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
