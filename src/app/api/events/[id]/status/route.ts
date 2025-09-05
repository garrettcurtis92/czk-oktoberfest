import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

function isAdmin(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || req.headers.get("x-admin-key");
  return key && process.env.ADMIN_KEY && key === process.env.ADMIN_KEY;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const status = body?.status as "scheduled" | "live" | "paused" | "finished" | undefined;
  if (!status) return NextResponse.json({ error: "missing status" }, { status: 400 });

  // If setting an event live, mark all others scheduled/finished (simple rule: only one live at a time)
  if (status === "live") {
    await db.update(events).set({ status: "scheduled" }).where(eq(events.status, "live"));
  }

  await db.update(events).set({ status }).where(eq(events.id, Number(params.id)));
  return NextResponse.json({ ok: true });
}
