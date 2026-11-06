# Structural note: a lens shift on the camera bench (3 November 2026)

**Status: BUILT on Carl's word** (*"proceed"*, 3 November 2026), as the decision below, scoped to `?blank=1`. Workflow
5a: a new camera mechanism. No Architect review (a sketch, Carl's call). How each coupling below was handled: D-101's
3 November entry.

## Why it arises

Carl chose the opening shot's camera at **71.5 cm with a shift lens** (D-101, R-102: *"Yes. its better."*). A shift keeps
the text locked to the page while the camera sits below 98 cm. The **page drawing** shows it (arithmetic in
`toHeroPage`, `PAGE_VIEW`, `SHIFT_TRIAL` in `components/showcase/hero-blockout.tsx`). **The bench cannot**: its camera
has no shift, so its Home (the page camera) is still 98 cm. **Two sources of truth for the opening shot**, the page and the
bench, now disagree. That is the defect this note exists to close.

## The decision

Give the bench camera a **vertical lens shift** (an off-centre frustum: three's `PerspectiveCamera.setViewOffset`, or an
offset in the projection matrix), set from `HERO_CAMERA` so the bench's Home and the page's drawing are one camera again.

## Alternatives

1. **Shift on the bench camera, every view** (the decision). A shift is a lens property; it stays while flying.
2. **Shift only at Home / the page camera.** Rejected unless Carl prefers it: the shift would vanish the moment the camera
   moves, so a take starting from Home would jump.
3. **No bench shift; the bench flies at 71.5 cm unshifted.** Rejected: the text cards leave their boxes (the bench stops
   matching the page), which is the disagreement this note is for.
4. **Tilt the camera down.** Rejected (R-102): keystones the text.
5. **Smaller text in the world instead of a shift** (text at 0.365 cm/px, a 71 cm headline). Not equivalent: the camera
   would stand closer to the text and the street's perspective would change. Raised only so it is not mistaken for a
   cheaper route.

## What it couples to (5b, to enumerate before building)

- The bench's **rig and takes**: does a clip store the shift with the lens? Old takes have none (default 0).
- **Recording and playback**, the **cuts** between Cam 1 and Cam 2: a Cam 2 close-up probably wants no shift.
- The **HUD**'s lens and position read-out (it should show the shift).
- The **third-person view** (it draws the selected camera's frustum: an off-centre one).
- The **client film** capture (`scripts/client-film/`) records the bench's picture.
- **D-104 / R-097 / R-098**: the recorder, trim and move, third person: approved; this touches the camera they all read.

*Written 3 November 2026 by the Builder.*
