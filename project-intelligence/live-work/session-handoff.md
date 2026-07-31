# Session Handoff — Day 7

**Written at the end of Day 7, 31 July 2026. For the session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.**

---

## ⛔ THE STANDING DIRECTIVE — unchanged, and it was not broken today

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a
session ends and will say so.**

Given Day 2, broken twice on Day 3, which is why it is a capitalised block in `CLAUDE.md`.
**It reads as considerate. It is not.**

---

## Where things stand

**Repo: `main`, head `7425e78`, tree clean, PUSHED.** Nine commits today, all on origin.
Lint at the recorded baseline (1 accepted error). Dev server was running.

⚠ **`live-work/chunk-scope.json` is STILL ACTIVE on `autofill-cascade-and-reveal`.** It will
deny edits outside that chunk's file set. **Stand it down or rewrite it before starting new
work** — this is the housekeeping step that has been needed at the end of every chunk.

### The contact field is COMPLETE as a form

Three chunks, planned and built today in sequence, all committed and pushed:

| Chunk | What | Commit |
|---|---|---|
| Satin field steps 3–4 | Arc grain into a normal map; responsive verified | `56c2e1c` |
| **A** — text inputs | Four real DOM inputs + labels over the WebGL boxes | `3f93ce0` |
| **B** — progressive rim | Box 1 lit; one character lights the next; reversible | `0b99a36` |
| **C** — autofill cascade | Masked left-to-right reveal, rim and text on one clock | `7425e78` |

Plus `b4bd4b3`, `bc169fa`, `86a5d0f`, `f69d673`, `1221d4c` — fixes and records, all described in
their own commit messages.

**Full records:** `run-log-field-step3.md`, `run-log-chunk-a-text-inputs.md`,
`run-log-chunk-b-progressive-rim.md`, `run-log-chunk-c-autofill-cascade.md`.

**Carl on the finished result:** *"it looks great!"*

---

## ⚠ THE NEXT SUBJECT — the orbiting light, and its brief is already written

**`live-work/orbiting-light-test-rig-brief.md`** — written at the end of today from Carl's
specification. **Read it before planning anything.** Alongside it,
`contact-field-gold-and-light-reference.md` holds the intent, the three-layer depth model and
the measured gold; the new brief does not repeat them.

**The short version:** Carl wants a **test rig, not a finished effect** — *"test it first,
especially against the components that need decisions."* Start top-left just above box 1 pointing
down, **no light on the box at that moment**, ending bottom-right looking up, on an elliptical
orbit. Narrow beam, slow speed. The observable is **a narrow band sweeping across the face, with
bloom**.

⚠ **AND THE TEST DESIGN IS PART OF THE BRIEF, not an implementation detail.** A **4-second
partial orbit with the light PULSING on and off** along the way — Carl: *"then we can see the
effect as it travels and as it's turned on... you may wish to decide not to have the orbit's
speed continuous and be static at some point. **This is a test after all.**"*

**Pulsing beats a continuous sweep because it shows two independent things:** how the band
travels, and **how the metal responds to a light ARRIVING** — which is what the glint actually
depends on, since a glint is an ignition rather than a pass. It also samples the orbit for free:
each pulse catches the geometry at a different angle.

⚠ **THE ORBIT AND THE PULSE MUST BE SEPARATE SWITCHES**, giving four modes — moving/continuous,
moving/pulsing, static/pulsing, and **static/on: a HELD FRAME.** That last one matters: on Day 7
every value measured from a moving or transient state proved unreliable, and the only two that
gave clean answers were the ones that could be frozen. **A rig that can stop is a rig that can be
measured.**

⚠ **THREE DEFERRED JUDGEMENTS DEPEND ON IT**, all deliberately left open rather than guessed:

| Deferred | Current value |
|---|---|
| `FIELD_GRAIN_TINT` | `0.55` |
| Rim unlit floor | `0.05` |
| The glint itself | does not exist |

⚠ **AUTHORITY IS UNRESOLVED AND MUST BE SETTLED FIRST.** Carl's standing instruction is that the
light chunk **goes through the PM/A, not direct**. This brief was given straight to the Builder.
**Whether that supersedes the instruction is Carl's call and is NOT recorded as decided.**

⚠ **Two structural changes the brief implies** — recorded in the brief, flagged here because they
change the canvas in kind: `frameloop="demand"` becomes a continuous loop while the light moves,
and bloom adds an `EffectComposer` pass. Post-processing is **already installed**; no new
dependency is needed.

---

## ⚠ The through-line of the day: self-consistent logic, wrong on screen

**Six times a measurement or a rule was internally correct and described the wrong thing.**
Carl's eye caught every one. This is the same pattern Day 6 recorded, and it recurred all day.

| What | The trap |
|---|---|
| Grain probe read **JPEG compression noise**, reported "grain present" | No control. Only a run at relief 0 exposed it |
| Texel ratio computed from `spanX`; **the code scales by `spanY`** | Measured a quantity the code does not use. Reported a defect that did not exist |
| `verify/field-colour.mjs` waited **5200ms for an 8100ms cascade** | Every screenshot sampled mid-cascade and was described as settled |
| Autofill signal tested **per update, not per tick** | Chrome fires one `input` event per field, so the condition never fired once |
| Mask left `mask-repeat: repeat` | ⚠ **The isolated control used the `-webkit` shorthand, which sets it.** The control differed from the real thing in the one way that mattered |
| Rim rule: *light box N when box N-1 has content* | Correct by its own logic. On screen: **an empty box wearing a gold rim beside a completed box with none** |

