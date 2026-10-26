# Current Sprint — Sprint 3

---

## Sprint Goal

**The About section (`/about`).** §2 is the current work; §1 and §3 are touched where §2's work reaches
them. Carl, 3 October 2026: *"We are currently working on Sect 2. But some of it touches on Section 1 and
what we are about to do touches on Section 3. Its in the About section. After that we will return to the
home page and deal with a CTA at its bottom."*

⚠ **Proposed wording — Carl's to amend.** ⚠ The work has since run well beyond it (the home page, `/start`,
film 4, the hero) — see the workstreams below.

## Sprint Period

2026-10-03 → Open

---

## ⛔ Where the record of everything else lives

**Sprint 2 and everything built after it closed — the home page, `/start`, the logo, the verify runner,
and `/about` up to 3 October 2026 — is archived verbatim in `active-sprints/archive/sprint-2.md`.**

**Sprint 3's own detail — each workstream's full narrative, the Completed table and the update footers —
moved verbatim to `active-sprints/archive/sprint-3-detail.md` on 26 October 2026** (Carl: *"prune it as you
see fit"*). This file keeps one summary per workstream. **Add new detail to `decisions.md` and
`review-log.md`, not here** — this file grew back to 7,407 words in three weeks by narrating each session.

**When Carl points at another section for reference:** the reasoning is in `decisions.md` (by D-number),
the verdicts in `reviews/review-log.md`, the build history in the two archive files above.

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
| **§2, the return rules** | Off screen draws nothing (step 1); reaching §4 sends a playing §2 STATIC (dark, empty); a 3 s linger in §3 re-arms it; the trigger reads both directions (wipe AND wall in view); card 1's face is the restart, "click to restart" large on it, flickering off as the rim flickers on | ✔ *"Functions and mechanisms are good"* | D-088 (13–14 Oct), R-052 |
| **§2 copy (the four roles)** | Four seats | PROVISIONAL | D-077 |
| **§2 → §3, the desk mark** | The 3D mark on the right desk, lit on CA's strike, wobbling every 20 s; the reader's scroll topples it (fall, rebound, flips, gold → platinum blue crossing) and drops it into §3's player | ✔ *"The logos journey looks extremely good"* | D-088, R-033 – R-041 |
| **§3** | Four film boxes 2 × 2, left; the viewer right (take 4, "the mark becomes the player"); the desk mark falls INTO it, the shock, the bounce, the code rain, the blue re-forms | ✔ R-086, R-087 | D-088 (21–22 Oct) |
| **§4** | Placeholder conclusion; the gold `Start a conversation` button (family member, 2×) | Button APPROVED; wording not settled | R-047 – R-051, R-060 |

**The code**, all in `components/about/` unless named:

- `app/about/page.tsx` — the page; its section comments carry the rulings.
- `about-card-canvas.tsx` — `RoomStage`, the cards' canvas, the room backplate, the take light, the desk mark.
- `about-room.ts` — the solved camera and the cards in room millimetres.
- `about-card-geometry.ts`, `about-card-mesh.tsx` — card shape (rim, bevel, face, the highlight caps).
- `about-card-glass.ts` — **PROTECTED** — the approved glass values.
- `about-neon.ts` — **PROTECTED** — neon values, the brightness track, `roomWipe`. `neon-bloom.tsx` — the frame owner and bloom.
- `card-extrude.tsx`, `card-text-timeline.ts`, `about-card-copy.ts` — the extruded text and its pages.
- `room-environment.tsx`, `room-plate.tsx`, `pillarbox-plate.tsx` — env map, plate, side bands.
- `logo-mark-*.ts`, `player-*.tsx` — the desk mark and the viewer.
- Benches: `/proto/card` (card family — read `cardDims()` first), `/proto/wall`, `/proto/logo`, `/proto/player`.

---

## Workstreams

One line of state each. Full narrative: `archive/sprint-3-detail.md`. ⚠ **Everything below was committed
and pushed as of 26 October 2026** (tree clean, level with `origin/main`) — checked by `git status`.

| Workstream | State | Record | Open |
|---|---|---|---|
| ✔ **Film 4 — "Your words, given form"** (`/proto/your-words`, `/proto/showcase`) | **THE PAGE APPROVED WHOLE** (R-094): viewport 1 the line under stage light (R-092); viewport 2 the arch under a moving camera — orbit, the tilt under the N, the pull-out — lit by lamps on the orbit's axis and a back pair (R-093); the brushed brass approved under both. The travelling light PARKED | D-088 (22–26 Oct), R-088 – R-094 | ✔ The link is NOT sent — Carl: *"We will just use the film in About."* (26 Oct; `app/robots.ts`'s 28 July position stands); `/proto` noindex at launch; the film's edit (~4:22 unique footage + the approved page's final take, 39.5 s) |
| **The camera bench** (`/proto/camera`, proposed) | Carl's method for every shot — describe, perform on the Xbox pad, refine (D-104); the bench's structural note v2 (reserved tracks) | D-104; `live-work/structural-note-camera-bench-26-october.md` | **With Carl for the Architect** — nothing built |
| **The hero** (home) | **D-101: built ENTIRELY IN CODE**; the film plan superseded as medium | D-098, D-101 | To be designed — camera and triggers Carl's; the build is §5a. Carries the cold-deep-link freeze (~0.75 s, D-100) |
| The desk mark (`/about` §2 → §3) | The journey end to end, tied to the scroll, its light directed | D-088, R-033 – R-041 | A jump drops in dark; the runway's length and the lag are takes |
| `/about` §3, the films and the viewer | Boxes 2 × 2, the viewer, the same logo falling in | D-088, R-086, R-087 | `structural-note-viewer-on-about-21-october.md` to amend (Builder) |
| The button family (`Who we are` teal, `Start a conversation` gold, `Next step` platinum blue) | All three APPROVED on their pages, all carrying the studio HDRI (the logo standard); the cards' warmth on `Next step` | D-088, R-042 – R-060, R-069, R-070 | Film 01's edit parked to the end of the build; `Next step`'s traveller dark (`?traveller=1`), to be repositioned |
| Home §2 / §3 copy and the ornate corners | Rewritten as us; corners on the page, lit, compiling without blocking | D-099, D-100, R-080 – R-085 | — |
| `/start` | **Closed out** — the corridor's colour, the heading's travel, the half-speed recession; the space images; the Q&A cards' glass tube and travelling light | D-023, D-051, R-061 – R-078 | **Send: after the hero, before mastering** (domain and mailbox first — Carl's steps) |
| The site's scale | Root zoom from one accessor above 1412 px; every canvas in layout px | D-097, R-063 – R-065 | — |

