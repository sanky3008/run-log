"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { refreshRuns, type RefreshState } from "@/app/actions";

export function RefreshButton() {
  const router = useRouter();
  const [state, action, pending] = useActionState<RefreshState | null>(
    refreshRuns,
    null,
  );

  // revalidatePath refreshes the server cache; router.refresh() makes sure the
  // page we're looking at re-renders with the newly synced runs.
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => startTransition(action)}
        disabled={pending}
        aria-busy={pending}
        className="shrink-0 border-2 border-ink px-2 py-1 font-pixel text-[9px] hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        {pending ? "SYNCING…" : "▶ FETCH NEW RUNS"}
      </button>
      {state && !pending && (
        <span
          className={`max-w-[20rem] text-right text-base leading-snug ${
            state.ok ? "text-ink-soft" : "text-red"
          }`}
        >
          {state.message}
        </span>
      )}
    </div>
  );
}
