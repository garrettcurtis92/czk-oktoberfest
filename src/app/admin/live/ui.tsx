"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  setStatusAction,
  clearLiveAction,
  finishPastAction,
  resetFinishedAction,
} from "./actions";
import { MoreHorizontal, ChevronDown } from "lucide-react";


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
              ev.preventDefault(); // don’t let Radix cancel the submit
              (document.getElementById(`set-${id}-${status}`) as HTMLFormElement)?.requestSubmit();
              setOpen(false); // close after submitting
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


type Row = {
  id: number;
  title: string;
  day: string; // "YYYY-MM-DD"
  startTime: string | null; // "HH:MM"
  locationLabel: string | null;
  status: "scheduled" | "live" | "paused" | "finished";
};

export default function AdminClient({ rows }: { rows: Row[] }) {
  // Sort by day + start time
  const [bulkOpen, setBulkOpen] = useState(false);
  const safeRows = [...rows].sort((a, b) => {
    const aKey = `${a.day} ${a.startTime ?? "99:99"}`;
    const bKey = `${b.day} ${b.startTime ?? "99:99"}`;
    return aKey.localeCompare(bKey);
  });

  return (
    <main className="p-4 space-y-4">
      {/* ---------- Bulk actions ---------- */}
      {/* Hidden forms (persist in DOM) */}
      <form id="bulk-clear-live" action={clearLiveAction} className="hidden" />
      <form id="bulk-finish-past" action={finishPastAction} className="hidden" />
      <form id="bulk-reset-finished" action={resetFinishedAction} className="hidden" />

      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-display">Event Status Controls</h1>

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

      </header>

      {/* ---------- Per-row controls ---------- */}
      <ul className="space-y-2">
        {safeRows.map((e) => (
          <li key={e.id} className="rounded-2xl bg-white/70 backdrop-blur shadow p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm opacity-70">
                  {e.day} {e.startTime ?? ""} · {e.locationLabel ?? "On-site"}
                </div>
                <div className="font-medium">{e.title}</div>
                <div className="text-xs mt-1">Current: {e.status}</div>
              </div>

              {/* Hidden forms for this row (persist in DOM, not inside menu) */}
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

             <RowMenu id={e.id} />
              
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
