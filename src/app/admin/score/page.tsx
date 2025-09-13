import { db } from "@/db";
import { events as eventsTable, teams as teamsTable, scores as scoresTable } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import AdminScoreClient from "./ui";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminScorePage() {
  // Check authentication
  const jar = await cookies();
  const adminCookie = jar.get("czk_admin");
  
  if (!adminCookie || adminCookie.value !== "1") {
    redirect("/admin/unlock?next=" + encodeURIComponent("/admin/score"));
  }

  const [events, teams] = await Promise.all([
    db.select().from(eventsTable).orderBy(asc(eventsTable.day), asc(eventsTable.startTime)),
    db.select().from(teamsTable).orderBy(asc(teamsTable.name)),
  ]);

  const recent = await db
    .select()
    .from(scoresTable)
    .orderBy(desc(scoresTable.createdAt))
    .limit(20);

  const recentSerialized = recent.map((r) => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  return <AdminScoreClient events={events} teams={teams} recent={recentSerialized} />;
}
