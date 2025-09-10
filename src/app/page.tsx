// src/app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;


import { db } from "@/db";
import { sql } from "drizzle-orm";
import Image from "next/image";

import ColorChips from "@/components/ColorChips";



/** DB rows */
type TeamRow = {
  id: number;
  name: string;
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
};

/** Captain directory (by team color) */
const CAPTAINS: Record<
  TeamRow["color"],
  { name: string; slug: string; img: string }
> = {
  red:    { name: "Mandi Kelly",          slug: "mandi-kelly",          img: "/captains/mandi-kelly.jpg" },
  orange: { name: "Tim Zanotelli",        slug: "tim-zanotelli",        img: "/captains/tim-zanotelli.jpg" },
  yellow: { name: "Dalton Kelly",         slug: "dalton-kelly",         img: "/captains/dalton-kelly.jpg" },
  green:  { name: "Luke Kelly",           slug: "luke-kelly",           img: "/captains/luke-kelly.jpg" },
  blue:   { name: "Amaryllis Zanotelli",  slug: "amaryllis-zanotelli",  img: "/captains/amaryllis-zanotelli.jpg" },
  purple: { name: "Lexie Curtis",         slug: "lexie-curtis",         img: "/captains/lexie-curtis.jpg" },
};

/** Small helper to render a team color chip using your CSS variables */
function TeamDot({ color }: { color: TeamRow["color"] }) {
  return (
    <span
      className="inline-block size-3 rounded-full"
      style={{ background: `var(--tw-color-team-${color})` }}
      aria-hidden
    />
  );
}

export default async function Home() {
  // Pull all teams (alphabetical by name for now)
  const { rows } = await db.execute(sql`
    SELECT id, name, color
    FROM teams
    ORDER BY name ASC;
  `);
  const teams = rows as TeamRow[];

  return (
    <main className="p-4 space-y-4">
      
{/* Team Captains hero */}
<section className="relative rounded-3xl p-8 shadow bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur overflow-hidden">
  {/* subtle blobs */}
  <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
  <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />

  <h1 className="text-3xl md:text-4xl font-display tracking-tight text-center">
    Team Captains!
  </h1>
  <p className="mt-2 text-center text-sm md:text-base text-charcoal/70">
    Meet the leaders, rally your squad, and get ready to compete.
  </p>

  {/* Team color chips */}
  <ColorChips
    overflow-visible
    colors={["#F39B2B", "#F3D23B", "#36B37E", "#2F80ED", "#E45757", "#8C59D9"]}
    label="Team colors: Blue, Orange, Green, Red"
  />

  <div className="mt-6 flex justify-center gap-3">
    <a
      href="/teams"
      className="rounded-xl px-4 py-2 text-sm font-medium bg-charcoal text-white hover:opacity-95 transition"
    >
      View Teams
    </a>
    <a
      href="/leaderboard"
      className="rounded-xl px-4 py-2 text-sm font-medium border border-charcoal/20 hover:bg-black/5 transition"
    >
      Leaderboard
    </a>
  </div>

  {/* Confetti (fires once when the page loads) */}
  
</section>


      {/* Teams (glassy cards like Schedule) */}
      <section className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
        <div className="mb-3 flex items-baseline justify-between">
        </div>

        {teams.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-sm opacity-80">
            No teams found yet. Seed or add teams to see them here.
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((t) => (
              <li key={t.id}>
                <TeamCard team={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/** Team card with frosted look + captain photo/name */
function TeamCard({ team }: { team: TeamRow }) {
  const captain = CAPTAINS[team.color];

  return (
    <div className="rounded-2xl p-4 bg-white/80 backdrop-blur shadow relative overflow-hidden">
      {/* subtle ribbon accent that uses the team color */}
      <div
        className="absolute -right-6 -top-6 h-16 w-16 rotate-12 opacity-20"
        style={{ background: `var(--tw-color-team-${team.color})` }}
        aria-hidden
      />

      <div className="flex items-start gap-3">
        {/* Captain photo placeholder (drop images in /public/captains/*.jpg) */}
        <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-black/10 bg-white/70">
          <Image
            src={captain.img}
            alt={`${captain.name} — ${team.name} captain`}
            fill
            className="object-cover"
            sizes="64px"
            priority={false}
          />
        </div>

        {/* Textual content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TeamDot color={team.color} />
            <h3 className="font-medium leading-tight truncate">{team.name}</h3>
          </div>

          {/* Captain line */}
          <p className="mt-1 text-sm">
            <span className="opacity-70">Team Captain:</span> {captain.name}
          </p>

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
              <span className="opacity-70">Color</span>
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: `var(--tw-color-team-${team.color})` }}
                aria-hidden
              />
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
              Roster: <span className="opacity-70">add later</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
