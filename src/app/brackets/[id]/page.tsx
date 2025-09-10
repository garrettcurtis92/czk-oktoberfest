import { db } from "@/db";
import { brackets, matches, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

type Match = {
  id: number;
  round: number;
  position: number;
  teamAId: number | null;
  teamBId: number | null;
  scoreA: number;
  scoreB: number;
  winnerTeamId: number | null;
  status: "scheduled" | "in_progress" | "final";
};

export default async function BracketDetail({ params }: { params: { id: string }}) {
  const id = Number(params.id);

  const [bracket] = await db.select().from(brackets).where(eq(brackets.id, id));
  if (!bracket) return <div>Bracket not found.</div>;

  const ms = (await db.select()
    .from(matches)
    .where(eq(matches.bracketId, id))) as Match[];

  // Group matches by round
  const rounds = new Map<number, Match[]>();
  let maxRound = 0;
  ms.forEach((m) => {
    if (!rounds.has(m.round)) rounds.set(m.round, []);
    rounds.get(m.round)!.push(m);
    maxRound = Math.max(maxRound, m.round);
  });

  // Build a map: fetch all teams and map by id (small dataset, fine for now)
  const allTeams = await db.select().from(teams);
  const tmap = new Map(allTeams.map(t => [t.id, t]));

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{bracket.title}</h1>
        <p className="text-black/60">{bracket.format.replace("_"," ")}</p>
      </header>

      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-full">
          {Array.from({ length: maxRound }, (_, idx) => idx + 1).map((r) => {
            const col = (rounds.get(r) || []).sort((a,b) => a.position - b.position);
            return (
              <div key={r} className="min-w-60">
                <div className="mb-3 text-sm font-medium uppercase tracking-wide text-black/70">
                  {r === 1 ? "Round 1" : r === maxRound ? "Final" : `Round ${r}`}
                </div>
                <div className="space-y-3">
                  {col.map((m) => {
                    const A = m.teamAId ? tmap.get(m.teamAId) : null;
                    const B = m.teamBId ? tmap.get(m.teamBId) : null;
                    const done = m.status === "final";
                    return (
                      <div key={m.id} className="rounded-xl border border-black/10 bg-white/70 p-3 backdrop-blur">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium">{A?.name ?? "TBD"}</div>
                            <div className="font-medium">{B?.name ?? "TBD"}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div>{m.scoreA}</div>
                            <div>{m.scoreB}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-black/60">
                          {done ? "Final" : m.status === "in_progress" ? "Live" : "Scheduled"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
