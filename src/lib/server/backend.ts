import type { Database } from "@/lib/types";

/** The whole storage contract. Swapping persistence means implementing these
 *  two methods — nothing else in the app touches storage directly. */
export type Backend = {
  /** Which implementation is live, for the deployment banner in /admin. */
  name: "file" | "netlify-blobs";
  read: () => Promise<Database>;
  write: <T>(mutate: (db: Database) => T | Promise<T>) => Promise<T>;
};
