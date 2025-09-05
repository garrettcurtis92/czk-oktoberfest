"use client";

import React from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setStatusAction, clearLiveAction, finishPastAction, resetFinishedAction } from "./actions";
import { MoreHorizontal, ChevronDown } from "lucide-react";

type Row = {
  id: number;
  title: string;
  day: string;               // "YYYY-MM-DD"
  startTime: string | null;  // "HH:MM"
  locationLabel: string | null;
  status: "scheduled" | "live" | "paused" | "finished";
};

export default function AdminClient({ rows }: { rows: Row[] }) {
  // No searchParams/key needed anymore — middleware + cookie gates access.
  const safeRows = [...rows].sort((a, b) => {
    const aKey = `${a.day} ${a.startTime ?? "99:99"}`;
    const bKey = `${b.day} ${b.startTime ?? "99:99"}`;
    return aKey.localeCompare(bKey);
  });

  return (
    <main className="p-4 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-display">Event Status Controls</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-xl">
              Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
  align="end"
  className="rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200 p-1"
>
  <div className="px-2 py-1.5 text-xs font-medium text-gray-500">Bulk Actions</div>
  <div className="h-px bg-gray-200 my-1" />

  <form action={clearLiveAction}>
    <button
      type="submit"
      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
    >
      Clear Live
    </button>
  </form>

  <form action={finishPastAction}>
    <button
      type="submit"
      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
    >
      Finish All Past
    </button>
  </form>

  <form action={resetFinishedAction}>
    <button
      type="submit"
      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
    >
      Reset Finished → Scheduled
    </button>
  </form>
</DropdownMenuContent>

        </DropdownMenu>
      </header>

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

              <DropdownMenu>
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
    <form key={status} action={setStatusAction}>
      <input type="hidden" name="id" value={e.id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="block w-full text-left capitalize px-3 py-2 rounded-md hover:bg-gray-100"
      >
        {status}
      </button>
    </form>
  ))}
</DropdownMenuContent>

              </DropdownMenu>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
