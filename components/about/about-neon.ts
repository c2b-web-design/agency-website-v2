/**
 * ⛔⛔ THE WALL PAIR'S NEON (CA + CB) — every value, and the brightness track.
 *
 * Plan: `live-work/wall-neon-plan-23-september.md`, approved by Carl
 * 23 September 2026 after the Architect's review. Decision record: **D-093**
 * (with D-087, D-090, D-091).
 *
 * ⚠⚠ EVERY VALUE HERE IS A CANDIDATE, TUNED BY EYE IN THE ROOM. D-090: *"wont
 * know until we see it in the scene."* ⛔ **Do not settle one on the bench.**
 *
 * ⛔ THE PEER RANGE HAS NO HEADROOM — Architect F14. `postprocessing@6.39.3`
 * (whose `MipmapBlurPass` `neon-bloom.tsx` uses) declares three
 * `>= 0.168.0 < 0.186.0`; the project's three `^0.185.1` resolves below 0.186.
 * **They align exactly.** The next three minor breaks the peer range — check
 * `postprocessing` before bumping three.
 */

import * as THREE from "three";
import { ROOM_CARD_GUIDES } from "./about-room";

// ── Colour ──────────────────────────────────────────────────────────────────

/**
 * ⛔ THE GLOW COLOUR — the navy "c" of Carl's navy-teal logos, CANDIDATE.
 *
 * Re-sampled 23 September 2026 from `brand-assets/logo/Logo 2.2.png` and the
 * `ig_…c6430c…` render — two files, one hue (215–217°):
 *
 *     edge #00123c/#031837  body #0d316c/#032b69  GLOW #244e9a/#19519b
 *     bright #4478ca/#3672c6  CORE #a3d1fd/#92bfec
 *
 * ⚠⚠ THIS IS THE **GLOW**, NOT THE CORE, AND THAT IS THE MODEL (D-090): *"the
 * core is near-white; the colour lives in the glow."* ⛔ **No core colour is set
 * anywhere** — the rim is tone-mapped (ACES) in the base pass, so as intensity
 * rises its on-screen core desaturates toward white while the bloom, which is
 * never tone-mapped, stays navy. **See `neon-bloom.tsx` — Architect F10.**
 *
 * ⚠ "DARKER" FOR A LIGHT SOURCE MEANS DEEPER AND MORE SATURATED, NOT DIMMER.
 * Dimming is the peak's job. Sweep with `?neonhex=1b4789`.
 */
export const NEON_GLOW_HEX = "#1b4789";
/* ⚠ Measured with the tube pre-shifted (below): the glow reads 214–216° from
   8px out — on the logo's navy. */

/**
 * ⛔⛔ THE TUBE'S OWN COLOUR — the rim's emissive, SEPARATE FROM THE GLOW.
 *
 * ⚠⚠ MEASURED 23 September 2026, and it is why this constant exists. With the
 * tube at the glow's navy, the GLOW on the wall landed on the logo's hue
 * (215–221° at 6–16px) but the TUBE CORE read **186–196° — CYAN**, where the
 * logo's core sits at ~210° (`#a5caf3`). ⛔ **ACES does not whiten a saturated
 * blue straight toward white; it passes through cyan**, because the green
 * channel rises into the curve's shoulder first. The navy "c" was reading as
 * the teal "b".
 *
 * ⚠ SO THE TUBE IS PRE-SHIFTED AWAY FROM GREEN and the glow is not: the bloom is
 * never tone-mapped, so it shows its colour as given. **Two colours, one track.**
 * Sweep with `?neontube=` (no `#`).
 *
 * ⚠ MEASURED on CA/CB's top rims (peak 6, bloom 0.25, 1440 capture), tube core:
 *
 *     #1b4789 (= glow)   #95f4ff  186°   cyan — the "b", not the "c"
 *     #1b2f8a  CHOSEN    #89c2ff  211°   ← the logo's own core, #92bfec–#a3d1fd ~210°
 *     #1a2699            #91aeff  224°   periwinkle
 *     #2323a0            #a3a8ff  237°   lavender
 *
 * ⛔ A CANDIDATE, set by measurement against the logo — Carl's eye decides.
 */
