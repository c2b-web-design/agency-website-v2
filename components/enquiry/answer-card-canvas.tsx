"use client";

/**
 * Q&A answer-card canvas — the WebGL proto card, mounted in the left margin
 * beside the live CSS grid.
 *
 * ⚠ BESIDE, NEVER ON TOP. Carl, 3 August 2026: *"Put the new card just to the
 * left of Card 1, top left. It must not be built on top. We can use it to
 * compare and contrast."* The five approved CSS cards keep working untouched;
 * this object is judged next to them.
 *
 * ⚠ ONE WORLD UNIT == ONE CSS PIXEL. The canvas uses an orthographic camera at
 * `zoom: 1`, so @react-three/fiber sets the frustum from the measured CSS size
 * and the mapping is exact at every viewport width. This is the same convention
 * the contact field uses, and it is why the measured 186.66 x 48 can be used
 * directly as geometry dimensions with no scale factor.
 *
 * ⚠ `frameloop="demand"` AND IT STAYS THAT WAY. The light here is STATIC —
 * Carl: *"There would be no animated light"* — so nothing needs a continuous
 * rAF loop. The entrance invalidates while it runs and then stops. The orbiting
 * light rig's continuous loop is the thing that cannot ship to production; this
 * chunk deliberately does not inherit that cost.
 *
 * GEOMETRY PROOF ONLY: no glass, no transmission, no environment map, no
 * filament, no text.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  AnswerCardMesh,
  DEFAULT_TUNING,
  DEFAULT_GLASS_TUNING,
  type AnswerCardTuning,
  type GlassTuning,
  type FilamentState,
} from "./answer-card-mesh";
import {
  ENV_SHELL_RADIUS,
  ENV_KEY_COLOR,
  ENV_KEY_INTENSITY,
  ENV_FILL_COLOR,
  ENV_FILL_INTENSITY,
  RIM_METALS,
  HEAT_WHITE,
  FILAMENT_LIGHT_DISTANCE,
  FILAMENT_LIGHT_POWER,
  FILAMENT_COOL_MS,
  FILAMENT_HEAT_MS,
} from "./answer-card-glass";
import { AnswerCardBackdrop, useRegionShift } from "./answer-card-backdrop";
// ⚠ `REGION_SHIFT_MS` IS NO LONGER IMPORTED. The filament ran on the backdrop's
// 2400ms circuit clock while it travelled; it now heats in place over the CARD's
// own fade duration instead, on Carl's instruction — *"see what a filament fade
// in looks like if its the same as a card fade in."* The backdrop keeps its own
// 2400ms, so the two are no longer one clock. See `FILAMENT_HEAT_MS`.
import { CARD_BOXES } from "./answer-card-backdrop-geometry";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RISE_DURATION_MS,
  CARD_RISE_TRANSLATE_PX,
  CARD_RISE_LADDER_MS,
  CARD_RISE_SCALE_FROM,
  PROTO_MIN_VIEWPORT_PX,
  protoCanvasBox,
  cardSlotPosition,
  checkBudget,
  maxFaceTiltDegrees,
  MIN_FACE_TILT_DEGREES,
} from "./answer-card-geometry";

/**
 * How long the Q5 phrase wipe runs, in ms.
 *
 * ⚠ READ OFF `.enquiry-q-text-reveal` IN `globals.css`, the same declaration
 * `enquiry-opening.tsx`'s own `Q5_REVEAL_CLEAR_MS` is derived from. That file
 * records the history: the value was 700 until 30 July, when Carl saw the
 * stutter MOVE from the "Wh" of "What" to the "h" of "here" — 700ms is ~54% of
 * the way through a 1300ms wipe, so the work had been pushed into the remainder
 * rather than removed. **A moved symptom is not a fixed symptom.**
 */
// ⚠ THE 1300ms DEFER-THE-WHOLE-CANVAS GUARD IS GONE, DELIBERATELY, and the
// constant with it. Carl's walk puts card 1 at the reveal's MIDPOINT, which a
// guard that waits for the reveal to END makes impossible by construction.
//
// ⚠ THE STUTTER IT PROTECTED AGAINST IS STILL PROTECTED — by moving Three.js
// setup EARLIER (before the phrase) rather than later. That is the fix this file
// already prescribed for this exact moment; see the note in `AnswerCardCanvas`.
// The reveal's own duration now lives in `answer-card-geometry.ts` as
// `Q5_REVEAL_MS`, where the ladder derives card 1's entrance from it.

// ── Tuning harness ───────────────────────────────────────────────────────────

const RIG_PARAMS = [
  { key: "tubeRadius", label: "rim tube radius R", step: 0.25, min: 0.5, max: 6 },
  { key: "bevelWidth", label: "bevel width", step: 0.5, min: 1, max: 12 },
  { key: "bevelRise", label: "bevel rise", step: 0.25, min: 0, max: 8 },
  { key: "crownHeight", label: "crown height", step: 0.25, min: 0, max: 12 },
  { key: "plateauU", label: "crown plateau (long axis)", step: 0.02, min: 0, max: 0.95 },
  { key: "faceRecess", label: "face recess behind rim apex", step: 0.25, min: -2, max: 6 },
] as const;

/**
 * Chunk 2's material controls, on `[7]` and `[8]`.
 *
 * ⚠ TWO KNOBS, NOT FOUR. `thickness` and `ior` are deliberately absent: under an
 * orthographic camera their maximum effect across the whole face is 0.801px, so
 * exposing them would move numbers and change nothing visible — this project's
 * own logged trap, where a measurable change the eye cannot see means the metric
 * is not tracking what is being judged.
 *
 * ⚠ AND THERE IS NO "STAND-IN OPACITY" CONTROL. Driving opacity requires
 * `transparent: true`, which removes the backdrop from the transmission pass's
 * opaque list — the glass would stop seeing it entirely, presenting as "the
 * frost went flat" with every assertion still green.
 */
const GLASS_RIG_PARAMS = [
  { key: "roughness", label: "roughness (THE FROST)", step: 0.02, min: 0, max: 1 },
  { key: "transmission", label: "transmission", step: 0.05, min: 0, max: 1 },
  /**
   * ⚠ THE LIGHT FADER, ADDED 4 AUGUST ON CARL'S INSTRUCTION — *"If the rig has
   * no light fader we give it one and start with it low so it has hardly no
   * effect on the metal."*
   *
   * ⚠ WITHOUT IT THE MASTERING PASS CANNOT RUN AS SPECIFIED. Carl's method is
   * two faders from zero pushed up together — *"Rather than start with frosted
   * glass at a half way point, we bring the 'volume' down same for the lights,
   * and push the faders up."* With light as a file constant, one hand tunes by
   * ear and the other by editing source, which is not the same pass.
   *
   * ⚠ AND THE TWO ARE NOT INDEPENDENT: roughness drives both the transmission
   * blur AND the specular response, so the same number that softens what is
   * behind the glass also spreads the highlight across it. Moving one alone
   * gives a reading that changes when the other moves.
   *
   * Range to 2 rather than 1: 1.0 is "full env response", not a ceiling, and the
   * pass may want to push past it.
   */
  { key: "lightLevel", label: "LIGHT LEVEL (the fader)", step: 0.05, min: 0, max: 2 },
  /**
   * ⚠ THE RIM'S OWN ROUGHNESS, AND IT IS THE DIAL WITH REAL RANGE ON IT.
   *
   * Carl asked which metal reflects best when off. The honest answer is that at
   * ~4px of tube the base colour barely registers — `roughness` is what decides
   * whether the rim reads as polished trim or as drawn wire, which is the
   * difference his reference photographs actually show.
   */
  { key: "rimRoughness", label: "rim roughness [r]", step: 0.02, min: 0, max: 1 },
  /**
   * ⚠ THE FILAMENT'S OWN FADER, AND IT STARTS LOW BY INSTRUCTION. Carl: *"it
   * should be dialed down, so only some 'juice' is flowing through it. Coming
   * from a position of 'low volume' and pushing faders up, filament intensity
   * combined with frosted glass is the way to go here."*
   *
   * ⚠ IT IS THE PARTNER OF `roughness` IN THE MASTERING PASS, not an independent
   * control — the amber's visibility through the face depends on the frost, and
   * the frost's read depends on what is behind it. Both move together.
   */
  { key: "filamentIntensity", label: "FILAMENT intensity [f]", step: 0.05, min: 0, max: 3 },
] as const;

/**
 * The rim metal, cycled with `[m]` rather than nudged with the arrows.
 *
 * ⚠ A LIST, NOT A SLIDER, because metals are discrete materials rather than
 * points on a scale — interpolating tungsten toward silver describes nothing
 * real. See `RIM_METALS` for the reflectance table and for why the bright end
 * carries a cost.
 */
const METAL_CYCLE_KEY = "m";

type RigParamKey = (typeof RIG_PARAMS)[number]["key"];
type GlassRigParamKey = (typeof GLASS_RIG_PARAMS)[number]["key"];

/**
 * Keyboard tuning, mirroring `useLightRig` in `contact-field-light-rig.tsx`.
 *
 * ⚠ GATED ON `?cardrig=1` AND **NOT** DEFAULTED ON FOR LOCALHOST, unlike the
 * orbiting light. That rig earned its localhost default by being a finished,
 * judged effect; this one binds the ARROW KEYS, which would otherwise be live on
 * every local page load — including while Carl is typing in the contact field at
 * completion.
 *
 * ⚠ THE INPUT GUARD IS LOAD-BEARING for the same reason: the corridor has real
 * text inputs, and a tuning rig that swallows arrow keys inside them would be a
 * genuine bug rather than a harmless dev affordance.
 */
