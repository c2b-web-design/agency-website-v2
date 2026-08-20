# Session Handoff — 20 August 2026. Three decisions, and three instruments that lied.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO CONTROLS BLOCK BY DEFAULT. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> **25 paths** in `.claude/protected-files.json`, locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md`, `verify/proven.json` and `verify/run.mjs` are among them.** Unlocking needs Carl
> naming that exact path under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder, never a
> glob. **Remove the unlock when done and re-verify the path locks again** — `chunk-scope.json` is
> gitignored, so a session ending with unlocks live leaves the next one with protected files quietly
> writable and no denial to reveal it.
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **`node verify/x.mjs` is DENIED on the Bash tool.** Use **`npm run verify -- <script.mjs>`**.
> ⚠ It also fires on a `grep` whose *search string* contains `verify/` — a false positive, not a
> bug. Reword the search; do not route around it.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.** Both hooks
run on tool calls only; `sed -i`, redirect, `mv`, `cp`, `rm` bypass them entirely. **What catches a
shell write is the diff — a reviewer, not a mechanism.** Stop and ask Carl.

**It worked twice today.** Two unlocks were granted for `answer-card-mesh.tsx`, both used for
temporary probes, both reverted, and **the lock was re-verified each time with an actual denial** —
not an assertion.

---

# ⚠⚠ ZERO ADMISSIBLE HARNESSES. 0 of 131. UNCHANGED TODAY.

**`⚠ NO VERDICT` on everything is the HONEST STATE, not a fault.** Nothing in `verify/` can be cited
as evidence. Do not read a green line as a pass.

⚠ **`reveal-stall.mjs`'s band/tolerance/window fault is what stands between the project and its
first admissible harness — and it was NOT touched today.** Its `observedSpread` is deliberately
`null`: 5 films resolved the reveal correctly (1240–1280ms against a declared 1300ms) but reported
**0ms freeze on all five**. The films are good; it is the freeze inside the window that does not
resolve.

