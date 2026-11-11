# The Architect's review of `structural-note-hero-bench-11-november.md` v1.0 (11 November 2026, session 1)

Pasted to the Builder by Carl. Kept as given; the note's v1.1 answers it.

---

Checked the note against the code and D-101: the quotes and the stale comments it cites are accurate. Now checking the scope guard and its other claims.

I've finished checking the note against the code, D-101 and chunk-scope.json. Here's the review.

**Verdict:** The note is sound and right to stop here under 5a. A second renderer and scene is structural. The alternatives are real, and the "ship nothing but the scene" boundary is a good design. I found two ordering and coupling gaps worth fixing before it goes to the Architect, and a few smaller accuracy points.

**What I checked and found true**

- Carl's quotes all match D-101 word for word (decisions.md:7681–7684), and so does the 27 October "It shouldnt move".
- The stale comments the note names are real and say the opposite of what the code does: marching-bench.tsx:26 still says "cause NOT FOUND"; marching-bench.tsx:309 says "WebGPU unless ?webgl=1", but line 47 opens WebGL unless ?webgpu=1. Line 45–46 ("until the cause is found") and app/proto/marching/page.tsx:7 are stale too. The note misses these two.
- The scope is already open. All five files are in chunk-scope.json (_heroBench11Nov), and components/hero/ doesn't exist yet, so "nothing in it is built" is true.
- The camera bench's remembered camera is precedent for remembering the camera here (camera-bench.tsx, localStorage).

**Findings, most important first**

1. Step 2 needs the logo, but the logo only arrives in step 3. Step 2 sets the scale "when the logo (2 m) is sized against the text at Home"; step 3 brings in "the three.js text, then the lean, then the logo's volume". No step brings in the logo's mesh before step 2 needs it. Either step 2 brings it in (upright, sized only, no lean), or the scale moves after it. The previous handoff's NEXT #1 makes step 2 the likely place, but the note should say so.
2. The count workaround will exist in two copies, and the note doesn't say so. Building from /proto/marching copies the plain-mesh draw and the cube-map wait into hero-scene.ts, while the reference keeps its own copy. "A three upgrade must re-check RenderObject.js:610–612" reads as one site; there are two. The note should name both files and say the reference stays untouched on purpose.
3. Home only holds at one window shape. The overlay text is fixed CSS px, stepped at Tailwind breakpoints; the scene scales with the canvas height (a perspective camera keeps its vertical fov). So the blobs' size against the text, exactly what Home records, changes with window height. The readout records the window size, which is right, but the note doesn't say what the site does at other sizes. Step 3 (three.js text inside the scene) partly fixes this. A question for Carl at step 2 or 3.
4. The scene/bench boundary isn't spelled out, and the "not on the site" claim depends on it: the cube-map wait (the scene probably needs to expose a ready promise); the simulation settings object the panel edits; cleanup (who disposes what, StrictMode's double mount); the renderer setup (onDeviceLost, the D-097 zoom sizing) sits in the bench, so the site's hero will need its own copy later. Better said now.
5. Smaller points: the overlay is really the THIRD copy (app/page.tsx, marching-bench.tsx, hero-bench.tsx); the remembered camera should store the orbit's target and the fov, under its own storage key; window.__heroBench development-only, as __marching; "an idea in bench-ideas.ts" reads as if a marching idea exists there (it doesn't): "as an idea brought to it through bench-ideas.ts"; LIQUID_ON = true is in hero-idea.tsx (line 19), name that file; the textured material also loads uv_grid_opengl.jpg from threejs.org.

**Nothing to change:** the rejected alternatives are well argued, especially keeping /proto/marching as the untouched reference and putting Home in code rather than only in the browser. Marking the import check "Unasserted" is the right level of honesty. The list of checks after the build is complete.

Findings 1–3 are for Carl to decide, and Carl decides whether they go to the Architect. Findings 4–5 are corrections the Builder can make in a v1.1.
