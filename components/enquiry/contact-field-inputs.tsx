"use client";

/**
 * Contact-field text inputs — the DOM layer over the WebGL contact field.
 *
 * The four boxes are Three.js geometry with no form controls at all; this file
 * puts real inputs on top of them. It is CHUNK A of three: a working, typeable,
 * accessible form. **No rim behaviour (chunk B). No masked reveal or autofill
 * cascade (chunk C). No submission** — Carl: what happens to the Q&A answers and
 * personal information is a later session.
 *
 * ── WHY THIS CAN WORK AT ALL ─────────────────────────────────────────────────
 *
 * ⚠ `ContactFieldCanvas` uses an ORTHOGRAPHIC camera at `zoom: 1`, so R3F sets
 * the frustum from the measured CSS size and **1 world unit == 1 CSS pixel
 * exactly**, at every viewport width. That is the only reason DOM elements can be
 * positioned over WebGL geometry with plain pixel arithmetic and stay locked to
 * it. Without it this whole approach would need a projection per frame.
 *
 * ── WHERE IT SITS ────────────────────────────────────────────────────────────
 *
 * A SIBLING of the canvas wrapper inside `.enquiry-contact-layer`, mirroring its
 * `position:absolute; inset:0` so it bypasses the layer's flex centring and
 * contributes no layout — Send and the active slot cannot be displaced.
 *
 * ⚠ THREE INHERITED BEHAVIOURS FROM THAT LAYER, all load-bearing:
 *   - `pointerEvents: "none"` inherits, so the controls must set `"auto"`
 *     themselves. The host stays `"none"`, which means the ~65% of the layer
 *     BETWEEN the boxes remains click-through.
 *   - `visibility: hidden` until `complete` inherits, and removes descendants
 *     from the tab order. Free, and deliberate.
 *   - `aria-hidden="true"` sits on the CANVAS wrapper only. This sibling must not
 *     have it, or the form would be invisible to assistive technology.
 */

import { useEffect, useRef, useState } from "react";
import {
  FIELD_SLOTS,
  FIELD_RADIUS_PX,
  LABEL_BLOCK_PX,
  fieldDomPlacements,
  type FieldSlotId,
} from "./contact-field-geometry";
import { FIELD_ENTRANCES } from "./contact-field-canvas";

/**
 * What each slot tells the browser about itself.
 *
 * ⚠ `organization`, NOT `company` — the latter is not a WHATWG autofill token and
 * browsers ignore it silently, which would cost chunk C the autofill it depends
 * on. `name` is the full-name token (the person, not the business).
 *
 * ⚠ `type="url"` and `type="email"` bring NATIVE VALIDATION with them. That is
 * inert now because there is no form submission, but it will constrain chunk C:
 * `c2b.co.uk` without a scheme fails `type="url"`. Recorded so it is a decision
 * there rather than a surprise.
 */
const SLOT_INPUT: Record<
  FieldSlotId,
  {
    type: string;
    autoComplete: string;
    inputMode?: "url" | "email";
    autoCapitalize: "none" | "words";
    spellCheck: boolean;
  }
> = {
  name: { type: "text", autoComplete: "name", autoCapitalize: "words", spellCheck: true },
  business: { type: "text", autoComplete: "organization", autoCapitalize: "words", spellCheck: true },
  website: { type: "url", autoComplete: "url", inputMode: "url", autoCapitalize: "none", spellCheck: false },
  email: { type: "email", autoComplete: "email", inputMode: "email", autoCapitalize: "none", spellCheck: false },
};

/**
 * What the rest of the flow will eventually read off this component.
 *
 * ⚠ STATE, NOT EVENTS — the ruling in
 * `live-work/progressive-rim-and-text-input-reference.md`. The rim derives from
 * whether a box CURRENTLY holds content, never from how the content arrived.
 * Paste, dictation, IME, browser-restore and password managers then stop being
 * special cases: each simply results in a box having content.
 */
// ── The autofill cascade ─────────────────────────────────────────────────────
//
// ⚠ AUTOFILL IS THE SHOWCASE, NOT THE DEGRADED PATH. Carl reframed this and the
// reasoning governs the whole chunk: *"If autofil is used, the main purpose of
// getting client details has been achieved, we can still 'echo' the Q + A section
// by being visually creative. We are, of course, in the business of selling high
// end websites. Let us take every opportunity to showcase our abilities and not
// let an admin shortcut get in the way."*
//
// It is arguably the strongest moment on the page: the ONE time all four boxes
// animate as a composed sequence rather than at the user's typing pace. Nobody is
// waiting on it and nothing is gated behind it.
//
// ⚠ AND THE CHAIN STILL HAS SOMETHING TO SAY EVEN WITH NO SEQUENCE TO FOLLOW.
// The Builder's first position was that autofill should skip the cascade — there
// is no order to animate. Carl rejected it: four rims lighting in ONE FRAME is a
// state change with no reading time, so the eye registers *something happened*
// and cannot tell what. The same four in sequence is a statement the user can
// follow. **Same information; only the sequential version is perceivable.**

