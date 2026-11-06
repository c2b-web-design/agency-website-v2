# Prep — the hero's text and subtext on a bench (for the next session)

**Status: PREPARATION, not a plan.** Written 5 November 2026 by the Builder. Carl: *"I want to build the text and subtext on
a bench so you can prepare that."* Nothing decided here; the next session opens with the brainstorm (Carl leads), through
the new form, `live-work/templates/brainstorm-record.template.md` — its MEDIUM line included.

## What exists (checked 5 November)

- **The copy** (`app/page.tsx`, D-101 2 November, Carl: *"you cant get more succinct than that"*): the `<h1>` *Websites built /
  to be seen.* (Geist, bold, `text-6xl` at desktop, `leading-[1.1]`) and the subtext *We show you what your website could be,
  / then we build you a site for sore eyes.* (`text-base`, neutral-400).
- **Its place in the scene:** the block-out's two stand-in CARDS (`hero-blockout.tsx`, `headline` / `subtext`), sized from the
  page's ink measured at Carl's window (`GUIDE_HEADLINE` 542 × 195 px, `GUIDE_SUBTEXT` 412 × 63 px) at 0.5 cm per page px;
  left edge X −450, face Z 802; **the subtext's foot on the ground** (Carl: *"The bottom of the subtext should sit in the
  ground"*). The page camera is calculated from them (R-102).
- **3D lettering already built** (film 4, approved): `lettering-geometry.ts` (`glyphGeometry` — extruded glyphs, depth, bevel,
  crease, collision margin; ⚠ only **Geist SemiBold** as a typeface JSON, `/fonts/geist-semibold.typeface.json` — the page's
  headline is Geist BOLD), `lettering-material.ts` (brushed brass), `lettering-piece.tsx` (`LetteringPiece` — WebGL-bound
  helpers; its medium edit approved, option (a)). `/about` §2's extruded card text: `components/about/card-extrude.tsx`.

## ⛔ Carl's first answers (5 November, at the close — D-101, *The hero's text — the brainstorm opens*)

*"colour, i think ice blue ... Font. Something with bevels. When the logo "breaks out" the light attached to it must work well
on the text. Glow is a good idea but not neon. Something thats compliments neon as would show up in any puddles well."*
- **Colour: ICE BLUE, #CFE6FF** (the home page's — the `Who we are` button's ink). **Bevelled letters.** **The logo's light
  must work on the text.** **A glow, not neon, that complements the neon and shows in puddles** → the text is a light source
  → **MEDIUM: WebGPU** (bloom in linear light, reflections, a moving light on bevels; one renderer with the hero).
- Raised by the Builder, NOT chosen: halo (back-lit) letters; edge-lit letters; opal faces lit from within.
- ⚠ Open: "something with bevels" — Geist extruded with a bevel, or a chiselled (V-cut) sign typeface (which would change
  the page's `<h1>` too).

## Questions for the brainstorm (Carl's)

1. **Is the text an OBJECT in the street** (3D, lit by the scene, the camera moving round it) **or the page's ink over the
   scene?** If an object, it shares the hero's renderer (one renderer per scene) — **the WebGPU medium**.
2. **What is it made of, and what lights it?** (metal, neon, painted, carved — the street's story: Victorian industrial with
   modernist neon; "caused by the world").
3. **The type:** Geist Bold as on the page (a Bold typeface JSON to make), or another weight.
4. **Holding the page's layout:** the 3D text must land on the page's ink (size and place) from Cam 1 — the cards' sizes are
   the target.
5. **The real `<h1>` stays** for screen readers and search (cf. `open-defects.md` D-051-A11Y: baked text is invisible to them).

## Which bench — the options (structural, CLAUDE.md §5a)

- **The camera bench, `?blank=1`** (where the hero lives) — today WebGL only; its WebGPU medium is step (2) of the approved
  renderer note, NOT yet built.
- **`/proto/webgpu`** (the spike, WebGPU, the block-out already there) — no recorder or pad.
- **A new text bench** — a new page (needs naming and review).
⚠ **Waiting on:** the tone-mapping route in the WebGPU medium (the spike's finding: `toneMapped={false}` not honoured) if the
text is to glow or be an exact colour.
