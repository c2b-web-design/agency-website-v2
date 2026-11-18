# Structural note: the floor, chunk 1 — the leaning logo's pattern (v1.5, 18 November 2026)

**Status: PROPOSED. Not built; no code touched.** v1.4 is round 4's housekeeping ([U1]–[U4]); v1.3 answered round 3 ([T1], [T2]); v1.2 answered round 2 ([S1]–[S4]); v1.1 answered the review of v1.0
(`review-floor-lean-note-18-november.md`, eleven findings, [R1]–[R11], and its "small gaps" as [R12]; each marked where it changed the note). For the Architect, through Carl (plan-review gate,
`handoff-protocol.md` §2.5). Workflow 5a: it adds the scene's FIRST FLOOR SURFACE (a new mesh and material, a new
compiled program) and a mechanism the later chunks (positions 2 and 3) will reuse, so its shape is decided here.

## The brief (Carl, D-101, 16 and 18 November 2026)
- From `webgpu_lights_projector` only the PULSING PATTERN on the floor; no statue, no rotation, no square edge — a rough
  circle. It replaces the bench's grid.
- *"The liquid and logo would provide a heat source and hence the webbed pattern."* Three positions, left to right:
  **1, the leaning logo; 2, the landing and the amber liquid (hotter, a bigger area, a bit more red); 3, the solid logo,
  red then blue.** Positions 1 and 3 are the same object: the same pattern and intensity; after the rain the same, only
  blue. Every source is hottest / coldest NEAR the object and dissipates with distance.
- **Chunk 1 (Carl):** *"First, the leaning logo. Pattern goes in. When it jumps, does the pattern fade? if so, how long
  after the jump?"* Built first, then fine tuned on the bench.

## Homework (done)
- **The example's source (r185):** the pattern is not the floor's. A grey matte floor (`MeshLambertMaterial`) is lit by
  a `ProjectorLight` (a spotlight carrying a picture; Unreal: a spot light with a Light Function) whose `colorNode` is
  `mx_worley_noise_float(projectorUV × 10 + time) × #5abcd8 × 2`: cellular noise, dark at each cell's point, bright
  between. `+ time` slides it diagonally ~1 cell/s; the lamp orbits (radius 2.5, ~19 s). The "pulse" is that slide under
  the lamp's soft falloff. The square edge is the projector's picture frame.
- **The live example (threejs.org now serves r187, looked at 18 November on Carl's pointer; [S4] threejs.dev — Carl's
  editor, Stage 0 — serves the IDENTICAL code, checked by diff; not a typo):** two changes from r185 —
  the noise is SQUARED (`mx_worley_noise_float(…).pow(2)`: darker cell interiors, a narrower, crisper bright web, more
  contrast) and the shadow type line is gone. Which version Carl filmed on 8 November cannot be told from the film. The
  exponent is a dial (1 = r185's, 2 = today's), so both looks are available on the bench.
- **The film** (`00 References\projector-floor-8-november.mp4`, 1:43): contact sheets in the session scratchpad.
- **Our scene:** no floor surface is drawn (the grid off since 16 November; the world `#050505`). The floor is a height,
  `FLOOR_Y` −437.5, used by the liquid's clip, the rain's splashes, the steam's box and the lean's contact. The blobs'
  floor glow (13 November, `stepHeat`) is one additive unlit plane, phase 1 only.

## ⛔ STAGE 0 — THE SKETCH FIRST (Carl, 18 November 2026)
*"we use the code and then chage parts of it and make it our own. we modify it."* The look is found FIRST in the
example's own code on threejs.dev's editor, one step at a time (`live-work/floor-sketch-18-november/`). The proposal below
is how the result moves to `/proto/hero`; its route (§1) is re-judged once the sketch is done.
⛔ **[S2] THE SKETCH vs WHAT SHIPS.** Step 1 is the example's LAMP (`ProjectorLight` on a lit floor); this proposal ships
an UNLIT ADDITIVE GLOW, which must recreate the lamp's soft fall-off by hand. Workflow 3 (roll out the exact approved
pattern) means one of two, Carl's to choose: (a) the sketch moves to the shipping pieces — the same noise on a flat
unlit additive plane, the lamp removed — as one of its next steps, BEFORE Carl judges the look (the Builder's
recommendation: what he approves is then what ships); or (b) the sketch stays the lamp, and the port to `/proto/hero`
needs its OWN approval by eye.

