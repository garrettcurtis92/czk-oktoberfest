// src/app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;


import { db } from "@/db";
import { sql } from "drizzle-orm";
import Image from "next/image";
import CaptainCard from "@/components/CaptainsCard";

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
  const teamVar = `var(--tw-color-team-${team.color})`;

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl p-5",
        // glassy gradient + blur (matches hero)
        "bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur",
        // soft border + elevation
        "border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
        // hover/focus polish
        "transition hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] focus-within:ring-2 focus-within:ring-black/10",
      ].join(" ")}
    >
      {/* decorative blobs tinted to team color (kept separate from content) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-16 -right-14 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `color-mix(in oklab, ${teamVar} 25%, transparent)` }}
          aria-hidden
        />
        <div
          className="absolute -bottom-16 -left-14 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `color-mix(in oklab, ${teamVar} 15%, transparent)` }}
          aria-hidden
        />
      </div>

      {/* content layer */}
      <div className="relative z-10 flex items-start gap-4">
        {/* avatar frame (glassy) */}
        <div
          className="relative grid place-items-center h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-white/70 bg-white/70 backdrop-blur"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
        >
          <Image
            src={captain.img}
            alt={`${captain.name} — ${team.name} captain`}
            fill
            sizes="64px"
            className="object-cover"
            priority={false}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* header: team pill + name */}
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/80"
              style={{ background: teamVar }}
              aria-hidden
            />
            <h3 className="font-display text-lg leading-tight truncate">{team.name}</h3>
          </div>

          {/* captain line */}
          <p className="mt-1 text-sm">
            <span className="opacity-70">Team Captain:</span> {captain.name}
          </p>

          {/* meta chips */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
              <span className="opacity-70">Color</span>
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: teamVar }}
                aria-hidden
              />
            </span>
            {/* placeholder for roster/cta */}
            <a
              href={`/teams/${team.color}`}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 border border-black/10 bg-white/60 hover:bg-white/80 transition"
            >
              View team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}