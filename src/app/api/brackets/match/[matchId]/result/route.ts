export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";

async function assertAdmin() {
  const c = (await cookies()).get("ADMIN_KEY")?.value;
  if (!c || c !== process.env.ADMIN_KEY) {
    throw new Response("Unauthorized", { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  try {
    await assertAdmin();

    const { matchId } = await context.params;
    const id = Number(matchId);
    const body = await req.json();
    const { scoreA, scoreB, winnerTeamId } = body as {
      scoreA: number;
      scoreB: number;
      winnerTeamId: number;
    };

    await db.update(matches)
      .set({
        scoreA,
        scoreB,
        winnerTeamId,
        status: "final",
      })
      .where(eq(matches.id, id));

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Response) return e;
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
