# Architect Plan Response — Wall pair neon (CA + CB)

> ⚠ **TRANSCRIBED BY THE BUILDER, NOT WRITTEN BY THE ARCHITECT.** Carl pasted the Architect's
> findings into the Builder's session on 23 September 2026, and the Builder saved them here
> verbatim (`handoff-protocol.md` §2.5). **The Builder is an interested party in its own review.
> If this file and the Architect's window ever differ, the Architect's window is the authority.**
>
> **The plan reviewed:** `live-work/wall-neon-plan-23-september.md`. That file is the amended
> version, with each finding tagged [F1]–[F14] where it lands.

---

Verdict: the route is right. Approve with amendments. The neon-only choice over EffectComposer is correct and its justification checks out against the installed source. Thirteen findings below; F1 is a build blocker, F7/F8 will make the harness report a false failure on its first run, and F11/F14 are record obligations the plan currently says it doesn't have.

*(Builder's note: the verdict line says "thirteen", but fourteen findings are listed, F1–F14. It
is recorded as written, and the plan takes all fourteen.)*

---

## ✔ Verified — claims I checked and that hold

| claim | evidence |
|---|---|
| @react-three/postprocessing sets NoToneMapping | NoToneMapping present in node_modules/@react-three/postprocessing/dist/index.js |
| three tone-maps only when drawing to screen | three/src/renderers/WebGLRenderer.js:2351-2357 — `let toneMapping = NoToneMapping; if (material.toneMapped) { if (_currentRenderTarget === null …` — quoted exactly right |
| MipmapBlurPass exists and is exported | postprocessing/build/types/index.d.ts:3238 |
| no other useFrame subscribers on /about | grep of components/ — every useFrame is in components/enquiry/; none in components/about/ |
| one `<Canvas>` on /about | about-card-canvas.tsx:887; app/about/page.tsx:722 mounts it once |
| frameloop="demand", alpha: true | about-card-canvas.tsx:888-890 |
| CA/CB both take glass | about-card-canvas.tsx:1235, 1248 |

The HEAD-against-HEAD noise floor before any edit, the shaders-compile-at-load ordering, the shared rimGeometry, and declaring the harness inadmissible are all right and are the parts of this plan I'd not want touched.

---

## ⛔ F1 — BLOCKING. The ignition and ?reignite= will not fire.

@react-three/fiber/dist/events-f19bcc32.cjs.dev.js:

- :16111 — a root is only updated while state.internal.frames > 0
- :16085 — if (!state.internal.priority && state.gl.render) state.gl.render(…), which is S1's mechanism, confirmed
- :16144-16150 — invalidate() called from inside a useFrame sets frames = 2

That last line matters: the sustain works in R3F 9.6. A self-invalidating useFrame keeps itself alive. So the trap recorded four times in this codebase (contact-field-light-rig.tsx:865, contact-field-canvas.tsx:1703, answer-card-canvas.tsx:345, useLockupFade) is about the bootstrap, not the sustain — and the bootstrap is exactly where this plan lands.

R3F invalidates on store changes and on three-prop updates (:1207, :508). A setTimeout firing ?reignite=5000 is neither. At that moment both tracks are holding, the loop has stopped, nothing invalidates, useFrame never ticks, and the reignition silently does not happen. D-092's scroll trigger has the identical shape.

/about?reignite=5000#roles is the one control Carl uses at Checkpoint 2.

Fix: whatever writes the track's start time calls invalidate() in the same statement — one line. Assert it rather than comment it (context-rules.md, the unasserted-invariant rule): a dev-only check that a track marked live has seen a frame within ~100ms, failing loudly. A comment saying "the start invalidates" is the same prose that failed on 18 August, twice, on the day the rule was written.

---

## ⛔ F2 — §5b is missing the two rows that matter most

The table is good on what it has. Two absences, both of the "provided by accident of where it sits" kind the rule exists for:

1. Priority-1 switches off automatic rendering for the whole root, permanently, for every consumer. :16085 tests internal.priority, not "is neon running". Every repaint /about will ever do — resize, dpr change, a texture arriving, HMR — now goes through NeonBloom's callback. If it throws once, the room stops rendering including under ?neon=off, and the identity gate would then be comparing two black frames. Say this, and say what happens if the callback throws.
2. gl.autoClear. The composite quad must not clear the base render. Name the flag you set and where you restore it. Forgetting it is a black screen, not a subtle artefact.

