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

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ⚠⚠ DIAGNOSTIC ONLY — `?mounttrace=1` times the parts of this component's mount.
 * Added 18 August 2026 for ATTRIBUTION, after `?nobtnmesh=1` proved the bundle
 * causes the Q5 reveal freeze but could not say WHICH of its five components does.
 * ⛔ NOTHING SHIPS FROM IT.
 *
 * ⚠ OFF BY DEFAULT AND FREE WHEN OFF. `MOUNT_TRACE` is read once from the URL;
 * when false, `mtrace()` runs the callback and returns — no `performance.now()`,
 * no array push, no branch inside a loop. **A tracer that costs something when
 * disabled would change the very mount it exists to describe.**
 *
 * ⚠ IT TIMES SUBMISSION, NOT COMPLETION, for GPU-side work. A `performance.now()`
 * bracket around a WebGL call returns when the command is QUEUED. Completion needs
 * `gl.finish()`, which serialises the pipeline — the same class of perturbation as
 * the 84ms screenshot sampler. **Both are reported where they differ**: `?mountsync=1`
 * adds the finish, so the gap between the two arms of that flag IS the queue depth.
 */
const MOUNT_TRACE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("mounttrace") === "1";
const MOUNT_SYNC =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("mountsync") === "1";

type MountMark = { label: string; ms: number; t: number };

/**
 * ⚠⚠ MARKS LIVE IN MODULE SCOPE, NOT ON `window`, AND THE CLOCK IS READ THROUGH
 * `nowImpure()`.
 *
 * React's compiler (`react-hooks/purity`, `react-hooks/immutability`) rejects both
 * `performance.now()` and writes to an external object **during render** — and the
 * memo bodies being timed here ARE render. A first cut wrote marks straight to
 * `window` and took the repo from its recorded baseline of ONE lint error to EIGHT.
 *
 * ⚠ THE RULE IS RIGHT AND THE INSTRUMENT IS THE EXCEPTION. Impure reads during
 * render are genuinely unsafe under concurrent rendering; a tracer is the one case
 * where the impurity IS the point. The indirection below is what keeps that
 * exception explicit and confined instead of scattered through the component.
 *
 * ⛔ THE BASELINE IS ONE ERROR AND MUST STAY ONE. Verified by running lint, not by
 * trusting a line number (CLAUDE.md → Error handling).
 */
const mountMarks: MountMark[] = [];
const nowImpure: () => number = () => performance.now();

if (typeof window !== "undefined") {
  (window as unknown as { __mountMarks?: MountMark[] }).__mountMarks = mountMarks;
}

function mtrace<T>(label: string, fn: () => T, gl?: THREE.WebGLRenderer): T {
  if (!MOUNT_TRACE) return fn();
  const t0 = nowImpure();
  const out = fn();
  // ⚠ OPTIONAL SYNC — forces GPU completion so the bracket times the WORK and not
  // the QUEUEING. Perturbing by design; that is why it is a separate flag.
  if (MOUNT_SYNC && gl) gl.getContext().finish();
  mountMarks.push({ label, ms: nowImpure() - t0, t: Math.round(t0) });
  return out;
}

