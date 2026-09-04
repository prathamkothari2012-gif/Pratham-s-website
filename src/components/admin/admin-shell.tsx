"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Store,
  Tag,
  X,
} from "lucide-react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/discounts", label: "Discounts", icon: Tag },
  { href: "/admin/analytics", label: "Profit & loss", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        // `/admin` would otherwise match every child route.
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active
                ? "bg-brand-500/10 font-medium text-brand-700 dark:text-brand-300"
                : "text-muted hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/50 p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 font-semibold">
          <Logo className="size-8" />
          <span className="truncate">{site.shortName}</span>
        </Link>

        <div className="mt-8 flex-1">{nav}</div>

        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2.5 font-semibold">
                <Logo className="size-8" />
                {site.shortName}
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-muted hover:bg-foreground/5"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="mt-8 flex-1">{nav}</div>
            <SidebarFooter />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-5 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-muted hover:bg-foreground/5 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <p className="hidden text-sm text-muted lg:block">
            Signed in as owner
          </p>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
            >
              <Store className="size-4" aria-hidden />
              <span className="hidden sm:inline">View shop</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 px-5 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <form action="/api/auth/logout" method="post" className="mt-6">
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
      >
        <LogOut className="size-4.5" aria-hidden />
        Sign out
      </button>
    </form>
  );
}
