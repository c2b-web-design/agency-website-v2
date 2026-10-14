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
import { canvasOnScreen } from "@/lib/canvas-on-screen";
import { deskMarkBuilt, isRoomWarm, markRoomWarm, resetRoomWarm } from "@/lib/room-warm";
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
  patternMs,
  reversePattern,
  roomWipeClearsCA,
  wallCardsInView,
  type NeonCardId,
  type NeonChannel,
  type NeonMode,
  type NeonPattern,
  type NeonSchedule,
  type SequenceClock,
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

/**
 * ⛔⛔ §2's RETURN RULES, STEP 2 — designed by Carl, 13 October 2026; built 14 October (D-088). Structural note:
 * `live-work/structural-note-s2-return-step2-14-october.md`. Three states, ONE owner (this component — it owns `ignite()`):
 *   - `fresh`   — neon off, cards empty (as before the first strike). The trigger starts it.
 *   - `playing` — the sequence, looping.
 *   - `static`  — the same look as fresh; only card 1's button starts it (Carl, 14 October: *"A plain button should be
 *                 on card 1 saying "click to restart". It can then disappear as the neon ignites."*).
 * Moves: playing → static on REACHING §4 (`#start` covering ≥ `share` of the window — set there, off screen, so nobody
 * coming back sees a lit card go out); playing/static → fresh after a LINGER in §3 (`#examples` ≥ `share` for `lingerMs`,
 * Carl: *"3s it is"*; the timer resets if the reader leaves first; a hidden tab never counts). ⚠ A first visit is always
 * fresh: §4 sends only a PLAYING §2 to static, so a page opened at `#start` still gets §2's first ignition (the button is
 * for a reader who *"would of been in this section previously"*). §2 → §3 and back inside 3 s, or the runway: runs on.
 * ⚠ The 60% share is §3's figure from Carl's design, used for §4 as well — the Builder's choice, stated.
 */
const S2_RETURN = { lingerMs: 3000, share: 0.6 } as const;

/**
 * ⛔ CARD 1's PROMPT GOES OUT WITH THE RIM'S OWN REVERSE FLICKER — Carl, 14 October 2026: *"it could use the same
 * reversed flicker that is used on the rim."* That is `reversePattern` (the ignition played backwards, its dark
 * lead-in trimmed — the flicker a card goes out on), taken of CA's IGNITION: its schedule's segments up to the first
 * that reaches full (the sequence appends a hold and its own going-out after that). ⚠ THE PAIRING, the Builder's
 * choice, stated: the words' reverse flicker STARTS on the rim's first blip (after the ignition's dark lead-in) and
 * ENDS as the rim reaches full — the same window, mirrored, so as one comes on the other goes. Under reduced motion
 * the ignition is the fade-up, so the words fade down.
 */
function promptOutOf(ca: NeonSchedule): { pattern: NeonPattern; atMs: number } | null {
  const segs = ca.pattern.segments;
  const end = segs.findIndex((x) => x.to >= 1);
  if (end < 0) return null;
  const ignition = segs.slice(0, end + 1);
  let lead = 0;
  for (const x of ignition) {
    if (x.ramp || x.to !== 0) break;
    lead += x.ms;
  }
  return { pattern: reversePattern({ segments: ignition, tail: { hold: true } }), atMs: ca.startMs + lead };
}
export type S2State = "fresh" | "playing" | "static";
/** How much of the window a section covers, 0 … 1 (0 if it is missing or the tab is hidden). */
function windowShare(id: string): number {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return 0;
  const el = document.getElementById(id);
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / vh;
}

type Props = {
  channels: NeonChannel[];
  mode: Exclude<NeonMode, { kind: "none" }>;
  /**
   * ⛔ THE §2 SEQUENCE (27 September 2026, `sequencePlan` in `about-neon.ts`): each card's start on the clock,
   * derived from the reading of the card before. A card with NO entry stays dark. Absent → the fixed
   * `NEON_SCHEDULES` (or the reduced set), as before.
   */
  schedules?: Partial<Record<NeonCardId, NeonSchedule>>;
  /** The sequence's shared clock — set here, in the frame the neon clock starts; the text reads it. */
  sequenceRef?: SequenceClock;
  /** When the sequence's last word is written — `?reignite=` waits at least this long plus a second. */
  sequenceEndMs?: number;
  /**
   * §2's return rules (`S2_RETURN`) — on the §2 sequence only. `restartRef` is filled here with the restart (the
   * `sequenceRef` pattern, read by card 1's button in `AboutCardCanvas`; ⚠ a separate prop named `…Ref`, because the
   * React Compiler's lint lets a component write only to what it recognises as a ref); `onS2State` hears each change
   * of state. Absent → the old behaviour (one strike per visit).
   */
  restartRef?: { current: (() => void) | null };
  onS2State?: (s: S2State) => void;
  /**
   * Card 1's prompt, "click to restart" (`CardPrompt`, `card-extrude.tsx`) — its level is written HERE, on the frame
   * CA's rim is written (one track, one clock — D-091): 1 while static; on a restart, CA's ignition REVERSED
   * (`promptOutOf`); 0 otherwise.
   */
  promptRef?: { current: { setLevel: (level: number) => void } | null };
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
  for (const ch of channels) {
    if (ch.rim) ch.rim.emissiveIntensity = 0;
    ch.textGlow?.color.setRGB(0, 0, 0);
  }
}

