"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/server/auth";
import {
  newId,
  writeDb,
  type Discount,
  type Expense,
  type OrderStatus,
  type StoredProduct,
  ORDER_STATUSES,
} from "@/lib/server/db";
import type { Category, ProductOptionGroup } from "@/content/catalog";
import { categories } from "@/content/catalog";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Server Actions are publicly reachable endpoints, so every one of them
 * re-checks the session rather than assuming the admin layout already did.
 */
async function requireOwner(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Not authorised.");
  }
}

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(form: FormData, key: string): number {
  const parsed = Number(str(form, key));
  return Number.isFinite(parsed) ? parsed : 0;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Parses the option-group textarea. One group per block, blank line between:
 *
 *    Layer height | Finer layers take longer
 *    0.20 mm standard = 0
 *    0.12 mm fine = 250
 */
function parseOptionGroups(raw: string): ProductOptionGroup[] {
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap((block) => {
      const [header, ...rows] = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!header) return [];

      const [label, hint] = header.split("|").map((part) => part.trim());
      const options = rows.flatMap((row) => {
        const [optLabel, delta] = row.split("=").map((part) => part.trim());
        if (!optLabel) return [];
        const priceDelta = Number(delta);
        return [
          {
            id: slugify(optLabel) || newId("opt"),
            label: optLabel,
            priceDelta: Number.isFinite(priceDelta) ? priceDelta : 0,
          },
        ];
      });

      if (options.length === 0) return [];
      return [
        {
          id: slugify(label) || newId("grp"),
          label,
          ...(hint ? { hint } : {}),
          options,
        },
      ];
    });
}

function readProductForm(form: FormData) {
  const name = str(form, "name");
  const category = str(form, "category") as Category;

  return {
    name,
    category: categories.includes(category) ? category : categories[0],
    summary: str(form, "summary"),
    description: str(form, "description"),
    basePrice: Math.max(0, Math.round(num(form, "basePrice"))),
    costPrice: Math.max(0, Math.round(num(form, "costPrice"))),
    unit: str(form, "unit") || "per part",
    turnaround: str(form, "turnaround") || "3–5 working days",
    highlights: str(form, "highlights")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    optionGroups: parseOptionGroups(str(form, "optionGroups")),
    accent: [
      str(form, "accentFrom") || "#6366f1",
      str(form, "accentTo") || "#a855f7",
    ] as [string, string],
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
  };
}

export async function createProduct(form: FormData): Promise<ActionResult> {
  await requireOwner();
  const fields = readProductForm(form);

  if (fields.name.length < 2) return { ok: false, error: "Enter a product name." };
  if (fields.summary.length < 5) return { ok: false, error: "Enter a short summary." };
  if (fields.basePrice <= 0) return { ok: false, error: "Enter a price above zero." };
  if (fields.costPrice > fields.basePrice) {
    return { ok: false, error: "Cost price is higher than the sale price." };
  }

  const slug = slugify(str(form, "slug") || fields.name);
  if (!slug) return { ok: false, error: "Could not build a URL from that name." };

  const clash = await writeDb((db) => {
    if (db.products.some((p) => p.slug === slug)) return true;
    const product: StoredProduct = { slug, ...fields };
    db.products.push(product);
    return false;
  });

  if (clash) return { ok: false, error: "A product with that URL already exists." };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true };
}

export async function updateProduct(form: FormData): Promise<ActionResult> {
  await requireOwner();
  const slug = str(form, "slug");
  const fields = readProductForm(form);

  if (fields.basePrice <= 0) return { ok: false, error: "Enter a price above zero." };
  if (fields.costPrice > fields.basePrice) {
    return { ok: false, error: "Cost price is higher than the sale price." };
  }

  const found = await writeDb((db) => {
    const product = db.products.find((p) => p.slug === slug);
    if (!product) return false;
    Object.assign(product, fields);
    return true;
  });

  if (!found) return { ok: false, error: "That product no longer exists." };

  revalidatePath("/admin/products");
  revalidatePath(`/shop/${slug}`);
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleProduct(slug: string): Promise<void> {
  await requireOwner();
  await writeDb((db) => {
    const product = db.products.find((p) => p.slug === slug);
    if (product) product.active = !product.active;
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function deleteProduct(slug: string): Promise<void> {
  await requireOwner();
  await writeDb((db) => {
    db.products = db.products.filter((p) => p.slug !== slug);
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function setOrderStatus(
  id: string,
  status: string,
): Promise<void> {
  await requireOwner();
  if (!ORDER_STATUSES.includes(status as OrderStatus)) return;

  await writeDb((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (order) order.status = status as OrderStatus;
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
}

export async function createDiscount(form: FormData): Promise<ActionResult> {
  await requireOwner();

  const code = str(form, "code").toUpperCase().replace(/\s+/g, "");
  const type = str(form, "type") === "fixed" ? "fixed" : "percent";
  const value = Math.round(num(form, "value"));
  const minSubtotal = Math.max(0, Math.round(num(form, "minSubtotal")));
  const limitRaw = str(form, "usageLimit");
  const expiresAt = str(form, "expiresAt");

  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
    return { ok: false, error: "Codes must be 3–24 letters, digits, - or _." };
  }
  if (value <= 0) return { ok: false, error: "Enter a value above zero." };
  if (type === "percent" && value > 100) {
    return { ok: false, error: "A percentage discount cannot exceed 100." };
  }

  const clash = await writeDb((db) => {
    if (db.discounts.some((d) => d.code === code)) return true;
    const discount: Discount = {
      code,
      type,
      value,
      minSubtotal,
      usageLimit: limitRaw ? Math.max(1, Math.round(Number(limitRaw))) : null,
      usedCount: 0,
      active: true,
      expiresAt: expiresAt || null,
      createdAt: new Date().toISOString(),
    };
    db.discounts.unshift(discount);
    return false;
  });

  if (clash) return { ok: false, error: "That code already exists." };

  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function toggleDiscount(code: string): Promise<void> {
  await requireOwner();
  await writeDb((db) => {
    const discount = db.discounts.find((d) => d.code === code);
    if (discount) discount.active = !discount.active;
  });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(code: string): Promise<void> {
  await requireOwner();
  await writeDb((db) => {
    db.discounts = db.discounts.filter((d) => d.code !== code);
  });
  revalidatePath("/admin/discounts");
}

export async function createExpense(form: FormData): Promise<ActionResult> {
  await requireOwner();

  const amount = Math.round(num(form, "amount"));
  const description = str(form, "description");
  const category = str(form, "category") || "Other";
  const date = str(form, "date") || new Date().toISOString().slice(0, 10);

  if (amount <= 0) return { ok: false, error: "Enter an amount above zero." };
  if (description.length < 2) return { ok: false, error: "Add a short description." };

  const expense: Expense = {
    id: newId("exp"),
    date,
    category,
    description,
    amount,
  };

  await writeDb((db) => {
    db.expenses.unshift(expense);
  });

  revalidatePath("/admin/analytics");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<void> {
  await requireOwner();
  await writeDb((db) => {
    db.expenses = db.expenses.filter((e) => e.id !== id);
  });
  revalidatePath("/admin/analytics");
  revalidatePath("/admin");
}