function useCardRig(): {
  enabled: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
} {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("cardrig") === "1",
  );
  const [tuning, setTuning] = useState<AnswerCardTuning>(DEFAULT_TUNING);
  /**
   * ⚠ `?roughness=` AND `?standin=0` EXIST FOR THE HARNESS, not for tuning by
   * hand. The chunk's product is a table of "at what roughness does each stroke
   * width stop being distinguishable", which requires sweeping roughness from
   * outside the page and capturing a stand-in-free reference frame. Both are
   * read once at mount; the keyboard rig remains the interactive route.
   */
  const [glassTuning, setGlassTuning] = useState<GlassTuning>(() => {
    if (typeof window === "undefined") return DEFAULT_GLASS_TUNING;
    const q = new URLSearchParams(window.location.search);
    const next = { ...DEFAULT_GLASS_TUNING };

    const r = Number(q.get("roughness"));
    if (q.get("roughness") !== null && Number.isFinite(r)) {
      next.roughness = Math.min(1, Math.max(0, r));
    }

    // ⚠ `?light=` MIRRORS `?roughness=` AND EXISTS FOR THE SAME REASON: a
    // harness must be able to sweep a fader from outside the page. The keyboard
    // rig stays the interactive route; this is how a probe holds the fader at a
    // known value across several loads.
    const l = Number(q.get("light"));
    if (q.get("light") !== null && Number.isFinite(l)) {
      next.lightLevel = Math.min(2, Math.max(0, l));
    }

    return next;
  });
  const [selected, setSelected] = useState<RigParamKey | GlassRigParamKey>("roughness");

  // ⚠ THE `?standin=1` / `[s]` CALIBRATION-STROKE TOGGLE IS GONE, because the
  // thing it toggled is gone. The stand-in was a throwaway measuring instrument;
  // the real lockup is behind the card now, and it carries far more detail than
  // four parallel bars ever did.
  //
  // The history is worth keeping even though the code is not: the strokes first
  // shipped ON, so an ordinary load showed four white bars across the card and
  // Carl reasonably asked what they were — a measuring instrument rendering by
  // default reads as a design decision. Turning the whole stand-in OFF then
  // removed the backdrop too and the card became a pale grey slab: *"No glass."*
  //
  // ⚠ ONE CAUSE UNDER BOTH REPORTS, AND IT IS STILL THE GOVERNING FACT: GLASS
  // OVER A NEAR-BLACK PAGE SHOWS NEAR-BLACK. The backdrop is not decoration
  // behind the cards; it is the content the cards are lenses onto.

  useEffect(() => {
    if (!enabled) return;

    const report = (t: AnswerCardTuning, g: GlassTuning) => {
      const check = checkBudget(t.tubeRadius, t.bevelWidth);
      const tilt = maxFaceTiltDegrees(t.crownHeight, t.tubeRadius, t.bevelWidth);
      const mark = (k: string) => (k === selected ? "▶" : " ");
      console.log(
        [
          "── card rig ──────────────────────────────",
          "  GEOMETRY  [1-6]",
          ...RIG_PARAMS.map(
            (p) => `${mark(p.key)} ${p.label.padEnd(30)} ${t[p.key].toFixed(2)}`,
          ),
          "  MATERIAL  [7-9, then 0 is print]",
          ...GLASS_RIG_PARAMS.map(
            (p) => `${mark(p.key)} ${p.label.padEnd(30)} ${g[p.key].toFixed(2)}`,
          ),
          `  rim metal  [m]                 ${RIM_METALS[g.rimMetal]?.name ?? "?"}`,
          "  ─────",
          `  face                           ${check.budget.faceWidth.toFixed(2)} x ${check.budget.faceHeight.toFixed(2)}`,
          `  face corner radius             ${check.budget.faceRadius.toFixed(2)}`,
          `  face height ratio              ${(check.budget.faceHeightRatio * 100).toFixed(1)}%`,
          // ⚠ Analytic prediction, for tuning only. Verification reads the built
          // geometry's own normals — see maxFaceTiltDegrees's own warning.
          `  max face tilt (predicted)      ${tilt.toFixed(2)}° (floor ${MIN_FACE_TILT_DEGREES}°)`,
          check.ok ? "  budget OK" : `  ⚠ BUDGET FAIL: ${check.failures.join("; ")}`,
          tilt >= MIN_FACE_TILT_DEGREES ? "  tilt OK" : "  ⚠ TILT BELOW FLOOR — convexity will not read",
          // ⚠ thickness and ior are FIXED and absent by design — under an
          // orthographic camera their whole-face effect is 0.801px.
          "  (thickness/ior fixed — 0.8px max effect under ortho)",
        ].join("\n"),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }

      const numeric = Number(e.key);
      if (numeric >= 1 && numeric <= RIG_PARAMS.length) {
        e.preventDefault();
        setSelected(RIG_PARAMS[numeric - 1].key);
        return;
      }
      // ⚠ ONLY THE FIRST THREE MATERIAL PARAMS GET DIGITS — [7], [8], [9].
      // A fourth would map to "10", which is not a single keypress, and its
      // leading character would collide with [0] = print. The fourth is bound to
      // a letter below rather than silently unreachable.
      if (
        numeric > RIG_PARAMS.length &&
        numeric <= RIG_PARAMS.length + GLASS_RIG_PARAMS.length &&
        numeric <= 9
      ) {
        e.preventDefault();
        setSelected(GLASS_RIG_PARAMS[numeric - RIG_PARAMS.length - 1].key);
        return;
      }
      // Rim roughness — the fourth material param, on [r].
      if (e.key === "r") {
        e.preventDefault();
        setSelected("rimRoughness");
        return;
      }
      // The filament's fader — the fifth material param, on [f].
      if (e.key === "f") {
        e.preventDefault();
        setSelected("filamentIntensity");
        return;
      }
      if (e.key === METAL_CYCLE_KEY) {
        e.preventDefault();
        setGlassTuning((g) => {
          const next = { ...g, rimMetal: (g.rimMetal + 1) % RIM_METALS.length };
          setTuning((t) => {
            report(t, next);
            return t;
          });
          return next;
        });
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        setTuning((t) => {
          setGlassTuning((g) => {
            report(t, g);
            return g;
          });
          return t;
        });
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;

        const glassSpec = GLASS_RIG_PARAMS.find((p) => p.key === selected);
        if (glassSpec) {
          setGlassTuning((g) => {
            const next = {
              ...g,
              [glassSpec.key]: Math.min(
                glassSpec.max,
                Math.max(glassSpec.min, g[glassSpec.key] + dir * glassSpec.step),
              ),
            };
            setTuning((t) => {
              report(t, next);
              return t;
            });
            return next;
          });
          return;
        }

        // Narrowed by `find` on the geometry bank: reaching here means `selected`
        // is a geometry key, since the glass branch above returns.
        const spec = RIG_PARAMS.find((p) => p.key === selected);
        if (!spec) return;
        const key = spec.key;
        setTuning((t) => {
          const next = {
            ...t,
            [key]: Math.min(spec.max, Math.max(spec.min, t[key] + dir * spec.step)),
          };
          setGlassTuning((g) => {
            report(next, g);
            return g;
          });
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKey);
    console.log(
      "card rig active — [1-6] geometry, [7-9] glass/light, [r] rim roughness, " +
        "[m] cycle rim metal, [↑/↓] adjust, [0] print",
    );
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, selected]);

  return { enabled, tuning, glassTuning };
}

// ── Entrance ─────────────────────────────────────────────────────────────────

/**
 * The card's entrance, matching CSS card 1 exactly.
 *
 * ⚠ CARRIED ACROSS, NOT REINVENTED — 700ms linear at a 220ms delay, opacity
 * 0 → 1 with a 6px rise. Carl: *"We will be moving it at the appropriate time
 * into place so the timing will stay."* Matching it means the two cards arrive
 * together and can be compared from the first frame.
 *
 * ⚠ DISABLED UNDER `prefers-reduced-motion`, because the CSS rule that drives
 * card 1 is disabled there too. A WebGL card that animated while its neighbour
 * did not would be a defect the CSS explicitly avoids.
 */
function useCardEntrance(
  active: boolean,
  reducedMotion: boolean,
  delayMs: number,
  onProgress: (p: number) => void = () => {},
) {
  const groupRef = useRef<THREE.Group | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠ HELD IN A REF SO IT IS NOT AN EFFECT DEPENDENCY. `onProgress` is a fresh
   * closure on every render, so depending on it would tear down and restart the
   * entrance whenever anything unrelated re-rendered — the card rig's `selected`
   * state churn is enough, and that is the exact defect `playedRef` exists to
   * prevent from the other direction.
   */
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    // ⚠ IN AN EFFECT, NOT DURING RENDER. `react-hooks` rejects ref access in the
    // render body ("Cannot access refs during render") — refs are for values
    // that survive renders, and writing one while rendering is the pattern that
    // makes a component's output depend on when it happened to run.
    onProgressRef.current = onProgress;
  }, [onProgress]);

  /**
   * ⚠ HIDE THE GROUP THE MOMENT THE REF IS ATTACHED, NOT IN AN EFFECT.
   *
   * A ref callback runs during commit, BEFORE the renderer draws. `useEffect`
   * runs AFTER, so a group created at its default `visible = true, opacity = 1`
   * is drawn at full brightness for at least one frame before the entrance can
   * set its start state — the card FLASHES INTO EXISTENCE, vanishes, then fades
   * in properly. Carl reported exactly that: *"comes into view very quickly,
   * disappears then back into view."*
   *
   * Setting it here means the first frame the renderer ever sees is already the
   * entrance's frame 0.
   */
  const attachGroup = useCallback(
    (group: THREE.Group | null) => {
      groupRef.current = group;
      if (!group) return;
      // ⚠ HIDDEN AT ATTACH, and shown by the tick loop's very first frame. The
      // ref callback runs during commit, BEFORE the renderer draws, so this
      // guarantees the card is never drawn at its pre-entrance position. There
      // is no hidden→visible step on screen because the first drawn frame is
      // already the entrance's frame 0.
      group.visible = false;
      group.position.y = -CARD_RISE_TRANSLATE_PX;
      // ⚠ SET HERE TOO, FOR THE SAME REASON AS `visible` AND `position`: the ref
      // callback runs during commit, before the renderer draws, so frame 0 must
      // already be the entrance's frame 0 in EVERY property it animates. A scale
      // left at 1 until the effect ran would show one full-size frame first.
      group.scale.set(CARD_RISE_SCALE_FROM, CARD_RISE_SCALE_FROM, 1);
    },
    [],
  );

  /**
   * Whether the entrance fade is still running.
   *
   * ⚠ THE FADE AND THE GLASS FIGHT EACH OTHER, and this is the third stage Carl
   * reported: *"fades in, moves slightly up then brightens."*
   *
   * The fade drives `material.opacity`, which requires `transparent = true` on
   * every sub-mesh. But `three.module.js:8237` routes ANY material with
   * `transparent === true` out of the opaque list, and `:18039` renders only
   * `opaqueObjects` into the transmission target. **So for the whole 700ms rise,
   * the rim and bevel are invisible to the glass refracting them** — and the
   * card visibly changes when the fade ends and they rejoin the opaque list.
   *
   * ⚠ IT IS THE SAME CONSTRAINT THIS CHUNK ALREADY DOCUMENTED FOR THE STAND-IN,
   * arriving from the other direction. The stand-in was made opaque on purpose;
   * the entrance was quietly making everything else transparent.
   *
   * ⚠ SO THE OPACITY FADE IS REMOVED AND THE 6px RISE IS KEPT. The meshes stay
   * opaque throughout, the transmission target never changes membership, and the
   * card is fully-formed glass from its first visible frame.
   *
   * ⚠ THIS IS A DEPARTURE FROM CARD 1's CSS ENTRANCE, which fades opacity 0 -> 1
   * as well as rising. It is accepted for the proto because Carl has already
   * settled that the test object's entrance does not need to match: *"the new
   * card is a test, it's not important it reveals with card 1, only that it's
   * there."*
   *
   * ⚠ AND IT IS A REAL CONSTRAINT FOR CHUNK 5, not a temporary shortcut. A
   * transmissive card CANNOT cross-fade by material opacity without dropping its
   * own neighbours out of the refraction for the duration. When the rollout
   * needs the approved 700ms/220ms fade, the route is a group-level effect
   * (scale, position, or a masked reveal) — never per-material opacity.
   */

  /**
   * ⚠ THE ENTRANCE RUNS ONCE PER ACTIVATION, GUARDED BY A REF.
   *
   * Without this the effect re-ran on every unrelated re-render — the card rig's
   * `selected` state churn is enough — resetting `start` and replaying the fade
   * from zero. That is the second half of the reported flash: the card
   * disappearing and coming back.
   */
  const playedRef = useRef(false);
  /** Whether this card's rung has been reached; drives the dev beat trace. */
  const shownRef = useRef(false);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (!active) {
      group.visible = false;
      playedRef.current = false;
      shownRef.current = false;
      invalidate();
      return;
    }

    if (playedRef.current) return;
    playedRef.current = true;

    // ⚠ DELIBERATELY NOT `group.visible = true` HERE.
    //
    // An earlier version did, and the tick loop then set it straight back to
    // false for the 220ms delay — so the card rendered at full brightness for
    // one frame before disappearing and rising. That was the last of Carl's
    // four entrance reports: *"it appears, flashes and moves up."*
    //
    // Visibility is owned by the tick loop alone, from here on. There is exactly
    // one place that decides whether the group is on screen.

    if (reducedMotion) {
      group.visible = true;
      group.position.y = 0;
      group.scale.set(1, 1, 1);
      invalidate();
      return;
    }

    // ⚠ THE STAGGER IS BACK, AND THE COMMENT THAT REMOVED IT HAS EXPIRED.
    //
    // It previously said: *"`CARD_RISE_DELAY_MS` (220) exists to stagger card 1
    // against its four neighbours. This proto card has no neighbours, so a
    // further 220ms of deliberate invisibility buys nothing"* — and predicted its
    // own reversal: *"THE STAGGER RETURNS IN CHUNK 5, where it means something:
    // five cards on the approved 220/350/480/610/740 ladder."*
    //
    // **That is now.** The cards have neighbours, so the delay means something
    // again: it is the sequence Carl asked for — *"The cards come on in
    // sequential order. 1,2,3,4 and then 5."*
    //
    // ⚠ THE HIDDEN→VISIBLE FLASH THE OLD COMMENT WARNED ABOUT IS STILL REAL, and
    // it is handled rather than avoided: the group is hidden at attach (see
    // `attachGroup`) and the tick loop below only shows it once its own rung has
    // arrived. Visibility is still owned by exactly one place.
    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;

      // ⚠ STILL HIDDEN UNTIL THIS CARD'S RUNG. The group was hidden at attach and
      // stays hidden through its delay, so there is no frame in which it is drawn
      // early. `visible` rather than `material.opacity` throughout, which would
      // require `transparent = true` and drop the rim and bevel out of the
      // transmission target for the whole rise — see the note on `attachGroup`.
      if (elapsed < delayMs) {
        // Held at zero through the delay — unlit, not merely invisible, so the
        // first lit frame is the entrance's own frame 0 in light as well as in
        // position.
        onProgressRef.current(0);
        raf = requestAnimationFrame(tick);
        return;
      }

      // ⚠ A DEV-ONLY BEAT TRACE, gated on `?beattrace=1`.
      //
      // Four pixel-reading instruments failed to answer "does the entrance
      // run": `gl.readPixels` and in-page `drawImage` both return an empty
      // buffer under `frameloop="demand"`, and Playwright's first
      // `screenshot()` costs ~4900ms — longer than the entrance it was meant to
      // catch. All three reported ABSENCE, which is what a broken entrance
      // reports too.
      //
      // The animation's own clock is the honest source, so it says when it
      // starts. Costs one `performance.mark` per card per run, and nothing at
      // all without the flag.
      if (!shownRef.current) {
        shownRef.current = true;
        if (typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("beattrace") === "1") {
          performance.mark(`card-beat-${delayMs}`);
        }
      }

      group.visible = true;

      const raw = Math.min(1, (elapsed - delayMs) / CARD_RISE_DURATION_MS);
      onProgressRef.current(raw);

      /**
       * ⚠ EASED, NOT LINEAR — AND THIS REOPENS AN ACCEPTED TRADE-OFF ON CARL'S
       * REPORT: *"still, no fade and far too fast."*
       *
       * ⚠ THE CARD CANNOT FADE BY OPACITY, AND THAT IS NOT A PREFERENCE.
       * `material.opacity` requires `transparent = true`, which routes a
       * material out of `opaqueObjects` (`three.module.js:8237`) and therefore
       * out of the transmission target (`:18039`) — so the rim and bevel would
       * VANISH FROM THE GLASS REFRACTING THEM for the whole entrance, and the
       * card would visibly change when they rejoined. That is exactly why the
       * opacity fade was removed on 3 August.
       *
       * ⚠ SO THE SOFTNESS COMES FROM MOTION INSTEAD OF FROM ALPHA. A cubic
       * ease-out plus a small scale-up reads as an arrival rather than a snap,
       * and every mesh stays opaque for every frame of it — no membership of the
       * transmission target ever changes.
       */
      const t = 1 - Math.pow(1 - raw, 3);

      // World +y is UP and the CSS translate is DOWN, hence the negation.
      group.position.y = -CARD_RISE_TRANSLATE_PX * (1 - t);

      // ⚠ A SCALE ENTRANCE IS THE ONE ROUTE OPACITY CANNOT BLOCK. Kept small —
      // this is a card settling into its slot, not a pop.
      const s = CARD_RISE_SCALE_FROM + (1 - CARD_RISE_SCALE_FROM) * t;
      group.scale.set(s, s, 1);

      invalidate();

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion, delayMs, invalidate]);

  return attachGroup;
}

