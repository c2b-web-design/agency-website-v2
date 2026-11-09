# Structural note — the camera bench as a workshop: its own world, a slot for the idea, the arch out (9 November 2026, session 2) — v2.3

**v2.2 STATE:** steps 1 and 2 BUILT and measured (D-101). The Vader move withdrawn. Carl on the corrected light: *"The text
under the changed light still looks good"*. Step 3 gains a `subject` field: see *v2.2 — Home and the subject are the
idea's*, below the slot's fields.

**Status:** PROPOSED. The Architect's review 10 (`review-10-structural-note-bench-workshop-9-november.md`) found the shape
right and eight things to fix. All eight are verified by the Builder and answered here, marked **[R10-n]**. For Carl's
approval of the two scope additions below. Nothing is built.
**Record:** D-101, *"THE BENCH IS A WORKSHOP"* and *"THE WORKSHOP NOTE v2.0 — CARL's ANSWERS"*. v2.0 and v1.0 are in the
appendix, history only.

## Carl's direction

- *"we need a camera bench to build things with. my original vision was to have it with all the tools and functionality
  it needs and to bring different things to it to build."*
- *"so it would function like a workshop. What we build in there is dependent on the idea we bring to it. A spline editor
  will probably be addd at some point."*
- *"its the same idea for the entite file system. When we are done all the c2b site stuff will be taken out. We will be
  left with a template. when a new client comes along, we clone the template."*
- On the arch: *"the arch, hidden or otherwise, does not need to be there. remove it."*
- On v2.0: *"1 yes. Authorised  2. yes, proceed 3. yes, i will judge it then."* The new files are authorised, the saved
  takes are moved, and he re-judges the text under the corrected light.

The workshop model on record (`live-work/references/workshop-template-and-client-delivery.md`): *"A workshop keeps its
tools. It does not keep the furniture built with them."*
- The bench is a TOOL.
- The hero is an IDEA (furniture). So was the arch.

## The shape (unchanged from v2.0; the Architect: *"the right shape"*)

1. **The workshop's own world:** the floor y 0, the front line z 0, the centre line x 0. 1 unit = 1 cm.
2. **One slot for the idea.**
   - The bench names no idea.
   - Ideas are listed lazily in ONE file, `bench-ideas.ts`, which is empty in the template.
   - `?idea=hero` picks the hero; `?blank=1` is its alias; no parameter gives the empty workshop.
3. **The media hold tools only.**
4. **The arch out.** Film 4's page keeps its arch; `lettering-piece.tsx` and `arch-medium.ts` are not touched.
5. **The spline editor:** a future TOOL on the chain. Nothing here shapes it.

## THREE build steps, one variable each [R10-3]

### Step 1 — the arch out, nothing moves (v1.0 as written)

- The arch's build, mount, measures and arch-only features go: the C and its squares, clash notes, the drawer's rows, the
  measuring spans, its HDRI wait, its compile wait, its environment and its lamps.
- **Its numbers are frozen in place, exact:** floor −429.05184025084225, z1 16, units `{ d 2287.490381354744, up 0, zc 16 }`.
- **[R10-7] Freezing `d` RETIRES a deliberate decision.** Note v3.2 §4 (`camera-bench.tsx:240–243`) put Home, the camera's
  `far` and the rig's first pose on the LIVE `d`, re-measured per window, as a named second value of `d`.
  - It was live because it framed the ARCH in this window. `frontDistance` takes whichever of the width and height limits
    is larger (`lettering-hooks.tsx:91–94`), so a tall window gave a longer `d`. All three measured sizes were wide.
  - With no arch there is nothing to frame, so ONE `d` serves. The second value is retired. Its comment is corrected in
    place, keeping the old claim as history.
- **[R10-4] The ready signal, step 1's version:** `drawn` fires after the first frame drawn with the hero's text, the logo
  and the logo's studio all present (they are the only scene left). In step 3 this becomes the idea's own `ready`.
- **Verified:** a page-camera frame PIXEL-IDENTICAL before and after, once the first-frame compile is past; the hero's
  group, the logo's world position, Home and the lights' world positions identical. The first-frame stall and the time
  to the first frame are measured before and after (the lost precompile and the lost HDRI wait).

### Step 2 — the rebase: the workshop's own origin

