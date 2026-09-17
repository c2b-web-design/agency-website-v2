# CHUNK 2 — CS's FROSTED GLASS FACE. Plan, amended after Architect review.

**17 September 2026. ⛔ NOTHING IS BUILT. Implementation is the NEXT session's work.**

⚠⚠ **TRANSCRIPTION NOTICE, per `handoff-protocol.md` §2.5.** The Architect's findings below were
**transcribed by the Builder**, not written by the Architect. ⛔ **The Builder is an interested
party in its own review.** The Architect's own window is the authority if the two ever differ.
*(§2.5 asks Carl to carry findings across; this session's constraints made that impractical and
the deviation is recorded rather than hidden.)*

## ⛔⛔ APPROVED BY CARL — 17 September 2026

**Carl: *"The plan is approved."*** Given after the Architect's two review passes, after his three
blocking questions were answered, and after A2 and C1 were corrected.

⛔ **THIS AUTHORISES CHUNK 2a ONLY** — the bench. ⚠ **The backplate chunk and 2b are described here
for sequencing and are NOT authorised by this approval.** Each returns through the gate.

⚠ **Status of the parameters, restated because approval of a PLAN is not approval of its NUMBERS:**
**only `thickness: 9.80mm` is chosen.** `roughness 0.18` / `transmission 1.0` / `ior 1.45` are **a
starting point Carl passed on as such** — where the faders open, not what they aim at.

---

## Context — why this chunk exists

`/about` §2 puts four cards in a photographed room. Geometry is built and placed; the material is
still **chunk 1's grey diagnostic** by instruction. This chunk gives **ONE card — CS, the right
floor card — a frosted glass face.**

**Carl's ruling, 17 September:** the About faces are frosted — *"thats why the background is
imporrtant."* ⚠ **The causation is his and runs frost → backplate, not the reverse.**

### ⛔ THE ELEPHANT — glass was tried on `/start` and discarded (D-051)

**Two reasons, answered separately.**

**Reason 1 — measured, and it does NOT transfer.** Under `/start`'s **orthographic** camera the
view vector is (0,0,1) everywhere, so the crown centre sat at normal incidence: **0.000px lateral
displacement across the whole centre, 0.801px at the steepest point.** Carl, 17 September: *"There
was nothing behind the glass, makes it difficult to 'see' the material."* ⚠ **A NULL result, not a
negative one.**

**Reason 2 — *"could be seen as cliched in 2026."*** ⛔ **Not answered by the backplate.** Carl
answered it himself: *"Apple glass is quite common. Putting it in a 3D scene with animated neon
and residual effects is not."* **The cliche attaches to the treatment, not the material.**

⛔ **D-051 IS APPROVED WORK ON `/start` AND IS NOT REOPENED.**

### Measured for `/about`, 17 September

**Incidence under this perspective camera:**

| card | min | mean | max |
|---|---|---|---|
| **CS** | 34.7° | **51.5°** | 61.9° |
| CB | 22.8° | 36.3° | 47.6° |
| CD | 16.7° | 29.0° | 40.1° |
| CA | 3.2° | 14.0° | 26.2° |

⚠ **CA barely refracts and stays near `/start`'s null case. The four will NOT behave alike — that
is geometry, not tuning.**

---

## ⛔ THE PARAMETER SET — 17 September

⚠⚠ **C3 — THE PROVENANCE OF THESE VALUES NEEDS CARL'S CONFIRMATION, AND THE LABEL WAS TOO
CONFIDENT.** An earlier draft called them *"Carl's figures"* outright. ⛔ **The same values —
`transmission 1.0`, `roughness 0.18`, `ior 1.45`, `thickness 0.08` — appeared in the FIRST outside
source before Carl posted them.** Carl introduced his message with *"Some nominal values"* and had
earlier said he was holding frost figures of his own.

⛔⛔ **C3 RESOLVED — CARL, 17 September: *"The figures were presented as a starting point."***

