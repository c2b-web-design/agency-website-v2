"use client";

/**
 * The ground behind the answer-card grid.
 *
 * ⚠ THIS FILE USED TO BE THE `c2b DESIGN` LOCKUP, AND THE LOCKUP IS GONE —
 * removed on Carl's instruction, 5 August 2026. What remains is the one part of
 * it that was never decoration: **an opaque plane for the transmission pass.**
 *
 * ⚠ CARL'S REASONING, AND IT IS A QUESTION ABOUT THE PREMISE RATHER THAN THE
 * IMPLEMENTATION: *"This is the reason the background exists. I needed something
 * to distinguish between card resting state and hover state. In the CSS version
 * the card gets brighter. I decided to add the c2b DESIGN transformation. This
 * may turn out to be more trouble than its worth as its effects have brought
 * about more problems. Is it necessary? No. Is a resting state and hover state
 * necessary. Yes."*
 *
 * So the state change returns to the card's own surface — where the CSS version
 * always had it (`app/globals.css`, `.enquiry-card:hover`) — and nothing behind
 * the card is responsible for it any more. That also settles a defect Carl found
 * by eye the same day: holding the pointer over card 4 he saw *"the background is
 * affecting the reflection"*, card 4 over teal reading teal while card 1 over
 * dark ground read dark. **A face whose colour depends on what is behind it
 * cannot hold the answer text the cards are about to carry.**
 *
 * ⚠ WHAT IS LEFT IS NOT OPTIONAL, AND THIS IS THE TRAP IN REMOVING THE REST.
 * `renderTransmissionPass` clears the transmission target to WHITE when the
 * canvas has `alpha: true` (`three.module.js:18019`), and the page's real
 * background is CSS, which no WebGL pass can see. With no opaque object behind
 * the cards the glass samples that white clear — measured 3 August at **0.0%
 * dark pixels inside the card against 44.9% outside it.** The ground plane is
 * what stops that, so it stays.
 */

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  GRID_WIDTH_PX,
  GRID_HEIGHT_PX,
  GROUND_COLOR,
} from "./answer-card-backdrop-geometry";

export function AnswerCardBackdrop({ clay = false }: { clay?: boolean }) {
  // ⚠ ONE INVALIDATE ON MOUNT. The canvas is `frameloop="demand"`, so a mesh
  // that appears without asking for a frame is a mesh nobody draws. Nothing here
  // animates any more — the lockup's per-frame redraw loop and its beat-six fade
  // both went with the lockup — so this is the only frame this component needs.
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return (
    /*
      ⚠ THE GROUND PLANE, AND IT IS THE DIFFERENCE BETWEEN GLASS AND A BLOWN-OUT
      SLAB.

      Carl, 3 August 2026: *"that is not glass. If it was inside the card you
      would see the coloured lettering AND the dark background."* He was right,
      and the cause was in three's own transmission pass rather than in any value
      that had been tuned.

      `renderTransmissionPass` (three.module.js:18007-18021) clears the
      transmission target before rendering `opaqueObjects` into it — and at
      :18019, `if ( _currentClearAlpha < 1 ) setClearColor( 0xffffff, 0.5 )`.
      This canvas is created with `alpha: true`, so the clear alpha IS 0, so
      **the target is cleared to WHITE.**

      ⚠ THE PAGE'S BLACK IS CSS, NOT A SCENE OBJECT. So the page's own darkness
      is given to the scene as a real object: opaque, which is what puts it in
      `opaqueObjects` and therefore into the transmission target.

      ⚠ AND IT EXPLAINED WHY LOWERING ROUGHNESS DID NOTHING. Frost was never
      removing the dark ground; the transmission pass never had one. Three rounds
      went into the frost value before the target's clear colour was suspected.

      ⚠ OVERSIZED AT 2x THE GRID SO ITS EDGE IS NEVER ON SCREEN. An earlier
      version painted a flat fill into the lockup's own canvas instead, and its
      boundary sat against the page's radial gradient and mismatched it — Carl
      saw it instantly: *"I can see the black rectangle the text is sitting in."*
      A separate oversized mesh has no visible boundary to mismatch.
    */
    /*
      ⚠ IN CLAY MODE IT BECOMES A LIT, SHADOW-RECEIVING FLOOR. `MeshBasicMaterial`
      is unlit by definition — it cannot receive a shadow at all — so the form
      study swaps it for a standard material. Without this the card would cast
      onto nothing and the one cue that says "this object sits in space" would be
      missing from the very render built to judge its form.
    */
    <mesh position={[0, 0, -2]} receiveShadow={clay}>
      <planeGeometry args={[GRID_WIDTH_PX * 2, GRID_HEIGHT_PX * 2]} />
      {clay ? (
        <meshStandardMaterial color="#4a4a4a" roughness={0.95} metalness={0} />
      ) : (
        <meshBasicMaterial color={GROUND_COLOR} toneMapped={false} transparent={false} />
      )}
    </mesh>
  );
}

// ── The lockup: REMOVED, 5 August 2026 ──────────────────────────────────────
//
// ⚠ WHAT WENT, so nobody looks for it: the `c2b DESIGN` canvas texture and its
// `CanvasTexture`/`MeshBasicMaterial` pair, `useBackdropRedraw` (the per-frame
// repaint loop), `useLockupFade` (beat six, and the `?lockup=` fader), and
// `useRegionShift` (the per-card blue/teal travel on the filament's 2400ms
// circuit). The drawing code they drove — `drawBackdrop`, `easeBlueTeal`,
// `decodeMark` and the wordmark layout — went from
// `answer-card-backdrop-geometry.ts`, and the traced mark bitmap file
// `answer-card-mark.ts` was deleted outright.
//
// ⚠ WHAT DELIBERATELY STAYED IN THAT FILE, and why the cut does not split on
// file boundaries: `CARD_BOXES`, `GRID_WIDTH_PX`, `GRID_HEIGHT_PX` and
// `GROUND_COLOR` are load-bearing for the CARDS, not for the lockup.
// `answer-card-geometry.ts` imports the grid dimensions and derives every card's
// world position from `CARD_BOXES`.
//
// ⚠ THE OPEN RISK, RECORDED BECAUSE IT WAS FLAGGED BEFORE THE CUT RATHER THAN
// DISCOVERED AFTER IT: this file used to note that the cards *"read as dark
// slabs and only become glass when the lockup lights behind them."* With a flat
// ground there is nothing distinctive left to refract, so the glass may stop
// reading as glass. **If the cards look flat, that is the cause** — and the
// lever is `GROUND_COLOR`, a one-line change, not a reinstatement of the lockup.
