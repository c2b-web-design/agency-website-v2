"use client";

/**
 * ⚠ SINCE 13 OCTOBER 2026 THE FAMILY's BUTTON, NOT ONLY THE HOME PAGE's: `member="start"` is `/about` §4's gold `Start a
 * conversation` (see `MEMBERS` below). Everything written here about the teal holds for both unless `MEMBERS` says otherwise.
 *
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
 *   ⚠ OVERTAKEN 13 October 2026: the fallback is now the button's STILL (see `MEMBERS`) — the CSS pill read as a glitch on
 *   every cold load (Carl). Still true: never a bare label; the DOM words are what a screen reader reads.
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
import type { FamilyMember, Glyphs } from "./whoweare-button-scene";
import { isRoomWarm } from "@/lib/room-warm";

const WhoWeAreScene = dynamic(() => import("./whoweare-button-scene").then((m) => m.WhoWeAreScene), { ssr: false });

/**
 * ⛔ THE FAMILY'S SHIPPED MEMBERS (13 October 2026 — the structural note `live-work/structural-note-start-button-rollout-13-
 * october.md`; Carl authorised this file). ONE component for every member, not a copy per member: the measuring, the hold,
 * the fallback and the on-screen gate exist once. The file keeps its first member's name; the home page calls it with no
 * props and gets exactly what it had. `start` is `/about` §4's gold `Start a conversation` (R-047 – R-049).
 *
 * `scale` is the family's box rule × it (teal 2×, R-045; gold 1× first — Carl: *"We will build it the the size it is on the
 * page. then see how it looks."* — then 2×, the teal's height: *"the gold button is too small"*, 13 October). `still` is the button's STILL (below). The focus classes are literal strings so Tailwind sees them.
 *
 * ⛔⛔ THE STILL — THE COLD-LOAD FIX (13 October 2026). Carl, on a refresh: *"i cant have a button that loads in this way. It
 * looks like a glitch and a mistake. What i see on a page thats approved is what i should see elsewhere otherwise im
 * approving under false pretenses."* Until then the button painted a flat CSS gradient until three.js had loaded and drawn —
 * measured in production, 0.75–0.94 s on the home page and 2.4–5.5 s on `/about` (the room's setup holds the main thread).
 * No route makes a three.js button draw in the first paint: the page paints before any script runs. So the button now paints
 * a STILL OF ITSELF from the first paint — its scene's own first frame (face-on, the clay's lamps, the moving lamp not yet
 * on), rendered by `live-work/scripts/family-button-stills.mjs` at 1× and 2× into `public/buttons/<member>-rest@{1,2}x.png` —
 * and the canvas stays HIDDEN until its first frame with the letters, which IS that frame (`live` false in the scene: no roll,
 * no lamp). Then canvas and still swap in one commit, and the roll and the lamp start from rest.
 * ⚠ RE-RUN THE STILLS SCRIPT AFTER ANY CHANGE TO A LOOK, THE GEOMETRY, THE LABEL OR THE SIZE — the still is a second copy of
 * the look. The script asserts the canvas box is the link's box + `STILL_PAD` each side, and the verify script compares the
 * still with the live frame that replaces it.
 * ⚠ It replaced the gradient `face` fallback (teal: R-045's range; gold: sampled from the approved frame). With no WebGL, or
 * after a lost context, the still IS the fallback now — the approved button, at rest.
 */
/*
 * ⛔ `waitForRoom` (13 October 2026, Carl's option A — *"lets go with option A - proceed"*): `/about`'s gold button stays on
 * its still until the room is WARM (`lib/room-warm.ts`) — on a page opened straight at `#start` the room's last shaders
 * compile in one hidden render (~1 s on the main thread), and the roll must not be running when that lands. A reader who
 * arrives from §1 finds the room warm long before §4. Backstop: `ROOM_WAIT_MS` after mount, so a room that never warms
 * (no WebGL, `?neon=none`, a failure) cannot hold the button for ever.
 */
const MEMBERS: Record<FamilyMember, { label: string; href: string; scale: number; still: string; focus: string; waitForRoom: boolean }> = {
  whoweare: {
    label: "Who we are",
    href: "/about",
    scale: 2,
    waitForRoom: false,
    still: "/buttons/whoweare-rest",
    focus: "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#cfe6ff]",
  },
  start: {
    label: "Start a conversation",
    href: "/start",
    // 2× since 13 October 2026 (Carl: "the gold button is too small. make it the same height as the teal button"); was 1×.
    scale: 2,
    waitForRoom: true,
    still: "/buttons/start-rest",
    focus: "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffe39e]",
  },
};

