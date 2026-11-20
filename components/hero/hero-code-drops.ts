import * as THREE from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";
import { attribute, cameraProjectionMatrix, cameraViewMatrix, exp, float, floor, hash, instanceIndex, mix, positionLocal, select, smoothstep, step, texture, uniform, uv, varying, vec2, vec3, vec4 } from "three/tsl";
import type { Node } from "three/webgpu";
import { rainAtlas, type RainAtlas } from "@/components/code-rain-atlas";

/**
 * ⛔ THE CODE DROPS — PHASE 3's START (20 November 2026; D-101). Carl: *"In each run, every drop that is destined to fall on
 * the logo should be code. Look at the logo in the /about section, the logo in the video player. You have everything you
 * need their to build the code drops."* The 16 November rulings stand: the rain's LAST BAND only; once code, always code;
 * turning at DIFFERENT heights; NO slow motion; glyphs sized in the WORLD (the camera decides how large they read);
 * fleeting; the effect *"was that Matrix code?"* — answered by `/about` §3, whose repair rain this is.
 *
 * WHICH DROPS: decided by the RAIN (`hero-rain.ts`) at each drop's release — in the last band AND over the logo in the hit
 * map (it falls straight down, so it WILL land there: the same cell the hit test samples). The rain writes each chosen
 * drop's COLUMN (`codeCol`: x, its release height, z, its release time on the rain's clock; `codeSurf`: the surface it lands
 * on). From those the column here is ANALYTIC — its head falls at that drop's own speed (the rain's ±10% share), so it
 * carries on draining after the drop itself has gone.
 *
 * WHAT IS `/about`'s (`components/about/player-bench.tsx`, `CODE_RAIN`, D-088 22 October; the characters from
 * `components/code-rain-atlas.ts`, ONE source):
 *   - the characters: half-width katakana MIRRORED with numerals, now and then the logo's own c, 2, b (`cOdds` 0.06);
 *   - the column CELL BY CELL: the cells are FIXED in space and the head steps through them (as the film's do); the trail
 *     lies ABOVE the head; the characters FLICKER (each column its own 90–260 ms) — `/about`'s hash, the same terms;
 *   - the colours: the head WHITE, the next ICE `#CFE6FF`, the trail's first half LIGHT `#5F88C8`, then PLATINUM `#3F6DB8`;
 *     alpha 1 at the head, then 0.95 × (1 − k / (trail + 1));
 *   - ~1 head in 6 FLARES (`flareOdds` 0.16): a soft burst riding the head;
 *   - the DRAIN: `/about`'s drops leave the logo's shape and are cut at its outline; here the head goes INTO the surface and
 *     every cell below it is cut, so the column drains into the logo where it lands. NO SPLASH (the rain skips it).
 * WHAT IS OURS:
 *   - the TURN: the drop falls as rain to a height of its own above where it lands (`turnMinCm`–`turnMaxCm`, each drop its
 *     own share), then its streak goes (`hero-rain.ts`) and the code starts there: no cell above the turn (it was water);
 *   - the GLOW drawn into each cell (a soft halo, the cell's own colour) — `/about`'s glow is a downsampled bloom of its
 *     layer; the hero's bloom has ONE writer by design (the text, the bloom note [R5]), so the code's light is its own;
 *   - ADDITIVE (it is light), depth-tested (the logo hides what is behind or inside it), never writing depth;
 *   - upright, facing the camera about the vertical (the rain's streak's billboarding).
 * ⚠ Unasserted — verify before relying on it: the column's head matches the drop's FOOT only while the rain's step keeps
 * its terms (the speed share `hash(i + 9000000) × 0.2 + 0.9`, the length share, the release height): both are passed in
 * from the rain (`speedShare`, `lengthShare`), not copied, so a change there carries here.
 */

/** the longest trail a column can carry (cells): the geometry is this many + 1 quads per drop */
export const CODE_MAX_TRAIL = 16;

