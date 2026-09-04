import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/server/catalog";

/** The cart runs in the browser and needs product data to price its lines.
 *  Always reflects the live catalog, so it must not be cached. */
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getActiveProducts();
  return NextResponse.json({ products });
}
