"use client";

/**
 * ⛔ THE ORNATE CORNERS' FRAME — the SSR'd half (D-100; the structural note v6,
 * `live-work/structural-note-ornate-corners-on-home-19-october.md`, decisions 4, 5, 8 and the v4–v6 sections).
 *
 * ⛔ TWO COMPONENTS, NOT ONE: this frame RENDERS ON THE SERVER and NEVER imports three.js — it holds the server grid as
 *   `children` and carries `data-corner-colour`, so a visitor without JS still gets the text AND its frame (the no-JS rule in
 *   `app/globals.css`). Only the canvas inside (`corner-canvas.tsx`) is `ssr: false`. The precedent: `whoweare-button.tsx`.
 * ⛔ NO BORDER IS SEEN WHILE THE CORNERS WORK (Carl: *"The box shape is implied by the corners."*). Each box keeps a 1-px
 *   `border-transparent` (the geometry the corners were judged against). ⛔ THE FALLBACK — Carl: *"no matter how the page
 *   renders or the users device limitations the text shouldnt be borderless"* — `data-corners="none"` colours that border
 *   in the section's colour (gold §2, blue §3). It triggers on "the corners did not draw", not on "no WebGL", and it is
 *   ONE-WAY: once fallen back, the border stays for the life of the page and the canvas is UNMOUNTED (see the render).
 * ⛔ MOUNTED ONCE, ON APPROACH (within a window of the grid), NEVER UNMOUNTED — not rendered on visibility, which would make
 *   a new WebGL context on every pass (CLAUDE.md §5a, worked case 2).
 * ⛔ ARRIVAL — the grid's CENTRE crossing `ARRIVAL_LINE` of the window (Carl agreed), LATCHED: it plays ONCE per page load
 *   and the corners stay (*"When they arrive they stay there."*). When the corners are ready: still on screen → the
 *   sequence, box by box; scrolled away → set in place, no sequence. Arrival before setup finishes is the accepted gap
 *   (*"Yes the gap is fine"*) — up to `DEADLINE_MS`, then the fallback (⚠ that limit is put to Carl once measured).
 * ⛔ REDUCED MOTION (delegated by Carl, *"Whatever is best for visitors"*): no stagger, one short fade for every box. A take.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { CornerBox, CornerReveal } from "./corner-canvas";
import type { CornerColour } from "./corner-material";
import { pageZoom } from "@/lib/site-scale";

const CornerCanvas = dynamic(() => import("./corner-canvas"), { ssr: false });

/** The grid has ARRIVED when its centre is above this fraction of the window's height. ⚠ A tuning value (the note). */
const ARRIVAL_LINE = 2 / 3;
/** ⛔ The deadline: arrived but not ready this long → the border, for good. ⚠ A take (~1–1.5 s, the note) — to be measured on
 *  a COLD deep link over a throttled connection, then put to Carl. */
const DEADLINE_MS = 1500;
/** ⛔ THE SEQUENCE — THE Q&A CARD ENTRANCE's TIMING, TAKEN WHOLE (Carl, 19 October 2026, session 2: *"it runs a little fast.
 *  Go look at the card entrance in the q+a. As one fades in slower the next one fades in before it has completed. It has
 *  more of a flow and connection."*). From `components/enquiry/answer-card-geometry.ts`: `CARD_RISE_DURATION_MS` 2000, and
 *  the next begins 28% in (`CARD_OVERLAP` 0.72 → `CARD_RISE_GAP_MS` 560); the curve is its cubic ease-out (in
 *  `corner-canvas.tsx`). ⛔ DELIBERATELY NOT LINKED to the Q&A (Carl: *"It shouldnt be linked to the q+a section but the
 *  timing should be more or less the same."*) — the corners' own numbers, the Q&A only their reference; retuning either does
 *  not move the other. Was 1015 ms / 450 ms with a smoothstep (the first take). */
const SEQUENCE = { stagger: 560, dur: 2000 } as const;
const SEQUENCE_REDUCED = { stagger: 0, dur: 300 } as const;
/** Mount the canvas this far ahead of the grid (a window) — the setup is done before arrival on a normal scroll. */
const APPROACH_MARGIN = "100% 0px 100% 0px";