/**
 * The canvas's margin round the link, px — the scene's `PAD`, KEPT IN STEP BY HAND (importing it would pull three.js into the
 * page's first load). The still covers exactly the canvas's box; `family-button-stills.mjs` fails if they differ.
 */
const STILL_PAD = 14;

/** `waitForRoom`'s backstop, ms after mount — the button swaps then even if the room never reported warm. */
const ROOM_WAIT_MS = 6000;

/** The hold's reach, px from the link's edge. */
const NEAR = 60;

/** The family's box rule × `scale`. The pill is built to the measured box, so it, the crown and the letters follow. */
function boxFor(scale: number): React.CSSProperties {
  return {
    position: "relative",
    display: "inline-block",
    padding: `${10 * scale}px ${24 * scale}px`,
    fontSize: 14 * scale,
    fontWeight: 600,
    letterSpacing: "0.025em",
    lineHeight: 1.5,
    whiteSpace: "nowrap",
    borderRadius: 9999,
  };
}

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

export default function FamilyButton({ member = "whoweare" }: { member?: FamilyMember }) {
  const M = MEMBERS[member];
  const helpers = useHelpers();
  const reduced = useReducedMotion();
  const [near, setNear] = useState(false);
  const [focused, setFocused] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  const words = useRef<HTMLSpanElement>(null);
  const baseMark = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number; glyphs: Glyphs } | null>(null);
  /** The scene has drawn its first frame with the letters (the still's frame). */
  const [lettersDrawn, setLettersDrawn] = useState(false);
  // ⛔ `waitForRoom` (see MEMBERS): the room's warm signal, or the backstop.
  const roomWarm = useSyncExternalStore(
    (on) => {
      window.addEventListener("room:warm", on);
      return () => window.removeEventListener("room:warm", on);
    },
    () => isRoomWarm(),
    () => false,
  );
  const [backstop, setBackstop] = useState(false);
  useEffect(() => {
    if (!M.waitForRoom) return;
    const id = window.setTimeout(() => setBackstop(true), ROOM_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [M.waitForRoom]);
  /** ⛔ THE SWAP: still → live canvas. Letters drawn, and — for a member that waits — the room warm (or the backstop). */
  const drawn = lettersDrawn && (!M.waitForRoom || roomWarm || backstop);

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
      href={M.href}
      data-drawn={drawn ? "1" : "0"}
      className={M.focus}
      style={{ ...boxFor(M.scale), color: "transparent" }}
    >
      {/* ⛔ THE STILL (see `MEMBERS`): the button at rest, from the first paint, until the live canvas takes over on the same
          frame. A CSS image (1× / 2× by the screen's density), not an <img>: nothing for the layout or the lint rule to wrap. */}
      <span
        aria-hidden="true"
        data-still
        style={{
          position: "absolute",
          left: -STILL_PAD,
          top: -STILL_PAD,
          width: `calc(100% + ${STILL_PAD * 2}px)`,
          height: `calc(100% + ${STILL_PAD * 2}px)`,
          backgroundImage: `image-set(url("${M.still}@1x.png") 1x, url("${M.still}@2x.png") 2x)`,
          backgroundSize: "100% 100%",
          pointerEvents: "none",
          visibility: drawn ? "hidden" : "visible",
        }}
      />
      {box && (
        // Hidden until its first frame with the letters — which is the still's frame — so nothing half-built is ever seen.
        <span style={{ visibility: drawn ? "visible" : "hidden" }}>
          <WhoWeAreScene
            member={member}
            w={box.w}
            h={box.h}
            glyphs={box.glyphs}
            helpers={helpers}
            hold={near || focused}
            reduced={reduced}
            live={drawn}
            onDrawn={() => setLettersDrawn(true)}
            onLost={() => setLettersDrawn(false)}
          />
        </span>
      )}
      {/* The words: measured for the 3D letters, and what a screen reader reads. Always transparent: the still and then the
          3D letters draw them. */}
      <span ref={words} style={{ position: "relative" }}>
        {M.label}
        <span ref={baseMark} aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0, verticalAlign: "baseline" }} />
      </span>
    </a>
  );
}
