# Current Sprint — Sprint 3

---

## Sprint Goal

**The About section (`/about`).** §2 is the current work; §1 and §3 are touched where §2's work reaches
them. Carl, 3 October 2026: *"We are currently working on Sect 2. But some of it touches on Section 1 and
what we are about to do touches on Section 3. Its in the About section. After that we will return to the
home page and deal with a CTA at its bottom."*

⚠ **Proposed wording — Carl's to amend.**

## Sprint Period

2026-10-03 → Open

---

## ⛔ Where the record of everything else lives

**Sprint 2 and everything built after it closed — the home page, `/start`, the logo, the verify runner,
and `/about` up to 3 October 2026 — is archived verbatim in `active-sprints/archive/sprint-2.md`.**
Sprint 2 closed on 14 June 2026 (milestone `2152e6e`) and was not archived at the time; four months of
work accumulated on top of it, which is why the file stopped being readable. Nothing was deleted.

**When Carl points at another section for reference** (e.g. `/start`'s Q+A light, the client info orbit,
the home page buttons): the reasoning is in `decisions.md` (by D-number), the verdicts in
`reviews/review-log.md`, the build history in `archive/sprint-2.md`.

---

## The About section as it stands

Plain `/about` is the reference state. Pushing `main` deploys it. Each line names where its reasoning
lives; this file does not repeat it.

| | What is on the page | Standing | Record |
|---|---|---|---|
| **The page** | Four full-viewport sections; the gold mark nailed top-left, identical across pages | Placement APPROVED | D-065, D-066, R-020 |
| **§1** | Two-register copy (statement and person); em dashes removed (*"into, with commas"*) | Copy AND layout APPROVED | D-072, R-023; D-095 tail (27 Sep) |
| **§1 → §2, the image scroll** | ONE sticky `RoomStage` behind §1 and §2: the room faded at 0.2 under §1, §2's room through a top-down smootherstep wipe; one wipe number (`roomWipe`) drives the mask and the §2 trigger; the stage leaves with §2 | ✔ **APPROVED** | D-092, R-032 |
| **§2, the room** | office-image-3, edited; its own solved camera; the four cards placed in room millimetres | Placement accepted by eye | D-095 |
| **§2, the cards** | CA, CB on the wall; CD, CS on the floor. Frosted glass face (transmission 0.86, roughness 0.35) | Material APPROVED in the room | D-082, D-089, R-028 (glass) |
| **§2, the neon** | Lit rims (CA/CB orange, CD/CS mirrored gold ↔ red), neon-only bloom, one brightness track per card, stutter ignition | Palette approved as a starting point | D-087, D-091, D-093, R-028 (neon) |
| **§2, the text** | Carl's copy, extruded, justified, running in pages at `/start`'s pace; two full pages per card at 68 mm | Pace and page model approved | D-094, R-029, R-030 |
| **§2, the light** | ONE take light (directional, still, room orange `#ff6528` at 0.25, 50° from upper-left); bevel highlight capped at 0.03, rim uncapped | ✔ *"both goals surpassed"* — a take | D-095 tail (3 Oct), R-031 |
| **§2, the sequence** | Strikes when the wipe clears CA's bottom: CA → CB → CD → CS → CA, looping, each card two cycles | Approved by eye (27 Sep) | D-095 tail (27 Sep) |
| **§2 copy (the four roles)** | Four seats | PROVISIONAL | D-077 |
| **§3** | Placeholder heading and line. Intended: four FILMED builds of C2B's own work, selectors left, player right; the desk mark as the player's idle content | Brainstorm, not built | D-088, D-095 tail (27 Sep) |
| **§4** | Placeholder conclusion; the `Start a conversation` button, the pair of the home page's `Who we are` | Subject settled, wording not | `app/about/page.tsx` comments |

**The code**, all in `components/about/` unless named:

