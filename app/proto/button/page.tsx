import { FamilyPill } from "@/components/home/whoweare-bench";
import { NEXTSTEP_WIDTH_PX, NEXTSTEP_HEIGHT_PX } from "@/components/enquiry/nextstep-geometry";

/**
 * Bench for the home page's `Who we are` button — D-088. Pass 1, the mesh in clay (approved, R-042; `?mode=clay`);
 * pass 2, the teal metal and the label (the default).
 *
 * ⚠ A BENCH, NOT A ROUTE ANYONE SHIPS. Delete it once the button is approved and living in
 * `#contact`.
 *
 * ⚠ THE GROUND IS `#0a0a0a`, `bg-neutral-950` — the section the button lives in. Clay does not care
 * yet; the metal in pass 2 will, because a mirror shows its surroundings.
 *
 * ⚠ THE SECOND PILL IS NOT NEXT STEP. It is the FAMILY MODULE rendered at Next step's size
 * (116.3 × 41), so the two members can be seen as one shape. What ties it to the real Next step is
 * the parity check (`live-work/scripts/family-geometry-parity.mjs`), not this page (Architect,
 * correction 2).
 *
 * ⚠ THE FONT IS THE SITE'S (Geist, from the root layout). This page sets no `fontFamily` — unlike
 * `/proto/nextstep`, whose `system-ui` would measure the label wrong.
 */
export default async function ButtonBenchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const clay = sp.mode === "clay";
  const unlit = sp.light === "0";
  const caption = { color: "#666", fontSize: 12, letterSpacing: "0.08em" } as const;
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3.5rem",
      }}
    >
      <div style={caption}>{clay ? "PASS 1: THE MESH, IN CLAY" : unlit ? "PASS 2: THE MATERIAL, TEAL METAL" : "PASS 3: THE LIGHT"}</div>

      <FamilyPill id="whoweare-pill" label="Who we are" />
      <div style={caption}>WHO WE ARE, BUILT TO ITS MEASURED LABEL</div>

      <FamilyPill id="family-at-nextstep" label="Next step" fixed={{ w: NEXTSTEP_WIDTH_PX, h: NEXTSTEP_HEIGHT_PX }} />
      <div style={caption}>THE SAME SHAPE AT NEXT STEP&apos;S SIZE: 116.3 × 41</div>
    </main>
  );
}