---

## ⚠ F3 — ?neon=0 is the wrong subtrahend for the profile

profile measures ?neon=on minus ?neon=0. Those two arms differ in which code renders, not only in whether the neon is lit. Any path difference the identity gate tolerates is inherited by every profile number.

Subtract ?neon=off — same path, level 0, one variable. Keep ?neon=0 for the identity gate alone, which is the one measurement that is about the path.

---

## ⚠ F4 — ?neon=\<number\> collides with a reserved parameter

D-087 rules: "the clock must not be a mount time — stop when hidden, phase-correct on return, ?neon=<seconds> freeze, or the reproducibility argument is void."

The plan spends ?neon=0 on "do not mount". Rename now, while it costs one line: ?neon=off|hold|full for the mount/level control, and reserve a numeric ?neont=<ms> for "freeze the track at t". ?neon=on then becomes a special case of it, and chunk 4 gets the parameter D-087 already requires instead of having to re-cut the namespace.

---

## ⚠ F5 — the track's signature must express D-087's loop, or chunk 4 rewrites it

The plan's track "rises to 1.0 and holds". D-087's neon is periodic — incommensurate on/off periods, {5,6,7,8}s, duty cycles chosen before periods. Two amendments:

- Give the pattern an explicit tail — hold, or loop: { periodMs } — so the one-shot ignition and the loop are the same type.
- maxRisesPerSecond must evaluate the sliding window across the loop boundary. A flash check that stops at the end of the segment array reports 0 for a pattern whose worst window straddles the wrap. That is the A2-threshold class of defect: a check that cannot fail on the case it exists for.

---

## ⚠ F6 — the flash cap has zero margin, and the cheap half of the argument is missing

The candidate CA pattern has three rises ≥ 0.2: 0→0.55, 0→0.8, 0.15→1.0. At a cap of ≤3 that is the limit exactly, before CB is considered and before the loop adds anything.

- Author to ≤2 so Carl can tune without tripping it.
- Write the area argument into the file. WCAG's general flash threshold is conditioned on the flashing area — a combined area above ~25% of a 10° visual field. Two card rims are far under it. The rise count is a conservative proxy; the area is why the proxy has slack. Without that written down, the first pattern Carl likes that reports 4 becomes an argument nobody in the room can settle.
- ⛔ Do not throw at mount. A throw blanks the room Carl is judging by eye — the one thing this chunk exists to produce. Run the check once at module scope in dev and fail loudly in the console. The stop condition ("report it; do not quietly alter his pattern") already covers the governance; the throw only costs you the render.

---

## ⛔ F7 — the harness will be read as a failure by the front door, on a clean run

verify/run.mjs:158 — `FAIL_MARK = /(^|\n)\s*(⛔|❌|FAIL(ED|URE)?\b)/i`
verify/run.mjs:224 — `if (FAIL_MARK.test(text)) return "disagree";` → exit 4, pass suppressed, on a zero exit.

The plan requires each mode to print what it does not watch. Those lines are exactly the prose that produced defects 1–2 on 28 August. Two fixes:

- Write blind-spot lines with ⚠, never a line-leading ⛔.
- Emit the ##VERDICT: sentinel (run.mjs:194), which the runner honours ahead of both marks. current-sprint.md records it as "defined but unemitted — untested in a real run." This harness is the natural first exercise of it, and doing so retires that open item instead of leaving it for a session that will have to re-derive it.

---

## ⛔ F8 — about-neon.mjs \<mode\> is defect 3's exact shape

A non-numeric string in argv[2]. It is guarded now — but only if the harness uses verify/lib/args.mjs (positionals(), wholeNumberArg()) rather than hand-rolling Number(process.argv[2] ?? 3), which 33 scripts in that folder still do. Name the import in the plan so it is not a remembered step.

---

## ⚠ F9 — the identity gate's red run is asserted, not measured

"a level of 0.01 must register as different" is a number chosen the way the A2 harness's threshold of 170 was chosen — and that one returned PASS on a defect measuring 167.2. At 8-bit output, through ACES, 0.01 emissive intensity is plausibly below one quantisation step, so the red run could quietly fail to go red. A red run that cannot go red is worse than no red run: it certifies the instrument.

