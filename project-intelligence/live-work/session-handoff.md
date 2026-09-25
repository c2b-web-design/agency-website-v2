# Session Handoff — 25 September 2026. THE NEW ROOM IS BUILT ON `/about`, UNCOMMITTED.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**Plain `/about` §2 now shows office-image-3 (the new room), with all four cards placed by Carl's rulings.
IT IS NOT COMMITTED.** Carl: *"Change about, build it there so when i ask you to start the server we can
go from there."* ⛔ **The first thing Carl is expected to do is ask for the server (port 3000).**

- **Record: D-095** (its 25 September entries run in order: removal list → four edits measured → plate
  chosen → camera → layout → build). **Current sprint:** the "THE ROOM REPLACED" row.
- **Plate:** `brand-assets/office-image-3-edited.png` (3632 × 2048, from a non-GPT generator; committed
  `a0658b2`) → served as `public/about-room-plate.jpg` (**2560 × 1435, square pixels**).
- **Camera** (`live-work/camera-solve-25-september.md`): f 2013.7 px on the 4000 px master, 89.6° hFOV,
  **3.22° UP**, roll 0; falsified four ways. ⛔ **The left bookcase is NOT plumb in the render — never a
  reference.** In the scene: vFOV **58.203°**, `PITCH` positive.
