// src/app/brackets/cornhole/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import CornHoleBracket from './ui/CornHoleBracket';
import { db } from '@/db';
import { brackets, events } from '@/db/schema'; // <- use table directly
import { eq, and } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { generateCornholeBracket, setBracketLock } from './actions';

export default async function Page({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
  const params = await searchParams;
  const eventIdStr = params?.eventId ?? null;
  const isAdmin = true; // TODO: replace with real auth-based admin check

  console.log('Cornhole bracket page accessed with eventId:', eventIdStr);

  if (!eventIdStr) {
    return (
      <main className="p-4">
        <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
          <h1 className="text-2xl font-display mb-4">Cornhole Bracket</h1>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm">
              <strong>Missing eventId parameter.</strong><br/>
              Please access this page from the brackets overview at <Link href="/brackets" className="text-blue-600 underline">/brackets</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  const eventId = Number(eventIdStr);

  if (isNaN(eventId)) {
    return (
      <main className="p-4">
        <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
          <h1 className="text-2xl font-display mb-4">Cornhole Bracket</h1>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm">
              <strong>Invalid eventId:</strong> &quot;{eventIdStr}&quot;<br/>
              eventId must be a number.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Check if event exists
  try {
    const eventExists = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    console.log('Found event:', eventExists[0]);

    if (eventExists.length === 0) {
      return (
        <main className="p-4">
          <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
            <h1 className="text-2xl font-display mb-4">Cornhole Bracket</h1>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm">
                <strong>Event not found:</strong> No event with ID {eventId}<br/>
                Check the <Link href="/brackets" className="text-blue-600 underline">brackets overview</Link> for available events.
              </p>
            </div>
          </div>
        </main>
      );
    }
  } catch (error) {
    console.error('Error checking event existence:', error);
    return (
      <main className="p-4">
        <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
          <h1 className="text-2xl font-display mb-4">Cornhole Bracket</h1>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm">
              <strong>Database error:</strong> Could not check if event exists<br/>
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </main>
    );
  }

  let br;
  try {
    // Use select().from(...) instead of db.query.<table>
    br = await db
      .select()
      .from(brackets)
      .where(and(eq(brackets.eventId, eventId), eq(brackets.game, 'cornhole')))
      .limit(1);
  } catch (error) {
    console.error('Database query error:', error);
    return (
      <main className="p-4">
        <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
          <h1 className="text-2xl font-display mb-4">Cornhole Bracket</h1>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm">
              <strong>Database error:</strong> Could not load bracket<br/>
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const existing = br && br.length > 0 ? br[0] : null;
  console.log('Found bracket:', existing);

  async function Generate() {
    'use server';
    await generateCornholeBracket(eventIdStr!, 'admin'); // pass string to action as written (non-null asserted)
  }

  async function ToggleLock() {
    'use server';
    if (!existing) return;
    await setBracketLock(existing.id as number, !existing.isLocked);
  }

  return (
    <main className="p-4">
      <div className="rounded-2xl p-6 bg-white/70 backdrop-blur shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display">Cornhole Bracket</h1>
            <p className="text-sm text-gray-600 mt-1">
              Event ID: {eventId} | Bracket: {existing ? 'Exists' : 'Not created yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && !existing && (
              <form action={Generate}>
                <Button>Generate from Standings</Button>
              </form>
            )}
            {isAdmin && existing && (
              <form action={ToggleLock}>
                <Button variant={existing.isLocked ? 'secondary' : 'default'}>
                  {existing.isLocked ? 'Unlock Seeding' : 'Lock Seeding'}
                </Button>
              </form>
            )}
          </div>
        </div>

        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-team-blue mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading bracket...</p>
          </div>
        }>
          <CornHoleBracket
            eventId={eventIdStr}
            isAdmin={isAdmin}
            isLocked={!!existing?.isLocked}
          />
        </Suspense>
      </div>
    </main>
  );
}