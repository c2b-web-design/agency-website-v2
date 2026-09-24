"use client";

/* ⛔⛔ THE EXTRUDED CARD TEXT — THE "DRY" TAKE. D-094, 24 September 2026. ALL FOUR
   CARDS, ALL FOUR AT ONCE AND STATIC ON PLAIN `/about` (`extrudeCards`, `still`). ⚠ *Corrected in place:* this read "CA ONLY", then "CA AND
   CB"; CD and CS joined later in session 2. CB joined in session 2 the same
   day — Carl: *"Same text size, same type of text. Same reveal… The only
   difference being is that CB has more words."* ⛔ It was ONE CARD PER LOAD (the selector is now `extrudeCards`):
   *"isolate CA text so we can focus on CB… one card at a time."* The sequence
   (each card striking as the previous ends) is a later chunk, once all four have text.
   ⚠ *Corrected in place:* this read "BEHIND `?extrude=1`". Since session 2 the
   same day it is ON BY DEFAULT on plain `/about`, with every rim off;
   `?extrude=0` restores the previous page (see `extrudeEnabled`).

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
import { chase, eraseLag, setJustified, type Chase, type LineState, type SetLine } from "./card-text-timeline";

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
  /** The spot SWUNG about the face's vertical axis, degrees; negative = toward the
      card's −x (CB's far, left end). 0 = centred, as the dry take was built. */
  lightYawDeg: number;
  /** Where the spot aims across the face, in half-widths (−1 = the −x edge). The
      light moves WITH its aim, so the angles above stay relative to the aim point. */
  lightAimX: number;
  /** The card's own spot is mounted (`?textlight=0|1`). */
  light: boolean;
  /** The card's own neon rim is lit — ONLY that card's (`?textrim=0|1`). */
  rim: boolean;
  /** STATIC: the first full page, every slot filled, no chase (`?textstatic=0|1`). */
  still: boolean;
};

/**
 * ⛔ PER-CARD DEFAULTS for the two switches — the state each card is being judged in.
 * - CA: spot ON, rim OFF. This is the state R-029/R-030 judged, kept so `?extrude=ca`
 *   (and `?extrude=1`) still shows what those records describe.
 * - CB: **spot ON, rim ON.** Carl, 24 September 2026 (session 2): first *"On CB, turn
 *   off the light but turn on the rim"* — step 2 of his order, *"see what effect
 *   turning the rim on has"* — then *"It looks better close up… turn the light back
 *   on so CB has Rim and WebGL light."*
 * - CD, CS: no text yet; CA's state until they get their own.
 */
/* ⛔⛔ ALL OFF — Carl, later the same session: *"a way around this is to change the
   light type and to alter the intensity. Turn all the lights off and put the text
   in for CD and CS."* Every card's spot and rim; the room's own lights (ambient,
   key, fill — `about-card-canvas.tsx`) are untouched. ⚠ The history above is kept:
   CA's R-029/R-030 state is now `?extrude=ca&textlight=1`, CB's last state
   `?textlight=1&textrim=1`. The light TYPE and intensity are the next light
   chunk, after all four cards show their text. */
const EXTRUDE_SWITCHES: Record<ExtrudeCardId, { light: boolean; rim: boolean }> = {
  ca: { light: false, rim: false },
  cb: { light: false, rim: false },
  cd: { light: false, rim: false },
  cs: { light: false, rim: false },
};

/**
 * ⛔ EXTRUSION DEPTH PER CARD, mm — THE DEPTH RULE (D-094): *the steeper a card sits
 * to the viewer, the shallower its letters.* The side wall shows at ≈ (depth ÷
 * stem) × tan θ of a stroke's face; Geist's stem ≈ 4.5 mm at 52 mm. Each figure
 * comes from that card's MEASURED view angle off its normal (far / centre / near):
 *   CA 23.7 / 12.1 / 4.0°  → 3 mm   (worst side wall 29%)
 *   CB 46.5 / 37.4 / 25.5° → 1.5 mm (35%) — Carl's diagnosis
 *   CD 26.9 / 27.4 / 34.7° → 2 mm   (31%; at 3 mm it would be 46%)
 *   CS 60.0 / 52.8 / 44.2° → 0.9 mm (35%; at 3 mm it would be 115% — more side
 *                                     wall than letter face)
 * CD and CS are set to CB's 35% as the ceiling (the value Carl has looked at).
 * ⚠ CS is the steepest card of the four: its far letters are also squashed to
 * cos 60° = half their width, which no depth can fix.
 * ⚠ Takes. `?textdepth=` overrides for whichever card is loaded.
 */
const EXTRUDE_DEPTH_MM: Record<ExtrudeCardId, number> = {
  ca: 3,
  cb: 1.5,
  cd: 2,
  cs: 0.9,
};

function switchParam(key: string, fallback: boolean): boolean {
  const v = neonParam(key);
  return v === "1" ? true : v === "0" ? false : fallback;
}

