"use client";

/**
 * Q&A answer-card canvas — the WebGL proto card, mounted in the left margin
 * beside the live CSS grid.
 *
 * ⚠ BESIDE, NEVER ON TOP. Carl, 3 August 2026: *"Put the new card just to the
 * left of Card 1, top left. It must not be built on top. We can use it to
 * compare and contrast."* The five approved CSS cards keep working untouched;
 * this object is judged next to them.
 *
 * ⚠ ONE WORLD UNIT == ONE CSS PIXEL. The canvas uses an orthographic camera at
 * `zoom: 1`, so @react-three/fiber sets the frustum from the measured CSS size
 * and the mapping is exact at every viewport width. This is the same convention
 * the contact field uses, and it is why the measured 186.66 x 48 can be used
 * directly as geometry dimensions with no scale factor.
 *
 * ⚠ `frameloop="demand"` AND IT STAYS THAT WAY. The light here is STATIC —
 * Carl: *"There would be no animated light"* — so nothing needs a continuous
 * rAF loop. The entrance invalidates while it runs and then stops. The orbiting
 * light rig's continuous loop is the thing that cannot ship to production; this
 * chunk deliberately does not inherit that cost.
 *
 * GEOMETRY PROOF ONLY: no glass, no transmission, no environment map, no
 * filament, no text.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  AnswerCardMesh,
  DEFAULT_TUNING,
  DEFAULT_GLASS_TUNING,
  type AnswerCardTuning,
  type GlassTuning,
} from "./answer-card-mesh";
import {
  ENV_SHELL_RADIUS,
  ENV_KEY_COLOR,
  ENV_KEY_INTENSITY,
  ENV_FILL_COLOR,
  ENV_FILL_INTENSITY,
  STANDIN_DEPTH,
  buildStandInTexture,
  standInMaterial,
} from "./answer-card-glass";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RISE_DURATION_MS,
  CARD_RISE_TRANSLATE_PX,
  PROTO_MIN_VIEWPORT_PX,
  protoCanvasBox,
  cardBudget,
  checkBudget,
  maxFaceTiltDegrees,
  MIN_FACE_TILT_DEGREES,
} from "./answer-card-geometry";

/**
 * Padding around the card inside the canvas, so the rim's outermost pixels and
 * any shading are not clipped by the canvas edge.
 */
const CANVAS_PAD_PX = 12;

/**
 * How long the Q5 phrase wipe runs, in ms.
 *
 * ⚠ READ OFF `.enquiry-q-text-reveal` IN `globals.css`, the same declaration
 * `enquiry-opening.tsx`'s own `Q5_REVEAL_CLEAR_MS` is derived from. That file
 * records the history: the value was 700 until 30 July, when Carl saw the
 * stutter MOVE from the "Wh" of "What" to the "h" of "here" — 700ms is ~54% of
 * the way through a 1300ms wipe, so the work had been pushed into the remainder
 * rather than removed. **A moved symptom is not a fixed symptom.**
 */
const Q5_REVEAL_CLEAR_MS = 1300;

// ── Tuning harness ───────────────────────────────────────────────────────────

const RIG_PARAMS = [
  { key: "tubeRadius", label: "rim tube radius R", step: 0.25, min: 0.5, max: 6 },
  { key: "bevelWidth", label: "bevel width", step: 0.5, min: 1, max: 12 },
  { key: "bevelRise", label: "bevel rise", step: 0.25, min: 0, max: 8 },
  { key: "crownHeight", label: "crown height", step: 0.25, min: 0, max: 12 },
  { key: "plateauU", label: "crown plateau (long axis)", step: 0.02, min: 0, max: 0.95 },
  { key: "faceRecess", label: "face recess behind rim apex", step: 0.25, min: -2, max: 6 },
] as const;

/**
 * Chunk 2's material controls, on `[7]` and `[8]`.
 *
 * ⚠ TWO KNOBS, NOT FOUR. `thickness` and `ior` are deliberately absent: under an
 * orthographic camera their maximum effect across the whole face is 0.801px, so
 * exposing them would move numbers and change nothing visible — this project's
 * own logged trap, where a measurable change the eye cannot see means the metric
 * is not tracking what is being judged.
 *
 * ⚠ AND THERE IS NO "STAND-IN OPACITY" CONTROL. Driving opacity requires
 * `transparent: true`, which removes the backdrop from the transmission pass's
 * opaque list — the glass would stop seeing it entirely, presenting as "the
 * frost went flat" with every assertion still green.
 */