⚠⚠ **SO THEY ARE NOT "CARL'S FIGURES" AND THE PLAN MUST NOT CALL THEM THAT.** They are an
**OUTSIDE STARTING POINT that Carl passed on as such** — a fader's opening position, not an
approved value.

⛔ **WHAT THAT CHANGES, AND IT IS NOT NOTHING:**

- **Nothing here is approved except `thickness: 9.80mm`**, which Carl chose explicitly after A1.
- ⛔ **`roughness: 0.18` IS A STARTING POSITION, NOT A TARGET.** F3 already says the final
  roughness is set **in the room, in 2b** — and this confirms the bench opens there rather than
  aims there.
- ⚠ **THE PRECEDENT IS EXACT AND IT IS THE REASON THIS DISTINCTION MATTERS.** The face crown opened
  at an outside recommendation's **0.015-0.03**; **Carl's eye settled 0.073 — nearly THREE TIMES
  the starting point.** *"The conservative figure was too timid for a card this size in a dark
  room."* ⛔ **Do not treat 0.18 as the answer. Treat it as where the fader opens.**
- ⚠ **The UI marks these "starting point, not a proposal"**, exactly as the Architect asked.

| property | value | source |
|---|---|---|
| `transmission` | **1.0** | Carl's figures |
| `roughness` | **0.18** | Carl's figures |
| `ior` | **1.45** | Carl's figures |
| `thickness` | **9.80 mm** | ⛔ **CARL, 17 September, after A1 was put to him with both figures: "9.80mm".** ⚠ **A TYPED CONSTANT, NOT AN EXPRESSION — see A1** |
| `metalness` | 0 | Carl's figures |
| `color` | `#ffffff` | ⚠ **see F4 — NOT the diagnostic grey** |
| `attenuationColor` | `#ffffff` | Carl's figures |
| `attenuationDistance` | `Infinity` | Carl's figures |
| `side` | **FrontSide** | ⛔ set AGAINST the source's `DoubleSide` |

### ⛔⛔ A1 — THE BUILDER'S ERROR. THE EXPRESSION AND THE NUMBERS ARE 2.92x APART.

⚠⚠ **FOUND BY THE ARCHITECT, CONFIRMED BY THE BUILDER AGAINST THE CODE.** The plan said thickness
was `heightMm * TENT_POLE_RATIO` and quoted CS 9.80mm. **Both cannot be true.**

⛔ **`TENT_POLE_RATIO = 0.073`** (`about-card-geometry.ts:624`) — **Carl's crown, settled on the
bench on 14 September.** The expression therefore gives:

| card | height | x 0.073 — what the expression GIVES | what the plan SAID | implied ratio |
|---|---|---|---|---|
| **CS** | 392 | **28.6mm** | 9.80mm | 0.025 |
| CD | 406 | 29.6mm | 10.15mm | 0.025 |
| CB | 520 | 38.0mm | 13.00mm | 0.025 |
| CA | 560 | 40.9mm | 14.00mm | 0.025 |

⛔ **EVERY FIGURE THE BUILDER QUOTED WAS COMPUTED AT 0.025 — the crown ratio that was DROPPED on
14 September when Carl's eye settled 0.073.**

⚠⚠ **THE CAUSE IS A STALE COMMENT, AND IT IS THIS PROJECT'S RECORDED FAILURE CLASS.**
`card-bench.tsx:109` still reads *"its dial is `TENT_POLE_RATIO = 0.025`"* — **true when written,
false against the code today.** `context-rules.md`: *"A STALE COMMENT IS AN INSTRUMENT. It is what
the next reader measures the code by, and it lies exactly as a bad harness lies."* ⛔ **It has now
produced one wrong figure in a plan put to Carl. Correct it in place at execution.**

**The consequence is not cosmetic — displacement scales directly with thickness:**

    CS at  9.80mm  ->  2.24 px mean displacement
    CS at 28.6mm   ->  6.55 px mean displacement

### ⛔⛔ A1 RESOLVED — CARL CHOSE **9.80mm**, 17 September 2026

