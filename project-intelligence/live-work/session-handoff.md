# Session Handoff — 26 October 2026. FILM 4's PAGE BUILT, VIEWPORT 1 APPROVED; CARL LEARNING THREE.JS; THE HERO IS ALL CODE. NEXT: THE ARCH.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 23 October's (the
session ran 23 October → 26 October with a break; the 23 October handoff was read at its start).

---

## ⛔⛔ NEXT SUBJECT — VIEWPORT 2: THE ARCH, "YOUR COMPANY LOGO" (Carl)

On `/proto/your-words` the arch is lit by the JUDGING STUDIO ALONE (305°/355° — `JUDGING_STUDIO`). Carl's line for it, all
that is on record: *"Travelling light with logo animation."* **Neither the light's path nor the animation is described —
ask Carl to describe it, verbally AND technically** (he now wants to talk in technique — see LEARNING below). Put to him
last time, unanswered: where the light travels / its pace / loop or one pass; what the logo itself does; a stage base under
it (as viewport 1) or the travelling light alone.

**What the Builder can offer when he asks (not pitched):**
- **The brick grain was built for a travelling light** — anisotropy stretches highlights along each letter's grain, and every
  letter's grain points a different way (radial over the head, horizontal on the legs), so a light following the curve should
  catch the letters IN TURN. A prediction from the shader, untested.
- **The collapse** — RAISED, NOT CHOSEN (D-088, 26 October): held (kinematic) then released (dynamic), the keystone N first;
  baked (reversible, the scroll plays it) or live (forward only). Physics on a page is §5a.
- Viewport 1's method, which Carl set and approved: **get one element right, then bring the others up slowly, one variable
  at a time** (the wings first, the front pair brought up under them — R-092).

## WHAT HAPPENED

