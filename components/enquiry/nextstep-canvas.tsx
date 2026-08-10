"use client";

/**
 * The Next step button as a Three.js mesh — a domed pill in chrome blue metal.
 *
 * ⚠ PROTOTYPE. Nothing here is approved. Carl asked for the mesh so the chrome
 * can be judged at its real size (116x41px) with the corridor's own light moving
 * over it. Read `nextstep-geometry.ts` first — it carries the reasoning for the
 * form, the material and the amber question.
 *
 * ── WHAT IS BEING TESTED, IN PRIORITY ORDER ──────────────────────────────
 *
 *   1. **Does chrome read as chrome at 116x41?** A mirror with nothing to
 *      reflect is a dark smear. The environment IS the material here.
 *   2. **Does the traveller's sweep produce a VISIBLE swing?** This is the test
 *      the opal's proximity model failed — a 1.3x distance range that was far
 *      too flat to see. `verify/nextstep-swing.mjs` measures it rather than
 *      trusting the picture.
 *   3. **Can the cards' amber reach it when 4 and 5 are selected?** Carl's
 *      ordering. If real light does not carry, a placed amber light is the
 *      sanctioned fallback — *"Belonging in the same world is what counts."*
 */

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  NEXTSTEP_WIDTH_PX,
  NEXTSTEP_HEIGHT_PX,

  NEXTSTEP_CANVAS_PAD_PX,
  crownHeight,

} from "./nextstep-geometry";
import {
  ENV_SHELL_RADIUS,
  ENV_KEY_COLOR,
  ENV_KEY_INTENSITY,
  ENV_FILL_COLOR,
  ENV_FILL_INTENSITY,
} from "./answer-card-glass";

/**
 * Chrome's roughness.
 *
 * ⚠ NOT ZERO, AND THAT IS DELIBERATE. A perfect mirror at 116x41px resolves the
 * environment into noise — every panel edge becomes a hard line across a
 * 41px-tall object. A little roughness turns those into the tight travelling
 * HIGHLIGHT that reads as chrome in Carl's references, where the specular runs
 * as a hairline along each stroke rather than as a picture of the room.
 */
const CHROME_ROUGHNESS = 0.08;

/**
 * ⚠ WHITE, BECAUSE CHROME HAS NO COLOUR OF ITS OWN. The blue comes from the
 * environment — this is the whole finding from Carl's reference set, where the
 * same material reads blue, amber or grey depending only on the room. Tinting
 * the body here would make it painted metal and it would stop responding to the
 * scene the way the Chrome Boy responds to a grey backdrop.
 */
const CHROME_COLOR = "#ffffff";

