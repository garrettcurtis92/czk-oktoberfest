'use server';
import { db } from '@/db';
import { brackets, bracketMatches, bracketSeeds, teams } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ---- Local helpers (no external imports) ----
type TeamSeed = { teamId: number; seed: number };
// ADD (near top of file, under imports / helpers)
async function autoAdvanceByes(bracketId: number) {
  // find first-round matches with one team null
  const first = await db.select().from(bracketMatches)
    .where(and(eq(bracketMatches.bracketId, bracketId), eq(bracketMatches.roundNumber, 1)));

  for (const m of first) {
    const hasBye = (!!m.team1Id && !m.team2Id) || (!m.team1Id && !!m.team2Id);
    if (!hasBye) continue;

    const winnerTeamId = (m.team1Id ?? m.team2Id)!; // the present team
    // mark winner, and push forward if nextMatch is wired
    await db.update(bracketMatches)
      .set({ winnerTeamId, team1Score: m.team1Id ? 0 : 0, team2Score: m.team2Id ? 0 : 0 })
      .where(eq(bracketMatches.id, m.id));

    if (m.nextMatchId && m.slotInNext) {
      const nextField = m.slotInNext === 1 ? { team1Id: winnerTeamId } : { team2Id: winnerTeamId };
      await db.update(bracketMatches).set(nextField).where(eq(bracketMatches.id, Number(m.nextMatchId)));
    }
  }
}

function nextPowerOfTwo(n: number) { let p = 1; while (p < n) p <<= 1; return p; }
function generateOrder(size: number): number[] {
  if (size === 2) return [1, 2];
  const prev = generateOrder(size / 2);
  const mirrored = prev.map((x) => size + 1 - x);
  return [...prev, ...mirrored];
}

function buildFirstRoundPairs(seeds: TeamSeed[]) {
  const n = seeds.length;
  const size = nextPowerOfTwo(n);
  const ordered = [...seeds].sort((a, b) => a.seed - b.seed); // 1..N
  const order = generateOrder(size);
  const slots: (TeamSeed | null)[] = Array(size).fill(null);
  ordered.forEach((s, idx) => { slots[order[idx] - 1] = s; });
  const pairs: [TeamSeed | null, TeamSeed | null][] = [];
  for (let i = 0; i < size; i += 2) pairs.push([slots[i], slots[i + 1]]);
  return { pairs, size };
}

function validateCornholeSubmission(team1Score: number, team2Score: number) {
  const fix = (s: number) => (s > 21 ? 11 : s);
  const f1 = fix(team1Score);
  const f2 = fix(team2Score);
  if (f1 !== team1Score || f2 !== team2Score) {
    return { ok: false as const, corrected: { team1Score: f1, team2Score: f2 } };
  }
  const winner = team1Score === 21 ? 'team1' : team2Score === 21 ? 'team2' : null;
  return { ok: true as const, winner };
}

export async function generateCornholeBracket(eventId: string, createdBy: string) {
  // 1) Load standings → array of { teamId, seed }
  const standings = await db.select().from(teams);
  const seeds: TeamSeed[] = standings.map((t, i) => ({ teamId: Number(t.id), seed: i + 1 }));

  // 2) Insert bracket
  const [br] = await db.insert(brackets).values({ eventId: Number(eventId), game: 'cornhole', createdBy }).returning();

  // 3) Insert seeds
  await db.insert(bracketSeeds).values(seeds.map(s => ({ bracketId: br.id, teamId: s.teamId, seedNumber: s.seed })));

  // 4) Build first round pairs
  const { pairs } = buildFirstRoundPairs(seeds);

  // 5) Insert first round matches and prebuild subsequent rounds wiring
  let round = 1;
  const roundMatchesIds: number[][] = [];

  const firstRoundRows = await Promise.all(pairs.map(async ([a,b], idx) => {
    const row = await db.insert(bracketMatches).values({
      bracketId: Number(br.id),
      roundNumber: round,
      matchNumber: idx + 1,
      team1Id: a ? Number(a.teamId) : null,
      team2Id: b ? Number(b.teamId) : null,
    }).returning();
    return Number(row[0].id);
  }));
  roundMatchesIds.push(firstRoundRows);

  // Build subsequent rounds
  let current = firstRoundRows;
  while (current.length > 1) {
    round += 1;
    const next: number[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const row = await db.insert(bracketMatches).values({
        bracketId: br.id,
        roundNumber: round,
        matchNumber: i / 2 + 1,
      }).returning();
      const nextId = Number(row[0].id);
      next.push(nextId);

      await db.update(bracketMatches).set({ nextMatchId: nextId, slotInNext: 1 }).where(eq(bracketMatches.id, current[i]));
      if (current[i+1]) {
        await db.update(bracketMatches).set({ nextMatchId: nextId, slotInNext: 2 }).where(eq(bracketMatches.id, current[i+1]));
      }
    }
    roundMatchesIds.push(next);
    current = next;
  }

  // AFTER you've created & wired all rounds:
  await autoAdvanceByes(Number(br.id));
  return { bracketId: Number(br.id) };
}

export async function submitCornholeScore(matchId: number | string, team1Score: number, team2Score: number) {
  const mid = Number(matchId);
  const v = validateCornholeSubmission(team1Score, team2Score);
  if (!v.ok) {
    await db.update(bracketMatches)
      .set({ team1Score: v.corrected.team1Score, team2Score: v.corrected.team2Score })
      .where(eq(bracketMatches.id, mid));
    return { corrected: v.corrected } as const;
  }

  const [row] = await db.update(bracketMatches)
    .set({ team1Score, team2Score })
    .where(eq(bracketMatches.id, mid))
    .returning();

  const winnerTeamId = v.winner === 'team1' ? (row.team1Id ?? null) : v.winner === 'team2' ? (row.team2Id ?? null) : null;
  if (winnerTeamId && row.nextMatchId && row.slotInNext) {
    const nextField = row.slotInNext === 1 ? { team1Id: winnerTeamId } : { team2Id: winnerTeamId };
    await db.update(bracketMatches).set(nextField).where(eq(bracketMatches.id, Number(row.nextMatchId)));
    await db.update(bracketMatches).set({ winnerTeamId }).where(eq(bracketMatches.id, mid));
  }

  return { ok: true };
}

export async function swapFirstRoundTeams(matchIdA: number | string, slotA: 1|2, matchIdB: number | string, slotB: 1|2) {
  const aId = Number(matchIdA);
  const bId = Number(matchIdB);
  const [a] = await db.select().from(bracketMatches).where(eq(bracketMatches.id, aId));
  const [b] = await db.select().from(bracketMatches).where(eq(bracketMatches.id, bId));
  if (!a || !b) return { ok: false };

  const aTeam = slotA === 1 ? a.team1Id : a.team2Id;
  const bTeam = slotB === 1 ? b.team1Id : b.team2Id;

  await db.update(bracketMatches).set(slotA === 1 ? { team1Id: bTeam } : { team2Id: bTeam }).where(eq(bracketMatches.id, aId));
  await db.update(bracketMatches).set(slotB === 1 ? { team1Id: aTeam } : { team2Id: aTeam }).where(eq(bracketMatches.id, bId));

  return { ok: true };
}
export async function setBracketLock(bracketId: number | string, locked: boolean) {
  await db.update(brackets)
    .set({ isLocked: locked })
    .where(eq(brackets.id, Number(bracketId)));
  return { ok: true as const };
}