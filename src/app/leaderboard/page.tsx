// src/app/leaderboard/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { Crown } from "lucide-react";
import { sql } from "drizzle-orm";
import LiveTicker from "@/components/LiveTicker";

type TeamRow = {
  id: number;
  name: string;
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  total: number;
};

type RecentRow = {
  id: number;
  points: number;
  note: string | null;
  created_at: string; // ISO from DB
  team_name: string;
  team_color: TeamRow["color"];
};

function formatTime(ts: string) {
  const d = new Date(ts);
  // e.g., "Oct 4, 3:42 PM"
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function LeaderboardPage() {
  // 1) Totals by team (descending)
  const { rows: totalRows } = await db.execute(sql`
    SELECT t.id, t.name, t.color, COALESCE(SUM(s.points), 0) AS total
    FROM teams t
    LEFT JOIN scores s ON s.team_id = t.id
    GROUP BY t.id
    ORDER BY total DESC, t.name ASC;
  `);
  const teams = totalRows as TeamRow[];

  // 2) Recent scoring activity (latest first)
  const { rows: recentRows } = await db.execute(sql`
    SELECT s.id, s.points, s.note, s.created_at, t.name AS team_name, t.color AS team_color
    FROM scores s
    JOIN teams t ON t.id = s.team_id
    ORDER BY s.created_at DESC
    LIMIT 20;
  `);
  const recent = recentRows as RecentRow[];

  return (
    <main className="p-4 space-y-4">
      
     
      {/* Hero / Header */}
      <section className="relative rounded-3xl p-8 shadow bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md overflow-hidden border border-white/20 dark:border-gray-700/30">
        {/* subtle blobs */}
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />

        <h1 className="text-3xl md:text-4xl font-display tracking-tight text-center">
          Leaderboard
        </h1>
        <p className="mt-2 text-center text-sm md:text-base text-charcoal/70 dark:text-white/70">
          Live team standings and the most recent scoring updates.
        </p>
      </section>

      {/* Leaderboard totals */}

{/* Leaderboard totals */}
<section className="rounded-2xl p-4 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md shadow border border-white/20 dark:border-gray-700/30">
  <h2 className="text-xl font-display mb-2">Standings</h2>

  {teams.length === 0 ? (
    <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm opacity-80">
      No teams yet.
    </div>
  ) : (
    <ol className="space-y-2">
      {teams.map((t, i) => (
        <li
          key={t.id}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="text-sm opacity-60 w-6 tabular-nums">{i + 1}.</span>
            <span
              className="inline-block size-3 rounded-full"
              style={{ background: `var(--tw-color-team-${t.color})` }}
              aria-hidden
            />
            <span className="truncate flex items-center gap-1">
              {t.name}
              {i === 0 && (
                <Crown className="h-4 w-4 text-yellow-500 shrink-0" aria-label="First place" />
              )}
            </span>
          </span>
          <span className="font-semibold tabular-nums">{t.total}</span>
        </li>
      ))}
    </ol>
  )}
</section>



      {/* Recent scoring activity */}
      <section className="rounded-2xl p-4 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md shadow border border-white/20 dark:border-gray-700/30">
        <h2 className="text-xl font-display mb-2">Recent Activity</h2>

        {recent.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm opacity-80">
            No scores submitted yet.
          </div>
        ) : (
          <ul className="divide-y divide-black/5">
            {recent.map((r) => (
              <li key={r.id} className="py-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 rounded-full"
                      style={{ background: `var(--tw-color-team-${r.team_color})` }}
                      aria-hidden
                    />
                    <span className="font-medium">{r.team_name}</span>
                    <span className="text-xs opacity-60">{formatTime(r.created_at)}</span>
                  </div>
                  {r.note && (
                    <div className="text-sm opacity-80 mt-0.5 break-words">{r.note}</div>
                  )}
                </div>
                <div className="shrink-0 font-semibold tabular-nums">
                  {r.points > 0 ? `+${r.points}` : r.points}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