/**
 * Gap between successive boxes in the autofill cascade.
 *
 * ⚠ HELD AS TWO LIMITS, NOT ONE TARGET. Carl: *"not so fast that the human eye
 * cannot discern it, but not so slow as to interfere with the point most people
 * use autofil (including me) its fast and convenient."*
 *
 * The limits sit far apart, which is what makes this tunable rather than fraught:
 * the eye resolves a sequence at roughly 80–150ms per step, and an autofill user
 * does not feel obstructed until the whole run approaches ~1s. Four boxes at
 * 120ms is under half a second total — readable, and gone before it registers as
 * waiting.
 *
 * ⚠ DELIBERATELY MUCH FASTER THAN THE ENTRANCE'S 500ms SPACING. The entrance is a
 * first impression with nobody waiting; this happens to someone who chose the
 * fast path. **CURRENT AND BEST-JUDGED, NOT APPROVED.**
 *
 * ⚠ 133ms, NOT 120, AND THE REASON IS THE FRAME GRID. 120ms is not a multiple of
 * 16.7ms, so on a 60Hz display each step rounds to the next frame and the spacing
 * lands unevenly. 133ms is 8 frames exactly. Measured via the Web Animations API
 * — the animations' own `startTime`, not a sampled approximation:
 *
 *   at 120ms target:  gaps of 200 / 134 / 133ms
 *   at 133ms target:  see the run log
 *
 * ⚠ AND THE MEASUREMENT METHOD MATTERED MORE THAN THE VALUE. Sampling `--wipe`
 * per frame reported 205/206/73ms and sent the Builder chasing a scheduling bug
 * that was partly the instrument: a sampled value only appears once React has
 * committed the style, so it conflates *when the animation started* with *when
 * the render landed*. **`getAnimations()` reports what the compositor actually
 * did.**
 */
const CASCADE_STAGGER_MS = 133;

/**
 * How long one box's reveal takes — the text wipe AND the rim fade together.
 *
 * ⚠ STAGGER AND DURATION ARE TWO DIFFERENT NUMBERS. The stagger is the gap
 * BETWEEN boxes; this is the length of one box's own event. A fast stagger with a
 * slower individual reveal still reads as a cascade, and likely reads better than
 * making everything uniformly quick.
 *
 * ⚠ ONE VALUE DRIVES BOTH THE WIPE AND THE RIM, and that is a constraint rather
 * than a convenience. Carl: *"it would work better if the fade in time and the
 * reveal time were the same."* Different durations read as two events that happen
 * to overlap; matched, they read as ONE event with two expressions.
 *
 * ⚠ NOT COPIED FROM THE OPENING'S MASK (D-015). That reveals a phrase arriving
 * across a long line; this is a shorter distance on a smaller element. The
 * GESTURE matches — left-to-right, echoing the start page — the number need not.
 */
const CASCADE_REVEAL_MS = 520;

/**
 * How long to wait before believing a multi-field fill is real.
 *
 * ⚠ THIS EXISTS BECAUSE OF THE PREVIEW PROBLEM, which Carl found in real Chrome
 * and which no automated test would have surfaced: hovering an autofill
 * suggestion writes the values into the actual fields, and moving the pointer
 * away withdraws them. Without this guard the cascade would run in full for text
 * that then disappears — and re-run on every hover.
 *
 * ⚠ SHORT ENOUGH TO BE IMPERCEPTIBLE, LONG ENOUGH TO OUTLAST A POINTER MOVE. It
 * delays the cascade's start by this much against the ~500ms the cascade itself
 * runs for. **CURRENT AND BEST-JUDGED, NOT APPROVED.**
 */
const AUTOFILL_SETTLE_MS = 90;

