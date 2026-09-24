# Run log — CD and CS text; every card light off. 24 September 2026 (session 2)

**Chunk:** `cd-cs-extruded-text-dry`. The scope guard was proved by a real denial (`about-card-mesh.tsx`).

## Change
- `card-extrude.tsx`:
  - `EXTRUDE_SWITCHES` is all off.
  - `EXTRUDE_DEPTH_MM` per card: CA 3, CB 1.5, CD 2, CS 0.9.
  - Header corrected in place.
- `about-card-canvas.tsx`: CD and CS get `faceReceiveShadow` when selected, and a `CardExtrudedText` each. The light distance is scaled by face width as CB's is (unmounted by default).

## Measured — headed GPU Chromium (AMD / D3D11), 1412×700 @1.36
| check | result |
|---|---|
| tsc / lint | clean / 1 problem (1 error, 0 warnings) |
| identity gate (`?extrude=0` arms) | **0 px on all four arms** |
| `?extrude=cd` | `11 lines, 4 slots, erase 2 behind · depth 2mm · 60,286 tris · pass 20.3s · grace 2.8s · widest gap 3.81x` |
| `?extrude=cs` | `13 lines, 4 slots, erase 2 behind · depth 0.9mm · 65,796 tris · pass 23.1s · grace 2.5s · widest gap 7.07x` |
| plain (CB, lights off) | `cb:1`, `ignite:0` |
| view angle off normal, far/centre/near | CD 26.9 / 27.4 / 34.7° · CS 60.0 / 52.8 / 44.2° |

⚠ **By eye:** CD reads clearly (the room fill lights it). CS reads dim grey, its far words squashed, with wide justified gaps.
⚠ **NOT WATCHED:** long-task cost as a production figure (dev runs: CD 123/580/152/398, CS 130/606/149/405 ms, buffered from load).
