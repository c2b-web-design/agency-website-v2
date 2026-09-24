"use client";

/* ⛔⛔ THE EXTRUDED CARD TEXT — THE "DRY" TAKE. D-094, 24 September 2026. CA ONLY,
   BEHIND `?extrude=1`.

   Carl: *"At first try the lights centred and static… Also turned all the rims off.
   At this point we dont want extraneous light 'polluting' the scene. Keep the
   light white for now… Im looking at this as a 'dry' sound first. We will add
   'effects' as we go… First just put the text in with the timings."* ⛔ The plan
   gate and the Architect are WAIVED for this piece only (D-094).

   WHAT IS HERE:
   - Geist, EXTRUDED (`public/fonts/geist-regular.typeface.json`, built by
     `scripts/build-geist-typeface.mjs`), set justified with the font's own
     advances, the letters' backs sitting ON the domed face (`faceDome`).
   - THE CHASE (`card-text-timeline.ts`): reveal and erase, left to right, at
     reading pace, looping with a rest.
   - ONE WHITE SPOT LIGHT, centred and STATIC, above and in front, angled DOWN
     (Carl: the ceiling lights are the case for downward), casting the letters'
     shadows onto the face.

   ⛔ NOT HERE, ON PURPOSE — "effects" come later, a chunk at a time: the drift of
   the light, colour, the neon, reduced motion, hidden-tab pause, CB–CS.

   ⚠ EVERY LOOK AND TIMING VALUE IS A CANDIDATE behind a ranged fader (below). */

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { neonHex, neonNumber, neonParam, wallCardsInView } from "./about-neon";
import { faceBaseZ, faceDome } from "./about-card-mesh";
import type { CardDims } from "./about-card-geometry";
import { chase, eraseLag, setJustified, type Chase, type SetLine } from "./card-text-timeline";

// ── Candidates ──────────────────────────────────────────────────────────────

export type ExtrudeSettings = {
  /** Type size, face mm. The whole-face etch was 44 on CA; the chase frees the
      size — 52 keeps ~6 slots, so the erase trails ~4 lines behind. */
  emMm: number;
  /** Extrusion depth, mm. ⚠ Shadow length ≈ depth × tan(light angle): kept
      under a stroke width (~5mm at this size) so a shadow sharpens the letter
      rather than ghosting it (D-094). */
  depthMm: number;
  wpm: number;
  lead: number;
  restMs: number;
  blockW: number;
  blockH: number;
  lineHeight: number;
  color: string;
  roughness: number;
  /** The spot: intensity, and its angle DOWN from the face's normal (degrees). */
  lightIntensity: number;
  lightAngleDeg: number;
};

/**
 * ⛔ THE START PAGE'S READING PACE — Carl, 24 September 2026: *"Slow it down to the
 * speed of the start page text."* DERIVED, not typed: `/start`'s body subtext is
 * 12 words revealed in 4200 ms (`.enquiry-subtext-mask`, `globals.css`; the copy
 * is `SUBTEXT` in `enquiry-opening.tsx`) = 171.4 wpm. ⚠ If either is retimed or
 * reworded, this is stale — unasserted; verify before relying on it.
 */
export const START_PAGE_WPM = (12 / 4200) * 60_000;

/** `?extrude=1` — the whole take is mounted only with this. */
export function extrudeEnabled(): boolean {
  return neonParam("extrude") === "1";
}

/** Read once per mount by the canvas (reload to apply). */
export function extrudeSettings(): ExtrudeSettings {
  return {
    emMm: neonNumber("textem", 52, 20, 120),
    depthMm: neonNumber("textdepth", 3, 0.5, 20),
    /* ⛔ 240 → 171.4 (START_PAGE_WPM), 24 September: *"The text reveal seems
       'chaotic'… its too fast."* */
    wpm: neonNumber("textwpm", START_PAGE_WPM, 100, 400),
    /* ⛔ The lead is OFF (1 = no faster first line) since the same change: at 0.35
       the first line ran ~3x the pace, and at the start page's speed the whole
       reveal is one pace. `?textlead=0.35` restores it. */
    lead: neonNumber("textlead", 1, 0.1, 1),
    /* ⛔ 0: Carl — *"Only when the last word has disappeared then start the cycle
       again."* The next pass begins as the card empties. `?textrest=` adds a pause. */
    restMs: neonNumber("textrest", 0, 0, 10_000),
    blockW: neonNumber("textbw", 0.94, 0.5, 1),
    blockH: neonNumber("textbh", 0.9, 0.5, 1),
    lineHeight: neonNumber("textlh", 1.35, 1, 2),
    color: neonHex("#f2f4f7", "textcolor"),
    roughness: neonNumber("textrough", 0.6, 0, 1),
    /* ⚠ 3 → 1.5 → 0.5, 24 September 2026. Carl: *"Turn down the light intensity,
       its too bright"*, then *"its still too bright. Its making the word where
       its focused 'blown out'."* MEASURED, word against the glass right behind
       it, the hotspot word vs a word outside it:
           1.5  1.87 vs 2.83     1.0  2.02 vs 2.89     0.5  2.22 vs 2.82
       ⚠ Intensity alone PLATEAUS (0.3 gives 2.32): the hotspot is the light
       MIRRORED in the glossy dome, so dimming dims the letters with it. The
       ANGLE moves it — at 0.5, `?lightangle=60` gives 2.59 vs 2.80. */
    lightIntensity: neonNumber("lighti", 0.5, 0, 50),
    lightAngleDeg: neonNumber("lightangle", 45, 10, 80),
  };
}