/**
 * Register `--wipe` and the wipe keyframes, once per document.
 *
 * ⚠ `CSS.registerProperty` AND A STYLESHEET RULE, NOT A REACT `<style>` TAG. The
 * first attempt put an `@property` block inside `<style>{...}</style>` in the
 * JSX; **it never registered.** Measured: `--wipe` read back empty on a fresh
 * element, so the mask's `var(--wipe)` was invalid, the mask covered everything,
 * and all four boxes showed their text in full while the animation dutifully ran.
 * ⚠ **The animation was running the whole time** — `animationName:
 * contactFieldWipe` was set on every box — which is exactly why this needed
 * measuring rather than eyeballing. A visibly-broken reveal and a correctly
 * running animation looked identical from the outside.
 *
 * Registration matters because an UNREGISTERED custom property is just a string:
 * it flips from `0%` to `100%` at the halfway point instead of interpolating. The
 * registration is what makes it a `<percentage>` the engine can animate smoothly.
 *
 * ⚠ Kept out of `globals.css` deliberately — that file is approved, 2,024 lines,
 * and protected by this chunk's scope; these rules are meaningless outside this
 * component.
 */
let wipeRegistered = false;
function registerWipeAnimation() {
  if (wipeRegistered || typeof window === "undefined") return;
  wipeRegistered = true;
  try {
    // Throws if already registered — harmless under Strict Mode's double-invoke.
    (CSS as unknown as { registerProperty: (d: object) => void }).registerProperty({
      name: "--wipe",
      syntax: "<percentage>",
      inherits: false,
      initialValue: "0%",
    });
  } catch {
    /* already registered */
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(
    "@keyframes contactFieldWipe { from { --wipe: 0%; } to { --wipe: 100%; } }",
  );
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

export type FieldStateSnapshot = {
  values: Record<FieldSlotId, string>;
  /** ⚠ Trimmed — a box holding only whitespace is not filled. */
  filled: Record<FieldSlotId, boolean>;
  /**
   * Slots that went empty -> filled in THIS update.
   *
   * ⚠ PRESENT IN CHUNK A THOUGH NOTHING READS IT, because it is structurally
   * UNCOMPUTABLE downstream: a consumer given only `values` must diff against a
   * remembered previous, so every consumer would hold its own history and they
   * would drift. The producer already has the previous state in hand.
   *
   * Length > 1 is chunk C's autofill signal — **a paste fills one field;
   * autofill fills several in one tick.**
   */
  becameFilled: FieldSlotId[];
};

const EMPTY_VALUES: Record<FieldSlotId, string> = {
  name: "",
  business: "",
  website: "",
  email: "",
};

/** Trimmed, so a lone space never counts as content. */
function deriveFilled(values: Record<FieldSlotId, string>): Record<FieldSlotId, boolean> {
  return {
    name: values.name.trim().length > 0,
    business: values.business.trim().length > 0,
    website: values.website.trim().length > 0,
    email: values.email.trim().length > 0,
  };
}

export default function ContactFieldInputs({
  active,
  reducedMotion,
  onFieldStateChange,
}: {
  /** `true` once the enquiry reaches `complete` — the cascade's clock zero. */
  active: boolean;
  /**
   * ⚠ PASSED, NOT RE-READ. `enquiry-opening.tsx` already holds this and the
   * canvas reads it independently; a THIRD `matchMedia` subscription could
   * disagree with the other two if the OS preference changed mid-session.
   */
  reducedMotion: boolean;
  /** Chunk B's seam. Nothing passes this in chunk A. */
  onFieldStateChange?: (snapshot: FieldStateSnapshot) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<Partial<Record<FieldSlotId, HTMLInputElement | null>>>({});

  // ── The measured box ───────────────────────────────────────────────────────
  //
  // ⚠ THE HOST OBSERVES ITSELF, not the parent layer. The host is `inset:0`
  // inside the layer, exactly as the canvas wrapper is, so it reads the SAME
  // rect R3F reads rather than one that merely agrees with it. One fewer element
  // in the chain, and no reliance on two boxes staying identical.
  //
  // The 576x184 initial value is the desktop layer. It is never seen at the
  // wrong size: the whole layer is `visibility:hidden` until `complete`, which
  // is minutes after mount.
  const [box, setBox] = useState({ width: 576, height: 184 });

  // Registered before any reveal can run; idempotent and document-wide.
  useEffect(() => {
    registerWipeAnimation();
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // ⚠ THE IDENTITY GUARD IS LOAD-BEARING. Without it every observer callback
      // allocates a fresh object and re-renders all eight controls on every
      // resize frame.
      setBox((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── The focus gate ─────────────────────────────────────────────────────────
  //
  // ⚠ THE CLOCK STARTS ON `active`, NOT ON MOUNT. This component mounts with the
  // canvas at `canvasWarm` — mid-questionnaire — so a mount-time timer would
  // elapse behind `visibility:hidden` and the inputs would be reachable from
  // completion-clock zero, the exact inversion of the intent. `useEntranceCascade`
  // documents the same trap.
  //
  // ⚠ MOUNTED EARLY ON PURPOSE: browser autofill and password managers need the
  // inputs present in the DOM to detect the field set. A late mount risks a
  // manager missing them entirely, which is chunk C's whole subject.
  const [reachable, setReachable] = useState(false);

  useEffect(() => {
    if (!active) return;
    // ⚠ Reduced motion has NO cascade to wait for — the boxes are at full opacity
    // on the first frame. Waiting 8.1s would leave a reduced-motion user facing
    // four visible boxes that reject input, the same accessibility defect the
    // pre-warm guard in enquiry-opening.tsx already names.
    if (reducedMotion) {
      const id = window.setTimeout(() => setReachable(true), 0);
      return () => window.clearTimeout(id);
    }
    // Each box becomes reachable as its OWN fade completes, matching the labels.
    const timers = FIELD_ENTRANCES.map((entrance) =>
      entrance
        ? window.setTimeout(() => setReachable(true), entrance.delay + entrance.duration)
        : null,
    ).filter((t): t is number => t !== null);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, reducedMotion]);

  // ── Value state ────────────────────────────────────────────────────────────
  const [values, setValues] = useState<Record<FieldSlotId, string>>(EMPTY_VALUES);
  const composingRef = useRef(false);
  const filledRef = useRef(deriveFilled(EMPTY_VALUES));
  const onChangeRef = useRef(onFieldStateChange);
  // ⚠ Kept current in an EFFECT, not during render. Writing a ref while
  // rendering is what `react-hooks/refs` rejects, and it is right to: a render
  // can be discarded, which would leave the ref holding a callback from a render
  // that never committed.
  useEffect(() => {
    onChangeRef.current = onFieldStateChange;
  }, [onFieldStateChange]);

  /**
   * Publish a snapshot, computing `becameFilled` against the previous state.
   *
   * ⚠ `filled` FREEZES DURING IME COMPOSITION but `values` never does. A
   * controlled React input MUST keep updating its value or IME typing breaks
   * outright; it is the SIGNAL DERIVED from the value that must not fire on text
   * the user may still discard.
   */
  const publish = (incoming: Record<FieldSlotId, string>, force = false) => {
    if (composingRef.current && !force) return;
    // ⚠ MERGE ONTO THE TICK'S ACCUMULATED VALUES, do not replace them. Each
    // `onChange` closure carries stale `values` plus its own field's new content,
    // so taking `incoming` wholesale would erase its three siblings' updates from
    // the same tick. Merging keeps every field that has landed so far.
    const next: Record<FieldSlotId, string> = { ...latestValuesRef.current, ...incoming };
    latestValuesRef.current = next;
    const filled = deriveFilled(next);
    const previous = filledRef.current;
    const becameFilled = (Object.keys(filled) as FieldSlotId[]).filter(
      (id) => filled[id] && !previous[id],
    );
    filledRef.current = filled;

    // ⚠ MORE THAN ONE BOX FILLING IN A SINGLE UPDATE IS THE AUTOFILL SIGNAL.
    //
    // ⚠ AND THE RIM MUST NOT LIGHT AHEAD OF THE REVEAL. On a multi-box fill the
    // snapshot is withheld until each box's own step arrives, so the rim and the
    // text are ONE event with two expressions rather than two that overlap. On
    // any single-box change it publishes immediately, as before.
    //
    // NOT "an input event with no preceding keydown", which is the obvious test
    // and the wrong one: **a paste looks identical to autofill under it.** A paste
    // fills ONE field; autofill fills several in the same tick. So simultaneity
    // is the discriminator, and it needs no event archaeology at all.
    //
    // ⚠ STATE DECIDES WHETHER A RIM IS LIT; SIMULTANEITY DECIDES HOW IT ANIMATES.
    // That split is what lets paste, dictation, IME and browser-restore stay
    // ordinary — none of them is a special case, because none of them fills more
    // than one box at once.
    // ⚠ ACCUMULATE ACROSS THE TICK, DO NOT TEST ONE UPDATE.
    //
    // This was the Builder's first mistake in this chunk, and it is worth stating
    // because the reasoning LOOKED right: "autofill fills several fields in one
    // tick, so `becameFilled.length > 1` is the signal." **The premise is true and
    // the test is in the wrong place.** Chrome dispatches a SEPARATE `input` event
    // per field, so React runs `onChange` four times and each update sees exactly
    // ONE newly-filled box. The condition never fired, and every box simply lit
    // and appeared at once — measured: `animationName: none` on all four.
    //
    // The fix is to count what arrives in the same TICK rather than in the same
    // update. A paste still fills one field; autofill still fills several. The
    // discriminator is unchanged — only where it is measured.
    if (becameFilled.length) {
      tickBatchRef.current.push(...becameFilled);
      if (tickFlushRef.current !== null) window.clearTimeout(tickFlushRef.current);
      tickFlushRef.current = window.setTimeout(() => {
        tickFlushRef.current = null;
        const batch = tickBatchRef.current;
        tickBatchRef.current = [];
        if (batch.length > 1) startCascade(batch, latestValuesRef.current);
        else
          onChangeRef.current?.({
            values: latestValuesRef.current,
            filled: deriveFilled(latestValuesRef.current),
            becameFilled: batch,
          });
      }, 0);
      latestValuesRef.current = next;
      return;
    }

    onChangeRef.current?.({ values: next, filled, becameFilled });
  };

  // ── The cascade, and the preview problem ───────────────────────────────────
  //
  // ⚠ HOVERING A CHROME SUGGESTION WRITES VALUES INTO THE REAL FIELDS WITH NO
  // COMMITMENT, and moving away withdraws them. Found by Carl in real Chrome:
  // *"Hover over text box and saved information is displayed in the fields."*
  //
  // So all four boxes can fill and then empty again without the user choosing
  // anything. **A cascade that fired on the preview would run its whole
  // performance for text that vanishes a moment later** — and would re-run on
  // every hover of every suggestion.
  //
  // ⚠ SAME CLASS AS IME COMPOSITION: a real value in a provisional state. The
  // answer is the same too — the value is honoured, the SIGNAL derived from it
  // waits for commitment.
  //
  // The guard is a short settle window. A preview is withdrawn as the pointer
  // moves, so it does not survive; a committed fill does. This costs the cascade
  // one settle period before it begins, which is imperceptible against the
  // ~500ms the cascade itself runs for.
  const cascadeTimersRef = useRef<number[]>([]);
  const cascadeRafRef = useRef<number | null>(null);
  const settleRef = useRef<number | null>(null);
  /** Slots that became filled within the current tick — see `publish`. */
  const tickBatchRef = useRef<FieldSlotId[]>([]);
  const tickFlushRef = useRef<number | null>(null);
  /**
   * ⚠ THE LATEST VALUES ACROSS THE WHOLE TICK, not the ones one `onChange` saw.
   *
   * React's `onChange` fires per field and its handler closes over `values` from
   * the render it was created in — so during a four-field autofill, all four
   * handlers see the SAME stale `values` and each produces an object holding only
   * its own new content. Reading any one of them would show one filled box and
   * three empty ones.
   */
  const latestValuesRef = useRef<Record<FieldSlotId, string>>(EMPTY_VALUES);
  const [revealed, setRevealed] = useState<Partial<Record<FieldSlotId, number>>>({});

  const startCascade = (ids: FieldSlotId[], next: Record<FieldSlotId, string>) => {
    if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      settleRef.current = null;
      // ⚠ RE-READ THE DOM. If this was a preview the pointer has moved on and the
      // fields are empty again, so the cascade never starts. Trusting the values
      // captured when the event fired would defeat the whole guard.
      const stillFilled = ids.filter((id) => (inputRefs.current[id]?.value ?? "").trim() !== "");
      if (stillFilled.length < 2) {
        // Not a real fill — publish normally so nothing downstream is stranded.
        onChangeRef.current?.({ values: next, filled: deriveFilled(next), becameFilled: ids });
        return;
      }

      cascadeTimersRef.current.forEach((t) => window.clearTimeout(t));
      cascadeTimersRef.current = [];

      // ⚠ CASCADE IN FIELD_SLOTS ORDER, not in the order the browser happened to
      // fill them. The visual sequence must be 1 -> 2 -> 3 -> 4 regardless.
      const ordered = FIELD_SLOTS.filter((s) => stillFilled.includes(s.id));
      setRevealed({});
      // Rims start unlit for the boxes about to cascade, then light one by one.
      const running: Record<FieldSlotId, string> = { ...next };
      ordered.forEach((s) => {
        running[s.id] = "";
      });

      // ⚠ ONE CLOCK, NOT FOUR TIMERS. Each step both sets React state and
      // publishes upward, which re-renders all four inputs and the WebGL scene —
      // enough work that independent `setTimeout`s drift badly under it.
      // **Measured with four timers: gaps of 205/206/73ms against a 120ms
      // target** — uneven, and the last step arriving at barely half the spacing
      // of the others, which is exactly the "state change with no reading time"
      // defect the cascade exists to avoid.
      //
      // Driving every step from a single rAF loop against one start timestamp
      // means a late frame delays a step without compounding into the next.
      // ⚠ THE CLOCK STARTS ON THE FIRST FRAME, NOT ON THE CALL. Starting it here
      // meant box 1's step fired in the same frame the loop was created while its
      // siblings each waited for a later frame — measured as a 200ms first gap
      // against 133ms for the rest. Deferring the origin to the first rAF puts
      // every box on the same footing.
      let started = 0;
      let fired = 0;
      const step = () => {
        if (started === 0) started = performance.now();
        const elapsed = performance.now() - started;
        while (fired < ordered.length && elapsed >= fired * CASCADE_STAGGER_MS) {
          const slot = ordered[fired];
          fired += 1;
          setRevealed((prev) => ({ ...prev, [slot.id]: performance.now() }));
          // ⚠ PUBLISH THIS BOX'S CONTENT AS ITS OWN STEP ARRIVES, so the rim
          // lights in step with the wipe rather than all four at once.
          running[slot.id] = next[slot.id];
          onChangeRef.current?.({
            values: next,
            filled: deriveFilled(running),
            becameFilled: [slot.id],
          });
        }
        if (fired < ordered.length) cascadeRafRef.current = requestAnimationFrame(step);
      };
      cascadeRafRef.current = requestAnimationFrame(step);
    }, AUTOFILL_SETTLE_MS);
  };

  useEffect(
    () => () => {
      cascadeTimersRef.current.forEach((t) => window.clearTimeout(t));
      if (settleRef.current !== null) window.clearTimeout(settleRef.current);
      if (cascadeRafRef.current !== null) cancelAnimationFrame(cascadeRafRef.current);
    },
    [],
  );

  // ⚠ BROWSER-RESTORED VALUES FIRE NO EVENT AT ALL — the design record's worst
  // case, because it fails silently: the user returns to a filled form and
  // nothing downstream knows. Read the DOM directly on mount, and again on the
  // next frame, because Chrome's autofill-on-load runs after first paint.
  useEffect(() => {
    let raf = 0;
    const sweep = () => {
      const found: Record<FieldSlotId, string> = { ...EMPTY_VALUES };
      let any = false;
      for (const slot of FIELD_SLOTS) {
        const el = inputRefs.current[slot.id];
        const v = el?.value ?? "";
        found[slot.id] = v;
        if (v) any = true;
      }
      if (any) {
        setValues(found);
        // ⚠ PUBLISHED DIRECTLY, NOT THROUGH `publish`, and NOT as a cascade.
        //
        // Restored values are already on the page when it arrives — nothing fills
        // in front of the user, so there is no moment to perform. Routing this
        // through `publish` would see several boxes become filled in one update,
        // read that as autofill, and run the whole cascade on a page the user has
        // only just opened.
        //
        // ⚠ It also keeps this effect free of `publish` as a dependency, which
        // would otherwise re-run the mount sweep whenever the closure changed.
        const filled = deriveFilled(found);
        filledRef.current = filled;
        onChangeRef.current?.({ values: found, filled, becameFilled: [] });
      }
    };
    sweep();
    raf = window.requestAnimationFrame(sweep);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  /**
   * Show the START of an overlong value rather than its end.
   *
   * ⚠ THE DEFECT THIS FIXES IS ABOUT TRUST, NOT TRUNCATION. An input scrolls to
   * keep the CARET visible, and after an autofill the caret sits at the end — so a
   * long URL displays as `...vercel.app/start` with the head clipped. Measured on
   * a real saved value at FULL DESKTOP WIDTH, not only at narrow viewports.
   *
   * The value is correct and complete either way; what changes is whether the user
   * believes it is. Carl: *"From a user's point of view, they may feel a little
   * uncertainty if their correct info was inputted... It's a field on a site by
   * someone who makes websites. They have to trust that 'we got this'."*
   *
   * ⚠ NEVER WHILE THE FIELD IS FOCUSED. Resetting `scrollLeft` under a typing user
   * would fight their caret on every keystroke past the box's width. This runs only
   * for values that arrived from OUTSIDE the field — autofill, paste, restore.
   *
   * ⚠ AND IT IS DISPLAY ONLY. The stored value is untouched. Showing something
   * different from what will be sent is the divergence that causes real trouble
   * later; this changes the scroll offset and nothing else.
   */
  useEffect(() => {
    for (const slot of FIELD_SLOTS) {
      const el = inputRefs.current[slot.id];
      if (!el || el === document.activeElement) continue;
      if (el.scrollLeft !== 0) el.scrollLeft = 0;
    }
  }, [values]);

  const placements = fieldDomPlacements(box.width, box.height);

  return (
    <div
      ref={hostRef}
      // ⚠ `role="group"` rather than `<fieldset>`: it is the pattern already used
      // and approved in enquiry-opening.tsx for the answer grid, it is announced
      // consistently, and it avoids `<fieldset>`'s UA styling fighting absolutely
      // positioned children.
      role="group"
      aria-label="Your details"
      style={{
        position: "absolute",
        inset: 0,
        // ⚠ Above the canvas wrapper's zIndex 0, in the same stacking context, so
        // the order is deterministic rather than document-order luck.
        zIndex: 1,
        // Stays "none" — only the controls opt in, so the gutters and the space
        // above the boxes remain click-through.
        pointerEvents: "none",
      }}
    >
      {FIELD_SLOTS.map((slot, i) => {
        const p = placements[i];
        const entrance = FIELD_ENTRANCES[i];
        const cfg = SLOT_INPUT[slot.id];
        // ⚠ A null entrance MASKS the box — it never appears. The control must
        // then never appear either, or a label would float over nothing and an
        // invisible input would sit in the tab order.
        if (!entrance) return null;

        // ⚠ THE LABEL AND ITS INPUT SHARE ONE CLOCK, which is Carl's instruction:
        // *"All labels can arrive on screen with their respective boxes. Fade in
        // with them."* Both read the SAME entry of FIELD_ENTRANCES the WebGL box
        // reads, so a retimed cascade moves all three together.
        const fade = reducedMotion
          ? undefined
          : {
              opacity: active ? 1 : 0,
              transition: `opacity ${entrance.duration}ms linear ${entrance.delay}ms`,
            };

        return (
          <div key={slot.id} style={fade}>
            <label
              htmlFor={`contact-field-${slot.id}`}
              // ⚠ `text-xs` is 12px/16px and LABEL_BLOCK_PX = 20 holds ONLY at
              // that line-height. `text-sm` (14px/20px) would overflow the
              // reserved slot — and because the label is absolutely positioned it
              // would simply overlap, with nothing on screen to signal it.
              //
              // ── WHITE AT 0.75, AND IT IS NOT AN ARBITRARY STEP ──────────────
              //
              // Built first at full white, on Carl's instruction that the labels
              // take *"the same colour as the questions"*. Rendered, that was too
              // strong — Carl: *"the white is a little prominent and competing.
              // Needs to be toned down a little. Not grey. Grey only works when
              // its subtext."*
              //
              // ⚠ THE DISTINCTION IS THE POINT: grey says "de-emphasised
              // background information", and these are FIELD NAMES that have to be
              // read. Lowering white's weight keeps them in the corridor's family
              // while letting the gold lead.
              //
              // ⚠ AND THIS SITE ALREADY SETTLED THIS EXACT QUESTION. 0.75 is the
              // corridor's active Q-label value (`.enquiry-pdepth-0
              // .enquiry-phrase-cue`), whose comment records the same finding in
              // the same words: *"Was 0.28, which read as grey rather than
              // quiet."* Reusing it rather than inventing a neighbour.
              //
              // Bracketed by eye at 1.0 / 0.85 / 0.75 / 0.65: 0.85 was
              // indistinguishable from full white and did not do the job.
              className="absolute text-xs leading-4 text-white/75 pointer-events-auto"
              style={{ left: p.left, top: p.labelTop, height: LABEL_BLOCK_PX }}
            >
              {slot.label}
            </label>
            <input
              id={`contact-field-${slot.id}`}
              // ⚠ THE MASKED LEFT-TO-RIGHT WIPE — the reveal, and the reason the
              // browser's instant fill does not have to look instant.
              //
              // Autofill speed CANNOT be controlled: Chrome sets `input.value` in
              // one shot. Reading it back and re-typing it would fight the
              // password manager, break the browser's own autofilled state, and
              // risk a wrong value if anything interrupted — it works in a demo
              // and produces support tickets.
              //
              // The mask fights nothing. The value lands instantly and correctly
              // from the first frame; only VISIBILITY is animated. Nothing is
              // faked and no input state is manipulated.
              //
              // ⚠ THE VOCABULARY IS ALREADY ON THIS SITE — it is the opening's
              // clip-path mask (D-015): the phrase exists, the mask governs when
              // it is seen. That matters more than the technique being clever.
              //
              // ⚠ REDUCED MOTION SKIPS IT ENTIRELY. A wipe is exactly the kind of
              // motion the query exists to suppress, and the value is already
              // there — so there is nothing to lose by showing it at once.
              ref={(el) => {
                inputRefs.current[slot.id] = el;
              }}
              type={cfg.type}
              autoComplete={cfg.autoComplete}
              inputMode={cfg.inputMode}
              autoCapitalize={cfg.autoCapitalize}
              spellCheck={cfg.spellCheck}
              value={values[slot.id]}
              onChange={(e) => {
                const v = e.target.value;
                // Functional update: four handlers from the same render would
                // otherwise each overwrite the others with their own stale copy.
                setValues((prev) => ({ ...prev, [slot.id]: v }));
                // ⚠ ONLY THIS FIELD is passed — `publish` merges onto the tick's
                // accumulated values, so sending a whole stale object here would
                // undo its siblings.
                publish({ [slot.id]: v } as Record<FieldSlotId, string>);
              }}
              // ⚠ ALSO ON BLUR, for the value the user TYPED. The effect above
              // only fires when `values` changes, so tabbing away from a long URL
              // just after typing it would leave the view stranded at the end —
              // the same uncertainty, arrived at by a different route.
              onBlur={(e) => {
                e.currentTarget.scrollLeft = 0;
              }}
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={(e) => {
                composingRef.current = false;
                // ⚠ `compositionend` fires AFTER the final input event in Chrome
                // and BEFORE it in Safari/Firefox, so recompute from the current
                // value rather than waiting for another event that may not come.
                const v = e.currentTarget.value;
                setValues((prev) => ({ ...prev, [slot.id]: v }));
                publish({ [slot.id]: v } as Record<FieldSlotId, string>, true);
              }}
              // ⚠ REACHABILITY IS GATED, NOT EDITABILITY. `readOnly` and
              // `disabled` BOTH suppress autofill — `readonly` plus a focus
              // handler that removes it is the standard published trick for
              // exactly that — so either would break chunk C. `tabIndex` and
              // `pointerEvents` keep keyboard and pointer out while leaving a
              // password manager's programmatic fill unimpeded.
              tabIndex={reachable ? 0 : -1}
              aria-disabled={reachable ? undefined : true}
              className={[
                "absolute box-border w-full bg-transparent border-0",
                "appearance-none px-3 py-2 text-[14px] leading-5",
                "text-[rgb(215,218,228)] caret-[rgb(238,241,252)]",
                "focus:text-[rgb(238,241,252)] focus:outline-none",
                "focus-visible:outline focus-visible:outline-2",
                "focus-visible:outline-offset-0 focus-visible:outline-white/40",
                // ⚠ Chrome forces `background-color: rgb(232,240,254)` on an
                // autofilled input through a UA style that ordinary CSS cannot
                // beat — a PALE BLUE RECTANGLE over the satin field, which would
                // destroy the windows model. The absurd transition delay is the
                // standard defeat: the background never reaches its target.
                "[&:-webkit-autofill]:[-webkit-text-fill-color:rgb(215,218,228)]",
                "[&:-webkit-autofill]:[transition:background-color_600000s_0s]",
              ].join(" ")}
              style={{
                left: p.left,
                top: p.top,
                width: p.width,
                height: p.height,
                borderRadius: FIELD_RADIUS_PX,
                pointerEvents: reachable ? "auto" : "none",
                // ⚠ A CSS MASK, keyed so a re-cascade restarts it. The value is
                // present and correct throughout — only its visibility sweeps.
                ...(revealed[slot.id] !== undefined && !reducedMotion
                  ? {
                      WebkitMaskImage:
                        "linear-gradient(to right, #000 0 var(--wipe), transparent var(--wipe))",
                      maskImage:
                        "linear-gradient(to right, #000 0 var(--wipe), transparent var(--wipe))",
                      // ⚠ SIZE AND REPEAT ARE NOT OPTIONAL, and omitting them is
                      // what broke this for four attempts.
                      //
                      // `mask-image` alone leaves `mask-size: auto` and
                      // `mask-repeat: repeat` at their initial values. A gradient
                      // whose opaque stop sits at 0% then has an effectively
                      // zero-width tile, which REPEATS across the element and
                      // fills it with opaque mask — so at `--wipe: 0%` the text
                      // was fully visible instead of fully hidden, the exact
                      // opposite of the intent.
                      //
                      // ⚠ Every diagnostic looked healthy throughout: the property
                      // was registered, `--wipe` interpolated smoothly (measured
                      // 0% -> 22.4%), the animation ran, the parent was clean, and
                      // an isolated input with the same gradient masked correctly.
                      // **The isolated test used the `-webkit-mask-image` shorthand,
                      // which sets these sub-properties; the component set only the
                      // image.** The control that was supposed to prove the
                      // mechanism differed from the real thing in the one way that
                      // mattered.
                      WebkitMaskSize: "100% 100%",
                      maskSize: "100% 100%",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      animation: `contactFieldWipe ${CASCADE_REVEAL_MS}ms linear both`,
                    }
                  : null),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
