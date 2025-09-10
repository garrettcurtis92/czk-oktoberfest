"use server";

import { db } from "@/db";
import { scores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function requireAdminOrRedirect() {
  const token = (await cookies()).get("czk_admin")?.value;
  if (token === "1") return;
  redirect("/admin/unlock?error=1");
}

export async function addScoreAction(formData: FormData) {
  await requireAdminOrRedirect();

  const eventId = Number(formData.get("eventId"));
  const teamId = Number(formData.get("teamId"));
  const rawPoints = Number(formData.get("points"));
  const note = (formData.get("note")?.toString() ?? "").slice(0, 200) || null;

  if (!eventId || !teamId || Number.isNaN(rawPoints)) return;
  const points = Math.max(-1000, Math.min(1000, rawPoints));

  await db.insert(scores).values({ eventId, teamId, points, note });

  revalidatePath("/");             // leaderboard
  revalidatePath("/admin/score");  // recent list
  revalidatePath("/schedule");     // (optional) per-event summaries later
}

export async function deleteScoreAction(formData: FormData) {
  await requireAdminOrRedirect();

  const id = Number(formData.get("id"));
  if (!id) return;

  await db.delete(scores).where(eq(scores.id, id));

  revalidatePath("/");
  revalidatePath("/admin/score");
  revalidatePath("/schedule");
}