/**
 * Drive the filament's circuit: the head leaves the origin and meets itself.
 *
 * ⚠ ONE MECHANISM PRODUCES BOTH THE TRAVEL AND THE RESTING LIT STATE. The
 * filament design reference is explicit that these are not two steps: *"The rim
 * behind the head stays warm rather than snapping back to grey... By the end of
 * the circuit the whole rim is hot... SO THE CARD ENDS IN THE RESTING SELECTED
 * STATE WITHOUT A SEPARATE STEP."*
 *
 * The tail does that on its own. As the head approaches `t = 1` its trailing
 * warmth has wrapped the entire perimeter, so holding the head at the origin
 * once the circuit completes leaves the whole rim lit.
 *
 * ⚠ AND THE HEAD RUNS ONCE, NOT ON A LOOP. A filament that kept circling would
 * be an animation playing; this is a state being reached.
 */
function useFilament(lit: boolean, intensityTarget: number): FilamentState {
  const intensity = useRef(0);
  /** Position on the black-body ramp, 0 = first red glow, 1 = settled. */
  const temperature = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠ THE FIRST RUN IS SKIPPED SO AN UNFIRED CARD DOES NOT PLAY A COOL-DOWN.
   * `lit` starts false, and without this the mount would run the fade-out branch
   * on every card — harmless to look at, but it would light the whole scene's
   * worth of rAF loops for nothing on first paint.
   */
  const hasFired = useRef(false);

  useEffect(() => {
    if (!lit) {
      if (!hasFired.current) {
        intensity.current = 0;
        invalidate();
        return;
      }

      /**
       * ⚠ THE COOL-DOWN IS UNIFORM, NOT A SECOND CIRCUIT — and that is physics
       * rather than a shortcut.
       *
       * Carl, 4 August: *"pressing inside the card should have all the filament
       * fading out."* **All of it**, which is what actually happens: current
       * stops everywhere at once, so the whole element cools together. A
       * travelling un-lighting would imply the power is being withdrawn from one
       * end, which is not a thing.
       *
       * ⚠ AND THE HEAD IS LEFT WHERE IT IS. Resetting it to zero would slide the
       * hot spot back to the origin as it dimmed — a visible movement during
       * what should be a still fade.
       */
      let raf = 0;
      const start = performance.now();
      const from = intensity.current;
      const fromTemp = temperature.current;
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / FILAMENT_COOL_MS);
        // Metal cools fast at first and lingers dull — the inverse of the ramp
        // in, and the reason a linear fade reads as a dimmer being turned down.
        intensity.current = from * (1 - t) * (1 - t);
        // ⚠ THE COLOUR COOLS TOO, back down the black-body ramp. A filament
        // losing power passes white → orange → red on the way out, exactly as it
        // climbed on the way in. Holding the colour while only the brightness
        // fell would read as a dimmer switch rather than as metal cooling.
        temperature.current = fromTemp * (1 - t);
        invalidate();
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    hasFired.current = true;

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / FILAMENT_HEAT_MS);

      /**
       * ⚠ THE WHOLE FILAMENT HEATS AT ONCE. THERE IS NO TRAVELLING HEAD.
       *
       * Carl, 4 August, reframing the chunk after the circuit was working:
       *
       * > *"the filament must become active to show that a choice has been
       * > selected. does it have to move? become animated? No. it could fade in,
       * > like a real light bulb filament. How does light/heat work? Start of
       * > red, orange, white. blue"*
       *
       * ⚠ HE IS DESCRIBING THE BLACK-BODY CURVE, AND IT IS LITERAL PHYSICS.
       * Incandescence follows temperature: dull red ~800K, orange ~1300K,
       * yellow-white ~2000K, white ~2800K — which is where a working tungsten
       * bulb actually sits. The colour sequence is not a stylisation; it is what
       * the metal does on its way up, compressed.
       *
       * ⚠ AND IT DELETES FOUR DEFECTS RATHER THAN FIXING THEM. The phantom
       * second head, the hard origin edge, the constant-anchored back-bleed and
       * the 15px bevel lag all existed BECAUSE something moved along a path.
       * With no path, none of them can occur — and the unsolved head-versus-trail
       * contrast stops being a question at all.
       *
       * `head` is kept at 1 so every point on the rim reads as "reached": the
       * shader's circuit position still works, it simply applies everywhere.
       */

      // ⚠ EASED, NOT LINEAR. A filament does not heat at a constant rate — it
      // rushes toward temperature and settles. Linear would read as a dimmer.
      intensity.current = intensityTarget * (1 - Math.pow(1 - t, 3));

      // The colour's own journey up the black-body curve, 0 = first red glow,
      // 1 = the settled warm white. Consumed by the shader.
      temperature.current = t;


      // ⚠ WITHOUT THIS THE HEAT-UP RUNS AND NOTHING IS DRAWN. The canvas is
      // `frameloop="demand"`, so `useFrame` — which copies these refs into the
      // shader uniforms — only fires on frames something else has scheduled.
      invalidate();

      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lit, intensityTarget, invalidate]);

  return { intensity, temperature };
}

