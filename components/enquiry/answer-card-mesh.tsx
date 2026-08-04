"use client";

/**
 * Q&A answer-card mesh — ONE compound object built from three concentric parts
 * read as a single assembly:
 *
 *   RIM   — a HALF-TUBE swept along the card's rounded-rectangle perimeter. Its
 *           outermost point IS the approved 186.66 x 48 silhouette; nothing may
 *           extend beyond it.
 *   BEVEL — a swept band, sloping inward and TOWARD THE VIEWER.
 *   FACE  — a slightly convex plane, RECESSED behind the rim's apex.
 *
 * All three are placed on ONE sampled path (`sampleRoundedRectPath`) at
 * different insets, so their silhouettes are true parallel offsets of each other
 * and cannot drift apart.
 *
 * ⚠ CARL'S SPECIFICATION, 3 August 2026:
 *   *"It already has a rim where the filament goes. What I imagine after that,
 *   if I describe just the top, is a 'slope' that comes toward us. Equidistant
 *   all the way around. Top, bottom, sides and corners. The face can be flat or
 *   slightly convex."*
 *   *"The rim should be a half tube, that way it will emit light onto the bevel
 *   and face, and if it's making a journey down the right hand side it will
 *   affect the 2 card and all other cards will be affected by proximity."*
 *
 * ⚠ THE HALF-TUBE IS A LENS FOR THE LIGHT IT WILL CARRY (chunk 4). A flat rim
 * emits roughly forward. A half-round presents every angle between the face and
 * the outer edge at once, so ONE geometry throws light three ways: inward onto
 * the bevel and face, outward to neighbouring cards, and at the viewer. That is
 * the whole reason the filament's secondary effects come for free in a real
 * scene and had to be hand-authored in CSS (`GRID_REFL`, `--sweep-pass`).
 *
 * ⚠ THIS IS NOT THE CONTACT FIELD'S RIM. That one is a flat `ExtrudeGeometry`
 * (`contact-field-mesh.tsx`, RIM_DEPTH 6, bevelEnabled false). The helpers below
 * are COPIED rather than imported: the contact field is APPROVED and must not
 * move when this card is tuned.
 *
 * GEOMETRY PROOF ONLY: neutral three-tone diagnostic material, no colour
 * direction, no transmission, no clearcoat, no environment map, no filament, no
 * text. All values are named constants so later tuning is a value change.
 */

import { useMemo, useEffect, useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RADIUS_PX,
  RIM_TUBE_RADIUS,
  BEVEL_WIDTH,
  BEVEL_RISE,
  CROWN_HEIGHT,
  CROWN_PLATEAU_U,
  FACE_SEAM_SINK,
  cardBudget,
} from "./answer-card-geometry";
import {
  GLASS_COLOR,
  GLASS_ROUGHNESS,
  GLASS_TRANSMISSION,
  GLASS_THICKNESS,
  GLASS_IOR,
  GLASS_ENV_INTENSITY,
  RIM_METAL_COLOR,
  RIM_METALS,
  RIM_METALNESS,
  RIM_ROUGHNESS,
  RIM_ENV_INTENSITY,
  FILAMENT_COLOR,
  FILAMENT_INTENSITY,
  FILAMENT_CORE,
  FILAMENT_TAIL,
  FILAMENT_LEAD,
  BEVEL_GLOW,
  BEVEL_TRIGGER,
  FILAMENT_BLEED,
  FILAMENT_TAIL_FLOOR,
  FILAMENT_GLOW,
  BEVEL_GLASS_COLOR,
  BEVEL_ROUGHNESS,
  BEVEL_CLEARCOAT,
  BEVEL_CLEARCOAT_ROUGHNESS,
  BEVEL_ENV_INTENSITY,
  LIGHT_LEVEL,
} from "./answer-card-glass";

/**
 * The material properties that are adjustable during the mastering pass.
 *
 * ⚠ `thickness` AND `ior` ARE DELIBERATELY ABSENT. Under an orthographic camera
 * their maximum effect across the whole face is 0.801px — they would move
 * numbers and change nothing on screen. See `answer-card-glass.ts` for the
 * measured displacement table.
 *
 * ⚠ `lightLevel` JOINED THEM ON 4 AUGUST because Carl's method needs it as a
 * fader rather than a constant — see `GLASS_RIG_PARAMS` in
 * `answer-card-canvas.tsx`.
 */
/**
 * The filament's live state, carried in refs.
 *
 * ⚠ REFS, NOT PROPS. The head moves every frame for 2400ms; passing it as a prop
 * would mean a React render per frame, rebuilding the scene graph to move one
 * number. Same argument as `useRegionShift` in the backdrop.
 */
export type FilamentState = {
  /** Head position around the circuit, 0..1. */
  head: React.RefObject<number>;
  /** Overall intensity — 0 when unlit. The fader. */
  intensity: React.RefObject<number>;
  core: React.RefObject<number>;
  tail: React.RefObject<number>;
};

export type GlassTuning = {
  roughness: number;
  transmission: number;
  lightLevel: number;
  /** The rim metal's own surface roughness — the dial with real range on it. */
  rimRoughness: number;
  /** Index into `RIM_METALS`. Cycled with `[m]`; see that constant for why. */
  rimMetal: number;
  /** The filament's peak intensity — the second fader in the mastering pass. */
  filamentIntensity: number;
};

export const DEFAULT_GLASS_TUNING: GlassTuning = {
  roughness: GLASS_ROUGHNESS,
  transmission: GLASS_TRANSMISSION,
  lightLevel: LIGHT_LEVEL,
  rimRoughness: RIM_ROUGHNESS,
  rimMetal: 0,
  filamentIntensity: FILAMENT_INTENSITY,
};

// ── Diagnostic material ──────────────────────────────────────────────────────
//
// ⚠ GREY IS THE POINT, NOT A PLACEHOLDER. A form defect hides behind a colour
// that already looks plausible: the contact field's 5.67-degree crown failure
// was only findable under a diagnostic material, because a blue-tinted card
// would have read as "roughly right" and carried the defect into the material
// chunk. Confirmed by Carl, 3 August.
// ⚠ THE RIM'S AND BEVEL'S DIAGNOSTIC GREYS ARE RETIRED — both now carry a real
// material brief from Carl (4 August): the rim is unlit tungsten, the bevel is
// the glass holder that supports it. The diagnostic did its job; the form it was
// protecting is approved.
//
// `DIAG_FACE_COLOR` REMAINS, and only as the non-glass fallback — the face wears
// real glass whenever `glass` is set, and this is what renders otherwise.
const DIAG_FACE_COLOR = "#a8a8a8";

