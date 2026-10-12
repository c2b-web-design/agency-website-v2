# Claude Plan — the `Who we are` button, three passes (mesh → material → light)

**Builder, 12 October 2026. For the Architect's review at the plan-review gate (`handoff-protocol.md` §2.5), then Carl's approval.**

⚠ **How this gate is being run, stated plainly:** Carl has ruled that this build *could* bypass the gate, because every element is on record, but that it goes through it genuinely, because the build is also filmed as §3's first example (D-088, 12 October, *"TWO TASKS"*). **The review is real. Findings change the plan.**

## Task

Rebuild the home page's closing `Who we are` pill (`app/page.tsx`, `#contact`, → `/about`) as a Three.js button, the second member of the site's button family. **Two tasks** (Carl): build it, and capture how it was built for the film in §3, box 1.

Three passes, each approved by Carl's eye before the next (the desk mark's process, D-088 7 October; Next step's, D-030):

1. **Mesh**: the shape in clay on a test page. *This plan's detail is for pass 1; passes 2–3 are outlined so the structure is reviewed once.*
2. **Material**: teal metal #1FB2C4 on a designed reflection studio (the desk mark's method, R-035).
3. **Light**: a global base light for form, plus ONE slow moving light across the sides and front.

Then the rollout onto the home page, which is structural (see Q2) and stops for its own decision.

## Context read

`decisions.md` D-088 (27 Sep, 10 Oct, 12 Oct entries: the film, the size, the light, the family, the two tasks), D-030–D-032 (Next step), R-034/R-035 (the desk mark's clay and metal passes); `nextstep-geometry.ts` (LOCKED); `nextstep-canvas.tsx` (`usePillGeometry`, `useChromeEnv`); `app/proto/nextstep/page.tsx`; `components/about/logo-bench.tsx` (clay mode, renderer parity); `app/page.tsx` L425–495 (the section and the pill); CLAUDE.md §5a/§5b; §14a.

## Settled inputs (Carl)

| | |
|---|---|
| Geometry | Next step's profile exactly: crown 8.5, plateau, groove, 41 high |
| Width | The label's: "Who we are", 14px/600, `padding: 10px 24px` (Next step's box rule). Estimate ~129 px. **Measured, not derived** |
| Colour | Teal #1FB2C4 (`brand-assets/images.jpg`, one of four brand colours) |
| Material | Metal on a designed studio, the desk mark's method |
| Light | Global base for form + one slow moving light, sides and front. Path (pendulum or shaped loop), speed, hover: takes for the bench |
| Not in this build | `/about` §4 `Start a conversation` (later); Next step's redo (after this) |

## Proposed approach — pass 1 (mesh, in clay)

- **A new test page `/proto/button`**, ground `#0a0a0a` (`bg-neutral-950`, the section the button lives in). A bench, not a route anyone ships.
- **The box is measured live:** a DOM span with the real label, type and padding; its rect sets `w × h`, and the mesh builds to it, as Next step's does (*"MEASURE, DO NOT DERIVE"*). The measured width is reported against the ~129 estimate.
- **The geometry is Next step's height field**, `crownHeight` and the `NEXTSTEP_*` profile constants imported unchanged from `nextstep-geometry.ts` (read, never edited). Where the builder itself comes from is **Q1**.
- **Clay:** mid-grey, matte, metalness 0, a raking key and a soft fill, as `logo-bench.tsx`'s clay mode, with renderer parity kept (ACES, sRGB, antialias, DPR 1–2).
- **Views for judging, and for the film:** face-on at real size; 4× zoom; raking light from the left and the right; a slow tilt showing the dome's depth (bench only). **Next step's pill in clay beside it at its own width**, to show the family is one profile.
- **Capture:** a script in `live-work/scripts/` writes stills (1440×900 and 4× crops) and a short webm of the tilt straight into the film folder `03 Pass 1 - Mesh`, logged in `shot-list.md`. Every take is kept, approved or not.

## Passes 2–3 and the rollout — outline only

