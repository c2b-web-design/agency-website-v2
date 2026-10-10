"use client";

/**
 * /about §2 — the role-card canvas. ⛔ THE FLOOR PAIR, CD AND CS, 14 September 2026.
 *
 * ⛔⛔ READ FIRST — THE ROOM WAS REPLACED ON 25 September 2026 (D-095). §2 now shows office-image-3
 * through its own solved camera, and all four cards are placed in ROOM MILLIMETRES from
 * `about-room.ts` (CA/CB on the back wall, CS above on the cabinet fronts, CD on the floor). ⚠ **Most of
 * the history below describes the OLD room** — the rails, the desks, the yawed floor pair. It is kept
 * for its reasoning; where it names a placement mechanism, that mechanism is gone (see `placeRoomCard`).
 *
 * ⛔⛔ THIS IS THE FIRST WebGL CONTEXT ON `/about`, AND IT IS THE §5a STRUCTURE.
 * Built on Carl's explicit instruction. ⚠⚠ The §5a note exists and was NOT routed
 * to the Architect before this landed:
 * `live-work/structural-decision-note-about-canvas.md`. ⛔ The skip was Carl's
 * call, which is sufficient authority — recorded here rather than left to be
 * discovered, because the two prior instances of this exact shape (the warm-up
 * canvas, `NextStepMeshButton`) cost four sessions and a week, and neither was
 * caught by any instrument.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⛔⛔ THE CARDS STAND ON THE FLOOR. THIS REPLACES AN ORTHOGRAPHIC FIT.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠⚠ THREE EARLIER VERSIONS WERE WRONG AND THE PROGRESSION IS WORTH KEEPING:
 *
 *   1. PERSPECTIVE + INVENTED DEPTH. `CARD_DEPTH_MM = 3200`, a number chosen from
 *      nothing. Carl: *"youve just put a random card with a background right in
 *      the middle of the screen."*
 *   2. ORTHOGRAPHIC FIT TO THE GUIDE BOXES. Correct on the guides, but face-on
 *      flat rectangles — no yaw, no floor.
 *   3. ORTHOGRAPHIC + RAIL MIDPOINTS. Both cards centred on the midpoints, which
 *      pushed them BELOW THE PLATE (CD by 0.025, CS by 0.041) and overlapped them
 *      by 16% of the plate width. ⛔ Each time the placement was verified and the
 *      resulting EXTENTS were not.
 *
 * ⛔ CARL'S CORRECTION, 14 September: *"Look at the angle of the blue and pink
 * lines. The cards should sit on that and be at almost 90 deg from each other —
 * not face on."* **The rails carry a DIRECTION, not just a position.**
 *
 * ⚠ "NO LEAN" MEANS NO BACKWARD TILT, NOT NO ROTATION. The cards are upright and
 * yawed about Y. ⛔ An X rotation is what Carl ruled out: *"standing upright, no
 * lean."*
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ THE UNIT BRIDGE — millimetres to floor units, on ONE assumption
 * ══════════════════════════════════════════════════════════════════════════
 *
 * The floor model puts the camera at height 1.0 in arbitrary units; the cards are
 * built in millimetres. ⛔ They are bridged by `DESK_HEIGHT_MM = 750` — the
 * record's single stated assumption, and the only real dimension available.
 *
 * ⚠ IF 750 IS WRONG, EVERY DIMENSION SCALES TOGETHER AND NOTHING ABOUT THE DESIGN
 * CHANGES. The cards are specified relative to each other and to the room, never
 * absolutely. Stated so a future reader does not treat 750 as measured.
 *
 * ⛔ CAMERA HEIGHT IS ASSUMED EQUAL TO DESK HEIGHT. A seated eye-line and a desk
 * top are close but not identical. **Unasserted, and it sets the floor's scale.**
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ WHAT THIS BUILD DEPENDS ON THAT IS NOT SETTLED
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⛔ THE CANVAS BOX MUST BE THE PLATE'S RENDERED BOX. §2 is `object-contain`
 * today and the maths below assumes it. **If the fit mode ever reverts to
 * `object-cover`, every card shifts** — §2's final aspect and fit mode are listed
 * as OPEN in the §5a note. ⚠ Register with `camera.setViewOffset` if cover wins.
 */

import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
/* ⛔ The old room's guide, rail, aspect, height and camera constants are no longer read here (the new
   room, 25 September 2026). They stay exported from `about-card-geometry.ts` — `/proto/wall` and the
   card bench still use the old plate and camera. */
import { cardDims, TENT_POLE_RATIO } from "./about-card-geometry";
import {
  ROOM_BACK_DIR,
  ROOM_CAMERA_PITCH_UP_DEG,
  ROOM_CAMERA_VFOV_DEG,
  ROOM_CARD_GUIDES,
  ROOM_CARDS,
  ROOM_CORNER_FLOOR_MM,
  ROOM_INTO_WALL,
  ROOM_MM_PER_UNIT,
  ROOM_PLATE_ASPECT,
  ROOM_PLATE_SRC,
  ROOM_UP,
  roomCardPlacement,
  DESK_MARK,
  DESK_LED_STRIP,
  DESK_MARK_FALL,
  DESK_MARK_SOMERSAULT,
  DESK_RIGHT_CORNER,
  deskMarkPlacement,
  deskMarkOriginUMm,
  roomPoint,
  type RoomCardSpec,
} from "./about-room";
import { buildLogoMarkGeometry, LOGO_MARK_DEFAULTS, logoMarkCentre, logoMarkReach } from "./logo-mark-geometry";
import { buildLogoStudioEnv, createLogoCrossing, environmentOnly, LOGO_STUDIO_TOP, type LogoCrossing } from "./logo-mark-material";
import {
  CA_FACE_TRANSMISSION,
  CD_FACE_TRANSMISSION,
  GLASS_FACE_TRANSMISSION,
} from "./about-card-glass";
import { AboutCardMesh } from "./about-card-mesh";
import { RoomEnvironment } from "./room-environment";
import {
  CA_NEON_PEAK,
  CB_NEON_PEAK,
  CD_NEON_PEAK,
  CS_NEON_PEAK,
  FLOOR_GRADIENT_GOLD_HEX,
  FLOOR_GRADIENT_RED_HEX,
  FLOOR_GRADIENT_BLEND,
  NEON_GLOW_HEX,
  NEON_TUBE_HEX,
  neonHex,
  neonMode,
  neonNumber,
  neonParam,
  roomWipe,
  SEQUENCE_FEW_WORDS,
  sequenceOrder,
  sequencePlan,
  FLASH_CAP,
  type NeonChannel,
  type SequenceClock,
} from "./about-neon";
import { NeonBloom } from "./neon-bloom";
import { etchEnabled, etchSettings, type EtchSettings } from "./card-etch";
import {
  CardExtrudedText,
  extrudeCards,
  layoutCardText,
  loadFont,
  type ExtrudeCardId,
  type ExtrudeSettings,
  extrudeEnabled,
  extrudeSettings,
  LIGHT_DISTANCE_MM as EXTRUDE_LIGHT_DISTANCE_MM,
} from "./card-extrude";
import { aboutCardCopy } from "./about-card-copy";
import type { Chase } from "./card-text-timeline";

/**
 * ⛔⛔ THE NEW ROOM — office-image-3, 25 September 2026 (D-095). Carl: *"Change about, build it there."*
 *
 * ⚠⚠ THE OLD ROOM'S PLACEMENT MACHINERY IS REMOVED, NOT ADAPTED: `floorPoint` (a plate fraction dropped
 * onto the floor), `placeCard` (a floor card on Carl's hand-pinned rail, by a named corner),
 * `stageToPlateY` (the /proto/wall crop fix) and `placeWallCard` (a card recovered from its pinned
 * quad). ⛔ **All four existed to read a card's place off the OLD photograph**; the new room states each
 * card in ROOM MILLIMETRES (`about-room.ts`), so there is nothing to read off the plate. The code and
 * its reasoning are in git at a0658b2 and earlier; the camera and layout records are in `live-work/`.
 *
 * ⚠ Scene units are METRES (`ROOM_MM_PER_UNIT = 1000`), the camera sits at the origin 1139 mm above the
 * floor (desk-scaled), and the floor is the plane `y = -CAM_H`.
 */
const CAM_H = -ROOM_CORNER_FLOOR_MM[1] / ROOM_MM_PER_UNIT;
/** ⛔ PITCH IS POSITIVE: this camera looks UP 3.22° (the old room looked down 12.68°). */
const PITCH = (ROOM_CAMERA_PITCH_UP_DEG * Math.PI) / 180;
const COS_P = Math.cos(PITCH);
const SIN_P = Math.sin(PITCH);

/**
 * ⛔ THE BACKPLATE'S CAMERA MATHS, at module scope so the geometry AND the camera's `far` read it.
 * The canvas box is the plate's own aspect (2560 x 1435), so NDC maps linearly onto the photograph.
 */
const PROXY_TAN_V = Math.tan((ROOM_CAMERA_VFOV_DEG * Math.PI) / 360);
const PROXY_TAN_H = PROXY_TAN_V * ROOM_PLATE_ASPECT;

/** NDC -> world ray direction, through the solved camera's pitch. Camera-space z is −1, so a hit at
 *  parameter `t` lies at camera DEPTH `t`. */
function proxyRayDir(nx: number, ny: number) {
  const dx = nx * PROXY_TAN_H;
  const dy = ny * PROXY_TAN_V;
  const dz = -1;
  return {
    x: dx,
    y: dy * COS_P - dz * SIN_P,
    z: dy * SIN_P + dz * COS_P,
  };
}

/**
 * ⛔ THE HORIZON IN NDC, DERIVED not guessed: the ray whose world y-component
 * is zero is parallel to the floor.
 *
 * ⛔⛔ SIGN CORRECTED, 18 September 2026. It read
 * `SIN_P / (COS_P * tanV)` and returned **-0.33794**; the horizon is
 * **+0.33794**.
 *
 * ⚠⚠ THE DERIVATION, because the old value looked plausible and was not:
 * `rayDir` gives `y = ny*tanV*COS_P - dz*SIN_P` with `dz = -1`, i.e.
 * `y = ny*tanV*COS_P + SIN_P`. Setting `y = 0` gives
 * `ny = -SIN_P / (tanV*COS_P)`. **The minus sign was dropped.** Verified by
 * substitution: at +0.33794 the y-component is 2.8e-17; at -0.33794 it is
 * **-0.43901**, which is not a horizon at all.
 *
 * ⚠ THE COMMENT WAS RIGHT WHILE THE CODE WAS WRONG — this note previously
 * read *"ny ~= 0.400"*, a POSITIVE number, sitting directly above a line
 * that computed a negative one. ⛔ Nothing in code checked the two agreed.
 *
 * ⚠⚠ THIS WAS **NOT** WHY THE PROXY WAS INVISIBLE — that was the winding,
 * below. Both grids built finite, bounded, NaN-free vertices either way.
 * **Fixing this alone would have changed nothing on screen**, which is
 * exactly how a real bug can be mistaken for a failed fix.
 *
 * ⚠ The +0.33794 figures are the OLD room's (pitched down). The new room's horizon is **−0.1011**.
 */
const NY_HORIZON = -SIN_P / (COS_P * PROXY_TAN_V);
/* ⚠ Stop just short — at the horizon itself `t` diverges. */
const NY_FLOOR_TOP = NY_HORIZON - 0.02;

/**
 * The far plane: a vertical plane at the depth the floor reaches at its far edge,
 * so the two meet along the horizon with no seam and no arithmetic between them.
 */
const PROXY_WALL_Z = (() => {
  const d = proxyRayDir(0, NY_FLOOR_TOP);
  return (-CAM_H / d.y) * d.z;
})();

/**
 * ⛔⛔ THE CAMERA'S `far` IS DERIVED FROM THE PROXY'S DEEPEST POINT — 25 September 2026.
 *
 * ⚠⚠ IT WAS A HAND-SET 100, AND THE NEW ROOM PUT THE FAR PLANE PAST IT. Looking UP 3.22°, the floor
 * stops 0.02 NDC below a horizon that is nearly level, so its far edge — and the far plane with it —
 * lands **102.3–106.0 m** out (the old room, looking down 12.68°: ~16 m). ⛔ **Everything above plate
 * row 0.561 was clipped and never drawn.** Measured, not inferred
 * (`live-work/scripts/seam-far-clip.mjs`): WebGL drew nothing above row 533 of 951 (0.560).
 *
 * ⚠ IT HID THE SAME WAY THE BACKWARDS WINDING DID: the DOM `<img>` behind the transparent canvas drew
 * the same room, so the missing wall showed only as a SEAM where the two resamplings met, with the
 * monitors — which sit on the horizon — ghosted along it. ⛔⛔ **AND IT MADE CA, CB AND CS READ
 * OPAQUE WHITE**: with no wall in the scene their glass refracted the transmission target's 50%-white
 * clear, while CD, over the drawn floor, read as glass. **It was never the lighting.**
 *
 * ⛔ Depth at the far plane's top row (ny = 1) is the deepest the proxy goes; the margin covers the
 * corners, which share the row's depth. ⚠ Precision is not a concern: near 0.01 / far ~133 still
 * resolves ~0.15 mm at the cards' 5 m.
 */
const PROXY_MAX_DEPTH = PROXY_WALL_Z / proxyRayDir(0, 1).z;
const CAMERA_FAR = Math.ceil(PROXY_MAX_DEPTH * 1.25);

/**
 * ⛔ ONE CARD, IN THE ROOM. The family rule unchanged — Carl: *"A shape that has a rim, bevel and curved
 * face… A corner is a corner no matter what the dimensions."* `cardDims` is the single blueprint; only a
 * card's height and aspect differ, and both come from its room spec.
 */
/** Which cards show their text on this load — `?text=` (see `textCards` in `AboutCardCanvas`). */
function textCardsFromUrl(): Set<ExtrudeCardId> {
  const v = neonParam("text");
  const all: ExtrudeCardId[] = ["ca", "cb", "cd", "cs"];
  /* ⛔ CA AND CB, STATIC — Carl, 25 September 2026 (third session), with the wall pair's rims lit in the room's
     orange: *"Put the static text back on CA + CB."* (Before: NONE — *"Hide all the text on the cards"*, once the
     blowout dips were in; before that all four static, to find the blowout; before that one card at a time.)
     `?text=1` shows all four; a list (`?text=cd`) isolates; `?text=0` hides all. */
  /* ⛔ AND CD + CS — Carl, the same session, once the floor pair's gradient rims and grow-flicker were in: *"Put
     static text back on CS + CS"* (read as CD + CS). All four now, static. */
  if (v === null) return new Set<ExtrudeCardId>(all);
  if (v === "1" || v === "all") return new Set(all);
  if (v === "0") return new Set<ExtrudeCardId>();
  return new Set(all.filter((id) => v.split(",").includes(id)));
}

function placeRoomCard(spec: RoomCardSpec) {
  const p = roomCardPlacement(spec);
  return {
    dims: cardDims(spec.heightMm, p.aspect),
    crownMm: spec.heightMm * TENT_POLE_RATIO,
    scale: p.scale,
    position: p.position,
    rotationY: p.rotationY,
  };
}

/**
 * ⚠⚠ THE FOUR-LAMP SPOTLIGHT RIG WAS BUILT HERE AND IS REMOVED — 17 September
 * 2026, on Carl's verdict from the screen.
 *
 * **Carl:** *"It doesnt look right. its acting like a street light. The best
 * representation ive seen is before we started changing/adding lights when the
 * right side cards were grey and the left side blowwn out. Return them to that
 * state."*
 *
 * ⛔⛔ THE FAULT IS THE LIGHT TYPE, NOT ITS PLACEMENT, AND THAT IS WHY NONE OF
 * THE TUNING HELPED. A `spotLight` has a POSITION, so it throws a cone and falls
 * off with distance — it puts a bright POOL on one part of a surface and darkens
 * everything outside it. ⚠ On a card the size of these, that pool reads as a
 * lamp shining ON the card rather than as light revealing its shape: a street
 * light. **Four of them made four pools.**
 *
 * ⛔ A `directionalLight` has NO position and NO falloff — every point on a face
 * takes the same incoming direction, so the only thing that varies across the
 * surface is the SURFACE ITSELF. **That is what makes a crown legible, and it is
 * what the bench uses.**
 *
 * ⚠⚠ THE WHOLE SEQUENCE IS RECORDED BECAUSE THE REASONING WAS SOUND AND THE
 * RESULT WAS STILL WRONG — four measured iterations, each fixing the previous
 * one's real defect:
 *
 *     four raking spots       -> cumulative clipping, CA at 2.949
 *     cones to stop spill     -> all four at N·L 0.482, no cross-talk
 *     rim axis, per Carl      -> N·L 0.0000, face on ambient only
 *     25deg swing to the face -> N·L 0.4226, matched to the bench
 *
 * ⛔ **Every step measured clean. The screen still said street light.** Rule 9:
 * rendered output is the truth for visual work, and Carl's eye is the instrument.
 *
 * ⚠ KEPT AS A NOTE RATHER THAN CODE. If per-card lamps are ever wanted again —
 * Carl's own chunk-3 spec mentions *"4 individual lights pointed at each card"* —
 * **they should be directional, or the pooling returns.**
 */



/**
 * ⛔⛔ THE ROOM AS A CAMERA-MATCHED DEPTH PROXY — rebuilt 18 September 2026.
 *
 * ⚠⚠ **THE PHOTOGRAPH IS STILL THE SOURCE OF EVERY PIXEL. THIS GEOMETRY ONLY
 * SUPPLIES DEPTH**, so `MeshPhysicalMaterial` transmission has something in the
 * scene to refract. ⛔ **It is NOT a 3D reconstruction of the room** and must not
 * be grown into one.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⛔⛔ EVERY VERTEX IS AN UNPROJECTED SCREEN POINT. THAT IS THE WHOLE FIX.
 * ══════════════════════════════════════════════════════════════════════════
 *
 *     NDC point  ->  camera ray  ->  plane intersection  ->  vertex
 *     the SAME NDC point  ->  the photograph's UV
 *
 * ⛔ **So a vertex appears at exactly the screen position its UV was taken
 * from**, by construction. Framing cannot drift, because nothing derives the
 * position except the camera itself.
 *
 * ⚠⚠ **THE PREVIOUS BUILD DERIVED VERTICES FROM PLATE FRACTIONS AND THEN CLAMPED
 * THEM, AND THAT WAS THE BUG.** Past a `FAR` limit it clamped `z` and scaled `x`
 * **while leaving `y` untouched** — which lifts the vertex OFF the camera ray
 * that generated its UV. The vertex then draws its photograph pixel at the wrong
 * screen position, non-uniformly across the grid, so the whole room appeared to
 * shift and zoom relative to the cards. ⛔ **The cards never moved. The
 * background's camera-to-image mapping did.**
 *
 * ⚠ AND IT WAS NOT AN `object-contain` FAULT, WHICH WAS THE FIRST DIAGNOSIS.
 * **Measured, 18 September: the canvas box and the `object-contain` displayed
 * image box agree to 0.00px at 1440 and 1920** — the wrapper is `aspect-[3/2]`,
 * the plate's own aspect, so the letterbox offsets inside the canvas are zero.
 * ⛔ Recorded because a plausible wrong cause was nearly built against.
 *
 * ⚠⚠ **THE NDC ROUTE IS STILL THE RIGHT ONE EVEN THOUGH THE OFFSETS ARE ZERO**:
 * it is correct by construction rather than by coincidence, so it survives a
 * viewport where the boxes do NOT coincide — **and one exists: at 800x1200 the
 * canvas letterboxes differently and the boxes diverge by 338px.**
 *
 * ⛔ THE HORIZON IS HANDLED BY BOUNDING THE GRID, NOT BY CLAMPING VERTICES.
 * Rays at and above it never meet the floor; the floor grid stops just short and
 * the wall takes everything above.
 *
 * ⛔⛔ THE NEW ROOM, 25 September 2026: the same construction, a different plate and camera. ⚠ **This
 * camera looks UP, so the horizon is BELOW the frame's centre** (NDC ≈ −0.10) and the floor grid covers
 * only the bottom ~45% of the frame; the far plane takes the rest. ⚠ The proxy is still a floor and ONE
 * far vertical plane — not the room's real back and right walls. It only has to sit BEHIND every card,
 * and it does: a ray through any card meets the floor or the far plane further away than the card.
 */
