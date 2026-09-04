import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-500 active:bg-brand-700",
  secondary:
    "border border-border bg-surface text-foreground hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-300",
  ghost: "text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: ButtonProps & { href: string } & React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
