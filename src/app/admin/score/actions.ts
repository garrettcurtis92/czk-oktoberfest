"use server";

import { db } from "@/db";
import { scores, teams, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendToAll } from "@/lib/push-server";

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

  const teamsRes = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  const eventsRes = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  const team = teamsRes[0] ?? null;
  const event = eventsRes[0] ?? null;

  if (team && event) {
    sendToAll({
      title: `Score update: ${team.name}`,
      body: `${event.title} — ${points > 0 ? "+" : ""}${points} points`,
      url: `/teams/${team.id}`,
    });
  }

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
