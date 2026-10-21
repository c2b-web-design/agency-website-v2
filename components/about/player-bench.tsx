"use client";

/**
 * ⛔ THE VIEWER BENCH — `/about` §3's video viewer, designed by the Builder (21 October 2026). Carl: *"its not my design-
 * its yours. If you want to hedge your bets and design, say 3, and i will choose from, thats ok. Should you want to use the
 * Logo- your choice. The goal, to show the user this is a video viewer, not simply a 16:9 box. This works, this has
 * functionality."* Inside the viewer is the digital world, the Builder's to create (D-088, 3 October): created, not
 * pitched. ⛔ The one rule: no bouncing logos.
 *
 * ONE VIEWER, THREE TAKES. The machine is the same in all three and it WORKS — play, pause, scrub, chapters, captions,
 * mute, fullscreen, the keyboard (Space/K, ←/→ 5 s, C, M, F, Esc) — and the four boxes drive it exactly as they will on
 * the page (hover = preview, click = play). What differs is how the viewer presents itself AT REST, before a film is
 * chosen — the showroom screen (`live-work/about-section-thinking.md`, 30 August / 1 September; D-088 3 October):
 *   1. THE TEST CARD — the display proves itself: our palette as colour bars, a grey ramp and step wedge, gratings drawn
 *      to the device pixel, safe-area marks, the mark in the circle and a running timecode; a transport rail BELOW the
 *      screen, like the viewer in the edit suite the films are cut in.
 *   2. THE MARK IS THE TIMELINE — the viewer demonstrates itself: a light runs the mark's own outline as a playhead, the
 *      four films as four quarters of the outline and four segments of the scrubber, the caption naming each in turn;
 *      hovering a box scrubs the light to that film.
 *   3. THE IDENT — the platinum blue mark that fell into the player stays, lit by the logo's own studio
 *      (`player-ident.tsx`), with a broadcaster's lower third and clock; the controls rise on hover.
 *
 * ⚠ FILM 01 HERE IS A STAND-IN: 52 s cut from its selects (`public/proto-local/`, local only and never tracked — on any
 * other machine the viewer says so), captioned from the subtitle draft (Carl edits; nothing final). Films 2–4 do not
 * exist yet and the viewer says what state each is in. ⚠ A BENCH — nothing here is on `/about` until Carl chooses.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Container from "@/components/layout/container";
import { LOGO_ASPECT, LOGO_OUTLINE } from "./logo-mark-outline";
import type { DeskMarkReadout } from "./about-card-canvas";
import { pageZoom } from "@/lib/site-scale";
import { canvasOnScreen } from "@/lib/canvas-on-screen";

const PlayerIdent = dynamic(() => import("./player-ident"), { ssr: false });
const MarkMetal = dynamic(() => import("./player-ident").then((m) => m.MarkMetal), { ssr: false });

export type PlayerTake = 1 | 2 | 3 | 4;

/** What take 4's timeline tells the metal each frame: how much metal is left (0–1), and a way to ask for a frame; the
 *  metal reports once it has drawn (its geometry built), so the arrival waits for it. */
export type MetalDrive = { m: number; kick?: () => void; ready?: boolean };
/** ⛔ The mark's place in the screen — ONE number for both drawings (the 2D outline here, the 3D metal in
 *  `player-ident.tsx`), so they coincide: its width a fraction of the screen's, its middle (mark y = 0.5) this far down. */
export const MARK_IN_SCREEN = { width: 0.46, middle: 0.44 } as const;
/** The mark in the screen, LAYOUT px: its height (one mark unit), its middle, and the screen it was measured in. */
export type MarkPlace = {
  s: number; cx: number; cy: number; w: number; h: number;
  /** the mark's orientation in the camera's frame (the room's, during the drop and the landing); absent = face-on */
  q?: [number, number, number, number];
  /** the room's studio in the camera's frame, and how much of it to use (1 = all) — so the crossing is lit alike */
  env?: [number, number, number, number] | null;
  envMix?: number;
};

// the site's own colours (D-023's ice and platinum, the button family, §2's room orange)
const ICE = "#CFE6FF";
const PLAT = "#3F6DB8";
const PLAT_LIGHT = "#5F88C8";
const GOLD = "#a17b43";
const TEAL = "#1FB2C4";
const ORANGE = "#ff6528";
const INK = "#1E1E24";

type Cue = { from: number; to: number; text: string };
type Film = { n: string; name: string; src?: string; chapters: { at: number; label: string }[]; cues: Cue[]; status: string };

/** ⚠ The captions are the subtitle draft's lines (`Videos\C2B Films\01 Who we are button\07 Subtitles`), timed to the
 *  stand-in — Carl edits the real ones. */
const FILMS: readonly Film[] = [
  {
    n: "01",
    name: "The Who we are button",
    src: "/proto-local/film01-standin.mp4",
    chapters: [
      { at: 0, label: "Where we started" },
      { at: 5, label: "The shape" },
      { at: 17, label: "The material" },
      { at: 29, label: "The light" },
      { at: 41, label: "On the site" },
    ],
    cues: [
      { from: 0.3, to: 2.6, text: "This is the button at the bottom of our home page." },
      { from: 2.6, to: 5.0, text: "It was a placeholder. Plain white." },
      { from: 5.2, to: 8.6, text: "First, the shape alone. No colour, no metal. Just clay." },
      { from: 8.6, to: 11.8, text: "Clay hides nothing. Metal flatters. Clay tells the truth." },
      { from: 11.8, to: 16.8, text: "We copied Next step's shape, then proved the copy matched. To the vertex." },
      { from: 17.2, to: 20.8, text: "Now the metal. A metal shows what it reflects." },
      { from: 20.8, to: 24.6, text: "So we built it a room to reflect. A studio, made of light." },
      { from: 24.6, to: 28.8, text: "The teal went deeper, and the words went ice blue." },
      { from: 29.2, to: 32.8, text: "A soft global light gives it form." },
      { from: 32.8, to: 36.8, text: "One slow moving light brings it to life." },
      { from: 36.8, to: 40.8, text: "It eases off as it passes over the words." },
      { from: 41.2, to: 44.8, text: "Then the real thing. The button went onto our home page." },
      { from: 44.8, to: 48.4, text: "It is still a real link. Screen readers still hear its words." },
      { from: 48.4, to: 51.8, text: "This is where it started. And this is what it became." },
    ],
    status: "",
  },
  { n: "02", name: "The ornate corners", chapters: [], cues: [], status: "Filmed on the bench. In the edit." },
  { n: "03", name: "The hero", chapters: [], cues: [], status: "It will be filmed as the hero is built." },
  { n: "04", name: "Extruded lettering", chapters: [], cues: [], status: "Not built yet." },
];

