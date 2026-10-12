"use client";

/**
 * ⛔ THE `Who we are` BUTTON'S SCENE — ONE MODULE, IMPORTED BY THE BENCH (`/proto/button`) AND THE HOME PAGE
 * (`components/home/whoweare-button.tsx`). D-088, 12 October 2026. Moved here VERBATIM from `whoweare-bench.tsx` at the
 * rollout (structural note `live-work/structural-note-whoweare-rollout-12-october.md`, decision 1): the home page must
 * not import a bench, and a second copy of the scene would be a second source of truth (CLAUDE.md §5a). The reasoning for
 * every value is recorded beside it below; the bench keeps only its URL dials.
 *
 * Passes: 1 the mesh (R-042), 2 the material and the label (R-043), 3 the light — step 1, ONE STATIC LIGHT FROM THE RIGHT
 * (built); the moving light, directed, is the final step.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildPillBand, buildPillGeometry, familySurfaceZ, FAMILY_BAND, FAMILY_PROFILE, NEXTSTEP_PROFILE } from "@/components/ui/button-family-geometry";
import { canvasOnScreen } from "@/lib/canvas-on-screen";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { buildLogoStudioEnv, LOGO_JUDGING_STUDIO } from "@/components/about/logo-mark-material";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

/** Clay: mid-grey, matte, no metal — the logo bench's clay (`logo-bench.tsx`), so the passes match. */
export const CLAY = { color: "#8a8a8a", roughness: 0.6, metalness: 0 } as const;

/**
 * ⛔ PASS 2 — THE TEAL, AS THE METAL'S OWN COLOUR (F0). Carl, 10 October: *"thats the teal colour i want"* — the first
 * column of `brand-assets/images.jpg`, sampled #1FB2C4. Put in the way the platinum blue was (R-035, `logo-mark-material.ts`:
 * the swatch's base chip AS the F0): sRGB #1FB2C4 → linear (0.0138, 0.4452, 0.5520). A metal's colour is its reflectance;
 * how light or dark it reads is the studio's work now, and pass 3's light.
 */
export const TEAL_F0_LINEAR: readonly [number, number, number] = [0.0138, 0.4452, 0.552];

/**
 * ⚠ STARTING VALUES for Carl's eye — the desk mark's (`LOGO_BLUE_DEFAULTS`: roughness 0.25, env 1), so the family's two
 * metals start from one recipe. Dials: ?rough= ?envint=.
 */
export const TEAL_DEFAULTS = { roughness: 0.25, envMapIntensity: 1 } as const;

/**
 * ⛔ THE LABEL — AT LEAST 4.5:1 AGAINST THE RENDERED METAL, AT EVERY PIXEL BEHIND THE TEXT (Carl, 12 October: *"make sure
 * the Text colour is 4.5:1. It must clearly be legible on the Teal background, On the light motion."*). On the flat swatch
 * white is ~2.5:1 and near-black ~7.7:1 (Architect, point 5) — but the label sits on a METAL, whose brightness varies across
 * the dome, so the measure is per pixel of the rendered surface (`whoweare-pass2-capture.mjs`), and in pass 3 along the
 * light's whole path. ⚰️ Take 4: near-black (5.02:1 at the worst pixel) — Carl: *"The text will not be black. We need a
 * complementary colour, possibly light blue."* Take 5: a pale ice blue on a darkened face. Dial: ?ink=hex (no #).
 */
export const INK_DEFAULT = "cfe6ff"; // take 5: a pale ice blue against the teal (Carl: "possibly light blue"). Take 4 was 0a0a0a.

/**
 * ⛔ THE LABEL, EXTRUDED IN THREE.JS (Carl, 12 October 2026: *"Lets extrude the text slightly. Make it Three js"* — and,
 * on the cards' extruded copy: *"Dont make is as big as that. It must be proportionate to the pills size but take into
 * account where i said the lights motion will be."*).
 *
 * THE DEPTH, FROM THE LIGHT: the cards' rule (D-094) — a letter's shadow must stay SHORTER THAN A STROKE IS WIDE, so it
 * sharpens the letter rather than ghosting it. Shadow ≈ depth × tan(the light's angle off the face). Carl's path starts
 * top-left and ends bottom-right, so at both ends of the arc the light comes in at ~60–70°; Geist SemiBold's strokes at
 * 14px are ~1.5 px. So depth ≲ 0.6 px — ~4% of the type size (the cards run 2–4.4% under a fixed 45° light), about a
 * fifteenth of the dome. At the arc's face-on moment there is no shadow: the letters gain and lose depth as the light
 * swings. Dial: ?depth=.
 *
 * THE TYPE: Geist SemiBold (`public/fonts/geist-semibold.typeface.json`, built by
 * `live-work/scripts/build-geist-semibold-typeface.mjs` from Vercel's own TTF). ⚠ The converter's em is 100000/72 ≈
 * 1388.9 units whatever the font's unitsPerEm, so `size = 14 × resolution / EM_UNITS` (the cards' note, `card-extrude.tsx`).
 * ⛔ PLACED WHERE THE BROWSER DRAWS IT: each glyph's x and the baseline are MEASURED from the real Geist span (a Range per
 * character; a zero-size marker on the baseline) — so letter-spacing (0.025em) and kerning come from the browser, not
 * re-derived. The letters' backs follow the dome (`familySurfaceZ`).
 * ⛔ THE FACE IS THE INK, EXACTLY (unlit, not tone-mapped) — so the 4.5:1 measure against the bare metal still holds;
 * the SIDES are a darker blue, lit by the studio (and pass 3's light), which is what shows the extrusion.
 * ⚠ The DOM span stays in the layout (it is what is measured, and on the shipped button the link's text is what a screen
 * reader reads — the answer cards' baked text is an open accessibility defect, D-051-A11Y; this must not repeat it).
 */
export const EXTRUDE_DEPTH_DEFAULT = 0.6;
/**
 * ⛔ THE BEVEL — WHY THE EXTRUSION CANNOT READ WITHOUT ONE (pass 3, light take 1, 12 October). Seen FACE-ON (the button is
 * always seen face-on; the camera is orthographic), an extruded letter's sides run along the line of sight and have no
 * width on screen — at ANY depth, under ANY light. A shadow on the face would show depth, but on a METAL a shadow shows only
 * where that light's specular lands, and a grazing light from the right reflects away from the viewer. What DOES read
 * face-on is a BEVEL: a narrow chamfer round each letter's face, angled outward — the facets on a stroke's right catch a
 * light from the right, those on its left fall dark: embossed lettering, read from the front. Fine (0.15 px) so 14px
 * strokes (~1.5 px) stay legible; `bevelOffset = −size` keeps the outer edge on the true outline, so the letters do not
 * thicken. The bevel facets take the SIDE material (lit); the face stays the ink. Dials: ?bevel= (size, px; 0 = none).
 */
export const BEVEL_DEFAULT = 0; // light takes 2-3 (0.15, 0.35): invisible, then greying the 1.5 px strokes - off, pending Carl
export const TYPE_PX = 14;
const EM_UNITS = 100000 / 72;
const FONT_URL = "/fonts/geist-semibold.typeface.json";
export const SIDE_INK = "#58779a";

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

