"use server";

import { revalidatePath } from "next/cache";
import { syncRange } from "@/lib/ingest";

// How far back a manual refresh looks. Whoop normally pushes new activity via
// webhooks, but an occasional missed event can leave a recent run unsynced.
// A bounded window keeps the API calls cheap while still backfilling any gap.
const REFRESH_WINDOW_DAYS = 14;

export interface RefreshState {
  ok: boolean;
  message: string;
  /** timestamp so identical messages still trigger a re-render */
  at: number;
}

export async function refreshRuns(): Promise<RefreshState> {
  const start = new Date(
    Date.now() - REFRESH_WINDOW_DAYS * 86_400_000,
  ).toISOString();

  try {
    const counts = await syncRange(start);
    // The journal, trends and records pages all derive from this data.
    revalidatePath("/");
    revalidatePath("/trends");
    revalidatePath("/badges");

    const noun = counts.workouts === 1 ? "workout" : "workouts";
    return {
      ok: true,
      message: `Synced ${counts.workouts} ${noun} from the last ${REFRESH_WINDOW_DAYS} days.`,
      at: Date.now(),
    };
  } catch (err) {
    console.error("manual refresh failed", err);
    const raw = err instanceof Error ? err.message : String(err);
    // A dead/expired Whoop token is the usual culprit and needs a re-link,
    // not a retry — call that out instead of showing a raw stack message.
    const authIssue = /authoriz|token|\b401\b/i.test(raw);
    return {
      ok: false,
      message: authIssue
        ? "Whoop authorization expired — re-link Whoop at /api/auth/whoop, then try again."
        : `Sync failed: ${raw}`,
      at: Date.now(),
    };
  }
}
