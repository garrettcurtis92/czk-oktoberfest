import { db } from "@/db";
import { sql } from "drizzle-orm";

type TeamRow = {
  id: number;
  name: string;
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  total: number;
};

export default async function Home() {
  const { rows } = await db.execute(
    sql`SELECT t.id, t.name, t.color, COALESCE(SUM(s.points),0) AS total
        FROM teams t
        LEFT JOIN scores s ON s.team_id = t.id
        GROUP BY t.id
        ORDER BY total DESC;`
  );
  // drizzle’s execute() returns unknown row shape → assert once here
  const teams = rows as TeamRow[];

  return (
    <main className="p-4 space-y-4">
      <div className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
        <h1 className="text-2xl font-display">CZK Oktoberfest</h1>
        <p className="opacity-70">Now Playing: (coming soon)</p>
      </div>

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
};