# Session Handoff — 12 October 2026 (end). THE `Who we are` BUTTON IS ON THE HOME PAGE (static light). NEXT: DIRECT THE LIGHT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record: D-088's 12 October entries at the END of `decisions.md`; R-042, R-043 (`reviews/review-log.md`).**

---

## ⛔ WHERE THINGS STAND

**Committed and pushed at session end** (Carl: *"commit and push what we have so far"*). Lint `1 problem (1 error, 0 warnings)`;
`tsc` clean. Dev server STOPPED. The desktop recording STOPPED (see the film, below).

**The `Who we are` button — the second member of the BUTTON FAMILY — is on the home page** (`components/home/whoweare-button.tsx`,
the scene in `components/home/whoweare-button-scene.tsx`, the shape in `components/ui/button-family-geometry.ts`, the bench
`/proto/button`):
- **Pass 1, the mesh — APPROVED (R-042).** Next step's builder (parity with the live Next step proven by browser readback, and
  shown able to fail) with the FAMILY's own cross-section: the rim made smaller BY THE NUMBERS (6.6 px skirt → a ~3 px bead; the
  ivory Begin button's shadow stack as the reference). The family rule: same ends, same height (41), width from the label,
  the crown scaling with the height.
- **Pass 2, the material and label — APPROVED (R-043, "so far").** Teal #1FB2C4 as the metal's F0 in the pill's OWN studio
  (`PILL_STUDIO` — the desk mark's studio turned teal GREEN); the label ICE BLUE #cfe6ff (Carl overruled near-black), the face
  darkened so it holds **5.20:1 at the worst pixel**; the label EXTRUDED in three.js, 0.6 px, Geist SemiBold (new
  `public/fonts/geist-semibold.typeface.json`), placed where the browser draws it (0.03 / 0.44 px).
- **Pass 3, the light — STEP 1 BUILT:** one STATIC light from the right (70° off normal, 8° up, 2.5). ⚠ **Finding (put to Carl,
  settled "1"):** face-on, the label's extrusion CANNOT read at any depth (sides edge-on; a metal shows no shadow from a grazing
  light; a bevel greys the 1.5 px strokes) — 0.6 px, NO bevel; the depth reads in tilt and close-ups.
