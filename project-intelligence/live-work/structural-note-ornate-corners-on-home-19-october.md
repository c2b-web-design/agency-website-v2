# Structural note — the ornate corners on the home page (19 October 2026) — VERSION 6

**For:** Carl, to route to the Architect (Carl: *"we will consult the architect, get another pair of eyes on it."*).
**Status:** PROPOSED — nothing built on the page. The bench (`/proto/corner`) is approved through pass 2.
⛔ **VERSION 6 IS FINAL (Carl, 19 October, session 2):** *"Version 6 is the last one. When 2 AI debate the merit of something
we could be here until the cows come home"* — the pre-review rounds are CLOSED; the next eyes are the Architect's.

**Versions, newest first.** **6 (19 October, session 2):** REVIEW 5 folded in — the no-JS rule as `@media (scripting:
none)`; TWO components (an SSR'd wrapper, an `ssr: false` canvas); the deadline measured on a cold deep link and arrival
starting setup at once; shaders compiled in setup; frames stopped on fallback (section at the end). **5:** REVIEW 4 — the
fade's alpha kept to the approved opaque edge; the fallback made one-way, given a deadline, its colour source defined.
**4:** REVIEW 3 folded in — Carl's NO-BORDER ruling written INTO the body (decisions 4, 5,
§5b, couples-to, files), no longer appended; mount-once, early arrival, the fade's material settings stated (its section).
Its points 2–4 were put to Carl and ANSWERED the same session (*Asked of Carl*): bare text before arrival is the
designed opening; a transparent border; a 1-px fallback border in the section's colour (gold §2, blue §3) wherever the
corners cannot draw — no WebGL, a lost context, no JS. **3:** review 2 + **Carl's four answers to it**. **2:** a pre-review folded in, each point checked against the code (✔ verified, ⚠ corrected), + Carl's
two answers (the hero; the fade). Earlier versions in git (`f2a6aff` v1, `3066eaf` v3).
**CLAUDE.md §5a triggers:** new instances of an expensive resource (WebGL contexts) on a page that has one today; a new
mechanism (runtime relief-building from an image); state that outlives a page (a module cache); an overlay over approved
sections. §5b enumeration below.

## What is being put on the page

