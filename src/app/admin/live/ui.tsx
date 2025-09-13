"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import GlassCard from "@/components/GlassCard";

import {
  setStatusAction,
  clearLiveAction,
  finishPastAction,
  resetFinishedAction,
} from "./actions";

type Row = {
  id: number;
  title: string;
  day: string;               // "YYYY-MM-DD"
  startTime: string | null;  // "HH:MM"
  locationLabel: string | null;
  status: "scheduled" | "live" | "paused" | "finished";
};

function dayTime(r: Row) {
  const d = new Date(r.day + "T12:00:00");
  const date = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${date}${r.startTime ? ` · ${r.startTime}` : ""}`;
}

/** Accent color per status (tints the soft blobs inside GlassCard) */
function statusAccent(s: Row["status"]) {
  switch (s) {
    case "live": return "var(--tw-color-team-red)";
    case "paused": return "#f59e0b";      // amber
    case "finished": return "#6b7280";    // gray
    default: return "rgba(0,0,0,0.12)";   // neutral
  }
}

/** Per-row dropdown that submits + closes */
function RowMenu({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-xl">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200 p-1"
      >
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Set Status</div>
        <div className="h-px bg-gray-200 my-1" />
        {(["scheduled", "live", "paused", "finished"] as const).map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={(ev) => {
              ev.preventDefault();
              (document.getElementById(`set-${id}-${status}`) as HTMLFormElement)?.requestSubmit();
              setOpen(false);
            }}
            className="capitalize"
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminLiveClient({ rows }: { rows: Row[] }) {
  const [bulkOpen, setBulkOpen] = useState(false);

  // Stable sort (day + time)
  const safeRows = [...rows].sort((a, b) => {
    const aKey = `${a.day} ${a.startTime ?? "99:99"}`;
    const bKey = `${b.day} ${b.startTime ?? "99:99"}`;
    return aKey.localeCompare(bKey);
  });

  return (
    <main className="p-4 space-y-4">
      {/* Header / toolbar in a glass card */}
      <GlassCard accent="rgba(0,0,0,0.12)" className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-display">Admin · Live Controls</h1>

          {/* Hidden bulk forms */}
          <form id="bulk-clear-live" action={clearLiveAction} className="hidden" />
          <form id="bulk-finish-past" action={finishPastAction} className="hidden" />
          <form id="bulk-reset-finished" action={resetFinishedAction} className="hidden" />

          {/* Bulk actions (auto-closes after submit) */}
          <DropdownMenu open={bulkOpen} onOpenChange={setBulkOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              collisionPadding={12}
              className="glass w-56 rounded-xl shadow-lg border border-black/5 p-1 z-50 max-h-[60vh] overflow-y-auto"
            >
              <div className="px-3 py-1.5 text-xs font-medium text-charcoal/60">Bulk Actions</div>
              <div className="h-px bg-black/10 my-1" />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  (document.getElementById("bulk-clear-live") as HTMLFormElement)?.requestSubmit();
                  setBulkOpen(false);
                }}
              >
                Clear Live
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  (document.getElementById("bulk-finish-past") as HTMLFormElement)?.requestSubmit();
                  setBulkOpen(false);
                }}
              >
                Finish All Past
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  (document.getElementById("bulk-reset-finished") as HTMLFormElement)?.requestSubmit();
                  setBulkOpen(false);
                }}
              >
                Reset Finished → Scheduled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GlassCard>

      {/* Rows list in a glass card */}
      <GlassCard accent="rgba(0,0,0,0.12)" className="p-4">
        {safeRows.length === 0 ? (
          <p className="text-sm opacity-70">No events found.</p>
        ) : (
          <ul className="space-y-3">
            {safeRows.map((e) => (
              <li key={e.id}>
                {/* Per-row hidden forms for status changes */}
                <form id={`set-${e.id}-scheduled`} action={setStatusAction} className="hidden">
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value="scheduled" />
                </form>
                <form id={`set-${e.id}-live`} action={setStatusAction} className="hidden">
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value="live" />
                </form>
                <form id={`set-${e.id}-paused`} action={setStatusAction} className="hidden">
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value="paused" />
                </form>
                <form id={`set-${e.id}-finished`} action={setStatusAction} className="hidden">
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value="finished" />
                </form>

                {/* Each row as its own glass card for perfect visual parity */}
                <GlassCard accent={statusAccent(e.status)} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm opacity-70 truncate">
                        {dayTime(e)} · {e.locationLabel ?? "On-site"}
                      </div>
                      <div className="font-medium truncate">{e.title}</div>
                      <div className="text-xs mt-1">Current: {e.status}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {e.status !== "live" ? (
                          <form action={setStatusAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="status" value="live" />
                            <Button
                              type="submit"
                              className={"inline-flex items-center gap-2 rounded-3xl px-3 py-1 text-sm font-semibold glass text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-black/10 bg-gradient-to-r from-blue-500/95 via-blue-600/95 to-indigo-600/95"}
                            >
                              Go Live
                            </Button>
                          </form>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-team-red text-white shadow-sm"
                          aria-disabled
                        >
                          Live
                        </span>
                      )}

                      <RowMenu id={e.id} />
                    </div>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </main>
  );
}
