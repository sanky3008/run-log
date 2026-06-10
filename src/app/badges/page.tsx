import { getRuns } from "@/lib/analytics";
import { computeBadges } from "@/lib/badges";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  const runs = await getRuns();
  const badges = computeBadges(runs);

  return (
    <div className="flex flex-col gap-4">
      <section className="pixel-panel--dark m-1 px-4 py-2 pop">
        <p className="font-pixel text-[10px]">
          PERSONAL RECORDS · {badges.filter((b) => b.earned).length}/{badges.length} EARNED
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {badges.map((badge, i) => (
          <section key={badge.id} className={`pixel-panel p-4 pop pop-${Math.min(4, i + 1)} ${badge.earned ? "" : "opacity-50"}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl" style={{ filter: badge.earned ? "none" : "grayscale(1)" }} aria-hidden>
                {badge.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="font-pixel text-[10px]">{badge.name.toUpperCase()}</h3>
                <p className="text-lg text-ink-soft leading-tight">{badge.description}</p>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t-2 border-dotted border-ink-soft/50 pt-2">
              <span className="text-2xl tabular-nums">{badge.value}</span>
              <span className="text-base text-ink-soft">{badge.date ?? ""}</span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