D-100: four ornate corners per box and NO line border — *"The box shape is implied by the corners"* (Carl) — **§2's four boxes in gold (16 pieces), §3's three in platinum blue
(12 pieces): 28.** One shape (pass 1, R-081: Carl's acanthus bracket traced as a relief, a 24-layout-px reach, the long arm
along the top), the colour and material per section (pass 2: satin gilt R-082; enamel over metal R-083 — *"a bit dark… on the
page… we should be able to remedy that"*). Pass 3, the light — *"very subtle light… very little motion"* — is designed on the
page, which is why the structure comes first.

**What one corner is today:** a 12,697-vertex / 24,520-triangle mesh (the mass), a 406 × 201 object-space normal map (the
carving), a 406 × 201 mask (the outline, `alphaTest`), the family buttons' studio HDRI as its reflection. Built in the browser
from the source photo (`brand-assets/c4bf3a09-…jpg`, **50 KB**) by `buildCornerRelief` in ~60–90 ms on Carl's machine.

**⚠ THE TOTAL, which version 1 never multiplied (pre-review 6):** 28 × 24,520 = **≈ 687,000 triangles (≈ 355,000 vertices)**
every frame while the light moves. And they are SMALLER THAN A PIXEL: the mesh steps 2 photo px at `stats.scale` = 0.176
layout px per photo px — **0.35 layout px a cell, ≈ 0.48 screen px at Carl's zoom 1.36.** The normal map already carries that
detail. A coarser step (6 photo px ≈ 1 layout px) would cut the count by about nine — ⛔ **but pass 1's shape is approved, so
that is a BENCH TAKE for Carl's eye, not a quiet optimisation.** A frame time measured on the page goes in the build's record.

**What the home page runs today:** ONE WebGL context — the teal `Who we are` button (§4). It rolls and carries a moving lamp,
so it draws continuously WHILE ON SCREEN (the `Ticker`, `whoweare-button-scene.tsx`, gated by `canvasOnScreen`; still under
reduced motion), a still painted first and swapped pixel-identically (R-051). ✔ It reaches the page as a `next/dynamic` chunk
with `ssr: false` (`whoweare-button.tsx`), so three.js is not in the first-load bundle.

## Options for how the 28 are drawn

| | Contexts on home | For | Against |
|---|---|---|---|
| **A. A canvas per box** (7) | 8 | Each canvas the box's size | ⛔ 7 more contexts, each paying context creation (the Next step button measured **67 ms** blocked in `CommandBufferProxyImpl::Initialize`, §5a worked case 2), 7 PMREMs of one studio, 7 copies of the textures. **Rejected.** |
| **B. A canvas per section's GRID** (2) — **proposed** | 3 | Each canvas absolute over its section's grid of boxes, scrolling WITH it (no scroll sync); one scene, one PMREM, one upload of the corner per context; each gated on screen independently | Two contexts, not one; the two scenes are separate (one light cannot cross §2 → §3 — not asked for) |
| **C. One fixed canvas over both sections** (1) | 2 | Fewest contexts | A `position: fixed` canvas must re-place every corner every scroll frame from DOM rects — the corners lag the text by a frame (the class of fault `/start`'s persistent host had to engineer around, D-046/D-048), and the `fixed`-containing-block trap (context-rules, 18 August) applies. Machinery out of proportion to one context saved. |
| **D. No WebGL — pre-rendered stills** | 1 | Cheapest | Against the brief: a still cannot carry pass 3's moving light. |

⚠ **THE HERO (pre-review 10 — Carl's to answer):** the hero is *"the killer feature… we are going to pull out all the stops"*
(D-099) and D-098 already records a film with a code logo laid over it — the extruded headline and the logo sharing ONE three.js
scene. **If the hero is WebGL, B means FOUR contexts on the home page, not three.**
✔ **ANSWERED BY CARL (19 October): YES.** *"as the logo comes into code world it will have a light attached to it. It will be
animated and change colour from gold to blue. The subsequent colour changes will affect yhe text on the Left."* ⛔ **So under B
the home page runs FOUR contexts: the hero, §2's grid, §3's grid, the teal button** — and under C three. ⛔ **The Architect weighs
B vs C with the hero's canvas in view.** (The hero's canvas is full-window and continuous while on screen; the corners' are
gated on their own grids — at most two of the four draw at once, by scroll position. Stated, not measured.)

**Proposed: B.** Two canvases, each a sibling of its section's grid inside a `relative` wrapper around the grid,
`absolute inset-0`, `pointer-events-none`, `aria-hidden`; 28 separate meshes (four mirrors per box — three.js turns the winding
per object for a negative determinant; 28 draw calls is trivial; an `InstancedMesh` would need its own handling).

## Decisions inside B

1. **⛔ THE CANVAS IS SCOPED TO THE GRID, NOT THE SECTION (pre-review 1, adopted).** Version 1 put it `inset-0` in the
   `min-h-[100*var(--vh)]` section — a FULL WINDOW per canvas, antialiased, mostly empty, cleared and composited every frame of
   pass 3. ⚠ *Corrected figure:* at Carl's window (1920 × 952, DPR 1, zoom 1.36) that is ≈ 1905 × 952 device px each (the
   pre-review's "1440 × 900 at DPR 2" is not Carl's setup; the point stands). Over the grid, §3's canvas is about a quarter of
   that. The corners only ever sit inside the boxes' rects.
2. **PLACEMENT, ONE SOURCE OF TRUTH — and the observer's blind spot (pre-review 2, adopted).** `ResizeObserver` does NOT fire
   when a box MOVES without resizing — and in a `flex items-center` section the grid's position depends on everything above it
   (the heading's wrap, `text-balance`, the webfont swap, the intro). Scoped to the grid, the corners' positions depend only
   on the boxes' sizes and the column tracks, which the observer does cover. ✔ And re-measure after `document.fonts.ready`,
   as the button does (`whoweare-button.tsx`). Rects via `getBoundingClientRect` → `toLayoutPx` (D-097); never typed.
3. **FRAMES — the button's `Ticker`, reused (pre-review 11).** Not "`frameloop="demand"`" alone, which would read as a
   contradiction beside a moving light: `demand` plus the `Ticker` — continuous only while that grid is on screen; still
   under reduced motion.
4. **⛔ THE BOXES HAVE NO VISIBLE BORDER; WHO OWNS THE REVEAL (Carl: *"The line border doesnt have to be there now. The box
   shape is implied by the corners."*).** `app/page.tsx` is a SERVER component; the boxes' visible `border-neutral-800` goes
   from the server HTML: ✔ **the border is KEPT but TRANSPARENT** (`border border-transparent` — Carl, review 3 answers), so
   every box keeps the exact geometry the corners were judged against. Each box is MARKED explicitly (`data-corner-box`, not a structural selector). The new `relative`
   wrapper round each grid is the CLIENT component, the server grid passed in as `children`; it owns the reveal state (which
   boxes' corners have faded in) and drives ONLY the corners' per-box fade uniforms — no server-rendered node is changed
   imperatively. The trigger is ARRIVAL (decision 5), box by box.
   ✔ **THE FALLBACK (Carl: *"there should be a fallback for visitors with no WebGL. The 1px border is the fallback, if it can
   be coloured gold, all the better. The text should be framed for them."*):** when WebGL is unavailable or the context is
   lost, the wrapper sets `data-corners="none"` and ONE CSS rule in `app/globals.css` colours that grid's 1-px border —
   a colour change only, no layout change. ✔ **Colour by section (Carl: *"Fallback border is colour dependent. Gold for 2
   blue for 3. The text should be framed in all circumstances."*):** §2 GOLD, §3 PLATINUM BLUE. The colour comes from an
   attribute the SERVER renders — the wrapper (a client component, still server-rendered — decision 8) carries
   `data-corner-colour="gold"` / `"blue"`, which feeds both rules below (review 4.5).
   ✔ **No-JS visitors framed too.** ⚠ The rule CANNOT use `data-corners="none"` (only JS sets it): it targets the boxes
   directly (`[data-corner-colour="gold"] [data-corner-box]`, likewise blue) (review 4.5). **Mechanism (review 5.1): a
   media query in `app/globals.css` — `@media (scripting: none) { … }`** — one file, one mechanism beside the JS rule (a
   stylesheet has no notion of `<noscript>`; v5's "noscript twin in globals.css" was not buildable). ⚠ **Unverified here:**
   `scripting` is believed supported in all current engines — checked against MDN / caniuse in the build before relying on
   it; if it is not, an inline `<noscript><style>` in `app/page.tsx` instead.
   ⛔ **THE PRINCIPLE (Carl): *"no matter how the page renders or the users device limitations the text shouldnt be
   borderless. In this case which is an info dump it shows order, pattern etc."*** The frame carries the content's ORDER, so
   it is not decoration to drop when something fails. ⛔ **So the fallback triggers on "the corners did not draw", not on "no
   WebGL":** ANY failure in setup — no context, a lost context, the HDRI or the source photo failing to fetch or decode, the
   relief build throwing — sets `data-corners="none"`. ⚠ *Corrected (review 4.4):* a browser's context CAP does not refuse a
   new context — Chrome EVICTS the OLDEST, which gets a lost event; so a cap lands on whichever canvas is oldest (perhaps the
   hero or the button), and reaches the corners only through the lost-context path. Four contexts do not reach Chrome's limit.
   ⛔ **ONE-WAY (review 4.2):** once a grid falls back it STAYS on the border for the life of the page and its canvas is
   HIDDEN — a restored context does not bring the corners back over a showing border, and a failure mid-sequence sends the
   whole grid to border (no box keeps corners). No handover, ever.
   ⛔ **…AND ITS FRAMES STOP (review 5.6).** Hiding is not enough: `canvasOnScreen` tests only the rect and the tab
   (`lib/canvas-on-screen.ts`), and a `visibility: hidden` canvas keeps its rect, so the `Ticker` would draw frames nobody
   sees. On fallback the frames are stopped EXPLICITLY (the `Ticker` unmounted / `frameloop="never"`); the context may also be
   released (`forceContextLoss`) — still mount-once, the canvas element stays.
   ⛔ **A DEADLINE (review 4.3) — slow is not failed:** a stalled HDRI fetch or a slow phone never errors. If the corners are
   not READY `N` ms after ARRIVAL, the grid falls back (one-way). `N` a tuning value, **proposed ~1000–1500 ms**.
   ⛔ **Measured against a COLD DEEP LINK on a throttled connection (review 5.3)**, not only a slow CPU: an external link or a
   refresh at `/#work` arrives AT LOAD, so `N` covers the network — the three.js chunk and the **1.56 MB HDRI** (1,562,415
   bytes, measured). On mobile data 1–1.5 s will often expire. (A client-side jump from `/about` is warm: its gold button has
   already loaded three.js and the same HDRI.)
   ⛔ **ARRIVAL STARTS SETUP AT ONCE (review 5.3)** — overriding any wait for the hero (Architect item 6), so the page's own
   deferral never spends the deadline. The clock starts at arrival.
   ⚠ **FOR CARL (review 5.4 — his words were stretched):** he accepted *"the few hundred ms"*; `N` is proposed at 1–1.5 s, and
   *"a device slower than `N` sees the border, never the corners"* is the Builder's inference from his principle. Both put
   to him — *Asked of Carl*, item 6.
   ✔ **Accepted gap (Carl: *"Yes the gap is fine"*, on "the few hundred ms"):** the moment between arrival and the corners
   being ready shows the text alone — the designed opening, not a failure.
   ⚠ Unverified, for the build: Windows High Contrast (`forced-colors: active`) is expected to paint the transparent border
   in the system colour by itself — and the canvas still draws, so those visitors get BORDER AND CORNERS. Probably acceptable;
   stated so it is not a surprise (review 4.7). The exact CSS colours are judged by eye (the corners' gilt reads darker than
   its F0; the blue's enamel darker than #3F6DB8).
   ⚠ **Rejected:** making the boxes themselves client components — it changes their lifetime (§5a).
   *(History: v2–v3 kept the border in the server HTML and hid it box by box; superseded by Carl's ruling.)*
5. **THE COLD LOAD (pre-review 5).** ✔ Smaller than version 1 implied: §2 and §3 sit below a full-window hero, and `demand`
   draws one frame on mount whether on screen or not (the `Ticker` gates only the frames after), so on a normal arrival the
   corners are drawn long before anyone scrolls there. **The case that matters is the COLD DEEP LINK** — an external
   link or a refresh at `/#services` or `/#work` lands on the section with nothing loaded. (The header nav from `/about` is
   warm — its gold button has loaded three.js and the HDRI; decision 4.) Design and measure for the cold case. With no border (decision 4),
   what is seen first is the boxes' TEXT ALONE, until the sequence starts. ⚠ Version 1's *"a fade, on an existing beat"* is
   dropped — these sections have no beat.
   ✔ **ANSWERED BY CARL (19 October) — A FADE, BOX BY BOX:** *"We have used fading before to get round problems. Yes, they can
   fade in and even be viewed sequentially. There are 4 and 3 boxes. This is feasible, in fact it would add to the effect
   instead of them all just being there when navigated to."* → the corners FADE IN, ONE BOX AFTER ANOTHER (§2's four, §3's
   three), when the grid is arrived at — so the sections GAIN a beat of their own. ⚠ **New for the build to settle (pass 3):**
   the order and the pace (`/start`'s phrasing, D-023, is the precedent). Replay (none) and reduced motion (delegated) are
   settled — Carl's answers to review 2, below. There is no border handover (decision 4).
6. **WHERE THE RELIEF IS BUILT — weighed on equal terms (pre-review 7).**
   - **(a) Runtime from the photo, module cache.** One source of truth. ⚠ Costs: a NEW download (the 50 KB JPG — version 1's
     "no download" was true of the HDRI only); its decode and `getImageData`; then ~60–90 ms as ONE long task on Carl's
     machine, several times that on a phone — unmeasured.
   - **(b) Baked offline into `public/`** (normal map, mask, mesh). No runtime cost. ⚠ Version 1 weighed it unfairly against
     R-051's stills: those are rendered pixels compared by eye; a baked relief is a DETERMINISTIC function of the photo and
     `CORNER_DEFAULTS`, so a verify script can rebuild and byte-compare it — drift becomes detectable.
   - **(c) A Web Worker** — one source, off the main thread. A new mechanism; §5a review if chosen.
   **No recommendation pressed** — for the Architect. Whichever: measured on the page, phone throttling included.
7. **⛔ THE CACHE'S LIFETIME (pre-review 8).** A module-level cache OUTLIVES the page: home → `/about` → home reuses it. Right,
   but it is *"state that survives a boundary"* (§5a) — stated here. **Disposal: never — it lives for the browser session.**
   (The bench disposes on unmount, `corner-bench.tsx`; a shared cache cannot, or it would free objects other renderers hold.)
   GPU uploads stay per context and are freed with their renderer.
8. **LAZY LOADING (pre-review 9) — ⛔ TWO COMPONENTS (review 5.2).** The WRAPPER (`components/home/corner-frame.tsx`, a
   client component) RENDERS ON THE SERVER and NEVER imports three.js: it holds the server grid as `children`, carries
   `data-corner-colour`, owns the reveal state and the fallback. INSIDE it, the CANVAS (`corner-canvas.tsx`) is a
   `next/dynamic` chunk with `ssr: false`. ⛔ **If they were one component with `ssr: false`, the grid's TEXT would drop out
   of the server HTML** — no-JS visitors would lose the content itself, and `data-corner-colour` would never reach them. The
   precedent is in the repo: `whoweare-button.tsx` (SSR'd) holds `WhoWeAreScene` by `dynamic(…, { ssr: false })`.
9. **THE HDRI.** ✔ Already fetched by the teal button at the SAME `room` (0.1) — `loadStudioHdri` caches one fetch and one
   decode per URL and room; each context builds its own PMREM.

## §5b — what the current structure provides, and how each is preserved

| Provided today | How it is preserved |
|---|---|
| The boxes' 1-px border separating them | Not SEEN when the corners draw (Carl: the corners imply the box) — ✔ it becomes the FALLBACK: gold §2 / blue §3, shown whenever the corners cannot draw (decision 4) |
| ⛔ **The border's 1 px of LAYOUT each side** (review 3.4) | ✔ **Preserved — `border-transparent`** (Carl). No box changes size; the clearances below stand as measured. (Removed, each box would have been 2 px shorter and every clearance 1 px less) |
| ⛔ **What every visitor sees FIRST** (review 3.2) | Every visitor sees the top of each grid scroll in as BARE TEXT until the grid's centre crosses the line — on a phone a whole box or more. ✔ **The designed opening (Carl): *"When a visitor crosses the threshold they can appear literally framing the content."*** |
| The sections' layout, centring and measured vertical balance | The canvas is absolute — out of flow. ⚠ The wrapper is new markup round the grid: re-measured after the build |
| ⛔ **No section or grid is `position: relative` today** (pre-review 3) | Adding it to the grid's wrapper makes `inset-0` work — and makes the wrapper the containing block for ANY future absolute descendant. Stated so it is not discovered |
| ⛔ **Paint order** (pre-review 3) | A positioned canvas paints ABOVE the non-positioned text. Harmless here (`pointer-events-none`, no overlap) — but it is the "provided by where it sits" case: anything later placed under it in the grid paints beneath the corners |
| Text selection, reading order, screen readers | `pointer-events-none`, `aria-hidden`; the text untouched |
| The clearance between ornament and text | ✔ **MEASURED NOW, not at mastering (pre-review 11)** (`home-box-corner-space-19-october.mjs <width>x<height>`): Carl's window 35 layout px; tablet 768 px 35; ⛔ **phone 390 px: 27 — the 24-px reach leaves ~3 px of air.** Below 768 px the boxes' padding drops from `p-8` to `p-6`. A known risk, measured. ✔ **Carl, 19 October (session 2): "Phone is left for mastering."** — not this chunk's (D-094) |
| §3 at tablet width | At 768 px §3's boxes are 219 px wide (three columns): two 71.5-px long arms take 143 of 219 — measured, judged at mastering (D-094) |
| The `#services` / `#work` anchors and the header nav | Unchanged |
| D-097's zoom | Canvases in LAYOUT px (`offsetSize`), DPR × zoom (`useCanvasDpr`), rects via `toLayoutPx` |
| The teal button's own context, still and swap in §4 | Untouched — a separate component in a separate section |

## What it couples to

`lib/studio-hdri.ts`, `lib/canvas-on-screen.ts` and the `Ticker` (`whoweare-button-scene.tsx`), `lib/site-scale.ts` /
`use-site-scale.ts`, `components/home/corner-geometry.ts`, `app/page.tsx` (two grid wrappers, two mounts, the boxes' border
classes), `app/globals.css` (the gold / blue fallback rule and its `@media (scripting: none)` twin), `brand-assets/c4bf3a09-…jpg` (tracked).

## Files the build would touch (for Carl to name)

`app/page.tsx`, `app/globals.css` (the gold / blue fallback rule, JS and no-JS), a new `components/home/corner-frame.tsx` (the
SSR'd wrapper), a new `components/home/corner-canvas.tsx` (the `ssr: false` canvas it imports dynamically), a new `components/home/corner-material.ts` (the
material values out of the bench so the page and the bench read one copy), `components/home/corner-geometry.ts`,
`corner-bench.tsx`; and — if (b) — a bake script and its outputs in `public/`.

## VERSION 3 — REVIEW 2 FOLDED IN (19 October)

Carl's two answers (the hero is WebGL; the corners fade in box by box) create the new issues. Each checked.

- **⛔ THE FADE'S METHOD (review 2.1) — a plain `opacity` fade would ERODE, not fade.** ✔ Verified in three.js: `diffuseColor.a`
  starts as `opacity`, the alpha map multiplies into it, then `alphaTest` (0.5) discards — so nothing shows until ~0.5, then
  the outline grows out from the mask's thick parts. **Method:** a per-box FADE UNIFORM multiplied into the alpha AFTER the
  test (one program; a material or uniform per box — four in §2, three in §3). ⛔ *v6 (review 5.5) — COMPILED IN SETUP,
  NOT AT THE FADE:* the meshes RENDER FROM THE FIRST FRAME at fade 0, never `visible={false}` until the reveal (three.js
  skips invisible objects, so their programs would link on the frame the fade starts — the answer cards' *"Q5 stalls"*);
  and NO custom program cache key (`answer-card-mesh.tsx` records one taking the worst frame gap ~150 → ~620 ms) — the
  injected source is identical across boxes, so they share a program and each box's fade is its own uniform. ⚠ *v4/v5:* `transparent` stays ON
  PERMANENTLY, and after the test the alpha is the FADE ALONE, not mask × fade (reviews 3.7, 4.1 — the v5 section).
- **Decisions 4 and 5 reconciled (review 2.2–2.4):** decision 4 above, rewritten (again in v4, for the no-border ruling).
  *"Drawn long before anyone scrolls there"* now means only that the corners are READY by arrival — not what is seen.
- **"ARRIVED AT" DEFINED (review 2.5) — for Carl and the build:** not `canvasOnScreen` (one pixel visible — most of the
  sequence would play below the fold). Proposed: the grid's CENTRE crossing a line in the window (a threshold to tune).
  ✔ Agreed by Carl; replay ONCE per load, reduced motion delegated — his answers below.
- ~~**The border's handover (review 2.6)**~~ — WITHDRAWN: there is no border to hand over (Carl's answer 4).
- **⛔ STARTUP COLLIDES WITH THE HERO'S OPENING (review 2.7 — the one most likely to change the structure).** At load, the
  corners' SETUP (not drawing) lands in the first seconds of the hero: up to two more context creations (~67 ms each, the
  Next step button's figure), their PMREMs, the relief build (60–90 ms; more on a phone), the HDRI decode. The arrival-
  triggered fade removes the need to draw early, so **the corner canvases can MOUNT ON APPROACH** — an `IntersectionObserver`
  with ~one window of margin, and/or not before the hero's first frame. ⚠ **A small new mechanism, stated as one.** The deep
  link still mounts at once (the grid is already on screen). ⛔ *v4:* mounted ONCE, never unmounted (review 3.5).
- **THE DEEP LINK'S WAIT, STATED (review 2.8):** on `/#services` or `/#work` the sequence starts only after the context, the
  HDRI, the build and the first frame; until then the boxes show their TEXT ALONE (no border — v4). The build's measurement
  reports the time from navigation to the first box starting.
- **Smaller (review 2.10):** ✔ the mask has no mipmaps (`LinearFilter`) and is shrunk ~4× (406 texels → ~97 screen px) — a
  cut-out under that can step; approved at true size, so watched only if a coarser-mesh take changes the edge. **Four
  contexts on PHONES (memory per context; iOS Safari) are untested** — flagged with D-094.

## CARL'S ANSWERS TO REVIEW 2 (19 October) — these SETTLE the open points above

Carl: *"1. I agree 2. no, just once. When they arrive they stay there. 3. Whatever is best for visitors in that paryicular
situation. 4. The line border doesnt have to be there now. The box shape is implied by the corners."*

1. **"Arrived at" = the grid's CENTRE crossing a line in the window** (the line a tuning value) — agreed.
2. **ONCE PER PAGE LOAD — no replay.** *"When they arrive they stay there."* Scrolling back or away leaves them in place.
3. **Reduced motion — delegated to the Builder ("whatever is best for visitors"):** no sequence and no stagger; all of a
   section's corners appear together with ONE SHORT OPACITY FADE (~300 ms). Reduced-motion guidance targets movement (travel,
   scaling, parallax), not a gentle fade; a fade is kinder than a pop. A take, stated so it can be changed.
4. ⛔ **NO BORDER AT ALL — no handover.** *"The box shape is implied by the corners."* Written into decision 4 and §5b (v4).
   ⚠ **Its consequences were NOT put to Carl with the question** (review 3.2–3.3): bare text is every visitor's opening, not
   an edge case; no-WebGL, lost-context and no-JS visitors would see bare boxes PERMANENTLY. ⚠ *v3 recorded these as
   "accepted by Carl's ruling" — that went further than his words; withdrawn.* ✔ Asked directly and ANSWERED — *Asked of
   Carl*, items 3–5: the bare opening is designed; the border transparent; a fallback border in the section's colour.

## VERSION 4 — REVIEW 3 FOLDED IN (19 October, session 2)

Review 3 found that v3 appended Carl's no-border ruling instead of writing it in, so the note said three different things
about the border. **Rewritten in place:** decisions 4 and 5, §5b's border rows, the v3 bullets, couples-to, files, the asks.
Its claims checked:

- **⛔ MOUNT ON APPROACH = MOUNT ONCE (review 3.5).** Each corner canvas mounts on the grid's FIRST approach and is NEVER
  unmounted for the life of the page — not conditional rendering on visibility, which would destroy and re-create the
  context on every pass (§5a worked case 2, the Next step button). Matches *"When they arrive they stay there."* The
  `Ticker` gates FRAMES, not the mount.
- **⛔ ARRIVAL BEFORE THE CANVAS IS READY (review 3.6), defined:** a fast scroll can cross the line before setup finishes
  (context + PMREM + relief: several hundred ms). The arrival is LATCHED. When the canvas is ready: if the grid is still on
  screen → the sequence starts then; if it has left → the corners are set in place, fully faded in, no sequence (they
  "stay" once arrived). The sequence never plays to an empty window.
- **⛔ THE FADE'S MATERIAL SETTINGS (review 3.7) — ✔ checked in three.js 0.185.1, a correction to the review's reason:**
  `transparent` is part of the shader's identity (`opaque` → `#define OPAQUE` → `diffuseColor.a = 1.0`,
  `WebGLPrograms.js`), and the renderer does NOT check it between frames (`WebGLRenderer.js`, the `needsProgramChange`
  list). So toggling it either DOES NOTHING (the program compiled opaque keeps alpha at 1 — the fade silently fails) or,
  with `needsUpdate`, RECOMPILES at the moment the fade lands. **`transparent: true` permanently** — 28 non-overlapping
  meshes, no sort cost worth naming; `depthWrite` stays on. ⚠ *v5:* with alpha = fade alone after the test, or the
  approved outline softens (review 4.1).
- **Highlights glowing through a fade (review 3.7) — ✔ checked, not expected:** with `NormalBlending` and the material's
  `premultipliedAlpha` false (the default), the blend is `SRC_ALPHA, ONE_MINUS_SRC_ALPHA` (`WebGLState.js`), so the canvas
  holds colour × alpha and composites correctly over the page. It WOULD glow with `premultipliedAlpha: true` or additive
  blending — neither is used. ⚠ Confirmed by eye on the bench against the page's background before the page.
- **The border's layout (review 3.4) — ✔ arithmetic checked:** `home-box-corner-space-19-october.mjs` measures from the
  border box, so removing the 1-px border moves each clearance by 1 (27 → 26 at 390 px). ⚠ Correction: the boxes lose 2 px
  in HEIGHT only — the width is the grid track's. §5b row.
- **The version header (review 3.8)** now names Carl's answers to review 2. **The reduced-motion take** stands, marked a take.

## VERSION 5 — REVIEW 4 FOLDED IN (19 October, session 2)

Review 4 checked v4's corrections (✔ `transparent`, ✔ premultiplied alpha) and found one silent change to the approved look,
the fallback's edges undefined, and stale wording. Each checked:

- **⛔ `transparent: true` WOULD SOFTEN THE APPROVED OUTLINE (review 4.1) — ✔ confirmed in the code.** The bench never sets
  `transparent` (`corner-bench.tsx`), so pass 2 was approved compiled OPAQUE: every pixel that passes `alphaTest` 0.5 is drawn
  at alpha 1. The mask is blurred (`corner-geometry.ts`, `blur(maskF, …, 1)`), so along the outline the passing pixels carry
  0.5–1 — with `transparent: true` and mask × fade, every piece's edge would go part see-through: a softer, darker rim than
  R-082 / R-083. **Method:** after the alpha test, the output alpha is the FADE VALUE ALONE (the mask only cuts). At fade = 1
  that is the approved opaque edge exactly. ⛔ **Proved on the bench: fade = 1 against the approved pass-2 frames,
  pixel-compared, before the page.**
- **The fallback's edges (reviews 4.2–4.5)** — written into decision 4: ONE-WAY for the life of the page, canvas hidden; a
  DEADLINE `N` after arrival (slow ≠ failed); the context cap EVICTS the oldest rather than refusing; the `<noscript>` rule
  targets `[data-corner-box]` with the colour from a server-rendered `data-corner-colour`.
- **Stale wording (review 4.6)** — swept: the gold-only fallback in couples-to and files; *"Open for Carl: replay"* (answered:
  once); *"Now asked directly"* (answered); the Architect's item 5 aligned below.
- **Forced colours (review 4.7)** — beside the existing ⚠ in decision 4.

## VERSION 6 — REVIEW 5 FOLDED IN (19 October, session 2)

Each claim checked against the code: ✔ `canvasOnScreen` tests only the rect and the tab; ✔ `answer-card-mesh.tsx` records
the cache key's ~620 ms gap; ✔ the HDRI is 1,562,415 bytes; ✔ `whoweare-button.tsx` is the SSR'd-wrapper + `ssr: false`
scene pattern.

- **⛔ The no-JS rule (review 5.1):** a stylesheet cannot hold a `<noscript>` → `@media (scripting: none)` in
  `app/globals.css`, support checked in the build (decision 4).
- **⛔ Two components (review 5.2):** an SSR'd wrapper that never imports three.js, holding an `ssr: false` canvas — or the
  text leaves the server HTML for no-JS visitors (decision 8, files).
- **The deadline's interactions (review 5.3):** `N` measured on a COLD deep link over a throttled connection; arrival starts
  setup at once, overriding any wait for the hero (decision 4; Architect item 6).
- **⚠ Carl's words stretched again (review 5.4)** — the review 3.3 pattern: *"the gap is fine"* was said of "the few hundred
  ms", and "slow devices get the border" is an inference. Put to him (*Asked of Carl*, item 6); his quote returned to its
  own wording.
- **⛔ Shaders compiled in setup (review 5.5):** rendered at fade 0 from the first frame, no custom cache key — cited in the
  fade's method.
- **Frames stopped on fallback (review 5.6)** — decision 4. **The header (review 5.7)** — one order, newest first.

## Asked of the Architect

1. B (grid-scoped) vs C — **weighed with the hero's canvas in view: four contexts under B, three under C** (Carl: the hero is
   WebGL).
2. The relief: (a) runtime with a cache, (b) an offline bake with a byte-compare check, or (c) a worker.
3. The ~687k sub-pixel triangles: is a coarser mesh (a bench take for Carl) the right lever, or does the frame time on the page
   decide it?
4. Anything §5b still misses.
5. **(v3, aligned v5)** The fade's method (a per-box uniform after the alpha test, alpha = fade alone) and who owns the reveal
   state (the client wrapper, driving the corners' fade uniforms; `data-corners="none"` its only attribute).
6. **(v3)** Does the corners' SETUP wait for the hero — mount on approach, after the hero's first frame, or both?
   ⚠ *v6:* whichever — an ARRIVAL starts setup at once, overriding the wait (decision 4, the deadline).
7. **(v4)** Mount once on first approach + a latched arrival (the v4 section) — sound, or a simpler shape?
8. **(v5)** The fallback: one-way, a deadline `N` after arrival, the no-JS twin (`@media (scripting: none)`) — complete?

## Asked of Carl

**Answered 19 October:**
1. **Does the hero's brief include a canvas?** — **Yes** (a lit, animated code logo crossing gold → blue, its colour changes
   lighting the text on the left). Four contexts under B.
2. **How do the corners arrive?** — **A fade, box by box, in sequence** (decision 5); once per load; no border (answers to review 2).

**Review 3's questions — ANSWERED 19 October (session 2):** *"1. Yes, thats fine. Whern a visitor crosses the threshold they
can appear literally framing the content. 2. there should be a fallback for visitors with no WebGL. The 1px border is the
fallback, if it can be coloured gold, all the btter. The text should be framed for them. 3. A transparent border is fine."*
3. **The bare opening** — ✔ the designed opening; the corners arrive framing the content.
4. **A fallback** — ✔ YES: the 1-px border for no-WebGL, a lost context and no JS — *"framed in all circumstances"* — in the
   section's colour: §2 gold, §3 platinum blue (Carl, a follow-up the same session).
5. **Remove or invisible?** — ✔ `border-transparent`; geometry unchanged.

**⚠ CARRIED INTO THE BUILD (review 5.4) — not answered before the rounds closed; Carl judges it when `N` is measured:**
6. **The deadline:** up to ~1–1.5 s of bare text after arrival (not only *"the few hundred ms"*) — and a device or connection
   too slow for it gets the gold / blue BORDER for that visit, never the corners. OK?

## AS BUILT (19 October 2026, session 2) — Carl: *"Build on the page, we will take it from there"*

Built without the Architect's review, on Carl's word; the Builder's calls: B, (a), the approved mesh, mount on approach. One
departure from decision 4: on fallback the canvas is UNMOUNTED rather than hidden (hidden, R3F retried the context on every
re-render). Measurements and takes: D-100, the 19 October session-2 build entry.