type Mode = { kind: "rest" } | { kind: "film"; i: number } | { kind: "soon"; i: number; note?: string };

// ── the mark's outline, as a path with its arc length (mark units: height 1, y up, origin bottom-centre) ─────────────
const MARK = (() => {
  const n = LOGO_OUTLINE.length / 2;
  // start the light at the c's leftmost point, so a lap reads left to right as the word does
  let s = 0;
  for (let i = 1; i < n; i++) if (LOGO_OUTLINE[2 * i] < LOGO_OUTLINE[2 * s]) s = i;
  const xs = new Float64Array(n + 1);
  const ys = new Float64Array(n + 1);
  const cum = new Float64Array(n + 1);
  for (let k = 0; k <= n; k++) {
    const i = (s + k) % n;
    xs[k] = LOGO_OUTLINE[2 * i];
    ys[k] = LOGO_OUTLINE[2 * i + 1];
    if (k) cum[k] = cum[k - 1] + Math.hypot(xs[k] - xs[k - 1], ys[k] - ys[k - 1]);
  }
  return { xs, ys, cum, n, length: cum[n] };
})();
let markPath: Path2D | null = null;
function markPath2D(): Path2D {
  if (!markPath) {
    markPath = new Path2D();
    markPath.moveTo(MARK.xs[0], MARK.ys[0]);
    for (let k = 1; k < MARK.n; k++) markPath.lineTo(MARK.xs[k], MARK.ys[k]);
    markPath.closePath();
  }
  return markPath;
}
/** the largest k with cum[k] ≤ L */
function indexAt(L: number): number {
  let lo = 0;
  let hi = MARK.n - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (MARK.cum[mid] <= L) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}
function pointAt(L: number): [number, number] {
  const k = indexAt(Math.min(Math.max(L, 0), MARK.length));
  const seg = MARK.cum[k + 1] - MARK.cum[k] || 1;
  const t = Math.min(1, (L - MARK.cum[k]) / seg);
  return [MARK.xs[k] + (MARK.xs[k + 1] - MARK.xs[k]) * t, MARK.ys[k] + (MARK.ys[k + 1] - MARK.ys[k]) * t];
}
/** the outline from length a to b, in screen space */
function tracePart(g: CanvasRenderingContext2D, a: number, b: number, X: (x: number) => number, Y: (y: number) => number) {
  if (b <= a) return;
  const [x0, y0] = pointAt(a);
  g.moveTo(X(x0), Y(y0));
  for (let k = indexAt(a) + 1; k < MARK.n && MARK.cum[k] < b; k++) g.lineTo(X(MARK.xs[k]), Y(MARK.ys[k]));
  const [x1, y1] = pointAt(b);
  g.lineTo(X(x1), Y(y1));
}

// ── a 2D canvas sized to its box in DEVICE pixels under the site's zoom (D-097) ─────────────────────────────────────
type Draw = (g: CanvasRenderingContext2D, w: number, h: number, k: number, now: number) => void;
function useCanvas2D(draw: Draw, animate: boolean) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });
  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let k = 1;
    let live = true;
    const paint = (now: number) => {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      g.setTransform(k, 0, 0, k, 0, 0);
      drawRef.current(g, w, h, k, now);
    };
    const size = () => {
      if (!live) return;
      k = (window.devicePixelRatio || 1) * pageZoom();
      w = cv.offsetWidth;
      h = cv.offsetHeight;
      cv.width = Math.max(1, Math.round(w * k));
      cv.height = Math.max(1, Math.round(h * k));
      paint(performance.now());
    };
    const loop = (now: number) => {
      if (!live) return;
      if (canvasOnScreen(cv)) paint(now);
      raf = requestAnimationFrame(loop);
    };
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    size();
    void document.fonts.ready.then(size);
    if (animate) raf = requestAnimationFrame(loop);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [animate]);
  return ref;
}

function monoFamily(): string {
  return getComputedStyle(document.body).getPropertyValue("--font-geist-mono").trim() || "monospace";
}
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ── TAKE 1 — THE TEST CARD ────────────────────────────────────────────────────────────────────────────────────────────
const drawTestCard: Draw = (g, w, h, k) => {
  const top = h * 0.1;
  const bot = h * 0.86;
  g.fillStyle = "#0b0d12";
  g.fillRect(0, 0, w, h);
  // the grid, on device pixels
  g.fillStyle = "rgba(207,230,255,0.055)";
  for (let i = 1; i < 16; i++) g.fillRect(Math.round((i * w * k) / 16) / k, top, 1 / k, bot - top);
  for (let j = 1; j < 8; j++) g.fillRect(0, Math.round((top + ((bot - top) * j) / 8) * k) / k, w, 1 / k);
  // our palette as colour bars
  const bars = [ICE, PLAT_LIGHT, PLAT, TEAL, GOLD, ORANGE, INK];
  bars.forEach((c, i) => {
    g.fillStyle = c;
    const x0 = Math.round(((i * w) / bars.length) * k) / k;
    const x1 = Math.round((((i + 1) * w) / bars.length) * k) / k;
    g.fillRect(x0, 0, x1 - x0, top);
  });
  // the gratings — lines 1, 2, 3 and 4 DEVICE pixels wide, left and right: the panel's resolution, shown
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "rgba(207,230,255,0.6)";
  const bw = Math.round(w * 0.055 * k);
  const bh = Math.round(((bot - top) * 0.2) * k);
  const gap = Math.round(((bot - top) * 0.05) * k);
  for (const side of [0, 1]) {
    const x0 = side === 0 ? Math.round(w * 0.035 * k) : Math.round(w * (1 - 0.035) * k) - bw;
    for (let b = 0; b < 4; b++) {
      const y0 = Math.round(top * k) + gap + b * (bh + gap);
      const period = b + 1;
      for (let x = 0; x < bw; x++) if (Math.floor(x / period) % 2 === 0) g.fillRect(x0 + x, y0, 1, bh);
    }
  }
  g.setTransform(k, 0, 0, k, 0, 0);
  // the circle and its crosshair
  const cx = w / 2;
  const cy = (top + bot) / 2;
  const r = (bot - top) * 0.45;
  g.fillStyle = "#0d1119";
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = "rgba(207,230,255,0.07)";
  g.fillRect(cx - r, Math.round(cy * k) / k, 2 * r, 1 / k);
  g.fillRect(Math.round(cx * k) / k, cy - r, 1 / k, 2 * r);
  g.restore();
  g.strokeStyle = "rgba(207,230,255,0.38)";
  g.lineWidth = 1 / k;
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();
  // the mark, filled platinum to ice
  const s = r * 0.6;
  g.save();
  g.translate(cx, cy - r * 0.1);
  g.scale(s, -s);
  g.translate(0, -0.5);
  const grad = g.createLinearGradient(0, 1, 0, 0);
  grad.addColorStop(0, ICE);
  grad.addColorStop(0.55, PLAT_LIGHT);
  grad.addColorStop(1, PLAT);
  g.fillStyle = grad;
  g.fill(markPath2D());
  g.lineWidth = 0.8 / s; // 0.8 layout px, in the mark's scaled units
  g.strokeStyle = "rgba(207,230,255,0.55)";
  g.stroke(markPath2D());
  g.restore();
  // the ramp and the step wedge
  const rx0 = w * 0.12;
  const rx1 = w * 0.88;
  const ramp = g.createLinearGradient(rx0, 0, rx1, 0);
  ramp.addColorStop(0, "#000");
  ramp.addColorStop(1, "#fff");
  g.fillStyle = ramp;
  g.fillRect(rx0, bot + h * 0.012, rx1 - rx0, h * 0.05);
  for (let i = 0; i < 11; i++) {
    const v = Math.round((i / 10) * 255);
    g.fillStyle = `rgb(${v},${v},${v})`;
    const x0 = Math.round((rx0 + ((rx1 - rx0) * i) / 11) * k) / k;
    const x1 = Math.round((rx0 + ((rx1 - rx0) * (i + 1)) / 11) * k) / k;
    g.fillRect(x0, bot + h * 0.072, x1 - x0, h * 0.05);
  }
  // the safe areas
  g.strokeStyle = "rgba(207,230,255,0.13)";
  g.setLineDash([3, 3]);
  g.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
  g.setLineDash([]);
  // the labels
  g.fillStyle = "rgba(207,230,255,0.6)";
  g.font = `500 7px ${monoFamily()}`;
  g.textBaseline = "top";
  g.fillText("C2B", w * 0.135, top + 6);
  g.textAlign = "right";
  g.fillText("16:9   1920 × 1080", w * 0.865, top + 6);
  g.textAlign = "left";
};