---

## Carried, open — Carl's

- The image scroll: §1's last lines pass over the opaque room; scroll-up fades it again; phones not
  looked at; `RoomPlate` has no `priority`.
- Flash cap at 3 (at the cap) ~87–88 s; continuous rendering while the text loops.
- RIM-DARK may be resolved by the take light — a deliberate look before it is closed (`open-defects.md`).
- The per-card text spots (`?textlight=1`, `card-extrude.tsx`) are in the code, off.
- `neon-bloom.tsx` re-arm; the films' hosting.
- **Flag only:** `components/about/about-card-glass.ts:491` says anisotropy "NEEDS A tangent ATTRIBUTE" —
  untrue on three r185 with UVs (proven on film 4). Protected; not edited.
- Every film 4 material/light value was set under NEUTRAL tone mapping (a judging choice); the page's not ruled.
- Accessibility, mobile and reduced motion are deferred to mastering (D-094).

---

## Standing — applies to all work

- **Deadline 19 November 2026.** Order (Carl, 22 October): film 4 → the hero → edit the four films → Send → mastering.
- **The hero's right-side space stays empty** without a brief from Carl — D-026.
- **Future work is not recorded here** — Carl keeps it outside the repository (D-038).
- **At site completion:** the workshop/template separation — full record
  `live-work/references/workshop-template-and-client-delivery.md`; summary in `archive/sprint-2.md`.
- ⚠ **Two review entries share the number R-028** (glass placement; the neon) — cite them by subject.
- **`verify/proven.json` is empty** — no harness pass is admissible (`open-defects.md`, D-064).

## Blockers

None. The four 18 September blockers (all resolved or withdrawn) are preserved in `archive/sprint-2.md`.

---

*Last updated: 2026-10-26 (later) — film 4 APPROVED WHOLE (R-092 – R-094): viewport 2 the camera journey; the camera bench proposed (D-104). Before that: PRUNED on Carl's instruction: 7,407 words → one summary per workstream; the
narrative, the Completed table and the update footers moved verbatim to `archive/sprint-3-detail.md`. Next: Carl's — the camera bench's note is with him for the
Architect; the order on record (22 October) is film 4 → the hero → the films' edit → Send → mastering.*