/**
 * ⛔ THE START PAGE'S READING PACE — Carl, 24 September 2026: *"Slow it down to the
 * speed of the start page text."* DERIVED, not typed: `/start`'s body subtext is
 * 12 words revealed in 4200 ms (`.enquiry-subtext-mask`, `globals.css`; the copy
 * is `SUBTEXT` in `enquiry-opening.tsx`) = 171.4 wpm. ⚠ If either is retimed or
 * reworded, this is stale — unasserted; verify before relying on it.
 */
export const START_PAGE_WPM = (12 / 4200) * 60_000;

/**
 * ⛔⛔ ON BY DEFAULT SINCE 24 September 2026 (session 2) — PLAIN `/about` IS THIS
 * TAKE. Carl: *"First turn off all the rim lights. Can you see what was built
 * here at this URL? I want you to implement it"*, then *"The rim lights should be
 * turned off so we can see the card in isolation."* (D-094.)
 *
 * ⚠ It WAS `?extrude=1`-only (*"the whole take is mounted only with this"*).
 * `?extrude=1` still works and means the same thing; ⛔ **`?extrude=0` is now the
 * way back to the previous `/about`** (the neon rims lit, no extruded text, the
 * etched take reachable with `&etch=1`).
 * ⚠ Since later that session it is ONE CARD AT A TIME — see `extrudeCard`.
 */
export function extrudeEnabled(): boolean {
  return extrudeCards().length > 0;
}

export type ExtrudeCardId = "ca" | "cb" | "cd" | "cs";
const EXTRUDE_CARD_IDS: readonly ExtrudeCardId[] = ["ca", "cb", "cd", "cs"];

/**
 * ⛔⛔ ONE CARD AT A TIME — Carl, 24 September 2026 (session 2): *"isolate CA text
 * so we can focus on CB. It doesnt need to be seen at the moment. We should do it
 * one card at a time. When all 4 cards have text we can then work out at what
 * point a card triggers the next and what does that card do after."*
 *
 * ⚠ *Superseded as the DEFAULT, same session:* CB was the working card; now ALL
 * FOUR are, static — Carl: *"make visible all the text in each card but make them
 * static for now… so that there is a lot of text on each card to judge."* One card
 * at a time is still one URL away (`?extrude=cb`).
 *
 * ⚠ A working position, not a design: the four-card sequence replaces this.
 */
export const EXTRUDE_WORKING_CARDS: readonly ExtrudeCardId[] = EXTRUDE_CARD_IDS;

/**
 * Which cards carry the extruded text on this load; empty for none.
 *   (absent) or `all`       → `EXTRUDE_WORKING_CARDS` (all four)
 *   `?extrude=ca|cb|cd|cs`  → that card; a comma list (`ca,cb`) → those
 *   `?extrude=1`            → CA — ⚠ kept so every record saying `?extrude=1` still means CA
 *   `?extrude=0`            → none: the previous `/about`, neon lit
 * ⚠ Anything else mounts NOTHING and says so — a typo must not pass for a choice.
 */
export function extrudeCards(): readonly ExtrudeCardId[] {
  const v = neonParam("extrude");
  if (v === null || v === "all") return EXTRUDE_WORKING_CARDS;
  if (v === "0") return [];
  if (v === "1") return ["ca"];
  const ids = v.split(",");
  if (ids.every((id) => (EXTRUDE_CARD_IDS as readonly string[]).includes(id))) {
    return EXTRUDE_CARD_IDS.filter((id) => ids.includes(id));
  }
  console.error(`⛔ ?extrude=${JSON.stringify(v)} is not a card list — use all, ca, cb, cd, cs (comma-separated), 1 (= ca) or 0. No extruded text mounted.`);
  return [];
}

