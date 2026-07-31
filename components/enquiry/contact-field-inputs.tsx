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
  const publish = (next: Record<FieldSlotId, string>, force = false) => {
    if (composingRef.current && !force) return;
    const filled = deriveFilled(next);
    const previous = filledRef.current;
    const becameFilled = (Object.keys(filled) as FieldSlotId[]).filter(
      (id) => filled[id] && !previous[id],
    );
    filledRef.current = filled;
    onChangeRef.current?.({ values: next, filled, becameFilled });
  };

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
        publish(found);
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
                const next = { ...values, [slot.id]: e.target.value };
                setValues(next);
                publish(next);
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
                const next = { ...values, [slot.id]: e.currentTarget.value };
                setValues(next);
                publish(next, true);
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
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
