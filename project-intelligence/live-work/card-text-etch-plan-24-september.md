# Plan — CA's etched-glass text: one card, lit by its own neon track

> **AMENDED 24 September 2026 after the Architect's plan review.** Verdict: *"sound, but amend
> before approval."* **Every finding is taken** except those put to Carl below. The findings are in
> `live-work/architect-plan-response-card-text-etch-24-september.md`, transcribed by the Builder;
> the Architect's window is the authority. Tags like **[F1]** point to that file.
> ⚠ **F1's premise was checked against the installed source** (`opaque_fragment.glsl.js`:
> `gl_FragColor = vec4(outgoingLight, diffuseColor.a)`, and `outgoingLight` includes
> `totalEmissiveRadiance`). **It holds.**
> **Nothing is built until Carl approves this amended plan.**

## Context

D-094 (amended 24 September) rules the text's material: **etched glass, edge-lit by the rim.**
The body copy is a frosted region in the glass. When the neon strikes, the etching glows with the
tube's light, reading the card's D-093 track at a small depth (D-091: one layer moves, one clock).
Steps 1 and 2 are done (`about-card-copy.ts`; `live-work/card-text-measurements-24-september.md`).

**This chunk is §14a's "prove one object": CA only, body copy only.**
- **Out of scope:**
  - the role names (gilded, a recommendation waiting on RIM-DARK/D-090)
  - CB, CD and CS
  - the crafted fit (chosen breaks, gap cap, last line) — the next chunk
  - **the falloff [N1]:** deferred to the next take. §14a says prove one light behaviour first,
    and a "default 0" patch still compiles a patched program.
- **Carl tunes by eye.** Every look value is a **candidate** behind a ranged fader **[S6]**.

## Approach

### 1. `components/about/card-etch.ts` — NEW. Layout, paint, fit check, font gate; no React

**Candidates.** Each has a fader read through `neonNumber` / `neonHex` (the shared accessor), with a
range:

| constant | default | fader | range | what it sets |
|---|---|---|---|---|
| `ETCH_EM_MM` | 34 | `?etchem=` | 10–60 | type size in face mm |
| `ETCH_OPACITY` | 0.35 | `?etchop=` | **0**–1 | how visible the etch is unlit (the frost only) |
| `ETCH_GLOW_DEPTH` | 0.05 | `?etchglow=` | 0–**4** | the glow's share of the rim's `peak × level` |
| `ETCH_ROUGHNESS` | 0.9 | `?etchrough=` | 0–1 | how frosted |
| `ETCH_WEIGHT` | 400 | `?etchweight=` | 100–900 | Geist weight |
| `ETCH_GLOW_HEX` | = `NEON_TUBE_HEX` | `?etchhex=` | 6 hex digits | the glow's colour **[S4]** |

- ⚠ **Why 34 mm and not the measured maximum of 37.6 [N2]:** it leaves ~10% headroom so the fit
  chunk can choose breaks and settle the last line without the provisional build already sitting
  on the edge of overflow. **It is a starting size; Carl sets it.**
- **[S4] The colour target is fixed now, before measuring.** Physically, the light escaping the etch
  is **the tube's**, so the default is the tube colour and **"correct" means the tube core's
  on-screen hue, ~211°** (D-093). The glow colour, `#1b4789` / ~215°, is tuned for the untone-mapped
  bloom and is not the target.
- **Fixed:** line-height **1.35**; the text block is **90% × 85% of the face, centred** (the
  measurement's assumption); `ETCH_TEXELS_PER_MM = 1.0` (CA's densest 0.47 px/mm at 1920 × the DPR
  cap of 2 = 0.94), which makes CA's texture ~1221 × 478.
- **`layoutJustified()`**
  - measures words with `measureText` and breaks greedily
  - justifies every line but the last, setting the last line left **provisionally** (Carl has ruled
    left-aligned out as a setting; see N4)
  - returns the lines, the block height, the widest gap as a multiple of a normal space, `overflow`,
    **and any line that begins with an em dash [N4]**
  - ⛔ **Never drops or trims a word.**
- **Fit check, loud:** `console.error("⛔ CA TEXT DOES NOT FIT …")` with the numbers, and **every word
  still drawn.** The widest gap and the line breaks are logged each build, for the fit chunk.
- **`paintEtchCanvas()`:** white glyphs on **opaque black** (R = G = B = coverage), `NoColorSpace`.
- **[F2] The font gate proves Geist, not an empty match:**
  1. Take the family from `getComputedStyle` of an element using `--font-geist-sans`. **No
     literal**: `next/font` owns the name.
  2. `const faces = await document.fonts.load(\`${weight} 100px ${family}\`, body)`. Passing the
     body loads every unicode-range face the copy needs. **Require `faces.length > 0` and every
     `status === "loaded"`.** ⛔ `document.fonts.check()` is **not** used: it returns true when no
     face matches at all.
  3. After setting `ctx.font`, **read it back**; canvas silently ignores an invalid string.
  4. **A width proof:** `measureText(body)` in the family must differ from the same text in
     `sans-serif`.
  - **Any failure → no paint, `console.error` loudly, the text is not mounted.**

