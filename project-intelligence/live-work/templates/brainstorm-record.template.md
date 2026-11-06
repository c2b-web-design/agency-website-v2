# Brainstorm record — <section / scene>, <date>

<!-- The FORM for a section's opening brainstorm (context-rules.md: "A brainstorm is a source of record" — what Carl raises is
recorded, INCLUDING what he does not pick, and an idea can be chosen by being expanded on). Each field is asked every time;
a field left blank says "not discussed", never silence. Written into decisions.md under the section's D-number; this file is
the form, not the record. Added 5 November 2026 on Carl's word ("yes, add it") with the MEDIUM line. -->

**Filmed:** <capture file, or "not filmed">

## Carl's words
<verbatim, the description of the scene as he gave it>

## Ideas raised
| Idea | Raised by | Status |
|---|---|---|
| <idea> | Carl / Builder | CHOSEN · RAISED AND NOT CHOSEN · PROVISIONAL (a take) |

## The world: materials, light, atmosphere, motion
- Materials: <what things are made of; clean or aged; what causes the age>
- Light: <sources, colour, time of day; what lights what>
- Atmosphere: <haze, wet, weather>
- Motion: <what moves; the camera's part>

## ⛔ MEDIUM — WebGL or WebGPU (a take, proven before building)
Decided from the description above, by these questions (the renderer note, `structural-note-renderer-webgpu-5-november.md`;
D-101, 5 November). A plain scene of built-in materials, textures, lights and shadows looks the same in both — the medium
matters only beyond the built-ins.

| Does the scene need… | Leans |
|---|---|
| materials DRIVEN BY THE WORLD (wetness by height, ageing by use, dirt in joints) | WebGPU (TSL; runs on its WebGL 2 fallback too) |
| wet / reflective ground, rough reflections | WebGPU (reflector with mip blur, SSR, GTAO nodes) |
| thousands of moving things (rain, ripples, particles, steam) | WebGPU (compute) |
| a post-processing stack (bloom, depth of field, grade) in linear light, tone-mapped once | WebGPU |
| a small self-contained piece (a button, a card, a corner) | WebGL (lighter, faster first frame) |
| reuse of approved WebGL work or its helpers | WebGL |
| an exact colour with no compositing pass (the per-material tone-mapping opt-out — WebGPU does not honour it) | WebGL |

- **Medium (take):** <WebGL / WebGPU>
- **The rows that tipped it:** <…>
- **Shares a page with:** <other canvases, and their media>
- **Proof before building:** <the smallest scene that measures it — e.g. a spike page, or the bench in that medium>

## Open — with owners
- <question> — <Carl / Builder>
