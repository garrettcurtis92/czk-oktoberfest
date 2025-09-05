"use client";

import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setStatusAction, clearLiveAction, finishPastAction, resetFinishedAction } from "./actions";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import React from "react";

type Row = {
  id: number;
  title: string;
  day: string;               // "YYYY-MM-DD"
  startTime: string | null;  // "HH:MM"
  locationLabel: string | null;
  status: "scheduled" | "live" | "paused" | "finished";
};

export default function AdminClient({ rows }: { rows: Row[] }) {
  const searchParams = useSearchParams();
  const key = searchParams.get("key") ?? "";

  if (!process.env.NEXT_PUBLIC_ADMIN_ENABLED) {
    return <p className="p-4">Missing <code>ADMIN_KEY</code> env (set in .env.local)</p>;
  }
  if (!key) {
    return (
      <p className="p-4">
        Open with your key: <code>/admin/live?key=YOUR_KEY</code>
      </p>
    );
  }

  // Safety: keep rows ordered even if server didn't
  const safeRows = [...rows].sort((a, b) => {
    const aKey = `${a.day} ${a.startTime ?? "99:99"}`;
    const bKey = `${b.day} ${b.startTime ?? "99:99"}`;
    return aKey.localeCompare(bKey);
  });

  return (
    <main className="p-4 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-display">Event Status Controls</h1>

        {/* Bulk Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-xl">
              Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
         <DropdownMenuContent
  align="end"
  className="rounded-xl bg-white text-gray-900 shadow-xl border border-gray-200"
>

            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={clearLiveAction}>
              <input type="hidden" name="key" value={key} />
              <DropdownMenuItem asChild>
                <button className="w-full text-left">Clear Live</button>
              </DropdownMenuItem>
            </form>
            <form action={finishPastAction}>
              <input type="hidden" name="key" value={key} />
              <DropdownMenuItem asChild>
                <button className="w-full text-left">Finish All Past</button>
              </DropdownMenuItem>
            </form>
            <form action={resetFinishedAction}>
              <input type="hidden" name="key" value={key} />
              <DropdownMenuItem asChild>
                <button className="w-full text-left">Reset Finished → Scheduled</button>
              </DropdownMenuItem>
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

              {/* Per-row status dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="rounded-xl">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(["scheduled", "live", "paused", "finished"] as const).map((status) => (
                    <form key={status} action={setStatusAction}>
                      <input type="hidden" name="key" value={key} />
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="status" value={status} />
                      <DropdownMenuItem asChild>
                        <button className="w-full text-left capitalize">{status}</button>
                      </DropdownMenuItem>
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
