import "server-only";
import { products as seedProducts } from "@/content/catalog";
import type { Database } from "@/lib/types";
import type { Backend } from "@/lib/server/backend";
import { fileBackend } from "@/lib/server/store-file";
import { blobsBackend } from "@/lib/server/store-blobs";

export type {
  Database,
  Discount,
  Expense,
  Order,
  OrderLine,
  OrderStatus,
  StoredProduct,
  Throttle,
  Verification,
} from "@/lib/types";
export { ORDER_STATUSES } from "@/lib/types";

/**
 * The datastore.
 *
 * Two backends sit behind one interface: a JSON file for a normal server, and
 * Netlify Blobs for serverless. Netlify gives every request a throwaway
 * filesystem, so the file backend would quietly lose orders there — the
 * backend is chosen from the environment rather than left to be configured
 * wrong.
 *
 * To move to a real database, implement `Backend` (two methods) and select it
 * below. Nothing else in the app touches storage.
 */

/** Seed cost prices at roughly 40% of the sale price until the owner edits them. */
function seed(): Database {
  return {
    products: seedProducts.map((p) => ({
      ...p,
      costPrice: Math.round(p.basePrice * 0.4),
      active: true,
    })),
    orders: [],
    discounts: [],
    expenses: [],
    verifications: [],
    throttles: [],
  };
}

/** Tolerates a stored copy written by an older version that predates a
 *  collection, so a deploy never starts from a half-read database. */
function merge(raw: unknown): Database {
  const parsed = (raw ?? {}) as Partial<Database>;
  return {
    products: parsed.products ?? seed().products,
    orders: parsed.orders ?? [],
    discounts: parsed.discounts ?? [],
    expenses: parsed.expenses ?? [],
    verifications: parsed.verifications ?? [],
    throttles: parsed.throttles ?? [],
  };
}

/** Netlify sets NETLIFY=true in its build and function runtimes. */
export function onNetlify(): boolean {
  return process.env.NETLIFY === "true" || !!process.env.NETLIFY_BLOBS_CONTEXT;
}

let backend: Backend | null = null;

function selected(): Backend {
  backend ??= onNetlify() ? blobsBackend(seed, merge) : fileBackend(seed, merge);
  return backend;
}

export function backendName(): Backend["name"] {
  return selected().name;
}

export async function readDb(): Promise<Database> {
  return selected().read();
}

/**
 * Mutate the database.
 *
 * The mutation may be run more than once: the Netlify backend retries it
 * against fresher data when another request commits first. Keep mutations a
 * function of the database they are handed rather than of anything captured
 * from outside.
 */
export async function writeDb<T>(
  mutate: (db: Database) => T | Promise<T>,
): Promise<T> {
  return selected().write(mutate);
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