const GLASS_RIG_PARAMS = [
  { key: "roughness", label: "roughness (THE FROST)", step: 0.02, min: 0, max: 1 },
  { key: "transmission", label: "transmission", step: 0.05, min: 0, max: 1 },
] as const;

type RigParamKey = (typeof RIG_PARAMS)[number]["key"];
type GlassRigParamKey = (typeof GLASS_RIG_PARAMS)[number]["key"];

/**
 * Keyboard tuning, mirroring `useLightRig` in `contact-field-light-rig.tsx`.
 *
 * ⚠ GATED ON `?cardrig=1` AND **NOT** DEFAULTED ON FOR LOCALHOST, unlike the
 * orbiting light. That rig earned its localhost default by being a finished,
 * judged effect; this one binds the ARROW KEYS, which would otherwise be live on
 * every local page load — including while Carl is typing in the contact field at
 * completion.
 *
 * ⚠ THE INPUT GUARD IS LOAD-BEARING for the same reason: the corridor has real
 * text inputs, and a tuning rig that swallows arrow keys inside them would be a
 * genuine bug rather than a harmless dev affordance.
 */
function useCardRig(): {
  enabled: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
  strokes: boolean;
} {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("cardrig") === "1",
  );
  const [tuning, setTuning] = useState<AnswerCardTuning>(DEFAULT_TUNING);
  /**
   * ⚠ `?roughness=` AND `?standin=0` EXIST FOR THE HARNESS, not for tuning by
   * hand. The chunk's product is a table of "at what roughness does each stroke
   * width stop being distinguishable", which requires sweeping roughness from
   * outside the page and capturing a stand-in-free reference frame. Both are
   * read once at mount; the keyboard rig remains the interactive route.
   */
  const [glassTuning, setGlassTuning] = useState<GlassTuning>(() => {
    if (typeof window === "undefined") return DEFAULT_GLASS_TUNING;
    const q = new URLSearchParams(window.location.search).get("roughness");
    const r = q === null ? NaN : Number(q);
    return Number.isFinite(r)
      ? { ...DEFAULT_GLASS_TUNING, roughness: Math.min(1, Math.max(0, r)) }
      : DEFAULT_GLASS_TUNING;
  });
  const [selected, setSelected] = useState<RigParamKey | GlassRigParamKey>("roughness");
  // ⚠ THE BACKDROP IS ALWAYS ON; ONLY THE CALIBRATION STROKES ARE OPTIONAL, and
  // that split took two corrections to arrive at.
  //
  // It first shipped with the strokes ON, so an ordinary load showed four white
  // bars across the card and Carl reasonably asked what they were — a
  // measurement instrument rendering by default reads as a design decision.
  // Turning the whole stand-in OFF then removed the backdrop too, and the card
  // became a pale grey slab: *"No glass."*
  //
  // ⚠ BOTH REPORTS HAVE ONE CAUSE — GLASS OVER A NEAR-BLACK PAGE SHOWS
  // NEAR-BLACK. The backdrop is not decoration; it is the only thing that makes
  // the material visible at all, which is precisely why chunk 3 exists.
  //
  // So the default is the corridor's blue→teal wash with no strokes. `?standin=1`
  // adds them for a tuning session; `[s]` toggles them live.
  const [strokes, setStrokes] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("standin") === "1",
  );

  useEffect(() => {
    if (!enabled) return;

    const report = (t: AnswerCardTuning, g: GlassTuning) => {
      const check = checkBudget(t.tubeRadius, t.bevelWidth);
      const tilt = maxFaceTiltDegrees(t.crownHeight, t.tubeRadius, t.bevelWidth);
      const mark = (k: string) => (k === selected ? "▶" : " ");
      console.log(
        [
          "── card rig ──────────────────────────────",
          "  GEOMETRY  [1-6]",
          ...RIG_PARAMS.map(
            (p) => `${mark(p.key)} ${p.label.padEnd(30)} ${t[p.key].toFixed(2)}`,
          ),
          "  GLASS  [7-8]",
          ...GLASS_RIG_PARAMS.map(
            (p) => `${mark(p.key)} ${p.label.padEnd(30)} ${g[p.key].toFixed(2)}`,
          ),
          `  calibration strokes [s]        ${strokes ? "on" : "off"}`,
          "  ─────",
          `  face                           ${check.budget.faceWidth.toFixed(2)} x ${check.budget.faceHeight.toFixed(2)}`,
          `  face corner radius             ${check.budget.faceRadius.toFixed(2)}`,
          `  face height ratio              ${(check.budget.faceHeightRatio * 100).toFixed(1)}%`,
          // ⚠ Analytic prediction, for tuning only. Verification reads the built
          // geometry's own normals — see maxFaceTiltDegrees's own warning.
          `  max face tilt (predicted)      ${tilt.toFixed(2)}° (floor ${MIN_FACE_TILT_DEGREES}°)`,
          check.ok ? "  budget OK" : `  ⚠ BUDGET FAIL: ${check.failures.join("; ")}`,
          tilt >= MIN_FACE_TILT_DEGREES ? "  tilt OK" : "  ⚠ TILT BELOW FLOOR — convexity will not read",
          // ⚠ thickness and ior are FIXED and absent by design — under an
          // orthographic camera their whole-face effect is 0.801px.
          "  (thickness/ior fixed — 0.8px max effect under ortho)",
        ].join("\n"),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }

      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setStrokes((v) => !v);
        return;
      }

      const numeric = Number(e.key);
      if (numeric >= 1 && numeric <= RIG_PARAMS.length) {
        e.preventDefault();
        setSelected(RIG_PARAMS[numeric - 1].key);
        return;
      }
      if (numeric > RIG_PARAMS.length && numeric <= RIG_PARAMS.length + GLASS_RIG_PARAMS.length) {
        e.preventDefault();
        setSelected(GLASS_RIG_PARAMS[numeric - RIG_PARAMS.length - 1].key);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        setTuning((t) => {
          setGlassTuning((g) => {
            report(t, g);
            return g;
          });
          return t;
        });
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;

        const glassSpec = GLASS_RIG_PARAMS.find((p) => p.key === selected);
        if (glassSpec) {
          setGlassTuning((g) => {
            const next = {
              ...g,
              [glassSpec.key]: Math.min(
                glassSpec.max,
                Math.max(glassSpec.min, g[glassSpec.key] + dir * glassSpec.step),
              ),
            };
            setTuning((t) => {
              report(t, next);
              return t;
            });
            return next;
          });
          return;
        }

        // Narrowed by `find` on the geometry bank: reaching here means `selected`
        // is a geometry key, since the glass branch above returns.
        const spec = RIG_PARAMS.find((p) => p.key === selected);
        if (!spec) return;
        const key = spec.key;
        setTuning((t) => {
          const next = {
            ...t,
            [key]: Math.min(spec.max, Math.max(spec.min, t[key] + dir * spec.step)),
          };
          setGlassTuning((g) => {
            report(next, g);
            return g;
          });
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKey);
    console.log(
      "card rig active — [1-6] geometry, [7-8] glass, [s] stand-in, [↑/↓] adjust, [0] print",
    );
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, selected, strokes]);

  return { enabled, tuning, glassTuning, strokes };
}

// ── Entrance ─────────────────────────────────────────────────────────────────

/**
 * The card's entrance, matching CSS card 1 exactly.
 *
 * ⚠ CARRIED ACROSS, NOT REINVENTED — 700ms linear at a 220ms delay, opacity
 * 0 → 1 with a 6px rise. Carl: *"We will be moving it at the appropriate time
 * into place so the timing will stay."* Matching it means the two cards arrive
 * together and can be compared from the first frame.
 *
 * ⚠ DISABLED UNDER `prefers-reduced-motion`, because the CSS rule that drives
 * card 1 is disabled there too. A WebGL card that animated while its neighbour
 * did not would be a defect the CSS explicitly avoids.
 */
function useCardEntrance(active: boolean, reducedMotion: boolean) {
  const groupRef = useRef<THREE.Group | null>(null);
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠ HIDE THE GROUP THE MOMENT THE REF IS ATTACHED, NOT IN AN EFFECT.
   *
   * A ref callback runs during commit, BEFORE the renderer draws. `useEffect`
   * runs AFTER, so a group created at its default `visible = true, opacity = 1`
   * is drawn at full brightness for at least one frame before the entrance can
   * set its start state — the card FLASHES INTO EXISTENCE, vanishes, then fades
   * in properly. Carl reported exactly that: *"comes into view very quickly,
   * disappears then back into view."*
   *
   * Setting it here means the first frame the renderer ever sees is already the
   * entrance's frame 0.
   */
  const attachGroup = useCallback(
    (group: THREE.Group | null) => {
      groupRef.current = group;
      if (!group) return;
      // ⚠ HIDDEN AT ATTACH, and shown by the tick loop's very first frame. The
      // ref callback runs during commit, BEFORE the renderer draws, so this
      // guarantees the card is never drawn at its pre-entrance position. There
      // is no hidden→visible step on screen because the first drawn frame is
      // already the entrance's frame 0.
      group.visible = false;
      group.position.y = -CARD_RISE_TRANSLATE_PX;
    },
    [],
  );

  /**
   * Whether the entrance fade is still running.
   *
   * ⚠ THE FADE AND THE GLASS FIGHT EACH OTHER, and this is the third stage Carl
   * reported: *"fades in, moves slightly up then brightens."*
   *
   * The fade drives `material.opacity`, which requires `transparent = true` on
   * every sub-mesh. But `three.module.js:8237` routes ANY material with
   * `transparent === true` out of the opaque list, and `:18039` renders only
   * `opaqueObjects` into the transmission target. **So for the whole 700ms rise,
   * the rim and bevel are invisible to the glass refracting them** — and the
   * card visibly changes when the fade ends and they rejoin the opaque list.
   *
   * ⚠ IT IS THE SAME CONSTRAINT THIS CHUNK ALREADY DOCUMENTED FOR THE STAND-IN,
   * arriving from the other direction. The stand-in was made opaque on purpose;
   * the entrance was quietly making everything else transparent.
   *
   * ⚠ SO THE OPACITY FADE IS REMOVED AND THE 6px RISE IS KEPT. The meshes stay
   * opaque throughout, the transmission target never changes membership, and the
   * card is fully-formed glass from its first visible frame.
   *
   * ⚠ THIS IS A DEPARTURE FROM CARD 1's CSS ENTRANCE, which fades opacity 0 -> 1
   * as well as rising. It is accepted for the proto because Carl has already
   * settled that the test object's entrance does not need to match: *"the new
   * card is a test, it's not important it reveals with card 1, only that it's
   * there."*
   *
   * ⚠ AND IT IS A REAL CONSTRAINT FOR CHUNK 5, not a temporary shortcut. A
   * transmissive card CANNOT cross-fade by material opacity without dropping its
   * own neighbours out of the refraction for the duration. When the rollout
   * needs the approved 700ms/220ms fade, the route is a group-level effect
   * (scale, position, or a masked reveal) — never per-material opacity.
   */

  /**
   * ⚠ THE ENTRANCE RUNS ONCE PER ACTIVATION, GUARDED BY A REF.
   *
   * Without this the effect re-ran on every unrelated re-render — the card rig's
   * `selected` state churn is enough — resetting `start` and replaying the fade
   * from zero. That is the second half of the reported flash: the card
   * disappearing and coming back.
   */
  const playedRef = useRef(false);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (!active) {
      group.visible = false;
      playedRef.current = false;
      invalidate();
      return;
    }

    if (playedRef.current) return;
    playedRef.current = true;

    // ⚠ DELIBERATELY NOT `group.visible = true` HERE.
    //
    // An earlier version did, and the tick loop then set it straight back to
    // false for the 220ms delay — so the card rendered at full brightness for
    // one frame before disappearing and rising. That was the last of Carl's
    // four entrance reports: *"it appears, flashes and moves up."*
    //
    // Visibility is owned by the tick loop alone, from here on. There is exactly
    // one place that decides whether the group is on screen.

    if (reducedMotion) {
      group.visible = true;
      group.position.y = 0;
      invalidate();
      return;
    }

    // ⚠ NO ENTRANCE DELAY. `CARD_RISE_DELAY_MS` (220) exists to stagger card 1
    // against its four neighbours in the CSS grid. This proto card has no
    // neighbours, and it already mounts ~1300ms after the CSS cards because it
    // waits out the phrase wipe — so a further 220ms of deliberate invisibility
    // buys nothing and was the source of a visible hidden→visible step.
    //
    // ⚠ THE STAGGER RETURNS IN CHUNK 5, where it means something: five cards on
    // the approved 220/350/480/610/740 ladder.
    let raf = 0;
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;

      // ⚠ VISIBLE FROM THE FIRST FRAME, ALREADY RISING. There is no hidden state
      // to step out of, so there is nothing that can flash.
      //
      // ⚠ AND `visible` IS USED RATHER THAN `material.opacity`, which would
      // require `transparent = true` and drop the rim and bevel out of the
      // transmission target for the whole rise. See the note on `attachGroup`.
      group.visible = true;

      // `linear`, matching the CSS keyframe's timing function exactly.
      const t = Math.min(1, elapsed / CARD_RISE_DURATION_MS);
      // World +y is UP and the CSS translate is DOWN, hence the negation.
      group.position.y = -CARD_RISE_TRANSLATE_PX * (1 - t);
      invalidate();

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reducedMotion, invalidate]);

  return attachGroup;
}