// ⚠ A bare stamp for the two components whose start and end are in different
// functions (context creation; the studio build). Same impurity confinement.
let studioT0 = 0;
let canvasT0 = 0;
function stampStudio() { studioT0 = nowImpure(); }
function stampCanvas() { canvasT0 = nowImpure(); }
function closeMark(label: string, t0: number) {
  mountMarks.push({ label, ms: nowImpure() - t0, t: Math.round(t0) });
}
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
  // ⚠ COMPONENT 4 (total) — the whole height-field build: the nx*ny vertex loop
  // with a Vector3 normalize per vertex (220*240 = 52,800), plus buffer assembly.
  // MAIN THREAD, entirely. ⚠ A large figure here is a POOR FIT for a freeze whose
  // signature is GPU-saturated with the renderer near-idle — size is not fit.
  // ⚠ The bracket is INSIDE the memo callback, not around the hook: wrapping
  // `useMemo` in a conditional tracer would violate the Rules of Hooks.
  return useMemo(() => mtrace("4-geometry-total", () => {
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

    /**
     * Grid resolution. Dense enough that a mirror does not show its faceting —
     * the specular travels across this surface and steps would be visible.
     *
     * ⚠⚠ ny 88 -> 240 FOR THE GROOVE. At 88 rows across a 41px pill each row is
     * ~0.47px, so the ~2.3px groove spanned about five rows — enough to exist in
     * the buffer but not enough to render its two slopes as distinct bands
     * rather than one soft dip. The short axis is where all the profile detail
     * lives; nx is unchanged because nothing varies along the pill's length.
     *
     * ⚠ THE COST IS PAID ONCE. This geometry is built in a `useMemo` and never
     * rebuilt — it is not per-frame work, and the traveller's sweep measured
     * 0.00ms against a static canvas.
     */
    const nx = 220;
    const ny = 240;

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

        /**
         * Central differences for the normal. The gradient of a height field is
         * exact here and needs no reasoning about path frames — which is what
         * the swept version got wrong.
         *
         * ⚠⚠ 0.35 -> 0.06 BECAUSE THE GROOVE IS ONLY ~2.3px WIDE. A central
         * difference is a low-pass filter: sampling +/-0.35px across a feature
         * whose half-width is 2.27px averages the groove's two opposing slopes
         * together and returns something close to the ungrooved normal.
         * **The geometry would have been correct and the shading would have
         * shown no second band** — and the obvious next move would have been to
         * deepen the groove, chasing a sampling artefact with real geometry.
         *
         * ⚠ IT MUST STAY WELL BELOW THE GROOVE'S HALF-WIDTH. If
         * `NEXTSTEP_GROOVE_DEPTH`'s companion width (0.13 in `crownHeight`) is
         * ever narrowed, this has to come down with it.
         */
        const e = 0.06;
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

    // ⚠ COMPONENT 4 — geometry ASSEMBLY. Note this brackets only the buffer
    // construction; the nx*ny vertex loop above it is timed by `4-geometry-total`
    // in the caller. ⚠ NO GPU UPLOAD HAPPENS HERE — `setAttribute` only stages
    // CPU-side typed arrays. The actual upload occurs on first draw (component 5),
    // which is where it must be attributed, NOT here.
    const geo = mtrace("4b-geometry-buffers", () => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      g.setIndex(index);
      return g;
    });
    return geo;
  }), [w, h]);
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
    // ⚠ COMPONENT 2a START — the studio scene build, MAIN THREAD.
    if (MOUNT_TRACE) stampStudio();
    const studio = new THREE.Scene();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];

    /**
     * ⚠⚠ SOFT-EDGED PANELS. A HARD-EDGED SOURCE REFLECTS AS A HARD-EDGED SLAB.
     *
     * The first version used `MeshBasicMaterial` on a plain plane, so each panel
     * was a rectangle of uniform colour with a step to nothing at its border.
     * **A mirror reports the SHAPE of its sources**, so at 5x zoom the button
     * rendered as three or four flat tones with abrupt boundaries and a hard
     * horizontal seam across the middle — posterised, not metal.
     *
     * ⚠ CARL'S CHROME BOY PHOTOGRAPH IS THE EVIDENCE, and it is a photograph so
     * it cannot be cheating: the chrome there shows *continuous gradient*
     * because the room is continuous — cloth wrapping round, a broad source
     * above, the body bouncing back. Neighbouring surface directions find
     * *similar* things, so the reflection ramps instead of stepping.
     *
     * So each panel fades radially to nothing at its edge. Cheap — a shader with
     * one smoothstep — and it removes the step that the mirror was reporting.
     */
    const panel = (
      color: string,
      intensity: number,
      position: [number, number, number],
      size: [number, number],
    ) => {
      const geometry = new THREE.PlaneGeometry(size[0], size[1], 1, 1);
      const material = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color).multiplyScalar(intensity) } },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        // ⚠ THE FALLOFF IS ELLIPTICAL IN UV, so a long thin key fades along both
        // axes rather than only across its width. `pow(...,1.6)` keeps the core
        // bright and puts the fade in the outer third — a broad linear ramp
        // would dim the source's middle and cost the highlight its intensity.
        fragmentShader: `
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            vec2 d = (vUv - 0.5) * 2.0;
            float r = clamp(length(d), 0.0, 1.0);
            float a = pow(1.0 - r, 1.6);
            gl_FragColor = vec4(uColor * a, 1.0);
          }
        `,
        side: THREE.DoubleSide,
        toneMapped: false,
        // ⚠ ADDITIVE, NOT ALPHA-BLENDED. These are light sources being baked into
        // a PMREM; two overlapping sources should SUM, not occlude one another.
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
      studio.add(mesh);
      disposables.push(geometry, material);
    };

    // ⚠ 48x32, NOT 16x16. The gradient is evaluated per-fragment so the segment
    // count does not band it, but a 16-segment sphere is visibly faceted at the
    // silhouette once the shell is no longer a single flat colour.
    const shellGeometry = new THREE.SphereGeometry(ENV_SHELL_RADIUS, 48, 32);
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
    /**
     * ⚠⚠ A VERTICAL GRADIENT, NOT ONE FLAT NAVY — and this is what turns the
     * banded slabs into the reference's continuous ramps.
     *
     * A uniform shell gives every camera-facing normal the SAME colour, so the
     * plateau returns one flat tone and the only variation left in the picture
     * comes from the panels' hard edges. **That is why the 5x render read as
     * three posterised bands with a seam across the middle.**
     *
     * ⚠ IN CARL'S REFERENCE THE TONE RAMPS CONTINUOUSLY ALONG EVERY STROKE —
     * navy in the deep interiors, mid-blue through the shoulders, near-white at
     * the crown. That is a graded room, read back by a mirror. The gradient
     * swatch sheets he supplied say the same thing from the other direction:
     * every one of them is a smooth ramp with a bright band, and none has a hard
     * edge in it.
     *
     * ⚠ AND IT IS STILL THE ROOM, NOT THE MATERIAL. `CHROME_COLOR` stays white.
     * The moment a tint goes on the body it becomes painted metal and stops
     * reporting the scene — the whole finding from the reference set, and the
     * reason the Chrome Boy reads grey against grey.
     *
     * Sky (`?shellsky=`) is the cool bright top; horizon is the mid; ground
     * (`?shellground=`) is the deep navy the underside returns.
     */
    const shellMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSky: { value: new THREE.Color("#2c4c7c").multiplyScalar(urlFloat("shellsky", 1.0)) },
        uHorizon: { value: new THREE.Color("#12253f").multiplyScalar(urlFloat("shell", 0.9)) },
        uGround: { value: new THREE.Color("#050c17").multiplyScalar(urlFloat("shellground", 1.0)) },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      // ⚠ TWO RAMPS, NOT ONE. A single sky→ground lerp puts the mid-tone exactly
      // at the equator and makes the horizon a hard tonal centre. Splitting at
      // y=0 lets the bright half fall off faster than the dark half, which is
      // what a light tent above a dark floor actually does.
      fragmentShader: `
        uniform vec3 uSky;
        uniform vec3 uHorizon;
        uniform vec3 uGround;
        varying vec3 vPos;
        void main() {
          float h = clamp(normalize(vPos).y, -1.0, 1.0);
          vec3 c = h > 0.0
            ? mix(uHorizon, uSky, pow(h, 0.7))
            : mix(uHorizon, uGround, pow(-h, 0.5));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
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

    /**
     * ⚠⚠ THE KEY IS A LONG SOFT STRIP RUNNING THE PILL'S FULL LENGTH — this is
     * what makes the crown's highlight a continuous hairline rather than two
     * bright patches with a gap.
     *
     * It was two short panels at x=-6 and x=+10, both well inside a pill that
     * runs to x=±58. Between and beyond them the crown found nothing, so the
     * highlight broke up. Length 150 overhangs both ends deliberately: the
     * source must extend PAST the geometry it lights, or its own falloff lands
     * on the object as a dark patch.
     */
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * urlFloat("key", 3.2), [-4, 15, 16], [150, 13]);

    /**
     * ⚠⚠ THE END-CAP WRAP — THE FIX FOR THE TWO DARK BLOBS.
     *
     * The caps are semicircles turning through a full 180° in x, so their
     * normals sweep outboard to ±x where no source existed: every panel sat at
     * |x| <= 14 on a pill running to ±58. At 5x zoom they rendered as hard-edged
     * kidney-shaped holes eating a third of each cap.
     *
     * ⚠ IT IS NOT A DIAL AND IT WAS NEVER GOING TO BE. No intensity on a panel
     * the caps cannot see will light them — the surface has to have something to
     * reflect in the direction it actually faces. Carl's Chrome Boy point is the
     * principle: in a real room every direction finds *something*.
     *
     * ⚠ AND THEY ARE ANGLED INWARD BY `lookAt(0,0,0)`, so they read as the
     * continuation of a wraparound tent rather than as two extra lamps.
     */
    const capX = 82;
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * urlFloat("wrap", 0.55), [-capX, 6, 20], [26, 46]);
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * urlFloat("wrap", 0.55), [capX, 6, 20], [26, 46]);

    /**
     * A dim floor so the underside of the crown has something to return other
     * than the shell, and the object keeps its bottom edge against #101010.
     * ⚠ ALSO OVERHANGING (140 across a 116px pill) for the reason above.
     *
     * ⚠⚠ 2.2 -> 0.5 BECAUSE THE FIRST CONTINUOUS RENDER CAME OUT LIT FROM BELOW.
     * The old value was tuned against HARD-EDGED, SMALLER panels under alpha
     * blending. Softening the edges, widening it to 140 and switching to
     * additive blending each raised its total contribution, and together they
     * made the floor out-power the key: the top half went dark navy and the
     * bottom half became a pale bright mass — **the reference's tonal structure
     * exactly inverted**, since there the crown is bright and the interiors are
     * dark.
     *
     * ⚠ THE GENERAL LESSON, AND IT COST A RENDER: **an intensity is calibrated
     * against a panel's SIZE, EDGE PROFILE AND BLEND MODE.** Change any of the
     * three and every intensity in the rig is stale. They are not independent
     * dials.
     */
    panel(ENV_FILL_COLOR, ENV_FILL_INTENSITY * urlFloat("floor", 0.5), [0, -15, 14], [140, 26]);

    // ⚠ A RIM SOURCE BEHIND AND TO THE SIDE, for the silhouette hairline. The
    // reference's strokes carry a bright edge where the surface turns away; with
    // sources only in front, that edge dies against the shell.
    panel(ENV_KEY_COLOR, ENV_KEY_INTENSITY * 0.8, [14, 4, -6], [8, 44]);

    // ⚠ COMPONENT 2a ENDS HERE — everything above built the studio scene on the
    // MAIN THREAD (geometries, shader materials, the 48x32 shell). Marked at this
    // point rather than bracketed, because the panels are emitted by a closure
    // called several times above and wrapping each would inflate the count.
    if (MOUNT_TRACE) closeMark("2a-studio-build", studioT0);

    // ⚠⚠ COMPONENT 2b — THE PMREM BAKE. Cubemap render + roughness convolution at
    // 256. GPU-SIDE, and the candidate this attribution exists to test.
    const built = mtrace(
      "2b-pmrem-fromScene",
      () => {
        const pmrem = new THREE.PMREMGenerator(gl);
        const r = pmrem.fromScene(studio, 0, 0.1, 200);
        pmrem.dispose();
        return r;
      },
      gl,
    );
    disposables.forEach((d) => d.dispose());
    studio.clear();
    return built;
  }, [gl]);

  return target ? target.texture : null;
}

/**
 * ⚠⚠ THE TRAVELLER, AS A MOVING REFLECTION.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * WHY A ROTATING ENVIRONMENT AND NOT A MOVING LIGHT
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ CARL, 10 August 2026: *"the traveller's light is paramount here. That has
 * the most effect on the card faces and so the pill. The amber secondary
 * effects, if implemented, will be the icing on the cake."* So this is the
 * PRIMARY illuminant, and the amber is neither built nor assumed.
 *
 * ⚠ THE BUTTON'S CANVAS CANNOT SEE THE CORRIDOR'S TRAVELLER. They are separate
 * `<Canvas>` elements with separate renderers and separate scenes, and **a WebGL
 * scene only lights objects inside it**. The canvases are separate for reasons
 * that predate this work. So the traveller has to be reproduced here — same
 * path, same clock, same phase.
 *
 * ⚠⚠ AND IT IS REPRODUCED AS A ROTATING ENV MAP, NOT AS A `spotLight`, BECAUSE
 * THAT IS WHAT THE MEASUREMENT SAID. `BenchKey` was added specifically to test
 * how this material responds to a direct light, and the answer was: **barely.**
 *
 *     litint   0     centre lum 115   rim/centre 2.1
 *     litint   2.4   centre lum 125   rim/centre 2.0
 *     litint   5.0   centre lum 132   rim/centre 1.9
 *
 * A 5x light moved the centre 17 points and FLATTENED the ratio. On a
 * `metalness: 1` surface there is no diffuse term at all — a direct light
 * contributes only a specular lobe, which under an orthographic camera on a
 * shallow crown lands almost nowhere. **The environment is doing essentially all
 * the work, so the environment is what must move.**
 *
 * ⚠ THIS IS MORE PHYSICALLY TRUE, NOT LESS. A mirror does not "get lit" by a
 * moving lamp; it SHOWS the lamp moving. Rotating the reflected room is what
 * chrome actually does.
 *
 * ⚠ AND IT IS CHEAP, WHICH DECIDED THE MECHANISM. Re-baking the PMREM per frame
 * would be ruinous — Q5's frame cost is a live wound at 167ms. `envMapRotation`
 * is a uniform on the existing material: the room is baked once PER CANVAS and
 * then only turned.
 *
 * ⚠⚠ CORRECTED 18 August 2026 — "baked ONCE" WAS TRUE WITHIN ONE CANVAS'S LIFE
 * AND FALSE ACROSS THE CORRIDOR. `useChromeEnv` memoises on `[gl]`, i.e. on the
 * RENDERER. This component sits inside the keyed phrase (`phrase-${qNum}`), so
 * it is destroyed and rebuilt on every question — **a new context means a new
 * `gl`, which means a FRESH PMREM BAKE per question**, not a cached one. The
 * memo protects re-renders within one canvas; it does nothing across a remount.
 *
 * ⚠ THE COMMENT WAS ACCURATE WHEN WRITTEN AND WAS LEFT STANDING AFTER THE
 * STRUCTURE CHANGED AROUND IT — the same failure as the mark-name collision.
 * Carl, 18 August 2026. ⛔ Read as originally worded, it says the per-frame cost
 * was the only one worth avoiding, which is why the per-MOUNT cost went
 * unexamined for weeks. The bake is: a studio scene, a 48x32 shell, several
 * shader-material panels, and `fromScene(..., 200)` at 256 with its full
 * roughness convolution chain.
 *
 * ⛔ THIS IS A CORRECTION TO THE RECORD, NOT A REPAIR. Hoisting the bake or
 * keying the cache on something more durable than the renderer is a STRUCTURAL
 * decision (CLAUDE.md §5a) and is not taken here.
 *
 * ── THE PATH ─────────────────────────────────────────────────────────────
 *
 * ⚠ THE ANGLE IS DERIVED FROM THE REAL ELLIPSE, not invented. `verify/
 * ellipse-reach.mjs` measured what the pill actually receives:
 *
 *     upper shoulder   peak 1.17   lit for 80% of the orbit
 *     crown centre     peak 1.00   lit for 48%
 *     lower shoulder   peak 0.42   lit for 30%
 *     underside        NOTHING, at any phase
 *
 * The orbit's lowest point is y = -22 and the button sits at y = -93, so **the
 * traveller is always 71+ units ABOVE the pill and always rakes downward.** That
 * is why the rotation is about Z (sweeping the reflected key across the crown
 * left-to-right) and never lifts the light below the horizon.
 *
 * ⚠ THE ENVIRONMENT STILL CARRIES THE PILL'S LOWER HALF, and must. The traveller
 * reaches the underside at no phase of the orbit, so the floor panel and the
 * shell's ground colour are not decoration — they are the only illumination the
 * bottom of this object will ever have.
 */
const TRAVEL_MS = 13500;
const RETURN_MS = 2200;

function TravellingReflection({
  material,
  active,
}: {
  material: React.RefObject<THREE.MeshPhysicalMaterial | null>;
  /**
   * Whether the button is actually on screen and worth animating.
   *
   * ⚠ THE BENCH PASSES `true`; THE CORRIDOR MUST PASS ITS VISIBILITY. See the
   * effect below — an ungated loop renders invisibly through the Q5 reveal.
   */
  active: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const enabled = urlFloat("travel", 1) > 0;
  /** How far the reflected room swings, in radians. `?travelarc=` */
  const arc = urlFloat("travelarc", 0.85);

  /**
   * ⚠⚠ THE LOOP MUST NOT RUN WHILE THE BUTTON IS INVISIBLE — Architect, 10
   * August 2026, and this was a real defect rather than a tuning point.
   *
   * In the corridor the button's wrapper is `opacity: 0; pointer-events: none`
   * until something is selected (`enquiry-opening.tsx:1336`). Without this gate
   * an unconditional rAF would call `invalidate()` at 60fps **from the moment
   * each question mounts** — invisibly, straight through the card entrance
   * ladder and the Q5 reveal. **That is precisely the 167ms window that is still
   * open**, and the plan proposed to MEASURE the risk rather than remove it.
   *
   * ⚠ NOTHING IS LOST BY GATING IT. The button cannot be seen or clicked before
   * a selection exists, so a sweep during that time has no viewer. It turns a
   * possible regression into a non-question.
   *
   * ⚠ AND IT MAKES REDUCED MOTION FALL OUT FOR FREE: `active={false}` leaves a
   * static mesh with the loop stopped, which is already the correct behaviour
   * there — the surface still renders, only the motion stops.
   */
  useEffect(() => {
    if (!enabled || !active) return;
    let raf = 0;
    const t0 = performance.now();
    const total = TRAVEL_MS + RETURN_MS;

    const tick = () => {
      const m = material.current;
      if (m) {
        /**
         * ⚠ THE VISIBLE PASS IS SLOW AND THE RETURN IS FAST — the corridor's own
         * asymmetry, from Carl's annotated diagram: the lower arc is *"front =
         * slower"* and the upper is *"back = speed up"*. A symmetric sweep would
         * put the button out of step with the cards it sits under.
         */
        const e = ((performance.now() - t0) % total) / total;
        const visible = TRAVEL_MS / total;
        // phase runs -1 .. +1 across the visible pass, then races back.
        const phase = e < visible ? (e / visible) * 2 - 1 : 1 - ((e - visible) / (1 - visible)) * 2;

        m.envMapRotation.set(0, 0, phase * arc);
        m.needsUpdate = false;
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // ⚠ `active` IS IN THE DEPS DELIBERATELY, NOT JUST TO SATISFY THE RULE. It
    // is what STARTS the loop as well as what stops it: omit it and the sweep
    // would never begin when a selection arrives, because the effect would not
    // re-run. The gate would have read as "the traveller is broken in the
    // corridor" rather than as a missing dependency.
  }, [enabled, active, arc, invalidate, material]);

  return null;
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

/**
 * A STATIC key light on the bench.
 *
 * ⚠⚠ UNTIL THIS EXISTED THE SCENE HAD NO LIGHT SOURCE AT ALL. Every pixel of
 * the button was a REFLECTION of the PMREM env map — which is why the surface
 * read flat and evenly lit however the panels were tuned. **A mirror with no
 * direct source has no highlight of its own; it only shows a picture of the
 * room.** Carl's references all have a real source making the hot core.
 *
 * ⚠ IT IS A BENCH INSTRUMENT, NOT THE CORRIDOR'S RIG. Carl, 10 August 2026:
 * *"the light rig and the filament are the light variables. If we can get a
 * material close to the examples, the blue c2b, we can tweak when put in place.
 * It might be wise to light the proto up with a static light though, just to see
 * how the material initially responds to light."*
 *
 * **So the material is the constant and the lighting is deliberately NOT being
 * solved here.** In the corridor the real answer is the traveller — a spotlight
 * on a 13.5s elliptical orbit (`REST_TRAVEL_*` in `answer-card-glass.ts`) — plus
 * the filament when cards are selected. This light exists only so the material
 * can be judged responding to *something* before it meets those.
 *
 * ⚠ STATIC ON PURPOSE. A moving light on the bench would confound the question:
 * a material that only looks right at one phase of a sweep is not a material
 * that is right. Hold the light still, judge the surface, then let the corridor
 * move it.
 *
 * ⚠⚠ DEFAULT 0 — OFF — BECAUSE THE EXPERIMENT IT EXISTS FOR IS FINISHED AND ITS
 * ANSWER WAS "THIS MATERIAL BARELY RESPONDS TO A DIRECT LIGHT".
 *
 *     litint 0 -> 2.4 -> 5.0     centre lum 115 -> 125 -> 132, ratio 2.1 -> 1.9
 *
 * A 5x light moved the centre 17 points and FLATTENED the crown against the
 * plateau. `metalness: 1` has no diffuse term, so a direct light contributes
 * only a specular lobe, and under an orthographic camera on a shallow crown that
 * lobe lands almost nowhere. **The environment is the lever; a light is not.**
 *
 * ⚠ IT STAYS, ON A DIAL, BECAUSE THE MEASUREMENT IS WORTH REPEATING. Leaving it
 * ON by default would add a source the corridor does not have and quietly
 * confound the traveller's sweep — the thing that actually shapes this surface.
 *
 * Dials: `?litint=` brightness, `?litx= ?lity= ?litz=` direction.
 */
function BenchKey() {
  const intensity = urlFloat("litint", 0);
  if (intensity <= 0) return null;
  return (
    <directionalLight
      // ⚠ A DIRECTIONAL LIGHT'S POSITION IS A DIRECTION, NOT A PLACE — three
      // aims it at its target (the origin), so only the VECTOR matters. This is
      // recorded at `answer-card-canvas.tsx:3134` after being misread there.
      // Above, slightly left, and well forward: the reference's key.
      position={[urlFloat("litx", -30), urlFloat("lity", 60), urlFloat("litz", 90)]}
      intensity={intensity}
      color="#eaf2ff"
    />
  );
}

function ButtonMesh({
  width,
  height,
  amber,
  active,
}: {
  width: number;
  height: number;
  amber: number;
  active: boolean;
}) {
  const geometry = usePillGeometry(width, height);
  const envMap = useChromeEnv();
  const invalidate = useThree((s) => s.invalidate);
  // ⚠ Read unconditionally — hooks cannot be called behind the trace flag. Unused
  // when `MOUNT_TRACE` is false; these are cheap store reads, not work.
  const traceGl = useThree((s) => s.gl);
  const traceScene = useThree((s) => s.scene);
  const traceCamera = useThree((s) => s.camera);
  // ⚠ THE MATERIAL IS DRIVEN BY REF, NOT BY STATE. `envMapRotation` changes every
  // frame; routing that through React would re-render the tree 60 times a second
  // to mutate one uniform.
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

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
    // ⚠⚠ COMPONENT 5 — THE FORCED DRAW, and COMPONENT 3 arrives INSIDE IT.
    //
    // ⚠ The `MeshPhysicalMaterial` program is NOT linked when the material is
    // constructed — three.js compiles lazily on FIRST RENDER of the mesh. So the
    // first draw after `envMap` lands pays: program compile + link, the geometry's
    // GPU upload, and the draw itself. **They cannot be separated by brackets
    // here** — `3-link`, `4-upload` and `5-draw` all fall inside this one call.
    //
    // ⛔ SO THIS IS REPORTED AS ONE COMPOSITE, NOT SPLIT BY GUESSWORK. Splitting
    // it would mean inventing a division the instrument cannot see, which is the
    // recorded failure mode of an instrument answering an adjacent question.
    // The split is recoverable from `renderer.info.programs` count and a
    // WebGL-timer query, neither of which is built this turn.
    mtrace("3+4+5-firstdraw-composite", () => {
      invalidate();
      // ⚠ `invalidate()` only REQUESTS a frame; R3F renders on the next rAF, so
      // the bracket above would close before any GPU work happened. `gl.render`
      // is called synchronously here ONLY under the trace flag to make the first
      // draw land inside the bracket. ⛔ Perturbing, and off by default.
      if (MOUNT_TRACE) traceGl.render(traceScene, traceCamera);
    }, traceGl);
  }, [invalidate, geometry, envMap, traceGl, traceScene, traceCamera]);

  return (
    <group>
      <BenchKey />
      <TravellingReflection material={materialRef} active={active} />
      <AmberSource strength={amber} />
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={materialRef}
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
  active = true,
}: {
  width?: number;
  height?: number;
  amber?: number;
  /**
   * Whether the button is visible and worth animating.
   *
   * ⚠⚠ THE CORRIDOR MUST PASS `selected.size > 0`. Its button wrapper is
   * `opacity: 0; pointer-events: none` until something is selected, and an
   * ungated sweep would render at 60fps behind that — through the card entrance
   * and the Q5 reveal, which is the 167ms window still open. Architect,
   * 10 August 2026. Defaults to `true` for the bench, where it is always shown.
   */
  active?: boolean;
}) {
  const pad = NEXTSTEP_CANVAS_PAD_PX;
  /**
   * ⚠ THE WRAPPER MUST GROW WITH `?zoom=`, OR ZOOM CROPS INSTEAD OF MAGNIFYING.
   *
   * The canvas is sized to the button, so an orthographic zoom of 4 draws the
   * pill 4x larger into a box still 116x41 — showing the middle of the button
   * and cutting off both end caps. **Which are one of the two defects being
   * judged**, so the instrument would have hidden the thing it was built to
   * show. Growing the box keeps the whole pill in frame.
   *
   * At the default zoom of 1 this is exactly the old expression, so the
   * corridor's layout is untouched.
   */
  /**
   * ⚠⚠ READ AFTER MOUNT, NOT IN THE COMPONENT BODY. `urlFloat` returns its
   * fallback when `window` is undefined, so on the server this is always 1 —
   * and the wrapper rendered at 144x69 while the camera (constructed inside the
   * Canvas, client-side only) really did zoom. **The render was magnified into a
   * box that had not grown, so it was clipped to the middle of the pill and both
   * end caps were outside the frame.**
   *
   * ⚠ AND THAT IS THE DEFECT UNDER JUDGEMENT. A crop that silently removes the
   * end caps would have shown a clean button and hidden the fault. Same class as
   * the seven instrument failures recorded on 10 August 2026: the instrument
   * answered a question adjacent to the one asked.
   *
   * ⚠ `useSyncExternalStore`, NOT `useState` + `useEffect`. The effect version
   * tripped `react-hooks/set-state-in-effect` — a NEW lint error against this
   * repo's recorded baseline of exactly one (the `enquiry-opening.tsx`
   * reduced-motion effect). This hook exists precisely for "read a value the
   * server cannot see": it takes a server snapshot and a client snapshot and
   * needs no state write at all.
   *
   * The empty subscribe is deliberate — the querystring does not change without
   * a navigation, and a navigation remounts this.
   */
  const zoom = useSyncExternalStore(
    () => () => {},
    () => urlFloat("zoom", 1),
    () => 1,
  );
  const boxW = width * zoom + pad * 2;
  const boxH = height * zoom + pad * 2;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        // Keep the (possibly enlarged) box centred on the button's own footprint
        // so the label overlay still lands on the middle of the pill.
        left: (width - boxW) / 2,
        top: (height - boxH) / 2,
        width: boxW,
        height: boxH,
        pointerEvents: "none",
      }}
    >
      <Canvas
        orthographic
        /**
         * ⚠ `?zoom=` IS A BENCH INSTRUMENT AND MUST STAY 1 IN THE CORRIDOR.
         *
         * At its real 116x41 the material cannot be judged — Carl's references
         * are all large, and a defect that decides the material (the double
         * band, the end caps) is a few pixels here. Zoom magnifies the RENDER,
         * not the geometry: same mesh, same env, same light, more pixels.
         *
         * ⚠ IT DOES NOT PROVE THE BUTTON AT SIZE. Carl has already ruled once
         * on exactly this, about the traveller: *"it looks ok zoomed in but not
         * at this scale"* (`answer-card-canvas.tsx:478`). **Judge the material
         * zoomed; judge the BUTTON at 1.**
         */
        // ⚠ THE SAME `zoom` THE WRAPPER USES, so the box and the render can never
        // disagree. Reading the URL separately here would reintroduce the crop.
        camera={{ zoom, position: [0, 0, 1000], near: 0.1, far: 4000 }}
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
          // ⚠ COMPONENT 1 — CONTEXT CREATION, measured as the interval from the
          // React commit that mounted this Canvas to a usable `gl`. R3F creates
          // the renderer (and therefore the WebGL context) between those points,
          // so this brackets `CommandBufferProxyImpl::Initialize` and the
          // renderer construction together. ⚠ It cannot separate them.
          if (MOUNT_TRACE) closeMark("1-context-creation", canvasT0);
        }}
      >
        <ButtonMesh width={width} height={height} amber={amber} active={active} />
      </Canvas>
    </div>
  );
}

/**
 * The mesh behind a real DOM button, sized from that button's MEASURED box.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ THIS EXISTS SO THE ROLLOUT CANNOT HARD-CODE A LABEL WIDTH
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Carl's standing constraint: *"When this next step button is built all the Q5
 * components will be cloned and rolled out to the other Qs."* The label is
 * "Next step" on Q5–Q2 and **"Send"** at completion, which is a different width.
 *
 * ⚠ `NEXTSTEP_WIDTH_PX` (116.3) IS A REFERENCE SIZE, NOT THE ONLY SIZE. It was
 * measured from the live DOM for one label at one weight. Anything that assumes
 * it is correct for every instance is wrong the moment Send arrives — so this
 * component never reads it, and measures instead.
 *
 * ⚠ A `ResizeObserver`, NOT A ONE-OFF `getBoundingClientRect`. The button's box
 * depends on font metrics that are not known at first paint: with a webfont the
 * measured width changes when the font swaps in, and a single measurement taken
 * before that lands would leave the mesh permanently the wrong size. The
 * observer simply follows.
 *
 * ⚠ THE DOM BUTTON IS THE CONTROL AND STAYS EXACTLY AS IT WAS. It keeps its
 * accessible name, focus ring, `tabIndex` gating and `onClick`; the canvas is
 * `aria-hidden` and `pointer-events: none`. **The mesh is a surface, not a
 * control** — the same division the answer cards will need when they become
 * real controls, and the reason that debt is recorded rather than repeated here.
 */
/**
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ COMMIT 1 OF THE Q5 FREEZE REPAIR — LIFETIME ONLY. 18 August 2026.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **The measured defect.** This component used to render `<NextStepCanvas>` as
 * its own child. It sits inside the keyed phrase (`phrase-${qNum}`), so it was
 * destroyed and rebuilt on every question — **8 WebGL contexts across a
 * five-question walk**, with Q5's context created **+54 to +65ms after the
 * reveal begins**, inside the 1300ms wipe.
 *
 * Measured, both arms back to back, 8 runs each, one build:
 *
 *     baseline           freeze median 140ms   5/8 runs   range  80-160
 *     ?nobtnmesh=1       freeze median   0ms   0/8 runs   range   0-40
 *
 * Non-overlapping, and confirmed BY EYE in the films: baseline held "Q5 Wl"
 * across f251-f256 then jumped to "What brou"; both treatment films advanced
 * every frame.
 *
 * ⚠⚠ AND CONTENTION IS LIVE, which is why the repair is the LIFETIME and not
 * the bake. With the button gone the card host renders **74 -> 84 frames** in
 * the same window (73-75 vs 84-85, non-overlapping) at unchanged per-frame
 * cost. It is not being slowed; it is being starved of scheduling
 * opportunities. **A repair that removed only the PMREM bake would leave the
 * second context and the per-frame competition in place.**
 *
 * ── WHAT THIS COMPONENT IS NOW ────────────────────────────────────────────
 *
 * **The CONTROL only.** The real `<button>`, its box, its label, its focus ring
 * and its click handler. It renders NO canvas. It publishes its measured rect
 * upward via `onRect`, and `NextStepSurfaceHost` — mounted once, outside the
 * keyed phrase — draws the mesh at that rect.
 *
 * ⚠ THE SEPARATION IS THE SAME ONE D-048 MADE FOR THE CARDS: the DOM element
 * stays where the layout defines it; only the CANVAS moves out. **A mesh is a
 * surface, never a control.**
 *
 * ⛔ NOT A LICENCE TO CHANGE HOW IT LOOKS. Appearance and behaviour are
 * approved and unchanged: same box, same label, same 600ms selection fade, same
 * traveller. Carl, 18 August 2026 — any plan that changes either is rejected
 * before it is read.
 *
 * ⚠ FOR THE FUTURE IMPLEMENTER — THE `Send` SEAM, RECORDED NOT BUILT.
 * Carl's standing constraint is that completion's **Send** will eventually take
 * this same mesh, and it is a different width (which is why this component
 * MEASURES rather than reading `NEXTSTEP_WIDTH_PX`). **When Send becomes a
 * mesh it must RE-TARGET THIS HOST — publish its own rect to the same
 * `NextStepSurfaceHost` — and must NOT mount a second host.** A second host is
 * a second context, which is precisely the defect this commit removes.
 * ⛔ **Deliberately NOT designed here: `.enquiry-send-btn` is a separate
 * painted DOM button, masked and inert. Do not build a seam for a component
 * that does not exist.** (Carl, 18 August 2026.)
 */
export function NextStepMeshButton({
  children,
  className,
  onRect,
  ...buttonProps
}: {
  children: React.ReactNode;
  /**
   * Publishes this button's viewport rect to the persistent surface host.
   *
   * ⚠ VIEWPORT COORDINATES, AND THE HOST IS `position: fixed`. Both resolve
   * against the viewport, so they agree **by construction with no arithmetic**.
   * That is what makes this simpler than D-048, which needed `gridOffset` to
   * carry grid-relative coordinates back over the grid.
   *
   * ⚠ `null` MEANS "NOT MEASURED / NOT PRESENT" AND THE HOST MUST DRAW NOTHING.
   * ⛔ Never substitute `?? 0` — a zero-origin fallback is exactly what painted
   * the 12 August build at the shell origin.
   */
  onRect?: (r: { left: number; top: number; w: number; h: number } | null) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const [box, setBox] = useState<{ w: number; h: number; left: number; top: number } | null>(null);

  /**
   * ⚠⚠ DIAGNOSTIC ONLY — `?nobtnmesh=1` suppresses THIS BUTTON'S WebGL canvas.
   * Added 18 August 2026 as the treatment arm of a MEASUREMENT, not as a fix.
   * ⛔ NOTHING SHIPS FROM IT. If the arm is not being run, delete the flag.
   *
   * **What it is for.** This component sits inside the keyed phrase
   * (`renderPhrase` → `key={\`phrase-${qNum}\`}`), so it is destroyed and rebuilt
   * on every question — and the canvas below mounts on `box &&`, i.e. once the
   * `ResizeObserver` has measured, INDEPENDENTLY of `active`. A GPU trace found
   * 8 contexts across a five-question walk and ~67ms of blocked main thread in
   * `CommandBufferProxyImpl::Initialize`.
   *
   * ⚠ AND IT IS NOT ONLY A PER-STEP COST. Measured 18 August: the context for
   * Q5's button is created **+54 to +65ms after Q5's reveal begins** — inside the
   * 1300ms wipe, on all four runs. Q5 follows the Begin click rather than a
   * corridor step, but `renderPhrase` builds a button for Q5 too.
   *
   * ⚠ WHAT THIS FLAG DOES NOT TOUCH: the DOM `<button>` — the real control — is
   * unchanged (`type`, `tabIndex`, `onClick`, focus ring, box). `--mesh` is
   * dropped with the canvas, so the CSS surface returns; that rule sets only
   * `background-image`, `background-color` and `box-shadow`, **no layout
   * properties**, so nothing reflows. The reveal is a different element and has
   * no coupling to this component in either direction.
   *
   * ⚠ LAZY INITIALISER, NOT AN EFFECT, AND DELIBERATELY — reading this in an
   * effect and calling `setState` would add a SECOND `react-hooks/
   * set-state-in-effect` error to a baseline that is exactly one. SSR-safe via
   * the `typeof window` guard: the server renders `false` and hydration agrees
   * on every URL without the flag, which is every URL a visitor sees.
   */
  const [suppressMesh] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("nobtnmesh") === "1",
  );

  /**
   * ⚠⚠ MEASURES THE VIEWPORT RECT NOW, NOT JUST THE SIZE.
   *
   * The size still drives the mesh geometry; the POSITION is new, and it is what
   * lets a host outside this subtree draw the surface exactly over this button.
   * `getBoundingClientRect()` reports viewport coordinates and the host is
   * `position: fixed`, so the two agree with no arithmetic.
   *
   * ⚠ `contentRect` IS NOT ENOUGH AND THAT IS WHY THE OBSERVER CALLBACK READS
   * THE ELEMENT AGAIN. `ResizeObserver`'s `contentRect` carries size but its
   * `left`/`top` are content-box offsets, not viewport coordinates.
   *
   * ⚠⚠ AND A `ResizeObserver` DOES NOT FIRE FOR A MOVE. The button does not move
   * today — it is anchored to the STATIC `.enquiry-phrase` root, outside
   * `.enquiry-phrase-travel`, which is the only thing that animates `bottom`.
   * **But "it does not move" is a fact about today's CSS that nothing in code
   * asserts**, so `scroll` and `resize` re-measures are wired anyway and the
   * caller re-measures on corridor step. ⛔ **This is deliberately NOT an rAF
   * tracking loop like the card host's**: the cards' grid genuinely moves and
   * needs per-frame following; re-measuring this one every frame would schedule
   * a setState on every frame of an idle page for an element that is still.
   * See `context-rules.md` → *An invariant that lives only in prose is not
   * asserted*.
   */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const apply = () => {
      const r = el.getBoundingClientRect();
      // A zero box means it is not laid out yet. Committing it would collapse
      // the mesh geometry, which is sized from this measurement.
      if (r.width < 1 || r.height < 1) return;
      setBox((prev) =>
        prev &&
        Math.abs(prev.w - r.width) < 0.5 &&
        Math.abs(prev.h - r.height) < 0.5 &&
        Math.abs(prev.left - r.left) < 0.5 &&
        Math.abs(prev.top - r.top) < 0.5
          ? prev
          : { w: r.width, h: r.height, left: r.left, top: r.top },
      );
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    window.addEventListener("scroll", apply, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("scroll", apply, true);
    };
  }, []);

  /**
   * ⚠ PUBLISH THE RECT UPWARD — in an effect, never during render.
   *
   * ⛔ Calling `onRect` in the component body would write to a parent's state
   * during this component's render. It also trips `react-hooks/purity`, which
   * took this repo from its recorded baseline of ONE lint error to EIGHT earlier
   * today.
   *
   * ⚠ ON UNMOUNT IT PUBLISHES `null`, and that is load-bearing: when the phrase
   * is torn down the host must stop drawing. Without it the mesh would outlive
   * the button it belongs to — the persistent-host failure mode that left the
   * previous answer lit on the cards (`litCards`).
   */
  useEffect(() => {
    if (!onRect) return;
    onRect(box && !suppressMesh ? box : null);
    return () => onRect(null);
  }, [onRect, box, suppressMesh]);

  /**
   * ⚠ COMPONENT 1's START STAMP, and the INSTRUMENTATION FLOOR.
   *
   * ⚠⚠ IN A LAYOUT EFFECT, NOT IN RENDER. Stamping during render tripped
   * `react-hooks/purity` and `react-hooks/immutability` — `performance.now()` is
   * impure and the module store is external. `useLayoutEffect` runs after the
   * commit that mounts `<NextStepCanvas>` but BEFORE the browser paints, and R3F
   * creates the WebGL context in the child's own mount effect, which runs first.
   *
   * ⛔ SO THIS IS A LOWER BOUND ON COMPONENT 1, NOT ITS TRUE START. The child's
   * effect precedes this one, so part of context creation is already spent when
   * the stamp is taken. **The figure UNDER-REPORTS and is reported as bounded.**
   * Stating that is the point; an instrument that quietly clipped its own window
   * is the recorded failure of the reveal window's version 3.
   *
   * The floor is measured through the SAME `mtrace` path in the SAME place, so it
   * is this tracer's own cost measured rather than assumed.
   */
  useLayoutEffect(() => {
    if (!MOUNT_TRACE || !box || suppressMesh) return;
    stampCanvas();
    mtrace("0-floor-noop", () => undefined);
  }, [box, suppressMesh]);

  return (
    <span ref={hostRef} style={{ position: "relative", display: "inline-block" }}>
      {/*
        ⚠⚠ THE CANVAS NO LONGER RENDERS HERE — 18 August 2026, commit 1 of the
        Q5 freeze repair. It is drawn by `NextStepSurfaceHost`, mounted ONCE
        outside the keyed phrase, at the rect this component publishes.

        ⛔ DO NOT PUT IT BACK HERE TO "FIX" A POSITIONING PROBLEM. This subtree is
        destroyed and rebuilt on every question, so a canvas here is a NEW WEBGL
        CONTEXT PER QUESTION — the measured cause of the Q5 reveal freeze
        (140ms median, 5/8 runs; 0ms and 0/8 with the canvas suppressed). If the
        mesh is mis-positioned, the fault is in the published rect or in the
        host's placement — measure those. The same instruction guards the card
        canvas one file over, for the same reason and after the same defect.

        ⚠ THE BOX MEASUREMENT STAYS HERE, and that is deliberate: this element is
        what the mesh is sized FROM. D-048 established the same split for the
        cards — the measured element stays in the phrase, only the canvas moves.
      */}
      <button
        {...buttonProps}
        // ⚠ `--mesh` SUPPRESSES THE CSS SURFACE, and only when the mesh is
        // actually there. Without the `box &&` guard a narrow or pre-measurement
        // render would show a transparent button with no surface at all.
        // ⚠ `&& !suppressMesh` — THE CLASS MUST TRACK THE CANVAS, NOT THE BOX.
        // Without it the diagnostic arm would strip the CSS surface while
        // rendering no mesh behind it: a transparent button, which is exactly
        // the "transparent hole" the guard above was written to prevent.
        className={`${className ?? ""}${box && !suppressMesh ? " enquiry-nextstep-btn--mesh" : ""}`}
        /**
         * ⚠⚠ `position: relative` IS WHAT PUTS THE LABEL IN FRONT OF THE MESH,
         * AND WITHOUT IT THE BUTTON RENDERS BLANK.
         *
         * Carl, 10 August 2026: *"the button should have the text 'next step' on
         * it."* It did — `textContent` was "Next step", colour and font-size
         * correct, box correct. **The canvas was painting over it.**
         *
         * ⚠ AN ABSOLUTELY-POSITIONED SIBLING PAINTS ABOVE A STATIC ONE WHATEVER
         * THE DOM ORDER. Positioned elements form a later paint layer than
         * in-flow content, so putting the `<button>` after the canvas in the
         * markup — which looks like it should be enough — does nothing. The
         * button has to be positioned too before source order decides.
         *
         * ⚠ IT WORKED ON THE BENCH, WHICH IS WHY IT WAS NOT CAUGHT EARLIER:
         * `app/proto/nextstep/page.tsx` renders the label as its own
         * `position: absolute` span. Lifting the pattern into a shared component
         * dropped the property that was doing the work.
         *
         * `z-index` is deliberately NOT set: `position: relative` alone is
         * enough here, and adding one would create a stacking context that the
         * corridor's own layering would then have to reason about.
         */
        style={{ position: "relative", ...buttonProps.style }}
      >
        {children}
      </button>
    </span>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ THE PERSISTENT SURFACE HOST — ONE CANVAS, ONE CONTEXT, NEVER UNMOUNTED
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Commit 1 of the Q5 freeze repair, 18 August 2026. Mounted ONCE by
 * `EnquiryOpening`, outside the keyed phrase, so the WebGL context, the PMREM
 * bake, the `MeshPhysicalMaterial` link and the geometry upload happen **once
 * per page instead of once per question**.
 *
 * ⚠ IT KEEPS ITS OWN `<Canvas>` AND THEREFORE ITS OWN RENDERER. It is NOT
 * merged into the card host, and that is a hard constraint, not a preference:
 * `toneMapping` is a RENDERER-level setting. The cards run R3F's default
 * ACESFilmic; this button runs `NeutralToneMapping`, because ACES desaturates
 * aggressively exactly where Carl's reference is bluest. One renderer cannot
 * give both. **The separate-renderer argument in `NextStepCanvas`'s header is
 * preserved verbatim — this change alters only how long the renderer LIVES.**
 *
 * ⚠ AND THE CARD HOST TRACKS A MOVING GRID PER FRAME while the corridor moves.
 * The button must NEVER move. Putting the one element that must stay pinned
 * inside the host designed to chase would be a permanent hazard.
 *
 * ── POSITIONING ───────────────────────────────────────────────────────────
 *
 * `position: fixed` at the rect the active `NextStepMeshButton` publishes.
 * `getBoundingClientRect()` reports viewport coordinates and `fixed` resolves
 * against the viewport, **so the two agree by construction with no arithmetic.**
 * ⚠ This is why no `gridOffset` equivalent is needed: D-048 required one because
 * the card canvas used grid-relative `box.left/top` from a host that was no
 * longer inside the grid. `NextStepCanvas` positions from its own measured
 * width/height only and holds no absolute coordinates.
 *
 * ⛔ `rect === null` RENDERS NOTHING. Never a `?? 0` fallback — a zero-origin
 * fallback is exactly what painted the 12 August build at the shell origin.
 *
 * ── WHAT THIS COMMIT DELIBERATELY DOES NOT DO ─────────────────────────────
 *
 * ⛔ COMMIT 1 IS LIFETIME ONLY, so that the recovery figure it produces is
 * attributable to the lifetime change and nothing else. Still to come, each in
 * its own commit and its own measurement:
 *   - commit 2: the fade reproduction (the three-source opacity product)
 *   - commit 3: the `showExtras` depth gate
 *   - commit 4: the opening/complete visibility gate — SPLIT FROM 3 on Carl's
 *     instruction because it carries the worst visible failure in the plan, a
 *     persistent host painting a chrome pill over the contact form
 *
 * ⚠ UNTIL COMMIT 4 LANDS, VISIBILITY IS THE CALLER'S: this host draws wherever
 * it is told to draw. `EnquiryOpening` passes `rect = null` when no button is
 * present, which is what keeps it off the contact form for now.
 */
export function NextStepSurfaceHost({
  rect,
  active,
  opacity,
  transitionMs,
}: {
  rect: { left: number; top: number; w: number; h: number } | null;
  active: boolean;
  /**
   * ══════════════════════════════════════════════════════════════════════════
   * ⚠⚠ COMMIT 2 — THE REPRODUCED OPACITY. Brought forward on Carl's ruling.
   * ══════════════════════════════════════════════════════════════════════════
   *
   * **Why this prop exists.** Hoisting the canvas out of the keyed phrase left
   * behind ALL THREE opacity sources that used to govern it, because every one
   * of them is scoped inside the phrase:
   *
   *     wrapper   opacity: selected.size > 0 ? 1 : 0   600ms linear
   *     depth-1   .enquiry-pdepth-1 .enquiry-phrase-extras { opacity: 0.78 }
   *     exit      .enquiry-phrase-extras-out { opacity: 0; 900ms linear }
   *
   * ⛔ THE RESULT WAS A FORBIDDEN STATE, AND CARL SAW IT: the button visible
   * before any answer was selected — present, lit, blank, no text — appearing as
   * the question revealed. **The design has no such state.**
   *
   * ⚠⚠ AND IT FALSIFIED THE PLAN'S SEQUENCING. The three-commit split assumed
   * lifetime and opacity were separable. **They are not** — a persistent host has
   * no wrapper opacity, so hoisting NECESSARILY changes visibility behaviour in
   * the same commit. There is no "lifetime only, appearance unchanged" build.
   * Carl's ruling, 18 August 2026: *"the button must work exactly as designed.
   * Not negotiable. No interim gate, no hard on/off placeholder, no build that
   * behaves wrongly for the convenience of a measurement."*
   *
   * ── WHAT IS REPRODUCED, AND THE INTERACTION THAT MATTERS ──────────────────
   *
   * The three sources MULTIPLY. The product, by phase:
   *
   *     active, nothing selected    0 x 1.00  =  0      <- ABSENT, not dim
   *     active, selected            1 x 1.00  =  1      <- 600ms fade in
   *     leaving (depth 1, -out)     1->0 600ms  x  0.78->0 900ms
   *
   * ⚠⚠ ON THE EXIT THE CHILD GOVERNS AND THAT IS MEASURED, NOT ASSUMED. With the
   * parent at 900ms and the wrapper at 600ms, **the button completes its exit at
   * ~600ms while the cards continue to 900ms.** `globals.css` records the history:
   * at the parent's old 300ms the parent hit 0 at ~328ms while the button was
   * still at ~0.50, so the last ~300ms of the button's declared 600ms ran
   * invisibly. At 900ms the parent no longer truncates the child — **so the
   * button's exit is its own 600ms, and reproducing the 900ms parent here would
   * be reproducing a curve that no longer governs.**
   *
   * ⚠ THE 0.78 NEVER BECOMES VISIBLE ON THE BUTTON. It is the parent's STARTING
   * point on the outgoing beat; the button's own fade dominates from t=0 and
   * reaches 0 first. It is therefore not modelled here — and that is a claim the
   * per-frame comparison must confirm, not an assumption. See
   * `verify/button-opacity-curve.mjs`.
   *
   * ⛔ NOT A NEW CURVE. Every number here is read off the existing CSS. If the
   * per-frame comparison cannot match, A1 fails the appearance constraint and
   * goes back to Carl — it is NOT tuned toward "close enough".
   */
  opacity: number;
  /** Duration for the current transition, in ms. See `opacity`. */
  transitionMs: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  /**
   * ══════════════════════════════════════════════════════════════════════════
   * ⚠⚠ THE CONTAINING-BLOCK ASSERTION — THE INVARIANT MADE SELF-CHECKING
   * ══════════════════════════════════════════════════════════════════════════
   *
   * **This host only works if `position: fixed` resolves against the VIEWPORT.**
   * Any ancestor with `transform`, `filter`, `perspective`, `contain` or
   * `will-change` becomes the containing block instead, and then the coordinates
   * published by `getBoundingClientRect()` — which are viewport coordinates —
   * mean something different from the `left`/`top` written here.
   *
   * ⚠ THAT IS NOT HYPOTHETICAL. The first version of this host was mounted
   * inside the shell, which carries `translateY(calc(38vh - 5rem))`. Computed
   * `left/top` read 654.7 / 616.8 while it painted at 1080 / 879: **the button
   * showed as a flat white DOM pill with the mesh in the lower-right corner.**
   *
   * ⚠⚠ AND THE PLAN HAD ASSERTED IT IN PROSE — *"fixed resolves against the
   * viewport, the same space getBoundingClientRect reports in, so they agree by
   * construction with no arithmetic."* True, and unasserted, and therefore no
   * help. `context-rules.md` → *An invariant that lives only in prose is not
   * asserted* was written the SAME DAY, by the same author, and still not
   * applied. **Writing it down is what failed. This is the assertion instead.**
   *
   * ⛔ IT COMPARES THE TWO DIRECTLY. If the element's own `getBoundingClientRect`
   * disagrees with the `left`/`top` it was given, the containing block is not the
   * viewport and the mesh is in the wrong place. **Fails LOUDLY** — a console
   * error and a `data-` attribute the harness reads — rather than drifting.
   *
   * ⚠ 1px TOLERANCE, NOT 0. Sub-pixel layout and DPR rounding put honest
   * fractional differences here; the failure this catches is hundreds of pixels.
   */
  useEffect(() => {
    if (!rect) return;
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = Math.abs(r.left - rect.left);
    const dy = Math.abs(r.top - rect.top);
    const ok = dx <= 1 && dy <= 1;
    el.setAttribute("data-cb-ok", ok ? "1" : "0");
    el.setAttribute("data-cb-drift", `${Math.round(dx)},${Math.round(dy)}`);
    if (!ok) {
      console.error(
        `[NextStepSurfaceHost] CONTAINING BLOCK IS NOT THE VIEWPORT. ` +
          `Asked for left=${rect.left.toFixed(1)} top=${rect.top.toFixed(1)}, ` +
          `painted at left=${r.left.toFixed(1)} top=${r.top.toFixed(1)} ` +
          `(drift ${dx.toFixed(1)},${dy.toFixed(1)}px). ` +
          `An ancestor has transform/filter/perspective/contain/will-change. ` +
          `Move the host, do NOT subtract the offset.`,
      );
    }
  }, [rect]);

  return (
    <div
      ref={hostRef}
      data-testid="nextstep-surface-host"
      aria-hidden="true"
      style={{
        position: "fixed",
        // ⚠ `visibility`, NOT `display: none` and NOT unmounting. The canvas must
        // keep a real box: `NextStepCanvas` maps its measured size to the mesh
        // geometry, and a zero-sized canvas would destroy that mapping and force
        // a resize on the next reveal. The contact layer one file over is hidden
        // the same way, for the same reason.
        visibility: rect ? "visible" : "hidden",
        left: rect ? rect.left : 0,
        top: rect ? rect.top : 0,
        width: rect ? rect.w : 0,
        height: rect ? rect.h : 0,
        // ⚠⚠ THE REPRODUCED FADE — commit 2. See the `opacity` prop's header for
        // the three sources this replaces and why the child governs the exit.
        // ⚠ `linear`, matching both original transitions. Neither used an easing
        // curve, and substituting one here would be a new curve, not a
        // reproduction.
        opacity,
        /**
         * ⚠⚠ THE EASING IS NOT DECORATION — IT REPRODUCES A PRODUCT OF TWO FADES.
         *
         * Fading IN, one source governed pre-hoist (the wrapper's 600ms linear),
         * so `linear` reproduces it exactly — measured delta **0.000 at every
         * frame**.
         *
         * Fading OUT, TWO ran together and multiplied: the wrapper's 600ms and
         * the parent's 900ms, both linear. **A product of two linears is
         * QUADRATIC**, and no single linear transition can reproduce it — proven
         * by measurement, not argued: 600ms linear ran up to 0.186 too bright,
         * 375ms linear up to 0.189 too dark. Both failed in opposite directions,
         * which is the signature of fitting the wrong SHAPE rather than the wrong
         * duration.
         *
         * ⚠ THE CONTROL POINTS ARE SOLVED, NOT CHOSEN BY EYE. A grid search over
         * the four bezier parameters against the MEASURED pre-hoist exit found
         * `cubic-bezier(0.3, 0.35, 0.35, 0.65)` at a worst-case per-frame error
         * of **0.011**. A hand-picked `(0.33, 0.66, 0.66, 1)` — which looked
         * right — measured 0.113, ten times worse. **The eye is not able to pick
         * bezier control points; the curve had to be fitted.**
         *
         * ⛔ DO NOT "SIMPLIFY" THIS TO `linear`. That was the first attempt and
         * the per-frame curve rejected it at 0.186.
         */
        transition: `opacity ${transitionMs}ms ${
          transitionMs === 600 && opacity === 0
            ? "cubic-bezier(0.3, 0.35, 0.35, 0.65)"
            : "linear"
        }`,
        // ⚠ THE DOM BUTTON IS THE CONTROL AND THIS MUST NEVER SWALLOW ITS HITS.
        // The real `<button>` lives in the phrase, underneath this in z-order;
        // a fixed transparent layer over it that accepted pointers would cost a
        // click and the defect would look like an unresponsive button.
        pointerEvents: "none",
      }}
    >
      {/*
        ⚠ MOUNTED EVEN WHILE `rect` IS NULL — that is the whole point. The
        context is created and the PMREM baked during the OPENING, when nothing
        is animating, rather than inside Q5's 1300ms wipe. Gating the mount on
        `rect` would put ~40ms of GPU work back into the corridor on first
        selection, which is the defect in a different place.

        ⚠ THE DEFAULT SIZE IS USED UNTIL THE FIRST RECT ARRIVES. The geometry is
        rebuilt if the measured box differs, but the box has been stable at
        116x41 across every measurement, so in practice this bakes once.
      */}
      <NextStepCanvas
        width={rect ? rect.w : NEXTSTEP_WIDTH_PX}
        height={rect ? rect.h : NEXTSTEP_HEIGHT_PX}
        active={active}
      />
    </div>
  );
}
