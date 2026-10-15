"use client";

/**
 * ⛔ THE `Who we are` BUTTON'S BENCH — D-088, PASS 1 (12 October 2026): THE SHAPE ONLY, IN CLAY.
 *
 * Carl: *"We are going to take that boring white CSS button and bring it to life using Three js."*
 * Three passes, each approved by eye before the next — MESH, MATERIAL, LIGHT (the desk mark's
 * process, R-034/R-035; Next step's, D-030). This is the mesh: mid-grey, matte, no metal, lit to
 * show the geometry and nothing else. Plan v2: `~/.claude/plans/wise-exploring-sloth.md`; the
 * Architect's review: `live-work/architect-plan-response-whoweare-12-october.md`.
 *
 * ⛔ THE BOX IS MEASURED, NEVER DERIVED (Next step's rule, `nextstep-geometry.ts`). The label is a
 * real DOM span with the family's box rule — Geist, 14px/600, `letter-spacing: 0.025em`,
 * `padding: 10px 24px` (`.enquiry-nextstep-btn`, `globals.css`) — read AFTER `document.fonts.ready`,
 * and the mesh is built to whatever it measures. ⚠ The Architect caught two ways this goes wrong:
 * the letter-spacing left out of the rule, and the box read in the wrong font (`/proto/nextstep`
 * uses `system-ui`). Both are guarded: the rule is complete, and the computed font is published
 * (`data-font`) so the capture script can refuse a box read in anything but Geist.
 * ⚠ The height must come out 41 — 14 × 1.5 line-height + 20 padding. Anything else means the
 * box rule was not applied, and the capture script stops on it.
 *
 * ⛔ A BENCH, NOT A ROUTE ANYONE SHIPS. One canvas per pill, on this page only. The home page is
 * untouched until the rollout, which is its own structural decision (plan v2, Q2).
 *
 * Views, from the URL (read with `useSyncExternalStore`, as `nextstep-canvas.tsx` does — the
 * effect-and-state version trips `react-hooks/set-state-in-effect`):
 *   ?zoom=4        CAMERA zoom (sharp; the box grows so nothing is cropped). Judge the SHAPE
 *                  zoomed, the BUTTON at 1 (Carl, on the traveller: *"it looks ok zoomed in but
 *                  not at this scale"*).
 *   ?key=right     the raking key from the right (default: the left).
 *   ?tilt=1        a slow rock about both axes, so the dome's depth reads (bench only).
 *   ?label=1       show the label over the clay (the measuring span is otherwise invisible).
 *   ?mode=clay     pass 1's clay (approved, R-042). Default since pass 2: TEAL METAL in the pill's own studio (`PILL_STUDIO`).
 *   ?ink=0a0a0a    the label's colour (hex, no #); ?rough= ?envint= the metal's dials.
 *   ?text3d=0      the label as flat DOM text (the "before"); default on the metal: EXTRUDED. ?depth= its depth, px.
 *   ?light=0       pass 2's look (no direct light); default since pass 3: one static light from the right.
 *                  ?lightang= (off the face's normal, 90 = along it) ?lightel= ?lightint=.
 *   ?label=0       hide the label on the metal (the contrast measure reads the bare surface this way).
 *   ?profile=nextstep  Next step's own cross-section (its 6.6 px skirt) instead of the family's smaller
 *                  rim — the "before" for take 3, and the setting the parity check reads.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FAMILY_BAND } from "@/components/ui/button-family-geometry";
import {
  BEVEL_DEFAULT,
  EXTRUDE_DEPTH_DEFAULT,
  INK_DEFAULT,
  KEY_DEFAULTS,
  measureLabel,
  PillCanvas,
  TEAL_DEFAULTS,
  BOX_RULE,
  type Glyphs,
} from "./whoweare-button-scene";

/*
 * ⚠ THE SCENE MOVED (12 October 2026, the rollout): the materials, the studio, the extruded label, the key light and the
 * canvas now live in `whoweare-button-scene.tsx`, shared with the home page. This file keeps the bench's URL dials and
 * its two pills.
 */

function readParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

/** A URL value, read the way the server cannot see — no state write. A navigation remounts. */
function useParam(key: string, fallback: string): string {
  return useSyncExternalStore(
    () => () => {},
    () => readParam(key) ?? fallback,
    () => fallback,
  );
}

/**
 * A family member: the label measured, then the pill built to that box.
 * `fixed` skips the measurement — used for the module rendered at Next step's own size.
 */
