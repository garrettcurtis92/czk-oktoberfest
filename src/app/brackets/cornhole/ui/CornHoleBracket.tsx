'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Lightweight fallback for useToast when the shared hook path is not available.
 * Keeps the same shape used in this file: const { toast } = useToast();
 */
function useToast() {
  return {
    toast: ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
      // Prefer console logging; you can replace this with a real UI toast if available.
      // Avoid blocking alerts by default.
      console.info('Toast:', { title, description, variant });
    },
  };
}

import { swapFirstRoundTeams, submitCornholeScore } from '../actions';

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Failed to load bracket');
  return r.json();
}

export default function CornHoleBracket({ eventId, isAdmin, isLocked }: { eventId: string; isAdmin?: boolean; isLocked?: boolean }) {
  const [data, setData] = useState<any>(null);
  const [drag, setDrag] = useState<{ matchId: string; slot: 1 | 2 } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const res = await fetchJSON(`/api/brackets?game=cornhole&eventId=${eventId}`);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (!data) return <div className="text-sm opacity-70">Loading…</div>;

  const rounds: any[][] = data.rounds ?? [];

  const handleDrop = async (targetMatchId: string, targetSlot: 1 | 2) => {
    if (!isAdmin) return; // admin-only
    if (!drag) return;
    try {
      await swapFirstRoundTeams(drag.matchId, drag.slot, targetMatchId, targetSlot);
      await reload();
      toast({
        title: "Teams swapped successfully",
        description: "The bracket has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to swap teams",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setDrag(null);
  };

  return (
    <div className="overflow-x-auto">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, rounds.length)}, minmax(220px, 1fr))`, gap: 16 }}
      >
        {rounds.map((matches, rIdx) => (
          <div key={rIdx} className="space-y-4">
            {matches.map((m: any) => (
              <Card key={m.id} className="p-3 bg-white/60 backdrop-blur rounded-2xl shadow">
                <div className="text-xs uppercase tracking-wide opacity-70 mb-2">Round {m.roundNumber}</div>

                <Slot
                  label="Team 1"
                  teamName={m.team1?.name ?? '— bye —'}
                  draggable={!!isAdmin && rIdx === 0 && !!m.team1}
                  onDragStart={() => setDrag({ matchId: m.id, slot: 1 })}
                  onDrop={() => handleDrop(m.id, 1)}
                />

                <Slot
                  label="Team 2"
                  teamName={m.team2?.name ?? '— bye —'}
                  draggable={!!isAdmin && rIdx === 0 && !!m.team2}
                  onDragStart={() => setDrag({ matchId: m.id, slot: 2 })}
                  onDrop={() => handleDrop(m.id, 2)}
                />

                <div className="mt-3">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <ScoreBox
                        matchId={m.id}
                        s1={m.team1Score}
                        s2={m.team2Score}
                        onSubmit={async (a, b) => {
                          try {
                            await submitCornholeScore(m.id, a, b);
                            await reload();
                            toast({
                              title: "Score updated",
                              description: `Match score set to ${a} - ${b}`,
                            });
                          } catch (error) {
                            toast({
                              title: "Failed to update score",
                              description: "Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-sm opacity-80">Score: {m.team1Score} – {m.team2Score}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({
  label,
  teamName,
  draggable,
  onDragStart,
  onDrop,
}: {
  label: string;
  teamName: string;
  draggable?: boolean;
  onDragStart?: () => void;
  onDrop?: () => void;
}) {
  return (
    <motion.div
      layout
      className={`rounded-xl border p-2 mb-2 ${draggable ? 'bg-white/70' : 'bg-white/60 opacity-80'}`}
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        const ev = e as unknown as React.DragEvent<HTMLDivElement>;
        ev.dataTransfer?.setData('text/plain', 'drag');
        onDragStart?.();
      }}
      onDragOver={(e) => {
        (e as unknown as React.DragEvent<HTMLDivElement>).preventDefault();
      }}
      onDrop={(e) => {
        const ev = e as unknown as React.DragEvent<HTMLDivElement>;
        ev.preventDefault();
        onDrop?.();
      }}
    >
      <div className="text-[10px] opacity-60">{label}</div>
      <div className="font-medium">{teamName}</div>
    </motion.div>
  );
}

function ScoreBox({
  matchId,
  s1,
  s2,
  onSubmit,
}: {
  matchId: string;
  s1: number;
  s2: number;
  onSubmit: (a: number, b: number) => Promise<void>;
}) {
  const [a, setA] = useState<number>(s1);
  const [b, setB] = useState<number>(s2);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-14 rounded-lg border px-2 py-1"
        value={a}
        onChange={(e) => setA(parseInt(e.target.value || '0'))}
        min={0}
        disabled={false}
      />
      <span>–</span>
      <input
        type="number"
        className="w-14 rounded-lg border px-2 py-1"
        value={b}
        onChange={(e) => setB(parseInt(e.target.value || '0'))}
        min={0}
        disabled={false}
      />
      <Button size="sm" onClick={() => onSubmit(a, b)} disabled={Number.isNaN(a) || Number.isNaN(b)}>
        Save
      </Button>
    </div>
  );
}