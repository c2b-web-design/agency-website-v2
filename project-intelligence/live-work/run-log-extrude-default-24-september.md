# Run log — the extruded take becomes plain `/about`, rims off. 24 September 2026 (session 2)

**Chunk:** `about-extrude-default`. Gate waived by Carl for this piece only (D-094 amendment).
**Scope guard:** re-scoped, and proved by a real denial of an edit to `card-text-timeline.ts`.

## Change

- `card-extrude.tsx`: `extrudeEnabled()` is `neonParam("extrude") !== "0"` (was `=== "1"`).
  The header comment was corrected in place.
- `about-card-canvas.tsx`: comments only. The neon-fader header now says `?extrude=0` is required;
  the `extrude` memo, the shadows and `onCreated` notes were corrected in place.
- `about-card-mesh.tsx`: one comment.
- `verify/about-neon.mjs`: `PIN = "extrude=0"` appended in `openCanvas`, the one URL builder, so
  every mode (baseline, identity, floor, profile, frames) measures the neon page. The identity output
  states it next to the verdict.

## Measured — headed GPU Chromium, AMD Radeon / D3D11

| check | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | 1 problem (1 error, 0 warnings): the known `enquiry-opening.tsx` baseline |
| identity at HEAD, before the change | 0 px on all four arms (baseline still valid) |
| identity after, arms pinned `extrude=0` | **0 px on all four arms** (runner suppresses the pass: unproven, D-064) |
| HEAD `?extrude=1` vs HEAD `?extrude=1` (noise floor, 1412×700 @1.36) | 959 / 79 / 684 px at 4 / 12 / 26 s from `extrude:start:ca`, **all inside CA's face** |
| plain after vs HEAD `?extrude=1` | 1044 / 407 / 340 px, bbox x 0.183–0.468, y 0.166–0.373: **inside CA's face** (x ≈ 0.175–0.466) |
| plain after vs `?extrude=1` after | 0 / 1 / 74 px, inside the wipe |
| marks after 6 s | `?extrude=0`: `neon:ignite` 1, `extrude:start:ca` 0 · plain: 0, 1 |
| console, plain | `ca extrude: 10 lines, 6 slots, erase 4 lines behind · 52mm … pass 32.9s … grace 7.7s` |

⚠ **NOT WATCHED:** the lit neon on `?extrude=0` beyond its ignite mark (the identity arms are
`none`/`off`); anything outside the canvas; production build cost. The long tasks (139/637/195/314/366
plain vs 123/616/187/274/313 HEAD) are one dev-server run each, buffered from load, and **not a
cost comparison.**

## Server

`npm run dev` runs in the background, PID 8412, port 3000. ⛔ **Stop it by PID before any checkpoint.**