/**
 * The rim's material: tungsten that heats.
 *
 * ⚠ THE HEAT IS COMPUTED IN THE SHADER FROM EACH FRAGMENT'S OWN POSITION, not
 * baked into a vertex attribute. The alternative — writing a "distance along the
 * circuit" attribute when the geometry is swept — would put the circuit's
 * definition in two places, and `filamentHeadAt` would be free to disagree with
 * it. Deriving it here from the same rounded-rect arithmetic means one
 * definition; the shader and the light position cannot drift apart.
 *
 * ⚠ AND THE EMISSIVE IS ADDITIVE ON TOP OF THE METAL, NOT A REPLACEMENT FOR IT.
 * The filament design reference is explicit that the rim does not stop being
 * metal when it lights: *"The dynamite fuse burns away. This does not."* So the
 * tungsten keeps reflecting the environment throughout, and the glow is added.
 */
function RimMaterial({
  color,
  roughness,
  envMap,
  envMapIntensity,
  filament,
}: {
  color: string;
  roughness: number;
  envMap: THREE.Texture | null;
  envMapIntensity: number;
  filament: FilamentState;
}) {
  const uniforms = useRef({
    uHead: { value: 0 },
    uCore: { value: FILAMENT_CORE },
    uTail: { value: FILAMENT_TAIL },
    uLead: { value: FILAMENT_LEAD },
    uBleed: { value: FILAMENT_BLEED },
    uIntensity: { value: 0 },
    uColor: { value: new THREE.Color(FILAMENT_COLOR) },
    // ⚠ THE RIM'S CENTRE-LINE, NOT THE CARD'S SILHOUETTE. The tube is swept
    // along a path inset by `tubeRadius`, so its vertices sit on that smaller
    // rectangle — feeding the silhouette's half-extents here would put the
    // shader's idea of "the top edge" a tube-radius away from the actual
    // geometry, and the heat would track a rectangle the metal is not on.
    uHalf: {
      value: new THREE.Vector2(
        CARD_WIDTH_PX / 2 - RIM_TUBE_RADIUS,
        CARD_HEIGHT_PX / 2 - RIM_TUBE_RADIUS,
      ),
    },
    uRadius: { value: Math.max(0, CARD_RADIUS_PX - RIM_TUBE_RADIUS) },
  });

  // Keep the uniforms in step with the live filament state. A ref rather than
  // props on the material, because this changes every frame while the head
  // travels and a React render per frame would rebuild the scene graph.
  useFrame(() => {
    const u = uniforms.current;
    u.uHead.value = filament.head.current;
    u.uIntensity.value = filament.intensity.current;
    u.uCore.value = filament.core.current;
    u.uTail.value = filament.tail.current;
  });

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms.current);

    shader.vertexShader = `varying vec3 vLocalPos;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\n  vLocalPos = position;",
    );

    shader.fragmentShader = `
      uniform float uHead;
      uniform float uCore;
      uniform float uTail;
      uniform float uLead;
      uniform float uBleed;
      uniform float uIntensity;
      uniform vec3  uColor;
      uniform vec2  uHalf;
      uniform float uRadius;
      varying vec3  vLocalPos;

      ${CIRCUIT_POS_GLSL}

      // Heat at this point: a hot core, a long tail BEHIND, a faint lead AHEAD.
      //
      // THE TAIL MUST NOT WRAP. A first version used fract() here and it put a
      // SECOND HEAD on the card. Carl, 4 August: "When the filament starts it
      // proceeds to go right but at the same time a part of it on the bottom
      // line starts a head of its own and races to the beginning."
      //
      // With a wrapped difference, a point near the END of the circuit
      // (pos ~ 0.9) sits only 0.1 behind a head at 0.0 — well inside the tail —
      // so the bottom-left lit before the head had been near it, and appeared to
      // travel backwards toward the origin as the head advanced.
      //
      // ⚠ THE CIRCUIT WRAPS; THE JOURNEY DOES NOT. The head runs 0 -> 1 exactly
      // once, so "how far behind me has the head been" is a plain subtraction.
      // Points the head has not yet reached are simply cold.
      // AND THE ORIGIN IS NOT A WALL EITHER. Carl, 4 August: "when the filament
      // starts and has it effects on the bevel, both leave a straight line on
      // its starting position. This is not how heat would work. there would be
      // some heat/bloom/bleed on its left. the effect of heat doesnt diminish in
      // a straight line."
      //
      // HE IS RIGHT, AND IT WAS INTRODUCED BY THE PREVIOUS FIX. Killing the wrap
      // stopped the phantom head, but it also made "not yet reached" mean
      // absolutely cold — so the start of the circuit became a hard edge, hot
      // metal on one side and untouched metal a pixel away. Real heat conducts
      // backwards past where the current entered.
      //
      // The bleed term restores that: a short falloff reaching BEHIND the
      // origin, which in circuit terms is the far end of the loop. Deliberately
      // much shorter than the tail — conduction against the direction of travel
      // is real but weak.
      float heatAt(float pos, float head) {
        float behind = head - pos;          // >0 once the head has passed
        float ahead  = pos - head;          // >0 while it is still coming

        float core = 1.0 - smoothstep(0.0, uCore, abs(behind));

        // ⚠ THE TAIL SETTLES TO A FLOOR RATHER THAN DECAYING TO NOTHING, and
        // that floor is what makes the circuit end with the whole rim hot.
        //
        // Carl, 4 August: *"filament sets off but at a certain point seems to
        // lose some of its intensity at the beginning... its still there when
        // the circuit is complete."* A first version let the tail fall from 0.72
        // toward zero, so the origin measured 236 as the head passed and 172 by
        // mid-circuit — the metal visibly cooling behind the head.
        //
        // THAT CONTRADICTS THE DESIGN REFERENCE, which is explicit: "The rim
        // behind the head stays warm rather than snapping back to grey... By the
        // end of the circuit the whole rim is hot." Current keeps flowing
        // through metal the head has already passed — it does not cool while the
        // circuit is still being made.
        //
        // So the tail falls only as far as the floor: a short drop from the
        // core's white-hot peak to a settled glow, not a fade to cold.
        float tail = behind < 0.0 ? 0.0
                   : mix(1.0, ${FILAMENT_TAIL_FLOOR.toFixed(3)},
                         smoothstep(0.0, uTail, behind));
        float lead = ahead < 0.0 ? 0.0
                   : (1.0 - smoothstep(0.0, uLead, ahead)) * 0.30;

        // ⚠ THE BLEED INHERITS THE ORIGIN'S OWN HEAT — IT DOES NOT IMPOSE A
        // CONSTANT. Carl, 4 August: *"filament sets off but at a certain point
        // seems to lose some of its intensity at the beginning. Its bright at
        // first then fades a bit, as if some of the juice has been turned down
        // for that section. its still there when the circuit is complete."*
        //
        // ⚠ HE DESCRIBED THE BUG PRECISELY. A first version multiplied the
        // bleed by a fixed 0.55, anchored at the origin and independent of the
        // head — so that section was at core brightness (1.0) while the head sat
        // on it, then DROPPED to 0.55 as the head moved away, and stayed pinned
        // there for the rest of the circuit. Exactly "the juice turned down for
        // that section", and exactly why it was still visible at the end.
        //
        // The bleed is heat CONDUCTED from the metal at the start line, so it
        // can only be as hot as that metal is. Sampling the tail's value AT the
        // origin and attenuating with distance means the bleed rises and falls
        // with everything else instead of holding its own level.
        float originHeat = head <= 0.0 ? 0.0
                         : mix(1.0, ${FILAMENT_TAIL_FLOOR.toFixed(3)},
                               smoothstep(0.0, uTail, head));
        float pastOrigin = 1.0 - pos;
        float bleed = (1.0 - smoothstep(0.0, uBleed, pastOrigin))
                    * smoothstep(0.0, uCore, head)
                    * originHeat;

        return clamp(max(max(core, bleed), max(tail, lead)), 0.0, 1.0);
      }

      ${shader.fragmentShader}
    `.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
       {
         float pos = circuitPos(vLocalPos.xy, uHalf, uRadius);
         float heat = heatAt(pos, uHead) * uIntensity;
         // ⚠ ADDED, NOT SUBSTITUTED — the metal keeps reflecting throughout.
         // The curve steepens the core so the head reads as hotter than its
         // own tail rather than as a uniform bar.
         // LINEAR IN heat, NOT SQUARED. heat*heat crushed the tail to nothing:
         // at heat 0.3 it delivered 0.09, so the long warm trail was present in
         // the maths and invisible on screen.
         //
         // THE MULTIPLIER MUST NOT CLIP THE TRAIL, and 12.0 did. A perimeter
         // scan mid-circuit found the ENTIRE top edge pegged at 255 while the
         // head itself was on the right edge — so the trail was saturated and
         // the head had nowhere brighter to go. Measured contrast between head
         // and trail: -119, i.e. inverted.
         //
         // The head reads hotter than its own trail only if the trail has
         // headroom left. FILAMENT_TAIL_FLOOR sets how far below the core the
         // trail settles; this multiplier has to keep that difference on screen
         // rather than flattening it against the top of the range.
         totalEmissiveRadiance += uColor * heat * ${FILAMENT_GLOW.toFixed(3)};
       }`,
    );
  }, []);

  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={RIM_METALNESS}
      envMap={envMap}
      envMapIntensity={envMapIntensity}
      emissive={new THREE.Color(FILAMENT_COLOR)}
      emissiveIntensity={0}
      side={THREE.DoubleSide}
      onBeforeCompile={onBeforeCompile}
    />
  );
}