/** `px`: the label's font size as the browser drew it (12 October, session 2 — the button made bigger: the letters follow
 * the measured box, not the family's fixed 14). Absent → `TYPE_PX`. */
export type Glyphs = { chars: string; x: number[]; baseline: number; px?: number };

export function ExtrudedLabel({ glyphs, w, h, legacy, depth, ink, bevel, onDrawn }: { glyphs: Glyphs; w: number; h: number; legacy: boolean; depth: number; ink: string; bevel: number; onDrawn?: () => void }) {
  const [font, setFont] = useState<Font | null>(null);
  useEffect(() => {
    let live = true;
    void loadFont().then((f) => live && setFont(f));
    return () => {
      live = false;
    };
  }, []);

  const letters = useMemo(() => {
    if (!font) return [];
    const size = ((glyphs.px ?? TYPE_PX) * font.data.resolution) / EM_UNITS;
    const profile = legacy ? NEXTSTEP_PROFILE : FAMILY_PROFILE;
    const out: THREE.BufferGeometry[] = [];
    [...glyphs.chars].forEach((ch, i) => {
      if (ch.trim() === "") return;
      const g = new TextGeometry(ch, {
        font,
        size,
        // The bevel adds its thickness at BOTH ends of the extrusion, so the straight part is shortened to keep the total.
        depth: bevel > 0 ? Math.max(0.01, depth - bevel) : depth,
        curveSegments: 8,
        bevelEnabled: bevel > 0,
        bevelThickness: bevel / 2,
        bevelSize: bevel,
        bevelOffset: -bevel,
        bevelSegments: 2,
      });
      g.translate(glyphs.x[i], glyphs.baseline, 0);
      // The back on the dome: lift every vertex by the surface under it (+ a hair, so the back never z-fights the metal).
      const pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) pos.setZ(k, pos.getZ(k) + familySurfaceZ(pos.getX(k), pos.getY(k), w, h, profile) + 0.02);
      pos.needsUpdate = true;
      out.push(g);
    });
    return out;
  }, [font, glyphs, w, h, legacy, depth, bevel]);
  useEffect(() => () => letters.forEach((g) => g.dispose()), [letters]);

  // The first frame that actually carries the letters — the home button keeps its CSS look until then (never a bare
  // label on dark, never a pill without its words). Once only.
  const told = useRef(false);
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    if (letters.length) invalidate();
  }, [letters, invalidate]);
  useFrame(() => {
    if (!told.current && letters.length && onDrawn) {
      told.current = true;
      onDrawn();
    }
  });

  // TextGeometry's groups: 0 = the caps (face and back), 1 = the sides.
  const mats = useMemo(
    () => [
      new THREE.MeshBasicMaterial({ color: ink, toneMapped: false }),
      new THREE.MeshStandardMaterial({ color: SIDE_INK, roughness: 0.45, metalness: 0 }),
    ],
    [ink],
  );
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);

  return (
    <>
      {letters.map((g, i) => (
        <mesh key={i} geometry={g} material={mats} castShadow receiveShadow />
      ))}
    </>
  );
}

/**
 * ⛔ PASS 3, STEP 1 — ONE STATIC LIGHT FROM THE RIGHT, RAKING ACROSS THE FACE (Carl, 12 October 2026: *"We will get a
 * better idea of the extrusion height needed once we have a static light, at first, from the right shining accross its
 * face."*). A directional light from +x, `angle` degrees off the face's normal (90 = flat along the face), `elevation`
 * degrees up; it casts shadows. ⚠ On a METAL a light's shadow shows only where that light's specular would land, so under
 * a grazing light the letters' shadows on the flat face are faint or absent — what reveals the extrusion is the letters'
 * own SIDES catching it (lit `MeshStandardMaterial`). Dials: ?lightang= ?lightel= ?lightint=; ?light=0 off (pass 2's look).
 */
export const KEY_DEFAULTS = { angle: 70, elevation: 8, intensity: 2.5 } as const;

export function KeyLight({ angle, elevation, intensity }: { angle: number; elevation: number; intensity: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const D = 400;
  const pos: [number, number, number] = [
    D * Math.sin(r(angle)) * Math.cos(r(elevation)),
    D * Math.sin(r(elevation)),
    D * Math.cos(r(angle)) * Math.cos(r(elevation)),
  ];
  return (
    <directionalLight
      position={pos}
      intensity={intensity}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-left={-90}
      shadow-camera-right={90}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-camera-near={1}
      shadow-camera-far={900}
    />
  );
}

/** Room round the pill so a tilted dome and its shading are never clipped (Next step's 14). */
export const PAD = 14;

/** The family's box rule — `.enquiry-nextstep-btn`. */
export const BOX_RULE: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 24px",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.025em",
  lineHeight: 1.5,
  whiteSpace: "nowrap",
};

/**
 * The lights for clay: a raking key low across the face (so the dome, rim, groove and bevel each
 * turn a different face to it), a soft fill from the other side, and a hemisphere so no face goes
 * fully black. The logo bench's arrangement, turned for a pill that faces the camera.
 */
/** The clay's two lamps, as positions (x mirrored by `side`) — read by `ClayLight` and drawn by `ClayLightHelper`. */
export const CLAY_LAMPS = { key: { at: [340, 300, 420] as const, intensity: 2.2 }, fill: { at: [-160, -260, 520] as const, intensity: 0.75 } };

export function ClayLight({ side }: { side: "left" | "right" }) {
  const s = side === "left" ? -1 : 1;
  return (
    <>
      {/* ⚠ TAKE 1 WAS TOO DARK TO JUDGE (12 October): the key grazed from the side ([±400, 260, 180]) and the
          lower half of the dome fell to black — the clay read as charcoal and the groove and lower bevel barely
          showed. The key now comes from upper-left FRONT, still raking (so each band of the profile turns a
          different face to it), with a real fill from the front-below and more sky. */}
      <hemisphereLight args={["#ffffff", "#4a4a4a", 0.7]} />
      <directionalLight position={[s * CLAY_LAMPS.key.at[0], CLAY_LAMPS.key.at[1], CLAY_LAMPS.key.at[2]]} intensity={CLAY_LAMPS.key.intensity} />
      <directionalLight position={[s * CLAY_LAMPS.fill.at[0], CLAY_LAMPS.fill.at[1], CLAY_LAMPS.fill.at[2]]} intensity={CLAY_LAMPS.fill.intensity} />
    </>
  );
}

