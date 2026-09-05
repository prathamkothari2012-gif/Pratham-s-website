/**
 * The owner session cookie's name, deliberately alone in a module that imports
 * nothing.
 *
 * `src/proxy.ts` reads it, and the proxy is compiled into an Edge Function
 * running on Deno — so everything it pulls in, transitively, must be edge-safe.
 * Importing this from `lib/server/auth` instead dragged `node:crypto` and
 * `next/headers` into that bundle, which cannot run there and failed the
 * deploy. Keep this file dependency-free.
 */
export const SESSION_COOKIE = "spoolhouse_admin";
