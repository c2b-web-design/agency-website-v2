# Hero Logo Transition — Concept Salvage

**Status:** Not a plan, not an approved design, **no implementation authority.**

This file has two layers, and they must not be confused:

1. **"The concept (2 June 2026)"** — a salvaged historical record, recovered 24 July 2026
   from external tool session logs before that installation was removed. Preserved verbatim
   because the articulation is clearer than anything in `project-intelligence/`, and the
   source was being destroyed. **Parts of it are superseded** — annotated inline.
2. **"Current direction (24 July 2026)"** — Carl's current thinking, which **supersedes
   layer 1 wherever they conflict.** Still not approved, and expected to evolve.

---

## The concept (recorded 2 June 2026)

The transparent 2D logo is the **master visual plate**. From it:

- **Static website logo** — white/gold/teal version over any background.
- **Blender 3D conversion** — use the alpha/silhouette as a tracing or extrusion source.
- **Hero video** — animate the logo in Blender as a cinematic asset.
- **Transition point** — the video logo dissolves/fades/reveals into a live interactive
  web version.
- **Code recreation** — SVG, canvas, WebGL or Three.js version responding to cursor,
  scroll, lighting, particles or material changes.
  *(⚠ **particles DISCARDED** 24 July 2026 — see "Current direction" below. The list is
  preserved verbatim as the original June articulation; do not read it as live options.)*

The governing idea, verbatim:

> The video handles the cinematic "arrival", then the site hands over to a live coded
> logo. It would feel like the brand becomes active rather than just playing a
> finished render.

## The load-bearing practical note

> We now need to preserve a clean shape source. The transparent 4x PNG is a useful
> base, but eventually the ideal master is still a proper vector/curve version. That
> would let Blender extrude cleanly.

**This is why `brand-assets/logo/c2b-logo-gold-hero.svg` is the most important salvaged
file.** The whole pipeline — Blender extrusion, Three.js recreation, the gold→platinum
material transition on identical geometry — depends on having a true vector master.
It is committed at `0c1b802`.

## Current direction (Carl, 24 July 2026)

**Status: current thinking, not an approved design.** No implementation authority. The
hero is not an approved or started layer, and Carl's stated method is that ideas change
during the work — *"rarely does what I hear in my head come out the speakers at the
end."* Treat this as direction of travel, not specification.

### Discarded

- **Particles — DISCARDED**, not shelved. Reason: **cheesy.** Superseded by the
  environment-response idea below, which achieves "impressive" through physical
  causality rather than added decoration. Do not reintroduce without Carl reopening it.

### The through-line

- **Animated colour transition, gold → platinum-blue**, on the **same geometry**.
  Material transition only. See `transition/` for the reference frames.
- **Full image or video** on the hero. **Left text overlays; the right side is reserved
  for the logo.**

### The break-out: video world → code world

The governing idea is unchanged from June — the video handles the cinematic arrival,
then the site hands over to a live coded logo, so the brand *becomes active* rather than
playing a finished render. What is now decided is **how**:

1. The video logo starts **small and travels toward the viewer** (authored in DaVinci
   Resolve, mainly Fusion).
2. It reaches its **optimal point and freezes**.
3. A **code version, matched as closely as possible to that frozen frame, is overlaid**.
4. The video version is then **quietly hidden or masked away**.

**Why this matters technically:** this is a freeze-and-swap, **not** a live
video→WebGL morph. Only one frame has to match, and it is a *stationary* frame. That
removes the hardest risk in the whole concept — no continuous seam to hold across
motion, colour pipelines or resolution differences. The match still has to be honest on
geometry, scale and position, which is exactly what the vector master
(`c2b-logo-gold-hero.svg`) exists to guarantee.

### Lighting belongs to code world only

- The **video logo probably carries no light effects at all.** Light is added *only*
  once it enters the coded environment.
- On arrival, the logo **affects its environment** — it is a moving, colour-changing
  light source, **not** a static gold rim.
- **Residual light spills onto the hero text.** The intent is 3D extruded type, so the
  light genuinely catches the extrusion, varying with the logo's position and colour and
  the spot/point light placement. (Font research discussed separately with Gemini;
  nothing chosen.)

**This is the existing coupled-value rule at hero scale** (D-031/D-032, R-016/R-017;
`checkpoint-review-protocol.md` §5.1): light **modifies an existing derived value**
rather than sitting on top as an independent overlay. The text should respond because
the world changed — the same reason the selected answer cards read as amber light
sources rather than amber buttons, and the same behaviour already observed in the
`transition/` frames, where warm light enters at edges and speculars first and the floor
bounce tracks the material state.

⇒ The argument against particles is therefore **structural, not just taste**: particles
are decoration layered on top; this is causality. Recording that reasoning so the
distinction survives, since it is what makes the direction consistent with approved work.

### Undecided / open

- **Scene subject matter — UNDECIDED.** Abstract or otherwise; genuinely open.
- **Source assets:** Carl intends to attempt a still image via external AI image
  generation. For video, the likely route is an existing free-use clip manipulated in
  Resolve. ⚠ **Anything generated in an external tool must be saved directly into
  `brand-assets/` as it is made** — not left in that tool's own storage, and not collected
  in a batch at the end. Batches are what get forgotten when a tool is removed.
- **Font:** not chosen.
- **Performance, mobile behaviour and reduced-motion degradation:** not yet addressed.
  A hero built on video plus WebGL has real cost, and the enquiry work already
  established that reduced motion must be handled deliberately rather than assumed.

### The bar

Carl's framing: *"This is my front door, from a guy selling front doors."* The hero is
the agency's own proof of work and is judged before anything else is read.

## Asset status — verified, not assumed

**No platinum-blue logo image exists on this system.** Searched exhaustively on
24 July 2026: all 644 images in the external tool's storage (every one outside its
generated-image folder was a plugin or marketplace asset), all 22 session logs, and
filename matches for platinum / blue / silver / chrome. The sessions discuss a blue
version only as *future exploration* — it was never generated.

The 14 files salvaged to `brand-assets/logo/` are the **complete set** of C2B images
that existed there. A platinum-blue version must therefore be **created**, not
recovered.

## Relationship to approved work

This is roadmap context for the hero section, which is **not** an approved or started
layer. It does not alter any APPROVED decision. The enquiry corridor, contact field
and CTA lighting work are unaffected.

Note the existing brand rule this must respect: platinum-white reflection and amber
light are **coupled** values (D-031/D-032, R-016/R-017) — a gold→platinum logo
transition should modify a shared material/lighting value rather than introduce an
independent overlay channel. See `checkpoint-review-protocol.md` §5.1.