/**
 * ⛔ THE PILL'S OWN STUDIO — DESIGNED FOR THIS BUTTON (pass 2, take 2). The desk mark's METHOD (Lightformer-style panels
 * rendered once into a PMREM reflection environment, `buildLogoStudioEnv`), not its panels.
 *
 * ⚠ WHY NOT THE DESK MARK'S STUDIO (take 1, 12 October): it was designed for GOLD standing on the room's desk — its warm
 * floor bounce (#ffb060) turned the lower dome GREEN (teal F0 × orange), and its dark band between the top softbox and the
 * front fill put light and dark stripes behind the label (luminance 0.007–0.143 across the text box). The swatch sheet's
 * teal runs from near-black shadows to #6BEDFD highlights — never green.
 *
 * ⛔ THE BRIEF THE PANELS ANSWER: everything BEHIND THE LABEL bright, so dark ink holds ≥ 4.5:1 at every pixel — and holds
 * it under pass 3's moving light, because a light can only ADD to a metal's brightness (dark ink on a lit face is robust to
 * the sweep; white ink on a dark face is not — the highlight would cross the words at the arc's face-on moment). The text
 * box spans the flat top and the dome's slopes, whose normals reflect the camera ray from straight ahead up and down to
 * ~±70°, so a TENT of front, upper and lower panels covers that band. The chrome's contrast lives at the ENDS (two narrow
 * strips against dark sides) and the rim. Cool-neutral white — no warm bounce on a teal. Only direction matters.
 */
export const PILL_STUDIO: { background: string; formers: readonly { position: [number, number, number]; scale: [number, number, number]; intensity: number; color?: string }[] } = {
  background: "#040506",
  formers: [
    // ⚠ TAKE 3: the tent's gradient steepened (take 2 was front 1.0 / upper 1.15 / lower 0.8 — legible, 5.61:1 at the
    // worst pixel, but the face read as one flat colour, nearer enamel than metal). Brighter above, darker below, so the
    // dome has form; the label's worst pixel must stay ≥ 0.189 luminance (4.5:1 against #0a0a0a).
    // ⛔ TAKE 5 — THE FACE DARKENED FOR LIGHT TEXT (Carl, on take 4: *"The text will not be black. We need a complementary
    // colour, possibly light blue."*). Contrast is brightness, not hue: a pale blue (#cfe6ff, luminance 0.77) holds 4.5:1
    // only on a face no brighter than ~0.13, so the tent behind the label is dimmed to a deep teal while the rim catch and
    // the end-cap strips stay bright. ⚰️ Take 4 (near-black ink, worst pixel 5.02:1): front 0.95 / upper 1.45 / lower 0.7.
    // ⚠ The cost moves to pass 3: a light can only ADD brightness, so the moving light's highlight crossing the words is now
    // the risk (at the arc's face-on moment it lands on the flat top) — its strength and spread must keep the worst ≥ 4.5.
    // Take 6: dimmed a step further for margin — take 5 (0.26 / 0.4 / 0.2) held #cfe6ff at only 4.53:1 at the worst pixel,
    // too close to the line before pass 3's light is added. The blue kept; the face moved.
    { position: [0, 0, 6], scale: [10, 6, 1], intensity: 0.21, color: "#f2f8ff" }, // front: the flat top
    { position: [0, 4.2, 4], scale: [10, 4, 1], intensity: 0.33, color: "#f2f8ff" }, // upper: the dome's top slope
    { position: [0, -4.2, 4], scale: [10, 4, 1], intensity: 0.17, color: "#f2f8ff" }, // lower: the dome's lower slope
    { position: [0, 6, 0.5], scale: [10, 2.5, 1], intensity: 1.3, color: "#ffffff" }, // top: the rim's catch
    { position: [-6, 0.6, 3], scale: [0.9, 8, 1], intensity: 1.8, color: "#ffffff" }, // left strip: the end cap's glint
    { position: [6, 0.6, 3], scale: [0.9, 8, 1], intensity: 1.8, color: "#ffffff" }, // right strip
  ],
};

export function buildPillStudioEnv(gl: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(PILL_STUDIO.background);
  const geo = new THREE.PlaneGeometry(1, 1);
  const mats: THREE.Material[] = [];
  for (const f of PILL_STUDIO.formers) {
    const mat = new THREE.MeshBasicMaterial({ color: f.color ?? "white", side: THREE.DoubleSide, toneMapped: false });
    mat.color.multiplyScalar(f.intensity);
    mats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...f.position);
    mesh.scale.set(...f.scale);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  }
  const pmrem = new THREE.PMREMGenerator(gl);
  const rt = pmrem.fromScene(studio, 0, 0.1, 1000, { size: 256 });
  pmrem.dispose();
  geo.dispose();
  mats.forEach((m) => m.dispose());
  return rt;
}

/**
 * ⛔ PASS 3 — THE ABOUT LOGO's LIGHT (Carl, 12 October 2026: *"go look at the logo animation on the About page, especially the
 * blue platinum after its been gold. That is the look im going for here - only teal. The same sort of light must be used."*).
 * `studio = "logo"` uses the desk mark's own studio (`LOGO_JUDGING_STUDIO` via `buildLogoStudioEnv`) TURNED by `yawDeg` —
 * the director's method (`DESK_MARK_DIRECTOR`, `about-card-canvas.tsx`): the studio's ORIENTATION is directed so a key
 * softbox sits just off the face's mirror direction, and the face shows a gradient across it. `"pill"` is pass 2's studio.
 */
/**
 * ⛔ "teal" — THE ABOUT LOGO's STUDIO, KEPT AS ITS SORT OF LIGHT, CORRECTED FOR THIS METAL AND THIS SHAPE (light take 5):
 * the SAME panels in the SAME places (`LOGO_JUDGING_STUDIO`), with three changes, each from a finding —
 *   - the warm floor bounce made NEUTRAL: on gold it is the desk's warmth, on blue it deepens the blue, on teal it is GREEN;
 *   - the two tall softboxes scaled by `glint`: they are the two catches on the end caps, and at full strength they CLIP
 *     (Carl: *"2 bright shiny elements. this is too much. It must be lit but not to the extent where parts are blown out."*);
 *   - the front fill scaled by `fill`: the pill's FLAT top mirrors straight ahead — the front fill — so it alone decides
 *     the band behind the words; held even and deep enough that the ice-blue label keeps ≥ 4.5:1.
 * At rest the studio is unturned (the logo's at-rest orientation); turning it along Carl's path is the directing step.
 */
