"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ContactFieldCanvas, { FIELD_ENTRANCE_END_MS } from "./contact-field-canvas";
import ContactFieldInputs, { type FieldStateSnapshot } from "./contact-field-inputs";
import { FIELD_SLOTS } from "./contact-field-geometry";
import AnswerCardCanvas from "./answer-card-canvas";
// ⚠ THE CARD CHOREOGRAPHY'S OWN END, DERIVED THERE AND IMPORTED HERE — never
// retyped. This file's own history records a hand-written end-of-choreography
// value going stale twice.
import { ENTRANCE_END_MS } from "./answer-card-geometry";

// How long after entering `complete` the ENTIRE completion choreography has
// cleared — acknowledgement, all four boxes, AND the opal.
//
// ⚠ COMPUTED, NOT CHOSEN, and that is the whole point. This started as a
// hand-written 7100 (the opal's old 6400+700 end) and went stale TWICE in one
// session as the cascade was retimed — first to 8800, and it would have gone
// stale again at 2000/1500. A guard derived from a choreography must move WITH
// that choreography, which only holds if it is computed from it.
//
// Leaving it behind is not a harmless lag: a stale-low value lets a late pre-warm
// fire INTO the opal's entrance, starving the animation the guard exists to
// protect. Exactly the class of error as the Q5 guard read off the wrong
// animation earlier the same day.
//
// The end of the OPAL's entrance is the boundary, not its start: the start is the
// instant the animation begins, so creating a context and generating PMREM there
// would starve it.
//
// Declared after OPAL_FADE_IN_* below, which it depends on.

// How long after Begin the Q5 phrase reveal has cleared. Read off the existing
// declaration, which this change does not touch:
//
//   .enquiry-q-text-reveal   enquiry-mask-reveal-horizontal 1300ms linear both
//
// ⚠ TWO ANIMATIONS START ON BEGIN, AND THEY ARE NOT THE SAME LENGTH. Getting
// this wrong is what made the 29 July fix incomplete:
//
//   .enquiry-q5-block       700ms   opacity fade of the whole block
//   .enquiry-q-text-reveal  1300ms  horizontal mask that wipes the PHRASE in
//
// The phrase is the thing that visibly stutters, so 1300ms is the boundary that
// matters. The 700ms opacity fade is a different animation on a parent element.
//
// WHY THIS EXISTS — the same defect as CHOREOGRAPHY_CLEAR_MS, one stage earlier.
// The pre-warm was written to keep WebGL work off the COMPLETION choreography,
// and it does. But pressing Begin starts the phrase wipe and flips
// `questionnaireStarted` true in the same instant, which makes the warm-up's
// `requestIdleCallback` eligible immediately.
//
// `requestIdleCallback` only fires on a genuinely free thread, which is correct.
// Its `timeout` is a guarantee of PROGRESS, not a delay: when the deadline
// expires the browser runs the callback ANYWAY, busy or not. On a cold load the
// thread is never free, so the deadline fires and ~200ms of Three.js
// initialisation lands inside the phrase wipe.
//
// MEASURED, not assumed (`verify/q5-stutter.mjs`, 29 July 2026), 3/3 runs on
// both dev and production builds:
//
//   worst frame gap inside the reveal   113ms dev / 81ms production
//   frames rendered during the reveal   28-38 of ~42 expected at 60fps
//   shader compilation inside reveal    0.1ms  <- NOT the cause
//   `onFirstUse` (three.js lazy init)   55.4ms dev / 46.0ms production
//
// The cost is CPU-side library initialisation and geometry construction, not
// the GPU work the original comment anticipated. Three.js is guilty here, but
// of a different offence than the one it was charged with.
//
// ⚠ CORRECTED 30 July 2026, from 700 to 1300. Carl saw the stutter again, moved:
// originally on the "Wh" of "What", now on the "h" of "here". 700ms is ~54% of
// the way through a 1300ms wipe — mid-phrase, right where "here" arrives. The
// work was not removed on 29 July, only pushed past the 700ms boundary into the
// remaining 600ms of the wipe. `verify/q5-stutter.mjs` reported 0/3 clean
// because it measured the same wrong 700ms window: the harness and the fix
// shared one assumption, so the check agreed with the bug.
const Q5_REVEAL_CLEAR_MS = 1300;

// ── Completion tail: the acknowledgement clearing, then the opal ─────────────
// ⚠ THE OPAL IS MASKED OFF, and its inter-element derivation removed with it.
//
// Carl, 30 July 2026: *"The mistake is not to have them as one system... The key
// is to break them apart and not have them so reliant on proportion and ratios...
// Mask off boxes 3, 4 and the opal and separate the connection between elements.
// We will judge it by eye and input the numbers."*
//
// The previous model computed the opal's delay as `FIELD_ENTRANCE_END_MS +
// FIELD_ENTRANCE_SPACING_MS`. That coupling was well-intentioned — it kept the
// chain honest through four retimings — but it made the boxes untunable: moving
// box 2 moved the opal, so no single element could be judged on its own.
//
// While masked, the opal has no timing. When Carl reinstates it, it gets a
// hand-entered delay like every other element, and any relationship worth keeping
// is re-imposed deliberately rather than assumed.
// ⚠ UNMASKED 30 July 2026, and hand-entered like everything else.
//
//   box 4 (Email)   5100 -> 8100ms
//   opal (Send)     8600 -> 11600ms   one 500ms step after box 4, matching the
//                                     step between boxes, and the same 3000ms fade
//
// The 500ms is the same interval Carl settled on between boxes 1 and 2, so the
// opal continues the cascade's rhythm rather than restarting with its own. That is
// a deliberate choice to be judged, NOT a derivation — if the opal wants a longer
// beat before it arrives, this number moves on its own and nothing follows it.
const OPAL_MASKED = false;
const OPAL_FADE_IN_DURATION_MS = 3000;
const OPAL_FADE_IN_DELAY_MS = 8600;

// The acknowledgement still tracks the last VISIBLE box, so "Understood." never
// vanishes underneath something still arriving. This is a genuine constraint
// rather than a rhythm choice — it is about occlusion, not feel — so it stays
// derived while the feel-carrying values are hand-entered.
const ACK_FADE_OUT_DURATION_MS = 1400;
const ACK_FADE_OUT_DELAY_MS = FIELD_ENTRANCE_END_MS - ACK_FADE_OUT_DURATION_MS;

/**
 * When the ENTIRE completion choreography has cleared — the pre-warm guard's
 * boundary.
 *
 * ⚠ Takes the LATEST of everything that can be on screen, so masking cannot lower
 * it and let a pre-warm fire into a live animation. While the opal is masked the
 * last box's end is the boundary; when it returns, the opal's end is.
 */
/**
 * How long after mount the answer-card canvas may begin its setup.
 *
 * ⚠ IT ONLY HAS TO CLEAR THE OPENING'S OWN FIRST FRAMES, not the whole opening.
 * `requestIdleCallback` does the real work of finding a free thread; this is
 * just a lead-in so the very first scheduling attempt is not made while the
 * opening reveal is starting up.
 */
/**
 * ⚠ REMOVED 5 August 2026 — `OPENING_WARM_LEAD_MS`. The record is kept because
 * three separate comments in this file cite it as the place two failed attempts
 * are written down, and a dangling reference is worse than a note.
 *
 * It was a lead-in before the warm-up canvas could be scheduled. THE WHOLE IDEA
 * OF SCHEDULING THE WARM-UP WAS THE DEFECT, so the constant went with the effect
 * that used it — see the note where that effect stood.
 *
 * ⚠ THE LESSON IT RECORDED, WHICH STILL STANDS: a duration cannot answer "has
 * the opening finished"; only the opening can. Two attempts to fix the stutter
 * by choosing a longer delay both failed — 900ms landed a 920ms task on the text
 * reveals, and 5200ms only moved it to +7194ms, still mid-choreography.
 *
 * ⚠ AND THE SECOND LESSON, WHICH IS WHY THE THIRD ATTEMPT FAILED TOO: the
 * opening is NOT idle just because it is CSS. It animates without a break from
 * 600ms to 12400ms. An earlier comment here asserted that "nothing in it
 * competes with WebGL setup" as though it had been checked; it had not, and it
 * was wrong.
 *
 * Step 4 answers both by inverting the dependency: the choreography waits for
 * the compile, so there is no longer anything to schedule. See `openingArmed`.
 */

/**
 * An absolute ceiling on how long the opening will wait for the card canvas to
 * compile before starting anyway — Step 4's backstop.
 *
 * ⚠ A GUARANTEE OF PROGRESS, NOT A SCHEDULE. On every normal path the compile
 * reports first and this timer is cancelled unused; measured 5 August, the
 * compile lands at ~1.1s cold and ~0.8s warm. It exists for the paths where
 * `compiled` never arrives at all — no WebGL, a lost context, a driver fault —
 * because an opening that never starts is far worse than one that stutters.
 *
 * ⚠ IF THIS IS EVER THE THING THAT STARTS THE OPENING ON A NORMAL RUN, THE GATE
 * IS BROKEN AND THE PAGE IS MERELY HIDING IT. That is exactly how the warm-up's
 * own `requestIdleCallback` timeout came to be the only path rather than a
 * backstop. `verify/opening-arm.mjs` reports which of the two armed the opening
 * — check it, do not assume.
 *
 * ⚠⚠ AND THAT WARNING CAME TRUE — IT WAS THE ONLY PATH ON EVERY VIEWPORT UNDER
 * 1280px, ON EVERY LOAD. `AnswerCardCanvas` returns `null` below
 * `PROTO_MIN_VIEWPORT_PX`, so no canvas existed, nothing reported `compiled`,
 * and this timer armed the opening after a 4.2-SECOND BLANK SCREEN. It was
 * caught by an independent audit, not by this project's own harness, because
 * `verify/opening-arm.mjs` only ever ran at 1440px — where the canvas exists and
 * the gate works. **A harness that only tests the passing case is not a test.**
 * `verify/arm-by-width.mjs` now sweeps the widths.
 *
 * ⚠ THE FIX IS AT `openingArmed`'s EFFECT, NOT HERE. The opening now also arms
 * on `document.fonts.ready` plus a committed frame, so this is a true backstop
 * again. **Lowering this value was considered and rejected** — it would have
 * made a shorter blank screen rather than removing the dependency, and the
 * heading never needed WebGL in the first place.
 */