export const NEON_TUBE_HEX = "#1b2f8a";

/**
 * ⚠ `NEON_GLOW_HEX` / `NEON_TUBE_HEX` ARE THE **WALL** PAIR'S (CA, CB) — named
 * before the floor pair existed. Carl approved their colour by eye, 23 September:
 * *"i think the colour is good."*
 */

// ── The FLOOR pair (CD, CS) — the LIGHTER half ──────────────────────────────

/**
 * ⛔ THE FLOOR PAIR'S GLOW — the logo's teal **"b"**, CANDIDATE. D-090 recorded
 * it on 22 September: *"the "c" blue for the wall pair, the "b" teal for the
 * floor pair — the two pairs as the two halves of one mark."* Carl: *"a darker
 * and a lighter blue per pair."* Sampled then from the same two logo files:
 *
 *     edge #02344e  body #08758c  GLOW #1bb6c5/#18a6bd  bright #5ce5eb  CORE #cefcfe
 *
 * ⚠ Not chosen by Carl — built so he can judge the whole scene. `?floorhex=`.
 */
export const FLOOR_NEON_GLOW_HEX = "#18a6bd";
/**
 * The floor pair's TUBE. ⚠ Starts EQUAL to the glow: the wall pair needed a
 * pre-shift because ACES turned navy CYAN, but the "b"'s own core IS cyan-white
 * (`#cefcfe`), so the same drift may be correct here. **Measure before
 * shifting.** `?floortube=`.
 */
export const FLOOR_NEON_TUBE_HEX = "#18a6bd";

// ── Intensity — TWO DIALS, NOT ONE (Architect F10) ──────────────────────────

/**
 * ⛔ PEAK EMISSIVE INTENSITY PER CARD, at track level 1. Sweep with `?neonca=` /
 * `?neoncb=`.
 *
 * ⚠⚠ ONE PER CARD ON PURPOSE — Carl: *"Wall cards first, tweak so they visually
 * match."* ⛔ D-089 needed FOUR glass values to read as ONE material, and they
 * came out on the diagonal. **Do not tidy these onto one number because the
 * cards share a wall.**
 *
 * ⚠ THE PEAK DRIVES BOTH THE TUBE AND THE BLOOM'S SOURCE; `BLOOM_STRENGTH`
 * scales only the glow. **The tube's whiteness and the glow's reach are
 * therefore separate dials** — matching one does not match the other.
 */
export const CA_NEON_PEAK = 6;
export const CB_NEON_PEAK = 6;
/**
 * ⛔⛔ THE FLOOR PAIR RUNS AT LESS THAN A THIRD OF THE WALL PAIR'S PEAK — AND
 * THAT IS WHAT MAKES THEM MATCH. `?neoncd=` / `?neoncs=`.
 *
 * ⚠⚠ MEASURED 23 September 2026. At the wall pair's peak of 6 the floor tubes
 * blew out WHITE (core `#edffff`, saturation 0.07) with a heavy cyan halo (8px
 * 52%, 48px 8% of core) — **far louder than the wall pair.** ⛔ **The teal is
 * ~4.75x BRIGHTER than the navy at the same peak** (relative luminance 0.311
 * against 0.065): it carries green, which the eye weights most. And the floor
 * tubes are nearer and thicker.
 *
 *     peak   CD core      sat    8px  16px  24px  48px
 *     6.0    #edffff     0.07     52    20    15     8   blown white, loud
 *     1.8    #8affff     0.46     42    11     8     3   ← CHOSEN: matches CA's
 *                                                         core saturation (0.48)
 *     1.3    #67ffff     0.60     40     9     6     2   saturated cyan — the
 *                                                         "LED" look D-090 notes
 *
 * ⚠ "Match" here is the tube's WHITENESS against CA, not equal numbers — the
 * same test D-089 used for the glass. 8px stays high because the floor tube is
 * ~8–10px across on screen; compare from 16px out. ⛔ **Candidate — Carl judges
 * the whole scene.**
 */
