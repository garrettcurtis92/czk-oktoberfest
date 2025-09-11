import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Map DATABASE_URL -> POSTGRES_URL for vercel-postgres adapter
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

import { db } from "@/db";
import { events } from "@/db/schema";

async function testEvents() {
  try {
    const allEvents = await db.select().from(events);
    console.log("Events in database:", allEvents.length);
    console.log("Events:", JSON.stringify(allEvents, null, 2));
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

testEvents();