function TestCard() {
  const ref = useCanvas2D(drawTestCard, false);
  const tc = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const f = Math.floor(((now - t0) / 1000) * 25);
      const p = (v: number) => String(v).padStart(2, "0");
      if (tc.current) tc.current.textContent = `${p(Math.floor(f / 90000) % 24)}:${p(Math.floor(f / 1500) % 60)}:${p(Math.floor(f / 25) % 60)}:${p(f % 25)}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="absolute inset-0">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <span
        ref={tc}
        className="absolute left-1/2 top-[64%] -translate-x-1/2 rounded-[2px] bg-black px-1.5 py-px font-mono text-[8px] tracking-wider text-[#CFE6FF] tabular-nums"
      >
        00:00:00:00
      </span>
    </div>
  );
}

// ── TAKE 2 — THE MARK IS THE TIMELINE ────────────────────────────────────────────────────────────────────────────────
const LAP_MS = 16000;
/** ⛔ THE LAP's END: the DRAIN (the blue catches the head and the line is all blue), then A BEAT, then the transition.
 *  Carl, 21 October 2026: *"Yes, it doesnt have to happen immeadiately. It needs to land, then a beat, then the
 *  transition."* — the drain 1800 → 1200 ms (its last ~half-second had been dead time), the beat 450 ms (a take).
 *  (Was 1400 ms, an empty hold — Carl: "that time before the transition could be put to good use".) */
const DRAIN_MS = 1200;
const BEAT_MS = 450;
const HOLD_MS = DRAIN_MS + BEAT_MS;
const FADE_MS = 900;
/** the trail's thick part, in outline lengths; and how far the drain pushes the gradient (past every stop = all blue) */
const TAIL_LEN = 0.08;
// ⛔ exactly the last stop: the line becomes all blue AT the drain's end, so the beat that follows is the only stillness
//   (0.4 overshot it — measured, the outline sat evenly blue for ~0.95 s, not a beat)
const DRAIN_REACH = 0.3;
/** ⛔ The line's colour by distance behind the head (outline lengths): white-hot → ice → the platinum's light blue →
 *  the platinum blue (D-088's #3F6DB8, the metal's own colour). Smoothstepped between stops — a gradient, no steps. */
const LINE_STOPS: readonly [number, readonly [number, number, number]][] = [
  [0, [235, 244, 255]],
  [0.03, [207, 230, 255]],
  [TAIL_LEN, [95, 136, 200]],
  [0.3, [63, 109, 184]],
];
function lineColour(d: number): [number, number, number] {
  if (d <= 0) return [...LINE_STOPS[0][1]];
  for (let i = 1; i < LINE_STOPS.length; i++) {
    const [d1, c1] = LINE_STOPS[i];
    if (d <= d1) {
      const [d0, c0] = LINE_STOPS[i - 1];
      const x = (d - d0) / (d1 - d0);
      const s = x * x * (3 - 2 * x);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * s)) as [number, number, number];
    }
  }
  return [...LINE_STOPS[LINE_STOPS.length - 1][1]];
}

/**
 * ⛔ v2 (21 October 2026) — Carl: *"I like the use of the logo with its outline and its tail There is no indication that
 * this is a video player until who we are is clicked. Unlike 1, the controls were already there. a user may need clear
 * direction on what to do."* So the whole transport is there AT REST — the light drives its scrubber — with a direction
 * line, and play (or a click on the screen) starts film 01.
 */
// ── TAKE 4 — THE MARK BECOMES THE PLAYER (takes 2 and 3 combined; Carl, 21 October 2026: *"My initial thought after seeing
//    3 good ideas was to combine some elements to make it one great idea… Proceed in developing your concept further."*)
//    The metal mark rests in the screen as it lands → the light leaves the metal as its outline rises → the outline is the
//    timeline for one lap of the four films → the lit outline re-forms as metal for a breath → and again. ⚠ All takes.
const ARRIVE_MS = 2600;
const RECEDE_MS = 1800;
const REFORM_MS = 1600;
const METAL_HOLD_MS = 2200;
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
/** ⛔ THE LANDING (Carl, 21 October 2026: *"it could hit its position, bounce slightly and become face on"*): its length and
 *  the rebound's height (a share of the mark's height). ⚠ Takes. */
const LAND_MS = 900;
const LAND_BOUNCE = 0.045;
type Arrival = "empty" | "enter" | "land" | "cycle";
/** A quaternion turned toward face-on (the identity) by t — plain maths, so takes 1 and 2 never load three.js. */
function slerpToFaceOn(q: readonly [number, number, number, number], t: number): [number, number, number, number] {
  let [x, y, z, w] = q;
  if (w < 0) [x, y, z, w] = [-x, -y, -z, -w]; // the short way round
  const th = Math.acos(Math.min(1, w));
  if (th < 1e-5) return [0, 0, 0, 1];
  const a = Math.sin((1 - t) * th) / Math.sin(th);
  const b = Math.sin(t * th) / Math.sin(th);
  return [x * a, y * a, z * a, w * a + b];
}

function MarkTimeline({ preview, t, choose, metal, active = true }: { preview: number | null; t: Transport; choose: (i: number) => void; metal?: boolean; active?: boolean }) {
  const previewRef = useRef(preview);
  useEffect(() => {
    previewRef.current = preview;
  });
  const drive = useRef<MetalDrive>({ m: 1 });
  // ⛔ the mark's place in LAYOUT px within the screen: from `#examples-player-target` when there is one (the page — the
  //   drop's own target), else `MARK_IN_SCREEN` (the bench). Shared with the metal through `metalPlace`.
  const place = useRef<MarkPlace>({ s: 0, cx: 0, cy: 0, w: 0, h: 0 });
  const metalPlace = useCallback(() => place.current, []);
  const root = useRef<HTMLDivElement>(null);
  // ⛔ the metal's canvas is MOUNTED ONCE, ON APPROACH (a window ahead), never unmounted (the note's Decision 4)
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el || !metal) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: "100% 0px 100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [metal]);
  const reducedMq = useRef<MediaQueryList | null>(null);
  const metalLevel = useCallback(() => drive.current.m, []);
  const metalKick = useCallback((kick: () => void) => {
    drive.current.kick = kick;
  }, []);
  const metalReady = useCallback(() => {
    drive.current.ready = true;
  }, []);
  const fill = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [seg, setSeg] = useState(0);
  const state = useRef({ t0: 0, seg: 0, held: null as number | null, m: 1, lastM: 1, last: 0, phase: "empty" as Arrival, landAt: 0, seenAt: 0, from: null as MarkPlace | null, landed: false });
  const ref = useCanvas2D((g, w, h, k, now) => {
    const st = state.current;
    const dt = st.last ? now - st.last : 16;
    st.last = now;
    // where the mark sits (the page's target box, or the bench's constants)
    const box = root.current; // `inset-0` — the canvas's own box
    const tgt = box?.closest("[id=examples-player]")?.querySelector<HTMLElement>("#examples-player-target");
    if (tgt && box) {
      const z = pageZoom();
      const c = box.getBoundingClientRect();
      const r = tgt.getBoundingClientRect();
      // the drop grows the mark to the PNG's INK height (494 of its 503 rows) — the same here
      place.current = { s: (r.height / z) * (494 / 503), cx: (r.left + r.width / 2 - c.left) / z, cy: (r.top + r.height / 2 - c.top) / z, w, h };
    } else {
      place.current = { s: (w * MARK_IN_SCREEN.width) / LOGO_ASPECT, cx: w / 2, cy: h * MARK_IN_SCREEN.middle, w, h };
    }
    // ⛔ take 4 starts its cycle only once the metal exists AND the viewer is in view (most of it in the window) — on the
    //   page that is the reader arriving in §3, where the desk mark lands and latches (the note's Decision 3, its
    //   fallback route: the room's latch event is a follow-up in `about-card-canvas.tsx`, outside this build's files)
    const vr = root.current?.getBoundingClientRect();
    const seen = !!vr && vr.top >= -vr.height * 0.25 && vr.bottom <= window.innerHeight + vr.height * 0.25;
    // ⛔⛔ THE SAME LOGO (Carl, 21 October 2026: *"When the logo drops in, then it must start… Have the logo while in the
    //   player follow the trajectory and hit its position"*; *"it could hit its position, bounce slightly and become face
    //   on"*). On the page the viewer is EMPTY until the room's desk mark drops in; while it drops, the viewer draws THAT
    //   mark below the player's edge from the room's read-out (`window.__c2bDeskMark`, `about-card-canvas.tsx`) — its place,
    //   size, angle and light; when the room latches it LANDS (`LAND_MS`: a slight bounce, turning face-on), and only
    //   then does the cycle start. Without any read-out (the room cannot draw) the viewer, seen for 1.5 s, starts alone.
    const target = place.current;
    let arrival: Arrival = "cycle";
    if (metal && tgt && box) {
      const ro = (window as unknown as { __c2bDeskMark?: DeskMarkReadout }).__c2bDeskMark;
      if (st.phase !== "cycle") {
        if (ro?.latched) {
          if (st.phase !== "land") {
            st.phase = "land";
            st.landAt = now;
          }
        } else if (ro?.inDrop) st.phase = "enter";
        else if (st.phase !== "land") st.phase = "empty";
        if (!ro && seen) {
          st.seenAt ||= now;
          if (now - st.seenAt > 1500) {
            st.phase = "cycle";
            st.t0 = now;
          }
        } else st.seenAt = 0;
        if (ro && (st.phase === "enter" || (st.phase === "land" && !st.from))) {
          const z = pageZoom();
          const c = box.getBoundingClientRect();
          st.from = { s: ro.hPx / z, cx: (ro.cx - c.left) / z, cy: (ro.cy - c.top) / z, w, h, q: ro.q, env: ro.env, envMix: 1 };
        }
        if (st.phase === "land" && now - st.landAt >= LAND_MS) {
          st.phase = "cycle";
          st.t0 = now;
          st.landed = true;
        }
      }
      arrival = st.phase;
    } else if (metal && (!drive.current.ready || (!st.t0 && !seen))) st.t0 = 0;
    else if (!st.t0) st.t0 = now;
    reducedMq.current ??= window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = !!metal && reducedMq.current.matches;
    const pv = previewRef.current;
    let p = 0;
    let fade = 1; // the lit outline and the playhead
    let line = 1; // the outline's hair and its chapter marks
    let m = 0; // how much metal (take 4)
    let drain = 0; // the lap is done: the head's light drains into the blue (0 → 1 over the hold)
    if (arrival !== "cycle") {
      // empty → the room's mark entering → its landing (see above); a hover waits until the mark has landed
      if (arrival === "empty") {
        line = 0;
        fade = 0;
      } else {
        m = 1;
        line = 0;
        fade = 0;
        const from = st.from ?? target;
        if (arrival === "enter") place.current = from;
        else {
          const u = Math.min(1, (now - st.landAt) / LAND_MS);
          const e = 1 - (1 - u) ** 3;
          // the hit: one slight rebound (up, then settled), turning face-on as it settles
          const lift = (u < 0.62 ? LAND_BOUNCE * Math.sin((Math.PI * u) / 0.62) : LAND_BOUNCE * 0.22 * Math.sin((Math.PI * (u - 0.62)) / 0.38)) * target.s;
          const q0 = slerpToFaceOn(from.q ?? [0, 0, 0, 1], e);
          place.current = {
            ...target,
            s: from.s + (target.s - from.s) * e,
            cx: from.cx + (target.cx - from.cx) * e,
            cy: from.cy + (target.cy - from.cy) * e - lift,
            q: q0,
            env: from.env,
            envMix: 1,
          };
        }
      }
      st.m = m;
    } else if (pv !== null) {
      // a box is hovered: the light goes to that film's quarter and waits there (take 4: the metal gives way)
      p = (pv + 1) / 4;
      st.held = p;
      if (metal) {
        st.m = Math.max(0, st.m - dt / 350);
        m = st.m;
        line = 1 - m;
      }
    } else {
      if (st.held !== null) {
        // resume from where the preview left it
        st.t0 = now - (metal ? ARRIVE_MS + RECEDE_MS : 0) - st.held * LAP_MS;
        st.held = null;
      }
      if (!metal) {
        const e = (now - st.t0) % (LAP_MS + HOLD_MS + FADE_MS);
        p = Math.min(1, e / LAP_MS);
        if (e > LAP_MS) drain = smoother(Math.min(1, (e - LAP_MS) / DRAIN_MS));
        if (e > LAP_MS + HOLD_MS) fade = 1 - (e - LAP_MS - HOLD_MS) / FADE_MS;
      } else if (reduced || !st.t0 || now - st.t0 < ARRIVE_MS) {
        // at rest (and, under reduced motion, always: the animation goes, the state stays — D-063); landed from the room,
        // its light eases from the room's studio to the viewer's own over the rest
        m = 1;
        line = 0;
        fade = 0;
        if (st.landed && st.from && st.t0) place.current = { ...target, env: st.from.env, envMix: 1 - smoother(Math.min(1, (now - st.t0) / ARRIVE_MS)) };
      } else {
        const u = (now - st.t0 - ARRIVE_MS) % (RECEDE_MS + LAP_MS + HOLD_MS + REFORM_MS + METAL_HOLD_MS);
        if (u < RECEDE_MS) {
          const a = smoother(u / RECEDE_MS);
          m = 1 - a;
          line = a;
          fade = a; // the scrubber's playhead rises with the outline
        } else if (u < RECEDE_MS + LAP_MS) {
          p = (u - RECEDE_MS) / LAP_MS;
        } else if (u < RECEDE_MS + LAP_MS + HOLD_MS) {
          p = 1;
          drain = smoother(Math.min(1, (u - RECEDE_MS - LAP_MS) / DRAIN_MS));
        } else if (u < RECEDE_MS + LAP_MS + HOLD_MS + REFORM_MS) {
          const a = smoother((u - RECEDE_MS - LAP_MS - HOLD_MS) / REFORM_MS);
          p = 1;
          drain = 1;
          m = a;
          line = 1 - a;
          fade = 1 - a;
        } else {
          m = 1;
          line = 0;
          fade = 0;
        }
      }
      if (metal) st.m = m;
    }
    if (metal) {
      drive.current.m = m;
      if (m > 0 || st.lastM > 0) drive.current.kick?.();
      st.lastM = m;
    } else {
      // the field (take 4's is CSS, under the metal)
      const bg = g.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.62);
      bg.addColorStop(0, "#0d121b");
      bg.addColorStop(1, "#05070a");
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
    }
    const { s, cx, cy } = place.current;
    const X = (x: number) => cx + x * s;
    const Y = (y: number) => cy - (y - 0.5) * s;
    const L = MARK.length;
    // the whole outline, a hair
    g.lineJoin = "round";
    g.lineCap = "round";
    // (take 4: as the metal recedes the outline rises IN ITS SILHOUETTE — brighter while it is the only thing there)
    // the metal's edge BECOMES the line: it glows through the hand-over, then settles to the hair
    g.strokeStyle = `rgba(207,230,255,${metal ? 0.11 * line + 0.4 * Math.sin(Math.PI * line) : 0.11})`;
    g.lineWidth = 1;
    g.beginPath();
    tracePart(g, 0, L, X, Y);
    g.stroke();
    // ⛔ NO CHAPTER MARKS ON THE OUTLINE (Carl, 21 October 2026: "Go with 1"). Dots at ¼, ½, ¾ of its length read as
    //   random specks — equal lengths land on nothing in the mark; the scrubber's four segments carry the films.
    // ⛔ THE PLAYHEAD AND WHAT HAS PLAYED — ONE LINE, ONE GRADIENT (Carl, 21 October 2026: *"The glowing head is great,
    //   as is the thicker trail behind it that becomes thinner… Where the outline becomes thinner, i would make that
    //   blue. Its trailing the head and that time before the transition could be put to good use. i would also make the
    //   outline colour difference a gradient. Much smoother and literally cooler looking."*). White-hot at the head →
    //   ice through the thick tail → the platinum's light blue where it thins → the platinum blue behind (`lineColour`).
    //   ⛔ THE HOLD IS USED: when the lap is done the head's light DRAINS down the line (`drain`) until the whole outline
    //   is one platinum blue — the colour the metal re-forms in (take 4), so the blue line BECOMES the blue metal.
    const pL = p * L;
    if (fade > 0 && pL > 0) {
      g.save();
      g.lineCap = "butt"; // the line is drawn in short pieces: round caps would overlap into beads
      const ds = L / 280;
      for (let a = 0; a < pL; a += ds) {
        const b = Math.min(pL, a + ds);
        const d0 = (pL - b) / L; // distance behind the head, in outline lengths
        const d = d0 + drain * DRAIN_REACH; // the colour, pushed by the drain
        // 1 at the head → 0 where the trail thins; ⛔ the drain THINS it across its whole length (tied to the colour's
        // shift, the trail was gone in under half a second and the rest of the drain read as dead time — measured)
        const near = Math.max(0, 1 - d0 / TAIL_LEN) * (1 - drain);
        const [r, gr, bl] = lineColour(d);
        g.strokeStyle = `rgba(${r},${gr},${bl},${(0.88 + 0.12 * near) * fade})`;
        g.lineWidth = 1.3 + 1.15 * near ** 1.2;
        g.shadowColor = PLAT_LIGHT;
        g.shadowBlur = near > 0 ? 7 * k * near : 0;
        g.beginPath();
        tracePart(g, a, b, X, Y);
        g.stroke();
      }
      const glowA = fade * (1 - drain);
      if (glowA > 0) {
        g.globalCompositeOperation = "lighter";
        const [hx, hy] = pointAt(pL);
        const glow = g.createRadialGradient(X(hx), Y(hy), 0, X(hx), Y(hy), 7);
        glow.addColorStop(0, `rgba(235,244,255,${glowA})`);
        glow.addColorStop(1, "rgba(95,136,200,0)");
        g.fillStyle = glow;
        g.beginPath();
        g.arc(X(hx), Y(hy), 7, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    // the scrubber below follows the same number
    if (fill.current) fill.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    if (head.current) {
      head.current.style.left = `${p * 100}%`;
      head.current.style.opacity = String(fade * (1 - drain));
    }
    const now4 = Math.min(3, Math.floor(p * 4 - 1e-9));
    if (now4 !== st.seg) {
      st.seg = now4;
      setSeg(Math.max(0, now4));
    }
  }, active);
  const film = FILMS[Math.max(0, seg)];
  // ⛔ play — or a click on the screen — starts the film the light is on (the caption names it)
  const playNamed = () => choose(Math.max(0, seg));
  return (
    <div
      ref={root}
      className="absolute inset-0"
      onClick={(e) => {
        e.stopPropagation();
        playNamed();
      }}
    >
      {metal && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_44%,#0f1520_0%,#05070a_72%)]" />
          <div className="absolute inset-0">
            {near && <MarkMetal level={metalLevel} place={metalPlace} onKick={metalKick} onReady={metalReady} />}
          </div>
        </>
      )}
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <p className="pointer-events-none absolute left-3 top-2.5 text-[10px] text-[#CFE6FF]/65">Four films. Choose one, or press play.</p>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pb-1.5 pt-8" onClick={(e) => e.stopPropagation()}>
        <p className="pointer-events-none mb-1 pl-1 text-[11px] text-[#CFE6FF]">
          <span className="mr-2 font-mono text-[#5F88C8]">{film.n}</span>
          {film.name}
        </p>
        <div className="flex w-full items-center gap-2">
          <Btn label={`Play ${film.name}`} onClick={playNamed}>
            <Icon title="Play" d={PLAY} />
          </Btn>
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#CFE6FF]/80">-:-- / -:--</span>
          <div className="relative h-4 flex-1">
            <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2">
              <div className="absolute inset-0 flex gap-[3px]">
                {FILMS.map((f) => (
                  <div key={f.n} className="h-full flex-1 rounded-full bg-[#CFE6FF]/15" />
                ))}
              </div>
              <div ref={fill} className="absolute inset-0 flex gap-[3px]" style={{ clipPath: "inset(0 100% 0 0)" }}>
                {FILMS.map((f) => (
                  <div key={f.n} className="h-full flex-1 rounded-full bg-[#CFE6FF]" />
                ))}
              </div>
              <div ref={head} className="absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#CFE6FF] shadow-[0_0_8px_#5F88C8]" />
            </div>
          </div>
          <Btn label="Captions" on={t.cc} onClick={() => t.setCc(!t.cc)}>
            {CC_ICON}
          </Btn>
          <Btn label={t.muted ? "Unmute" : "Mute"} onClick={() => t.setMuted(!t.muted)}>
            <Icon title={t.muted ? "Unmute" : "Mute"} d={t.muted ? MUTED : SOUND} />
          </Btn>
          <Btn label="Full screen" onClick={t.full}>
            <Icon title="Full screen" d={FULL} />
          </Btn>
        </div>
      </div>
    </div>
  );
}
// ── the transport (shared): play, time, scrubber with chapters, captions, mute, fullscreen ─────────────────────────────
function Icon({ d, title }: { d: ReactNode; title: string }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <title>{title}</title>
      {d}
    </svg>
  );
}
const PLAY = <path d="M5 3.5v9l7-4.5z" fill="currentColor" stroke="none" />;
const PAUSE = (
  <>
    <rect x="4" y="3.5" width="2.6" height="9" rx="0.6" fill="currentColor" stroke="none" />
    <rect x="9.4" y="3.5" width="2.6" height="9" rx="0.6" fill="currentColor" stroke="none" />
  </>
);
const SOUND = (
  <>
    <path d="M3 6.2h2.2L8.5 3.5v9L5.2 9.8H3z" fill="currentColor" stroke="none" />
    <path d="M10.6 5.6a3.2 3.2 0 0 1 0 4.8M12.3 4a5.5 5.5 0 0 1 0 8" />
  </>
);
const MUTED = (
  <>
    <path d="M3 6.2h2.2L8.5 3.5v9L5.2 9.8H3z" fill="currentColor" stroke="none" />
    <path d="M10.5 6l3.5 4M14 6l-3.5 4" />
  </>
);
const FULL = <path d="M2.8 6V2.8H6M10 2.8h3.2V6M13.2 10v3.2H10M6 13.2H2.8V10" />;
const CC_ICON = (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <text x="8" y="10.4" textAnchor="middle" fontSize="5.6" fontWeight="700" fill="currentColor" fontFamily="inherit">CC</text>
  </svg>
);