- **The rollout (structural note `live-work/structural-note-whoweare-rollout-12-october.md`, Carl: *"Structure is good. My word
  is good for this one."*):** a real `<a href="/about">`, the scene behind it, lazy (`next/dynamic`, `ssr:false`), `frameloop
  ="demand"`, the CSS fallback (teal pill, ice-blue words) until the letters are drawn / no WebGL / lost context. **Verified:**
  1 WebGL context on the home page; letters drawn; one link named "Who we are"; focus ring; fallback with no WebGL;
  `?lighthelpers=1` (a sun + a line). `app/page.tsx` used on Carl's named unlock, **RELOCKED and tested** (probe refused).

## ⛔⛔ NEXT SESSION — THE AGREED SUBJECT: DIRECT THE LIGHT (Carl: *"Final step is to direct the light."*)

The moving light, as Carl set it (D-088, 12 October): **starts TOP LEFT of the button aiming RIGHT; arcs OUTWARD to FACE-ON; ends
BOTTOM RIGHT aiming LEFT; LOOPED; fine-tuned in place.** Owed with it:
- ⛔ **The label's contrast measured along the WHOLE path** — ≥ 4.5:1 at every pixel at every moment (Carl: *"On the light
  motion"*). ⚠ With light ink on a dark face, the light's highlight crossing the words LOWERS contrast — at the arc's face-on
  moment its reflection lands on the flat top, behind the words. Its strength and spread must keep the worst ≥ 4.5.
  `whoweare-pass2-capture.mjs` measures a still; it must be extended to sample the path.
- **Frames:** the scene is `demand` today; a moving light needs frames → **gate them by `/about`'s existing visibility
  mechanism, not a new one** (structural note, point 6; §5a).
- **Reduced motion:** a RESTING position for the light (`useSyncExternalStore`, not set-state-in-effect — Architect point 6);
  the full pass stays with mastering (D-094).
- **Light helpers** (`?lighthelpers=1`) must follow the moving light.
- The static key from the right is step 1 — whether it stays as the "global" light under the moving one is Carl's.

## ⚠ OPEN — WITH OWNERS

- **Carl:** HOVER (none designed — the white pill's went with it); the button's push is DONE but nothing is judged "on the
  site" yet; `/about` §4 `Start a conversation` joins the family later (knowingly out of step); Next step is REDONE later in the
  platinum blue #3F6DB8 (the about logo's) on `FAMILY_PROFILE`; whether Next step's mesh was ever approved by eye (its header
  says PROTOTYPE; R-012–R-017 approved the CSS button).
- **Builder:** `overlap-check` (self-crossing outlines) not yet shown red on a known-bad font; a bevelled label would need its
  RENDERED letters measured, not ink-vs-metal (moot while no bevel).
- **Carried from 10 October (Carl's):** the desk mark's open points; the client info orbit description; the canvas cost on `/about`.

## ⛔ THE FILM — `C:\Users\Carl Buckley\Videos\C2B Films\01 Who we are button\` (§3, box 1: "how we built this button")

**Two tasks (Carl): build it AND show how we built it. ⛔ CAPTURE INDEPENDENTLY — Carl: *"A user mustnt see me messaging you with
'screenshot this, video that'"*; act without being asked.** Bins 00 References → 07 Subtitles; `shot-list.md` logs every file
(misses kept, marked); `07 Subtitles/subtitles-draft.md` runs to chapter 7 ("On the site") — voice "We", NO em dashes. Tools:
`live-work/scripts/film-snap.ps1` (a desktop still, logged); `whoweare-pass1-capture.mjs`, `whoweare-pass2-capture.mjs` (`BIN=`
for pass 3), `whoweare-home-capture.mjs`, `whoweare-home-verify.mjs`. Screen video: `ffmpeg -f gdigrab … -movflags
+frag_keyframe+empty_moov` survives a kill. ⚠ The 1 h 47 min recording `02 Plan and review/…_architect-review_screen.mp4` (340 MB)
covers 12:17 → 14:05 — the plan, the review AND every pass after; it shows Carl's own messages, which he will cut.

## ⚠ STANDING / CORRECTIONS THIS SESSION

- **`/doctor` done** (both seats): Claude Code 2.1.296; `npm install *` narrowed to `Bash(npm install)`; CLAUDE.md's lint history
  → D-096; Claude Docs + Google Drive disconnected here; the Vercel CLI logged in (`npx vercel inspect <dpl>` gives a failure's
  reason — the 12 October failure was Vercel's: "Git information retrieval failed").
- ⛔ **The `!` prefix does not run in the VS Code panel** — protected-file edits Carl authorises go via a checked script he runs in
  VS Code's terminal (memory). Unlocking via `chunk-scope.json` with the EDIT tool worked this session; via Bash it was refused.
- ⚠ **Builder errors caught and fixed:** overwrote the tracked `architect-plan-response.md` (restored from git; the new one is
  `…-whoweare-12-october.md`) — LOOK BEFORE WRITING a file that exists; a Python string turned `\01` into a control byte in
  `current-sprint.md` (fixed by byte value) — backslash paths in Python heredocs are unsafe; two groove-detector misses and a
  placement reading inflated by the light's glint — instruments re-checked before trusting a moved number.
- **Carl's process this session:** no plan needed in practice, but the plan + Architect gate RUN GENUINELY for the film (*"to show
  the process, we will go through it"*); the Architect: approve with 8 amendments + 3 corrections, all verified and taken.

---

*Written 12 October 2026, end. Replaces 10 October's handoff.*
