/**
 * ⛔ A BENCH, NOT A ROUTE ANYONE SHIPS. Same precedent as `/proto/nextstep` and
 * `/proto/wall`. ⚠ IT DEPLOYS — Carl has accepted that for the other two, but it
 * is stated here rather than assumed.
 *
 * Chunk 1 of the /about §2 role cards: GEOMETRY ONLY, under a three-tone
 * diagnostic material. No glass, no neon, no room, no text, no placement.
 *
 * ⛔⛔ WHY A BENCH AND NOT `/about`: a Three.js surface on `/about` is the FIRST
 * WebGL CONTEXT ON THAT ROUTE, and the §5a structural note for it is owed and
 * unwritten. The bench proves the shape without touching that gate.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ TWO VIEWS, AND THE SECOND IS THE ONE THAT MATTERS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A crown that reads at 20° tilt FACE-ON is not evidence it reads OBLIQUE under
 * an 89.9° lens with foreshortening. The cards are seen at an angle in the room,
 * so the bench shows both and the oblique view is the acceptance one.
 *
 * ⛔ AND THE LIGHT MUST BE SWEEPABLE. The geometry is legible only under a RAKING
 * beam — *"the ends give SHAPE and the middle gives PRESENCE"* — so a fixed
 * head-on light shows a correct crown as FLAT and invites the wrong correction.
 * That is exactly how the contact field's crown was mis-judged: at 5.67° max tilt
 * *"the shadow lived in the last ~6 degrees of a 90-degree sweep."*
 *
 * Dials: `?crown=` `?h=` `?aspect=` `?light=` `?auto=0`
 */

import CardBench from "@/components/about/card-bench";

export const metadata = {
  title: "Card bench — /about role cards",
};

export default function CardBenchPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-lg font-semibold mb-1">
        /about role card — geometry bench
      </h1>
      <p className="text-sm text-neutral-400 mb-4">
        Chunk 1: rim, bevel, convex face. Diagnostic material only — no glass, no
        neon. Drag the light slider to rake the surface; the crown does not read
        under a head-on beam.
      </p>
      <CardBench />
    </div>
  );
}
