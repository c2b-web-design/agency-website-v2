# Claude Plan — CB, CD, CS: the dry extruded text, one card at a time. 24 September 2026 (session 2)

**Status: PROPOSED — awaiting the plan-review gate (`handoff-protocol.md` §2.5). Nothing built.**

## Task

Step 1 of Carl's order (handoff, 24 September): *"isolate the other cards and put the text in."*
The same dry treatment as CA (extruded Geist, "pages" at 171.4 wpm, rims off, one white static
downward spot), **one card per load**, so each is judged alone as CA was.

⛔ Not in this chunk: the rim (step 2), the light's colour, any light movement (steps 3–4), the
four cards in sequence, the setting/fit chunk, accessibility (deferred to mastering, D-094).

## Context Read

Handoff; the previous session's prompt; `open-defects.md`; `current-sprint.md` (current work,
blockers); `context-rules.md`; D-094 (scanned for per-card notes); `handoff-protocol.md` §2.5;
`card-extrude.tsx`, `about-card-canvas.tsx` L880–1399, `card-text-timeline.ts`, `about-neon.ts`
(`wallCardsInView`, `neonParam`), `about-card-copy.ts`, `.claude/protected-files.json`.

**Verified, not assumed:**
- **All four card groups rotate about Y only** (`rotation={[0, x.rotationY, 0]}`, canvas L1216,
  L1273, L1319, L1375). Every card is upright, so the spot's "downward" in card-local space is
  world-down for all four. ⚠ Corrects the handoff's "the floor pair lean".
- **No `verify/` harness, script or other component reads `extrude`.** Its only consumers are
  in `about-card-canvas.tsx` (listed under §5b below).
- **None of the files to be touched is in `protected-files.json`.**

## ⚠⚠ A MEASURED LIMIT, REPORTED BEFORE BUILDING — the floor cards lose the grace

Computed with the component's own functions (`setJustified`, `chase`, `eraseLag`) and the real
font file, from a scratchpad script. **It reproduces CA's handoff figures exactly** (32.9 s, 7.7 s
grace), so the method is sound. ⚠ It shares its functions with the component, so it confirms the
arithmetic, **not what reads well**.

At **52 mm** (the committed take):

| card | words | lines | slots | erase lag | cycle | **grace** | widest gap |
|---|---|---|---|---|---|---|---|
| CA | 64 | 10 | 6 | 4 | 32.9 s | **7.7 s** | 4.4× |
| CB | 84 | 12 | 5 | 3 | 38.9 s | **6.7 s** | 2.4× |
| CD | 49 | 11 | 4 | 2 | 20.3 s | **2.8 s** | 3.8× |
| CS | 56 | 13 | 4 | 2 | 23.1 s | **2.5 s** | 7.1× |

*(The script's word counts read 65/84/50/57 because a whitespace split counts the em dash; D-077's
counts are shown.)*

**The mechanism:** slots = ⌊face height × 0.9 ÷ (em × 1.35)⌋. The floor faces are 346 / 334 mm
high against CA's 477, so at the same em they get 4 slots, and the erase runs only 2 lines behind.
⛔ **R-029's verdict rests on the grace.** Carl: *"the slower pace IS the slow reader's grace."* At
52 mm the floor pair keeps the pace and loses about two-thirds of the grace.

**How it moves with size (floor pair):** 48 mm keeps 4 slots (3.1 / 2.5 s) · 44 mm gives 5 slots
(5.3 / 4.2 s) · 40 mm gives 5 slots (6.0 / 4.9 s) · **36 mm gives 6 slots (9.8 / 8.4 s)**, about CA's.

**The principle Carl chooses between, not now, after seeing it:**
- **Same size in the world (mm).** The same lettering on every card, as a signwriter would cut
  it. This is closest to §14a: *"caused by the world"*. It costs grace on the small cards.
- **Same grace.** The size follows each face height, so every card gives a slow reader the same
  slack. The floor pair's type becomes smaller in the world.
- **Same size on screen.** ⚠ **Unmeasured.** The floor cards are nearer the camera, so 52 mm there
  may render larger on screen than CA's 52 mm, which would soften the case for shrinking them.
  **The build measures on-screen em per card (below) so this is answered with a number.**

**Recommendation:** build all three at 52 mm, the dry treatment as ordered. Carl judges each with
`?textem=` live, and the table above goes beside it. ⛔ No per-card size is committed in this chunk.

⚠ **Also visible:** CS's setting reaches a 7.1× gap at 52 mm. The narrow faces make the greedy
setting worse, so the fit chunk (handoff open item 5) will bite hardest on the floor pair.

## Proposed Approach

1. **The flag, `?extrude=`, takes ONE card:** `ca | cb | cd | cs`. **`1` stays an alias for `ca`**,
   so every URL and record that says `?extrude=1` keeps meaning what it says. A new
   `extrudeCard(): NeonCardId | null` in `card-extrude.tsx`, with `extrudeEnabled()` defined as
   `extrudeCard() !== null`. An unrecognised value logs `console.error` and mounts nothing. A typo
   must not pass for "nothing selected" (the `?guides=1` lesson).
2. **The canvas.** Each of the four groups gets `faceReceiveShadow={card === id}` and
   `{card === id && <CardExtrudedText id body={aboutCardCopy(ID).body} dims crownMm settings />}`,
   exactly CA's pattern at four call sites. CA's own lines change only from `!!extrude` to
   `card === "ca"`.
