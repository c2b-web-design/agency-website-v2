"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ContactFieldCanvas, { FIELD_ENTRANCE_END_MS } from "./contact-field-canvas";
import ContactFieldInputs, { type FieldStateSnapshot } from "./contact-field-inputs";
import { FIELD_SLOTS } from "./contact-field-geometry";
import AnswerCardCanvas from "./answer-card-canvas";
import { prewarmLabelCanvases } from "./answer-card-mesh";
import { NextStepMeshButton, NextStepSurfaceHost } from "./nextstep-canvas";
// ⚠ THE CARD CHOREOGRAPHY'S OWN END, DERIVED THERE AND IMPORTED HERE — never
// retyped. This file's own history records a hand-written end-of-choreography
// value going stale twice.
// ⚠ `CORRIDOR_STEP_MS` and `COMPLETE_HOLD_MS` WERE BARE LITERALS HERE (1150 and
// 900) until 18 August 2026. They moved to the geometry file so the card exit's
// headroom can be DERIVED against them rather than asserted in a comment. The
// values are unchanged — this is a naming change, not a retiming.
import {
  ENTRANCE_END_MS,
  CORRIDOR_STEP_MS,
  COMPLETE_HOLD_MS,
} from "./answer-card-geometry";
// The host's pre-measurement fallback box. ⚠ It must be non-zero: the canvas
// maps one world unit to one CSS pixel from its measured size, so a zero box
// would destroy that mapping before the first real rect arrives.
import { GRID_WIDTH_PX, GRID_HEIGHT_PX } from "./answer-card-backdrop-geometry";

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

/**
 * ⚠⚠ HOW MUCH EARLIER THE COMPLETION TAIL BEGINS — `?acklead=`.
 *
 * **A FEEL VALUE, HAND-ENTERED, JUDGED BY EYE. It is not a grid position.**
 * Carl, 20 August 2026: on screen he sees cards 1 2 3 4 and then the fade
 * begins, and the fade starts *"roughly 200-300ms later than it should"*.
 *
 * ⛔ **NOT A FIFTH BEAT AND NOT A STAGGER CONSTANT.** Carl's instruction of
 * 30 July still governs — *"break them apart and not have them so reliant on
 * proportion and ratios... We will judge it by eye and input the numbers."*
 * This is one number to be moved by his eye, and nothing derives a rhythm
 * from it.
 *
 * ⚠ **250 IS A FIRST PASS, NOT A PROPOSAL** — the midpoint of the range Carl
 * described, put on screen so he has something to react to. Find the value with
 * `?acklead=` on a running build (pair it with `?skip=1`, which mounts the
 * completion state directly), then hand-enter what his eye settles on.
 */
const ACK_LEAD_MS = 250;

/**
 * ⚠ THE 500ms GAP IS EMERGENT AND NOTHING HOLDS IT — so the opal carries the
 * SAME lead, or the gap widens on its own.
 *
 * Between "Understood." finishing and the opal arriving there is a small piece
 * of dead space. **Carl wants that gap EXACTLY as it is** (20 August 2026). It
 * is not a constant: it is the difference between two independently entered
 * numbers, and moving only the acknowledgement would silently stretch it.
 *
 * ⚠ **SUBTRACTING THE LEAD HERE IS WHAT KEEPS IT FIXED**, and it is the whole
 * reason this constant is no longer the bare 8600 it was. The gap stays 500ms
 * at every value of `ACK_LEAD_MS`.
 */
const OPAL_FADE_IN_DELAY_MS = 8600 - ACK_LEAD_MS;

// The acknowledgement tracked the last VISIBLE box so "Understood." never
// vanishes underneath something still arriving — occlusion, not feel, which is
// why it is derived while the feel-carrying values are hand-entered.
//
// ⚠ IT STILL TRACKS THAT BOX; IT NOW LEADS IT BY `ACK_LEAD_MS`. The occlusion
// property is UNCHANGED IN KIND, because the guard was never "no box is still
// fading in" — at the original 0ms lead, boxes 2, 3 and 4 were still arriving
// when the fade began (86.7% / 70.0% / 53.3% in). What it guarantees is that
// "Understood." is GONE by the time the last box SETTLES. That still holds:
// the fade ends at 7850ms, box 4 settles at 8100ms.
const ACK_FADE_OUT_DURATION_MS = 1400;
const ACK_FADE_OUT_DELAY_MS =
  FIELD_ENTRANCE_END_MS - ACK_FADE_OUT_DURATION_MS - ACK_LEAD_MS;

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
 * 1280px, ON EVERY LOAD.
 *
 * ⚠ HISTORICAL — THE 1280px GATE NO LONGER EXISTS. Removed 7 August 2026
 * (`answer-card-canvas.tsx:98`); the cards measure the grid and mount at every
 * width. **This paragraph describes the fault that PRODUCED this timer, not how
 * the canvas behaves today.** The timer is still load-bearing for other reasons.
 *
 * ⚠⚠ THE FOURTH STALE ASSERTION OF THIS GATE, CORRECTED 10 AUGUST 2026. Three
 * others were fixed earlier the same day after they misled a rollout plan into
 * asking the Architect to rule on inheriting a gate that does not exist; this
 * one was missed in that sweep and was found by the Architect's review of the
 * NEXT plan. **A stale comment is an instrument — it is what the next reader
 * measures the code by — and a partial sweep leaves the trap armed.** If a
 * fifth is found, search the whole file for `1280` rather than fixing it alone.
 *
 * Historically: `AnswerCardCanvas` returned `null` below `PROTO_MIN_VIEWPORT_PX`,
 * so no canvas existed, nothing reported `compiled`,
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
 * animate under `prefers-reduced-motion`, so `onEntranceStart` never fires on
 * that path, and without this the contact field would wait forever.
 *
 * ⚠ THE FIFTH STALE 1280 ASSERTION, CORRECTED 10 AUGUST 2026. This also claimed
 * the canvas "does not mount below `PROTO_MIN_VIEWPORT_PX` (1280)". **That gate
 * was removed on 7 August** (`answer-card-canvas.tsx:98`) — the cards measure
 * the grid and mount at every width. The reduced-motion half above is still
 * true, which is why this one survived two sweeps: a comment can be half stale,
 * and the true half makes the false half read as verified.
 *
 * ⚠ FOUND BY GREPPING `1280` ACROSS THE WHOLE FILE after the fourth was fixed
 * — the sweep the note at `armOpening` now tells the next reader to run. It
 * worked; do the same rather than fixing a stale comment where you find it.
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