/** Read once per mount by the canvas (reload to apply). */
export function extrudeSettings(card: ExtrudeCardId): ExtrudeSettings {
  return {
    light: switchParam("textlight", EXTRUDE_SWITCHES[card].light),
    rim: switchParam("textrim", EXTRUDE_SWITCHES[card].rim),
    /* ⛔ STATIC BY DEFAULT — Carl, 24 September 2026 (session 2): *"make visible all
       the text in each card but make them static for now… so that there is a lot of
       text on each card to judge."* ⚠ At 52 mm no card holds its whole copy (CA: 10
       lines, 6 slots), so "all the text" is read as A FULL FIRST PAGE: every slot
       filled with the copy's first lines. `?textstatic=0` runs the pages again. */
    still: switchParam("textstatic", true),
    emMm: neonNumber("textem", 52, 20, 120),
    /* ⛔ PER CARD — CB 3 → 1.5 mm, 24 September 2026 (session 2). Carl: *"CA and CB
       are at different angles to the user, the text shouldnt be at the same
       extruded height. It should be slightly smaller."* MEASURED: CB is seen at
       46.5° / 37.4° / 25.5° off its normal (far / centre / near), CA at 23.7° /
       12.1° / 4.0°. The side wall shows ≈ (depth / stem) × tan θ of a stroke's face
       (Geist's stem ≈ 4.5 mm at 52 mm): at 3 mm CB's far edge carries 70% against
       CA's worst 29%. 1.5 mm gives CB 35% / 26% / 16%; ≈1.25 would match CA's worst.
       ⚠ A take. CA stays at 3. Per card since CD/CS: `EXTRUDE_DEPTH_MM`. */
    depthMm: neonNumber("textdepth", EXTRUDE_DEPTH_MM[card], 0.5, 20),
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
    lightYawDeg: neonNumber("lightyaw", 0, -80, 80),
    lightAimX: neonNumber("lightaimx", 0, -1, 1),
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

/* ⚠ ONE LOAD FOR EVERY CARD: the typeface JSON is ~33 KB (⚠ corrected in place: first written as "~198 KB", a misread
   listing), and with four cards
   mounted each would fetch and PARSE it. A failed load is forgotten so a remount
   retries. */
let fontLoad: Promise<Font> | null = null;
function loadFont(): Promise<Font> {
  if (!fontLoad) {
    fontLoad = new FontLoader().loadAsync(FONT_URL);
    fontLoad.catch(() => {
      fontLoad = null;
    });
  }
  return fontLoad;
}
/** How far the letters' backs sink into the face, so the dome's curvature under
    a glyph never opens a gap. */
const SINK_MM = 0.3;
/** Light distance from the face's centre, mm — CA's. ⚠ Other cards take it
    SCALED BY FACE WIDTH (the `lightDistanceMm` prop): Carl, 24 September 2026,
    *"approximately in the same position as CAs light given its proportions."*
    The angle, cone and intensity are unchanged, so the cone covers each face
    with CA's margin and the shadows keep CA's length (≈ depth × tan θ). */
export const LIGHT_DISTANCE_MM = 900;

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
  /** The spot's distance from the face centre, mm. Default: CA's. */
  lightDistanceMm?: number;
};

export function CardExtrudedText({
  id,
  body,
  dims,
  crownMm,
  settings: s,
  lightDistanceMm = LIGHT_DISTANCE_MM,
}: Props) {
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
        font = await loadFont();
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
    const d = lightDistanceMm * worldPerMm;
    light.shadow.camera.near = d * 0.3;
    light.shadow.camera.far = d * 2.5;
    light.shadow.camera.updateProjectionMatrix();
    invalidate();
  }, [invalidate, lightDistanceMm, s.light]);

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
    if (!b || !group || (start === null && !s.still)) return;
    const slots = slotsRef.current;
    if (!slots.length) return;

    /* ⛔ STATIC: the first full page — slot i holds line i, fully revealed, no clock.
       No self-invalidation below, so a still card costs frames only when something
       else asks for one. */
    const states: LineState[] = s.still
      ? Array.from({ length: Math.min(b.slots, b.lines.length) }, (_, i) => ({ slot: i, line: i, reveal: 1, erase: 0 }))
      : b.chase.at(performance.now() - (start ?? 0));
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
    if (!s.still) invalidate();
  });

  // ── Light placement, face-local mm: above and in front, angled DOWN ──
  const a = (s.lightAngleDeg * Math.PI) / 180;
  const yaw = (s.lightYawDeg * Math.PI) / 180;
  const aimX = s.lightAimX * hw;
  /* Down by `a` from the normal, then swung by `yaw` about the vertical — at yaw 0
     exactly the original `[0, d·sin a, baseZ + d·cos a]`. */
  const lightPos: [number, number, number] = [
    aimX + lightDistanceMm * Math.cos(a) * Math.sin(yaw),
    lightDistanceMm * Math.sin(a),
    baseZ + lightDistanceMm * Math.cos(a) * Math.cos(yaw),
  ];

  return (
    <group ref={groupRef}>
      <object3D ref={targetRef} position={[aimX, 0, baseZ]} />
      {/* ⛔ WHITE, CENTRED, STATIC — the dry take. `decay 0` so its strength does
          not depend on the scene's mm-to-world scale. The cone is kept just past
          CA's edges so CB and the floor pair stay untouched; ⚠ watch for D-082's
          "street light" pooling.
          ⛔ ONE LIGHT PER CARD — Carl, 24 September 2026: *"Each card gets its own
          light, white for now."* ⚠ Each is a shadow-casting spot, so each costs a
          shadow-map render per frame. ⚠ *"Untouched" was measured for CA alone;
          the CB spill measurement is in the run log of that date.* */}
      {/* ⚠ Not mounted at all when `light` is off (CB's working state) — no light
          and no shadow-map render, rather than a spot at intensity 0. */}
      {s.light && <spotLight
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
      />}
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
