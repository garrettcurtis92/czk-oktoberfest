import { db } from "@/db";
import { events as eventsTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import AdminClient from "./ui";
import { Suspense } from "react";

export default async function AdminLivePage() {
  const rows = await db
    .select()
    .from(eventsTable)
    .orderBy(asc(eventsTable.day), asc(eventsTable.startTime)); // ← sort by day, then time

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminClient rows={rows} />
    </Suspense>
  );
}
