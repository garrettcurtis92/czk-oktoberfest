import dotenv from "dotenv";
import path from "path";
import { db } from "../db/index.js";
import { events } from "../db/schema.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

async function checkEvents() {
  try {
    const allEvents = await db.select().from(events);
    console.log("Current events in database:");
    allEvents.forEach(event => {
      console.log(`ID: ${event.id}, Title: ${event.title}, Day: ${event.day}, Start: ${event.startTime}`);
    });
  } catch (error) {
    console.error("Error querying events:", error);
  }
}

checkEvents();
