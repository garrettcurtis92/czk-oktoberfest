// src/lib/brackets/cornhole.ts
export function applyCornholeScoreRule(prev1: number, prev2: number, add1: number, add2: number) {
  // Example helper if you were adding points incrementally
  const s1 = prev1 + add1;
  const s2 = prev2 + add2;
  const fix = (s: number) => (s > 21 ? 11 : s);
  return { team1: fix(s1), team2: fix(s2) };
}

export function validateCornholeSubmission(team1Score: number, team2Score: number) {
  const fix = (s: number) => (s > 21 ? 11 : s);
  const f1 = fix(team1Score);
  const f2 = fix(team2Score);
  if (f1 !== team1Score || f2 !== team2Score) {
    return { ok: false, corrected: { team1Score: f1, team2Score: f2 } };
  }
  const winner = team1Score === 21 ? 'team1' : team2Score === 21 ? 'team2' : null;
  return { ok: true, winner };
}