function Scrubber({ time, dur, chapters, onSeek }: { time: number; dur: number; chapters: Film["chapters"]; onSeek: (t: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const frac = dur ? Math.min(1, time / dur) : 0;
  const at = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };
  // chapters as segments of the track
  const bounds = dur ? [...chapters.map((c) => c.at / dur), 1] : [0, 1];
  const chapterAt = (f: number) => [...chapters].reverse().find((c) => c.at <= f * dur)?.label ?? "";
  return (
    <div
      ref={track}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(dur)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${clock(time)} of ${clock(dur)}`}
      className="group relative h-4 flex-1 cursor-pointer"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onSeek(at(e.clientX) * dur);
      }}
      onPointerMove={(e) => {
        setHover(at(e.clientX));
        if (e.buttons & 1) onSeek(at(e.clientX) * dur);
      }}
      onPointerLeave={() => setHover(null)}
    >
      <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 transition-[height] group-hover:h-[5px]">
        {bounds.slice(0, -1).map((b0, i) => {
          const b1 = bounds[i + 1];
          const lit = Math.min(1, Math.max(0, (frac - b0) / (b1 - b0 || 1)));
          return (
            <div
              key={i}
              className="absolute inset-y-0 overflow-hidden rounded-full bg-[#CFE6FF]/18"
              style={{ left: `calc(${b0 * 100}% + ${i ? 1.5 : 0}px)`, width: `calc(${(b1 - b0) * 100}% - ${i ? 1.5 : 0}px - ${i < bounds.length - 2 ? 1.5 : 0}px)` }}
            >
              <div className="h-full bg-[#CFE6FF]" style={{ width: `${lit * 100}%` }} />
            </div>
          );
        })}
      </div>
      <div className="absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#CFE6FF] shadow-[0_0_8px_#5F88C8]" style={{ left: `${frac * 100}%` }} />
      {hover !== null && dur > 0 && (
        <div className="pointer-events-none absolute bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-black/85 px-1.5 py-0.5 text-[10px] text-[#CFE6FF]" style={{ left: `${hover * 100}%` }}>
          <span className="mr-1.5 font-mono tabular-nums text-[#5F88C8]">{clock(hover * dur)}</span>
          {chapterAt(hover)}
        </div>
      )}
    </div>
  );
}

function Btn({ label, onClick, children, on }: { label: string; onClick: () => void; children: ReactNode; on?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-[3px] transition-colors hover:bg-[#CFE6FF]/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#5F88C8] ${on === false ? "text-[#CFE6FF]/45" : "text-[#CFE6FF]"}`}
    >
      {children}
    </button>
  );
}

