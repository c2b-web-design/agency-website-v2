# Brainstorm record — the hero, phase 3's end: the showcase and the rising plinth, 18 November 2026

<!-- On the form (`live-work/templates/brainstorm-record.template.md`). The record is D-101 in `decisions.md`, from
"THE BLUE WEB SHRINKS WITH EACH WIPE" to "THE END OF PHASE 3 — THE SHOWCASE AND THE RISING PLINTH" (18 November 2026);
this file gathers it in the form. Raised in a discussion after the session's push; nothing built. -->

**Filmed:** yes — the discussion is in the session's screen capture up to its stop
(`03 The hero\01 Discussion\2026-11-18_discussion_screen.remux.mkv`); the brainstorm itself came AFTER the capture
stopped and is NOT filmed.

## Carl's words
- *"the blue web floor can slowly shrink with each wipe and as more gold appears. Im interested in what projected surfaces
  are available. What can it project?"*
- On `webgl_lights_spotlight` (threejs.org): *"the pickings are very slim. just a few images on google and amber ducks on
  threejs.org Though interesting for the use of light, not right for a gold logo. However, there is comething that caught
  my eye. The floor here has potential."*
- *"the floor should be more polished. A rotating marble floor is the right aesthetic for a gold logo. The floor doesnt have
  to be flat either. Could we create a block of marble. a plinth? The logo could grow to be a little bigger too. Same as the
  text. Nice L R balance."*
- On the Builder's three questions: *"1,2 +3 TBD What i was thinking is the same projected marble with a box shape. Look at
  the way the projected image is interacting with the base of the statue. Over 3d space, not the 2d of a floor."*
- *"so to all intents and purposes it us a plinth but not so ostentatious as to build a real one."*
- *"Rounded edges sound good, a bit of extra geometry to do some work with the projected image"*
- *"so when the drying is done and we work out how and when to apply the image The logo is at rest on the floor.
  Spotlights to showcase, 2d floor marble. Then at an appropriate point, our box slowly rises out of the floor and as it
  does - our logo grows."*
- *"all for the next session. We got the makings of a great idea to develop."*

## Ideas raised
| Idea | Raised by | Status |
|---|---|---|
| The BLUE web on the floor shrinks slowly with EACH WIPE and as more GOLD appears | Carl | CHOSEN (the direction; not built) |
| MARBLE as the aesthetic for the gold logo — polished | Carl | CHOSEN (developed by Carl) |
| The marble PROJECTED (a light carrying the image), as `webgl_lights_spotlight`'s floor and statue base | Carl | CHOSEN (developed by Carl) |
| A BLOCK — a plinth in effect, a PLAIN box, "not so ostentatious as to build a real one" | Carl | CHOSEN |
| ROUNDED EDGES on the block (the projected image bends over them) | Builder offered; Carl | CHOSEN |
| The SEQUENCE: drying done → the gold logo at rest on the floor → SPOTLIGHTS to showcase, 2D marble on the floor → the box RISES slowly out of the floor → the logo GROWS as it rises | Carl | CHOSEN (the shape; timings open) |
| "ROTATING" marble — the marble moving (the lamp moving, the veins flowing over the still block) or the block turning like a display stand | Carl; Builder asked which | OPEN — TBD (Carl) |
| The LOGO bigger — answered for the logo: it GROWS in the story, with the rise | Carl | CHOSEN (how much: open) |
| The TEXT bigger too, for LEFT–RIGHT BALANCE | Carl | RAISED — TBD (Carl) |
| A marble FLOOR built with its own material (the `disturb.jpg` texture, or a texture painted flat) | Builder offered | RAISED AND NOT CHOSEN — Carl chose PROJECTED marble over 3D form |
| The example's photo `disturb.jpg` | (the example) | NOT USED — our own marble, made in code (the site's own design; a 512 px photo would soften and repeat) |
| A MIRROR reflection of the logo in the polished top (three's reflector) vs the studio only | Builder offered | OPEN — the polish is a clear coat over a matte base (the projection needs the matte); a mirror is priced first (D-108) |

## The world: materials, light, atmosphere, motion
- **Materials:** the block — MATTE stone under a CLEAR COAT (Unreal's Clear Coat): the matte base shows the projected marble,
  the coat gives the polish. The marble is OURS, made in code (domain-warped noise; veins) — the Builder's suggestion, a
  take: PORTORO's look (black with gold veins), in the brand's Gold, Teal and Platinum Blue. The floor for that beat: a lit,
  matte surface (form B for that beat only), dark outside the beam.
- **Light:** a PROJECTOR (a light carrying the marble image; its picture in the light's colour node, procedural) onto the
  floor and the block — kept to their own light list (the logo's own key's method), so the logo and text keep their
  approved look; SPOTLIGHTS on the GOLD logo to showcase it (on metal: shaped, bright reflections).
- **Atmosphere:** after the rain and the drying — dry, still; the blue web gone.
- **Motion:** the marble possibly flowing (the lamp moving; TBD); the block RISING slowly out of the floor — rising OUT OF
  THE SAME MARBLE that lights it (one projector, one image: the flat pattern climbs the block's sides); the logo GROWING as
  it rises.

## ⛔ MEDIUM — WebGL or WebGPU (a take, proven before building)

| Does the scene need… | Leans |
|---|---|
| materials DRIVEN BY THE WORLD | WebGPU — the marble procedural in a light's colour node (TSL) |
| wet / reflective ground, rough reflections | WebGPU — if the polished top mirrors the logo |
| thousands of moving things | not this beat (the rain and steam before it: WebGPU) |
| reuse of approved work | the hero is already WebGPU (`/proto/hero`) |

- **Medium (take):** **WebGPU** — the scene it joins is WebGPU; `ProjectorLight` with a TSL `colorNode` is the
  `webgpu_lights_projector` mechanism.
- **The rows that tipped it:** the procedural marble (TSL); the hero's own medium.
- **Shares a page with:** the hero's one canvas (`/proto/hero`, WebGPU).
- **Proof before building:** a projector with a procedural marble onto a rounded box on the bench, isolated to the box's
  light list; its compile and frame cost measured (a light and a shadow pass: D-108).

## Open — with owners
- How the drying happens, and when the marble image is applied — Carl.
- "Rotating": the marble flowing (the lamp moving) or the block turning — Carl.
- The text's size (left–right balance) — Carl.
- How much the logo grows; the rise's speed; when the "appropriate point" is — Carl.
- The block's size and edge radius; the marble's colours (a take: Portoro in the brand's colours) — the Builder proposes,
  Carl judges on the bench.
- A mirror of the logo in the polished top, or the studio only — priced, then Carl.
- The structure (the projector, the lit floor for that beat, the spotlights' light lists, the logo's growth and what is
  sized from it) — a structural note through the Architect before it is built.
