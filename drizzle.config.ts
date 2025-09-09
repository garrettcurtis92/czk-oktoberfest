import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: "aws-1-us-west-1.pooler.supabase.com",
    port: 6543,
    user: "postgres.zkdgfvxzxxfdarkwkgye",
    password: "WJEmDDHGKA7bPphe",
    database: "postgres",
    ssl: "require"
  },
  dialect: "postgresql"
} satisfies Config;