**Put to him with both figures and their displacements. His answer: *"9.80mm"*.**

⛔⛔ **THEREFORE IT IS A TYPED CONSTANT WITH ITS SOURCE STATED — NOT `heightMm *
TENT_POLE_RATIO`.** ⚠ **Writing it as that expression would produce 28.6mm, which is NOT what Carl
approved.** The expression is wrong for this value and must not be used.

⛔ **AND THE COUPLING IS THEREBY DECLINED, WHICH IS THE SECOND HALF OF THE RULING.** Had thickness
been tied to the crown ratio, **moving the crown on the bench later would have moved the glass
thickness silently.** **It is now independent: the crown can be re-tuned without touching the
glass.**

⚠ **WHAT THIS MEANS FOR THE OTHER THREE CARDS AT ROLLOUT — NOT YET DECIDED.** 9.80mm is CS's
value. ⛔ **Whether CD, CA and CB take the same 9.80mm, or a value scaled to their own heights, is
an open question for the rollout chunk. Do not assume either.**

⚠ **THE STALE COMMENT AT `card-bench.tsx:109` STILL MUST BE CORRECTED IN PLACE at execution.** It
produced this error and will produce the next one.

⛔⛔ **THICKNESS IS IN MILLIMETRES AND MUST NOT BE DIVIDED BY `MM_PER_UNIT`.** Verified in
`transmission_pars_fragment.glsl.js:127-133`: `normalize(refractionVector) * thickness *
modelScale`, where `modelScale` is read from the model matrix. **Thickness is OBJECT space and is
already scaled by the group's `scale={cs.scale}`.** ⚠ **A value pushed through `MM_PER_UNIT` would
be 750x too thin and show nothing — the same trap as the wall cards' missing scale, caught before
it landed.**

---

## ⛔⛔ THE ARCHITECT'S FIVE FINDINGS — VERIFIED AGAINST three 0.185.1

⚠⚠ **EVERY CLAIM BELOW WAS CHECKED IN `node_modules` BY THE BUILDER, NOT INHERITED.**
`context-rules.md`: a claim written into a governance file *"will be read as verified because it is
written down."*

| finding | verified at |
|---|---|
| Milky slab from `alpha: true` | ✔ `three.module.js:18019` |
| Transmission target: HalfFloat, 4x MSAA, mipmapped, per camera | ✔ `three.module.js:17981-17990` |
| Thickness is object-space x model scale | ✔ `transmission_pars_fragment.glsl.js:127-133` |
| Roughness scaled by `clamp(ior*2-2, 0, 1)` | ✔ `:137-142` |
| `lod = log2(transmissionSamplerSize.x) * ...` | ✔ `:147` |
| Grey face tints transmission to 78% | ✔ `#c8c8c8`, `about-card-mesh.tsx:51` |

⚠ Line numbers differ from the Architect's by a few — build file vs source file. **Content
identical.**

### ⛔⛔ F-CRITICAL — BUILDING CS's GLASS IN THE ROOM TODAY WOULD HAVE MISLED CARL

    three.module.js:18019
    if ( _currentClearAlpha < 1 ) _this.setClearColor( 0xffffff, 0.5 );

**The `/about` canvas is `alpha: true`.** So the transmission target is cleared to **50% WHITE**,
and CS would render a **milky slab**.

⚠⚠ **IT WOULD HAVE LOOKED EXACTLY LIKE A VERDICT ON THE FROST — *"too heavy, milky white
rectangle"* — WHEN IT WAS A PIPELINE ARTEFACT.** ⛔ **The plan expected an empty result like
`/start`. It would have been WORSE than empty: a confident wrong answer.**

**This is why the split below is necessary, not tidy.**

---

## ⛔ CARL'S THREE DECISIONS — taken 17 September on his instruction

**Carl:** *"On the decisions, take the best course of action."*

### 1. ACCEPT THE THREE-WAY SPLIT

⛔ **Forced by F-CRITICAL, not chosen for neatness.**