export type HeroCodeSettings = {
  /** the code drops at all */
  on: boolean;
  /** the band's length, in falls (1 = the drops in the air as the last one starts down — Carl's "last rain to fall") */
  band: number;
  /** a character's height in the world (cm) — `/about`'s 0.075 of the mark's height ≈ 8 cm on the hero's logo */
  glyphCm: number;
  /** the trail's length (cells), each column its own between the two */
  trailMin: number;
  trailMax: number;
  /** the turn: the height above where the drop lands at which it becomes code (cm), each drop its own between the two */
  turnMinCm: number;
  turnMaxCm: number;
  /** ⛔ the CODE's fall speed from the turn, a share of the rain's (Carl, 20 November: noticeable as Matrix code; not slow
   *  motion — the story's time runs at 1×) */
  speed: number;
  /** the code's brightness, its halo, and the flares' burst */
  brightness: number;
  glow: number;
  flare: number;
  flareOdds: number;
  /** the share of characters that are the logo's own c, 2, b */
  cOdds: number;
  /** each column's flicker period (ms), between the two */
  flickMinMs: number;
  flickMaxMs: number;
};

/** starting values — `/about`'s where it has them (cOdds, flareOdds, the flicker, the trail); the rest takes for Carl's eye */
export const HERO_CODE_DEFAULTS: HeroCodeSettings = {
  on: true,
  band: 1,
  // Carl: "say, 50% of what they are now"
  speed: 0.5,
  glyphCm: 8,
  trailMin: 8,
  trailMax: 16,
  turnMinCm: 30,
  turnMaxCm: 110,
  brightness: 1.5,
  glow: 0.35,
  flare: 0.5,
  flareOdds: 0.16,
  cOdds: 0.06,
  flickMinMs: 90,
  flickMaxMs: 260,
};

type F = Node<"float">;
export type CodeDropsInputs = {
  /** per drop: x, release height, z, release time (the rain's clock) — written by the rain at a chosen drop's release */
  codeCol: { element(i: Node<"uint">): Node<"vec4"> };
  /** per drop: the surface it lands on (world y); `none` = not a code column */
  codeSurf: { element(i: Node<"uint">): F };
  none: number;
  /** the rain's clock (s), its fall speed (world/s), its streak's half length (world) */
  clock: F;
  speed: F;
  halfLen: F;
  /** the rain's own per-drop shares (passed in so the column matches the drop's foot) */
  speedShare: F;
  lengthShare: F;
};

export type HeroCodeDrops = {
  mesh: THREE.Mesh;
  settings: HeroCodeSettings;
  /** world units per cm, and how many drops are drawn (the rain's peak) */
  update(unitsPerCm: number, count: number): void;
  /** 1 once a drop's FOOT is at or below its turn (the rain hides its streak from there; per drop, the same turn) */
  turned(footY: F): F;
  readonly atlasReady: boolean;
  dispose(): void;
};

const srgb = (hex: string) => {
  const c = new THREE.Color(hex);
  return vec3(c.r, c.g, c.b);
};

