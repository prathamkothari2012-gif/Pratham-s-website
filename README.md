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
| `/checkout` | Verified contact details, delivery address, payment choice |
| `/order/[ref]` | Payment page — UPI QR, deep link, UTR entry (token-guarded) |
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
`src/app/globals.css`, built from a four-colour palette (`#1B262C` ink,
`#0F4C75` deep, `#3282B8` primary, `#BBE1FA` pale). The semantic surface
tokens below it define light and dark mode.

## Configuration

Copy `.env.example` to `.env.local` and fill it in:

```bash
ADMIN_PASSWORD=   # dashboard password (required in production)
AUTH_SECRET=      # signs the session cookie; generate 32 random bytes
DATA_DIR=         # optional, where the datastore is written (default ./data)
```

The app refuses to serve the dashboard in production while either of the first
two is unset.

## Deploying to Netlify

```bash
# Push the repo to GitHub, then in Netlify: Add new site -> Import from Git.
# netlify.toml already sets the build command, publish directory and plugin,
# so the defaults it offers are correct.
```

Set these environment variables in **Site settings -> Environment variables**:

| Variable | Why |
| --- | --- |
| `ADMIN_PASSWORD` | Dashboard password. The app refuses to serve `/admin` without it. |
| `AUTH_SECRET` | Signs sessions, verification tokens and bot challenges. Generate 32 random bytes. |
| `RESEND_API_KEY` | Sends email verification codes. Without it nobody can check out. |
| `MAIL_FROM` | The address codes are sent from. Needs a domain you control. |

`SITE_URL` is optional — Netlify provides the site address at build time, so
canonical links and the sitemap are correct on `*.netlify.app` with no
configuration. Set it once you attach a real domain.

## Data storage

Two backends behind one interface, chosen from the environment so it cannot be
configured wrong:

- **Netlify Blobs** when running on Netlify. Netlify gives each request a
  throwaway filesystem, so a file-based store would silently lose orders.
  Writes use compare-and-swap on the stored etag: two function instances can
  run at once and do not share memory, so a lock would not help — the loser of
  a race re-reads and reapplies instead.
- **A JSON file** everywhere else, at `$DATA_DIR/store.json`
  (`./data/store.json` by default). Suits a VPS, Docker with a mounted volume,
  or `next start` locally.

To use a real database instead — Postgres, Supabase, Turso — implement the
two-method `Backend` type in `src/lib/server/backend.ts` and select it in
`src/lib/server/db.ts`. Nothing else in the app touches storage.

Because mutations may be retried against fresher data, keep them a function of
the database they are handed rather than of anything captured from outside.

## Is it ready to take orders?

The dashboard overview shows a setup panel listing anything unfinished —
missing email provider, default dashboard password, and so on. It disappears
once everything is wired up. Worth checking straight after the first deploy.

## Verified customers

Before an order can be placed the customer must confirm **both** their email
address and their mobile number with a 6-digit code.

The browser never sends a "verified" flag. A successful code check returns an
HMAC-signed token bound to that exact address or number, and
`/api/orders` re-checks the signature against the details on the order. A
forged token, or one issued for a different address, is refused.

Codes are stored hashed, expire in 10 minutes, are burned after 5 wrong
guesses, and are limited to 5 per address and 10 per IP per hour.

With no provider configured the code is written to the server log (and, in
development only, returned to the browser) so the flow works on a fresh clone.
See `.env.example` for wiring up Resend for email; the SMS adapter in
`src/lib/server/notify.ts` is a stub to fill in against your provider.

## Bot protection

Four layers, none of which needs a third-party account or shows the visitor a
puzzle:

1. **Proof of work.** Every public form must solve a hashcash-style challenge
   before the server will look at it — a few hundred milliseconds once,
   ruinous for a bot posting thousands of times. Challenges are HMAC-signed
   and scoped to one form, so one cannot be replayed against another.
2. **Timing.** The challenge is fetched when the form mounts and carries a
   server-issued timestamp, so a submission faster than a person could type is
   rejected. Because the server issued that timestamp, a bot cannot fake it.
3. **Honeypot.** A hidden field no real person fills in. Submissions carrying
   a value are accepted and silently dropped — telling a spammer it failed
   only helps it adapt.
4. **Rate limits.** Per IP and per target, persisted in the datastore so they
   hold across route handlers.

Chosen over a hosted CAPTCHA because it sends no visitor data anywhere and
works for people using screen readers or blocking trackers. It is not
unbreakable — a determined attacker can pay the cost — which is why the layers
sit together rather than alone.

## Payments

Two options at checkout: **cash on delivery**, or **UPI paid directly to the
shop's UPI ID** — no gateway, no per-transaction fee, no third party holding
the money.

After checkout the customer gets a payment page (`/order/<ref>?t=<token>`)
with a QR code and an "Open my UPI app" link. Both are built from the NPCI
deep-link spec with the amount and order reference pre-filled. The QR is
rendered on our own server, so nobody outside sees an order's amount.

Set the UPI ID in `site.payment.upiId` in `src/content/site.ts`. It must be
the exact VPA registered against the phone number — the handle differs by app
(`@ybl` PhonePe, `@okaxis`/`@oksbi` Google Pay, `@paytm` Paytm, `@upi` BHIM).
Copy it from the UPI app rather than guessing; a wrong handle means payments
silently fail.

**One thing to be clear about:** neither method confirms itself. A direct-to-VPA
setup has no callback, and cash obviously has none either. So the flow is:

1. Customer pays and enters the UTR their UPI app shows them.
2. The order moves to *Awaiting check*.
3. The owner confirms it against their account in `/admin/orders` and marks it
   **Paid**. For COD, the owner marks it paid once the courier hands over the
   cash.

Because of that, **unpaid orders are not counted as revenue**. The P&L is cash
basis — only payments the owner has verified. Money owed shows separately as
"outstanding" on the dashboard.

To automate confirmation, replace the `INTEGRATION POINT` in
`src/app/api/orders/route.ts` with a Razorpay or Stripe session and mark
orders paid from that provider's webhook. `src/app/api/contact/route.ts` has
the same marker for wiring up email.

## How money is calculated

- Prices are **always** recomputed on the server from the catalog. Anything
  the browser says about price is ignored, so a tampered request cannot change
  what is owed.
- Discount codes are re-validated at order time, not just when applied.
- Each order line stores the cost price *at the time of sale*, so later
  repricing never rewrites historical margins.
- P&L excludes GST from revenue (it is collected for the government, not
  earned), excludes cancelled orders, and counts only payments the owner has
  verified — an order placed but unpaid is not revenue.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```