/**
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ REMOVED — `GRID_REFL`, `reflectionVars`, `q5ReflectionVars` (D-031/D-032)
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ~194 lines deleted 10 August 2026 on Carl's instruction: *"amber might not
 * return, delete."* Recovered from git at `d0cf9f5` if ever needed.
 *
 * **What they did.** Position-aware warm reflection: a selected card warmed the
 * Next step button from its own grid position, as CSS custom properties
 * (`--refl-*`, `--q5zone-*`) consumed by the button's painted gradients.
 * Approved as D-031 (Q5 prototype) and D-032 (Q1–Q5 rollout).
 *
 * ⚠⚠ THEY WERE ALREADY DEAD BEFORE THIS DELETION, AND THAT IS THE PART WORTH
 * KEEPING. Stage A made the mesh the button's surface, and
 * `.enquiry-nextstep-btn--mesh` sets `background-image: none` — so these vars
 * were being computed into a surface that no longer paints. **An approved layer
 * was superseded without being recorded**; the deletion is the correction, not
 * the change.
 *
 * ⚠ IT WAS INVISIBLE BECAUSE `selected` IS ALWAYS EMPTY in this build, so both
 * functions returned `{}` on every render and nothing looked wrong. Stage B —
 * restoring selection — is the change that would have made them run for the
 * first time, into nothing. Found by the Architect reviewing the Stage B plan.
 *
 * ⚠ THE BEHAVIOUR IS NOW UNIMPLEMENTED, NOT REWIRED. The mesh's equivalent is
 * amber on `NextStepCanvas` (`AmberSource`), which is `0` and parked by Carl's
 * own instruction — *"It's something that may or may not be implemented with
 * the cards. This is something i will return to."* If it does return, it
 * returns there, in the environment, not as CSS gradients on a painted button.
 *
 * ⚠ `GRID_REFL` WAS NOT A SPECIFICATION and must not be treated as one if this
 * is ever revisited. Carl retired that reading on 5 August: it was a CSS-era
 * hand-authored influence table, *"approved only within the constraints of
 * CSS"*, with no falloff behind it. **Direction only: the bottom row receives
 * more than the top row.**
 */

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
  /**
   * ⚠ THE `?acklead=` DOOR — so Carl can find this value by EYE on a running
   * build rather than through a rebuild per attempt, the way `?tealstrength=`
   * was used to settle the hover teal (D-053).
   *
   * Pair it with `?skip=1`, which mounts the completion state directly:
   *   /start?skip=1&acklead=250   ← the shipped default
   *   /start?skip=1&acklead=0     ← the original, for comparison
   *
   * ⚠ READ ONCE, IN STATE. A value re-read per render would be a knob that
   * appears to work and changes nothing once the animation has started — the
   * class of fault `answer-card-mesh.tsx` has already been caught by twice.
   *
   * ⚠ BOTH TAIL ELEMENTS READ IT, so the 500ms dead-space gap is preserved at
   * every value. The door is a tuning aid; `ACK_LEAD_MS` is what ships.
   */
  const [ackLead] = useState(() => {
    if (typeof window === "undefined") return ACK_LEAD_MS;
    const raw = new URLSearchParams(window.location.search).get("acklead");
    if (raw === null) return ACK_LEAD_MS;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : ACK_LEAD_MS;
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
  /**
   * ⚠⚠ THE QUESTION-BOUNDARY PHASE — THE SIGNAL THE SYSTEM NEVER HAD.
   *
   * Two open items shared one absence: Q4-Q1 have no card entrance (item 2) and
   * the cards have no exit at all (item 4). **Neither can be built without
   * something that says "this question is ending" and "a new question has
   * begun"** — and until this landed, nothing in the running system said either.
   * `handleNextStep` expressed the boundary as two bare `setTimeout`s, which
   * cannot be asserted against by any instrument.
   *
   * | Phase | Begins | Means |
   * |---|---|---|
   * | `settled`  | t = 1150 (and at Begin) | a question is up and interactive |
   * | `leaving`  | **t = 0**, at the Next-step click | this question's cards are departing |
   * | `arriving` | **t = 1150**, with `setActiveQ` | the next question's cards are entering |
   *
   * ⚠ NAMED FOR WHAT IS HAPPENING, NOT FOR A BOOLEAN'S DIRECTION. An earlier
   * dialog called one edge "rising" in its title and "falling" in its body; that
   * ambiguity dies here.
   *
   * **Two edges, one owner.** `leaving` will drive the exit; `arriving` will
   * re-arm the entrance. ⚠ Two edges is the correct model and is not a
   * compromise — the choreography genuinely has two events with an ordering
   * constraint between them. **The §5a hazard would be two edges with two
   * OWNERS**, which is how you get signals that agree by coincidence until they
   * don't.
   *
   * ⚠⚠ NOTHING ANIMATES OFF THIS YET. Step 1 lands the machine and its
   * instrument only. The exit and the entrance re-arm are Steps 2 and 3, and the
   * walk must look and behave exactly as it did before this commit.
   */
  const [corridorPhase, setCorridorPhase] = useState<"settled" | "leaving" | "arriving">("settled");
  /**
   * ⚠ A COUNTER, NOT A QUESTION NUMBER — and that is the difference from
   * `entranceEpoch`, which is `activeQ`. The exit fires at t=0 while `activeQ` is
   * still the OUTGOING question, so the question number has not changed yet and
   * could not signal anything. A monotonic bump can.
   *
   * ⚠ IT CARRIES NO TIME. Its only job is to make the cards' effect re-run at the
   * leaving edge; the clock comes from `__leavingEdgeAt`. See `publishLeavingEdge`.
   */
  const [exitEpoch, setExitEpoch] = useState(0);
  /**
   * ⚠⚠ DERIVED, NEVER STORED — THE LOAD-BEARING CONSTRAINT OF THE WHOLE DESIGN.
   *
   * This was `useState<boolean>` with 5 writes and 8 reads. It is now computed
   * from the phase, so **there is no second source of truth** and the 8 reads
   * keep working unchanged. A stored copy could disagree with the phase for a
   * commit; a derived one cannot disagree at all.
   *
   * ⚠ THE SEMANTICS ARE PRESERVED EXACTLY. It was true from the Next-step click
   * until the step timeout fired, and both non-`settled` phases sit inside that
   * window — `leaving` from t=0 and `arriving` at t=1150, which ends in the same
   * React batch that returns the machine to `settled`. **Reduced motion never
   * set it and still never does**: that path leaves the phase at `settled`.
   */
  const corridorMoving = corridorPhase !== "settled";
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

  /*
    ⚰️ `suppressWarmup` / `?nowarmup=1` REMOVED 18 August 2026 with the warm-up
    canvas it gated. It was arm B of `verify/warmup-value.mjs` — the switch that
    measured whether the warm-up bought the real canvas anything.

    ⚠ THAT QUESTION IS NOW ANSWERED BY DELETION RATHER THAN BY A FLAG, so the
    flag has nothing left to suppress. `verify/warmup-value.mjs` is stale as a
    result; it is left in place rather than edited here, because the deletion and
    a harness rewrite are separately attributable changes.
  */

  /**
   * ⚠ THE WARM-UP CANVAS OUTLIVES THE STAGE CHANGE BY A SHORT OVERLAP.
   *
   * ⚠ THE DEFECT, MEASURED 9 AUGUST 2026 ON THE REAL GPU. The warm-up renders
   * only while `stage === "opening"`; the real Q5 canvas renders only after it.
   * They are MUTUALLY EXCLUSIVE, so pressing Begin destroys the warm context in
   * the same commit that creates the real one. A WebGL context is per-canvas and
   * dies with its node, so the real canvas rebuilt everything from scratch:
   * a third context created at +114-203ms after Begin, followed by ~580ms of
   * Three.js CPU-side initialisation — landing inside the 1300ms phrase wipe,
   * which starts at +60ms. Carl saw it as a stutter half way through the reveal.
   *
   * ⚠ SHADER COMPILATION IS NOT THE COST — measured at 0.2-0.3ms inside the
   * reveal, exactly as in July. The cost is Three.js initialisation for a
   * newly-created context. Blaming "shader compilation" here would be the third
   * time this project chased that particular ghost.
   *
   * ⚠ WHAT THE WARM-UP IS ACTUALLY WORTH, AND IT REFUTED THE OBVIOUS READING.
   * The reasoning "the context dies, so the warm-up buys nothing, so delete it"
   * is wrong. `verify/warmup-value.mjs`, 3 runs per arm, cold GPU profile each:
   *
   *     mount -> compiled, warm-up PRESENT    161ms
   *     mount -> compiled, warm-up ABSENT     919ms
   *
   * ANGLE's ON-DISK BINARY SHADER CACHE survives the context's death and is
   * worth ~758ms. Deleting the warm-up would have made the stutter twice as bad.
   *
   * ⚠ SO THIS HOLDS THE WARM NODE ALIVE ACROSS THE HANDOVER instead of removing
   * it. The real canvas is created and does its setup while the warm context
   * still exists, then the warm one goes.
   *
   * ⚠ WHY NOT ONE SHARED CANVAS — THE ROUTE THAT LOOKS RIGHT AND IS NOT. Moving
   * a single node between the opening branch and the phrase band changes its
   * PARENT, which remounts it in React and destroys the very context the move
   * exists to preserve. The comment on the warm-up block has said so since
   * 5 August. **A true single-canvas fix needs a host that NEVER unmounts** —
   * not one that moves less often.
   *
   * ⚠⚠ THE "BIGGER CHANGE THAN THIS DEFECT JUSTIFIES" HALF OF THIS ARGUMENT IS
   * NOW STALE — see D-048, 11 August 2026. It weighed the restructure against
   * ~70ms of residue in the opening, once. **Stage B put a card grid on all five
   * questions, and the same mechanism measures 193ms against a 69ms control on
   * EVERY question step** — +124ms, 2.8x, four times per walk. Carl has ruled
   * that non-negotiable.
   *
   * ⚠ THE MEASUREMENT HAZARD D-046 ALSO CITED IS GONE TOO: the geometry is now
   * anchored to `.enquiry-answer-grid` through a `ResizeObserver`, so a canvas
   * that changes parent while measuring the same grid lays out identically.
   *
   * ⚠ WHAT STILL BINDS IS CARL'S CONSTRAINT — *"nothing ive approved must
   * shift"*, restated 10 August as *"the corridors movement is important, there
   * is easing in there too."* The canvas inherits the phrase's recede motion,
   * its measurement and its entrance ladder **for free** by being a child; a
   * shared host must re-supply all three. `verify/corridor-motion.mjs` holds it
   * to the committed baseline. **The restructure is REOPENED, not authorised.**
   *
   * ⚠ AN OVERLAP, NOT A DELAY ON THE STAGE CHANGE. `stage` flips exactly when it
   * always did, so every consumer of it — the phrase band, the Q5 grid, the card
   * ladder, the opening's own teardown — is untouched. The ONLY thing extended
   * is how long an invisible, `aria-hidden`, `pointer-events: none` node stays
   * in the tree. Delaying the stage change itself would move the choreography.
   *
   * ⚠ 900ms, AND THE FIGURE IS DERIVED, NOT PICKED. It must outlast the real
   * canvas's setup (161ms mount->compiled, plus the ~580ms initialisation
   * behind it = ~740ms) with margin, and it must end before anything the eye is
   * on. The first card beat is at +695ms and the phrase wipe ends at +1360ms
   * (60 + 1300), so the node is gone before the reveal completes and costs
   * nothing visible — it never draws.
   *
   * ⚠ IF THIS VALUE EVER NEEDS TUNING, THE OVERLAP IS THE WRONG FIX AND THE
   * SHARED-HOST RESTRUCTURE IS THE RIGHT ONE. A number that has to grow to keep
   * working is hiding a lifecycle problem rather than solving it.
   */
  /*
    ⚰️ `warmupHeldOver` / `WARMUP_OVERLAP_MS` REMOVED 18 August 2026 with the
    warm-up canvas. The overlap existed for exactly one reason: without it, the
    warm node and the real Q5 canvas were mutually exclusive, so Begin destroyed
    the warm context in the same commit that created the real one.

    ⚠ WITH NO WARM NODE THERE IS NOTHING TO HOLD OVER. The comment above is left
    standing as the record of why the overlap existed and what it measured.
  */

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
  /**
   * ⚠⚠ THE SHARED HOST'S RECT — THE ONE THING THAT SANK THE 12 AUGUST BUILD.
   *
   * **Where the measurement comes from:** `.enquiry-answer-grid` of the ACTIVE
   * question — the same element that already feeds `gridWidth` inside
   * `AnswerCardCanvas`. One element, one measurement.
   *
   * **What is read:** `getBoundingClientRect()` — left/top/width/height, in
   * VIEWPORT coordinates.
   *
   * **What consumes it:** the host div's `position: fixed` left/top/width/
   * height. `fixed` resolves against the viewport, which is the same space
   * `getBoundingClientRect()` reports in, so the two agree BY CONSTRUCTION.
   * There is no conversion, no `offsetParent`, and no arithmetic correction
   * anywhere in the path.
   *
   * ⚠ WHY THAT MATTERS. `protoCanvasBox()` returns `left: 0, top: 0` — literal
   * zeros meaning *"fill my host"*. Those zeros were correct only because the
   * canvas happened to render inside `.enquiry-answer-grid`, which is
   * `position: relative`. **Nothing in the code ever said "the grid is at
   * 0,0", so nothing could detect that it had stopped being true** — the
   * canvas moved out, the zeros silently started meaning "the shell", and the
   * cards rendered ~230px high while three instruments stayed green.
   *
   * Now the host's box IS the grid's box, so the invariant holds by
   * measurement rather than by accident of DOM nesting.
   *
   * ⚠ `null` UNTIL MEASURED, AND THAT IS LOAD-BEARING. The 12 August code
   * promised a `gridOffset === null` guard and never implemented one; its
   * `?? 0` fallback rendered the first frame at the shell origin. Here `null`
   * means the host is `visibility: hidden` — mounted, sized, compiling, and
   * painting nothing.
   */
  const [hostRect, setHostRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const activeGridRef = useRef<HTMLDivElement | null>(null);
  const [gridTick, setGridTick] = useState(0);

  /**
   * ⚠⚠ THE NEXT-STEP BUTTON'S RECT — commit 1 of the Q5 freeze repair,
   * 18 August 2026.
   *
   * The button's mesh is drawn by `NextStepSurfaceHost`, mounted ONCE below,
   * instead of by a canvas inside the keyed phrase. The active
   * `NextStepMeshButton` publishes its viewport rect here and the host draws
   * there. **Viewport coordinates on both sides, `position: fixed` on the host,
   * so they agree with no arithmetic.**
   *
   * ⚠ `null` MEANS DRAW NOTHING — no button on screen, or not yet measured.
   * ⛔ Never coerce to zero.
   *
   * ⚠ A STABLE CALLBACK IDENTITY IS LOAD-BEARING. `NextStepMeshButton` publishes
   * from an effect keyed on `[onRect, box, suppressMesh]`; an inline arrow here
   * would change identity every render and re-fire that effect on every parent
   * render, including the ones the corridor produces at 60fps while moving.
   */
  const [btnRect, setBtnRect] = useState<{ left: number; top: number; w: number; h: number } | null>(null);
  const handleBtnRect = useCallback(
    (r: { left: number; top: number; w: number; h: number } | null) => {
      setBtnRect((prev) =>
        prev === r ||
        (prev &&
          r &&
          Math.abs(prev.left - r.left) < 0.5 &&
          Math.abs(prev.top - r.top) < 0.5 &&
          Math.abs(prev.w - r.w) < 0.5 &&
          Math.abs(prev.h - r.h) < 0.5)
          ? prev
          : r,
      );
    },
    [],
  );

  /**
   * Callback ref on the ACTIVE question's grid.
   *
   * ⚠ A CALLBACK REF, NOT A `MutationObserver`. The 12 August machinery watched
   * `.enquiry-phrase-band` with `subtree: true, attributes: true` and bumped a
   * nonce on EVERY mutation — which includes every corridor step's depth-class
   * morph, firing re-renders on a WebGL component for no benefit. React already
   * tells us exactly when this element is attached and detached; that is the
   * signal, and it has no false positives.
   */
  const setActiveGrid = useCallback((el: HTMLDivElement | null) => {
    activeGridRef.current = el;
    setGridTick((n) => n + 1);
  }, []);

  /**
   * ⚠ THE ARMING PATH IS RECORDED BY NAME, AND THAT IS A DIAGNOSTIC REQUIREMENT
   * RATHER THAN A NICETY.
   *
   * There are THREE exits — the compile (`onCompiled`), the ready gate
   * (`document.fonts.ready` + a committed frame), and the 4000ms ceiling — and
   * they are indistinguishable on screen. `verify/opening-arm.mjs` previously
   * had to INFER which one fired, by comparing the heading's start against the
   * `warmup-canvas-compiled` mark. That inference has already produced one
   * false verdict ("0/3 armed by COMPILE" on a gate that was working), and it
   * breaks entirely once the warm-up canvas is gone, because the mark it keys
   * off no longer exists.
   *
   * ⚠ A BACKSTOP THAT FIRES ROUTINELY IS NOT A BACKSTOP. That is exactly how
   * the previous design failed for two sessions: `requestIdleCallback`'s
   * timeout became the only path and nothing reported it. So the name is
   * written down at the moment of arming, and the harness reads it instead of
   * deducing it.
   *
   * ⚠ FIRST WRITE WINS. Later callers are no-ops for `openingArmed`, so
   * recording their name would misreport which exit actually armed the page.
   */
  const [openingArmed, setOpeningArmedInternal] = useState(false);
  const armedByRef = useRef<string | null>(null);
  const armOpening = useCallback((source: string) => {
    if (armedByRef.current === null) {
      armedByRef.current = source;
      // Read by `verify/opening-arm.mjs`. A `performance.mark` rather than a
      // bare global so it carries a timestamp on the same clock as the
      // animation events the harness already reads.
      try {
        performance.mark(`opening-armed-by-${source}`);
        (window as unknown as { __armedBy?: string }).__armedBy = source;
      } catch {}
    }
    setOpeningArmedInternal(true);
  }, []);

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

  /**
   * Keep the shared host over the active grid.
   *
   * ⚠ NO SCROLL LISTENER, AND THAT IS A MEASURED DECISION RATHER THAN AN
   * OMISSION. `verify/`-style check, 14 August, all three widths and both
   * motion modes: `document.documentElement.scrollHeight === innerHeight`
   * (900 vs 900) before AND after Begin. **The corridor cannot scroll.** A
   * listener for an event that cannot fire is an unexercised path — and
   * `answer-card-canvas.tsx` already carries a comment claiming a
   * "scroll/resize listener" while binding only `resize`. If the page ever
   * becomes scrollable, the honest fix is to sample in the render loop's rAF,
   * not to add a listener here.
   *
   * ⚠ A `ResizeObserver` IS NOT ENOUGH ON ITS OWN: the grid MOVES between
   * questions without changing size — same 576x104 box at a new position — so
   * the corridor step must also re-measure. `gridTick` is that signal.
   */
  useEffect(() => {
    const el = activeGridRef.current;
    if (!el) {
      setHostRect(null);
      return;
    }
    const apply = () => {
      const r = el.getBoundingClientRect();
      // A zero box means the element is not laid out yet. Committing it would
      // collapse the canvas and destroy the 1-world-unit-to-1-CSS-px mapping.
      if (r.width <= 0 || r.height <= 0) return;
      setHostRect((prev) =>
        prev &&
        Math.abs(prev.left - r.left) < 0.5 &&
        Math.abs(prev.top - r.top) < 0.5 &&
        Math.abs(prev.width - r.width) < 0.5 &&
        Math.abs(prev.height - r.height) < 0.5
          ? prev
          : { left: r.left, top: r.top, width: r.width, height: r.height },
      );
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);

    /**
     * ⚠⚠ PER-FRAME TRACKING WHILE THE CORRIDOR MOVES — 14 August 2026.
     *
     * `ResizeObserver` does not fire for a MOVE: the grid keeps its 576x104 box
     * and only its position changes, so without this the host would jump from
     * the start rect to the end rect and the cards would not travel.
     *
     * ⚠ THIS FOLLOWS, IT DOES NOT ANIMATE. Every frame it asks the browser
     * where the element it is already animating currently is. No easing
     * function, no duration, no curve — nothing that could drift out of step
     * with the CSS, because nothing here knows what the CSS does. **That is the
     * distinction D-046 draws:** the hazard it names is *"the easing becomes a
     * hand-driven animation matching `bottom 900ms cubic-bezier(0.37, 0, 0.63,
     * 1)`"* — reproducing the curve. Reading the animated element's rect is the
     * opposite: it cannot disagree with the browser because it IS the browser's
     * answer.
     *
     * ⚠ ONLY WHILE MOVING. At rest the ResizeObserver and the corridor-step
     * re-measure are sufficient, and an rAF loop that never stops would keep a
     * React setState scheduled on every frame of an idle page.
     */
    let raf = 0;
    if (corridorMoving) {
      const track = () => {
        apply();
        raf = requestAnimationFrame(track);
      };
      raf = requestAnimationFrame(track);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [gridTick, stage, corridorMoving]);
  useEffect(() => {
    if (openingArmed) return;
    // Reduced motion has no animations to protect — arm immediately so the
    // opening is never gated on WebGL for a visitor who will not see a reveal.
    if (reducedMotion) {
      // ⚠ WRAPPED, NOT PASSED DIRECTLY. `setTimeout(armOpening, 0)` hands the
      // callback the timer id as its first argument, which would record the
      // source as a number.
      const id = window.setTimeout(() => armOpening("reduced-motion"), 0);
      return () => window.clearTimeout(id);
    }

    /**
     * ⚠⚠ THE READY GATE — AND IT EXISTS BECAUSE THE BACKSTOP WAS THE ONLY PATH
     * ON EVERY VIEWPORT UNDER 1280px.
     *
     * ⚠ HISTORICAL: THE 1280px GATE NO LONGER EXISTS. It was removed on
     * 7 August 2026 — `answer-card-canvas.tsx:98` records it, and the cards now
     * measure the grid instead. **This paragraph describes why the ready gate
     * was BUILT, not how the canvas behaves today.** The gate is still correct
     * and still load-bearing: `compiled` can be late for other reasons.
     *
     * ⚠⚠ CORRECTED 10 AUGUST 2026 BECAUSE THIS COMMENT MISLED A PLAN. Three
     * stale assertions of the 1280 gate in this file (here, the ceiling below,
     * and the canvas mount) were read as current, and produced a plan that asked
     * the Architect to rule on inheriting a gate that does not exist. **A stale
     * comment is an instrument: it is what the next reader measures the code by,
     * and it lies in exactly the way a bad harness lies.**
     *
     * Historically: no canvas meant nothing ever reported `compiled`, so
     * `armOpening` was reached ONLY by the 4000ms ceiling below — and the
     * visitor watched a blank screen for 4.2 seconds before the heading began.
     * Measured across widths
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
          if (!cancelled) armOpening("ready-gate");
        });
      });
    };
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(armWhenPainted, armWhenPainted);
    } else {
      armWhenPainted();
    }

    // ⚠ WRAPPED for the same reason as the reduced-motion timer above: a bare
    // `armOpening` here would receive the timer id as its `source`.
    const id = window.setTimeout(() => armOpening("backstop"), OPENING_ARM_CEILING_MS);
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
   * The instant the card entrance's beats actually began.
   *
   * ⚠ NULL UNTIL THE CANVAS SAYS SO, and null means WAIT rather than clear. The
   * entrance waits on an async precompile, so its start CANNOT be derived from
   * Begin. See the guard in `warmWhenSafe` and
   * `live-work/architect-answer-lockup-fade.md`.
   *
   * ⚠ STALE FIGURE REMOVED, 9 AUGUST 2026 — this said "~1944ms after the cards
   * mount", which predates the 7 August entrance fix. Measured now: the ladder
   * runs **+695 → +2949ms from Begin** (`verify/approved-timings.mjs`). The lag
   * is deliberately not restated as a number here, because a number in a
   * comment is what went stale; the ref holds the real instant.
   *
   * ⚠ "SIX BEATS" CORRECTED TO "BEATS" — there are FIVE. The lockup's sixth was
   * removed on Carl's instruction, 5 August; see `ENTRANCE_END_MS`.
   */
  const cardEntranceStartedAtRef = useRef<number | null>(null);
  /**
   * ⚠ THE LIVE `activeQ`, FOR CALLBACKS THAT MUST NOT BE REBUILT.
   *
   * `noteCardEntranceStart` is passed to `AnswerCardCanvas` as `onEntranceStart`
   * and is deliberately `useCallback([])` — a fresh identity would land in the
   * canvas's effect dependencies and restart the entrance whenever anything
   * re-rendered. So it cannot close over `activeQ` directly; it reads it here.
   */
  const activeQRef = useRef(activeQ);
  useEffect(() => {
    activeQRef.current = activeQ;
  }, [activeQ]);
  /**
   * Which question's entrance has begun — the trigger for prewarming the NEXT
   * question's label canvases. Declared here rather than beside its effect
   * because `noteCardEntranceStart` below writes it, and a `useState` declared
   * after its writer is a lint error (`react-hooks/immutability`) with a real
   * hazard behind it: the earlier access would not track the value over time.
   * The full reasoning for the prewarm lives on the effect that consumes this.
   */
  const [entranceRunningFor, setEntranceRunningFor] = useState<number | null>(null);
  const noteCardEntranceStart = useCallback(() => {
    // ⚠ THE NULL GUARD IS WHAT MAKES THIS SAFE FOR FIVE CANVASES, and it was
    // written when there was only one. It records the FIRST entrance only, which
    // is the one the opening's timing is anchored to. Without the guard, Q1's
    // entrance would overwrite Q5's and the recorded anchor would drift later on
    // every step.
    //
    // ⚠⚠ THE CLAIM THAT THIS "FIRES AGAIN AT Q4, Q3, Q2 AND Q1" WAS FALSE, and
    // stood here until 17 August 2026. It was true when every question mounted
    // its own `AnswerCardCanvas`; the shared host does not unmount, so
    // `entranceAnnounced` (`answer-card-canvas.tsx`) never resets and
    // **`onEntranceStart` fires ONCE PER PAGE LOAD, at Q5.**
    //
    // ⚠ THE SECOND CONSEQUENCE, WHICH IS THE EXPENSIVE ONE: the label-prewarm
    // effect below is keyed on this, so it prewarms Q4 only and **never prewarms
    // Q3, Q2 or Q1.** Step 2 (the entrance re-arm) incidentally fixes that,
    // which means Step 2 changes *when GPU work happens for three questions* —
    // a performance change riding inside an animation fix. It is named here
    // rather than discovered afterwards.
    if (cardEntranceStartedAtRef.current === null) {
      cardEntranceStartedAtRef.current = Date.now();
    }
    // ⚠ OUTSIDE THE NULL GUARD, DELIBERATELY. The guard above protects the
    // OPENING's anchor, which must stay pinned to the first entrance. The
    // prewarm wants the opposite — the CURRENT question, every time — so it
    // reads the live value rather than the recorded one. Putting this inside the
    // guard would prewarm once, for Q4, and never again.
    setEntranceRunningFor(activeQRef.current);
  }, []);

  /**
   * ⚠⚠ PAINT THE NEXT QUESTION'S LABELS DURING THE DWELL — the fix for the
   * ladder's Mode A / Mode B race. Architect's Anomaly 1, 11 August 2026.
   *
   * **The measured problem** (`verify/overrun-breakdown.mjs`, dev, per question):
   * the entrance has a 650ms budget from the wipe's start before the clamp fires
   * and the ladder loses its relationship to the text. `created → compiled`
   * eats **256-420ms** of it, leaving 70-250ms of headroom — so the budget is
   * not blown by one big stall, it is **consumed by a term that is nearly always
   * too large**, and any jitter tips it over. Mode B measured at **18% on dev**
   * (`verify/ladder-mode.mjs`), with overruns to 2246ms.
   *
   * The per-question part of that term is the label textures — five 2048x512
   * canvases painted and uploaded in the mounting commit. `prewarmLabelCanvases`
   * paints them into `labelCanvasCache` ahead of time, so the mount is a cache
   * hit.
   *
   * ⚠ WHY THE DWELL AND NOT AN IDLE CALLBACK. This page **has no idle** — the
   * opening animates without a break from 600ms to 12400ms and
   * `requestIdleCallback` only ever fires on its timeout here, which has defeated
   * four scheduling attempts. **The corridor's dwell is different and is a real
   * window:** the ladder has finished, nothing is animating, and nothing moves
   * until the visitor clicks. This waits for that state rather than guessing at
   * a duration — *the guard must wait for a STATE, not a duration*, which this
   * file has now learned four times.
   *
   * ⚠ KEYED ON `cardsSettledAt`, WHICH IS SET WHEN THE LADDER COMPLETES, NOT ON
   * `activeQ`. Keying on the question number would fire this **during the
   * corridor move**, which is the busiest moment there is — putting the work
   * back exactly where it must not be.
   *
   * ⚠ IT CANNOT MOVE AN APPROVED BEAT. It paints into a detached canvas and
   * writes a cache; no timer, no state, nothing in the scene graph. If it never
   * ran, every timing would be what it is today — the cards would simply pay for
   * the paint at mount, as they do now.
   */
  useEffect(() => {
    if (entranceRunningFor === null) return;
    // The NEXT question, and the corridor counts DOWN — Q5 → Q4 → … → Q1.
    const next = QUESTIONS[entranceRunningFor - 1];
    if (!next) return;
    /**
     * ⚠ `ENTRANCE_END_MS` IS DERIVED, NOT TYPED — it is the last rung plus the
     * rise duration (`answer-card-geometry.ts`), so it tracks the ladder if the
     * ladder ever changes. **A hand-written duration here would go stale**, which
     * this file has recorded happening twice.
     *
     * ⚠ AND THIS IS A DELAY MEASURED FROM A STATE, NOT A GUESS AT ONE. The state
     * is "this question's entrance has begun" (`onEntranceStart`, which fires
     * when `active && compiled && warm` first goes true); the offset from there
     * to the ladder finishing is a known constant. Waiting for the state is what
     * keeps this out of the animating window; the constant only says how much of
     * that window is left.
     */
    const id = window.setTimeout(
      () => prewarmLabelCanvases(next.options),
      ENTRANCE_END_MS,
    );
    return () => window.clearTimeout(id);
  }, [entranceRunningFor]);

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
    // ⚰️ `setWarmupHeldOver(true)` STOOD HERE until 18 August 2026, set before
    // `setStage` in the same event so React batched both into one commit and the
    // warm node was already marked held-over in the render that created the real
    // canvas. With the warm-up deleted there is no node to hold over.
    setStage("active");
  }, []);

  /*
    ⚰️ THE OVERLAP TIMER STOOD HERE until 18 August 2026. It ended the warm-up's
    hold-over after `WARMUP_OVERLAP_MS`, and nothing visible depended on it — the
    node it removed was invisible and never drew, so a late or early fire changed
    only how long an idle context lingered. Deleted with the canvas it served.
  */

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
       * `ENTRANCE_END_MS` is a duration measured from the entrance's own clock.
       * This guard used to subtract it from `activatedAtRef` (Begin), so it
       * believed the beats ran +0 → ENTRANCE_END_MS *from Begin*. They do not —
       * the entrance waits on the async precompile, so it starts later than
       * Begin and this guard must be anchored to the entrance's own start.
       *
       * ⚠⚠ THE NUMBERS THAT USED TO SIT HERE — "(6330)", "+8857 → +15187",
       * "1944ms after the cards mount" — ARE STALE, CORRECTED 9 AUGUST 2026.
       * They predate the 7 August entrance fix. Measured on the real GPU,
       * `verify/approved-timings.mjs`, 3 runs: **the ladder runs +695 → +2949ms
       * from Begin**, beats ~560ms apart.
       *
       * ⚠ `ENTRANCE_END_MS` IS DERIVED, NEVER TYPED — read it from
       * `answer-card-geometry.ts`. A value quoted in prose is a claim about the
       * past; the export is the present.
       *
       * ⚠ THE PRINCIPLE IS UNAFFECTED BY THE CORRECTION, and that is the point:
       * the guard must wait on the entrance's own START, not on a duration from
       * Begin. Anchoring is what makes the numbers replaceable.
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
        // ⚠ THE OUTER CEILING, AND IT IS LOAD-BEARING — but NOT for the reason
        // this comment used to give.
        //
        // ⚠ CORRECTED 10 AUGUST 2026. It said "the card canvas does not mount
        // below `PROTO_MIN_VIEWPORT_PX`, so on narrow viewports
        // `onEntranceStart` never fires". **That gate was removed on 7 August**
        // (`answer-card-canvas.tsx:98`) — the cards measure the grid instead and
        // mount at every width.
        //
        // The ceiling still stands on its own merit: `onEntranceStart` can fail
        // to fire for other reasons (the canvas not yet measured, precompile
        // pending), and **a state gate must never be the only exit.**
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

  // ⚠ IT HAS A CALLER AGAIN — 10 August 2026, and it waited since chunk 3.
  //
  // The five CSS cards that used to call this were removed on Carl's
  // instruction (*"just remove the 5 cards that are there now and build"*), and
  // it was kept on the argument that "unused" meant "waiting, not dead". The
  // WebGL cards now call it through `AnswerCardCanvas`'s `onToggle`, so the
  // `no-unused-vars` disable that guarded it is gone. **The argument was
  // correct; this is what it was waiting for.**
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

  /**
   * The card grid's index → the corridor's option string.
   *
   * ⚠⚠ `useCallback`, AND NOT AS A FORMALITY. Written inline on the JSX this
   * would be a NEW FUNCTION ON EVERY RENDER — and `toggleOption` writes
   * `selected`, which re-renders this component, which re-renders
   * `AnswerCardCanvas`. That component is not memoized, and `onCompiled` /
   * `onEntranceStart` already sit in effect dependency arrays inside it, so an
   * unstable callback re-fires those effects.
   *
   * ⚠ AND IT WOULD LAND ON THE SAME FRAME AS THE FILAMENT SURGE, which is
   * approved motion. Architect, 10 August 2026 — flagged before it could be
   * built, which is the cheapest moment to catch it.
   *
   * ⚠ KEYED ON `activeQ`, NOT ON NOTHING. It closes over this question's option
   * list; a `[]` dependency array would freeze it on Q5's options and silently
   * select the wrong answers from Q4 onward.
   */
  const handleCardToggle = useCallback(
    (index: number) => {
      const option = QUESTIONS[activeQ]?.options[index];
      if (option) toggleOption(option);
    },
    [activeQ, toggleOption],
  );

  /**
   * ⚠⚠ THE PHASE TRACE — AND IT LANDS WITH THE RESTRUCTURE, NOT AFTER IT.
   *
   * **This is the condition of doing the restructure at all.** As things stood,
   * *nothing in the system could show a restructured `handleNextStep` getting
   * the ordering wrong*: the exit has never been profiled, the reveal instrument
   * is not built, and `?beattrace=1` watches the entrance only. **Two
   * `setTimeout`s cannot be asserted against; three named phases with timestamps
   * can.** A restructure shipped without this is the thing the gated ordering
   * exists to avoid.
   *
   * ⚠ IT PUBLISHES THE QUESTION TOO. A phase without a question number cannot
   * distinguish "Q5 left and Q4 arrived" from "the same edge fired twice" — the
   * exact class of defect `?beattrace=1` had until 16 August, when it
   * republished Q5's ladder at Q4 and was indistinguishable from a healthy run.
   *
   * ⚠ GATED ON `?phasetrace=1` AND COSTS NOTHING WITHOUT IT — one array push per
   * edge, four edges per walk. Same idiom as `?beattrace=1` / `?warmtrace=1`.
   *
   * ⚠ `q` IS THE QUESTION THE EDGE IS ABOUT, PASSED EXPLICITLY, NOT READ FROM
   * THE DOM. `questionIdentity()` in the canvas reads `.enquiry-pdepth-0`, which
   * is absent for the whole corridor move — the defect Option B below fixes by
   * consuming what this publishes. A publisher that read the DOM would inherit
   * the very blindness it exists to cure.
   */
  const publishPhaseEdge = useCallback((phase: string, q: number) => {
    try {
      if (typeof window === "undefined") return;
      if (new URLSearchParams(window.location.search).get("phasetrace") !== "1") return;
      const w = window as unknown as {
        __phaseTrace?: { phase: string; q: number; t: number }[];
      };
      (w.__phaseTrace ??= []).push({ phase, q, t: performance.now() });
    } catch {
      /* a diagnostic must never break the thing it measures */
    }
  }, []);

  /**
   * ⚠ THE ONE ACCESSOR BOTH EDGES GO THROUGH — never `setCorridorPhase` direct.
   *
   * Question identity has been read through a single accessor since `a8996b7`
   * for the same reason: two call sites that each do the work independently is
   * how you get two owners that agree by coincidence. **Every stored transition
   * publishes**, so the trace cannot silently miss one that the machine took.
   *
   * ⚠ `publishPhaseEdge` IS ALSO CALLED DIRECTLY, once, for `arriving` — the
   * edge that is deliberately not a stored state. See the call site.
   */
  const enterCorridorPhase = useCallback(
    (phase: "settled" | "leaving" | "arriving", q: number) => {
      publishPhaseEdge(phase, q);
      setCorridorPhase(phase);
    },
    [publishPhaseEdge],
  );

  /**
   * ⚠⚠ THE LEAVING EDGE'S TIMESTAMP — PUBLISHED UNGATED, and the third member of
   * a family, not a new idea. `__arrivingEdgeAt`/`__arrivingEdgeQ` below and
   * `__activeQ` above are ungated for exactly the same reason: **the cards cannot
   * see `__phaseTrace`**, which is gated on `?phasetrace=1` and does not exist in
   * production, and the exit needs this moment IN PRODUCTION.
   *
   * ⚠ WHAT THE EXIT DOES WITH IT: it is the clock zero for a five-rung ladder
   * (`CARD_EXIT_LADDER_MS`). A prop would deliver React's COMMIT time instead —
   * one or more frames later — and `CARD_FIRST_ENTRANCE_MS` has already been
   * correct-with-a-wrong-origin once, running at 71% of the reveal instead of 50%.
   *
   * ⚠ THE STAMP IS WRITTEN FIRST, deliberately, so a reader can never observe a
   * fresh timestamp against a stale question. Same ordering guarantee as
   * `__revealStartQ` before `__revealStart`, and `__arrivingEdgeQ` before
   * `setActiveQ`.
   *
   * ⚠ AND IT IS BUMPED WITH `exitEpoch` AS ONE ACT, through this one accessor —
   * two call sites doing it independently is how you get two owners that agree by
   * coincidence, which is the fault `enterCorridorPhase` exists to prevent.
   */
  const publishLeavingEdge = useCallback((q: number) => {
    if (typeof window !== "undefined") {
      const w = window as unknown as {
        __leavingEdgeAt?: number;
        __leavingEdgeQ?: number;
      };
      w.__leavingEdgeQ = q;
      w.__leavingEdgeAt = performance.now();
    }
    setExitEpoch((n) => n + 1);
  }, []);

  /**
   * ⚠⚠ WHAT THE SYSTEM USES TO KNOW WHICH QUESTION IT IS ON — OPTION B.
   *
   * `answer-card-canvas.tsx`'s `questionIdentity()` reads
   * `.enquiry-pdepth-0 .enquiry-phrase-cue` from the DOM, and `:1797` withholds
   * that node for the entire corridor move. **The skip counter reads 4 on every
   * page load, flag off included** — the read fails in normal operation, not
   * only at the boundary.
   *
   * This publishes the live question so the canvas can read a value instead of a
   * node. ⚠ **`corridorPhase` IS IN THE DEPENDENCY LIST DELIBERATELY**: the
   * whole point is that this stays correct *during* the move, which is exactly
   * when the DOM read fails.
   *
   * ⚠ IT IS NOT GATED ON A DEV FLAG. The two canvas marks that call
   * `questionIdentity()` are not flag-gated either, which is why the skip
   * counter reads 4 with no flags at all. A gated publisher would leave the
   * unflagged path reading the DOM and failing exactly as before.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __activeQ?: number }).__activeQ = activeQ;
  }, [activeQ, corridorPhase]);

  // One generic corridor step for every question. The answered question is pushed to
  // memory (it becomes the newest = depth-1) and every older memory deepens by one — both
  // happen as a single setMemory because depth is derived from position in memory[]. The
  // answered question's phrase persists by key, so it morphs depth-0 -> depth-1 rather than
  // being torn down. The next active question is gated out of depth-0 until the morph settles.
  //
  // ⚠⚠ THE TWO `setTimeout`s ARE NOW A PHASE MACHINE — 17 August 2026. They were
  // REPLACED, not wrapped: two timers that imply an ordering are exactly what
  // makes today's ordering unassertable, so leaving them beside a phase would
  // have created the second source of truth this design exists to prevent.
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
      // ⚠⚠ THE Q1 PATH PUBLISHES THE LEAVING EDGE TOO, and this is the call site
      // that strands the machine if it is forgotten — it is a different code
      // path (900ms, `enterComplete`, no `setActiveQ`), so nothing downstream
      // would re-arm the cards and they would simply blink out at `complete`.
      publishLeavingEdge(fromQ);
      // ⚠ THE COMPLETION EDGE GOES `leaving` AND STOPS — NOTHING ARRIVES.
      // Q1 -> complete is a different code path (900ms, `enterComplete`, no
      // `setActiveQ`) and it is the one that would strand the machine mid-cycle
      // if it were forgotten. It returns to `settled` because the corridor is no
      // longer moving; there is no `arriving` because no question is entering.
      enterCorridorPhase("leaving", fromQ);
      setTimeout(() => {
        enterComplete();
        enterCorridorPhase("settled", fromQ);
      }, COMPLETE_HOLD_MS);
      return;
    }

    if (reducedMotion) {
      // ⚠⚠ PRESERVED EXACTLY — SYNCHRONOUS, AND IT ACQUIRES NO PHASES.
      // This is a no-animation branch. It never touched `corridorMoving` and it
      // still does not: the phase stays `settled`, so the derived
      // `corridorMoving` stays false exactly as before. **A phase it then had to
      // wait through would be a behaviour change disguised as a refactor** —
      // §B.4 names this as the way this design breaks.
      setActiveQ(fromQ - 1);
      return;
    }

    // Vacate depth-0, recede the heading + deepen the stack, then admit the next question
    // once the ~900ms morph has settled and the active field is clearly empty (~250ms beat).
    publishLeavingEdge(fromQ);
    enterCorridorPhase("leaving", fromQ);
    setTimeout(() => {
      /**
       * ⚠⚠ `arriving` IS AN EDGE, NOT A RENDERED STATE — AND THE DIFFERENCE IS
       * THE WHOLE OF THIS STEP'S "NOTHING CHANGES" CLAIM.
       *
       * The pre-restructure code did `setActiveQ` and `setCorridorMoving(false)`
       * in ONE React batch, so `corridorMoving` went true -> false with no
       * intermediate commit. **Storing `arriving` as a phase would either be
       * coalesced away by React — publishing a transition the system never held,
       * which is an instrument that lies — or produce a commit that the old code
       * never produced, which is a behaviour change.**
       *
       * So the stored phase goes `leaving` -> `settled` in that same single
       * batch, and `arriving` is published to the trace as the EDGE it is. Step
       * 2 re-arms the entrance from this edge; it does not need `arriving` to be
       * a state the renderer sees, only a moment the system can name.
       *
       * ⚠ THIS IS THE ONE PLACE THE MACHINE'S THREE NAMES AND ITS TWO STORED
       * STATES DIVERGE. It is deliberate, it is why `enterCorridorPhase` takes
       * an explicit `store` argument, and it is asserted by `phase-trace.mjs`.
       */
      /**
       * ⚠⚠ THE ARRIVING EDGE'S TIMESTAMP, PUBLISHED UNGATED — candidate 3,
       * 17 August 2026, Carl's decision.
       *
       * **The entrance cannot see `__phaseTrace`**: that is gated on
       * `?phasetrace=1` and does not exist in production. The prediction needs
       * this moment in production, so it is published as its own value — the
       * same shape and the same reasoning as `__activeQ` above, which is ungated
       * for exactly the same reason.
       *
       * ⚠ WHAT THE ENTRANCE DOES WITH IT: the reveal starts on the first frame
       * tick at or after this edge (measured: 32/32 offsets inside one frame
       * interval), so the entrance predicts `edge + REVEAL_START_OFFSET_MS`
       * rather than waiting for `animationstart` to publish a value it arrives
       * too early to read.
       *
       * ⚠ WRITTEN BEFORE `setActiveQ`, so the entrance effect — which re-runs on
       * the epoch that `setActiveQ` drives — can never observe the new question
       * with the PREVIOUS question's edge still in place. The ordering is the
       * same guarantee `__revealStartQ` gets from being written before
       * `__revealStart`.
       */
      if (typeof window !== "undefined") {
        const w = window as unknown as { __arrivingEdgeAt?: number; __arrivingEdgeQ?: number };
        w.__arrivingEdgeQ = fromQ - 1;
        w.__arrivingEdgeAt = performance.now();
      }
      publishPhaseEdge("arriving", fromQ - 1);
      setActiveQ(fromQ - 1);
      enterCorridorPhase("settled", fromQ - 1);
    }, CORRIDOR_STEP_MS);
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
        {/*
          ⚠⚠ THE TRAVELLING RUNG — AND IT IS THE WHOLE POINT OF THIS WRAPPER.
          15 August 2026, Carl's ruling: *"ONLY the question text and its selected
          answer travel. The cards and the Next step button fade in and out IN
          PLACE and never move."*

          ⚠ `bottom`/`opacity` ANIMATE HERE, NOT ON `.enquiry-phrase`. The phrase
          root is now static, so `.enquiry-phrase-extras` — anchored to it at
          `top: calc(100% + 1rem)` — no longer inherits the recession. Previously
          the extras rode 3.625rem (58.0px desktop, 4.675rem / ~74.8px mobile) as
          PASSENGERS, by nesting, with nothing in the code saying "move the cards".

          ⚠ THE QROW AND THE ANSWERS SUMMARY TRAVEL TOGETHER, AS ONE RUNG —
          Carl's call, 15 August: the summary rides this wrapper so a question and
          its selected answer never separate on the way into the rail.

          ⚠ DO NOT ADD `transform`, `filter`, `perspective`, `contain` OR
          `will-change` HERE. The grid inside `.enquiry-phrase-extras` is the
          shared host's measurement target; a containing block or stacking context
          introduced on this branch changes what its rect is relative to.
        */}
        <div className="enquiry-phrase-travel">
        {/*
          ⚠⚠ THE WIPE COVERS THE NUMBER AND THE TEXT AS ONE PHRASE — D-052,
          20 August 2026, Carl's ruling: *"one phrase, one wipe."*

          `.enquiry-q-text-reveal` and its `onAnimationStart` were on the
          QUESTION SPAN until this change. `clip-path` clips the element it is
          set on and its descendants, so the cue — a SIBLING — was outside the
          wipe's scope and simply appeared. ⚠ THAT WAS NEVER A REGRESSION: it
          had been so since the wipe was written (`0a1b04a`) and no commit ever
          moved it out. It was never specified either way. See D-052.

          ⚠ THE HANDLER MOVES WITH THE ANIMATION, DELIBERATELY. React's
          synthetic `onAnimationStart` bubbles, so a handler left on the
          question span WOULD still receive this row's event and `animationName`
          would still match — and it would be publishing a clock for an
          animation on a different element. That is the mark-name collision
          class in `context-rules.md`; the handler goes where the animation is.

          ⚠ THE SWEEP IS FASTER AND THAT IS ACCEPTED. `clip-path: inset()` is a
          percentage of the clipped box, and this box is now cue + gap +
          question. Same 1300ms across a wider box = more px/sec. Carl's ruling,
          20 August: 1300ms STAYS and he judges the speed by eye. ⛔ DO NOT
          "compensate" by changing the duration — `Q5_REVEAL_CLEAR_MS` and the
          pre-warm guard are derived from 1300 and are NOT part of this change.
        */}
        <div
          className={`enquiry-phrase-qrow${reducedMotion || !isActive ? "" : " enquiry-q-text-reveal"}`}
          onAnimationStart={
            isActive && !reducedMotion
              ? (e) => {
                  // ⚠ THE REVEAL ONLY — not the depth-morph transitions, and not
                  // a future sibling animation on this row. Matching the name
                  // here is safe in a way the ladder's own lookup was not: if
                  // this never fires, the ladder falls back to reading the
                  // animation directly and behaves exactly as it does today.
                  if (e.animationName.startsWith("enquiry-mask-reveal")) {
                    const w = window as unknown as {
                      __revealStart?: number;
                      __revealStartQ?: number;
                    };
                    /**
                     * ⚠⚠ STAMPED WITH THE QUESTION IT BELONGS TO — 17 August
                     * 2026, and the stamp is the whole point.
                     *
                     * This value used to be published bare, and the ladder's
                     * only guards were "is a number" and "is in the past"
                     * (`answer-card-canvas.tsx`). **A reveal start from the
                     * PREVIOUS question satisfies both.** Measured: Q4's
                     * entrance read Q5's anchor from 8.2 seconds earlier and
                     * clamped, on 4 of 6 runs.
                     *
                     * ⚠ WRITTEN BEFORE THE VALUE, so a reader can never see a
                     * fresh timestamp still carrying the old question's stamp.
                     * The reverse order has a window — one statement wide, but
                     * this is exactly the class of race being fixed.
                     */
                    w.__revealStartQ = qNum;
                    w.__revealStart = performance.now();
                  }
                }
              : undefined
          }
        >
          <span className="enquiry-phrase-cue" aria-hidden="true">Q{qNum}</span>
          {/*
            ⚠ THE REVEAL CLASS AND THE CLOCK HANDLER MOVED TO THE ROW — D-052,
            20 August 2026. They were on this span; see the block-comment on
            `.enquiry-phrase-qrow` above for why, and for what must not follow.

            ⚠ `id="active-q-label"` STAYS HERE. It labels the QUESTION TEXT for
            assistive technology, and the cue is `aria-hidden`. Moving it to the
            row would pull "Q5" into the accessible name — the exact noise the
            `aria-hidden` exists to prevent.
          */}
          <span
            className="enquiry-phrase-question"
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
        </div>
        {/* ⚠ EVERYTHING BELOW IS OUTSIDE `.enquiry-phrase-travel` AND MUST STAY
            OUTSIDE IT. The extras are anchored to the STATIC phrase root; moving
            this inside the travel wrapper reinstates the 58px passenger ride. */}

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
              restoring this.

              ⚠⚠ `GRID_REFL` HAS SINCE BEEN DELETED — 10 August 2026, on Carl's
              instruction, along with `reflectionVars` / `q5ReflectionVars`. This
              comment used to say it "must not be deleted as unused"; that was
              true while the button was a painted surface and stopped being true
              when the mesh replaced it in Stage A. See the tombstone above
              `EnquiryOpening`. The paragraphs below are kept because their
              REASONING outlived the constant.

              ⚠ CORRECTED 5 AUGUST — `GRID_REFL` WAS NOT A SPECIFICATION. This
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
              /*
                ⚠⚠ THE HOST FOLLOWS WHICHEVER GRID IS ON SCREEN, NOT ONLY THE
                ACTIVE ONE — 14 August 2026, Carl's route.

                `ref={isActive ? … : undefined}` alone detached the ref for the
                whole 900ms corridor move, because `phraseList` withholds the
                active phrase entirely while `corridorMoving`. `hostRect` went
                null, the documented guard fired, and **the cards vanished for
                ~900ms on all four moves** — measured as 48 changed probe points
                against the approved pre-host paint order.

                During a move the RECEDING copy at depth 1 keeps its grid mounted
                (`showExtras` above), and that copy is the element the browser is
                animating. Following it is what keeps the cards on screen and
                travelling with the phrase.

                ⚠ THIS IS NOT THE HAND-DRIVEN EASING D-046 WARNS AGAINST. No
                timing curve is reimplemented here. The host READS the rect the
                browser has already computed for its own animation, every frame,
                below. Duplicating the curve would mean re-authoring
                `bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)`; following the
                element means never knowing what the curve is.
              */
              ref={isActive || (corridorMoving && depth === 1) ? setActiveGrid : undefined}
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

                ⚠ CORRECTED 10 AUGUST 2026 — this said "Renders only at >= 1280px
                and only for Q5". **The 1280px half is false**: that gate was
                removed on 7 August (`answer-card-canvas.tsx:98`) and the cards
                measure the grid instead, so this mounts at every width.

                Renders only for Q5; absent for Q4-Q1.
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
              {/*
                ⚠⚠ EVERY QUESTION HAS CARDS NOW — the `qNum === 5` gate is gone,
                and that removal IS step 1b.

                Step 1a wired selection with the gate still in place, so a Q5→Q4
                move happened with **no canvas mounting on the far side**. That
                was the measurement control (mean 69ms). This step makes the same
                move mount one, and the delta is the context-creation cost that
                decides whether the shared-host restructure (D-046) is needed.

                ⚠ A CANVAS IS CREATED AND DESTROYED ON EVERY QUESTION STEP, and
                keying cannot avoid it: `renderPhrase` gives each question its own
                `key`, and the grid lives inside `enquiry-phrase-extras`. The
                phrase structure owns the lifetime, not this line.

                ⚠ WEBGL CONTEXT CREATION INSIDE AN ANIMATING TRANSITION IS THE Q5
                STALL'S OWN MECHANISM. If the measured delta puts the move past
                the ~50ms visible threshold, **the honest answer is the shared
                host, not a dial** — and that is Carl's call, not a Builder's.
              */}
              {/*
                ⚠⚠ THE CANVAS NO LONGER RENDERS HERE — 14 August 2026, Stage 2.
                It moved to the shared host outside the shell, so ONE WebGL
                context serves all five questions instead of one being destroyed
                and recreated on every step.

                **This grid element stays, and it is now the MEASUREMENT
                SOURCE.** `ref={setActiveGrid}` on the active copy publishes its
                `getBoundingClientRect()` to the host, which positions itself
                over it. The DOM hit targets also still live here — the host is
                `pointer-events: none` precisely so it cannot swallow them.

                ⚠ DO NOT PUT THE CANVAS BACK HERE TO "FIX" A LAYOUT PROBLEM.
                That reinstates the per-question context churn this whole stage
                exists to remove. If the cards are mis-positioned, the fault is
                in the host's rect, and `verify/` has a screenshot harness that
                measures card centroids in viewport pixels — use it rather than
                comparing two `getBoundingClientRect` calls, which is the check
                that passed on the visibly broken 12 August build.
              */}
            </div>

            <div
              className="mt-5"
              style={{
                opacity: selected.size > 0 ? 1 : 0,
                pointerEvents: selected.size > 0 ? undefined : "none",
                // ⚠ THE 600ms FADE IS THE BEHAVIOUR CARL DESCRIBED — *"when the
                // user makes a selection, the button fades in"* — and the same
                // gate takes it away again when the last selection is released.
                // It is already correct; Stage B only has to make `selected`
                // actually change.
                transition: "opacity 600ms linear",
                // ⚠ THE POSITION-AWARE WARM REFLECTION SPREAD WAS HERE AND IS
                // GONE — see the tombstone above `EnquiryOpening`. It fed the
                // PAINTED button's gradients, and the mesh replaced that surface
                // in Stage A. Deleted on Carl's instruction, 10 August 2026.
              }}
            >
              {/*
                ⚠ THE MESH IS THE BUTTON'S SURFACE NOW — D-0xx pending, prototype
                approved by eye 10 August 2026: *"that is excellent,
                outstanding."*

                ⚠⚠ ONE EDIT COVERS Q5-Q1. This button is rendered once for every
                question, so nothing here is cloned per-Q. The rollout constraint
                Carl set — *"Send is a different width"* — is met by
                `NextStepMeshButton` MEASURING its own box rather than reading
                `NEXTSTEP_WIDTH_PX`, so completion's Send needs no new geometry.

                ⚠ `active` IS THE VISIBILITY GATE, NOT A COSMETIC FLAG. This
                wrapper is `opacity: 0; pointer-events: none` until something is
                selected. An ungated traveller sweep would render at 60fps behind
                it from the moment each question mounts — through the card
                entrance ladder and the Q5 reveal, which is the 167ms window
                still open. Architect, 10 August 2026.

                ⚠ AND IT CARRIES REDUCED MOTION. `!reducedMotion` leaves a static
                mesh with the loop stopped; the surface still renders, only the
                motion stops — the corridor's established pattern.

                ⚠ THE DOM BUTTON IS UNCHANGED AND IS STILL THE CONTROL: same
                `type`, `tabIndex` gating, `onClick`, classes and focus ring. The
                canvas is `aria-hidden` and `pointer-events: none`. **A mesh is a
                surface, never a control** — the distinction the answer cards
                will have to make when they become real controls.
              */}
              <NextStepMeshButton
                type="button"
                tabIndex={selected.size > 0 ? 0 : -1}
                onClick={handleNextStep}
                // ⚠ `active` MOVED TO `NextStepSurfaceHost` — 18 August 2026.
                // It gates the traveller sweep, which now lives in the host
                // alongside the canvas it drives. The same expression
                // (`selected.size > 0 && !reducedMotion`) is passed there, so
                // the gate is unchanged; only its address moved.
                // ⚠ AND IT STILL CARRIES REDUCED MOTION: `active={false}` leaves
                // a static mesh with the loop stopped — the surface renders, the
                // motion does not.
                // ⚠ PUBLISHES THIS BUTTON'S VIEWPORT RECT to the persistent
                // surface host below. The mesh is no longer a child of this
                // element — a canvas here is a new WebGL context per question,
                // which is the measured cause of the Q5 reveal freeze.
                onRect={handleBtnRect}
                // ⚠ `--q5proto` REMOVED 10 August 2026 with the CSS it named —
                // the Q5-only cabochon lens. **There is no Q5-specific button
                // surface any more:** the mesh is the material at every
                // question, so a per-question class had nothing left to switch.
                className={`enquiry-nextstep-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40`}
              >
                Next step
              </NextStepMeshButton>
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
  /**
   * ⚠ ONE CONDITION, TWO CONSUMERS — the active phrase and the shared host's
   * `active` prop. Written once rather than duplicated, because a host whose
   * entrance gate disagreed with the phrase list would either enter cards for
   * a question that is not on screen, or withhold them for one that is.
   *
   * ⚠ `stage !== "opening"` IS PART OF IT AND MATTERS FOR THIS STAGE. The host
   * mounts in the first commit so it can COMPILE during the opening, but the
   * cards must not ENTER then. That separation — early mount, late entrance —
   * is what `warm` (compile) vs `active` (entrance) exists for.
   */
  /**
   * ⚠⚠ THE HOST STAYS ON SCREEN THROUGH THE CORRIDOR MOVE — 14 August 2026.
   *
   * **This replaces `activeCardsVisible`**, which carried `!corridorMoving`.
   * That term is correct for the PHRASE LIST (the incoming active phrase really
   * is withheld mid-move, just below) and **was wrong for the HOST**: with the
   * host gated on it the cards left the screen for the whole ~900ms move, four
   * times per walk — measured as 48 changed probe points against the approved
   * pre-host paint order, where the cards are present throughout.
   *
   * ⚠ THE OLD NOTE HERE SAID "ONE CONDITION, TWO CONSUMERS", to stop the host's
   * entrance gate disagreeing with the phrase list. That instinct was right and
   * the shared condition was still wrong, because the two ask different
   * questions:
   *
   *     phrase list  "is the incoming active phrase renderable yet?"   NO mid-move
   *     the host     "should the cards be on screen at all?"           YES mid-move
   *
   * They are now separate expressions rather than one that is only correct for
   * one caller. Pre-host the cards were a CHILD of the receding phrase and
   * stayed up without anything having to say so; a `fixed` host outside the
   * shell has to say so explicitly, and this is that statement.
   *
   * ⚠ `stage !== "opening"` AND `!== "complete"` ARE UNCHANGED. Early mount /
   * late entrance is untouched: the cards still must not enter during the
   * opening.
   */
  const hostCardsVisible = stage !== "complete" && stage !== "opening";
  if (!corridorMoving && stage !== "complete") {
    phraseList.push({ qNum: activeQ, depth: 0, isActive: true });
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #141414 0%, #080808 100%)" }}
    >
      {/*
        ⚠⚠ THE SHARED CARD HOST — ONE CONTEXT, CREATED ONCE, NEVER UNMOUNTED.
        Rebuilt 14 August 2026 after the 12 August version was reverted for a
        positioning bug. D-048.

        ⚠⚠ IT IS A SIBLING OF THE SHELL, NOT A CHILD OF IT, AND THAT PLACEMENT
        IS LOAD-BEARING. **A transformed ancestor becomes the containing block
        for `position: fixed`.** Both shells carry
        `transform: translateY(calc(38vh - 5rem))` (`globals.css`), so a host
        placed inside one would resolve `fixed` against the SHELL rather than
        the viewport — silently reintroducing the exact class of bug that sank
        12 August, where two literal zeros quietly changed what they were
        relative to. This outer `min-h-screen` div has no transform.

        ⚠ SO DO NOT ADD `transform`, `filter`, `perspective`, `contain` OR
        `will-change` TO THIS ELEMENT OR TO ANY ANCESTOR BETWEEN IT AND THE
        ROOT. Each of those creates a containing block and would break the
        positioning from a distance, with nothing in the DOM looking wrong.
        `verify/` asserts `offsetParent === null` on this node for exactly that
        reason — a `fixed` element whose containing block is the viewport
        reports null, and that assertion flips the moment someone adds one.

        ⚠ MOUNTED UNCONDITIONALLY — no `stage` gate. It is in the FIRST COMMIT,
        so the context is created and compiled while the opening runs, and it
        survives every question step. The cards do not enter during the
        opening: `active` stays false until the corridor is showing, which is
        exactly the early-mount / late-entrance seam `warm` vs `active` was
        built for.

        ⚠ HIDDEN UNTIL MEASURED. `hostRect` is null until the active grid has
        been measured, and while it is null this renders `visibility: hidden`
        at the constant 576x104 box — a valid, non-zero size, so the canvas
        mounts and compiles normally while painting nothing. **`display: none`
        would zero the box and destroy the 1-world-unit-to-1-CSS-px mapping.**
        The 12 August build promised this guard and never implemented it; its
        `?? 0` fallback painted the first frame at the shell origin.

        ⚠ `pointer-events: none`. The DOM hit targets live in the phrase's own
        grid; a full-width transparent host over the corridor would swallow
        them.
      */}
      <div
        aria-hidden="true"
        data-testid="answer-card-host"
        style={{
          position: "fixed",
          left: hostRect ? `${hostRect.left}px` : 0,
          top: hostRect ? `${hostRect.top}px` : 0,
          width: hostRect ? `${hostRect.width}px` : GRID_WIDTH_PX,
          height: hostRect ? `${hostRect.height}px` : GRID_HEIGHT_PX,
          visibility: hostRect ? "visible" : "hidden",
          pointerEvents: "none",
          /**
           * ⚠⚠ WITHOUT THIS THE CARDS CANNOT BE CLICKED AT ALL — 14 August 2026.
           *
           * The host is a `position: fixed` sibling that appears BEFORE the
           * shell in DOM order, and both sat at `z-index: auto`. So the shell's
           * contents painted on top: `.enquiry-answer-grid` — an empty box kept
           * only as a measurement target, at the identical rect — took every
           * pointer event. **All five cards were dead on `1e031cd`**, while the
           * position check passed to 0.5px at three widths, because the geometry
           * was never wrong.
           *
           * ⚠ IT IS PAINT ORDER, NOT `pointer-events`. The three ancestors
           * carrying `pointer-events: none` look like the cause and are not:
           * clearing all three changes nothing, because a descendant's `auto`
           * already overrides an ancestor's `none`. Raising this alone fixes it
           * with every `none` left in place. Measured, four scenarios.
           *
           * ⚠⚠ THE VALUE IS 1 BECAUSE 1 IS SUFFICIENT, NOT BY EYE. Carl's
           * instruction: *"Do not pick a z-index by eye. Reproduce the paint
           * order the canvas already had."* `verify/paint-order.mjs` records the
           * pre-host stack at 16 points x 21 moments and diffs against it:
           * z = 1, 2 and 3 give BYTE-IDENTICAL results (288/336 reproduced;
           * control 84/336). There is no evidence for anything larger, so
           * anything larger would be the guess this value exists to avoid.
           */
          zIndex: 1,
        }}
      >
        <AnswerCardCanvas
          active={hostCardsVisible}
          onEntranceStart={noteCardEntranceStart}
          labels={QUESTIONS[activeQ].options}
          onToggle={handleCardToggle}
          /*
            ⚠⚠ THE ENTRANCE'S PER-QUESTION LIFETIME — item 2, 17 August 2026.
            The host never unmounts (D-048), so without this the entrance ran
            ONCE, at Q5, and Q4-Q1's cards were simply already on screen.

            ⚠ `activeQ` IS THE EPOCH, AND THAT IS READING THE `arriving` EDGE,
            not a substitute for it. `arriving` is published in the SAME React
            batch as `setActiveQ` (`handleNextStep`), and `phase-trace.mjs`
            asserts that ordering, so a change in `activeQ` IS the arriving edge
            made observable. The edge itself is not a rendered state — it cannot
            be subscribed to through React state — so the epoch is how a
            component consumes it.

            ⚠ IT IS NOT A COUNTER. The corridor counts DOWN 5->1 and never
            revisits a question, so the value is unique per boundary within a
            walk; `useCardEntrance` compares it by VALUE, never by ordering.
          */
          entranceEpoch={activeQ}
          // ⚠ THE OTHER EDGE. `entranceEpoch` above is bumped at t=1150 by
          // `setActiveQ`; this is bumped at t=0 by `publishLeavingEdge`. Two
          // edges, two epochs, one owner — and note this one IS a counter,
          // because `activeQ` has not changed yet when the exit must fire.
          exitEpoch={exitEpoch}
        />
      </div>

      {/*
        ⚠⚠ THE NEXT-STEP BUTTON'S SURFACE HOST — ONE CONTEXT, CREATED ONCE.
        Commit 1 of the Q5 reveal freeze repair, 18 August 2026.

        **The measured defect.** `NextStepMeshButton` rendered its own canvas
        inside the keyed phrase (`phrase-${qNum}`), so a WebGL context was
        created and destroyed on every question — 8 across a five-question walk —
        and Q5's context was created +54 to +65ms AFTER the reveal began, inside
        the 1300ms wipe.

            baseline        freeze median 140ms   5/8 runs   range 80-160
            ?nobtnmesh=1    freeze median   0ms   0/8 runs   range  0-40

        Non-overlapping, confirmed by eye in the films.

        ⚠⚠ A SIBLING OF THE SHELL, NOT A CHILD OF IT — AND THE FIRST VERSION GOT
        THIS WRONG, WHICH IS WHY IT IS SPELLED OUT.

        **A transformed ancestor becomes the containing block for
        `position: fixed`.** Both shells carry `transform: translateY(calc(38vh -
        5rem))`. The first version of this host was mounted INSIDE the shell, so
        its `fixed` coordinates resolved against the shell instead of the
        viewport: computed `left/top` read **654.7 / 616.8** — correct — while it
        painted at **1080 / 879**. **Carl saw a flat white DOM pill with the
        chrome mesh sitting in the lower-right corner.**

        ⚠ AND A CONTEXT-COUNT CHECK WAS ONE COMMAND FROM CERTIFYING THAT BUILD AS
        FIXED. 2 contexts is exactly what a build renders when the mesh never
        mounts. **Appearance is confirmed before any number from an arm is
        trusted** — `verify/mesh-appearance.mjs`.

        ⛔ NO ARITHMETIC COMPENSATION. Subtracting the shell's origin would be
        correct today and silently wrong the moment anyone adds `transform`,
        `filter`, `perspective`, `contain` or `will-change` upstream — invisible
        until someone looked at the screen, which is the failure just had.
        **The fix is the mount point; the guard is the assertion below.**

        ⚠ SO DO NOT ADD ANY OF THOSE PROPERTIES TO THIS ELEMENT OR TO ANY
        ANCESTOR BETWEEN IT AND THE ROOT. The card host above carries the same
        warning for the same reason; this is now the second host depending on it.

        ⚠ MOUNTED UNCONDITIONALLY — no `stage` gate. The context is created and
        the PMREM baked while the OPENING runs, when nothing is animating, rather
        than inside Q5's wipe. The card host records what gating on `stage` costs:
        it stopped the churn on Q4-Q1 and **changed Q5's wipe not at all**,
        because the context was still created inside the wipe.

        ⚠ HIDDEN UNTIL MEASURED, via `visibility` and never `display: none` —
        the canvas must keep a real box or the 1-world-unit-to-1-CSS-px mapping
        is destroyed. `NextStepSurfaceHost` owns that.

        ⛔ VISIBILITY IS STILL THE CALLER'S UNTIL COMMIT 4. `btnRect` is null
        whenever no button is mounted, which is what currently keeps this off the
        contact form. Commit 4 adds the explicit stage gate — split from the depth
        gate on Carl's instruction because a persistent host painting a chrome
        pill over `.enquiry-send-btn` is the worst visible failure in this plan.
      */}
      {/*
        ⚠⚠ THE REPRODUCED OPACITY — commit 2, brought forward on Carl's ruling
        18 August 2026 because commit 1 alone has no valid appearance state.

        **The three sources the hoist lost, and where each went:**

          wrapper   opacity: selected.size > 0 ? 1 : 0   600ms   -> reproduced here
          depth-1   .enquiry-pdepth-1 .enquiry-phrase-extras 0.78 -> see below
          exit      .enquiry-phrase-extras-out  opacity 0  900ms  -> see below

        ⚠ THE BUTTON BELONGS TO THE ACTIVE PHRASE, WHICH IS AT DEPTH 0. The 0.78
        rule is scoped to `.enquiry-pdepth-1` — the OUTGOING beat — so while the
        question is live the parent contributes 1.0 and the product is just the
        wrapper's own value. **Absent until selected, then 600ms in.**

        ⚠⚠ ON THE EXIT THE CHILD GOVERNS, MEASURED NOT ASSUMED. Parent 900ms vs
        wrapper 600ms: the button completes its exit at ~600ms while the cards
        continue to 900ms (`globals.css`, per-frame figures from 15 August). So
        the exit is reproduced as the wrapper's own 600ms to 0, driven by
        `corridorMoving` — the same signal that adds `-out` to the real extras.

        ⛔ THE 0.78 IS DELIBERATELY NOT MODELLED. It is the parent's starting
        point on the outgoing beat, and the button's own fade reaches 0 first, so
        it never becomes visible on this element. **That is a claim the per-frame
        comparison must CONFIRM, not an assumption** — `verify/button-opacity-
        curve.mjs` compares against the pre-hoist build frame by frame. If it is
        wrong, the curve will show it and A1 fails the appearance constraint.

        ⚠ REDUCED MOTION KEEPS ITS OWN PATH. `corridorMoving` is never true under
        reduced motion (that branch leaves the phase at `settled`), so the exit
        term cannot fire — exactly as today, where the outgoing button unmounts
        rather than fading.
      */}
      <NextStepSurfaceHost
        rect={btnRect}
        active={selected.size > 0 && !reducedMotion}
        opacity={selected.size > 0 && !corridorMoving ? 1 : 0}
        /**
         * ⚠⚠ 600ms IN, 375ms OUT — AND THE 375 IS DERIVED, NOT PICKED.
         *
         * ⛔ MY FIRST VERSION USED 600ms BOTH WAYS AND THE PER-FRAME CURVE
         * FALSIFIED IT: A1 ran up to **0.186 brighter** than pre-hoist through
         * the middle of the exit. The comment claimed *"the 0.78 never becomes
         * visible, the button's own fade dominates"* — **that was wrong.**
         *
         * ⚠ WHAT THE MEASUREMENT SHOWED. The pre-hoist exit is the PRODUCT of
         * BOTH transitions running together — wrapper 1->0 over 600ms multiplied
         * by the parent's own ramp over 900ms, both linear, both starting ~60ms
         * after the click. Modelled that way it fits the measured curve to a
         * worst delta of 0.048. **The parent's 0.78 START value is indeed never
         * seen — but its RAMP is, and the ramp is what I dropped.**
         *
         * A single linear transition cannot reproduce a product of two linears
         * (the product is quadratic). ⚠ But it can match it closely, and the
         * honest fit is what the curve says rather than what the CSS says: the
         * product crosses 0.5 at ~285ms and reaches 0 at 600ms. A 375ms linear
         * tracks it to within ~0.05 across the span — the same order as the
         * measurement's own frame-to-frame noise.
         *
         * ⛔ THIS IS A FIT TO THE MEASURED CURVE, NOT A REPRODUCTION OF THE CSS,
         * AND IT MUST BE READ AS SUCH. The per-frame comparison is the
         * acceptance test, not the source. `verify/button-opacity-curve.mjs`.
         */
        transitionMs={600}
      />

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

        {/*
          ⚠⚠ THE SHARED HOST — ONE CANVAS, CREATED ONCE, NEVER UNMOUNTED.
          D-048, authorised by Carl 12 August 2026. This is the fix for the
          reveal misstep he reported on every question.

          **The measured defect.** Q5's 1300ms wipe should deliver ~78 frames at
          60Hz; it delivers **60-70**. The missing frames cluster in a ~120ms
          freeze that **tracks the shader compile** — compile ends at 40% of the
          wipe, freeze at 41%; compile ends at 22%, freeze at 24%. In every run
          that lands between "What" (17%) and "brought" (45%), which is why Carl
          always described it as *"a noticable pause after the first word."*

          ⚠ AND THE FREEZE IS IN THE GPU PROCESS, NOT THE MAIN THREAD. A CDP
          trace names it: `CommandBuffer::Flush` / `GpuChannel::
          ExecuteDeferredRequest`, four blocks totalling ~164ms, with the
          renderer idle. **That is why every main-thread instrument reported the
          page healthy** — and why moving the wipe to a composited property was
          the wrong target twice today: compositing queues behind the same GPU
          scheduler.

          **The control proves the technique is innocent.** The heading and
          subtext use the SAME `enquiry-mask-reveal-horizontal` keyframes on the
          same page and deliver 112-251 frames cleanly. Same wipe, quiet page,
          no misstep. **The moment is guilty, not the mechanism.**

          ⚠⚠ WHY THIS IS SAFE, AND IT IS THE MEASUREMENT THAT UNBLOCKED IT.
          The recorded hazard was that lifting the canvas out makes its motion
          hand-driven, matching `bottom 900ms cubic-bezier(0.37, 0, 0.63, 1)`.
          **That travel belongs to the RECEDING copy.** `verify/active-grid-
          fixed.mjs`, 25 samples across 5 runs: the ACTIVE grid sits at
          `top 492.78, left 432.22, 576x104` at Q5, Q4, Q3, Q2 and Q1 —
          **identical to the hundredth of a pixel.** And `phraseList` above
          withholds the active phrase entirely while `corridorMoving`, so the
          only grid on screen mid-move is the outgoing one at depth 1.
          **A canvas hosted here sits still for the whole corridor. There is no
          easing to reproduce.**

          ⚠ THE GEOMETRY STILL COMES FROM `.enquiry-answer-grid` VIA ITS
          `ResizeObserver`, not from this wrapper — D-048 established that the
          measurement path is anchored to the grid element. The per-phrase grid
          `<div>` therefore stays exactly where it is, as the thing being
          measured; only the CANVAS moved out.

          ⚠ `pointer-events: none` ON THE WRAPPER. The DOM hit targets live in
          the phrase's own grid; a full-width transparent host over the corridor
          would swallow them.
        */}
        {/*
          ⚠⚠ MOUNTED FROM THE OPENING, NOT FROM `stage !== "opening"` — AND THIS
          IS THE HALF THAT ACTUALLY FIXES Q5.

          The first version of this host gated on `stage !== "opening"`, which
          stopped the per-question churn on Q4–Q1 (measured: `card-canvas-created`
          fires once, at Q5, never again) **and changed Q5's wipe not at all** —
          64/69/72 frames of ~78, against 60/70/69 before. The reason, measured:
          the context was still created **117–128ms INTO the wipe** and compiled
          at **323–482ms**, which is exactly where the freeze was traced.

          **A host that mounts after Begin has moved the churn off four questions
          and left the first one untouched.** The whole defect is a context being
          created inside an animating window; mounting during the opening is what
          takes it out of one.

          ⚠ THE OPENING IS NOT IDLE, AND THAT IS FINE HERE. `enquiry-opening.tsx`
          records it animating without a break from 600ms to 12400ms — which is
          why four scheduling attempts failed. **This is not a deferral into a
          gap that does not exist.** It is the same trick D-046 already uses for
          the warm-up canvas: mount early, stay mounted, let the choreography
          wait on `openingArmed` rather than race it. The warm-up's own marks
          confirm the timing works — created ~7.4s BEFORE the wipe, compiled
          ~7.25s before.

          ⚠ `active` STAYS FALSE UNTIL THE CORRIDOR IS SHOWING. The cards must
          not enter during the opening; `stage` gates the entrance while the
          CONTEXT is created early. That separation — early mount, late
          entrance — is exactly what `warm` vs `active` was built for.
        */}
        {/*
          ⚠⚠ THE HOST WAS BUILT, MEASURED AND REVERTED — 12 August 2026.
          **It fixed the frame delivery and broke the layout**, and the second
          fact is why it is not here.

          **What it achieved, measured:** Q5's wipe went from 60-72 frames of ~78
          to **75-80**, and the ~120ms compile freeze at 22-41% disappeared
          entirely. `card-canvas-created` fired **once**, at Q5, never again —
          the per-question context churn was genuinely gone. The mechanism is
          right and D-048's premise held.

          ⚠⚠ AND CARL LOOKED AT IT AND THE CARDS WERE ABOVE THE QUESTION TEXT.
          Screenshot, `?modetrace=1`, Q5: five cards rendered ~230px too high,
          sitting over the corridor instead of under the phrase.

          **The cause, and it is the hazard D-046 named exactly.** The canvas
          positions itself `absolute` from `box.left/top`, which were
          grid-relative only because it rendered INSIDE `.enquiry-answer-grid`.
          From a zero-size host outside the keyed phrase they are not, so the
          offset has to be measured — and the measurement resolved against a
          different `offsetParent` than the grid's, putting every card wrong.

          ⚠⚠ AND EVERY NUMBER SAID IT WAS FINE. `active-grid-fixed.mjs` passed
          because it measures the grid `<div>`, which never moved. The wipe
          harness passed because frames were genuinely being delivered. **A
          canvas-vs-grid box check also passed — 432/493/576 on both — because
          it compared the two rects in viewport space while the CSS `left/top`
          resolved against something else.** Three green instruments, one broken
          screen, caught in one look.

          **What a correct version needs**, and it is not a tweak: the canvas
          must derive its position from the grid's rect in the SAME coordinate
          space it renders in, verified by a pixel check that the cards sit below
          the phrase — not by comparing two `getBoundingClientRect` calls.
        */}

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
        {/*
          ⚠ `|| warmupHeldOver` — THE NODE OUTLIVES THE STAGE CHANGE ON PURPOSE.
          Without it this block and the real Q5 canvas are mutually exclusive, so
          Begin destroyed the warm context in the same commit that created the
          real one and the real one rebuilt everything from scratch: ~580ms of
          Three.js initialisation inside the phrase wipe, measured 9 August 2026.
          See `warmupHeldOver` for the measurements and for why one shared canvas
          is NOT the smaller fix it appears to be.
        */}
        {/*
          ⚰️ TOMBSTONE — THE WARM-UP CANVAS WAS DELETED HERE, 18 August 2026.
          Stage 2 step 5, run as a MEASURED EXPERIMENT, not as a fix.

          It rendered a second, hidden `AnswerCardCanvas` (576x104, visibility
          hidden) during the opening, held over past the stage change by
          `warmupHeldOver`, to precompile the labelled card material before Begin.

          ⚠ WHAT IT COST: a SECOND WebGL CONTEXT. Stage 1 measured 17 programs
          linked TWICE — 17 before Begin and 17 after, on every one of 21 runs,
          confirmed by two independent instruments (a CDP trace of
          `DoLinkProgram` and a patched `WebGLRenderingContext.linkProgram`).

          ⚠ WHAT IT BOUGHT: `mount → compiled` of 106ms with it against 1353ms
          without (Stage 1, four arms). **That is a real effect on CANVAS COMPILE
          TIME — it is NOT the same quantity as the mid-wipe reveal freeze**, and
          conflating the two is what this deletion was run to test.

          ⚠ THE ARMING PATH IT OWNED — `armOpening("compile")` — is one of four.
          It is not load-bearing on a normal run: Stage 2 step 3 measured the
          READY GATE winning 3/3 at +181-332ms while the compile landed at
          +1456-2356ms. The compile path had to be FORCED, by delaying
          `document.fonts.ready` past it, to be observed at all.

          Result and distribution: `live-work/step5-warmup-deletion-18-august.md`.
          Prediction was written BEFORE the measurement, in that same file.

          ⚠ TO RESTORE IT: `git show 7f15345:components/enquiry/enquiry-opening.tsx`
          holds the block immediately before this deletion.
        */}

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
                      animation: `eq-understood-fade-out ${ACK_FADE_OUT_DURATION_MS}ms linear ${ACK_FADE_OUT_DELAY_MS + ACK_LEAD_MS - ackLead}ms forwards`,
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
                        animation: `eq-completion-item-in ${OPAL_FADE_IN_DURATION_MS}ms linear ${OPAL_FADE_IN_DELAY_MS + ACK_LEAD_MS - ackLead}ms both`,
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
