"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { BenchIdea, IdeaSceneProps } from "./bench-ideas";
import { MeasureSpans } from "./lettering-hooks";
import { LetteringPiece, usePieceBuild, type Built } from "./lettering-piece";

/**
 * ⛔ THE ARCH, AS AN IDEA BROUGHT TO THE BENCH (14 November 2026; D-101 / D-104). Carl: *"go back to the camera bench and
 * put the arch logo in it and run it"* … *"permission given. run the vader move with the arch"*. Film 4's arch (R-093,
 * brushed brass), REMOVED from the bench's own code on 9 November (Carl: *"the arch, hidden or otherwise, does not need to
 * be there. remove it."*; `structural-note-bench-arch-removed-9-november.md`), comes back as FURNITURE through the
 * workshop's one slot (`bench-ideas.ts`, `?idea=arch`) — the bench's code is untouched, and film 4's page with it.
 *
 * - ⛔ DRAWN BY THE SHARED `LetteringPiece`, read, not changed (film 4's page draws the same component).
 * - ⛔ WHERE IT STOOD: the arch's own frame had its centre line at its origin, its floor 429.05… below and its face at z 16;
 *   the workshop's world moved the origin to the floor and the front line (9 November, step 2), and everything stored in
 *   the old frame moved by `OLD_ORIGIN` (0, +429.05…, −16) — `camera-bench.tsx`'s constant, the same numbers as the Vader
 *   move's two worlds (`live-work/references/film04/vader-move/take-4.json`). So the arch stands where the move was flown.
 * - ⛔ ITS BUILD MEASURES ITS WORDS IN THE PAGE (`MeasureSpans`, HTML: the font's own widths) — the old bench rendered them in
 *   its page; an idea's `Scene` is inside the canvas (no HTML there). So THE BUILD RUNS IN THE GUIDE (`ArchBuild`, the
 *   idea's HTML layer over the picture: invisible spans, and the failure in plain words if the font or a collision check
 *   fails), and hands what it built to the Scene through `archStore` — a store in THIS file only (the Guide and the Scene
 *   are two React trees; the store is the bridge, nothing else reads it).
 * - Home: none of its own — the bench's default face-on view is the arch's (the Vader move's `"default"`).
 */

/** the arch's old origin in the workshop's world — `camera-bench.tsx`'s `OLD_ORIGIN` (not exported there; the same numbers) */
const ARCH_AT: [number, number, number] = [0, 429.05184025084225, -16];

type ArchState = { shown: Built | null; failure: string | null };
let state: ArchState = { shown: null, failure: null };
const listeners = new Set<() => void>();
const archStore = {
  get: () => state,
  set(next: ArchState) {
    if (next.shown === state.shown && next.failure === state.failure) return;
    state = next;
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
const serverState: ArchState = { shown: null, failure: null };

/** the build, in the page (the Guide's layer): the measuring spans, invisible; the failure in plain words */
function ArchBuild() {
  const { spec, lines, spans, shown, failure } = usePieceBuild("arch");
  useEffect(() => {
    archStore.set({ shown, failure });
  }, [shown, failure]);
  // a later visit starts clean (the store outlives the page's mount)
  useEffect(() => () => archStore.set({ shown: null, failure: null }), []);
  return (
    <>
      <MeasureSpans lines={lines} fontKey={spec.font} spans={spans} accessible={false} />
      {failure && (
        <div className="pointer-events-none absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-xs text-red-300">The arch was not built: {failure}</div>
      )}
    </>
  );
}

/** the arch in the workshop's world, once built */
function ArchScene({ onReady }: IdeaSceneProps) {
  const { shown } = useSyncExternalStore(archStore.subscribe, archStore.get, () => serverState);
  if (!shown) return null;
  return (
    <group position={ARCH_AT}>
      <LetteringPiece piece="arch" built={shown} onReady={onReady} />
    </group>
  );
}

export const ARCH_IDEA: BenchIdea = {
  name: "arch",
  Scene: ArchScene,
  Guide: ArchBuild,
};