- **Pass 2:** `MeshPhysicalMaterial`, metalness 1, base colour teal, on a studio env designed for the pill (`useChromeEnv`'s method; the desk mark's `LOGO_JUDGING_STUDIO`). Judged on the same bench, in the same views.
- **Pass 3:** the global base (the studio and an ambient level) plus one moving directional or spot light on a slow path; pendulum and loop both shown, Carl chooses. Hover deferred to the bench.
- **Rollout:** the button into `#contact`, the DOM `<a>` kept as the real link (focus, keyboard, screen reader), the mesh behind it. **Stops at Q2.**

## Structural contract

- **Existing values/components modified:** none in pass 1.
- **New layers/objects added:** the `/proto/button` page and its bench component; one WebGL canvas, on the test page only.
- **Coupled values that must stay coupled:** the profile constants (one source: `nextstep-geometry.ts`); the box rule (padding 10/24, 14px/600) between the two family members.
- **Approved layers that must not change:** Next step (D-030–D-032; `nextstep-geometry.ts` LOCKED; `nextstep-canvas.tsx` untouched in this pass); the home page (`app/page.tsx` LOCKED); the white pill stays live until the rollout.

### ⚠ Q1 for the Architect — the family's geometry source (§5a: "a second source of truth" / "a new mechanism where an existing one could have served")

`usePillGeometry(w, h)` is **private to `nextstep-canvas.tsx`**, an approved component. The family needs it twice.

- **A. Extract it** to a shared module (a pure `buildPillGeometry(w, h)`), and switch Next step to import it. One source now. **Cost: an edit to approved work** (`nextstep-canvas.tsx`) inside a build that isn't about Next step, needing a byte-identical buffer check to prove nothing moved.
- **B. A family module used by `Who we are` only; Next step keeps its private copy until its redo** (Carl: it *"will be redone"*), then migrates. **Cost: two copies for a while.** Mitigation: a script asserting both produce identical position, normal and index buffers at the same `w × h`, so the duplication is checked, not remembered.
- **C. Export the hook from `nextstep-canvas.tsx`.** Rejected: it couples the new button to a 1,659-line component carrying Next step's mount tracing and its studio.

**Builder recommends B**: no edit to approved work now, and the copy is asserted rather than trusted. A is the better end state and is what B arrives at when Next step is redone.

### ⚠ Q2 — the rollout (not pass 1; flagged so the shape is known now)

The home page's **first WebGL canvas**. Next step's worked case (§5a case 2) is the warning: a canvas inside a keyed subtree built a new context on every step. **Proposed:** one canvas sized to the button, a child of `#contact` with the page's lifetime, never keyed; the moving light means continuous frames, so it renders **only while the section is on screen**; contexts on the home page: **1**, counted when built. Needs `app/page.tsx` unlocked by Carl. **Decided at the rollout, not now.**

## §5b — what the white pill provides today, and how each survives the rollout

A real `<a href="/about">` (kept: the mesh sits behind the DOM link); keyboard focus and its ring (kept, with Rule 8's states checked); hover `bg-neutral-100` (replaced by the bench's hover, Carl's); its pairing with `/about` §4 (knowingly out of step until that button is done, recorded); the section's centring and `mt-10` spacing (the box changes ~137×44 → ~129×41; checked by eye at the rollout).

## Files expected to change (pass 1)

- **New:** `app/proto/button/page.tsx`; `components/home/whoweare-bench.tsx`; per Q1-B, `components/ui/button-family-geometry.ts` and `live-work/scripts/family-geometry-parity.mjs`; `live-work/scripts/whoweare-pass1-capture.mjs`.
- **Read only:** `nextstep-geometry.ts`, `nextstep-canvas.tsx`, `logo-bench.tsx`.
- **Record:** `decisions.md`, `reviews/review-log.md`, `active-sprints/current-sprint.md`; `live-work/chunk-scope.json` **replaced** (it still names the desk mark's chunk and is active). Its widening is Carl's word.
- **Outside the repo:** the film folder.

## Stop conditions

- Any edit to `nextstep-geometry.ts` or `nextstep-canvas.tsx` (under B there is none).
- Any change to `app/page.tsx`, or any canvas on a shipped page, before Q2 is decided.
- The measured width far from the estimate: report it, don't tune it.
- The parity script failing: the two copies have drifted, so stop.
- Lint above `1 problem (1 error, 0 warnings)`, or `tsc` not clean.
