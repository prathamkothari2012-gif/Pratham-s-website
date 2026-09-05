import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Database } from "@/lib/types";
import type { Backend } from "@/lib/server/backend";

/**
 * JSON-file storage. Suits a single Node process with a persistent disk — a
 * VPS, a Docker container with a mounted volume, or `next start` locally.
 *
 * Not suitable for serverless hosting, where the filesystem is ephemeral and
 * requests land on different instances; `store-blobs.ts` covers that.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "store.json");

/** Serialises writes so two concurrent requests cannot lose an update. */
let queue: Promise<unknown> = Promise.resolve();

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file then rename, so a crash mid-write cannot truncate
  // the store.
  const tmp = `${DB_PATH}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

export function fileBackend(seed: () => Database, merge: (raw: unknown) => Database): Backend {
  async function load(): Promise<Database> {
    try {
      const raw = await fs.readFile(DB_PATH, "utf8");
      return merge(JSON.parse(raw));
    } catch {
      const fresh = seed();
      await persist(fresh);
      return fresh;
    }
  }

  return {
    name: "file",

    // Always reads from disk rather than holding an in-memory copy: Next.js
    // gives each route bundle its own module instance, so a cache filled while
    // rendering one route is invisible to — and quickly stale in — another.
    read: load,

    async write<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
      const run = queue.then(async () => {
        // Re-read inside the lock so the mutation sees writes made since this
        // request began.
        const db = await load();
        const result = await mutate(db);
        await persist(db);
        return result;
      });
      queue = run.catch(() => undefined);
      return run;
    },
  };
}
