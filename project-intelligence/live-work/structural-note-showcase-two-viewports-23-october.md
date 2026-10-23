# Structural note — film 4's showcase page, two viewports in height (23 October 2026, session 2) — VERSION 2

**For:** Carl, to route to the Architect. **Status:** ✔ BUILT on Carl's word (*"Build it now"*, 23 October, session 2) —
option A as written; the Architect's review not awaited (Carl's call). The build's record: D-088's entries for the lift and
the page. ⚠ Two additions while building: the judging studio and the front framing became ONE source (`JUDGING_STUDIO`,
`frontDistance`) for the bench and the page; the no-WebGL fallback hears `webglcontextcreationerror` (R3F's setup fails
outside React — the deadline alone took 10 s).
**Versions.** **2 (23 October, session 2): CARL's ANSWERS** — *"in viewport 1 will be "your company" Static and lit by static
light. In viewport 2 will be "your company logo" Travelling light with logo animation. Call the page by an appropriate
name."* → each piece in its OWN viewport with its OWN light; **no light crosses between them, so option A's one caveat is
answered and A stands.** The name delegated to the Builder: **`/proto/your-words`, titled "Your words, given form"** (the
film's own title; a client reads the link). **1:** the options, the lift, §5b.
**Carl:** *"Lets build a page with 2 viewports."* The brief on record (D-088, 22 October, session 2): *"lets make it 2 viewports
in height. It will act as a showcase for modern web development"* — three.js text and WebGL lighting first, themed stock
images later; a `/proto` link a client can be sent (noindex, kept so at launch); copy in the client's voice. Two pieces
(23 October): **"Your company" — the LINE, static (lettering and light)**; **"Your company logo" — the ARCH, a roving light,
animated** (pass 3). One material on both (brushed brass, pass 2 — positive verdicts, not approved: the true judgement
waits for the HDRI and the light together).
**CLAUDE.md §5a triggers:** a new page holding WebGL (how many contexts, what owns them); the measurement and build code
used by a SECOND consumer (one mechanism or two); the bench's lifetime unchanged or moved. §5b below.

## What exists today

`/proto/showcase` is the BENCH (`showcase-bench.tsx`): ONE canvas, ONE piece at a time (`?layout=line` or the arch), a
60 vh box, `frameloop="demand"`, judging cameras (front perspective framed to 70% / oblique with orbit), Neutral tone
mapping set on the live renderer in the material mode, a studio turn per piece (line 305°, arch 355°), every dial on the
URL. The words are MEASURED in the DOM (hidden kern-on / kern-off spans, `measureLabel`, `fontProof`, the arch's collision
check) — and the kern-on spans ARE the words' accessible text (D-051-A11Y must not repeat).

## Options for how the two pieces are drawn

| | Contexts | For | Against |
|---|---|---|---|
| **A. A canvas per piece, each in its own section, scrolling WITH it** — **proposed** | 2 | Each canvas the size of its section (one screen) — never a 2-screen buffer; no scroll sync, so no lag behind the page; **each its own frame loop: the static line renders ON DEMAND (a frame when something changes, then nothing), the arch runs continuously only while on screen (pass 3)** — the line costs nothing per frame; the corners' precedent (D-100: a canvas per section's grid, scrolling with it) | Two contexts (context creation measured at ~67 ms blocked on this machine — §5a worked case 2: paid ONCE per piece at mount, never per step here); two PMREMs of one studio; one light cannot cross from one piece to the other (not asked for) |
| **B. One canvas the page's full height (2 screens), absolute** | 1 | One context, no scroll sync | A drawing buffer TWO screens tall (×4 pixels at DPR 2) drawn every frame the arch animates, the off-screen half included, unless scissored — machinery to recover what A gets free |
| **C. One FIXED full-window canvas, the pieces placed from DOM rects each scroll frame** (drei `View`) | 1 | One context, one studio | The pieces lag the page by a frame while scrolling — the fault class `/start`'s persistent host engineered around (D-046/D-048) and the corners note rejected; the `position: fixed` containing-block trap (context-rules, 18 August); the static line would re-render on every scroll frame |
| **D. A second piece on the bench's canvas** | 1 | Reuses the bench | The bench is an instrument (judging cameras, dials, clay modes, regression frames); a client page inside it couples the two and moves the bench's baseline |

**Proposed: A.** Two contexts on a page that has none today, each paid once; the static piece free after its first frame.
✔ ~~If pass 3's light is to MOVE BETWEEN the two pieces, A is wrong~~ — **answered (v2): each viewport its own light.**

## One mechanism, not two

The measurement (spans, `measureLabel`, `fontProof`, kerned pairs, the font-load check), the arch's layout and collision
check, the per-letter build and the brushed metal live INSIDE `ShowcaseBench` today. The page needs all of it.
**Proposed: lift them into shared code** (`components/showcase/` — a measuring hook and a piece component that builds and
draws one lockup), used by BOTH the bench and the page. ⛔ Not a second copy: two copies of the font proof would drift.
⚠ **The bench's behaviour must not move:** its 20 regression frames (`film04-pass2-baseline-23-october.mjs compare`) and
the material frames are re-captured and compared pixel-for-pixel after the lift, before the page uses it.

## Lifetime

- The bench is unchanged: same route, same switches (every recorded URL keeps working).
- The page is a NEW route — **`/proto/your-words`, "Your words, given form"** (v2; noindex, its own `robots`) — so the
  bench's URLs recorded in D-088 and the handoffs are not broken.
- Each canvas mounts once with the page and is never keyed by state; nothing survives navigation.

## §5b — what the bench provides that the page must keep, and how

| The bench provides | On the page |
|---|---|
| Nothing built on a stand-in font (the font check, the proof) | Kept — the same shared code; a failed check shows the DOM words, not a wrong mesh |
| The words' accessible text (the kern-on spans, in reading order) | Kept — the page's spans ARE the text, as on the bench: "Your company", then "Your", "company logo" |
| The arch's collision check | Kept, run once on mount (no sliders on the page) |
| A frame only on change (`demand`) | The line: kept. The arch: `demand` until pass 3 animates it |
| Neutral tone mapping, set on the live renderer | Per canvas — each its own renderer (A); a judging choice until pass 3 rules the page's |
| The studio turn per piece (305° / 355°) | Carried as each piece's own value |
| The site's scale (D-097: layout px, `offsetSize`, `--vh`) | Kept — the canvases size from their sections in layout px, as every shipped canvas does |
| Framing (70% of the box, judging cameras) | ⚠ NOT carried — a page frames by design: each piece's size and place in its viewport is Carl's (below) |
| Reduced motion | Not in this chunk (mastering, D-094); the static line is already still |

## Carl's design (v2)

- **Viewport 1: "Your company"** — STATIC, lit by a STATIC light.
- **Viewport 2: "Your company logo"** — a TRAVELLING light, and the logo ANIMATED.
- Each piece centred in its viewport until Carl places it; the ground the bench's near-black (`#0a0a0a`) — ⚠ unanswered,
  a default.
- ⚠ **Until pass 3 the lights are not built:** each piece is lit by the judging studio alone at its own turn (305° / 355°),
  Neutral tone mapping. The static light, the travelling light and the animation are pass 3's, designed on this page.

## Couples to

`components/showcase/*` (the lift), `app/proto/your-words/` (a new route), `lib/studio-hdri.ts` (one cached texture,
two PMREMs under A), `lib/use-site-scale.ts`. No approved layer. No site page. Protected files untouched.
