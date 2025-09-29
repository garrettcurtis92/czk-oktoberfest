"use client";

import React, { useState, useRef } from "react";
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
  createEventAction,
  updateEventAction,
} from "./actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

/** Unified per-row menu: Edit + statuses */
function RowMenu({ id, onEdit, currentStatus }: { id: number; onEdit: () => void; currentStatus: Row["status"] }) {
  const [open, setOpen] = useState(false);
  const statuses: Row["status"][] = ["scheduled", "live", "paused", "finished"];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-xl">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200 p-1 w-48">
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Event Actions</div>
        <div className="h-px bg-gray-200 my-1" />
        <DropdownMenuItem
          onSelect={(e) => { e.preventDefault(); onEdit(); setOpen(false); }}
          className="flex items-center justify-between"
        >
          Edit<span className="text-xs opacity-60">⌘E</span>
        </DropdownMenuItem>
        <div className="h-px bg-gray-200 my-1" />
        {statuses.map((s) => (
          <DropdownMenuItem
            key={s}
            disabled={s === currentStatus}
            onSelect={(e) => { e.preventDefault(); (document.getElementById(`set-${id}-${s}`) as HTMLFormElement)?.requestSubmit(); setOpen(false); }}
            className="flex items-center justify-between capitalize"
          >
            <span>{s}</span>
            {s === currentStatus && <span className="text-xs opacity-60">●</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminLiveClient({ rows }: { rows: Row[] }) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const createDetailsRef = useRef<HTMLDetailsElement | null>(null);

  // Stable sort (day + time)
  const safeRows = [...rows].sort((a, b) => {
    const aKey = `${a.day} ${a.startTime ?? "99:99"}`;
    const bKey = `${b.day} ${b.startTime ?? "99:99"}`;
    return aKey.localeCompare(bKey);
  });

  const _editing = editId != null ? safeRows.find(r => r.id === editId) : null; // reserved for future inline edit feature

  return (
    <main className="p-4 space-y-4">
      {/* Header / toolbar + create form */}
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
          {/* Create Event inline form */}
        </div>
        <div className="mt-4">
          <details ref={createDetailsRef} className="group">
            <summary className="cursor-pointer text-sm font-medium mb-2">➕ Create New Event</summary>
            <form
              action={createEventAction}
              className="grid gap-2 md:grid-cols-8 items-end text-sm"
              onSubmit={(e) => {
                // close the details immediately for responsiveness
                const d = createDetailsRef.current;
                if (d) d.open = false;
                // allow default submit to continue
                // optionally reset form after a short delay so values captured
                setTimeout(() => {
                  try { e.currentTarget.reset(); } catch {}
                }, 50);
              }}
            >
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Title</label>
                <Input name="title" placeholder="Event title" required />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Day</label>
                <Input
                  name="day"
                  placeholder="2025-10-03"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                  inputMode="numeric"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Start</label>
                <Input
                  name="startTime"
                  placeholder="09:00"
                  pattern="[0-9]{2}:[0-9]{2}"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">End</label>
                <Input
                  name="endTime"
                  placeholder="10:00"
                  pattern="[0-9]{2}:[0-9]{2}"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Location</label>
                <Input name="locationLabel" placeholder="Lil Z Shop" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Type</label>
                <Select name="type" defaultValue="social">
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Kind</label>
                <Select name="kind" defaultValue="social">
                  <SelectTrigger className="w-full"><SelectValue placeholder="Kind" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs uppercase tracking-wide opacity-70">Points</label>
                <Input name="points" type="number" min={0} defaultValue={0} />
              </div>
              <div className="md:col-span-8 flex justify-end">
                <Button type="submit" className="rounded-xl">Create</Button>
              </div>
            </form>
          </details>
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
                    <div className="flex items-center gap-1 sm:gap-2">
                      {e.status === "live" && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-team-red text-white shadow-sm">Live</span>
                      )}
                      <Dialog open={editId === e.id} onOpenChange={(o) => setEditId(o ? e.id : null)}>
                        <DialogContent accent={statusAccent(e.status)} className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                          </DialogHeader>
                          <form
                            action={updateEventAction}
                            className="space-y-3 text-sm"
                            onSubmit={() => {
                              // close dialog instantly for better UX
                              setEditId(null);
                            }}
                          >
                            <input type="hidden" name="id" value={e.id} />
                            <div className="grid grid-cols-2 gap-3">
                              <label className="space-y-1 col-span-2">
                                <span className="block text-xs uppercase opacity-60">Title</span>
                                <Input name="title" defaultValue={e.title} required />
                              </label>
                              <label className="space-y-1">
                                <span className="block text-xs uppercase opacity-60">Day</span>
                                <Input
                                  name="day"
                                  defaultValue={e.day}
                                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                                  inputMode="numeric"
                                  required
                                />
                              </label>
                              <label className="space-y-1">
                                <span className="block text-xs uppercase opacity-60">Start</span>
                                <Input
                                  name="startTime"
                                  defaultValue={e.startTime ?? ''}
                                  placeholder="HH:MM"
                                  pattern="[0-9]{2}:[0-9]{2}"
                                  inputMode="numeric"
                                />
                              </label>
                              <label className="space-y-1">
                                <span className="block text-xs uppercase opacity-60">End</span>
                                <Input
                                  name="endTime"
                                  defaultValue={''}
                                  placeholder="HH:MM"
                                  pattern="[0-9]{2}:[0-9]{2}"
                                  inputMode="numeric"
                                />
                              </label>
                              <label className="space-y-1 col-span-2">
                                <span className="block text-xs uppercase opacity-60">Location</span>
                                <Input name="locationLabel" defaultValue={e.locationLabel ?? ''} />
                              </label>
                              <label className="space-y-1">
                                <span className="block text-xs uppercase opacity-60">Type</span>
                                <Select name="type" defaultValue="social">
                                  <SelectTrigger className="w-full"><SelectValue placeholder={"Type"} /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="game">Game</SelectItem>
                                    <SelectItem value="dinner">Dinner</SelectItem>
                                    <SelectItem value="social">Social</SelectItem>
                                  </SelectContent>
                                </Select>
                              </label>
                              <label className="space-y-1">
                                <span className="block text-xs uppercase opacity-60">Kind</span>
                                <Select name="kind" defaultValue="social">
                                  <SelectTrigger className="w-full"><SelectValue placeholder={"Kind"} /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="game">Game</SelectItem>
                                    <SelectItem value="social">Social</SelectItem>
                                  </SelectContent>
                                </Select>
                              </label>
                              <label className="space-y-1">
                                <span className="block text-xs uppercase opacity-60">Points</span>
                                <Input name="points" type="number" min={0} defaultValue={0} />
                              </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button type="submit" className="rounded-xl">Save</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <RowMenu id={e.id} currentStatus={e.status} onEdit={() => setEditId(e.id)} />
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
