export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export async function POST(req: NextRequest) {
  const sub = await req.json();
  await db.insert(subscriptions).values({
    endpoint: sub.endpoint,
    p256dh: sub.keys?.p256dh,
    auth: sub.keys?.auth,
  }).onConflictDoUpdate({
    target: subscriptions.endpoint,
    set: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth },
  });
  return NextResponse.json({ ok: true });
}