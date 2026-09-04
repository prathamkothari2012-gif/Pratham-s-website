import "server-only";
import { readDb, type StoredProduct } from "@/lib/server/db";
import type { Product } from "@/content/catalog";

/** Strip owner-only fields before anything reaches the storefront. Cost price
 *  in particular must never be served to a customer. */
export function toPublic(product: StoredProduct): Product {
  const rest = { ...product } as Partial<StoredProduct>;
  delete rest.costPrice;
  delete rest.active;
  return rest as Product;
}

export async function getActiveProducts(): Promise<Product[]> {
  const db = await readDb();
  return db.products.filter((p) => p.active).map(toPublic);
}

export async function getActiveProduct(slug: string): Promise<Product | null> {
  const db = await readDb();
  const found = db.products.find((p) => p.slug === slug && p.active);
  return found ? toPublic(found) : null;
}

export async function getAllProducts(): Promise<StoredProduct[]> {
  const db = await readDb();
  return db.products;
}
