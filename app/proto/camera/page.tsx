import CameraBench from "@/components/showcase/camera-bench";

/**
 * ⛔ THE CAMERA BENCH — `/proto/camera` (D-104; the structural note `live-work/structural-note-camera-bench-26-october.md`
 * v3, option A: a route of its own, apart from the client page). Carl's method: he describes the shot, PERFORMS it on his Xbox
 * pad to get it "in the ballpark", then we refine. R1, THE RECORDER (`live-work/plan-camera-recorder-r1-26-october.md`):
 * record / stop in clips on film 4's arch, drawn by the same code as `/proto/your-words` (`lettering-piece.tsx`). The page
 * is the title and the bench, full width (Carl: *"half the info on the page doesnt have to be there"*); the bench's drawers
 * hold the rest. An instrument, not a page: ⛔ noindex, never linked (kept through R1 — the Architect's [A7]).
 */
export const metadata = {
  title: "Camera bench",
  robots: { index: false, follow: false },
};

export default function CameraBenchPage() {
  return (
    <main className="min-h-[calc(100*var(--vh))] bg-neutral-950 px-4 py-3 text-white">
      <h1 className="mb-2 text-sm font-semibold tracking-wide text-neutral-300">Camera bench</h1>
      <CameraBench />
    </main>
  );
}