⚠ **THE LESSON, STATED PLAINLY: a control that differs from the real thing proves nothing, and a
measurement without a control measures whatever is loudest.** Both failure modes produced
confident, plausible numbers.

**`verify/field-colour.mjs` now re-reads `FIELD_ENTRANCES` from source and exits non-zero if its
copy drifts** — the guard `verify/q5-stutter.mjs` needed and never got.

---

## ⚠ What only Carl could verify

**The `-webkit-autofill` background defeat.** Chrome forces a pale-blue background through a UA
style ordinary CSS cannot beat; on this design that would be a flat rectangle over the satin
field inside every gold rim. **Verified working, by Carl, in real Chrome.**

⚠ **Playwright setting an input's value takes a different code path and never applies the
pseudo-class**, so an automated pass would have been **meaningless rather than reassuring.**

**And his description of the interaction surfaced a requirement no test would have found:**
hovering an autofill suggestion **previews values into the real fields with no commitment**, and
moving away withdraws them. The cascade must not fire on a preview — `AUTOFILL_SETTLE_MS = 90`
plus a DOM re-read is the guard.

⚠ **Chrome's address profiles hold NO website field**, so a real autofill fills boxes 1, 2 and 4
and leaves 3 empty. That gap will happen to almost every user and **no test covered it.**

---

## The scope guard — used four times, and it worked

`chunk-scope.json` was rewritten for each chunk and **tested by firing the hook, not by reading
it**, every time.

⚠ **It blocked the Builder from exporting a constant it needed, in a file the Builder had itself
protected an hour earlier.** The Builder **did not edit its own scope file to proceed** — it
stopped, stated the change, the reason and the risk, and asked. Carl: *"add."* Both unlocks are
narrow and recorded in the file with their authorisation.

⚠ **`verify/_tmp-*.mjs` was declared this time** and was not blocked once. It had been blocked
three times across the previous two chunks, with the advice already on the record and not
followed.

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **Light chunk: PM/A or direct?** | Carl | ⚠ Blocks starting the next chunk |
| **Stand down `chunk-scope.json`** | Builder | Still active on chunk C |
| **Submission — what happens to Q&A answers + personal info** | Carl | Explicitly *"a later session"*. ⚠ The form now collects real data and Send does nothing |
| The ~183ms first cascade gap | Carl | vs 133ms for the other two. Judged by eye, not fixed |
| `RIM_LIGHT_MS = 900` | Carl | Current and best-judged, not approved |
| Entrance timings 3600/4100/4600/5100 | Carl | ⚠ **Standing reservation: "close enough is not approved"** |
| Mobile keyboard on a real device | Carl | Playwright cannot emulate the keyboard inset |
| Claude Design | Carl | **Still parked.** Research positive; nothing recorded, deliberately |
| Own-repo rule → its own decision | Carl | `strategist-role.md` §11. Since Day 2 |
| `/mcp` — Google Drive connector | Carl | Never authorised; unavailable |
| Route the outreach folder | Carl | `C2B-Strategist/outreach/`. Since Day 2 |
| Plugin marketplace removal | Carl | Installed under `~/.claude-architect/` |
| Verify prices + Playwright licence | Carl → CS | Research mode |
| OpenAI app uninstall | Carl | ~14 Aug |
| Delete GSD backup | Carl | After ~3 August |

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.** See the top of this file.
- **He leads.** Design, chunking and decisions are his. D-036.
- **He asks for the principle before the decision.** Explain, then let him choose.
- **He brings references, not adjectives**, and expects them combined rather than copied.
- **Music, DAW and production analogies land.** 45 years a musician. *"Low in the mix"* was his
  correction to the Builder's overstatement that a rim was invisible — **a level, not a defect.**
- **He verifies.** Give him evidence, not comfort. **His eye beat the instrument six times
  today.**
- **He chunks deliberately:** *"I would rather do things in stages with a better chance of
  getting it right than implement more fully with a greater chance of getting it wrong."*
- **Answer execution questions yourself.** Ask only about intent and authority.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

## ⚠ Environment notes

- **The orphaned-port problem affects `npx next start` as well as `npm run dev`.** Check the port
  and kill the PID; it does not release on its own.
- **`python3` is not available.** Use `node`, `sed` or the Edit tool.
- ⚠ **A throwaway probe in the scratchpad cannot `import` project modules by bare specifier** —
  module resolution follows the file's location. Use absolute `file:///` URLs into
  `node_modules`, or `npx tsx` from the project root.
- ⚠ **Screenshot round-trips at DPR 2 are slower than a ~500ms animation.** Sampling a CSS
  custom property per frame conflates *when the animation started* with *when the render landed*
  — **use `getAnimations()` for animation timing.**

---

*Day 7, 31 July 2026. The contact field went from four decorative `aria-hidden` boxes to a
working, accessible form with a progressive gold rim and an autofill cascade — and the satin
material was finished on the way. Nine commits, all pushed.*

*The day's real lesson is one the project keeps relearning: **every failure today was
arithmetically sound.** The probes agreed with themselves, the rules were self-consistent, and
the controls passed. What none of them did was measure the thing being judged. Carl's eye did,
six times.*
