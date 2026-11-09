# Review 9 — the Architect on the reflection note v1.6 (9 November 2026, session 2)

**Subject:** `structural-note-hero-logo-reflection-9-november.md` v1.6. **Routed by Carl.** Pasted into the Builder's
session by Carl and saved verbatim below. **Outcome:** R8-2 (and R7-4 with it) WITHDRAWN on the Builder's source reading;
no blocking findings; two additions, adopted in v1.7.

---

v1.6 is right on the disputed point, and I withdraw R8-2. The original finding it came from (R7-4) is withdrawn with it. I've no blocking findings left. Two small additions are below, plus one detail for Carl on the lighting.

R8-2: the Builder's reading holds

I've confirmed it in source:
- render() can't pause partway. It isn't async (Renderer.js:1362–1372), so it can't yield to other work mid-call. fromScene calls it inside one synchronous run.
- compileAsync hands the renderer back before it waits. It restores the render context and functions (:1025–1032) before its first await (:1044). Each queued build carries its own render context (:1039).
- Those later builds do read the renderer's live MRT, but only between tasks. By then the capture has already finished and restored everything.

Where I went wrong: I treated "reads live state later" as if it were the bloom's PassNode.compileAsync hazard. That one holds the renderer's target and MRT across an await. Nothing on the bench does that now, so the onReady gate was never needed.

The entry guard is a sound replacement: it catches a state-holding compile if anyone adds one later. With the arch leaving ?blank=1 (Carl's decision on Q3), it's a safety net rather than a fix.

Two additions

1. The copied parent matrix gets overwritten unless the root's auto-update is off.
render() calls scene.updateMatrixWorld() (Renderer.js:939). That rebuilds every object's matrix from its position, rotation and scale. So the matrix the note copies onto the root would be replaced by identity.
- Effect: the text and lights would land 4.29 m too high relative to the capture point.
- Fix: set root.matrixAutoUpdate = false and copy into root.matrix. Or decompose the parent's matrix into the root's position, rotation and scale.
- The null control can't see this: it has no text, and lights alone change nothing. Measurement 2 would catch it as text in the wrong place. One line in the note avoids the detour.

2. Put a bound on the guard's retries.
"Defers to the next task" with no limit retries forever if something ever holds the renderer. Retry on the next frame, give up after N tries, and publish that as a separate count from the skip count.

Carl's lighting section: verified, with one detail for his decision

The arithmetic checks out, and so does the swap. The hemisphere light compares world normals with its world-position direction (HemisphereLightNode.js:44, 76). Most of the effect falls away from the faces he judged:
- Front faces (facing the camera) get 51.9% sky against 50% if the light pointed straight up. That's practically no change. The faces Carl approved look almost exactly as they would with the lighting corrected.
- Letter tops get the dark ground colour where they should get white sky. Letter bottoms get the reverse. So the swap shows on the tops, bottoms and bevels, depending on how much of them the camera sees.

That narrows his decision without making it for him.

The rest

- R8-1, R8-3, R8-4, R8-5: adopted as I'd want them. The eroded front-face mask with a 4-level threshold is right.
- The HeroStage move: world comes from the arch's build data (camera-bench.tsx:1236), not the mounted arch, so the group's offset survives the arch's removal.
- The arch's removal: decisions.md:7591 already records its §5b list, including the six harnesses waiting on data-camera-bench="drawn". That signal comes only from the arch's onReady (:1972). Nothing in this note depends on it any more.
- Q4 (marching cubes first) stands as before.
