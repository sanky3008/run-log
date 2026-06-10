CREATE TABLE "cycles" (
	"id" bigint PRIMARY KEY NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone,
	"local_date" date NOT NULL,
	"day_strain" real,
	"avg_hr" integer,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"whoop_user_id" bigint,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"scope" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recoveries" (
	"cycle_id" bigint PRIMARY KEY NOT NULL,
	"sleep_id" uuid,
	"local_date" date NOT NULL,
	"score_state" text,
	"recovery_score" integer,
	"resting_hr" integer,
	"hrv_rmssd_milli" real,
	"spo2_pct" real,
	"skin_temp_c" real,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sleeps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"timezone_offset" text,
	"local_date" date NOT NULL,
	"nap" boolean DEFAULT false NOT NULL,
	"performance_pct" real,
	"light_ms" bigint,
	"sws_ms" bigint,
	"rem_ms" bigint,
	"awake_ms" bigint,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"trace_id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"resource_id" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'received' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sport_name" text NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"timezone_offset" text,
	"local_date" date NOT NULL,
	"score_state" text,
	"strain" real,
	"avg_hr" integer,
	"max_hr" integer,
	"kilojoule" real,
	"distance_m" real,
	"alt_gain_m" real,
	"alt_change_m" real,
	"zone0_ms" bigint,
	"zone1_ms" bigint,
	"zone2_ms" bigint,
	"zone3_ms" bigint,
	"zone4_ms" bigint,
	"zone5_ms" bigint,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "workouts_start_idx" ON "workouts" USING btree ("start" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "workouts_local_date_idx" ON "workouts" USING btree ("local_date");