/**
 * ⚠ WHY EVERYTHING MUTABLE LIVES IN A REF. The React Compiler's lint treats memo
 * results, props and `useThree` values as FROZEN, and this component's whole job
 * is to write three.js objects every frame. ⛔ **The approved light rig on
 * `/start` (`contact-field-light-rig.tsx`) solves it the same way** — refs, and
 * the `state` `useFrame` hands in rather than hook values. The lint baseline is
 * ZERO warnings; this is how it stays there without a suppression.
 */
export function NeonBloom({ channels, mode, schedules: planned, sequenceRef, sequenceEndMs = 0, restartRef, onS2State, promptRef }: Props) {
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
    return planned ?? (reduced ? NEON_SCHEDULES_REDUCED : NEON_SCHEDULES);
  }, [planned]);
  const schedulesRef = useRef(schedules);
  /* ⚠ THE PLAN CAN ARRIVE AFTER MOUNT — the §2 sequence places the second card once the font has loaded — so the
     ref follows the prop, and a frame is asked for in case the tracks had already settled. */
  useEffect(() => {
    schedulesRef.current = schedules;
    invalidate();
  }, [schedules, invalidate]);

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
    /** Cards whose rim has struck in the current ignition — one `neon:strike:<id>` mark each, for measurement. */
    struck: new Set<string>(),
    /** §2's state under the return rules (`S2_RETURN`); `playing` from the ignition's first frame. */
    state: "fresh" as S2State,
    /** This ignition started from STATIC — card 1's prompt flickers out with it (`promptOutOf`). */
    promptOut: false,
  });
  const onStateRef = useRef(onS2State);
  useEffect(() => {
    onStateRef.current = onS2State;
  }, [onS2State]);

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
   * ⛔ §2 BACK TO DARK AND EMPTY — `fresh` or `static` (`S2_RETURN`). The tracks stop (`started` false → every level 0),
   * the shared clock is cleared (the text hides its lines while it is null, `card-extrude.tsx`), and a frame is asked
   * for so the dark levels are WRITTEN — off screen too (step 1 still runs the track write), so the first frame back
   * shows no lit rim. ⚠ The desk mark's light does NOT follow: it holds its first strike (`DeskMark`, Carl 14 October:
   * *"Once its in the video player it stays there."*).
   */
  const settle = useCallback(
    (to: Exclude<S2State, "playing">) => {
      const c = clock.current;
      if (c.state === to) return;
      c.started = false;
      c.pending = false;
      c.struck.clear();
      if (sequenceRef) sequenceRef.current = null;
      c.state = to;
      performance.mark(`s2:${to}`);
      onStateRef.current?.(to);
      invalidate();
    },
    [invalidate, sequenceRef],
  );

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
   * ⛔ *Amended 14 October 2026 (D-088) by Carl's return rules (`S2_RETURN`):* still no re-arm on a plain scroll-back;
   * it re-arms only after a 3 s linger in §3, and a reader returning from §4 without one finds §2 STATIC, with card
   * 1's button. Without `restartRef` (off the sequence) the 23 September behaviour stands unchanged.
   *
   * ⛔ THE TRIGGER READS BOTH DIRECTIONS — 14 October 2026, Carl: *"i take your recommendation"*: the wipe past CA
   * AND the wall cards in full view. From §1 the wall is in view from landing (the room is behind §1), so the wipe
   * governs — the approved path, unchanged. From below, `roomWipe` reads fully opaque anywhere under §2's top, so
   * the wall coming into view governs. ⚠ MEASURED before (`live-work/scripts/about-s2-unseen-strike-probe.mjs`): on
   * the wipe alone a page opened at `#examples` struck at 1.6 s and at `#start` at 1.0 s with the room OFF SCREEN.
   *
   * ⚠ The check is coalesced to one per animation frame and listens in CAPTURE
   * on `document`, so a scroll inside any container counts. ⚠ *Corrected in place, 14 October:* it "stops listening
   * after the strike" only without `restartRef`; with it it keeps listening (the §3 linger, §4, the re-armed
   * trigger) — one rect read per section per scroll frame. `visibilitychange` re-checks, so a tab opened in the
   * background strikes when it is shown, not while hidden.
   *
   * ⚠ `?reignite=` keeps the old behaviour ON PURPOSE — strike on load, then
   * every N ms — because it is a tuning tool for watching the ignition. The return rules do not apply under it.
   */
  const ruled = !!restartRef;
  useEffect(() => {
    if (mode.kind !== "ignite") return;
    if (mode.reigniteMs !== null) {
      ignite();
      /* ⚠ The §2 sequence runs far longer than the old fixed schedule (~26 s to CB's last word, not ~9 s), so
         the replay waits for the whole performance — a shorter one would restart before CB ever struck. */
      const id = window.setInterval(ignite, Math.max(mode.reigniteMs, Math.ceil((sequenceEndMs + 1000) / 1000) * 1000));
      return () => window.clearInterval(id);
    }
    const el = gl.domElement;
    let raf = 0;
    let linger = 0;
    function stop() {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      if (raf) cancelAnimationFrame(raf);
      if (linger) window.clearTimeout(linger);
    }
    function check() {
      raf = 0;
      const c = clock.current;
      /* ⛔ Since 3 October 2026 the trigger is the ROOM'S WIPE clearing CA's bottom (D-092; `roomWipeClearsCA`), not
         "the wall cards in the window" — the room is on screen behind §1 now, so that read true from landing.
         Since 14 October both together (above). */
      if (c.state === "fresh" && !c.pending && roomWipeClearsCA(el) && wallCardsInView(el)) {
        if (!ruled) stop();
        ignite();
        return;
      }
      if (!ruled) return;
      // §4 reached with §2 playing → static, set here while it is off screen
      if (c.state === "playing" && windowShare("start") >= S2_RETURN.share) settle("static");
      // the §3 linger → fresh (re-armed); the timer resets if the reader leaves §3 first
      const inS3 = c.state !== "fresh" && windowShare("examples") >= S2_RETURN.share;
      if (inS3 && !linger) {
        linger = window.setTimeout(() => {
          linger = 0;
          if (windowShare("examples") >= S2_RETURN.share) settle("fresh");
        }, S2_RETURN.lingerMs);
      } else if (!inS3 && linger) {
        window.clearTimeout(linger);
        linger = 0;
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
  }, [mode, ignite, gl, sequenceEndMs, ruled, settle]);

  /* Card 1's button reaches the restart through this ref (`AboutCardCanvas`). Only a STATIC §2 restarts: the cards are
     already dark and empty, so "reset, then ignite" is `ignite()` — the existing sequence from its start, card 1's
     flicker first. */
  useEffect(() => {
    if (!restartRef) return;
    restartRef.current = () => {
      if (clock.current.state === "static" && !clock.current.pending) ignite();
    };
    return () => {
      restartRef.current = null;
    };
  }, [restartRef, ignite]);

  /* On unmount the rims go dark, so a remount never inherits a lit tube. And the room is no longer warm: a new canvas must
     compile again (`lib/room-warm.ts`). */
  useEffect(() => {
    const chs = channelsRef.current;
    return () => {
      darken(chs);
      resetRoomWarm();
    };
  }, []);

  /** The off-screen precompile (below): the scene's object count when it last ran, and whether one is in flight. */
  const precompile = useRef({ objects: -1, busy: false });

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
          c.struck.clear();
          /* ⛔ THE SEQUENCE'S DOWNBEAT — the text's clock is THIS moment, not a second reading of the trigger. */
          if (sequenceRef) sequenceRef.current = now;
          /* ⛔ PLAYING FROM THIS FRAME — card 1's button goes as the neon ignites (Carl, 14 October), not on the click. */
          c.promptOut = c.state === "static";
          if (c.state !== "playing") {
            c.state = "playing";
            onStateRef.current?.("playing");
          }
          /* ⚠ AN INSTRUMENT HOOK: `verify/about-neon.mjs frames` splits frame
             pacing on this mark, so a long frame during LOAD is not read as one
             during the IGNITION. Cheap, and one per strike. */
          performance.mark("neon:ignite");
        }
        /* ⚠ WITHOUT AN IGNITION (`?neon=full|off`, `?neont=`) the sequence still needs a clock, or no text would
           ever start: it starts on the first frame — for a freeze, `tMs` in the past, so the text sits at the
           same moment of the sequence as the frozen neon (and runs on from there). */
        if (sequenceRef && sequenceRef.current === null && m.kind !== "ignite") {
          sequenceRef.current = now - (m.kind === "freeze" ? m.tMs : 0);
        }
        for (const ch of chs) {
          const s = schedulesRef.current[ch.id];
          let level = 0;
          /* ⛔ NO SCHEDULE → DARK: a card outside the sequence (`sequenceOrder`) is never struck. */
          if (!s) level = 0;
          else if (m.kind === "full") level = 1;
          else if (m.kind === "freeze") level = neonLevel(s.pattern, m.tMs - s.startMs);
          else if (m.kind === "ignite" && c.started) {
            const t = now - c.start;
            level = neonLevel(s.pattern, t - s.startMs);
            changing ||= !neonSettled(s, t);
            /* ⚠ INSTRUMENT HOOKS, once per LAP (the §2 sequence loops): `neon:strike:<id>` as the card's track
               begins, `neon:out:<id>` as a track that ends dark reaches its end — the instant its text vanishes. */
            const since = t - s.startMs;
            if (since >= 0) {
              const len = patternMs(s.pattern);
              const per = "loop" in s.pattern.tail ? Math.max(s.pattern.tail.loop.periodMs, len) : Infinity;
              const lap = per === Infinity ? 0 : Math.floor(since / per);
              if (!c.struck.has(`${ch.id}:strike:${lap}`)) {
                c.struck.add(`${ch.id}:strike:${lap}`);
                performance.mark(`neon:strike:${ch.id}`);
              }
              const endsDark = s.pattern.segments.length > 0 && s.pattern.segments[s.pattern.segments.length - 1].to === 0;
              if (endsDark && since - lap * (per === Infinity ? 0 : per) >= len && !c.struck.has(`${ch.id}:out:${lap}`)) {
                c.struck.add(`${ch.id}:out:${lap}`);
                performance.mark(`neon:out:${ch.id}`);
              }
            }
          }
          const k = ch.peak * level;
          /* ⚠ `setValues`, not `.emissiveIntensity = k`: the compiler lint reads
             the channels (a prop, captured in an effect) as frozen, and a
             three.js material is external mutable state it cannot see into.
             A method call is how the emitter line below already writes. */
          ch.rim?.setValues({ emissiveIntensity: k });
          ch.emitter?.color.copy(ch.color).multiplyScalar(k);
          /* ⛔ THE ETCHED TEXT — a third depth on the same value (D-091, D-094).
             Additive, so it adds light and is independent of the frost's opacity
             (Architect F1). Not on NEON_LAYER: it glows, it does not bloom. */
          ch.textGlow?.color.copy(ch.textColor).multiplyScalar(k * ch.textDepth);
        }
        /* ⛔ CARD 1's PROMPT — on the same frame as CA's rim. Static → shown; a restart → the rim flickers ON with its
           ignition while the words flicker OFF with the same ignition REVERSED, the two exchanging (Carl, 14 October:
           *"pressing sees the rim flicker on and the large text flicker off before the text copy starts"*). */
        const pr = promptRef?.current;
        if (pr) {
          let pl = 0;
          if (c.state === "static") pl = 1;
          else if (c.state === "playing" && c.promptOut && m.kind === "ignite" && c.started) {
            const ca = schedulesRef.current.ca;
            const out = ca ? promptOutOf(ca) : null;
            const since = out ? now - c.start - out.atMs : Infinity;
            if (!out || since >= patternMs(out.pattern)) c.promptOut = false;
            else {
              pl = since < 0 ? 1 : neonLevel(out.pattern, since);
              changing = true;
            }
          }
          pr.setLevel(pl);
        }
      } catch (e) {
        failOnce("the track", e);
      }
    }

    /* ⛔ OFF SCREEN, NOTHING IS DRAWN (13 October 2026 — Carl: *"Yes, entering 4 could stop the process."*). With the
       whole canvas out of the window (the reader in §4) the room drew on regardless — ~2,300 draw calls a second, the
       glass's transmission pass (`blitFramebuffer` + `generateMipmap`) and the bloom on every frame — and the GPU was
       shared with §4's gold button, which hitched every ~0.37 s (`live-work/scripts/family-button-roll-smoothness.mjs`;
       with the room's GPU work dropped in a test browser, 0 late frames). So steps 2–5 are skipped while no part of the
       canvas is in the window (`canvasOnScreen`, the same test the buttons' frames use). Step 1 above still runs: the
       tracks keep their clock, the text keeps its own, so the first frame back is where they would have been. Scrolling
       back wakes the canvas (the journey's scroll tie, `DeskMark`). ⚠ The `neon:strike` / `neon:out` instrument marks
       still fire off screen (step 1); nothing measured from a RENDERED frame is taken off screen. This is step 1 of
       Carl's return rules (D-088, 13 October); what §2 does when the reader comes back is step 2 — ⚠ *corrected in
       place:* built 14 October (`S2_RETURN`). */
    if (!canvasOnScreen(r.domElement)) {
      /* ⛔ …BUT ITS SHADERS ARE STILL COMPILED (13 October 2026, the same day — Carl: *"yes, go ahead"*). Step 1 alone
         left a page opened straight at `#start` with a room that had NEVER rendered, so nothing was compiled, and the
         first scroll up into view compiled everything at once: a 1.6 s freeze (`start-button-layout-shift-probe.mjs`).
         So while off screen the scene is compiled WITHOUT DRAWING — `compileAsync`, which uses the browser's parallel
         shader compile and polls for readiness instead of blocking — whenever its object count changes (at load; again
         when the desk mark's geometry arrives from its worker). ⚠ It covers every material in the scene for the main
         camera's lights; the neon pass's variants, the shadow-map and the bloom's own shaders still compile on the first
         visible frame (a few, small). `room:precompiled` is marked when a pass completes (an instrument hook). */
      const pc = precompile.current;
      let n = 0;
      scene.traverse(() => {
        n++;
      });
      if (!pc.busy) {
        if (n !== pc.objects) {
          pc.objects = n;
          pc.busy = true;
          /* ⚠ THREE VARIANTS, not one — measured (`about-scrollup-freeze-profile.mjs`): with only the screen's variant
             compiled, 19 more programs (1.5 s of `getProgramInfoLog`) still compiled on the first visible frame. A
             material drawn into a RENDER TARGET is a different program (no tone mapping, linear output — three's
             `getParameters`): the glass's transmission pass and the neon pass both draw into one. So: (1) the screen;
             (2) a half-float target with the main camera's layers — the transmission pass's variant; (3) the same target
             with the camera on NEON_LAYER — the neon pass's own lights. `compile()` builds the programs synchronously
             (non-blocking under parallel compile), so the target and the mask are set around each call and restored. */
          const passes: Promise<unknown>[] = [r.compileAsync(scene, camera)];
          const b = bloomRef.current;
          if (b) {
            const prevTarget = r.getRenderTarget();
            const prevMask = camera.layers.mask;
            try {
              r.setRenderTarget(b.neonTarget);
              passes.push(r.compileAsync(scene, camera));
              camera.layers.set(NEON_LAYER);
              passes.push(r.compileAsync(scene, camera));
            } finally {
              camera.layers.mask = prevMask;
              r.setRenderTarget(prevTarget);
            }
          }
          Promise.all(passes)
            .then(() => performance.mark("room:precompiled"))
            .catch(() => {})
            .finally(() => {
              pc.busy = false;
              // a frame, so the hidden full render below can follow on a page that is otherwise sitting still
              invalidate();
            });
        }
      }
      /* ⛔ ONE HIDDEN FULL RENDER — Carl's option A (13 October 2026: *"lets go with option A - proceed"*). Nine shaders
         cannot be precompiled (the clipping-plane count three sets only during a real render — the wall text's
         reveal/erase, the mark's wipe — the shadow map's, the bloom's): measured, they froze the first scroll up for
         0.98 s. So once the desk mark is in the scene and the precompile of the current scene has finished, the frame
         falls through and draws ONCE, off screen, and the room is marked warm (`lib/room-warm.ts`); §4's gold button
         waits on its still for that (`whoweare-button.tsx`, `MEMBERS.start.waitForRoom`), so the block lands before
         its roll. After that, off screen draws nothing again. */
      const warmNow = !isRoomWarm() && deskMarkBuilt() && !pc.busy && n === pc.objects;
      if (!warmNow) {
        if (changing) state.invalidate();
        return;
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

    /* The room has drawn a full frame with the desk mark in it — on screen (a reader arriving from §1) or the hidden one
       above (a page opened at `#start`): every shader it uses is compiled. */
    if (!isRoomWarm() && deskMarkBuilt()) markRoomWarm();

    // 6. Keep ticking only while a track moves; then back to `frameloop="demand"`.
    if (changing) state.invalidate();
  }, 1);

  return null;
}
