import { db } from "@/db";
import { events as eventsTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import AdminClient from "./ui";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLivePage() {
  // Check authentication
  const jar = await cookies();
  const adminCookie = jar.get("czk_admin");
  
  if (!adminCookie || adminCookie.value !== "1") {
    redirect("/admin/unlock?next=" + encodeURIComponent("/admin/live"));
  }

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
