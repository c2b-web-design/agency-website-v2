# Session Handoff — 10 August 2026 (Q5 stall fixed, label colour, filament, next-step mesh)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

## STATE OF THE TREE

**Branch `fix/q5-stall-and-label-colour`, pushed.** Two commits on top of `eb827f0`:

    303a826  fix(enquiry): one label texture, and the white is white again
    181f8bc  feat(enquiry): the filament is the half-pipe, and it surges

**Uncommitted and untracked — the next-step button prototype, unfinished:**

    components/enquiry/nextstep-geometry.ts
    components/enquiry/nextstep-canvas.tsx
    app/proto/nextstep/page.tsx        the bench
    app/proto/minimal/page.tsx         an isolation test, DELETE when done

`npx tsc --noEmit` clean. Lint at the recorded baseline: **1 problem (1 error, 0 warnings)** —
the known `enquiry-opening.tsx` reduced-motion effect, untouched. **Dev server was left running
on :3000.**

---

## ✅ APPROVED AND COMMITTED THIS SESSION

### The Q5 stall — CAUSE FOUND AND FIXED

An interleaved bisect (7 arms × 3 rounds, **production build per arm**) named `4c7a20e`: it added
a **second 2048×512 canvas texture per card** for the hover teal. Worst frame gap in the reveal:

    3a7cf1f    82ms   D-046, approved — the control, reproduced
    4c7a20e   329ms   <- +217ms
    eb827f0   317ms   HEAD before the fix
    after the fix     167ms

⚠ **THE FIX WAS CARL'S DESIGN CALL, NOT A WORKAROUND.** He discarded the fake extrusion; the
relief was identical in both textures, so with it gone the two differ only in glyph hue — a
**tint**, needing one texture instead of two.

⚠ **167ms IS NOT D-046's 82ms.** A separate +76ms step at `1c9b8d7` is unexamined, and the
structural cause stands: the canvas creates its WebGL context INSIDE the reveal because two mount
sites sit either side of a ternary. That is the shared-host restructure D-046 declined to
authorise. **Carl: "We will come back to the Q5."**

### The label colour — Carl: *"That looks a lot better"*

Three causes of the blue cast, all fixed: the texture was `rgb(238,241,252)` (a 14-point tilt),
the **light** is blue and multiplies albedo, and the glyphs were dim. Neutralised at
`dithering_fragment` — the last chunk — mixing each glyph pixel toward its own luminance so hue
moves and brightness does not. Glyph core went 146/155/170 → 221/221/221.

### The filament — Carl: *"Looks good"*