/**
 * One card, on its own rung of the ladder.
 *
 * ⚠ A COMPONENT PER CARD, BECAUSE THE ENTRANCE IS A HOOK. `useCardEntrance` holds
 * one group ref and one rAF loop, so five cards need five instances of it —
 * calling it in a loop inside `CardScene` would be a conditional hook call.
 */
function AnswerCard({
  slot,
  delayMs,
  active,
  reducedMotion,
  tuning,
  glassTuning,
  envMap,
  lit,
}: {
  slot: { x: number; y: number };
  delayMs: number;
  active: boolean;
  reducedMotion: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
  envMap: THREE.Texture;
  /** Whether this card's filament has been fired. */
  lit: boolean;
}) {
  /**
   * ⚠ THE CARD FADES BY LIGHT, NOT BY ALPHA — and this is the route the ethos
   * file points at rather than a workaround for a rendering limit.
   *
   * Carl, 4 August: *"the card has to fade in. no sudden appearance. Look at the
   * other elements on the site. Its the essence of the c2b ethos file."*
   *
   * `c2b-ethos-and-vision.md` §14a: **"Nothing should feel like a sudden UI
   * toggle unless there is a deliberate reason. Elements should complete their
   * phrase before the next phrase begins."** And the rule that decides the
   * MECHANISM: **"Effects should feel caused by the world, not layered on top of
   * it."**
   *
   * ⚠ THAT SENTENCE RULES OUT AN ALPHA FADE ON ITS OWN TERMS, before any
   * three.js constraint is considered. Driving a material's opacity is a layer
   * on top of the world; a card emerging from darkness into light is the world
   * doing it. §18 agrees — *"the best motion often feels almost invisible."*
   *
   * ⚠ AND IT HAPPENS TO BE THE ONLY ROUTE THAT DOES NOT BREAK REFRACTION.
   * `transparent = true` routes a material out of `opaqueObjects`
   * (`three.module.js:8237`), and `renderTransmissionPass` renders ONLY
   * `opaqueObjects` into the target the glass samples (`:18039`). With the
   * entrances overlapping, something is always fading — so an alpha fade would
   * leave every card refracting an edgeless scene for the whole choreography.
   *
   * Two properties carry it, because the card has two kinds of surface:
   *   - rim and bevel are lit `MeshStandardMaterial` → drive `color` from black
   *   - the face is transmissive glass → drive `envMapIntensity`, since almost
   *     everything it shows is environment reflection plus what it transmits
   */
  /**
   * The filament's circuit.
   *
   * ⚠ IT RUNS ON THE SAME 2400ms AS THE REGION SHIFT, which is what makes the
   * two one event rather than two that happen to match. Carl: *"The blue pixels
   * will turn teal in the same time frame as the filament takes to do a
   * circuit."*
   *
   * ⚠ AND THE INTENSITY IS A FADER STARTING LOW, not a fixed value — Carl:
   * *"it should be dialed down, so only some 'juice' is flowing through it...
   * Rather than pick arbitrary figures. We bring the numbers up."*
   */
  const filament = useFilament(lit, glassTuning.filamentIntensity);

  const litRef = useRef<number>(0);
  const groupRef = useCardEntrance(active, reducedMotion, delayMs, (p) => {
    litRef.current = p;
  });

  return (
    <group position={[slot.x, slot.y, 0]}>
      <CardLighting progress={litRef} reducedMotion={reducedMotion}>
        <AnswerCardMesh
          tuning={tuning}
          groupRef={groupRef}
          glass
          glassTuning={glassTuning}
          envMap={envMap}
          lightLevel={glassTuning.lightLevel}
          filament={filament}
        />
      </CardLighting>

      {/*
        ⚠ THE TRAVELLING HEAD, AS A REAL LIGHT IN THE SHARED SCENE — and this is
        the whole reason the filament could not be painted.

        Carl, 4 August, walking the circuit: *"As it travels downwards it should
        have some effect on the left of card 2... as its rounding curve 2 there
        would be some effect on card 4 and not just to the left of the vertical
        line, it would bleed a little to the right on the top of card 4."*

        ⚠ THE SPILL CROSSES ONTO A DIFFERENT MESH. Nothing written into card 1's
        own material can light card 2 — only a light can. And it works only
        because all five cards share ONE scene, which is the same constraint that
        forced the two canvases to merge on 3 August: light reaches what shares
        its scene, and nothing else.

        ⚠ AND THE BLEED ACROSS A CORNER IS WHY IT IS A POINT LIGHT RATHER THAN
        ANYTHING TIGHTER. A source with real falloff illuminates an ARC as it
        rounds the curve, which is exactly Carl's *"not just to the left of the
        vertical line"*. A spotlight aimed along the path would track a line and
        miss the effect he asked for.
      */}
      <FilamentLight filament={filament} />
    </group>
  );
}

/**
 * The head's own light, moved along the circuit each frame.
 *
 * ⚠ ONE LIGHT PER CARD, AND THAT IS A REAL COST TO WATCH. Five point lights in
 * a scene with transmissive materials is not free; if it shows up as a frame-rate
 * problem the honest fix is fewer lights (one shared light driven by whichever
 * card is active), NOT a painted fake — the spill onto neighbours is the design.
 */
