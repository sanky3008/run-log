import {
  getRuns,
  getAllContext,
  joinContext,
  weeklySummaries,
  paceSecPerKm,
  efficiency,
  formatPace,
  pearson,
  recoveryTier,
} from "@/lib/analytics";
import { PixelBars, StepLine, ScatterPlot } from "@/components/charts";
import { ZoneBar } from "@/components/bars";

export const dynamic = "force-dynamic";

const TIER_COLOR: Record<string, string> = {
  green: "var(--color-hp-green)",
  yellow: "var(--color-hp-yellow)",
  red: "var(--color-hp-red)",
  unknown: "var(--color-gb-dark)",
};

function shortDate(localDate: string): string {
  return new Date(localDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function TrendsPage() {
  const [runsDesc, { recoveries, sleeps }] = await Promise.all([getRuns(), getAllContext()]);
  const runs = [...runsDesc].reverse(); // chronological

  if (runs.length === 0) {
    return (
      <div className="pixel-panel p-6 text-center pop">
        <p className="font-pixel text-[11px]">No data to chart yet!</p>
      </div>
    );
  }

  const weeks = weeklySummaries(runs).slice(-12);
  const paced = runs.filter((r) => paceSecPerKm(r) !== null).slice(-20);
  const efficient = runs.filter((r) => efficiency(r) !== null).slice(-20);

  const scatterPoints = runs
    .map((r) => ({ ctx: joinContext(r, recoveries, sleeps), pace: paceSecPerKm(r) }))
    .filter((p) => p.pace !== null && p.ctx.recovery?.recoveryScore != null)
    .map((p) => ({
      x: p.ctx.recovery!.recoveryScore!,
      y: p.pace!,
      color: TIER_COLOR[recoveryTier(p.ctx.recovery!.recoveryScore)],
    }));
  const r = pearson(scatterPoints.map((p) => [p.x, p.y] as [number, number]));

  const totalZoneMs = [0, 1, 2, 3, 4, 5].map((i) =>
    runs.reduce((s, run) => s + ([run.zone0Ms, run.zone1Ms, run.zone2Ms, run.zone3Ms, run.zone4Ms, run.zone5Ms][i] ?? 0), 0),
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="pixel-panel p-4 pop pop-1">
        <h3 className="font-pixel text-[10px] mb-2">WEEKLY DISTANCE (KM)</h3>
        <PixelBars values={weeks.map((w) => w.km)} labels={weeks.map((w) => w.week.slice(5))} />
      </section>

      <section className="pixel-panel p-4 pop pop-2">
        <h3 className="font-pixel text-[10px] mb-2">PACE PER RUN (LOWER = FASTER)</h3>
        <StepLine
          values={paced.map((r) => paceSecPerKm(r)!)}
          labels={paced.map((r) => shortDate(r.localDate))}
          formatY={(v) => formatPace(v)}
          invertY
        />
      </section>

      <section className="pixel-panel p-4 pop pop-2">
        <h3 className="font-pixel text-[10px] mb-2">STRAIN (XP) PER RUN</h3>
        <StepLine
          values={runs.slice(-20).map((r) => r.strain ?? 0)}
          labels={runs.slice(-20).map((r) => shortDate(r.localDate))}
          formatY={(v) => v.toFixed(1)}
        />
      </section>

      <section className="pixel-panel p-4 pop pop-3">
        <h3 className="font-pixel text-[10px] mb-2">HR COST (BEATS/KM, LOWER = FITTER ENGINE)</h3>
        <StepLine
          values={efficient.map((r) => efficiency(r)!)}
          labels={efficient.map((r) => shortDate(r.localDate))}
          formatY={(v) => v.toFixed(0)}
        />
      </section>

      <section className="pixel-panel p-4 pop pop-3">
        <h3 className="font-pixel text-[10px] mb-2">READINESS VS PACE</h3>
        <ScatterPlot
          points={scatterPoints}
          xLabel="morning recovery"
          yLabel="pace s/km"
          formatY={(v) => formatPace(v)}
        />
        <p className="mt-1 text-lg text-gb-dark">
          {r !== null
            ? `Correlation r = ${r.toFixed(2)} across ${scatterPoints.length} runs ${
                r < -0.3 ? "— better recovery, faster pace!" : r > 0.3 ? "— slower when recovered (easy days?)" : "— no strong pattern yet"
              }`
            : "Need a few more runs with recovery data for a correlation."}
        </p>
      </section>

      <section className="pixel-panel p-4 pop pop-4">
        <h3 className="font-pixel text-[10px] mb-2">LIFETIME TIME-IN-ZONE</h3>
        <ZoneBar zoneMs={totalZoneMs} />
      </section>
    </div>
  );
}
