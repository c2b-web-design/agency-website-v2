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
import { AnswerCardMesh, DEFAULT_TUNING, type AnswerCardTuning } from "./answer-card-mesh";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RISE_DURATION_MS,
  CARD_RISE_DELAY_MS,
  CARD_RISE_TRANSLATE_PX,
  PROTO_MIN_VIEWPORT_PX,
  protoCanvasBox,
  checkBudget,
  maxFaceTiltDegrees,
  MIN_FACE_TILT_DEGREES,
} from "./answer-card-geometry";

/**
 * Padding around the card inside the canvas, so the rim's outermost pixels and
 * any shading are not clipped by the canvas edge.
 */
const CANVAS_PAD_PX = 12;

// ── Tuning harness ───────────────────────────────────────────────────────────

const RIG_PARAMS = [
  { key: "tubeRadius", label: "rim tube radius R", step: 0.25, min: 0.5, max: 6 },
  { key: "bevelWidth", label: "bevel width", step: 0.5, min: 1, max: 12 },
  { key: "bevelRise", label: "bevel rise", step: 0.25, min: 0, max: 8 },
  { key: "crownHeight", label: "crown height", step: 0.25, min: 0, max: 12 },
  { key: "plateauU", label: "crown plateau (long axis)", step: 0.02, min: 0, max: 0.95 },
  { key: "faceRecess", label: "face recess behind rim apex", step: 0.25, min: -2, max: 6 },
] as const;

type RigParamKey = (typeof RIG_PARAMS)[number]["key"];

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
function useCardRig(): { enabled: boolean; tuning: AnswerCardTuning } {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("cardrig") === "1",
  );
  const [tuning, setTuning] = useState<AnswerCardTuning>(DEFAULT_TUNING);
  const [selected, setSelected] = useState<RigParamKey>("crownHeight");

  useEffect(() => {
    if (!enabled) return;

    const report = (t: AnswerCardTuning) => {
      const check = checkBudget(t.tubeRadius, t.bevelWidth);
      const tilt = maxFaceTiltDegrees(t.crownHeight, t.tubeRadius, t.bevelWidth);
      console.log(
        [
          "── card rig ──────────────────────────────",
          ...RIG_PARAMS.map(
            (p) =>
              `${p.key === selected ? "▶" : " "} ${p.label.padEnd(30)} ${t[p.key].toFixed(2)}`,
          ),
          `  face                           ${check.budget.faceWidth.toFixed(2)} x ${check.budget.faceHeight.toFixed(2)}`,
          `  face corner radius             ${check.budget.faceRadius.toFixed(2)}`,
          `  face height ratio              ${(check.budget.faceHeightRatio * 100).toFixed(1)}%`,
          // ⚠ Analytic prediction, for tuning only. Verification reads the built
          // geometry's own normals — see maxFaceTiltDegrees's own warning.
          `  max face tilt (predicted)      ${tilt.toFixed(2)}° (floor ${MIN_FACE_TILT_DEGREES}°)`,
          check.ok ? "  budget OK" : `  ⚠ BUDGET FAIL: ${check.failures.join("; ")}`,
          tilt >= MIN_FACE_TILT_DEGREES ? "  tilt OK" : "  ⚠ TILT BELOW FLOOR — convexity will not read",
        ].join("\n"),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) {
        return;
      }

      const numeric = Number(e.key);
      if (numeric >= 1 && numeric <= RIG_PARAMS.length) {
        e.preventDefault();
        setSelected(RIG_PARAMS[numeric - 1].key);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        setTuning((t) => {
          report(t);
          return t;
        });
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;
        const spec = RIG_PARAMS.find((p) => p.key === selected);
        if (!spec) return;
        setTuning((t) => {
          const next = {
            ...t,
            [selected]: Math.min(spec.max, Math.max(spec.min, t[selected] + dir * spec.step)),
          };
          report(next);
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKey);
    console.log(
      "card rig active — [1-6] select parameter, [↑/↓] adjust, [0] print all values",
    );
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, selected]);

  return { enabled, tuning };
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
      group.visible = false;
      group.position.y = -CARD_RISE_TRANSLATE_PX;
      group.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m) {
          m.transparent = true;
          m.opacity = 0;
        }
      });
    },
    [],
  );

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

    group.visible = true;

    if (reducedMotion) {
      group.position.y = 0;
      group.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m) {
          m.transparent = false;
          m.opacity = 1;
        }
      });
      invalidate();
      return;
    }

    let raf = 0;
    const start = performance.now();

    const setOpacity = (v: number) => {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        const m = mesh.material as THREE.Material | undefined;
        if (m) {
          m.transparent = v < 1;
          m.opacity = v;
        }
      });
    };

    const tick = () => {
      const elapsed = performance.now() - start - CARD_RISE_DELAY_MS;

      if (elapsed < 0) {
        setOpacity(0);
        group.position.y = -CARD_RISE_TRANSLATE_PX;
        invalidate();
        raf = requestAnimationFrame(tick);
        return;
      }

      // `linear`, matching the CSS keyframe's timing function exactly.
      const t = Math.min(1, elapsed / CARD_RISE_DURATION_MS);
      setOpacity(t);
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

function CardScene({
  active,
  reducedMotion,
  tuning,
}: {
  active: boolean;
  reducedMotion: boolean;
  tuning: AnswerCardTuning;
}) {
  const groupRef = useCardEntrance(active, reducedMotion);

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

      <AnswerCardMesh tuning={tuning} groupRef={groupRef} />
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

  const [wideEnough, setWideEnough] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${PROTO_MIN_VIEWPORT_PX}px)`);
    const apply = () => setWideEnough(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { tuning } = useCardRig();

  const box = useMemo(() => protoCanvasBox(), []);

  if (!wideEnough) return null;

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
        <CardScene active={active} reducedMotion={reducedMotion} tuning={tuning} />
      </Canvas>
    </div>
  );
}

export { CARD_WIDTH_PX, CARD_HEIGHT_PX };