export function buildTealStudioEnv(gl: THREE.WebGLRenderer, glint: number, fill: number, yawRad = 0, floor = 1, surround = 0, bg = "", top = 1, fillSize = 1): THREE.WebGLRenderTarget {
  const studio = new THREE.Scene();
  // ⛔ THE GAPS FILLED (light take 9 — Carl: *"its not looking like a pill. There are 2 ugly black bands surroumding the
  // text and 2 dark bands on the crown."*). A mirror shows the studio's GAPS too: where the dome turns from the front fill
  // up to the top softbox (and down to the floor), and round the curved ends, it mirrored the near-black background — black
  // bands, the "picture frame" failure (`nextstep-geometry.ts`). `surround` raises the background to a dim NEUTRAL (linear
  // value), so every direction the dome faces reflects something and its tone runs continuously round the curve.
  // ⛔ LIGHT TAKE 10 — THE GAPS FILLED IN TEAL (Carl, 12 October, session 1: *"So can we make the black background a teal
  // background?"*; session 2, showing the about logo's blue: *"This is how i want it to look, but teal and on a curved
  // surface."*). `bg` (a hex colour) wins over `surround`: teal metal mirroring a dark teal gives a deeper teal of the same
  // family, so the gaps read as shadow on the dome rather than holes.
  studio.background = bg
    ? new THREE.Color(bg)
    : surround > 0 ? new THREE.Color().setRGB(surround, surround, surround, THREE.LinearSRGBColorSpace) : new THREE.Color(LOGO_JUDGING_STUDIO.background);
  const geo = new THREE.PlaneGeometry(1, 1);
  const mats: THREE.Material[] = [];
  const turn = new THREE.Matrix4().makeRotationY(yawRad);
  LOGO_JUDGING_STUDIO.formers.forEach((f, i) => {
    // 0, 1: the tall softboxes (the end-cap catches); 3: the front fill (the flat top); 4: the warm floor.
    // 4, the floor (made neutral): it lights the LOWER dome, which reaches into the bottom of the words' band — scaled by
    // `floor` (light take 6: the label's brightest pixels were the floor's, not the front fill's).
    // 2, the broad top: the dome's UPPER curve mirrors it — scaled by `top` (light take 11: brighter than the front fill, it
    // lit a ring round a darker centre and the words read as sitting in a trough; clay shows a dome).
    const k = i <= 1 ? glint : i === 2 ? top : i === 3 ? fill : i === 4 ? floor : 1;
    const color = i === 4 ? "#ffffff" : (f.color ?? "white");
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false });
    mat.color.multiplyScalar(f.intensity * k);
    mats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...f.position).applyMatrix4(turn);
    mesh.scale.set(...f.scale);
    // 3, the front fill, grown by `fillSize` (light take 11): small, only the near-flat centre mirrored it and the dome fell
    // straight to dark — a lit slot. Grown, the whole dome's front faces it and the light falls off across the curve.
    if (i === 3) mesh.scale.multiplyScalar(fillSize);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  });
  const pmrem = new THREE.PMREMGenerator(gl);
  const rt = pmrem.fromScene(studio, 0, 0.1, 1000, { size: 256 });
  pmrem.dispose();
  geo.dispose();
  mats.forEach((m) => m.dispose());
  return rt;
}

export function useStudio(enabled: boolean, studio: "pill" | "logo" | "teal" = "pill", yawDeg = 0, glint = 0.5, fill = 1, floor = 1, surround = 0, bg = "", top = 1, fillSize = 1): THREE.Texture | null {
  const gl = useThree((st) => st.gl);
  const rt = useMemo(
    () =>
      !enabled
        ? null
        : studio === "logo"
          ? buildLogoStudioEnv(gl, (yawDeg * Math.PI) / 180)
          : studio === "teal"
            ? buildTealStudioEnv(gl, glint, fill, (yawDeg * Math.PI) / 180, floor, surround, bg, top, fillSize)
            : buildPillStudioEnv(gl),
    [gl, enabled, studio, yawDeg, glint, fill, floor, surround, bg, top, fillSize],
  );
  useEffect(() => () => rt?.dispose(), [rt]);
  return rt?.texture ?? null;
}

export type PillProps = { w: number; h: number; tilt: boolean; legacy: boolean; metal: boolean; rough: number; envInt: number; studio?: "pill" | "logo" | "teal"; studioYaw?: number; glint?: number; fill?: number; floor?: number; surround?: number; studioBg?: string; top?: number; fillSize?: number; paint?: string; paintMetal?: number; paintRough?: number; band?: number };
export type LabelProps = { glyphs: Glyphs | null; depth: number; ink: string; bevel: number; onDrawn?: () => void };
export type KeyProps = { on: boolean; angle: number; elevation: number; intensity: number };

// `tilt` is the Rocker's (the pill and its letters rock together), so the pill itself ignores it.
export function Pill({ w, h, legacy, metal, rough, envInt, studio = "pill", studioYaw = 0, glint = 0.5, fill = 1, floor = 1, surround = 0, studioBg = "", top = 1, fillSize = 1, paint, paintMetal = 0, paintRough = CLAY.roughness, band = 0 }: PillProps) {
  const geometry = useMemo(() => buildPillGeometry(w, h, legacy ? NEXTSTEP_PROFILE : FAMILY_PROFILE), [w, h, legacy]);
  const env = useStudio(metal, studio, studioYaw, glint, fill, floor, surround, studioBg, top, fillSize);
  const material = useMemo(() => {
    // ⛔ `paint` — the CLAY, COLOURED (Carl, 12 October, session 2, on light take 11: *"it is coming off as recessed to the
    // eye. take the "metalness" out for now and just colour it teal."*): clay's own matte material and lights, which read as a
    // pill (*"the clay version is quite clearly a pill shape"*), in a colour instead of grey. Bench `?mode=teal`.
    // `paintMetal` (same session: *"we need to turn up the metalness gradually, at least then we will have an idea when the
    // ptoblems start"*) — the ONE variable stepped from 0; everything else is the painted clay's. Bench `?metalness=`.
    if (!metal) return new THREE.MeshStandardMaterial({ ...CLAY, color: paint ?? CLAY.color, metalness: paint ? paintMetal : 0, roughness: paint ? paintRough : CLAY.roughness });
    // The studio goes in at construction (react-hooks/immutability forbids setting it on the memoised material after).
    const m = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: rough, envMapIntensity: envInt, envMap: env });
    m.color.setRGB(TEAL_F0_LINEAR[0], TEAL_F0_LINEAR[1], TEAL_F0_LINEAR[2], THREE.LinearSRGBColorSpace);
    return m;
  }, [metal, rough, envInt, env, paint, paintMetal, paintRough]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const bandGeo = useMemo(() => (band > 0 ? buildPillBand(w, h, band) : null), [w, h, band]);
  useEffect(() => () => bandGeo?.dispose(), [bandGeo]);

  if (!bandGeo) return <mesh geometry={geometry} material={material} receiveShadow />;
  // ⛔ SOLID (`band` > 0, the roll): the front on the band's front face, the SAME dome turned 180° about x for the back (a
  // rotation, not a mirror), and the band between — `buildPillBand`.
  return (
    <>
      <mesh geometry={geometry} material={material} position-z={band / 2} />
      <group rotation-x={Math.PI}>
        <mesh geometry={geometry} material={material} position-z={band / 2} />
      </group>
      <mesh geometry={bandGeo} material={material} />
    </>
  );
}

/**
 * The slow rock (?tilt=1) — the PILL AND ITS LETTERS TOGETHER, so the dome's depth and the letters' extrusion both turn
 * to the camera. ⚠ Until take 7 the rock was on the pill mesh alone and the extruded label stayed still in front of it.
 */
export function Rocker({ tilt, children }: { tilt: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    if (!tilt) {
      g.rotation.set(0, 0, 0);
      return;
    }
    // One phrase every ~9 s about x, ~13 s about y.
    const t = clock.getElapsedTime();
    g.rotation.x = 0.42 * Math.sin((t * 2 * Math.PI) / 9);
    g.rotation.y = 0.3 * Math.sin((t * 2 * Math.PI) / 13);
  });
  return <group ref={group}>{children}</group>;
}

