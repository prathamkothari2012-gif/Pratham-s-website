import { promises as fs } from "node:fs";
import path from "node:path";
import { products as seedProducts } from "@/content/catalog";
import type { Database } from "@/lib/types";

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
 * A small JSON-file datastore.
 *
 * It is deliberately dependency-free so the dashboard works the moment you
 * clone the repo. It suits a single Node process — a VPS, a container, or
 * `next start` on one machine.
 *
 * It does NOT suit serverless hosting (Vercel, Netlify functions), where the
 * filesystem is ephemeral and every request may hit a different instance.
 * To move to a real database, reimplement `readDb`/`writeDb` against your
 * client of choice; nothing else in the app touches the file.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");

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

/** Serialises writes so two concurrent requests cannot interleave and lose an
 *  update. */
let queue: Promise<unknown> = Promise.resolve();

async function loadFromDisk(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    // Tolerate a file written by an older version missing newer collections.
    return {
      products: parsed.products ?? seed().products,
      orders: parsed.orders ?? [],
      discounts: parsed.discounts ?? [],
      expenses: parsed.expenses ?? [],
      verifications: parsed.verifications ?? [],
      throttles: parsed.throttles ?? [],
    };
  } catch {
    const fresh = seed();
    await persist(fresh);
    return fresh;
  }
}

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file then rename, so a crash mid-write cannot truncate
  // the store.
  const tmp = `${DB_PATH}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

/**
 * Always reads from disk rather than holding an in-memory copy.
 *
 * Next.js instantiates server modules per route bundle, so a cache populated
 * while rendering one route is invisible to — and quickly stale in — another.
 * A write from the dashboard would then never show up on the storefront. The
 * file is small and the OS page cache absorbs the reads, so this is the
 * correct trade.
 */
export async function readDb(): Promise<Database> {
  return loadFromDisk();
}

/** Mutate the database under the write lock. The mutation may return a value,
 *  which is handed back to the caller once the write has landed. */
export async function writeDb<T>(
  mutate: (db: Database) => T | Promise<T>,
): Promise<T> {
  const run = queue.then(async () => {
    // Re-read inside the lock so the mutation always sees the latest state,
    // including writes made by another route since this request began.
    const db = await loadFromDisk();
    const result = await mutate(db);
    await persist(db);
    return result;
  });
  // Keep the chain alive even if this mutation throws.
  queue = run.catch(() => undefined);
  return run;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