export const CD_NEON_PEAK = 1.8;
export const CS_NEON_PEAK = 1.8;

// ── Bloom ───────────────────────────────────────────────────────────────────

/**
 * ⛔ THE MEASURED TARGET (D-090), background-subtracted, % of core:
 *
 *     0px 100 · 2px ~89 · 4px ~8 · 8–24px ~8–10 (a faint shelf) · 48px ~0
 *
 * **"Localised" is two layers: a tight bloom on the tube and a faint, short wash
 * beyond it.** Measure with `npm run verify -- about-neon.mjs profile`.
 *
 * ⚠ MEASURED 23 September 2026 (CA, 1440; CB within 1–5 points), % of core:
 *
 *                         4px   8px  16px  24px  48px
 *     peak 12, bloom 0.60  90    26    15    11     6   broad — a halo, rejected
 *     peak  6, bloom 0.25  53    11     6     4     1   ← CHOSEN starting point
 *     peak  5, bloom 0.15  51     7     2     1     0   too tight — no wash at all
 *
 * ⚠ 4px STAYS HIGH AT ANY SETTING, AND THAT IS GEOMETRY, NOT GLOW: the tube is
 * ~5px across on screen, so 4px out is still tube. The reference's tube was a
 * hairline. **Compare from 8px out.**
 */
/** Composite gain on the blurred neon. `?bloom=` */
export const BLOOM_STRENGTH = 0.25;
/** `MipmapBlurPass.radius` — the upsample spread, 0..1. `?bloomr=` */
export const BLOOM_RADIUS = 0.7;
/**
 * Mip levels. ⚠ EACH LEVEL DOUBLES THE REACH. Five from a ~1350px canvas ends at
 * ~42px, which brackets the target's ~24–48px wash; more would spread the glow
 * across the wall — the broad halo Carl did NOT choose.
 */
export const BLOOM_LEVELS = 5;

/**
 * ⛔ THE LAYER ONLY THE NEON PASS SEES. The first use of three.js layers on
 * `/about`. ⚠ Set with `layers.set()` in a ref callback — **never `layers={n}`**
 * (Architect F14): R3F expects a `THREE.Layers` there, and a mis-set layer puts
 * the emitter in the BASE pass as a flat navy rim, which reads as "the emissive
 * is too strong" rather than "the layer is wrong".
 */
export const NEON_LAYER = 11;

// ── The brightness track (D-091) ────────────────────────────────────────────

/**
 * One piece of a track. A STEP holds `to` for `ms`; a RAMP moves linearly from
 * the previous level to `to` across `ms`.
 */
export type NeonSegment = { ms: number; to: number; ramp?: true };

/**
 * ⛔⛔ THE TAIL — Architect F5. A pattern either HOLDS its last level or LOOPS
 * with a period. **The one-shot ignition and D-087's periodic neon are the same
 * type**, so the loop chunk extends this rather than rewriting it.
 *
 * ⚠ A loop's period must be ≥ the segments' total; the remainder holds the last
 * level.
 */
export type NeonTail = { hold: true } | { loop: { periodMs: number } };

export type NeonPattern = { segments: NeonSegment[]; tail: NeonTail };

/** A pattern placed on the clock: it starts `startMs` after the trigger. */
export type NeonSchedule = { pattern: NeonPattern; startMs: number };

const total = (p: NeonPattern) => p.segments.reduce((s, x) => s + x.ms, 0);

/**
 * ⛔ THE TRACK — level 0..1 at `tMs` after the pattern starts. Pure and
 * deterministic: **authored to the millisecond, not random** (D-087, D-091), so
 * the same moment always looks the same and a screenshot is comparable.
 */
export function neonLevel(p: NeonPattern, tMs: number): number {
  if (tMs < 0 || p.segments.length === 0) return 0;
  const len = total(p);
  let t = tMs;
  if ("loop" in p.tail) {
    t = tMs % Math.max(p.tail.loop.periodMs, len);
  } else if (t >= len) {
    return p.segments[p.segments.length - 1].to;
  }
  let prev = 0;
  for (const s of p.segments) {
    if (t < s.ms) {
      return s.ramp ? prev + (s.to - prev) * (t / s.ms) : s.to;
    }
    t -= s.ms;
    prev = s.to;
  }
  return prev;
}

