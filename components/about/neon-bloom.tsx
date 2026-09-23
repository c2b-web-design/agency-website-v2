"use client";

/**
 * ⛔⛔ NEON BLOOM — the `/about` canvas's FRAME OWNER. D-093.
 *
 * Plan: `live-work/wall-neon-plan-23-september.md` (S1–S5), amended by the
 * Architect's review. **Neon-only bloom, chosen by Carl 23 September 2026:** the
 * scene renders EXACTLY as before; then the neon tubes ALONE are drawn to a
 * separate buffer, blurred, and ADDED on top.
 *
 * ⛔ WHY NOT `EffectComposer` — verified in the installed source, and by the
 * Architect: `@react-three/postprocessing`'s composer sets
 * `gl.toneMapping = NoToneMapping` while mounted, and three 0.185 tone-maps a
 * material only when drawing to the SCREEN (`WebGLRenderer.js:2351-2357`). Under
 * a composer D-089's approved glass would lose ACES, the backplate's
 * `toneMapped={false}` would stop meaning anything, and the glass's HDR env-map
 * highlights would bloom. **Here the base render is the same call R3F makes, so
 * none of that moves** — the identity gate (`verify/about-neon.mjs identity`)
 * measures it.
 *
 * ⚠⚠ THIS OWNS EVERY FRAME ON THE CANVAS, NOT ONLY THE NEON'S — Architect F2.
 * A `useFrame` at priority 1 switches off R3F's automatic render for the WHOLE
 * ROOT (`!state.internal.priority`), so every repaint `/about` does — resize,
 * DPR change, a texture arriving, HMR — comes through the frame below. ⛔ **So
 * the base render is isolated from the neon's failures:** anything the neon
 * throws is caught, logged once, and the neon is switched off for the session,
 * and the room renders regardless. **The room never goes black because of the
 * neon.** `?neon=none` unmounts this and R3F renders the room itself again.
 *
 * ⛔ ONE CLOCK (the opal's rule 2, D-091): the track is advanced and written to
 * the materials on the SAME frame, immediately before the render that shows it.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { MipmapBlurPass } from "postprocessing";
import {
  BLOOM_LEVELS,
  BLOOM_RADIUS,
  BLOOM_STRENGTH,
  NEON_LAYER,
  NEON_SCHEDULES,
  NEON_SCHEDULES_REDUCED,
  neonLevel,
  neonNumber,
  neonSettled,
  wallCardsInView,
  type NeonChannel,
  type NeonMode,
} from "./about-neon";

/**
 * ⚠ ADDS THE BLOOM ONTO THE FINISHED IMAGE — AN APPROXIMATION, STATED.
 *
 * The screen already holds sRGB-ENCODED values; the blur is LINEAR light.
 * Correct glare would be `encode(decode(base) + bloom)`, which fixed-function
 * blending cannot do without reading the base. **Adding `encode(bloom)` instead
 * is close to exact where the background is DARK — the wall behind CA and CB,
 * luma ~9 — and overshoots on bright backgrounds.** ⚠ Recorded for the floor
 * pair, whose CS sits over lit floorboards.
 *
 * ⛔ AN ALL-ZERO BLUR ADDS EXACTLY ZERO: `encode(0)` takes the linear branch and
 * returns 0, and `ONE, ONE` blending adds it — so `?neon=off` is pixel-identical
 * to the scene without this component. Alpha is left untouched (`alpha: true`).
 */
const COMPOSITE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
const COMPOSITE_FRAG = /* glsl */ `
  uniform sampler2D tBloom;
  uniform float uStrength;
  varying vec2 vUv;
  vec3 linearToSRGB(vec3 c) {
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }
  void main() {
    vec3 b = max(texture2D(tBloom, vUv).rgb * uStrength, 0.0);
    gl_FragColor = vec4(linearToSRGB(b), 0.0);
  }
`;

type Props = {
  channels: NeonChannel[];
  mode: Exclude<NeonMode, { kind: "none" }>;
};

/** The bloom's GPU resources — see `createBloom`. */
type Bloom = {
  neonTarget: THREE.WebGLRenderTarget;
  blur: MipmapBlurPass;
  compositeMat: THREE.ShaderMaterial;
  quadGeom: THREE.PlaneGeometry;
  quadScene: THREE.Scene;
  quadCamera: THREE.OrthographicCamera;
};

