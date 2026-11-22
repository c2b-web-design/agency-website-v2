# Session Handoff — 22 November 2026 (Sunday), session 3. SCHRÖDINGER'S CLOTH COMPLETE: FOUR PASSES BAKED IN, THE CLOTH RISES FROM THE FLOOR, THE WEB FLOOR SHRINKS, THE LOGO DRIES TO GOLD — NEVER SEEN TO CHANGE

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"PASS 2 IN ONE MOVE; GOOD CONTACT BOTH WAYS; THE CLOTH ENDS AT −75"* to the
end; reviews **R-111** (passes 1–4 approved), **R-112** (the passes baked in, the arrival), **R-113** (the gold, *"Thats got
it"*). Session ended on Carl's word: *"stop the capture. Compaction is at 40%. Wtire a handoff then commit and push."*

## ⛔ NEXT SESSION — NOT YET SET BY CARL

Phase 3 (Schrödinger's cloth) is built end to end. **Ask Carl for the next subject.** Candidates on record, none chosen:
the cloth's colour judged against the gold (C #2E3FC8); what happens after the gold (the end of phase 3, Gandalf's
fireworks — 2 s of c, 2, b — on record since 16 November); **the camera direction (phase 5)** — Carl's order: finish the
hero → camera direction → the hero on the site → film 3's edit → the four films on the site → Send → mastering.
**Target 1 December 2026.**

## THE STORY AS IT NOW PLAYS (nothing pressed; `/proto/hero`, frame-stepped times)

- **32.7 s** the cloth wakes (1 s after the last code drop) — it LAY FLAT ON THE FLOOR, 250 cm back, asleep (not drawn,
  not stepped); it rises AND comes forward together, one eased 3 s move, its pins to −60 (`clothArrival`).
- **35.7 s** it arrives; a **2 s beat**; **37.8 s pass 1**; each next pass once the logo has stopped wobbling (`passesAuto`):
  pass 2 45.6, pass 3 56.8, pass 4 68.1, all settled **75.4 s**.
- **The web floor** shrinks an eighth after each of the 8 contacts (each action's landing, eased 1.5 s), gone after the
  eighth (`floorDry`).
- **The gold** (`hero-dry.ts`, new; the logo's colour in `hero-scene.ts`): AUTHORED regions — pass 1 the top third, 2 left
  of 0.42 (where the c meets the 2), 3 right of 0.6 AND the 2's upper middle (above 0.3 of the height), 4 the 2's lower
  part; the FRONT and BACK apart, each side by its action (pass 1 the back on the jump back, the face on the jump home;
  passes 2–4 the face in the swivel/flip, the back after the return); ⛔ **each side dries ONLY WHILE TURNED AWAY from the
  live camera** (`dryHidden`; pass 1's face only while the top is inside the cloth, 0.15–0.6 of the jump home). The border:
  `smoothstep(0.15, 0.75, dryness + noise × 0.25)` — Carl: *"fantastic"*.

## ⛔ STANDING — CARL's (new today)

- ⛔ **"The user must never see the transition happen."** No frame may show blue turning gold. Checked from the FRONT camera
  only; re-check when the camera is directed (phase 5) — the gating reads the live camera, so it should hold, unproven.
- **Accuracy is not the point; the effect is** (*"no one is measuring"*) — but *"by action alone we will infer"*: a change
  must be where the action could have caused it (no "magic cloth").
- **Every pass value is APPROVED (R-111) and read-only on the bench.** A tweak to a pass now reopens an approved layer: ask.
- Carried: target 1 December; name the files and ask before the first code edit, every session (the hero files open in
  `chunk-scope.json`, `hero-dry.ts` added today, `_dry22Nov`); a question is answered, not built; contact must be real from
  every angle; gravity serves the look.

## OPEN — CARL's

1. **The next subject** (above).
2. **The cloth's arrival timing** — a TAKE (`clothArrival`: lies back 250 cm, delay 1 s, 3 s): to be set against the camera's
   pull-back (Carl's cameras A 206, −269.5, 587.7 and B 238.3, −402.2, 571.6, both → 468.9, −201, −37.9, fov 45).
3. **The back face** reads near-black from behind (the logo's lights are in front): its gold has not been judged by eye.
4. **Carried:** the cloth colour C at the gold; how/when the cloth LEAVES; the plinth brainstorm; Gandalf's fireworks; the
   floor's notes ([R5][T1][R6][R7], `heatPlane`); the untracked `structural-note-code-drops-20-november.md` (keep or delete);
   the frame cost of the whole phase (D-108, not measured).

## LESSONS (today)

- **Measure the cause before tuning the lever.** Route 2 (a faster cloth) was measured to do nothing: the return's poor
  contact came from the drape's RELEASE swing, found only by a timeline harness (`hero-pass2-return-timeline-22-november.mjs`).
- **A conserving spread drains what it spreads.** The gold's first spread (heat's Laplacian) leaked pass 1's top back to
  blue; drying is one-way (`max(lap, 0)`), and then was replaced by authored regions anyway.
- **Physical isn't always the brief.** Carl wanted the EFFECT of contact, authored per pass, not the measured contact.
- **The overview sheet can mislead.** Motion and the frame's edge read as colour change at 2 fps; close frames decided it.
- **A harness's own defaults go stale with the story:** `hero-pass1-backward-20-november.mjs` no longer measures the story
  (its 1 s beat; `cloth.again` now lays and raises the cloth). Use `hero-pass1-contact-22-november.mjs`.
- **The dev server WAS current** when two films looked alike; check the served object (`window.__heroBench.hero`) before
  blaming it.
- Carl's PC: a hard hang while casting to the TV (the Realtek card, `WLAN-AutoConfig/Operational`); Lenovo has no newer
  driver (Carl checked) — memory updated.

## STATE

- **COMMITTED AND PUSHED** with this handoff (after `5181aab`). Lint at the baseline (1 error, 0 warnings); tsc clean; the
  clean-checkout build passed.
- **The screen capture STOPPED:** `03 The hero\01 Discussion\2026-11-22_discussion_screen.remux.mkv` (4:44:12; raw kept).
- **The dev server is UP** (port 3000).
- Films today (`03 The hero\`): `2026-11-22_pass2-*`, `…_pass3-mirror_take1`, `…_pass2-3-landing-lean_take1`,
  `…_pass4-*`, `…_cloth-arrival_take1/2`, `…_floor-dries_take1`, `…_gold-dry_take1–8`.

---

*Written 22 November 2026, session 3.*