/** True once a schedule will never change again — the canvas may go idle. */
export function neonSettled(s: NeonSchedule, tMs: number): boolean {
  return "hold" in s.pattern.tail && tMs - s.startMs >= total(s.pattern);
}

// ── The flash cap — asserted in code, not prose ─────────────────────────────

/** A rise of at least this much (level units) counts toward the cap. */
export const RISE_MIN = 0.2;
/** The rule: no more than three rises in any one second, across ALL cards. */
export const FLASH_CAP = 3;

/**
 * ⛔⛔ MOST RISES IN ANY 1000ms WINDOW, ACROSS EVERY SCHEDULE TOGETHER.
 *
 * ⚠⚠ THE BUILDER'S CONSERVATIVE PROXY, NOT WCAG'S TEST — and why it has slack
 * (Architect F6). WCAG's general flash threshold applies only when the flashing
 * area is large: a combined area above ~25% of a 10° visual field. **Two card
 * rims are far below that.** A count of rises ignores area entirely, so it
 * errs safe. ⛔ **Author to ≤2** so Carl can tune without tripping it; if a
 * pattern he likes reports 4, the area argument is the one to weigh — and that
 * is his call, not a reason to quietly alter the pattern.
 *
 * ⚠⚠ IT EVALUATES ACROSS THE LOOP BOUNDARY — Architect F5. A loop is unrolled,
 * and the level at the END of one cycle is the "previous" level for the START of
 * the next. **A check that stopped at the end of the segment array would report
 * 0 for a pattern whose worst window straddles the wrap** — a check that cannot
 * fail on the case it exists for.
 */
export function maxRisesPerSecond(schedules: NeonSchedule[]): number {
  const times: number[] = [];
  for (const { pattern, startMs } of schedules) {
    const len = total(pattern);
    const period = "loop" in pattern.tail ? Math.max(pattern.tail.loop.periodMs, len) : null;
    // Unroll loops far enough for any pair of periods to realign several times.
    const horizon = period === null ? len : Math.max(60_000, 4 * period);
    let prev = 0;
    for (let cycle = 0; cycle * (period ?? Infinity) < horizon || cycle === 0; cycle++) {
      let t = startMs + cycle * (period ?? 0);
      for (const s of pattern.segments) {
        if (s.to - prev >= RISE_MIN) times.push(t);
        t += s.ms;
        prev = s.to;
      }
      if (period === null) break;
    }
  }
  times.sort((a, b) => a - b);
  let best = 0;
  for (let i = 0, j = 0; i < times.length; i++) {
    while (times[i] - times[j] >= 1000) j++;
    best = Math.max(best, i - j + 1);
  }
  return best;
}

// ── The ignition — CANDIDATES ───────────────────────────────────────────────

/**
 * ⛔ CA STRIKES FIRST — a candidate, D-091 records Carl's example (*"the top left
 * the architect card would come on first"*) as an example, not a ruling.
 *
 *   dark 700ms → blip 0.6 → drop → blip 0.5 → an unstable dim 0.12 → ramps to
 *   full at ~1.77s and holds.    Rises at 700, 900, 1770 ms: ≤2 in any second.
 */
const CA_IGNITION: NeonPattern = {
  segments: [
    { ms: 700, to: 0 },
    { ms: 60, to: 0.6 },
    { ms: 140, to: 0.08 },
    { ms: 50, to: 0.5 },
    { ms: 820, to: 0.12 },
    { ms: 180, to: 1, ramp: true },
  ],
  tail: { hold: true },
};

/**
 * ⛔ CB FOLLOWS, WITH ITS OWN CHARACTER — a shorter first blip, a longer gap —
 * so the pair does not read as one pattern copied. Rises at 300, 560, 1390 ms
 * of its own clock.
 */
