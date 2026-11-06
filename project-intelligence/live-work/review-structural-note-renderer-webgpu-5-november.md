# Review — `structural-note-renderer-webgpu-5-november.md` (v1)

**Filed by the Builder, 5 November 2026, verbatim** as Carl pasted it. The Builder's notes are at the END, separate.

---

Checking the note's claims against the code: the arch's material path on the bench uses helpers from corner-canvas.tsx that the note doesn't list.

  Searched for 12 patterns, read 1 file

I read the note and checked its claims against the code and node_modules.

Verdict: The direction holds up and most of the checked facts are right. But it isn't ready for the Architect yet. Its dependency table (§3, the "what depends on this" list) misses the dependency that costs the most: the arch's own render path on the bench only works on WebGL.

What I confirmed

- R3F waits for a renderer passed as a function (typeof glConfig === 'function' ? await glConfig(defaultProps)).
- StandardNodeLibrary.js:64–76 converts the built-in materials and leaves out ShaderMaterial.
- getMaxAnisotropy() (Renderer.js:1884), setScissorTest, toneMapping, and the WebGPU Line2 / LineSegments2 all exist.
- The bench lines the note cites are real: getContext() at camera-bench.tsx:1077/1092, webglcontextlost at :1844, and the grid's uniforms read at :1314–1320.
- I did not re-check the file sizes, the shared three.core.js imports, or the adapter probe.

Findings, most serious first

1. Major: the arch on the bench depends on WebGL-only helpers that §3 doesn't list. lettering-piece.tsx imports two functions from corner-canvas.tsx:
- usePrefilteredStudio (corner-canvas.tsx:115) calls new THREE.PMREMGenerator(gl). That is the WebGL generator: its internal materials are ShaderMaterials, so they won't compile on WebGPURenderer. It also reads the generator's private fields.
- whenLinked (:92) polls gl.properties.get(m).currentProgram.isReady(), which is WebGL internals. On WebGPURenderer, compile is just another name for compileAsync (Renderer.js:3811) and returns a Promise. So whenLinked(gl, gl.compile(scene, camera)) at lettering-piece.tsx:291 would try to loop over a Promise and throw.

The row in §3 that says "PMREM is node-based there" is therefore wrong for this code. Both helpers are also used by the approved film 4 page (your-words-canvas.tsx) and by answer-card-canvas.tsx. Moving the arch means one of two things, and the note has to pick one and say so:
- edit approved shared files to handle both renderers, or
- give the bench its own copies, which is a second mechanism and needs review under CLAUDE.md 5a.

Either way, the claim that "film 4 is NOT touched" only holds conditionally. This also changes the case against the rejected option "the bench picks its renderer by mode", because that rejection was weighed on an incomplete cost. I'm not saying the decision flips, only that it needs re-arguing with this cost included.

2. The spike can't use HeroBlockout "as it is". hero-blockout.tsx:1210 reads s.gl.capabilities.getMaxAnisotropy(). WebGPURenderer has no capabilities object, so the block-out would throw as soon as it mounts. The anisotropy change has to come before the spike and belongs in the spike's scope. That file is one of the two left open on your word, but it still needs asking before the edit.

3. The brass's anisotropy reasoning comes from WebGL code. lettering-material.ts:32–34 justifies anisotropyRotation = π/2 from the GLSL chunk envmap_physical_pars_fragment.glsl.js. Node materials implement anisotropy separately, so "may look slightly different" undersells it. The π/2 reasoning needs re-checking against the TSL code, not just an image comparison.

4. Several "[to verify]" items can be closed now:
- Device lost: renderer.onDeviceLost exists (Renderer.js:595, :1225).
- Timestamps: trackTimestamp is a backend parameter (Backend.js:76). On WebGPU it is turned off without the timestamp-query feature (WebGPUBackend.js:294). Results are read with resolveTimestampsAsync (Renderer.js:2856).
- polygonOffset: it becomes depthBias / depthBiasSlopeScale (WebGPUPipelineUtils.js:239–242), but only for triangle lists.
- Typing, "how many": the bench (:1077, :1092, :1336–1352, :1844), hero-blockout.tsx:1210, lettering-piece.tsx:264/291, and the two corner-canvas helpers.

5. Minor: reflector() has no roughness setting. ReflectorNode.js offers generateMipmaps only. A rough reflection comes from the material reading blurrier mipmap levels where the surface is rougher, which you build yourself. Plan §6 says the same thing. This matters for the reflections note, not this one.

6. Minor: the counts don't match. §5 says "four pieces" of new code, but §4(2) lists five. With the arch's environment-lighting setup and its compile check it's seven.

7. Minor: the startup failure path isn't covered. If await r.init() fails, the note doesn't say where that error lands. Today "The bench cannot draw" is wired to webglcontextlost and Guard. I haven't checked how R3F surfaces a failure inside the renderer function.

Do you want this filed beside the note as a review in live-work/, or will you take it to the Architect from here? I haven't edited anything.

---

## The Builder's notes (separate from the review)

- **Finding 1 — confirmed in the code:** `corner-canvas.tsx:115` `new THREE.PMREMGenerator(gl)` and its private fields
  (`_equirectMaterial`, `_ggxMaterial`, …, line 28's list); `:92` `whenLinked` reads `gl.properties.get(m).currentProgram`;
  `Renderer.js:3811` `get compile() { return this.compileAsync; }`; `lettering-piece.tsx:291` passes `gl.compile(...)` to
  `whenLinked`. ⚠ **One detail not borne out:** a search for `usePrefilteredStudio` / `whenLinked` across `components/` finds
  them in `corner-canvas.tsx` (their home), `lettering-piece.tsx` and `your-words-canvas.tsx` — **not** `answer-card-canvas.tsx`.
- **Finding 3 — confirmed:** `lettering-material.ts:32–34` derives π/2 from `envmap_physical_pars_fragment.glsl.js`.
- **Finding 4 — confirmed, each line read:** `Renderer.js:595/1225` (`onDeviceLost`), `Backend.js:76` and
  `WebGPUBackend.js:294` (`trackTimestamp`, off without `timestamp-query`), `Renderer.js:2856` (`resolveTimestampsAsync`),
  `WebGPUPipelineUtils.js:241–242` (`polygonOffsetUnits` → `depthBias`, `polygonOffsetFactor` → `depthBiasSlopeScale`).
- **Finding 5 — confirmed:** `ReflectorNode.js` takes `generateMipmaps`, no roughness.
- **Finding 7 — read further:** R3F's `Canvas` calls `run()` (async) whose `await root.current.configure({ gl, … })` is not
  caught there (`react-three-fiber.esm.js`, the layout effect) — so a failed `init()` inside our `gl` function is an
  **unhandled rejection**, never reaching `ErrorBoundary` / `Guard`: the bench would sit blank, no "cannot draw" message. The
  catch must be ours, inside the `gl` function.
- All taken into **v1.1** of the note; finding 1 re-argues the per-mode option and changes the recommendation (see the note).
