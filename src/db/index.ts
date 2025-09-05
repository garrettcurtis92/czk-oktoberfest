import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
export const db = drizzle(sql);
// Export a placeholder schema to avoid "Cannot find module './schema'"
// Replace this with a proper ./schema.ts or ./schema/index.ts implementation later.
export const schema = {} as const;
