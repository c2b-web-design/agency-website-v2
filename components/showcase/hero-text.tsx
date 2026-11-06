"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { advancePx, glyphGeometry, type LetteringSpec } from "./lettering-geometry";
import { HERO_TEXT_PLACE, useDisposeOnUnmount } from "./hero-page";

/**
 * ⛔ THE HERO's TEXT IN 3D — THE SKETCH's LAST PIECE (5 November 2026, session 2; D-101; Carl: *"Yes proceed."*). On the bench
 * (`/proto/camera?blank=1`) the page's two lines stood in the street in place of the block-out's stand-in cards, in CLAY
 * (⚠ the street REMOVED 6 November 2026, session 2 — the pivot; the text kept on Carl's word, *"The threejs text can stay"*):
 * - IN "CODE WORLD" (Carl: *"So the text is in "code world" Thats why it needs nothing to hold it up"*): abstract, on our side
 *   of the break-out screen (Z 578) — nothing holds it; the PAGE's layout and spacing are kept.
 * - THE PAGE's TYPE: the headline Geist BOLD (`md:text-6xl font-bold tracking-tight leading-[1.1]`, `app/page.tsx`), the
 *   subtext Geist Regular (`text-base leading-relaxed`), each broken into its two lines as the page breaks them.
 * - BEVELLED FRONT AND BACK (Carl: *"The text should be bevelled at the back too. If it was 90deg the light would only catch
 *   the sides"*): a small ROUNDED bevel — several segments, so a moving light (the logo's) runs along each letter's edge,
 *   where a flat chamfer (the arch's) flashes at one angle. `glyphGeometry` bevels both ends. A TAKE.
 * - DEPTH 0.2 em (the arch's) — a TAKE.
 * - SET AS THE PAGE SETS IT (`heroTextLayout`): the font size from the guide's line boxes, the baselines by the page's
 *   leading, the pen from the box's left; its front on the cards' face. ⚠ The typeface JSON carries NO KERNING (the browser
 *   kerns), so a line's width differs a little from the page's — measured and reported, not hidden.
 * ⚠ A SEPARATE FILE ON PURPOSE: the home page once imported `hero-blockout.tsx` for its drawing (both removed 6 November
 * 2026, session 2 — the pivot); the lettering code lives here so it never enters the home page's bundle. The page keeps its
 * real `<h1>` and subtext (screen readers, search).
 */
const FONT_URLS = { bold: "/fonts/geist-bold.typeface.json", regular: "/fonts/geist-regular.typeface.json" } as const;
type Fonts = { bold: Font; regular: Font };

/** the extrusion, in ems of each block's own size — TAKES */
const SPEC: Pick<LetteringSpec, "depthEm" | "bevel" | "curveSegments" | "creaseDeg"> = {
  depthEm: 0.2,
  bevel: { sizeEm: 0.02, thicknessEm: 0.02, segments: 4 },
  curveSegments: 12,
  // 30° (5 November 2026, session 2): the 4-segment bevel turns 90° in 22.5° steps; above 22.5° they shade as ONE round
  // (at the arch's 10° each step is its own flat facet); the letters' 90° corners stay sharp. ⚠ It did NOT remove the thin
  // DARK BAND along the letters' tops seen from behind (Carl's views): the back bevel's normals were read and are right
  // (from (0, 0, −1) to (0, 0.95, −0.32)) — the band is the back bevel turned away from the BENCH's front light, a lighting
  // matter, not a mesh fault
  creaseDeg: 30,
};
type Block = { key: "headline" | "subtext"; font: keyof Fonts; lines: string[]; leading: number; trackingEm: number };
const BLOCKS: Block[] = [
  { key: "headline", font: "bold", lines: ["Websites built", "to be seen."], leading: 1.1, trackingEm: -0.025 },
  { key: "subtext", font: "regular", lines: ["We show you what your website could be,", "then we build you a site for sore eyes."], leading: 1.625, trackingEm: 0 },
];
/** the typeface JSON's units per em (as `lettering-geometry.ts`: `TTFLoader` writes advances × 1e5 / (unitsPerEm × 72)) */
const EM_UNITS = 100000 / 72;