| step | scope | touches `/about`? |
|---|---|---|
| **2a** | Physical material on CS's face, faders, photographic bench proxy | **No** |
| **backplate** | Separate chunk. Grey cards stay. Framing proven against the DOM image first | Yes |
| **2b** | CS's glass in the room, warm-up, target measurement, final roughness | Yes |

### 2. BACKPLATE — **OPTION A (REPLACE) IS THE BUILDER'S RECOMMENDATION, NOT YET CARL'S DECISION**

⛔⛔ **A3 — CORRECTED AFTER ARCHITECT REVIEW. An earlier draft of this file recorded Option A as
CARL'S decision, taken under his *"take the best course of action."* THAT OVERSTATED HIS
AUTHORISATION.**

⚠⚠ **`CLAUDE.md`: *"An override authorises the named change only, never a blanket suspension."***
A general delegation **does not name this change** — and Option A is a **§5a structural decision in
a DIFFERENT chunk** that gives up three behaviours the §5b enumeration named: **the room surviving
JS failure, surviving WebGL context loss, and painting before JS runs.** The structural note calls
it *"the one decision that decides whether D-075 is reinstated."*

### ⛔⛔ CONFIRMED BY CARL, BY NAME, 17 September 2026 — **"Confirm Option A"**

**Put to him as a named structural trade, with its three §5b losses stated. He confirmed it.**

⛔ **OPTION A (REPLACE) IS NOW CARL'S DECISION, NOT THE BUILDER'S RECOMMENDATION.** ⚠ **And it is
his by NAME, not by delegation** — which is the distinction A3 existed to protect.

⚠⚠ **WHAT HE ACCEPTED, RESTATED SO IT IS NOT LOST:** the backplate **REPLACES** the `next/image`
element. ⛔ **The room therefore stops surviving JS failure, stops surviving WebGL context loss,
and no longer paints before JS runs.** **Those three are given up deliberately.**

⚠ **The other two delegated decisions stand** — accepting the split, and deferring
`transmissionResolutionScale`. Neither is structural and neither gives anything up.

**The recommendation's grounds:**

⛔ **C2 — Option A is the only MEASURED option that keeps D-075 clear.** A 1536 AVIF backplate is
**57.0KB against the 103.2KB `next/image` ships at 1440** — 46% less on the device that matters.
**Option B ships both: 160.2KB, and D-075 is genuinely reinstated.** ⚠ **Option C also keeps D-075
clear — but only if its fetch behaviour is MEASURED, and it has not been.**

⚠⚠ **C1 — A COLOUR ARGUMENT AGAINST OPTION B WAS WRITTEN HERE AND IT WAS FALSE. It is removed.**
The Builder wrote that under Option B *"the DOM image would be drawn ACES-shifted."* ⛔ **It would
not. A `next/image` element is a DOM node; three.js never renders it, so it is never tone-mapped.**
**Verified: the plate is served by `<Image>` at `app/about/page.tsx:636`.**

⛔ **Option B's REAL disqualifiers are the bytes (160.2KB) and the second source of truth.** ⚠ The
colour risk under F7 attaches to **the backplate MESH**, under every option including A, and
`toneMapped={false}` fixes it.

⚠⚠ **RECORDED RATHER THAN QUIETLY DELETED, on the Architect's reasoning: *"A wrong argument
recorded in support of a right conclusion becomes a false fact later readers rely on."*** **The
conclusion survives; the argument did not.**

### 3. `transmissionResolutionScale` — **DEFERRED TO 2b**

⛔ **Cannot be chosen now: it is a memory/quality trade and the memory is unmeasured.** 2b measures
at dpr 1 and dpr 2, then Carl rules **before** the roughness sweep (F3 makes the order matter).

---

## ⛔⛔ THE STRUCTURAL RESOURCE THE PLAN MISSED

**The 1x1 probe warm-up is NOT structural** — short-lived, inside the existing renderer, copying a
reviewed pattern.