/**
 * ⛔ THE ROLL (D-088, 12 October 2026, session 2 — Carl: *"a forward rotation. So when it goes through 180deg you will see
 * "who we are" again. Rotating at a slowly speed."*; *"The rotation could be sped up in parts so the text isnt out of view fo
 * too long … let the movement do some of the work for us."*; *"add mouse proximity so its static when a user decides to press
 * it."*). FORWARD: about x, the top toward the viewer. ONE SPEED CURVE: dθ/dt = ω₀(1 − a·cos 2θ) — slowest at the faces
 * (θ = kπ, ω₀(1 − a)), fastest edge-on (ω₀(1 + a)); `a` = 0 a steady roll, → 1 a near-hold; ω₀ set so a half-turn takes
 * `half` seconds (∫ dθ / ω = π / (ω₀ √(1 − a²))). THE HOLD: `hold` (the pointer near) eases the run to 0 and the angle to the
 * NEAREST face — front or back, both read the words; released, the run eases back. Integrated per frame, so it resumes from
 * where it stopped. `at` (degrees) freezes it, for judging and capture.
 */
export type RollProps = { on: boolean; half: number; ease: number; hold: boolean; at: number | null };
export function Roller({ roll, children }: { roll?: RollProps; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const state = useRef({ theta: 0, run: 1 });
  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    if (!roll?.on) {
      g.rotation.x = 0;
      return;
    }
    if (roll.at !== null) {
      g.rotation.x = (roll.at * Math.PI) / 180;
      return;
    }
    const dt = Math.min(dtRaw, 0.1);
    const st = state.current;
    const a = Math.min(0.95, Math.max(0, roll.ease));
    const w0 = Math.PI / (roll.half * Math.sqrt(1 - a * a));
    st.run = THREE.MathUtils.damp(st.run, roll.hold ? 0 : 1, 5, dt);
    st.theta += dt * w0 * (1 - a * Math.cos(2 * st.theta)) * st.run;
    if (roll.hold) st.theta = THREE.MathUtils.damp(st.theta, Math.round(st.theta / Math.PI) * Math.PI, 4, dt);
    g.rotation.x = st.theta;
  });
  return <group ref={group}>{children}</group>;
}

/**
 * ⛔ THE FRAMES, GATED — `/about`'s MECHANISM, REUSED (structural note `live-work/structural-note-whoweare-rollout-12-october.md`,
 * point 6: *"When the moving light arrives it needs frames, and gating then REUSES `/about`'s mechanism"*). As `neon-bloom.tsx`
 * and `card-extrude.tsx`: the canvas stays `frameloop="demand"`; this asks for the next frame only while the canvas is ON
 * SCREEN in a visible tab (`canvasOnScreen`, shared with `card-extrude.tsx`), re-checked on scroll (capture, coalesced to one
 * per animation frame), resize and `visibilitychange`; coming back on screen restarts it. Mounted only when something moves
 * (the roll, the moving lamp) — never under reduced motion. The roll clamps its step (0.1 s), so a pause resumes smoothly.
 */
export function Ticker() {
  const gl = useThree((st) => st.gl);
  const invalidate = useThree((st) => st.invalidate);
  const onScreen = useRef(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const was = onScreen.current;
      onScreen.current = canvasOnScreen(gl.domElement);
      if (onScreen.current && !was) invalidate();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    check();
    return () => {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [gl, invalidate]);
  useFrame((st) => {
    if (onScreen.current) st.invalidate();
  });
  return null;
}

/** One pill: the clay mesh built to the box, on its own canvas, centred behind the label. */
export function PillCanvas({
  zoom,
  side,
  label,
  keyLight,
  frameloop = "always",
  helpers = false,
  onLost,
  moving,
  roll,
  ticking = false,
  ...pill
}: PillProps & {
  zoom: number;
  side: "left" | "right";
  label: LabelProps;
  keyLight: KeyProps;
  /** "always" on the bench; "demand" on the site — the scene is STATIC until the moving light (structural note, 6). */
  frameloop?: "always" | "demand";
  /** ?lighthelpers=1 — the canvas grows to show where the light sits and which way it points. */
  helpers?: boolean;
  /** The WebGL context was lost — the home button falls back to its CSS look. */
  onLost?: () => void;
  /** The moving softbox: on, and frozen at a travel fraction (0…1) or moving (null). */
  /** The roll (pass 1 reopened): the pill made solid and turned forward; see `Roller`. */
  roll?: RollProps;
  /** On a `demand` canvas: keep drawing while something moves and the canvas is on screen (`Ticker`). */
  ticking?: boolean;
  moving?: { on: boolean; frozen: number | null; intensity?: number; size?: number; kind?: "panel" | "lamp"; lift?: number; dip?: LightDip };
}) {
  const { w, h, tilt, metal, legacy } = pill;
  const helperPad = helpers ? HELPER_PAD : 0;
  const boxW = w * zoom + (PAD + helperPad) * 2;
  // A tilted dome needs more room vertically than a face-on one.
  const boxH = h * zoom + (PAD + helperPad) * 2 + (tilt ? h * zoom * 0.6 : 0);
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: (w - boxW) / 2, top: (h - boxH) / 2, width: boxW, height: boxH, pointerEvents: "none" }}
    >
      <Canvas
        orthographic
        camera={{ zoom, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        // The family's renderer (Next step's): Neutral tone mapping, so Pass 2's metal is judged on
        // the same curve the family will ship on.
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }}
        // ⚠ "always", not "demand": a static demand scene never draws without an invalidate()
        // (Next step's lesson — every pixel came back alpha 0). A bench can afford the frames.
        frameloop={frameloop}
        shadows
        style={{ pointerEvents: "none" }}
        onCreated={({ gl }) => {
          // ⚠ `checkShaderErrors` off, as every canvas here: `getProgramInfoLog` blocks on first use (answer-card-canvas.tsx).
          gl.debug.checkShaderErrors = false;
          if (onLost) gl.domElement.addEventListener("webglcontextlost", () => onLost(), { once: true });
        }}
      >
        {/* Clay is shown by lights; the metal by its studio alone (pass 2). Pass 3 adds the global and moving light. */}
        {!metal && <ClayLight side={side} />}
        {!metal && helpers && <ClayLightHelper side={side} reach={w / 2 + HELPER_PAD * 0.6} />}
        {metal && keyLight.on && <KeyLight angle={keyLight.angle} elevation={keyLight.elevation} intensity={keyLight.intensity} />}
        {metal && keyLight.on && helpers && <LightHelper angle={keyLight.angle} elevation={keyLight.elevation} reach={w / 2 + HELPER_PAD * 0.6} />}
        {/* the moving softbox lights the painted pill too (Carl, session 2, on roughness 0.4: "If adding a moving light source
            would help then tuning then do that") — a RectAreaLight lights any MeshStandardMaterial, metal or not */}
        {(metal || !!pill.paint) && moving?.on && <MovingSoftbox w={w} h={h} frozen={moving.frozen} helpers={helpers} intensity={moving.intensity} size={moving.size} kind={moving.kind} lift={moving.lift} dip={moving.dip} />}
        {metal && helpers && (pill.studio === "teal" || pill.studio === "logo") && (
          <StudioHelper
            yawDeg={pill.studioYaw ?? 0}
            glint={pill.studio === "teal" ? (pill.glint ?? 0.5) : 1}
            fill={pill.studio === "teal" ? (pill.fill ?? 1) : 1}
            floor={pill.studio === "teal" ? (pill.floor ?? 1) : 1}
          />
        )}
        {ticking && <Ticker />}
        <Rocker tilt={tilt}>
          <Roller roll={roll}>
            <Pill {...pill} />
            {label.glyphs && (
              <group position-z={(pill.band ?? 0) / 2}>
                <ExtrudedLabel glyphs={label.glyphs} w={w} h={h} legacy={legacy} depth={label.depth} ink={label.ink} bevel={label.bevel} onDrawn={label.onDrawn} />
              </group>
            )}
            {/* the back's words: the front's, turned 180° about x with the back dome — upright when they come round */}
            {label.glyphs && (pill.band ?? 0) > 0 && (
              <group rotation-x={Math.PI}>
                <group position-z={(pill.band ?? 0) / 2}>
                  <ExtrudedLabel glyphs={label.glyphs} w={w} h={h} legacy={legacy} depth={label.depth} ink={label.ink} bevel={label.bevel} />
                </group>
              </group>
            )}
          </Roller>
        </Rocker>
      </Canvas>
    </div>
  );
}


