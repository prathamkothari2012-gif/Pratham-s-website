"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Product } from "@/content/catalog";
import { priceLine } from "@/lib/pricing";

export type CartLine = {
  /** Product slug plus the chosen option ids, so the same product with
   *  different options occupies separate lines. */
  id: string;
  slug: string;
  quantity: number;
  /** Map of option group id -> option id. */
  options: Record<string, string>;
};

export type ResolvedLine = CartLine & {
  product: Product;
  unitPrice: number;
  lineTotal: number;
  optionLabels: string[];
};

/** A discount the server has confirmed is valid. */
export type AppliedDiscount = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  amount: number;
};

const STORAGE_KEY = "spoolhouse.cart.v2";

/* ------------------------------------------------------------------ *
 * The cart lives in a module-level store rather than component state.
 * `useSyncExternalStore` is the React-sanctioned way to read a browser-only
 * source like localStorage: it renders the server snapshot (an empty cart)
 * during hydration, then swaps in the real one — no setState-in-effect, and
 * no hydration mismatch.
 * ------------------------------------------------------------------ */

const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (l): l is CartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as CartLine).slug === "string" &&
        typeof (l as CartLine).quantity === "number",
    );
  } catch {
    return EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The cart
    // still works for this page view.
  }
}

function subscribe(listener: () => void): () => void {
  // The first subscriber triggers hydration from storage.
  if (!hydrated) {
    hydrated = true;
    lines = readStoredCart();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Must return a stable reference between mutations, or React will loop. */
function getSnapshot(): CartLine[] {
  return lines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function setLines(next: CartLine[]) {
  lines = next;
  persist();
  emit();
}

function lineId(slug: string, options: Record<string, string>): string {
  const suffix = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join("|");
  return suffix ? `${slug}__${suffix}` : slug;
}

type CartContextValue = {
  lines: CartLine[];
  resolved: ResolvedLine[];
  count: number;
  subtotal: number;
  discount: AppliedDiscount | null;
  /** False until the live catalog has loaded, which also means the stored cart
   *  has been read. Components hold their layout steady until then. */
  ready: boolean;
  add: (slug: string, options: Record<string, string>, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  applyDiscount: (discount: AppliedDiscount | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const storedLines = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [discount, setDiscount] = useState<AppliedDiscount | null>(null);

  // The catalog is owner-editable, so the browser fetches the live version
  // rather than bundling a build-time copy.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCatalog(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const add = useCallback(
    (slug: string, options: Record<string, string>, quantity = 1) => {
      const id = lineId(slug, options);
      const existing = lines.find((l) => l.id === id);
      setLines(
        existing
          ? lines.map((l) =>
              l.id === id ? { ...l, quantity: l.quantity + quantity } : l,
            )
          : [...lines, { id, slug, options, quantity }],
      );
    },
    [],
  );

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines(
      quantity <= 0
        ? lines.filter((l) => l.id !== id)
        : lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setDiscount(null);
  }, []);

  const resolved = useMemo<ResolvedLine[]>(() => {
    if (!catalog) return [];
    return storedLines.flatMap((line) => {
      // Silently drop lines whose product has been removed or hidden.
      const product = catalog.find((p) => p.slug === line.slug);
      if (!product) return [];
      const { unitPrice, optionLabels } = priceLine(product, line.options);
      return [
        {
          ...line,
          product,
          unitPrice,
          optionLabels,
          lineTotal: unitPrice * line.quantity,
        },
      ];
    });
  }, [storedLines, catalog]);

  const subtotal = useMemo(
    () => resolved.reduce((n, l) => n + l.lineTotal, 0),
    [resolved],
  );

  // Recompute the saved discount whenever the cart total moves.
  const activeDiscount = useMemo<AppliedDiscount | null>(() => {
    if (!discount) return null;
    const amount =
      discount.type === "percent"
        ? Math.round((subtotal * discount.value) / 100)
        : Math.min(discount.value, subtotal);
    return { ...discount, amount };
  }, [discount, subtotal]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: storedLines,
      resolved,
      ready: catalog !== null,
      count: resolved.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      discount: activeDiscount,
      add,
      setQuantity,
      remove,
      clear,
      applyDiscount: setDiscount,
    }),
    [
      storedLines,
      resolved,
      catalog,
      subtotal,
      activeDiscount,
      add,
      setQuantity,
      remove,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
