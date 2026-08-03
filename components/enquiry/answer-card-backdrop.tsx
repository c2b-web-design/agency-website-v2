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

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  GRID_WIDTH_PX,
  GRID_HEIGHT_PX,
  REGION_SHIFT_MS,
  CARD_BOXES,
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
        // ⚠ BOTH OF THESE. Transmission > 0 OR transparent === true removes the
        // object from the transmission pass's opaque list.
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
    <mesh position={[0, 0, -1]} material={material}>
      <planeGeometry args={[GRID_WIDTH_PX, GRID_HEIGHT_PX]} />
    </mesh>
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

/**
 * The backdrop's own canvas, overlaying the answer grid.
 *
 * ⚠ A SEPARATE CANVAS FROM THE PROTO CARD'S, and that is structural rather than
 * incidental: the proto card's canvas is card-sized and sits in the LEFT MARGIN,
 * while the backdrop spans the full 576px grid. One cannot contain the other
 * until chunk 4 moves the card into the grid, at which point they merge.
 *
 * ⚠ AND IT DEFERS ITS OWN WEBGL SETUP PAST THE Q5 PHRASE WIPE, for the same
 * reason `answer-card-canvas.tsx` does: a second canvas initialising inside the
 * 1300ms reveal reintroduces the stutter Carl has now reported twice. The gate
 * that already existed knew nothing about the first extra canvas; it knows
 * nothing about this one either.
 */
const Q5_REVEAL_CLEAR_MS = 1300;

export default function AnswerCardBackdropCanvas() {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [revealCleared, setRevealCleared] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setRevealCleared(true), Q5_REVEAL_CLEAR_MS);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  if (!revealCleared) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="answer-card-backdrop"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: GRID_WIDTH_PX,
        height: GRID_HEIGHT_PX,
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
        <AnswerCardBackdrop />
      </Canvas>
    </div>
  );
}
