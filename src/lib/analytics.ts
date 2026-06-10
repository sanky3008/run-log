import { desc, inArray } from "drizzle-orm";
import { db, schema } from "./db";

export const RUN_SPORTS = ["running", "trail-running", "treadmill-running"];

export type Workout = typeof schema.workouts.$inferSelect;
export type Recovery = typeof schema.recoveries.$inferSelect;
export type Sleep = typeof schema.sleeps.$inferSelect;
export type Cycle = typeof schema.cycles.$inferSelect;

export interface RunWithContext {
  run: Workout;
  recovery: Recovery | null;
  sleep: Sleep | null;
}

export function durationSec(w: Workout): number {
  return (w.end.getTime() - w.start.getTime()) / 1000;
}

/** seconds per km, or null if no distance */
export function paceSecPerKm(w: Workout): number | null {
  if (!w.distanceM || w.distanceM < 100) return null;
  return durationSec(w) / (w.distanceM / 1000);
}

export function formatPace(secPerKm: number | null): string {
  if (!secPerKm) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

export function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export function kcal(w: Workout): number | null {
  return w.kilojoule ? Math.round(w.kilojoule * 0.239006) : null;
}

/** avg HR beats per km of pace-speed — lower is fitter (HR cost of speed) */
export function efficiency(w: Workout): number | null {
  const pace = paceSecPerKm(w);
  if (!pace || !w.avgHr) return null;
  return (w.avgHr * pace) / 60; // beats per km
}

export function zoneArray(w: Workout): number[] {
  return [w.zone0Ms, w.zone1Ms, w.zone2Ms, w.zone3Ms, w.zone4Ms, w.zone5Ms].map((z) => z ?? 0);
}

export function recoveryTier(score: number | null | undefined): "green" | "yellow" | "red" | "unknown" {
  if (score == null) return "unknown";
  if (score >= 67) return "green";
  if (score >= 34) return "yellow";
  return "red";
}

/** ISO week key like "2026-W24" */
export function isoWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function getRuns(limit?: number): Promise<Workout[]> {
  const q = db
    .select()
    .from(schema.workouts)
    .where(inArray(schema.workouts.sportName, RUN_SPORTS))
    .orderBy(desc(schema.workouts.start));
  return limit ? q.limit(limit) : q;
}

export async function getAllContext(): Promise<{
  recoveries: Recovery[];
  sleeps: Sleep[];
  cycles: Cycle[];
}> {
  const [recoveries, sleeps, cycles] = await Promise.all([
    db.select().from(schema.recoveries),
    db.select().from(schema.sleeps),
    db.select().from(schema.cycles),
  ]);
  return { recoveries, sleeps, cycles };
}

export function joinContext(
  run: Workout,
  recoveries: Recovery[],
  sleeps: Sleep[],
): RunWithContext {
  const recovery = recoveries.find((r) => r.localDate === run.localDate) ?? null;
  const sleep =
    sleeps.find((s) => s.localDate === run.localDate && !s.nap) ??
    sleeps
      .filter((s) => !s.nap && s.end.getTime() <= run.start.getTime())
      .sort((a, b) => b.end.getTime() - a.end.getTime())[0] ??
    null;
  return { run, recovery, sleep };
}

export interface WeekSummary {
  week: string;
  km: number;
  runs: number;
  strain: number;
  zoneMs: number[];
}

export function weeklySummaries(runs: Workout[]): WeekSummary[] {
  const byWeek = new Map<string, WeekSummary>();
  for (const run of runs) {
    const week = isoWeek(run.localDate);
    const entry = byWeek.get(week) ?? { week, km: 0, runs: 0, strain: 0, zoneMs: [0, 0, 0, 0, 0, 0] };
    entry.km += (run.distanceM ?? 0) / 1000;
    entry.runs += 1;
    entry.strain += run.strain ?? 0;
    zoneArray(run).forEach((ms, i) => (entry.zoneMs[i] += ms));
    byWeek.set(week, entry);
  }
  return [...byWeek.values()].sort((a, b) => a.week.localeCompare(b.week));
}

export function pearson(pairs: [number, number][]): number | null {
  const n = pairs.length;
  if (n < 3) return null;
  const mx = pairs.reduce((s, p) => s + p[0], 0) / n;
  const my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let cov = 0,
    vx = 0,
    vy = 0;
  for (const [x, y] of pairs) {
    cov += (x - mx) * (y - my);
    vx += (x - mx) ** 2;
    vy += (y - my) ** 2;
  }
  if (vx === 0 || vy === 0) return null;
  return cov / Math.sqrt(vx * vy);
}