// ── The font ────────────────────────────────────────────────────────────────

const FONT_URL = "/fonts/geist-regular.typeface.json";
/**
 * ⚠ THE CONVERTER'S EM, IN TYPEFACE UNITS: three's TTF converter scales outlines
 * by `100000 / (unitsPerEm × 72)`, so ONE EM IS ALWAYS 100000/72 ≈ 1388.9 units
 * whatever the font's own unitsPerEm. `TextGeometry`'s `size` scales by
 * `size / resolution`, so `size = em × resolution / EM_UNITS` (≈ 0.72 em).
 * ⚠ Checked against the browser's own Geist in the run log.
 */
const EM_UNITS = 100000 / 72;
/** How far the letters' backs sink into the face, so the dome's curvature under
    a glyph never opens a gap. */
const SINK_MM = 0.3;
/** Light distance from the face's centre, mm. */
const LIGHT_DISTANCE_MM = 900;

type Built = {
  lines: SetLine[];
  flat: THREE.BufferGeometry[];
  chase: Chase;
  slots: number;
  lh: number;
  blockLeft: number;
  top: number;
};

type Props = {
  id: string;
  body: string;
  dims: CardDims;
  crownMm: number;
  settings: ExtrudeSettings;
};

export function CardExtrudedText({ id, body, dims, crownMm, settings: s }: Props) {
  const gl = useThree((st) => st.gl);
  const invalidate = useThree((st) => st.invalidate);
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const [built, setBuilt] = useState<Built | null>(null);

  const baseZ = faceBaseZ(dims);
  const hw = dims.faceWidthMm / 2;
  const hh = dims.faceHeightMm / 2;

  /* ⚠ The wipe needs the renderer's LOCAL clipping switch. It is set where the
     renderer is created (`about-card-canvas.tsx`, `onCreated`, under the flag) —
     mutating the renderer from here is a hook value the compiler lint forbids. */
  /* (checked once, on the first frame — by then `onCreated` has certainly run) */
  const clipChecked = useRef(false);

  // ── Build: font, setting, one flat geometry per line — spread over frames ──
  useEffect(() => {
    let cancelled = false;
    const flat: THREE.BufferGeometry[] = [];
    (async () => {
      let font: Font;
      try {
        font = await new FontLoader().loadAsync(FONT_URL);
      } catch (e) {
        console.error(`⛔ EXTRUDED TEXT NOT MOUNTED on ${id} — the font did not load (${FONT_URL}).`, e);
        return;
      }
      if (cancelled) return;
      const glyphs = font.data.glyphs;
      const res = font.data.resolution;
      const mmPerUnit = s.emMm / EM_UNITS;
      const missing = [...new Set([...body.replace(/\s/g, "")].filter((c) => !glyphs[c]))];
      if (missing.length) {
        console.error(`⛔ ${id.toUpperCase()} EXTRUDED TEXT: glyphs missing from the font ${JSON.stringify(missing)} — re-run scripts/build-geist-typeface.mjs.`);
      }
      const widthOf = (w: string) => [...w].reduce((a, c) => a + (glyphs[c]?.ha ?? 0), 0) * mmPerUnit;
      const space = (glyphs[" "]?.ha ?? EM_UNITS * 0.25) * mmPerUnit;

      const blockW = dims.faceWidthMm * s.blockW;
      const blockH = dims.faceHeightMm * s.blockH;
      const { lines, widestGap, overlong } = setJustified(body.split(/\s+/).filter(Boolean), widthOf, space, blockW);
      const lh = s.emMm * s.lineHeight;
      const slots = Math.floor(blockH / lh);
      if (slots < 3) {
        console.error(`⛔ ${id.toUpperCase()} EXTRUDED TEXT: only ${slots} line slots at ${s.emMm}mm — the chase needs 3. Nothing mounted.`);
        return;
      }

      /* One line per macrotask, so no single task carries the whole build (the
         Q5 lesson: a stall lands wherever it lands). Timed per line. */
      const size = (s.emMm * res) / EM_UNITS;
      for (const ln of lines) {
        await new Promise((r) => setTimeout(r, 0));
        if (cancelled) break;
        const t0 = performance.now();
        const parts = ln.words.map((w, i) => {
          const g = new TextGeometry(w, { font, size, depth: s.depthMm, curveSegments: 4, bevelEnabled: false });
          g.translate(ln.xs[i], 0, 0);
          return g.index ? g.toNonIndexed() : g;
        });
        const merged = mergeGeometries(parts);
        parts.forEach((g) => g.dispose());
        flat.push(merged);
        performance.measure(`extrude:line:${id}`, { start: t0, end: performance.now() });
      }
      if (cancelled) {
        flat.forEach((g) => g.dispose());
        return;
      }

      const ch = chase(
        lines.map((l) => l.words.length),
        { wpm: s.wpm, lead: s.lead, restMs: s.restMs, slots, lag: eraseLag(slots) },
      );
      const tris = flat.reduce((a, g) => a + g.attributes.position.count / 3, 0);
      console.info(
        `${id} extrude: ${lines.length} lines, ${slots} slots, erase ${eraseLag(slots)} lines behind · ` +
          `${s.emMm}mm, depth ${s.depthMm}mm, ${Math.round(tris).toLocaleString()} tris · ` +
          `pass ${(ch.periodMs / 1000).toFixed(1)}s at ${s.wpm} wpm (rest ${s.restMs}ms), grace ${(ch.graceMs / 1000).toFixed(1)}s · ` +
          `widest gap ${widestGap.toFixed(2)}x a space (greedy, last line left — provisional)` +
          (ch.clipped ? ` · ⛔ ${ch.clipped} erase(s) cut short to free a slot` : ""),
      );
      if (overlong.length) console.error(`⛔ ${id.toUpperCase()} EXTRUDED TEXT: words wider than the block ${JSON.stringify(overlong)} — nothing trimmed.`);

      const top = (slots * lh) / 2;
      setBuilt({ lines, flat, chase: ch, slots, lh, blockLeft: -blockW / 2, top });
    })();
    return () => {
      cancelled = true;
      flat.forEach((g) => g.dispose());
    };
  }, [id, body, dims.faceWidthMm, dims.faceHeightMm, s.emMm, s.depthMm, s.wpm, s.lead, s.restMs, s.blockW, s.blockH, s.lineHeight]);

  // ── The slots: N meshes, each with its own clipping pair ──
  type Slot = { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; reveal: THREE.Plane; erase: THREE.Plane; key: string };
  const slotsRef = useRef<Slot[]>([]);
  useEffect(() => {
    const group = groupRef.current;
    if (!built || !group) return;
    const made: Slot[] = [];
    for (let i = 0; i < built.slots; i++) {
      const reveal = new THREE.Plane();
      const erase = new THREE.Plane();
      const mat = new THREE.MeshStandardMaterial({
        color: s.color,
        roughness: s.roughness,
        metalness: 0,
        clippingPlanes: [reveal, erase],
        /* ⛔ Without this the shadow pass ignores the wipe and unrevealed words
           cast shadows. */
        clipShadows: true,
      });
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
      mesh.castShadow = true;
      mesh.visible = false;
      group.add(mesh);
      made.push({ mesh, mat, reveal, erase, key: "" });
    }
    slotsRef.current = made;
    invalidate();
    return () => {
      for (const sl of made) {
        group.remove(sl.mesh);
        sl.mesh.geometry.dispose();
        sl.mat.dispose();
      }
      slotsRef.current = [];
    };
  }, [built, s.color, s.roughness, invalidate]);

  // ── The light: shadow camera sized to the scene's own scale ──
  useEffect(() => {
    const light = lightRef.current;
    const target = targetRef.current;
    const group = groupRef.current;
    if (!light || !target || !group) return;
    light.target = target;
    group.updateWorldMatrix(true, false);
    /* The card group scales mm to world units (`1 / MM_PER_UNIT`); the shadow
       camera's near/far are in WORLD units. */
    const worldPerMm = new THREE.Vector3().setFromMatrixScale(group.matrixWorld).x;
    const d = LIGHT_DISTANCE_MM * worldPerMm;
    light.shadow.camera.near = d * 0.3;
    light.shadow.camera.far = d * 2.5;
    light.shadow.camera.updateProjectionMatrix();
    invalidate();
  }, [invalidate]);

  // ── The clock: starts once, when the wall cards are in view (D-092's check) ──
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!built) return;
    const check = () => {
      if (startRef.current === null && wallCardsInView(gl.domElement)) {
        startRef.current = performance.now();
        performance.mark(`extrude:start:${id}`);
        invalidate();
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    document.addEventListener("visibilitychange", check);
    check();
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [built, gl, id, invalidate]);

  // ── Each frame: which line is in which slot, and where its two edges are ──
  const v = useRef({ p: new THREE.Vector3(), x: new THREE.Vector3() });
  useFrame((state) => {
    if (!clipChecked.current) {
      clipChecked.current = true;
      if (!state.gl.localClippingEnabled) {
        console.error(`⛔ ${id.toUpperCase()} EXTRUDED TEXT: local clipping is OFF — the wipe cannot work. Set it in the canvas's onCreated.`);
      }
    }
    const b = built;
    const group = groupRef.current;
    const start = startRef.current;
    if (!b || !group || start === null) return;
    const slots = slotsRef.current;
    if (!slots.length) return;

    const states = b.chase.at(performance.now() - start);
    const mw = group.matrixWorld;
    const X = v.current.x.set(1, 0, 0).transformDirection(mw);
    const worldX = (xLocal: number) => v.current.p.set(xLocal, 0, 0).applyMatrix4(mw).dot(X);

    const seen = new Set<number>();
    for (const st of states) {
      const sl = slots[st.slot];
      if (!sl) continue;
      seen.add(st.slot);
      const key = `${st.line}`;
      if (sl.key !== key) {
        sl.mesh.geometry.dispose();
        sl.mesh.geometry = placeOnDome(b.flat[st.line], b, st.slot, s.emMm, baseZ, crownMm, hw, hh);
        sl.key = key;
      }
      const ln = b.lines[st.line];
      const left = b.blockLeft - 1;
      const right = b.blockLeft + ln.width + 1;
      const rx = left + st.reveal * (right - left);
      const ex = left + st.erase * (right - left);
      /* keep x ≤ rx  and  x ≥ ex, in the card's own x, expressed as world planes */
      sl.reveal.normal.copy(X).negate();
      sl.reveal.constant = worldX(rx);
      sl.erase.normal.copy(X);
      sl.erase.constant = -worldX(ex);
      sl.mesh.visible = st.reveal > 0 && st.erase < 1;
    }
    slots.forEach((sl, i) => {
      if (!seen.has(i)) sl.mesh.visible = false;
    });
    invalidate();
  });

  // ── Light placement, face-local mm: above and in front, angled DOWN ──
  const a = (s.lightAngleDeg * Math.PI) / 180;
  const lightPos: [number, number, number] = [0, LIGHT_DISTANCE_MM * Math.sin(a), baseZ + LIGHT_DISTANCE_MM * Math.cos(a)];

  return (
    <group ref={groupRef}>
      <object3D ref={targetRef} position={[0, 0, baseZ]} />
      {/* ⛔ WHITE, CENTRED, STATIC — the dry take. `decay 0` so its strength does
          not depend on the scene's mm-to-world scale. The cone is kept just past
          CA's edges so CB and the floor pair stay untouched; ⚠ watch for D-082's
          "street light" pooling. */}
      <spotLight
        ref={lightRef}
        position={lightPos}
        color="#ffffff"
        intensity={s.lightIntensity}
        angle={0.72}
        penumbra={0.35}
        decay={0}
        distance={0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />
    </group>
  );
}

/** A line's flat geometry placed in a slot: moved to its baseline, and every
    vertex lifted onto the dome at its own (x, y) — the face's formula, not a copy. */
function placeOnDome(
  flat: THREE.BufferGeometry,
  b: Built,
  slot: number,
  emMm: number,
  baseZ: number,
  crownMm: number,
  hw: number,
  hh: number,
): THREE.BufferGeometry {
  const src = flat.attributes.position;
  const pos = new Float32Array(src.count * 3);
  /* The slot's line box, centred; the baseline sits ~0.35 em below its middle so
     the capitals and x-height centre in the box. */
  const baseline = b.top - (slot + 0.5) * b.lh - 0.35 * emMm;
  for (let i = 0; i < src.count; i++) {
    const x = b.blockLeft + src.getX(i);
    const y = baseline + src.getY(i);
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = baseZ + crownMm * faceDome(x, y, hw, hh) + src.getZ(i) - SINK_MM;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  if (flat.attributes.normal) g.setAttribute("normal", (flat.attributes.normal as THREE.BufferAttribute).clone());
  return g;
}
