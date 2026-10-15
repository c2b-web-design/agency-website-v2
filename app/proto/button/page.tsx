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
  const painted = sp.mode === "teal"; // the clay, coloured teal (no metal)
  // Pass 2's look is the pill's own studio with no key; with the logo's studio (?studio=) it is pass 3's light.
  const unlit = sp.light === "0" && !sp.studio;
  const caption = { color: "#666", fontSize: 12, letterSpacing: "0.08em" } as const;
  // ?context=home (12 October, session 2 — Carl: "look at the text as a whole in its container. Now look at our button. It
  // can be bigger, much bigger."): the home `#contact` section's heading and paragraph above the one pill, in the home page's
  // own classes, so its size is judged where it lives. ⚠ The copy is REPEATED from `app/page.tsx` — a bench, kept by hand.
  // ?member=start (13 October 2026): `/about` §4's `Start a conversation`, the family's third member — GOLD (Carl). Built in
  // the teal button's passes, MESH → MATERIAL → LIGHT, each approved by eye; this view is the member alone, on the same
  // dials (?mode=clay ?roll=1 ?label=1 ?zoom= …). One pill only (Carl: one image of the current state, not a comparison).
  if (sp.member === "start") {
    return (
      <main style={{ minHeight: "calc(100 * var(--vh))", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3.5rem" }}>
        {/* Pass 2 (13 October): the gold as PAINT on the clay's material and lamps, turned to metal — the teal's method
            (R-045): ?mode=teal&paint=ffe39e (the desk mark's gold F0, linear 1.0/0.77/0.34, as sRGB)&metalness=1&paintrough=0.4,
            ?ml=0 (the moving lamp is pass 3), ?ink=121212 or 1e1e24. */}
        <div style={caption}>{clay ? "PASS 1: THE MESH, IN CLAY" : painted ? "PASS 2: THE MATERIAL, GOLD" : "START A CONVERSATION"}</div>
        <FamilyPill id="start-pill" label="Start a conversation" />
        <div style={caption}>START A CONVERSATION, BUILT TO ITS MEASURED LABEL</div>
      </main>
    );
  }
  // ?member=next (14 October 2026): the `Next step` button REDONE as the family's PLATINUM BLUE member. Carl: *"make it a
  // platinum blue version of the Teal and Gold pill. It was made a few months ago, we both can do better now."* The gold's
  // method — MESH → MATERIAL → LIGHT on this bench, each approved by eye, the teal and gold as reference — at Next step's own
  // label (the box rule measures "Next step" at 116.3 × 41, the size it has in the Q&A), on the same dials. ⚠ The bench only:
  // the live Next step on /start (`nextstep-canvas.tsx`, its persistent surface host) is untouched until the rollout.
  if (sp.member === "next") {
    return (
      <main style={{ minHeight: "calc(100 * var(--vh))", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3.5rem" }}>
        {/* The caption follows the pass: ?ml=0 (no moving lamp) is pass 2's look, the lamp on is pass 3's. */}
        <div style={caption}>{clay ? "PASS 1: THE MESH, IN CLAY" : painted ? (sp.ml === "0" ? "PASS 2: THE MATERIAL, PLATINUM BLUE" : "PASS 3: THE LIGHT") : "NEXT STEP"}</div>
        <FamilyPill id="next-pill" label="Next step" />
        <div style={caption}>NEXT STEP, BUILT TO ITS MEASURED LABEL</div>
      </main>
    );
  }
  if (sp.context === "home") {
    return (
      <main className="bg-neutral-950 text-white min-h-[calc(100*var(--vh))] flex items-center">
        <div className="w-full px-6">
          {/* ?h2= ?p= (px) and ?w= ?pw= (max widths, px), ?pgap= (heading → paragraph): Carl, the same session, on the 2×
              button — "the text and subtext look too small now, increase the size so the page as a whole feels
              proportionate." Defaults are the home page's: text-3xl 30, text-base 16, max-w-2xl 672, max-w-xl 576, mt-6 24. */}
          <div className="text-center mx-auto" style={{ maxWidth: Number(sp.w) || 672 }}>
            <h2 className="font-semibold tracking-tight" style={{ fontSize: Number(sp.h2) || 30, lineHeight: 1.15 }}>Start with a sharper digital presence.</h2>
            <p className="text-neutral-400 leading-relaxed mx-auto" style={{ fontSize: Number(sp.p) || 16, maxWidth: Number(sp.pw) || 576, marginTop: Number(sp.pgap) || 24 }}>
              Whether you need a bespoke website, a stronger first impression, or a smarter
              way to handle enquiries, C2B begins with understanding what your business
              needs to become.
            </p>
            {/* ?gap= (px; the home page's `mt-10` = 40): Carl, the same session — "if you have to move the text up to achieve a
                good balance then do that. Dont try to cram it in at the bottom." The section centres its content, so a
                bigger gap lifts the heading and paragraph. */}
            <div className="flex justify-center" style={{ marginTop: Number(sp.gap) || 40 }}>
              <FamilyPill id="whoweare-pill" label="Who we are" />
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main
      style={{
        minHeight: "calc(100 * var(--vh))",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "3.5rem",
      }}
    >
      <div style={caption}>{clay ? "PASS 1: THE MESH, IN CLAY" : painted ? (Number(sp.metalness) > 0 ? `THE MESH IN TEAL, METALNESS ${sp.metalness}` : "THE MESH IN TEAL, NO METAL") : unlit ? "PASS 2: THE MATERIAL, TEAL METAL" : "PASS 3: THE LIGHT"}</div>

      <FamilyPill id="whoweare-pill" label="Who we are" />
      <div style={caption}>WHO WE ARE, BUILT TO ITS MEASURED LABEL</div>

      <FamilyPill id="family-at-nextstep" label="Next step" fixed={{ w: NEXTSTEP_WIDTH_PX, h: NEXTSTEP_HEIGHT_PX }} />
      <div style={caption}>THE SAME SHAPE AT NEXT STEP&apos;S SIZE: 116.3 × 41</div>
    </main>
  );
}
