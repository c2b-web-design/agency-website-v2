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
import { buildPillGeometry, familySurfaceZ, FAMILY_PROFILE, NEXTSTEP_PROFILE } from "@/components/ui/button-family-geometry";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

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

export type Glyphs = { chars: string; x: number[]; baseline: number };

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
    const size = (TYPE_PX * font.data.resolution) / EM_UNITS;
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
export function ClayLight({ side }: { side: "left" | "right" }) {
  const s = side === "left" ? -1 : 1;
  return (
    <>
      {/* ⚠ TAKE 1 WAS TOO DARK TO JUDGE (12 October): the key grazed from the side ([±400, 260, 180]) and the
          lower half of the dome fell to black — the clay read as charcoal and the groove and lower bevel barely
          showed. The key now comes from upper-left FRONT, still raking (so each band of the profile turns a
          different face to it), with a real fill from the front-below and more sky. */}
      <hemisphereLight args={["#ffffff", "#4a4a4a", 0.7]} />
      <directionalLight position={[s * 340, 300, 420]} intensity={2.2} />
      <directionalLight position={[-s * 160, -260, 520]} intensity={0.75} />
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

export function useStudio(enabled: boolean): THREE.Texture | null {
  const gl = useThree((st) => st.gl);
  const rt = useMemo(() => (enabled ? buildPillStudioEnv(gl) : null), [gl, enabled]);
  useEffect(() => () => rt?.dispose(), [rt]);
  return rt?.texture ?? null;
}

export type PillProps = { w: number; h: number; tilt: boolean; legacy: boolean; metal: boolean; rough: number; envInt: number };
export type LabelProps = { glyphs: Glyphs | null; depth: number; ink: string; bevel: number; onDrawn?: () => void };
export type KeyProps = { on: boolean; angle: number; elevation: number; intensity: number };

// `tilt` is the Rocker's (the pill and its letters rock together), so the pill itself ignores it.
export function Pill({ w, h, legacy, metal, rough, envInt }: PillProps) {
  const geometry = useMemo(() => buildPillGeometry(w, h, legacy ? NEXTSTEP_PROFILE : FAMILY_PROFILE), [w, h, legacy]);
  const env = useStudio(metal);
  const material = useMemo(() => {
    if (!metal) return new THREE.MeshStandardMaterial(CLAY);
    // The studio goes in at construction (react-hooks/immutability forbids setting it on the memoised material after).
    const m = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: rough, envMapIntensity: envInt, envMap: env });
    m.color.setRGB(TEAL_F0_LINEAR[0], TEAL_F0_LINEAR[1], TEAL_F0_LINEAR[2], THREE.LinearSRGBColorSpace);
    return m;
  }, [metal, rough, envInt, env]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  return <mesh geometry={geometry} material={material} receiveShadow />;
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

/** One pill: the clay mesh built to the box, on its own canvas, centred behind the label. */
export function PillCanvas({
  zoom,
  side,
  label,
  keyLight,
  frameloop = "always",
  helpers = false,
  onLost,
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
        {metal && keyLight.on && <KeyLight angle={keyLight.angle} elevation={keyLight.elevation} intensity={keyLight.intensity} />}
        {metal && keyLight.on && helpers && <LightHelper angle={keyLight.angle} elevation={keyLight.elevation} reach={w / 2 + HELPER_PAD * 0.6} />}
        <Rocker tilt={tilt}>
          <Pill {...pill} />
          {label.glyphs && <ExtrudedLabel glyphs={label.glyphs} w={w} h={h} legacy={legacy} depth={label.depth} ink={label.ink} bevel={label.bevel} onDrawn={label.onDrawn} />}
        </Rocker>
      </Canvas>
    </div>
  );
}


/** How far the canvas grows each way when the light helpers are on. */
const HELPER_PAD = 90;

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
    glyphs: { chars: node?.textContent ?? "", x: xs, baseline },
  };
}

/**
 * ⛔ THE HOME PAGE's SCENE, WITH THE APPROVED VALUES — so the home button passes only what it measured and nothing it would
 * have to keep in step (its one copy is the ink, for its CSS fallback, which must paint before this module loads).
 */
export function WhoWeAreScene({
  w,
  h,
  glyphs,
  helpers,
  onDrawn,
  onLost,
}: {
  w: number;
  h: number;
  glyphs: Glyphs;
  helpers: boolean;
  onDrawn: () => void;
  onLost: () => void;
}) {
  return (
    <PillCanvas
      w={w}
      h={h}
      zoom={1}
      side="left"
      tilt={false}
      legacy={false}
      metal
      rough={TEAL_DEFAULTS.roughness}
      envInt={TEAL_DEFAULTS.envMapIntensity}
      frameloop="demand"
      helpers={helpers}
      label={{ glyphs, depth: EXTRUDE_DEPTH_DEFAULT, ink: "#" + INK_DEFAULT, bevel: BEVEL_DEFAULT, onDrawn }}
      keyLight={{ on: true, angle: KEY_DEFAULTS.angle, elevation: KEY_DEFAULTS.elevation, intensity: KEY_DEFAULTS.intensity }}
      onLost={onLost}
    />
  );
}
