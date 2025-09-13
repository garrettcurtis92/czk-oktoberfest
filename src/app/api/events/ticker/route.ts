export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
  // First LIVE event (if any)
  const liveRows = await db
    .select({ id: events.id, title: events.title, day: events.day })
    .from(events)
    .where(eq(events.status, "live" as const))
    .limit(1);

  // Next SCHEDULED event (sorted by day then startTime)
  const nextRows = await db
    .select({
      id: events.id,
      title: events.title,
      day: events.day,
      startTime: events.startTime,
    })
    .from(events)
    .where(eq(events.status, "scheduled" as const))
    .orderBy(asc(events.day), asc(events.startTime))
    .limit(1);

  return NextResponse.json(
    { live: liveRows[0] ?? null, next: nextRows[0] ?? null },
    { headers: { "cache-control": "no-store" } }
  );
}