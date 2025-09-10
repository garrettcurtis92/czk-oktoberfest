// src/app/scores/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/db";
import { sql } from "drizzle-orm";
import GlassCard from "@/components/GlassCard";
import ColorChips from "@/components/ColorChips";

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
      <GlassCard className="p-4">
        <h1 className="text-xl font-display mb-2">Scores</h1>
        
        {/* Team color chips */}
        <ColorChips
          colors={["#F39B2B", "#F3D23B", "#36B37E", "#2F80ED", "#E45757", "#8C59D9"]}
          label="Team colors: Orange, Yellow, Green, Blue, Red, Purple"
        />
        
        <ol className="space-y-2 mt-4">
          {teams.map((t, i) => (
            <li key={t.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="size-3 rounded-full"
                  style={{ background: `var(--tw-color-team-${t.color})` }}
                />
                <span className="font-medium">{i + 1}.</span>
                <span className="truncate">{t.name}</span>
              </span>
              <span className="font-semibold tabular-nums">{t.total}</span>
            </li>
          ))}
        </ol>
      </GlassCard>
    </main>
  );
}