⛔⛔ **THE TRANSMISSION RENDER TARGET IS.** three allocates it the moment any material has
`transmission > 0` (`three.module.js:17981`): **full viewport x `transmissionResolutionScale`,
4x MSAA minimum, HalfFloat, mipmapped, re-rendered with the whole opaque scene plus mip generation
every frame.**

⚠ **§5a's first category — *"a second instance of an expensive resource"* — created SILENTLY, the
same way the warm-up canvas was.**

**Architect's arithmetic, NOT measured:** a 1440x960 canvas at dpr 2 is 5.5M px → ~177MB colour,
~59MB resolved + mips, ~88MB MSAA depth ≈ **~300MB**, against **8MB** for the backplate texture the
structural note worried about. **At scale 0.5, about a quarter.**

⛔ **2b must declare it, measure it at dpr 1 and 2, and put the number to Carl.**

---

## Scope

**IN (2a):** CS's face material; the parameters; bench faders; a photographic bench proxy.

⛔ **OUT, explicitly:** CD/CA/CB faces · the rim and bevel (chunk 1 grey — colouring them here
*"would mix two variables Carl could otherwise separate"*) · the neon (**four colours ruled, none
chosen; red was an example**) · the text · `clearcoat` (**the handoff forbids it by name**, and
`answer-card-mesh.tsx:226`: *"SWEEP IT WITH `roughness`, NEVER ALONE"*) · tint (*"CS stays
colourless for now"*) · **the crown** (0.073, approved on the bench after six formulations —
outside advice proposed 0.02, the range Carl already overruled).

---

## Approach

### 2a — the bench

**`components/about/about-card-glass.ts`** (new). ⚠ Carl's figures above are now known, so this
lands **with them**, not with invented values.

**`components/about/about-card-mesh.tsx`** — the face `<mesh>` only (`:964-973`):
`meshStandardMaterial` → `meshPhysicalMaterial`. ⛔ **Rim and bevel tags untouched.** The geometry
does not change: rim, bevel and face are **already three separate meshes with three separate
materials**, so the neon/glass split needs no structural work.

### ⛔⛔ A2 — THE GLASS MUST BE GATED BEHIND AN OFF-BY-DEFAULT PROP

⚠⚠ **THE SPLIT TABLE CLAIMS 2a DOES NOT TOUCH `/about`. WITHOUT THIS GATE THAT CLAIM IS FALSE** —
found by the Architect. **`about-card-mesh.tsx` is the mesh ALL FOUR room cards use.** Swap the
face material outright and **CD, CS, CA and CB all become F-CRITICAL's milky slabs on the next
build.**

⛔ **THE FIRST PLAN SAID "optional prop". THE AMENDED PLAN DROPPED THE WORDS. They are restored as
a REQUIREMENT:**

- **A prop switches the glass on. It is OFF by default** — the default stays the diagnostic grey.
- **Only the bench sets it.**
- ⛔ **`about-card-canvas.tsx` is NOT changed in 2a.**
- ⛔ **2a VERIFICATION: load `/about` and confirm ALL FOUR CARDS ARE STILL GREY.**

⚠ **This is the §5b lesson in miniature: a change to a shared component reaches every consumer,
and the consumers were not enumerated.**

⚠ **NO `anisotropy`.** Satin's character on `/start` comes from anisotropy 0.86, which needs a
`tangent` attribute. ⛔ **Verified: this geometry has none** (`grep tangent` → 0). **It is what made
the normal-map route inert on 14 September** — built right, bound right, UVs added, still nothing.

**`components/about/card-bench.tsx`** — **roughness and thickness(mm) faders**, IOR fixed and
printed. ⚠ **Sweep order: roughness with thickness held, then the reverse. One variable per
sweep** (F1: roughness moves the frost AND the specular width, and IOR scales the frost).

⛔ **THE BENCH PROXY GETS A PHOTOGRAPHIC CROP** — the region of the plate behind CS, as a texture
on the existing proxy plane. ⚠ `/proto` is not a production route, so **D-075 does not apply.**

