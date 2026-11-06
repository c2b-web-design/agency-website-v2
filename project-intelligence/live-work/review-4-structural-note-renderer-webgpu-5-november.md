# Review 4 — `structural-note-renderer-webgpu-5-november.md` (v1.3)

**Filed by the Builder, 5 November 2026, verbatim** as Carl pasted it. The Builder's notes are at the END, separate.

---

v1.3 is in. Reading LetteringPiece itself, because the new interface depends on how it uses the environment today.

  Searched for 4 patterns, read 2 files

Verdict on v1.3: Every review-3 finding is folded in correctly. I checked the arch-check citation: camera-bench-verify-26-october.mjs:72 really is check(true, …). Two small things are left, both in the new LetteringPiece interface. Once they're fixed, I'd send the note to the Architect.

Findings

1. Passing the environment texture "up" adds a render step, so film 4 won't behave "exactly as now".
- Today: usePrefilteredStudio keeps the texture in its own state (corner-canvas.tsx:116). LetteringPiece reads it in the same render it builds the metal (lettering-piece.tsx:277–278).
- v1.3's shape: a child component makes the texture and hands it up to LetteringPiece. The child would have to call a parent setter from an effect, and the parent re-renders again before it can build the metal. That's one extra render, and film 4's ready signal shifts by it. The setter-in-effect pattern is also close to the project's one accepted lint error (set-state-in-effect). I haven't checked whether the rule catches a setter passed down as a prop.
- Suggested shape: put the environment component outside the rest of the piece. It calls its hook and renders the piece's body with the texture as a prop. Nothing is lifted, there's no extra render, each medium's component still has a fixed set of hooks, and film 4's WebGL path keeps today's timing.

2. The compile-wait function needs a named signature, including how it's cancelled.
- Today: whenLinked returns a cancel function, and that function is the effect's cleanup (:291). The effect re-runs when built, camera or scene change.
- The gap: a WebGPU twin that only awaits compileAsync has nothing to cancel. Say built changes while the metal stays the same. The old promise resolves and calls setCompiled(metal), so linked turns true before the new geometry has compiled.
- The fix: name one signature for both media, (gl, scene, camera, done) => cancel, with the WebGPU twin keeping a cancelled flag. The WebGL default also needs a small wrapper, because whenLinked is typed gl: THREE.WebGLRenderer and can't go into a context that accepts both renderers without a cast.

3. A fact the note can add as checked, which strengthens its failure row:
- onDeviceLost also fires when the WebGL fallback loses its context: the backend listens for webglcontextlost and calls it (WebGLBackend.js:241, :247). One hook covers both of the WebGPU medium's backends.
- Real WebGPU ignores the reason 'destroyed' (WebGPUBackend.js:264), so a normal unmount won't show "The bench cannot draw".

4. Minor: the harness citation should name its file. Write camera-bench-verify:72 as camera-bench-verify-26-october.mjs:72.

---

## The Builder's notes (separate from the review)

- **Finding 1 — confirmed:** `corner-canvas.tsx:115–117` (`usePrefilteredStudio` holds the texture in its own `useState`);
  `lettering-piece.tsx:277–278` (read and the metal built in the same render). Taken: the environment component WRAPS the
  piece's body and renders it with the texture as a prop — nothing lifted.
- **Finding 2 — confirmed:** `lettering-piece.tsx:286–292` (`whenLinked`'s cancel is the effect's cleanup; deps
  `[gl, scene, camera, metal, built]`). Taken: one signature `(gl, scene, camera, done) => cancel` for both media.
- **Finding 3 — confirmed:** `WebGLBackend.js:241` (`renderer.onDeviceLost(contextLossInfo)`) and `:247` (the
  `webglcontextlost` listener); `WebGPUBackend.js:264` (`if (info.reason === 'destroyed') return;`). Taken, [checked].
- **Finding 4 — taken.**
- ⚠ Flagged to Carl: four rounds; this one's findings are real but small (an extra render, a cancel); the reviewer would send
  after them.