**Every world position moves by (0, +429.05184025084225, −16).** Everything stored or written in the old frame moves with
it, so nothing changes against the floor. The exception is the light, below.

| What is in the old frame | Where | How it moves |
|---|---|---|
| The chain's units (saved chains) | `localStorage`, the chain | **chain v4:** units `{ up 0, zc 16 }` → `{ up 429.05…, zc 0 }`, by `readChain`'s established carry-over (the v3 copy kept, a message to Carl). The Architect checked the maths: every pose and every shape clip moves exactly with the world (`toWorld`, `:238`; shape clips `:738`, `:745–748`) |
| A NEW chain's units | `frame()`, `:815` | from the step-1 constants, moved |
| **[R10-2] The remembered camera** | `CAMERA_KEY` (`:216`, `:1010`), world px | **converted:** read v1, moved, written as `…-camera-v2`, v1 kept |
| **[R10-2] The remembered third-person eye** | `EYE_KEY` (`:218`, `:1021`), world px | **converted** the same way, `…-eye-v2` |
| **[R10-1] The default camera positions:** `frontIn` (`:244`), the barrel's `"default"` start (`:739`), the rig's fallbacks (`:824`, `:837`), the eye's default (`:979`), the starting camera (`:1466`) | written as `(0, 0, d)` and `(0, 0, 3d)` | **all from ONE constant**, `WORKSHOP_HOME` = (0, 429.05…, d − 16), with the eye at 3d on the same line. Six sites, one value. They stand where they stood against the floor |
| **[R10-1] The Builder's take** | `bench-builder-take.ts:46` (to [0, 0, −800]; spiral 1730 → 616, world z) | **its numbers moved, VERSION KEPT at 4.** The clip is placed by id (`builder-v${version}`, `:736`), so a kept version does not place a second copy. The one already in Carl's chain moves with chain v4. ⚠ **NOT IN SCOPE** |
| The hero's group | `[0, world.floor, world.z1]` | at the origin |
| The page camera (Home on `?blank=1`) | floor and z1 + `HERO_CAMERA` | the same against the floor |
| The grid, the axes, the metre readout | floor and z1 | at the origin; the readout reads y and z directly |
| Harness baselines that read world positions (the glow check's probes, this session's probes) | scripts | **re-baselined**, never compared across the change |

**[R10-3] THE LIGHT, Carl's choice inside this step.**
- The hero's lights sit inside its group, so the rebase changes their direction. The hemisphere's sky turns UP (today:
  down, swapped), and the directional comes from 31° (today: 17°).
- **Carl has chosen the corrected light:** *"3. yes, i will judge it then"*, answering v2.0's Q7, which stated the change.
- The alternative stays available if he wants it after seeing the result: keep the light exactly as judged, by placing
  the lights at their measured world positions today.
- The Architect measured the effect: the front faces barely change (51.9 % against 50 % sky); the tops, bottoms and bevels
  do.

**Verified:**
- the hero, logo, page camera and grid identical against the floor (world positions offset exactly);
- a saved chain's poses, the remembered camera and the eye identical against the floor;
- the Builder's take not placed twice;
- the lights' new world directions logged;
- then **Carl re-judges the text.**

### Step 3 — the slot

- `bench-ideas.ts`, the hero moved into it, the media cleaned.
- **Verified:** the frame is PIXEL-IDENTICAL to the end of step 2. The empty workshop loads and draws.

## The slot's fields, completed [R10-4, R10-5, R10-6]

