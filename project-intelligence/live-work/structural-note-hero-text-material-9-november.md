# Structural note — how the hero text's WebGPU material reaches the text (9 November 2026)

**Status:** PROPOSED, for Carl, then the Architect (CLAUDE.md §5a). Nothing below is built.
**Chunk:** the hero text's material, take 1: edge-lit acrylic in ice blue, with the glow coming from the bevels. No bloom yet.
That is D-101, *"THE TEXT's MATERIAL (9 November 2026)"*. Carl: *"WebGPU should be the choice. Make the bech accordingly."*

## Already done in this chunk (Carl's direct instruction)

`camera-bench.tsx`: on `?blank=1` the bench now opens in the **WebGPU medium** unless `?medium=webgl` is in the URL.
Everywhere else, including the arch, the URL rule is unchanged.

## The structural question

The edge glow is a **node material** (TSL): `MeshStandardNodeMaterial` with an `emissiveNode` driven by a Fresnel term.
That code comes from `three/webgpu` and only runs under `WebGPURenderer`.

`HeroText` lives in `hero-text.tsx`. That file is imported statically by `camera-bench.tsx`, which also draws the WebGL
bench. The renderer note v1.6, which Carl approved, set the rule: **WebGPU-specific code stays behind the medium's seam
(`bench-medium.ts`) and is loaded by the bench's dynamic `import()` of `bench-medium-webgpu.tsx`.** The rule is there so
the WebGL path never pulls in the WebGPU half, and so nothing renderer-specific loads inside the canvas.

A future reader would ask: *"why is there a second way for WebGPU code to get in?"* That makes this structural.

## Options

**B — through the existing seam (RECOMMENDED).**
- `BenchMedium` gets one optional field beside the `arch?` slot it already has: `heroText?: { material(): THREE.Material }`.
- The WebGPU medium (`bench-medium-webgpu.tsx`) supplies it from a new file, `hero-text-material.ts`, which holds the TSL
  material and its dials.
- `BenchScene` already receives `medium`. It passes `medium.heroText` to `<HeroText>`, and the text uses that material
  when it is given one.
- With no material (the WebGL medium), the text stays in clay, exactly as today.
- **No new mechanism.** It is the same shape as `arch?`, which carries the arch's WebGPU environment.
- The WebGL path never imports the WebGPU half.

**A — import `three/webgpu` and TSL directly in `hero-text.tsx`. Rejected.**
- It is the simplest code, but it breaks v1.6's rule: the WebGPU half would load into the bench on every visit, including
  the arch in WebGL.
- On `?medium=webgl` the node material cannot draw under `WebGLRenderer`, so the text would need a guard.

**C — `hero-text.tsx` loads `hero-text-material.ts` with its own dynamic `import()` when the medium is WebGPU. Rejected.**
- This is a second loading path running alongside the seam: a new mechanism where an existing one serves.
- It also adds a load inside the scene, after the canvas mounts, which is the timing v1.6 §4 keeps outside.

## What B couples to, and what depends on the current structure (§5b)

- **`BenchMedium`'s type** gains one optional field. The WebGL medium leaves it undefined, so its behaviour is unchanged.
- **`HeroText`'s clay** stays the default. The upright logo keeps its own clay; the logo is not part of this note.
- **The text's geometry** (`heroTextLayout`, the bevel at 4 segments, the 30° crease) is unchanged. The material reads
  the normals the crease already writes. The glow lands on the bevel because the crease smooths each bevel's four steps
  into one rounded surface.
- **Tone mapping:** `WebGPURenderer` tone-maps the whole frame once (`bench-medium-webgpu.tsx`, header). The emissive's
  strength is set under that tone mapping.
- **The bloom** (take 2) is not in this note. It is a post-processing stage, and it will get its own note.
- **Disposal:** the material is created in `HeroText`'s `useMemo` and disposed through `useDisposeOnUnmount`, the same way
  the clay is today.

## Files B needs (all locked except as noted)

- `components/showcase/bench-medium.ts`: the optional field. Locked.
- `components/showcase/bench-medium-webgpu.tsx`: supplies it. Locked.
- `components/showcase/hero-text-material.ts`: NEW.
- `components/showcase/hero-text.tsx`: takes the material. Open as of 9 November.
- `components/showcase/camera-bench.tsx`: passes it. Open.