type Transport = {
  film: Film | null;
  playing: boolean;
  time: number;
  dur: number;
  cc: boolean;
  muted: boolean;
  toggle: () => void;
  seek: (t: number) => void;
  setCc: (v: boolean) => void;
  setMuted: (v: boolean) => void;
  full: () => void;
};
function TransportBar({ t }: { t: Transport }) {
  return (
    <div className="flex w-full items-center gap-2">
      <Btn label={t.playing ? "Pause" : "Play"} onClick={t.toggle}>
        <Icon title={t.playing ? "Pause" : "Play"} d={t.playing ? PAUSE : PLAY} />
      </Btn>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-[#CFE6FF]/80">
        {t.film ? `${clock(t.time)} / ${clock(t.dur)}` : "-:-- / -:--"}
      </span>
      {t.film ? (
        <Scrubber time={t.time} dur={t.dur} chapters={t.film.chapters} onSeek={t.seek} />
      ) : (
        <div className="relative h-4 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#CFE6FF]/12" />
        </div>
      )}
      <Btn label="Captions" on={t.cc} onClick={() => t.setCc(!t.cc)}>
        {CC_ICON}
      </Btn>
      <Btn label={t.muted ? "Unmute" : "Mute"} onClick={() => t.setMuted(!t.muted)}>
        <Icon title={t.muted ? "Unmute" : "Mute"} d={t.muted ? MUTED : SOUND} />
      </Btn>
      <Btn label="Full screen" onClick={t.full}>
        <Icon title="Full screen" d={FULL} />
      </Btn>
    </div>
  );
}

// ── the viewer ───────────────────────────────────────────────────────────────────────────────────────────────────────
function Viewer({ take, mode, preview, choose, rest, onPage }: { take: PlayerTake; mode: Mode; preview: number | null; choose: (i: number) => void; rest: () => void; onPage?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [cc, setCc] = useState(true);
  const [muted, setMuted] = useState(false);
  const [awake, setAwake] = useState(false);
  const sleep = useRef(0);
  const film = mode.kind === "film" ? FILMS[mode.i] : null;
  const soon = mode.kind === "soon" ? mode : null;

  // a chosen film plays from its start (the click is the user's gesture; the browser allows sound)
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // leaving a film stops it (its `pause` event clears `playing`) — hidden, it would play on unseen
    if (!film?.src) return v.pause();
    v.currentTime = 0;
    void v.play().catch(() => {});
  }, [film]);
  // while playing, the clock follows every frame (timeupdate is only ~4 Hz)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      if (video.current) setTime(video.current.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  useEffect(() => () => window.clearTimeout(sleep.current), []);

  const wake = useCallback(() => {
    setAwake(true);
    window.clearTimeout(sleep.current);
    sleep.current = window.setTimeout(() => setAwake(false), 2200);
  }, []);
  const toggle = useCallback(() => {
    const v = video.current;
    if (!film) return choose(0);
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }, [film, choose]);
  const seek = useCallback((t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, v.duration || 0));
    setTime(v.currentTime);
  }, []);
  const full = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen();
  }, []);
  const t: Transport = { film, playing, time, dur, cc, muted, toggle, seek, setCc, setMuted, full };
  const cue = film && cc ? film.cues.find((c) => time >= c.from && time < c.to) : undefined;
  const chapter = film ? [...film.chapters].reverse().find((c) => c.at <= time)?.label : undefined;
  // ⛔ take 3's transport stays up AT REST (Carl, 21 October 2026: *"tes, do that, we need to make it obvious to
  //   visitors."* — after take 2: *"a user may need clear direction on what to do"*); while a film plays it sleeps
  const showOverlay = take !== 1 && (mode.kind === "film" ? awake || !playing : take === 3);

  const screen = (
    <div
      id={onPage ? "examples-player" : undefined}
      className={`relative aspect-video w-full overflow-hidden bg-[#05070a] [:fullscreen_&]:mx-auto [:fullscreen_&]:w-[min(100%,calc((100vh-34px)*16/9))] ${
        take === 1 ? "border border-[#1d2533]" : take === 3 ? "rounded-[3px]" : "ring-1 ring-inset ring-[#1a2130]"
      }`}
      onClick={() => (mode.kind === "film" ? toggle() : mode.kind === "rest" ? choose(0) : undefined)}
    >
      {/* ⛔ THE MARK's BOX (page only): the desk mark's drop lands on its centre at its ink height, and take 4 draws its
          metal and outline from the same box — one source (the note's Decision 2). Was the PNG's box (8 October): half
          the player's width, the PNG's aspect, centred. Empty and never painted. */}
      {onPage && (
        <div id="examples-player-target" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 aspect-[969/503] w-1/2 -translate-x-1/2 -translate-y-1/2" />
      )}
      {/* AT REST — the take's own screen */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${mode.kind === "rest" ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {take === 1 && <TestCard />}
        {take === 2 && <MarkTimeline preview={preview} t={t} choose={choose} />}
        {take === 4 && <MarkTimeline preview={preview} t={t} choose={choose} metal active={mode.kind === "rest"} />}
        {take === 3 && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#141a26_0%,#06080c_70%)]" />
            <div className="absolute inset-0">
              <PlayerIdent active={mode.kind === "rest"} />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-11 flex items-end justify-between px-4">
              <div className="border-l border-[#5F88C8] pl-2.5">
                <p className="text-[12px] font-semibold tracking-wide text-[#CFE6FF]">C2B</p>
                <p className="text-[10px] text-[#CFE6FF]/65">{preview !== null ? `${FILMS[preview].n}  ${FILMS[preview].name}` : "Four films. Choose one, or press play."}</p>
              </div>
              <IdentClock />
            </div>
            <div className="pointer-events-none absolute right-4 top-3 flex items-center gap-1.5 text-[9px] tracking-[0.18em] text-[#5F88C8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5F88C8] shadow-[0_0_6px_#5F88C8]" />
              STANDBY
            </div>
          </>
        )}
      </div>

      {/* THE FILM */}
      <video
        ref={video}
        src={film?.src}
        muted={muted}
        playsInline
        preload="none"
        className={`absolute inset-0 h-full w-full bg-black object-contain transition-opacity duration-500 ${film ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => {
          setPlaying(false);
          window.setTimeout(rest, 1200);
        }}
        onError={() => film && choose(-1 - FILMS.indexOf(film))}
      />
      {film && (
        <p className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent px-3 pb-5 pt-2.5 text-[10px] text-[#CFE6FF]/85 transition-opacity duration-300 ${awake || !playing ? "opacity-100" : "opacity-0"}`}>
          <span className="mr-1.5 font-mono text-[#5F88C8]">{film.n}</span>
          {film.name}
          {chapter && <span className="text-[#CFE6FF]/50">{`  ·  ${chapter}`}</span>}
        </p>
      )}
      {cue && (
        <p className={`pointer-events-none absolute inset-x-0 flex justify-center px-8 transition-[bottom] duration-300 ${showOverlay ? "bottom-12" : "bottom-4"}`}>
          <span className="rounded-[3px] bg-black/70 px-2 py-0.5 text-center text-[13px] leading-snug text-[#CFE6FF]">{cue.text}</span>
        </p>
      )}

      {/* NOT YET — the film's real state, said plainly */}
      {soon && (
        <div className="absolute inset-0 grid place-items-center bg-[#06080c]">
          <div className="text-center">
            <p className="font-mono text-[28px] text-[#3F6DB8]">{FILMS[soon.i].n}</p>
            <p className="mt-1 text-[14px] text-[#CFE6FF]">{FILMS[soon.i].name}</p>
            <p className="mt-1.5 text-[11px] text-[#CFE6FF]/55">{soon.note ?? FILMS[soon.i].status}</p>
          </div>
        </div>
      )}

      {/* the overlay transport, takes 2 and 3 */}
      {take !== 1 && (mode.kind === "film" || take === 3) && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-1.5 pt-6 transition-opacity duration-300 ${showOverlay ? "opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <TransportBar t={t} />
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={root}
      tabIndex={0}
      role="region"
      aria-label="Film viewer"
      className="w-1/2 shrink-0 outline-none focus-visible:ring-1 focus-visible:ring-[#5F88C8] [&:fullscreen]:flex [&:fullscreen]:w-full [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:bg-black"
      onPointerMove={wake}
      onKeyDown={(e) => {
        const v = video.current;
        const k = e.key.toLowerCase();
        if (k === " " || k === "k") {
          e.preventDefault();
          toggle();
        } else if (k === "arrowright" && v) seek(v.currentTime + 5);
        else if (k === "arrowleft" && v) seek(v.currentTime - 5);
        else if (k === "c") setCc((c) => !c);
        else if (k === "m") setMuted((m) => !m);
        else if (k === "f") full();
        else if (k === "escape" && mode.kind !== "rest" && !document.fullscreenElement) {
          video.current?.pause();
          rest();
        }
        wake();
      }}
    >
      {screen}
      {take === 1 && (
        <div className="flex h-[30px] items-center border-x border-b border-[#1d2533] bg-[#0b0e14] px-1.5 [:fullscreen_&]:mx-auto [:fullscreen_&]:w-[min(100%,calc((100vh-34px)*16/9))]">
          <TransportBar t={t} />
        </div>
      )}
    </div>
  );
}

