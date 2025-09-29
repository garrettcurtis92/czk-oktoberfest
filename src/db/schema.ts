import { pgTable, serial, varchar, integer, timestamp, pgEnum, text } from "drizzle-orm/pg-core";


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

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});