import Link from "next/link";
import { db } from "@/db";
import { brackets } from "@/db/schema";

export const dynamic = "force-dynamic"; // list changes occasionally

export default async function BracketsPage() {
  const rows = await db.select().from(brackets);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Brackets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((b) => (
          <Link
            key={b.id}
            href={`/brackets/${b.id}`}
            className="rounded-2xl border border-black/10 bg-white/60 p-4 backdrop-blur hover:bg-white transition"
          >
            <div className="text-lg font-medium">{b.title}</div>
            <div className="text-sm text-black/60 uppercase tracking-wide mt-1">
              {b.format.replace("_", " ")}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
