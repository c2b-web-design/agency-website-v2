"use client";

/**
 * The logo backdrop, as a WebGL plane spanning the answer-card grid.
 *
 * ⚠ THIS IS WHAT MAKES THE GLASS VISIBLE. Chunks 1 and 2 established that glass
 * over a near-black page reads as a pale grey slab: there is nothing to
 * transmit. The backdrop is not decoration behind the cards — it is the content
 * the cards are lenses onto.
 *
 * ⚠ AND IT MUST BE OPAQUE. `three.module.js:18039` renders `opaqueObjects` only
 * into the transmission target, and `:8237` routes anything with
 * `transparent === true` away from that list. A transparent backdrop would be
 * INVISIBLE to the glass refracting it, with every assertion still green — the
 * failure chunk 2 hit twice.
 */

import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  GRID_WIDTH_PX,
  GRID_HEIGHT_PX,
  REGION_SHIFT_MS,
  CARD_BOXES,
  GROUND_COLOR,
  drawBackdrop,
  type BackdropRegions,
} from "./answer-card-backdrop-geometry";
import {
  LOCKUP_FADE_OVERLAPPED_DELAY_MS,
  LOCKUP_FADE_DURATION_MS,
  faceInset,
} from "./answer-card-geometry";

/**
 * Texture resolution multiplier.
 *
 * The lockup carries fine detail — the mark's thinnest stroke is ~2.6px at grid
 * height — and it is then blurred by the glass. Rendering the texture above its
 * display size means the frost is destroying real detail rather than sampling
 * artefacts.
 */
const TEXTURE_SCALE = 2;

