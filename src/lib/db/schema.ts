import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  real,
  boolean,
  date,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const oauthTokens = pgTable("oauth_tokens", {
  id: integer("id").primaryKey().default(1),
  whoopUserId: bigint("whoop_user_id", { mode: "number" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  scope: text("scope"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id").primaryKey(),
    sportName: text("sport_name").notNull(),
    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),
    timezoneOffset: text("timezone_offset"),
    localDate: date("local_date").notNull(),
    scoreState: text("score_state"),
    strain: real("strain"),
    avgHr: integer("avg_hr"),
    maxHr: integer("max_hr"),
    kilojoule: real("kilojoule"),
    distanceM: real("distance_m"),
    altGainM: real("alt_gain_m"),
    altChangeM: real("alt_change_m"),
    zone0Ms: bigint("zone0_ms", { mode: "number" }),
    zone1Ms: bigint("zone1_ms", { mode: "number" }),
    zone2Ms: bigint("zone2_ms", { mode: "number" }),
    zone3Ms: bigint("zone3_ms", { mode: "number" }),
    zone4Ms: bigint("zone4_ms", { mode: "number" }),
    zone5Ms: bigint("zone5_ms", { mode: "number" }),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("workouts_start_idx").on(t.start.desc()), index("workouts_local_date_idx").on(t.localDate)],
);

export const recoveries = pgTable("recoveries", {
  cycleId: bigint("cycle_id", { mode: "number" }).primaryKey(),
  sleepId: uuid("sleep_id"),
  localDate: date("local_date").notNull(),
  scoreState: text("score_state"),
  recoveryScore: integer("recovery_score"),
  restingHr: integer("resting_hr"),
  hrvRmssdMilli: real("hrv_rmssd_milli"),
  spo2Pct: real("spo2_pct"),
  skinTempC: real("skin_temp_c"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sleeps = pgTable("sleeps", {
  id: uuid("id").primaryKey(),
  start: timestamp("start", { withTimezone: true }).notNull(),
  end: timestamp("end", { withTimezone: true }).notNull(),
  timezoneOffset: text("timezone_offset"),
  localDate: date("local_date").notNull(),
  nap: boolean("nap").notNull().default(false),
  performancePct: real("performance_pct"),
  lightMs: bigint("light_ms", { mode: "number" }),
  swsMs: bigint("sws_ms", { mode: "number" }),
  remMs: bigint("rem_ms", { mode: "number" }),
  awakeMs: bigint("awake_ms", { mode: "number" }),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cycles = pgTable("cycles", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  start: timestamp("start", { withTimezone: true }).notNull(),
  end: timestamp("end", { withTimezone: true }),
  localDate: date("local_date").notNull(),
  dayStrain: real("day_strain"),
  avgHr: integer("avg_hr"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const webhookEvents = pgTable("webhook_events", {
  traceId: text("trace_id").primaryKey(),
  type: text("type").notNull(),
  resourceId: text("resource_id").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("received"),
});
