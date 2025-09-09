
// src/db/seed.ts
// 1) Explicitly load .env.local to ensure env vars are available
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// 2) Load envs and map DATABASE_URL -> POSTGRES_URL *before* importing the DB.

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}
// Optional (harmless) extras used by some setups/tools:
if (!process.env.POSTGRES_URL_NON_POOLING && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL;
}
if (!process.env.POSTGRES_PRISMA_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL;
}

// 2) Now import the DB (envs are ready) and run everything in an async IIFE
(async () => {
  const { db } = await import("./index");
  const { teams, brackets, bracketTeams, matches } = await import("./schema");

  // --- Seed function (same logic as before) ---
  async function seedBrackets() {
    // get some teams
    const allTeams = await db.select().from(teams);
    const entrants = allTeams.slice(0, 8); // adjust if you have fewer/more

    // create bracket
    const [b] = await db
      .insert(brackets)
      .values({ title: "Cornhole Bracket", format: "single_elim" })
      .returning();

    // seed entries with seeds 1..N
    for (let i = 0; i < entrants.length; i++) {
      await db.insert(bracketTeams).values({
        bracketId: b.id,
        teamId: entrants[i].id,
        seed: i + 1,
      });
    }

    // Round 1 pairings: 1vN, 2vN-1, ...
    const N = entrants.length;
    const seedMap = new Map<number, number>();
    entrants.forEach((t, idx) => seedMap.set(idx + 1, t.id));

    let pos = 1;
    for (let i = 1; i <= N / 2; i++) {
      await db.insert(matches).values({
        bracketId: b.id,
        round: 1,
        position: pos++,
        teamAId: seedMap.get(i)!,
        teamBId: seedMap.get(N - i + 1)!,
      });
    }
  }

  await seedBrackets();
  console.log("Brackets seeded!");
})();
// (removed duplicate and misplaced code)