// ── Scene ────────────────────────────────────────────────────────────────────

/**
 * The environment map, generated entirely locally.
 *
 * ⚠ NO HDRI, NO CDN, NO NETWORK REQUEST. A small scene of `MeshBasicMaterial`
 * reflection panels is converted to a prefiltered radiance map by
 * `PMREMGenerator.fromScene()` on the GPU.
 *
 * ⚠ THE PATTERN IS COPIED FROM `useStudioEnvMap` IN `contact-field-canvas.tsx`;
 * THE VALUES ARE NOT. That rig's key is warm gold at intensity 7.0, tuned for a
 * gold bevel — wrong for blue glass, and its constants are `protected` because
 * tuning this card must not move an approved object.
 *
 * ⚠ THE MAP IS BUILT IN `useMemo` AND HANDED TO THE MATERIAL BY A CALLBACK REF,
 * which is a DEPARTURE from `useStudioEnvMap`'s effect-based lifecycle. The
 * reason is the lint rules, and it is worth recording because the contact
 * field's shape looks like the obvious precedent to copy:
 *
 *   - Holding the material in a container and assigning `envMap` inside an
 *     effect trips `react-hooks/immutability` in EVERY form tried —
 *     `useState<RefObject>`, a one-element `useState` array (exactly
 *     `useStudioEnvMap`'s shape), `useMemo`, and a forwarded ref. The rule
 *     traces provenance through wrapper objects, array elements and hook
 *     arguments alike.
 *   - Publishing the texture with `setEnvMap` inside the effect then trips
 *     `react-hooks/set-state-in-effect` — the SAME rule as the project's one
 *     accepted pre-existing error. Trading one rule for another is not a fix.
 *
 * ⚠ SO THE ALLOCATION MOVES OUT OF THE EFFECT, and the Strict Mode concern that
 * motivated `useStudioEnvMap`'s choice is handled instead by disposing the
 * PREVIOUS target whenever a new one is built, plus on unmount. A stranded
 * double-invoke allocation is released by the next run rather than leaking.
 *
 * The rest of the discipline is unchanged and still earns its place: DETACH
 * FROM THE MATERIAL BEFORE DISPOSING (so a disposed texture can never be
 * sampled), and `invalidate()` because the canvas runs `frameloop="demand"`.
 */
