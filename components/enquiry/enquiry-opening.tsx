"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ContactFieldCanvas from "./contact-field-canvas";

// How long after entering `complete` the ENTIRE completion choreography has
// cleared — acknowledgement AND Send. Read off the existing animation
// declarations, which this change does not touch:
//
//   acknowledgement block  eq-understood-fade-out 1400ms @ 4800ms -> ends 6200ms
//   Send                   eq-completion-item-in   700ms @ 6400ms -> ends 7100ms
//
// 6400ms would be the wrong boundary: that is the instant Send BEGINS its
// entrance, so starting context creation, shader compilation and PMREM
// generation there would starve the very animation it was meant to avoid.
// The safe boundary is the end of Send's entrance.
const CHOREOGRAPHY_CLEAR_MS = 7100;

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
  const [stage, setStage] = useState<"opening" | "active" | "complete">("opening");
  const [activeQ, setActiveQ] = useState(5);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);
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

  // The single, shared entry point into the completion stage. Every route into
  // `complete` — reduced motion and the animated corridor alike — goes through
  // here, so the timestamp can never be missed on one path. This changes only
  // how completion is RECORDED; when it happens is untouched.
  const enterComplete = useCallback(() => {
    if (completedAtRef.current === null) completedAtRef.current = Date.now();
    setStage("complete");
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
            <div
              className={`enquiry-answer-grid${reducedMotion ? "" : " enquiry-cards-reveal"}`}
              role="group"
              aria-labelledby="active-q-label"
            >
              {QUESTIONS[qNum].options.map((option, idx) => {
                const isSelected = selected.has(option);
                const Q_GLASS_OFFSETS: Record<number, number> = { 5: 0, 4: 2, 3: 1, 2: 4, 1: 3 };
                const glassVariant = ["a", "b", "c", "d", "e"][(idx + (Q_GLASS_OFFSETS[qNum] ?? 0)) % 5];
                // Top-run material response — shared across every enquiry answer card
                // (Q1–Q5). Each card gets its own selected-only, filament-synchronised
                // amber sweep host + a lifted label so its text stays protected. All
                // visual work is in globals.css (.card-amber-host). The rules are
                // self-referential (each card's own ::before/::after, its own sweep,
                // its own filament-synced --sweep-pass), so this one mechanism gives
                // every card an independent instance without flattening its A–E glass.
                return (
                  <button
                    key={option}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleOption(option)}
                    className={`enquiry-card enquiry-card-glass-${glassVariant} enquiry-card-filament-host card-amber-host text-center px-3 rounded-xl font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40${isSelected ? " enquiry-card-selected" : ""}`}
                  >
                    <svg
                      aria-hidden="true"
                      className={`filament-svg${isSelected ? " filament-svg-visible" : ""}`}
                    >
                      <rect
                        className="filament-rect"
                        pathLength="1"
                        fill="none"
                        stroke="rgba(190, 145, 58, 0.80)"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span aria-hidden="true" className="card-amber-sweep" />
                    <span className="card-amber-label">{option}</span>
                  </button>
                );
              })}
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
          {/* Desktop/tablet: two lines, original reveal */}
          <span className="hidden sm:block">
            <div className={stage === "opening" ? "enquiry-heading-line1-mask" : undefined}>
              {HEADING_LINE1}
            </div>
            <div className={stage === "opening" ? "enquiry-heading-line2-mask" : undefined}>
              {HEADING_LINE2}
            </div>
          </span>
          {/* Mobile: four lines, sequential reveal */}
          <span className="block sm:hidden">
            <div className={stage === "opening" ? "enquiry-m-heading-line1-mask" : undefined}>
              {HEADING_M1}
            </div>
            <div className={stage === "opening" ? "enquiry-m-heading-line2-mask" : undefined}>
              {HEADING_M2}
            </div>
            <div className={stage === "opening" ? "enquiry-m-heading-line3-mask" : undefined}>
              {HEADING_M3}
            </div>
            <div className={stage === "opening" ? "enquiry-m-heading-line4-mask" : undefined}>
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
        {canvasWarm && (
          <div
            className="enquiry-contact-layer"
            style={{
              opacity: stage === "complete" ? 1 : 0,
              pointerEvents: "none",
              visibility: stage === "complete" ? "visible" : "hidden",
            }}
          >
            <ContactFieldCanvas />
          </div>
        )}

        {stage === "opening" ? (
          <>
            <div className="mt-6">
              {/* Desktop/tablet: single block reveal */}
              <p className={`hidden sm:block text-base text-neutral-400 leading-relaxed${reducedMotion ? "" : " enquiry-subtext-mask"}`}>
                {SUBTEXT}
              </p>
              {/* Mobile: two-line sequential reveal */}
              <div className="block sm:hidden text-base text-neutral-400 leading-relaxed">
                <div className={reducedMotion ? undefined : "enquiry-m-subtext-line1-mask"}>{SUBTEXT_M1}</div>
                <div className={reducedMotion ? undefined : "enquiry-m-subtext-line2-mask"}>{SUBTEXT_M2}</div>
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
                className={`enquiry-button-mask${reducedMotion ? " enquiry-button-mask--static" : ""}`}
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
                onClick={() => beginActive && setStage("active")}
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
                ...(reducedMotion ? undefined : { animation: "eq-understood-fade-out 1400ms linear 4800ms forwards" }),
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
            {/* Send — sits in the same space, fades in after acknowledgement has cleared */}
            <div
              style={reducedMotion ? undefined : { animation: "eq-completion-item-in 700ms linear 6400ms both" }}
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
