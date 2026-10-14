# Structural note — the platinum blue `Next step` onto `/start` (14 October 2026)

**For Carl, to route to the Architect if he wishes.** CLAUDE.md §5a / §5b. Nothing is built yet.
Carl, 14 October: *"It looks good. Put it on the page. We also need to see what the light for the button has on the cards,
if any."* The bench passes: R-053 (mesh), R-054 (material, ice blue words), pass 3 *"It looks good"* (R-055).

---

## 1. What is there now (measured in the code)

- **`NextStepSurfaceHost`** (`nextstep-canvas.tsx`): ONE canvas, mounted ONCE by `EnquiryOpening` outside the keyed
  phrase, `position: fixed` at the rect the active button publishes, its fade reproduced from the old CSS (600 ms in;
  the solved bezier out). The 18 August repair — the per-question WebGL context it removed was the Q5 freeze.
- It draws **`NextStepCanvas`**: the old chrome pill, the corridor's traveller reproduced as a rotating env map, an
  amber source **parked at 0 by Carl** (*"something i will return to"*).
- **`NextStepMeshButton`** (in the phrase): the real DOM `<button>`, its box measured and published; the words are
  DOM text painted over the mesh.
- Tone mapping: the host renders `NeutralToneMapping` — **the same as the family's canvas** (`PillCanvas`), so the
  platinum blue will read as it does on the bench.

## 2. The proposed shape — the host stays; what it draws changes

- **Kept exactly:** the host — its lifetime (mounted once), its position (fixed at the published rect), its fade, its
  containing-block assertion, `pointer-events: none`. One canvas, one context, as now.
- **Swapped:** inside the host, `NextStepCanvas` → the family's scene (`WhoWeAreScene`, member `"next"` — a new entry in
  `FAMILY_LOOKS`: platinum blue #3F6DB8, metalness 1, roughness 0.4, ink #CFE6FF, the teal's lamp). This is a
  canvas-for-canvas swap inside the same host, not a second surface.
- **The words:** the 3D letters are drawn by the scene from the glyph positions of "Next step" in Geist 14/600 — measured
  by the HOST from its own hidden copy of the label (the bench's method, `measureLabel`), so nothing has to travel out of
  the phrase. The DOM button's text stays for screen readers and is made transparent while the mesh is shown (as the
  family button on the home page does).
- **The old pill retires:** `NextStepCanvas`, its traveller copy and the parked amber are no longer drawn. Kept in the
  file until approval, then removed (the bench `/proto/nextstep` uses them).
- **`enquiry-opening.tsx` (protected) is NOT touched** — the host's props do not change.

**Rejected:**
- *Mounting `FamilyButton` in the phrase* — a canvas inside the keyed phrase is a new WebGL context per question: CLAUDE.md
  worked case 2, exactly.
- *Drawing the button in the cards' canvas* — Carl's own ruling (lighting by environment) would favour one world, but the
  card host chases a moving grid per frame and the button must never move (the 18 August reasoning, still true).

## 3. What depends on the current behaviour (§5b)

1. **The Q5 reveal.** The host mounts during the OPENING so its context, compile and bake happen before Q5. The family
   scene adds the font load and the extruded letters' geometry and its own shaders. ⚠ **Must be measured, not assumed:**
   the Q5 reveal frame timing before and after (the 18 August instrument family).
2. **Frames while invisible.** The host sits at opacity 0 until an answer is chosen. The family scene ticks (roll, lamp)
   — while opacity is 0 it must not draw. ⚠ **To assert:** no frames drawn while the host is at opacity 0.
3. **The fade.** The host's opacity is untouched; the scene inherits it.
4. **The hold.** On the home page the roll holds when the pointer comes near or the button has focus. The host is
   `pointer-events: none`; it would read the pointer from the window against its rect, and focus from the DOM button.
5. **Reduced motion.** The family scene rests face-on, no roll, no lamp — as the home page.
6. **The cold load.** The host is hidden until the first selection, seconds after load, so the home page's still is not
   needed here. ⚠ To be checked on a cold load before Carl is asked to approve (`feedback_approval_includes_the_cold_load`).
7. **`?nobtnmesh=1`, `?mounttrace=1`** (diagnostics): kept working or retired with the old pill — stated in the build.
8. **Send** at completion: a separate painted DOM button, unchanged.

## 4. Questions for Carl

1. **Does it roll in the Q&A?** On the bench it rolls forward slowly and holds near the pointer. In the corridor it fades
   in once an answer is chosen, and the reader's eye is on the cards.
2. **The cards' warm glow on the button** stays parked (your June instruction) — confirm.

## 5. The button's light on the cards — Carl's second question

**Today: none, by construction.** The button's lamps live in the button's own scene, in its own canvas; a WebGL light
lights only objects in its own scene, so nothing the button's lamp does can reach the cards. (The traveller is the
reverse case: a card light reproduced in the button's canvas to fake the connection.) If the button's light should fall
on the cards, it has to be put there: a twin of the lamp in the cards' scene, on the same path in page space and the same
clock — which is where the traveller, already dark and due to be repositioned, would come in. ⚠ A design choice for Carl,
not built. A frame with both sets of helpers (the button's lamp path and the cards' scene) can show where it would fall.

## 6. Files

`components/enquiry/nextstep-canvas.tsx` (the host's contents, the DOM label's colour), `components/home/whoweare-button-scene.tsx`
(the `"next"` look — in scope). Verification: a new `live-work/scripts/nextstep-rollout-verify.mjs` — one context across
a five-question walk, the host's rect = the button's, no frames at opacity 0, the Q5 reveal timing before/after, the
contrast at Q5, a cold load.
