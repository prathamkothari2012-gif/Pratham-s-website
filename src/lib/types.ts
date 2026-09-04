/**
 * Data shapes shared by the server and the browser.
 *
 * These live apart from `lib/server/db.ts` deliberately: that module imports
 * `node:fs`, so any client component importing a *value* from it (an enum-like
 * constant, say) would drag Node built-ins into the browser bundle and fail
 * the build. Types alone are erased at compile time; values are not.
 */

import type { Product } from "@/content/catalog";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "printing"
  | "shipped"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "printing",
  "shipped",
  "cancelled",
];

/** A product as stored — the catalog shape plus the fields only the owner sees. */
export type StoredProduct = Product & {
  /** What it costs us to make one: filament, resin, machine time, labour. */
  costPrice: number;
  /** Hidden from the storefront when false, without deleting history. */
  active: boolean;
};

export type OrderLine = {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Unit cost captured at order time, so later repricing cannot rewrite history. */
  unitCost: number;
  options: string[];
};

/** How far along the customer's UPI payment is. There is no payment gateway
 *  in the loop, so "submitted" means the customer says they have paid and
 *  "verified" means the owner has confirmed it landed in their account. */
export type PaymentStatus = "unpaid" | "submitted" | "verified" | "refunded";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "submitted",
  "verified",
  "refunded",
];

export type Payment = {
  method: "upi";
  status: PaymentStatus;
  /** The UPI ID the customer was asked to pay, captured at order time so a
   *  later change of UPI ID does not rewrite old orders. */
  payeeVpa: string;
  amount: number;
  /** The 12-digit UTR / reference the customer reads off their UPI app. */
  utr: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
};

export type Order = {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  /** Random secret in the customer's payment-page URL, so an order cannot be
   *  looked up by guessing short references. */
  accessToken: string;
  payment: Payment;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    fileUrl: string;
    notes: string;
  };
  lines: OrderLine[];
  discountCode: string | null;
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
};

export type Discount = {
  code: string;
  type: "percent" | "fixed";
  /** Percentage points (type "percent") or currency units (type "fixed"). */
  value: number;
  /** Order subtotal required before the code applies. */
  minSubtotal: number;
  /** null means unlimited. */
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  /** ISO date, or null for no expiry. */
  expiresAt: string | null;
  createdAt: string;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

export type Database = {
  products: StoredProduct[];
  orders: Order[];
  discounts: Discount[];
  expenses: Expense[];
};
