import { pgTable, serial, varchar, integer, timestamp, pgEnum, boolean, smallint, text } from "drizzle-orm/pg-core";


export const colorEnum = pgEnum("team_color", ["red","orange","yellow","green","blue","purple"]);
export const eventType = pgEnum("event_type", ["game","dinner","social"]);
export const eventStatus = pgEnum("event_status", ["scheduled","live","paused","finished"]);
// classify schedule cards (game vs social)
export const eventKind = pgEnum("event_kind", ["game", "social"]);

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  color: colorEnum("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 128 }).notNull(),
  day: varchar("day", { length: 10 }).notNull(),      // YYYY-MM-DD
  startTime: varchar("start_time", { length: 8 }),     // HH:MM
  endTime: varchar("end_time", { length: 8 }),
  locationLabel: varchar("location_label", { length: 96 }),
  type: eventType("type").notNull(),
  // new: classify schedule card kind and scoring points
  kind: eventKind("kind").default("social").notNull(),
  basePoints: integer("base_points").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  status: eventStatus("status").default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  teamId: integer("team_id").notNull(),
  points: integer("points").notNull(),
  note: varchar("note", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Brackets (new) ---
// Core tournament container per event & game type
export const brackets = pgTable("brackets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(), // FK → events.id (logical)
  game: varchar("game", { length: 16 }).notNull(), // 'cornhole' | 'pickleball' | 'pingpong'
  isLocked: boolean("is_locked").notNull().default(false),
  createdBy: varchar("created_by", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Seeding table: which team has which seed in a bracket
export const bracketSeeds = pgTable("bracket_seeds", {
  id: serial("id").primaryKey(),
  bracketId: integer("bracket_id").notNull(),
  teamId: integer("team_id").notNull(),
  seedNumber: integer("seed_number").notNull(), // 1..N
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matches table with forward-links to the next match (winner advances)
export const bracketMatches = pgTable("bracket_matches", {
  id: serial("id").primaryKey(),
  bracketId: integer("bracket_id").notNull(),
  roundNumber: integer("round_number").notNull(), // 1 = first round
  matchNumber: integer("match_number").notNull(), // position within round (1..N)
  team1Id: integer("team1_id"), // nullable until known
  team2Id: integer("team2_id"),
  team1Score: integer("team1_score").notNull().default(0),
  team2Score: integer("team2_score").notNull().default(0),
  winnerTeamId: integer("winner_team_id"),
  nextMatchId: integer("next_match_id"), // link to downstream match
  slotInNext: smallint("slot_in_next"),   // 1 or 2 (which slot the winner occupies in next match)
  startsAt: timestamp("starts_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});