export function AnswerCardBackdrop({
  /**
   * Per-card blue→teal position, 0..1, in grid order — LIVE, as a ref.
   *
   * ⚠ A REF RATHER THAN A PROP ARRAY, because this animates every frame while a
   * region travels. Passing the numbers as props would mean a React render per
   * frame of a 2400ms transition, re-running the whole scene graph to change
   * pixels on one texture.
   *
   * ⚠ AND THE TEXTURE IS REDRAWN IN PLACE, which is a departure from the
   * build-in-`useMemo` rule below. See `useBackdropRedraw` for why that rule
   * still holds for ALLOCATION and why mutation is unavoidable for ANIMATION.
   *
   * Undefined means static: the backdrop draws once at rest, which is what the
   * lockup does when no card is hovered.
   */
  shift,
  /**
   * ⚠ BEAT SIX — the lockup is not on screen until the five cards have landed.
   *
   * Carl, 4 August: *"The cards come on in sequential order. 1,2,3,4 and then 5.
   * There should be a 6 beat and that is the text underneath fading in"* — and
   * *"the text underneath"* is this lockup, `c2b DESIGN`.
   */
  reducedMotion = false,
  active = true,
}: {
  shift?: React.RefObject<number[]>;
  reducedMotion?: boolean;
  active?: boolean;
}) {
  const fade = useLockupFade(active, reducedMotion);

  // ⚠ NO FONT-LOADING GATE HERE, AND ONE WAS TRIED AND REMOVED. The tiny
  // wordmark looked like a race with webfont loading, so a `document.fonts.ready`
  // gate was added — it changed nothing, because the real cause was that
  // `var(--font-geist-sans)` is invalid in a canvas font string and the browser
  // was discarding every size assignment. See WORDMARK_FONT_STACK.
  //
  // Kept as a note rather than as code: a gate that fixes nothing is worse than
  // no gate, because the next person assumes it is load-bearing.

  // ⚠ THE TEXTURE IS BUILT IN `useMemo` AND DRAWN THERE TOO, rather than
  // allocated once and mutated in an effect.
  //
  // `react-hooks/immutability` rejects mutating anything whose provenance it can
  // trace to a hook — including `texture.needsUpdate = true` on a memoised
  // texture. Chunk 2 hit this repeatedly and the resolution was the same:
  // produce a finished value rather than patch a held one. Drawing during the
  // memo means the texture is complete before it is ever handed to a material,
  // so there is no "needs update" state to signal.
  //
  // ⚠ THE MEMO NOW ALLOCATES AND DRAWS THE RESTING STATE ONLY. Animation cannot
  // go through it: a memo keyed on the shift values would rebuild the canvas,
  // the texture and the material 60 times a second for the length of every
  // transition. The live redraw is in `useBackdropRedraw`, and the canvas it
  // draws into is held here so there is exactly one allocation.
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = GRID_WIDTH_PX * TEXTURE_SCALE;
    c.height = GRID_HEIGHT_PX * TEXTURE_SCALE;
    const ctx = c.getContext("2d");
    if (ctx) {
      // ⚠ DRAWN AT FADE 0 — ABSENT, not resting. The memo's output is what the
      // renderer sees on the very first frame, and a lockup drawn at full
      // strength here would flash before `useLockupFade` could set beat six's
      // frame 0. That is the same class of defect `attachGroup` exists to
      // prevent for the cards, arriving from the other direction.
      const regions: BackdropRegions = {
        shift: new Array(CARD_BOXES.length).fill(0),
        fade: 0,
      };
      drawBackdrop(ctx, c.width, c.height, regions);
    }
    return c;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);

  useBackdropRedraw(canvas, texture, shift, fade);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
        // ⚠ `alphaTest`, NOT `transparent`. The lockup sits on a cleared canvas
        // so the page's radial-gradient background shows through — but
        // `transparent: true` would route this material out of the transmission
        // pass's opaque list (three.module.js:8237, :18039) and the glass would
        // stop seeing it entirely, with every assertion still green.
        //
        // `alphaTest` discards fully-transparent fragments in the shader instead,
        // which gives cut-out edges while the material stays OPAQUE to the
        // renderer's sorting. Exactly what is needed here.
        alphaTest: 0.5,
        transparent: false,
        side: THREE.FrontSide,
      }),
    [texture],
  );

  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    return () => {
      material.dispose();
      texture.dispose();
    };
  }, [material, texture, invalidate]);

  return (
    <>
      {/*
        ⚠ THE GROUND PLANE, AND IT IS THE DIFFERENCE BETWEEN GLASS AND A SLAB.

        Carl, 3 August 2026: *"that is not glass. If it was inside the card you
        would see the coloured lettering AND the dark background."* He was right,
        and the cause is in three's own transmission pass rather than in any
        value that had been tuned.

        `renderTransmissionPass` (three.module.js:18007-18021) clears the
        transmission target before rendering `opaqueObjects` into it — and at
        :18019, `if ( _currentClearAlpha < 1 ) setClearColor( 0xffffff, 0.5 )`.
        This canvas is created with `alpha: true`, so the clear alpha IS 0, so
        **the target is cleared to WHITE.**

        ⚠ THE PAGE'S BLACK IS CSS, NOT A SCENE OBJECT. The lockup is a cut-out
        (`alphaTest`), so everywhere the logo is not, the glass was sampling that
        white clear rather than the dark page behind it. MEASURED 3 August:
        outside the card 44.9% of the mark's pixels are below luminance 32;
        inside the card, **0.0%** — not dimmed, absent. The letterform could not
        read because its ground had been replaced by white.

        ⚠ AND IT EXPLAINS WHY LOWERING ROUGHNESS DID NOTHING. Frost was never
        removing the dark ground; the transmission pass never had one. Three
        rounds went into the frost value before the target's clear colour was
        suspected.

        So the page's own darkness is given to the scene as a real object. It
        sits behind the lockup and is opaque, which is what puts it in
        `opaqueObjects` and therefore into the transmission target.
      */}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[GRID_WIDTH_PX * 2, GRID_HEIGHT_PX * 2]} />
        <meshBasicMaterial color={GROUND_COLOR} toneMapped={false} transparent={false} />
      </mesh>

      <mesh position={[0, 0, -1]} material={material}>
        <planeGeometry args={[GRID_WIDTH_PX, GRID_HEIGHT_PX]} />
      </mesh>
    </>
  );
}