function FilamentLight({ filament }: { filament: FilamentState }) {
  const ref = useRef<THREE.PointLight | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    const intensity = filament.intensity.current;
    // Dark means genuinely off — a point light at zero intensity still costs a
    // shader branch per fragment, but leaving it in the scene keeps the material
    // variants stable and avoids a recompile when it lights.
    // ⚠ NOT MULTIPLIED BY `lightLevel`, AND THAT IS DELIBERATE. The scene fader
    // is the AMBIENT level — how brightly the room lights the metal. The
    // filament is its own source and does not dim because the room does; a
    // heating element in a dark room is brighter, not dimmer.
    //
    // ⚠ AND `decay: 2` MEANS INTENSITY IS IN INVERSE-SQUARE UNITS AT THIS SCALE.
    // One world unit is one CSS pixel, so a light 40px from what it lights needs
    // an intensity in the hundreds, not the tens — the same units trap that made
    // the contact field's orbiting rig need 64000.
    light.intensity = intensity * FILAMENT_LIGHT_POWER;
    if (intensity > 0) invalidate();
  });

  return (
    <pointLight
      ref={ref}
      // ⚠ STATIC AT THE CARD'S CENTRE — IT NO LONGER TRACKS A HEAD.
      //
      // While the filament travelled, this light moved with it and its position
      // was the whole point: the spill onto card 2 and card 4 came from the head
      // being NEAR them at the right moment.
      //
      // ⚠ THE FILAMENT NOW HEATS ALL AT ONCE, so the whole rim is the source and
      // there is nowhere for the light to be but the middle of it. The spill
      // onto neighbours survives — it comes from the rim being lit at all, not
      // from where along it the brightest point sits.
      //
      // ⚠ SLIGHTLY PROUD OF THE CARD (z=6) so the light is not buried inside its
      // own geometry, where it would light the rim's inner face and nothing else.
      position={[0, 0, 6]}
      color={HEAT_WHITE}
      distance={FILAMENT_LIGHT_DISTANCE}
      decay={2}
      intensity={0}
    />
  );
}

/**
 * Drives a card's materials from unlit to lit as its entrance runs.
 *
 * ⚠ IT WALKS THE SUBTREE EACH FRAME RATHER THAN HOLDING MATERIAL REFS. The mesh
 * builds its own materials declaratively and rebuilds them whenever tuning
 * changes, so a held reference would go stale the moment `?cardrig=1` moved a
 * value — silently, with the card stuck dark.
 *
 * ⚠ AND IT MUTATES MATERIALS, WHICH THE BACKDROP FILE GOES OUT OF ITS WAY TO
 * AVOID. Same justification as `useBackdropRedraw` there: the immutability rule
 * is right for ALLOCATION and cannot express ANIMATION. These materials are
 * created by `AnswerCardMesh`; this only moves numbers on them per frame.
 */
function CardLighting({
  progress,
  reducedMotion,
  children,
}: {
  progress: React.RefObject<number>;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Sampled once from the materials the mesh built, so tuning changes are
    // picked up and nothing is hard-coded here.
    const originals = new Map<THREE.Material, { color?: THREE.Color; env?: number }>();

    let raf = 0;
    let last = -1;
    const apply = () => {
      const p = reducedMotion ? 1 : progress.current;
      if (p !== last) {
        last = p;
        // Ease so the light arrives the way light does — quickly out of black,
        // then settling. A linear ramp reads as a dimmer being turned.
        const lit = p * p * (3 - 2 * p);

        group.traverse((o) => {
          const mesh = o as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
          if (!mat || Array.isArray(mat)) return;

          if (!originals.has(mat)) {
            originals.set(mat, {
              color: mat.color?.clone(),
              env: mat.envMapIntensity,
            });
          }
          const base = originals.get(mat);
          if (!base) return;

          // ⚠ TOWARD BLACK, NOT TOWARD TRANSPARENT. An unlit surface in a dark
          // scene IS the page behind it, so this reads as the card not yet
          // having arrived rather than as a ghost of it.
          if (base.color) mat.color.copy(base.color).multiplyScalar(lit);
          if (base.env !== undefined) mat.envMapIntensity = base.env * lit;
        });
        invalidate();
      }
      raf = requestAnimationFrame(apply);
    };

    raf = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(raf);
  }, [progress, reducedMotion, invalidate]);

  return <group ref={groupRef}>{children}</group>;
}

// ── Scene ────────────────────────────────────────────────────────────────────

/**
 * The environment map, generated entirely locally.
 *
 * ⚠ NO HDRI, NO CDN, NO NETWORK REQUEST. A small scene of `MeshBasicMaterial`
 * reflection panels is converted to a prefiltered radiance map by
 * `PMREMGenerator.fromScene()` on the GPU.
 *
 * ⚠ THE PATTERN IS COPIED FROM `useStudioEnvMap` IN `contact-field-canvas.tsx`;
 * THE VALUES ARE NOT. That rig's key is warm gold at intensity 7.0, tuned for a
 * gold bevel — wrong for blue glass, and its constants are `protected` because
 * tuning this card must not move an approved object.
 *
 * ⚠ THE MAP IS BUILT IN `useMemo` AND HANDED TO THE MATERIAL BY A CALLBACK REF,
 * which is a DEPARTURE from `useStudioEnvMap`'s effect-based lifecycle. The
 * reason is the lint rules, and it is worth recording because the contact
 * field's shape looks like the obvious precedent to copy:
 *
 *   - Holding the material in a container and assigning `envMap` inside an
 *     effect trips `react-hooks/immutability` in EVERY form tried —
 *     `useState<RefObject>`, a one-element `useState` array (exactly
 *     `useStudioEnvMap`'s shape), `useMemo`, and a forwarded ref. The rule
 *     traces provenance through wrapper objects, array elements and hook
 *     arguments alike.
 *   - Publishing the texture with `setEnvMap` inside the effect then trips
 *     `react-hooks/set-state-in-effect` — the SAME rule as the project's one
 *     accepted pre-existing error. Trading one rule for another is not a fix.
 *
 * ⚠ SO THE ALLOCATION MOVES OUT OF THE EFFECT, and the Strict Mode concern that
 * motivated `useStudioEnvMap`'s choice is handled instead by disposing the
 * PREVIOUS target whenever a new one is built, plus on unmount. A stranded
 * double-invoke allocation is released by the next run rather than leaking.
 *
 * The rest of the discipline is unchanged and still earns its place: DETACH
 * FROM THE MATERIAL BEFORE DISPOSING (so a disposed texture can never be
 * sampled), and `invalidate()` because the canvas runs `frameloop="demand"`.
 */
/**
 * ⚠ THIS RUNS OUTSIDE THE WARM GATE, AND THAT IS AN OPEN DEFECT.
 *
 * The `useMemo` below executes during `CardScene`'s first React render.
 * `mayCompile` / `warm` gate `useScenePrecompile` ONLY — so in the Q5 canvas this
 * ~572ms of PMREM work is not deferred by anything, and in the warm-up canvas it
 * runs a second time in its own GL context.
 *
 * Caught by the Architect, 4 August, after the Builder had gated the wrong
 * thing: `live-work/architect-answer-opening-stutter.md`.
 *
 * ⚠ IT IS NOW THE LARGEST REMAINING COST IN THE OPENING. Two routes, neither
 * taken yet: move the allocation behind the gate, or pass `{ size: 64 }` to
 * `fromScene` — the second is a VISUAL change and Carl's call.
 */
function useLocalEnvMap(): THREE.Texture {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const target = useMemo(() => {
    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

    // Panels are things to be SEEN IN a reflection, not lights: colour
    // pre-multiplied by intensity, `toneMapped: false`. Large rather than
    // fierce — a curved face reflects a wide arc, so a big soft source reads as
    // a satin sweep rather than a hot pinpoint.
    const panel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      size: [number, number],
    ) => {
      const geometry = new THREE.PlaneGeometry(size[0], size[1]);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    };

    const shellGeometry = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 16, 16);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      toneMapped: false,
    });
    studio.add(new THREE.Mesh(shellGeometry, shellMaterial));
    disposables.push(shellGeometry, shellMaterial);

    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY, [-16, 22, 18], [70, 38]);
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY, [18, -16, 14], [48, 26]);

    /**
     * ⚠ THE FOURTH ARGUMENT IS `far`, NOT THE RESOLUTION — and a comment here
     * previously claimed the opposite and forbade the real fix.
     *
     * `fromScene( scene, sigma = 0, near = 0.1, far = 100, options = {} )`
     * (`three.module.js:2706`), with `size = 256` living in `options`
     * (`:2709`). So `200` is a clip plane, and the env map has been at the
     * DEFAULT 256 throughout.
     *
     * ⚠ "DROPPING IT 200 -> 64 MOVED `fromScene` BY 5ms" WAS TRUE AND MEANT
     * NOTHING. `ENV_SHELL_RADIUS` is 60, so the studio sits inside the frustum
     * at either value — nothing could have changed. **A 5ms delta is what "I
     * changed nothing" looks like**, and it was recorded as a finding that ruled
     * the lever out. Caught by the Architect, 4 August; see
     * `live-work/architect-answer-opening-stutter.md`.
     *
     * ⚠ SIZE IS GENUINELY LOAD-BEARING: 256 gives lodMax 8 and a 768x1024 cubeUV
     * target; 64 gives lodMax 6 and 336x256 — ~9x fewer pixels and two fewer LOD
     * passes. And `_applyPMREM` is not a blur chain in 0.185, it is GGX VNDF
     * importance sampling at `GGX_SAMPLES = 256` (`:2636`) — a 256-tap loop per
     * fragment per LOD.
     *
     * ⚠ REDUCING IT IS A VISUAL CHANGE AND CARL'S CALL, not a free optimisation.
     * Left at the default until he has seen 256/128/64 side by side at the
     * approved roughness.
     */
    const pmrem = new THREE.PMREMGenerator(gl);
    const built = pmrem.fromScene(studio, 0, 0.1, 200);
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    studio.clear();

    return built;
  }, [gl]);

  // Dispose the previous target when a new one is built, and on unmount. This
  // is what replaces the effect-based allocation: a Strict Mode double-invoke
  // leaves its first target to be released here rather than stranded.
  useEffect(() => {
    invalidate();
    return () => {
      target.dispose();
      invalidate();
    };
  }, [target, invalidate]);

  // ⚠ THE TEXTURE IS RETURNED FOR A DECLARATIVE `envMap` PROP, NOT ASSIGNED
  // THROUGH A CALLBACK REF.
  //
  // The callback-ref version attached the map correctly, but only AFTER the
  // material had been created — so the first render drew the card with no
  // environment, and `needsUpdate = true` then forced a shader recompile.
  // Carl saw the result: *"Card appears in a grey state then gets brighter."*
  // Measured 3 August — draws 1-4 at +236ms after mount, then the corrected
  // draws at +264ms.
  //
  // Passing the texture as a prop means it is part of the material's FIRST
  // construction: there is no unlit frame and no recompile, because there is
  // no "before" state to correct.
  return target.texture;
}

