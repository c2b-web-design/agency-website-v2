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
 * - ⛔ STATIC: `frameloop="demand"` — one light, not moving yet; no continuous frames. When the moving light comes, it
 *   needs frames and its visibility gating REUSES `/about`'s mechanism.
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
/** The fallback's face: the deep teal the metal reads behind the label (pass 2, take 6: luminance ~0.05–0.11). */
const FALLBACK_FACE = "linear-gradient(180deg, #0f6672 0%, #0a4e58 55%, #083e46 100%)";

const BOX: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  padding: "10px 24px",
  fontSize: 14,
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

export default function WhoWeAreButton() {
  const helpers = useHelpers();
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

  return (
    <a
      ref={link}
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