3. **The light's cone gets a fader, `?lightcone=` (radians, default 0.72, range 0.2–1.2).** 0.72
   was sized to reach *"just past CA's edges"*. On CD (757 mm wide against CA's 1220) the same cone
   reaches much further past the face. ⛔ **0.72 stays the committed value.** The fader lets Carl
   narrow it by eye if the spill shows. For scale: a cone matching CA's margin, derived from face
   width, would be CB ≈ 0.67, CD ≈ 0.50, CS ≈ 0.48. **These are listed for comparison only, not
   proposed.**
4. **The clock trigger is unchanged.** Every card starts on `wallCardsInView` (D-092's check). At
   `#roles` the whole plate is in view, so isolation is unaffected. ⚠ **Whether the floor pair waits
   for its own visibility is already open in D-094. It is recorded here and not decided.**
5. **Comments corrected in place** (the sweep rule): `card-extrude.tsx` header ("CA ONLY") and the
   spot's cone note; canvas L910–916 and L999; `about-card-mesh.tsx` L944 and L1259. Each keeps the
   original claim as history.

## Structural Contract

- **Existing values/components modified:** `extrudeEnabled()` (same meaning when true);
  `CardExtrudedText` gains one fader and no new behaviour.
- **New layers/objects added:** up to three more `CardExtrudedText` call sites. **Only one is
  mounted per load.**
- **Coupled values that must stay coupled:** text `dims`/`crownMm` must be the same object the
  card's `AboutCardMesh` uses (`faceBaseZ`/`faceDome` read them). Passed from the same `cb`/`cd`/`cs`
  placement.
- **Approved layers that must not change:** plain `/about` (D-089 glass, the neon, R-028). The
  identity gate proves it. `?extrude=1` renders CA exactly as before.

### §5a — structural decisions, stated rather than built silently

- ⛔ **ONE card per load, not a list.** A list form (`?extrude=ca,cb`) would mount one shadow-casting
  spot per card: **N shadow-map renders per frame and N font parses.** That is a second instance of
  an expensive resource, and whether the finished scene has one light per card or per pair belongs
  to the light-movement and "strike in turn" chunks. **Deferred, not built.** Rejected alternative:
  build the list now because it is cheap to parse. The cost is not the parse; it is deciding the
  lighting structure in passing.
- No new mechanism. Each card uses the existing component, its own group and its own marks
  (`extrude:start:<id>`, `extrude:line:<id>`).

### §5b — what depends on the flag today, and how each is preserved

| today, under `?extrude=1` | after |
|---|---|
| neon forced `none` (all rims off) | unchanged for any selected card: *"rims off"* holds |
| etched text off | unchanged |
| `shadows="soft"` on the canvas | unchanged for any selected card |
| `localClippingEnabled` in `onCreated` | unchanged for any selected card |
| CA's face receives shadow | only the selected card's face does |
| CA's text mounted | only the selected card's text is mounted |
| plain `/about`: `null`, nothing changes | unchanged; gated by the identity arm |

## Files Expected To Change

- `components/about/card-extrude.tsx`: the flag parse, the cone fader, comments
- `components/about/about-card-canvas.tsx`: three call sites, CA's condition, comments
- `components/about/about-card-mesh.tsx`: two comments only
- `project-intelligence/live-work/`: the run log, captures
- On Carl's verdicts: D-094 amendment, R-030 (next number; the two R-028s are left as they are)

⚠ **`live-work/chunk-scope.json` is re-scoped FIRST** to `cards-text-isolation-dry` with the three
component files named, and **proved with one real denial** (an edit to an unnamed file). It is
not deleted: the guard fails open without it.

## Verification

- `npx tsc --noEmit` clean. `npm run lint` gives **1 problem (1 error, 0 warnings)**.
- **Identity gate:** `npm run verify -- about-neon.mjs identity` reads **0 px on all four arms**.
- **`?extrude=1` unchanged:** CA captured at the same clock times (from `extrude:start:ca`) before
  and after the change; expect a pixel-identical result.
- **Per card, `?extrude=cb|cd|cs`, headed GPU Chromium at 1412×700, DPR 1.36:**
  - the console line's lines, slots and cycle against the table above
  - timed captures at fixed clock offsets (mid-write, a full page, mid-clear)
  - **on-screen em in px per card**, which answers the "same on screen" question
  - legibility: word against the glass right behind it, 95th vs 35th percentile, hotspot word vs
    the rest
  - **spill:** pixels outside the selected face, against a `?neon=none` frame with no text
  - long tasks at clock start, against CA's 309 ms and 117 ms
- **One card judged at a time.** Carl's eye decides; values stay takes until he rules.

## Stop Conditions

- Any warning in lint, or the identity arm off 0 px: stop, report.
- A card's text sits off its face or through the dome: stop. That means a frame assumption
  was wrong, and the Y-only check is re-examined rather than patched.
- Spill visibly lighting another card at 0.72: report with the figure. The fader is the lever, and
  Carl sets it.
- Long tasks growing materially past CA's: report, not tune (the Q5 pattern).
- The dev server is stopped by PID and port 3000 confirmed free before any checkpoint.