/**
 * The GLSL for "where am I around the circuit", shared by the rim and the bevel.
 *
 * ⚠ ONE DEFINITION, USED TWICE, AND THAT IS THE POINT. Carl, 4 August, on the
 * bevel: *"So the head of the filament should trigger the bevel. Making sure not
 * to get ahead of itself or fall behind."* Two copies of this arithmetic could
 * drift by a fraction of the perimeter and the bevel would visibly lead or lag
 * the metal — the exact defect he named, arriving through the back door.
 */
const CIRCUIT_POS_GLSL = `
  float circuitPos(vec2 p, vec2 half_, float r) {
    float hw = half_.x, hh = half_.y;
    float runX = 2.0 * hw - 2.0 * r;
    float runY = 2.0 * hh - 2.0 * r;
    float quarter = 1.5707963 * r;
    float total = 2.0 * runX + 2.0 * runY + 4.0 * quarter;

    float d;
    if (p.y > hh - r && p.x > -hw + r && p.x < hw - r) {
      d = (p.x + hw - r);                                       // top
    } else if (p.x > hw - r && p.y < hh - r && p.y > -hh + r) {
      d = runX + quarter + (hh - r - p.y);                      // right
    } else if (p.y < -hh + r && p.x > -hw + r && p.x < hw - r) {
      d = runX + quarter + runY + quarter + (hw - r - p.x);     // bottom
    } else if (p.x < -hw + r) {
      d = 2.0*runX + 3.0*quarter + runY + (p.y + hh - r);       // left
    } else if (p.x > 0.0 && p.y > 0.0) {
      float a = atan(p.y - (hh - r), p.x - (hw - r));
      d = runX + (1.5707963 - a) / 1.5707963 * quarter;
    } else if (p.x > 0.0) {
      float a = atan(p.y + (hh - r), p.x - (hw - r));
      d = runX + quarter + runY + (-a) / 1.5707963 * quarter;
    } else if (p.y < 0.0) {
      float a = atan(p.y + (hh - r), p.x + (hw - r));
      d = 2.0*runX + 2.0*quarter + runY + (-a - 1.5707963) / 1.5707963 * quarter;
    } else {
      float a = atan(p.y - (hh - r), p.x + (hw - r));
      d = 2.0*runX + 3.0*quarter + 2.0*runY + (3.1415927 - a) / 1.5707963 * quarter;
    }
    return fract(d / total);
  }
`;

/**
 * The bevel: glass that stays warm once the head has passed it.
 *
 * ⚠ IT LATCHES. IT DOES NOT TRACK. Carl, 4 August, correcting a first version
 * where the bevel simply lit wherever the travelling light happened to be:
 *
 * > *"That white strip on the bevel has now turned orange. Good, as it should.
 * > But it is travelling with the filament as an orange strip. What should
 * > happen is the bevel should all turn orange as the filament races past. So
 * > the head of the filament should trigger the bevel... It is a consequence of
 * > the heated filament that stays on."*
 *
 * ⚠ THE DIFFERENCE IS "IS THE HEAD HERE NOW" VERSUS "HAS THE HEAD BEEN HERE
 * YET", and only the second is physical. The rim behind the head is still hot,
 * so the glass beside it is still being lit — a moving strip would mean the
 * metal cooled the instant the head moved on, which is precisely what the
 * filament design reference rules out: *"the rim behind the head stays warm
 * rather than snapping back to grey."*
 *
 * So the bevel reads the same circuit position as the rim and asks whether
 * `uHead` has reached it, rather than how far away it is.
 */
