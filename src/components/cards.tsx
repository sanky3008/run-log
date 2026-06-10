import Link from "next/link";
import {
  RunWithContext,
  Workout,
  durationSec,
  efficiency,
  formatDuration,
  formatPace,
  kcal,
  paceSecPerKm,
  zoneArray,
} from "@/lib/analytics";
import { HPBar, XPBar, ZoneBar } from "./bars";

function fmtDate(localDate: string): string {
  return new Date(localDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtTime(d: Date, tz?: string | null): string {
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz ?? "Asia/Kolkata",
  });
}

function tzName(offset: string | null | undefined): string | undefined {
  // Workouts store "+05:30"-style offsets; map the common case, else fall back to UTC math via undefined
  return offset === "+05:30" ? "Asia/Kolkata" : undefined;
}

export function StatLine({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b-2 border-dotted border-ink-soft/50 py-1">
      <span className="font-pixel text-[9px] uppercase">{name}</span>
      <span className="text-xl tabular-nums">{value}</span>
    </div>
  );
}

export function TrainerCard({
  trainerLevel,
  lifetimeKm,
  badgeCount,
  weekKm,
  weekRuns,
  weekProgress,
}: {
  trainerLevel: number;
  lifetimeKm: number;
  badgeCount: number;
  weekKm: number;
  weekRuns: number;
  weekProgress: number;
}) {
  return (
    <section className="pixel-panel p-4 pop pop-1">
      <div className="flex items-start gap-4">
        {/* pixel-art runner sprite (original, CSS grid art) */}
        <PixelRunner />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <h2 className="font-pixel text-[11px] sm:text-sm">SANKALP</h2>
            <span className="font-pixel text-[9px] text-blue">:L{trainerLevel}</span>
          </div>
          <p className="mt-1 text-lg leading-tight text-ink-soft">
            {lifetimeKm.toFixed(1)} km lifetime · {badgeCount}/7 records set
          </p>
          <div className="mt-2">
            <XPBar progress={weekProgress} label="WEEK" />
            <p className="mt-1 text-base text-ink-soft">
              This week: {weekKm.toFixed(1)} km across {weekRuns} run{weekRuns === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** tiny original pixel sprite of a runner, pure CSS boxes */
function PixelRunner() {
  // 8x8 grid: 0 empty, 1 outline, 2 jersey, 3 skin
  const grid = [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 3, 3, 3, 1, 0, 0],
    [0, 1, 3, 1, 3, 1, 0, 0],
    [0, 0, 1, 3, 3, 1, 0, 0],
    [0, 1, 2, 2, 2, 1, 1, 0],
    [1, 2, 1, 2, 2, 1, 3, 1],
    [0, 1, 0, 1, 2, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 1, 0],
  ];
  const colors = ["transparent", "var(--color-ink)", "var(--color-red)", "#f0c8a0"];
  return (
    <div className="grid shrink-0 border-2 border-ink bg-paper-deep p-1" style={{ gridTemplateColumns: "repeat(8, 6px)" }} aria-hidden>
      {grid.flat().map((c, i) => (
        <span key={i} style={{ width: 6, height: 6, background: colors[c] }} />
      ))}
    </div>
  );
}

export function RunListItem({ run }: { run: Workout }) {
  const km = run.distanceM ? (run.distanceM / 1000).toFixed(2) : null;
  return (
    <Link
      href={`/runs/${run.id}`}
      className="group flex items-baseline justify-between gap-3 px-2 py-1.5 hover:bg-paper-deep"
    >
      <span className="font-pixel text-[9px] shrink-0">
        <span className="opacity-0 group-hover:opacity-100 text-red">▶</span>
        {fmtDate(run.localDate)}
      </span>
      <span className="flex-1 border-b-2 border-dotted border-ink-soft/40" aria-hidden />
      <span className="text-xl tabular-nums">
        {km ? `${km} km` : formatDuration(durationSec(run))} · {formatPace(paceSecPerKm(run))} ·{" "}
        {run.strain?.toFixed(1) ?? "—"} strain
      </span>
    </Link>
  );
}

export function EncounterCard({
  ctx,
  full = false,
  heading = "RUN",
}: {
  ctx: RunWithContext;
  full?: boolean;
  heading?: string;
}) {
  const { run, recovery, sleep } = ctx;
  const km = run.distanceM ? run.distanceM / 1000 : null;
  const eff = efficiency(run);
  return (
    <section className={`pixel-panel p-4 ${full ? "" : "pop pop-2"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-pixel text-[10px] sm:text-xs">
          <span className="bg-red text-white px-1">{heading}</span>
        </p>
        <p className="text-lg text-ink-soft">
          {fmtDate(run.localDate)} · {fmtTime(run.start, tzName(run.timezoneOffset))} ·{" "}
          {formatDuration(durationSec(run))}
        </p>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <StatLine name="Distance" value={km ? `${km.toFixed(2)} km` : "—"} />
          <StatLine name="Pace" value={formatPace(paceSecPerKm(run))} />
          <StatLine name="Strain" value={run.strain ? run.strain.toFixed(1) : "—"} />
          <StatLine name="Avg / Max HR" value={run.avgHr ? `${run.avgHr} / ${run.maxHr} bpm` : "—"} />
          {full && <StatLine name="Energy" value={kcal(run) ? `${kcal(run)} kcal` : "—"} />}
          {full && (
            <StatLine
              name="Elevation"
              value={run.altGainM != null ? `+${run.altGainM.toFixed(0)} m` : "—"}
            />
          )}
          {full && eff && <StatLine name="HR cost" value={`${eff.toFixed(0)} beats/km`} />}
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-pixel text-[9px] mb-1">MORNING RECOVERY</p>
            <HPBar value={recovery?.recoveryScore ?? null} />
            {full && recovery && (
              <p className="mt-1 text-base text-ink-soft">
                HRV {recovery.hrvRmssdMilli?.toFixed(0)} ms · RHR {recovery.restingHr} bpm
                {recovery.spo2Pct ? ` · SpO2 ${recovery.spo2Pct.toFixed(0)}%` : ""}
              </p>
            )}
          </div>
          <div>
            <p className="font-pixel text-[9px] mb-1">HR ZONES</p>
            <ZoneBar zoneMs={zoneArray(run)} legend={full} />
          </div>
        </div>
      </div>

      {full && sleep && (
        <p className="mt-4 border-t-2 border-ink pt-2 text-lg">
          Previous night:{" "}
          {formatDuration((sleep.end.getTime() - sleep.start.getTime()) / 1000)} sleep
          {sleep.performancePct ? ` · ${sleep.performancePct.toFixed(0)}% sleep performance` : ""}
        </p>
      )}

      {!full && (
        <Link href={`/runs/${run.id}`} className="mt-3 inline-block font-pixel text-[9px] hover:bg-ink hover:text-paper px-1">
          ▶ VIEW DETAILS
        </Link>
      )}
    </section>
  );
}