function urlFloat(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/**
 * The domed pill, swept from the outline in `nextstep-geometry`.
 *
 * ⚠ BUILT AS A CROWNED SURFACE, NOT AN EXTRUSION WITH A BEVEL. Carl's logo
 * renders are rounded tubes and the specular runs ALONG the crown; a flat face
 * with a chamfered edge catches light in two separate bands instead of one
 * continuous line, which is the difference between chrome and moulded plastic.
 */
function usePillGeometry(w: number, h: number) {
  return useMemo(() => {
    /**
     * ⚠⚠ A HEIGHT FIELD OVER A GRID, NOT RINGS SWEPT INWARD FROM THE OUTLINE.
     *
     * The first version offset the closed pill path inward by up to h/2 per
     * ring. **That cannot work: offsetting a pill inward by its own half-height
     * collapses it to a line, and past that it inverts.** The rings folded
     * through each other and the button rendered as a white blob at the
     * upper-left with a bar along the bottom — a fold, not a surface.
     *
     * ⚠ THE LESSON IS GENERAL AND THE RIM AVOIDS IT BY LUCK OF SCALE.
     * `sweptBand` in `answer-card-mesh.tsx` insets by `RIM_TUBE_RADIUS` = 2,
     * which is tiny against the card, so it never folds. The same technique at
     * pill scale does.
     *
     * So the crown is a FUNCTION OF DISTANCE FROM THE EDGE, evaluated over a
     * regular grid and masked to the pill. Distance to a pill's boundary is
     * exact and cheap: the pill is the set of points within `r` of its
     * centre-line segment, so `r - distanceToSegment` is the inset, with no
     * offsetting and nothing to fold.
     */
    const r = h / 2;
    const cx = w / 2 - r; // the centre-line runs from (-cx,0) to (+cx,0)

    // Grid resolution. Dense enough that a mirror does not show its faceting —
    // the specular travels across this surface and steps would be visible.
    const nx = 220;
    const ny = 88;

    /** Inset from the boundary: 0 on the outline, r at the centre-line. */
    const insetAt = (x: number, y: number) => {
      const clamped = Math.max(-cx, Math.min(cx, x));
      const d = Math.hypot(x - clamped, y);
      return r - d;
    };

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const index: number[] = [];
    // -1 marks a grid point outside the pill, so triangles can skip it.
    const vid: number[] = new Array((nx + 1) * (ny + 1)).fill(-1);

    const zAt = (x: number, y: number) => {
      const inset = insetAt(x, y);
      if (inset <= 0) return 0;
      // crownHeight takes -1..1 across the short axis; inset runs 0..r from the
      // edge inward, so 1 - inset/r maps the edge to |t| = 1 and the centre to 0.
      return crownHeight(1 - inset / r);
    };

    for (let j = 0; j <= ny; j++) {
      const y = -r + (j / ny) * (2 * r);
      for (let i = 0; i <= nx; i++) {
        const x = -w / 2 + (i / nx) * w;
        if (insetAt(x, y) < 0) continue;

        const z = zAt(x, y);

        // Central differences for the normal. The gradient of a height field is
        // exact here and needs no reasoning about path frames — which is what
        // the swept version got wrong.
        const e = 0.35;
        const dzdx = (zAt(x + e, y) - zAt(x - e, y)) / (2 * e);
        const dzdy = (zAt(x, y + e) - zAt(x, y - e)) / (2 * e);
        const n = new THREE.Vector3(-dzdx, -dzdy, 1).normalize();

        vid[j * (nx + 1) + i] = positions.length / 3;
        positions.push(x, y, z);
        normals.push(n.x, n.y, n.z);
        uvs.push(i / nx, j / ny);
      }
    }

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = vid[j * (nx + 1) + i];
        const b = vid[j * (nx + 1) + i + 1];
        const c = vid[(j + 1) * (nx + 1) + i];
        const d = vid[(j + 1) * (nx + 1) + i + 1];
        // Only emit a quad where all four corners are inside the pill. The
        // boundary is therefore slightly stepped at grid resolution, which at
        // nx=220 is sub-pixel on a 116px button.
        if (a < 0 || b < 0 || c < 0 || d < 0) continue;
        /**
         * ⚠ COUNTER-CLOCKWISE. This was `(a, c, b, b, c, d)` — clockwise —
         * which three's default back-face culling would discard.
         *
         * ⚠⚠ BUT IT WAS **NOT** THE CAUSE OF THE INVISIBLE BUTTON, AND THE
         * CORRECTION MATTERS MORE THAN THE FIX. The canvas was rendering
         * correctly the whole time. `preserveDrawingBuffer: false` makes BOTH
         * `readPixels` AND `toDataURL` return an empty buffer on a STATIC
         * canvas, so every "alpha 0" reading was an instrument artefact.
         * `page.screenshot()` showed the mesh immediately.
         *
         * ⚠ IT COST FIVE WRONG FIXES: the crown deepened 2.4 -> 8.5, the env
         * panels rescaled, an `invalidate()` added, this winding flip, and
         * `DoubleSide`. Geometry (18,017 verts), camera (frustum +/-72 x +/-34.5
         * against a +/-58 x +/-20.5 pill), scene graph, culling, lighting and
         * `frameloop="always"` were each ruled out by measurement first — all
         * against a fault that did not exist.
         *
         * **Confirm the instrument can SEE the thing before believing what it
         * reports.** The corridor's canvases do not show this because the
         * traveller's rAF keeps them drawing.
         *
         * ⚠ THE WINDING IS STILL WRONG-WAY-ROUND WITHOUT THIS, so it stays —
         * it is a real fix for a real (if currently masked) problem, found with
         * a cross product on one quad's
         * first two edges, run in plain node with no browser. **Check the
         * winding before theorising about the material** — a culled surface and
         * an unlit surface look identical from outside.
         */
        index.push(a, b, c, b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(index);
    return geo;
  }, [w, h]);
}

/**
 * The environment the chrome reports.
 *
 * ⚠⚠ THIS IS THE MATERIAL. Chrome has no colour; it shows the room. So the blue
 * in Carl's references is built HERE, as panels, not on the material as a tint.
 *
 * ⚠ THE PANEL COLOURS ARE THE CARD'S OWN, imported rather than re-picked. The
 * button sits under the answer grid in the same corridor; two independently
 * chosen environments would put the two objects in two different rooms, and a
 * mirror would report the discrepancy immediately.
 *
 * ⚠ PMREM RESOLUTION IS LOAD-BEARING FOR THE HIGHLIGHT. The default 256 keeps
 * the specular a tight line; smaller sizes blur it into a sheen and the chrome
 * reads as grey plastic. `useLocalEnvMap` in `answer-card-canvas.tsx` records
 * the same trade-off from the other direction.
 */
function useChromeEnv(): THREE.Texture | null {
  const gl = useThree((s) => s.gl);

  const target = useMemo(() => {
    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

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
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    };

    const shellGeometry = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 16, 16);
    /**
     * ⚠⚠ THE SHELL IS DEEP NAVY, NOT BLACK — AND THIS IS THE SINGLE CHANGE THAT
     * MOVES CHROME TOWARD BLUE PLATINUM. Architect, 10 August 2026.
     *
     * It was `0x000000`, and the first render showed exactly what that produces:
     * **a bright ring around a black hole.** The crown's flat plateau faces the
     * camera and reflects the shell, so wherever the key panels do not reach,
     * the mirror returns the surround — and the surround was nothing.
     *
     * ⚠ IN CARL'S REFERENCE THE DARKS ARE NOT BLACK. The darkest parts of each
     * logo stroke are a deep saturated navy and the mid-tones are strongly blue.
     * **That blue IS the environment's ambient.** There was none.
     *
     * ⚠ AND IT IS THE ROOM, NOT THE MATERIAL. `CHROME_COLOR` stays white; the
     * moment a tint goes on the body it becomes painted metal and stops
     * reporting the scene, which is the whole finding from Carl's reference set.
     *
     * ⚠ A TRADE CARL SHOULD DECIDE RATHER THAN DISCOVER, flagged by the
     * Architect: the panel COLOURS are imported from `answer-card-glass.ts` so
     * the button and the cards share a room. A bluer shell puts the button in a
     * slightly bluer room than the cards. At 116x41 under the grid that is
     * probably invisible — but it is a real trade against the "same world"
     * principle this file is built on.
     */
    const shellMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#0b1a2e").multiplyScalar(urlFloat("shell", 0.9)),
      side: THREE.BackSide,
      toneMapped: false,
    });
    studio.add(new THREE.Mesh(shellGeometry, shellMaterial));
    disposables.push(shellGeometry, shellMaterial);

    /**
     * ⚠⚠ THE PANELS ARE SCALED TO THE BUTTON, NOT INHERITED FROM THE CARD.
     *
     * The first version reused the card's panel positions verbatim — sources at
     * 20-26 units from a 576px-wide object. Against a **41px button whose crown
     * is 2.4 units tall**, those sit so far outside the reflection that the
     * surface returned the black shell almost everywhere and **the button
     * rendered invisible**. Exactly the failure Carl predicted of chrome:
     * *"yes its unforgiving."*
     *
     * ⚠ THE COLOURS ARE STILL THE CARD'S, AND THAT PART MATTERS. Same room, same
     * light temperature — only the geometry is re-scaled. Re-picking the colours
     * would put the two objects in different worlds, which a mirror reports
     * immediately.
     *
     * ⚠ A BRIGHT NARROW KEY ABOVE, close in, is what becomes the travelling
     * hairline in Carl's references. A broad source would wrap the crown in an
     * even sheen and lose the line that distinguishes chrome from grey plastic.
     */
    /**
     * ⚠⚠ THE AXIS PANEL — THE TENT. WITHOUT IT THE TOP OF THE PILL IS BLACK,
     * AND THAT IS GEOMETRY, NOT A LIGHTING WEAKNESS. Architect, 10 August 2026.
     *
     * Work out what the plateau returns. Under an ORTHOGRAPHIC camera the view
     * direction is (0,0,-1) and the plateau's normal is (0,0,1), so the
     * reflection goes **straight back along +Z** — past every panel offset in
     * x/y and into the shell. **The entire flat top mirrors the surround**,
     * while the shoulders catch the key and go bright. Bright rim, dead centre:
     * a picture frame, which is exactly what the first render showed.
     *
     * ⚠ AND THE REFERENCE IS A LIGHT TENT WITH A SEPARATE BLACK BACKDROP. In
     * Carl's logo renders every part of every stroke is bright somewhere along
     * its length; nothing returns black except the true shadow side. The
     * backdrop behind the object is matte black, but **the environment in front
     * of it is a large wraparound source.** This code had collapsed the two into
     * one black sphere.
     *
     * So: a big dim panel square on the camera axis is what every camera-facing
     * normal returns. It is the difference between a mirror in a room and a
     * mirror in a void.
     */
    /**
     * ⚠ 0.15, NOT THE 1.3 THIS WAS FIRST BUILT WITH. The Architect's suggested
     * starting value was explicitly *"a starting point, not a prescription"*,
     * and swept against the real render it was far too hot: centre luminance
     * 210, a pale ice lozenge with the label barely legible.
     *
     *     axis 0.15   centre lum 115   rim/centre 2.1    <- this
     *     axis 0.35   centre lum 146   rim/centre 1.7
     *     axis 0.60   centre lum 170   rim/centre 1.4
     *     axis 1.30   centre lum 210   rim/centre 1.2    washed out
     *
     * ⚠ THE REFERENCE IS PREDOMINANTLY DARK WITH BRIGHT BANDS. A centre that
     * matches the rim has no bands left — the tonal range IS the material.
     */
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY * urlFloat("axis", 0.15), [0, 0, 34], [90, 90]);

    // The key: narrow and bright, above and slightly left. This is what becomes
    // the travelling hairline along the crown in Carl's references.
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * urlFloat("key", 1.6), [-6, 14, 12], [10, 60]);
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * 0.7, [10, 11, 14], [8, 46]);

    // A wide dim floor so the underside of the crown has something to return
    // other than the shell, and the object keeps its bottom edge against #101010.
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY * 2.2, [4, -13, 12], [70, 22]);

    // ⚠ A RIM SOURCE BEHIND AND TO THE SIDE, for the silhouette hairline. The
    // reference's strokes carry a bright edge where the surface turns away; with
    // sources only in front, that edge dies against the shell.
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * 0.8, [14, 4, -6], [6, 40]);

    const pmrem = new THREE.PMREMGenerator(gl);
    const built = pmrem.fromScene(studio, 0, 0.1, 200);
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    studio.clear();
    return built;
  }, [gl]);

  return target ? target.texture : null;
}