/**
 * ⛔ THE BLOOM'S GPU RESOURCES — inside the EXISTING context. ⚠ No second canvas
 * and no second WebGL context (CLAUDE.md worked cases 1 and 2): only render
 * targets, a blur and a quad.
 */
function createBloom(gl: THREE.WebGLRenderer): Bloom {
  /* The neon layer renders here, linear HDR. Depth on, so the half-tube occludes
     itself correctly; nothing else is in this pass to occlude it. */
  const neonTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    depthBuffer: true,
  });
  /* ⚠ ORDER MATTERS — Architect F14. `levels` creates the mip chain;
     `initialize` then sets its texture type; `setSize` (the resize effect) gives
     it extent. **Without setSize the chain has zero extent and the bloom is
     silently absent.** */
  const blur = new MipmapBlurPass();
  blur.levels = BLOOM_LEVELS;
  blur.initialize(gl, false, THREE.HalfFloatType);

  const compositeMat = new THREE.ShaderMaterial({
    uniforms: { tBloom: { value: null }, uStrength: { value: BLOOM_STRENGTH } },
    vertexShader: COMPOSITE_VERT,
    fragmentShader: COMPOSITE_FRAG,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
  const quadGeom = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(quadGeom, compositeMat);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { neonTarget, blur, compositeMat, quadGeom, quadScene, quadCamera };
}

function disposeBloom(b: Bloom) {
  b.neonTarget.dispose();
  b.blur.dispose();
  b.compositeMat.dispose();
  b.quadGeom.dispose();
}

/** Every rim dark — on failure and on unmount, so nothing inherits a lit tube. */
function darken(channels: NeonChannel[]) {
  for (const ch of channels) if (ch.rim) ch.rim.emissiveIntensity = 0;
}

/**
 * ⚠ WHY EVERYTHING MUTABLE LIVES IN A REF. The React Compiler's lint treats memo
 * results, props and `useThree` values as FROZEN, and this component's whole job
 * is to write three.js objects every frame. ⛔ **The approved light rig on
 * `/start` (`contact-field-light-rig.tsx`) solves it the same way** — refs, and
 * the `state` `useFrame` hands in rather than hook values. The lint baseline is
 * ZERO warnings; this is how it stays there without a suppression.
 */
export function NeonBloom({ channels, mode }: Props) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const invalidate = useThree((s) => s.invalidate);

  const strength = neonNumber("bloom", BLOOM_STRENGTH, 0, 20);
  const radius = neonNumber("bloomr", BLOOM_RADIUS, 0, 1);

  const bloomRef = useRef<Bloom | null>(null);
  const channelsRef = useRef(channels);
  const modeRef = useRef(mode);
  useEffect(() => {
    channelsRef.current = channels;
    modeRef.current = mode;
  }, [channels, mode]);

  /* ⛔ CREATED IN AN EFFECT, SO A FRAME MAY RUN FIRST — the frame skips the neon
     while `bloomRef` is null and still renders the room. */
  useEffect(() => {
    const b = createBloom(gl);
    bloomRef.current = b;
    invalidate();
    return () => {
      bloomRef.current = null;
      disposeBloom(b);
    };
  }, [gl, invalidate]);

  /* ⛔ RESIZE AND DPR — Architect F14. Sized to the DRAWING BUFFER, so the
     composite's UVs map the canvas exactly. ⚠ Declared AFTER the creation effect
     and keyed on `gl` too, so a rebuilt bloom is always sized in the same commit. */
  useEffect(() => {
    const b = bloomRef.current;
    if (!b) return;
    const v = gl.getDrawingBufferSize(new THREE.Vector2());
    b.neonTarget.setSize(v.x, v.y);
    b.blur.setSize(v.x, v.y);
    invalidate();
  }, [gl, size.width, size.height, dpr, invalidate]);

  /* ⛔ Faders — applied here so they never rebuild the render targets. */
  useEffect(() => {
    const b = bloomRef.current;
    if (!b) return;
    b.blur.radius = radius;
    b.compositeMat.uniforms.uStrength.value = strength;
    invalidate();
  }, [gl, radius, strength, invalidate]);

  // ── The clock ────────────────────────────────────────────────────────────

  /**
   * ⛔ `prefers-reduced-motion` gets the FADE-UP, no stutter (D-091). Read once at
   * mount; a mid-session change takes effect on the next load.
   */
  const schedules = useMemo(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduced ? NEON_SCHEDULES_REDUCED : NEON_SCHEDULES;
  }, []);
  const schedulesRef = useRef(schedules);

  const clock = useRef({
    /** When the current ignition's track started, in `performance.now()` ms. */
    start: 0,
    /**
     * ⛔ FALSE UNTIL THE FIRST IGNITION'S FIRST FRAME. ⚠ Without it, a frame
     * drawn before `ignite()` reads `now - 0` as long past the pattern's end and
     * shows the neon at FULL for a frame before it "strikes".
     */
    started: false,
    /** An ignition was requested and its first frame has not run yet. */
    pending: false,
    /** When `ignite()` last ran, for the watchdog. */
    ignitedAt: 0,
    /** When the frame last ran. */
    lastFrameAt: 0,
    /** Set once the neon has thrown; the base render carries on. */
    disabled: false,
  });

  /**
   * ⛔⛔ THE BOOTSTRAP — Architect F1, THE BUILD BLOCKER.
   *
   * R3F only ticks while a frame is owed. A self-invalidating `useFrame` keeps
   * itself alive (R3F 9.6 sets `frames = 2` from inside a frame), but **once both
   * tracks hold, the loop stops**, and a `setTimeout` — the reignite, and later
   * D-092's scroll trigger — is neither a store change nor a prop update. ⛔ **So
   * whatever starts a track MUST invalidate in the same statement**, or the
   * ignition silently never happens. `ignite()` is the ONLY way a track starts,
   * and it does both.
   *
   * ⚠ ASSERTED, NOT COMMENTED: in dev, a watchdog fails loudly if an ignition has
   * not seen a frame within 100ms. The rule is `context-rules.md`'s — a comment
   * saying "the start invalidates" is the prose that failed twice on 18 August.
   */
  const ignite = useCallback(() => {
    const c = clock.current;
    c.pending = true;
    c.ignitedAt = performance.now();
    invalidate();
    if (process.env.NODE_ENV !== "production") {
      const at = c.ignitedAt;
      window.setTimeout(() => {
        if (clock.current.lastFrameAt < at && !clock.current.disabled) {
          console.error(
            "⛔ NEON IGNITION NEVER RAN — no frame within 100ms of ignite(). The trigger did not wake the canvas (Architect F1).",
          );
        }
      }, 100);
    }
  }, [invalidate]);

  /**
   * ⛔⛔ THE TRIGGER — THE WALL CARDS IN FULL VIEW, ONCE PER VISIT. D-092,
   * Carl 23 September 2026. It REPLACES the first-ready-frame stand-in, which
   * struck on landing and played the ignition to a reader still in §1 — Carl:
   * *"The flicker is wasted. By the time they get there the lights are alredy
   * on."*
   *
   * ⚠ BOTH PATHS, ONE CHECK: the `Roles` anchor jump lands in view (true on the
   * scroll event it causes); a scroll makes it true as the band clears the
   * window; a deep link or refresh on `#roles` is true on the first check here.
   *
   * ⛔ ONCE PER VISIT — CARL'S RULING, 23 September 2026: *"once a user has
   * seen the on effect theres no need to labour the point."* (D-092 had warned
   * that a re-strike on every pass becomes wallpaper.) ⚠ Built first as the
   * Builder's default, then confirmed. **Do not re-arm on scroll-back.**
   *
   * ⚠ The check is coalesced to one per animation frame and listens in CAPTURE
   * on `document`, so a scroll inside any container counts. It stops listening
   * after the strike. `visibilitychange` re-checks, so a tab opened in the
   * background strikes when it is shown, not while hidden.
   *
   * ⚠ `?reignite=` keeps the old behaviour ON PURPOSE — strike on load, then
   * every N ms — because it is a tuning tool for watching the ignition.
   */
  useEffect(() => {
    if (mode.kind !== "ignite") return;
    if (mode.reigniteMs !== null) {
      ignite();
      const id = window.setInterval(ignite, mode.reigniteMs);
      return () => window.clearInterval(id);
    }
    const el = gl.domElement;
    let raf = 0;
    function stop() {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      if (raf) cancelAnimationFrame(raf);
    }
    function check() {
      raf = 0;
      if (wallCardsInView(el)) {
        stop();
        ignite();
      }
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(check);
    }
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    check();
    return stop;
  }, [mode, ignite, gl]);

  /* On unmount the rims go dark, so a remount never inherits a lit tube. */
  useEffect(() => {
    const chs = channelsRef.current;
    return () => darken(chs);
  }, []);

  // ── The frame ────────────────────────────────────────────────────────────

  useFrame((state) => {
    const { gl: r, scene, camera } = state;
    const c = clock.current;
    const chs = channelsRef.current;
    const m = modeRef.current;
    const now = performance.now();
    c.lastFrameAt = now;
    let changing = false;

    const failOnce = (where: string, e: unknown) => {
      if (c.disabled) return;
      c.disabled = true;
      darken(chs);
      console.error(`⛔ NEON DISABLED for this session — it threw in ${where}. The room renders without it.`, e);
    };

    // 1. Advance the tracks and write both depths (D-091) — same frame as the render.
    if (!c.disabled) {
      try {
        if (c.pending) {
          c.start = now;
          c.started = true;
          c.pending = false;
          /* ⚠ AN INSTRUMENT HOOK: `verify/about-neon.mjs frames` splits frame
             pacing on this mark, so a long frame during LOAD is not read as one
             during the IGNITION. Cheap, and one per strike. */
          performance.mark("neon:ignite");
        }
        for (const ch of chs) {
          const s = schedulesRef.current[ch.id];
          let level = 0;
          if (m.kind === "full") level = 1;
          else if (m.kind === "freeze") level = neonLevel(s.pattern, m.tMs - s.startMs);
          else if (m.kind === "ignite" && c.started) {
            const t = now - c.start;
            level = neonLevel(s.pattern, t - s.startMs);
            changing ||= !neonSettled(s, t);
          }
          const k = ch.peak * level;
          /* ⚠ `setValues`, not `.emissiveIntensity = k`: the compiler lint reads
             the channels (a prop, captured in an effect) as frozen, and a
             three.js material is external mutable state it cannot see into.
             A method call is how the emitter line below already writes. */
          ch.rim?.setValues({ emissiveIntensity: k });
          ch.emitter?.color.copy(ch.color).multiplyScalar(k);
        }
      } catch (e) {
        failOnce("the track", e);
      }
    }

    // 2. THE BASE RENDER — the same call R3F makes (`gl.render(scene, camera)`).
    r.setRenderTarget(null);
    r.render(scene, camera);

    // 3–5. Neon pass, blur, composite. Isolated: a throw here costs the glow only.
    const b = bloomRef.current;
    if (!c.disabled && b) {
      const prevMask = camera.layers.mask;
      const prevAutoClear = r.autoClear;
      const prevClear = r.getClearColor(new THREE.Color());
      const prevAlpha = r.getClearAlpha();
      try {
        // 3. Only NEON_LAYER: the two emitters, opaque — no transmission pre-pass.
        camera.layers.set(NEON_LAYER);
        r.setRenderTarget(b.neonTarget);
        r.setClearColor(0x000000, 0);
        r.clear();
        r.render(scene, camera);
        camera.layers.mask = prevMask;

        // 4. The Unreal-style dual-filter blur (`postprocessing`'s MipmapBlurPass).
        b.blur.render(r, b.neonTarget, null, 0, false);

        // 5. Add it onto the screen. ⛔ autoClear OFF, or the base render is wiped
        //    and the room goes black — Architect F2. Restored in `finally`.
        r.setRenderTarget(null);
        r.autoClear = false;
        b.compositeMat.uniforms.tBloom.value = b.blur.texture;
        r.render(b.quadScene, b.quadCamera);
      } catch (e) {
        failOnce("the bloom pass", e);
      } finally {
        camera.layers.mask = prevMask;
        r.autoClear = prevAutoClear;
        r.setClearColor(prevClear, prevAlpha);
        r.setRenderTarget(null);
      }
    }

    // 6. Keep ticking only while a track moves; then back to `frameloop="demand"`.
    if (changing) state.invalidate();
  }, 1);

  return null;
}
