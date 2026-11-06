# Review 2 — `structural-note-renderer-webgpu-5-november.md` (v1.1)

**Filed by the Builder, 5 November 2026, verbatim** as Carl pasted it. The Builder's notes are at the END, separate.

---

The note is now v1.1. Re-checking its new claims and the seam against the code.

  Searched for 4 patterns

Verdict on v1.1: It's a real improvement. The two-media design fits what you asked for, every v1 finding is folded in, and the claims I re-checked are right. One gap blocks it: the note says the approved shared files aren't edited and film 4 is untouched, but the arch can't reach the WebGPU twins without changing the component film 4 draws with. There's also one wrong API citation.

A correction to my v1 review first. The note is right that answer-card-canvas.tsx doesn't use whenLinked or usePrefilteredStudio. It calls gl.compileAsync directly (:3721, :3726). My finding 1 was wrong on that point.

What I confirmed in v1.1

- A failed init() is an unhandled rejection. R3F's Canvas calls run() without a .catch (react-three-fiber.esm.js:66–114), so the catch has to live inside the gl function, as the note says.
- fromEquirectangularAsync exists at PMREMGenerator.js:240, but see finding 2.
- The helpers are used in exactly the three places the note names: corner-canvas.tsx, your-words-canvas.tsx and lettering-piece.tsx.

Findings

1. Blocking: LetteringPiece is one shared component, and it calls the WebGL helpers itself.
- It's imported by the approved film 4 page (your-words-canvas.tsx:40, drawn at :233) and by the bench (camera-bench.tsx:1404).
- It calls usePrefilteredStudio at lettering-piece.tsx:277 and whenLinked(gl, gl.compile(…)) at :291.

So the twins can't get to the arch unless one of two things happens:
- (a) Edit lettering-piece.tsx so it takes the environment and the compile wait from the active medium, with WebGL as the default. Film 4 would behave the same, but the file it runs has changed. That needs your explicit word, and a film 4 re-check after.
- (b) Make a WebGPU copy of LetteringPiece. That breaks the bench's own rule, "drawn by the SHARED LetteringPiece — one mechanism with the page" (camera-bench.tsx:12), and the two copies will drift.

§3 already lists lettering-piece.tsx:264, 291 as going "through the seam", which quietly assumes (a). The note should name the choice, recommend one, and correct the claim that nothing approved is touched. I'd recommend (a): it's a small edit, and it keeps one arch mechanism.

2. fromEquirectangularAsync is deprecated. Line 242 warns: "deprecated. Use await renderer.init() instead" (since r181). After init(), the public route is the plain fromEquirectangular (:217), and it throws if called before init. Change the citation in §2 and §3.

3. Moderate: the WebGL medium will download the WebGPU code unless it's split out. The medium module is planned with "a WebGL and a WebGPU export" each. If both halves are imported up front, today's default bench also loads the 668 KB WebGPU build and the TSL grid. That undercuts "the WebGL column is today's code". The WebGPU half should load only when it's chosen (a dynamic import()), and the note should say so.

4. Minor: the grid's fade needs a defined interface. Today the bench reaches into the grid's shader uniforms with a cast (camera-bench.tsx:1314–1320). A TSL grid holds that value differently, as a node uniform. The seam should offer one call that sets the fade position for both grids. Otherwise that cast stays in the bench, which goes against the note's "no cast spreads".

5. Minor: one line is listed in two contradictory places. lettering-piece.tsx:264 (gl.toneMapping = …) is listed as a seam read, while §3 lists NeutralToneMapping as shared and unchanged. toneMapping exists on both renderers, so this is only a typing question. Say that.

Not re-checked: the MaterialNode.js:797 anisotropy claim and the file sizes.

---

## The Builder's notes (separate from the review)

- **Finding 1 — confirmed:** `your-words-canvas.tsx:40` imports `LetteringPiece`, drawn at `:233`; the bench's rule at
  `camera-bench.tsx:12` (*"drawn by the SHARED `LetteringPiece` — one mechanism with the page"*); `lettering-piece.tsx:277`
  and `:291`. `lettering-piece.tsx` is NOT on `.claude/protected-files.json` — but it is approved shared work (film 4, R-094):
  editing it needs Carl's explicit word. Taken: (a) recommended in v1.2, the claim "nothing approved is touched" corrected.
- **Finding 2 — confirmed:** `PMREMGenerator.js:242` warns deprecated since r181; `fromEquirectangular` (`:217`) throws before
  `init()`. Taken.
- **Finding 3 — taken:** the WebGPU half behind a dynamic `import()`, loaded only when chosen.
- **Finding 4 — taken:** one seam call sets the fade position for either grid.
- **Finding 5 — confirmed:** `lettering-piece.tsx:262–266` is the tone-mapping setter (`gl.toneMapping = THREE.NeutralToneMapping`);
  `toneMapping` exists on both renderers — a typing question only. Taken.
- The review's own correction (`answer-card-canvas.tsx` uses `compileAsync` directly) agrees with v1.1.
