/* eslint-disable @typescript-eslint/no-explicit-any */
// src/db/scripts/add-morning-bonfire.ts
// Explicitly load .env.local so env vars are available when run via tsx
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Map DATABASE_URL -> POSTGRES_URL for vercel-postgres adapter
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import { db } from "@/db";
import { events } from "@/db/schema";
import { and, eq } from "drizzle-orm";

async function addEventIfMissing(day: string, startTime: string) {
  const title = "Morning Bonfire";
  const existing = await db
    .select()
    .from(events)
    .where(and(eq(events.title, title), eq(events.day, day), eq(events.startTime, startTime)));

  if (existing.length === 0) {
    await db.insert(events).values({
      title,
      day,
      startTime,
      endTime: null,
      locationLabel: "Bonfire Area",
      type: "social",
      kind: "social",
      points: 0,
    } as any);
    console.log(`➕ Added Morning Bonfire on ${day} ${startTime}`);
  } else {
    console.log(`✓ Morning Bonfire already exists on ${day} ${startTime}`);
  }
}

async function main() {
  await addEventIfMissing("2025-10-03", "07:30");
  await addEventIfMissing("2025-10-04", "07:30");
  await addEventIfMissing("2025-10-05", "07:30");
  console.log("Done ✔");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
