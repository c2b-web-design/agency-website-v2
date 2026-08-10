# Architect answer — the hover teal that animates and paints nothing

**Received 10 August 2026. Answers `architect-question-hover-teal.md`.**

**Status of this document: CANONICAL for the hover-teal chunk.** Where it contradicts the
question, this wins — the question contained three invalid eliminations and one wrong
hypothesis, all corrected below.

⚠ **THE ARCHITECT COULD NOT RUN ANYTHING** (no shell that session). Everything here is either
**verified by reading installed source** or **derived arithmetically from the harness's own
numbers**. Each claim is marked. **The Builder re-verified the four load-bearing source claims
against `node_modules` before acting** — all four hold, and the checks are recorded below.

---

## 1. THREE "RULED OUT" ITEMS WERE NOT RULED OUT

⚠ **This is the most important section, because the question told the Architect not to
re-examine these — and two of the three eliminations were worthless.**

### 1a. "The injected source reaches the GPU" — proves less than claimed

The interceptor found `uLabelTeal` in eight compiled fragment shaders. **That proves the
prepended declaration block arrived, and nothing more.** The prepend and the `.replace()` are
independent operations on the same string:

- If the `.replace()` matched nothing, `uLabelTeal` **still appears exactly once** as a
  declaration, the shader **still compiles**, and GLSL drops the unused sampler.
- **The working shader contains `uLabelTeal` TWICE** — once declared, once sampled.

**Counting occurrences is the test. Presence is not.**

### 1b. "No GLSL compile error" — guaranteed by configuration, not by correctness

⚠ **`answer-card-canvas.tsx:3563` sets `gl.debug.checkShaderErrors = false`.**

three then never calls `getShaderInfoLog` and never checks `LINK_STATUS`. **Console silence here
is a setting, not evidence.**

**Builder verified 10 August:** line 3563 confirmed present, with two related notes at 2499 and
3539 recording it as a deliberate stutter fix.

*(A hard link failure would blank the face, and the face renders — so it did link. But the
elimination as written is invalid and must not be recorded as one.)*

### 1c. "The teal texture is built" — a `useMemo` executing is a different claim

Untested. What matters is `uLabelTeal.value` being **non-null AND different from `labelMap`** at
draw time, which nobody has looked at.

---

## 2. TWO HYPOTHESES ARE DEAD — KILLED BY READING, NOT BY RUNNING

### 2a. ⚠ THE BUILDER'S OWN LEADING THEORY IS WRONG

The question's closing hypothesis — *"five cards may share one compiled program while each
builds its own uniforms ref, so one card's uniform wins"* — **is false.**

`WebGLRenderer.js:2169` reads `materialProperties.programs`, a **per-material Map**. Lines
2216–2221 call `material.onBeforeCompile(parameters)` and then assign
`materialProperties.uniforms = parameters.uniforms` **inside that per-material branch**.

**`acquireProgram` shares the compiled GL program across the five cards; it never shares the
uniform objects.** Five cards get five independent `uHover`.

**Builder verified 10 August** against installed r0.185: `materialProperties.uniforms =
parameters.uniforms` sits inside the per-material branch exactly as described.

### 2b. Frame starvation is not the cause — but the reason why is itself a defect

`TravellingLight` (`answer-card-canvas.tsx:579–587`) runs an **unconditional** rAF loop calling
`invalidate()` every frame. The canvas is drawing continuously, so `useFrame` is running.

Two consequences, and the second is a separate bug:

- The two captured PNGs differ slightly (the traveller moved between them), **independently
  confirming frames were produced during the hover window.**
- ⚠⚠ **COMMIT `7b056c2` QUIETLY TURNED A DEMAND-MODE CANVAS INTO A CONTINUOUS 60fps ONE**,
  contradicting the file's own header at line 18: *"`frameloop="demand"` AND IT STAYS THAT WAY…
  nothing needs a continuous rAF loop."* **A shipped, unrecorded cost, separate from this
  question.**

**Builder verified 10 August:** the header claim at line 18 is still present and now false.

---

## 3. ⚠ FIX THIS REGARDLESS OF WHAT THE TEAL BUG TURNS OUT TO BE

**The hover ease must not be driven from `useFrame`.**

It currently works **only because the traveller happens to be invalidating**. Under
`reducedMotion` the traveller parks (lines 570–574) and **the ease loses its frame source
entirely** — the teal would simply never arrive.

⚠ **THIS FILE ALREADY RECORDS THAT EXACT TRAP TWICE** — lines 315–321 and 1855–1858: *"a ref
animated without invalidating produced three repaints across an entire 2000ms fade."*

**The hover needs its own rAF driver that calls `invalidate()` while it runs and stops when
settled — the `useFilament` shape exactly.** Fix it in this chunk.

---

## 4. THE HARNESS EXONERATES THE MATERIAL, AND ITS NUMBERS CONTAIN AN UNUSED CLUE

Resting ink measured **199.4 / 204.1 / 213.6**; the texture ink is **rgb(238, 241, 252)**.

    channel ratios   0.838   0.847   0.848
    g−b: texture −11 → measured −9.41,  against 0.847 × −11 = −9.32

**The rendered label pixel is the texture's albedo times a near-flat 0.845, with essentially no
additive term.**

### This settles Question 2 empirically

