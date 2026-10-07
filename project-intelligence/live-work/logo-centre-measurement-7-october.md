# The desk mark's centre — the END POINT of the gold → platinum-blue crossing (7 October 2026)

**Carl:** *"measure the logos centre spot. Not just coordinates for height and width but for thickness too. That will
be a ending point for the colour transition."* The crossing is an OUTSIDE-IN circular wipe (Carl, the same day), the
reverse of the Begin button's entrance, the platinum blue closing in and the gold going last at this point.

**Measured on the BUILT pass-1 solid** (defaults: bevel 15 px, 45°, round 4 px, depth 41 px), in Node, from the mesh
itself. Mark units: height = 1, origin at the box's bottom-centre; px = gold target source px (1671 × 941).

| | mark units | source px |
|---|---|---|
| box | x −0.96264…0.96264 · y 0…1 · z 0…0.07323 | 1078 × 560 × 41 |
| **centre — width (x)** | **0** | **845.2** |
| **centre — height (y)** | **0.5** | **486.5** (y down) |
| **centre — thickness (z)** | **0.03661** | **20.5** (half of 41; the back is z 0, the face z 41) |
| volume centroid, for comparison | (0.0341, 0.4258, 0.0349) | 19.1 px right, 41.5 px lower, 1.0 px nearer the back |

- **Where it falls:** INSIDE the solid, on the **2's diagonal**, 22.1 px from the diagonal's upper-left edge, under the
  flat face (the front is 41 px high above it). The nearest front-surface point is 19.5 px away, on the chamfer.
  Frames: `screenshots/logo-centre-7-october/centre-on-clay.png`, `centre-on-target.png`.
- **The same spot as `/start`.** `/start`'s 2D wipe centres on the nail (the letterforms' box centre) and leaves its
  last gold on the 2's diagonal (`screenshots/start-logo-7-october/`). The box centre is that nail's 3D counterpart.
  The volume centroid is not, so it is recorded for comparison only.
- ⛔ **x and y are exact by construction** (the normalisation). **z FOLLOWS THE DEPTH DIAL:** it is `depth / 2`, not
  a fixed number. In code: `logoMarkCentre()` in `components/about/logo-mark-geometry.ts`.
- ⚠ **Not decided here:** what the wipe measures its radius in (a sphere about this point, or a circle in the mark's
  plane). It is a 3D crossing on a tumbling object; that goes to the pass that builds it.
