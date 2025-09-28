// src/app/teams/page.tsx
import Image from "next/image";
import GlassCard from "@/components/GlassCard";
import { ROSTERS } from "@/lib/rosters";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Use shared roster data

export default function TeamsPage() {
  return (
    <main className="p-4 space-y-6">
      <section className="relative rounded-3xl p-8 shadow bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md overflow-hidden border border-white/20 dark:border-gray-700/30">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute left-4 top-4">
          <Link href="/" className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur hover:bg-white/90 dark:hover:bg-white/20 transition">
            ← Back
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight text-center">Teams</h1>
        <p className="mt-2 text-center text-sm md:text-base text-charcoal/70 dark:text-white/70 max-w-xl mx-auto">
          Browse each team, meet the captain, and see the roster. More dynamic stats will appear here later.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {ROSTERS.map(team => (
          <TeamCard key={team.color} team={{
            color: team.color,
            teamName: team.teamName,
            captain: team.captain,
            members: team.members,
            img: team.captainImage,
          }} />
        ))}
      </section>
    </main>
  );
}

function TeamCard({ team }: { team: { color: string; teamName: string; captain: string; members: string[]; img: string } }) {
  const teamVar = `var(--tw-color-team-${team.color})`;
  return (
    <GlassCard accent={teamVar}>
      <div className="flex items-start gap-5">
        <div
          className="relative h-20 w-20 shrink-0 rounded-3xl overflow-hidden border border-white/20 dark:border-gray-700/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur"
        >
          <Image
            src={team.img}
            alt={`${team.captain} — ${team.teamName} captain`}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white/80" style={{ background: teamVar }} />
            <h2 className="font-display text-xl leading-tight truncate">{team.teamName} Team</h2>
          </div>
          <div>
            <p className="text-sm font-medium"><span className="opacity-60">Captain:</span> {team.captain}</p>
            <p className="text-xs mt-1 opacity-70">Roster</p>
            <ul className="mt-1 flex flex-wrap gap-1.5 text-xs">
              {team.members.map(m => (
                <li key={m} className="px-2 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-sm">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
