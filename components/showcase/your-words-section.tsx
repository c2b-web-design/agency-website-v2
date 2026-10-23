"use client";

/**
 * ⛔ FILM 4's PAGE — ONE VIEWPORT, the SSR'd half (D-088, 23 October 2026, session 2; the structural note
 * `live-work/structural-note-showcase-two-viewports-23-october.md` v2). Carl: *"in viewport 1 will be "your company" Static
 * and lit by static light. In viewport 2 will be "your company logo" Travelling light with logo animation."*
 *
 * ⛔ THE ORNATE CORNERS' PATTERN (`corner-frame.tsx`), taken on Carl's word (*"Search our site, there are plenty examples"*):
 * - TWO COMPONENTS: this section RENDERS ON THE SERVER and NEVER imports three.js; only the canvas inside
 *   (`your-words-canvas.tsx`) is `ssr: false`.
 * - ⛔ THE WORDS ARE TEXT HERE — the page's accessible text (D-051-A11Y must not repeat): visually hidden while the canvas
 *   works, SHOWN as type wherever it cannot (no WebGL, a lost context, a failed font check, a deadline missed).
 * - ⛔ MOUNTED ONCE, ON APPROACH (a window ahead), NEVER UNMOUNTED — not rendered on visibility, which would make a new WebGL
 *   context on every pass (CLAUDE.md §5a, worked case 2). Both viewports are within the window on load, so both mount then.
 * - ⛔ THE FALLBACK IS ONE-WAY: the canvas is UNMOUNTED, the words shown, for the life of the page.
 * - ⛔ THE STATE IS ON THE SECTION (`data-your-words`: pending | drawn | failed) for harnesses, and a failure is logged in
 *   plain words.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Piece } from "./your-words-canvas";

const YourWordsCanvas = dynamic(() => import("./your-words-canvas"), { ssr: false });

/** Mount the canvas this far ahead of the section (a window). */
const APPROACH_MARGIN = "100% 0px 100% 0px";
/** ⛔ Mounted and not drawn this long → the words as text, for good. ⚠ A TAKE, not measured: a browser with no usable WebGL
 *  can fail inside R3F's async setup without throwing; this is the net for that. Slow ≠ failed — a device slower than this
 *  gets the text. */
const DEADLINE_MS = 10000;

export default function YourWordsSection({ piece, words }: { piece: Piece; words: string }) {
  const section = useRef<HTMLElement>(null);
  const [approached, setApproached] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const noWebGL = useSyncExternalStore(() => () => {}, () => typeof window.WebGLRenderingContext === "undefined", () => false);
  const failed = lost || noWebGL;
  const onReady = useCallback(() => setReady(true), []);
  const onFailed = useCallback(
    (why: string) => {
      console.error(`/proto/your-words — "${words}" falls back to text: ${why}`);
      setLost(true);
    },
    [words],
  );

  // ⛔ APPROACH: mount once, a window ahead
  useEffect(() => {
    const el = section.current;
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

  // ⛔ A CONTEXT THAT CANNOT BE CREATED → the text AT ONCE. R3F creates its renderer in an async setup and retries on every
  // render; the failure never reaches the canvas's `Guard` (measured with WebGL disabled: 38 console errors and the text
  // only at the deadline, 10.8 s). The browser fires `webglcontextcreationerror` on the canvas — it does not bubble, so it is
  // heard in the CAPTURE phase on the wrapper. The deadline below stays the net for a GPU that fails without the event.
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!approached || !el) return;
    const fail = () => onFailed("a WebGL context could not be created");
    el.addEventListener("webglcontextcreationerror", fail, { capture: true, once: true });
    return () => el.removeEventListener("webglcontextcreationerror", fail, { capture: true });
  }, [approached, onFailed]);

  // ⛔ THE DEADLINE: mounted, not drawn → the text, one-way
  useEffect(() => {
    if (!approached || ready || failed) return;
    const id = window.setTimeout(() => onFailed(`not drawn within ${DEADLINE_MS} ms`), DEADLINE_MS);
    return () => window.clearTimeout(id);
  }, [approached, ready, failed, onFailed]);

  return (
    <section
      ref={section}
      data-your-words={failed ? "failed" : ready ? "drawn" : "pending"}
      className="relative flex h-[calc(100*var(--vh))] items-center justify-center overflow-hidden"
    >
      <h2 className={failed ? "px-6 text-center text-5xl font-semibold tracking-tight text-[#c9a65a]" : "sr-only"}>{words}</h2>
      {approached && !failed && (
        <div ref={wrap} aria-hidden="true" className="pointer-events-none absolute inset-0">
          <YourWordsCanvas piece={piece} words={words} onReady={onReady} onFailed={onFailed} />
        </div>
      )}
    </section>
  );
}
