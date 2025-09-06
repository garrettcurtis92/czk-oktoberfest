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
  basePoints: number;
  status?: "scheduled" | "live" | "paused" | "finished";
};

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


function LiveProgress({ ev }: { ev: EventRow }) {
  if (!ev.startTime || !ev.endTime) return null;
  const [startH, startM] = ev.startTime.split(":").map(Number);
  const [endH, endM] = ev.endTime.split(":").map(Number);
  const start = new Date(ev.day + "T00:00:00");
  start.setHours(startH || 0, startM || 0, 0, 0);
  const end = new Date(ev.day + "T00:00:00");
  end.setHours(endH || 0, endM || 0, 0, 0);

  const now = Date.now();
  const pct = Math.min(100, Math.max(0, ((now - +start) / (+end - +start)) * 100));

  return (
    <div className="absolute left-0 right-0 top-0 h-1 bg-black/5">
      <div className="h-full bg-team-red/70 transition-[width]" style={{ width: `${pct}%` }} />
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

  // sort by datetime
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = toDate(a.day, a.startTime ?? "99:99").getTime();
      const tb = toDate(b.day, b.startTime ?? "99:99").getTime();
      return ta - tb;
    });
  }, [rows]);

  // group by day
  const dayEntries = useMemo(() => {
    const daysMap = new Map<string, EventRow[]>();
    for (const e of sorted) {
      daysMap.set(e.day, [...(daysMap.get(e.day) ?? []), e]);
    }
    return [...daysMap.entries()] as [string, EventRow[]][];
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
          <h2 className="text-xl font-display mb-1">Loading events...</h2>
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
      {/* Hero */}
      <section className="rounded-3xl p-6 shadow bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur">
        <h1 className="text-3xl font-display tracking-tight">CZK Oktoberfest</h1>
        <p className="opacity-70">{dateRange(rows)} · On the Ranch</p>
      </section>

      {/* Now Playing chip */}
     {/* Live chip OR Next Up chip */}
{live ? (
  <div className="sticky top-[64px] z-10 -mx-4 px-4">
    <button
      onClick={() => jumpTo(live.day, live.id)}
      className="mx-auto flex items-center gap-2 rounded-full bg-team-red text-white px-3 py-1.5 shadow"
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
      <EventCard ev={ev} />
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

function EventCard({ ev }: { ev: EventRow }) {
  const isLive = ev.status === "live";
  return (
    <div
      id={`event-${ev.id}`}
      className={cn(
        "rounded-2xl p-4 bg-white/80 backdrop-blur shadow relative overflow-hidden",
        isLive && "ring-2 ring-team-red/70"
      )}
    >
      {isLive && <LiveProgress ev={ev} />}

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

          <div className="flex flex-wrap items-center gap-2 text-sm opacity-80">
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
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-white/70">
                <Trophy className="h-3.5 w-3.5" />
                Base {ev.basePoints}
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
