# Session Handoff — 19 August 2026 (late). Zero admissible harnesses, honestly.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO CONTROLS BLOCK BY DEFAULT. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> **25 paths** in `.claude/protected-files.json`, locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md`, `verify/proven.json` and `verify/run.mjs` are among them.** Changing any needs
> Carl naming that exact path under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder,
> never a glob. **Remove the unlock when done and re-verify the path locks again** — `chunk-scope.json`
> is gitignored, so a session ending with unlocks live leaves the next one with protected files
> quietly writable and no denial to reveal it.
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **`node verify/x.mjs` is DENIED on the Bash tool.** Use **`npm run verify -- <script.mjs>`**.
> ⚠ It also catches `node --check verify/…`. Reading is untouched — `cat`/`grep`/`ls` are fine.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both
hooks run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What
catches a shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

---

# ⚠⚠ THE PROJECT HAS ZERO ADMISSIBLE HARNESSES. 0 OF 130.

**`reveal-stall.mjs` was the one, and is now UNPROVEN** — its `observedSpread` is **deliberately
null**. A verdict now needs THREE things: a recorded **red run**, an **empty-input control**, and a
declared **subject stability** — with an observed spread for anything that varies.

⚠ **`⚠ NO VERDICT` on everything is the HONEST STATE, not a fault.** Nothing in `verify/` can
currently be cited as evidence. Do not read a green line as a pass.

## THE OPEN FAULT THAT CAUSED IT — a lead, not a mystery

**5 films on build `2026-08-19T21-37-45` reported 0ms on ALL FIVE runs.** The films are good: the
reveal resolved at **1240–1280ms against a declared 1300ms**, so the window found the reveal. ⚠ **It
is the FREEZE INSIDE that window that does not resolve.**

⛔ **The batch-sort defect was fixed (`e140743`) and did NOT cause it.** Re-measuring the SAME films
after the fix gives an identical result, and the stale directory reports 0ms too — both agree, and
neither explains the other. **So `reveal-stall.mjs`'s band, tolerance or window is a SEPARATE open
fault, untouched by this session** — and it is what stands between the project and its first
admissible harness. ⚠ Recording `0-0ms` as a spread would be the quiet zero requirement 2 exists to
prevent, which is why the entry stays unproven.

---

## THIS SESSION'S COMMITS — FOUR, on `fix/q5-stall-and-label-colour`

**Head `302b05d` at the time of writing. Tree clean, pushed, verified by `git ls-remote`.**