/** How far the canvas grows each way when the light helpers are on. */
const HELPER_PAD = 130; // room for the studio's panels (the top one at y ≈ 120 px) and the key's sun

/**
 * ⛔ THE LIGHT HELPERS (Carl, 12 October 2026: *"We will implement the "light helpers"" … "show the light helpers"*) — as
 * `/about`'s `?lighthelpers=1`: the light DRAWN, so its place and direction can be judged. A directional light has no
 * position, only a direction, so it is drawn as a small sun at `reach` px along that direction (on the button's plane,
 * pulled toward the viewer by its own elevation and angle) and a line to the button's centre. Never on a plain visit.
 */
export function LightHelper({ angle, elevation, reach }: { angle: number; elevation: number; reach: number }) {
  // Everything derived from the three numbers inside one memo — no dependency to suppress.
  const { at, line } = useMemo(() => {
    const r = (d: number) => (d * Math.PI) / 180;
    const dir = new THREE.Vector3(
      Math.sin(r(angle)) * Math.cos(r(elevation)),
      Math.sin(r(elevation)),
      Math.cos(r(angle)) * Math.cos(r(elevation)),
    );
    const sun = dir.multiplyScalar(reach / Math.max(0.2, Math.hypot(dir.x, dir.y)));
    return { at: sun, line: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 20), sun]) };
  }, [angle, elevation, reach]);
  useEffect(() => () => line.dispose(), [line]);
  return (
    <group>
      <mesh position={at}>
        <sphereGeometry args={[5, 16, 12]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <lineSegments geometry={line}>
        <lineBasicMaterial color="#ffd27a" transparent opacity={0.7} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

/**
 * ⛔ THE CLAY's LAMPS, DRAWN (Carl, 12 October 2026, session 2, on the roll on the home page: *"Just put the light helpers on
 * the page for explanation purposes."*). Since R-045 the button is lit by the clay's lamps (`ClayLight`) plus the moving lamp;
 * the static key the old helper drew is OFF. Each directional lamp as `LightHelper` draws one: a gold sun at `reach` px along
 * its direction (projected onto the button's plane), a line to the centre, the sun's size by the lamp's strength. The
 * hemisphere (the sky/ground fill) has no direction to draw. `?lighthelpers=1` only.
 */
export function ClayLightHelper({ side, reach }: { side: "left" | "right"; reach: number }) {
  const lamps = useMemo(() => {
    const s = side === "left" ? -1 : 1;
    return [CLAY_LAMPS.key, CLAY_LAMPS.fill].map((l) => {
      const dir = new THREE.Vector3(s * l.at[0], l.at[1], l.at[2]).normalize();
      const sun = dir.clone().multiplyScalar(reach / Math.max(0.2, Math.hypot(dir.x, dir.y)));
      return { sun, size: 3 + 2.5 * l.intensity, line: new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 20), sun]) };
    });
  }, [side, reach]);
  useEffect(() => () => lamps.forEach((l) => l.line.dispose()), [lamps]);
  return (
    <group>
      {lamps.map((l, i) => (
        <group key={i}>
          <mesh position={l.sun}>
            <sphereGeometry args={[l.size, 16, 12]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
          <lineSegments geometry={l.line}>
            <lineBasicMaterial color="#ffd27a" transparent opacity={0.7} toneMapped={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/**
 * ⛔ THE MOVING LIGHT — ONE SOFTBOX ON CARL's PATH (Carl, 12 October 2026: option 2 — *"implement 2"*: the studio FIXED as the
 * global light, *"Then we will use a single light to bring it to life"*; the path: *"If it starts off top left of the button
 * looking right it can then arc outwards looking face on and end up bottom right looking left. it can be put on a loop and we
 * will fine tune when it is in place."*).
 * ⛔ A SOFT PANEL, NOT A LAMP — "the same sort of light" as the about logo, whose light is softboxes: on metal a point or
 * directional light makes a tiny hard pinpoint; a panel makes a smooth gradient. A `RectAreaLight` is a real rectangular
 * panel, cheap to move every frame (the studio is a baked reflection map — moving a panel INSIDE it would mean re-baking it
 * per frame).
 * THE PATH (button px, the button's centre at the origin, +z toward the viewer): a quadratic Bézier from TOP LEFT (P0) out
 * through the viewer's side (the control point far out on +z, so mid-path the panel faces the button head-on) to BOTTOM RIGHT
 * (P2); the panel ALWAYS faces the button's centre — so it aims right-and-down at the start, face-on mid-arc, left-and-up at
 * the end. ⛔ THE LOOP: it fades in over the first `fade` of its travel and out over the last, rests, and starts again — the
 * return to the start is never seen. Takes for the bench: `period`, `rest`, `intensity`, the panel's size. `?mt=` (0…1)
 * FREEZES it at a point on the path, for judging and for measuring the label and the blow-out along the whole path.
 */
export const MOVING_SOFTBOX = { period: 7, rest: 1.2, fade: 0.15, intensity: 0.5, panelW: 70, panelH: 34, out: 150, side: 40 } as const;

let rectAreaReady = false;
function useRectAreaLights() {
  if (!rectAreaReady && typeof window !== "undefined") {
    RectAreaLightUniformsLib.init();
    rectAreaReady = true;
  }
}

/** Where the softbox is at travel fraction `s` (0 top left … 1 bottom right), and its strength (the fades). */
export function softboxAt(s: number, w: number, h: number, lift = 0) {
  const P0 = new THREE.Vector3(-(w / 2 + MOVING_SOFTBOX.side), h * 1.4, 24);
  // `lift` raises the arc's face-on moment (px at the control point; the arc's middle rises by half): the pill's flat strip
  // mirrors a light dead in front straight back as a blazing bar — the about logo's director holds its key 12° off the face's
  // mirror direction for the same reason. Bench `?mllift=`.
  const P1 = new THREE.Vector3(0, lift, MOVING_SOFTBOX.out * 2);
  const P2 = new THREE.Vector3(w / 2 + MOVING_SOFTBOX.side, -h * 1.4, 24);
  const u = 1 - s;
  const pos = P0.clone().multiplyScalar(u * u).add(P1.clone().multiplyScalar(2 * u * s)).add(P2.clone().multiplyScalar(s * s));
  const f = MOVING_SOFTBOX.fade;
  const env = s < f ? s / f : s > 1 - f ? (1 - s) / f : 1;
  return { pos, strength: env * env * (3 - 2 * env) };
}

/** The travel fraction at clock time `t` — eased (legato), with the rest between loops. */
function travelAt(t: number): number | null {
  const { period, rest } = MOVING_SOFTBOX;
  const c = t % (period + rest);
  if (c > period) return null; // resting, unlit
  const x = c / period;
  return x * x * (3 - 2 * x);
}

/**
 * `kind` / `size` (12 October, session 2 — on the painted metal, roughness 0.4, the 70 × 34 panel lit ONLY the flat strip
 * behind the words, as a hard-edged slot, and never crossed the dome): `size` scales the panel; `kind = "lamp"` puts a
 * directional lamp on the same path, aimed at the centre — on this metal a lamp is a soft catch, so it TRAVELS along the
 * dome. Same path, same clock, same fades. Bench `?mlsize=`, `?mlkind=lamp`.
 */
/**
 * ⛔ THE DIP (Carl, 12 October, session 2, on the lamp film: *"Theres a point in the film when the text is nearly blown out,
 * could the light be turnrd down at that point and put back up when it is passed."*) — the strength eased DOWN by `depth`
 * (0…1) round travel fraction `at`, over `width` either side, by a cosine bell: smooth in, smooth out. Measured: the words
 * wash out from s ≈ 0.35 to 0.65, worst at the face-on 0.5 (1.29:1). Bench `?mldip=` `?mldipat=` `?mldipw=`.
 */
export type LightDip = { depth: number; at: number; width: number };
export function dipAt(s: number, dip?: LightDip): number {
  if (!dip || dip.depth <= 0 || dip.width <= 0) return 1;
  const d = Math.abs(s - dip.at) / dip.width;
  return d >= 1 ? 1 : 1 - dip.depth * 0.5 * (1 + Math.cos(Math.PI * d));
}

export function MovingSoftbox({ w, h, frozen, helpers, intensity = MOVING_SOFTBOX.intensity, size = 1, kind = "panel", lift = 0, dip }: { w: number; h: number; frozen: number | null; helpers: boolean; intensity?: number; size?: number; kind?: "panel" | "lamp"; lift?: number; dip?: LightDip }) {
  useRectAreaLights();
  const light = useRef<THREE.RectAreaLight | THREE.DirectionalLight>(null);
  const outline = useRef<THREE.LineLoop>(null);
  // The LAMP's helper (12 October, session 2 — *"put the light helpers on the page for explanation purposes"*): a lamp has no
  // panel to outline, so it is drawn as a SUN where it is on the path, a line to the centre (where it aims), both as bright
  // as the lamp is at that moment (its fades and the dip over the words).
  const sun = useRef<THREE.Mesh>(null);
  const sunMat = useRef<THREE.MeshBasicMaterial>(null);
  const aimMat = useRef<THREE.LineBasicMaterial>(null);
  const aim = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 20), new THREE.Vector3()]), []);
  const path = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i++) pts.push(softboxAt(i / 40, w, h, lift).pos);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [w, h, lift]);
  const rect = useMemo(() => {
    const a = (MOVING_SOFTBOX.panelW * size) / 2, b = (MOVING_SOFTBOX.panelH * size) / 2;
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-a, -b, 0), new THREE.Vector3(a, -b, 0), new THREE.Vector3(a, b, 0), new THREE.Vector3(-a, b, 0),
    ]);
  }, [size]);
  useEffect(() => () => { path.dispose(); rect.dispose(); aim.dispose(); }, [path, rect, aim]);

  useFrame(({ clock }) => {
    const l = light.current;
    if (!l) return;
    const s = frozen ?? travelAt(clock.getElapsedTime());
    if (s === null) {
      l.intensity = 0;
      if (outline.current) outline.current.visible = false;
      if (sun.current) sun.current.visible = false;
      if (aimMat.current) aimMat.current.opacity = 0;
      return;
    }
    const { pos, strength } = softboxAt(s, w, h, lift);
    l.position.copy(pos);
    l.lookAt(0, 0, 0);
    const k = strength * dipAt(s, dip);
    l.intensity = intensity * k;
    if (sun.current && sunMat.current && aimMat.current) {
      sun.current.visible = true;
      sun.current.position.copy(pos);
      sunMat.current.opacity = 0.15 + 0.85 * k;
      aimMat.current.opacity = 0.1 + 0.6 * k;
      const at = aim.getAttribute("position") as THREE.BufferAttribute;
      at.setXYZ(1, pos.x, pos.y, pos.z);
      at.needsUpdate = true;
    }
    if (outline.current) {
      outline.current.visible = true;
      outline.current.position.copy(pos);
      outline.current.quaternion.copy(l.quaternion);
    }
  });

  return (
    <>
      {kind === "lamp" ? (
        <directionalLight ref={light as React.Ref<THREE.DirectionalLight>} intensity={0} color="#ffffff" />
      ) : (
        <rectAreaLight ref={light as React.Ref<THREE.RectAreaLight>} width={MOVING_SOFTBOX.panelW * size} height={MOVING_SOFTBOX.panelH * size} intensity={0} color="#ffffff" />
      )}
      {helpers && (
        <>
          <line>
            <primitive object={path} attach="geometry" />
            <lineBasicMaterial color="#7fe3ff" transparent opacity={0.55} toneMapped={false} />
          </line>
          {kind === "lamp" ? (
            <>
              <mesh ref={sun}>
                <sphereGeometry args={[7, 16, 12]} />
                <meshBasicMaterial ref={sunMat} color="#7fe3ff" transparent toneMapped={false} />
              </mesh>
              <lineSegments geometry={aim}>
                <lineBasicMaterial ref={aimMat} color="#7fe3ff" transparent toneMapped={false} />
              </lineSegments>
            </>
          ) : (
            <lineLoop ref={outline} geometry={rect}>
              <lineBasicMaterial color="#7fe3ff" toneMapped={false} />
            </lineLoop>
          )}
        </>
      )}
    </>
  );
}