function BevelMaterial({
  envMap,
  envMapIntensity,
  filament,
}: {
  envMap: THREE.Texture | null;
  envMapIntensity: number;
  filament: FilamentState;
}) {
  const uniforms = useRef({
    uHead: { value: 0 },
    uIntensity: { value: 0 },
    uBleed: { value: FILAMENT_BLEED },
    uColor: { value: new THREE.Color(FILAMENT_COLOR) },

    /**
     * ⚠ THE RIM'S RECTANGLE, NOT THE BEVEL'S OWN — AND THIS IS THE REAL CAUSE OF
     * THE LAG CARL SAW.
     *
     * *"the bevel being affected is too far behind. There is a noticable gap,
     * even without zooming in."* The trigger's width was blamed first and
     * changing it did nothing, because the gap was geometric:
     *
     *     rim centre-line    182.7 x 44.0, r 12   perimeter 432.7
     *     bevel centre-line  174.7 x 36.0, r  8   perimeter 407.6
     *
     * **Two different perimeters, so the same fraction lands in two different
     * places.** At t=0.2 the rim's point sits at x=7.2 and the bevel's at
     * x=2.2 — 5px apart before any trigger is applied, widening along the edge
     * to the 15px measured on screen.
     *
     * ⚠ THE BEVEL IS NOT RUNNING ITS OWN CIRCUIT. It is being warmed BY the rim,
     * so "has the head passed me" must be asked in the RIM's coordinates.
     * Projecting the bevel's fragment onto the rim's rectangle makes the two
     * share one parameterisation, which is what Carl's *"not to get ahead of
     * itself or fall behind"* actually requires.
     */
    uHalf: {
      value: new THREE.Vector2(
        CARD_WIDTH_PX / 2 - RIM_TUBE_RADIUS,
        CARD_HEIGHT_PX / 2 - RIM_TUBE_RADIUS,
      ),
    },
    uRadius: { value: Math.max(0, CARD_RADIUS_PX - RIM_TUBE_RADIUS) },
    /**
     * How far the rim's core reaches ahead of the head — see the trigger.
     *
     * ⚠ HALF THE CORE, NOT THE WHOLE CORE. `uCore` is the distance at which the
     * core's smoothstep reaches zero, so the metal's VISIBLE edge sits around
     * half of it ahead of the head, not the full width. Using the whole value
     * overshot and put the glass 5px in FRONT of the metal — measured, after it
     * had been 10px behind.
     */
    uCoreLead: { value: FILAMENT_CORE * 0.5 },
    /** The bevel's own half-extents, used only to project onto the rim's. */
    uBevelHalf: {
      value: new THREE.Vector2(
        CARD_WIDTH_PX / 2 - 2 * RIM_TUBE_RADIUS - BEVEL_WIDTH / 2,
        CARD_HEIGHT_PX / 2 - 2 * RIM_TUBE_RADIUS - BEVEL_WIDTH / 2,
      ),
    },
  });

  useFrame(() => {
    uniforms.current.uHead.value = filament.head.current;
    uniforms.current.uIntensity.value = filament.intensity.current;
  });

  const onBeforeCompile = useCallback((shader: THREE.WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms.current);

    shader.vertexShader = `varying vec3 vBevelPos;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\n  vBevelPos = position;",
    );

    shader.fragmentShader = `
      uniform float uHead;
      uniform float uIntensity;
      uniform float uBleed;
      uniform vec3  uColor;
      uniform vec2  uHalf;
      uniform float uRadius;
      uniform vec2  uBevelHalf;
      uniform float uCoreLead;
      varying vec3  vBevelPos;
      ${CIRCUIT_POS_GLSL}
      ${shader.fragmentShader}
    `.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
       {
         // ⚠ PROJECTED ONTO THE RIM'S RECTANGLE BEFORE THE LOOKUP. The bevel's
         // own vertices sit INSIDE that rectangle, so feeding them straight in
         // would ask "where is this point on the rim's circuit" of a point that
         // is not on it — and the corners in particular would map badly.
         // Scaling the fragment out to the rim's half-extents keeps the angle
         // and puts it on the path the head actually travels.
         // Per-axis scale from the bevel's own half-extents to the rim's, so a
         // point on the bevel's top edge lands on the rim's top edge at the same
         // proportional position along it.
         vec2 onRim = vBevelPos.xy * (uHalf / uBevelHalf);
         float pos = circuitPos(onRim, uHalf, uRadius);

         // THE LATCH MUST NOT WRAP, even though the circuit does. "Has the head
         // passed me" is a question about the journey so far, and the journey
         // runs 0 -> 1 exactly once. A wrapped difference turns "not yet
         // reached" into "reached long ago" at the seam — see the rim's own
         // note, where that produced a visible second head.
         // ⚠ THE TRIGGER IS CENTRED ON THE HEAD, NOT PLACED BEHIND IT. Carl,
         // 4 August: "the bevel being affected is too far behind. There is a
         // noticable gap, even without zooming in."
         //
         // A first version used smoothstep(0.0, 0.035, uHead - pos), which only
         // reaches full brightness 0.035 of a circuit AFTER the head has gone —
         // so the glass lagged the metal by a whole core-length. On this card
         // the top edge is 0.356 of the circuit across 158px, so 0.035 is ~15px
         // of visible gap, which is exactly what Carl could see unzoomed.
         //
         // Straddling zero instead means the bevel reaches half brightness AS
         // the head passes and settles just after it — lit by the metal beside
         // it rather than trailing it. Carl's own constraint from the walk:
         // "making sure not to get ahead of itself or fall behind."
         // ⚠ OFFSET FORWARD BY THE CORE'S OWN HALF-WIDTH. The rim's core spreads
         // uCore AHEAD of the head as well as behind it, so the metal's lit edge
         // leads the head position — while a trigger centred on the head starts
         // the glass exactly at it. That difference is the residual lag: 10px
         // measured after the coordinate systems were unified, down from 15px
         // but still visible.
         //
         // The bevel is lit by the metal beside it, so its edge must follow the
         // METAL'S edge, not the head's centre.
         float lit = smoothstep(-${BEVEL_TRIGGER.toFixed(3)}, ${BEVEL_TRIGGER.toFixed(3)},
                                (uHead + uCoreLead) - pos);

         // ⚠ THE START LINE IS NOT A WALL. Carl: "both leave a straight line on
         // its starting position. This is not how heat would work... the effect
         // of heat doesnt diminish in a straight line."
         //
         // The latch alone gives a hard boundary at the origin — glass lit on
         // one side, untouched a pixel away. The bevel is being warmed BY the
         // metal beside it, so wherever the rim bleeds back past the start, the
         // glass follows.
         // ⚠ THE BEVEL'S BLEED LATCHES TOO, and that is what keeps it in step
         // with the rest of the bevel rather than dimming as the head departs.
         // The rim's version has to inherit the origin's falling heat (see its
         // note — a fixed value there produced a section that visibly lost
         // brightness and never recovered). The bevel is different: it LATCHES
         // everywhere else, so its bleed must latch too, or the one region past
         // the origin would be the only part of the glass that dims.
         float pastOrigin = 1.0 - pos;
         float bleed = (1.0 - smoothstep(0.0, uBleed, pastOrigin))
                     * smoothstep(0.0, ${BEVEL_TRIGGER.toFixed(3)}, uHead);
         lit = max(lit, bleed);

         // Before the head has travelled at all, nothing is lit. Once the
         // circuit closes, uHead reaches 1 and the whole bevel is on.
         totalEmissiveRadiance += uColor * lit * uIntensity * ${BEVEL_GLOW.toFixed(3)};
       }`,
    );
  }, []);

  return (
    <meshPhysicalMaterial
      color={BEVEL_GLASS_COLOR}
      roughness={BEVEL_ROUGHNESS}
      metalness={0}
      clearcoat={BEVEL_CLEARCOAT}
      clearcoatRoughness={BEVEL_CLEARCOAT_ROUGHNESS}
      envMap={envMap}
      envMapIntensity={envMapIntensity}
      emissive={new THREE.Color(FILAMENT_COLOR)}
      emissiveIntensity={0}
      side={THREE.DoubleSide}
      onBeforeCompile={onBeforeCompile}
    />
  );
}

