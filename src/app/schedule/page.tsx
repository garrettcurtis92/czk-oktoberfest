// src/app/schedule/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Clock, MapPin, Trophy, Gamepad2, Utensils, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";


type EventRow = {
  id: number;
  title: string;
  day: string;               // "YYYY-MM-DD"
  startTime: string | null;  // "HH:MM"
  endTime: string | null;
  locationLabel: string | null;
  hostFamily?: string | null;
  description?: string | null;
  type: "game" | "dinner" | "social";
  status?: "scheduled" | "live" | "paused" | "finished";
};
/** ---------- UI-only additions (non-breaking) ---------- */
type PlacementScoring = {
  kind: "placement";
  first: number;
  second: number;
  third: number;
};

type UiEvent = EventRow & { scoring?: PlacementScoring };
/** ------------------------------------------------------ */

const typeColor: Record<EventRow["type"], string> = {
  game: "bg-team-blue text-white",
  dinner: "bg-team-orange text-white",
  social: "bg-team-green text-white",
};

const typeIcon: Record<EventRow["type"], React.JSX.Element> = {
  game: <Gamepad2 className="h-4 w-4" />,
  dinner: <Utensils className="h-4 w-4" />,
  social: <PartyPopper className="h-4 w-4" />,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const statusPill: Record<NonNullable<EventRow["status"]> | "scheduled", string> = {
  scheduled: "bg-white/60",
  live: "bg-team-red text-white",
  paused: "bg-yellow-300",
  finished: "bg-charcoal text-white",
};

function fmtTime(s?: string | null) {
  if (!s) return "";
  const [h, m] = s.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function fmtDayLabel(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function dateRange(rows: EventRow[]) {
  if (!rows.length) return "";
  const days = [...new Set(rows.map((r) => r.day))].sort();
  const first = new Date(days[0] + "T12:00:00");
  const last = new Date(days[days.length - 1] + "T12:00:00");
  const sameMonth = first.getMonth() === last.getMonth();
  const month = first.toLocaleString([], { month: "short" });
  const month2 = last.toLocaleString([], { month: "short" });
  const d1 = first.getDate();
  const d2 = last.getDate();
  return sameMonth ? `${month} ${d1}–${d2}` : `${month} ${d1} – ${month2} ${d2}`;
}

// date helper
function toDate(day: string, hm?: string | null) {
  const d = new Date(day + "T00:00:00");
  if (hm) {
    const [h, m] = hm.split(":").map(Number);
    d.setHours(h ?? 0, m ?? 0, 0, 0);
  }
  return d;
}

// Format "starts in" countdown like "1h 12m" or "7m"
function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}


function LiveProgress({ ev, tick }: { ev: EventRow; tick?: number }) {
  if (!ev.startTime || !ev.endTime) return null;

  const [sH, sM] = ev.startTime.split(":").map(Number);
  const [eH, eM] = ev.endTime.split(":").map(Number);

  const start = new Date(ev.day + "T00:00:00");
  start.setHours(sH || 0, sM || 0, 0, 0);
  const end = new Date(ev.day + "T00:00:00");
  end.setHours(eH || 0, eM || 0, 0, 0);

  const total = +end - +start;
  if (total <= 0) return null; // avoid divide-by-zero / bad data

  // Recomputed on every render; 'tick' ensures we re-render periodically.
  const now = Date.now();
  const pct = Math.min(100, Math.max(0, ((now - +start) / total) * 100));

  const barClass =
    ev.status === "paused"
      ? "h-full bg-yellow-400/80"
      : "h-full bg-team-red/70 transition-[width] duration-300";

  return (
    <div
      className="absolute left-0 right-0 top-0 h-1 bg-black/5"
      aria-label="Live progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div
        className={barClass}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function SchedulePage() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: EventRow[]) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

    // Derive UI rows (split combined events + add 3/2/1 placement scoring)
// Derive UI rows (split combined events + add 3/2/1 placement scoring)
const uiRows: UiEvent[] = useMemo(() => {
  const placement: PlacementScoring = { kind: "placement", first: 3, second: 2, third: 1 };

  const expanded = rows.flatMap<UiEvent>((r) => {
    // Costume Party → mark as Game with placement scoring
    if (/^costume party$/i.test(r.title)) {
      return [{ ...(r as UiEvent), type: "game", scoring: placement }];
    }

    // Cornhole & Ping-Pong combined → split into two Game rows
    if (/cornhole/i.test(r.title) && /ping[- ]?pong/i.test(r.title)) {
      const common: UiEvent = { ...(r as UiEvent), type: "game", scoring: placement };
      return [
        { ...common, id: Number(String(r.id) + "1"), title: "Cornhole" },
        { ...common, id: Number(String(r.id) + "2"), title: "Ping-Pong" },
      ];
    }

    // Default → just return the event unchanged
    return [r as UiEvent];
  });

  // NEW: ensure *all* games have placement scoring (3/2/1)
  return expanded.map((ev) =>
    ev.type === "game" && !ev.scoring
      ? { ...ev, scoring: placement }
      : ev
  );
}, [rows]);



  // sort by datetime
  // sort by datetime (use uiRows now)
const sorted = useMemo(() => {
  return [...uiRows].sort((a, b) => {
    const ta = toDate(a.day, a.startTime ?? "99:99").getTime();
    const tb = toDate(b.day, b.startTime ?? "99:99").getTime();
    return ta - tb;
  });
}, [uiRows]);



// group by day (UiEvent[])
const dayEntries = useMemo(() => {
  const daysMap = new Map<string, UiEvent[]>();
  for (const e of sorted) {
    daysMap.set(e.day, [...(daysMap.get(e.day) ?? []), e]);
  }
  return [...daysMap.entries()] as [string, UiEvent[]][];
}, [sorted]);


  // find live event (first match)
  const live = useMemo(() => sorted.find((e) => e.status === "live") ?? null, [sorted]);

  const upcoming = useMemo(() => {
  const now = Date.now();
  return (
    sorted
      .map((e) => ({ e, when: toDate(e.day, e.startTime ?? "23:59").getTime() }))
      .filter((x) => x.when > now)
      .sort((a, b) => a.when - b.when)[0]?.e ?? null
  );
}, [sorted]);
const nextCountdown = useMemo(() => {
  if (!upcoming) return "";
  const when = toDate(upcoming.day, upcoming.startTime ?? "00:00").getTime();
  return formatCountdown(when - Date.now());
}, [upcoming]);


const [shakeLiveId, setShakeLiveId] = useState<number | null>(null);
const liveId = live?.id ?? null;
useEffect(() => {
  if (liveId) {
    setShakeLiveId(liveId);
    const t = setTimeout(() => setShakeLiveId(null), 900);
    return () => clearTimeout(t);
  }
}, [liveId]);

// Tick for live progress updates
const [tick, setTick] = useState(0);
useEffect(() => {
  const id = setInterval(() => setTick((t) => t + 1), 5000); // Update every 5 seconds
  return () => clearInterval(id);
}, []);


  // active tab (prefer live day)
  const [activeDay, setActiveDay] = useState<string>("");
  useEffect(() => {
    if (dayEntries.length) {
      setActiveDay(live?.day ?? dayEntries[0][0]);
    }
  }, [live?.day, dayEntries]);

  // jump to an event (switch tab, then smooth scroll)
  const jumpTo = useCallback(
    (day: string, id: number) => {
      setActiveDay(day);
      setTimeout(() => {
        const el = document.getElementById(`event-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    },
    [setActiveDay]
  );

  if (loading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl p-8 text-center bg-white/70 backdrop-blur shadow">
          <h2 className="text-xl font-display mb-1">Romans 15:13</h2>
        </div>
      </main>
    );
  }

  if (dayEntries.length === 0) {
    return (
      <main className="p-6">
        <div className="rounded-2xl p-8 text-center bg-white/70 backdrop-blur shadow">
          <h2 className="text-xl font-display mb-1">No events yet</h2>
          <p className="opacity-70 text-sm">Admins can add events from the secret dashboard.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 space-y-4">
      <CoinStyles />
      {/* Hero */}
      <section className="rounded-3xl p-6 shadow bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur">
        <h1 className="text-3xl font-display tracking-tight">CZK Oktoberfest</h1>
        <p className="opacity-70">{dateRange(uiRows)} · On the Ranch</p>
        </section>

      {/* Now Playing chip */}
     {/* Live chip OR Next Up chip */}
{live ? (
  <div className="sticky top-[64px] z-10 -mx-4 px-4">
    <button
      onClick={() => jumpTo(live.day, live.id)}
      className={`mx-auto flex items-center gap-2 rounded-full text-white px-3 py-1.5 shadow ${
        live.status === "paused" ? "bg-yellow-500" : "bg-team-red"
      }`}
    >
      <span className="inline-block size-2 rounded-full bg-white animate-pulse" />
      <span className="text-sm font-medium">Now Playing:</span>
      <span className="text-sm font-semibold truncate max-w-[50vw]">{live.title}</span>
      {live.startTime && (
        <span className="text-xs opacity-90">
          · {live.startTime}
          {live.endTime ? `–${live.endTime}` : ""}
        </span>
      )}
    </button>
  </div>
) : upcoming ? (
  <div className="sticky top-[64px] z-10 -mx-4 px-4">
    <button
      onClick={() => jumpTo(upcoming.day, upcoming.id)}
      className="mx-auto flex items-center gap-2 rounded-full bg-team-blue text-white px-3 py-1.5 shadow"
    >
      <span className="inline-block size-2 rounded-full bg-white animate-pulse" />
      <span className="text-sm font-medium">Next Up:</span>
      <span className="text-sm font-semibold truncate max-w-[50vw]">{upcoming.title}</span>
      {upcoming.startTime && (
        <span className="text-xs opacity-90">· starts in {nextCountdown}</span>
      )}
    </button>
  </div>
) : null}


      {/* Tabs */}
      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-sand/80 backdrop-blur">
        <div className="rounded-2xl p-2 bg-white/60 backdrop-blur shadow">
          <Tabs value={activeDay} onValueChange={setActiveDay} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
              {dayEntries.map(([day]) => (
                <TabsTrigger key={day} value={day} className="text-xs md:text-sm" data-value={day}>
                  {fmtDayLabel(day)}
                </TabsTrigger>
              ))}
            </TabsList>

            {dayEntries.map(([day, items]) => (
              <TabsContent key={day} value={day} className="mt-4 space-y-3">
                {items
  .sort((a, b) => (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99"))
  .map((ev, i) => (
    <motion.div
      key={ev.id}
      initial={{ opacity: 0, y: 8 }}
      animate={
        ev.id === shakeLiveId
          ? { x: [0, -4, 4, -3, 3, -2, 2, 0], opacity: 1, y: 0 }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: ev.id === shakeLiveId ? 0.6 : 0.15, delay: i * 0.03 }}
    >
      <EventCard ev={ev} tick={tick} />
    </motion.div>
  ))}

              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </main>
  );
}
function Coin({
  children,
  tone = "gold",
  className = "",
}: {
  children: React.ReactNode; // the number
  tone?: "gold" | "silver" | "bronze";
  className?: string;
}) {
  const tones = {
    gold:
      "from-yellow-200 via-amber-300 to-amber-500 text-amber-900 ring-amber-400/60 shadow-amber-900/10",
    silver:
      "from-zinc-100 via-zinc-300 to-zinc-500 text-zinc-900 ring-zinc-400/60 shadow-zinc-900/10",
    bronze:
      "from-amber-200 via-orange-300 to-orange-600 text-orange-950 ring-orange-500/60 shadow-orange-900/10",
  } as const;

  return (
    <span
      aria-hidden
      className={[
        // coin base
        "inline-grid place-items-center size-6 rounded-full",
        "bg-gradient-to-br shadow-sm ring-1",
        // subtle emboss/shine
        "shadow-inner",
        tones[tone],
        className,
      ].join(" ")}
    >
      <span className="text-[11px] font-extrabold leading-none">{children}</span>
    </span>
  );
}
function CoinStyles() {
  return (
    <style jsx global>{`
      /* Shimmer sweep for the gold coin */
      .coin-shimmer {
        position: relative;
        overflow: hidden;
        /* keep coin shape tight */
        border-radius: 9999px;
        isolation: isolate;
      }
      .coin-shimmer::after {
        content: "";
        position: absolute;
        inset: -30%;
        /* diagonal sweep highlight */
        background: linear-gradient(
          120deg,
          transparent 45%,
          rgba(255, 255, 255, 0.6) 50%,
          transparent 55%
        );
        transform: translateX(-160%);
        animation: coinShimmer 2.2s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }

      @keyframes coinShimmer {
        to {
          transform: translateX(160%);
        }
      }

      /* Respect reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .coin-shimmer::after {
          animation: none;
        }
      }
    `}</style>
  );
}


function EventCard({ ev, tick }: { ev: UiEvent; tick?: number }) {
  const isLive = ev.status === "live";
  return (
    <div
      id={`event-${ev.id}`}
      className={cn(
        "rounded-2xl p-4 bg-white/80 backdrop-blur shadow relative overflow-hidden",
        isLive && "ring-2 ring-team-red/70"
      )}
    >
      {isLive && <LiveProgress ev={ev} tick={tick} />}

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Badge className={`gap-1 ${typeColor[ev.type]}`}>
              {typeIcon[ev.type]}
              <span className="capitalize">{ev.type}</span>
            </Badge>
            {ev.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusPill[ev.status]}`}>
                {ev.status}
              </span>
            )}
          </div>

          <h3 className="text-lg font-display leading-tight">{ev.title}</h3>

          <div className="flex flex-wrap items-center gap-2.5 text-sm opacity-80">
            {ev.startTime && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
                <Clock className="h-3.5 w-3.5" />
                {fmtTime(ev.startTime)}
                {ev.endTime ? `–${fmtTime(ev.endTime)}` : ""}
              </span>
            )}
            {ev.locationLabel && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
                <MapPin className="h-3.5 w-3.5" />
                {ev.locationLabel}
              </span>
            )}
            {ev.type === "game" && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-white/70">
                <Trophy className="h-3.5 w-3.5" />
                {/* Screen-reader label so the visuals are accessible */}
                <span className="sr-only">
                  Scoring: first {ev.scoring?.first ?? 3} points, second {ev.scoring?.second ?? 2} points, third {ev.scoring?.third ?? 1} point.
                </span>

                {/* Coins */}
                <span className="flex items-center gap-1.5" aria-hidden>
                  <Coin tone="gold" className={isLive ? "coin-shimmer" : ""}>
        {ev.scoring?.first ?? 3}
      </Coin>
                  <Coin tone="silver">{ev.scoring?.second ?? 2}</Coin>
                  <Coin tone="bronze">{ev.scoring?.third ?? 1}</Coin>
                </span>
              </span>
            )}
            {ev.hostFamily && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
                Host: {ev.hostFamily}
              </span>
            )}
          </div>

          {ev.description && (
            <p className="text-sm opacity-90 leading-relaxed pt-1">{ev.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
