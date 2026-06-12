"use client";

import { startTransition, useActionState } from "react";
import { refreshRuns, type RefreshState } from "@/app/actions";

export function RefreshButton() {
  const [state, action, pending] = useActionState<RefreshState | null>(
    refreshRuns,
    null,
  );

  return (
    <div className="flex min-w-0 items-center justify-end gap-2">
      {state && !pending && (
        <span
          title={state.message}
          className={`truncate text-base ${state.ok ? "text-ink-soft" : "text-red"}`}
        >
          {state.message}
        </span>
      )}
      <button
        type="button"
        onClick={() => startTransition(action)}
        disabled={pending}
        aria-busy={pending}
        className="shrink-0 border-2 border-ink px-2 py-1 font-pixel text-[9px] hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        {pending ? "SYNCING…" : "▶ FETCH NEW RUNS"}
      </button>
    </div>
  );
}