- `app/about/page.tsx` — the page; its section comments carry the rulings.
- `about-card-canvas.tsx` — `RoomStage`, the cards' canvas, the room backplate, the take light.
- `about-room.ts` — the solved camera and the cards in room millimetres.
- `about-card-geometry.ts`, `about-card-mesh.tsx` — card shape (rim, bevel, face, the highlight caps).
- `about-card-glass.ts` — **PROTECTED** — the approved glass values.
- `about-neon.ts` — neon values, the brightness track, `roomWipe`. `neon-bloom.tsx` — the frame owner and bloom.
- `card-extrude.tsx`, `card-text-timeline.ts`, `about-card-copy.ts` — the extruded text and its pages.
- `room-environment.tsx`, `room-plate.tsx`, `pillarbox-plate.tsx` — env map, plate, side bands.
- Benches: `/proto/card` (card family — read `cardDims()` first), `/proto/wall`.

---

## Current work — the desk mark (D-088)

**Carl, 3 October 2026:** *"Logo on desk will be built with Three js and be animated… Next phase will
need discussion, a plan and consultation with the Architect."* ⛔ **Full process — not waived.**

- **The concept (D-088, 27 September):** the mark on the right desk, right of the monitor; the reader's
  scroll dislodges it; it falls into §3's player as its idle content; gold → platinum-blue; reversible.
- **Decided:** the cubby mark is DISCARDED. The renderer is **route 1 — one canvas for the whole
  journey** (Carl, 3 October, session 2). The structure is not yet designed; it is §5a/§5b and goes
  through the plan-review gate.
- **Discussion settled (3 October, session 2):** animated = both (lit by the room on the desk; the scroll-driven
  topple); the form = a real 3D tube, curved front, flat back, traced from the GOLD target; the size = double a
  third of the right monitor's edge, set along the desk's right edge, set back; same size through the fall; blue
  in §3 (D-063 amended); Carl designs to the viewer's edge, the Builder creates inside it. Built in chunks.