*(The count is 131, not the 130 the last three handoffs said. Verified by `git ls-tree`; it was 131
at yesterday's head too, so the old figure was simply wrong.)*

---

## TODAY — EIGHT COMMITS. Head `7a13724`, tree clean, pushed.

> ⚠ **THE HEAD SHA HERE IS ALWAYS AT LEAST ONE BEHIND** — a file cannot name the commit that
> contains it. **Run `git log --oneline -9`. Do not trust this line.**

```
b3d305b  docs   the frame-by-frame observation + the 25fps instrument limit
ee9e5e0  docs   D-052
d731c1c  feat   D-052 implemented — one phrase, one wipe
eba1287  feat   the hover teal at 1.7
bcd0e74  docs   D-053
87919f8  feat   the completion tail 250ms earlier
562b0c0  docs   D-054
7a13724  docs   two closures
```

⚠ **`e4255e7` is timestamped 00:54 today but belongs to the PREVIOUS session** — it is the closing
commit of the handoff this one replaces. **Eight, not nine.**

---

## THREE DECISIONS. Carl's eye is the authority for all three.

**D-052 — the question number and its text reveal as ONE PHRASE.** ⚠ **The number had NEVER been
inside the wipe** — a sibling span outside the `clip-path`, since the wipe was written. **Not a
regression, never specified.** Implemented `d731c1c`. Carl: *"feels like one phrase now."*

**D-053 — the hover teal is a LEGIBLE STATE CHANGE, not a colour match.**
`LABEL_TEAL_STRENGTH = 1.7`. It is no longer a quotation of the rail's answer-line teal; that was
Carl's own earlier instruction, now overtaken by his later one.

> ⛔ **THE INK-COLOUR ROUTE IS CLOSED. DO NOT RE-PROPOSE IT.** `mix(a,b,t)` at `t>1` **extrapolates
> past** the target. The equivalent ink at strength 1.0 needs a **negative red channel** (−0.1024
> linear, at every albedo). Measured: a maximal cyan reaches 47.9% against 79.4% needed.

**D-054 — `ACK_LEAD_MS = 250`, and the principle behind it:**

> ### MEASUREMENT FOR THE DERIVED. JUDGEMENT FOR THE FELT.
> Some values must be exact because something is derived from them; some only need to be in the
> **perceptible vicinity**. At 120BPM, dropping to 118 is pointless — the ear cannot hear it, and
> believing it can costs hours on a change that isn't there. **The counterpart: the eye cannot pick
> bezier control points** (hand-chosen 0.113 vs fitted 0.011). ⚠ **The error is using either where
> the other belongs.**

---

# ⚠⚠ THREE INSTRUMENT LESSONS — THE MOST REUSABLE PART OF TODAY

**1. Three samplers measured the same hovered glyph. Two produced confident, plausible, wrong
numbers.**

| | what it did | why it was wrong |
|---|---|---|
| 1 | brightest 4% of a crop | found the **card's RIM**, not the glyphs |
| 2 | gated on **luminance > 120** | a brightening card **diluted its own sample** |
| 3 | **froze the glyph mask as fixed pixel POSITIONS** | trustworthy |

⚠ **Instrument 2 INVENTED A PHENOMENON** — a settled 7.4% and a "decay within a second", **neither
of which existed.** Its pixel count rose 399 → 458 as the sample grew to include things that were
never teal. **A true number about the wrong pixels.**

⛔ **INSTRUMENT 3 LIVES IN THE SCRATCHPAD. It is NOT in `verify/`, NOT in `proven.json`, and MUST
NOT be cited as a proven instrument.**

**2. A four-way attribution was commissioned against that false number and STOPPED AT ITS CONTROL**,
which measured 26.8% twice instead of 7.4%. ⚠ **The control instruction — reproduce the figure
before disabling anything — is what caught it.** Without it, four stages would have been disabled to
explain a collapse that never happened, and one would have looked like the answer.

**3. ⚠ THE 25fps FILMS CANNOT ANSWER A SMOOTHNESS QUESTION.** The site paints at ~60fps (~16.7ms);
the films capture at 25.04fps (~39.9ms) — two frames in five, clocks unaligned. They CAN show
whether an element wipes at all and roughly where. **This finding STANDS even though the
observation that prompted it has closed**, and `reveal-stall.mjs`'s 0ms verdicts were drawn from
these films.

---

## CLOSED TODAY — ⛔ DO NOT REOPEN

- **The depth-1+ amber.** Carl walked the current build and looked at it. **Observed, good.** Closes
  the "structurally safe but unobserved" caveat from `d731c1c`.
- **The intermittent *"not as smooth"*.** ⚠ **DIAGNOSED AND FIXED — not "went away", not "could not
  be reproduced".** It was never a smoothness or performance fault: it was the symptom of **"Q5" not
  being wiped at all**. Found by frame-by-frame review with the start-page heading as a control on
  the same frames. ⛔ **The 60fps capture is no longer needed for it.**

## STILL OPEN

- ⚠ **`reveal-stall.mjs`'s band/tolerance/window** — above. The path to the first admissible harness.
- **`open-defects.md`, four entries** — the a11y fault, Q4–Q1 having no card entrance, the stale
  anchor at `answer-card-canvas.tsx:1925`, and **the 7.4s/10.1s opening delay, which carries Carl's
  standing decision: FIRST JOB WHEN BUILDING RESUMES.**
- **Live tuning doors, all still in the build:** `?tealstrength=`, `?inklift=`, `?acklead=`
  (pair with `?skip=1`, which mounts the completion state directly).

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree. `npm run build && npx next start -p 3100`.
- ⚠ **A SERVER CAN OUTLIVE ITS SOURCE.** A probe-build server was found still serving reverted code
  after the file was restored and rebuilt. **`rm -rf .next` and rebuild when a probe has been in.**
- ⚠ **Playwright's pointer stays where the last action left it.** A "rest" reference was captured
  already hovered, which silently corrupted a mask. **Park it (`mouse.move(10,10)`) before capturing
  an idle state.**
- ⚠ **Card hover is DOM divs (`[data-testid="answer-card-hover-N"]`), not the canvas.** Raw mouse
  moves over the canvas do not fire it.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — LISTENING only;
  `TIME_WAIT` is not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **No backticks in comments inside the shader template literals** — it closes the string and the
  build stops. Caught once today by `tsc`.
- **Bash heredoc patches have silently no-opped and stripped regex backslashes.** ⛔ **Grep the file
  after every scripted edit.**

---

*20 August 2026. **Three decisions landed and recorded, two long-open items closed — and the day's
most transferable finding is that two of three instruments lied while sounding certain.***
