import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { whoopFetch, paginate } from "./whoop/client";

// "2026-06-09T13:31:58.000Z" + "+05:30" -> "2026-06-09" in the wearer's timezone
export function localDate(isoUtc: string, tzOffset: string | null | undefined): string {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(tzOffset ?? "");
  let offsetMs = 0;
  if (match) {
    offsetMs = (Number(match[2]) * 60 + Number(match[3])) * 60_000 * (match[1] === "-" ? -1 : 1);
  }
  return new Date(new Date(isoUtc).getTime() + offsetMs).toISOString().slice(0, 10);
}

export interface WhoopWorkout {
  id: string;
  sport_name: string;
  start: string;
  end: string;
  timezone_offset?: string;
  score_state?: string;
  score?: {
    strain?: number;
    average_heart_rate?: number;
    max_heart_rate?: number;
    kilojoule?: number;
    distance_meter?: number | null;
    altitude_gain_meter?: number | null;
    altitude_change_meter?: number | null;
    zone_durations?: Record<string, number>;
  } | null;
}

export interface WhoopSleep {
  id: string;
  start: string;
  end: string;
  timezone_offset?: string;
  nap?: boolean;
  score?: {
    sleep_performance_percentage?: number | null;
    stage_summary?: {
      total_light_sleep_time_milli?: number;
      total_slow_wave_sleep_time_milli?: number;
      total_rem_sleep_time_milli?: number;
      total_awake_time_milli?: number;
    };
  } | null;
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id?: string | null;
  created_at?: string;
  score_state?: string;
  score?: {
    recovery_score?: number;
    resting_heart_rate?: number;
    hrv_rmssd_milli?: number;
    spo2_percentage?: number | null;
    skin_temp_celsius?: number | null;
  } | null;
}

export interface WhoopCycle {
  id: number;
  start: string;
  end?: string | null;
  timezone_offset?: string;
  score?: { strain?: number; average_heart_rate?: number } | null;
}

export async function upsertWorkout(w: WhoopWorkout) {
  const zones = w.score?.zone_durations ?? {};
  await db
    .insert(schema.workouts)
    .values({
      id: w.id,
      sportName: w.sport_name,
      start: new Date(w.start),
      end: new Date(w.end),
      timezoneOffset: w.timezone_offset,
      localDate: localDate(w.start, w.timezone_offset),
      scoreState: w.score_state,
      strain: w.score?.strain,
      avgHr: w.score?.average_heart_rate,
      maxHr: w.score?.max_heart_rate,
      kilojoule: w.score?.kilojoule,
      distanceM: w.score?.distance_meter ?? null,
      altGainM: w.score?.altitude_gain_meter ?? null,
      altChangeM: w.score?.altitude_change_meter ?? null,
      zone0Ms: zones.zone_zero_milli,
      zone1Ms: zones.zone_one_milli,
      zone2Ms: zones.zone_two_milli,
      zone3Ms: zones.zone_three_milli,
      zone4Ms: zones.zone_four_milli,
      zone5Ms: zones.zone_five_milli,
      raw: w,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.workouts.id,
      set: {
        sportName: w.sport_name,
        start: new Date(w.start),
        end: new Date(w.end),
        timezoneOffset: w.timezone_offset,
        localDate: localDate(w.start, w.timezone_offset),
        scoreState: w.score_state,
        strain: w.score?.strain,
        avgHr: w.score?.average_heart_rate,
        maxHr: w.score?.max_heart_rate,
        kilojoule: w.score?.kilojoule,
        distanceM: w.score?.distance_meter ?? null,
        altGainM: w.score?.altitude_gain_meter ?? null,
        altChangeM: w.score?.altitude_change_meter ?? null,
        zone0Ms: zones.zone_zero_milli,
        zone1Ms: zones.zone_one_milli,
        zone2Ms: zones.zone_two_milli,
        zone3Ms: zones.zone_three_milli,
        zone4Ms: zones.zone_four_milli,
        zone5Ms: zones.zone_five_milli,
        raw: w,
        updatedAt: new Date(),
      },
    });
}

