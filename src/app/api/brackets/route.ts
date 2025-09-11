// src/app/api/brackets/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { brackets, bracketMatches, teams } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventIdStr = searchParams.get('eventId');
  const game = searchParams.get('game');

  if (!eventIdStr || !game) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 });
  }

  const eventId = Number(eventIdStr);

  // Find the bracket for this event/game
  const br = await db
    .select()
    .from(brackets)
    .where(and(eq(brackets.eventId, eventId), eq(brackets.game, game)))
    .limit(1);

  if (br.length === 0) {
    return NextResponse.json({ rounds: [] });
  }

  const bracketId = br[0].id as number;

  // Load matches for the bracket
  const m = await db
    .select()
    .from(bracketMatches)
    .where(eq(bracketMatches.bracketId, bracketId));

  // Collect team ids we need to resolve
  const ids: number[] = [];
  for (const row of m) {
    if (row.team1Id) ids.push(row.team1Id);
    if (row.team2Id) ids.push(row.team2Id);
  }

  // Resolve team names in a single query
  const teamMap = new Map<number, { id: number; name: string }>();
  if (ids.length > 0) {
    const uniqueIds = Array.from(new Set(ids));
    const trows = await db.select().from(teams).where(inArray(teams.id, uniqueIds));
    for (const t of trows) teamMap.set(t.id as number, { id: t.id as number, name: t.name as string });
  }

  // Group matches by roundNumber, and order by matchNumber
  const byRound = new Map<number, any[]>();
  for (const row of m) {
    const item = {
      ...row,
      team1: row.team1Id ? teamMap.get(row.team1Id) ?? null : null,
      team2: row.team2Id ? teamMap.get(row.team2Id) ?? null : null,
    };
    const arr = byRound.get(row.roundNumber) ?? [];
    arr.push(item);
    byRound.set(row.roundNumber, arr);
  }

  const rounds = Array.from(byRound.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, arr]) => arr.sort((a, b) => a.matchNumber - b.matchNumber));

  return NextResponse.json({ bracketId, rounds });
}