### 2. `about-card-mesh.tsx` — an optional `etch` prop and TWO text meshes sharing `faceGeometry` [F1]

- `etch?: EtchProps`, **absent by default** (the `neon` precedent). **When absent nothing renders
  and no card changes.**
- **[S2] Both meshes are SIBLINGS of the face in the group**, never children of it, with the face's
  own `position={[0, 0, faceBaseZ]}`. Nesting would double the offset. Both use the **same
  `faceGeometry` object**, as the emitter shares `rimGeometry`, so neither can drift from the dome.
  Coplanar, with `polygonOffset` (factor −1, units −4) and `depthWrite={false}`.
- **[F1] The FROST mesh:** `meshStandardMaterial`
  - white, `roughness` `ETCH_ROUGHNESS`, `metalness` 0
  - `transparent`, `opacity` `ETCH_OPACITY`, `alphaMap` = the texture
  - **no emissive.** It covers what is behind it, which is how frost behaves.
- **[F1] The GLOW mesh:** `meshBasicMaterial`
  - **`AdditiveBlending`**, `alphaMap` = the same texture, tone-mapped
  - colour **black until written.** It adds to the pixel, which is how escaping light behaves.
  - **Independent of `ETCH_OPACITY`, so `etchop=0` still glows**: the "revealed by the neon" answer
    works. Additive blending in encoded space is the approximation `neon-bloom.tsx` already accepts
    and documents.
- **[F3] No blank slab, no late stall:**
  - **both meshes mount only once the texture exists**, so a transparent white panel never draws
    over CA without its map
  - **`gl.initTexture(tex)`** uploads at a moment we choose, then `invalidate()`, because the
    canvas is `frameloop="demand"`
- **[S1]** The texture effect is **keyed on primitives**: body, em, weight, and `dims.faceWidthMm` /
  `faceHeightMm`. The texture's size comes from dims. Disposed on unmount.
- **[S8]** `setTexture` is called **only after the await**, never synchronously in the effect body,
  or lint gains a second `set-state-in-effect` error.
- The glow material registers into the channel (`channel.textGlow`) through a **null-guarded ref**
  (the D-093 lesson).
- **[S3] `?neon=none&etch=1`:** no channel, so the frost renders unlit, the glow mesh is **not
  mounted**, and nothing registers.

### 3. `about-neon.ts` + `neon-bloom.tsx` — one more depth on the same track

- `NeonChannel` gains `textGlow: THREE.MeshBasicMaterial | null`, `textColor: THREE.Color` and
  `textDepth: number`.
- The writer adds one line in the same try/catch, the same way it writes the emitter:
  `ch.textGlow?.color.copy(ch.textColor).multiplyScalar(ch.peak * level * ch.textDepth)`.
  `darken()` also zeroes it.
- Layer 0 only, so the text is **not in the bloom**.

### 4. `about-card-canvas.tsx` — the wiring, CA only

- **`?etch=1` mounts it on CA.** Without it the room is **pixel-identical**, which keeps D-093's
  identity gate valid with no harness edit.
- **[S1] The `etch` object is memoised once per mount**, like `neonChannels`, never inline. Faders
  are read once: reload to apply. `make()` sets `textGlow: null`, `textColor` and `textDepth`. The
  fader list in the comment is extended.

### 5. `app/about/page.tsx` — the `sr-only` copy **[S7] — CARL'S DECISION, see below**

- If approved: an `sr-only` heading for the section, then an **`h3` + `p` per role**, from
  `ABOUT_CARD_COPY`. It is server-rendered, so the page stays static. **The page stays
  pixel-identical; the accessibility tree gains four roles.**
- ⚠ **The sweep, either way:** the `#roles` comment *"Section 2's copy — the four seats — is NOT YET
  WRITTEN"* is stale. Correct it in place, **keeping its main point: the section is held empty of
  visible copy on purpose, for layout.** Also sweep `NeonChannel`'s *"the text's reflection joins
  later"* and the mesh's `neon` prop note.

## Structural note (rule 5a)

| decision | chosen | rejected, and why |
|---|---|---|
| where the text lives | two siblings in `AboutCardMesh`'s group, sharing `faceGeometry` | **a component in the canvas:** a second face geometry, a second source of truth for the dome. **Baked into the face's `map`:** it cannot respond differently from the glass (D-094). **troika:** D-094. |
| **[F1] frost and glow** | **two meshes: frost (normal blend) + glow (additive)** | **One mesh with an emissive:** the glow is multiplied by the frost's opacity, so the two dials become one and `etchop=0` can never glow. **One mesh with `onBeforeCompile` and premultiplied alpha:** workable, but tone mapping and colour-space conversion run before `premultiplied_alpha_fragment`, so it is easy to get subtly wrong. |
| "in the glass" | coplanar + `polygonOffset` | **a physical lift:** the text would float above the surface it is etched into |
| frost material | lit, transparent `MeshStandardMaterial` | **transmissive:** another transmission sampler for a diffuse etch |
| texture | RGBA `CanvasTexture`, CA only (~3.1 MiB with mips), shared by both meshes | **R8:** 4× smaller but needs a swizzle (`alphaMap` reads `.g`). A **rollout item**, already measured. |
| the glow's driver | a third depth on `NeonChannel`, the same writer | **a second writer or clock:** D-091's one-signal rule |
| default | off (`?etch=1`) | **on:** it would change the approved room before Carl has seen it |