- **Layout, accepted by eye** (*"Placement and balance are good"*), all in `about-room.ts` → `ROOM_CARDS`,
  in ROOM MILLIMETRES (desk = 750 mm ASSUMED): CA/CB on the back wall (the TV's frame, 1332 × 805, level,
  equal 226 mm spacing, CB's bottom 10 mm above the chair tip); **CS ABOVE**, 4 doors (1662 × 423) trim to
  trim on the cabinet fronts (401 mm off the wall); **CD on the FLOOR**, 101 mm (one skirting height) in
  front of the skirting face, top level with the top drawer handle IN THE PICTURE, 1284.5 × 546.9 (area =
  CS's), right edge clear of the chair. ⚠ **Moving a card = editing `ROOM_CARDS`.**
- **The layout tool:** `live-work/scripts/card-layout-office3.mjs` (args: `<out.jpg|""> equal 4 0
  977.5,1858 0 1545,1628`; `EXPORT=1` prints the scene constants and a transcription check).

## ⛔ UNCOMMITTED WORKING TREE (Carl commits on request)

New: `components/about/about-room.ts`, `components/about/room-plate.tsx`, `public/about-room-plate.jpg`,
`live-work/camera-solve-25-september.md`, scripts `camera-solve-office3.mjs`, `verticals*-office3.mjs`,
`room-model-office3.mjs`, `door-gaps-office3.mjs`, `card-layout-office3.mjs`, screenshots
`office-image-3-cards-current.jpg`, `new-room-first-render-{guides,plain}.png`.
Changed: `about-card-canvas.tsx`, `about-card-copy.ts`, `app/about/page.tsx`, `decisions.md`,
`current-sprint.md`, and seven `live-work/scripts/*.mjs` (unused variables removed — lint baseline).
✔ `tsc` clean · `npm run build` clean · **lint 1 error, 0 warnings (baseline)**.
⚠ `live-work/` files are gitignored: **force-add** the new scripts/records/screenshots when committing.

## ⛔⛔ NEXT — WHAT THE FIRST RENDER SHOWED (production build, real GPU, `?guides=1`)

1. ✔ **All four cards sit on their guides** — the scene path and the layout path agree.
00. ⛔ **SECOND SESSION, 25 SEPTEMBER — THE LIGHT.** Committed `b00f9b8` (room + far fix), pushed. Since then,
   UNCOMMITTED: text hidden by default (`?text=1`); **the moving light — CARL'S ORBIT (two spots, one fixed ellipse; the strip take superseded) — ON on plain `/about`** (`?lightmove=0` off; trajectory on localhost by default)
   (`about-moving-light.tsx`); the landing trigger `WALL_BAND` re-derived from the new room. Decisions in D-090's
   25 September entries (CA first · the light WASHES · one downbeat on landing · slow · the 3D geometry ·
   legibility first). Plan gate WAIVED by Carl for the light. **Carl judges it MOVING, not from frames.** The downbeat is PARKED (trigger kept, not consulted — Carl); the trajectory shows by default (localhost). Carl: the orbit "great"; RANDOM REVERSALS at the two lulls built (lmrev 0.5); STATIC LIGHTS OFF by default as his experiment (lmglobal=1 restores). Later, with text: dim at points so it does not blow out the text. CARL (noted, WAITS): it blows out at points — esp. the BOTTOM of the orbit (CD face-on) — needs a gently FADED, TIMED drop there; the white colour waits on his rim-colour idea (do not pre-empt). Cone 40° "looks good". Committed at the end of this stretch.
   `chunk-scope.json` = `about-moving-light`. Server on :3000 (production build) — stop by PID before a checkpoint.
0. ✔ **FIXED, second session 25 September — ITEMS 2 AND 3 BELOW WERE ONE CAUSE:** `far` = 100 clipped the
   proxy's far plane (102–106 m), so WebGL drew nothing above plate row 0.56; the DOM `<img>` showed through
   (the seam) and CA/CB/CS's glass refracted a 50%-white clear. `far` is now DERIVED (`CAMERA_FAR`). All four
   read as glass. **Awaiting Carl's eye.** D-095's last entry; `live-work/scripts/seam-far-clip.mjs`;
   `live-work/screenshots/current-about-25-september/about-now.png`. ⚠ Items 2–3 kept as first written.
2. ⚠ ~~**The cards read OPAQUE WHITE, not glass.**~~ *(cause found — item 0)* All four now face one way (18.4° off the camera axis) into
   the OLD room's key light ([1,2,2] @0.5; fill [5,2,-2] @2.6); glass values (D-089) were tuned for the old
   yaws/backgrounds. **The light/glass pass is next, by Carl's eye.** ⛔ D-089 values are approved — do not
   retune without Carl's word.
3. ⚠ **A horizontal SEAM across the back wall near eye height; the monitors look ghosted where it crosses.**
   **Hypothesis, UNMEASURED:** the floor-grid rows near the horizon (now mid-frame, NDC ≈ −0.10) span
   enormous depths and the GPU's perspective-correct UV interpolation bends the NDC-mapped texture. ⛔
   **Measure before fixing** (compare the WebGL frame against the plate, row by row, around the horizon).
4. **Side bands** are page background (~75 px a side at 1412 × 700). Rebuilt bands from the new plate =
   Carl's call. `PillarboxPlate` is kept, unused (old-photo assets).
5. **Carried to later passes:** text size/depth per card (D-094's depth rule was set from OLD view angles);
   rim bloom over the chair where gaps are a few px (**parked by Carl**: *"We will cross that bridge"*);
   CD physically intersects the floating cabinet (underside ~310 mm) — reads fine on screen.

## ⚠ CARL'S RULINGS AND STANDING INSTRUCTIONS FROM THIS SESSION

- ⛔ **Show ONE image of the current state** — no comparison sheets (memory saved). Open it in a folder of
  its own: the Photos app arrows to sibling files and Carl once landed on a stale overlay.
- *"Always trust your instincts."* (on the floor card's resize).
- The PS4 is uncovered and **stays** — his licence call (*"I doubt whether Sony will come after me"*).
- The plan gate was waived for the room swap (*"nothing is new here- only the image"*).
- Equal-area rule for above/floor cards is DROPPED; CD's area now matches CS's (his later instruction).

## ⚠ PARKED / CARRIED / OPEN QUESTIONS

- ⛔ **THE LOGO (D-088):** Carl will say when. **Do not raise it.**
- **Unanswered:** move the five superseded 24 September overlays (`office-image-3-layout-A/B`,
  `-above-card`, `-balance`, `-right-card-fit`) into a `superseded/` folder? (Carl opened one by mistake.)
- **Unanswered:** CLAUDE.md says the "read before touching anything" list is 8,837 words; it is ~19,100
  (`current-sprint.md` alone ~12,800+). Flagged at session start; no ruling.
- Carried from before: the two R-028s; remove the etched take?; CS's "connected to…" (D-077);
  accessibility at mastering (D-094); ENVMAP-STALE / RIM-DARK; the `proven.json` filing.

## ⚠ HOUSEKEEPING

- `live-work/chunk-scope.json` = **`new-room-swap`, active** (files listed there). Re-scope for the next chunk.
- **Servers: none running.** Port 3000 and 3100 confirmed free at session end.
- **Carl's machine:** DPR 1.36, viewport ~1412 × 700 CSS (≈2.02:1).
- ⚠ **Bash eats backticks inside `node -e "…"`** — twice this session comment text lost its `code` names.
  Write replacement text to a quoted-heredoc file and read it from node, or use the Edit tool.

---

*Written 25 September 2026.*
