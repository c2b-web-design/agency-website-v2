# Session Handoff — 24 September 2026 (session 2). THE ROOM IS BEING REPLACED: office-image-3, orange.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**The card TECHNIQUE is proven. The ROOM PHOTOGRAPH is the limit, and it is being replaced.**
Carl: *"The concept and technique are good… What doesnt work? The environment."* Record: **D-095**
(it is long; its entries run in order). **D-094** holds the text work.

- **Live `/about` (commit `8902774`):** all four cards show a FULL FIRST PAGE, STATIC, every card
  light and rim OFF, on the OLD photograph. It stays until the new room is ready.
  - `?textstatic=0` runs the pages. `?extrude=cb` (or `ca,cb`) isolates cards. `?extrude=0` is the old neon page.
  - `?textlight=1` / `?textrim=1` restore a card's spot or rim.
- **Per-card depth (the depth rule, D-094):** CA 3 / CB 1.5 / CD 2 / CS 0.9 mm, from measured view
  angles. ⛔ **Rule: the steeper a card sits to the viewer, the shallower its letters.**
- ✔ **The "H" is fixed:** the typeface was rebuilt from Vercel's static Geist (see `scripts/build-geist-typeface.mjs`).

## ⛔⛔ THE NEW ROOM — CHOSEN: `brand-assets/office-image-3.jpg`

Pixabay #7413418, Setupx3D, **4000 × 2250 (16:9)**, Pixabay Content License. It is a CG render with orange
LED strips. The three candidate MASTERS are in `brand-assets/office-image-1/2/3.jpg`; their provenance
lives in D-095. ⛔ **Masters: edit copies, never these files. Never upscale.**

**Carl's rulings (all in D-095):**
- **NO CROP** (the principal point stays at the frame centre). The canvas frame changes from 3:2 to 16:9.
- **The room STAYS ORANGE/AMBER.** Rim colour is *"we shall see what works"*; text colour and size may change; **the CONCEPT is fixed.**
- **Four cards:**
  - **CA** = the TV's size and place, back wall left.
  - **CB** = same size, to its right (MEASURED to fit: free wall ≈ 1.41 TV widths; ~0.20 TV-width gaps each side).
  - **An elongated card ABOVE**, on the cabinet-door band, centred on the CA + gap + CB centre line, **area = one wall card's**.
  - **An elongated card on the FLOOR** in front of the credenza, **its right edge at the cubby line** (x ≈ 2110), so **the chair does NOT move.**
- **The seesaw:** equal and opposite shifts of the floor card (left) and the above card (right) keep the pair centred on the line.
- **Minimal removal:** Deadpool; the TV and corner shelving; consoles/trademarks per the licence list in D-095. The other trinkets STAY for character.
- **TV size estimate:** ≈ 1640 × 920 mm (~75"), ASSUMING a 750 mm desk. **No old card is comparable** (~2× CA's area, 16:9).

**Overlays and scripts:** `live-work/screenshots/office-image-3-*.png`, `live-work/scripts/*.mjs`
(the wall fit, the above card, the balance, the layouts). ⛔ **All are FEASIBILITY measurements by the Builder. By D-076, final corners are Carl's pins, checked against an independent feature.**

## ⛔⛔ NEXT — QUESTIONS CARL IS ASKED TO SETTLE FIRST

1. **A or B.**
   - **A:** the above card = the door band WITH its rims (374 px at the centre line); the floor card STANDS floor-to-just-under-the-counter; width ≈ 1.37 TV widths.
   - **B:** DOORS ONLY (288 px); the floor card HOVERS over the drawer stack (283 px, a 2% match); width ≈ 1.77.
   - Both fit with the chair unmoved (`…-layout-A.png` / `…-layout-B.png`).
2. **The above card centred on the WALL (reads slightly left on screen) or on the SCREEN.**
3. **The TV removed and replaced by CA** (assumed), or CA mounted over it.
4. **The removal — GPT is the editor (Carl, after a Gemini/GPT test); ONE prompt, cubbies untouched:** `live-work/office-image-3-removal-prompt.md`. **Open: keep or remove the speakers** (keep = an occlusion matte for CB). ⛔ **The test came back 1672 × 941: the real run MUST return 4000 × 2250 (no upscale).**
5. ⛔ **GPT's Erase FAILED (web and desktop).** ⛔ **The PC tower STAYS, MOVED (Carl: the monitors are not an AIO).**
   **Two routes, Carl's trade:**
   - (a) **A GPT ONE-SHOT with the SHORT prompt** (the end of `office-image-3-removal-prompt.md`): fastest, but it returns ~1672 px (≈87% of Carl's screen, ~65% of a 2560 display) and REDRAWS every pixel, so the camera and every measurement are re-derived on GPT's image;
   - (b) **Photopea / Resolve IN PLACE on the master:** full resolution and the master's own pixels, removals by hand; the tower is a copy-move.
6. **Where the tower goes.** The floor corner is under the hanging drawer unit (~62 px of clearance vs a ~265 px tower). Carl's three solutions:
   - (1) flush against the drawer unit, handle removed — **Builder's recommendation**; it covers almost the whole drawer front and is partly chair-hidden;
   - (2) turned 90° to show the glass side and ring fans;
   - (3) the other side of the desk.
   The revised line 6 is in the prompt file. **Whatever runs, send it: the Builder measures its size, its drift from the master, and where the tower landed.**

## ⛔ THE ORDER OF WORK (Builder's proposal, in D-095)

1. **Solve the camera on the UNEDITED master.**
   - The LED strips are excellent features.
   - Solve mainly from the RIGHT wall: a near-frontal back wall's vanishing point is badly conditioned.
   - **First measurement: do the verticals converge?** A renderer's lens shift would move the principal point.
2. AI edits (Carl) → **measure the drift against the master's camera** → Resolve grade (Carl) → into three.js.
3. **Build new card sizes from the family blueprint:** `cardDims()` + the `TENT_POLE_RATIO` crown. ⚠ `cardDims().crownMm` is stale.
   Prove them on `/proto/card` **before** the room: heights span ~920 vs ~520 mm, so **does the family still read as one?** (Carl's eye.)
4. **Re-derive the type size from ON-SCREEN em** in the new room (the old wall cards ≈ 12–14 px/em). 52 mm was set for the old camera.
5. **Re-tune the glass per card** (D-089's values were tuned against the old backgrounds).

⚠ **Plan gate:** the new-room work is new chunks. The gate applies unless Carl waives it for the piece.

## ⚠ PARKED / CARRIED

- `live-work/cards-text-isolation-plan-24-september.md` is **SUPERSEDED** (the text went to all four cards differently).
- **D-095 is PROPOSED throughout, not approved as a whole:** the image choice and the layout are Carl's rulings; its route (A/B/C) is moot now that a found render is the base.
- Carried: the two R-028s (not renumbered); remove the etched take?; CS's "connected to…" (D-077); accessibility deferred to mastering (D-094); ENVMAP-STALE / RIM-DARK; the `proven.json` filing.

## ⚠ HOUSEKEEPING

- **`live-work/chunk-scope.json` still names `four-cards-static-text` (closed, committed). RE-SCOPE it for the next chunk**; don't delete it (the guard fails open).
- **Carl's machine:** DPR 1.36, viewport ~1412 × 700 CSS.
- **The dev server is stopped at the end of this session.** Port 3000 should be free.
- **Correction made this session:** a font file was first reported as ~198 KB (a misread `ls`, because the username has a space). It is ~33 KB. **Use `stat`, not `ls | awk`.**

---

*Written 24 September 2026 (session 2).*
