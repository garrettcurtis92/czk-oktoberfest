// src/db/scripts/remove-tourney-block.ts
// Load .env.local explicitly
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import { db } from "@/db";
import { events } from "@/db/schema";
import { like, eq } from "drizzle-orm";

async function main() {
  const blocks = await db.select().from(events).where(like(events.title, "%Tourney Block%"));
  if (blocks.length === 0) {
    console.log("No Tourney Block events found.");
    return;
  }

  console.log(`Found ${blocks.length} Tourney Block event(s):`);
  for (const b of blocks) {
    console.log(`- id=${b.id} title=${b.title} day=${b.day} start=${b.startTime}`);
  }

  for (const b of blocks) {
    await db.delete(events).where(eq(events.id, b.id));
    console.log(`Deleted event id=${b.id}`);
  }

  console.log("Done — removed Tourney Block events.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
