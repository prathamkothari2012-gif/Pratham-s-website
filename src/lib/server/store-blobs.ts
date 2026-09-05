import "server-only";
import { getStore } from "@netlify/blobs";
import type { Database } from "@/lib/types";
import type { Backend } from "@/lib/server/backend";

/**
 * Netlify Blobs storage, for deploying to Netlify.
 *
 * Netlify runs each request in a short-lived function with a throwaway
 * filesystem, so the JSON-file backend would lose every order. Blobs is
 * Netlify's own durable store — no extra service to sign up for.
 *
 * Concurrency is handled with compare-and-swap rather than a lock: two
 * function instances can run at once, so `write` re-reads, applies the
 * mutation, and only commits if nobody else wrote in the meantime. If someone
 * did, it retries against the newer state. An in-process queue could not
 * protect against this, because the instances do not share memory.
 */

const KEY = "database";
const STORE = "spoolhouse";
const MAX_ATTEMPTS = 6;

export function blobsBackend(
  seed: () => Database,
  merge: (raw: unknown) => Database,
): Backend {
  const store = () => getStore({ name: STORE, consistency: "strong" });

  async function load(): Promise<{ db: Database; etag: string | undefined }> {
    const found = await store().getWithMetadata(KEY, { type: "json" });
    if (!found) return { db: seed(), etag: undefined };
    return { db: merge(found.data), etag: found.etag };
  }

  return {
    name: "netlify-blobs",

    async read(): Promise<Database> {
      const { db } = await load();
      return db;
    },

    async write<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
      let lastError: unknown;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const { db, etag } = await load();
        const result = await mutate(db);

        try {
          const written = await store().setJSON(KEY, db, {
            // Commit only if the stored copy is still the one we read. Without
            // an etag the record does not exist yet, so require that it is
            // still absent.
            ...(etag ? { onlyIfMatch: etag } : { onlyIfNew: true }),
          });

          if (written.modified) return result;
        } catch (error) {
          lastError = error;
        }

        // Someone else committed first. Back off briefly and rebuild the
        // mutation on top of their write.
        await new Promise((r) => setTimeout(r, 25 * 2 ** attempt));
      }

      throw new Error(
        `Could not save after ${MAX_ATTEMPTS} attempts — too many concurrent writes.${
          lastError ? ` Last error: ${String(lastError)}` : ""
        }`,
      );
    },
  };
}
