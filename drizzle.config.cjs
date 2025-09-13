// Load env from .env.local so CLI sees DATABASE_URL
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

/** @type {import('drizzle-kit').Config} */
module.exports = {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
};
