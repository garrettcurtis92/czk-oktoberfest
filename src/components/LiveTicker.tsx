"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  day: string;
  startTime: string;
  endTime: string | null;
  status?: "live" | "upcoming";
}

export default function LiveTicker({ compact }: { compact?: boolean } = {}) {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentEvent = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const events: Event[] = await response.json();
          const now = new Date();

          // Find live event first
          const liveEvent = events.find(event => {
            const startTime = new Date(`${event.day}T${event.startTime}`);
            const endTime = event.endTime ? new Date(`${event.day}T${event.endTime}`) : null;
            return startTime <= now && (!endTime || endTime > now);
          });

          if (liveEvent) {
            setCurrentEvent({ ...liveEvent, status: "live" });
          } else {
            // Find next upcoming event
            const upcomingEvent = events
              .filter(event => new Date(`${event.day}T${event.startTime}`) > now)
              .sort((a, b) => new Date(`${a.day}T${a.startTime}`).getTime() - new Date(`${b.day}T${b.startTime}`).getTime())[0];

            if (upcomingEvent) {
              setCurrentEvent({ ...upcomingEvent, status: "upcoming" });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentEvent();
  }, []);

  if (loading) {
    return (
      <div className={compact ? "flex items-center" : "flex justify-center mb-6"}>
        <span className={cn(
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          "font-medium bg-team-blue text-white rounded-full shadow flex items-center gap-2"
        )}>
          <span className="inline-block size-2 rounded-full bg-white animate-pulse" />
          {compact ? "Loading" : "Loading events..."}
        </span>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className={compact ? "flex items-center" : "flex justify-center mb-6"}>
        <span className={cn(
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          "font-medium bg-team-blue text-white rounded-full shadow flex items-center gap-2"
        )}>
          <span className="inline-block size-2 rounded-full bg-white animate-pulse" />
          {compact ? "Oktoberfest" : "Oktoberfest 2025 - October 3-5"}
        </span>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    // Add time component to avoid timezone issues, similar to schedule page
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={compact ? "flex items-center" : "flex justify-center mb-6"}>
      {currentEvent.status === "live" ? (
        <span className={cn(
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          "font-medium bg-team-blue text-white rounded-full shadow flex items-center gap-2"
        )}>
          <span className="inline-block size-2 rounded-full bg-white animate-pulse" />
          <span className={compact ? "font-semibold text-xs" : "font-semibold"}>Live</span>
          <span className={cn("font-semibold truncate", compact ? "max-w-[22ch]" : "max-w-[50vw]")}>{currentEvent.title}</span>
          {currentEvent.startTime && (
            <span className="text-xs opacity-90">
              · {currentEvent.startTime}
              {currentEvent.endTime ? `–${currentEvent.endTime}` : ""}
            </span>
          )}
        </span>
      ) : (
        <span className={cn(
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
          "font-medium bg-team-blue text-white rounded-full shadow flex items-center gap-2"
        )}>
          <span className="inline-block size-2 rounded-full bg-white animate-pulse" />
          <span className={compact ? "text-xs" : "font-medium"}>Next</span>
          <span className={cn("font-semibold truncate", compact ? "max-w-[22ch]" : "max-w-[50vw]")}>{currentEvent.title}</span>
          {currentEvent.startTime && (
            <span className="text-xs opacity-90">· {formatDate(currentEvent.day)} {formatTime(`${currentEvent.day}T${currentEvent.startTime}`)}</span>
          )}
        </span>
      )}
    </div>
  );
}