const CB_IGNITION: NeonPattern = {
  segments: [
    { ms: 300, to: 0 },
    { ms: 40, to: 0.5 },
    { ms: 220, to: 0 },
    { ms: 70, to: 0.7 },
    { ms: 760, to: 0.15 },
    { ms: 220, to: 1, ramp: true },
  ],
  tail: { hold: true },
};

/**
 * ⛔ THE FLOOR PAIR STRIKES AFTER THE WALL PAIR — CANDIDATES. D-091's sequence
 * (*"the next card starts at a chosen offset"*) extended from two cards to four:
 * wall pair, then floor pair, each pair left to right. ⚠ The order is the
 * Builder's; Carl has named only CA first, and only as an example.
 *
 * CD: rises at 500, 720, 1500 ms of its own clock. CS: 350, 600, 1450.
 */
const CD_IGNITION: NeonPattern = {
  segments: [
    { ms: 500, to: 0 },
    { ms: 50, to: 0.55 },
    { ms: 170, to: 0.05 },
    { ms: 60, to: 0.6 },
    { ms: 720, to: 0.1 },
    { ms: 200, to: 1, ramp: true },
  ],
  tail: { hold: true },
};
const CS_IGNITION: NeonPattern = {
  segments: [
    { ms: 350, to: 0 },
    { ms: 45, to: 0.5 },
    { ms: 205, to: 0 },
    { ms: 80, to: 0.65 },
    { ms: 770, to: 0.15 },
    { ms: 240, to: 1, ramp: true },
  ],
  tail: { hold: true },
};

/**
 * ⚠ THE STARTS ARE SPACED SO NO SECOND HOLDS MORE THAN TWO RISES ACROSS ALL FOUR
 * CARDS. Absolute rise times, ms after the trigger:
 *
 *     CA   700   900  1770
 *     CB  2900  3160  3990        (CB's first lands >1s after CA's last)
 *     CD  4900  5120  5900
 *     CS  6750  7000  7850        → all four hold by ~8.1s
 *
 * `maxRisesPerSecond` checks this at module load; the table is the reasoning,
 * the check is the assertion.
 */
export const NEON_SCHEDULES: Record<NeonCardId, NeonSchedule> = {
  ca: { pattern: CA_IGNITION, startMs: 0 },
  cb: { pattern: CB_IGNITION, startMs: 2600 },
  cd: { pattern: CD_IGNITION, startMs: 4400 },
  cs: { pattern: CS_IGNITION, startMs: 6400 },
};
/** When the last card holds — `?reignite` must leave at least a second after it. */
export const NEON_SEQUENCE_MS = Math.max(
  ...Object.values(NEON_SCHEDULES).map((s) => s.startMs + total(s.pattern)),
);

/**
 * ⛔ `prefers-reduced-motion` — A GENTLE FADE-UP, NO STUTTER (D-091). One rise
 * per card, 600ms apart.
 */
const FADE_UP: NeonPattern = {
  segments: [
    { ms: 400, to: 0 },
    { ms: 1200, to: 1, ramp: true },
  ],
  tail: { hold: true },
};
export const NEON_SCHEDULES_REDUCED: Record<NeonCardId, NeonSchedule> = {
  ca: { pattern: FADE_UP, startMs: 0 },
  cb: { pattern: FADE_UP, startMs: 600 },
  cd: { pattern: FADE_UP, startMs: 1200 },
  cs: { pattern: FADE_UP, startMs: 1800 },
};

/**
 * ⚠ RUN ONCE AT MODULE SCOPE, IN DEV, AND FAIL LOUDLY IN THE CONSOLE — Architect
 * F6. ⛔ **It does NOT throw**: a throw blanks the room Carl is judging by eye.
 */
if (process.env.NODE_ENV !== "production") {
  for (const [name, set] of [
    ["ignition", NEON_SCHEDULES],
    ["reduced-motion", NEON_SCHEDULES_REDUCED],
  ] as const) {
    const n = maxRisesPerSecond(Object.values(set));
    if (n > FLASH_CAP) {
      console.error(
        `⛔ NEON FLASH CAP BREACHED — the ${name} schedules reach ${n} rises in one second (cap ${FLASH_CAP}). ` +
          "See maxRisesPerSecond in about-neon.ts: report it to Carl, do not quietly alter the pattern.",
      );
    }
  }
}

