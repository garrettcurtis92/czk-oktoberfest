// src/app/admin/live/actions.ts
"use server";

import { db } from "@/db";
import { events as eventsTable, eventStatus } from "@/db/schema";
import { eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin(formData: FormData) {
  const key = formData.get("key");
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    throw new Error("unauthorized");
  }
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
}

export async function clearLiveAction(formData: FormData) {
  await requireAdmin(formData);

  await db.update(eventsTable).set({ status: "scheduled" }).where(eq(eventsTable.status, "live"));

  revalidatePath("/admin/live");
  revalidatePath("/");
}

export async function finishPastAction(formData: FormData) {
  await requireAdmin(formData);

  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  await db.update(eventsTable).set({ status: "finished" }).where(lt(eventsTable.day, iso));

  revalidatePath("/admin/live");
  revalidatePath("/");
}
// in src/app/admin/live/actions.ts
export async function resetFinishedAction(formData: FormData) {
  "use server";
  await requireAdmin(formData);

  await db.update(eventsTable).set({ status: "scheduled" }).where(eq(eventsTable.status, "finished"));

  revalidatePath("/admin/live");
  revalidatePath("/");
}