const OPENING_ARM_CEILING_MS = 4000;

/**
 * An absolute ceiling, from Begin, on how long the contact field's warm-up will
 * wait for the card entrance to report itself.
 *
 * ⚠ IT EXISTS SO A STATE GATE IS NEVER THE ONLY EXIT. The card canvas does not
 * mount below `PROTO_MIN_VIEWPORT_PX` (1280) and does not animate under
 * `prefers-reduced-motion` — on both paths `onEntranceStart` never fires, and
 * without this the contact field would wait forever.
 *
 * ⚠ GENEROUS ON PURPOSE. It is a backstop against a path that cannot report,
 * not a schedule — if it is ever the thing that releases the warm-up on a normal
 * desktop load, the state gate has failed and that is the bug to fix.
 */
const ENTRANCE_ANCHOR_CEILING_MS = 20000;

const CHOREOGRAPHY_CLEAR_MS = Math.max(
  FIELD_ENTRANCE_END_MS,
  ACK_FADE_OUT_DELAY_MS + ACK_FADE_OUT_DURATION_MS,
  OPAL_MASKED ? 0 : OPAL_FADE_IN_DELAY_MS + OPAL_FADE_IN_DURATION_MS,
);

const HEADING_LINE1 = "Let's understand what your";
const HEADING_LINE2 = "business needs to become.";
const SUBTEXT = "A few focused questions to help us see the right next step.";

const HEADING_M1 = "Let's understand";
const HEADING_M2 = "what your";
const HEADING_M3 = "business needs to";
const HEADING_M4 = "become.";
const SUBTEXT_M1 = "A few focused questions to help us see";
const SUBTEXT_M2 = "the right next step.";

const QUESTIONS: Record<number, { question: string; options: string[] }> = {
  5: {
    question: "What brought you here today?",
    options: ["Premium new website", "Current site feels dated", "Better quality enquiries", "Less manual admin", "Not sure yet"],
  },
  4: {
    question: "What needs to improve most?",
    options: ["Stronger first impression", "Clearer service value", "More trust upfront", "Easier next step", "Better visitor flow"],
  },
  3: {
    question: "What feels unclear right now?",
    options: ["Message feels vague", "Services need clarity", "Brand feels inconsistent", "Offers feel hard to compare", "Next step feels hidden"],
  },
  2: {
    question: "What should your visitors understand?",
    options: ["What you offer", "Who you help", "Why trust you", "What happens next", "Why choose you"],
  },
  1: {
    question: "What would success look like?",
    options: ["More serious enquiries", "Better-fit clients", "Clearer online presence", "More confident brand", "Less friction to contact"],
  },
};

type MemoryItem = {
  label: string;
  question: string;
  answers: string;
};

// Position-aware warm reflection contributions, keyed by a card's INDEX in the
// shared 3+2 answer grid (same layout for every question, so the model is purely
// positional — not tied to answer text). Index → grid slot:
//   0 top-left  1 top-middle  2 top-right  3 bottom-left  4 bottom-right
// The Next step button sits centred below the grid, so bottom-row cards (3,4) are
// the closest/strongest sources; the distant top-middle card (1) only feeds a faint
// central catch. Vector: [leftRim, rightRim, upperLeft, upperRight, lowerLeft,
// lowerRight, upperCentre]. This is the Q5-approved baseline (D-031) generalised.
const GRID_REFL: ReadonlyArray<readonly [number, number, number, number, number, number, number]> = [
  [0.16, 0.00, 0.14, 0.00, 0.10, 0.00, 0.00], // 0 top-left
  [0.00, 0.00, 0.04, 0.04, 0.05, 0.05, 0.13], // 1 top-middle (distant → central)
  [0.00, 0.16, 0.00, 0.14, 0.00, 0.10, 0.00], // 2 top-right
  [0.26, 0.00, 0.28, 0.00, 0.30, 0.00, 0.00], // 3 bottom-left (closest)
  [0.00, 0.26, 0.00, 0.28, 0.00, 0.30, 0.00], // 4 bottom-right (closest)
];

// Build the reflection CSS custom properties for the Next step button from the
// currently selected answers of the active question. Returns {} when nothing is
// selected (so no-card hover keeps normal blue-platinum behaviour, and stale
// variables never persist between questions because this recomputes each render).
function reflectionVars(options: string[], selected: Set<string>): React.CSSProperties {
  if (selected.size === 0) return {};

  let rL = 0, rR = 0, rUL = 0, rUR = 0, rLoL = 0, rLoR = 0, rUC = 0;
  options.forEach((option, idx) => {
    if (!selected.has(option)) return;
    const c = GRID_REFL[idx];
    if (!c) return;
    rL += c[0]; rR += c[1]; rUL += c[2]; rUR += c[3]; rLoL += c[4]; rLoR += c[5]; rUC += c[6];
  });

  rUL = Math.min(rUL, 0.40);
  rUR = Math.min(rUR, 0.40);
  rUC = Math.min(rUC, 0.16);

  // Hover crown/rim "white" must become amber/champagne when reflection is active.
  // Each white hover highlight is emitted as a COMPLETE colour string (no in-CSS
  // calc, which proved fragile in rgba()). Champagne base rgb(255,226,165); per-zone
  // opacity frozen at idle level, then dropped below idle where that zone's amber
  // light directly filters it.
  const champ = (idleAlpha: number, zoneAmber: number) =>
    `rgba(255, 226, 165, ${(idleAlpha * Math.max(0, 1 - 2.0 * zoneAmber)).toFixed(3)})`;

  return {
    "--refl-active":       "1",
    "--refl-left":         Math.min(rL,   0.38).toFixed(3),
    "--refl-right":        Math.min(rR,   0.38).toFixed(3),
    "--refl-upper-left":   rUL.toFixed(3),
    "--refl-upper-right":  rUR.toFixed(3),
    "--refl-lower-left":   Math.min(rLoL, 0.42).toFixed(3),
    "--refl-lower-right":  Math.min(rLoR, 0.42).toFixed(3),
    "--refl-upper-centre": rUC.toFixed(3),
    // crown specular halves + centre core (idle opacities 0.55 / 0.55 / 0.55)
    "--crown-left":        champ(0.55, rUL),
    "--crown-left-mid":    champ(0.14, rUL),
    "--crown-right":       champ(0.55, rUR),
    "--crown-right-mid":   champ(0.14, rUR),
    "--crown-centre":      champ(0.55, rUC),
    // top rim (idle opacity 0.72) — full-width, uses max side amber
    "--crown-rim":         champ(0.72, Math.max(rUL, rUR, rUC)),
    // lower env reflection — softer champagne, frozen at idle opacity 0.14
    "--crown-env":         `rgba(232, 205, 158, ${(0.14).toFixed(3)})`,
    // lower bounce underside edge — frozen to idle cool value (no hover lift)
    "--bounce-edge":       `rgba(70, 110, 170, ${(0.18).toFixed(3)})`,
  } as React.CSSProperties;
}

// ── Q5 PROTOTYPE reflection (Stage 2 — spatial light-FILTERING model) ────────
// Q5-only model for the approved blue-platinum plasma-glass lens
// (.enquiry-nextstep-btn--q5proto). Independent of GRID_REFL / reflectionVars(), which stay
// byte-for-byte for Q1–Q4.
//
// CONCEPT (corrected): the reflection GEOMETRY belongs to the curved lens and never moves;
// only its COLOUR changes with the active environmental light. The visible reflection is five
// connected zones — [0] left cap, [1] upper-left crown, [2] upper-centre crown, [3] upper-right
// crown, [4] right cap. Each zone accumulates an INFLUENCE value (0..1) from selected cards
// (primary direction + restrained cross-surface spill so the field reads connected). That
// influence interpolates the zone's catch COLOUR through three endpoints — cool platinum-blue
// → champagne → amber — REPLACING the platinum, not painting amber on top of it. No additive
// overlay; an uninfluenced zone stays exactly platinum-blue. Cards sit above the button, so
// only these upper/lateral zones are ever coloured — never the text corridor, belly or
// underside. Complete rgba() strings are computed here (never fragile in-CSS rgba(calc())).
//
// Per-card zone influence vector: [leftCap, ulCrown, ucCrown, urCrown, rightCap].
// Index → grid slot: 0 TL, 1 TM, 2 TR, 3 BL, 4 BR.
const Q5_ZONE_INFLUENCE: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0.34, 0.30, 0.06, 0.00, 0.00], // 0 top-left    — weak-ish left + ul crown, faint centre spill
  [0.04, 0.20, 0.40, 0.20, 0.04], // 1 top-middle  — centre, softly reaching both adjacent crowns
  [0.00, 0.00, 0.07, 0.34, 0.40], // 2 top-right    — right cap + ur crown, slightly > card 1
  [0.78, 0.74, 0.26, 0.04, 0.02], // 3 bottom-left  — STRONGEST left+ul, moderate centre, faint R
  [0.02, 0.04, 0.26, 0.74, 0.78], // 4 bottom-right — STRONGEST right+ur, moderate centre, faint L
];

// Colour endpoints for the interpolation. Neutral = the approved platinum-blue crown core.
// IDLE travels neutral → champagne → amber (Image-2 relationship). HOVER uses RICHER, brighter
// endpoints (Image-3 relationship), so hover gains saturation/luminosity — not merely opacity.
const Q5_NEUTRAL: readonly [number, number, number] = [205, 230, 255]; // cool platinum-blue (Image 1)
const Q5_CHAMPAGNE: readonly [number, number, number] = [245, 208, 138];
const Q5_AMBER: readonly [number, number, number] = [234, 154, 58];
// Hover: clearly brighter, more saturated, more luminous (wider separation from idle).
const Q5_CHAMPAGNE_H: readonly [number, number, number] = [255, 216, 132];
const Q5_AMBER_H: readonly [number, number, number] = [255, 168, 48];

function q5Mix(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  k: number,
): readonly [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ] as const;
}

