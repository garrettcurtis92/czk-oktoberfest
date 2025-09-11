// src/app/brackets/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { brackets } from '@/db/schema';
import LiveTicker from '@/components/LiveTicker';

export default async function BracketsPage() {
  // Get all events to see what's available
  const allEvents = await db.select().from(events);

  // Debug: log what we found
  console.log('All events in database:', allEvents.map(e => ({ id: e.id, title: e.title, type: e.type })));

  // Find cornhole event - try multiple search patterns
  // First, try to find event ID 51 specifically (since user mentioned it exists)
  let eventId = null;
  
  try {
    const specificEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, 51))
      .limit(1);
    
    if (specificEvent.length > 0) {
      eventId = specificEvent[0].id;
      console.log('Found cornhole event ID 51:', specificEvent[0]);
    }
  } catch (error) {
    console.log('Event ID 51 not found, trying other methods');
  }

  // If no exact match for ID 51, try case-insensitive search
  if (!eventId) {
    const cornholeLikeEvents = await db
      .select()
      .from(events)
      .where(sql`${events.title} ILIKE '%cornhole%'`)
      .limit(1);
    
    if (cornholeLikeEvents.length > 0) {
      eventId = cornholeLikeEvents[0].id;
    }
  }

  // If still no match, try finding game events
  if (!eventId) {
    const gameEvents = await db
      .select()
      .from(events)
      .where(eq(events.type, 'game'))
      .limit(1);
    
    if (gameEvents.length > 0) {
      eventId = gameEvents[0].id;
    }
  }  // Debug: log what we found
  console.log('Brackets page - eventId found:', eventId);
  if (eventId) {
    const foundEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    console.log('Brackets page - found event:', foundEvent[0]);
  }

  return (
    <main className="p-4 space-y-4">
      
      {/* Live/Next Event Ticker */}
      <LiveTicker />

      {/* Hero */}
      <section className="relative rounded-3xl p-8 shadow bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur overflow-hidden">
        {/* subtle blobs */}
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />

        <h1 className="text-3xl md:text-4xl font-display tracking-tight text-center">
          Brackets
        </h1>
        <p className="mt-2 text-center text-sm md:text-base text-charcoal/70">
          View and manage tournament brackets for different games.
        </p>
      </section>

      <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
        {/* Debug info */}
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm">
          <strong>Debug Info:</strong><br/>
          Total events: {allEvents.length}<br/>
          Cornhole event found: {eventId ? 'Yes' : 'No'}<br/>
          {eventId && `Event ID: ${eventId}`}
        </div>

        {/* Cornhole Bracket Card */}
        <div className="space-y-3">
          <div className={`rounded-xl p-4 border-2 transition ${
            eventId
              ? 'border-team-blue bg-white/80 hover:bg-white/90'
              : 'border-gray-300 bg-gray-50 opacity-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Cornhole Tournament</h3>
                <p className="text-sm text-gray-600">
                  {eventId
                    ? `Event ID: ${eventId} found in schedule`
                    : 'No cornhole event found in schedule'
                  }
                </p>
              </div>

              {eventId ? (
                <a
                  href={`/brackets/cornhole?eventId=${eventId}`}
                  className="px-4 py-2 bg-team-blue text-white rounded-lg hover:bg-blue-600 transition"
                >
                  View Bracket
                </a>
              ) : (
                <div className="text-center">
                  <span className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed inline-block">
                    No Event
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Check schedule for cornhole event
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Show all events for debugging */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium">Available Events (Debug)</summary>
          <div className="mt-2 space-y-2">
            {allEvents.length === 0 ? (
              <p className="text-xs text-gray-500">No events found in database</p>
            ) : (
              allEvents.map(event => (
                <div key={event.id} className="p-2 bg-gray-50 rounded text-xs">
                  ID: {event.id} | Title: "{event.title}" | Type: {event.type} | Day: {event.day}
                </div>
              ))
            )}
          </div>
        </details>
      </div>
    </main>
  );
}