function useLocalEnvMap(): THREE.Texture {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  const target = useMemo(() => {
    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

    // Panels are things to be SEEN IN a reflection, not lights: colour
    // pre-multiplied by intensity, `toneMapped: false`. Large rather than
    // fierce — a curved face reflects a wide arc, so a big soft source reads as
    // a satin sweep rather than a hot pinpoint.
    const panel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      size: [number, number],
    ) => {
      const geometry = new THREE.PlaneGeometry(size[0], size[1]);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    };

    const shellGeometry = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 16, 16);
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide,
      toneMapped: false,
    });
    studio.add(new THREE.Mesh(shellGeometry, shellMaterial));
    disposables.push(shellGeometry, shellMaterial);

    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY, [-16, 22, 18], [70, 38]);
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY, [18, -16, 14], [48, 26]);

    const pmrem = new THREE.PMREMGenerator(gl);
    const built = pmrem.fromScene(studio, 0, 0.1, 200);
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    studio.clear();

    return built;
  }, [gl]);

  // Dispose the previous target when a new one is built, and on unmount. This
  // is what replaces the effect-based allocation: a Strict Mode double-invoke
  // leaves its first target to be released here rather than stranded.
  useEffect(() => {
    invalidate();
    return () => {
      target.dispose();
      invalidate();
    };
  }, [target, invalidate]);

  // ⚠ THE TEXTURE IS RETURNED FOR A DECLARATIVE `envMap` PROP, NOT ASSIGNED
  // THROUGH A CALLBACK REF.
  //
  // The callback-ref version attached the map correctly, but only AFTER the
  // material had been created — so the first render drew the card with no
  // environment, and `needsUpdate = true` then forced a shader recompile.
  // Carl saw the result: *"Card appears in a grey state then gets brighter."*
  // Measured 3 August — draws 1-4 at +236ms after mount, then the corrected
  // draws at +264ms.
  //
  // Passing the texture as a prop means it is part of the material's FIRST
  // construction: there is no unlit frame and no recompile, because there is
  // no "before" state to correct.
  return target.texture;
}