function onScreen(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

export default function CornerFrame({ colour, className = "", children }: { colour: CornerColour; className?: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const [approached, setApproached] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [boxes, setBoxes] = useState<CornerBox[] | null>(null);
  const [reveal, setReveal] = useState<CornerReveal>({ at: null, ...SEQUENCE });
  // no WebGL at all → the border from the first client render (a browser with the API but no working context is the deadline's)
  const noWebGL = useSyncExternalStore(() => () => {}, () => typeof window.WebGLRenderingContext === "undefined", () => false);
  const failed = lost || noWebGL;
  const fail = useCallback(() => setLost(true), []);

  // ⛔ THE REVEAL: arrived AND ready, once — the sequence if the grid is on screen, else set in place. Called from the two
  //   callbacks that complete the pair (never from an effect's body).
  const state = useRef({ arrived: false, ready: false, revealed: false });
  const maybeReveal = useCallback(() => {
    const s = state.current;
    const el = frame.current;
    if (!s.arrived || !s.ready || s.revealed || !el) return;
    s.revealed = true;
    const timing = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? SEQUENCE_REDUCED : SEQUENCE;
    setReveal({ at: onScreen(el) ? performance.now() : -Infinity, ...timing });
  }, []);
  const onReady = useCallback(() => {
    state.current.ready = true;
    setReady(true);
    maybeReveal();
  }, [maybeReveal]);

  // ⛔ APPROACH: mount once, a window ahead
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setApproached(true);
        io.disconnect();
      }
    }, { rootMargin: APPROACH_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ⛔ ARRIVAL: the grid's centre above the line (or already past it — a deep link, a jump), latched
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if ((r.top + r.bottom) / 2 <= window.innerHeight * ARRIVAL_LINE) {
        state.current.arrived = true;
        setArrived(true);
        maybeReveal();
        stop();
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    const stop = () => {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
    document.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return stop;
  }, [maybeReveal]);

  // ⛔ THE DEADLINE: arrived, not ready → the border, one-way
  useEffect(() => {
    if (!arrived || ready || failed) return;
    const id = window.setTimeout(() => setLost(true), DEADLINE_MS);
    return () => window.clearTimeout(id);
  }, [arrived, ready, failed]);

  // ⛔ THE BOXES, measured in LAYOUT px relative to the frame (rects ÷ the zoom, D-097). The boxes move only when they or the
  //   grid's tracks resize, which the observer covers; re-measured after the webfont, as the button is.
  useEffect(() => {
    const el = frame.current;
    if (!el || !approached) return;
    let live = true;
    const measure = () => {
      if (!live) return;
      const z = pageZoom();
      const f = el.getBoundingClientRect();
      const next = [...el.querySelectorAll<HTMLElement>("[data-corner-box]")].map((b) => {
        const r = b.getBoundingClientRect();
        return { x: (r.left - f.left) / z, y: (r.top - f.top) / z, w: r.width / z, h: r.height / z };
      });
      setBoxes((prev) =>
        prev && prev.length === next.length && prev.every((p, i) => p.x === next[i].x && p.y === next[i].y && p.w === next[i].w && p.h === next[i].h)
          ? prev
          : next,
      );
    };
    const raf = requestAnimationFrame(measure);
    void document.fonts.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll("[data-corner-box]").forEach((b) => ro.observe(b));
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [approached]);

  return (
    <div ref={frame} data-corner-colour={colour} data-corners={failed ? "none" : ready ? "drawn" : "pending"} className={`relative ${className}`}>
      {children}
      {/* ⛔ ON FALLBACK THE CANVAS IS UNMOUNTED, not only hidden (19 October 2026, built): hidden, a failed canvas re-rendered
          and R3F retried the context on every render (measured with WebGL off: a creation error per render). The fallback is
          ONE-WAY, so this is one teardown, never churn — the mount-once rule's purpose (no repeated context creation) holds,
          and it frees the context and stops every frame. */}
      {approached && boxes && !failed && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <CornerCanvas colour={colour} boxes={boxes} reveal={reveal} onReady={onReady} onFailed={fail} />
        </div>
      )}
    </div>
  );
}