## The proposal
**1. The floor's OWN GLOW, not a lamp** (re-judged after the sketch, Stage 0). One flat mesh at `FLOOR_Y` (+0.5, as the
blobs' glow), an UNLIT, ADDITIVE node material (`MeshBasicNodeMaterial`, `depthWrite` off): where there is no heat it adds
nothing, so the world stays dark. Carl's framing (heat rises from the source) and his 10 November ruling (*"the floor's
own glow where the hot metal touched it, not a projector lamp"*) both point here.
- ⛔ **[R11] THE FORM IS CARL's OPEN QUESTION, not a take** (D-101: *"is the floor there from the start, and in what
  form"*): A, the floor seen only where heat shows it (what this proposal builds), or B, a dark matte floor seen from the
  start. B would make the mesh LIT (a different material), so the answer is needed before the build.
- **Rejected (pending the sketch): the example's `ProjectorLight`.** It is light: it falls on the logo and the text
  (they can be isolated — a per-material `lightsNode`, a light on a layer the camera does not collect, both already used
  for the logo's own key — but that is machinery to undo the lamp's main property); a shadow-map pass; the square frame
  still masked; and a heat source is not a lamp overhead.

**2. ONE mesh, ONE material for the whole floor, built for three sources.** The material takes a small fixed set of
SOURCES as uniforms (centre on the floor, radius, strength, colour or temperature, drift phase). Chunk 1 drives source 1
only; chunks 2 and 3 drive the others with no new mesh, material or program. The mesh: a plane large enough for all three
positions' circles (sized from the positions, not typed). Pixels outside every circle add 0.
- **Alternative rejected:** one mesh per source — three draws and three programs for one floor.
- ⛔ **[R7] Alternative: EXTEND THE BLOBS' GLOW (`heatPlane`, 13 November) instead of a new mesh.** It is already an
  additive unlit plane at `FLOOR_Y` + 0.5, 1,400 units across, and may reach position 1 (not measured). Rejected as the
  host because: its picture is a 28 × 28 texture written on the CPU each frame (~50 units ≈ 11 cm a texel — it cannot
  carry cells a few cm across, which need per-pixel noise on the GPU); it is square (the field's box), the shape Carl
  ruled out; and it lives only while the blobs are out (`heatPlane.visible = blobsOut && …`), where source 1 lives
  before them. **The reverse merge is proposed instead: in chunk 2 the blobs' heat becomes an INPUT to the floor
  material (its texture sampled as source 2's merge term) and `heatPlane` is RETIRED** — so the "second X" exists only
  between chunk 1 and chunk 2, and the scene ends with ONE floor. Stated now so the slot design allows it.
- **Its own file:** `components/hero/hero-floor.ts` (new — Carl's word needed; **[R12] a `chunk-scope.json` entry on his
  word**), the pattern of `hero-rain.ts`, `hero-steam.ts` and `hero-heat.ts`; `hero-scene.ts` owns it and drives it on
  the story's clock.
- ⛔ **[R9] SOURCE 3 READS THE LOGO's TEMPERATURE, never a copy.** A slot's colour is either a FIXED colour (sources 1, 2)
  or the TEMPERATURE mode: the floor's shader samples `hero-heat.ts`'s field (`HeroHeat.texture`) along the logo's bottom
  edge and maps it red → blue there. Nothing in the scene animates a second temperature. (Built in chunk 3; the slot
  carries the mode from chunk 1.)

**3. The pattern, per source:** the example's cellular noise, measured on the FLOOR in cm (not a picture's uv), its
contrast exponent a dial (1 = r185, 2 = r187).
- ⛔ **[R3] THE OUTWARD DRIFT — v1.0's formula WITHDRAWN.** Sampling at `p − p̂ · speed · t` collapses at the centre:
  every pixel near it reads one ring of radius `speed · t`, so a starburst of spokes (finer every second) sits at the
  brightest spot, and cells are squashed where `|p| ≈ speed · t`. **Proposed: a ZOOM out of the centre** — the noise
  sampled at `p · e^(−k·phase)`, so every cell grows and moves outward from the centre together (no singularity: the
  centre maps to itself), with two copies half a cycle apart CROSS-FADED (each fades out as it grows too large and in as
  it starts small; the cycle loops with no jump). This is the standard "infinite zoom". Its look (cells growing as they
  travel) is a take for Carl's eye; the sketch will show it before anything is ported.
- **The fall-off:** `1 − smoothstep(r0, r1, |p|)`, the radius roughened by a slow noise sampled at `(cos θ, sin θ)` —
  **[R3] not θ itself**, which would seam at ±π.
- A true pulse (the noise taking time as a third axis, cells swelling in place) is a switch, not the default.
- ⚠ **[S3] TO WATCH when the sketch shows the zoom:** (a) the motion grows with distance from the centre, so the
  pattern barely moves AT the hot spot and "emanating" reads most at the faded edge; (b) the two copies averaged
  flatten the web halfway through each cross-fade, so the contrast beats at twice the cycle rate — it may read as the
  pulse Carl likes, or as a muddy beat. Both are judged by eye; if (b) is muddy, the copies are blended by taking the
  brighter (max), not the average.

**4. Source 1's centre** — ⛔ **[R1][R2] CORRECTED.** v1.0 said the scene "already computes" the floor contact as
`lean.contact`: **false**. `lean.contact` is where the logo's back rests on the headline's "t" (`sketch.contact`), and the
lowest vertex is kept only as a HEIGHT (`lowestWorldY`). Either centre is a small NEW computation, from the lean's pose
and geometry once, never typed:
- **The brief's reading (16 November; superseded as the default by [U1]): the leaning logo's CENTRE projected to the floor** — Carl, 16 November:
  *"emanating out from an objects centre"*.
- **The Builder's proposed change, for Carl: the floor CONTACT** (the c's end), where the heat enters the floor. At the
  12.5° lean the two are ~20 cm apart (the reviewer's figure, not measured).
- ⛔ **[U1] CARL, 18 November 2026, after the 16th's "centre":** *"before you build it i will ask you to draw a rough
  circle from the leaning logo base."* So the centre question is now: **which BASE** — (i) the CONTACT EDGE (the c's
  end, where the metal touches the floor), or (ii) the FOOTPRINT under the leaning logo (its outline projected to the
  floor, centred). To confirm with Carl when he asks for the circle; until then neither is the default.