export async function upsertSleep(s: WhoopSleep) {
  const stages = s.score?.stage_summary ?? {};
  const values = {
    start: new Date(s.start),
    end: new Date(s.end),
    timezoneOffset: s.timezone_offset,
    // sleeps are attributed to the morning they end
    localDate: localDate(s.end, s.timezone_offset),
    nap: s.nap ?? false,
    performancePct: s.score?.sleep_performance_percentage ?? null,
    lightMs: stages.total_light_sleep_time_milli,
    swsMs: stages.total_slow_wave_sleep_time_milli,
    remMs: stages.total_rem_sleep_time_milli,
    awakeMs: stages.total_awake_time_milli,
    raw: s,
    updatedAt: new Date(),
  };
  await db
    .insert(schema.sleeps)
    .values({ id: s.id, ...values })
    .onConflictDoUpdate({ target: schema.sleeps.id, set: values });
}

export async function upsertRecovery(r: WhoopRecovery) {
  // Prefer the linked sleep's local date (sleeps are ingested first); the raw
  // UTC created_at date can be off by one for wake-ups before 05:30 IST.
  let day: string | undefined;
  if (r.sleep_id) {
    const [sleep] = await db
      .select({ localDate: schema.sleeps.localDate })
      .from(schema.sleeps)
      .where(eq(schema.sleeps.id, r.sleep_id));
    day = sleep?.localDate;
  }
  const values = {
    sleepId: r.sleep_id ?? null,
    localDate: day ?? (r.created_at ?? new Date().toISOString()).slice(0, 10),
    scoreState: r.score_state,
    recoveryScore: r.score?.recovery_score,
    restingHr: r.score?.resting_heart_rate,
    hrvRmssdMilli: r.score?.hrv_rmssd_milli,
    spo2Pct: r.score?.spo2_percentage ?? null,
    skinTempC: r.score?.skin_temp_celsius ?? null,
    raw: r,
    updatedAt: new Date(),
  };
  await db
    .insert(schema.recoveries)
    .values({ cycleId: r.cycle_id, ...values })
    .onConflictDoUpdate({ target: schema.recoveries.cycleId, set: values });
}

export async function upsertCycle(c: WhoopCycle) {
  const values = {
    start: new Date(c.start),
    end: c.end ? new Date(c.end) : null,
    localDate: localDate(c.start, c.timezone_offset),
    dayStrain: c.score?.strain,
    avgHr: c.score?.average_heart_rate,
    raw: c,
    updatedAt: new Date(),
  };
  await db
    .insert(schema.cycles)
    .values({ id: c.id, ...values })
    .onConflictDoUpdate({ target: schema.cycles.id, set: values });
}

export async function handleWebhookEvent(type: string, id: string) {
  switch (type) {
    case "workout.updated": {
      const workout = await whoopFetch<WhoopWorkout>(`/activity/workout/${id}`);
      await upsertWorkout(workout);
      break;
    }
    case "workout.deleted":
      await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
      break;
    case "sleep.updated": {
      const sleep = await whoopFetch<WhoopSleep>(`/activity/sleep/${id}`);
      await upsertSleep(sleep);
      break;
    }
    case "sleep.deleted":
      await db.delete(schema.sleeps).where(eq(schema.sleeps.id, id));
      break;
    case "recovery.updated": {
      // v2 quirk: the payload id is the associated *sleep* UUID. There is no
      // recovery-by-sleep endpoint, so sync the window around that sleep.
      const sleep = await whoopFetch<WhoopSleep>(`/activity/sleep/${id}`);
      await upsertSleep(sleep);
      const start = new Date(new Date(sleep.start).getTime() - 2 * 86_400_000).toISOString();
      for await (const rec of paginate<WhoopRecovery>("/recovery", { start })) {
        await upsertRecovery(rec);
      }
      break;
    }
    case "recovery.deleted":
      // payload id is a sleep UUID; clear recoveries linked to it
      await db.delete(schema.recoveries).where(eq(schema.recoveries.sleepId, id));
      break;
    default:
      return false;
  }
  return true;
}

export async function syncRange(startIso: string, endIso?: string) {
  const params: Record<string, string> = { start: startIso, ...(endIso ? { end: endIso } : {}) };
  const counts = { workouts: 0, sleeps: 0, recoveries: 0, cycles: 0 };

  for await (const w of paginate<WhoopWorkout>("/activity/workout", params)) {
    await upsertWorkout(w);
    counts.workouts++;
  }
  for await (const s of paginate<WhoopSleep>("/activity/sleep", params)) {
    await upsertSleep(s);
    counts.sleeps++;
  }
  for await (const r of paginate<WhoopRecovery>("/recovery", params)) {
    await upsertRecovery(r);
    counts.recoveries++;
  }
  for await (const c of paginate<WhoopCycle>("/cycle", params)) {
    await upsertCycle(c);
    counts.cycles++;
  }
  return counts;
}
