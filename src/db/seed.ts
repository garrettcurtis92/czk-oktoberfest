import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { teams, events } from "./schema";

async function main() {
  await db.insert(teams).values([
    { name: "Red Team", color: "red" },
    { name: "Orange Team", color: "orange" },
    { name: "Yellow Team", color: "yellow" },
    { name: "Green Team", color: "green" },
    { name: "Blue Team", color: "blue" },
    { name: "Purple Team", color: "purple" },
  ]);

  await db.insert(events).values([
    { title: "Opening Message & Prayer (JK)", day: "2025-10-03", startTime: "16:00", type: "social", locationLabel: "Lil Z Shop" },
    { title: "Dinner hosted by Dunn-Z",        day: "2025-10-03", startTime: "17:00", type: "dinner", locationLabel: "Lil Z Shop" },
    { title: "Costume Contest & Dance Party",  day: "2025-10-03", startTime: "19:00", type: "social", locationLabel: "Lil Z Shop" },
    { title: "Cornhole & Ping-Pong Tourney",   day: "2025-10-04", startTime: "10:00", endTime: "15:00", type: "social", locationLabel: "Lil Z Shop", basePoints: 10 },
    { title: "Dinner hosted by Kelly Clan",    day: "2025-10-04", startTime: "17:00", type: "dinner", locationLabel: "Kelly House" },
    { title: "Jeopardy Night",                 day: "2025-10-04", startTime: "18:30", type: "game",   locationLabel: "Lil Z Shop", basePoints: 8 },
    { title: "Bingo & Mimosas",                day: "2025-10-05", startTime: "09:30", type: "social", locationLabel: "Curt Z's" },
    { title: "Pickleball Tournament",          day: "2025-10-05", startTime: "10:30", endTime: "15:00", type: "game", locationLabel: "Curt Z's", basePoints: 10 },
    { title: "Dinner hosted by Curt Z's",      day: "2025-10-05", startTime: "17:00", type: "dinner", locationLabel: "Curt Z's" },
    { title: "Bunko",                           day: "2025-10-05", startTime: "18:30", type: "game",   locationLabel: "Curt Z's", basePoints: 6 },
  ]);
  console.log("Seed complete ✔");
}
main();
