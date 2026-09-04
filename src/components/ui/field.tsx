import { cn } from "@/lib/utils";

const controlClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm " +
  "placeholder:text-muted/70 focus:border-brand-500 focus:outline-none";

export function Field({
  label,
  name,
  error,
  hint,
  className,
  as = "input",
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  as?: "input" | "textarea";
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorId = `${name}-error`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {!rest.required && (
          <span className="ml-1.5 text-xs font-normal text-muted">optional</span>
        )}
      </label>

      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(controlClass, "min-h-28 resize-y", error && "border-red-500")}
          {...rest}
        />
      ) : (
        <input
          id={name}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(controlClass, error && "border-red-500")}
          {...rest}
        />
      )}

      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={errorId} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