Most of the half-pipe rim is now the incandescent body (he redirected from a thin strand: *"more
real estate and pixels to work with"*), and it **surges** — flares hot, settles back. The
reflection is quenched as the metal heats, because emissive added to `metalness: 1` metal read
pink at every ramp setting.

---

## 🔴 START HERE — THE NEXT STEP BUTTON MESH, AND AN INSTRUMENT FAULT THAT COST FIVE FIXES

### ⚠⚠ THE CANVAS RENDERS. EVERY "ALPHA 0" READING WAS FALSE.

**`preserveDrawingBuffer: false` means `readPixels` AND `toDataURL` return an EMPTY BUFFER on a
static canvas.** The corridor's canvases only read non-zero because the traveller's rAF keeps
them drawing. Mine had nothing animating, so both instruments reported a blank canvas that was
in fact rendering correctly — **confirmed by `page.screenshot()`, which shows the mesh.**

⚠ **USE `page.screenshot()` ON A STATIC CANVAS. NEVER `readPixels` OR `toDataURL`.**

**It sent five wrong fixes**, all recorded in the code so they are not repeated: deepening the
crown 2.4 → 8.5, rescaling the env panels, adding `invalidate()`, flipping the winding, and
`DoubleSide`. Two of those were REAL bugs found on the way (see below) but none was the cause,
because there was no cause — it was drawing all along.

**Ruled out by measurement before the screenshot settled it:** geometry (18,017 verts, correct
bounds), camera (frustum ±72×±34.5 vs a ±58×±20.5 pill), scene graph (mesh present, `visible`,
106,248 indices), culling, lighting, and `frameloop="always"`.

### Two real bugs fixed on the way, both worth keeping

1. **The first geometry folded through itself.** Offsetting a closed pill inward by its own
   half-height collapses it to a line and then inverts. Rebuilt as a **height field over the
   pill's interior** — z as a function of distance from the edge, nothing to fold.
   ⚠ `sweptBand` in `answer-card-mesh.tsx` avoids this only by luck of scale (inset 2 on a 576px
   card).
2. **Triangle winding was clockwise**, so faces were back-facing. Found with a cross product in
   plain node, no browser.

### WHERE IT STANDS

Geometry built and verified. Material approach settled and the Architect confirmed it:
**chrome is `metalness: 1`, roughness 0.08, and NO body colour — the blue comes from the
environment.** Carl's reference set proves it: across six logo renders *the material never
changes, the SCENE changes.* Plus the Satriani "Chrome Boy", which reads grey only because it is
photographed against grey.

**NEXT ACTION: screenshot `/proto/nextstep` and look at it.** It has never been seen.

---

## THE ARCHITECT'S REVIEW OF THE MESH — received, NOT yet acted on

Ranked by leverage. ⚠ It was written against code believed not to render; **re-read it once the
button has actually been looked at**, because points 1-3 assume a working image.

1. **The shell is black; in the reference the darks are BLUE.** `nextstep-canvas.tsx` builds the
   surround as `0x000000`, so a mirror returns black wherever the key panels miss — neutral
   chrome in a dark room rather than blue platinum. Try `#0b1a2e`, or a vertical gradient shell.
   **"The single change that moves chrome → platinum-blue."**
2. **ACES will grey out the blue.** It desaturates as values approach white, exactly the band
   where the reference is bluest. `THREE.NeutralToneMapping` holds hue far better. ⚠ Safe here
   because `NextStepCanvas` is its own `<Canvas>` with its own renderer — it cannot touch the
   approved card material.
3. **The double highlight band is GEOMETRY, not material.** `crownHeight()` is a single smooth
   dome and gives one band; the reference has a bright core, a groove, and a second parallel
   line. Needs a shallow inflection near the edge. **Flagged so nobody tunes material params for
   a geometry feature.**
4. **Bloom in CSS, not postprocessing** — `filter: drop-shadow(...)` on the wrapper. Given what
   frame cost has already cost on Q5, an UnrealBloom pass on a CTA is the wrong trade.
5. Smaller: a faint roughness map (0.06-0.14) reads as platinum rather than chrome; **do NOT
   reach for anisotropy** (inert without a tangent attribute — already recorded at
   `answer-card-canvas.tsx:1142`); keep `#ffffff` F0, `#eef4ff` at the very most.

⚠ **AND A TRADE THAT IS CARL'S TO DECIDE:** `ENV_KEY_COLOR` / `ENV_FILL_COLOR` are imported from
`answer-card-glass.ts` deliberately so the button and cards share a room. **Pushing the shell blue
puts the button in a bluer room than the cards.** Probably invisible at 116×41 under the grid,
but it is a real trade against the "same world" principle — decide it, do not discover it.

---

## THE BRIEF, IN CARL'S WORDS

- **Geometry** from the CSS button's shadow stack — a domed pill, measured **116.3 × 41**.
  ⚠ *"Even though the CSS next step button was blue, it was not opal... trying to be frosted
  glass."* **The CSS button is the thing being REPLACED, not the material reference.**
- **Ivory** = Begin, start page. **Opal** = client info section. Both real materials, both taken.
- *"only the next step button wont be frosted glass."*
- **Material: chrome blue metal.** *"its chrome blue metal."*
- **Amber is parked.** *"It's something that may or may not be implemented with the cards...
  This is something i will return to."* Build the material so it stands with no amber at all.
- **If real filament light cannot reach the button, simulate it.** *"putting an amber light next
  to the button and activating it when certain cards are pressed. Belonging in the same world is
  what counts."* `AmberSource` exists for this, off by default.
- ⚠ **THE ROLLOUT.** *"When this next step button is built all the Q5 components will be cloned
  and rolled out to the other Qs."* Nothing may hard-code Q5's position or the "Next step" label
  width — Send is a different width.

### ⚠ AND THE HARDEST-WON LESSON, FROM THE OPAL RIG

`contact-field-light-rig.tsx` **built, measured and REJECTED** true proximity driving: closest
approach fell at phase 0.953 inside the hidden half, and the range was a 1.3× swing — too flat to
see. The shine follows the visible front pass instead. Carl's bar: *"The user won't know about
the ellipse, all they will see is its effects."* **Belonging, not accuracy.**

So *"chrome plus real lights and the physics does it for free"* is NOT a safe assumption. **The
swing must be measured, not assumed.**

Also from that file, and it applies directly to chrome's temptation to move everything:
*"a single specular catch responding reads as a material; the whole button animating reads as a
light show."*

---

## Still open, unchanged

- **Q5: 167ms, not 82ms.** The `1c9b8d7` step and the shared-host restructure both untouched.
- ⚠ **`verify/hover-teal.mjs` SORTS CANVASES BY AREA AND PICKS THE WRONG ONE** — the contact
  field (576×184) over the answer grid (576×104), so its crop lands on the page heading. **Do not
  trust its numbers.** `verify/teal-core.mjs` anchors to `.enquiry-answer-grid` and is correct.
- **The `frameloop` regression** — the traveller's unconditional rAF keeps the canvas at 60fps
  while the corridor is open. Measured minor for the stall (~30-70ms) but real on a phone;
  throttling is a visual change and Carl's call.
- **The floating faces / black edges**, **card 2 the weakest at swing 9.9**, **`GLASS_CLEARCOAT`
  inert**, **the ground plane stash**, **~2.4MB of three loading eagerly**, **SHADOW**, and
  ⚠ **ACCESSIBILITY DEBT: the answer text is a texture, not in the a11y tree** — mandatory when
  these become real controls.

---

## THE THREE CARD STATES — ALL APPROVED

| state | status |
|---|---|
| **Resting** | ✅ `7b056c2` — *"thats a lot better"* |
| **Hover** | ✅ teal, approved today |
| **Selected** | ✅ filament surge, approved today — *"Looks good"* |

---

## How to look at it

```
npm run dev
http://localhost:3000/proto/nextstep     the button bench  <- START HERE
http://localhost:3000/start              the corridor
node verify/teal-core.mjs                white -> teal, grid-anchored
node verify/reveal-cost.mjs              the Q5 profile
bash verify/run-bisect.sh 3              the repaired interleaved bisect
```

Button dials: `?chromerough= ?chromeenv= ?amber= ?flat=1 ?always=1`
⚠ `?flat=1` and `?always=1` are leftover diagnostics — **remove them** once the button renders.

⚠ **MEASURE HEADED, WITH `--enable-gpu`.** Every harness prints the renderer and aborts on a
software rasteriser.

---

*10 August 2026. Q5's cause was found and fixed, the label reads white, and the filament is
approved. The open subject is the next-step button mesh, which is built but has never been LOOKED
AT — the instrument said it was blank and the instrument was wrong.*

***The transferable lesson of the day, seven times over: the instrument answered a question
adjacent to the one asked, and the adjacency was invisible in the output.*** A harness sampling
the relief halo; a bisect measuring Turbopack; a probe comparing a duration from one GL context
to a timestamp from another; a bisect measuring a zombie server; an A/B measuring run order; a
histogram of the CARD used to claim something about the TEXT; and `readPixels` on a canvas with
`preserveDrawingBuffer: false`. **Confirm the instrument can see the thing before believing what
it reports.**
