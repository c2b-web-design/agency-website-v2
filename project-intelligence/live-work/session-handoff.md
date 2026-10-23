# Session Handoff — 23 October 2026. FILM 4: THE ARCH RE-TRACKED, THE WALLS SMOOTHED, BRUSHED BRASS ON THE LINE. NEXT: THE ARCH's MATERIAL.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 22 October session 2's.

---

## ⛔⛔ NEXT SUBJECT — "SESSION 2 AND THE ARCH MATERIAL" (Carl)

**The same brushed brass on "Your company logo" (the arch).** Carl: *"2 different elements with the same material that will
differ with the use of light and movement."* **The line is STATIC (lettering and light); the arch gets a ROVING LIGHT and is
ANIMATED** — ⚠ how it animates is NOT yet described, and the light and movement are PASS 3's, not this one.

**Process:** Carl ran pass 2 on the line as discussion → plan (Plan Mode) → the Architect (Carl pastes; the Builder transcribes)
→ approval → build in steps, each shown. ⚠ Whether the arch's material needs its own plan round is **Carl's to say** — ask.

**What the arch needs that the line did not (the Builder's reading, for the plan — not ruled):**
- The arch's letters are SEPARATE meshes, each `glyphGeometry` placed by `layoutArch` (the line is one merged geometry). Three's
  groups are native there (materialIndex 0 face, 1 sides) — a `[face, edge]` material array works per mesh.
- **One sheet of grain:** each arch letter's face UV must be offset by its PLACEMENT (x, y) — today the arch letters keep
  three's per-letter UVs. ⚠ Whether the grain runs as one horizontal sheet across an arch, or follows the curve, is a
  design question for Carl.
- The bench's material mode currently shows the arch in CLAY with a note (`showcase-bench.tsx`).
- The studio's 305° and the face roughness / strength were measured for the LINE's framing — the arch is tall (690 × 858);
  re-measure balance for it rather than inherit.

## WHAT HAPPENED

| | what | verdict |
|---|---|---|
| Take 6 | "company logo" on the half-circle, as-is (no code) | led to Carl's form |
| Take 7 | the ROUND-HEADED arch: upright legs, a half-circle over, equal closest distances, feet level by construction; radius 1.8 em, spacing 0.2 em | **R-090** *"This looks good"* — `8876617` |
| Take 8 | the faceted side walls CREASED at 10° (measured: curve facets ≤ 7.5°, corners ≥ 30°, chamfer 45°) | **R-091** *"This looks better"* — `88e1c3c` |
| Pass 2 plan | v2.1, four Architect rounds; tone mapping NEUTRAL as a **judging choice only** (Carl) | approved |
| Steps 0–2 | baseline; the dials proven; brushed face / polished edge split by `materialIndex` | `ca380be`, `1ebadf6` |
| Steps 3–4 | the grain (one sheet); face 0.13 / edge 1 strengths; perspective front; the reflection centred (305°) and widened (roughness 0.5) | *"a lot better, more balanced"* — **NOT approved**: *"We wont really get the full effect until we get it in a viewport and light it up"* |

Records: D-088's 23 October entries (every measurement), R-090, R-091; plan `live-work/film04-pass2-material-plan-23-october.md`;
Architect transcription `live-work/architect-plan-response-film04-pass2-23-october.md`; scripts `live-work/scripts/film04-*-23-october.*`;
baseline `live-work/shots/film04-pass2-baseline-23-october/` (20 frames — `film04-pass2-baseline-23-october.mjs compare`).
Film: `Videos\C2B Films\04 Extruded lettering\` — `03 Pass 1 - Mesh` (take6–8), `04 Pass 2 - Material` (step1–step4 take4).

**Switches:** `/proto/showcase` default = the arch (take 7/8); `?layout=line&mode=material` = the brass; `?form=half&arch=company&nudge=P:0.11`
= take 5; `?crease=0` faceted; material dials `?strength= ?estrength= ?froughness= ?aniso= ?anisorot= ?grain= ?grainem= ?tone=`;
studio `?yaw= ?room=`; `?cam=az,el`; `?probe=mirror` (an instrument).

## OPEN — with owners

- **Pass 2 on the line: not approved** — waits for the viewport (the two-viewport layout — STRUCTURAL, §5a note before
  building) and the light (pass 3) — **Carl**.
- **The line's light (pass 3):** a NEAR light (a picture light) was raised for the static line — RAISED, not ruled. The arch's
  roving light and its animation — undescribed. The page's tone mapping — pass 3's (the corners' gold was approved under ACES). — **Carl**.
- ⚠ **Every material value is "set under Neutral, judging"** (Architect C1) — re-check if pass 3 is not Neutral.
- **Flag only (Carl):** `components/about/about-card-glass.ts:491` records anisotropy as *"NEEDS A tangent ATTRIBUTE"* — on three
  r185 with UVs it does not (proven on this geometry). Outside this chunk; not edited.
- Carried: sending the bench link vs `app/robots.ts`'s 28 July position (Carl); `/proto` must stay noindex at launch; the
  structural note `structural-note-viewer-on-about-21-october.md` to amend (Builder); Send after the films' edit; the films'
  hosting; `neon-bloom.tsx` re-arm; phones in mastering (D-094).

## ⚠ STANDING / LESSONS FROM THIS SESSION

- **A written prediction is TESTED, not picked — and a test can be confounded.** The brushing's direction: the first reading
  "failed" the prediction, a re-run flipped it (the sweep had chosen its yaw at the default rotation, which had just changed), a
  mirror probe was inconclusive. Three's IBL anisotropy BENDS THE NORMAL (`envmap_physical_pars_fragment.glsl.js:52–56`) — it
  SHIFTS the reflection, and a gradient statistic measures BLUR. Settled from source + the probe's direction of swing; recorded so.
- **A harness must not take its operating point from the value it is testing** (the sweep above).
- **Clipping share is the reading; a mean over a thresholded pixel SET is not** (the set changes with the brightness).
- **An orthographic front makes a flat mirror face one colour by construction** — a bench artifact; material mode is perspective.
- **The grain's map doubles roughness — 0.5 is the face roughness ceiling** while the grain is on.
- Carl: *"the brushed effect really comes alive on the bevel"* — the bevel is the POLISHED material (no anisotropy); what lives
  there is curvature sweeping the softboxes. Read "more like the bevel" as polish and curve.
- Scope OPEN (Carl: keep open until asked to lock and test): `scripts/check-typeface-overlaps.mjs`,
  `components/showcase/lettering-geometry.ts`, `showcase-bench.tsx`, `lettering-material.ts` (named 23 October),
  `app/proto/showcase/page.tsx`. Protected files untouched; `unlocked` empty.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Servers STOPPED** at the end of this session (port 3000 checked).

---

*Written 23 October 2026, end of session. Replaces 22 October session 2's.*
