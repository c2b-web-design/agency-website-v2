# Session Handoff — 9 November 2026 (Monday), SESSION 2. THE BENCH IS A WORKSHOP; STEPS 1–2 BUILT; STEP 3 NEXT

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces session 1's handoff. Delete it at the end of the
session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE REFLECTION NOTE, TWO ARCHITECT ROUNDS"* to the end. Every beat is
there with Carl's words.

## STATE

- **Pushed:** `9d896b1` (steps 1 and 2, the Vader move withdrawn, the timeline wording, notes, reviews 7–10, scripts).
  The clean-checkout build passed first.
- **The screen capture is RUNNING:** `Videos\C2B Films\03 The hero\01 Discussion\2026-11-09_s2_discussion_screen.mkv`,
  started by the Builder on Carl's word. Stop it on Carl's word, then remux it to restore its duration (as session 1's).
- **The dev server is up** on :3000. Kill the whole `next dev` tree before a checkpoint.
- **The scope is OPEN on Carl's word** (`_heroLogo9Nov` in `chunk-scope.json`). Today it added:
  - `shot-format.ts` (unused: no format change was needed)
  - `bench-ideas.ts`, `hero-idea.tsx` and `hero-idea-webgpu.tsx` (all NEW)
  - `bench-builder-take.ts`
  - `bench-timeline.tsx`
  - **Lock and test only when Carl says close.**

## CARL's DIRECTION TODAY (D-101)

- **The camera bench is a WORKSHOP TOOL**; the idea brought to it is furniture (the hero now; the arch was film 4's). This
  is the template model (`live-work/references/workshop-template-and-client-delivery.md`): *"when a new client comes
  along, we clone the template."*
- **An idea brings `home` ONLY:** where Cam 1 goes first, with what lens.
  - **NO formula across scenes**, so no `subject` field (note v2.3). Carl: *"each scene will be different ... i dont think
    we should apply a formuler with so mant parameters in play."*
  - Moves are made for their scene (D-104).
- **After the hero:** a BENCH STARTING TEMPLATE, *"Like in a DAW"*: Cam 1 placed from 0, 0, 0, a proprietary light rig.
  The empty bench keeps the arch's old default view until then.
- **The text under the corrected light:** *"still looks good"*.
- **The lean is mounted** (*"i need to see it leaning first"*).

## ✔ STEP 3 BUILT AND MEASURED IN SESSION 2 (D-101, *"WORKSHOP STEP 3 BUILT"*) — the plan below kept as written

## (was) NEXT — STEP 3, THE SLOT (Carl: *"run step 3 and then we will commit and push"*)

Design: `live-work/structural-note-bench-arch-removed-9-november.md` **v2.3**. The slot is v2.1's, cleared by the
Architect in review 10. v2.2's `subject` field is withdrawn. Nothing is open for the Architect.

- `bench-ideas.ts`: the types (`BenchIdea`, its `home`, `Scene`, `Guide`, `ready`, `byMedium.webgpu`, a generic post) and
  the ONE list of ideas, loaded lazily: `hero: { medium: "webgpu", load }`. In the template the list is empty.
  - `?idea=hero` picks the hero; `?blank=1` is its alias; no parameter gives the empty workshop.
- `hero-idea.tsx`: the hero's `Scene` (lights, text, the leaning logo, `ready` when the text and the logo with its studio
  are in), its `home` (`HERO_CAMERA`, `HERO_PAGE`), and its `Guide` (`HeroPageGuide`).
- `hero-idea-webgpu.tsx`: the acrylic and the glow. Loaded ONLY in the WebGPU medium, which keeps `three/webgpu` out of
  WebGL.
  - The hooks `__heroBloom` and `__heroBloomOff` stay hero-named and are set by this part. Set the instance hook from an
    `attach()` the bench calls in its effect, NOT in the factory: StrictMode runs `useMemo` twice.
- `camera-bench.tsx`: no hero import; `blankHome` → the idea's home; the post drawn through the slot. `BenchScene` keeps
  owning, calling, catching and disposing the instance (`:1256–1277`).
- `bench-medium(.ts, -webgpu.tsx)`: `heroText` and `post` out.
- **Verify:**
  - pixel-identical to step 2 on `?blank=1`, on `?idea=hero` and on the plain URL (`workshop-measure-9-november.mjs`, then
    `…-compare-…`);
  - `?blank=1&medium=webgl` draws with no WebGPU chunk requested;
  - the glow check unchanged;
  - `tsc` clean; lint at the baseline; console clean.
- **Flag, not in the note:** `useDisposeOnUnmount` (a tool helper) lives in `hero-page.tsx`, which is furniture, and both
  `camera-bench.tsx` and `bench-medium-webgpu.tsx` import it. Moving it to a tool file needs scope: Carl's call.

**NOW NEXT:** the reflection (note v1.7, cleared by the Architect in review 9; its *Files* and switch follow the slot: the
reflection runs where the hero's WebGPU part is loaded). After that, the blobs.

## OPEN — WITH OWNERS

- **The blobs: PARKED** (Carl). His proposal: copy three's marching-cubes example whole and use the logo as `addPlaneX`'s
  wall. Open: the example's castle cube map is CC BY and not in npm's three (use the family HDRI?); a new file needs scope;
  volume is not held; the CPU cost is to be priced.
- **The glow's selection check fails AT THE PREVIOUS HEAD** (pre-existing: max 5, 909 values over 4, more than 200 px from
  the text). Likely the logo's metal, but not bisected. [R4]'s attachment-level check would settle it. Reported; Carl's
  call.
- **Lint:** the accepted error, plus the 2 known warnings in `projector.mjs`.

## LESSONS

- **Carry nothing of an idea into the workshop by default.** Step 2 moved the Vader take into the new world instead of
  removing it with the arch; Carl's eye caught it.
- **A null control and a negative control on every comparison** settled every question today: the 5 px layout shift; the
  "slower" hero, which came from cold-compile noise; the glow failure, bisected to the previous HEAD.

---

*Written 9 November 2026, session 2.*