export function FamilyPill({ label, fixed, id }: { label: string; fixed?: { w: number; h: number }; id: string }) {
  const zoom = Number(useParam("zoom", "1")) || 1;
  const side = useParam("key", "left") === "right" ? "right" : "left";
  const tilt = useParam("tilt", "0") === "1";
  // ?profile=nextstep renders Next step's own cross-section (the parity check's setting; the "before").
  const legacy = useParam("profile", "family") === "nextstep";
  // Pass 2: teal metal by default; ?mode=clay is pass 1's look (approved, R-042), kept for comparison and the film.
  // ?mode=teal (12 October, session 2): the clay, coloured — no metal (Carl: "take the metalness out for now and just colour
  // it teal"); ?paint= (hex) sets the colour, the brand teal by default. The label shows, extruded, as on the metal.
  const mode = useParam("mode", "metal");
  const metal = mode !== "clay" && mode !== "teal";
  const paintParam = useParam("paint", "1fb2c4");
  const paintMetal = Math.min(1, Math.max(0, Number(useParam("metalness", "0")) || 0));
  // ?paintrough= — the painted clay's roughness (the second ramp: 0.6, the clay's, down toward the metal's 0.25).
  const paintRough = Math.min(1, Math.max(0.02, Number(useParam("paintrough", "0.6")) || 0.6));
  const paint = mode === "teal" ? "#" + (/^[0-9a-f]{6}$/i.test(paintParam) ? paintParam : "1fb2c4") : undefined;
  const rough = Number(useParam("rough", String(TEAL_DEFAULTS.roughness)));
  const envInt = Number(useParam("envint", String(TEAL_DEFAULTS.envMapIntensity)));
  const ink = "#" + useParam("ink", INK_DEFAULT).replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  // ?side=1e1e24 — the letters' side colour (13 October, the gold member); absent = the teal's SIDE_INK.
  const sideParam = useParam("side", "");
  const sideInk = /^[0-9a-f]{6}$/i.test(sideParam) ? "#" + sideParam : undefined;
  // The label shows on the metal unless ?label=0; on clay only with ?label=1.
  const labelParam = useParam("label", "");
  const labelOn = metal || paint ? labelParam !== "0" : labelParam === "1";
  // Since 12 October the label on the metal is EXTRUDED in three.js; ?text3d=0 is the flat DOM text (the "before").
  const text3dParam = useParam("text3d", "1");
  // Clay with ?label=1 extrudes too (the roll: the words must come round on the back).
  const text3d = (metal || !!paint || mode === "clay") && text3dParam !== "0";
  // ⛔ THE ROLL (pass 1 reopened, 12 October, session 2): ?roll=1 makes the pill solid (?band=, a fraction of the height) and
  // turns it forward — ?rollt= a half-turn's seconds, ?rolla= the speed curve (0 steady … 0.95 near-hold), ?rollat= degrees
  // frozen; ?near= px: the pointer within it of the button holds it on the nearest face.
  const rollOn = useParam("roll", "0") === "1";
  const bandFrac = Number(useParam("band", String(FAMILY_BAND)));
  const rollHalf = Number(useParam("rollt", "5")) || 5;
  const rollEase = Number(useParam("rolla", "0.7"));
  const rollAtParam = useParam("rollat", "");
  const near = Number(useParam("near", "60"));
  const [hold, setHold] = useState(false);
  // ?scale= (12 October, session 2 — Carl: *"It can be bigger, much bigger."*): the box rule's font and padding × scale, so
  // the pill (built to the measured box, its crown proportional to its height) and the letters grow together; the
  // extrusion depth with them. 1 = the family's 41 px.
  const scale = Math.min(4, Math.max(0.5, Number(useParam("scale", "1")) || 1));
  const depth = Number(useParam("depth", String(EXTRUDE_DEPTH_DEFAULT))) * scale;
  const bevel = Number(useParam("bevel", String(BEVEL_DEFAULT)));
  // Pass 3, step 1: the static key from the right — on by default on the metal; ?light=0 is pass 2's look.
  const keyOn = useParam("light", "1") !== "0";
  const keyAngle = Number(useParam("lightang", String(KEY_DEFAULTS.angle)));
  const keyEl = Number(useParam("lightel", String(KEY_DEFAULTS.elevation)));
  const keyInt = Number(useParam("lightint", String(KEY_DEFAULTS.intensity)));
  // Pass 3: ?studio=logo — the about logo's studio, turned by ?studioyaw= (degrees), the director's method.
  const studioParam = useParam("studio", "pill");
  const studio = studioParam === "logo" ? "logo" : studioParam === "teal" ? "teal" : "pill";
  const glint = Number(useParam("glint", "0.5"));
  const fill = Number(useParam("fill", "1"));
  const floor = Number(useParam("floor", "1"));
  const surround = Number(useParam("surround", "0"));
  // ?bg=0f3a40 — the studio's background as a colour (light take 10: the gaps filled in teal); wins over ?surround=.
  const bgParam = useParam("bg", "");
  const fillSize = Number(useParam("fillsize", "1")); // the front fill's size (light take 11)
  const top = Number(useParam("top", "1")); // the studio's broad top panel (light take 11)
  const studioBg = /^[0-9a-f]{6}$/i.test(bgParam) ? "#" + bgParam : "";
  const helpers = useParam("lighthelpers", "0") === "1";
  // The moving softbox (option 2): on with the teal studio unless ?ml=0; ?mt=0…1 freezes it on its path.
  const mlParam = useParam("ml", "1");
  const mtParam = useParam("mt", "");
  const mliParam = useParam("mli", "");
  const mlSizeParam = useParam("mlsize", "1");
  const mlKindParam = useParam("mlkind", "panel");
  const mlLiftParam = useParam("mllift", "0");
  const moving = { on: (studio === "teal" || mode === "teal") && mlParam !== "0", frozen: mtParam === "" ? null : Math.min(1, Math.max(0, Number(mtParam))), intensity: mliParam === "" ? undefined : Number(mliParam), size: Number(mlSizeParam) || 1, kind: mlKindParam === "lamp" ? ("lamp" as const) : ("panel" as const), lift: Number(mlLiftParam) || 0, dip: { depth: Number(useParam("mldip", "0")) || 0, at: Number(useParam("mldipat", "0.5")), width: Number(useParam("mldipw", "0.25")) } };
  const studioYaw = Number(useParam("studioyaw", "0"));
  // ⛔ THE LOGO STANDARD (15 October 2026): ?env=hdri — the studio's REFLECTION on the painted metal (`FAMILY_HDRI_SRC`);
  // ?envint= its strength (shared with the metal path), ?envyaw= (degrees) the studio turned about the vertical.
  const env = useParam("env", "none") === "hdri" ? ("hdri" as const) : ("none" as const);
  const envYaw = Number(useParam("envyaw", "0")) || 0;
  // ?envroom= — the studio's ROOM (everything below luminance 1) multiplied by this; the softboxes untouched (`loadHdri`).
  const envRoom = Math.min(1, Math.max(0, Number(useParam("envroom", "1"))));

  const span = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; font: string; glyphs: Glyphs } | null>(null);
  const baseMark = useRef<HTMLSpanElement>(null);

  // The pointer near the button holds the roll (Carl: "mouse proximity so its static when a user decides to press it").
  useEffect(() => {
    if (!rollOn || fixed) return;
    const onMove = (e: PointerEvent) => {
      const el = span.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      setHold(Math.hypot(dx, dy) <= near);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [rollOn, fixed, near]);

  useEffect(() => {
    if (fixed) return;
    const el = span.current;
    if (!el) return;
    let live = true;
    const measure = () => {
      if (!live) return;
      // Where the browser draws each character and the baseline — the shared measure (`measureLabel`).
      setBox(measureLabel(el, baseMark.current));
    };
    // ⚠ After the webfont, never before: a fallback face measures a different width.
    void document.fonts.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [fixed]);

  const w = fixed?.w ?? box?.w;
  const h = fixed?.h ?? box?.h;

  return (
    <div
      id={id}
      data-box-w={w ?? ""}
      data-box-h={h ?? ""}
      data-font={fixed ? "fixed" : (box?.font ?? "")}
      data-hold={rollOn ? (hold ? "1" : "0") : undefined}
      style={{
        position: "relative",
        display: "inline-block",
        width: fixed?.w,
        height: fixed?.h,
        // ⚠ Zoom grows the canvas, not the layout — take 1's 4x view overlapped the other pill and the captions.
        // Reserve the zoomed box's extra room round the real-size footprint.
        margin:
          w && h && helpers && !fixed
            ? "110px 140px" // the studio's panels drawn round the button need the room (HELPER_PAD)
            : w && h && zoom > 1
              ? `${((zoom - 1) * h) / 2}px ${((zoom - 1) * w) / 2}px`
              : undefined,
      }}
    >
      {w && h ? <PillCanvas
          w={w}
          h={h}
          zoom={zoom}
          side={side}
          tilt={tilt}
          legacy={legacy}
          metal={metal}
          rough={rough}
          envInt={envInt}
          studio={studio}
          studioYaw={studioYaw}
          glint={glint}
          fill={fill}
          floor={floor}
          surround={surround}
          studioBg={studioBg}
          top={top}
          paint={paint}
          paintMetal={paintMetal}
          paintRough={paintRough}
          env={env}
          envYaw={envYaw}
          envRoom={envRoom}
          band={rollOn && !fixed ? bandFrac * h : 0}
          roll={{ on: rollOn && !fixed, half: rollHalf, ease: rollEase, hold, at: rollAtParam === "" ? null : Number(rollAtParam) }}
          fillSize={fillSize}
          helpers={helpers && !fixed}
          moving={moving}
          label={{ glyphs: labelOn && text3d && !fixed ? (box?.glyphs ?? null) : null, depth, ink, bevel, side: sideInk }}
          keyLight={{ on: keyOn, angle: keyAngle, elevation: keyEl, intensity: keyInt }}
        /> : null}
      <span
        ref={span}
        style={{
          ...BOX_RULE,
          ...(scale !== 1 && !fixed ? { fontSize: 14 * scale, padding: `${10 * scale}px ${24 * scale}px` } : {}),
          position: "relative",
          color: ink,
          // The DOM text is shown only when the label is NOT extruded (the "before", or clay with ?label=1).
          visibility: labelOn && !text3d && zoom === 1 && !fixed ? "visible" : "hidden",
        }}
      >
        {label}
        {/* A zero-size marker on the baseline: its top IS the baseline, for placing the extruded letters. */}
        <span ref={baseMark} aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, verticalAlign: "baseline" }} />
      </span>
    </div>
  );
}