// ── The trigger — the wall cards in FULL view (D-092) ───────────────────────

/**
 * ⛔⛔ WHERE CA AND CB SIT ON THE CANVAS, as fractions of its box — DERIVED from
 * the two cards' solved corner quads, not typed. ⚠ The canvas box IS the plate
 * (the plate's own aspect — 2560/1435 in the new room; *corrected in place:* this
 * read `aspect-[3/2]`, the old photograph's), so plate fractions are canvas
 * fractions. **One source of truth: if the cards move, the trigger moves with
 * them.**
 *
 * ⛔⛔ CORRECTED 25 September 2026 (second session) — IT STILL READ THE OLD ROOM. The room swap (D-095)
 * moved the cards and left this on `GUIDE_CA_QUAD`/`GUIDE_CB_QUAD`, the OLD photograph's quads: a band
 * at canvas y 0.116–0.382 while the new wall pair sits at **y 0.307–0.559** — so "in full view" fired
 * with CA and CB still half off the bottom of the window. ⚠ **The sentence above was true and its
 * import was not: "one source of truth" held only for the room it was written in.** Now derived from
 * the new room's own outlines, `ROOM_CARD_GUIDES` (the cards' rims, as the layout projected them).
 * ⚠ It is the LANDING — the neon's ignition, the text's clock, and the moving light's downbeat.
 */
const WALL_POINTS = [...ROOM_CARD_GUIDES.CA, ...ROOM_CARD_GUIDES.CB].map(([x, y]) => ({ x, y }));
export const WALL_BAND = {
  left: Math.min(...WALL_POINTS.map((p) => p.x)),
  right: Math.max(...WALL_POINTS.map((p) => p.x)),
  top: Math.min(...WALL_POINTS.map((p) => p.y)),
  bottom: Math.max(...WALL_POINTS.map((p) => p.y)),
} as const;

/**
 * ⛔⛔ CARL'S TRIGGER — 23 September 2026: *"If Roles is pressed it will
 * instantly take them to Sect 2. What is the Lights start then. Its as if they
 * are responding to the viewer. If a user decides to scroll to Sect 2 when they
 * reach a certain point that should trigger the lights. Maybe when the wall
 * cards come into full view."*
 *
 * ⚠ ONE CONDITION SERVES BOTH PATHS: `Roles` is a plain `#roles` anchor
 * (D-092), so the jump lands with the cards already in view and this is true at
 * once; a scroll makes it true as the band's lower edge clears the window.
 *
 * ⚠ "IN VIEW" IS THE BROWSER WINDOW — `/about` has no fixed header over it
 * (checked: `SiteHeader` is deliberately absent and `AboutNav` is in flow).
 * ⛔ **If a fixed header ever arrives, subtract it here.** 1px of slack absorbs
 * sub-pixel layout. A HIDDEN tab never counts: the ignition would play unseen.
 */
export function wallCardsInView(canvas: Element): boolean {
  if (typeof document === "undefined" || document.visibilityState !== "visible") return false;
  const r = canvas.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const SLACK = 1;
  return (
    r.top + WALL_BAND.top * r.height >= -SLACK &&
    r.top + WALL_BAND.bottom * r.height <= window.innerHeight + SLACK &&
    r.left + WALL_BAND.left * r.width >= -SLACK &&
    r.left + WALL_BAND.right * r.width <= window.innerWidth + SLACK
  );
}

// ── The channel — how one writer reaches a card's materials ─────────────────

export type NeonCardId = "ca" | "cb" | "cd" | "cs";