/** Samples around the perimeter. Corners need the density; straights do not suffer. */
const PATH_SAMPLES = 240;

/** Segments around the half-tube's semicircular profile. */
const TUBE_PROFILE_SEGMENTS = 10;

/** Tessellation of the convex face. */
const FACE_SEGMENTS_U = 96;
const FACE_SEGMENTS_V = 32;

// ── The shared path ──────────────────────────────────────────────────────────

type PathPoint = {
  /** Position on the path, in the card's plane. */
  x: number;
  y: number;
  /** Outward unit normal, in the card's plane. */
  nx: number;
  ny: number;
};

/**
 * Sample a rounded-rectangle perimeter, with an outward normal at every point.
 *
 * ⚠ ONE SAMPLER FOR EVERY PART. The rim, the bevel and the face boundary are all
 * placed on this path at different insets, so they are TRUE PARALLEL OFFSETS by
 * construction. The contact field instead builds three separate `THREE.Shape`s
 * and relies on `insetRadius()` arithmetic to keep them concentric; that works,
 * but it expresses one silhouette three times and the copies can disagree.
 *
 * The normal is exact rather than estimated by differencing: on the straights it
 * is axis-aligned, and in a corner it is the radial direction from that corner's
 * arc centre. Differencing would round the corners' normals slightly and show up
 * as a faint facet ring under a moving light.
 */