| The idea brings | For the hero | Notes |
|---|---|---|
| `Scene` | the lights, `HeroText`, `HeroLogo` | placed in the workshop's world |
| `medium` | WebGPU | the bench default when absent |
| `home` | `HERO_CAMERA`, `HERO_PAGE` (position, fov, lens shift, frame) | absent: `WORKSHOP_HOME`, no shift, the canvas as the frame |
| `Guide` | `HeroPageGuide` | optional |
| **[R10-4] `ready`** | the text's fonts built, the logo's geometry from its worker, the logo's studio prefiltered | optional. **`drawn` = the first frame drawn after the idea is ready** (immediately with none). It restores what the arch's `compileAsync` used to guarantee |
| **[R10-5] `byMedium.webgpu`, a LAZY part** | the acrylic (`hero-text-material.ts`) and the glow (`hero-bloom.ts`) | **its own file, `hero-idea-webgpu.tsx`, loaded only in the WebGPU medium.** That keeps `three/webgpu` out of the WebGL bench (route B, the text-material note). ⚠ **A THIRD NEW FILE: NOT IN SCOPE** |
| `byMedium.webgpu.post` | the glow's factory | **[R10, Q3]** `BenchScene` keeps owning, calling, catching and disposing the instance exactly as now (`:1256–1277`). Only the factory's source moves. TSL build errors still do not throw: that known limit carries over |
| **[R10-6] the dev hooks** | `__heroBloom`, `__heroBloomOff` | **kept, same names**, set by the hero's WebGPU part: they are the hero's, so hero-named is right. `__benchScene` and `__benchCost` stay the bench's. `hero-bloom-measure-9-november.mjs` keeps working; it loads `?blank=1`, the alias |

**[R10-5] The reflection's switch** (reflection note v1.7, R8-5, keyed on `medium.heroText`): it becomes **"the idea's
WebGPU part is loaded"**. The hero passes `reflect` to its logo only from that part. The reflection note's *Files* follow
this note.

## v2.2 — HOME AND THE SUBJECT ARE THE IDEA's (Carl, 9 November 2026, session 2, after step 2)

Carl: *"the home x, y and z location will change depending whats on the bench."*

**What steps 1 and 2 left in the bench, from the ARCH:**
- `homeAt` puts the default view at the arch's old centre: 4.29 m up, 22.71 m out.
- `BENCH_MEASURE` (the units a NEW chain gets) is centred there too, with `d` the arch's framing distance.
- Both are the arch's, frozen. Neither is the workshop's.

**Step 3 therefore adds one field to the slot: `subject`**, the frame an idea's takes are measured in.
- `home` (already a field) sets the view H returns to.
- `subject = { centre: [x, y, z], d }` seeds a NEW chain's units: the subject's centre and the front distance its d-units
  count in. That matches the shot format, which is *"relative to the subject"* (`shot-format.ts`).
- **A chain carries its own units** (`chain.units`, fixed when it is first measured). So bringing a different idea NEVER
  moves a take already recorded: it changes only Home and the units of a chain started from empty.
- **With nothing brought:** the empty workshop keeps today's default view and units, renamed the WORKSHOP's default.
  ⚠ What the empty bench should open on is Carl's to say. Today's are only the arch's, carried over.
- **For the hero:** `home` is the page camera (`HERO_CAMERA`), as now. `subject` is the hero's own: a proposed take is the
  text's and the logo's centre on the floor, and `d` the page camera's distance. ⚠ No hero takes exist yet (Carl: *"No
  camera moves have bee done for the hero"*), so nothing recorded moves either way.

**The Vader move** (film 4's, through the arch) is withdrawn from the bench. Its method and clip are stored OUTSIDE it, on
Carl's word: `live-work/references/film04/vader-move/` (*"how to do that specialist move should be noted but the actual
clip can be stored outside the bench"*).

**A correction to v2.1:** the saved chains needed NO format change. The chain's version lives in `bench-chain.ts`, not
`shot-format.ts` as written. The frame belongs to the bench's storage key. So step 2 touched neither file.

⚠ **v2.2's `subject` field is a new piece of the slot's structure. It has not been to the Architect.**

### ⛔ v2.3 — THE `subject` FIELD WITHDRAWN (Carl, 9 November 2026, session 2)

- The Builder explained the field: a take stored relative to a subject in steps of `d`, so a move could be re-flown on
  another subject by changing three numbers, its scale following. Carl asked whether the corkscrew would be tighter on a
  2 m object; the Builder's answer was "the same corkscrew relative to the object, smaller in metres; whether a move
  scales is a choice per move".
- Carl: *"each scene will be different. each subject will be different, with different elements. Where we put cam 1
  first, with what lens. each of these will be unique. i dont think we should apply a formuler with so mant parameters in
  play."*
- **So there is NO `subject` field.** The section above stands as the record of what was proposed.
  - **An idea brings `home` ONLY: where Cam 1 goes first, and with what lens** (for the hero, the page camera at 33 mm, as
    built).
  - **The chain's units stay the BENCH's, fixed** (`BENCH_MEASURE`): a storage frame, never a formula applied across
    scenes, never rescaled to a subject.
  - **Moves are made FOR their scene**, Carl's method (D-104): he describes, the Builder calculates, he flies and refines.
    The Vader write-up (`references/film04/vader-move/`) records how one move was made, not a template.
- ⚠ **Still Carl's: what the EMPTY bench opens on** (today: the arch's old default view, carried over).
  **ANSWERED (Carl, same session):** today's view stays until a BENCH STARTING TEMPLATE is made after the hero (*"Like in
  a DAW"*: Cam 1 placed from 0, 0, 0 with its lens, a proprietary light rig). D-101.
