# Session Handoff — 15 October 2026 (session 3, end). THE SPACE BEHIND `/start` (APPROVED, PUSHED). NEXT: THE CORRIDOR TEXT AS EXTRUDED THREE.JS.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record: the END of `decisions.md` (this session's entries from "D-051 (the answer cards' tube) — THE TAKE MADE THE DEFAULT"); R-067 – R-071 (`reviews/review-log.md`).**

---

## ⛔⛔ NEXT SESSION (Carl's words)

*"Next session we will convert the corridor text to extruded three js. Movement and behaviour will stay untouched. We might look at the colour given the new environment."*

- The corridor's TEXT — opening heading, Q labels, questions, the memory rail — today DOM in `enquiry-opening.tsx` (PROTECTED) and `globals.css`. Its movement and behaviour must not change.
- ⚠ **Structural (§5a/§5b):** text leaving the DOM for a canvas changes paint order, hit-testing, accessibility, and the corridor's timing owners. Enumerate what the DOM text provides before building. The plan-review gate applies unless Carl waives it.
- **Precedent:** `/about`'s extruded card text (`components/about/card-extrude.tsx`, D-094: text in the scene, an `sr-only` copy MANDATORY; troika measured unable to guarantee a crafted setting).
- ⛔ **The scope is CLOSED TO CODE** (`chunk-scope.json`, chunk `closed-to-code`: records only). Carl must name every file the new chunk touches. ⚠ Do NOT close a chunk with `active: false` or an empty `files` list — the guard reads both as "allow everything".

**The order after it (Carl):** `/about` §3 → the home page → **the hero, last** → mastering. ⛔ **The hero's preliminary direction is now IN THE REPO — D-098** (a scoped exception to D-038, on Carl's word): the 10 s Fusion film (the logo travels forward growing, stops, the wipe in the film), the swap to the code logo, a light pinned to the logo lighting the extruded headline — ONE scene. Carl's Fusion numbers: `live-work/hero-fusion-spec-15-october.md`. `/start`'s three.js is its forerunner — *"variations on a theme."*

## WHERE THINGS STAND — all PUSHED

| commit | what | verdict |
|---|---|---|
| `35313df` | the Q&A tube take the default (1.5, uniform, bloom); unused doors removed | R-067 *"The page looks good"* |
| `dbfab33` | the cards' travelling light back on, dipping at the ring's two bends | R-068 approved |
| `6829369` | Next step's studio reflection; the selected cards' warmth on it as it rolls | R-069, R-070 approved |
| `3746c27` | **the space**: exoplanet GJ 9827d behind the corridor, the galactic centre behind the client info, crossing on the crawl's fade; the cards' ground plane removed; q90 | R-071 approved |
| `d56d80b` | protected files relocked; the chunk closed to code; both tested | — |

**The corridor's inspiration is now recorded (D-023):** the *Star Wars* (1977) opening crawl — Carl: *"the user can see previous answers and they dont disappear in the ether and a tip of the hat to George Lucas."* Its recession, not its tilt.

## ⚠ OPEN — WITH OWNERS

- **Builder:** the space images' arrival on PRODUCTION (measured on dev/localhost only: loaded before first paint, ~100 KB each at 1920 q90).
- **Carl:** the corridor text's colour against the planet (next session).
- Deferred to the site-wide MASTERING pass (D-094/D-035): phones, reduced motion, accessibility. ⛔ Do not list phones as an open chunk item.
- **Closed this session — do NOT re-raise:** the corner radius (14, tried 0–30, the defect was the reflection); the button's light on the cards (*"lets not over complicate things"*); Andromeda and MACS J0717 as backgrounds.

## ⚠ STANDING / CORRECTIONS THIS SESSION

- ⛔ **The dev server served a STALE `globals.css` after an Edit-tool write, and a RESTART DID NOT CLEAR IT** — a second edit did. After any CSS edit, grep the SERVED chunk (the `<link rel=stylesheet>` from `/start`) before measuring. Memory updated.
- ⛔ **A harness that measures the pose an effect is excluded from is blind:** the cards' warmth on Next step lands only as the pill ROLLS; face-on stills read Δ 0. Carl caught it watching live. Use bursts with the phase read from the shape (`card-glow-burst-15-october.mjs`), or Carl's eye.
- **Read a decision's trail to the end before calling it open** (the corner radius; memory `feedback_read_the_trail_before_listing_open`).
- `family-button-stills.mjs` cannot prove a look unchanged against the committed stills since D-097 (1 px larger, sub-pixel layout). The committed stills were restored, unchanged.
- **Carl's rules recorded today:** the client info's rims guide (*"look cool but also guide the user"*) — nothing near the form may out-shine the next rim; the orbiting light's 1 s back run glints the gold (*"fast and fleeting"*); the cards' warmth on the button lands only as it rolls (*"as the card sits in front no effect on the face is expected"*).
- Lint baseline: 1 error, 0 warnings. **Dev server RUNNING on :3000 (PID 10628)** — stop by PID and confirm the port free before any checkpoint.
- Sources for the space (4000 px archive JPEGs, the Andromeda tile crop) were in the session scratchpad — gone with it. `live-work/scripts/zoomify-crop-15-october.mjs` rebuilds a crop from any ESA/Hubble zoomable.

---

*Written 15 October 2026, session 3, end. Replaces session 2's handoff.*