**5. Source 1's life, on the story's clock:**
- **Appears WITH the logo:** its strength × `logoFade` (0 → 1 over the opening's 1.2 s), so it is never seen before the
  logo and adds nothing to the opening's approved timings.
- ⛔ **[R6] THE MESH IS NOT VISIBLE until the warm-up has built it** (`visible = false`, not strength 0): a visible mesh,
  even adding 0, would build its program on the main thread during the opening on its first draw — the stall the
  opening was designed out of. It joins `warmScene`'s `show` list, as the logo does.
- ⛔ **[S1] THE MESH IS HIDDEN AGAIN whenever every source has cooled** — ⛔ **[T2] the threshold in OUTPUT LEVELS:**
  hidden once the brightest pixel the glow adds is below ONE 8-bit level (a gentle red at 5% strength can still be one or
  two levels, so a "strength ~0" cut would show as a step). Chunk 1: ~7.5 s after the jump (story ~9.5 s). [R8] draws the floor FIRST among the transparents — a large draw early in the frame, the
  condition that shifted later draws by up to 59 levels on 16 November — so once it is hidden everything after,
  THE APPROVED STEAM (R-108) and the rain included, draws exactly as today. ⛔ **[T1] CORRECTED — NOT "from the blobs on":**
  the blobs come out at story 4.72 s (`hero-scene.ts`), after the landing (~2.7 s), the 2 s wobble and the pool's growth,
  through the 3 s emission; the floor is still drawn until ~9.5 s, so the LANDING, the POOL, the WOBBLE, the EMISSION and
  the first ~5 s of the BLOBS are drawn WITH the floor present, and those frames are not today's. Hiding an already-built mesh does not rebuild
  it. (Chunks 2 and 3 bring the floor back during the rain and steam: that check — steam and rain, floor present vs
  absent — belongs to them.)
- **Held through the lean** (story 0 – 2 s, `ARRIVAL.holdS`).
- **At LIFT-OFF** (story 2 s) it COOLS, exponentially, the blobs' floor glow's law. ⛔ **[R4] CORRECTED — Carl's
  question, the Builder's answer to judge:** it starts fading AT the jump (the source has gone; nothing holds it), with a
  time constant **τ ≈ 2.5 s**: half gone ~1.7 s after the jump, a faint trace to ~7.5 s (5%, 3τ) [U2]. That is LONGER than the
  blobs' glow — whose 1.6 s is itself the time constant (`exp(−dt/coolS)`, 5% at ~4.8 s); v1.0's "τ ≈ 1 s, longer than
  1.6 s" was backwards — because the logo sat there and soaked heat in. The flight is ~0.7 s (to be read from
  `arrivalInfo`), so pos 1 is still clearly warm as the logo lands at pos 2: the heat is seen to move left to centre.
  Values are takes.