| | what | verdict |
|---|---|---|
| Arch material | the line's brass on the arch, the grain laid as BRICKS — one direction per letter, horizontal on the legs, the radius over the head, the crown N vertical; studio 355° for the arch (lintel measured as the lost band at 305°) | *"It looks good"* — not approval — `8ddb2ec` |
| The page | `/proto/your-words`, "Your words, given form": two viewports, a canvas per viewport (structural note v2, option A, built on *"Build it now"*); the bench's measuring/build LIFTED to `lettering-hooks.tsx` (24/24 bench frames identical); `JUDGING_STUDIO` + `frontDistance` shared; no-WebGL fallback via `webglcontextcreationerror` | built |
| Viewport 1 | the line in the upper third (moved in the world); STAGE LIGHT: the WINGS pair (x ±0.9, y +0.35, z +0.15 of the word width, intensity 3) as base, the FRONT pair (McCandless, 30° off centre, 45° up, 1.5 widths) at 0.5 | **R-092 APPROVED** — `e8aeda6` |
| The hero | ⛔ **D-101: THE HERO IS BUILT ENTIRELY IN CODE** — the film plan superseded as MEDIUM (the wipe survives as an idea, in code if needed — R-036's crossing is already one) | Carl's decision |

Records: D-088's 23 Oct session-2 entries (the arch, the lift, the page, the lamps), R-092; D-098 (the camera "game changer",
the reverse angle), D-101; structural note `live-work/structural-note-showcase-two-viewports-23-october.md` (built).
Scripts: `live-work/scripts/film04-*-23-october.mjs` (arch balance, lift compare, page check incl. `nowebgl`, lamps sweep,
stills), `look-threejs-example-26-october.mjs` (screenshots any URL). Film: `Videos\C2B Films\04 Extruded lettering\`
— `04 Pass 2 - Material` (arch takes), `05 Page - Two viewports` (takes 1–4, fallback).
**Switches:** `/proto/your-words?wing= &front=` (the two pairs' intensities). The bench `/proto/showcase` unchanged.

## ⛔ LEARNING AND TECHNIQUES — CARL's NEW FOOTING (26 October; memories saved)

Carl: *"going forward i have to learn more about threejs and webgpu. From a design perpective its important to have
choice."* He spent ~3 months in **Unreal Engine** before AI (knows materials and meshes); watching **Bobby Roe**'s YouTube
(@robotbobby9; code at github.com/bobbyroe — read the repo when he cites a video). ⛔ **STANDING: when presenting bench
parameters, say what each IS physically, what it does, its cost, and its UNREAL equivalent** — *"its important i know the
functionaly. Not just move sliders and see what happens."* *"Coding is and always will be your department."*

Covered in the session (so not re-explained cold — build on it): **clearcoat** (two-layer reflection; the corners already
use it; LACQUERED BRASS is a material option for film 4, not proposed); **WebGPU / `three/webgpu` / TSL** (the material code
carries across; our three 0.185.1 has it, latest 0.186.1; gain = compute: particles, simulation); **matcap vs PBR texture set
vs HDRI** (matcap ignores the scene's lights and follows the camera — wrong for the brass); **material libraries**: Poly
Haven (CC0, ours), ambientCG (CC0, unchecked), `nidorx/matcaps` (NO LICENCE — bench only), licence before client use;
**Rapier** (rigid-body physics, WASM, Apache-2.0; BAKE vs LIVE — the desk mark's fall is a baked sim); **Babylon.js** (an
engine vs three's library; Node Material Editor ≈ Unreal's; mix engines at the ASSET level via glTF, never in one scene);
**quaternions** (one turn about one axis; slerp takes the SHORTEST way — turns > 180° need waypoints); **generative art**
(rules + seed + noise + palette; Bobby's grid and mandala — InstancedMesh, `Matrix4.compose`, HSL stepping); **cameras**
(orbit, path, scroll-driven, CUTS between several, blends, the DOLLY ZOOM — `frontDistance` is its formula; a photo/video
backdrop LOCKS the camera, all-code frees it).

## OPEN — with owners

- **Viewport 2 (the arch): light and animation undescribed** — Carl.
- **The hero (D-101): to be designed** — camera language and triggers Carl's; the build is §5a (structural note first).
  Brainstorm on record in D-098: the logo's 19 October behaviour, the camera, the REVERSE ANGLE (six requirements listed).
- Pass 2 on the line and on the arch: positive verdicts, not approved on their own; viewport 1 approved under the light (R-092).
- ⚠ Every material/light value set under NEUTRAL tone mapping (a judging choice); the page's tone mapping not ruled.
- **Flag only (Carl):** `components/about/about-card-glass.ts:491` says anisotropy "NEEDS A tangent ATTRIBUTE" — untrue on
  three r185 with UVs (proven on film 4). Not edited.
- Carried: sending the `/proto/your-words` link vs `app/robots.ts`'s 28 July position (Carl); `/proto` noindex at launch;
  `structural-note-viewer-on-about-21-october.md` to amend (Builder); Send after the films' edit; the films' hosting;
  `neon-bloom.tsx` re-arm; phones in mastering (D-094).

## ⚠ STANDING / LESSONS FROM THIS SESSION

- **Carl's lighting method:** start from the element that is right, bring the others up slowly, one variable — and cut the
  dials to one per element. Theatre vocabulary lands with him (wings, front of house, McCandless).
- **The McCandless 45° did not balance on a perspective metal face** — measured; 30° did. A textbook value is a hypothesis.
- **R3F's renderer setup fails OUTSIDE React** with WebGL disabled (the `Guard` never sees it; it retries every render) —
  `webglcontextcreationerror` in the CAPTURE phase is the net. Reuse it on any new canvas.
- **sed with `\n` in a replacement wrote a literal newline** into a script (26 Oct) — the shell-text hazard again; use Edit.
- **"I read the frame as X" needs measuring before it goes in a record** — the arch's "dark legs" were measured false.
- Scope OPEN (keep until Carl asks to lock and test): `scripts/check-typeface-overlaps.mjs`, `components/showcase/*`
  (geometry, bench, material, hooks, section, canvas), `app/proto/showcase/page.tsx`, `app/proto/your-words/page.tsx`.
  `components/home/corner-canvas.tsx` gained two EXPORTS only (`whenLinked`, `usePrefilteredStudio`). Protected files untouched.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Server STOPPED** (port 3000 checked free).
- ⚠ **NOT COMMITTED at writing:** `decisions.md` (the collapse, D-098's camera/reverse angle, D-101),
  `live-work/hero-fusion-spec-15-october.md` (superseded notice), this handoff, `look-threejs-example-26-october.mjs`.

---

*Written 26 October 2026, end of session. Replaces 23 October's.*