**Specifics, added on Architect review:**

- ⛔ **CROP FROM `about-studio-source.jpg`** — the CLEAN plate. ⚠ **NOT the walls-only file, which
  carries painted guide quads**, and not the guides plate.
- ⛔ **Take the crop in PLATE SPACE using `GUIDE_CS`, which is already in plate space.** ⚠ **The
  stage→plate conversion trap does NOT apply here** — stated explicitly, because that trap
  corrupted every card placement for hours on 14 September while the arithmetic reported
  "EXACT, 0.00000px".
- ⛔ **`colorSpace = SRGBColorSpace` on the proxy texture.** ⚠ A known failure:
  `contact-field-canvas.tsx:806` — *"Omitting it double-applies the transfer function."*
- ⛔ **`toneMapped={false}` on the proxy material**, for the same reason as F7, or the bench shows
  a colour-shifted photograph behind the glass and the frost is judged against the wrong image.
- ⚠ **THE BENCH WILL CREATE ITS OWN TRANSMISSION TARGET AND COMPILE EVERY SHADER TWICE, WITH NO
  WARM-UP. That is acceptable on `/proto` — STATED so a stutter on the bench is not read as a
  production regression.**

⚠⚠ **AND THE BENCH IS MORE FAITHFUL THAN THE ORIGINAL PLAN ASSUMED:** blur and refraction offset
are both sampled in **screen space** (`:133`, `:147`), so **how far the background sits behind the
glass changes neither.** A textured plane at any depth shows the real character of the frost.

⛔ **WHAT THE BENCH STILL CANNOT SHOW — and the UI must SAY SO:** `lod = log2(samplerSize.x) *
roughness`, so **frost scale depends on render-target width.** The bench's canvas is a different
size from the room's. **The bench settles the frost's CHARACTER; the final roughness is set in the
room, in 2b.** ⚠ **This does not contradict *"do not judge a face profile on `/about`"*: profile is
geometry, frost scale is a property of the render target.**

### 2b — the room

- CS's glass in `about-card-canvas.tsx`.
- **The warm-up:** 1x1 probe target, compile with `NoToneMapping`, then again on the canvas
  (`answer-card-canvas.tsx:3481-3500`), **plus one full render before handing over.** ⚠ Lights must
  be visible at compile time — they are today. ⛔ **MUST NOT become a second canvas.**
- **Declare and measure the transmission target.** dpr 1 and 2.
- **Carl rules on `transmissionResolutionScale`, BEFORE the roughness sweep.**
- **Final roughness set in the room.**

---

## ⚠ Findings recorded for LATER chunks — so they are not rediscovered

- **F4 — the face must be WHITE.** Transmission is multiplied by `color`. ⛔ Carrying
  `DIAG_FACE_COLOR` `#c8c8c8` over would tint the *"colourless"* glass to **78%**. **Verified.**
- **F5 — a wording correction.** The original plan said *"these faces are opaque-backed cards."*
  **They are not** — the face is a single surface over a rim ring, with nothing behind it in the
  scene, and `thickness` fakes a solid slab. ⚠ **FrontSide is still right** (the camera never sees
  the back). **The reason was wrong, not the decision.**
- **F6 — what CS's pass captures.** Every opaque object: its own rim and bevel, and CD/CA/CB while
  grey. ⚠ Near the edges the refraction offset will pull the rim into the face's edge — **probably
  right; note it so nobody reads it as a seam defect.** ⛔ **Transmissive objects do NOT appear in
  other cards' passes**, so once all four are glass, **no card sees another card's glass.** Check
  screen overlap at rollout.
- **F7 — backplate chunk.** Add to the structural note's §5b table: **(a)** the backplate needs
  `toneMapped={false}` or the room and what the glass refracts will not match, **even under Option
  A**; **(b)** the backplate is opaque, so it is **rendered twice per frame.**
- **F8 — text chunk.** The structural note says the coincident text surface *"sits outside the
  transmission pass."* ⛔ **That holds ONLY if the text material is `transparent: true`.** Opaque
  objects go into the transmission target, so **opaque copy would be frosted and show through its
  own face as a blurred ghost.**