/**
 * Redraw the lockup whenever a region's colour is actually moving.
 *
 * ⚠ THIS MUTATES A MEMOISED TEXTURE, WHICH THE REST OF THIS FILE GOES OUT OF ITS
 * WAY TO AVOID — and the departure is deliberate rather than an oversight.
 *
 * The rule the file documents ("produce a finished value rather than patch a
 * held one") exists because `react-hooks/immutability` traces provenance through
 * hooks. It is the right shape for ALLOCATION. It cannot express ANIMATION: a
 * 2400ms transition redrawn by rebuilding the memo would allocate a canvas, a
 * texture and a material on every frame, and hand the renderer a new material
 * 144 times per transition — a shader recompile storm for a colour change.
 *
 * ⚠ SO THE ALLOCATION STAYS IN `useMemo` AND ONLY THE PIXELS MOVE. The canvas and
 * texture are created exactly once; this loop repaints the canvas's 2D context
 * and flags the texture. That is the standard `CanvasTexture` contract.
 *
 * ⚠ IT RUNS ONLY WHILE SOMETHING IS TRAVELLING. The loop compares each frame's
 * values against the last drawn ones and stops when they are identical, so a
 * settled grid costs nothing — which is what keeps `frameloop="demand"` honest.
 */
function useBackdropRedraw(
  canvas: HTMLCanvasElement,
  texture: THREE.CanvasTexture,
  shift: React.RefObject<number[]> | undefined,
  fade: React.RefObject<number>,
) {
  const invalidate = useThree((state) => state.invalidate);
  const lastDrawn = useRef<string>("");

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const values = shift ? shift.current : new Array(CARD_BOXES.length).fill(0);
      // Quantised so imperceptible float drift at the end of a transition does
      // not keep the loop alive redrawing identical frames.
      const key = `${values.map((v) => v.toFixed(3)).join(",")}|${fade.current.toFixed(3)}`;

      if (key !== lastDrawn.current) {
        lastDrawn.current = key;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawBackdrop(ctx, canvas.width, canvas.height, {
            shift: values,
            fade: fade.current,
            inset: faceInset(),
          });
          texture.needsUpdate = true;
          invalidate();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canvas, texture, shift, fade, invalidate]);
}

/**
 * The lockup's beat-six arrival, 0 = absent, 1 = fully present.
 *
 * ⚠ IT FADES THE DRAWN COLOUR, NOT `material.opacity` — and that constraint is
 * the same one this file documents twice already. Driving opacity needs
 * `transparent: true`, which routes the material out of `opaqueObjects`
 * (`three.module.js:8237`) and therefore out of the transmission target
 * (`:18039`). **The glass would stop seeing the lockup entirely** — so the
 * "fade" would present as the lockup vanishing from inside the cards while
 * remaining visible outside them.
 *
 * ⚠ SO THE FADE IS PAINTED. `drawBackdrop` mixes each colour toward the ground
 * before it is drawn, which the glass sees exactly as it sees any other colour.
 *
 * ⚠ REDUCED MOTION SKIPS IT. The CSS card ladder is disabled under
 * `prefers-reduced-motion` (`globals.css`), so a lockup that faded in while the
 * cards did not would be the mismatch that rule exists to prevent.
 */
function useLockupFade(active: boolean, reducedMotion: boolean): React.RefObject<number> {
  const value = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      value.current = 0;
      return;
    }
    if (reducedMotion) {
      value.current = 1;
      return;
    }

    let raf = 0;
    let marked = false;
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed < LOCKUP_FADE_OVERLAPPED_DELAY_MS) {
        value.current = 0;
        raf = requestAnimationFrame(tick);
        return;
      }
      // Dev-only beat trace, gated on `?beattrace=1` — see the note in
      // `useCardEntrance`, which records why the animation's own clock is the
      // instrument here rather than a pixel reader.
      if (!marked) {
        marked = true;
        if (new URLSearchParams(window.location.search).get("beattrace") === "1") {
          performance.mark("lockup-beat-6");
        }
      }

      const t = Math.min(
        1,
        (elapsed - LOCKUP_FADE_OVERLAPPED_DELAY_MS) / LOCKUP_FADE_DURATION_MS,
      );
      value.current = t;
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion]);

  return value;
}

