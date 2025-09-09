import { pgTable, serial, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const colorEnum = pgEnum("team_color", ["red","orange","yellow","green","blue","purple"]);
export const eventType = pgEnum("event_type", ["game","dinner","social"]);
export const eventStatus = pgEnum("event_status", ["scheduled","live","paused","finished"]);

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
  basePoints: integer("base_points").default(0).notNull(),
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


// --- Brackets ---
export const bracketFormat = pgEnum("bracket_format", ["single_elim", "double_elim", "round_robin"]);
export const matchStatus = pgEnum("match_status", ["scheduled", "in_progress", "final"]);

export const brackets = pgTable("brackets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 64 }).notNull(), // e.g., "Cornhole 2025"
  format: bracketFormat("format").default("single_elim").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mapping which team is in a bracket and their seed
export const bracketTeams = pgTable("bracket_teams", {
  id: serial("id").primaryKey(),
  bracketId: integer("bracket_id").notNull(),
  teamId: integer("team_id").notNull(),
  seed: integer("seed").notNull(), // 1..N
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Each match in a bracket. For single-elim, rounds increase each step.
// "position" is the index within a round (column).
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  bracketId: integer("bracket_id").notNull(),
  round: integer("round").notNull(),      // 1 = first round, 2 = semifinals, etc.
  position: integer("position").notNull(), // within round (1..N)
  teamAId: integer("team_a_id"),          // may be null until determined
  teamBId: integer("team_b_id"),
  scoreA: integer("score_a").default(0).notNull(),
  scoreB: integer("score_b").default(0).notNull(),
  winnerTeamId: integer("winner_team_id"),
  status: matchStatus("status").default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
