"use client";
import { useEffect, useMemo, useState } from "react";

export type NowPlayingProps = {
  title: string;
  location?: string | null;
  // ISO strings preferred; but we’ll accept day + HH:MM strings:
  day: string;          // "YYYY-MM-DD"
  startTime?: string | null; // "HH:MM"
  endTime?: string | null;   // "HH:MM"
};

function toDate(day: string, hm?: string | null) {
  if (!hm) return new Date(day + "T12:00:00");
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(day + "T00:00:00");
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

export default function NowPlayingBanner(props: NowPlayingProps) {
  const start = useMemo(() => toDate(props.day, props.startTime), [props.day, props.startTime]);
  const end = useMemo(() => toDate(props.day, props.endTime), [props.day, props.endTime]);
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, end.getTime() - now.getTime());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  const live = now >= start && now <= end;
  const statusText = live ? `Ends in ${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : "Live";

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-r from-team-purple/80 via-team-blue/70 to-team-green/70 text-white shadow">
      <div className="text-sm opacity-90">Now Playing</div>
      <div className="text-xl font-display leading-tight">{props.title}</div>
      <div className="text-sm opacity-90">
        {props.location ?? "On-site"} · {statusText}
      </div>
    </div>
  );
}