function sampleRoundedRectPath(
  width: number,
  height: number,
  radius: number,
  samples: number,
): PathPoint[] {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw, hh));

  const straightX = 2 * (width - 2 * r); // top + bottom
  const straightY = 2 * (height - 2 * r); // left + right
  const arcs = 2 * Math.PI * r; // four quarter-turns
  const total = straightX + straightY + arcs;

  const pts: PathPoint[] = [];

  for (let i = 0; i < samples; i++) {
    // Distance travelled anticlockwise from the middle of the right edge.
    let d = (i / samples) * total;

    // 1. Right edge, upward from centre-right to the top-right arc.
    const rightHalf = hh - r;
    if (d < rightHalf) {
      pts.push({ x: hw, y: d, nx: 1, ny: 0 });
      continue;
    }
    d -= rightHalf;

    // 2. Top-right corner arc, 0 -> 90 degrees.
    const quarter = (Math.PI / 2) * r;
    if (d < quarter) {
      const a = (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 3. Top edge, rightward to leftward.
    const topRun = width - 2 * r;
    if (d < topRun) {
      pts.push({ x: hw - r - d, y: hh, nx: 0, ny: 1 });
      continue;
    }
    d -= topRun;

    // 4. Top-left corner arc, 90 -> 180 degrees.
    if (d < quarter) {
      const a = Math.PI / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 5. Left edge, downward.
    const leftRun = height - 2 * r;
    if (d < leftRun) {
      pts.push({ x: -hw, y: hh - r - d, nx: -1, ny: 0 });
      continue;
    }
    d -= leftRun;

    // 6. Bottom-left corner arc, 180 -> 270 degrees.
    if (d < quarter) {
      const a = Math.PI + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 7. Bottom edge, leftward to rightward.
    if (d < topRun) {
      pts.push({ x: -hw + r + d, y: -hh, nx: 0, ny: -1 });
      continue;
    }
    d -= topRun;

    // 8. Bottom-right corner arc, 270 -> 360 degrees.
    if (d < quarter) {
      const a = (3 * Math.PI) / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 9. Right edge, up to the starting point.
    pts.push({ x: hw, y: -hh + r + d, nx: 1, ny: 0 });
  }

  return pts;
}

/**
 * Half-width of a rounded rectangle at height `y`, measured from its centre.
 *
 * Copied from `contact-field-mesh.tsx` (which takes radius as a parameter and
 * does NOT close over `FIELD_RADIUS_PX`). Used by the face generator so the
 * face's boundary is the same curve as the swept parts rather than an
 * independent approximation.
 */
function roundedRectHalfWidthAt(y: number, halfW: number, halfH: number, r: number): number {
  const absY = Math.abs(y);
  if (absY <= halfH - r) return halfW;
  const dy = Math.min(absY - (halfH - r), r);
  return halfW - r + Math.sqrt(Math.max(0, r * r - dy * dy));
}

/**
 * Convex crown height at normalised position (u, v), each in [-1, 1].
 *
 * ⚠ SEPARABLE AND MULTIPLICATIVE — `H * longAxis * shortAxis`. Not two
 * independent heights (they do not compose in this form) and not radial: a
 * radial dome would read as a circular blister in the middle of a long card and
 * fall away far too fast across the short axis.
 *
 * The SHORT axis carries a RAISED cosine `(1 + cos(v*pi)) / 2`, which reaches
 * zero derivative at the boundary so the face meets the bevel without a crease.
 * The LONG axis holds full height across `CROWN_PLATEAU_U` and rolls off only in
 * the last `1 - CROWN_PLATEAU_U` at each end — otherwise the crown tapers to a
 * point and reads as an elliptical blister.
 *
 * Copied in form from `contact-field-mesh.tsx`'s `crownZ`, which is the shape
 * already approved there.
 */
function crownZ(u: number, v: number, crownHeight: number, plateauU: number): number {
  const shortAxis = (1 + Math.cos(v * Math.PI)) / 2;

  let longAxis = 1;
  const au = Math.abs(u);
  if (au > plateauU) {
    const t = (au - plateauU) / (1 - plateauU);
    longAxis = (1 + Math.cos(t * Math.PI)) / 2;
  }

  return crownHeight * longAxis * shortAxis;
}

// ── Swept-band builder, shared by the rim and the bevel ──────────────────────

/**
 * Build a closed swept surface by placing a profile at every path sample and
 * bridging consecutive rings.
 *
 * `profile` returns, for a parameter t in [0, 1], how far to move INWARD from
 * the path (`inward`) and how far FORWARD toward the viewer (`forward`), plus
 * the profile's own normal in that 2D cross-section.
 *
 * ⚠ THE LOOP IS CLOSED BY WRAPPING THE RING INDEX, not by appending a duplicate
 * ring — a duplicate would leave a hairline seam where the two coincident rings
 * z-fight under a moving light.
 */
function sweptBand(
  path: PathPoint[],
  profileSegments: number,
  profile: (t: number) => { inward: number; forward: number; nIn: number; nFwd: number },
): THREE.BufferGeometry {
  const rings = path.length;
  const cols = profileSegments + 1;

  const positions = new Float32Array(rings * cols * 3);
  const normals = new Float32Array(rings * cols * 3);

  for (let i = 0; i < rings; i++) {
    const p = path[i];
    for (let j = 0; j < cols; j++) {
      const t = j / profileSegments;
      const { inward, forward, nIn, nFwd } = profile(t);
      const idx = (i * cols + j) * 3;

      // Move inward along the path's own outward normal, negated.
      positions[idx] = p.x - p.nx * inward;
      positions[idx + 1] = p.y - p.ny * inward;
      positions[idx + 2] = forward;

      // The profile normal, rotated into the path's frame. The in-plane
      // component follows the path normal; the forward component is z.
      normals[idx] = p.nx * nIn;
      normals[idx + 1] = p.ny * nIn;
      normals[idx + 2] = nFwd;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < rings; i++) {
    const next = (i + 1) % rings; // wrap — closes the loop with no seam
    for (let j = 0; j < profileSegments; j++) {
      const a = i * cols + j;
      const b = next * cols + j;
      const c = next * cols + j + 1;
      const d = i * cols + j + 1;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * The convex face, as a genuinely rounded-rectangle tessellated surface.
 *
 * ⚠ A RECTANGULAR PLANE RELYING ON THE BEVEL TO HIDE ITS SQUARE CORNERS WOULD BE
 * WRONG, and would come apart the moment the material becomes transmissive: the
 * visible inner boundary would be an intersection contour rather than the face's
 * own outline, and it would change shape with crown height. Each row is inset to
 * the true rounded-rect half-width at that height.
 */
function convexFaceGeometry(
  width: number,
  height: number,
  radius: number,
  crownHeight: number,
  plateauU: number,
): THREE.BufferGeometry {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.max(0, Math.min(radius, halfW, halfH));

  const cols = FACE_SEGMENTS_U + 1;
  const rows = FACE_SEGMENTS_V + 1;
  const positions = new Float32Array(cols * rows * 3);

  for (let iy = 0; iy < rows; iy++) {
    const v = (iy / FACE_SEGMENTS_V) * 2 - 1; // -1 .. 1
    const y = v * halfH;
    const rowHalfW = roundedRectHalfWidthAt(y, halfW, halfH, r);

    for (let ix = 0; ix < cols; ix++) {
      const u = (ix / FACE_SEGMENTS_U) * 2 - 1; // -1 .. 1
      const x = u * rowHalfW;

      // ⚠ The crown is evaluated on the ROW-NORMALISED u, so the roll-off
      // follows the rounded boundary instead of a rectangle inscribed in it.
      const idx = (iy * cols + ix) * 3;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = crownZ(u, v, crownHeight, plateauU);
    }
  }

  // ⚠ WINDING IS COUNTER-CLOCKWISE SO THE NORMALS FACE +Z (the camera and the
  // light). An earlier build wound these the other way, and `computeVertexNormals`
  // duly produced normals pointing at -z — every one of 3201 of them. The face
  // was lit from BEHIND and rendered a perfectly uniform rgb(44,44,44): ambient
  // only, no directional contribution, no gradient across a convex surface.
  //
  // ⚠ AND `side: DoubleSide` HID IT. The face was still visible, so nothing
  // looked broken — it just looked flat and dark, which is exactly the symptom
  // this whole chunk exists to avoid. Caught by sampling rendered pixels and
  // finding them uniform, not by any assertion: the tilt check passed throughout
  // because it reads |normal.z| and a flipped normal has the same magnitude.
  const indices: number[] = [];
  for (let iy = 0; iy < FACE_SEGMENTS_V; iy++) {
    for (let ix = 0; ix < FACE_SEGMENTS_U; ix++) {
      const a = iy * cols + ix;
      const b = (iy + 1) * cols + ix;
      const c = (iy + 1) * cols + ix + 1;
      const d = iy * cols + ix + 1;
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  // ⚠ Computed from the surface itself, never asserted from the crown constant —
  // the verification harness reads these normals back, and a normal derived from
  // the same constant as the crown could not disprove anything.
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/** Dispose a geometry when the component unmounts. */
function useDisposable(geo: THREE.BufferGeometry) {
  useEffect(() => () => geo.dispose(), [geo]);
}

export type AnswerCardTuning = {
  tubeRadius: number;
  bevelWidth: number;
  bevelRise: number;
  crownHeight: number;
  plateauU: number;
  /**
   * How far the face's apex sits BEHIND the rim's apex, in world units.
   *
   * ⚠ POSITIVE MEANS RECESSED, AND THE DEFAULT IS RECESSED — decided by the
   * Builder on Carl's delegation, 3 August. See `FACE_SEAM_SINK` in
   * `answer-card-geometry.ts` for the four reasons. Exposed here so Carl can
   * overrule by eye; it will not go proud without a deliberate change.
   */
  faceRecess: number;
};

export const DEFAULT_TUNING: AnswerCardTuning = {
  tubeRadius: RIM_TUBE_RADIUS,
  bevelWidth: BEVEL_WIDTH,
  bevelRise: BEVEL_RISE,
  crownHeight: CROWN_HEIGHT,
  plateauU: CROWN_PLATEAU_U,
  faceRecess: FACE_SEAM_SINK - CROWN_HEIGHT,
};

/**
 * The card assembly.
 *
 * Z convention: the rim's apex sits at z = `tubeRadius` (its profile sweeps from
 * z = 0 at the outer silhouette round to z = 0 at the inner edge, peaking at the
 * top of the half-round). Everything else is placed relative to that so the
 * recess decision is expressed once.
 */
export function AnswerCardMesh({
  tuning = DEFAULT_TUNING,
  groupRef,
  glass = false,
  envMap = null,
  lightLevel = LIGHT_LEVEL,
  filament,
  glassTuning = DEFAULT_GLASS_TUNING,
  children,
}: {
  tuning?: AnswerCardTuning;
  groupRef?: React.Ref<THREE.Group>;
  /**
   * Whether the face wears glass (chunk 2) or chunk 1's diagnostic grey.
   *
   * ⚠ THE RIM AND BEVEL ARE UNAFFECTED EITHER WAY and stay grey. Colouring them
   * in the same chunk that introduces the glass would mix two variables Carl
   * could otherwise separate, and it contradicts chunk 1's own argument that
   * grey exists so a form defect cannot hide behind a plausible colour.
   */
  glass?: boolean;
  glassTuning?: GlassTuning;
  /**
   * The locally generated environment map.
   *
   * ⚠ PASSED AS A PROP, NOT ASSIGNED THROUGH A REF. An earlier version attached
   * it imperatively after mount, which drew the card unlit for a frame and then
   * forced a shader recompile — Carl saw it as *"a grey state then gets
   * brighter."* As a prop it is part of the material's first construction, so
   * there is no "before" state to correct.
   */
  envMap?: THREE.Texture | null;
  /**
   * The scene's light level, as a multiplier on every environment response.
   *
   * ⚠ IT IS A FADER, AND IT STARTS LOW BY INSTRUCTION. Carl, 4 August: *"we give
   * it one and start with it low so it has hardly no effect on the metal. We
   * bring it up to a relative level and judge it against both metal and glass."*
   * Bound to `[9]` in `?cardrig=1`.
   */
  lightLevel?: number;
  /** The travelling filament's live state. Absent means unlit. */
  filament: FilamentState;
  /**
   * Rendered INSIDE the card's group, so anything placed behind the face
   * inherits the group's `visible` flag and its entrance transform.
   *
   * ⚠ THIS IS WHY THE BACKDROP LIVES HERE RATHER THAN BESIDE THE CARD. As a
   * sibling it drew for the whole 220ms entrance delay while the card mesh was
   * still hidden, so the first thing on screen was a plain bright RECTANGLE that
   * then became the card. Carl: *"it appears as a rectangle at first, very fast,
   * no curves."*
   */
  children?: React.ReactNode;
}) {
  const { tubeRadius, bevelWidth, bevelRise, crownHeight, plateauU, faceRecess } = tuning;

  const path = useMemo(
    () => sampleRoundedRectPath(CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_RADIUS_PX, PATH_SAMPLES),
    [],
  );

  // ── RIM — the half-tube. Its outermost point IS the silhouette. ──
  //
  // The profile runs from theta = 0 (on the silhouette, z = 0) through theta =
  // pi/2 (the apex, inward by R, z = R) to theta = pi (inward by 2R, z = 0).
  //
  // ⚠ THIS IS WHY THE RIM CONSUMES 2R PER SIDE, NOT R. The sweep path is inset
  // by R so that theta = 0 lands exactly on the silhouette; theta = pi therefore
  // lands 2R inside it. The plan's first draft assumed R and its defaults failed
  // its own budget assertion.
  const rimGeometry = useMemo(() => {
    const inset = tubeRadius; // path centre-line
    const centred = path.map((p) => ({
      x: p.x - p.nx * inset,
      y: p.y - p.ny * inset,
      nx: p.nx,
      ny: p.ny,
    }));
    return sweptBand(centred, TUBE_PROFILE_SEGMENTS, (t) => {
      const theta = t * Math.PI;
      return {
        // Relative to the centre-line: outward at theta 0, inward at theta pi.
        inward: -Math.cos(theta) * tubeRadius,
        forward: Math.sin(theta) * tubeRadius,
        nIn: -Math.cos(theta),
        nFwd: Math.sin(theta),
      };
    });
  }, [path, tubeRadius]);

  // ── BEVEL — a swept band sloping inward and TOWARD THE VIEWER. ──
  //
  // ⚠ A SWEPT BAND, NOT AN `ExtrudeGeometry` BEVEL, and that choice has three
  // consequences, all wanted:
  //   1. The corners are a true parallel offset BY CONSTRUCTION, because every
  //      ring sits on the same sampled path at a different inset.
  //   2. `safeBevelSize` from the contact field has NO REFERENT here — it guards
  //      ExtrudeGeometry's inward erosion near the corner radius, and a swept
  //      band has no such erosion. Copying it would be cargo-cult.
  //   3. There is no solid front cap, so the contact field's aperture problem
  //      (cutting a real hole so the face's own outline is visible rather than
  //      an iso-height intersection contour) does not arise: a band is open.
  const bevelGeometry = useMemo(() => {
    const start = 2 * tubeRadius; // where the rim's inner edge lands
    const centred = path.map((p) => ({
      x: p.x - p.nx * start,
      y: p.y - p.ny * start,
      nx: p.nx,
      ny: p.ny,
    }));

    // Slope normal: the band rises `bevelRise` across `bevelWidth` inward.
    const len = Math.hypot(bevelWidth, bevelRise) || 1;
    const nIn = bevelRise / len; // tilts to face outward-and-forward
    const nFwd = bevelWidth / len;

    return sweptBand(centred, 4, (t) => ({
      inward: t * bevelWidth,
      forward: t * bevelRise,
      nIn,
      nFwd,
    }));
  }, [path, tubeRadius, bevelWidth, bevelRise]);

  // ── FACE — convex, and RECESSED behind the rim's apex. ──
  const faceGeometry = useMemo(() => {
    const budget = cardBudget(tubeRadius, bevelWidth);
    return convexFaceGeometry(
      budget.faceWidth,
      budget.faceHeight,
      budget.faceRadius,
      crownHeight,
      plateauU,
    );
  }, [tubeRadius, bevelWidth, crownHeight, plateauU]);

  useDisposable(rimGeometry);
  useDisposable(bevelGeometry);
  useDisposable(faceGeometry);

  // ── Where the face sits in z ──────────────────────────────────────────────
  //
  // ⚠ THE FACE JOINS THE BEVEL, NOT THE RIM, so its apex is measured from the
  // BEVEL'S INNER EDGE (`bevelRise`) — not from the rim's apex.
  //
  // ⚠ A FIRST BUILD ANCHORED THIS TO THE RIM AND THE CARD RENDERED WITH A BLACK
  // INTERIOR. With rim apex 2, recess 0.5 and crown 4.5 the face apex landed at
  // z = 1.5 while the bevel's inner edge stood at z = 2.5 — so the bevel rose
  // ABOVE the face and the face sat at the bottom of a well, correctly lit and
  // correctly invisible. The geometry was doing exactly what it was told.
  //
  // Anchoring here means the face's apex sits `faceRecess` below the lip it
  // meets, which is what "recessed behind the rim" actually has to mean once the
  // bevel rises. Raising the crown still sinks the base plane by the same
  // amount, so curvature grows BACKWARD and the apex never breaches the lip.
  const bevelInnerZ = bevelRise;
  const faceApexZ = bevelInnerZ - faceRecess;
  const faceBaseZ = faceApexZ - crownHeight;

  return (
    <group ref={groupRef}>
      {children}
      {/*
        ⚠ THE RIM IS TUNGSTEN AT REST — the filament before any current. Carl,
        4 August: *"Filaments are usually grey metal... if its metal, the light
        would have some interaction with it before it is active."*

        ⚠ `metalness: 1` AND A REAL `envMapIntensity` ARE BOTH LOAD-BEARING. A
        metal has almost no diffuse response, so the environment map IS its
        appearance — the previous `metalness: 0` with no env response could not
        read as metal at any roughness, because there was nothing for it to
        reflect. See `answer-card-glass.ts`.

        ⚠ THE HALF-TUBE EARNS ITS KEEP HERE, and it is why the profile was built
        this way. Carl: *"A half tube will emit the light in multiple directions
        as opposed to it being flat."* A curved surface presents every angle to
        the light at once, so the specular runs ALONG the rim rather than
        flashing at one spot — which is exactly what his first reference shows on
        the unlit coil.
      */}
      <mesh geometry={rimGeometry}>
        <RimMaterial
          color={RIM_METALS[glassTuning.rimMetal]?.color ?? RIM_METAL_COLOR}
          roughness={glassTuning.rimRoughness}
          envMap={envMap}
          envMapIntensity={RIM_ENV_INTENSITY * lightLevel}
          filament={filament}
        />
      </mesh>

      {/*
        ⚠ THE BEVEL IS GLASS — THE FILAMENT'S MOUNT, NOT PART OF THE CONDUCTOR.
        Carl settled it by physics: *"What would some metal be doing connected to
        a metal filament that is about to heat up?... i would imagine that the
        bevel is some sort of 'holder' that supports the filament. If its made of
        glass it would conduct and reflect the heat/light. Thus aiding with the
        bloom."*

        ⚠ REFLECTIVE, NOT TRANSMISSIVE, AND THAT IS A CHOICE — see
        `answer-card-glass.ts`. `reflect` is the operative word in Carl's own
        sentence, and a second transmissive surface per card would both cost the
        transmission pass and blur the rim/face boundary.
      */}
      <mesh geometry={bevelGeometry} position={[0, 0, 0]}>
        <BevelMaterial
          envMap={envMap}
          envMapIntensity={BEVEL_ENV_INTENSITY * lightLevel}
          filament={filament}
        />
      </mesh>

      {/*
        ⚠ THE FACE IS THE ONLY TRANSMISSIVE SURFACE, and that is a constraint
        rather than a preference. `three.module.js:18039` renders `opaqueObjects`
        ONLY into the transmission target, and the render-list split at `:8237`
        pushes anything with `transmission > 0` into a separate list. So a
        transmissive rim or bevel would DELETE ITSELF from what the face
        refracts — the card would lose its own edges.

        ⚠ AND THE RIM AND BEVEL ARE ALREADY EXCLUDED DURING THE ENTRANCE, for
        the OTHER arm of the same rule: the entrance sets `transparent = true`
        while it fades, and `transparent === true` also routes a material away
        from the opaque list. They rejoin it once the fade completes.
      */}
      <mesh geometry={faceGeometry} position={[0, 0, faceBaseZ]}>
        <meshPhysicalMaterial
          envMap={glass ? envMap : null}
          color={glass ? GLASS_COLOR : DIAG_FACE_COLOR}
          roughness={glass ? glassTuning.roughness : 0.65}
          metalness={0}
          transmission={glass ? glassTuning.transmission : 0}
          // ⚠ FIXED, NOT TUNABLE — see answer-card-glass.ts. Under an
          // orthographic camera the crown centre is at normal incidence, so the
          // maximum lateral displacement across the whole face is 0.801px.
          thickness={GLASS_THICKNESS}
          ior={GLASS_IOR}
          // ⚠ THE FACE RIDES THE SAME FADER. The pass Carl specified judges the
          // metal *"against both metal and glass"*, so the light has to come up
          // on the whole card at once — a face at fixed intensity while the rim
          // and bevel ramp would make every reading a comparison against a
          // moving reference.
          envMapIntensity={GLASS_ENV_INTENSITY * lightLevel}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Exported for the verification harness.
 *
 * ⚠ THE HARNESS MUST READ TILT FROM THESE NORMALS, SCOPED TO THE FACE ALONE.
 * The half-tube presents the full 0-90 degrees BY CONSTRUCTION — it is the whole
 * reason it was chosen — so a maximum taken across the assembly returns ~90
 * whatever the crown does, INCLUDING at crownHeight 0. A harness that cannot
 * fail is not a harness; `verify/q5-stutter.mjs` reported 0/3 CLEAN on a visible
 * defect for exactly this reason.
 */
export function buildFaceGeometryForTest(
  tubeRadius: number,
  bevelWidth: number,
  crownHeight: number,
  plateauU: number,
): THREE.BufferGeometry {
  const budget = cardBudget(tubeRadius, bevelWidth);
  return convexFaceGeometry(
    budget.faceWidth,
    budget.faceHeight,
    budget.faceRadius,
    crownHeight,
    plateauU,
  );
}