/**
 * ⚠ `StandIn` IS DELETED, AND ITS DELETION IS THE POINT OF THIS STEP.
 *
 * It was a throwaway calibration plane — a smooth blue→teal ramp, optionally
 * with 2/4/6/8px strokes — sized to the card's own face and sitting 10 units
 * behind it. Carl always described it as disposable: *"the stand-in is
 * throwaway, this is so we can judge the frosted glass and legibility."*
 *
 * ⚠ AND IT IS WHY THE CARD KEPT READING AS FROSTED NO MATTER WHAT THE ROUGHNESS
 * WAS. A smooth gradient has no detail for frost to destroy, so clear glass and
 * frosted glass look IDENTICAL over it. Roughness was measured to be applying
 * correctly (edge energy 4.50 at 0.08 against 1.06 at 0.45) while the card
 * looked unchanged — a control working perfectly on a subject that could not
 * show it.
 *
 * ⚠ THE REAL LOCKUP REPLACES IT, and that is the whole reason the card moves
 * into the grid: **a WebGL canvas can only refract objects in its own scene.**
 */

/**
 * Pre-compile the scene's shaders before anything is choreographed.
 *
 * ⚠ THE PARAGRAPH BELOW IS PARTLY SUPERSEDED — READ THIS FIRST. It says the
 * stall is "shader compilation at first draw", which is true of the CARD-LADDER
 * stall it was written for and NOT of the opening stutter. A later profile
 * measured 16 programs linking in 0ms: **compilation itself never blocks.**
 * What blocks is the synchronous read of a program's uniforms in the same frame
 * it is linked — see the two-state compile above, and
 * `live-work/architect-answer-opening-stutter.md`.
 *
 * Kept because the card-count evidence in it is still sound and still the reason
 * this warm-up exists.
 *
 * ⚠ THE STALL IS SHADER COMPILATION AT FIRST DRAW, AND THAT WAS MEASURED RATHER
 * THAN GUESSED — after one wrong hypothesis had already been acted on.
 *
 * The first diagnosis was "five transmissive cards are five times the work", and
 * it was wrong. Varying the card count via `?cards=N` settled it:
 *
 *     cards=1   blocking task at first draw   2846ms
 *     cards=3   blocking task at first draw   2986ms
 *     cards=5   blocking task at first draw   2949ms
 *
 * ⚠ **FLAT.** One card costs what five cost, so it is a FIXED price for putting
 * transmissive glass on screen at all — not a per-card cost, and therefore never
 * something cloning caused or that fewer cards would fix.
 *
 * ⚠ AND IT ALSO RULED OUT THE FIX THIS FILE HAD ALREADY PRESCRIBED. Mounting the
 * canvas earlier ("warm it during the opening choreography") was tried in the
 * same pass and made the stall WORSE — 1732ms to 2840ms — because the cost lands
 * at first **draw**, not at mount. Moving the mount moves setup; it does not
 * move compilation.
 *
 * `compileAsync` is three's own answer: it uses `KHR_parallel_shader_compile` and
 * resolves *"when the given scene can be rendered without unnecessary stalling
 * due to shader compilation"* (`three.module.js:17479`). The work still happens —
 * it just happens off the critical path, before any card is due.
 */
