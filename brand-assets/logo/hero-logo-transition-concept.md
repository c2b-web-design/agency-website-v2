# Hero Logo Transition — Concept Salvage

**Status:** Salvaged record only. Not a plan, not an approved design, no implementation
authority. Recovered 24 July 2026 from Codex session logs before that installation was
removed from the system. Preserved because the articulation here is clearer than
anything currently in `project-intelligence/`, and the source is being destroyed.

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

- The **particle effect is SHELVED** for the video→code transition.
- An **animated logo transition from gold to blue-platinum using the same logo
  geometry** is very much on the cards. Same geometry, material transition only —
  which is exactly what a vector master makes tractable.

## Asset status — verified, not assumed

**No platinum-blue logo image exists on this system.** Searched exhaustively on
24 July 2026: all 644 images under `~/.codex` (every one outside `generated_images/`
is a plugin or marketplace asset), all 22 session logs, and filename matches for
platinum / blue / silver / chrome. The sessions discuss a blue version only as
*future exploration* — it was never generated.

The 14 files salvaged to `brand-assets/logo/` are the **complete set** of C2B images
that existed in Codex. A platinum-blue version must therefore be **created**, not
recovered.

## Relationship to approved work

This is roadmap context for the hero section, which is **not** an approved or started
layer. It does not alter any APPROVED decision. The enquiry corridor, contact field
and CTA lighting work are unaffected.

Note the existing brand rule this must respect: platinum-white reflection and amber
light are **coupled** values (D-031/D-032, R-016/R-017) — a gold→platinum logo
transition should modify a shared material/lighting value rather than introduce an
independent overlay channel. See `checkpoint-review-protocol.md` §5.1.
