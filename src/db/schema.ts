import { pgTable, serial, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const colorEnum = pgEnum("team_color", ["red","orange","yellow","green","blue","purple"]);
export const eventType = pgEnum("event_type", ["game","dinner","social"]);

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