function RoomBackplate() {
  const texture = useLoader(THREE.TextureLoader, ROOM_PLATE_SRC);
  /* ⛔ `contact-field-canvas.tsx:806`: omitting this double-applies the transfer
     function. ⚠ Via `Object.assign` — the lint rule objects to mutating a hook's
     return value directly. */
  Object.assign(texture, { colorSpace: THREE.SRGBColorSpace });

  const { floor, wall } = useMemo(() => {
    /* ⚠ The ray, horizon and far-plane depth live at module scope (`proxyRayDir`, `NY_FLOOR_TOP`,
       `PROXY_WALL_Z`) — the camera's `far` is derived from the same numbers. */
    const rayDir = proxyRayDir;

    /** Build a grid between two NDC y values, intersecting `plane`. */
    const grid = (
      ny0: number,
      ny1: number,
      hit: (d: { x: number; y: number; z: number }) => [number, number, number],
      DIV = 48,
    ) => {
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];
      for (let iy = 0; iy <= DIV; iy++) {
        const ny = ny0 + ((ny1 - ny0) * iy) / DIV;
        for (let ix = 0; ix <= DIV; ix++) {
          const nx = -1 + (2 * ix) / DIV;
          pos.push(...hit(rayDir(nx, ny)));
          /* ⛔ THE UV IS THE SCREEN POINT ITSELF. The plate fills the canvas, so
             NDC maps linearly to the photograph. ⚠ This is the invariant the old
             build broke. */
          uv.push((nx + 1) / 2, (ny + 1) / 2);
        }
      }
      for (let iy = 0; iy < DIV; iy++) {
        for (let ix = 0; ix < DIV; ix++) {
          const a = iy * (DIV + 1) + ix;
          /**
           * ⛔⛔ WINDING REVERSED, 18 September 2026. THIS IS WHY THE PROXY WAS
           * INVISIBLE FOR THE WHOLE OF ITS FIRST DAY.
           *
           * ⚠⚠ The original order — `a, a+DIV+1, a+1` — winds CLOCKWISE as seen
           * from this camera, so every triangle was BACK-FACING and the GPU
           * culled all 4,608 of them under the default `FrontSide`. ⛔ The mesh
           * was never frustum-culled and never hidden: `onBeforeRender` FIRED on
           * every frame, so it reached `renderObject()` and was submitted to the
           * GPU, which then discarded it at the face-culling stage.
           *
           * ⛔ HOW IT HID: the room LOOKED correct because the DOM `<img>` sat
           * behind a transparent canvas, exactly as it had before the proxy was
           * written. **A layer that contributed nothing was indistinguishable
           * from one that worked.**
           *
           * ⚠⚠ AND IT IS WHY CS COULD REFRACT A ROOM THAT WAS NOT ON SCREEN:
           * three's transmission pass temporarily flips `material.side` to
           * `BackSide`, so the proxy was visible to the GLASS and culled in the
           * MAIN pass. Two contradictory-looking observations, one cause.
           *
           * ⛔ POSITIONS AND UVs ARE UNTOUCHED. Only the index order changes, so
           * no vertex moves and the cards' geometry cannot shift. Proved by
           * silhouette comparison before/after.
           */
          idx.push(a, a + 1, a + DIV + 1, a + 1, a + DIV + 2, a + DIV + 1);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    };

    /* The floor: y = -CAM_H. */
    const floorG = grid(-1, NY_FLOOR_TOP, (d) => {
      const t = -CAM_H / d.y;
      return [d.x * t, -CAM_H, d.z * t];
    });

    /* The wall: the far plane at `PROXY_WALL_Z` (see its note — and `CAMERA_FAR`'s). */
    const wallG = grid(NY_FLOOR_TOP, 1, (d) => {
      const t = PROXY_WALL_Z / d.z;
      return [d.x * t, d.y * t, PROXY_WALL_Z];
    });

    return { floor: floorG, wall: wallG };
  }, []);

  useEffect(
    () => () => {
      floor.dispose();
      wall.dispose();
    },
    [floor, wall],
  );

  return (
    <group>
      {/* ⚠ `MeshBasicMaterial` — UNLIT, deliberately. ⛔ The room is ALREADY LIT:
          the ceiling lights and their falloff are IN the photograph. Shading it
          again would light a picture of a lit room. ⚠ `toneMapped={false}` or the
          plate is ACES-shifted while the page around it is not (F7). */}
      <mesh geometry={floor}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh geometry={wall}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * ⛔⛔ THE GUIDE OVERLAY — Carl, 18 September 2026: *"the guide lines should be in
 * the image so i can verify."*
 *
 * ⚠⚠ **IT DRAWS THE PLATE'S OWN MEASURED GUIDES, UNPROJECTED ONTO A PLANE JUST IN
 * FRONT OF THE CAMERA.** So a guide and the card it governs coincide on screen if
 * and only if the card is placed correctly — **no arithmetic between them, and
 * nothing shared with the placement code that could make the check pass falsely.**
 *
 * ⛔ THIS IS THE INSTRUMENT CARL USED TO CATCH THE CEILING-ANGLE ERROR (D-076):
 * *"lift a supposedly-parallel line onto the seam and see whether it traces it."*
 * ⚠ The Builder's four wrong angles were each verified against their own figure —
 * **a check that shares its input with the thing it checks cannot fail.**
 *
 * ⚠ DEV-ONLY, and off unless `?guides=1`. It is diagnostic, not design.
 *
 * ⛔⛔ THE NEW ROOM, 25 September 2026: it draws the four APPROVED card outlines (`ROOM_CARD_GUIDES`), as
 * the LAYOUT script projected them — while the cards themselves are placed by the SCENE path
 * (`roomCardPlacement`). ⚠ **Two code paths, one camera: a card and its guide coincide only if the two
 * agree.** (The old room's rails and pinned quads went with the old photograph.) ⚠ The guides are the
 * outlines at each card's SURFACE plane; the wall cards and CS hang one rim bead proud of it, so expect
 * a few pixels of offset toward the camera's side, not coincidence to the pixel.
 */
function GuideOverlay() {
  const geometry = useMemo(() => {
    /* ⚠ A plane just ahead of the camera, so the guides sit in front of everything. */
    const D = 0.6;
    const tanV = Math.tan((ROOM_CAMERA_VFOV_DEG * Math.PI) / 360);
    const tanH = tanV * ROOM_PLATE_ASPECT;
    /** A plate fraction -> a point on the camera ray through it, D ahead. Same NDC route as the backplate. */
    const at = (fx: number, fy: number) => {
      const dx = (2 * fx - 1) * tanH;
      const dy = (1 - 2 * fy) * tanV;
      const dz = -1;
      const x = dx;
      const y = dy * COS_P - dz * SIN_P;
      const z = dy * SIN_P + dz * COS_P;
      const L = Math.hypot(x, y, z) || 1;
      return [(x / L) * D, (y / L) * D, (z / L) * D] as const;
    };
    const pts: number[] = [];
    for (const corners of Object.values(ROOM_CARD_GUIDES)) {
      for (let i = 0; i < corners.length; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % corners.length];
        pts.push(...at(a[0], a[1]), ...at(b[0], b[1]));
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry} renderOrder={999}>
      <lineBasicMaterial color="#00ff88" depthTest={false} toneMapped={false} />
    </lineSegments>
  );
}

/**
 * ⚠ The room's env map, loading the same plate the backplate uses. ⛔ `useLoader`
 * caches by URL, so this is ONE fetch and one decode shared with `RoomBackplate`
 * — not a second download.
 */
function RoomEnvironmentFromPlate() {
  const texture = useLoader(THREE.TextureLoader, ROOM_PLATE_SRC);
  /* ⚠ DIAGNOSTIC — `?envmap=0` removes the env map (the glass's REFLECTION of the room). Added 25 September
     2026 (third session) to tell whether the arc across CS's face is reflected or transmitted (Carl: *"there
     is an arc of a streak accross the face of CS. Why is this?"*). Absent → on, as before. */
  return <RoomEnvironment plate={texture} enabled={neonParam("envmap") !== "0"} />;
}

/**
 * ⛔⛔ THE TAKE LIGHT — the drawing board's first light, 3 October 2026. ONE directional light, not moving, with
 * shadows. Carl's brief: *"1. The glass face should clearly read as frosted glass and its geometry visible. 2. The
 * text should be legible and be noticeably 3d, extruded"*; its colour from the room — *"the walls are orange and the
 * wood brown. So a subtle colour could be used to light the face of the cards… Caused by the world"* — *"a blend"*.
 *
 * ⚠ ITS ANGLE IS SET IN THE CARDS' OWN FRAME: all four share one yaw (`ROOM_YAW_DEG`), so one direction means the
 * same thing on every card. `offDeg` = degrees off the faces' normal (0 head-on, 90 edge-on); `azDeg` = which side
 * it comes from, round the normal (0 from the right, 90 from above, 180 from the left, 270 from below).
 * ⚠ ITS COLOUR is the lit wall's hue (`#ff6528`, sampled from the plate) mixed into white by `mix` (0 white, 1 the
 * wall) — "subtle" is that strength.
 * ⚠ SHADOWS: one 4096 map over a 4.4 m square centred on the four cards (~1 mm a texel), so a 3 mm-deep letter can
 * leave a shadow on its face. The scene is `frameloop="demand"` and nothing here moves, so it renders on change only.
 * Faders: `?take=0` off · `?takeoff=` · `?takeaz=` · `?takei=` · `?takehue=` · `?takemix=`.
 */
type TakeSettings = { on: boolean; offDeg: number; azDeg: number; intensity: number; hue: string; mix: number };
function takeSettings(): TakeSettings {
  return {
    on: neonParam("take") !== "0",
    offDeg: neonNumber("takeoff", 50, 0, 89),
    azDeg: neonNumber("takeaz", 135, -360, 360),
    intensity: neonNumber("takei", 2, 0, 50),
    hue: neonHex("#ff6528", "takehue"),
    mix: neonNumber("takemix", 0.25, 0, 1),
  };
}
function TakeLight({ s }: { s: TakeSettings }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const scene = useThree((st) => st.scene);
  const invalidate = useThree((st) => st.invalidate);
  const target = useMemo(() => new THREE.Object3D(), []);
  const { centre, position, color } = useMemo(() => {
    const ps = (["CA", "CB", "CS", "CD"] as const).map((id) => roomCardPlacement(ROOM_CARDS[id]).position);
    const c = [0, 1, 2].map((i) => ps.reduce((a, p) => a + p[i], 0) / ps.length);
    const off = (s.offDeg * Math.PI) / 180;
    const az = (s.azDeg * Math.PI) / 180;
    const N = ROOM_INTO_WALL.map((v) => -v);
    const d = [0, 1, 2].map(
      (i) => Math.sin(off) * Math.cos(az) * ROOM_BACK_DIR[i] + Math.sin(off) * Math.sin(az) * ROOM_UP[i] + Math.cos(off) * N[i],
    );
    const col = new THREE.Color("#ffffff").lerp(new THREE.Color(s.hue), s.mix);
    return {
      centre: c as [number, number, number],
      position: [0, 1, 2].map((i) => c[i] + d[i] * 8) as [number, number, number],
      color: col,
    };
  }, [s]);
  useEffect(() => {
    const l = ref.current;
    if (!l) return;
    target.position.set(...centre);
    scene.add(target);
    l.target = target;
    const cam = l.shadow.camera;
    cam.left = -2.2;
    cam.right = 2.2;
    cam.top = 2.2;
    cam.bottom = -2.2;
    cam.near = 0.5;
    cam.far = 16;
    cam.updateProjectionMatrix();
    invalidate();
    return () => {
      scene.remove(target);
    };
  }, [centre, scene, target, invalidate]);
  return (
    <directionalLight
      ref={ref}
      position={position}
      color={color}
      intensity={s.intensity}
      castShadow
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-bias={-0.0001}
      shadow-normalBias={0.0005}
    />
  );
}

/**
 * ⛔ THE DESK MARK, A STILL TAKE IN THE ROOM — D-088, 8 October 2026. First ONLY WITH `?mark=1`;
 * ON PLAIN `/about` since session 2 the same day (Carl: *"i need to see the logo in localhost:3000/about#roles"*; `?mark=0` hides it).
 * Carl: *"put the logo in the scene purpendicular to the right side angle of the desk"*; *"Behind ?mark=1 on /about"*.
 * Take 2, the same day: turned 90° to face the camera, centred across the desk's depth, in front of the mic clamp.
 * Take 3: its face 65 mm from the desk's end, so a tip onto its face carries it off the desk. Placement: `DESK_MARK`,
 * `about-room.ts`. Pass 1's approved shape (R-034) in pass 2's gold (R-035).
 *
 * ⛔⛔ ITS LIGHT — THE FIRST LIGHTS CHUNK (Carl, 8 October): *"Light it on the desk first and enable shadows. Then stop."*
 *   - **THE BENCH'S STUDIO, ON THIS MATERIAL ONLY** (`buildLogoStudioEnv`, `LOGO_JUDGING_STUDIO`) — *"i like the oblique
 *     lighting that was on the proto bench"*. Turned with the mark's yaw, so it stands to the mark as on the bench.
 *     A reflection environment: it follows the mark's POSITION and keeps its orientation — Carl: *"The light trajectory
 *     can be vertical, the logos geometry will do all the work for us"*.
 *   - **STUDIO ONLY** (Carl's choice): the room's take light and env map are kept off it (`environmentOnly`, and its own
 *     `envMap` overrides `scene.environment`). Measured before this: the take light was ALL of its light, the room's map
 *     none (D-088, 8 October).
 *   - **ITS SHADOW** — a SHADOW-ONLY light (intensity 0: it lights nothing, the cards included) from the studio's TOP
 *     softbox, inside the mark's group so it travels with it; its shadow camera sees ONLY `DESK_MARK_LAYER`, and the mark
 *     is ONLY on that layer (plus the main camera's), so the take light's shadow map never holds the mark — one shadow,
 *     not two. Received by an invisible CATCHER (`ShadowMaterial`) cut to the measured desk top.
 * ⚠ Shadows render only while the canvas has them on — the extruded text's switch (`?extrude=0` turns them off).
 * ⚠ What this is NOT: no fall, no scroll, no crossing (R-036, on the bench); not on the bloom's neon layer.
 * ⚠ It lives in THIS canvas for the take. Route 1 (one canvas for the whole journey into §3) is still a structure to
 * design and review (D-088, 3 October) — this does not decide it.
 * ⚠ The geometry build and the studio's PMREM are synchronous, so they run in an effect after mount.
 */
const DESK_MARK_LAYER = 12;
/**
 * ⚠ A/B SWITCH for Carl's eye (8 October 2026: *"i will flip batween the 2 to see thw difference"*): `?marklight=room`
 * restores the take BEFORE the lights chunk exactly — the plain gold lit by the room (take light + `scene.environment`),
 * no shadow. Absent → the studio and the shadow.
 */
function deskMarkRoomLight(): boolean {
  return neonParam("marklight") === "room";
}
/**
 * ⚠ THE SHADOW'S A/B, IN THE SAME LIGHT — Carl, 8 October 2026: *"i nned to see them both in the same lighting, how can
 * i judge the shadows under different conditions?"* (`?marklight=room` changed the light AND the shadow at once).
 * `?markshadow=0` keeps the studio light and removes only the shadow.
 */
function deskMarkShadowOn(): boolean {
  return neonParam("markshadow") !== "0" && !deskMarkRoomLight();
}
/** ⚠ STARTING VALUES for Carl's eye: how dark the shadow lies on the desk, and the shadow map over a 0.8 m square. */
const DESK_MARK_SHADOW_OPACITY = 0.45;
const DESK_MARK_SHADOW_MAP = 1024;
const DESK_MARK_SHADOW_HALF_M = 0.4;
/** ⚠ STARTING VALUES for Carl's eye (faders: `?marktop=`, `?markstrip=`, `?markao=`): the strip's shadow strength, and
 *  how dark the contact shadow is at its darkest. */
const DESK_MARK_STRIP_SHADOW = 0.6;
/**
 * ⛔ THE STUDIO'S STRENGTH ON THE MARK IN THE ROOM — the gold's `envMapIntensity` (the bench keeps 1). Carl, 8 October
 * 2026: *"For me the logo looks a little too bright can you try lowering the lights intensity first."* At 1 the mark's
 * pixels averaged 155 of 255 in the room (measured). ⚠ A starting value for Carl's eye; fader `?markenv=` (0–2).
 */
const DESK_MARK_STUDIO_INTENSITY = 0.7;
const DESK_MARK_CONTACT_OPACITY = 0.5;
/** The shadow light's distance from the mark, metres — a directional light; only its direction matters. */
const DESK_MARK_SHADOW_LIGHT_M = 1.5;

/**
 * ⛔ A SHADOW-ONLY LIGHT THAT TRAVELS WITH THE MARK — intensity 0, so it lights nothing (the cards included); its shadow
 * camera sees ONLY `DESK_MARK_LAYER`, so it shadows only the mark. `dir` points from the mark toward the light (world
 * axes); `strength` is the shadow's own intensity (`LightShadow.intensity`, 0–1); a smaller `mapSize` over the same
 * frustum gives a softer edge. Mounted inside the mark's group, aimed at the mark's centre.
 */
function MarkShadowLight({ dir, centreY, strength, mapSize }: { dir: THREE.Vector3; centreY: number; strength: number; mapSize: number }) {
  const invalidate = useThree((st) => st.invalidate);
  const light = useRef<THREE.DirectionalLight>(null);
  const aim = useRef<THREE.Object3D>(null);
  const position = useMemo(
    () => dir.clone().normalize().multiplyScalar(DESK_MARK_SHADOW_LIGHT_M).add(new THREE.Vector3(0, centreY, 0)).toArray() as [number, number, number],
    [dir, centreY],
  );
  useEffect(() => {
    const l = light.current, t = aim.current;
    if (!l || !t) return;
    l.target = t;
    l.shadow.intensity = strength;
    const c = l.shadow.camera;
    c.layers.set(DESK_MARK_LAYER);
    c.left = -DESK_MARK_SHADOW_HALF_M;
    c.right = DESK_MARK_SHADOW_HALF_M;
    c.top = DESK_MARK_SHADOW_HALF_M;
    c.bottom = -DESK_MARK_SHADOW_HALF_M;
    c.near = 0.1;
    c.far = DESK_MARK_SHADOW_LIGHT_M * 2;
    c.updateProjectionMatrix();
    invalidate();
  }, [strength, invalidate]);
  return (
    <>
      <object3D ref={aim} position={[0, centreY, 0]} />
      <directionalLight
        ref={light}
        position={position}
        intensity={0}
        castShadow
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-bias={-0.0005}
        shadow-normalBias={0.002}
      />
    </>
  );
}

/**
 * ⛔ THE CONTACT SHADOW — where the metal meets the wood. Carl, 8 October 2026: *"What would really sell it is if there
 * even subtler shadows on the desk at the bottom of the logo… Seeing some shadows where yhe logo meets the desk would add
 * more realism."* Every light in the room is partly blocked close to the base, so the wood darkens there and recovers
 * within a centimetre or two — whatever the lights' directions. BAKED from the mark's own geometry: each vertex within
 * `DESK_MARK_CONTACT_REACH_M` of the desk darkens the desk under it by (1 − height/reach)², then blurred and normalised.
 * A still take — the mark AT REST; ⚠ the tip must fade it (a later chunk). In the mark's frame (x along the letters,
 * z back → face), so it is a child of the mark's rotation.
 */
const DESK_MARK_CONTACT_REACH_M = 0.02;
const DESK_MARK_CONTACT_BLUR_M = 0.006;
const DESK_MARK_CONTACT_MARGIN_M = 0.03;
function buildContactShadow(geometry: THREE.BufferGeometry): { texture: THREE.CanvasTexture; width: number; depth: number; centreZ: number } {
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
  const bb = new THREE.Box3().setFromBufferAttribute(pos);
  const M = DESK_MARK_CONTACT_MARGIN_M, PX = 2000; // px per metre — 0.5 mm
  const x0 = bb.min.x - M, z0 = bb.min.z - M, w = bb.max.x - bb.min.x + 2 * M, d = bb.max.z - bb.min.z + 2 * M;
  const W = Math.ceil(w * PX), H = Math.ceil(d * PX);
  const acc = document.createElement("canvas");
  acc.width = W;
  acc.height = H;
  const g = acc.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#fff";
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) - bb.min.y;
    if (y > DESK_MARK_CONTACT_REACH_M) continue;
    g.globalAlpha = 0.06 * (1 - y / DESK_MARK_CONTACT_REACH_M) ** 2;
    g.fillRect((pos.getX(i) - x0) * PX - 1, (pos.getZ(i) - z0) * PX - 1, 2, 2);
  }
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const o = out.getContext("2d")!;
  o.filter = `blur(${DESK_MARK_CONTACT_BLUR_M * PX}px)`;
  o.drawImage(acc, 0, 0);
  // normalise: the darkest point is full strength; the material's `opacity` then sets how dark that is
  const img = o.getImageData(0, 0, W, H);
  let peak = 1;
  for (let i = 1; i < img.data.length; i += 4) peak = Math.max(peak, img.data[i]);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.min(255, Math.round((img.data[i + 1] * 255) / peak));
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
  }
  o.putImageData(img, 0, 0);
  return { texture: new THREE.CanvasTexture(out), width: w, depth: d, centreZ: z0 + d / 2 };
}

/**
 * ⛔ THE FALL, STAGE 1 — THE TIP ONTO ITS FACE (Carl, 8 October 2026): *"We can move on to the fall. lets do this in
 * stages. No link to the scroll yet. have it fall on its face, We will suspend gravity for the moment."*
 *   - It TIPS FORWARD 90° about its FRONT-BOTTOM EDGE (the bounding box's, z = depth, y = 0 — the chamfered lip is a few
 *     mm behind it, so the lip lifts a hair as it starts; the face lands flat on the desk) and LIES FACE DOWN.
 *   - ⚠ "GRAVITY SUSPENDED": no simulation, and it does NOT go on over the edge — at 65 mm from the end its centre of
 *     mass lies past the edge face down (take 3's reckoning), so a real one would carry on. That is the next stage.
 *   - The angle follows an ACCELERATING curve, θ = 90° · p² — slow off the vertical, fastest at landing, the shape of a
 *     topple without its physics. `DESK_MARK_TIP_MS` is a starting value.
 *   - No scroll: a LOOP for Carl's eye — upright, hold, tip, hold face down, back up (the reverse of the same curve).
 *     `?marktip=0..1` holds it still at that point of the tip (for frames); `?marktipms=` sets the tip's length.
 *   - The CONTACT shadow is the mark at rest: it fades over the first quarter of the tip. ⚠ A face-down contact shadow
 *     is not built. The cast shadows follow the mark by themselves (the shadow lights render it every frame).
 * ⚠ Calls `invalidate()` every frame while a loop PLAYS (`?markloop=1`, `?markplay=somersault`, `?cornerloop=1`), so it runs with
 * `frameloop="demand"`. The default (the journey STILL and upright, since 10 October) and the corner pose ask for no frames. (Was "take 3's start, still"; before that "while mounted, `?mark=1` only".)
 */
const DESK_MARK_TIP_MS = 1200;
const DESK_MARK_TIP_HOLD_MS = 1500;
/**
 * ⛔ THE FALL, STAGE 2 — PLAYED FROM THE SIMULATION (`DESK_MARK_FALL`, `about-room.ts`): straight on from the tip, over
 * the desk's end and down, STRIKING THE BIN'S RIM and turning onto its BACK ACROSS IT, and holding there — Carl:
 * *"i mmed to see it happrn"*, *"Outstanding. The speed is good."*, *"continue so that the flat back is on the rim. then
 * stop, we need to see how much hangs over the edge of the bons rim"*. (Stage 2 first stopped 20 ms before the strike.)
 * ⛔ IT PLAYS IN REAL TIME — `DESK_MARK_FALL_SPEED` 1: face down to the rest on the rim in ~0.49 s, as gravity times it.
 * Carl: *"if its at a quarter of the speed put it at full speed. i said nothing originally about the speed it should
 * fall."* The first take played at 0.25 — the Builder's viewing choice, never asked for. The scroll will drive it later.
 * Faders: `?markfallspeed=` (0.05–1), `?markfall=0..1` holds a point of the fall (0 face down … 1 where the fall ENDS — on its
 * back across the rim by default, just before the strike with `?markfallto=bin`),
 * `?marktip=0..1` a point of the tip.
 * ⚠ The tip (stage 1) is still "gravity suspended" (θ = 90° · p²); the fall starts from rest face down, as simulated.
 */
const DESK_MARK_FALL_SPEED = 1;
/**
 * ⛔ WHERE THE FALL STOPS — JUST BEFORE THE BIN (Carl, 8 October 2026, session 2: *"the face plant was good, the teeter
 * fantastic and the fall. i want you to recreate them but stop the fall just before it hits the bin. move it 50mm left"*).
 * 20 ms before the strike (`DESK_MARK_FALL.contactMs` — 347.6 at 50 mm left, re-simulated), as stage 2 first stopped.
 * ⛔ SUPERSEDED AS THE DEFAULT the same session: *"make it now so the flat back sits on the rim and stop.. i want to see how
 * much of the logos left side is hanging over the rim."* → the fall plays on to its REST ACROSS THE RIM
 * (`DESK_MARK_FALL.restMs`); `?markfallto=bin` still stops before the strike.
 */
const DESK_MARK_FALL_STOP_MS = DESK_MARK_FALL.contactMs - 20;
const DESK_MARK_FALL_HOLD_MS = 2500;
/** A pose of the mark: its centre of mass relative to the mark's rest origin (yaw frame — x along the letters / the
 *  back wall, y up, z toward the camera; metres) and its orientation. */
type MarkPose = { x: number; y: number; z: number; q: THREE.Quaternion };
const X_AXIS = new THREE.Vector3(1, 0, 0);
/** The 2D fall's state at `ms` after face down, interpolated from the simulation's rows (an angle about the letters). */
function fallRow(ms: number): [number, number, number] {
  const R = DESK_MARK_FALL.rows;
  let i = 0;
  while (i < R.length - 2 && R[i + 1][0] < ms) i++;
  const a = R[i], b = R[i + 1];
  const k = Math.min(1, Math.max(0, (ms - a[0]) / (b[0] - a[0] || 1)));
  const lerp = (j: number) => a[j] + (b[j] - a[j]) * k;
  return [lerp(1), lerp(2), lerp(3)]; // off mm, up mm, theta rad
}
function fallPose(ms: number, originOffMm: number, xc: number): MarkPose {
  const [off, up, th] = fallRow(ms);
  return {
    x: xc, y: (up - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT, z: (off - originOffMm) / ROOM_MM_PER_UNIT,
    q: new THREE.Quaternion().setFromAxisAngle(X_AXIS, th),
  };
}
/**
 * ⛔ THE FLIP OFF THE RIM — CREATIVE LICENCE, BUILT ON CARL'S WORD (8 October 2026, session 2): *"no growth yet. lets sort
 * out the movement. It needs to flip and face us. lets stop there. You can take some licence. it could flip to ba a little
 * higher than it is now. Im eventually going to slow it down. In demonstrating our capability as web designers it looking
 * good is more important than sticking rigidly to the laws of physics."*
 *   - UP TO THE SLAP: the simulated fall, unchanged (`DESK_MARK_FALL`, 85 mm left) — the strike on the rim (`contactMs`,
 *     upside down, back to us), then its turn about the strike point until the FLAT BACK SLAPS DOWN ACROSS THE RIM
 *     (`restMs`, θ 270°, face up).
 *   - ⛔ THE REBOUND COMES FROM THAT SLAP. Carl, on the first take (which kicked it up at the first touch): *"its got to hit
 *     the bin first, then the rise rebound. Its hitting the biv that makes it rise."* The first touch is one instant of an
 *     upside-down mark and does not read as a hit; the flat back meeting the rim does.
 *   - THE LICENCE: the slap KICKS it up, a little LEFT (the left weight and the curved rim both push that way, at this
 *     start) and a little toward the camera (clear of the desk's end).
 *   - THEN A REAL FLIGHT: the centre of mass on a gravity parabola (9.81 m/s²) up to TAKE 1's END — `riseMm` above the
 *     STRIKE's centre of mass (so ~290 mm above the slap's), `leftMm` left, `outMm` out from the strike —
 *     constant sideways speed, constant spin — the SOMERSAULT FINISHED (θ 270° on to 360°, the same way round: a quarter
 *     turn) WITH A TWIST (yaw 0 → `psiEnd`, the face aimed at the camera's position — OBLIQUE on screen). It arrives
 *     upright and facing us AT THE TOP OF THE RISE, and the take STOPS there (Carl: "lets stop there") — the one point of
 *     a flight where stopping reads as natural.
 *   - The spin follows from the rise: higher = longer in the air = slower turn. ~243 ms aloft, ~370°/s.
 * ⚠ STARTING VALUES, the Builder's: rise 200, left 150, out 100 mm. Faders `?fliprise=` `?flipleft=` `?flipout=` (mm).
 */
/**
 * ⛔ THE BOUNCE IS SLOWED — Carl, the same session: *"yes, but the bounce off the bin is too fast. slow it down"*. The
 * flight from the slap plays at `speed` of real time (the fall before it stays real time). ⚠ 0.5 is the Builder's starting
 * value — his earlier pick for stage 4's take, and inside his *"somewhere between"* ¼ and real time. Fader `?flipspeed=`.
 */
const DESK_MARK_FLIP = { riseMm: 200, leftMm: 150, outMm: 100, speed: 0.5 };
/**
 * ⛔ THE SECOND FLIP, LOSING MOMENTUM, ENDING FACE-ON — Carl, the same session, on the slowed bounce: *"Much better. It
 * looks to me as if its slightly leaning forward. Perfect. We can get another flip forward out of it, but slower, it will
 * be losing momentum. When its complete, then it can be face on."*
 *   - From the top of the rise (upright, oblique — kept as it was, "Perfect") it carries on FORWARD one more full turn,
 *     starting at the first flip's own spin and SLOWING EVENLY TO A STOP (constant deceleration — so its length follows
 *     from that spin: twice the time the same turn would take at full speed, ~3.9 s at the bounce's half speed).
 *   - Over the same turn the TWIST carries on from the oblique aim toward FACE-ON — the face parallel to the screen
 *     (against the camera's viewing direction) — complete exactly as the flip completes. ⚰️ First take: all the way to
 *     face-on; now HALFWAY (`faceShare`, below).
 *   - Its drift (left, toward the camera) carries on from the flight's speed and slows evenly to a stop with the flip
 *     (`driftMs`, below) — so nothing stops dead at the top of the rise. Height held (licence).
 * `?flip2=0` ends at the top of the rise, as before; `?flip2drift=` (ms; 0 = the whole flip).
 */
/**
 * ⛔ HALFWAY TO FACE-ON, NOT FACE-ON — Carl, on seeing it end face-on: *"it doesnt look right being face on. make the angle
 * from its oblique position to halfway what it would be to its face on position when the flip is complete so it would
 * look less oblique"*. The twist ends at `faceShare` of the way from the oblique aim to face-on. Fader `?flip2face=` (0–1).
 */
/**
 * ⛔ THE DRIFT LASTS THE WHOLE SECOND FLIP — Carl: *"when it comes off the bin it appears to be travelling left but seems
 * hovvering when the second flip happens. it should still travel left but wuth less momentum"*. `driftMs` 0 = the drift
 * slows evenly over the WHOLE second flip and stops as it completes (⚰️ was 600 ms — it stopped early and the mark hung).
 */
/**
 * ⛔ LEGATO — THE BOUNCE AND THE TWO FLIPS ARE ONE MOVEMENT (Carl, 8 October 2026, session 2: *"theres just the speed as it
 * bounces off the bin its seems to be faster and out of proportion to the flips. i accept that its momentum will be greater
 * but the bounce and flips should be smoother as a whole movement. If this was music i would say "legato""*).
 * The first build was two pieces joined at the top of the rise: a gravity flight (~0.5 s carrying the whole rise, a
 * quarter turn, ~40° of twist) then an evenly decelerating flip (~4 s). The spin matched at the join; the TWIST and the
 * RISE changed pace there, and the burst read as out of proportion.
 * ⛔ NOW ONE PROGRESS e(u) = 1 − (1 − u)^`curve` over the whole rebound (u: time from the slap to the end of the second
 * flip, the same total length), and EVERY channel rides it: the spin (θ from the slap's 270° on 1¼ turns), the rise
 * (topping out when it first comes upright), the drift (left, out), the twist (a smooth curve through the approved poses).
 * ✔ THE APPROVED POSES ARE KEPT: at the top of the rise it is upright, oblique ("Perfect"), at the same place; at the end,
 * halfway to face-on, at the same place.
 * ⚠ `curve` 1.5 is the Builder's: 2 is an EVEN deceleration (front-loads the burst again), 1 a constant speed (no loss
 * of momentum); 1.5 still loses speed to a stop, more evenly. Fader `?flipcurve=` (1–3).
 */
const DESK_MARK_FLIP2 = { driftMs: 0, faceShare: 0.5, curve: 1.5 };
/**
 * ⛔ §3 — THE DROP ONTO THE BLUE LOGO, AND THE WIPE AT THE PLAYER'S BORDER (Carl, 8 October 2026, session 2: *"its just to
 * the right of the blue logo with less momentum carrying it left Perfect. From here it can fall down onto the blue logo.
 * So it on its way to cover it. Only when it meets the white rectangle a wipe will happen at the border as if to
 * dissappear into the viewer. What happens after this will be in a later session."* — *"You are authorised to work in
 * Sect. 3"*; the scroll link: *"There are 2 ways we can tie the scroll to this we will discuss at the end."*).
 *   - From the second flip's end (at rest — no spin, no drift left) it FALLS FROM REST under gravity, straight down the
 *     page to the blue logo's centre (`#examples-player-target`), measured where §3 sits once the stage stops pinning —
 *     the canvas runs one screen past the stage (`RoomStage`, `AboutCardCanvas`). Its orientation is held.
 *   - The 3D point is the logo's screen centre at the mark's own depth from the camera, so its SIZE does not change
 *     (Carl: "no growth yet").
 *   - THE WIPE: a clipping plane through the camera and the white rectangle's TOP EDGE (`#examples-player`): whatever
 *     passes below that line on screen is not drawn — it disappears into the viewer at the border.
 *   - TIME-DRIVEN for now (the loop, `?markloop=1` since 10 October; still by default), at `speed` of real time — the bounce's. ⚠ So it only lands on the logo on screen
 *     when the reader has scrolled to where the stage stops; above that the extension is off-screen below the window.
 */
const DESK_MARK_DROP = { speed: 0.5 };
/**
 * ⛔ SNAIL'S PACE — Carl, 8 October 2026, session 2: *"Slow the animation down to snails pace, i want to see whats
 * happening."* One MASTER speed over the whole motion — the tip, the fall, the bounce, the second flip and the drop —
 * multiplying their own speeds, so their proportions are kept; the holds (upright before, at the end) keep their length.
 * ⚠ 0.1 (a tenth) was the Builder's figure for "snail's pace": the ~350 ms fall to the bin took ~3.5 s; the whole loop
 * ~80 s. A VIEWING speed, not a design value. ⛔ BACK TO 1 the same session — Carl, after the growth: *"Put it at the
 * speed you had it"*, then *"slow it down by 10%"* → 0.9 (every part 10% slower; the loop ~11 s → ~12 s).
 * `?markslow=0.1` is snail's pace again. Fader `?markslow=` (0.02–1).
 */
const DESK_MARK_SLOW = 0.9;
/**
 * ⛔ THE MARK IS LIT ON CARD ONE's STRIKE — HOWEVER §2 IS REACHED. Carl, 10 October 2026, in steps the same session:
 * *"Lets deal with pressing roles. The logo should be on the desk and fade in."* → *"Timing is good, as is mirroring the
 * /start time. Now if a user scrolls to Sect 2 it should also fade in and it should be linked to when the cards are
 * activated.. So both ways of getting to Sect 2 the arrival of the logo is the same"* → with the fade on a scroll leaving
 * the desk EMPTY under the wipe until CA struck, the Builder proposed lighting it instead of fading it, and Carl: *"Sounds
 * good. A light is being shone on the team by the info dump and also the logo. Proceed."* — then: *"Dont make the light
 * suddenly come on. have it fade in and be brought up tho its intemsity."*
 *   - ALWAYS ON THE DESK, UNLIT (`DESK_MARK_UNLIT` of its light) until CA strikes, then BROUGHT UP to its full light over
 *     `DESK_MARK_LIGHT_MS` on a smootherstep — a dimmer, never a switch: it leaves unlit and arrives at full with zero
 *     slope. The room's light coming on and the mark with it (§14a: caused by the world).
 *   - ONE CLOCK: the §2 SEQUENCE's (`sequenceRef`) — NeonBloom sets it on the frame CA ignites; the cards' text reads the
 *     same number. Roles and the scroll differ only in what fires the strike (`roomWipeClearsCA`); the mark cannot tell.
 *   - WHAT COMES WITH THE LIGHT: the studio's light on the mark (its environment, `crossing.light`) and its two CAST
 *     shadows (that light's shadows — the catcher is brought up from none on the same curve). ⛔ The CONTACT shadow stays
 *     from the start: it is the object sitting on the desk, not the light.
 *   - ⚰️ SUPERSEDED THE SAME DAY: an opacity FADE (first on a wipe-jump test, then on the strike) — the logo absent until
 *     it faded in. The mark was transparent from birth for it; it is opaque again.
 *   - With no sequence clock (`?neon=none`, the text off) the mark is simply lit, as before. ⚠ `?reignite=` restarts the
 *     clock on every replay, so the mark is lit again with each — a tuning tool's side effect. ⚠ `?marklight=room` (the
 *     A/B before the studio) is not dimmed — it has no studio light to bring up.
 *   - /start's pace (1.015 s, R-036's reference). ✔ Carl, of the fade's timing: *"Timing is good, as is mirroring the
 *     /start time."* Faders `?marklit=` (ms; 0 = at once), `?markunlit=` (0–1, the unlit share).
 */
const DESK_MARK_LIGHT_MS = 1015;
/** The share of its light the mark has BEFORE the strike — a TAKE (10 October 2026); `?markunlit=`. */
const DESK_MARK_UNLIT = 0.1;
/**
 * ⛔ THE CROSSING IN THE ROOM — gold → platinum blue (R-036's outside-in sphere about `logoMarkCentre()`, the bench's own
 * material and mapping, radius = far − p·(far − near)). Carl, 8 October 2026, session 2: *"The colour transition wipe.
 * Should start as its coming out of the face plant and end as its reaching the end of its 2nd flip"*. So p runs 0 → 1
 * from FACE-DOWN (the fall's 0 ms: the teeter begins) to the END OF THE SECOND FLIP, and holds 1 (blue) through the drop.
 * ⚠ LINEAR IN TIME — the Builder's choice, the plainest: with the bounce and the second flip slowed, ~80% of the
 * crossing happens during the second flip (the fall to the slap is ~10% of the time). Gold before face-down.
 */
/**
 * ⛔ THE MORE BLUE, THE MORE LIGHT — Carl, the same session, on the crossing in slow motion: *"the transition look great,
 * even in slo mo. But, when nearly full blue is attained its a bit dark. could the light be slowly modified to be a little
 * brighter as the transition happens"* → *"yes, but make it gradual. the more blue, the more loght e need"*.
 * The studio's strength (`envMapIntensity`, the mark's only light) rises from `DESK_MARK_STUDIO_INTENSITY` (0.7, set for
 * the GOLD — "a little too bright" at 1) to `blueMax` IN PROPORTION TO THE SHARE OF THE MARK's SURFACE THAT IS BLUE —
 * measured from its own triangles (area-weighted, by each triangle's distance from the centre), so it follows the blue
 * the eye sees, not the radius. ⚠ 1.0 is the blue's own bench value (R-035, "great"); a starting value. `?markenvblue=`.
 * Why it reads dark: platinum blue reflects less than gold, so under one studio it is the darker metal.
 */
const DESK_MARK_BLUE_STUDIO_INTENSITY = 1.0;
/** The blue share of the mark's surface at each sphere radius — triangles sorted by centroid distance, areas summed. */
function blueShareByRadius(g: THREE.BufferGeometry, centre: readonly [number, number, number]) {
  const P = g.getAttribute("position") as THREE.BufferAttribute;
  const ix = g.getIndex();
  const n = ix ? ix.count : P.count;
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  const tri = new THREE.Triangle(A, B, C);
  const c = new THREE.Vector3(...centre);
  const rows: [number, number][] = [];
  let total = 0;
  for (let t = 0; t < n; t += 3) {
    const at = (k: number) => (ix ? ix.getX(t + k) : t + k);
    A.fromBufferAttribute(P, at(0));
    B.fromBufferAttribute(P, at(1));
    C.fromBufferAttribute(P, at(2));
    const area = tri.getArea();
    total += area;
    rows.push([tri.getMidpoint(new THREE.Vector3()).distanceTo(c), area]);
  }
  rows.sort((a, b) => a[0] - b[0]);
  // cumulative area from the outside in: outside[i] = area of triangles at distance >= rows[i][0]
  const d = rows.map((r) => r[0]);
  const outside = new Float64Array(rows.length + 1);
  for (let i = rows.length - 1; i >= 0; i--) outside[i] = outside[i + 1] + rows[i][1];
  return (radius: number) => {
    let lo = 0, hi = d.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (d[m] <= radius) lo = m + 1; else hi = m; }
    return total > 0 ? outside[lo] / total : 0;
  };
}
function deskMarkCrossingP(fallMs: number, flipDoneMs: number) {
  return Math.min(1, Math.max(0, fallMs / Math.max(1, flipDoneMs)));
}
type DropSpec = { from: MarkPose; to: THREE.Vector3; ms: number; growTo: number };
/**
 * ⛔ THE GROWTH — THE BIN's BLOW TRIGGERS IT (Carl, 8 October 2026, session 2: *"Now for the growth. The contact with the
 * bin triggers the growth, like a blow on the head. the target is in the player logo."*).
 *   - It STARTS AT THE STRIKE (`DESK_MARK_FALL.contactMs`, the first touch of the rim) and reaches its full size as the
 *     drop ARRIVES at the blue logo — `growTo`, measured: the logo's ink height on the page over the mark's own height
 *     on screen where the drop ends (same depth, so the size on arrival IS the logo's).
 *   - EASE-OUT (fast at the blow, slowing — a bump swelling) — ⚠ the Builder's curve, stated: 1 − (1 − t)².
 *   - About the CENTRE OF MASS (`body` sits there; the lights ride it).
 * ⚠ NOT PHYSICAL, AND IT SHOWS IN CONTACT: the fall onto the rim was simulated at life size, so from the strike to the slap
 * (~140 ms) a growing mark passes INTO the rim. `?markgrow=0` keeps it life-size.
 */
function growAt(ms: number, endMs: number, growTo: number) {
  if (ms <= DESK_MARK_FALL.contactMs) return 1;
  const t = Math.min(1, (ms - DESK_MARK_FALL.contactMs) / Math.max(1, endMs - DESK_MARK_FALL.contactMs));
  return 1 + (growTo - 1) * (1 - (1 - t) ** 2);
}
function dropPose(ms: number, d: DropSpec): MarkPose {
  const u = Math.min(1, Math.max(0, ms / d.ms)) ** 2; // from rest under gravity: distance grows with the square of time
  return {
    x: d.from.x + (d.to.x - d.from.x) * u,
    y: d.from.y + (d.to.y - d.from.y) * u,
    z: d.from.z + (d.to.z - d.from.z) * u,
    q: d.from.q,
  };
}
/** The flip starts at the slap — the flat back down across the rim. */
const DESK_MARK_FLIP_FROM_MS = DESK_MARK_FALL.restMs;
type FlipSpec = { riseMm: number; leftMm: number; outMm: number; speed: number; psiEnd: number; second: { on: boolean; driftMs: number; faceShare: number; curve: number; psiFace: number } };
const Y_AXIS = new THREE.Vector3(0, 1, 0);
/** The flip's time aloft, ms: a gravity parabola rising `riseMm` takes √(2h/g) to its top. */
function flipMs(riseMm: number) {
  return 1000 * Math.sqrt((2 * Math.max(1, riseMm)) / 9810);
}
/** Where the flip ends — the centre of mass at the top of the rise, in the mark's yaw frame (units). ⛔ Measured from the
 *  STRIKE (`contactMs`), as take 1 was — Carl: *"The first position you had it was best, that combined with striking the
 *  bin."* The flight to it starts at the slap (`DESK_MARK_FLIP_FROM_MS`), lower, so it rises further than `riseMm`. */
function flipEnd(f: { riseMm: number; leftMm: number; outMm: number }, originOffMm: number, xc: number) {
  const [off, up] = fallRow(DESK_MARK_FALL.contactMs);
  return new THREE.Vector3(
    xc - f.leftMm / ROOM_MM_PER_UNIT,
    (up + f.riseMm - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT,
    (off + f.outMm - originOffMm) / ROOM_MM_PER_UNIT,
  );
}
/** The flight from the slap to take 1's end: the rise and the outward step it actually makes (mm). */
function flipFlight(f: { riseMm: number; outMm: number }) {
  const [offS, upS] = fallRow(DESK_MARK_FALL.contactMs);
  const [off0, up0] = fallRow(DESK_MARK_FLIP_FROM_MS);
  return { off0, up0, riseMm: upS + f.riseMm - up0, outMm: offS + f.outMm - off0 };
}
/** The flip's played lengths, ms: the flight (slowed by `speed`), and the second flip (0 when off). */
function flipPlayed(f: FlipSpec) {
  const flight = flipMs(flipFlight(f).riseMm) / f.speed;
  const th0 = fallRow(DESK_MARK_FLIP_FROM_MS)[2];
  // even deceleration from the flight's spin w0 to 0 over a full turn takes 2 · 2π / w0
  const second = f.second.on ? (2 * 2 * Math.PI) / ((2 * Math.PI - th0) / flight) : 0;
  return { flight, second };
}
function flipPose(ms: number, f: FlipSpec, originOffMm: number, xc: number): MarkPose {
  const fl = flipFlight(f);
  const { flight, second } = flipPlayed(f);
  if (second > 0) {
    // ⛔ LEGATO (`DESK_MARK_FLIP2.curve`): the bounce and both flips on ONE progress — see the constant
    const D = flight + second;
    const u = Math.min(1, Math.max(0, ms / D));
    const e = 1 - (1 - u) ** f.second.curve;
    const th0 = fallRow(DESK_MARK_FLIP_FROM_MS)[2];
    const dTh = 2 * Math.PI - th0 + 2 * Math.PI;
    const eTop = (2 * Math.PI - th0) / dTh; // first upright: the top of the rise
    const r = Math.min(1, e / eTop);
    const driftMs = f.second.driftMs > 0 ? f.second.driftMs : second;
    const leftTotal = f.leftMm + ((f.leftMm / flight) * driftMs) / 2;
    const outTotal = fl.outMm + ((fl.outMm / flight) * driftMs) / 2;
    // the twist: one smooth curve ψ(e) = a·e + b·e² through (0, 0), (eTop, psiEnd), (1, the end's)
    const psiF = f.psiEnd + (f.second.psiFace - f.psiEnd) * f.second.faceShare;
    const b = (f.psiEnd - psiF * eTop) / (eTop * eTop - eTop);
    const a = psiF - b;
    const q = new THREE.Quaternion()
      .setFromAxisAngle(Y_AXIS, a * e + b * e * e)
      .multiply(new THREE.Quaternion().setFromAxisAngle(X_AXIS, th0 + dTh * e));
    return {
      x: xc - (leftTotal * e) / ROOM_MM_PER_UNIT,
      y: (fl.up0 + fl.riseMm * (1 - (1 - r) ** 2) - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT,
      z: (fl.off0 + outTotal * e - originOffMm) / ROOM_MM_PER_UNIT,
      q,
    };
  }
  // (the second flip off — `?flip2=0`: the flight alone, ending at the top of the rise)
  const tau = Math.min(1, Math.max(0, ms / flight));
  const th0 = fallRow(DESK_MARK_FLIP_FROM_MS)[2];
  const q = new THREE.Quaternion()
    .setFromAxisAngle(Y_AXIS, f.psiEnd * tau)
    .multiply(new THREE.Quaternion().setFromAxisAngle(X_AXIS, th0 + (2 * Math.PI - th0) * tau));
  return {
    x: xc - (f.leftMm * tau) / ROOM_MM_PER_UNIT,
    y: (fl.up0 + fl.riseMm * (1 - (1 - tau) ** 2) - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT,
    z: (fl.off0 + fl.outMm * tau - originOffMm) / ROOM_MM_PER_UNIT,
    q,
  };
}
/**
 * ⛔ THE SOMERSAULT (Carl, 8 October 2026: *"it needs to be facing us and the right way up… try it and show me"*) — a full
 * 3D rigid-body run from UPRIGHT on the desk (`DESK_MARK_SOMERSAULT`, `about-room.ts`; the script and its search are named
 * there): position and orientation at `ms` after the nudge, interpolated (positions linear, orientation slerp).
 */
function somersaultPose(ms: number, originOffMm: number): MarkPose {
  const R = DESK_MARK_SOMERSAULT.rows;
  let i = 0;
  while (i < R.length - 2 && R[i + 1][0] < ms) i++;
  const a = R[i], b = R[i + 1];
  const k = Math.min(1, Math.max(0, (ms - a[0]) / (b[0] - a[0] || 1)));
  const lerp = (j: number) => a[j] + (b[j] - a[j]) * k;
  const qa = new THREE.Quaternion(a[4], a[5], a[6], a[7]), qb = new THREE.Quaternion(b[4], b[5], b[6], b[7]);
  return {
    x: (lerp(1) - deskMarkOriginUMm(DESK_MARK)) / ROOM_MM_PER_UNIT, // absolute u: the somersault does not slide with `leftMm`
    y: (lerp(2) - DESK_RIGHT_CORNER.topMm) / ROOM_MM_PER_UNIT,
    z: (lerp(3) - originOffMm) / ROOM_MM_PER_UNIT,
    q: qa.slerp(qb, k),
  };
}
const DESK_MARK_SOMERSAULT_SPEED = 0.5;
/**
 * ⛔ THE CORNER — PLACED STEP BY STEP BY CARL (8 October 2026), `?markplay=corner` (the default for part of session 2,
 * then take 3's start was restored). His sketch: the desk's front and end
 * edges meeting at the front-right corner, the mark STANDING between them — *"The bottom edge of the yellow is the bottom
 * of the logo. so its standing upright. from there it must fall face down"* — then *"move it left so it is over the edge
 * then stand it back up agaid and decide its size"*. Step 1: standing on the corner's bisector (`cornerpsi` −45°: 0 faces
 * the end edge, −90 the front edge), its face's front-bottom edge `cornerd` mm in from BOTH edges (102: the closest its
 * base stands on the desk — `live-work/scripts/desk-mark-corner-place-8-october.py`), slid LEFT by `cornerleft` mm
 * (step 2's slider, 0 now), tipping 90° forward onto its face (stage 1's curve, gravity suspended) and holding there.
 * Measured at 102 / 0: face down it hangs 135 mm past the front edge and 139 mm past the end, its centre of mass still
 * 39 mm inside the front edge — it would lie there; > ~40 mm left and the left-side weight takes it over.
 */
const DESK_MARK_SOMERSAULT_END_HOLD_MS = 600;
const DESK_MARK_CORNER = { psiDeg: -45, dMm: 102 };
function cornerPose(p: number, psiDeg: number, dMm: number, leftMm: number, com: [number, number, number], depth: number, originOffMm: number): MarkPose {
  const qY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (psiDeg * Math.PI) / 180);
  const th = (Math.PI / 2) * p * p;
  const q = qY.clone().multiply(new THREE.Quaternion().setFromAxisAngle(X_AXIS, th));
  // the pivot: the face's front-bottom edge at mid-letters, dMm in from the front edge (u) and the end edge (off), slid left
  const pivot = new THREE.Vector3(
    (DESK_RIGHT_CORNER.uMm + dMm - leftMm - deskMarkOriginUMm(DESK_MARK)) / ROOM_MM_PER_UNIT, // absolute: not slid by `leftMm`
    0,
    (DESK_RIGHT_CORNER.offWallMm - dMm - originOffMm) / ROOM_MM_PER_UNIT,
  );
  const c = new THREE.Vector3(com[0], com[1], com[2] - depth).applyQuaternion(q).add(pivot);
  return { x: c.x, y: c.y, z: c.z, q };
}
function MarkMotion({ bodyRef, followRef, contactRef, contactOpacity, catcherRef, tipFixed, fallFixed, tipMs, fallSpeed, fallEndMs, loop, lightUp, flip, drop, crossing, play, corner, com, depth, originOffMm }: {
  bodyRef: React.RefObject<THREE.Group | null>; followRef: React.RefObject<THREE.Group | null>;
  contactRef: React.RefObject<THREE.MeshBasicMaterial | null>; contactOpacity: number;
  /** the desk's cast-shadow catcher — its shadows come with the light (`DESK_MARK_LIGHT_MS`) */
  catcherRef: React.RefObject<THREE.ShadowMaterial | null>;
  tipFixed: number | null; fallFixed: number | null; tipMs: number; fallSpeed: number; fallEndMs: number; loop: boolean;
  /** the light (`DESK_MARK_LIGHT_MS`): the §2 sequence's clock — null until CA strikes — or none (simply lit) */
  lightUp: { at: React.RefObject<number | null> | null; ms: number; unlit: number; catcherOpacity: number };
  flip: FlipSpec | null;
  drop: DropSpec | null;
  crossing: { set: LogoCrossing["set"]; light: (radius: number, lit: number) => void; centre: [number, number, number]; far: number; near: number } | null;
  play: "start" | "fall" | "somersault" | "corner";
  corner: { psi: number; d: number; left: number; loop: boolean };
  com: [number, number, number]; depth: number; originOffMm: number;
}) {
  const clockRef = useRef(0);
  const start = useMemo(
    () =>
      play === "somersault"
        ? somersaultPose(0, originOffMm)
        : play === "corner"
          ? cornerPose(0, corner.psi, corner.d, corner.left, com, depth, originOffMm)
          : { x: com[0], y: com[1], z: com[2], q: new THREE.Quaternion() },
    [play, originOffMm, com, corner, depth],
  );
  useFrame((st, dt) => {
    const [xc, yc, zc] = com;
    const tipPose = (p: number): MarkPose => {
      const th = (Math.PI / 2) * p * p;
      // rotation about the front-bottom edge (y 0, z depth): the centre of mass relative to the rest origin
      return { x: xc, y: yc * Math.cos(th) - (zc - depth) * Math.sin(th), z: depth + yc * Math.sin(th) + (zc - depth) * Math.cos(th), q: new THREE.Quaternion().setFromAxisAngle(X_AXIS, th) };
    };
    let pose: MarkPose;
    let crossP = 0; // the crossing: gold until the fall starts (`deskMarkCrossingP`)
    let grow = 1; // the growth (`growAt`): life-size until the bin's blow
    if (play === "start") {
      // ⛔ TAKE 3, STILL — the first fall's start (the default). `?marktip=` holds a point of the tip; no frames asked for.
      pose = tipPose(tipFixed ?? 0);
    } else if (play === "corner") {
      let p: number;
      // ⛔ STILL AND UPRIGHT by default — Carl, 8 October: "stop the animation and have it stand upright". The tip loop
      // is `?cornerloop=1`; `?marktip=` holds any point of the tip.
      if (tipFixed !== null) p = tipFixed;
      else if (!corner.loop) p = 0;
      else {
        clockRef.current = (clockRef.current + dt * 1000) % (2 * (DESK_MARK_TIP_HOLD_MS + tipMs) + 1000);
        const t = clockRef.current, Hd = DESK_MARK_TIP_HOLD_MS;
        p = t < Hd ? 0 : t < Hd + tipMs ? (t - Hd) / tipMs : t < 2 * Hd + tipMs + 1000 ? 1 : 1 - (t - 2 * Hd - tipMs - 1000) / tipMs;
        st.invalidate();
      }
      pose = cornerPose(p, corner.psi, corner.d, corner.left, com, depth, originOffMm);
    } else if (play === "somersault") {
      const total = DESK_MARK_SOMERSAULT.rows[DESK_MARK_SOMERSAULT.rows.length - 1][0];
      if (fallFixed !== null) pose = somersaultPose(fallFixed * total, originOffMm);
      else {
        const cycle = DESK_MARK_TIP_HOLD_MS + total / fallSpeed + DESK_MARK_SOMERSAULT_END_HOLD_MS;
        clockRef.current = (clockRef.current + dt * 1000) % cycle;
        const t = clockRef.current - DESK_MARK_TIP_HOLD_MS;
        pose = somersaultPose(Math.min(total, Math.max(0, t * fallSpeed)), originOffMm);
        st.invalidate();
      }
    } else {
      // with the flip, the fall runs to the slap onto the rim and the flip carries on from it
      const flipDone = flip ? DESK_MARK_FLIP_FROM_MS + flipPlayed(flip).flight + flipPlayed(flip).second : 0;
      const fallMs = flip ? flipDone + (drop ? drop.ms : 0) : fallEndMs;
      const fallOrFlip = (ms: number) =>
        flip && drop && ms > flipDone
          ? dropPose(ms - flipDone, drop)
          : flip && ms > DESK_MARK_FLIP_FROM_MS
            ? flipPose(ms - DESK_MARK_FLIP_FROM_MS, flip, originOffMm, xc)
            : fallPose(ms, originOffMm, xc);
      const crossAt = (ms: number) => {
        if (flip) crossP = deskMarkCrossingP(ms, flipDone);
        if (flip && drop && drop.growTo !== 1) grow = growAt(ms, fallMs, drop.growTo);
        return ms;
      };
      if (fallFixed !== null) pose = fallOrFlip(crossAt(fallFixed * fallMs));
      else if (tipFixed !== null) pose = tipPose(tipFixed);
      // ⛔ STILL AND UPRIGHT by default — Carl, 10 October 2026: "the logo loop is currently running. Stop it and then we
      // will discuss the scroll behavior." The journey's specs stay built (flip, drop, crossing) for the scroll to drive;
      // the time-driven loop is `?markloop=1`. No frames asked for while still.
      else if (!loop) pose = tipPose(0);
      else {
        const playMs = fallMs / fallSpeed;
        const cycle = DESK_MARK_TIP_HOLD_MS + tipMs + playMs + DESK_MARK_FALL_HOLD_MS;
        clockRef.current = (clockRef.current + dt * 1000) % cycle;
        const t = clockRef.current;
        if (t < DESK_MARK_TIP_HOLD_MS) pose = tipPose(0);
        else if (t < DESK_MARK_TIP_HOLD_MS + tipMs) pose = tipPose((t - DESK_MARK_TIP_HOLD_MS) / tipMs);
        else pose = fallOrFlip(crossAt(Math.min(fallMs, (t - DESK_MARK_TIP_HOLD_MS - tipMs) * fallSpeed)));
        st.invalidate();
      }
    }
    if (bodyRef.current) {
      bodyRef.current.position.set(pose.x, pose.y, pose.z);
      bodyRef.current.quaternion.copy(pose.q);
      bodyRef.current.scale.setScalar(grow);
    }
    if (followRef.current) followRef.current.position.set(pose.x, pose.y, pose.z);
    // ⛔ BROUGHT UP ON CA's STRIKE (`DESK_MARK_LIGHT_MS`): 0 unlit … 1 fully lit, smootherstep — the mark's light and its
    // cast shadows together
    const litAt = lightUp.at ? lightUp.at.current : 0;
    const lt = litAt === null ? 0 : !lightUp.at || lightUp.ms <= 0 ? 1 : Math.min(1, Math.max(0, (performance.now() - litAt) / lightUp.ms));
    const litShare = lt * lt * lt * (lt * (lt * 6 - 15) + 10);
    if (litAt !== null && lt < 1) st.invalidate(); // the strike's own frames start it; this carries it to 1
    if (crossing) {
      const radius = crossing.far - crossP * (crossing.far - crossing.near);
      crossing.set(crossing.centre, radius);
      crossing.light(radius, lightUp.unlit + (1 - lightUp.unlit) * litShare);
    }
    if (catcherRef.current) catcherRef.current.opacity = lightUp.catcherOpacity * litShare;
    // the contact shadow belongs to the mark AT REST in its starting pose: gone once it has turned 22.5° from it
    const turned = pose.q.angleTo(start.q);
    if (contactRef.current) contactRef.current.opacity = contactOpacity * Math.max(0, 1 - 4 * Math.min(1, turned / (Math.PI / 2)));
  });
  return null;
}

/** `clock`: the §2 sequence's (`sequenceRef`) — the mark is lit when it is set (`DESK_MARK_LIGHT_MS`); null = simply lit. */
function DeskMark({ clock }: { clock: SequenceClock | null }) {
  const roomLight = useMemo(() => deskMarkRoomLight(), []);
  const shadowOn = useMemo(() => deskMarkShadowOn(), []);
  const studioIntensity = useMemo(() => neonNumber("markenv", DESK_MARK_STUDIO_INTENSITY, 0, 2), []);
  const blueMax = useMemo(() => neonNumber("markenvblue", DESK_MARK_BLUE_STUDIO_INTENSITY, 0, 3), []);
  const motion = useMemo(() => {
    // ⛔ THE FALL ONTO THE RIM IS THE DEFAULT (Carl, 8 October 2026, session 2 — first stopped before the bin,
    // `?markfallto=bin`), STILL AND UPRIGHT since 10 October (Carl: "Stop it") — `?markloop=1` loops it: upright, hold, the face plant, the teeter, the fall onto its back across the rim, hold. ⚰️ Earlier the same session: the
    // CORNER (`?markplay=corner`), then take 3's start standing still (`?markplay=start`). The somersault run is
    // `?markplay=somersault`.
    const slow = neonNumber("markslow", DESK_MARK_SLOW, 0.02, 1);
    const mp = neonParam("markplay");
    const play: "start" | "fall" | "somersault" | "corner" =
      mp === "start" ? "start" : mp === "somersault" ? "somersault" : mp === "corner" ? "corner" : "fall";
    const fixed = (key: string) => {
      const raw = neonParam(key);
      return raw === null || raw.trim() === "" || !Number.isFinite(Number(raw)) ? null : Math.min(1, Math.max(0, Number(raw)));
    };
    return {
      tipFixed: fixed("marktip"),
      fallFixed: fixed("markfall"),
      // the master speed (`DESK_MARK_SLOW`) scales the tip and everything after face-down; the holds keep their length
      tipMs: neonNumber("marktipms", DESK_MARK_TIP_MS, 100, 10000) / slow,
      fallSpeed: neonNumber("markfallspeed", play === "somersault" ? DESK_MARK_SOMERSAULT_SPEED : DESK_MARK_FALL_SPEED, 0.05, 1) * slow,
      fallEndMs: neonParam("markfallto") === "bin" ? DESK_MARK_FALL_STOP_MS : DESK_MARK_FALL.restMs,
      // the time-driven loop of the journey — OFF by default since 10 October 2026 (Carl: "Stop it"); `?markloop=1` runs it
      loop: neonParam("markloop") === "1",
      // ⛔ THE FLIP IS THE DEFAULT END (8 October, session 2); `?markfallto=rest` / `=bin` give the simulated ends
      flipOn: neonParam("markfallto") !== "rest" && neonParam("markfallto") !== "bin",
      flipBase: {
        riseMm: neonNumber("fliprise", DESK_MARK_FLIP.riseMm, 0, 600),
        leftMm: neonNumber("flipleft", DESK_MARK_FLIP.leftMm, -400, 600),
        outMm: neonNumber("flipout", DESK_MARK_FLIP.outMm, -200, 600),
        speed: neonNumber("flipspeed", DESK_MARK_FLIP.speed, 0.05, 1),
      },
      flip2: {
        on: neonParam("flip2") !== "0",
        driftMs: neonNumber("flip2drift", DESK_MARK_FLIP2.driftMs, 0, 10000),
        faceShare: neonNumber("flip2face", DESK_MARK_FLIP2.faceShare, 0, 1),
        curve: neonNumber("flipcurve", DESK_MARK_FLIP2.curve, 1, 3),
      },
      play,
      corner: {
        psi: neonNumber("cornerpsi", DESK_MARK_CORNER.psiDeg, -90, 0),
        d: neonNumber("cornerd", DESK_MARK_CORNER.dMm, 0, 600),
        left: neonNumber("cornerleft", 0, -300, 300),
        loop: neonParam("cornerloop") === "1",
      },
    };
  }, []);
  const body = useRef<THREE.Group>(null);
  const follow = useRef<THREE.Group>(null);
  const contactMat = useRef<THREE.MeshBasicMaterial>(null);
  const invalidate = useThree((st) => st.invalidate);
  const gl = useThree((st) => st.gl);
  const camera = useThree((st) => st.camera);
  const place = useMemo(() => deskMarkPlacement(DESK_MARK, LOGO_MARK_DEFAULTS.depth), []);
  type Built = {
    geometry: THREE.BufferGeometry; gold: THREE.MeshPhysicalMaterial; env: THREE.WebGLRenderTarget;
    crossing: { set: LogoCrossing["set"]; light: (radius: number, lit: number) => void; centre: [number, number, number]; far: number; near: number };
    contact: ReturnType<typeof buildContactShadow>;
  };
  const [built, setBuilt] = useState<Built | null>(null);
  /** ⛔ THE WIPE's PLANE (§3, below) — on the mark's material from birth; parked far below everything (keeps all) until
   *  a drop is measured. Local clipping is switched on at the canvas's creation. */
  const clip = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6), []);
  useEffect(() => {
    let made: Built | null = null;
    const id = window.setTimeout(() => {
      const geometry = buildLogoMarkGeometry({ ...LOGO_MARK_DEFAULTS, scale: place.scale }).geometry;
      const env = buildLogoStudioEnv(gl, place.rotationY);
      // ⛔ THE CROSSING MATERIAL, not plain gold (R-036): one material, both metals, the sphere choosing per pixel. At
      // p 0 (radius = the furthest surface) it IS the gold — same metalness, roughness and environment — so before the
      // fall nothing changes. `gold` keeps its name: it is the mark's one material.
      const cross = createLogoCrossing(roomLight ? {} : { envMapIntensity: studioIntensity });
      const gold = roomLight ? cross.material : environmentOnly(cross.material);
      if (!roomLight) gold.envMap = env.texture;
      gold.clippingPlanes = [clip];
      const centre = logoMarkCentre({ ...LOGO_MARK_DEFAULTS, scale: place.scale });
      const reach = logoMarkReach(geometry, centre);
      cross.set(centre, reach.far);
      // the more blue, the more light (`DESK_MARK_BLUE_STUDIO_INTENSITY`) — studio only; `?marklight=room` keeps its own.
      // × `lit`: the share of its light it has (`DESK_MARK_LIGHT_MS` — unlit until CA strikes, then brought up)
      const share = blueShareByRadius(geometry, centre);
      const light = roomLight
        ? () => {}
        : (radius: number, lit: number) => { gold.envMapIntensity = lit * (studioIntensity + (blueMax - studioIntensity) * share(radius)); };
      made = { geometry, gold, env, contact: buildContactShadow(geometry), crossing: { set: cross.set, light, centre, ...reach } };
      setBuilt(made);
    }, 0);
    return () => {
      window.clearTimeout(id);
      if (made) {
        made.geometry.dispose();
        made.gold.dispose();
        made.env.dispose();
        made.contact.texture.dispose();
      }
    };
  }, [gl, place, roomLight, studioIntensity, blueMax, clip]);
  // the main camera must see the mark's layer (the neon pass sets its own mask and restores this one)
  useEffect(() => {
    camera.layers.enable(DESK_MARK_LAYER);
    invalidate();
    return () => camera.layers.disable(DESK_MARK_LAYER);
  }, [camera, invalidate]);

  const mesh = useRef<THREE.Mesh>(null);
  useEffect(() => {
    mesh.current?.layers.set(DESK_MARK_LAYER);
    invalidate();
  }, [built, invalidate]);
  /**
   * ⛔ THE TWO SHADOWS' DIRECTIONS (world axes, mark → light). (1) The studio's TOP softbox, turned with the mark — the
   * first lights chunk. (2) THE LED STRIP — toward the strip's nearest measured point (`DESK_LED_STRIP`, its end at
   * 1634 mm off the back wall, 2162 mm up, on the right wall): ~76° up, from the wall side and slightly behind, so its
   * shadow falls steeply, trailing toward the c and toward the camera. ⚠ A long strip is a LINE source; one direction to
   * its near end, with a coarser map for a softer edge, stands in for it.
   */
  const shadowDirs = useMemo(() => {
    // ⚠ IN THE MARK'S (YAW) FRAME — the lights ride a group inside the mark's facing that follows its centre of mass
    // (Carl: the light follows the mark's POSITION only), so a world direction is turned back by the yaw.
    const top = new THREE.Vector3(...LOGO_STUDIO_TOP.position);
    const centre = new THREE.Vector3(...place.position).add(new THREE.Vector3(0, place.scale / 2, 0));
    const strip = new THREE.Vector3(...roomPoint(DESK_LED_STRIP.uMm, DESK_LED_STRIP.upMm, DESK_LED_STRIP.offWallToMm))
      .sub(centre)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), -place.rotationY);
    return { top, strip };
  }, [place]);
  const comM = useMemo(
    () => DESK_MARK_SOMERSAULT.comLocal.map((v) => v * place.scale) as [number, number, number],
    [place],
  );
  const depthM = LOGO_MARK_DEFAULTS.depth * place.scale;
  const startPose = useMemo(
    () => {
      const oo = DESK_RIGHT_CORNER.offWallMm - DESK_MARK.faceInFromEndMm - LOGO_MARK_DEFAULTS.depth * DESK_MARK.heightMm;
      if (motion.play === "somersault") return somersaultPose(0, oo);
      if (motion.play === "corner") return cornerPose(0, motion.corner.psi, motion.corner.d, motion.corner.left, comM, depthM, oo);
      return null;
    },
    [motion.play, motion.corner, comM, depthM],
  );
  const originOffMm = DESK_RIGHT_CORNER.offWallMm - DESK_MARK.faceInFromEndMm - LOGO_MARK_DEFAULTS.depth * DESK_MARK.heightMm;
  /** ⛔ THE FLIP's TWIST — the yaw that aims the face at the camera's POSITION from where the flip ends: the camera taken
   *  into the mark's yaw frame (the placement's position and turn), its horizontal bearing from the end point. Near the
   *  frame's right edge that is ~20° off the view axis, so on screen it ends OBLIQUE, not face-on — ✔ Carl's choice:
   *  *"so its oblique to us… Not end up face on."* (⚰️ A take that turned it parallel to the screen was never shown.) */
  const flip = useMemo<FlipSpec | null>(() => {
    if (!motion.flipOn) return null;
    const end = flipEnd(motion.flipBase, originOffMm, comM[0]);
    const cam = camera.position.clone().sub(new THREE.Vector3(...place.position)).applyAxisAngle(Y_AXIS, -place.rotationY).sub(end);
    // the second flip's end: FACE-ON — the face against the camera's viewing direction, so parallel to the screen
    const view = camera.getWorldDirection(new THREE.Vector3()).applyAxisAngle(Y_AXIS, -place.rotationY);
    return {
      ...motion.flipBase,
      psiEnd: Math.atan2(cam.x, cam.z),
      second: { ...motion.flip2, psiFace: Math.atan2(-view.x, -view.z) },
    };
  }, [motion.flipOn, motion.flipBase, motion.flip2, originOffMm, comM, camera, place]);
  /**
   * ⛔ THE DROP'S TARGET AND THE WIPE'S LINE — measured from the page. Canvas pixels: x is the logo's offset from the
   * canvas's left; y is where it lies once the stage STOPS (its bottom meets the end of its container, where §3 begins):
   * (stage bottom − canvas top) + (y − container bottom) — both differences hold at any scroll. Re-measured on resize and
   * once the fonts settle. `?markdrop=0` ends at the second flip, as before.
   */
  const size = useThree((st) => st.size);
  const [measured, setDrop] = useState<DropSpec | null>(null);
  const dropOn = !!flip && flip.second.on && !!built && neonParam("markdrop") !== "0";
  const drop = dropOn ? measured : null;
  useEffect(() => {
    if (!dropOn || !flip) {
      clip.set(new THREE.Vector3(0, 1, 0), 1e6); // parked: keeps everything
      return;
    }
    const cam = camera as THREE.PerspectiveCamera;
    const measure = () => {
      const stage = gl.domElement.closest("[data-room-stage]");
      const host = stage?.parentElement;
      const logo = document.getElementById("examples-player-target");
      const player = document.getElementById("examples-player");
      if (!stage || !host || !logo || !player) return;
      const c = gl.domElement.getBoundingClientRect();
      const st = stage.getBoundingClientRect(), h = host.getBoundingClientRect();
      const l = logo.getBoundingClientRect(), pl = player.getBoundingClientRect();
      if (c.width < 1 || c.height < 1) return;
      const yIn = (y: number) => st.bottom - c.top + (y - h.bottom);
      const ndc = (x: number, y: number) => [(2 * x) / c.width - 1, 1 - (2 * y) / c.height] as const;
      plateProjection(cam, c.width, c.height);
      cam.updateMatrixWorld();
      // where the second flip ends, in the world
      const yaw = (v: THREE.Vector3) => v.applyAxisAngle(Y_AXIS, place.rotationY).add(new THREE.Vector3(...place.position));
      const unyaw = (v: THREE.Vector3) => v.sub(new THREE.Vector3(...place.position)).applyAxisAngle(Y_AXIS, -place.rotationY);
      const p = flipPlayed(flip);
      const from = flipPose(p.flight + p.second, flip, originOffMm, comM[0]);
      const fromW = yaw(new THREE.Vector3(from.x, from.y, from.z));
      const z = fromW.clone().project(cam).z;
      const [lx, ly] = ndc(l.left + l.width / 2 - c.left, yIn(l.top + l.height / 2));
      const toW = new THREE.Vector3(lx, ly, z).unproject(cam);
      const mm = fromW.distanceTo(toW) * ROOM_MM_PER_UNIT;
      // the growth's target: the logo's INK height (the PNG's ink spans 494 of its 503 rows) over the mark's height on
      // screen at the drop's end — the mark is `place.scale` tall in the world (its geometry is one height tall)
      const px = (v: THREE.Vector3) => ((1 - v.clone().project(cam).y) / 2) * c.height;
      const markPx = Math.abs(px(toW.clone().add(new THREE.Vector3(0, place.scale / 2, 0))) - px(toW.clone().add(new THREE.Vector3(0, -place.scale / 2, 0))));
      const growTo = neonParam("markgrow") === "0" || markPx < 1 ? 1 : (l.height * (494 / 503)) / markPx;
      const ms = (1000 * Math.sqrt((2 * mm) / 9810)) / DESK_MARK_DROP.speed;
      // the wipe: the plane through the camera and the white rectangle's top edge, its kept side above
      const [, ty] = ndc(0, yIn(pl.top));
      const camW = cam.getWorldPosition(new THREE.Vector3());
      clip.setFromCoplanarPoints(camW, new THREE.Vector3(-1, ty, 0.5).unproject(cam), new THREE.Vector3(1, ty, 0.5).unproject(cam));
      if (clip.distanceToPoint(new THREE.Vector3(0, Math.min(1, ty + 0.2), 0.5).unproject(cam)) < 0) clip.negate();
      setDrop({ from, to: unyaw(toW), ms, growTo });
      invalidate();
    };
    const raf = requestAnimationFrame(measure);
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [dropOn, flip, gl, camera, place, originOffMm, comM, clip, invalidate, size.width, size.height]);
  const lightUpMs = useMemo(() => neonNumber("marklit", DESK_MARK_LIGHT_MS, 0, 10000), []);
  const unlit = useMemo(() => neonNumber("markunlit", DESK_MARK_UNLIT, 0, 1), []);
  const catcherMat = useRef<THREE.ShadowMaterial>(null);
  const faders = useMemo(
    () => ({
      top: neonNumber("marktop", 1, 0, 1),
      strip: neonNumber("markstrip", DESK_MARK_STRIP_SHADOW, 0, 1),
      contact: neonNumber("markao", DESK_MARK_CONTACT_OPACITY, 0, 1),
    }),
    [],
  );

  // the catcher: the desk top from its front edge to the wall, and 600 mm back from the desk's end
  const catcher = useMemo(() => {
    const c = DESK_RIGHT_CORNER;
    const lengthMm = 600;
    return {
      position: roomPoint(c.uMm / 2, c.topMm, c.offWallMm - lengthMm / 2),
      size: [-c.uMm / ROOM_MM_PER_UNIT, lengthMm / ROOM_MM_PER_UNIT] as [number, number],
    };
  }, []);

  if (!built) return null;
  return (
    <>
      <MarkMotion
        bodyRef={body} followRef={follow} contactRef={contactMat} contactOpacity={faders.contact} catcherRef={catcherMat}
        tipFixed={motion.tipFixed} fallFixed={motion.fallFixed} tipMs={motion.tipMs} fallSpeed={motion.fallSpeed} fallEndMs={motion.fallEndMs} loop={motion.loop} flip={flip}
        lightUp={{ at: clock, ms: lightUpMs, unlit, catcherOpacity: DESK_MARK_SHADOW_OPACITY }} drop={drop} crossing={built.crossing} play={motion.play} corner={motion.corner}
        com={comM} depth={depthM} originOffMm={originOffMm}
      />
      <group position={place.position}>
        {/* the mark's facing; inside it, `body` is placed at the CENTRE OF MASS and turned about X (the tip and the fall),
            and `follow` rides the centre of mass WITHOUT turning — the lights (Carl: they follow its position only) */}
        <group rotation={[0, place.rotationY, 0]}>
          <group ref={body} position={comM}>
            <mesh ref={mesh} geometry={built.geometry} material={built.gold} position={[-comM[0], -comM[1], -comM[2]]} castShadow={shadowOn} />
          </group>
          <group ref={follow} position={comM}>
            {shadowOn && faders.top > 0 && (
              <MarkShadowLight dir={shadowDirs.top} centreY={0} strength={faders.top} mapSize={DESK_MARK_SHADOW_MAP} />
            )}
            {shadowOn && faders.strip > 0 && (
              <MarkShadowLight dir={shadowDirs.strip} centreY={0} strength={faders.strip} mapSize={DESK_MARK_SHADOW_MAP / 2} />
            )}
          </group>
        </group>
        {shadowOn && (
          <group rotation={[0, place.rotationY, 0]}>
            <group position={startPose ? [startPose.x, startPose.y, startPose.z] : comM} quaternion={startPose?.q}>
            <mesh position={[-comM[0], 0.0003 - comM[1], built.contact.centreZ - comM[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
              <planeGeometry args={[built.contact.width, built.contact.depth]} />
              <meshBasicMaterial ref={contactMat} color="#000000" alphaMap={built.contact.texture} transparent opacity={faders.contact} depthWrite={false} toneMapped={false} />
            </mesh>
            </group>
          </group>
        )}
      </group>
      <group position={catcher.position} rotation={[0, place.rotationY, 0]} visible={shadowOn}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={catcher.size} />
          <shadowMaterial ref={catcherMat} opacity={DESK_MARK_SHADOW_OPACITY} />
        </mesh>
      </group>
    </>
  );
}

/**
 * ⛔⛔ THE CAMERA OVER THE TALLER CANVAS — 8 October 2026, session 2 (§3, the desk mark's drop). The canvas runs from the
 * plate's top to one screen past the stage (`AboutCardCanvas`), so it is no longer the plate's box. The camera is MANUAL
 * (R3F no longer sets its aspect from the canvas) and keeps the PLATE's projection: aspect = the plate's, and a view
 * offset whose full view is the plate (canvas width × width ÷ aspect) while the rendered window is the whole canvas — the
 * same frustum continued downward. ⛔ So every pixel of the plate region renders exactly as before (the photo, the cards,
 * the camera solve); below it the room's space carries on, transparent where nothing is drawn.
 */
function plateProjection(camera: THREE.PerspectiveCamera, w: number, h: number) {
  camera.aspect = ROOM_PLATE_ASPECT;
  camera.setViewOffset(w, w / ROOM_PLATE_ASPECT, 0, 0, w, h);
  camera.updateProjectionMatrix();
}
function PlateCamera() {
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera;
  const size = useThree((st) => st.size);
  const invalidate = useThree((st) => st.invalidate);
  useLayoutEffect(() => {
    plateProjection(camera, size.width, size.height);
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}

/** §1's faded room — Carl's 27 September take: *"That looks good. The navigation text stands out well against the
    dark background, as does the logo."* The only opacity he has seen. */
const S1_ROOM_OPACITY = 0.2;

/**
 * ⛔⛔ THE TRAVELLING STAGE — D-092, built 3 October 2026 (see `roomWipe`, `about-neon.ts`). Pinned with `sticky`
 * across §1 and §2 (`app/about/page.tsx` wraps both), one window tall, behind the copy. Two layers of ONE photograph:
 *   - `faded` — the room at `S1_ROOM_OPACITY`, always there (the 27 September look);
 *   - `children` — today's §2 room (plate, dark layer, the cards' canvas), shown through a MASK whose edge descends
 *     the room TOP DOWN with a gradient as §2 arrives. The cards exist only in this layer, so they come into view as
 *     the wipe passes them — nothing else is built for that.
 * ⚠ The mask is written from `roomWipe()` on scroll/resize (rAF-coalesced) — the S-curve of `wipeMask`, plus two CSS
 *   variables for instruments — from the SAME numbers the trigger reads. Before JS the variables sit at 0 (all faded) — the server's state at the top of the page.
 * ⚠ `pointer-events-none`: the copy and the nav scroll over it and must stay selectable and clickable.
 * ⚠ `sticky` needs no ancestor with `overflow` hidden/auto (none on /about, checked 3 October) — unasserted after that.
 * ⛔ NO NEGATIVE MARGIN ON THE STAGE — §1 carries it (`-mt-[100vh]`, page.tsx). A sticky element stops when its MARGIN
 *   box meets the container's end; with `-mb-[100vh]` here the stage stuck a whole window past §2 and the room covered §3's
 *   copy (found by Carl, 3 October: §3's text visible only over the side band; hit-test at its heading → the canvas).
 */
/**
 * ⛔ THE WIPE'S EDGE IS AN S-CURVE, NOT A STRAIGHT FADE — 3 October 2026. Carl: *"There seems to be a wider black band
 * as the gradient starts. Can it be smoother? the gradient can be made bigger if you need more numbers."* MEASURED
 * first (one column through the mid-scroll frame): the straight fade blended exactly as specified — the band was the
 * FADE'S CORNERS. A linear ramp has a sudden change of slope where it leaves opaque and where it reaches faded, and
 * the eye reads a slope corner as a dark (or light) band (Mach bands) — worse here because the opaque room is ~4×
 * the faded one's brightness. ⛔ So the opacity follows SMOOTHERSTEP (6t⁵ − 15t⁴ + 10t³: zero slope AND zero
 * curvature at both ends), laid as `WIPE_STOPS` stops, and the gradient is wider (`ROOM_WIPE_GRADIENT`).
 * ⚠ Alphas are computed here as numbers, never `calc()` inside a colour (the rgba(calc()) failure, recorded).
 */
const WIPE_STOPS = 16;
function wipeMask(solid: number, clear: number): string {
  const stops: string[] = [];
  for (let i = 0; i <= WIPE_STOPS; i++) {
    const t = i / WIPE_STOPS;
    const a = 1 - t * t * t * (t * (t * 6 - 15) + 10);
    stops.push(`rgba(0,0,0,${a.toFixed(4)}) ${((solid + (clear - solid) * t) * 100).toFixed(3)}%`);
  }
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/** The masked layer's second layer — the extension below the stage, always shown — and the two layers' boxes. */
const MASK_SOLID = "linear-gradient(#000, #000)";
const MASK_LAYOUT = (image: string): React.CSSProperties => ({
  maskImage: image,
  WebkitMaskImage: image,
  maskSize: "100% 50%, 100% 50%",
  WebkitMaskSize: "100% 50%, 100% 50%",
  maskPosition: "0 0, 0 100%",
  WebkitMaskPosition: "0 0, 0 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
});

export function RoomStage({ faded, children }: { faded: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const masked = el.lastElementChild as HTMLElement | null;
    const apply = () => {
      raf = 0;
      const w = roomWipe();
      if (!w || !masked) return;
      el.style.setProperty("--wipe-solid", `${(w.solid * 100).toFixed(3)}%`);
      el.style.setProperty("--wipe-clear", `${(w.clear * 100).toFixed(3)}%`);
      const m = wipeMask(w.solid, w.clear);
      masked.style.maskImage = `${m}, ${MASK_SOLID}`;
      masked.style.webkitMaskImage = `${m}, ${MASK_SOLID}`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const mask = `${wipeMask(0, 0)}, ${MASK_SOLID}`; // before JS: all faded — the server's state at the top of the page
  return (
    <div
      ref={ref}
      data-room-stage=""
      className="sticky top-0 h-screen pointer-events-none"
      style={{ ["--wipe-solid" as string]: "0%", ["--wipe-clear" as string]: "0%" }}
    >
      <div className="absolute inset-0" style={{ opacity: S1_ROOM_OPACITY }}>
        {faded}
      </div>
      {/* ⛔ TWO SCREENS TALL SINCE 8 OCTOBER (session 2): the canvas runs one screen past the stage into §3 (the desk
          mark's drop), and a mask clips everything outside its element's box. So this layer is 200vh: the wipe's
          gradient over the TOP screen exactly as before (mask size/position), a solid layer over the second. The room's
          children keep a one-screen box (`h-screen` inside), so nothing in them moves. */}
      <div className="absolute inset-x-0 top-0 h-[200vh]" style={MASK_LAYOUT(mask)}>
        <div className="relative h-screen">{children}</div>
      </div>
    </div>
  );
}

export default function AboutCardCanvas() {
  /**
   * ⛔ THE GUIDES ARE ON BY DEFAULT WHILE PLACEMENT IS BEING VERIFIED, and off
   * with `?guides=0`. Carl, 18 September: *"the guide lines should be in the
   * image so i can verify."*
   *
   * ⚠⚠ AN EARLIER VERSION GATED THEM BEHIND `?guides=1` AND CARL SAW NO GUIDES —
   * he was looking at a plain `/about`. ⛔ **A diagnostic nobody can see by
   * default is not a diagnostic.** ⚠ THEY MUST COME OUT before this ships; they
   * are a measurement aid, not design.
   */
  /**
   * ⚠⚠ OFF BY DEFAULT, ON WITH `?guides=1`. ⛔ An earlier edit produced
   * `false && a || b`, and `&&` binds tighter than `||`, so it collapsed to `b`
   * and the guides drew regardless. **A diagnostic that ignores its own switch
   * is the instrument-fault class this project keeps recording** — it was caught
   * only because the render disagreed with the flag.
   *
   * ⛔⛔ THIS OVERLAY IS THE **GREEN CARD RECTANGLES** AND IT STAYS OFF.
   * ⚠⚠ **DO NOT CONFUSE IT WITH THE FLOOR RAILS CARL ASKS TO KEEP.** They are
   * different things in different files, and the Builder turned this one on by
   * mistake on 18 September when asked for the rails:
   *
   *     GREEN quads, here          the four cards' own outlines — a PLACEMENT
   *                                check. Consumed; Carl does not want them.
   *     BLUE/PINK dashed, in       the DESK FLOOR AXES the cards stand on — a
   *     `app/about/page.tsx`       COMPOSITIONAL instrument. **These are the
   *                                ones that stay on.**
   *
   * ⛔ Carl, 18 September 2026: *"no, the floor lines on which the cards are
   * sitting. NOT green card rectangles."* **The rails are ON until he instructs
   * otherwise; this overlay is not.**
   */
  const showGuides =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("guides") === "1";
  /** ⛔ THE DESK MARK — ON PLAIN `/about` (Carl, 8 October 2026, session 2: *"i need to see the logo in
   *  localhost:3000/about#roles"*). It was behind `?mark=1` (8 October, session 1); `?mark=0` hides it for a control. */
  const showMark = neonParam("mark") !== "0";

  /**
   * ⛔⛔ CD's FACE TRANSMISSION, OVERRIDABLE IN THE ROOM WITH `?cd=0.93` — added
   * 22 September 2026 so Carl can find the value ON THE BACKGROUND THAT CAUSED
   * THE PROBLEM. ⚠⚠ **THE BENCH CANNOT ANSWER THIS ONE.** The whole finding is
   * that a fixed material over a VARYING background reads as a varying
   * material; a bench with one floor behind it is the wrong instrument.
   *
   * ⛔ **WHY CD NEEDS ITS OWN NUMBER AT ALL** — Carl, 22 September, on seeing
   * both floor cards at an identical 0.86: *"they do read as different cards."*
   * ⚠ At 0.86 the card is 86% background + 14% white body. **The body is a
   * CONSTANT; what it is added to is not.** CD's face overlaps the DARK desk
   * front, so the white body is a large fraction of the final pixel and reads
   * MILKY. CS's overlaps LIT, grainy floorboards, which dominate — so it reads
   * CLEAR. **Same numbers, different picture, and no transmission value makes
   * them identical.**
   *
   * ⚠ **CARL'S RULE, FROM HIS OWN SWEEP:** *"0.5 = milky, 1.0 = clear. If CD is
   * 0.86 and its giving off this milky look i would up the value to make it a
   * bit clearer, more in line to look like CS."* ⛔ **THE TARGET IS CS'S
   * APPEARANCE, NOT CS'S NUMBER.**
   *
   * ⚠ DEV-ONLY AND UNSWEPT. **It defaults to `CD_FACE_TRANSMISSION` and the
   * URL only overrides it** — so a plain `/about` load always shows the
   * committed value, never a stale query string.
   */
  /**
   * ⚠ ONE READER, NOT FOUR COPIES. A per-card duplicate of this parse is four
   * places for the guard to drift apart — the shared-accessor rule.
   */
  const transmissionOverride = (key: string): number | null => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get(key);
    if (raw === null) return null;
    const n = Number(raw);
    /* ⛔ A BAD VALUE FALLS BACK RATHER THAN RENDERING NaN — `Number("")` is 0,
       and a 0 here would look like a deliberate opaque card. */
    return Number.isFinite(n) && n >= 0.5 && n <= 1 ? n : null;
  };
  const cdTransmissionOverride = transmissionOverride("cd");
  const caTransmissionOverride = transmissionOverride("ca");
  /* ⚠ DIAGNOSTIC — `?cb=` sweeps CB's face body live, like `?ca=`/`?cd=`; absent → the committed value. Added 25
     September 2026 (third session): CB's text reads fainter than CA's because its GLASS is brighter (face body 0.86
     vs CA's 0.95), not its text — measured before proposing a nudge. ⛔ Carl then set CB to 0.95 ("yes, proceed"). */
  const cbTransmissionOverride = transmissionOverride("cb");
  /**
   * ⛔⛔ THE FOUR CARDS IN THE NEW ROOM — 25 September 2026, Carl's accepted layout (D-095):
   * *"Placement and balance are good."* Every number is in `ROOM_CARDS` (`about-room.ts`), in room
   * millimetres; **moving a card is editing that table, not this file.**
   *
   *   CA  wall, left      CB  wall, right     (the TV's outer frame each, level)
   *   CS  ABOVE, on the cabinet fronts        CD  the FLOOR card, one skirting height off the skirting
   *
   * ⚠ *"CS is above and CD is the floor."* The old room had CD floor-left and CS floor-right; the names
   * and their copy, glass values and text settings carry over unchanged — only where they stand moved.
   * ⚠ Every card now faces the same way (the back wall's normal, 18.40° off the camera axis). The old
   * pairs were yawed to two desks; the glass values and the text depths were tuned against THOSE angles
   * and backgrounds (D-089, D-094) and are **not re-tuned here** — that is the next pass, by Carl's eye.
   */
  const cd = placeRoomCard(ROOM_CARDS.CD);
  const cs = placeRoomCard(ROOM_CARDS.CS);
  const ca = placeRoomCard(ROOM_CARDS.CA);
  const cb = placeRoomCard(ROOM_CARDS.CB);

  /**
   * ⛔⛔ THE NEON — D-093, 23 September 2026. ALL FOUR CARDS, BUILT PAIR BY PAIR:
   * the wall pair first (Carl: *"Wall cards first, tweak so they visually match
   * then work on the floor cards."*), then the floor pair the same day —
   * *"Implement the floor cards… We will then see what the whole scene looks
   * like."*
   *
   * ⚠ ONE COLOUR PER PAIR — Carl: *"a darker and a lighter blue per pair."* The
   * wall pair is the logo's navy "c" (approved by eye); the floor pair its teal
   * "b" (a candidate). ⛔ *Overtaken 25 September 2026 (third session):* **in the new
   * room the wall pair is the room's own ORANGE, `#f08a30`** (Carl: *"We should echo
   * it"* — see `NEON_GLOW_HEX`); the floor pair's rims are OFF, their colour to change.
   *
   * ⚠ MEMOISED ONCE PER MOUNT, AND THAT IS LOAD-BEARING: `NeonBloom` ignites when
   * `mode` changes, so a fresh object on every render would re-strike the neon.
   * The URL is read once — reload to apply a new fader.
   *
   *   ?neon=none | off | full   ?neont=<ms>   ?reignite=<ms>
   *   ?neonca= ?neoncb= ?neoncd= ?neoncs=  ?bloom= ?bloomr=
   *   wall: ?neonhex= (glow) ?neontube= (tube)   floor: ?floorhex= ?floortube=
   *   etched text (D-094, CA only): ?etch=1  ?etchem= ?etchbw= ?etchbh= ?etchop= ?etchglow=
   *                                 ?etchrough= ?etchweight= ?etchhex=
   *
   * Every fader falls back to the committed value in `about-neon.ts` /
   * `card-etch.ts`, so a plain `/about` always shows what is committed.
   *
   * ⛔ SINCE 24 September 2026 (session 2) EVERY FADER ABOVE NEEDS `?extrude=0`:
   * plain `/about` carries the extruded text with the neon NOT mounted (see
   * `extrude` below), so `?neon=full` alone changes nothing on screen.
   */
  /**
   * ⛔⛔ THE EXTRUDED TEXT, "DRY" — D-094, 24 September 2026. CA, AND CB SINCE
   * SESSION 2 (was "CA ONLY", corrected in place). Carl:
   * *"turned all the rims off. At this point we dont want extraneous light
   * 'polluting' the scene."* So while it is on the neon is NOT MOUNTED (`none`:
   * every rim is plain clear glass, no bloom) and the etched text is off.
   *
   * ⛔⛔ ON BY DEFAULT — PLAIN `/about` — since 24 September 2026 (session 2). Carl:
   * *"The rim lights should be turned off so we can see the card in isolation."*
   * ⚠ *Corrected in place:* this read "AND ONLY WITH `?extrude=1`… Plain `/about`
   * is untouched: without the flag this is `null`." ⛔ **Now `?extrude=0` is the
   * only way to `null`**, and with it the neon, its faders (`?neon=`, `?neonca=`…)
   * and the etched take (`&etch=1`) — ⚠ **those faders do nothing without it.**
   */
  /* ⛔ THE CARDS CARRYING TEXT, EACH WITH ITS OWN SETTINGS — `extrudeCards` (plain
     `/about`: ALL FOUR mounted since 24 September session 2 — ⚠ since 25 September only CA SHOWS (`?text=`) and its pages run; *corrected in place:*
     this was one card per load, CB). Every switch below keys on `extrude` being
     non-null; the text and its face's shadow key on the card's own entry. */
  /* ⛔⛔ THE ONLY LIGHT IS THE TAKE LIGHT — 3 October 2026 (R-031). Carl: *"both goals have been surpassed. It looks
     great!"* Every earlier light — the ambient, the static key/fill (the 17 September rig, then /start's grazing rig
     turned to the room), and the MOVING LIGHT with its orbit (`about-moving-light.tsx`) — was REMOVED the same day on
     his word: *"As long as you dont change how it looks now, delete what is not needed."* They had been off by default
     since the drawing-board baseline; removing them was measured pixel-identical on two repeatable states
     (`live-work/scripts/identity-frames-3-october.mjs`). Their history: D-090 and the D-095 tail; the code is in git
     at `cec1eff`. ⚠ The room's REFLECTION in the glass (`RoomEnvironmentFromPlate`) is not a light and stays. */
  const take = useMemo(() => takeSettings(), []);
  const extrude = useMemo(() => {
    const ids = extrudeCards();
    if (!ids.length) return null;
    const byCard: Partial<Record<ExtrudeCardId, ExtrudeSettings>> = {};
    for (const id of ids) byCard[id] = extrudeSettings(id);
    return byCard;
  }, []);
  /* ⛔⛔ THE TEXT IS HIDDEN — Carl, 25 September 2026 (second session): *"First, hide the text. Lets
     deal with the card faces."* The light is being worked on the FACES alone. ⚠ Only the letters go:
     `extrude` stays as it was, so every rim stays off and nothing else about the take changes
     (`?extrude=0` would have brought the neon back). **`?text=1` shows the text again.**

     ⛔⛔ CA's TEXT IS BACK, ALONE — Carl, 25 September 2026 (second session): *"Lets look at CA text. It
     should have the same configuration as before. allow for a different size card."* ⚠ **THE SAME SETTINGS
     CARRY OVER UNCHANGED, AND THE CARD'S SIZE IS ALLOWED FOR BY THE LAYOUT ITSELF:** the block is a
     FRACTION of the face (0.94 × 0.9) and the slot count follows from its height. Old CA 560 × 1303 mm →
     new 805 × 1332 mm: the face is the same width to 0.6% (the SAME words per line at 52 mm) and 44%
     taller (**8 lines, was 6**). ⚠ The depth rule re-checked in the new room: CA is seen at 15.7 / 7.1 /
     10.8° (was 23.7 / 12.1 / 4.0°), so 3 mm leaves a worst side wall of **19%** (was 29%) — kept.
     `?text=` : absent → ALL FOUR, static (end of the third session, with every rim lit; before: CA + CB, none, all four, then CS, CD, CB, CA alone in turn) · `1`/`all` → all four · `0` → none · a list (`ca,cb`) → those. */
  /* ⚠ *Overtaken 27 September 2026:* the pages RUN again (`still` false) and, with the neon mounted, a card's text
     mounts only if the §2 sequence reaches it (`onSeq` below) — plain `/about` writes all four in turn, CA → CB →
     CD → CS (it was CA then CB first). `?seq=ca,cb` shortens the chain; `?textstatic=1` holds the first page. */
  const textCards = useMemo(() => textCardsFromUrl(), []);
  /* ⛔ THE RIM UNDER THE TEXT TAKE — Carl, 24 September 2026 (session 2): *"On CB,
     turn off the light but turn on the rim."* When any mounted card's `rim` is on the
     neon mounts as it does on the neon page (`neonMode()`, so `?neon=full|off|<ignite>`
     and every neon fader apply), but ⚠ ONLY THOSE CARDS' CHANNELS are passed (see
     `liveNeon` below): every other rim stays plain clear glass. */
  const neon = useMemo<ReturnType<typeof neonMode>>(
    () =>
      extrude && !Object.values(extrude).some((st) => st.rim)
        ? { kind: "none" }
        : neonMode(),
    [extrude],
  );
  /**
   * ⛔⛔ THE ETCHED TEXT — D-094, 24 September 2026. THE WALL PAIR, AND ONLY WITH
   * `?etch=1`: plain `/about` is pixel-identical until Carl approves the take.
   * ⚠ CB JOINED THE SAME DAY, beyond the CA-only plan, on Carl's word: *"we had
   * no idea how that plan would look in practice… we wont know that until text is
   * put into CB."* Its angle decides the display options (D-094).
   * ⚠ MEMOISED ONCE PER MOUNT (Architect S1) — an inline object would be new on
   * every render. Plan: `live-work/card-text-etch-plan-24-september.md`.
   */
  const [caEtch, cbEtch] = useMemo(() => {
    if (!etchEnabled() || extrudeEnabled()) return [undefined, undefined];
    return (["ca", "cb"] as const).map((id) => ({
      id,
      body: aboutCardCopy(id === "ca" ? "CA" : "CB").body,
      settings: etchSettings(id),
    }));
  }, []);
  const neonChannels = useMemo(() => {
    /* ⚠ TWO COLOURS PER PAIR: the GLOW and the TUBE. They differed on the wall
       pair because ACES turned the navy tube cyan (see `NEON_TUBE_HEX`); ⛔ since
       the wall pair went ORANGE (25 September) the two are the same hex — kept as
       two channels, so a split stays one constant away. */
    const wall = { glow: neonHex(NEON_GLOW_HEX), tube: neonHex(NEON_TUBE_HEX, "neontube") };
    /* ⛔ THE FLOOR PAIR IS A GRADIENT (`FLOOR_GRADIENT_*`, Carl, 25 September 2026): the channel's own colours
       are WHITE carriers and the hue rides on the rim's vertices, side to side. MIRRORED — CS gold → red,
       CD red → gold. */
    const gold = new THREE.Color(neonHex(FLOOR_GRADIENT_GOLD_HEX, "goldhex"));
    const red = new THREE.Color(neonHex(FLOOR_GRADIENT_RED_HEX, "redhex"));
    const blend = neonNumber("gradblend", FLOOR_GRADIENT_BLEND, 0.02, 1);
    const floor = { glow: "#ffffff", tube: "#ffffff" };
    const make = (
      id: NeonChannel["id"],
      pair: { glow: string; tube: string },
      peak: number,
      /** ⚠ Only the wall pair's channels carry the etch's depth; the floor pair's is 0. */
      etch?: { settings: EtchSettings },
      gradient: NeonChannel["gradient"] = null,
    ): NeonChannel => ({
      id,
      color: new THREE.Color(pair.glow),
      tubeColor: new THREE.Color(pair.tube),
      peak,
      rim: null,
      emitter: null,
      textGlow: null,
      /* ⛔ MATCHED TO THE RIM AS SEEN — see `ETCH_GLOW_HEX`. */
      textColor: new THREE.Color(etch ? etch.settings.glowHex : pair.tube),
      textDepth: etch ? etch.settings.glowDepth : 0,
      gradient,
    });
    return [
      make("ca", wall, neonNumber("neonca", CA_NEON_PEAK, 0, 200), caEtch),
      make("cb", wall, neonNumber("neoncb", CB_NEON_PEAK, 0, 200), cbEtch),
      make("cd", floor, neonNumber("neoncd", CD_NEON_PEAK, 0, 200), undefined, { left: red, right: gold, blend }),
      make("cs", floor, neonNumber("neoncs", CS_NEON_PEAK, 0, 200), undefined, { left: gold, right: red, blend }),
    ];
  }, [caEtch, cbEtch]);
  /* ⚠ `?neon=none` passes NO channel, so every card takes the exact pre-neon
     path — the identity gate's first arm. */
  /* ⚠ Under the text take, only the channels of mounted cards whose rim is on. A card
     with no channel takes the exact pre-neon path, so the other three are unlit. */
  const liveNeon = useMemo(
    () =>
      neon.kind === "none"
        ? []
        : extrude
          ? neonChannels.filter((ch) => extrude[ch.id]?.rim)
          : neonChannels,
    [neon, extrude, neonChannels],
  );
  /**
   * ⛔⛔ THE §2 SEQUENCE — Carl, 27 September 2026: *"press Roles. The rim should activate and then the text reveal
   * start… CB should activate and then text reveal as the last few words in CA are being read."* The plan is
   * computed ONCE per mount from each card's own copy and reading settings (`sequencePlan`, `about-neon.ts`); the
   * CLOCK is this mount's — NeonBloom sets it as the ignition starts, each card's text reads it. ⚠ ON only while
   * the neon is mounted (it owns the trigger); with `?neon=none` each text keeps its own start, as before.
   * ⚠ Cards outside `sequenceOrder()` carry no text and stay dark (all four are on it since 27 September; it was
   * CA, CB first — *"sort out CB timing first"*).
   */
  const sequenceRef: SequenceClock = useRef<number | null>(null);
  /* ⚠ EACH SEQUENCE CARD'S CHASE, from the SAME layout the card builds its letters from (`layoutCardText`) —
     so the plan knows when a reader reaches a word and when a second cycle ends (which needs the line breaks).
     The font is the cards' own cached load. Until it lands the plan places only the first card (`pending`). */
  const [chases, setChases] = useState<Partial<Record<NeonChannel["id"], Chase>>>({});
  useEffect(() => {
    if (!extrude || neon.kind === "none") return;
    let cancelled = false;
    const ID = { ca: "CA", cb: "CB", cd: "CD", cs: "CS" } as const;
    loadFont()
      .then((font) => {
        if (cancelled) return;
        const out: Partial<Record<NeonChannel["id"], Chase>> = {};
        for (const id of sequenceOrder()) {
          const st = extrude[id];
          if (!st) continue;
          const { dims } = placeRoomCard(ROOM_CARDS[ID[id]]);
          const laid = layoutCardText(font, aboutCardCopy(ID[id]).body, st, dims).chase;
          if (laid) out[id] = laid;
        }
        setChases(out);
      })
      .catch(() => {
        /* the card itself reports a failed font load, loudly */
      });
    return () => {
      cancelled = true;
    };
  }, [extrude, neon]);
  const plan = useMemo(() => {
    if (!extrude || neon.kind === "none") return null;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = sequenceOrder()
      .filter((id) => extrude[id])
      .map((id) => ({ id, chase: chases[id] ?? null }));
    const p = sequencePlan(cards, reduced, neonNumber("seqfew", SEQUENCE_FEW_WORDS, 0, 30), neonParam("seqloop") !== "0");
    const at = (ms: number | undefined) => `${((ms ?? 0) / 1000).toFixed(1)}s`;
    if (!p.pending) {
      console.info(
        `§2 sequence: ${cards
          .map((c) => `${c.id} rim ${at(p.schedules[c.id]?.startMs)} · text ${at(p.textAtMs[c.id])}${p.textEndMs[c.id] === undefined ? "" : ` · out ${at(p.textEndMs[c.id])}`}`)
          .join(" | ")} · last word ${at(p.endMs)}${p.loopMs === undefined ? "" : ` · LOOP every ${at(p.loopMs)}`} · max ${p.maxRises} rises in a second (cap ${FLASH_CAP})`,
      );
    }
    /* ⚠ THE FLASH CAP, ASSERTED ON THE REAL PLAN — a card going out overlaps the next one striking. Reported,
       never quietly fixed: *"report it to Carl, do not quietly alter the pattern"* (see `maxRisesPerSecond`). */
    if (p.overlaps.length) {
      console.error(`⛔ THE §2 LOOP CANNOT CLOSE — ${p.overlaps.join(", ")} would come round again before going out (loop ${at(p.loopMs)}). Report to Carl.`);
    }
    if (p.maxRises > FLASH_CAP) {
      console.error(`⛔ NEON FLASH CAP BREACHED BY THE §2 SEQUENCE — ${p.maxRises} rises in one second (cap ${FLASH_CAP}). Report to Carl.`);
    }
    return p;
  }, [extrude, neon, chases]);
  /** On the sequence: a card's text mounts only if the sequence reaches it. Off it: as before. */
  const onSeq = (id: NeonChannel["id"]) => !plan || plan.textAtMs[id] !== undefined;
  const seqProps = (id: NeonChannel["id"]) =>
    plan ? { startAtMs: plan.textAtMs[id], endAtMs: plan.textEndMs[id], loopMs: plan.loopMs } : {};
  const neonFor = (id: NeonChannel["id"]) => liveNeon.find((ch) => ch.id === id);
  const [caNeon, cbNeon, cdNeon, csNeon] = [neonFor("ca"), neonFor("cb"), neonFor("cd"), neonFor("cs")];
  /* ⛔ CS is not rendered while the left card is being got right — Carl,
     14 September: *"move one card at a time."* Its constants stay imported and
     its placement stays derivable; only the mesh is withheld. */

  return (
    /**
     * ⛔⛔ THE HOST IS `absolute`, NOT `fixed`. A fixed element resolves against
     * the viewport ONLY while no ancestor establishes a containing block — any
     * ancestor with `transform`, `filter`, `perspective`, `contain` or
     * `will-change` captures it. On 18 August a host read computed left/top of
     * 654.7/616.8 while PAINTING at 1080/879. Caught by Carl looking at the
     * screen, not by any instrument.
     *
     * ⚠⚠ THE BOX MUST TRACK `object-contain`'s OWN GEOMETRY, NOT `inset-0`. The
     * plate is letterboxed inside a full-viewport section, so a fraction of the
     * SECTION is not a fraction of the IMAGE. ⛔ The floor-copy overlay's first
     * attempt used `w-full` here and both text blocks sat left of their targets.
     *
     * ⛔ THE NEW ROOM: the box is the PLATE'S aspect, 2560/1435 = 1.784 (was 3:2), set from the same
     * constant the backplate and camera use, so the three cannot drift apart. `RoomPlate` in
     * `app/about/page.tsx` sizes the DOM fallback the same way.
     */
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className="relative h-full max-h-full w-auto max-w-full"
        style={{ aspectRatio: ROOM_PLATE_ASPECT }}
      >
        {/* ⛔⛔ THE CANVAS RUNS ONE SCREEN PAST THE STAGE — 8 October 2026, session 2 (§3, the desk mark's drop onto the
            blue logo). From the plate's top: the plate (100%), the rest of the stage below it ((100vh − 100%) ÷ 2, the
            letterbox) and one more screen (100vh) = 50% + 150vh. While the stage pins, the extension is off-screen below
            the window; when it stops (its bottom meets its container's end) §3 begins there, so the extension lies
            exactly over §3. ONE canvas, one context (§5a). What the old box provided by where it sat (§5b):
              - the camera solve assumed canvas = plate → `PlateCamera` keeps the plate's projection;
              - the wipe's mask clipped to one screen → `RoomStage`'s masked layer is two screens, solid below;
              - `roomWipeClearsCA` / `wallCardsInView` read the canvas's height as the plate's → they read width ÷ aspect
                (`about-neon.ts`, on Carl's word);
              - hit-testing: R3F's wrapper takes pointer events by default and would sit over §3's copy → `none` (the
                room canvas has no pointer handlers);
              - ⚠ COST: about twice the pixels (and the bloom's targets) every frame — the frame owner renders every
                frame while mounted. Not measured. */}
        <div className="absolute left-0 top-0 w-full" style={{ height: "calc(50% + 150vh)" }}>
        <Canvas
          style={{ pointerEvents: "none" }}
          frameloop="demand"
          dpr={[1, 2]}
          /* ⚠ Shadows ONLY while the extruded text is on — the letters' shadows on
             CA's and CB's faces. ⚠ *Corrected in place:* this read "ONLY under `?extrude=1`…
             so plain `/about` is unchanged"; the text is now plain `/about`'s
             default, so `?extrude=0` is what gives `false` (R3F's own default). */
          shadows={extrude ? "soft" : false}
          gl={{ antialias: true, alpha: true }}
          /* ⚠ The extruded text's reveal/erase wipe is two clipping planes per line,
             which need LOCAL clipping — a renderer switch. ⚠ *Corrected in place, 8 October:* it
             was "set only while the text is on"; it is now ALWAYS on, because the desk mark's §3
             wipe is a clipping plane too. It affects only materials that carry `clippingPlanes`
             (the text's, and the mark's — parked to keep everything until a drop is measured). */
          onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
          camera={{
            /* ⛔ VERTICAL FOV. `PerspectiveCamera.fov` is vertical and the plan
               carried the 89.91° HORIZONTAL figure — caught before it shipped.
               ⛔ The new room: 58.203° on the 2560 x 1435 plate, pitched UP 3.22° (`PITCH` > 0). */
            /* ⛔ MANUAL since 8 October (session 2) — R3F must not set the aspect from the now-taller canvas;
               `PlateCamera` keeps the plate's projection. */
            manual: true,
            fov: ROOM_CAMERA_VFOV_DEG,
            near: 0.01,
            /* ⛔ DERIVED, not set — it was 100 and clipped the whole far plane (see `CAMERA_FAR`). */
            far: CAMERA_FAR,
            position: [0, 0, 0],
            rotation: [PITCH, 0, 0],
          }}
        >
          {/* ⚠ DIM AMBIENT BY DESIGN. The room is dark and the point of the
              geometry is SHADOW; a bright fill erases what is being judged.
              ⛔ THE ROOM IS ALREADY LIT — Carl: *"You're assuming that a white
              global light is going to be used."* The ceiling and floor are IN THE
              PHOTOGRAPH. This lights the cards only. */}
          {/* ⚠ DIM AMBIENT BY DESIGN. The room is dark and the point of the
              geometry is SHADOW; a bright fill erases what is being judged.
              ⛔ THE ROOM IS ALREADY LIT — Carl: *"You're assuming that a white
              global light is going to be used."* The ceiling and floor are IN THE
              PHOTOGRAPH. This lights the cards only. */}
          {/* ⚠ 0.12 -> 0.20 on 17 September 2026, and it is a CONSEQUENCE of the
              key dropping 2.4 -> 1.2 for the mirror light below, not a separate
              change. It restores the right pair's level without altering any
              incidence angle — ambient adds no direction, so nothing it does can
              flatten a crown. */}
          {/* ⛔⛔ THE BACKPLATE — the room, IN the scene. Carl's ruling,
              17 September 2026, Option A, confirmed by name; built 18 September
              on his instruction: *"build the backplate and env map. It cannot be
              properly judged until its in place."*

              ⚠⚠ WITHOUT IT CS'S GLASS IS A MILKY SLAB, NOT A JUDGEMENT.
              `three.module.js:18019`: on an `alpha: true` canvas the transmission
              target is cleared to 50% WHITE, and ⛔ **transmissive objects are
              excluded from that target** (`:18039` renders `opaqueObjects` only).
              **So the glass would refract white nothing and read as "the frost is
              far too heavy" — a confident wrong answer.**

              ⛔ IT REPLACES THE `next/image`, WHICH IS OPTION A, AND THE COST IS
              CARL'S BY NAME: the room no longer survives JS failure, no longer
              survives WebGL context loss, and no longer paints before JS runs.
              **Given up deliberately** — see the §5b table in
              `live-work/structural-note-backplate-17-september.md`.

              ⚠ `toneMapped={false}` IS NOT OPTIONAL (F7). Without it the plate is
              ACES-shifted while the DOM around it is not, so the room and what the
              glass refracts would not match. */}
          <RoomBackplate />
          {/* ⛔ DIAGNOSTIC — `?guides=1`. See `GuideOverlay`. */}
          {showGuides && <GuideOverlay />}

          {/* ⛔ THE ENV MAP — the CLEAR RIM cannot render without one. At
              `transmission: 1` there is no diffuse colour, and transmissive
              objects are excluded from the transmission target, so specular
              reflection is the only channel that can draw the rim.
              ⚠ SHARED with the bench — one definition, `room-environment.tsx`.
              ⚠⚠ ITS PMREM COST IS UNMEASURED HERE. The `/start` precedent is
              ~572ms for a different scene. **2b owes this measurement.** */}
          <RoomEnvironmentFromPlate />

          {take.on && <TakeLight s={take} />}

          {showMark && <DeskMark clock={plan ? sequenceRef : null} />}

          {/* ⛔ NO PROXY PLANE. An earlier build put one 1.6x the card's size
              behind it, which on `/about` is an OPAQUE SLAB BLACKING OUT THE ROOM.
              ⚠ It was carried from the bench, where a proxy is correct because
              there is no room behind it. **Here the room IS the background.**
              ⛔ The proxy returns in chunk 2 as a BANDED GRADIENT per floor card,
              sampled from the pixels each card covers once it is on its rail. */}

          {/* ⛔ BOTH CARDS FLAT — 14 September 2026, Carl: *"make it flat again."*
              ⚠ After five face formulations were built and rejected on sight: the
              superellipse lens, a per-direction re-normalisation, a 15% seam band,
              the tent-pole membrane, and the Q+A separable form with and without
              its plateau. ⛔ A flat face meets the bevel at every point by
              construction and spends no face area doing it. The curvature question
              is PARKED, not answered. */}
          {/* ⛔⛔ CD CARRIES THE QUARTIC BULGE — REAL GEOMETRY. 14 September 2026,
              Carl: *"yes try it on the Left card."*

              ⚠⚠ THE PAIR IS NOW A DIRECT COMPARISON OF THE TWO APPROACHES:
                CD (left)  — real curved geometry, `(1-x²)(1-y²)` at 2.5%
                CS (right) — flat mesh with a convex NORMAL MAP
              ⛔ Both meet the bevel at every point; both keep 100% of the face
              usable for text. **The question is which one reads as dimensional
              when light moves across it** — and only the screen can answer that.

              ⚠ `flat` IS REMOVED HERE so the geometry actually curves. Leaving it
              would have rendered a plane and silently ignored the new surface. */}
          {/* ⛔⛔ CD TAKES CS'S APPROVED VALUES — 22 September 2026, Carl: *"They
              carry the same values for now. We will make a visual inspection when
              they are changed and see if they need individual attention."*

              ⚠⚠ CD NO LONGER CARRIES CS'S 0.86 — AND THE CORRECTION IS RECORDED
              BECAUSE THE PREDICTION WRITTEN HERE WAS WRONG. This comment previously
              said CD would read *"slightly clearer than CS"*, because CD is nearer and
              larger so a fixed frost covers less of it. ⛔ **THE OPPOSITE HAPPENED.**
              Carl, 22 September, on both at 0.86: *"they do read as different cards"* —
              **CD MILKY, CS CLEAR.**

              ⛔⛔ THE MECHANISM IS THE BACKGROUND, NOT THE CARD. At 0.86 a pixel is 86%
              background + 14% white body. **The body is a constant; what it is added to
              is not.** CD's face overlaps the DARK desk front, so the body dominates.
              CS's overlaps LIT grainy floorboards, which dominate instead. ⚠ **The old
              note had this backwards — it reasoned from the lit floor NEAR CD rather
              than the dark desk BEHIND it.** Full reasoning: `CD_FACE_TRANSMISSION`.

              ⚠ SWEEP IT IN THE ROOM WITH `?cd=0.93`. ⛔ **The bench cannot answer this**
              — the whole finding is that the background varies, and the bench has one.

              ⛔ PROVISIONAL AND UNAPPROVED. ⚠ It may be a compensation for lighting that
              does not exist yet (D-090); revisit when the lights land. */}
          <group position={cd.position} rotation={[0, cd.rotationY, 0]} scale={cd.scale}>
            <AboutCardMesh
              dims={cd.dims}
              crownMm={cd.crownMm}
              glass
              /* ⛔ 0.35 → 0.25 — Carl, 25 September 2026 (third session), UNLOCKING D-089's roughness: *"im
                 gonna unlock it because they need to change. 3 cards are reading as too opaque in this new
                 environment. Lets take the floor card and drop it to 0.25."* The 0.35 was tuned in the OLD room.
                 CD first (*"That a lot better"*); CS followed at 0.25; CA/CB still 0.35. Face body (0.95) not part
                 of the unlock. */
              glassRoughness={0.25}
              glassFaceTransmission={cdTransmissionOverride ?? CD_FACE_TRANSMISSION}
              neon={cdNeon}
              faceReceiveShadow={!!extrude?.cd}
            />
            {/* ⛔ CD'S TEXT — CA's treatment, 24 September 2026 (session 2). Carl: *"put
                the text in for CD and CS."* Depth from ITS measured view angle (the
                depth rule, `EXTRUDE_DEPTH_MM`); the light scaled as CB's is, but OFF by
                default (*"Turn all the lights off"*). Alone: `?extrude=cd` (plain `/about` mounts all four; since 25 September only CA shows, its pages running — `?text=`). */}
            {textCards.has("cd") && extrude?.cd && onSeq("cd") && (
              <CardExtrudedText
                id="cd"
                body={aboutCardCopy("CD").body}
                dims={cd.dims}
                crownMm={cd.crownMm}
                settings={extrude.cd}
                sequenceRef={plan ? sequenceRef : undefined}
                {...seqProps("cd")}
                lightDistanceMm={(EXTRUDE_LIGHT_DISTANCE_MM * cd.dims.faceWidthMm) / ca.dims.faceWidthMm}
              />
            )}
          </group>

          {/* ⛔ CS — the right floor card, restored 14 September once CD was
              verified on its rail. ⚠ It was withheld while CD was got right —
              Carl: *"move one card at a time"* — because two cards at once made it
              impossible to tell which discrepancy belonged to which. That
              isolation is what found the stage->plate crop bug.

              ⚠⚠ ITS BOTTOM-**LEFT** CORNER SITS ON PR's **A** HANDLE, mirroring
              CD's bottom-right on PL's B. Both grow away from the room's centre. */}
          {/* ⛔ CS — the right floor card. ⚠ THE `flat` TEST IS RETIRED: it existed
              to show a face that met the bevel all the way round, and the pinned
              membrane now does that WITH curvature. Both cards run the same
              blueprint — Carl: *"it is a blueprint for all 4 cards."* */}
          {/* ⛔⛔ CS CARRIES THE NORMAL-MAP DOME — 14 September 2026, Carl: *"Lets
              try it on the Right card."* ⚠ CD stays flat and plain as the CONTROL,
              so the effect can be judged against its own absence in one frame.

              ⚠⚠ [SUPERSEDED — see below] `flat` AND `domed` TOGETHER WAS THE IDEA:
              the MESH is flat — flush to the bevel at every point, undistorted UVs
              for the text — and only the LIGHTING reads as curved. ⛔ Five mesh
              formulations were rejected today because each traded seam against text
              area; this one makes no such trade.

              ⛔⛔ SUPERSEDED — THE NORMAL-MAP ROUTE IS CLOSED, 14 September 2026.
              Carl, after testing it on the bench under the light sweep: *"NO
              change. CD is the way to go."* **CS now runs the same real curved
              geometry as CD**, and the paragraph above describes what it USED to
              carry.

              ⚠⚠ THE MAP WAS BUILT CORRECTLY AND STILL DID NOTHING. Verified
              against the code as written: the texels genuinely encoded a dome (R
              channel 66..189 against 128 for flat), the material binding was
              right, and UVs were added when their absence was found — they had
              been missing entirely, so every fragment sampled texel (0,0). It
              remained inert after all three were fixed.
              ⛔ LIKELY CAUSE, UNPROVEN: `meshStandardMaterial` needs a `tangent`
              attribute to apply a tangent-space normal map reliably, and this
              geometry has none. **Not chased further — CD had already won on
              evidence Carl gathered himself.**

              ⚠ AND THE PROFILE TEST WAS NEVER MEANINGFUL FOR A FLAT MESH. A plane
              is a straight line in top and side elevation at ANY crown value —
              construction, not a finding. The Builder proposed that view as the
              discriminator and was wrong to.

              ⛔ BOTH CARDS NOW RUN ONE BLUEPRINT: `(1-x²)(1-y²)` at Carl's crown
              of 0.073. *"it is a blueprint for all 4 cards."* */}
          <group position={cs.position} rotation={[0, cs.rotationY, 0]} scale={cs.scale}>
            {/* ⛔⛔ THE TWO GLASS NUMBERS ARE STATED HERE, NOT INHERITED — 22 September
                2026. `glassFaceTransmission` would default to `GLASS_FACE_TRANSMISSION`
                anyway; it is passed explicitly so **the room's values are readable at
                the room's call site** rather than by opening a second file.

                ⚠⚠ BOTH ARE BENCH VALUES AND THE BENCH IS NOT THE ROOM. `lod` scales
                with the transmission render target's width (`transmission_pars_fragment
                .glsl.js:147`), so **the same roughness frosts differently here.** The
                bench settles the frost's CHARACTER; its SCALE is a property of the
                target. See the header of `about-card-glass.ts`.

                ⚠ 0.86 gives the face a BODY so the card reads against the dark desk —
                at 1.0 it had none and its left edge vanished. ⛔ THE RIM IS UNAFFECTED
                and stays clear at 1.0: it is the neon.

                ✔✔ BOTH VALUES ARE APPROVED BY CARL'S EYE IN THIS ROOM, 22 September
                2026 — D-089, R-027. ⛔⛔ DO NOT RETUNE EITHER WITHOUT HIS SPECIFIC
                AUTHORISATION: *"I am happy with the frostiness."* ⚠ The only thing
                that may still move is COLOUR (D-090), which lives in `GLASS_COLOR` /
                `GLASS_ATTENUATION_COLOR` — not in these two numbers. */}
            <AboutCardMesh
              dims={cs.dims}
              crownMm={cs.crownMm}
              glass
              /* ⛔ 0.35 → 0.25 — Carl, 25 September 2026 (third session), after CD's drop (*"That a lot better,
                 we can see more of the background and its less blurred"*): *"Drop CS by the same amount."*
                 D-089's roughness lock lifted for the new room (see `about-card-glass.ts`). */
              glassRoughness={0.25}
              glassFaceTransmission={GLASS_FACE_TRANSMISSION}
              neon={csNeon}
              faceReceiveShadow={!!extrude?.cs}
            />
            {/* ⛔ CS'S TEXT — as CD's above. Alone: `?extrude=cs`. */}
            {textCards.has("cs") && extrude?.cs && onSeq("cs") && (
              <CardExtrudedText
                id="cs"
                body={aboutCardCopy("CS").body}
                dims={cs.dims}
                crownMm={cs.crownMm}
                settings={extrude.cs}
                sequenceRef={plan ? sequenceRef : undefined}
                {...seqProps("cs")}
                lightDistanceMm={(EXTRUDE_LIGHT_DISTANCE_MM * cs.dims.faceWidthMm) / ca.dims.faceWidthMm}
              />
            )}
          </group>

          {/* ⛔⛔ THE WALL PAIR — CA left, CB right. 17 September 2026.
              ⚠ SAME BLUEPRINT AS THE FLOOR PAIR, DIFFERENT DIMENSIONS ONLY.
              `AboutCardMesh` is unchanged and unparameterised by which wall or
              floor a card sits on — Carl's family rule in code.

              ⚠⚠ `scale` IS REQUIRED AND IS NOT OPTIONAL. `cardDims` returns
              MILLIMETRES — verified in its body, not assumed — so the mesh is
              built at millimetre magnitudes and must be divided by MM_PER_UNIT to
              reach floor units, exactly as the floor pair is.
              ⛔ A FIRST DRAFT OF THIS BLOCK OMITTED IT AND SAID SO IN A COMMENT
              CLAIMING `placeWallCard` ALREADY SIZED THE CARD. **That claim was
              false and would have rendered both wall cards ~750x too large.**
              The comment was written before the units were checked. */}
          <group
            position={ca.position}
            rotation={[0, ca.rotationY, 0]}
            scale={ca.scale}
          >
            {/* ⛔⛔ THE WALL PAIR TAKES THE BASELINE 0.86 — Carl, 22 September 2026:
                *"Lets do the 2 wall cards at the baseline of 0.86 and see how they
                look."* ⚠ **BOTH TOGETHER, deliberately** — Carl: *"because the wall
                cards are similar and easier, do them both together."* **They share a
                wall, a distance and an incidence band, so judging them apart would
                compare each against a different neighbour.**

                ⚠⚠ THE FLOOR PAIR DIVERGED AND THE WALL PAIR MAY NOT. CD needed 0.95
                because its face overlaps the DARK desk front while CS's overlaps LIT
                floorboards. ⛔ **Both wall cards sit against the SAME dark blue wall**,
                so the mechanism that split the floor pair does not obviously apply
                here. **That is a prediction, and the last two were wrong.**

                ⛔ CA IS THE ONE TO WATCH. The record has it at ~14 degrees mean
                incidence — near face-on, where refraction barely happens. ⚠ **What
                sells glass at an angle is the bend; CA has almost none of it**, so it
                leans harder on the BODY than any other card. **If one of the four
                needs its own value, this is the likeliest.**

                ⚠ A DARK BLUE WALL IS LOW-DETAIL COMPARED TO FLOORBOARDS.
                `about-card-glass.ts`: *"a card against a dark, featureless region will
                show less material character."* **Expect less frost character here and
                do not read it as the frost failing.**

                ⛔ NOTHING APPROVED. Carl inspects the pair before any value is kept. */}
            {/* ⛔⛔ CA LEAVES THE BASELINE, CB DOES NOT — Carl, 22 September 2026:
                *"they feel all part of the same family except CA. Lets bump it up to
                0.95."* ⚠⚠ **THE TEST IS FAMILY RESEMBLANCE, NOT MATCHED NUMBERS** —
                CB passed his eye at 0.86 in the same frame. ⛔ **Do not tidy the pair
                onto one value because they share a wall.** Reasoning:
                `CA_FACE_TRANSMISSION`. ⚠ Sweep live with `?ca=0.93`. */}
            <AboutCardMesh
              dims={ca.dims}
              crownMm={ca.crownMm}
              glass
              /* ⛔ 0.35 → 0.20 — Carl, 25 September 2026 (third session): *"Go with option 1 but tune CA + CB to 0.20"* (D-089's roughness lock lifted for the new room; CD/CS 0.25; the reflection now blurred on its own, `ENV_BLUR_SIGMA`). */
              glassRoughness={0.20}
              glassFaceTransmission={caTransmissionOverride ?? CA_FACE_TRANSMISSION}
              neon={caNeon}
              etch={caEtch}
              faceReceiveShadow={!!extrude?.ca}
            />
            {textCards.has("ca") && extrude?.ca && onSeq("ca") && (
              <CardExtrudedText
                id="ca"
                body={aboutCardCopy("CA").body}
                dims={ca.dims}
                crownMm={ca.crownMm}
                settings={extrude.ca}
                sequenceRef={plan ? sequenceRef : undefined}
                {...seqProps("ca")}
              />
            )}
          </group>
          <group
            position={cb.position}
            rotation={[0, cb.rotationY, 0]}
            scale={cb.scale}
          >
            <AboutCardMesh
              dims={cb.dims}
              crownMm={cb.crownMm}
              glass
              /* ⛔ 0.35 → 0.20 — Carl, 25 September 2026 (third session): *"Go with option 1 but tune CA + CB to 0.20"* (D-089's roughness lock lifted for the new room; CD/CS 0.25; the reflection now blurred on its own, `ENV_BLUR_SIGMA`). */
              glassRoughness={0.20}
              /* ⛔ FACE BODY 0.86 → 0.95 — Carl, 25 September 2026 (third session): *"yes, proceed"*, on the
                 measurement. CB's TEXT was the brighter; its GLASS was lighter (99 vs CA's 70 luma), so the text
                 stood 40 off it where CA's stood 51. At 0.95 the frost lets more of the dark wall through:
                 contrast 49.8 (CA 51.1), and 48.6 at CB's blowout point (was 38.6) — no light added, so the
                 blowout eases rather than grows. ⚠ CB leaves the shared `GLASS_FACE_TRANSMISSION` (0.86, which
                 CS still takes) for its own value here, as CA and CD have theirs. ⚠ It lands on CA's 0.95 by
                 MEASUREMENT, not by tidying the pair (see the note above). `?cb=` still sweeps it. */
              glassFaceTransmission={cbTransmissionOverride ?? 0.95}
              neon={cbNeon}
              etch={cbEtch}
              faceReceiveShadow={!!extrude?.cb}
            />
            {/* ⛔⛔ CB'S TEXT — CA'S TREATMENT EXACTLY, 24 September 2026 (session 2).
                Carl: *"Same text size, same type of text. Same reveal. It should
                appear in the card in the same way as CA text does. The only
                difference being is that CB has more words."* ⚠ Same `extrude`
                settings object as CA — one set of faders drives both.
                ⛔ ITS OWN LIGHT, at CA's position SCALED BY FACE WIDTH: *"approximately
                in the same position as CAs light given its proportions."*
                ⛔ ONE CARD PER LOAD WAS THE RULE WHILE CB WAS WORKED ON: *"isolate CA text so we can focus on CB."* ⚠ Since the same session plain `/about` mounted ALL FOUR, static (since 25 September: CA only, pages running — `?text=`); `?extrude=cb` isolates CB.
                *"Just as the text sequence is coming to an end, CB will activate"*
                is a LATER chunk, once all four cards have text. ⚠ *Overtaken 27 September
                2026:* BUILT — the §2 sequence (`plan` above): CB's rim strikes as CA's reader
                reaches its third-last word, its text as the ignition ends. */}
            {textCards.has("cb") && extrude?.cb && onSeq("cb") && (
              <CardExtrudedText
                id="cb"
                body={aboutCardCopy("CB").body}
                dims={cb.dims}
                crownMm={cb.crownMm}
                settings={extrude.cb}
                sequenceRef={plan ? sequenceRef : undefined}
                {...seqProps("cb")}
                lightDistanceMm={(EXTRUDE_LIGHT_DISTANCE_MM * cb.dims.faceWidthMm) / ca.dims.faceWidthMm}
              />
            )}
          </group>

          {/* ⛔⛔ THE FRAME OWNER — D-093, S1. While mounted it renders EVERY frame
              of this canvas (priority 1 switches off R3F's own render for the
              whole root); the base render is the same call R3F makes, and the
              neon is isolated so a failure costs the glow, never the room.
              ⚠ `?neon=none` unmounts it and R3F renders the room itself. See
              `neon-bloom.tsx`. */}
          {neon.kind !== "none" && (
            <NeonBloom
              channels={liveNeon}
              mode={neon}
              schedules={plan?.schedules}
              sequenceRef={plan ? sequenceRef : undefined}
              sequenceEndMs={plan?.endMs}
            />
          )}
          <PlateCamera />
        </Canvas>
        </div>
      </div>
    </div>
  );
}