**§5b — what depends on what this touches:**
- **`AboutCardMesh` (four cards + bench):** `etch` is absent everywhere but CA-with-`?etch=1`.
- **`NeonChannel` consumers (`make()`, the writer, `darken`):** the new fields default to null/0 and
  are written with `?.`.
- **`faceGeometry`:** now read by three meshes of one component with one lifetime. It is still
  disposed once, on unmount.
- **Render order:** the transparent meshes draw after the transmissive face and are not in the
  transmission target, so another card's glass cannot see them. The cards don't overlap. Architect:
  the claim holds.
- **Bloom:** layer 0 only.
- **Orientation:** `v = 1` at +y against `flipY`. **Mirroring is checked by screenshot.**

## Files

- **New:** `components/about/card-etch.ts`
- **Edit:**
  - `components/about/about-card-mesh.tsx`
  - `components/about/about-neon.ts`
  - `components/about/neon-bloom.tsx`
  - `components/about/about-card-canvas.tsx`
  - `app/about/page.tsx` (the S7 decision and the comment sweep)
- **None is protected;** `about-card-glass.ts` is **not** touched.
- **[N6] `live-work/chunk-scope.json` is written FIRST**: it does not exist. It names exactly these
  files plus `project-intelligence/live-work/`, and **a real denial on a file outside it is observed
  before building.**

## Verification

1. **`npx tsc --noEmit` clean.** **`npm run lint`** at `1 problem (1 error, 0 warnings)`. Any
   warning is a regression.
2. **The room is unchanged without the flag:** `npm run verify -- about-neon.mjs identity`, both
   arms 0 px against the existing baselines. **The red arm** (scratch probe, harness not edited):
   `?neon=off&etch=1` vs the baseline must differ.
3. **[S5] The glow is visible, not just the etch:** `?etch=1&neon=full` minus `?etch=1&neon=off`,
   **inside CA's text block**, must be non-zero and above a measured noise floor (the same pair
   captured twice). **And `?etch=1&etchop=0&neon=full` must differ from `neon=off` there too**,
   which proves F1's fix.
4. **Probe (`__THREE_DEVTOOLS__`), `?etch=1`:**
   - two text meshes on CA only, sharing the face's geometry uuid
   - the texture is ~1221 × 478
   - the font gate's faces loaded, the `ctx.font` read-back and the width proof all logged
   - the fit log (lines, widest gap, em-dash line starts): overflow false at 34; **forced true at
     `?etchem=60`**, so the loud failure is seen to fire
   - **[S3]** `?neon=none&etch=1` gives the frost only, with no glow mesh
   - no console errors
   - **[F3] timed separately:** paint, upload (`initTexture`) and first-render program compile.
     Long tasks recorded.
5. **Screenshots for Carl** at 1440 and 1920, **including a DPR 2 capture [N3]**:
   - `?etch=1&neon=off`, `?etch=1&neon=full`, `?etch=1&reignite=10000`
   - **1:1 crops of CA's far edge, with a contrast reading [N2]**
   - read un-mirrored
   - **the lit text's hue measured on screen against the ~211° target [S4]**
   - ⚠ **Captioned: "the last line is set left PROVISIONALLY and the breaks are greedy — not the
     setting" [N4].** Mip softening at the receding edge is noted, **a watch item for CB [N5].**
6. **Stop the dev server (PID-checked, port free) before the checkpoint.** Record the run in
   `live-work/`. After Carl's verdict, amend D-094 and file a review entry.

## Stop conditions

- **Mirrored or upside-down text** → stop and report.
- **The font gate fails** → stop; no fallback-font build.
- **The identity gate goes red without `?etch=1`** → stop; the gate has leaked.
- **A long task over ~50 ms from paint, upload or compile** → record it and report; do not tune
  around it.
- **Any need to touch a protected path** → stop and ask.

## ⛔ Open for Carl before execution

1. **[S7] The `sr-only` copy: in or out of this chunk?** Putting it in publishes all four bodies to
   the accessibility tree on the **production** site, including **CS's present-tense *"connected to
   the things the business actually runs on"***, which D-077 flags as ahead of the fact. **The
   words are yours** — keep, *"can be connected to"*, or hold the sr-only copy until that is
   settled.
2. **[N3] Your display's DPR:** run `devicePixelRatio` in the browser console on the machine you
   judge on. The texture is sized for DPR 2 and your DPR is unmeasured.
3. **[N1] The falloff is deferred to the next take.** Say if you want it in this one.
