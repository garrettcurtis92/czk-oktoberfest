// src/app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { events as eventsTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import NowPlayingBanner from "@/components/now-playing";

type EventRow = {
  id: number;
  title: string;
  locationLabel: string | null;
  day: string;                 // "YYYY-MM-DD"
  startTime: string | null;    // "HH:MM"
  endTime: string | null;      // "HH:MM"
  status?: "scheduled" | "live" | "paused" | "finished";
};

type TeamRow = {
  id: number;
  name: string;
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  total: number;
};

function toDate(day: string, hm?: string | null) {
  const base = new Date(day + "T00:00:00");
  if (hm) {
    const [h, m] = hm.split(":").map(Number);
    base.setHours(h ?? 0, m ?? 0, 0, 0);
  }
  return base;
}

async function getLiveOrNext(): Promise<{ live?: EventRow; next?: EventRow; isPreview?: boolean }> {
  const rows = (await db.select().from(eventsTable)) as EventRow[];
  const liveCandidate = rows.find((r) => r.status === "live");

  if (liveCandidate) {
    // Determine whether it's actually within the live window
    const now = new Date();
    const start = toDate(liveCandidate.day, liveCandidate.startTime);
    const end = toDate(
      liveCandidate.day,
      liveCandidate.endTime ?? liveCandidate.startTime ?? undefined
    );
    const isNow = now >= start && now <= end;
    if (isNow) return { live: liveCandidate, isPreview: false };
    // Mark as preview if it's toggled live but not in the window yet
    return { live: liveCandidate, isPreview: true };
  }

  // Fallback: Next upcoming event
  const now = new Date();
  const upcoming = rows
    .map((r) => ({ when: toDate(r.day, r.startTime).getTime(), row: r }))
    .filter((x) => x.when > now.getTime())
    .sort((a, b) => a.when - b.when)[0]?.row;

  return upcoming ? { next: upcoming } : {};
}

export default async function Home() {
  // Leaderboard (server-side, DB direct)
  const { rows } = await db.execute(sql`
    SELECT t.id, t.name, t.color, COALESCE(SUM(s.points),0) AS total
    FROM teams t
    LEFT JOIN scores s ON s.team_id = t.id
    GROUP BY t.id
    ORDER BY total DESC;
  `);
  const teams = rows as TeamRow[];

  // Live / Next logic
  const { live, next, isPreview } = await getLiveOrNext();

  return (
    <main className="p-4 space-y-4">
      {live && (
        <NowPlayingBanner
          title={isPreview ? `${live.title} • Preview` : live.title}
          location={live.locationLabel}
          day={live.day}
          startTime={live.startTime}
          endTime={live.endTime ?? live.startTime /* fallback */}
        />
      )}

      {!live && next && (
        <div className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
          <div className="text-sm opacity-70">Next Up</div>
          <div className="text-lg font-display">{next.title}</div>
          <div className="text-sm opacity-80">
            {next.day} {next.startTime ?? ""} · {next.locationLabel ?? "On-site"}
          </div>
        </div>
      )}

      {!live && !next && (
        <div className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
          <div className="text-sm opacity-70">No upcoming events</div>
          <div className="text-sm opacity-80">Check back soon.</div>
        </div>
      )}

      <section className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
        <h2 className="text-xl font-display mb-2">Leaderboard</h2>
        <ol className="space-y-1">
          {teams.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ background: `var(--tw-color-team-${t.color})` }}
                />
                {t.name}
              </span>
              <span className="font-semibold">{t.total}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
