"use client";

import * as React from "react";
import { addScoreAction, deleteScoreAction } from "./actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";

type Team = { id: number; name: string; color: "red"|"orange"|"yellow"|"green"|"blue"|"purple" };
type Event = { id: number; title: string; day: string; startTime: string | null };
type ScoreRow = { id: number; eventId: number; teamId: number; points: number; note: string | null; createdAt?: string };

function dayLabel(e: Event) {
  const d = new Date(e.day + "T12:00:00");
  const ds = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${ds}${e.startTime ? " · " + e.startTime : ""}`;
}

export default function AdminScoreClient({
  events,
  teams,
  recent,
}: {
  events: Event[];
  teams: Team[];
  recent: ScoreRow[];
}) {
  const [eventId, setEventId] = React.useState<string>(events[0]?.id?.toString() ?? "");
  const [teamId, setTeamId] = React.useState<string>(teams[0]?.id?.toString() ?? "");
  const [points, setPoints] = React.useState<string>("10");
  const [note, setNote] = React.useState("");

  const evtMap = new Map(events.map((e) => [e.id, e]));
  const teamMap = new Map(teams.map((t) => [t.id, t]));

    return (
  <main className="p-4 space-y-4">
    <h1 className="text-2xl font-display">Admin · Scoring</h1>

    {/* Add Points (accent follows selected team) */}
    <GlassCard
      accent={`var(--tw-color-team-${
        teams.find((t) => t.id === Number(teamId))?.color ?? "blue"
      })`}
      className="p-5"
    >
      <form action={addScoreAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Event select (truncate long labels) */}
        <div className="sm:col-span-1 min-w-0">
          <label className="text-sm opacity-70">Event</label>
          <input type="hidden" name="eventId" value={eventId} />
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger className="mt-1 w-full max-w-full sm:max-w-[320px] rounded-xl border border-white/20 dark:border-gray-700/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md px-3 py-2 shadow-sm overflow-hidden">
              <span className="block w-full overflow-hidden whitespace-nowrap truncate">
                <SelectValue placeholder="Select event" />
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200">
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id.toString()}>
                  {dayLabel(e)} — {e.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team select */}
        <div className="sm:col-span-1 min-w-0">
          <label className="text-sm opacity-70">Team</label>
          <input type="hidden" name="teamId" value={teamId} />
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger className="mt-1 w-full sm:max-w-[240px] rounded-xl border border-white/20 dark:border-gray-700/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md px-3 py-2 shadow-sm">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200">
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span
                      className="size-3 rounded-full ring-2 ring-white/80"
                      style={{ background: `var(--tw-color-team-${t.color})` }}
                    />
                    <span className="truncate">{t.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Points */}
        <div className="sm:col-span-1">
          <label className="text-sm opacity-70">Points</label>
          <Input
            name="points"
            type="number"
            inputMode="numeric"
            className="mt-1 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md border-white/20 dark:border-gray-700/30"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min={-1000}
            max={1000}
            required
          />
        </div>

        {/* Note */}
        <div className="sm:col-span-1">
          <label className="text-sm opacity-70">Note (optional)</label>
          <Textarea
            name="note"
            className="mt-1 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 dark:from-gray-900/20 dark:via-gray-800/10 dark:to-gray-700/5 backdrop-blur-md border-white/20 dark:border-gray-700/30"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Cornhole finals"
            maxLength={200}
          />
        </div>

        {/* Submit */}
        <div className="sm:col-span-2">
          {(() => {
            const teamColor = teams.find((t) => t.id === Number(teamId))?.color ?? "blue";
            return (
              <button
                type="submit"
                style={{ background: `var(--tw-color-team-${teamColor})` }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-white px-4 py-2 font-semibold shadow hover:opacity-90 transition"
              >
                <span aria-hidden>➕</span>
                <span>Add Points</span>
              </button>
            );
          })()}
        </div>
      </form>
    </GlassCard>

    {/* Recent Scores (neutral accent) */}
    <GlassCard accent="rgba(0,0,0,0.12)" className="p-5">
      <h2 className="text-lg font-display mb-3">Recent Scores</h2>

      {recent.length === 0 ? (
        <p className="text-sm opacity-70">No scores yet.</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((s) => {
            const e = evtMap.get(s.eventId);
            const t = teamMap.get(s.teamId);
            const colorVar = t ? `var(--tw-color-team-${t.color})` : "var(--tw-color-team-blue)";
            return (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-3"
              >
                <div className="text-sm min-w-0">
                  <div className="font-medium truncate">
                    {s.points >= 0 ? "+" : ""}
                    {s.points} <span className="opacity-70">to</span>{" "}
                    {t ? (
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <span className="size-2.5 rounded-full ring-2 ring-white/80" style={{ background: colorVar }} />
                        <span className="truncate">{t.name}</span>
                      </span>
                    ) : (
                      "Team"
                    )}
                  </div>
                  <div className="opacity-70 truncate">
                    {e ? `${dayLabel(e)} — ${e.title}` : "Event"}
                    {s.note ? ` · ${s.note}` : ""}
                  </div>
                </div>
                <form action={deleteScoreAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <Button type="submit" variant="outline" className="rounded-xl">
                    Undo
                  </Button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  </main>
);
}