/** Studio units → helper px: the panels drawn round the button, outside it where the studio has them at the sides. */
const STUDIO_HELPER_SCALE = 24;

/**
 * ⛔ THE STUDIO'S HELPERS (Carl, 12 October 2026: *"putthe light hrlprts in"*) — the light is the REFLECTION of softbox panels
 * (`LOGO_JUDGING_STUDIO`, as the about logo), so the helpers draw the PANELS: each an outline where it sits round the button
 * (studio units × `STUDIO_HELPER_SCALE`), turned with the studio, its brightness the panel's strength after this button's
 * scalings (`glint` the two tall boxes — the end-cap catches; `fill` the front fill — the words' band; `floor`). Seen face-on, a
 * panel IN FRONT (the front fill) is drawn over the button: it is the one the flat top mirrors.
 */
export function StudioHelper({ yawDeg, glint, fill, floor }: { yawDeg: number; glint: number; fill: number; floor: number }) {
  const panels = useMemo(() => {
    const turn = new THREE.Matrix4().makeRotationY((yawDeg * Math.PI) / 180);
    return LOGO_JUDGING_STUDIO.formers.map((f, i) => {
      const k = i <= 1 ? glint : i === 3 ? fill : i === 4 ? floor : 1;
      const at = new THREE.Vector3(...f.position).applyMatrix4(turn).multiplyScalar(STUDIO_HELPER_SCALE);
      const m = new THREE.Object3D();
      m.position.copy(at);
      m.lookAt(0, 0, 0);
      const hw = (f.scale[0] * STUDIO_HELPER_SCALE) / 2, hh = (f.scale[1] * STUDIO_HELPER_SCALE) / 2;
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-hw, -hh, 0), new THREE.Vector3(hw, -hh, 0), new THREE.Vector3(hw, hh, 0), new THREE.Vector3(-hw, hh, 0),
      ]);
      const strength = Math.min(1, (f.intensity * k) / 1.7);
      return { g, position: m.position.clone(), quaternion: m.quaternion.clone(), opacity: 0.25 + 0.75 * strength };
    });
  }, [yawDeg, glint, fill, floor]);
  useEffect(() => () => panels.forEach((p) => p.g.dispose()), [panels]);
  return (
    <group>
      {panels.map((p, i) => (
        <lineLoop key={i} geometry={p.g} position={p.position} quaternion={p.quaternion}>
          <lineBasicMaterial color="#ffd27a" transparent opacity={p.opacity} toneMapped={false} />
        </lineLoop>
      ))}
    </group>
  );
}