/**
 * Drive each region from blue toward teal over the filament's own 2400ms.
 *
 * ⚠ THE DURATION IS THE FILAMENT'S CIRCUIT, NOT AN ARBITRARY EASE. Carl: *"The
 * blue pixels will turn teal in the same time frame as the filament takes to do
 * a circuit."* Carl again, 4 August, defining what a circuit IS: *"the time it
 * takes for the filament to start its journey and meet up with itself."*
 *
 * ⚠ STATIC AT REST, BY DECISION. Nothing moves unless a card is hovered or
 * selected, so all motion in this backdrop MEANS something — the alternative, a
 * slow ambient drift, risked burying the feedback in the ambience while the user
 * is reading five options.
 *
 * ⚠ EACH CARD CARRIES ITS OWN START TIME AND ITS OWN FROM-VALUE — they are NOT
 * five positions on one shared clock, and that is a real change from the version
 * this replaces.
 *
 * Carl, 4 August: *"It may well be a user hovers and before the colour
 * transition has completed, they press the mouse. The same length of timings
 * apply, they just start at different times."* One duration, independent phase.
 *
 * ⚠ AND THE FROM-VALUE IS READ AT THE MOMENT THE TARGET CHANGES, not reset to an
 * endpoint. A mouse crossing the grid faster than 2400ms retargets a region
 * mid-travel, and picking up from where the colour ACTUALLY IS is what stops
 * that reading as a jump.
 */
export function useRegionShift(target: number[]): React.RefObject<number[]> {
  // ⚠ A REF, NOT STATE, AND THE CANVAS IS REDRAWN DIRECTLY. Sixty React renders
  // a second to animate a colour would be re-rendering the whole scene graph to
  // change pixels on one texture. The ref carries the values; the draw call
  // reads them.
  const values = useRef<number[]>(new Array(CARD_BOXES.length).fill(0));

  // Per-card travel: where this card's current transition started, and when.
  const from = useRef<number[]>(new Array(CARD_BOXES.length).fill(0));
  const startedAt = useRef<number[]>(new Array(CARD_BOXES.length).fill(0));
  const goal = useRef<number[]>(new Array(CARD_BOXES.length).fill(0));

  const targetKey = target.join(",");

  useEffect(() => {
    const now = performance.now();

    // ⚠ ONLY THE CARDS WHOSE TARGET ACTUALLY MOVED ARE RE-PHASED. Restarting
    // every card on every change would drag a settled neighbour back into
    // motion — and with five cards under one pointer, that is the difference
    // between one region travelling and the whole lockup breathing.
    target.forEach((g, i) => {
      if (goal.current[i] === g) return;
      from.current[i] = values.current[i];
      startedAt.current[i] = now;
      goal.current[i] = g;
    });

    let raf = 0;
    const tick = () => {
      const t = performance.now();
      let running = false;

      values.current = values.current.map((v, i) => {
        const p = Math.min(1, (t - startedAt.current[i]) / REGION_SHIFT_MS);
        if (p < 1) running = true;
        // Smoothstep: heat does not arrive or leave at a constant rate, and a
        // linear ramp announces its own start and stop.
        const e = p * p * (3 - 2 * p);
        return from.current[i] + (goal.current[i] - from.current[i]) * e;
      });

      if (running) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `targetKey` is the real dependency; `target` is a fresh array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  return values;
}

// ── The backdrop's own canvas: DELETED, 3 August 2026 ───────────────────────
//
// ⚠ THE TWO CANVASES ARE NOW ONE. This file used to export a default
// `AnswerCardBackdropCanvas` that mounted its own `<Canvas>` over the grid,
// separate from the proto card's card-sized canvas in the left margin. The
// comment here said they would merge "in chunk 4, when the card moves into the
// grid" — that is what has happened, on Carl's instruction: *"put the card in
// its location, top left, and make it glass, not frosted."*
//
// ⚠ AND THE MERGE WAS NOT OPTIONAL. A WebGL canvas can only refract objects in
// ITS OWN scene: the transmission pass renders the scene's `opaqueObjects` into
// a target the glass samples (`three.module.js:18039`). Two canvases meant the
// card was structurally incapable of seeing the logo no matter how they were
// stacked in CSS — moving the card's `<div>` over the lockup would have put it
// in FRONT of the logo while refracting nothing.
//
// `AnswerCardBackdrop` above is now rendered as a plain mesh inside the card's
// scene; see `CardScene` in `answer-card-canvas.tsx`. The phrase-wipe deferral
// that lived here is unchanged and still applies — it is on the one remaining
// canvas, in `answer-card-canvas.tsx`'s `Q5_REVEAL_CLEAR_MS`.