/**
 * The calibration stand-in — an OPAQUE plane behind the card.
 *
 * ⚠ OPAQUE ON BOTH COUNTS: `transmission: 0` AND `transparent: false`. The
 * transmission pass renders `opaqueObjects` only, and `transparent === true`
 * routes a material away from that list just as surely as transmission does. A
 * transparent stand-in would be INVISIBLE to the glass refracting it, and would
 * present as "the frost went flat" with every assertion still green.
 */
/**
 * The calibration backdrop.
 *
 * ⚠ RENDERED INSIDE THE CARD'S OWN GROUP, NOT BESIDE IT — see `CardScene`.
 */
function StandIn({ withStrokes }: { withStrokes: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  const { texture, material } = useMemo(() => {
    const budget = cardBudget();
    const tex = buildStandInTexture(budget.faceWidth, budget.faceHeight, withStrokes);
    return { texture: tex, material: standInMaterial(tex) };
  }, [withStrokes]);

  useEffect(() => {
    invalidate();
    return () => {
      material.dispose();
      texture.dispose();
    };
  }, [material, texture, invalidate]);

  const budget = useMemo(() => cardBudget(), []);

  // ⚠ ALWAYS VISIBLE. The backdrop is what makes the card read as glass at all;
  // only the calibration strokes are optional.
  return (
    <mesh position={[0, 0, -STANDIN_DEPTH]} material={material}>
      <planeGeometry args={[budget.faceWidth, budget.faceHeight]} />
    </mesh>
  );
}

function CardScene({
  active,
  reducedMotion,
  tuning,
  glassTuning,
  strokes,
}: {
  active: boolean;
  reducedMotion: boolean;
  tuning: AnswerCardTuning;
  glassTuning: GlassTuning;
  strokes: boolean;
}) {
  const groupRef = useCardEntrance(active, reducedMotion);
  const envMap = useLocalEnvMap();

  return (
    <>
      {/*
        Static diagnostic lighting. Above and slightly LEFT, which is the
        direction the six CSS inset shadows already imply: top bright, left
        secondary at roughly a third of it, bottom and right as depth shadow
        (`app/globals.css`, the `.enquiry-card` box-shadow stack). Matching that
        direction means the WebGL card is lit the same way as its neighbour, so a
        difference between them is a difference of FORM rather than of lighting.
      */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[-60, 90, 120]} intensity={2.1} />
      {/* A weak fill from below-right stops the lower bevel going fully black,
          which would read as a missing surface rather than a shadowed one. */}
      <directionalLight position={[70, -60, 60]} intensity={0.35} />

      {/*
        ⚠ THE BACKDROP RENDERS INSIDE THE CARD'S GROUP so it inherits `visible`
        and the entrance transform. As a sibling it drew for the whole 220ms
        entrance delay while the card mesh was still hidden, so the first thing
        on screen was a plain bright RECTANGLE that then became the card — Carl:
        *"it appears as a rectangle at first, very fast, no curves."*
      */}
      <AnswerCardMesh
        tuning={tuning}
        groupRef={groupRef}
        glass
        glassTuning={glassTuning}
        envMap={envMap}
      >
        <StandIn withStrokes={strokes} />
      </AnswerCardMesh>
    </>
  );
}

/**
 * The proto card canvas.
 *
 * ⚠ RENDERS ONLY AT >= 1280px. The card plus its gutter needs ~211px of free
 * margin. Measured: 432px at 1440 and 352px at 1280, but only 200px at 1024 —
 * where it would overflow the viewport and add a horizontal scrollbar. Below
 * this width it is simply absent and the CSS grid behaves exactly as it does
 * today.
 */
export default function AnswerCardCanvas({ active }: { active: boolean }) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  /**
   * ⚠ THE CANVAS DEFERS ITS OWN WEBGL SETUP PAST THE Q5 PHRASE WIPE.
   *
   * The stutter Carl reported on the "W" and "h" of "What" was this canvas's
   * Three.js initialisation landing inside the 1300ms reveal — measured at
   * +58-64ms with a 1827-2138ms long task behind it, 3/3 cold runs.
   *
   * ⚠ A FIRST FIX GATED THE MOUNT ON `canvasWarm` IN `enquiry-opening.tsx`. It
   * removed the stutter but was the WRONG INSTRUMENT: that gate is derived from
   * the CONTACT FIELD's warm-up and only clears once an idle opportunity arrives
   * after it, so the proto card arrived at +8270ms — roughly 1330ms AFTER its
   * CSS neighbours, which appear at +6938ms. Carl: *"the card arrives too
   * late."*
   *
   * ⚠ AND THE CORRIDOR'S OWN TIMING IS WHY A BEGIN-RELATIVE GUARD CANNOT WORK.
   * The answer cards do not appear when Begin is pressed; they arrive ~6.9s
   * later, after the opening phrase choreography. The reveal that must be
   * protected is the one that starts WHEN THIS COMPONENT MOUNTS, so the delay
   * has to be measured from here rather than inherited from a gate anchored to
   * Begin.
   *
   * Q5_REVEAL_CLEAR_MS (1300) is read off `.enquiry-q-text-reveal` in
   * `globals.css` — the same declaration `enquiry-opening.tsx` derives its own
   * guard from. Duplicated as a local constant rather than imported because this
   * file must not depend on an approved-foundation module for a value it only
   * needs to wait out.
   *
   * ⚠ REDUCED MOTION SKIPS THE WAIT. `.enquiry-q-text-reveal` has
   * `animation: none` under `prefers-reduced-motion`, so there is no wipe to
   * protect and waiting would delay the card guarding an animation that never
   * runs — the exact failure mode `enquiry-opening.tsx` documents for its own
   * guards.
   *
   * ⚠ THE COST: THE PROTO ARRIVES ~1300ms AFTER THE CSS CARDS, AND THAT IS
   * ACCEPTED. Measured 3 August — the CSS cards and the phrase wipe both start
   * at +6982ms after Begin and the wipe ends at +8282ms, so the two genuinely
   * compete for the same window. The card cannot match card 1's 220ms entrance
   * without putting the stutter back.
   *
   * Carl, 3 August: *"the new card is a test, it's not important it reveals
   * with card 1, only that it's there."* **So the lag is deliberate, not
   * outstanding.**
   *
   * ⚠ IT BECOMES A REAL QUESTION IN CHUNK 5, when the card moves into the grid
   * and must arrive on the approved 700ms/220ms ladder. The fix at that point is
   * to warm the canvas during the opening choreography — mounted hidden, well
   * before the cards, so its setup lands in dead time — NOT to shorten this
   * wait. `enquiry-opening.tsx` records why: a moved symptom is not a fixed one.
   */
  const [revealCleared, setRevealCleared] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setRevealCleared(true), Q5_REVEAL_CLEAR_MS);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  const [wideEnough, setWideEnough] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${PROTO_MIN_VIEWPORT_PX}px)`);
    const apply = () => setWideEnough(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { tuning, glassTuning, strokes } = useCardRig();

  const box = useMemo(() => protoCanvasBox(), []);

  if (!wideEnough || !revealCleared) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="answer-card-proto"
      style={{
        position: "absolute",
        left: box.left - CANVAS_PAD_PX,
        top: box.top - CANVAS_PAD_PX,
        width: box.width + CANVAS_PAD_PX * 2,
        height: box.height + CANVAS_PAD_PX * 2,
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
        <CardScene
          active={active}
          reducedMotion={reducedMotion}
          tuning={tuning}
          glassTuning={glassTuning}
          strokes={strokes}
        />
      </Canvas>
    </div>
  );
}

export { CARD_WIDTH_PX, CARD_HEIGHT_PX };
