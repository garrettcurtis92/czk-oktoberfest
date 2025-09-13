"use server";

import { db } from "@/db";
import { events as eventsTable, eventStatus } from "@/db/schema";
import { sendToAll } from "@/lib/push-server";
import { eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
