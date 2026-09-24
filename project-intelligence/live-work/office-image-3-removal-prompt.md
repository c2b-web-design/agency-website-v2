# The removal prompt for office-image-3 — GPT, one shot. 24 September 2026 (session 2)

Carl: *"we need to give just one prompt for removal"*; then, after a test in Gemini and GPT: *"GPT is the stronger editor. Thats what we will use but we will craft a new prompt for it - the cubby holes dont need to be touched, the card will be in the way, whatever is behind it will be blurred."*

⛔ **Work on a COPY of `brand-assets/office-image-3.jpg`, never the master.**
⛔ **Check the output's size.** The test returned 1672 × 941 against the master's 4000 × 2250. **A downscaled result is not a usable master and D-073 forbids upscaling.** Use a route that returns full resolution.

*(Superseded draft: removed cubby contents and had no PC-tower move. Replaced by the version below.)*

```
Edit this image. Keep everything else EXACTLY as it is: the camera, perspective, composition, lighting, the orange LED strips and their glow, colours, materials, and every object not listed below. Do not add any new objects. Output at the same resolution and aspect ratio as the input (4000 × 2250).

Remove these, and fill each area with a natural continuation of the surfaces behind it, keeping the existing orange LED lighting on the walls and surfaces:
1. The large wall-mounted TV. Replace it with the plain back wall behind it.
2. The white L-shaped corner shelving unit above the desk, and everything on it. Replace it with the plain back wall and right wall behind it, continuing the LED strip glow.
3. The red superhero action figure on the left bookcase shelf. Leave the shelf empty in that spot.
4. The white games console standing at the left end of the TV cabinet.
5. The black games console and the game controllers lying on top of the TV cabinet. Leave the cabinet top clear.
6. The two tall black floor speakers standing on the TV cabinet.

Move this:
7. The PC tower with the ring lights, on the desk by the corner: move it to the floor under the desk, against the right wall, at the correct scale and lit by the same orange light. Leave the desk surface clear where it stood.

Do NOT change: the two open compartments (cubby holes) in the TV cabinet or anything inside them, the drawers, the chair, the desk, the monitors and what they show, the white box, the headphones on their stand, the books, the clock, the ornaments on the left bookcase, the upper cabinets, the ceiling, or the floor.
```

- **Line 6 (the speakers) is OPTIONAL — Carl's call.** Removed for a technical reason, not the licence: WebGL draws the cards OVER the plate, so a speaker standing in front of CB would render BEHIND it unless an occlusion matte is built.
- **The cubbies are left alone on purpose.** The floor card covers them and the frost removes their shape (and so recognisability). ⚠ Frost does NOT remove brightness: the PS4's cyan light bar and the red book covers will show as soft glows behind the floor card's text. Judge that through the glass; fix it later with a targeted edit if needed.
- The monitor content is a separate step.

---

## SHORT VERSION — for a GPT one-shot (Carl: *"Give it a shorter removal list and it already knows what the tower looks like… just put it in the corner where the 2 skirtings meet."*)

⚠ **MEASURED:** the skirtings meet at ≈ (2611, 1806) on the 4000 × 2250 master, **directly under the small drawer unit hanging beneath the desk**, whose underside is at y ≈ 1744 (~62 px of clearance) against a tower ~265 px tall. **It does not fit in the corner itself.** It fits just to the RIGHT of the hanging unit, against the right wall (not hidden by the chair), or IN FRONT of the unit at the corner (partly hidden by the chair, but it blocks the drawer). Carl's choice.

```
Edit this image. Keep everything else exactly as it is: camera, perspective, composition, lighting, colours and all other objects. Output at the highest resolution available, 16:9.

1. Remove the wall-mounted TV; show the plain back wall behind it.
2. Remove the white L-shaped corner shelving and everything on it; show the plain walls behind it, continuing the LED strip glow.
3. Remove the red superhero action figure from the left bookcase.
4. Remove the games consoles and controllers on and beside the TV cabinet.
5. Remove the two tall black speakers on the TV cabinet.
6. Move the PC tower from the desk to the floor under the desk, standing against the right wall just to the right of the small drawer unit that hangs under the desk. Same size, lit by the orange glow under the desk. Leave the desk surface clear where it stood.
```

Alternative line 6: *"…standing in the corner in front of the small drawer unit under the desk."*

### Line 6, revised — Carl's three solutions (*"Theres always a solution"*): 1. flush against the drawer, handle removed; 2. turned 90°; 3. the other side of the desk.

Measured: a tower flush in front of the hanging drawer unit rises to y ≈ 1541, against the drawer front's y ≈ 1517–1744, so it covers almost all of it (the handle at ≈ 2500, 1590 is behind it). The chair partly hides its left side. It is clear of CB (bottom y ≈ 1280) and the floor card (right edge x 2110). **Builder's recommendation: option 1, optionally with 2's turn to show the fans.**

```
6. Move the PC tower from the desk to the floor in the corner under the desk, standing flush against the front of the small drawer unit that hangs under the desk. Remove that drawer's handle. Same size as now, lit by the orange glow under the desk. Leave the desk surface clear where it stood.
```

Optional addition: *"Turn it 90 degrees so its glass side panel with the ring-light fans faces the room."*
