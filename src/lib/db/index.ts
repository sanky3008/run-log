import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

const pool =
  globalThis.__dbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });
globalThis.__dbPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
