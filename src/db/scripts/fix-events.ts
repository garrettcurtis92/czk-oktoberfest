// src/db/scripts/fix-events.ts
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
import { and, eq, like, sql } from "drizzle-orm";

type EventRow = typeof events.$inferSelect;

async function upsertSeparateEvent(base: EventRow, title: string, kind: "game" | "social") {
  // Check if already exists (same title + start + day) — use raw SQL to avoid strict typings
  const existing = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.title, title),
        eq(events.day, base.day),
        // startTime may be nullable in the schema; use raw SQL equality to avoid strict typing issues
        sql`${events.startTime} = ${base.startTime}`
      )
    );

  if (existing.length === 0) {
    await db.insert(events).values({
      title,
      day: base.day,
      startTime: base.startTime,
      endTime: base.endTime,
      locationLabel: (base as any).locationLabel ?? (base as any).location ?? null,
      // set both the 'type' (existing enum) and the new 'kind'
      type: kind === "game" ? "game" : "social",
      kind,
      points: 0, // leave as 0 to adjust later
    } as any);
    console.log(`➕ Added: ${title} (${kind}) on ${base.day} ${base.startTime}`);
  } else {
    // ensure kind/type/points are correct
    await db
      .update(events)
      .set({ type: kind === "game" ? "game" : "social", kind, points: existing[0].points ?? 0 })
      .where(eq(events.id, existing[0].id));
    console.log(`✓ Exists: ${title} → kind=${kind}`);
  }
}

async function main() {
  // 1) Cornhole & Ping-Pong Tourney
  const combinedTourney = await db
    .select()
    .from(events)
    .where(
      and(
        like(events.title, "%Cornhole%"),
        like(events.title, "%Ping%")
      )
    );

  for (const e of combinedTourney) {
    // Create two separate "game" events with same time/location
    await upsertSeparateEvent(e, "Cornhole Tourney", "game");
    await upsertSeparateEvent(e, "Ping-Pong Tourney", "game");

    // Option: relabel the original as informational or remove it.
    // Here we change it to a neutral note to avoid duplicates:
    await db
      .update(events)
      .set({ title: "Tourney Block (info)", kind: "social", points: 0 })
      .where(eq(events.id, e.id));

    console.log(`↺ Updated original combined tourney to info/social.`);
  }

  // 2) Costume Party (should be a game) — distinct from Dance Party
  // If you currently have a single combined title, split it:
  const costumeLike = await db
    .select()
    .from(events)
    .where(like(events.title, "%Costume%"));

  for (const e of costumeLike) {
    // Make Costume Party a GAME
    await db
      .update(events)
      .set({ kind: "game" })
      .where(eq(events.id, e.id));
    console.log(`★ Costume Party marked as GAME.`);

    // Ensure Dance Party exists separately at same time as SOCIAL
    await upsertSeparateEvent(e, "Dance Party", "social");
  }

  console.log("Done ✔");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
