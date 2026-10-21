# Session Handoff — 21 October 2026. THE CORNERS' COMPILE NON-BLOCKING. `/about` §3: THE FOUR FILMS, THE BOXES, THE VIEWER (TAKE 4) — ON THE PAGE, UNFINISHED.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 19 October session 2's.

---

## ⛔⛔ NEXT SUBJECT — Carl's, named: make it THE SAME LOGO

Carl: *"it isnt the same logo. This connection, continuity and resolution is not there because its built before the logo
drops in. When the logo drops in, then it must start."* Then, closing: *"We will fix it next session.. One way to do this is
have the Roles logo fall in the player. it could be masked temporarily at the edges.. Then the outline logo will come into
play along with the blue transition."*
- → The ROOM's desk mark (the §2 "Roles" logo) falls INTO the player: the top-edge wipe (a clipping plane,
  `about-card-canvas.tsx`, `DESK_MARK_DROP`) replaced by a temporary mask to the player's edges. It lands (Carl, earlier: *"hit
  its position, bounce slightly and become face on"*), then the viewer's 2D outline takes over with the blue transition.
- ⛔ **Carl, after the push:** *"It makes sense to carry on with the Roles Logo inside the player. We have its trajectory and
  angles. When it hiys its mark thats when outline logo will come in."* → the room's mark keeps its own trajectory and angles
  INTO the player; the viewer's outline (and the blue transition) begins at the HIT, not before. Carl: *"Everything is
  already there to complete the logo journey. Thr readout was neccersary because its outcome determined which logo we should
  use initially inside the player. It pushed us in the right direction."*
- ⚠ That is the structural note's option B in part — measure its costs, don't assume them: the room's whole pipeline renders
  on every frame it is asked for; its camera is perspective, so its silhouette vs the 2D outline must be measured at the hand-over.
- ⚠ **Today's attempt, BUILT AND NOT WORKING (pushed in progress):** the room publishes the mark's pose
  (`publishDeskMark` → `window.__c2bDeskMark`); the viewer is empty until the drop, draws that mark under the edge, lands, then
  cycles. Measured faults: the published centre stays near y ≈ 400 client px while the edge scrolls past (no crossing frame
  found; cause not found), and the colour (room blue above, dark navy below). Carl's route may make the read-out and the
  viewer's own metal unnecessary — decide after measuring.
- Then Carl's order: Send (domain + mailbox — his purchases) → … the hero → mastering; ⛔ deadline **19 November 2026**.

## WHAT HAPPENED — all PUSHED (this commit)

| | what | verdict |
|---|---|---|
| `8837478` | the corners' shaders + studio PMREM compile WITHOUT BLOCKING; `N` kept 1500 ms (D-100) | Carl: hero optimised later *"as the About section"* |
| §3 | heading/subtext deleted; boxes 2 × 2 left of the player | R-086 *"That looks good"* |
| films | the four: `Who we are` button, the corners (bench), the hero, extruded lettering (off-site, a client TEMPLATE of interchangeable parts) | ruled |
| `/proto/player` | the viewer, the Builder's design: takes 1 test card, 2 the mark as the timeline, 3 the ident, **4 = 2 + 3** (Carl's combination) | 4 developed with Carl: dots removed (*"looks better"*), the gradient + drain (*"really good"*), land → beat → transition (*"a lot better… caused by it"*) |
| `/about` §3 | `ExamplesRow onPage` — boxes as buttons + take 4; the PNG and white placeholder gone | in progress (above) |

## OPEN — with owners

- The same-logo fix — Builder, next session, on Carl's route.
- The films' HOSTING (the stand-in is local, `public/proto-local/`, gitignored) — Carl asked to be asked before web research.
- `neon-bloom.tsx`: a played film re-arms §2 (Carl, 13 October) — not built.
- The structural note `live-work/structural-note-viewer-on-about-21-october.md` v1 — built past on *"Just build it"*; amend it to the route taken.
- Phones — mastering (D-094).

## ⚠ STANDING / LESSONS FROM 21 OCTOBER

- ⛔ **Inside the viewer the design is the Builder's** (Carl: *"its not my design- its yours"*); he takes suggestions both ways.
  ⛔ **The viewer must make it OBVIOUS to visitors it is a player and what to do** — the transport visible at rest.
- ⛔ **The SAME object, not a copy:** a second drawing of the mark shown before the real one arrives broke continuity.
- Scope OPEN (not locked): `app/about/page.tsx`, `about-card-canvas.tsx`, the bench files, `.gitignore`, the corner files.
  Protected files: locked and probed 31/31 this morning; `unlocked` is empty.
- Measuring caught real faults twice today (a hidden video taking clicks; a drain whose last half-second was dead time) —
  film the motion and look at frames before saying it's right.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Servers STOPPED** at the end.

---

*Written 21 October 2026, end of session. Replaces 19 October session 2's.*
