// src/db/seed.ts
// 1) Explicitly load .env.local to ensure env vars are available
import dotenv from "dotenv";
import path from "path";
import { eq } from "drizzle-orm";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// 2) Map DATABASE_URL -> POSTGRES_URL before importing the DB (helps Vercel/Supabase setups)
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_URL_NON_POOLING && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_PRISMA_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL;
}

// ---- Utilities for bracket building ----
function nextPowerOfTwo(n: number) { let p = 1; while (p < n) p <<= 1; return p; }
function generateOrder(size: number): number[] {
  // canonical single‑elim ordering (1 vs size, 2 vs size-1, ... in a balanced tree)
  if (size === 2) return [1, 2];
  const prev = generateOrder(size / 2);
  const mirrored = prev.map((x) => size + 1 - x);
  return [...prev, ...mirrored];
}

type Seed = { teamId: number; seed: number };
function buildFirstRoundPairs(seeds: Seed[]) {
  const n = seeds.length;
  const size = nextPowerOfTwo(n);
  const ordered = [...seeds].sort((a, b) => a.seed - b.seed); // 1..N
  const order = generateOrder(size);

  const slots: (Seed | null)[] = Array(size).fill(null);
  ordered.forEach((s, idx) => { slots[order[idx] - 1] = s; });

  const pairs: [Seed | null, Seed | null][] = [];
  for (let i = 0; i < size; i += 2) pairs.push([slots[i], slots[i + 1]]);
  return { pairs, size };
}

// Cornhole scoring helper (for completeness if you want to simulate scores later)
function normalizeCornholeScore(s: number) { return s > 21 ? 11 : s; }

// 3) Import DB after envs are set and run within an async IIFE
(async () => {
  const { db } = await import("./index");
  // IMPORTANT: import the **new** schema tables
  const { teams, brackets, bracketSeeds, bracketMatches } = await import("./schema");

  // ⚙️ Choose the event this bracket belongs to.
  // If you already have an event row for Cornhole, set its id here.
  // You can also read from process.env for flexibility.
  const EVENT_ID = Number(process.env.SEED_CORNHOLE_EVENT_ID ?? 1); // <-- adjust if needed

  async function seedCornholeBracketFromStandings() {
    // Load teams. If you have a real standings query, replace sort accordingly.
    const allTeams = await db.select().from(teams);
    if (allTeams.length === 0) {
      console.log("No teams found — aborting bracket seed.");
      return;
    }

    // Deterministic seeding: sort by name asc (replace with: points desc, name asc if you track points)
    const orderedTeams = [...allTeams].sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
    const seeds: Seed[] = orderedTeams.map((t: any, i: number) => ({ teamId: t.id as number, seed: i + 1 }));

    // Create bracket container
    const [br] = await db
      .insert(brackets)
      .values({ eventId: EVENT_ID, game: "cornhole", createdBy: "seed-script" })
      .returning();

    // Insert seeding rows
    await db.insert(bracketSeeds).values(
      seeds.map((s) => ({ bracketId: br.id as number, teamId: s.teamId, seedNumber: s.seed }))
    );

    // Build first round pairs (includes byes if seeds count not power of two)
    const { pairs } = buildFirstRoundPairs(seeds);

    // Insert first round matches
    const firstRoundIds: number[] = [];
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      const inserted = await db
        .insert(bracketMatches)
        .values({
          bracketId: br.id as number,
          roundNumber: 1,
          matchNumber: i + 1,
          team1Id: a ? (a.teamId as number) : null,
          team2Id: b ? (b.teamId as number) : null,
        })
        .returning();
      firstRoundIds.push(inserted[0].id as number);
    }

    // Build subsequent rounds and wire nextMatch/slotInNext
    let current = firstRoundIds;
    let round = 1;
    while (current.length > 1) {
      round += 1;
      const next: number[] = [];
      for (let i = 0; i < current.length; i += 2) {
        const row = await db
          .insert(bracketMatches)
          .values({
            bracketId: br.id as number,
            roundNumber: round,
            matchNumber: i / 2 + 1,
          })
          .returning();
        const nextId = row[0].id as number;
        next.push(nextId);

        // wire winners from current[i] and current[i+1]
        await db
          .update(bracketMatches)
          .set({ nextMatchId: nextId, slotInNext: 1 })
          .where(eq(bracketMatches.id, current[i]));

        if (current[i + 1] !== undefined) {
          await db
            .update(bracketMatches)
            .set({ nextMatchId: nextId, slotInNext: 2 })
            .where(eq(bracketMatches.id, current[i + 1]));
        }
      }
      current = next;
    }

    console.log(`Cornhole bracket created (bracket_id=${br.id}) with ${pairs.length} first‑round matches.`);
  }

  await seedCornholeBracketFromStandings();
  console.log("✅ Brackets seeded using new schema!");
})();
