"use server";

import { db } from "@/db";
import { events as eventsTable, eventStatus, eventType, eventKind } from "@/db/schema";
import { sendToAll } from "@/lib/push-server";
import { eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// Accept either cookie (preferred) or fallback to key in form (legacy)
async function requireAdmin(formData?: FormData) {
  const jar = await cookies();
  const token = jar.get("czk_admin")?.value;
  if (token === "1") return;

  const keyFromForm = formData?.get("key")?.toString();
  if (process.env.ADMIN_KEY && keyFromForm === process.env.ADMIN_KEY) return;

  throw new Error("unauthorized");
}

export async function setStatusAction(formData: FormData) {
  await requireAdmin(formData);

  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as (typeof eventStatus.enumValues)[number];
  if (!id || !status) return;

  if (status === "live") {
    await db.update(eventsTable).set({ status: "scheduled" }).where(eq(eventsTable.status, "live"));
  }

  await db.update(eventsTable).set({ status }).where(eq(eventsTable.id, id));
  revalidatePath("/admin/live");
  revalidatePath("/");
  // Fetch for title/message
  const [ev] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));

  if (status === "live") {
    await sendToAll({
      title: "Event is LIVE",
      body: `${ev.title} just started.`,
      url: `/schedule`,
    });
  } else if (status === "paused") {
    await sendToAll({
      title: "Event Paused",
      body: `${ev.title} is temporarily paused.`,
      url: `/schedule`,
    });
  } else if (status === "finished") {
    await sendToAll({
      title: "Event Finished",
      body: `${ev.title} has finished. Check results!`,
      url: `/leaderboard`,
    });
  }
}

export async function clearLiveAction(formData: FormData) {
  await requireAdmin(formData);

  await db.update(eventsTable).set({ status: "scheduled" }).where(eq(eventsTable.status, "live"));
  revalidatePath("/admin/live");
  revalidatePath("/");
}

export async function finishPastAction(formData: FormData) {
  await requireAdmin(formData);

  const today = new Date().toISOString().slice(0, 10);
  await db.update(eventsTable).set({ status: "finished" }).where(lt(eventsTable.day, today));
  revalidatePath("/admin/live");
  revalidatePath("/");
}

export async function resetFinishedAction(formData: FormData) {
  await requireAdmin(formData);

  await db.update(eventsTable).set({ status: "scheduled" }).where(eq(eventsTable.status, "finished"));
  revalidatePath("/admin/live");
  revalidatePath("/");
}

// --- Create / Update Events ---

const eventBaseSchema = z.object({
  title: z.string().min(2).max(128),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  locationLabel: z.string().max(96).optional().or(z.literal("")),
  type: z.enum(eventType.enumValues).optional(),
  kind: z.enum(eventKind.enumValues).optional(),
  points: z.coerce.number().int().min(0).optional(),
});

export async function createEventAction(formData: FormData) {
  await requireAdmin(formData);
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventBaseSchema.parse(raw);
  const insertValues: typeof eventsTable.$inferInsert = {
    title: parsed.title,
    day: parsed.day,
    startTime: parsed.startTime ? parsed.startTime : null,
    endTime: parsed.endTime ? parsed.endTime : null,
    locationLabel: parsed.locationLabel ? parsed.locationLabel : null,
    type: parsed.type ?? "social",
    kind: parsed.kind ?? (parsed.type === "game" ? "game" : "social"),
    points: parsed.points ?? 0,
  };
  await db.insert(eventsTable).values(insertValues);
  revalidatePath("/admin/live");
  revalidatePath("/");
}

export async function updateEventAction(formData: FormData) {
  await requireAdmin(formData);
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Missing id");
  const raw = Object.fromEntries(formData.entries());
  const parsed = eventBaseSchema.partial().parse(raw);
  const updateValues: Partial<typeof eventsTable.$inferInsert> = {};
  if (parsed.title !== undefined) updateValues.title = parsed.title;
  if (parsed.day !== undefined) updateValues.day = parsed.day;
  if (parsed.startTime !== undefined) updateValues.startTime = parsed.startTime || null;
  if (parsed.endTime !== undefined) updateValues.endTime = parsed.endTime || null;
  if (parsed.locationLabel !== undefined) updateValues.locationLabel = parsed.locationLabel || null;
  if (parsed.type !== undefined) updateValues.type = parsed.type;
  if (parsed.kind !== undefined) updateValues.kind = parsed.kind;
  if (parsed.points !== undefined) updateValues.points = parsed.points;
  if (Object.keys(updateValues).length === 0) return;
  await db.update(eventsTable).set(updateValues).where(eq(eventsTable.id, id));
  revalidatePath("/admin/live");
  revalidatePath("/");
}