**Sheen, anisotropy and the env reflection are NOT swamping the albedo on the glyph pixels.**
The insertion point after `map_fragment` is **correct**, and blending before the material sees
it — a canvas redraw — **would buy nothing and cost a 2048×512 redraw on the interaction frame.**

### And it corrects the expected shift

Full teal would land at ≈ **135 / 186 / 185**, g−b ≈ **+1**, so the expected shift is **≈ +10.5,
not +13**. Same order; nowhere near the measured **+0.75**.

⚠ **THE HARNESS IS SOUND AND THIS IS NOT A SAMPLING ARTEFACT.** Luminance would also have
dropped ~13% and did not. At 186 green the glyph still sits far above the satin body, so the
brightest-6% window still lands on it. The crop shows *"Premium new website"* = `CARD_LABELS[0]`,
which is the card `answer-card-hover-0` targets — **crop and hover agree.**

**So the albedo really is unchanged.**

---

## 5. THE REMAINING SPACE IS EXACTLY TWO BRANCHES — INSTRUMENT, DO NOT GUESS

Either **the mix is not in the executed program**, or **`uHover` is 0 at draw time.**

⚠ **BOTH PATHS READ CORRECT IN SOURCE, WHICH IS PRECISELY WHY THIS NEEDS INSTRUMENTING RATHER
THAN A FOURTH GUESS.** Three have been spent already: the cache key, the sampling crop, and the
shared-uniform theory.

**One run, three probes, ~5 lines of temporary code. A and B partition the space completely.**

| probe | what it does | how to read it |
|---|---|---|
| **A — source** | In the `shaderSource` interceptor, **count** `uLabelTeal` occurrences per shader and assert the literal `diffuseColor = mix(` is present | **1 occurrence → the `.replace()` silently missed.** 2 → the code is genuinely on the GPU |
| **B — state** | In the `useFrame`, write `uHover.value`, `uLabelTeal.value !== null`, and `uLabelTeal.value !== labelMap` to `window.__hoverProbe`. Read it from the harness at the same three instants it samples colour | shows whether the drive and the sampler are live at draw time |
| **C — bisect** | *Only if A and B come back clean.* Replace `uHover` with the literal `1.0` in the GLSL | **teal at rest → the fault is in the drive. Still white → the fault is in the sample or the blend** |

**Run A and B together, before changing anything.**

---

## 6. THE REMAINING QUESTIONS, ANSWERED

### Q3 — two textures or one? **Keep two.**

⚠ **THE ALPHA-PACKED MASK IS A TRAP HERE SPECIFICALLY.** `map`'s alpha feeds `diffuseColor.a` →
`opacity`, and `CardLighting` writes `mat.opacity` **every frame** for the entrance fade
(line 2211) — **so a coverage mask in alpha would punch the body transparent.** A second UV set
is complexity for no gain.

**Builder verified 10 August:** `mat.opacity = a` confirmed at that location, written per frame
inside the entrance hook.

⚠ **AND THE QUESTION'S MEMORY CONSTRAINT WAS WRONG.** It said 25 → 50 textures. **The live cost
is 10, not 50** — `useMemo` is keyed on `label` and the disposal effects release the previous
pair, so 50 is the **lifetime allocation count, not the concurrent one.** ~10 × 5.6MB with mips
≈ **56MB**. If that ever bites, the lever is **1024×256** (still ~1.8× the face's ~576×104 CSS
px), not a cleverer packing.

### Q4 — the faked extrusion? **Accept it. Do not reach for a normal map.**

At ~12px glyphs a normal map would cost a **third texture per card** and a tangent-space setup
**on geometry whose tangents are already carrying the satin anisotropy**, to produce relief that
cannot resolve.

**Two things to WRITE DOWN rather than fix:**

1. **The baked lip is drawn for the key at `[-160, 120, 40]` while the dominant source is now a
   moving spotlight**, so the implied and actual light directions disagree during the sweep.
2. **The white lit lip at `rgba(255,255,255,0.38)` is identical in both textures**, so it stays
   white when the glyph goes teal. ⚠ **This is arguably CORRECT — a lit edge returns the light's
   colour, not the material's — but it will read as an oversight to whoever sees it next, so the
   comment must say so.**

### Accessibility and the black-edge regression

**Untouched by any of this.** The change adds no new baked text, and the mix is confined inside
`#ifdef USE_MAP` and never touches sheen or radiance.

---

## 7. WHAT THE BUILDER TAKES FROM THIS — the process note

⚠ **THREE OF THE FIVE ELIMINATIONS IN THE QUESTION WERE UNSOUND, AND THE QUESTION PRESENTED THEM
AS SETTLED** — under a heading telling the reader not to re-examine them. Two were worthless:

| the elimination | why it failed |
|---|---|
| *"no compile error"* | error reporting is **switched off** in this canvas |
| *"the source reaches the GPU"* | tested for **presence** of a token that appears whether or not the injection worked |

**Both tested something adjacent to the claim rather than the claim itself** — the same class as
this project's seven recorded harness-lies, now appearing in prose instead of in a script. **An
elimination is a measurement and carries the same burden of proof.**

**And the one hypothesis offered as a starting point was refutable by reading the installed
source in under a minute.** It was correctly marked untested; it should also have been checked
before being written down.

---

*10 August 2026. Two branches remain and they are cleanly separable. Probes A and B first,
before any change — and the `useFrame` drive gets fixed in the same chunk either way, because it
is broken under reduced motion regardless of what the teal turns out to be.*
