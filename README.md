# 3D Spool House

Marketing site, online shop and owner dashboard for a custom 3D printing
business. Built with Next.js 16 (App Router), React 19, TypeScript and
Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

The dashboard lives at `/admin`. In development the password is `spoolhouse`.

## What's here

**Storefront**

| Route | Purpose |
| --- | --- |
| `/` | Landing page — hero, services, materials, process, testimonials, FAQ |
| `/shop` | Service catalog with category filtering |
| `/shop/[slug]` | Product page with an option configurator and live pricing |
| `/cart` | Cart, editable quantities, discount code entry |
| `/checkout` | Customer and delivery details, places the order |
| `/contact` | Quote enquiry form |

**Owner dashboard** (`/admin`, password protected)

| Route | Purpose |
| --- | --- |
| `/admin` | Revenue, profit, orders and best sellers at a glance |
| `/admin/orders` | Every order, expandable, with per-order margin and status control |
| `/admin/products` | Add, edit, hide and delete catalog items |
| `/admin/discounts` | Create and manage discount codes |
| `/admin/analytics` | Full profit & loss, profit by product, expense log |

## Editing content

Marketing copy, contact details and currency live in one file:
**`src/content/site.ts`**. Change it and the whole site follows — nothing is
hardcoded in components.

`src/content/catalog.ts` holds the *seed* catalog used the first time the app
runs. After that the catalog lives in the datastore and is edited through
`/admin/products`.

Brand colours are the `--color-brand-*` ramp at the top of
`src/app/globals.css`.

## Configuration

Copy `.env.example` to `.env.local` and fill it in:

```bash
ADMIN_PASSWORD=   # dashboard password (required in production)
AUTH_SECRET=      # signs the session cookie; generate 32 random bytes
DATA_DIR=         # optional, where the datastore is written (default ./data)
```

The app refuses to serve the dashboard in production while either of the first
two is unset.

## Data storage

Orders, products, discounts and expenses are kept in a JSON file at
`$DATA_DIR/store.json` (`./data/store.json` by default). This has no
dependencies and works immediately, but it assumes **a single Node process
with a persistent disk** — a VPS, a Docker container with a mounted volume, or
`next start` on one machine.

It is **not** suitable for serverless hosting (Vercel, Netlify functions),
where the filesystem is ephemeral and requests hit different instances. To
deploy there, reimplement `readDb` and `writeDb` in `src/lib/server/db.ts`
against a real database — Postgres, Supabase, Turso. Nothing else in the app
touches the file.

## Taking payments

Checkout captures the order and shows a reference; it does not charge a card.
The place to add that is marked `INTEGRATION POINT` in
`src/app/api/orders/route.ts`: create a Razorpay or Stripe session there,
return its redirect URL, and confirm the order from the payment webhook.
`src/app/api/contact/route.ts` has the same marker for wiring up email.

## How money is calculated

- Prices are **always** recomputed on the server from the catalog. Anything
  the browser says about price is ignored, so a tampered request cannot change
  what is owed.
- Discount codes are re-validated at order time, not just when applied.
- Each order line stores the cost price *at the time of sale*, so later
  repricing never rewrites historical margins.
- P&L excludes GST from revenue (it is collected for the government, not
  earned) and excludes cancelled orders.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```