export function createCodeDrops(inp: CodeDropsInputs): HeroCodeDrops {
  const settings: HeroCodeSettings = { ...HERO_CODE_DEFAULTS };
  const u = {
    glyph: uniform(1),
    trailMin: uniform(8),
    trailMax: uniform(16),
    turnMin: uniform(1),
    turnMax: uniform(1),
    speed: uniform(0.5),
    brightness: uniform(1),
    glow: uniform(0),
    flare: uniform(0),
    flareOdds: uniform(0),
    cOdds: uniform(0),
    flickMin: uniform(90),
    flickMax: uniform(260),
    // the atlas's characters: 0 until it is built (nothing drawn)
    atlasN: uniform(0),
    atlasOwn: uniform(0),
  };

  // THE CHARACTERS: `/about`'s WHITE strip as a mask, tinted here with its three colours (one texture for four strips —
  // the same look for solid glyphs). Built in an IDLE moment after load (`/about`'s measured ~100–125 ms), never at 31 s
  const placeholder = document.createElement("canvas");
  placeholder.width = placeholder.height = 1;
  const tex = new THREE.CanvasTexture(placeholder);
  tex.colorSpace = THREE.NoColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  let atlas: RainAtlas | null = null;
  const build = () => {
    atlas = rainAtlas();
    tex.image = atlas.white;
    tex.needsUpdate = true;
    u.atlasN.value = atlas.n;
    u.atlasOwn.value = atlas.own;
  };
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  const idleId = ric ? ric(build, { timeout: 4000 }) : window.setTimeout(build, 2000);

  // THE GEOMETRY: CODE_MAX_TRAIL + 1 unit quads, each tagged with its cell (0 = the head), drawn once per drop (instanced)
  const K = CODE_MAX_TRAIL + 1;
  const position = new Float32Array(K * 4 * 3);
  const uvs = new Float32Array(K * 4 * 2);
  const cell = new Float32Array(K * 4);
  const index: number[] = [];
  for (let k = 0; k < K; k++) {
    const c: [number, number][] = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    c.forEach(([x, y], j) => {
      const v = k * 4 + j;
      position.set([x, y, 0], v * 3);
      uvs.set([x + 0.5, y + 0.5], v * 2);
      cell[v] = k;
    });
    const b = k * 4;
    index.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute("cell", new THREE.BufferAttribute(cell, 1));
  geo.setIndex(index);

  // THE COLUMN (header), per drop and per cell — the same nodes serve the vertex and the fragment
  const i = instanceIndex.toFloat();
  const h = (salt: number) => hash(i.add(salt));
  const col = inp.codeCol.element(instanceIndex);
  const surf = inp.codeSurf.element(instanceIndex);
  const k = attribute<"float">("cell", "float");
  const G = u.glyph;
  // the head = the drop's FOOT (the point that lands), falling at that drop's speed from its release — as RAIN down to its
  // turn; ⛔ from the turn, CODE at its own speed (`speed`, a share of the rain's; Carl, 20 November 2026: *"Its not slow mo
  // and its not rain either ... It needs to be moticable as Matrix code"*): below the turn the distance fallen is scaled
  const turnY = surf.add(mix(u.turnMin, u.turnMax, h(7000001)));
  const asRain = col.y.sub(inp.halfLen.mul(inp.lengthShare)).sub(inp.speed.mul(inp.speedShare).mul(inp.clock.sub(col.w)));
  const headY = select(asRain.greaterThan(turnY), asRain, turnY.sub(turnY.sub(asRain).mul(u.speed)));
  const trail = floor(mix(u.trailMin, u.trailMax.add(0.999), h(7000003))).min(CODE_MAX_TRAIL);
  // cells FIXED in space, counted up from the surface it lands on; the head's cell, and this quad's (the trail above it)
  const r = floor(headY.sub(surf).div(G)).add(k);
  const cellY = surf.add(r.add(0.5).mul(G));
  const vis = step(inp.none / 2, surf) // a code column
    .mul(step(0.5, u.atlasN)) // the characters are built
    .mul(step(headY, turnY)) // it has turned
    .mul(step(k, trail)) // within its trail
    .mul(step(0, r)) // not below the surface (the drain)
    .mul(step(cellY, turnY.add(G.mul(0.5)))); // not above the turn (it was water there)
  const isHead = float(1).sub(step(0.5, k));
  const flare = step(h(7000007), u.flareOdds).mul(isHead);
  // the quad in glyph units: room for the halo (2), a head's (2.5), a flare's burst (4)
  const quad = mix(float(2), mix(float(2.5), float(4), flare), isHead);
  const size = G.mul(quad).mul(vis);
  const centre = cameraViewMatrix.mul(vec4(col.x, cellY, col.z, 1)).xyz;
  const upView = cameraViewMatrix.mul(vec4(0, 1, 0, 0)).xyz;
  const mat = new MeshBasicNodeMaterial();
  mat.vertexNode = cameraProjectionMatrix.mul(vec4(centre.add(vec3(positionLocal.x.mul(size), 0, 0)).add(upView.mul(positionLocal.y.mul(size))), 1));

  // the character: `/about`'s hash terms (the column, the cell, the flicker tick + the cell), its odds for c 2 b
  const tick = floor(inp.clock.mul(1000).div(mix(u.flickMin, u.flickMax, h(7000005))));
  const seed = i.mul(131).add(r.mul(7)).add(tick.add(k).mul(1009));
  const hA = hash(seed);
  const hB = hash(seed.add(7777777));
  const own = step(hA, u.cOdds);
  const idx = mix(floor(hB.mul(u.atlasN)), u.atlasN.add(floor(hB.mul(u.atlasOwn))), own);
  const alpha = mix(float(0.95).mul(float(1).sub(k.div(trail.add(1)))), float(1), isHead);
  const colour = select(k.lessThan(0.5), srgb("#FFFFFF"), select(k.lessThan(1.5), srgb("#CFE6FF"), select(k.lessThanEqual(trail.mul(0.5)), srgb("#5F88C8"), srgb("#3F6DB8"))));
  // ⛔ EVERY PER-DROP VALUE IS DECIDED ONCE, IN THE VERTEX STAGE, AND HANDED ON (take 1, 20 November: the fragment worked
  // the quad's size out again for itself and the glows were cut off by square edges — two stages, two answers)
  const vQuad = varying(quad);
  const vFlare = varying(flare);
  const vIdx = varying(idx);
  const vLight = varying(alpha.mul(vis));
  const vColour = varying(colour);
  const p = uv().sub(0.5).mul(vQuad); // glyph units about the cell's centre
  const inside = step(p.x.abs(), 0.5).mul(step(p.y.abs(), 0.5));
  const glyph = texture(tex, vec2(floor(vIdx.add(0.5)).add(p.x.add(0.5)).div(u.atlasN.add(u.atlasOwn).max(1)), p.y.add(0.5))).a.mul(inside);
  // the light falls to NOTHING before the quad's edge (no box, whatever the dials)
  const rr = p.length();
  const edge = float(1).sub(smoothstep(vQuad.mul(0.3), vQuad.mul(0.5), rr));
  const halo = exp(rr.mul(rr).mul(-4)).mul(u.glow);
  const burst = exp(rr.mul(rr).mul(-2.5)).mul(u.flare).mul(vFlare);
  const light = glyph.add(halo.add(burst).mul(edge)).mul(vLight).mul(u.brightness);
  mat.colorNode = vec4(vColour.mul(light), 1);
  // ADDITIVE, premultiplied (light adds; the target's alpha untouched)
  mat.transparent = true;
  mat.blending = THREE.CustomBlending;
  mat.blendEquation = THREE.AddEquation;
  mat.blendSrc = THREE.OneFactor;
  mat.blendDst = THREE.OneFactor;
  mat.blendSrcAlpha = THREE.ZeroFactor;
  mat.blendDstAlpha = THREE.OneFactor;
  mat.depthWrite = false;
  mat.depthTest = true;
  mat.side = THREE.DoubleSide;
  mat.forceSinglePass = true;
  mat.name = "hero code drops";

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "hero rain: code drops";
  mesh.frustumCulled = false;
  mesh.count = 1;

  return {
    mesh,
    settings,
    update(upc, count) {
      const s = settings;
      u.glyph.value = s.glyphCm * upc;
      u.trailMin.value = Math.max(0, Math.min(CODE_MAX_TRAIL, s.trailMin));
      u.trailMax.value = Math.max(u.trailMin.value, Math.min(CODE_MAX_TRAIL, s.trailMax));
      u.turnMin.value = s.turnMinCm * upc;
      u.turnMax.value = Math.max(s.turnMinCm, s.turnMaxCm) * upc;
      u.speed.value = Math.max(0.05, s.speed);
      u.brightness.value = s.brightness;
      u.glow.value = s.glow;
      u.flare.value = s.flare;
      u.flareOdds.value = s.flareOdds;
      u.cOdds.value = s.cOdds;
      u.flickMin.value = s.flickMinMs;
      u.flickMax.value = Math.max(s.flickMinMs, s.flickMaxMs);
      mesh.count = Math.max(1, count);
    },
    turned: (footY) => step(footY, turnY),
    get atlasReady() {
      return atlas !== null;
    },
    dispose() {
      if (ric) (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      else window.clearTimeout(idleId);
      geo.dispose();
      mat.dispose();
      tex.dispose();
    },
  };
}