function useScenePrecompile(onReady: () => void, mayCompile: boolean) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    // ⚠ THE GATE COVERS THE COMPILE ITSELF, NOT JUST THE CHOREOGRAPHY. Gating
    // only the entrance would leave this work running during the phrase wipe —
    // which is precisely the regression that put the Q5 stutter back on the "W"
    // and "h" of "What".
    if (!mayCompile) return;

    let cancelled = false;

    // ⚠ ONE FRAME'S GRACE FIRST. `compileAsync` walks the scene graph as it
    // stands, so it must run after the cards' meshes have been committed —
    // otherwise it compiles an empty scene, resolves instantly, and the real
    // compile still lands on the first card. A silent no-op that looks like a
    // fix is exactly this project's standing trap.
    // ⚠ `renderer.debug.checkShaderErrors = false` WAS TRIED HERE AND CHANGED
    // NOTHING. The theory was sound — `three.module.js:7097` issues blocking
    // `getProgramParameter` queries when it is on, which would defeat
    // `compileAsync` — but measured against the opening it moved the ~900ms task
    // by 0ms. Recorded so it is not retried as a fresh idea, and NOT left in the
    // code, since it silently disables shader error reporting.
    const id = requestAnimationFrame(async () => {
      if (cancelled) return;

      /**
       * ⚠ COMPILED TWICE, IN TWO RENDERER STATES — AND THIS IS THE FIX FOR THE
       * OPENING STUTTER. Diagnosed by the Architect, 4 August; full reasoning in
       * `live-work/architect-answer-opening-stutter.md`.
       *
       * ⚠ EVERY MATERIAL IN THIS SCENE COMPILES TWICE, and nothing here knew it.
       * The program cache key carries `outputColorSpace` — which branches on
       * `currentRenderTarget === null` (`three.module.js:7585`) — and
       * `toneMapping` (`:7857`). @react-three/fiber sets sRGB + ACES filmic on
       * the canvas, while `renderTransmissionPass` renders into a target at
       * linear + `NoToneMapping` (`:18015`, `:18028`).
       *
       * **So there are two variants of every material, and the old single
       * `compileAsync` warmed only the canvas one.** The transmission variants
       * were linked inside `renderTransmissionPass` and had their uniforms read
       * in the SAME synchronous block — no window at all for
       * `KHR_parallel_shader_compile`. That is the 777ms.
       *
       * ⚠ AND IT EXPLAINS THE PROGRAM COUNT THAT WAS MEASURED AND NOT
       * UNDERSTOOD: rim, bevel, face and backdrop are 4 materials, "16 programs"
       * is 8 materials seen twice, plus PMREM's own.
       *
       * ⚠ A 1x1 PROBE TARGET IS ENOUGH. `getParameters` only tests
       * `currentRenderTarget === null`; the target's SIZE is not in the cache
       * key. And `compile()` walks with `scene.traverse` (`:17427`), so the
       * hidden cards are covered without un-hiding them here.
       *
       * ⚠ THE LIGHTS MUST STAY VISIBLE. Lights are gathered with
       * `traverseVisible` (`:17385`), so `numPointLights` — which IS in the
       * cache key — is whatever is visible at compile time. The `FilamentLight`s
       * sit in the always-visible outer group, so this matches today. **Moving a
       * light into a hidden group would make every program compiled here the
       * wrong variant**, silently.
       */
      const probe = new THREE.WebGLRenderTarget(1, 1);
      const prevTone = gl.toneMapping;

      try {
        // Transmission-pass variants: linear output, no tone mapping.
        gl.setRenderTarget(probe);
        gl.toneMapping = THREE.NoToneMapping;
        await gl.compileAsync(scene, camera);

        // Canvas variants: back to the renderer's own state.
        gl.setRenderTarget(null);
        gl.toneMapping = prevTone;
        await gl.compileAsync(scene, camera);
      } finally {
        // ⚠ RESTORED ON THE ERROR PATH TOO. Leaving the renderer pointed at a
        // disposed 1x1 target would break every subsequent frame.
        gl.setRenderTarget(null);
        gl.toneMapping = prevTone;
        probe.dispose();
      }

      await Promise.resolve()
        .then(() => {
          if (cancelled) return;

          /**
           * ⚠ ONE FULL RENDER BEFORE HANDING OVER, AND IT IS NOT REDUNDANT
           * AFTER `compileAsync`.
           *
           * `compileAsync` walks the SCENE GRAPH and compiles the materials it
           * finds. **The transmission pass is not in the scene graph.** The
           * first time a transmissive object is drawn, `renderTransmissionPass`
           * allocates its render target and builds the material variant that
           * samples it (`three.module.js:17967`) — work that no amount of
           * scene-graph precompilation can reach.
           *
           * ⚠ MEASURED, NOT ASSUMED: a 260ms blocking task landed at exactly
           * card 1's first visible frame, and card 2 fired the instant it
           * cleared — gap 1 came in at 263ms against a 560ms target, three runs
           * consistent. Carl saw it independently: *"the stall occurs between
           * cards 1+2."*
           *
           * Rendering the scene once here pays that cost while every card is
           * still hidden, so the first CHOREOGRAPHED frame is the second real
           * render rather than the first.
           *
           * ⚠ THE CARDS MUST BE VISIBLE FOR THIS ONE FRAME, WHICH IS THE WHOLE
           * SUBTLETY. They are hidden until their own rung (`attachGroup` sets
           * `visible = false`), and a renderer skips invisible objects entirely
           * — so a plain `render()` here would draw no transmissive object, the
           * transmission pass would never run, and the warm-up would be a
           * silent no-op that LOOKS like a fix. That is this project's standing
           * trap, and it would have shipped as one.
           *
           * ⚠ AND IT IS INVISIBLE ANYWAY, because the cards are still at scale
           * 0.94 and — crucially — UNLIT: `CardLighting` holds every material's
           * colour and `envMapIntensity` at zero until the entrance runs. So
           * this frame draws black cards on a black ground, over a lockup that
           * is itself at fade 0.
           */
          const hidden: THREE.Object3D[] = [];
          scene.traverse((o) => {
            if (o.type === "Group" && o.visible === false) {
              hidden.push(o);
              o.visible = true;
            }
          });

          gl.render(scene, camera);

          hidden.forEach((o) => {
            o.visible = false;
          });

          readyRef.current();
        })
        .catch(() => {
          // ⚠ FAIL OPEN, NEVER FAIL CLOSED. If precompilation is unavailable
          // the choreography must still run — a stall is a defect, but a card
          // grid that never appears is a broken page.
          if (!cancelled) readyRef.current();
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [gl, scene, camera, mayCompile]);
}

function CardScene({
  active,
  reducedMotion,
  tuning,
  glassTuning,
  hovered,
  litCards,
  onWarm,
  mayCompile,
}: {
  active: boolean;
  reducedMotion: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
  hovered: number | null;
  litCards: boolean[];
  onWarm: () => void;
  mayCompile: boolean;
}) {
  const envMap = useLocalEnvMap();
  useScenePrecompile(onWarm, mayCompile);

  /**
   * ⚠ HOVER INVERTS THE REGION UNDER THE CARD, AND "INVERT" IS THE OPERATIVE
   * WORD. Carl, 4 August: *"When in a hover state the card that the mouse is in
   * would change from blue to teal and vice versa."*
   *
   * The lockup is not uniformly blue — `easeBlueTeal` gives it four alternating
   * zones, so card 1 sits over the `c` (blue) while card 3 sits over the `b`
   * (teal). A hover target of 1 would drive both toward teal, which would be a
   * no-op on the cards that are teal already.
   *
   * ⚠ SO THE TARGET IS THE FLIP, NOT THE DESTINATION. `drawBackdrop` composes
   * `base + local * (1 - base)`, where `base` is the zone's resting colour — so
   * a shift of 1 means "fully teal" regardless of where the region started.
   * Inverting a teal region needs the drawing side to understand the direction,
   * which is what `shift: -1` now means there.
   */
  const target = useMemo(
    () => CARD_BOXES.map((_, i) => (i === hovered ? 1 : 0)),
    [hovered],
  );
  const shift = useRegionShift(target);

  // ⚠ ALL FIVE SLOTS NOW. Derived from `CARD_BOXES` so no card can drift out of
  // the backdrop region positioned against the same box — the sharing rule that
  // `cardSlotPosition` documents, now load-bearing five times over.
  const slots = useMemo(() => CARD_BOXES.map((b) => cardSlotPosition(b)), []);

  // ⚠ THE `?cards=N` DIAGNOSTIC IS REMOVED. It existed to separate "does ANY
  // transmissive card cost this" from "do FIVE cost five times", and it answered
  // that — but the answer was taken on a SOFTWARE RASTERISER (headless
  // Playwright has no GPU), where compilation dominates so heavily that mesh
  // count cannot register. On real hardware the whole premise was wrong: the
  // stall was shader compilation and the transmission pass, fixed by
  // `useScenePrecompile` and the opening warm-up.
  //
  // A knob whose finding was invalidated is worse than no knob — the next reader
  // would trust it. The lesson is recorded in `live-work/run-log-clone-and-beats.md`.

  return (
    <>
      {/*
        Static diagnostic lighting. Above and slightly LEFT, which is the
        direction the six CSS inset shadows already imply: top bright, left
        secondary at roughly a third of it, bottom and right as depth shadow
        (`app/globals.css`, the `.enquiry-card` box-shadow stack). Matching that
        direction means the WebGL card is lit the same way as its neighbour, so a
        difference between them is a difference of FORM rather than of lighting.
      */}
      {/*
        ⚠ THE DIRECTIONALS RIDE THE FADER TOO, or *"light level"* would only mean
        *"environment response"* and the two halves of the lighting would drift
        apart as it moves. Carl's pass judges the metal *"against both metal and
        glass"* — one control has to move all of it.
      */}
      <ambientLight intensity={0.35 * glassTuning.lightLevel} />
      <directionalLight
        position={[-60, 90, 120]}
        intensity={2.1 * glassTuning.lightLevel}
      />
      {/* A weak fill from below-right stops the lower bevel going fully black,
          which would read as a missing surface rather than a shadowed one. */}
      <directionalLight
        position={[70, -60, 60]}
        intensity={0.35 * glassTuning.lightLevel}
      />

      {/*
        ⚠ THE LOCKUP IS NOW A SIBLING OF THE CARD, NOT A CHILD OF IT — and that
        inverts chunk 2's arrangement deliberately.

        The stand-in was parented INTO the card's group so it inherited
        `visible` and the entrance transform. Without that it drew during the
        entrance delay while the card mesh was still hidden, and the first thing
        on screen was a bright rectangle: Carl, *"it appears as a rectangle at
        first, very fast, no curves."*

        ⚠ THAT CANNOT APPLY HERE, because the lockup is NOT the card's backdrop
        — it spans the whole grid and belongs to all five cards. Parenting it to
        one card would drag the entire logo 6px upward through card 1's entrance
        rise, and in chunk 5 it would have to be parented to five cards at once,
        which is not a thing.

        ⚠ SO THE ENTRANCE-RECTANGLE DEFECT IS PREVENTED A DIFFERENT WAY: the
        card entrance no longer has a hidden delay to flash out of (see
        `useCardEntrance` — visibility is owned by the tick loop alone, and the
        first drawn frame is already frame 0 of the rise). The lockup simply
        renders throughout, which is correct: it is the page, not the card.
      */}
      {/*
        ⚠ THE LOCKUP IS BEAT SIX — it is no longer on screen from the first frame.

        Carl, 4 August: *"There should be a 6 beat and that is the text underneath
        fading in"*, and on what that means: *"by text underneath i mean 'c2b
        DESIGN'."* It spans all five cards and fades at the cards' own speed —
        *"The cards fade in at a certain speed, the text should do the same. 6
        beats instead of 5."*

        ⚠ AND THE CARDS LOOK LIKE THE "NO GLASS" FAILURE UNTIL IT ARRIVES. Glass
        over a near-black page reads as a pale slab — the governing fact this whole
        rebuild is downstream of. For the ~1440ms of the ladder there is nothing
        behind the cards to transmit, so they will read as dark slabs and only
        become glass when the lockup lights behind them.

        **That is the design, not a defect.** Flagged to Carl before it was built:
        the cards fill with colour as the light comes up behind them.
      */}
      <AnswerCardBackdrop shift={shift} reducedMotion={reducedMotion} active={active} />

      {/*
        ⚠ ONE SCENE, WHICH IS THE ENTIRE REASON FOR THIS STEP. The transmission
        pass renders the scene's `opaqueObjects` into a target that the glass
        then samples — so the glass can only ever refract what is in ITS OWN
        scene graph. Two canvases meant the card refracted its own stand-in and
        was blind to the logo, however exactly they were overlaid in CSS.
      */}
      {slots.map((slot, i) => (
        <AnswerCard
          key={i}
          slot={slot}
          delayMs={CARD_RISE_LADDER_MS[i]}
          active={active}
          reducedMotion={reducedMotion}
          tuning={tuning}
          glassTuning={glassTuning}
          envMap={envMap}
          lit={litCards[i] ?? false}
        />
      ))}
    </>
  );
}

/**
 * The answer-card canvas — the card in grid slot 1, over the lockup.
 *
 * ⚠ RENDERS ONLY AT >= 1280px, and the reason has changed with the move. It was
 * an OVERFLOW guard: the card needed ~211px of free left margin and there were
 * only 200px at 1024. In the grid there is no margin requirement, so it is now a
 * CORRECTNESS guard — `CARD_BOXES` describes the three-column layout, which only
 * holds above this width. See `PROTO_MIN_VIEWPORT_PX`.
 */
export default function AnswerCardCanvas({
  active,
  /**
   * Whether the opening has yielded an idle window for this canvas's setup.
   *
   * ⚠ IT OPENS BEFORE BEGIN, DURING THE OPENING STAGE — see `cardCanvasWarm` in
   * `enquiry-opening.tsx`. The canvas still MOUNTS with the Q5 grid; this gate
   * decides only whether it may render, which is where the cost actually is.
   */
  warm = true,
}: {
  active: boolean;
  warm?: boolean;
}) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  /**
   * ⚠ THE CANVAS DEFERS ITS OWN WEBGL SETUP PAST THE Q5 PHRASE WIPE.
   *
   * The stutter Carl reported on the "W" and "h" of "What" was this canvas's
   * Three.js initialisation landing inside the 1300ms reveal — measured at
   * +58-64ms with a 1827-2138ms long task behind it, 3/3 cold runs.
   *
   * ⚠ A FIRST FIX GATED THE MOUNT ON `canvasWarm` IN `enquiry-opening.tsx`. It
   * removed the stutter but was the WRONG INSTRUMENT: that gate is derived from
   * the CONTACT FIELD's warm-up and only clears once an idle opportunity arrives
   * after it, so the proto card arrived at +8270ms — roughly 1330ms AFTER its
   * CSS neighbours, which appear at +6938ms. Carl: *"the card arrives too
   * late."*
   *
   * ⚠ AND THE CORRIDOR'S OWN TIMING IS WHY A BEGIN-RELATIVE GUARD CANNOT WORK.
   * The answer cards do not appear when Begin is pressed; they arrive ~6.9s
   * later, after the opening phrase choreography. The reveal that must be
   * protected is the one that starts WHEN THIS COMPONENT MOUNTS, so the delay
   * has to be measured from here rather than inherited from a gate anchored to
   * Begin.
   *
   * Q5_REVEAL_CLEAR_MS (1300) is read off `.enquiry-q-text-reveal` in
   * `globals.css` — the same declaration `enquiry-opening.tsx` derives its own
   * guard from. Duplicated as a local constant rather than imported because this
   * file must not depend on an approved-foundation module for a value it only
   * needs to wait out.
   *
   * ⚠ REDUCED MOTION SKIPS THE WAIT. `.enquiry-q-text-reveal` has
   * `animation: none` under `prefers-reduced-motion`, so there is no wipe to
   * protect and waiting would delay the card guarding an animation that never
   * runs — the exact failure mode `enquiry-opening.tsx` documents for its own
   * guards.
   *
   * ⚠ THE COST: THE PROTO ARRIVES ~1300ms AFTER THE CSS CARDS, AND THAT IS
   * ACCEPTED. Measured 3 August — the CSS cards and the phrase wipe both start
   * at +6982ms after Begin and the wipe ends at +8282ms, so the two genuinely
   * compete for the same window. The card cannot match card 1's 220ms entrance
   * without putting the stutter back.
   *
   * Carl, 3 August: *"the new card is a test, it's not important it reveals
   * with card 1, only that it's there."* **So the lag is deliberate, not
   * outstanding.**
   *
   * ⚠ IT BECOMES A REAL QUESTION IN CHUNK 5, when the card moves into the grid
   * and must arrive on the approved 700ms/220ms ladder. The fix at that point is
   * to warm the canvas during the opening choreography — mounted hidden, well
   * before the cards, so its setup lands in dead time — NOT to shorten this
   * wait. `enquiry-opening.tsx` records why: a moved symptom is not a fixed one.
   */
  /**
   * ⚠ THE CANVAS NO LONGER WAITS OUT THE WHOLE REVEAL — IT MOUNTS IMMEDIATELY
   * AND THE CARDS THEMSELVES HOLD BACK.
   *
   * Carl, 4 August: *"card 1 can begin its appearance half way through the text
   * reveal."* The old guard deferred the entire canvas until the reveal had
   * FINISHED (1300ms), which makes a 650ms entrance impossible by construction.
   *
   * ⚠ AND THE GUARD'S REAL JOB IS PRESERVED, NOT DROPPED. It exists because
   * Three.js initialisation landing inside the phrase caused the stutter Carl
   * caught on the "Wh" of "What" — measured at +58-64ms with a 1827-2138ms long
   * task behind it. **That work is setup, not drawing.** Mounting early means the
   * setup happens BEFORE the phrase rather than during it, which is the fix this
   * file already prescribed for exactly this moment:
   *
   *   *"The fix at that point is to warm the canvas during the opening
   *   choreography — mounted hidden, well before the cards, so its setup lands
   *   in dead time — NOT to shorten this wait."*
   *
   * ⚠ SO THIS IS THE PRESCRIBED FIX ARRIVING, NOT THE GUARD BEING WEAKENED. The
   * cards are invisible until their own rung (see `attachGroup`), so nothing is
   * drawn early; only the expensive setup moves earlier, into dead time.
   *
   * ⚠ IT ALSO ADDRESSES THE 1732ms STALL that made all five cards land together
   * — same cause, same fix. **Unverified at the time of writing; it must be
   * measured with `?beattrace=1` rather than assumed.**
   */
  const revealCleared = true;

  const [wideEnough, setWideEnough] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${PROTO_MIN_VIEWPORT_PX}px)`);
    const apply = () => setWideEnough(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { tuning, glassTuning } = useCardRig();

  const box = useMemo(() => protoCanvasBox(), []);

  /**
   * Which card the pointer is inside, or null.
   *
   * ⚠ ONE INDEX, NOT FIVE BOOLEANS. A pointer is in exactly one card at a time,
   * and modelling it as five independent flags invites the state where two are
   * true — which `pointerleave`/`pointerenter` ordering makes reachable on a fast
   * diagonal crossing between adjacent cards.
   */
  const [hovered, setHovered] = useState<number | null>(null);

  /**
   * Which cards have had their filament fired.
   *
   * ⚠ MOUSE-DOWN STARTS THE JOURNEY, and it does not wait for the hover
   * transition. Carl, 4 August: *"If when hovering the user presses the mouse
   * button that will start the filaments journey. It may well be a user hovers
   * and before the colour transition has completed, they press the mouse. The
   * same length of timings apply, they just start at different times."*
   *
   * ⚠ THIS IS NOT SELECTION. The corridor still cannot advance past Q5 — no
   * Next step, no Q4. This lights the filament and nothing else, which is what
   * chunk 2 is scoped to.
   */
  const [litCards, setLitCards] = useState<boolean[]>(() =>
    new Array(CARD_BOXES.length).fill(false),
  );

  /**
   * Whether the renderer has finished compiling this scene's shaders.
   *
   * ⚠ THE CHOREOGRAPHY WAITS FOR THIS, AND THAT IS THE WHOLE FIX. The entrance
   * clock must not start while a ~2900ms compile is pending, or every beat after
   * card 1 lands in one lump when it clears — which is exactly what Carl saw:
   * *"on first walking the sequence they all came on at the same time."*
   *
   * ⚠ IT IS NOT A DELAY ADDED TO THE CHOREOGRAPHY. The compile was always
   * happening; it was landing ON the choreography. This moves the sequence to
   * after it rather than making the user wait longer overall.
   */
  const [compiled, setCompiled] = useState(false);
  const markWarm = useCallback(() => setCompiled(true), []);

  if (!wideEnough || !revealCleared) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="answer-card-proto"
      style={{
        position: "absolute",
        // ⚠ NO PADDING NOW, AND THE PAD CONSTANT IS GONE WITH IT. It existed
        // because the canvas was card-sized in the margin, so the rim's
        // outermost pixels sat on the canvas edge and were clipped. The canvas
        // now spans the whole grid and every card is well inside it.
        //
        // ⚠ AND PADDING WOULD ACTIVELY BREAK THE LOCKUP. The backdrop plane is
        // exactly GRID_WIDTH_PX x GRID_HEIGHT_PX; inside a canvas 12px larger on
        // each side it would no longer reach the edges, leaving a visible gutter
        // where the logo used to run out to the grid boundary.
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        pointerEvents: "none",
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop="demand"
        style={{ pointerEvents: "none" }}
      >
        <CardScene
          // ⚠ BOTH GATES. `compiled` is this scene's own shader and
          // transmission warm-up; `warm` is the opening having yielded an idle
          // window for it to happen in. The choreography waits for both.
          active={active && compiled && warm}
          reducedMotion={reducedMotion}
          tuning={tuning}
          glassTuning={glassTuning}
          hovered={hovered}
          litCards={litCards}
          onWarm={markWarm}
          mayCompile={warm}
        />
      </Canvas>

      {/*
        ⚠ HOVER IS DETECTED IN THE DOM, NOT IN THE SCENE, AND THE CANVAS STAYS
        `pointerEvents: none`.

        @react-three/fiber can raycast `onPointerOver` onto a mesh, which looks
        like the natural route. It is the wrong one here for two reasons:

          1. **The canvas spans the WHOLE GRID.** Turning pointer events on for
             raycasting makes the element itself a pointer target across all five
             slots, so it would swallow events over the four cards that do not
             exist yet — and, at rollout, over whatever occupies them.
          2. **Raycasting a transmissive mesh is not free.** The card's silhouette
             is a swept half-tube with a crowned face; hit-testing it per
             pointermove is real work to answer a question a rectangle already
             answers exactly.

        ⚠ AND THE BOXES ARE THE SAME `CARD_BOXES` THE SCENE PLACES CARDS FROM, so
        the hover region cannot drift away from the card it belongs to. That is
        the same sharing rule `cardSlotPosition` already documents.

        ⚠ `aria-hidden` AND NOT FOCUSABLE, DELIBERATELY. These are not the
        controls — they are a hover surface for a prototype with no selection
        behaviour yet. The real cards carry the roles, labels and keyboard
        handling when they return at rollout; a div with a pointer handler must
        not start impersonating a control in the accessibility tree.
      */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        {CARD_BOXES.map((b, i) => (
          <div
            key={i}
            data-testid={`answer-card-hover-${i}`}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            // ⚠ `pointerdown`, NOT `click` — Carl specified the mouse BUTTON as
            // the trigger, and the two differ: `click` fires on release, so a
            // slow press would delay the journey's start by however long the
            // button was held.
            // ⚠ A TOGGLE, BECAUSE A USER MAY CHANGE THEIR MIND. Carl, 4 August:
            // *"pressing inside the card should have all the filament fading
            // out... A user may change his mind about the choice."*
            //
            // ⚠ AND THE WAY BACK IS NOT THE WAY IN. Firing travels a circuit;
            // releasing fades uniformly. The journey is what says *"I am
            // choosing this"* — replaying it backwards would make taking a
            // choice back look like making one.
            onPointerDown={() =>
              setLitCards((prev) => {
                const next = prev.slice();
                next[i] = !prev[i];
                return next;
              })
            }
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              pointerEvents: "auto",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { CARD_WIDTH_PX, CARD_HEIGHT_PX };
