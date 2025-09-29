// src/db/seed.ts
// 1) Explicitly load .env.local to ensure env vars are available
import dotenv from "dotenv";
import path from "path";
import { eq } from "drizzle-orm";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// 2) Map DATABASE_URL -> POSTGRES_URL before importing the DB (helps Vercel/Supabase setups)
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_URL_NON_POOLING && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_PRISMA_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL;
}


// 3) Import DB after envs are set and run within an async IIFE
(async () => {
  const { db } = await import("./index");
  // IMPORTANT: import the **new** schema tables
  // Bracket seeding removed.
  console.log("(seed) No bracket data to seed.");
})();
