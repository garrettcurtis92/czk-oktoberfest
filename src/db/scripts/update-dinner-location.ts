/* eslint-disable @typescript-eslint/no-explicit-any */
// src/db/scripts/update-dinner-location.ts
// Set all dinner event locations to "Lil Z Shop"
import dotenv from "dotenv";
import path from "path";

// Load env (works when run via: tsx -r dotenv/config ... OR directly)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const TARGET = "Lil Z Shop";
  // Fetch dinner events first for logging clarity
  const dinnerEvents = await db.select().from(events).where(eq(events.type, "dinner" as any));
  if (dinnerEvents.length === 0) {
    console.log("No dinner events found. Nothing to update.");
    return;
  }

  let updated = 0;
  for (const e of dinnerEvents) {
    if (e.locationLabel !== TARGET) {
      await db.update(events).set({ locationLabel: TARGET }).where(eq(events.id, e.id));
      updated++;
      console.log(`↺ Updated event #${e.id} (${e.title}) location -> ${TARGET}`);
    } else {
      console.log(`✓ Event #${e.id} (${e.title}) already set to ${TARGET}`);
    }
  }
  console.log(`Done ✔ Dinner events processed: ${dinnerEvents.length}, updated: ${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