- ⛔ **REBUILT IN PASSES — MESH, MATERIAL, LIGHTS — each approved by eye before the next (Carl, 7 October;
  the blue Next step button's process, D-030).** Chunk 1 is withdrawn as a build, and its idea kept. Its
  checkpoint was NOT routed. `6302913` is held unpushed.
- **The form, superseded (7 October):** not a domed tube. **A flat face in a narrow chamfer, one profile all
  round** — Carl's flat-face shape target, *"similar with traditional gold bars."*
- **Pass 1 (the shape, in clay) PASSES (R-034).** Its checkpoint request (`live-work/checkpoint-desk-mark-pass1-7-october.md`)
  is **closed unrouted by Carl**: v3 is *"well founded. The results justify that."* The file is kept as the record.
- **Pass 2 (the material) — both metals on the bench (R-035):** the gold (a positive read) and the platinum blue
  (the swatch blue #3F6DB8, *"great"* — chosen to contrast with the scene's orange). Built on Carl's *"just apply
  the gold metal"*, without a plan.
- **The crossing:** an OUTSIDE-IN circular wipe, gold → platinum blue during the tumble, smooth and deliberate,
  ending at the mark's centre `logoMarkCentre()` (0, 0.5, depth/2). Measured: `live-work/logo-centre-measurement-7-october.md`.
- ✔ **The crossing, built on the bench and APPROVED (8 October, R-036):** an outside-in sphere about the centre in the
  mark's own space, one number 0 → 1, at HALF `/start`'s pace (~2.03 s). Open: the scroll mapping in the scene, and the
  look against the room's orange. Reasoning: D-088's 8 October entries.

## Carried, open — Carl's

- The image scroll: §1's last lines pass over the opaque room; scroll-up fades it again; phones not
  looked at; `RoomPlate` has no `priority`.
- Flash cap at 3 (at the cap) ~87–88 s; continuous rendering while the text loops.
- RIM-DARK may be resolved by the take light — a deliberate look before it is closed (`open-defects.md`).
- The per-card text spots (`?textlight=1`, `card-extrude.tsx`) are in the code, off.
- Accessibility, mobile and reduced motion are deferred to mastering (D-094).

---

## Completed

| Task | Output | Notes |
|---|---|---|
| The image scroll approved | — | R-032 |
| Sprint 2 archived; this file rebuilt around the About section | `archive/sprint-2.md`, this file | Carl, 3 October 2026 |
| D-088 desk mark, IN THE ROOM (`?mark=1`) — placed on the right desk (facing the camera, centred, face 65 mm from the end so a tip carries it off), lit by the bench studio alone, three shadows on the desk (studio top, LED strip, contact). ✔ Carl: *"Yes, excellent. Now the logo really looks that its in the world."* (R-037) | `about-card-canvas.tsx` (`DeskMark`), `about-room.ts` (desk, clamp, strip measured), `logo-mark-material.ts` (shared studio) | Plain `/about` unchanged. Three placement takes; the fall described by Carl (tip → back to us → the bin flips it → drop into §3), recorded in D-088. Next: the fall, in chunks |
| D-088 desk mark, THE CROSSING — gold → platinum blue, an outside-in sphere about `logoMarkCentre()`, on the bench, at half `/start`'s pace. ✔ Carl: *"That looks great. Approved."* (R-036) | `logo-mark-material.ts` (`createLogoCrossing`), `logo-mark-geometry.ts` (`logoMarkReach`), `logo-bench.tsx`, `app/proto/logo/page.tsx` | Built without plan or Architect on Carl's word. Window 547.4 → 19.5 px; `/start`'s pace 1.015 s, halved to ~2.03 s. `/start`'s two transitions filmed and noted first |
| D-088 desk mark, PASS 2 — the gold and the platinum blue on the clay shape, in a fixed judging studio. ✔ Blue *"great"*, gold a positive read (R-035). The crossing's end point measured | `logo-mark-material.ts`, `logo-bench.tsx`, `logo-mark-geometry.ts` (`logoMarkCentre`) | Blue in three takes: platinum tinted → logo sample → swatch #3F6DB8. Commit `a3a3d75` |
| D-088 desk mark, PASS 1 — the shape in clay on `/proto/logo`: a flat face in a narrow chamfer, one profile all round. ✔ Carl: *"Yes"* — passes (R-034) | `app/proto/logo/page.tsx`, `components/about/logo-bench.tsx`, `logo-mark-geometry.ts`, `logo-mark-outline.ts` | Junction 46.7° → 6.3°; IoU 0.9961, edges ≤ 1 px. Plan v2 → v3; request `live-work/checkpoint-desk-mark-pass1-7-october.md`. Open for Carl: the stem's corners (trace 22–26 px vs the target's crisp mitres), A13, the dials |
| D-088 desk mark, chunk 1 — the 3D mark alone on `/proto/logo`. ✔ Carl: *"close and a good base to start from"* (R-033). ⛔ **Withdrawn as a build 7 October** (the b's tear; mesh, material and light built at once) | `app/proto/logo/page.tsx`, `components/about/logo-bench.tsx`, `logo-mark-geometry.ts`, `logo-mark-material.ts`, `logo-mark-outline.ts` | Traced from the gold target; IoU 0.9969, edges ≤ 1 px. Request: `live-work/checkpoint-desk-mark-chunk1-3-october.md`. Open for Carl: flat foot or as built (A13) |

---

## Standing — applies to all work

- **The hero's right-side space stays empty** without a brief from Carl — D-026.
- **Future work is not recorded here** — Carl keeps it outside the repository (D-038).
- **At site completion:** the workshop/template separation — full record
  `live-work/references/workshop-template-and-client-delivery.md`; summary in `archive/sprint-2.md`.
- ⚠ **Two review entries share the number R-028** (glass placement; the neon) — cite them by subject.
- **`verify/proven.json` is empty** — no harness pass is admissible (`open-defects.md`, D-064).

## Blockers

None. The four 18 September blockers (all resolved or withdrawn) are preserved in `archive/sprint-2.md`.

---

*Last updated: 2026-10-08 — the desk mark in the room, lit and shadowed (R-037).*

*Previously: 2026-10-08 — the crossing built on the bench and approved at half `/start`'s pace (R-036).*

*Previously: 2026-10-07 (end of session) — passes 1 and 2 of the desk mark done (R-034, R-035); the crossing's end point measured; next: the crossing on the bench, tied to the object.*

*Previously: 2026-10-07 — the desk mark rebuilt in passes; pass 1 passes, R-034.*

*Previously: 2026-10-03 (session 2, end) — the desk mark discussed and settled; chunk 1 built (R-033, "close and a good base"); next: the Architect's checkpoint review, A13, then chunk 2. See the handoff.*

*Previously: 2026-10-03 (session 2) — Sprint 3 opened; Sprint 2 archived verbatim.*