function IdentClock() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const set = () => {
      if (ref.current) ref.current.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    };
    set();
    const id = window.setInterval(set, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span ref={ref} className="font-mono text-[10px] tabular-nums text-[#CFE6FF]/70" />;
}

// ── the bench: §3's row at true size, the four boxes driving the viewer ───────────────────────────────────────────────
export default function PlayerBench({ take }: { take: PlayerTake }) {
  return (
    <section className="flex min-h-[calc(100*var(--vh))] flex-col justify-center [&>div]:w-full">
      <Container>
        <ExamplesRow take={take} />
      </Container>
    </section>
  );
}

/**
 * ⛔ §3's ROW — the four boxes and the viewer, shared by the bench and `/about` (21 October 2026, take 4 on the page; Carl:
 * *"Just build it"* — the structural note `live-work/structural-note-viewer-on-about-21-october.md`, option A, built on his
 * word without the Architect's review). On the page (`onPage`): the viewer's screen carries `#examples-player` (the desk
 * mark's WIPE line and §2's linger both read it) and the empty `#examples-player-target` (the drop's target — and, the
 * note's Decision 2, the viewer's own placement of the mark: one source).
 */
export function ExamplesRow({ take = 4, onPage = false }: { take?: PlayerTake; onPage?: boolean }) {
  const [mode, setMode] = useState<Mode>({ kind: "rest" });
  const [preview, setPreview] = useState<number | null>(null);
  const choose = useCallback((i: number) => {
    // a negative index is a film that failed to load: say so rather than show a black screen
    if (i < 0) return setMode({ kind: "soon", i: -1 - i, note: "This film plays on the local bench only." });
    setMode(FILMS[i].src ? { kind: "film", i } : { kind: "soon", i });
  }, []);
  const rest = useCallback(() => setMode({ kind: "rest" }), []);
  const selected = mode.kind === "rest" ? null : mode.i;
  return (
        <div className="flex items-center justify-end gap-12">
          <ul aria-label="Examples" className="grid flex-1 grid-cols-2 gap-6">
            {FILMS.map((f, i) => (
              <li key={f.n} className="aspect-video">
                <button
                  type="button"
                  onClick={() => choose(i)}
                  onPointerEnter={() => setPreview(i)}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={() => setPreview(i)}
                  onBlur={() => setPreview(null)}
                  aria-pressed={selected === i}
                  className={`flex h-full w-full items-center justify-center border p-4 text-center text-sm transition-colors focus-visible:outline-none ${
                    selected === i ? "border-[#5F88C8] text-[#CFE6FF]" : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200 focus-visible:border-neutral-600"
                  }`}
                >
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
          <Viewer key={take} take={take} mode={mode} preview={preview} choose={choose} rest={rest} onPage={onPage} />
        </div>
  );
}
