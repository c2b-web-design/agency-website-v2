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
   * Per-card blue→teal position, 0..1, in grid order.
   *
   * ⚠ ALL ZEROES FOR CHUNK 3 — the five CSS cards are removed, so nothing can be
   * selected and there is no state to respond to yet. `useRegionShift` below
   * builds the mechanism; **chunk 5 wires it to real selection**, at which point
   * the same 2400ms clock drives both this and the filament.
   */
  shift = [0, 0, 0, 0, 0],
}: {
  shift?: number[];
}) {
  const shiftKey = shift.join(",");

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
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = GRID_WIDTH_PX * TEXTURE_SCALE;
    c.height = GRID_HEIGHT_PX * TEXTURE_SCALE;

    const ctx = c.getContext("2d");
    if (ctx) {
      const regions: BackdropRegions = { shift: shiftKey.split(",").map(Number) };
      drawBackdrop(ctx, c.width, c.height, regions);
    }

    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [shiftKey]);

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
 * Drive each region from blue toward teal over the filament's own 2400ms.
 *
 * ⚠ THE DURATION IS THE FILAMENT'S CIRCUIT, NOT AN ARBITRARY EASE. Carl: *"The
 * blue pixels will turn teal in the same time frame as the filament takes to do
 * a circuit."* In chunk 4 both start on one event and finish together.
 *
 * ⚠ STATIC AT REST, BY DECISION. Nothing moves unless a card is selected, so all
 * motion in this backdrop MEANS something — the alternative, a slow ambient
 * drift, risked burying the feedback in the ambience while the user is reading
 * five options.
 */
export function useRegionShift(selected: boolean[]): React.RefObject<number[]> {
  // ⚠ A REF, NOT STATE, AND THE CANVAS IS REDRAWN DIRECTLY. Sixty React renders
  // a second to animate a colour would be re-rendering the whole scene graph to
  // change pixels on one texture. The ref carries the values; the draw call
  // reads them.
  const values = useRef<number[]>(new Array(CARD_BOXES.length).fill(0));
  const targetKey = selected.join(",");

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = values.current.slice();
    const targets = selected.map((s) => (s ? 1 : 0));

    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / REGION_SHIFT_MS);
      values.current = from.map((v, i) => v + (targets[i] - v) * t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `targetKey` is the real dependency; `selected` is a fresh array each render.
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