- **F9 — chunk 3.** With `frameloop="demand"` the double render happens only on invalidation.
  **The neon controller will make it every frame.**
- **Resolution dependence is a MASTERING item (D-035).** Frost reads differently at 1080p and 4K.
  **Record; do not solve now.**
- **`thicknessMap` is possible** (the UVs exist) **and is out of scope. Recorded only.**

---

## Verification

⛔ **Rule 9: rendered output is the truth. Today proved it four times** — four lighting rigs each
measured clean and each rejected on sight, until Carl named it: *"its acting like a street light."*

1. `npx tsc --noEmit` clean.
2. `npm run lint` — ⛔ **must stay `1 problem (1 error, 0 warnings)`.**
2a-i. ⛔⛔ **LOAD `/about` AND CONFIRM ALL FOUR CARDS ARE STILL GREY** (A2's gate).
2a-ii. ⛔⛔ **CARL'S EYE ON THE BENCH IS 2a's CHECKPOINT AND IS ITS OWN ITEM.** ⚠ Added on
   Architect review — 2a's only listed checks were tsc and lint, **and neither can see a
   material.** **Rule 7: a component is complete when Carl has confirmed it by eye and the
   verdict is recorded.**
3. **2b: time-to-first-frame, cold, `performance.mark`, at dpr 1 and 2.** ⚠ **State the number even
   if small** — the ~1490ms freeze on `/start` is why.
4. **2b: the transmission target's GPU memory**, and frame time with CS on screen vs off.
5. **One variable per sweep.**
6. ⚠ **No `verify/` verdict is admissible.** `proven.json`'s proven array is **empty** (D-064,
   VERIFY-UNPROVEN). **Reds pass through; greens certify nothing.**

---

## Files

| file | step | change |
|---|---|---|
| `about-card-glass.ts` | 2a | **NEW.** Carl's constants |
| `about-card-mesh.tsx` | 2a | Face `<mesh>` only |
| `card-bench.tsx` | 2a | Two faders, photographic proxy, the scale caveat in the UI |
| `about-card-canvas.tsx` | 2b | Glass on CS, warm-up, target measurement |

⚠ **None is on `.claude/protected-files.json` — to be RE-VERIFIED at execution, not trusted from
this plan.**

---

## ⛔⛔ THE ARCHITECT'S THREE BLOCKING QUESTIONS — ALL ANSWERED BY CARL, 17 September 2026

**The Architect's verdict was NOT READY TO APPROVE until these were answered and A2 and C1 fixed.**

| # | question | Carl's answer |
|---|---|---|
| 1 | Which thickness — 9.80mm or the expression's 28.6mm? | ⛔ **"9.80mm"** — a typed constant; the crown coupling is declined |
| 2 | Confirm Option A by name? | ⛔ **"Confirm Option A"** — his by name, not by delegation |
| 3 | Are 0.18 and 1.0 his figures? | ⛔ **"The figures were presented as a starting point"** — NOT his, and NOT a target |

⛔ **A2 (the off-by-default gate) and C1 (the false colour argument) are FIXED above.**

⚠⚠ **EVERY CONDITION THE ARCHITECT SET IS NOW MET. The plan is ready for Carl's approval —
which is a separate act from answering these, and has not yet been given.**

### Then, later and unchanged

4. **Approval of the amended plan itself.** The Architect recommends; **only Carl approves**
   (D-036).
5. **Option C** — if he wants the failure-mode cover back, its fetch behaviour must be **MEASURED**.
6. **`transmissionResolutionScale`** — after 2b's measurement.
7. **Final roughness in the room** (F3 — the bench cannot settle it).

---

*Written 17 September 2026. Architect review verified against three 0.185.1 by the Builder.
⛔ **Nothing built.** ⚠ Per §5a: Carl's approval of a chunk is not approval of a structure invented
while implementing it.*