// Interpolate neutral→champagne→amber by influence t (0..1) → complete rgba string at `alpha`.
// `hover` selects the richer endpoints. Two-segment lerp keeps a controlled champagne midpoint
// so weak influence reads "lightly warmed platinum" before it ever looks amber. Every crown
// segment uses this for BOTH its core and its midpoint, so no fixed white/blue stop survives
// under an amber-filtered core.
function q5ZoneColour(t: number, alpha: number, hover = false): string {
  const clamped = Math.max(0, Math.min(1, t));
  const champ = hover ? Q5_CHAMPAGNE_H : Q5_CHAMPAGNE;
  const amber = hover ? Q5_AMBER_H : Q5_AMBER;
  const rgb =
    clamped <= 0.5
      ? q5Mix(Q5_NEUTRAL, champ, clamped / 0.5)
      : q5Mix(champ, amber, (clamped - 0.5) / 0.5);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
}

// Per-zone catch alphas. Selected-state warmth is now clearly visible at UI scale and hover is
// decisively stronger than idle (Image-2 → Image-3). The diffuse CAP BLOOM is decoupled from the
// thin LATERAL RIM so the bloom can be strong while the rim stays subordinate.
//   NOTE: the *neutral fallback* alphas in CSS stay at the approved baseline (crown 0.62, mid
//   0.16, cap 0.20) so an unselected button is byte-for-byte unchanged. These constants drive
//   only the SELECTED colour strings.
const A_CROWN = 0.75, A_CROWN_H = 0.92;   // crown ribbon core
const A_MID = 0.27,  A_MID_H = 0.38;      // crown ribbon midpoint
const A_BLOOM = 0.31, A_BLOOM_H = 0.44;   // diffuse curved-face / cap bloom (stronger)
const A_RIM = 0.19,  A_RIM_H = 0.25;      // thin lateral rim — subordinate, far below the bloom

// Build the Q5-prototype zone colour variables. Returns {} when nothing is selected, so the
// locked neutral lens shows through unchanged. Emits its OWN namespaced vars (--q5zone-*).
function q5ReflectionVars(options: string[], selected: Set<string>): React.CSSProperties {
  if (selected.size === 0) return {};

  // Accumulate influence per zone, bound to 1.0. Bottom-row cards (3,4) reach full warmth on
  // their own side; spill keeps the field connected.
  const z = [0, 0, 0, 0, 0];
  options.forEach((option, idx) => {
    if (!selected.has(option)) return;
    const c = Q5_ZONE_INFLUENCE[idx];
    if (!c) return;
    for (let i = 0; i < 5; i++) z[i] += c[i];
  });
  for (let i = 0; i < 5; i++) z[i] = Math.min(z[i], 1);

  // RIM — restrained and subordinate. Driven by the AVERAGE of the three crown zones (not
  // Math.max), so one strong side cannot warm the whole outline; the far side stays mostly cool
  // on a single selection. 4+5 → connected champagne; all-five → predominantly warm, no clean
  // white. Rim alpha is substantially lower than before (0.78 → 0.30) so it reads as a thin cue,
  // letting the curved-face/cap reflections carry the modelling.
  const rimT = (z[1] + z[2] + z[3]) / 3;

  return {
    "--q5zone-active": "1",
    // ── idle: crown core + midpoint; cap BLOOM and lateral RIM decoupled ──
    "--q5zone-lbloom":   q5ZoneColour(z[0], A_BLOOM),  // diffuse left-cap bloom (strong)
    "--q5zone-lrim":     q5ZoneColour(z[0], A_RIM),    // thin left lateral rim (subordinate)
    "--q5zone-ul":       q5ZoneColour(z[1], A_CROWN),
    "--q5zone-ul-mid":   q5ZoneColour(z[1], A_MID),
    "--q5zone-uc":       q5ZoneColour(z[2], A_CROWN),
    "--q5zone-uc-mid":   q5ZoneColour(z[2], A_MID),
    "--q5zone-ur":       q5ZoneColour(z[3], A_CROWN),
    "--q5zone-ur-mid":   q5ZoneColour(z[3], A_MID),
    "--q5zone-rbloom":   q5ZoneColour(z[4], A_BLOOM),  // diffuse right-cap bloom (strong)
    "--q5zone-rrim":     q5ZoneColour(z[4], A_RIM),    // thin right lateral rim (subordinate)
    "--q5zone-rim":      q5ZoneColour(rimT, 0.30),     // top rim — preserved restrained response
    // ── hover: richer endpoints (saturation/luminosity) AND clearly higher alpha ──
    "--q5zone-lbloom-h": q5ZoneColour(z[0], A_BLOOM_H, true),
    "--q5zone-lrim-h":   q5ZoneColour(z[0], A_RIM_H, true),
    "--q5zone-ul-h":     q5ZoneColour(z[1], A_CROWN_H, true),
    "--q5zone-ul-mid-h": q5ZoneColour(z[1], A_MID_H, true),
    "--q5zone-uc-h":     q5ZoneColour(z[2], A_CROWN_H, true),
    "--q5zone-uc-mid-h": q5ZoneColour(z[2], A_MID_H, true),
    "--q5zone-ur-h":     q5ZoneColour(z[3], A_CROWN_H, true),
    "--q5zone-ur-mid-h": q5ZoneColour(z[3], A_MID_H, true),
    "--q5zone-rbloom-h": q5ZoneColour(z[4], A_BLOOM_H, true),
    "--q5zone-rrim-h":   q5ZoneColour(z[4], A_RIM_H, true),
    "--q5zone-rim-h":    q5ZoneColour(rimT, 0.36, true), // top rim — only a modest increase
  } as React.CSSProperties;
}

