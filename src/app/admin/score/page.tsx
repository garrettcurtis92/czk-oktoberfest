import { db } from "@/db";
import { events as eventsTable, teams as teamsTable, scores as scoresTable } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import AdminScoreClient from "./ui";

export default async function AdminScorePage() {
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
