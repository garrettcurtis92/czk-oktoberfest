CREATE TYPE "public"."bracket_format" AS ENUM('single_elim', 'double_elim', 'round_robin');--> statement-breakpoint
CREATE TYPE "public"."team_color" AS ENUM('red', 'orange', 'yellow', 'green', 'blue', 'purple');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'live', 'paused', 'finished');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('game', 'dinner', 'social');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'in_progress', 'final');--> statement-breakpoint
CREATE TABLE "bracket_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"bracket_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"seed" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brackets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(64) NOT NULL,
	"format" "bracket_format" DEFAULT 'single_elim' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"day" varchar(10) NOT NULL,
	"start_time" varchar(8),
	"end_time" varchar(8),
	"location_label" varchar(96),
	"type" "event_type" NOT NULL,
	"base_points" integer DEFAULT 0 NOT NULL,
	"status" "event_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"bracket_id" integer NOT NULL,
	"round" integer NOT NULL,
	"position" integer NOT NULL,
	"team_a_id" integer,
	"team_b_id" integer,
	"score_a" integer DEFAULT 0 NOT NULL,
	"score_b" integer DEFAULT 0 NOT NULL,
	"winner_team_id" integer,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"points" integer NOT NULL,
	"note" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"color" "team_color" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
