// src/app/schedule/page.tsx
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { db } from "@/db";
import { events as eventsTable } from "@/db/schema";

// at top


// ...


type Event = {
  id: number;
  title: string;
  description?: string | null;
  day: string;               // "YYYY-MM-DD"
  startTime?: string | null; // "HH:MM"
  endTime?: string | null;
  locationLabel?: string | null;
  hostFamily?: string | null;
  type: "game" | "dinner" | "social";
  status?: "scheduled" | "live" | "paused" | "finished";
  basePoints?: number | null;
};

const typeColor: Record<Event["type"], string> = {
  game: "bg-team-blue text-white",
  dinner: "bg-team-orange text-white",
  social: "bg-team-green text-white",
};

const statusPill: Record<NonNullable<Event["status"]> | "scheduled", string> = {
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
  const d = new Date(iso + "T12:00:00"); // avoid TZ edge cases
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }); // e.g., Fri, Oct 3
}

async function getEvents() {
  // read directly from DB (no fetch)
  const rows = await db.select().from(eventsTable);
  return rows;
}

export default async function SchedulePage() {
  const events = await getEvents();

  // Group by day
  const grouped = new Map<string, Event[]>();
  for (const e of events) {
    grouped.set(e.day, [...(grouped.get(e.day) ?? []), e]);
  }
  const days = [...grouped.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, items]) => [day, items.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))]) as [
    string,
    Event[]
  ][];

  if (days.length === 0) {
    return (
      <main className="p-6">
        <div className="rounded-2xl p-8 text-center bg-white/70 backdrop-blur shadow">
          <h2 className="text-xl font-display mb-1">No events yet</h2>
          <p className="opacity-70 text-sm">Admins can add events from the secret dashboard.</p>
        </div>
      </main>
    );
  }

  const firstDay = days[0]![0];

  return (
    <main className="p-4 space-y-4">
      <header className="rounded-2xl p-4 bg-white/70 backdrop-blur shadow">
        <h1 className="text-2xl font-display">Schedule</h1>
        <p className="opacity-70 text-sm">Tap a day to see events. All locations are on the ranch.</p>
      </header>

      <section className="rounded-2xl p-4 bg-white/60 backdrop-blur shadow">
        <Tabs defaultValue={firstDay} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
            {days.map(([day]) => (
              <TabsTrigger key={day} value={day} className="text-xs md:text-sm">
                {fmtDayLabel(day)}
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map(([day, items]) => (
            <TabsContent key={day} value={day} className="mt-4 space-y-3">
              {items.map((ev) => (
                <EventCard key={ev.id ?? `${ev.day}-${ev.title}`} ev={ev} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </main>
  );
}

function EventCard({ ev }: { ev: Event }) {
  return (
    <div className="rounded-2xl p-4 bg-white/80 backdrop-blur shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className={typeColor[ev.type]}>{ev.type}</Badge>
            {ev.status && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusPill[ev.status]}`}>{ev.status}</span>
            )}
          </div>
          <h3 className="text-lg font-display">{ev.title}</h3>
          <p className="text-sm opacity-70">
            {fmtTime(ev.startTime)}
            {ev.endTime ? `–${fmtTime(ev.endTime)}` : ""} · {ev.locationLabel ?? "On-site"}
            {ev.hostFamily ? ` · Host: ${ev.hostFamily}` : ""}
          </p>
          {ev.type === "game" && typeof ev.basePoints === "number" && (
            <p className="text-sm opacity-80">
              Base points: <span className="font-semibold">{ev.basePoints}</span>
            </p>
          )}
          {ev.description && <p className="text-sm">{ev.description}</p>}
        </div>
      </div>
    </div>
  );
}