/**
 * Measure a family label where the browser draws it — the box, the font, each character's left edge and the baseline,
 * relative to the box's centre, y up. `el` is the span carrying the box rule; its first child must be the text node, and
 * `baseMark` a zero-size inline-block on the baseline (its top IS the baseline). Shared by the bench and the home button,
 * so both place the letters the same way.
 */
export function measureLabel(
  el: HTMLElement,
  baseMark: HTMLElement | null,
  /** The element whose box IS the button (the bench: `el` itself; the home page: the link around the words). */
  boxEl: HTMLElement = el,
): { w: number; h: number; font: string; glyphs: Glyphs } {
  const r = boxEl.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const node = el.firstChild;
  const xs: number[] = [];
  const range = document.createRange();
  if (node && node.nodeType === Node.TEXT_NODE) {
    for (let i = 0; i < (node.textContent ?? "").length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      xs.push(range.getBoundingClientRect().left - cx);
    }
  }
  const baseline = baseMark ? -(baseMark.getBoundingClientRect().top - cy) : 0;
  return {
    w: Math.round(r.width * 10) / 10,
    h: Math.round(r.height * 10) / 10,
    font: getComputedStyle(el).fontFamily,
    glyphs: { chars: node?.textContent ?? "", x: xs, baseline, px: parseFloat(getComputedStyle(el).fontSize) || TYPE_PX },
  };
}

/**
 * ⛔ THE HOME PAGE's LOOK — the bench take Carl judged (R-045, *"a lot better"*; the roll: *"the roll looks great. Implement
 * it along with the rest of the tweaks on the page"*, 12 October, session 2). The clay's matte material and lamps, painted the
 * brand teal and turned to full metal at roughness 0.4 (Carl's pick on the roughness ramp: *"closer without becoming too dark
 * and it still showing metalness"*); the pill SOLID and ROLLING forward (`Roller`), held on the nearest face when the pointer
 * comes near or the link has focus; one moving LAMP on Carl's path, its arc lifted off the flat strip, dipped as it crosses
 * the words. ⚠ The lamp's lift and dip were tuned at 1× on a still pill — at 2× and rolling, Carl: *"we will see if we need to
 * make little adjustments with the light monements."*
 */
export const WHOWEARE_LOOK = {
  paint: "#1fb2c4",
  paintMetal: 1,
  paintRough: 0.4,
  band: FAMILY_BAND,
  roll: { half: 5, ease: 0.7 },
  lamp: { kind: "lamp" as const, intensity: 1, lift: 120, dip: { depth: 0.9, at: 0.5, width: 0.4 } },
};

/**
 * ⛔ THE HOME PAGE's SCENE — so the home button passes only what it measured and its two states (the hold, reduced motion),
 * and nothing it would have to keep in step (its one copy is the ink, for its CSS fallback, which must paint before this
 * module loads). ⛔ REDUCED MOTION: no roll, no moving lamp, no frames — the pill rests face-on under the base lamps.
 */
export function WhoWeAreScene({
  w,
  h,
  glyphs,
  helpers,
  hold,
  reduced,
  onDrawn,
  onLost,
}: {
  w: number;
  h: number;
  glyphs: Glyphs;
  helpers: boolean;
  hold: boolean;
  reduced: boolean;
  onDrawn: () => void;
  onLost: () => void;
}) {
  const L = WHOWEARE_LOOK;
  return (
    <PillCanvas
      w={w}
      h={h}
      zoom={1}
      side="left"
      tilt={false}
      legacy={false}
      metal={false}
      paint={L.paint}
      paintMetal={L.paintMetal}
      paintRough={L.paintRough}
      band={L.band * h}
      rough={TEAL_DEFAULTS.roughness}
      envInt={TEAL_DEFAULTS.envMapIntensity}
      frameloop="demand"
      ticking={!reduced}
      roll={{ on: !reduced, half: L.roll.half, ease: L.roll.ease, hold, at: null }}
      moving={{ on: !reduced, frozen: null, intensity: L.lamp.intensity, kind: L.lamp.kind, lift: L.lamp.lift, dip: L.lamp.dip }}
      helpers={helpers}
      label={{ glyphs, depth: EXTRUDE_DEPTH_DEFAULT * (glyphs.px ? glyphs.px / 14 : 1), ink: "#" + INK_DEFAULT, bevel: BEVEL_DEFAULT, onDrawn }}
      keyLight={{ on: false, angle: KEY_DEFAULTS.angle, elevation: KEY_DEFAULTS.elevation, intensity: KEY_DEFAULTS.intensity }}
      onLost={onLost}
    />
  );
}