export default function EnquiryOpening() {
  /**
   * ⚠ `?skip=1` — JUMP STRAIGHT TO THE CONTACT FIELD. A DEV DOOR, NOT A FEATURE.
   *
   * Carl, 6 August 2026: *"If you cant get there build a simple button so we can
   * get there... its getting replaced anyway."*
   *
   * ⚠ THE CORRIDOR CANNOT REACH COMPLETION RIGHT NOW, and that is documented and
   * accepted rather than broken: Q5's five CSS answer cards were removed for the
   * WebGL rebuild (*"just remove the 5 cards that are there now and build"*), so
   * there is nothing at Q5 that registers as a SELECTION. The WebGL cards fire
   * their filament on pointerdown, which is deliberately not the same thing.
   *
   * ⚠ WHY IT MATTERS ENOUGH TO ADD A DOOR. Carl: *"Its important that you see it,
   * because what comes before it, what weve been building, has more than a direct
   * relationship to what comes after."* The contact field is four boxes built
   * from the same rim/bevel/face vocabulary as the answer card — so a change to
   * the card's cross-section is a statement about the field too, and the two
   * cannot be judged apart.
   *
   * ⚠ DELETE THIS WHEN Q5 CARRIES REAL SELECTION AGAIN (chunk 5). It is a
   * scaffold with an expiry, and it is gated on a query param so it can never
   * fire for a visitor who has not typed it.
   */
  const [stage, setStage] = useState<"opening" | "active" | "complete">(() => {
    // ⚠ A LAZY INITIALISER, NOT AN EFFECT. An effect would render the opening
    // for a frame and then swap, firing the opening's choreography and leaving
    // the contact field's own entrance racing it.
    //
    // ⚠ AND IT READS `window` INSIDE THE INITIALISER, which only runs on the
    // client — reading it at module scope would break the server render.
    if (typeof window === "undefined") return "opening";
    const q = new URLSearchParams(window.location.search).get("skip");
    const skip = q !== null && q !== "" && q !== "0" && q !== "false";
    return skip ? "complete" : "opening";
  });
  const [activeQ, setActiveQ] = useState(5);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);
  // Which contact boxes currently hold content, in FIELD_SLOTS order. Lifted here
  // because ContactFieldInputs (DOM) and ContactFieldCanvas (WebGL) are SIBLINGS
  // and this is their nearest common parent. Drives the progressive gold rim.
  //
  // ⚠ ONLY THE BOOLEANS TRAVEL. The values stay in the inputs — nothing above
  // needs them, and lifting them would put the user's personal details into a
  // component that has no reason to hold them.
  const [fieldFilled, setFieldFilled] = useState<boolean[]>([]);

  /**
   * Receive the inputs' state snapshot and keep only what the rim needs.
   *
   * ⚠ THE IDENTITY GUARD IS LOAD-BEARING. This fires on EVERY keystroke, but the
   * rim only changes when a box crosses empty <-> filled. Without the guard, every
   * character typed would set new state on this component and re-render the whole
   * enquiry shell — including the WebGL canvas — for a value that had not changed.
   */
  const handleFieldState = useCallback((snapshot: FieldStateSnapshot) => {
    const next = FIELD_SLOTS.map((slot) => snapshot.filled[slot.id]);
    setFieldFilled((prev) =>
      prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
    );
  }, []);
  // The transparent Begin hit target is inactive until the visible reveal starts
  // (set true at the mask's `animationstart`). Under reduced motion there is no
  // reveal animation, so it is activated immediately in the effect below.
  const [beginActive, setBeginActive] = useState(false);
  // True while the corridor is shifting one depth deeper: the answered question recedes
  // (depth-0 -> depth-1), every older memory deepens by one, the heading recedes, and the
  // next active question is gated out of depth-0 until the morph settles. Drives the heading
  // recede + the receding phrase's card fade-out.
  const [corridorMoving, setCorridorMoving] = useState(false);
  // WebGL PRE-WARM. The contact canvas used to mount at `complete`, so creating
  // its context, compiling shaders and generating the PMREM environment all ran
  // on the main thread exactly while "Understood." was revealing. Measured: the
  // context was created 64ms after the acknowledgement mounted, followed by
  // 73ms/126ms/1379ms long tasks and a 183ms frame gap — the "U" painted, then
  // the reveal visibly hesitated.
  //
  // The fix is scheduling, not choreography: mount the SAME canvas earlier,
  // during the questionnaire, so that work happens while the user is reading and
  // clicking. At completion the already-warm canvas is only revealed — it is
  // never unmounted, remounted, or asked to rebuild its environment.
  //
  // This flag is the SOLE gate on mounting the canvas. There is deliberately no
  // `stage === "complete"` fallback: a fallback would let completion itself
  // create the context and generate the environment, which is exactly the
  // original defect. If preparation is late, the FIELD waits — neither the
  // acknowledgement nor Send's entrance ever does.
  const [canvasWarm, setCanvasWarm] = useState(false);

  /*
   * ⚠ `cardCanvasWarm` IS GONE — 5 August. It was the flag that decided WHEN the
   * answer-card canvas could do its expensive setup, and the premise under it
   * was false.
   *
   * The premise, written here and believed for two sessions: *"the opening runs
   * ~11.5s of CSS-only choreography before Begin is even pressable — a large,
   * genuinely idle window, and nothing in it competes with WebGL setup."*
   *
   * ⚠ IT ANIMATES WITHOUT A BREAK FROM 600ms TO 12400ms. Heading 600→2700,
   * heading 2100→4200, subtext 3600→7800, Begin reveal 7400→12400. The only
   * animation-free window on the page is 0→600ms. **There was never anywhere to
   * put the work**, which is why four scheduling attempts each moved the stall
   * to a different animation and none removed it.
   *
   * The canvas now mounts with the opening and the choreography waits for it —
   * `openingArmed` below. Nothing schedules the compile, so the compile cannot
   * be scheduled onto an animation.
   */

  /**
   * ⚠ DIAGNOSTIC ONLY — `?nowarmup=1` suppresses the hidden warm-up canvas.
   *
   * Arm B of `verify/warmup-value.mjs`, which measures whether that canvas buys
   * the REAL one anything (Architect, 5 August, Step 2).
   *
   * ⚠ LAZY INITIALISER, NOT AN EFFECT, AND DELIBERATELY. Reading this in an
   * effect and calling `setState` adds a SECOND `react-hooks/set-state-in-effect`
   * error to a file whose recorded baseline is exactly one — and the standing
   * rule is that known errors are not to be increased. The initialiser runs once
   * before first paint, so there is no cascading render to avoid in the first
   * place.
   *
   * SSR-safe via the `typeof window` guard: the server renders `false`, and
   * hydration agrees on every URL that lacks the flag — which is every URL a
   * visitor ever sees.
   *
   * ⚠ IT MUST NEVER GATE THE REAL CANVAS. Suppressing the warm-up is a
   * measurement; suppressing the entrance is the 4 August failure.
   */
  const [suppressWarmup] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("nowarmup") === "1",
  );

  /**
   * ⚠ STEP 4 — THE ORDERING INVERSION. The opening's animated classes are held
   * back until the warm-up canvas reports `compiled`, then applied together.
   *
   * ⚠ THIS IS THE FIX THE OTHER FOUR ATTEMPTS COULD NOT BE. Architect,
   * 5 August, straight off `globals.css`: the opening animates WITHOUT A BREAK
   * from 600ms to 12400ms (heading 600→2700, heading 2100→4200, subtext
   * 3600→7800, Begin 7400→12400). The only animation-free window on the page is
   * 0→600ms. So there was never a gap to schedule the compile INTO, and every
   * attempt merely chose which animation to stutter.
   *
   * > The warm-up waited for the choreography and always lost, because there is
   * > no gap. The choreography now waits for the compile.
   *
   * The 600/2100/3600/7400 delays run from the moment this flips, intact and in
   * proportion, onto a thread with nothing left to do.
   *
   * ⚠ AND IT IS WHAT PUTS CARD 1 AT THE REVEAL'S MIDPOINT — Carl's approved
   * instruction, unmet since it was given. Measured 5 August: card 1 was 791ms
   * late and the precompile gap was 791ms, the same number, because
   * `CARD_FIRST_ENTRANCE_MS` counts from the entrance clock's zero (when the
   * precompile finishes) and not from the reveal's start. With the compile
   * already done before the reveal begins, the two coincide.
   *
   * ⚠ NOT A FIXED DELAY BEFORE APPLYING THE CLASSES. That is a duration
   * answering a state question, and this file has got that wrong three times
   * (see `OPENING_WARM_LEAD_MS`).
   *
   * ⚠ THE BACKSTOP IS NOT OPTIONAL. If the compile never reports — no WebGL, a
   * lost context, a driver fault — the opening must still run. A state gate is
   * never the only exit; `ENTRANCE_ANCHOR_CEILING_MS` is why the 4 August
   * failure cost only the cards and not the contact field too.
   */
  const [openingArmed, setOpeningArmed] = useState(false);
  const armOpening = useCallback(() => setOpeningArmed(true), []);

  /**
   * A mask class once the opening is armed; the HELD state until then.
   *
   * ⚠ WITHHOLDING THE CLASS DOES NOT HOLD THE ELEMENT — IT COMPLETES IT. These
   * masks' base state is unmasked, fully-visible text, which is the animation's
   * END state. The first version of Step 4 returned `undefined` here, and the
   * opening showed all of its text at once, held it for ~2 seconds, then wiped
   * it in again from the left.
   *
   * ⚠ EVERY TIMING WAS CORRECT WHILE THAT WAS HAPPENING. The arm fired on the
   * compile 3/3, card 1 sat at the midpoint, the gate did exactly what it was
   * asked. A screenshot at +500ms is what found it. **A measurement of when
   * something starts says nothing about what is on screen before it does.**
   *
   * `.enquiry-opening-held` asserts the keyframe's `from` state instead, so the
   * text waits clipped and invisible and the animation joins it seamlessly.
   *
   * ⚠ THE BEGIN MASK IS NOT ROUTED THROUGH HERE. Its base rule already carries
   * `clip-path: circle(0%)` — it holds itself — so it needs only its animation
   * suppressed. See `.enquiry-button-mask--held` in `globals.css`.
   */
  const openingMask = useCallback(
    (cls: string) => {
      if (stage !== "opening" || reducedMotion) return undefined;
      return openingArmed ? cls : "enquiry-opening-held";
    },
    [stage, openingArmed, reducedMotion],
  );
  useEffect(() => {
    if (openingArmed) return;
    // Reduced motion has no animations to protect — arm immediately so the
    // opening is never gated on WebGL for a visitor who will not see a reveal.
    if (reducedMotion) {
      const id = window.setTimeout(armOpening, 0);
      return () => window.clearTimeout(id);
    }

    /**
     * ⚠⚠ THE READY GATE — AND IT EXISTS BECAUSE THE BACKSTOP WAS THE ONLY PATH
     * ON EVERY VIEWPORT UNDER 1280px.
     *
     * `AnswerCardCanvas` returns `null` below `PROTO_MIN_VIEWPORT_PX` (1280).
     * No canvas means nothing ever reports `compiled`, so `armOpening` was
     * reached ONLY by the 4000ms ceiling below — and the visitor watched a blank
     * screen for 4.2 seconds before the heading began. Measured across widths
     * (`verify/arm-by-width.mjs`):
     *
     *     1440   canvas present   armed by the compile     heading at 2349ms
     *     1280   canvas present   armed by the compile     heading at  759ms
     *     1279   NO CANVAS        ⚠ armed by the ceiling   heading at 4413ms
     *     1180   NO CANVAS        ⚠ armed by the ceiling   heading at 4406ms
     *     1024   NO CANVAS        ⚠ armed by the ceiling   heading at 4382ms
     *
     * ⚠ A 1279px LAPTOP IS A NORMAL RUN, NOT AN EDGE CASE. `OPENING_ARM_CEILING_MS`'s
     * own comment states the rule this broke: *"IF THIS IS EVER THE THING THAT
     * STARTS THE OPENING ON A NORMAL RUN, THE GATE IS BROKEN AND THE PAGE IS
     * MERELY HIDING IT."* It was, and it was.
     *
     * ⚠ AND THE CARD CANVAS IS THE WRONG THING FOR THE HEADING TO WAIT ON
     * ANYWAY. That canvas exists to precompile shaders so the CARD entrance does
     * not stutter after Begin. The heading's reveal is `clip-path` on the
     * compositor — it needs fonts and a frame, not WebGL. Gating text on a
     * graphics warm-up was always a stronger coupling than the problem required.
     *
     * ⚠ SO THIS ARMS ON WHICHEVER COMES FIRST: the compile (`armOpening` via
     * `onCompiled`, unchanged), or the page genuinely being ready to animate.
     * `document.fonts.ready` is the honest signal — a reveal that wipes text
     * before its webfont has swapped would reflow mid-animation — and the double
     * rAF guarantees a committed frame so the keyframes start from a painted
     * `enquiry-opening-held` state rather than joining midway.
     *
     * ⚠ THE CEILING STAYS, AND IT IS STILL NOT OPTIONAL. `fonts.ready` can in
     * principle never settle; a state gate must never be the only exit. It is
     * now a genuine backstop rather than the default path — which is what
     * `verify/opening-arm.mjs` checks, so run it after touching this.
     */
    let raf1 = 0;
    let raf2 = 0;
    let cancelled = false;
    const armWhenPainted = () => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (!cancelled) armOpening();
        });
      });
    };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(armWhenPainted, armWhenPainted);
    } else {
      armWhenPainted();
    }

    const id = window.setTimeout(armOpening, OPENING_ARM_CEILING_MS);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(id);
    };
  }, [openingArmed, reducedMotion, armOpening]);

  /*
   * ⚠ THE WARM-UP SCHEDULING EFFECT IS GONE, AND ITS DELETION IS THE FIX.
   *
   * It used to gate the warm-up canvas on `beginActive` plus
   * `OPENING_WARM_LEAD_MS` plus a `requestIdleCallback`. Four variants of that
   * scheduling were tried across two sessions — lead 900ms, lead 5200ms, gate on
   * `beginActive`, gate on `animationend` — and every one of them moved the
   * blocking task onto a different animation without ever removing it:
   *
   *     900ms   → stuttered the heading
   *     5200ms  → stuttered the subtext
   *     beginActive → stuttered the Begin reveal   (the stall Carl kept seeing)
   *     animationend → removed the stall AND THE CARDS  (reverted, 8e562ed)
   *
   * ⚠ BECAUSE THERE WAS NO GAP TO SCHEDULE INTO. The opening animates without a
   * break from 600ms to 12400ms, so `requestIdleCallback` never found genuine
   * idle and its timeout — nominally a backstop — was in fact the only path.
   *
   * The canvas now mounts as soon as the opening does, and the CHOREOGRAPHY
   * waits for it (`openingArmed` above). Nothing is scheduled, so nothing can be
   * scheduled onto an animation.
   */

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    // No radial reveal under reduced motion → no `animationstart` will fire, so
    // make the Begin hit target usable immediately.
    if (mq.matches) setBeginActive(true);
  }, []);

  // Warm the contact canvas once the questionnaire has started, on a genuine
  // idle opportunity so it never competes with the corridor's own animation.
  //
  // `requestIdleCallback` is the right primitive: it fires only when the main
  // thread is actually free, so shader compilation lands in a gap between the
  // user reading and answering. The `setTimeout` fallback covers Safari, which
  // still lacks it. The 2000ms deadline is a guarantee of PROGRESS, not a delay
  // — if the thread never goes idle, warming still happens well before Q5, which
  // is the whole point: the expensive work must not be deferred to completion.
  //
  // Warming STARTS once the questionnaire has begun rather than at page mount:
  // the opening has its own reveal choreography, and there is no reason to hold
  // a WebGL context for a visitor who never presses Begin.
  //
  // THE DEPENDENCY MUST BE STABLE ACROSS `active` -> `complete`. An earlier
  // version of this effect depended on `stage` directly, and its comment claimed
  // that a pending warm-up "survives the transition". That claim was FALSE:
  // React tears an effect down on ANY dependency change, so entering `complete`
  // cancelled the pending questionnaire callback and scheduled a REPLACEMENT,
  // which could then fire during the acknowledgement and perform exactly the
  // WebGL work this change exists to move off the reveal.
  //
  // `questionnaireStarted` goes false -> true exactly once and never flips back,
  // so the `active` -> `complete` transition does not re-run this effect at all
  // and the originally scheduled callback is left running undisturbed.
  const questionnaireStarted = stage !== "opening";

  // The WHOLE completion choreography is protected — the "Understood." reveal
  // AND Send's entrance. If preparation is still pending when completion
  // begins, the field WAITS: no canvas is mounted and no WebGL or PMREM work
  // starts until `CHOREOGRAPHY_CLEAR_MS` has passed and an idle opportunity
  // arrives. Both boundaries are derived from the existing declarations; no
  // acknowledgement or Send timing is altered.
  //
  // The instant `complete` was entered, held in a REF (not state) so that
  // reading it can never re-run the warm-up effect.
  //
  // IT IS RECORDED SYNCHRONOUSLY, IMMEDIATELY BEFORE `setStage("complete")`,
  // via `enterComplete()` below — never from a passive effect. A passive effect
  // runs AFTER commit and paint, which leaves a real window in which a pending
  // idle callback could fire, observe a stale `null`, and mount the canvas
  // inside the protected choreography. Writing it before the state update
  // instead means the timestamp is already in place before React re-renders,
  // so any callback that runs after the transition necessarily observes it.
  //
  // An earlier version recorded this in `useEffect([stage])` and claimed a
  // `stageRef` closed the race. It did not: both refs were written by the SAME
  // passive effect, so both were equally stale. That approach is removed.
  const completedAtRef = useRef<number | null>(null);

  // The instant Begin was pressed, held in a REF for exactly the reason
  // `completedAtRef` is: reading it must never re-run the warm-up effect.
  //
  // WRITTEN SYNCHRONOUSLY, immediately before `setStage("active")`, via
  // `enterActive()` below — never from a passive effect. A passive effect runs
  // after commit and paint, which leaves a window in which the idle callback
  // could fire, observe a stale `null`, and do its work inside the reveal. That
  // is the same race `completedAtRef`'s comment documents, and it is closed the
  // same way.
  const activatedAtRef = useRef<number | null>(null);

  /**
   * The instant the card entrance's six beats actually began.
   *
   * ⚠ NULL UNTIL THE CANVAS SAYS SO, and null means WAIT rather than clear. The
   * entrance waits on an async precompile, so its start is ~1944ms after the
   * cards mount and cannot be derived from Begin. See the guard in
   * `warmWhenSafe` and `live-work/architect-answer-lockup-fade.md`.
   */
  const cardEntranceStartedAtRef = useRef<number | null>(null);
  const noteCardEntranceStart = useCallback(() => {
    if (cardEntranceStartedAtRef.current === null) {
      cardEntranceStartedAtRef.current = Date.now();
    }
  }, []);

  // The single, shared entry point into the completion stage. Every route into
  // `complete` — reduced motion and the animated corridor alike — goes through
  // here, so the timestamp can never be missed on one path. This changes only
  // how completion is RECORDED; when it happens is untouched.
  const enterComplete = useCallback(() => {
    if (completedAtRef.current === null) completedAtRef.current = Date.now();
    setStage("complete");
  }, []);

  // The single, shared entry point into the questionnaire — the counterpart to
  // `enterComplete()`. Every route into `active` goes through here so the
  // timestamp can never be missed on one path. This changes only how the
  // transition is RECORDED; when it happens is untouched.
  const enterActive = useCallback(() => {
    if (activatedAtRef.current === null) activatedAtRef.current = Date.now();
    setStage("active");
  }, []);

  useEffect(() => {
    if (!questionnaireStarted || canvasWarm) return;

    let idleId: number | null = null;
    let timerId: number | null = null;

    // The GUARD, and the reason this is safe. A callback scheduled during the
    // questionnaire may still be pending when completion begins, so the check
    // cannot live at scheduling time — it must happen when the callback
    // actually FIRES. If any part of the completion choreography is still
    // running, do not warm: reschedule for after it clears. The field waits;
    // neither the acknowledgement nor Send ever does.
    const warmWhenSafe = () => {
      // THE Q5 PHRASE GUARD. Checked FIRST because the phrase happens first:
      // this callback becomes eligible the instant Begin is pressed, which is
      // the same instant the phrase starts wiping in.
      //
      // REDUCED MOTION: `.enquiry-q-text-reveal { animation: none }` under
      // `prefers-reduced-motion` (globals.css:1420 — verified 30 July 2026), so
      // there is no wipe to protect and waiting would stall the field for
      // 1300ms guarding an animation that never runs. The guard is DERIVED from
      // the wipe, so it must carry the wipe's own condition with it — the
      // precise failure the 24 July review found in the completion guard (a
      // delay correctly derived from a choreography, applied even when the
      // choreography was gated off).
      //
      // ⚠ AND IT NOW COVERS THE CARD LADDER, NOT ONLY THE WIPE. This guard was
      // written when the phrase was the only thing that happened after Begin.
      // The answer cards are now a six-beat choreography running to
      // ~ENTRANCE_END_MS, and this warm-up was landing INSIDE it: measured 4
      // August, a third WebGL context created at +2362ms after Begin followed by
      // a 355ms blocking task at +2622ms — squarely between card 2 and card 3.
      //
      // ⚠ THAT IS WHAT CARL SAW AS *"run 1 stall, run 2 less stall, run 3 ok"*:
      // beat gaps of 1019/121 against a 560ms target on the cold run. The card
      // canvas's own warm-up was already correct by then and had 4.2s of
      // headroom; this was a SECOND warm-up, for a different canvas, colliding
      // with the ladder.
      //
      // ⚠ THE GUARD'S OWN PRINCIPLE IS UNCHANGED — it just has more to protect.
      // Same derivation, same reduced-motion carve-out, one more boundary.
      /**
       * ⚠ MEASURED FROM WHEN THE ENTRANCE ACTUALLY STARTED, NOT FROM BEGIN — and
       * getting that wrong is what put a second WebGL context inside the lockup's
       * fade.
       *
       * `ENTRANCE_END_MS` (6330) is a duration measured from the entrance's own
       * clock. This guard used to subtract it from `activatedAtRef` (Begin), so
       * it believed the six beats ran +0 → +6330. **They actually run +8857 →
       * +15187**, because the entrance waits on the async precompile — measured
       * at 1944ms after the cards mount.
       *
       * ⚠ SO IT RELEASED ~2.5 SECONDS BEFORE BEAT SIX HAD BEGUN, and the contact
       * canvas mounted at +13248 — 202ms before the first dropped frame. Carl:
       * *"the c2b DESIGN text entrance is not smooth."* Diagnosed by the
       * Architect: `live-work/architect-answer-lockup-fade.md`.
       *
       * ⚠ AND THE COMMENT BELOW THIS ONE ALREADY CLAIMED TO HAVE FIXED THIS
       * COLLISION once, for the card ladder. **The boundary was added; the
       * ANCHOR was never checked.** It moved the collision rather than removing
       * it.
       *
       * ⚠ A STATE, NOT A DURATION — the third time this file has learned it. See
       * `OPENING_WARM_LEAD_MS` for the first two.
       */
      const entranceStarted = cardEntranceStartedAtRef.current;
      const activated = activatedAtRef.current;

      // ⚠ DEV-ONLY TRACE OF THE GUARD'S OWN DECISION, gated on `?warmtrace=1`
      // and costing nothing without it. It exists because this guard has now
      // been reasoned about wrongly twice from its source alone: the anchor it
      // waits on is set by a callback from another component, so whether it has
      // ARRIVED at the moment of the check cannot be read off the code.
      // `verify/warm-collision.mjs` names the stall; this says which branch let
      // it through.
      if (
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("warmtrace") === "1"
      ) {
        const w = window as unknown as { __warmTrace?: unknown[] };
        w.__warmTrace ??= [];
        w.__warmTrace.push({
          t: Math.round(performance.now()),
          entranceStarted: entranceStarted === null ? null : Math.round(Date.now() - entranceStarted),
          sinceBegin: activated === null ? null : Math.round(Date.now() - activated),
        });
      }

      if (!reducedMotion && activated !== null) {
        // ⚠ THE OUTER CEILING, AND IT IS LOAD-BEARING. The card canvas does not
        // mount below `PROTO_MIN_VIEWPORT_PX`, so on narrow viewports
        // `onEntranceStart` never fires. Without this the contact field would
        // wait forever — a state gate must never be the only exit.
        const sinceBegin = Date.now() - activated;
        const pastCeiling = sinceBegin >= ENTRANCE_ANCHOR_CEILING_MS;

        if (!pastCeiling) {
          if (entranceStarted === null) {
            // ⚠ "NOT STARTED" MEANS WAIT, NOT CLEAR. Falling through here is
            // precisely the bug being fixed.
            timerId = window.setTimeout(warmWhenSafe, 500);
            return;
          }
          const untilClear = ENTRANCE_END_MS - (Date.now() - entranceStarted);
          if (untilClear > 0) {
            timerId = window.setTimeout(warmWhenSafe, untilClear);
            return;
          }
        }

        // The phrase wipe still has to clear on its own Begin-relative clock.
        const untilReveal = Q5_REVEAL_CLEAR_MS - sinceBegin;
        if (untilReveal > 0) {
          timerId = window.setTimeout(warmWhenSafe, untilReveal);
          return;
        }
      }

      // Reached only when every guard above has cleared — so if the trace shows
      // this line running while the ladder is mid-flight, the guards are the
      // thing to fix, not the warm-up.
      if (
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("warmtrace") === "1"
      ) {
        const w = window as unknown as { __warmTrace?: unknown[] };
        w.__warmTrace ??= [];
        w.__warmTrace.push({ t: Math.round(performance.now()), passedGuards: true });
      }

      const completed = completedAtRef.current;
      // REDUCED MOTION: there is no choreography to protect. Every completion
      // animation is gated `reducedMotion ? undefined : {...}`, so under reduced
      // motion "Understood." and Send appear immediately and nothing animates.
      // Waiting CHOREOGRAPHY_CLEAR_MS here would stall the field for 7.1s
      // guarding animations that never run — which, once the fields are live,
      // is an accessibility defect: a reduced-motion user left facing an empty
      // form. The guard is derived from the choreography, so it must preserve
      // the condition the choreography itself depends on.
      if (completed !== null && !reducedMotion) {
        const remaining = CHOREOGRAPHY_CLEAR_MS - (Date.now() - completed);
        if (remaining > 0) {
          timerId = window.setTimeout(warmWhenSafe, remaining);
          return;
        }
        // The choreography has cleared, but landing straight onto the boundary
        // would still be a scheduled main-thread hit. Yield first — the same
        // courtesy the normal early path gets.
        if (typeof window.requestIdleCallback === "function") {
          idleId = window.requestIdleCallback(() => setCanvasWarm(true), { timeout: 2000 });
        } else {
          // No `requestIdleCallback` (Safari). Yield past the boundary with a
          // single short timeout so the browser can present Send's completed
          // state before WebGL setup begins. One bounded hop — deliberately not
          // a retry loop, so warming cannot be postponed indefinitely.
          timerId = window.setTimeout(() => setCanvasWarm(true), 300);
        }
        return;
      }
      setCanvasWarm(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warmWhenSafe, { timeout: 2000 });
    } else {
      timerId = window.setTimeout(warmWhenSafe, 600);
    }

    return () => {
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timerId !== null) window.clearTimeout(timerId);
    };
    // `reducedMotion` is read by the guard above. It is set once from a media
    // query at mount and changes only if the user alters their OS preference
    // mid-session, so including it does not reintroduce the effect churn that
    // the stable `questionnaireStarted` boolean exists to prevent.
  }, [questionnaireStarted, canvasWarm, reducedMotion]);

  // ⚠ UNUSED WHILE CHUNK 3 RUNS, AND DELIBERATELY KEPT. The five CSS cards that
  // called this are removed, so nothing selects anything — but this is working
  // selection logic that chunk 5 needs when the WebGL grid takes over, and the
  // same reasoning that protects GRID_REFL protects it: "unused" here means
  // "waiting", not "dead".
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleOption = useCallback((option: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return next;
    });
  }, []);

  // One generic corridor step for every question. The answered question is pushed to
  // memory (it becomes the newest = depth-1) and every older memory deepens by one — both
  // happen as a single setMemory because depth is derived from position in memory[]. The
  // answered question's phrase persists by key, so it morphs depth-0 -> depth-1 rather than
  // being torn down. The next active question is gated out of depth-0 until the morph settles.
  function handleNextStep() {
    const fromQ = activeQ;
    const answersSnap = Array.from(selected).join(" • ");
    setSelected(new Set());
    setMemory(prev => [...prev, {
      label: `Q${fromQ}`,
      question: QUESTIONS[fromQ].question,
      answers: answersSnap,
    }]);

    if (fromQ === 1) {
      // Last question -> completion. The corridor holds while "Understood." + the form mount.
      if (reducedMotion) {
        enterComplete();
        return;
      }
      setCorridorMoving(true);
      setTimeout(() => { enterComplete(); setCorridorMoving(false); }, 900);
      return;
    }

    if (reducedMotion) {
      setActiveQ(fromQ - 1);
      return;
    }

    // Vacate depth-0, recede the heading + deepen the stack, then admit the next question
    // once the ~900ms morph has settled and the active field is clearly empty (~250ms beat).
    setCorridorMoving(true);
    setTimeout(() => {
      setActiveQ(fromQ - 1);
      setCorridorMoving(false);
    }, 1150);
  }

  // The joined answer summary for a question once it has been answered (read from memory[]).
  function answersSummary(qNum: number) {
    const item = memory.find(m => m.label === `Q${qNum}`);
    return item ? item.answers : "";
  }

  // Generic persistent phrase. Same markup at every depth; only the depth class and which
  // supporting content shows differ (cards+Next at depth 0, summary at depth >= 1). Stable
  // key per question number => the node persists as its depth changes => continuity.
  // The receding phrase keeps its cards mounted (fading out) for one beat via showExtras.
  function renderPhrase(qNum: number, depth: number, isActive: boolean) {
    const showExtras = isActive || (corridorMoving && depth === 1);
    return (
      <div
        key={`phrase-${qNum}`}
        className={`enquiry-phrase enquiry-pdepth-${depth}${reducedMotion ? "" : " enquiry-phrase-anim"}`}
      >
        <div className="enquiry-phrase-qrow">
          <span className="enquiry-phrase-cue" aria-hidden="true">Q{qNum}</span>
          <span
            className={`enquiry-phrase-question${reducedMotion || !isActive ? "" : " enquiry-q-text-reveal"}`}
            id={isActive ? "active-q-label" : undefined}
          >
            {QUESTIONS[qNum].question}
          </span>
        </div>

        {depth >= 1 && (
          <div className={`enquiry-phrase-answers${reducedMotion ? "" : " enquiry-phrase-answers-enter"}`}>
            {answersSummary(qNum)}
          </div>
        )}

        {showExtras && (
          <div className={`enquiry-phrase-extras${isActive ? "" : " enquiry-phrase-extras-out"}`}>
            {/*
              ⚠ THE FIVE CSS ANSWER CARDS ARE REMOVED FOR CHUNK 3, ON CARL'S
              EXPLICIT INSTRUCTION: *"just remove the 5 cards that are there now
              and build."* The Builder put the cost to him — that with no answers
              to select the corridor cannot advance past Q5, so Next step never
              activates and Q4–Q1 and the contact field are unreachable — and
              offered a flag-gated alternative that would have preserved the
              flow. Carl: *"we do not need to advance atm."*

              ⚠ SO THE PAGE IS DELIBERATELY NON-FUNCTIONAL BEYOND Q5 while this
              chunk runs. That is accepted, not overlooked.

              This reopens D-028 (frosted blue glass, A–E variants) and D-029
              (the filament border). Both are approved layers and both are
              Carl's to reopen; he has done so.

              ⚠ THE MARKUP IS NOT LOST — it is in git at commit c7afca3 and
              earlier, and chunk 5 rebuilds the grid in WebGL rather than
              restoring this. `GRID_REFL` in this file is now dead code but must
              not be deleted as unused; see the correction directly below.

              ⚠ CORRECTED 5 AUGUST — `GRID_REFL` IS NOT A SPECIFICATION. This
              comment used to call it *"the specification the chunk-5 physics has
              to reproduce — bottom row 0.26–0.30 against top row 0.04–0.16."*
              **Carl retired that reading:** it was a CSS-era simulation of the
              filament effect, *"approved only within the constraints of CSS"* —
              the best available fake at the time, not a description of what the
              real thing should look like.

              ⚠ AND IT COULD NOT BE A PHYSICAL TARGET ANYWAY. Those numbers are a
              hand-authored influence table with no falloff behind them. Real
              inverse-square light from the actual card positions produces
              different ratios, and **being different is not a defect.**

              **Direction only: the bottom row receives more than the top row.**
              Nothing is measured against these values — the geometry decides and
              Carl judges by eye. The Next step button this drives is itself being
              rebuilt in Three.js later, so it is provisional too.

              The grid element itself stays so the canvas has a box to size
              against; only the buttons are gone.
            */}
            <div
              className="enquiry-answer-grid"
              role="group"
              aria-labelledby="active-q-label"
              style={{ position: "relative", minHeight: "6.5rem" }}
            >
              {/*
                ⚠ ONE CANVAS, NOT TWO — the card and the lockup were merged into
                a single scene on 3 August, when Carl moved the card into the
                grid: *"put the card in its location, top left, and make it
                glass, not frosted."*

                ⚠ AND THE MERGE IS STRUCTURAL, NOT TIDINESS. A WebGL canvas can
                only refract objects in ITS OWN scene: the transmission pass
                renders the scene's `opaqueObjects` into a target that the glass
                samples (`three.module.js:18039`). While the card and the
                backdrop were separate canvases, overlaying them in CSS would
                have put the card in FRONT of the logo while it refracted
                nothing — the pale slab Carl kept reporting as "still frosted".

                It also removes the card's old dependence on
                `.enquiry-phrase-extras`: it mounts inside the grid now, so the
                card's slot coordinates and the backdrop's colour zones share
                one origin instead of two that must be kept in step.

                ⚠ THE CANVAS DEFERS ITS OWN WEBGL SETUP PAST THE PHRASE WIPE and
                needs no gate here. Mounting it unguarded reintroduced the Q5
                stutter on the "W" and "h" of "What" — measured 3 August at
                +58-64ms into the reveal with a 1827-2138ms long task behind it.
                `canvasWarm` was tried first and was the WRONG INSTRUMENT: it is
                derived from the contact field's warm-up, so the card arrived
                ~1330ms late. See `Q5_REVEAL_CLEAR_MS` in
                `answer-card-canvas.tsx`.

                Renders only at >= 1280px and only for Q5; absent otherwise.
              */}
              {/*
                ⚠ `warm` IS DELIBERATELY NOT PASSED. It defaults to `true`.

                Architect, 5 August (`live-work/architect-answer-begin-stall.md`
                Step 1): `cardCanvasWarm` was ONE FLAG DOING TWO JOBS — gating
                the hidden warm-up canvas AND gating this, the real one. On this
                side `warm` feeds both `mayCompile` and `entranceRunning`, so a
                flag that never flipped meant: no precompile, no `onWarm`, no
                `compiled` — AND THE CARDS NEVER ENTERED.

                ⚠ THAT IS THE WHOLE OF THE 4 AUGUST FAILURE, reverted at
                `8e562ed`. Gating the warm-up on the Begin reveal's
                `animationend` was sound in itself; the listener lives inside the
                `stage === "opening"` branch, and Begin is pressable at 7400ms
                while the reveal runs to 12400ms — so pressing Begin in those
                five seconds DESTROYS THE ELEMENT BEFORE ITS `animationend`
                FIRES. A gate whose opening event is destroyed by the action it
                waits behind. It was reported as a trade-off; it was a defect.

                Unhooking is safe, not a weakening: this canvas only mounts
                inside the phrase band, gated on `stage !== "opening"`, so it
                does not exist until after Begin — the choreography `warm` was
                protecting is already over by then. On every normal path the flag
                was already true when this mounted.

                The `warm` prop and `mayCompile` STAY on the component: that seam
                is what an early-mount restructure would use. This changes the
                caller, not the contract.
              */}
              {qNum === 5 && (
                <AnswerCardCanvas
                  active={isActive}
                  onEntranceStart={noteCardEntranceStart}
                />
              )}
            </div>

            <div
              className="mt-5"
              style={{
                opacity: selected.size > 0 ? 1 : 0,
                pointerEvents: selected.size > 0 ? undefined : "none",
                transition: "opacity 600ms linear",
                // Position-aware warm reflection. Q1–Q4 use the shared GRID_REFL model
                // (D-031 generalised). Q5 uses its own Stage-2 spatial light-filtering model
                // (q5ReflectionVars → --q5zone-*), which recolours the fixed crown/cap
                // reflection zones neutral→champagne→amber for the new lens. Both return {}
                // when nothing is selected and recompute each render, so no stale vars persist.
                ...(qNum === 5
                  ? q5ReflectionVars(QUESTIONS[qNum].options, selected)
                  : reflectionVars(QUESTIONS[qNum].options, selected)),
              }}
            >
              <button
                type="button"
                tabIndex={selected.size > 0 ? 0 : -1}
                onClick={handleNextStep}
                className={`enquiry-nextstep-btn${qNum === 5 ? " enquiry-nextstep-btn--q5proto" : ""} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`}
              >
                Next step
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // heading depth = memory.length + 1 (0 = full opening size, no depth class applied).
  // The heading is the deepest corridor layer — always one step below the deepest memory.
  const headingDepth = memory.length > 0 ? memory.length + 1 : 0;
  // The first recede (full opening heading -> d2) uses the ghost crossfade; later steps just
  // deepen via the transition. memory.length === 1 while the first step is in flight.
  const firstRecede = corridorMoving && memory.length === 1;

  // One ordered list of every rendered phrase (answered questions + the active one), built
  // so each question keeps a stable array slot across an answer: an answered question stays
  // at its index as it deepens, and the active question is always appended last. This single
  // array is rendered as ONE expression so React reconciles phrase-${qNum} by key across the
  // active->memory move (no remount => the outgoing phrase morphs depth-0 -> depth-1). The
  // INCOMING active question is withheld while the corridor is moving.
  const phraseList: { qNum: number; depth: number; isActive: boolean }[] = memory.map((item, i) => ({
    qNum: Number(item.label.slice(1)),
    depth: memory.length - i, // newest answered = depth-1
    isActive: false,
  }));
  if (!corridorMoving && stage !== "complete") {
    phraseList.push({ qNum: activeQ, depth: 0, isActive: true });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      {/* Shared shell — the heading lives here in BOTH states, anchored identically. */}
      {/* Only the content beneath the heading swaps, so the heading never shifts on Begin. */}
      <div className={`${stage === "opening" ? "enquiry-shell-opening" : "enquiry-shell-active"} text-center max-w-xl w-full`}>
        {/* Heading — normal flow at the top of the shell (anchored). In active */}
        {/* states its size changes via depth classes, but it never moves the */}
        {/* absolutely-positioned active slot below it. */}
        {firstRecede && (
          <h1
            className="font-semibold tracking-tight text-white text-3xl sm:text-4xl leading-[1.15] enquiry-opening-ghost"
            aria-hidden="true"
          >
            <div>{HEADING_LINE1}</div>
            <div>{HEADING_LINE2}</div>
          </h1>
        )}
        {firstRecede && headingDepth > 0 && (
          <h1
            className={`font-semibold tracking-tight text-white enquiry-heading-d${headingDepth} enquiry-heading-entering enquiry-corridor-ghost`}
            aria-hidden="true"
          >
            <div>{HEADING_LINE1}</div>
            <div>{HEADING_LINE2}</div>
          </h1>
        )}
        <h1
          className={`font-semibold tracking-tight text-white${
            headingDepth > 0
              ? ` enquiry-heading-d${headingDepth}${firstRecede ? " enquiry-heading-hidden" : ""}${corridorMoving && !firstRecede ? " enquiry-heading-deepening" : ""}${stage === "complete" ? " enquiry-heading-complete" : ""}`
              : " text-3xl sm:text-4xl leading-[1.15]"
          }`}
        >
          {/* ⚠ `openingMask` — NOT `stage === "opening"` alone. The mask classes
              carry the animations, so withholding the CLASS is what holds the
              choreography until the compile has landed (Step 4, `openingArmed`).
              Applying them all in one commit keeps the 600/2100/3600/7400 delays
              in proportion to each other; they simply start later. */}
          {/* Desktop/tablet: two lines, original reveal */}
          <span className="hidden sm:block">
            <div className={openingMask("enquiry-heading-line1-mask")}>
              {HEADING_LINE1}
            </div>
            <div className={openingMask("enquiry-heading-line2-mask")}>
              {HEADING_LINE2}
            </div>
          </span>
          {/* Mobile: four lines, sequential reveal */}
          <span className="block sm:hidden">
            <div className={openingMask("enquiry-m-heading-line1-mask")}>
              {HEADING_M1}
            </div>
            <div className={openingMask("enquiry-m-heading-line2-mask")}>
              {HEADING_M2}
            </div>
            <div className={openingMask("enquiry-m-heading-line3-mask")}>
              {HEADING_M3}
            </div>
            <div className={openingMask("enquiry-m-heading-line4-mask")}>
              {HEADING_M4}
            </div>
          </span>
        </h1>

        {/* Unified phrase corridor — every question lives here as ONE persistent phrase. */}
        {/* The active question is depth-0; each answered question (newest -> oldest) is */}
        {/* depth-1, depth-2, ... The heading is the deepest layer. Because all phrases */}
        {/* share this band and a stable per-question key, a question moving from active to */}
        {/* memory keeps its DOM node and morphs depth-0 -> depth-1 (and older ones deepen) */}
        {/* rather than being torn down and rebuilt. */}
        {stage !== "opening" && (
          <div className={`enquiry-phrase-band${stage === "complete" ? " enquiry-phrase-complete" : ""}`}>
            {/* ONE list, so React matches keys across the active<->memory move: the */}
            {/* outgoing question stays in the same reconciliation slot and morphs its */}
            {/* depth class (0 -> 1) instead of being unmounted and remounted. Only the */}
            {/* INCOMING active question is withheld until the corridor has settled. */}
            {phraseList.map(p => renderPhrase(p.qNum, p.depth, p.isActive))}
          </div>
        )}

        {/* Contact layer — mounting region for the Three.js contact field. The */}
        {/* four provisional CSS fields (Name, Business name, Website URL, Email) */}
        {/* and their per-field fade delays were removed; the layer's geometry is */}
        {/* unchanged: 576px (shared max-w-xl shell) x 184px (11.5rem), centred on */}
        {/* the same horizontal axis as Send. Do not collapse or reposition it. */}
        {/* ContactFieldCanvas overlays it absolutely (position:absolute; inset:0), */}
        {/* so it adds no layout height and cannot displace Send or the active */}
        {/* slot. Currently ONE static field object in the former top-left Name */}
        {/* position — a geometry/scale/placement proof, not the finished field. */}
        {/* */}
        {/* MOUNTED EARLY, REVEALED LATE. This renders from the moment the canvas */}
        {/* is warmed (mid-questionnaire), NOT at `complete`, so WebGL setup and */}
        {/* PMREM generation cannot land on top of the "Understood." reveal. The */}
        {/* element is the same one throughout: entering `complete` only flips */}
        {/* `opacity`, so React keeps the node, the WebGL context and the PMREM */}
        {/* render target — no remount, no regenerated environment. */}
        {/* */}
        {/* `canvasWarm` is the ONLY mount gate. There is deliberately no */}
        {/* `stage === "complete"` fallback: such a fallback would let completion */}
        {/* itself create the context and generate the environment — precisely the */}
        {/* defect this work removes. If preparation is somehow late, the FIELD */}
        {/* waits until the whole completion choreography (acknowledgement AND */}
        {/* Send's entrance) has cleared; neither animation is ever delayed. */}
        {/* */}
        {/* Hidden with `opacity`, deliberately NOT `display: none`: the layer must */}
        {/* keep its real 576 x 184 box (measured identical in both stages) because */}
        {/* the canvas maps 1 world unit to 1 CSS pixel from its measured size. A */}
        {/* zero-sized canvas would destroy that mapping and force a resize on */}
        {/* reveal. `.enquiry-contact-layer` is `position: absolute`, so mounting it */}
        {/* early still contributes no layout and cannot move Send or the slot. */}
        {/* ENTRANCE TIMING now lives in WEBGL, per box — `useEntranceCascade` in */}
        {/* contact-field-canvas.tsx, on the same approved contract (3600/4100/ */}
        {/* 4600/5100ms, 700ms linear each). It moved there on 30 July 2026 when */}
        {/* boxes 2–4 arrived: all four share ONE canvas, so a CSS fade on this */}
        {/* layer could only fade them together and cannot express four entrances */}
        {/* 500ms apart. The old `.enquiry-contact-layer--in` class was REMOVED, */}
        {/* not left in place — running both would multiply the two fades and give */}
        {/* box 1 a squared, slower ramp than the contract and than its siblings. */}
        {/* No inline `opacity` here: the materials own their own opacity. */}
        {canvasWarm && (
          <div
            className="enquiry-contact-layer"
            style={{
              pointerEvents: "none",
              visibility: stage === "complete" ? "visible" : "hidden",
            }}
          >
            {/* `active` is the cascade's clock zero, and it is deliberately NOT */}
            {/* this canvas's mount: the canvas mounts early on `canvasWarm` so */}
            {/* WebGL setup stays off the completion choreography. */}
            <ContactFieldCanvas active={stage === "complete"} filled={fieldFilled} />
            {/* The DOM form over the WebGL boxes. A SIBLING of the canvas, not a
                child: the canvas wrapper is `aria-hidden`, and inputs inside it
                would be invisible to assistive technology. `reducedMotion` is
                passed rather than re-read — a third independent `matchMedia`
                subscription could disagree with this file's and the canvas's.

                ⚠ `filled` IS LIFTED THROUGH HERE because the inputs and the
                canvas are SIBLINGS: the progressive rim lives in WebGL and the
                content it responds to lives in the DOM, so this is their nearest
                common parent. Only the four booleans travel — the values
                themselves stay in the inputs. */}
            <ContactFieldInputs
              active={stage === "complete"}
              reducedMotion={reducedMotion}
              onFieldStateChange={handleFieldState}
            />
          </div>
        )}

        {/*
          ⚠ THE ANSWER-CARD CANVAS'S WARM-UP MOUNT — INVISIBLE, AND OUTSIDE THE
          PHRASE BAND ON PURPOSE.

          ⚠ IT EXISTS BECAUSE THE Q5 STUTTER CAME BACK AND A FIRST FIX DID
          NOTHING. Carl, 4 August: *"On first run the stutter on W+H on Q5 was
          back. On runs 2,3+4 that resolved but the stall returned."*

          The cause was the Builder's: to let card 1 arrive at the phrase's
          MIDPOINT (Carl's walk), the guard that deferred the canvas past the
          1300ms wipe was removed — so Three.js setup, shader compilation and the
          transmission warm-up all moved INTO the phrase.

          ⚠ A WARM-UP GATE WAS ADDED FIRST AND WAS A SILENT NO-OP. It opened
          during the opening exactly as designed, and measured `canvases=0`
          before Begin — because the phrase band, and the Q5 grid inside it, are
          gated on `stage !== "opening"` (see above). **There was no canvas to
          warm.** It would have shipped as a fix that changed nothing; only
          checking for the canvas caught it.

          ⚠ SO THE CANVAS MUST EXIST DURING THE OPENING, and this is the same
          pattern the contact layer already uses two blocks up: MOUNTED EARLY,
          REVEALED LATE, hidden with `visibility` and never `display: none` —
          the canvas maps one world unit to one CSS pixel from its MEASURED size,
          so a zero-sized box would destroy the mapping and force a resize on
          reveal.

          ⚠ AND IT IS A SEPARATE INSTANCE FROM THE Q5 ONE, DELIBERATELY. Sharing
          a single node would mean moving it between two parents mid-corridor,
          which remounts it in React and throws away the very context this exists
          to prepare. This one's only job is to make the browser compile the
          shaders and build the transmission target; the real canvas then hits a
          warm driver cache.

          ⚠ AND THE CLAIM THAT USED TO SIT HERE — "the opening runs ~11.5s of
          CSS-only choreography, so this work lands in genuinely dead time" — IS
          FALSE. Architect, 5 August, straight off `globals.css`: heading 600→2700,
          heading 2100→4200, subtext 3600→7800, Begin reveal 7400→12400. THE
          OPENING ANIMATES WITHOUT A BREAK FROM 600ms TO 12400ms. The only
          animation-free window on the page is 0→600ms.

          That is why `requestIdleCallback` has never once fired on genuine idle
          here and every backstop timeout has fired unguarded: the backstop is not
          a backstop, it is the only path. Each scheduling attempt merely chose
          WHICH ANIMATION TO STUTTER — 900ms picked the heading, 5200ms the
          subtext, `beginActive` the Begin reveal.

          ⚠ `?nowarmup=1` SUPPRESSES THIS BLOCK — diagnostic only, for
          `verify/warmup-value.mjs` arm B. The open question is whether this
          canvas buys the real one anything at all, given a WebGL context is
          per-canvas and dies with the node. Remove the switch when that question
          is closed.
        */}
        {stage === "opening" && !suppressWarmup && (
          <div
            aria-hidden="true"
            data-testid="answer-card-warmup"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 576,
              height: 104,
              visibility: "hidden",
              pointerEvents: "none",
            }}
          >
            <AnswerCardCanvas active={false} warm onCompiled={armOpening} />
          </div>
        )}

        {stage === "opening" ? (
          <>
            <div className="mt-6">
              {/* Desktop/tablet: single block reveal */}
              <p className={["hidden sm:block text-base text-neutral-400 leading-relaxed", openingMask("enquiry-subtext-mask")].filter(Boolean).join(" ")}>
                {SUBTEXT}
              </p>
              {/* Mobile: two-line sequential reveal */}
              <div className="block sm:hidden text-base text-neutral-400 leading-relaxed">
                <div className={openingMask("enquiry-m-subtext-line1-mask")}>{SUBTEXT_M1}</div>
                <div className={openingMask("enquiry-m-subtext-line2-mask")}>{SUBTEXT_M2}</div>
              </div>
            </div>
            {/* Begin: a full-width, block-level, relative parent holds two
                SIBLINGS — the visual-only reveal and the semantic hit target.
                (1) `.enquiry-button-mask` is the visual-only child: the wide,
                    full-width radial reveal wrapping the decorative visible pill.
                    Its `clip-path` also clips hit-testing for ITS OWN children, so
                    the hit target must NOT live inside it.
                (2) `.enquiry-begin-hit` is a SIBLING of the mask (not a child), so
                    the mask's clip-path never gates its hit-testing — the cursor
                    turns to a hand the instant the reveal begins, not once the
                    circle physically reaches the pill. It is absolutely centred
                    over the visible pill with identical pill dimensions + top, and
                    becomes pointer-active at the mask's `animationstart`.
                The visible pill is decorative (aria-hidden, not focusable, no
                click), so there is exactly one accessible "Begin" control. Reduced
                motion: mask is static (no reveal), beginActive already true →
                immediately usable. */}
            <div className="mt-10 enquiry-begin-parent">
              <div
                className={`enquiry-button-mask${reducedMotion ? " enquiry-button-mask--static" : ""}${!reducedMotion && !openingArmed ? " enquiry-button-mask--held" : ""}`}
                onAnimationStart={(e) => {
                  // Activate the sibling hit target the instant the visible reveal
                  // STARTS. Guard to this wrapper's own radial reveal only.
                  if (
                    e.target === e.currentTarget &&
                    e.animationName === "enquiry-mask-reveal-radial"
                  ) {
                    setBeginActive(true);
                  }
                }}
              >
                <span
                  aria-hidden="true"
                  className="enquiry-begin-btn rounded-full px-6 py-2.5 text-sm font-medium"
                >
                  Begin
                </span>
              </div>
              <button
                type="button"
                tabIndex={beginActive ? 0 : -1}
                aria-disabled={beginActive ? undefined : true}
                onClick={() => beginActive && enterActive()}
                className="enquiry-begin-hit rounded-full px-6 py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Begin
              </button>
            </div>
          </>
        ) : stage === "complete" ? (
          <div className="enquiry-active-slot" style={{ position: "relative" }}>
            {/* Acknowledgement — absolutely overlaid so it does not push Send down */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                ...(reducedMotion
                  ? undefined
                  : {
                      animation: `eq-understood-fade-out ${ACK_FADE_OUT_DURATION_MS}ms linear ${ACK_FADE_OUT_DELAY_MS}ms forwards`,
                    }),
              }}
            >
              <div className="enquiry-q5-heading" style={{ marginBottom: "0.5rem" }}>
                <span
                  className="enquiry-q5-question"
                  style={reducedMotion ? undefined : { animation: "enquiry-mask-reveal-horizontal 1100ms cubic-bezier(0.37, 0, 0.63, 1) 0ms both" }}
                >
                  Understood.
                </span>
              </div>
              <p
                className="text-sm text-neutral-400 leading-relaxed"
                style={reducedMotion ? undefined : { animation: "enquiry-mask-reveal-horizontal 3600ms cubic-bezier(0.37, 0, 0.63, 1) 800ms both" }}
              >
                We&apos;re on it. Add your details and we&apos;ll turn this into a clearer direction for your site.
              </p>
            </div>
            {/* Send (the opal) — ⚠ MASKED OFF while the box 1 -> box 2 relationship */}
            {/* is judged in isolation. `OPAL_MASKED = false` restores it. Hidden with */}
            {/* `visibility`, not unmounted: the button keeps its real box so nothing */}
            {/* below it shifts, and restoring it cannot change the layout. */}
            <div
              style={
                OPAL_MASKED
                  ? { visibility: "hidden" }
                  : reducedMotion
                    ? undefined
                    : {
                        animation: `eq-completion-item-in ${OPAL_FADE_IN_DURATION_MS}ms linear ${OPAL_FADE_IN_DELAY_MS}ms both`,
                      }
              }
            >
              <button
                type="button"
                className="enquiry-send-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Send
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