- **[R12] Reset in BOTH `replayArrival()` and `openingAgain()`** (the cooling's clock and the source's strength).

**6. Colour and strength (takes):** the family red, gentle; the exact red against the logo's `#9c0000` judged by eye.

## Workflow 5b — what the floor's area provides today, and what it must keep
| Today | After chunk 1 |
|---|---|
| `FLOOR_Y` as a NUMBER (liquid clip, rain splashes, steam box, lean contact, the fall) | Unchanged: the mesh only draws; nothing reads it |
| The world dark (`#050505`) everywhere off the objects | Unchanged where no heat: additive black adds 0. Null control: the floor HIDDEN before the warm-up and ON during the story = reference where no heat |
| The blobs' glow plane (13 November), additive at `FLOOR_Y` + 0.5 | Untouched in chunk 1; both additive with no depth write, so their sum is order-free. **[R7] Retired into the floor in chunk 2** |
| The amber pool's flat top (~3 cm up, `POOL.topLift`) | Depth-tested against it. **[R10] CORRECTED:** pos 1's circle and the pool's rim are only ~30 cm apart at full spread (the pool's rim ~480 units ≈ 109 cm from the landing; the landing ~1.4 m from the lean — arithmetic from code comments, to be MEASURED), not "< ~1 m". They are not at full strength together (pos 1 cools as the pool grows); the overlap, if any, is additive and is judged by eye |
| The opening's approved timings and the logo's fade | The glow rides `logoFade`; no clock or gate changes |
| The logo, the text | Not lit by it (unlit, additive); their pixels unchanged except where the glow is behind or under them |
| ⚠ The draw-order effect on this GPU (a LARGE draw earlier in the frame changed later draws, up to 59 levels, 16 November) | ⛔ **[R5] CORRECTED:** v1.0 said the floor draws after the logo. **During the FADE it does not**: the logo draws as a transparent depth pass (`renderOrder` 1) and a fade layer (2), so a floor at a lower order draws BEFORE both — exactly when the glow appears. The check covers the FADE frames and the story frames, floor mesh present and absent |
| ⛔ **[R8] The rain's drops and splashes and the steam (transparent, normal blending, sorted by distance)** | **The floor gets a FIXED `renderOrder` BELOW every other transparent** (drawn first among them; it lies under everything): the steam and rain always composite over it and never swap order as the camera moves. Decided now (it matters for source 3, where the steam rises over the glow). The logo's fade orders (1, 2) stay above it |
| The logo's reflection (a prefiltered studio, not the scene) | The glow will NOT show in the logo's metal. Flagged; not this chunk |
| The bench grid (off; switch kept) | Unchanged; the glow adds over it if switched on |

## Load and cost (D-108: price every layer)
- **Compile:** one new render program, built in the background warm-up (hidden until then, [R6]). Measured on build with
  the pipeline log (`hero-pipeline-builds-16-november.mjs`) in a fresh profile.
