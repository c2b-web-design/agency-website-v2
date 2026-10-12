"use client";

/**
 * ⛔ THE HOME PAGE's `Who we are` BUTTON — the closing CTA, now the second member of the button family (D-088, 12 October
 * 2026; passes R-042 the mesh, R-043 the material and label; pass 3 step 1, a static light from the right). Carl: *"We are
 * going to take that boring white CSS button and bring it to life using Three js."*
 *
 * Structure (CLAUDE.md §5a, written first — `live-work/structural-note-whoweare-rollout-12-october.md`; Carl: *"Structure is
 * good."*):
 * - ⛔ A REAL LINK. `<a href="/about">` carries the family's box rule and the words; the 3D scene is BEHIND it, aria-hidden,
 *   pointer-events none — so focus, keyboard, the hit target and what a screen reader reads are the link's, never the canvas
 *   (the answer cards' baked text is an open accessibility defect, D-051-A11Y; this must not repeat it).
 * - ⛔ LOADED LAZILY — `next/dynamic`, `ssr: false`: three.js and R3F arrive in this chunk only (the home page shipped none).
 * - ⛔ ONE CANVAS, THE PAGE'S LIFETIME, NEVER KEYED — Next step's worked case (§5a, case 2) is the warning.
 * - ⛔ THE FALLBACK: a CSS teal pill with the ice-blue words until the first frame that carries the extruded letters, with
 *   no WebGL, or after a lost context — never a bare label on the dark section. Then the DOM words go transparent (still
 *   read by a screen reader) and the 3D letters take their place, measured to where these words are drawn.
 * - ⛔ FRAMES: `frameloop="demand"`. ⚠ OVERTAKEN 12 October, session 2 — written when the scene was static ("one light, not
 *   moving yet"). It now ROLLS and carries a moving lamp, so it draws continuously WHILE ON SCREEN, gated by `/about`'s
 *   mechanism, reused (`Ticker`, the scene module); under reduced motion it is still and draws on demand only.
 * - ⛔ THE HOLD (Carl: *"add mouse proximity so its static when a user decides to press it"*): the pointer within `NEAR` px of
 *   the link, or the link FOCUSED (the keyboard's equivalent — the Builder's addition), eases the roll onto the nearest face.
 *   Touch has no pointer to come near: there it keeps rolling, and a tap is still the link's.
 * - ⛔ 2× (Carl: *"It can be bigger, much bigger."*, R-045): the family's box rule × `SCALE` — 28 px words in a 82 px pill.
 *   ⚠ The family's one height (41) is left by this member; Next step keeps it until its redo — Carl's open point.
 * - ⛔ LIGHT HELPERS behind `?lighthelpers=1` only.
 * ⚠ NO HOVER designed yet (the white pill's `bg-neutral-100` is gone with it) — Carl's call.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Glyphs } from "./whoweare-button-scene";

const WhoWeAreScene = dynamic(() => import("./whoweare-button-scene").then((m) => m.WhoWeAreScene), { ssr: false });

// ⚠ KEPT IN STEP BY HAND — the one value repeated from the scene module (`INK_DEFAULT`): the CSS fallback must paint the
// words before that module (and three.js) loads, so it cannot import it. Everything else the scene owns.
const INK = "#cfe6ff";
/** The fallback's face: the painted teal metal's own range, lit from above (R-045's look; was pass 2's deep teal). */
const FALLBACK_FACE = "linear-gradient(180deg, #1a9fae 0%, #0f7380 55%, #0a5560 100%)";

/** The family's box rule × 2 (R-045). The pill is built to the measured box, so it, the crown and the letters follow. */
const SCALE = 2;
/** The hold's reach, px from the link's edge. */
const NEAR = 60;

const BOX: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  padding: `${10 * SCALE}px ${24 * SCALE}px`,
  fontSize: 14 * SCALE,
  fontWeight: 600,
  letterSpacing: "0.025em",
  lineHeight: 1.5,
  whiteSpace: "nowrap",
  borderRadius: 9999,
};

function useHelpers(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("lighthelpers") === "1",
    () => false,
  );
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (on) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", on);
      return () => mq.removeEventListener("change", on);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export default function WhoWeAreButton() {
  const helpers = useHelpers();
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [focused, setFocused] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  const words = useRef<HTMLSpanElement>(null);
  const baseMark = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; glyphs: Glyphs } | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = words.current;
    const a = link.current;
    if (!el || !a) return;
    let live = true;
    const measure = async () => {
      // ⚠ After the webfont, never before: a fallback face measures a different width.
      await document.fonts.ready;
      if (!live) return;
      const { measureLabel } = await import("./whoweare-button-scene");
      if (live) setBox(measureLabel(el, baseMark.current, a));
    };
    void measure();
    const ro = new ResizeObserver(() => void measure());
    ro.observe(a);
    return () => {
      live = false;
      ro.disconnect();
    };
  }, []);

  // The pointer near the link holds the roll. ⚠ Not checked with page.screenshot(): a capture fires stray pointer events
  // (`live-work/screenshot-fires-pointermove-12-october.md`).
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const a = link.current;
      if (!a || e.pointerType === "touch") return;
      const r = a.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      setNear(Math.hypot(dx, dy) <= NEAR);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <a
      ref={link}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-hold={near || focused ? "1" : "0"}
      href="/about"
      data-drawn={drawn ? "1" : "0"}
      className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfe6ff]"
      style={{ ...BOX, background: drawn ? "transparent" : FALLBACK_FACE, color: drawn ? "transparent" : INK }}
    >
      {box && (
        <WhoWeAreScene
          w={box.w}
          h={box.h}
          glyphs={box.glyphs}
          helpers={helpers}
          hold={near || focused}
          reduced={reduced}
          onDrawn={() => setDrawn(true)}
          onLost={() => setDrawn(false)}
        />
      )}
      {/* The words: measured for the 3D letters, and what a screen reader reads. Transparent once the letters are drawn. */}
      <span ref={words} style={{ position: "relative" }}>
        Who we are
        <span ref={baseMark} aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, verticalAlign: "baseline" }} />
      </span>
    </a>
  );
}
