import { getRuns, getAllContext, joinContext, weeklySummaries, isoWeek } from "@/lib/analytics";
import { computeBadges, trainerLevel } from "@/lib/badges";
import { EncounterCard, RunListItem, TrainerCard } from "@/components/cards";
import { RefreshButton } from "@/components/refresh-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [runs, { recoveries, sleeps }] = await Promise.all([getRuns(), getAllContext()]);

  if (runs.length === 0) {
    return (
      <div className="pixel-panel p-6 text-center pop">
        <p className="font-pixel text-[11px] leading-relaxed">
          No runs logged yet!
        </p>
        <p className="mt-2 text-xl text-ink-soft">
          New runs sync here automatically from Whoop.
        </p>
        <div className="mt-4 flex justify-center">
          <RefreshButton />
        </div>
      </div>
    );
  }

  const weeks = weeklySummaries(runs);
  const thisWeekKey = isoWeek(new Date().toISOString().slice(0, 10));
  const thisWeek = weeks.find((w) => w.week === thisWeekKey);
  const pastWeeks = weeks.filter((w) => w.week !== thisWeekKey);
  const avgWeekKm = pastWeeks.length
    ? pastWeeks.reduce((s, w) => s + w.km, 0) / pastWeeks.length
    : 0;
  const badges = computeBadges(runs);
  const lifetimeKm = runs.reduce((s, r) => s + (r.distanceM ?? 0) / 1000, 0);
  const latest = joinContext(runs[0], recoveries, sleeps);

  return (
    <div className="flex flex-col gap-4">
      <TrainerCard
        trainerLevel={trainerLevel(runs)}
        lifetimeKm={lifetimeKm}
        badgeCount={badges.filter((b) => b.earned).length}
        weekKm={thisWeek?.km ?? 0}
        weekRuns={thisWeek?.runs ?? 0}
        weekProgress={avgWeekKm > 0 ? Math.min(1, (thisWeek?.km ?? 0) / avgWeekKm) : 0}
      />

      <EncounterCard ctx={latest} heading="LATEST RUN" />

      <section className="pixel-panel p-3 pop pop-3">
        <div className="flex items-center justify-between gap-2 px-2 pb-2 border-b-2 border-ink">
          <h3 className="font-pixel text-[10px] shrink-0">RUN JOURNAL</h3>
          <RefreshButton />
        </div>
        <div className="mt-1 max-h-[28rem] overflow-y-auto">
          {runs.slice(0, 30).map((run) => (
            <RunListItem key={run.id} run={run} />
          ))}
        </div>
      </section>
    </div>
  );
}
