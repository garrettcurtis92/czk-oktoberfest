// src/app/teams/[color]/page.tsx
import Image from "next/image";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import { MemberCard } from "@/components/MemberCard";
import { getRoster, ROSTERS } from "@/lib/rosters";
import { notFound } from "next/navigation";
import { getMemberImage } from "@/lib/member-images";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  return ROSTERS.map(r => ({ color: r.color }));
}

export default async function TeamDetailPage({ params }: { params: Promise<unknown> }) {
  const resolved = await params;
  const color = (resolved as { color?: string })?.color;
  const roster = color ? getRoster(color) : undefined;
  if (!roster) return notFound();
  const teamVar = `var(--tw-color-team-${roster.color})`;
  // Use static roster order; images resolved via static mapping (no fs at runtime).
  const mergedMembers = roster.members;

  return (
    <main className="p-4 space-y-6">
      <section className="relative rounded-3xl p-8 shadow bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md overflow-hidden border border-white/20 dark:border-gray-700/30">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl" style={{ background: teamVar, opacity: 0.25 }} />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-3xl" style={{ background: teamVar, opacity: 0.18 }} />
        <div className="absolute left-4 top-4">
          <Link href="/" className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur hover:bg-white/90 dark:hover:bg-white/20 transition">← Home</Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight text-center" style={{ color: teamVar }}>
          {roster.teamName} Team
        </h1>
        <p className="mt-2 text-center text-sm md:text-base text-charcoal/70 dark:text-white/70">Captain & roster</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <CaptainCard roster={roster} />
        {mergedMembers.map(m => (
          <MemberCard key={m} color={roster.color} name={m} image={getMemberImage(roster.color, m)} />
        ))}
      </div>
    </main>
  );
}

function CaptainCard({ roster }: { roster: ReturnType<typeof getRoster> }) {
  if (!roster) return null;
  const teamVar = `var(--tw-color-team-${roster.color})`;
  return (
    <GlassCard accent={teamVar}>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 rounded-3xl overflow-hidden border border-white/30 dark:border-white/10">
          <Image src={roster.captainImage} alt={roster.captain} fill sizes="96px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-tight">Captain</h2>
          <p className="text-sm opacity-80 truncate">{roster.captain}</p>
        </div>
      </div>
    </GlassCard>
  );
}

// MemberCard moved to client component in @/components/MemberCard
