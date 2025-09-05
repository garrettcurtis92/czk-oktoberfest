import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db.execute(sql`
    SELECT t.id, t.name, t.color, COALESCE(SUM(s.points),0) AS total
    FROM teams t
    LEFT JOIN scores s ON s.team_id = t.id
    GROUP BY t.id
    ORDER BY total DESC;
  `);

  return NextResponse.json(rows.rows);
}
