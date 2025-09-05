import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  const data = day
    ? await db.select().from(events).where(eq(events.day, day))
    : await db.select().from(events);
  return NextResponse.json(data);
}
