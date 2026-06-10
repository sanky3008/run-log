import { Workout, paceSecPerKm, formatPace, efficiency, weeklySummaries, isoWeek } from "./analytics";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  value: string;
  date: string | null;
  earned: boolean;
}

export function computeBadges(runs: Workout[]): Badge[] {
  const withDistance = runs.filter((r) => (r.distanceM ?? 0) >= 1500);

  const longest = [...runs].sort((a, b) => (b.distanceM ?? 0) - (a.distanceM ?? 0))[0];
  const fastest = [...withDistance].sort((a, b) => (paceSecPerKm(a) ?? Infinity) - (paceSecPerKm(b) ?? Infinity))[0];
  const hardest = [...runs].sort((a, b) => (b.strain ?? 0) - (a.strain ?? 0))[0];
  const mostEfficient = [...withDistance]
    .filter((r) => efficiency(r) !== null)
    .sort((a, b) => efficiency(a)! - efficiency(b)!)[0];

  const weeks = weeklySummaries(runs);
  const biggestWeek = [...weeks].sort((a, b) => b.km - a.km)[0];
  const busiestWeek = [...weeks].sort((a, b) => b.runs - a.runs)[0];

  // longest streak of consecutive days with a run
  const days = [...new Set(runs.map((r) => r.localDate))].sort();
  let streak = 0,
    best = 0,
    bestEnd: string | null = null;
  for (let i = 0; i < days.length; i++) {
    streak = i > 0 && Date.parse(days[i]) - Date.parse(days[i - 1]) === 86_400_000 ? streak + 1 : 1;
    if (streak > best) {
      best = streak;
      bestEnd = days[i];
    }
  }

  return [
    {
      id: "marathon",
      name: "Distance Badge",
      emoji: "🏔️",
      description: "Longest single run",
      value: longest?.distanceM ? `${(longest.distanceM / 1000).toFixed(2)} km` : "—",
      date: longest?.localDate ?? null,
      earned: !!longest?.distanceM,
    },
    {
      id: "speed",
      name: "Speed Badge",
      emoji: "⚡",
      description: "Fastest avg pace (runs ≥ 1.5 km)",
      value: fastest ? formatPace(paceSecPerKm(fastest)) : "—",
      date: fastest?.localDate ?? null,
      earned: !!fastest,
    },
    {
      id: "volume",
      name: "Volume Badge",
      emoji: "📦",
      description: "Biggest week",
      value: biggestWeek ? `${biggestWeek.km.toFixed(1)} km` : "—",
      date: biggestWeek?.week ?? null,
      earned: !!biggestWeek && biggestWeek.km > 0,
    },
    {
      id: "strain",
      name: "Strain Badge",
      emoji: "🔥",
      description: "Highest-strain run",
      value: hardest?.strain ? hardest.strain.toFixed(1) : "—",
      date: hardest?.localDate ?? null,
      earned: !!hardest?.strain,
    },
    {
      id: "frequency",
      name: "Frequency Badge",
      emoji: "📅",
      description: "Most runs in a week",
      value: busiestWeek ? `${busiestWeek.runs} runs` : "—",
      date: busiestWeek?.week ?? null,
      earned: !!busiestWeek,
    },
    {
      id: "streak",
      name: "Streak Badge",
      emoji: "🔗",
      description: "Longest run-day streak",
      value: best > 0 ? `${best} days` : "—",
      date: bestEnd,
      earned: best >= 2,
    },
    {
      id: "engine",
      name: "Engine Badge",
      emoji: "❤️",
      description: "Best HR efficiency (beats/km)",
      value: mostEfficient ? `${efficiency(mostEfficient)!.toFixed(0)} b/km` : "—",
      date: mostEfficient?.localDate ?? null,
      earned: !!mostEfficient,
    },
  ];
}

export function trainerLevel(runs: Workout[]): number {
  const lifetimeKm = runs.reduce((s, r) => s + (r.distanceM ?? 0) / 1000, 0);
  return Math.floor(lifetimeKm) + 1;
}

export function currentWeekKey(): string {
  return isoWeek(new Date().toISOString().slice(0, 10));
}