> ⚠ **THE HEAD SHA HERE IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -6`. Do not trust this line.**

```
5f43f15  feat  the single-run rule — a sample count, not a command typed twice
e140743  fix   pick the batch by when the films were shot, and say which
959ea69  feat  the evidence machinery joins the protected list — both halves
302b05d  fix   reveal-stall.mjs pointed at a door the front door denies
```

⚠ **`8ff107f` and earlier are from the PREVIOUS session**, already covered by the handoff this one
replaces. **Four, not six.**

---

## THE SINGLE-RUN RULE — what it actually requires

**Three samples in ONE INVOCATION**, read from the count the script itself declares and prints.

⛔ **NOT three invocations.** `reveal-stall.mjs` already takes five samples per run, and separate
invocations are separate batches — the script *aborts on a build-id change* because "runs across two
builds are not one distribution". A runner stitching three together would **manufacture a wider
spread than the subject has**. ⚠ **The rule is about the sample count behind the number, not how
many times the command was typed.**

**Three is fixed and deliberately NOT per-entry** — a per-entry minimum invites arguing an expensive
script deserves fewer, and that argument is always available to someone in a hurry.

**Cost of one verdict: ~2m 35s** (143s filming + 12s measuring).

---

## ⚠ PROVING A SCRIPT NOW NEEDS AN UNLOCK FROM CARL

`verify/proven.json` is protected, so adding an entry, fixing a stale `redRun` or filling in an
`observedSpread` is a stop-and-ask. **Cheap today** — one entry, currently unproven, proofs rare.

⚠ **THE TEST IS FREQUENCY.** If proofs become routine, the failure mode is **not a bad proof getting
in — it is PROOFS QUIETLY STOPPING**, which looks identical to a project with no instruments worth
proving. At that point the right instrument is a review gate on the diff, not a block on the edit.

---

## ⚠ 155 HEADER COMMENTS STILL NAME THE BLOCKED ROUTE

Across **129 of 130 scripts**. A reader following a script's own header hits a denial and has to work
out that **the file is wrong, not the hook**. We created that contradiction when the front door
landed. The two **printed** cases are fixed; **`corridor-motion.mjs:388` is a third** (`fix-mojibake.mjs:25`
is a usage line on a repair utility — a separate question).

⛔ **NOT A SWEEP. Carl's direction stands: a hook that checks text AS IT IS WRITTEN, not the 155 as
they stand.** They shrink as files are touched.

### The doc-route hook was STARTED AND STOPPED mid-falsification

**Reverted entirely and deliberately — nothing is on disk, nothing is registered.** Both hook files
deleted, the `settings.json` registration reverted, the two unlocks closed and re-verified.

⚠ **WHY REVERTED RATHER THAN PARKED:** cases (e) and (f) never ran, so there is **no evidence it
fails closed on a malformed matcher, and none that it leaves the other two hooks undisturbed.** A
hook registered but unfalsified is a control that looks installed and isn't — the exact defect
measured in `1c6c5a1`. What it did prove: cases (a)–(d) passed, including the one that decides
usability — **an unrelated edit to a file that already contains the direct form is ALLOWED**, because
it inspects only the text being written. A whole-file check would deny every edit to 129 scripts.

---

## ⚠ TOOLING FAULT — TWICE, AND IT WILL HAPPEN AGAIN

**Bash heredoc patches have silently no-opped, and have stripped regex backslashes** (`\d` → `d`,
which broke a live file-discovery regex). **Both were caught only by GREPPING THE RESULT.**

⛔ **A patch's success message is not evidence it applied.** Grep the file after every scripted edit.

---

# STILL OPEN

## Waiting on Carl's eye — FOURTH session running

- **Commit 3 — the opening/complete visibility gate.** ⚠ Carries **a chrome pill painted over the
  contact form.** Walk Q1 → complete, by eye AND by capture. ⛔ Do not bundle it.
- **The Next step button appearance verdict.** Shots at `live-work/shots/commit2-0{1..4}-*.png`.
  ⚠ **STILL NOT GIVEN.** Carl walked the build live on 19 August but did **not** state an
  appearance verdict. Do not read the observations below as one.
- **The corridor fix remains ON HOLD by Carl's decision.**

## ⚠ CARL'S LIVE WALK, 19 August, build `8527f17` — OBSERVATIONS, NOT APPROVALS

⛔ **NONE OF THIS IS AUTHORISED WORK. Nothing here is to be fixed.** Recorded so it is not lost;
Carl decides what becomes a chunk. No cause or fix is recorded, because none was asked for.

1. **No visible stall on the text reveal, by eye, on a current build.**
   ⚠ **This is an OBSERVATION, NOT the freeze being resolved.** It varies **40–640ms** on the
   record, so **one clean walk is not proof.** The band/tolerance/window fault above still stands.

2. **HOVER STATE, COSMETIC.** At rest the answer text is white and brightens as the light passes
   over — **as expected.** On hover the text turns **teal, but not strongly enough: only just
   distinguishable from the white.**

3. **TIMING, after Q1.** "Understood" and its subtext reveal and stay on screen while the q+a fades
   out; the four client-info cards then reveal sequentially in four beats. **"Understood" fades out
   a little late.** ⚠ **Carl's stated ideal: a FIFTH beat, on which "Understood" begins its fade,
   with the send button fading in after that.**

4. ~~⚠⚠ **THE ONE TO CARRY FORWARD.**~~ After several walks, some questions' reveal **"didn't feel
   right — not a stall, just wasn't looking as smooth."** **Intermittent** — present on some walks,
   not others. ⛔ **Carl is DEFERRING judgement to a fresh morning session** rather than deciding it
   late at night.

   > ### ✅ CLOSED 20 August 2026 — DIAGNOSED AND FIXED, and the reason is the useful part.
   >
   > ⛔ **NOT "could not be reproduced." NOT "went away."** It was **never a smoothness fault and
   > never a performance fault.** It was the symptom of a specific STRUCTURAL one:
   > **"Q5" was not being wiped at all.**
   >
   > **How it resolved:** Carl's frame-by-frame review of the 25fps films, **with the start-page
   > heading on the same frames as a control** — that heading wipes character by character, so the
   > absence on "Qn" could not be a sampling artefact. Recorded as **D-052**, implemented in
   > `d731c1c`. **Carl's verdict on the current build: it now *"feels like one phrase."***
   >
   > ⚠⚠ **A VAGUE OBSERVATION RESOLVED INTO A SPECIFIC CAUSE.** "Some walks don't feel as smooth"
   > was the only description available before anyone knew what to look for; it named a *feeling*,
   > and the fault was a *missing wipe*. **That is why it read as intermittent** — it depended on
   > whether the eye happened to land on the number.
   >
   > ⛔ **THE 60fps CAPTURE IS NO LONGER NEEDED FOR THIS.** It was proposed to turn a vague
   > observation into evidence. **The observation resolved without it.** Do not commission it for
   > this question — the question no longer exists.
   >
   > ⚠ **BUT THE 25fps INSTRUMENT LIMIT STANDS ON ITS OWN** and is NOT retired with this item.
   > Those films still cannot answer a smoothness question. See the section below, which is an
   > independent finding about the instrument, not about this observation.

## ⚠ CARL'S FRAME-BY-FRAME REVIEW, 20 August — OBSERVATION, NOT A VERDICT

⛔ **NOT AUTHORISED WORK. No cause is recorded, no fix proposed — none was asked for.**
Carl reviewed the `2026-08-19T21-37-45` films frame by frame.

5. ⚠⚠ **"Q5" IS ALREADY FULLY PRESENT ON PRESSING BEGIN.** There is no visible wipe across the
   Q or the 5. **The wipe appears to begin AFTER "Q5", on the question text.**

   ⚠ **THE CONTROL IS WHAT MAKES THIS SOLID.** On the start page, the heading *"Let's understand
   what your business needs to become."* wipes visibly character by character — the L is fast, but
   **the travel of the E, T and S is clearly visible**. **Same film, same capture rate, same
   build.** So the absence of a wipe on "Q5" is **NOT an artefact of the 25fps sampling**: a
   like-for-like comparison on the same frames shows the wipe where it exists.

## ⚠⚠ INSTRUMENT LIMIT FOUND THIS MORNING — THE FILMS CANNOT ANSWER SMOOTHNESS

**The site paints at the monitor refresh rate (~60fps, ~16.7ms per frame). The reveal-stall films
capture at 25.04fps (~39.9ms).** The films sample roughly **two frames in five**, and the clocks do
not align.

- ✅ **CAN show:** whether an element is wiping **at all**, and roughly **where**.
- ⛔ **CANNOT show:** the **smoothness** of motion. **A wipe that is smooth at 60 will look stepped
  at 25.**

⚠ **THIS MATTERS BEYOND TODAY: `reveal-stall.mjs`'s 0ms verdicts were drawn from these films, and
a 25fps film was never able to answer a question about smoothness.**

~~⚠ **Carl's observation from last night — some questions' reveal "didn't feel right, not a stall,
just not as smooth" (item 4 above) — is NEITHER CONFIRMED NOR REFUTED by this.** It remains open
and **needs a 60fps capture to be evidence either way.**~~

> ### ⚠ SUPERSEDED THE SAME DAY — the observation CLOSED without a 60fps capture.
>
> **The paragraph above was true when written and is now wrong on both counts.** The observation
> was neither left open nor settled by a faster camera: **it was diagnosed as D-052 — "Q5" was not
> being wiped at all — fixed in `d731c1c`, and confirmed by Carl's eye on the current build.**
> Full closure recorded at item 4 above.
>
> ⛔ **DO NOT COMMISSION A 60fps CAPTURE ON THE STRENGTH OF THIS PARAGRAPH.**
>
> ⚠⚠ **THE INSTRUMENT LIMIT ABOVE IS UNAFFECTED AND STILL STANDS.** The films sample two frames in
> five and **cannot answer a smoothness question** — that is a fact about the instrument, true
> independently of whether any particular observation needed it. **It is not retired by this
> closure**, and `reveal-stall.mjs`'s 0ms verdicts were still drawn from these films.

## Loose ends

- ⚠ **`reveal-stall.mjs`'s band/tolerance/window** — the open fault above. Report-only so far.
- **`verify/proven.json` is now protected**; `reveal-stall-measure.mjs` is not.
- **Open from the governance split:** a stored baseline still passes as a control; nothing counts
  contexts or canvases on a walk; only 9 of 130 harnesses declare what they do not watch.
- **`open-defects.md`** holds four live faults — the a11y fault, Q4–Q1 having no card entrance, the
  7.4s/10.1s opening delay (Carl's standing decision: first job when building resumes), and the
  stale anchor at `answer-card-canvas.tsx:1925`.

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree. `npm run build && npx next start -p 3100`.
- **Turbopack serves cached CSS failures.** Tell: a line number exceeding the file's length. `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — and check for a
  **LISTENING** socket specifically; `TIME_WAIT` entries are closed connections, not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **Q5's reveal begins ~7.8s AFTER Begin**, not ~2.5s.

---

*19 August 2026, late. **The gate now reports what is true: almost nothing here is evidence yet.***
*⚠ **That is the instrument working. The next session's job is the freeze that will not resolve.***