- Step 3 is therefore the slot as v2.1 described it, nothing added: no new structure since review 10.

## Files

| File | Step | Scope |
|---|---|---|
| `components/showcase/camera-bench.tsx` | 1, 2, 3 | open |
| `components/showcase/shot-format.ts` | 2 (chain v4) | open (added today) |
| `components/showcase/bench-medium.ts`, `bench-medium-webgpu.tsx` | 1 (the arch's env), 3 (the hero out) | open |
| `components/showcase/hero-page.tsx`, `hero-text.tsx`, `hero-logo.tsx` | 3 (`ready` reported) | open |
| `components/showcase/hero-text-material.ts`, `hero-bloom.ts` | 3 (imported by the WebGPU part) | open |
| `components/showcase/bench-ideas.ts` (NEW) | 3 | open (added today) |
| `components/showcase/hero-idea.tsx` (NEW) | 3 | open (added today) |
| **`components/showcase/hero-idea-webgpu.tsx` (NEW)** | 3 | ⚠ **Carl: widen the scope** [R10-5] |
| **`components/showcase/bench-builder-take.ts`** | 2 | ⚠ **Carl: widen the scope** [R10-1] |
| `lettering-piece.tsx`, `arch-medium.ts` | — | not touched (film 4) |

## Checks at every step [R10-8]

- `npx tsc --noEmit` clean.
- `npm run lint` at the baseline: 1 error (the accepted one), 2 warnings (`projector.mjs`, known).
- A clean console, apart from the two standing warnings (`THREE.Clock`, `powerPreference`).
- No control characters in any written file.
- The dev server's served code checked as current before measuring.

## Questions

**For Carl:**
1. Widen the scope for `hero-idea-webgpu.tsx` (NEW) and `bench-builder-take.ts`?

**For the Architect:** none open. Review 10's answers are adopted as given.

---

# Appendix — v2.0 and v1.0, verbatim (HISTORY; superseded by the body above)

## (v2.0 as written)

### Structural note — the camera bench as a workshop: its own world, a slot for the idea, the arch out (9 November 2026, session 2) — v2.0

**Status:** PROPOSED, for the Architect, then Carl (CLAUDE.md §5a/§5b). Nothing is built.
**v2.0 replaces v1.0** (the arch removed, its numbers frozen). Carl's direction after v1.0 reframed it. v1.0 is kept verbatim
in the appendix.
**Author:** the Builder. **Record:** D-101, *"THE BENCH IS A WORKSHOP"*.

## Carl's direction

- *"The arch does not need to be there, it was the blueprint for one of the films which is now completed."*
- *"the arch, hidden or otherwise, does not need to be there. remove it."*
- *"we need a camera bench to build things with. my original vision was to have it with all the tools and functionality
  it needs and to bring different things to it to build."*
- *"so it would function like a workshop. What we build in there is dependent on the idea we bring to it. A spline editor
  will probably be addd at some point."*
- *"its the same idea for the entite file system. When we are done all the c2b site stuff will be taken out. We will be
  left with a template. when a new client comes along, we clone the template."*

This is the workshop model already on record (`live-work/references/workshop-template-and-client-delivery.md`, settled
30 July 2026): *"A workshop keeps its tools. It does not keep the furniture built with them."*
- **The camera bench is a TOOL.** It stays in the template and is kept upgraded. The spline editor will be one too.
- **The hero is an IDEA brought to it: furniture.** It leaves with the C2B site. The arch was the last idea.

## What is wrong with the bench today, against that model

1. **Its world is measured from an idea.** The floor, the front line, the chain's units and Home all come from the arch's
   build (`measureArch`, `measurePiece("arch")`). The floor sits at y −429.05 because the arch's centre was the origin.
2. **The current idea is wired through the tool.** `camera-bench.tsx` imports the hero (`hero-page`, `hero-text`,
   `hero-logo`, `hero-bloom`). `?blank=1` switches it on in seven places:
   - the objects and lights (`:1473–1482`);
   - Home as the page camera (`:1251`);
   - the lens shift (`:967`);
   - the mm read on the page's frame (`:1044–1045`);
   - the glow (`:1269`);
   - the amber guide (`:1986`);
   - WebGPU as the default medium (`:1725`).
3. **The idea is inside the medium, which is also a tool.** `bench-medium-webgpu.tsx` imports the hero's acrylic
   (`hero-text-material`) and its bloom (`hero-bloom`). `bench-medium.ts` carries `heroText` and `post` fields named for
   the hero.

**Taking the C2B site out today would mean surgery on the bench.** After this change, it means deleting the idea's files.

## The proposal

### 1. The workshop's own world

- **The floor is y 0. The front line is z 0. The centre line is x 0.** That is the grid's crossing, where the hero already
  stands. 1 unit = 1 cm, as now (`CM_PER_PX`).
- **These are the bench's constants, not anyone's measurement.** `measureArch`, `ArchWorld` and `measurePiece` are gone from
  the bench.
- **The chain's units, for a NEW chain:** `{ d 2287.490381354744, up 429.05184025084225, zc 0 }`. They are today's numbers
  (measured on 9 November at three canvas sizes; `d` does not vary with the canvas), moved into the new origin. So a new
  chain is scaled exactly as before.
- **Carl's SAVED chains are moved on load:** units `{ up 0, zc 16 }` (the arch's frame) are rewritten to
  `{ up 429.05…, zc 0 }`. Their poses are stored in units, so every saved take stays exactly where it was against the
  floor and the grid.
  - It follows the chain's established carry-over (`readChain`, `camera-bench.tsx:1586–1625`: v1 → v2 → v3, each older
    copy kept, a message shown to Carl): **a chain v4 in the workshop's frame, the v3 copy kept, unread.** That touches
    `shot-format.ts` (the format's version), which is NOT in the open scope.
  - The alternative is to leave old takes in the old frame, as history. They would then sit 4.29 m low.
- **Home with no idea:** face-on from 22.87 m at 4.29 m up. That is today's view of the empty world, unchanged.

**What visibly changes:** the hero's lights. They sit inside the hero's group, which today is 4.29 m below the origin. At
the new origin:
- the hemisphere's sky points UP, as written (today it measures straight down: the swap);
- the directional light comes from 31° above the horizon (today 17°).

The Architect measured that this barely changes the front faces Carl judged (51.9 % against 50 % sky, review 9). The tops,
bottoms and bevels change. **Carl re-judges the text after the build.** Nothing else moves: the text, the logo, the page
camera and the grid keep their places against the floor.

### 2. One slot for the idea

The bench names no idea. **An idea is a module that hands the bench one object.** What `?blank=1` switches today becomes its
fields:

| The idea brings | Today, for the hero | Optional? |
|---|---|---|
| `Scene` — its objects and lights, placed in the workshop's world (floor 0) | `HeroSketchLight`, `HeroText`, `HeroLogo` | required |
| `medium` — the renderer it is built for (the bench default when absent) | WebGPU | optional |
| `home` — its camera: position, vertical fov, lens shift, and the frame its lens reads against | `HERO_CAMERA`, `HERO_PAGE` | optional (no idea: the workshop's Home, no shift, the canvas as the frame) |
| `Guide` — what it draws over the picture | `HeroPageGuide` | optional |
| `post` — its effects, per medium | the glow (`hero-bloom.ts`), WebGPU only | optional |
| `materials` — any per-medium materials | the acrylic (`hero-text-material.ts`), WebGPU only; clay in WebGL | optional |

- **"See it all" measures the idea itself** (the bounding box of the `Scene`'s group), so an idea does not declare its
  size.
- **The ready signal:** `data-camera-bench="drawn"`, after the bench's first drawn frame, with or without an idea.
- **The bench drives every field the same way for any idea.** For example, the post slot is the bench's render-callback
  hook today, with the hero's bloom plugged in.

**Choosing the idea:**
- by URL, `?idea=hero`;
- `?blank=1` stays as an alias for the hero, so Carl's links work;
- no parameter: the empty workshop.

**The ideas are listed in ONE place:** `bench-ideas.ts`, a map of name → `() => import(...)`. It is loaded lazily, as the
WebGPU medium is today, so the bench bundles no idea. **In the template, that list is empty.**

### 3. The media become tools only

- `bench-medium.ts` loses `heroText` and the hero-named `post`. It keeps `Grid`, `Line`, the cost meter, `pmrem`, the PiP
  origin and `watch`: what any idea needs from a renderer.
- `bench-medium-webgpu.tsx` stops importing the hero. The acrylic and the bloom move to the hero idea's WebGPU part.
- **The arch's environment and compile wait** (`WebGPUEnvironment`, `webgpuCompileWait`, the `arch` field) go: no idea uses
  them.

### 4. The arch out (from v1.0, unchanged in substance)

| What the arch provides today | After |
|---|---|
| The world's floor, front line, units, Home | the workshop's own (section 1) |
| The canvas's mount gate (`shown &&`) and its failure text | gone: the canvas mounts at once |
| The arch's HDRI `use` (suspends the whole scene) | gone: the hero draws sooner |
| The arch's `compileAsync` (precompiled the hero's shaders) | gone: the hero compiles on its first frame. Measured before and after |
| The arch's environment PMREM and its two lamps (in its hidden group: light nothing, measured) | gone |
| The focus object (the C), its subdivided squares, the focus readout | gone. A focus object chosen per idea is not built (*"choosing a focus object is not built"*) |
| Clip clash notes (the letters' boxes) | gone |
| The info drawer's arch rows (`data-arch-world`; no harness reads them) | gone |
| The DOM measuring spans (the arch's font) | gone |
| The ready signal | the bench's own (section 2) |

**Film 4's page (`/proto/your-words`) keeps its arch:** `lettering-piece.tsx` and `arch-medium.ts` are shared with it and
are NOT edited.

### 5. Room for the spline editor

**It is a TOOL, not built here.**
- It works on the chain: the camera tracks and their timing, the speed ramps for moves like the hero's push-in (D-101,
  *the camera layer*).
- It depends on nothing an idea provides. It needs the chain, the transport and a panel.
- So nothing in this change shapes it. **The slot does not give an idea any say over tools**, which keeps tools general.

## Build order — two steps, one variable each

1. **The world and the arch.** The world rebased, the arch out, the ready signal, the saved-chain move. The hero still
   mounted as today (through the new constants).
   - **Measured:** the text, logo, page camera and grid are identical against the floor; the lights' new directions; a
     saved chain's poses identical against the floor; the first-frame stall and time to first frame, before and after.
   - **Carl re-judges the text under the corrected light.**
2. **The slot.** `bench-ideas.ts`, the hero moved into it, the media cleaned.
   - **Measured:** the frame is pixel-identical to the end of step 1 (the null control). The empty workshop (no idea)
     loads and draws.

## Files

| File | Change | Scope |
|---|---|---|
| `components/showcase/camera-bench.tsx` | the world constants; the arch out; the slot; no hero import | open |
| `components/showcase/bench-medium.ts` | `heroText`, `post` and `arch` out; a generic post hook | open |
| `components/showcase/bench-medium-webgpu.tsx` | the hero's imports and the arch's environment out | open |
| `components/showcase/hero-page.tsx`, `hero-text.tsx`, `hero-logo.tsx`, `hero-text-material.ts`, `hero-bloom.ts` | unchanged in substance; imported by the hero idea instead of the bench | open |
| **NEW** `components/showcase/bench-ideas.ts` | the list of ideas (lazy) | ⚠ **Carl widens the scope** |
| **NEW** `components/showcase/hero-idea.tsx` | the hero as an idea: `Scene`, `home`, `Guide`, `post`, `materials`, `medium` | ⚠ **Carl widens the scope** |
| `components/showcase/shot-format.ts` | the chain's v4 (the workshop's frame), only if saved takes are moved | ⚠ **Carl widens the scope** |
| `lettering-piece.tsx`, `arch-medium.ts` | not touched (film 4's page) | — |

⚠ **Folders:** the tools and the ideas still share `components/showcase/`. Separating them into folders is the template
extraction's job (the workshop record). It is not done here, but the slot makes it a move, not surgery.

## What depends on the current structure (§5b), beyond the tables above

- **Harnesses waiting on `drawn`** (six, 26 October to 5 November): they keep working. Their arch checks will fail; those
  were film 4's.
- **`live-work/scripts/hero-bloom-measure-9-november.mjs`** and the probes this session read world positions. After step 1
  every world Y changes by +429.05 and Z by −16. **They are re-baselined, not compared across the change.**
- **The reflection note (v1.7):** `HeroStage` becomes the hero idea's `Scene`. Its frame copy (R9-1) still applies to the
  idea's group. Its file references follow this note.
- **The page camera's lens readout (33 mm) and the shift:** they move from `blankHome` to `idea.home`. They read the same.
- **The third-person view, PiP, recorder, takes, timeline, pad:** untouched, apart from the units move above.

## Questions

**For the Architect:**
1. The slot's shape: one object per idea, loaded lazily. Is anything missing that today's `blank` provides?
2. Moving saved chains by a units rewrite on load, against leaving them as history.
3. The post hook generalised from the medium's hero-named `post`: any renderer-state hazard in moving the bloom's
   ownership from the medium to the idea (the bloom note's frame-buffer and MRT findings)?
4. Two build steps as above: right cut?

**For Carl:**
5. The two new files (`bench-ideas.ts`, `hero-idea.tsx`), and `shot-format.ts` if takes are moved: widen the scope?
6. Saved takes moved into the new world (recommended), or left as history?
7. After step 1, re-judge the text under the corrected light.


## (v1.0 as written) Structural note — the arch removed from the camera bench (9 November 2026, session 2) — v1.0

**Status:** PROPOSED, for Carl (CLAUDE.md §5a/§5b). Nothing is built.
**Authority:** Carl: *"The arch does not need to be there, it was the blueprint for one of the films which is now
completed."* Then: *"the arch, hidden or otherwise, does not need to be there. remove it."* So **the arch's BUILD goes too**,
not only its mount.
**Author:** the Builder. **Record:** D-101, *"THE LEAN MOUNTED; THE ARCH OFF THE BLANK CANVAS"*.

## Why it is structural

The bench measures its WORLD from the arch's build: the floor, the front line, the chain's units, Home, the grid's
position and the hero's offset. Removing the build replaces a measured source with **frozen numbers**. The bench without
`?blank=1` also loses its subject.

## What the arch's build feeds today (§5b), and what happens to each

Measured from the running bench on 9 November, session 2 (`__cameraBench`, three canvas sizes: 1367×468, 1367×539,
1231×542). The live measure does NOT depend on the canvas size, so the numbers freeze cleanly.

| What the arch provides | Today's value | After |
|---|---|---|
| **The floor** (`world.floor`, its lowest ink) — the hero's group, the grid, the axes, the metre readout, Home on `?blank=1` | −429.05184025084225 | **FROZEN, exact.** Nothing moves: the hero, its lights (the measured tilt included), the logo at (−163.4, −331.4, 809.9), the grid |
| **The front line** (`world.z1`) — the same consumers | 16 | **FROZEN, exact** |
| **The chain's units** (`m.d`, `m.up`, `m.zc`) — every clip and take is stored in them; a new chain commits them once | d 2287.490381354744, up 0, zc 16 | **FROZEN, exact.** Carl's saved chains carry their own units and are untouched; a new chain gets the same numbers |
| **Home without `?blank=1`** — face-on at (0, 0, d) | (0, 0, 2287.49) | kept, from the frozen d. It now faces the empty grid |
| **Home on `?blank=1`** — the page camera, from floor and z1 | (−39, −357.55, 1689.43) | unchanged (frozen floor and z1) |
| **"See it all"** (third person) — frames the arch's box, expanded by the paths | the arch's box | **the hero's box on `?blank=1`** (text and logo, measured from the stage's group); without it, the paths' box or the existing fallback |
| **The focus object, the C** — the focus distance readout and the subdivided metre squares (without `?blank=1` only) | the C's box | **REMOVED** with the arch. *"choosing a focus object is not built"* stands |
| **Clip clash notes** — "passes THROUGH the N" | the arch's letter boxes | **REMOVED** with the arch |
| **The info drawer's arch rows** (`data-arch-world`: size, opening, letter heights) | the arch's numbers | **REMOVED.** No harness reads them (grepped) |
| **The ready signal** `data-camera-bench="drawn"` — six harnesses wait on it | the arch's `onReady` (first frame with its programs linked) | **the scene's first drawn frame**, on both URLs |
| **The canvas's mount gate** (`shown &&`) and its failure text (`failure`, the arch's font and collision checks) | waits for the arch's font, layout and worker | **gone:** the canvas mounts at once |
| **The arch's HDRI `use`** — suspends the whole scene until loaded | holds the hero back | **gone:** the hero draws sooner |
| **The arch's `compileAsync`** — precompiled every shader in the scene, the hero's included | the hero's pipelines ready before its first frame | **gone:** the hero compiles on its first frame (the bloom already does). The first-frame stall is measured before and after |
| **The arch's environment PMREM** (WebGPU) | built, never seen on `?blank=1` | **gone** |
| **The arch's two lamps** | in its hidden group: light nothing (measured) | **gone**, no change |
| **The DOM measuring spans** (`MeasureSpans`, the arch's font) | in the page | **gone** |

## What does NOT change

- **Film 4's page (`/proto/your-words`) keeps its arch.** `lettering-piece.tsx` and `arch-medium.ts` are shared with it and
  are **not edited**. The bench simply stops using them.
- The recorder, takes, clips, timeline, pad, third-person view, PiP, page guide, lens readout, the bloom, the hero.

## The frozen numbers — one constant, with its provenance

`BENCH_WORLD` in `camera-bench.tsx`: `{ floor, z1, units: { d, up, zc } }`, the values above, exact. Its comment says
where they came from: the arch's measurement, frozen on its removal on 9 November 2026. **It is not a second source of
truth: the first is deleted in the same change.** `measureArch` and `ArchWorld` go.

## The media

`bench-medium.ts`'s optional `arch` field, and the WebGPU medium's `WebGPUEnvironment` and `webgpuCompileWait`, are then
used by nothing on the bench. **They are removed** (`bench-medium.ts`, `bench-medium-webgpu.tsx`, both open). Dead code
would otherwise sit in the hero's medium.

## Measurement plan

1. **Nothing moved:** on `?blank=1`, the hero's group, the logo's world position, Home's pose and the lights' world
   positions are identical before and after (exact), and a page-camera frame differs by at most 1 level outside the
   first-frame compile.
2. **A saved chain plays the same:** a chain recorded before the change plays the same poses after (exact, in its own units).
3. **The ready signal:** `drawn` arrives on both URLs. A harness waiting on it (`camera-bench-verify-26-october.mjs` with
   `BENCH_QUERY=blank=1`) gets past its wait. Its arch checks are expected to fail: that harness was film 4's.
4. **The first-frame stall** before and after (the lost precompile), and the time to the first frame (the lost HDRI wait).
5. `tsc`, lint (baseline: 1 error, 2 warnings, all known), a clean console.

## Files

| File | Change | Scope |
|---|---|---|
| `components/showcase/camera-bench.tsx` | the arch's build, mount, measures and features out; `BENCH_WORLD`; the ready signal; the hero's box for "see it all" | open |
| `components/showcase/bench-medium.ts` | the `arch` field out | open |
| `components/showcase/bench-medium-webgpu.tsx` | `WebGPUEnvironment`, `webgpuCompileWait`, `ARCH` out | open |
| `components/showcase/lettering-piece.tsx`, `arch-medium.ts` | **not touched** (film 4's page) | — |

## Questions for Carl

1. **The bench WITHOUT `?blank=1`:**
   - **(recommended)** keep it as the empty grid world, Home where it was;
   - or make `/proto/camera` open on the hero's canvas, with `?blank=1` still accepted.
   The second is a bigger change (the focus squares, Home and the guide are switched by it). It is better as its own step,
   if wanted.
2. **"See it all" framing the hero** (text and logo) on `?blank=1`: a small new behaviour, replacing the arch's box.
3. Does this go to the Architect, or do you approve it from here?