/**
 * The amber that arrives when cards are selected.
 *
 * ⚠ A PLACED LIGHT, AND CARL AUTHORISED IT IN ADVANCE: *"If the filament light
 * cannot reach the button it can be simulated by putting an amber light next to
 * the button and activating it when certain cards are pressed. Belonging in the
 * same world is what counts."*
 *
 * ⚠ IT IS OFF UNTIL MEASURED. `verify/nextstep-swing.mjs` reports whether the
 * real filaments carry to the button first; this exists so the answer to "they
 * do not" is one flag rather than a rebuild.
 */
function AmberSource({ strength }: { strength: number }) {
  if (strength <= 0) return null;
  return (
    <pointLight
      position={[0, -NEXTSTEP_HEIGHT_PX * 1.2, NEXTSTEP_HEIGHT_PX * 0.9]}
      color="#ffab52"
      intensity={strength * 900}
      distance={260}
      decay={2}
    />
  );
}

function ButtonMesh({ width, height, amber }: { width: number; height: number; amber: number }) {
  const geometry = usePillGeometry(width, height);
  const envMap = useChromeEnv();
  const invalidate = useThree((s) => s.invalidate);

  /**
   * ⚠⚠ WITHOUT THIS THE CANVAS NEVER DRAWS A SINGLE FRAME.
   *
   * `frameloop="demand"` means R3F renders only when something calls
   * `invalidate()`. This scene is entirely static — no rAF loop, no useFrame —
   * so nothing ever asked for a frame and **every pixel came back with alpha 0**.
   *
   * ⚠ AND IT LOOKED EXACTLY LIKE A LIGHTING FAILURE, which cost two wrong fixes:
   * the crown was deepened and the env panels were rescaled to cure an
   * "invisible chrome button" that was in fact an unrendered canvas. A
   * `gl.readPixels` count of non-zero alpha settled it in one measurement.
   * **Confirm the surface is being DRAWN before tuning how it looks.**
   *
   * The env map arrives after the first React commit, so this fires again when
   * it lands — otherwise the one frame drawn would be the one without it.
   */
  useEffect(() => {
    invalidate();
  }, [invalidate, geometry, envMap]);

  return (
    <group>
      <AmberSource strength={amber} />
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={CHROME_COLOR}
          metalness={1}
          roughness={urlFloat("chromerough", CHROME_ROUGHNESS)}
          envMap={envMap}
          envMapIntensity={urlFloat("chromeenv", 1.0)}
          /*
           * ⚠ DoubleSide IS LOAD-BEARING, NOT A LEFTOVER — flagged by the
           * Architect. The height field is a TOP SURFACE with no side walls and
           * no back, so the silhouette drops out without it. The trade is that
           * the pill has no thickness, while the reference's tubes visibly
           * continue round past their silhouette. **If the edge still reads
           * thin once the environment wraps, this is the reason.**
           */
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * The prototype canvas.
 *
 * ⚠ `frameloop="demand"` LIKE EVERY OTHER CANVAS IN THIS CORRIDOR. The card
 * canvas's own header records what a continuous loop costs a phone, and this one
 * has nothing animating yet.
 */
export default function NextStepCanvas({
  width = NEXTSTEP_WIDTH_PX,
  height = NEXTSTEP_HEIGHT_PX,
  amber = 0,
}: {
  width?: number;
  height?: number;
  amber?: number;
}) {
  const pad = NEXTSTEP_CANVAS_PAD_PX;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: -pad,
        top: -pad,
        width: width + pad * 2,
        height: height + pad * 2,
        pointerEvents: "none",
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        dpr={[1, 2]}
        /**
         * ⚠ NEUTRAL TONE MAPPING, NOT ACES — Architect, 10 August 2026.
         *
         * @react-three/fiber defaults to ACES filmic, which **desaturates
         * aggressively as values approach white** — exactly the tonal band where
         * Carl's reference is bluest. Pushing the environment bluer to compensate
         * would fight it forever and land on a washed cyan-grey.
         * `NeutralToneMapping` (Khronos PBR Neutral) holds hue through the
         * shoulder.
         *
         * ⚠ SAFE HERE SPECIFICALLY BECAUSE THIS IS ITS OWN `<Canvas>` WITH ITS
         * OWN RENDERER. It cannot touch the approved card material — which is
         * tone-mapped by a different renderer entirely, and which the label
         * neutralisation in `answer-card-mesh.tsx` is tuned against.
         *
         * ⚠ AND THE SAME CURVE IS THE REASON THE CARD LABEL NEEDED CORRECTING
         * EARLIER TODAY. ACES crushing a near-white toward grey is a recorded
         * cost in this codebase, not a theory.
         */
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }}
        frameloop="demand"
        style={{ pointerEvents: "none" }}
        // ⚠ `checkShaderErrors` OFF, for the reason recorded twice already in
        // this codebase: `getProgramInfoLog` blocks on first use and lands
        // inside whatever animation is running. See `answer-card-canvas.tsx`.
        onCreated={({ gl }) => {
          gl.debug.checkShaderErrors = false;
        }}
      >
        <ButtonMesh width={width} height={height} amber={amber} />
      </Canvas>
    </div>
  );
}