/**
 * ⛔ ONE CARD'S NEON: its colour and peak, and the two materials the writer
 * drives. `AboutCardMesh` registers the materials; `NeonBloom` writes them on
 * the same frame it renders (the opal's *"one clock, both effects"*).
 *
 * ⚠ THE MATERIALS ARE DEPTHS ON ONE TRACK (D-091): the rim's emissive (the
 * tube, seen), the emitter's colour (the bloom's source) and — since 24 September
 * 2026, CA only behind `?etch=1` — the ETCHED TEXT's glow (D-094). ⛔ *Corrected in
 * place: this read "the text's reflection joins later".* Spill is still to come.
 */
export type NeonChannel = {
  id: NeonCardId;
  /** The GLOW colour (the emitter, the bloom's source), linear working space. */
  color: THREE.Color;
  /** The TUBE colour (the rim's emissive) — see `NEON_TUBE_HEX`. */
  tubeColor: THREE.Color;
  peak: number;
  rim: THREE.MeshPhysicalMaterial | null;
  emitter: THREE.MeshBasicMaterial | null;
  /**
   * ⛔ THE ETCH'S GLOW MESH — additive, so it ADDS light rather than covering
   * (Architect F1). Registered by `AboutCardMesh` only when the card has `etch`
   * AND a channel; the writer sets its colour every frame. See `card-etch.ts`.
   */
  textGlow: THREE.MeshBasicMaterial | null;
  /** The glow's colour — the TUBE's by default (Architect S4). */
  textColor: THREE.Color;
  /** Its share of `peak × level`. 0 on every card without etch. */
  textDepth: number;
};

// ── URL faders — ONE reader (the shared-accessor rule) ──────────────────────

/** A raw query parameter, or null on the server / when absent. */
export function neonParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

/**
 * A numeric fader within `[min, max]`; anything else falls back to `fallback`.
 * ⚠ `Number("")` is 0 — a bad value must not look like a deliberate dark neon.
 */
export function neonNumber(key: string, fallback: number, min: number, max: number): number {
  const raw = neonParam(key);
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/**
 * `?neonhex=1b4789` / `?neontube=…` (no `#`). Falls back unless it is exactly
 * six hex digits.
 */
export function neonHex(fallback: string, key = "neonhex"): string {
  const raw = neonParam(key);
  return raw && /^[0-9a-f]{6}$/i.test(raw) ? `#${raw}` : fallback;
}

/**
 * ⛔ THE MODE — Architect F4. The namespace is cut so D-087's reserved numeric
 * freeze has a home:
 *
 *   ?neon=none      not mounted — the HEAD render path (the identity gate only)
 *   ?neon=off       mounted, held at level 0
 *   ?neon=full      mounted, held at full, no ignition — static tuning
 *   ?neont=<ms>     the track FROZEN at t ms after the trigger (D-087's control)
 *   (default)       ignition ONCE, when the wall cards are fully in view
 *
 * ⚠ `?reignite=<ms>` is a TUNING tool: it strikes on load and every N ms after,
 * regardless of the view — so Carl can watch the ignition repeatedly.
 */
export type NeonMode =
  | { kind: "none" }
  | { kind: "off" }
  | { kind: "full" }
  | { kind: "freeze"; tMs: number }
  | { kind: "ignite"; reigniteMs: number | null };

export function neonMode(): NeonMode {
  const neon = neonParam("neon");
  if (neon === "none") return { kind: "none" };
  if (neon === "off") return { kind: "off" };
  if (neon === "full") return { kind: "full" };
  const freeze = neonNumber("neont", -1, 0, 3_600_000);
  if (freeze >= 0) return { kind: "freeze", tMs: freeze };
  /* ⚠ A replay shorter than the whole sequence plus a second of rest would stack
     ignitions and could breach the flash cap. ⛔ The floor is DERIVED from the
     schedules (four cards: ~8.1s → 10s), and a shorter request is CLAMPED UP
     rather than ignored — a silently-dropped `?reignite=5000` would look like a
     broken trigger. */
  const floor = Math.ceil((NEON_SEQUENCE_MS + 1000) / 1000) * 1000;
  const re = neonNumber("reignite", -1, 1, 600_000);
  return { kind: "ignite", reigniteMs: re > 0 ? Math.max(re, floor) : null };
}
