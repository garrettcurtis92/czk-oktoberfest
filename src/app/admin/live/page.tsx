import { db } from "@/db";
import { events as eventsTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import AdminClient from "./ui";

export default async function AdminLivePage() {
  const rows = await db
    .select()
    .from(eventsTable)
    .orderBy(asc(eventsTable.day), asc(eventsTable.startTime)); // ← sort by day, then time

  return <AdminClient rows={rows} />;
}
