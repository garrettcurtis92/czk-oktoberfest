// src/app/scores/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { sql } from "drizzle-orm";

type TeamRow = {
  id: number;
  name: string;
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  total: number;
};

export default async function ScoresPage() {
  const { rows } = await db.execute(sql`
    SELECT t.id, t.name, t.color, COALESCE(SUM(s.points),0) AS total
    FROM teams t
    LEFT JOIN scores s ON s.team_id = t.id
    GROUP BY t.id
    ORDER BY total DESC;
  `);
  const teams = rows as TeamRow[];

  return (
    <main className="p-4 space-y-4">
      <section className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
        <h1 className="text-xl font-display mb-2">Scores</h1>
        <ol className="space-y-2">
          {teams.map((t, i) => (
            <li key={t.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ background: `var(--tw-color-team-${t.color})` }}
                />
                <span className="font-medium">{i + 1}.</span>
                {t.name}
              </span>
              <span className="font-semibold tabular-nums">{t.total}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
