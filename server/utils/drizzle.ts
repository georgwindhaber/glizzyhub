import { drizzle } from "drizzle-orm/libsql";
export { sql, eq, and, or } from "drizzle-orm";

import * as schema from "../database/schema";
import { createClient } from "@libsql/client";

export const tables = schema;

export function useDrizzle() {
  return drizzle(
    createClient({ url: process.env.DB_URL!, authToken: process.env.DB_TOKEN }),
    { schema }
  );
}

export type Channel = typeof schema.channels.$inferSelect;