- **Frame:** one draw; per covered pixel the noise twice (the zoom's two copies, each a 3 × 3 cell search) and a fall-off
  per live source. Measured on build (frame time, Carl's Chrome).

## The checks on build
Null control (above); the centre projected to the screen against the pose (within a pixel); the cooling printed from the
scene, not typed; the draw-order check over the FADE frames and TOUCHDOWN → the HIDE (the pool, the wobble, the emission, the early blobs), floor present and absent [R5][T1]; the floor's order
against the rain and steam from a moving camera [R8]; the pipeline log (no floor program built on the main thread during
the opening) [R6]; the floor HIDDEN once cooled, and the frames AFTER the hide (the later blobs, the rain, the steam) identical to the reference [S1][T1]; tsc, lint at the baseline; a frame-stepped take from Home and close.

## Files (Carl's word before the first edit)
`components/hero/hero-floor.ts` (NEW; `chunk-scope.json` on his word), `components/hero/hero-scene.ts` (wiring, the clock,
the centre, the warm-up), `components/hero/hero-bench.tsx` (a Floor folder: on, strength, radius, roughness, cell size,
contrast, zoom speed, fade τ, pulse switch).

## For Carl to weigh (from the review; not defects)
- **§14a, "caused by the world":** a red glow on the floor that the logo's underside and the "t" never catch may read as
  laid on top. The note had flagged only the reflection. (A fix would be a small light or a term in the logo's and text's
  materials — later, and only on Carl's word.)
- **The subtext:** position 1 sits against the text, so its glow frames the subtext's base from chunk 1, which brings
  forward Carl's "the subtext might conduct some of the heat ... We will get to that."

## For the Architect
1. One floor mesh with fixed source slots, `heatPlane` retired into it in chunk 2 [R7] (the Builder: yes).
2. The zoom with two cross-faded copies for the outward drift [R3].
3. The floor's fixed `renderOrder` below every transparent [R8].
4. Anything in §5b still missing.

## v1.1 (18 November 2026) — what changed
Answers the review (`review-floor-lean-note-18-november.md`): [R1][R2] the centre corrected (`lean.contact` is the t's,
the floor contact not computed; the brief's centre is the default); [R3] the drift formula withdrawn for a zoom, the
angle noise seam-free; [R4] the cooling comparison corrected (τ ≈ 2.5 s); [R5] the draw order during the fade; [R6]
hidden until warmed; [R7] the `heatPlane` alternative stated, its retirement proposed; [R8] a fixed `renderOrder`; [R9]
source 3 reads `hero-heat.ts`; [R10] the clearance corrected (~30 cm, to measure); [R11] the form is Carl's question;
[R12] the scope entry and both resets. Stage 0 (the sketch first) added earlier the same day.

## v1.2 (18 November 2026) — what changed
Answers round 2 of the review: [S1] the mesh hidden whenever every source is ~0, so the approved steam and everything
after the blobs draws as today (corrected in v1.3, [T1]); [S2] the sketch (the lamp) vs what ships (the glow) — Carl's choice, the Builder's
recommendation to move the sketch to the shipping pieces before he judges; [S3] the zoom's two things to watch; [S4]
threejs.org and threejs.dev serve identical code (not a typo).

## v1.3 (18 November 2026) — what changed
Answers round 3: [T1] the floor is drawn until ~9.5 s, so the landing, pool, wobble, emission and early blobs are drawn
with it (not "everything from the blobs on as today"); the checks name that window; [T2] the hide threshold in output
levels (below one 8-bit level). Carl's decisions before the build: form A/B; centre vs contact (his 18 November "from
the leaning logo base" to be confirmed as the base); sketch route (a)/(b).

## v1.4 (18 November 2026) — what changed
Round 4's housekeeping: [U1] §4 quotes Carl's "from the leaning logo base" beside the 16 November "centre", and the
question names both readings of base (the contact edge; the footprint); [U2] the trace ~7.5 s (3τ), consistent; [U3] the
touchdown → hide window stated once in the checks; [U4] the v1.2 changelog marked as corrected in v1.3.

## v1.5 (18 November 2026) — what changed
The Architect's last pass on v1.4: §4's "(the default)" on the centre contradicted [U1]; now "superseded as the default by
[U1]". The Architect stopped the review rounds here: the remaining items are the Architect's three (one mesh with slots,
`heatPlane` retired in chunk 2; the zoom; the fixed `renderOrder`) and Carl's three (form A/B; which base; sketch route).
