# Session Handoff — 3 October 2026, session 2. THE DESK MARK DISCUSSED AND SETTLED; CHUNK 1 BUILT ("close and a good base to start from", R-033). NEXT: THE ARCHITECT'S CHECKPOINT REVIEW, A13, THEN CHUNK 2.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**Committed locally at the end of the session — NOT pushed** (pushing `main` deploys; `/proto/logo` would go live).
Ask Carl whether to push. **No server is running.**

**Done this session** (record: D-088's 3 October session-2 entries at the END of `decisions.md`):

1. **Sprint 2 archived** (closed 14 June, never archived) → `active-sprints/archive/sprint-2.md`, verbatim;
   `current-sprint.md` rebuilt around the About section. Required reading 19,675 → **7,255 words** (CLAUDE.md
   corrected, re-locked, lock tested). Committed and pushed (`67da4ef`).
2. **The image scroll APPROVED** (R-032).
3. **The desk mark (D-088) discussed, one question at a time — all settled by Carl:**
   - renderer = **route 1, one canvas for the whole journey** (structure not yet designed — chunk 2, §5a/§5b);
   - "animated" = **both**: lit by the room on the desk, and the scroll-driven fall; from the header (`Examples`) it
     falls in from the top right, already blue;
   - form = a **real 3D tube, curved front, flat back**; ⛔ **TARGETS: gold = `brand-assets/logo/c2b-logo-gold-relit-source-1671.png`,
     blue = `brand-assets/logo/transition/c2b-transition-1-platinum-blue.png`** (not the header's blue);
   - ⛔ **trace from the GOLD target's cut-out (`c2b-logo-gold-relit-alpha-1671.png`), NOT the white silhouette** —
     measured a different, bolder drawing (IoU 0.84). Brand README and hero notes corrected;
   - size = **144 plate px tall** (double a third of the right monitor's edge); **set parallel to the desk's right
     edge, facing out, set back a believable distance**; the scroll PULLS it forward, it tips **head over toe**; same
     size through the fall; disappears into the viewer's edge; what it does in the screen — later;
   - **blue in §3 — D-063 AMENDED**;
   - ⛔ **§3: Carl designs up to the viewer's edge; INSIDE the screen the Builder CREATES WITHOUT PITCHING** (no
     concept for approval; the ethos is the brief; bouncing logos banned). §5a still stops structure;
   - ⛔ **the desk mark IS the hero's DRESS REHEARSAL** (an earlier Builder reading said otherwise — corrected).
     Hero sequence: video logo (Resolve) → the energy-edge wipe in video → the code logo bursts out → layered over.
     *"Normal particles are cheesy — this is cool as F."*
4. **Chunk 1 BUILT — the mark alone on `/proto/logo`** (plan v2 after the Architect's 13 findings; Carl approved).
   ✔ Carl: *"Its close and a good base to start from."* (R-033 — a base, not approval.)

## ⛔⛔ NEXT SESSION — IN ORDER

1. **Route the checkpoint to the Architect:** `live-work/checkpoint-desk-mark-chunk1-3-october.md` (frames in
   `live-work/screenshots/logo-bench-3-october/`, local). Six deviations from the plan are stated there (eased stem
   not smooth max; crowned stem face; spline outline; central-difference normals; corner points inserted; measured
   large) — the Architect should rule on 1 and 4.
2. **A13 — Carl's: flat foot or as built?** (`side.png`: it stands on a thin strip under the base stroke.)
3. Carl's eye on the bench (restart the server): dome height (0.85), crown (0.25), roughness (0.25), the studio.
4. **Chunk 2** (placement in the room + the route-1 renderer) — **full process: plan, Architect gate.** It must solve:
   ⛔ **the gold renders near-BLACK under the room's reflection** (`oblique-room.png`) — the env map's plate panel
   misses the directions front-facing metal reflects (the RIM-DARK cause; D-091's candidates); the take light is
   inline in `about-card-canvas.tsx` (exporting it = a scope change); `/about` is `frameloop="demand"` and
   `neon-bloom.tsx` owns frames; the take light's shadow frustum (±2.2) may miss the desk; build cost (~0.8 s,
   241k tris at bench resolution — room size needs far less; runtime vs baked).

## ⚠ KNOWN ON THE BENCH (Carl's eye; invisible at room size)

Tiny teeth at the two inside corners where the bowl meets the stem; faint ticks on the 2's diagonal inner flank
(`below.png`); terminals are distance-field mitres, not the target's flat cuts.

## ⚠ HOW THE BENCH WORKS (so it is not re-derived)

- `live-work/scripts/logo-outline-extract.mjs` regenerates `components/about/logo-mark-outline.ts` (spline, 4,433
  points, ≤ 0.30 px from the iso-line; stem box, half-widths, the normalisation transform).
- `logo-bench-measure.mjs` — IoU + edge distance vs the gold alpha (control first), stats, canvases, errors.
- `logo-bench-shots-3-october.mjs [state…]` — frames. Both hide the Next dev badge.
- Bench switches: `?view=front|oblique|turntable|side|below|roomsize&mask=1&light=studio|room&overlay=0..1`.
- To run the geometry in Node: copy the two modules to a temp folder **inside the repo** (three must resolve), add
  `.ts` to the import, `node file.ts` (Node 25 strips types). ⚠ Move it out before `tsc` (TS5097).

## ⚠ STANDING / CORRECTIONS THIS SESSION

- **Scope:** `chunk-scope.json` is chunk `desk-mark-1-logo-bench` (Carl-set). The auto-mode classifier BLOCKED a
  Python edit of the scope file as self-modification; the Edit tool worked once Carl gave permission. Carl widens
  scope; ask by naming files.
- Carl prefers questions one at a time in discussion; ask once when a "Yes" is ambiguous (held twice today).
- Two review-log entries share **R-028** — renumbering is Carl's.
- Lint baseline: `1 problem (1 error, 0 warnings)`. Carl's machine: DPR 1.36, viewport ~1412 × 700.
- If Carl reports stutter: check Chrome's GPU process for software WebGL first (carried).

---

*Written 3 October 2026, session 2 (end). Replaces the 3 October session-1 handoff.*
