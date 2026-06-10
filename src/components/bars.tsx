import { recoveryTier } from "@/lib/analytics";

const TIER_COLOR: Record<string, string> = {
  green: "var(--color-hp-green)",
  yellow: "var(--color-hp-yellow)",
  red: "var(--color-hp-red)",
  unknown: "var(--color-ink-soft)",
};

/** HP-style recovery bar — value is recovery score 0–100 */
export function HPBar({ value, label = "HP" }: { value: number | null; label?: string }) {
  const tier = recoveryTier(value);
  const pct = value == null ? 0 : Math.max(2, Math.min(100, value));
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="font-pixel text-[9px]">{label}</span>
      <div className="flex-1 h-3 bg-paper-deep border-2 border-ink p-px">
        <div
          className="h-full"
          style={{ width: `${pct}%`, background: TIER_COLOR[tier], imageRendering: "pixelated" }}
        />
      </div>
      <span className="font-pixel text-[9px] tabular-nums">{value == null ? "—" : `${value}/100`}</span>
    </div>
  );
}

/** progress bar — progress 0..1 */
export function XPBar({ progress, label = "WEEK" }: { progress: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, progress * 100));
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="font-pixel text-[9px]">{label}</span>
      <div className="flex-1 h-2 bg-paper-deep border-2 border-ink">
        <div className="h-full bg-blue" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const ZONE_COLORS = [
  "#dcd6c4",
  "#a9c9ea",
  "var(--color-blue)",
  "var(--color-zone3)",
  "var(--color-zone4)",
  "var(--color-zone5)",
];
const ZONE_LABELS = ["Z0", "Z1", "Z2", "Z3", "Z4", "Z5"];

/** stacked HR-zone bar with legend */
export function ZoneBar({ zoneMs, legend = true }: { zoneMs: number[]; legend?: boolean }) {
  const total = zoneMs.reduce((a, b) => a + b, 0);
  if (total === 0) return <p className="text-ink-soft">No zone data</p>;
  return (
    <div>
      <div className="flex h-5 w-full border-2 border-ink">
        {zoneMs.map((ms, i) =>
          ms > 0 ? (
            <div key={i} style={{ width: `${(ms / total) * 100}%`, background: ZONE_COLORS[i] }} />
          ) : null,
        )}
      </div>
      {legend && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
          {zoneMs.map((ms, i) =>
            ms > 0 ? (
              <span key={i} className="flex items-center gap-1 text-base text-ink">
                <span className="inline-block size-2.5 border border-ink" style={{ background: ZONE_COLORS[i] }} />
                {ZONE_LABELS[i]} {Math.round(ms / 60000)}m
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