export type HeroTextFit = { key: string; fontCm: number; line1Cm: number; cardWidth: number; widthErrorPct: number; missing: string[] };

/**
 * PURE: the two blocks' geometries, set as the BROWSER sets them, in the block-out's frame (world cm). ⛔ MEASURED 5 November
 * 2026 (session 2), at Carl's window (1909 × 934, root zoom 1.352): the guide boxes (`HERO_TEXT_PLACE`) are the text's LINE
 * BOXES — from the top of line 1's box to the bottom of line 2's, as wide as line 1's ADVANCE — not its ink (the headline
 * 366 → 562 and 542 wide; the font 60 px × 1.352 on screen). So the font size comes from the box: height = (leading + the
 * font's ascender + descender) × size; the first baseline sits the ascender below the box's top, the second one leading
 * below it; the pen starts at the box's left. (A first take fitted the INK to the box: +34 % / +19 % too wide — withdrawn.)
 */
export function heroTextLayout(fonts: Fonts): { geometries: THREE.BufferGeometry[]; fits: HeroTextFit[] } {
  const geometries: THREE.BufferGeometry[] = [];
  const fits: HeroTextFit[] = [];
  for (const b of BLOCKS) {
    const font = fonts[b.font];
    const place = HERO_TEXT_PLACE[b.key];
    const ascEm = font.data.ascender / EM_UNITS;
    const descEm = -font.data.descender / EM_UNITS;
    const size = place.height / (b.leading + ascEm + descEm);
    const top = place.bottom + place.height;
    const glyphs: THREE.BufferGeometry[] = [];
    const missing: string[] = [];
    let line1 = 0;
    b.lines.forEach((line, i) => {
      let x = 0;
      const baseline = top - ascEm * size - i * b.leading * size;
      for (const ch of line) {
        const adv = advancePx(font, ch, size);
        if (adv === null) {
          missing.push(ch);
          continue;
        }
        if (ch !== " ") glyphs.push(glyphGeometry(font, ch, size, SPEC).translate(HERO_TEXT_PLACE.left + x, baseline, HERO_TEXT_PLACE.face - (SPEC.depthEm * size) / 2));
        x += adv + b.trackingEm * size;
      }
      if (i === 0) line1 = x - b.trackingEm * size;
    });
    // `glyphGeometry` returns non-indexed geometry (three's text geometry, creased): merged as is, one draw per block
    const merged = mergeGeometries(glyphs, false);
    glyphs.forEach((g) => g.dispose());
    fits.push({ key: b.key, fontCm: size, line1Cm: line1, cardWidth: place.width, widthErrorPct: (100 * (line1 - place.width)) / place.width, missing });
    geometries.push(merged);
  }
  return { geometries, fits };
}

function useHeroFonts(): Fonts | null {
  const [fonts, setFonts] = useState<Fonts | null>(null);
  useEffect(() => {
    let live = true;
    const loader = new FontLoader();
    Promise.all([loader.loadAsync(FONT_URLS.bold), loader.loadAsync(FONT_URLS.regular)]).then(([bold, regular]) => live && setFonts({ bold, regular }));
    return () => {
      live = false;
    };
  }, []);
  return fonts;
}

const NOTHING = { dispose: () => {} };

/** the text on the bench, in clay — mounted in the blank canvas's group on the grid's crossing (the frame the block-out used;
 *  the street REMOVED 6 November 2026, session 2), lit by `HeroSketchLight` (`hero-page.tsx`) */
export function HeroText() {
  const fonts = useHeroFonts();
  const built = useMemo(() => {
    if (!fonts) return null;
    const { geometries, fits } = heroTextLayout(fonts);
    const material = new THREE.MeshStandardMaterial({ color: "#9a9a96", roughness: 0.9, metalness: 0 });
    return { geometries, fits, material, dispose: () => (geometries.forEach((g) => g.dispose()), material.dispose()) };
  }, [fonts]);
  useDisposeOnUnmount(built ?? NOTHING);
  if (!built) return null;
  return (
    <group name="hero text">
      {built.geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={built.material} />
      ))}
    </group>
  );
}