Measure the floor instead. Sweep the level until the differ-count first clears the HEAD-vs-HEAD noise floor, record that number in the plan, and file the red run at roughly twice it.

---

## ⚠ F10 — a real consequence of the route, currently unrecorded, and probably a gift

The rim's core is drawn in the base pass with toneMapped true → ACES. The emitter is drawn into a render target, where WebGLRenderer.js:2351-2357 applies no tone mapping at all — which also means the emitter's toneMapped={false} is redundant there and is not what protects it. Say so, or the next reader will treat that flag as load-bearing.

The consequence: as intensity rises, the on-screen core desaturates toward white while the bloom stays saturated navy. That is Carl's stated model arriving for free — D-090: "the core is near-white; the colour lives in the glow."

Two things follow and both belong in D-093: it is intentional, and it means core and glow cannot be matched by one number — ?neonca= and ?bloom= are not two views of a single dial.

---

## ⛔ F11 — D-090's §5a paragraph goes stale the moment this is built

It records, as an untested prediction:

> "selectivity must come from the neon exceeding 1.0 against a threshold the unlit, toneMapped={false} plate cannot reach; tone mapping moves into the composer, so bloom at intensity 0 must be pixel-identical to today."

The neon-only route retires the first clause outright — there is no threshold, because the bloom's only input is the two emitter meshes — and inherits the second, which is the identity gate. D-093 must say which half is answered and which is carried, with a forward pointer on D-090. This is D-074's failure mode, and the handoff records it firing three times in the last chunk alone.

---

## ⛔ F12 — the comment sweep reaches into a locked file

The plan names two stale copies in about-card-mesh.tsx (:1014, :1051) and says "grep the whole file". I grepped the repo. There are three more, and they are in about-card-glass.ts, which is protected:

    about-card-glass.ts:91   colours are ruled, none chosen.
    about-card-glass.ts:468  The four neon colours are
    about-card-glass.ts:469  ruled to be four and all different; **none is chosen.**

So "No protected file is touched, so no unlock is needed" is not true of the plan's own amendable-comment obligation. decisions.md is already marked superseded in all four places; the code is not. Either Carl names about-card-glass.ts for an unlock — which the handoff already anticipates for the GLASS_COLOR tint question — or D-093 records the three copies as knowingly left, with a pointer. Silently leaving them is the failure context-rules.md records twice: "the partial sweep left a fourth and then a fifth."

---

## ⚠ F13 — RIM-DARK is the ignition's first frame

Correctly scoped out. It should also say what that costs the verdict: the track starts at level 0, and level 0 is a state with an open defect — at grazing angles the rim reflects ENV_SHELL_COLOR #141a20. Checkpoint 2 therefore judges a stutter that begins in a known-defective frame. Not a blocker; one sentence in the checkpoint request, so Rule 7's "record the verdict at the level it was given" is actually possible.

---

## ⚠ F14 — four small ones, each cheap now and expensive later

- layers is not a number. `<mesh layers={NEON_LAYER}>` does nothing useful — R3F expects a THREE.Layers instance. Set it in a ref callback. Get this wrong and the emitter draws in the base pass, showing as a flat navy rim — which reads as "the emissive is too strong", not "the layer is wrong". That is a whole tuning session lost.
- MipmapBlurPass needs initialize() and setSize(). With no setSize the mip chain has zero extent and the bloom is silently absent. Resize handling and dispose() on unmount are not in the plan.
- Make neon require glass. The rim's meshPhysicalMaterial only exists in the glass branch (about-card-mesh.tsx:1016). CA/CB both pass glass, so it works today — but neon without glass would silently do nothing, and the failure would look like a dead constant.
- Version headroom is zero and unasserted. postprocessing@6.39.3 declares peerDependencies: three ">= 0.168.0 < 0.186.0"; the project pins three: "^0.185.1" → <0.186.0. They align exactly. The plan's "covers three versions up to 0.186" is right but reads as slack, and there is none: the next three minor breaks the peer range. One line in the file.

---

## What must not change

D-089's values and about-card-glass.ts locked unless Carl names it (F12) · the stand-in rig, key 0.5 / mirror 2.6 / ambient 0.20 · the backplate and the deliberately unrepaired right band · CD and CS untouched · one WebGL context on /about.
