# Session Handoff — Day 4

**Written at the end of Day 4, 28 July 2026. For the Builder session that picks up next.**

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

**`/doctor` settled a question about it on Day 4.** The documented cause of a rule being
ignored is a `CLAUDE.md` too long for it to survive in. **The file measured lean** — ~1,350
resident tokens, almost entirely non-derivable governance. So escalating the rule was the
right response and no hook is needed on bloat grounds. See D-041.

---

## Where the project is

**BUILDING IS STILL PAUSED** in the formal sense — no chunk is authorised. But **code was
written today** at Carl's direct instruction, outside the chunk model, and that is deliberate:
see "How we worked" below.

**Repo:** `main`, clean, pushed. **Head: `f62f472`.** Lint at the recorded baseline — 1
accepted `react-hooks/set-state-in-effect` error.

**Dev server stopped.** Note: `npm run dev` exits without taking the Next.js child with it —
port 3000 stayed held by an orphan on both restarts today. **Check the port, do not assume.**

---

## What was decided and where it is recorded

| What | Where |
|---|---|
| Future work is not recorded in this repository | **`decisions.md` D-038** |
| Drift sentinel parked pending Three.js evidence | **D-039** |
| Reverting a chunk — git first, not `/rewind` | **D-040** |
| `/doctor` run; auto mode is the Builder default | **D-041** |
| Contact field gold, displays, light intent, geometry | **`live-work/contact-field-gold-and-light-reference.md`** |
| How Carl and the Builder worked, and why it produced results | **`ai-system/working-with-the-builder.md`** |

---

## The change that matters most for the next session

**Carl will now talk to the Builder directly, not only through the Architect.**

> *"In my old workflow i hardly ever came in here and talked to you. That was a mistake. So
> the architect will write the prompts, yes. But i think we will get much better results if we
> communicate with you too. **The gold rim exists, thats proof enough.**"*

**The Architect still writes prompts for scoped implementation work; D-036 stands.** What
changed is that *design conversation* happens in the room. Everything built today came out of
conversation, not a written chunk.

**Read `ai-system/working-with-the-builder.md` before the first exchange.** It records the
five things that made it work, and Carl's mix model — *"there is a relationship between
everything, sometimes a causal relationship"* — which changes how a Builder should behave:
print the take and listen, do not solo, expect one change to move several things.

---

## What was built today

| Change | Commit |
|---|---|
| Second-seat material removed from the repo | `194ab32` |
| D-038 future-work policy applied across governance | `1f35a9a` |
| D-039/D-040/D-041 recorded | `f1d5b08` |
| Active Q label lifted out of grey (0.28 → 0.75) | `b233024` |
| Field entrance timing restored to the approved 3600ms contract | `d8ff778` |
| Contact bevel taken from copper to gold | `776921d` |
| Gold/light working reference | `f62f472` |

**Three verify/ scripts added:** `field-colour.mjs`, `field-displays.mjs`,
`field-entrance-timing.mjs`.

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **Q5 stutter** | Carl → Architect | ⚠ **REAL and OPEN.** See below |
| **Orbiting light / glint / bloom / opal** | Carl → Architect | The next real chunk. Full brief in the gold reference |
| Boxes 2–4 | — | Entrance timing already contracted; no retiming needed |
| `chunk-scope.json` does not exist | Carl | The scope guard is **inert**. Mattered less under per-action prompting; under auto mode it is the gate that replaced those prompts |
| Route the outreach folder | Carl | `C2B-Strategist/outreach/`. Asked since Day 2 |
| Approve `strategist-role.md` (DRAFT) | Carl | From Day 2 |
| `/insights` — check billing, then decide | Carl | Parked |
| Verify prices + Playwright licence | Carl → Strategist | Research mode |
| Own-repo rule → `decisions.md` | Carl | `strategist-role.md` §11 |
| OpenAI app uninstall | Carl | ~14 Aug. Checklist at `Documents/openai-app-removal-checklist.md`, **outside this repo by instruction** |
| Delete GSD backup | Carl | After ~3 August |
| Plugin marketplace removal | Carl | Run `/plugin marketplace remove claude-plugins-official` **from an Architect session** |

---

## ⚠ The Q5 stutter — do not record this as fixed

A stutter as the first question's text appears. **Confirmed real and intermittent**, and the
pattern is the useful part: it appears on the **first load after a server start**, then runs
clean. A fresh, healthy server still produced it once.

**Nothing was fixed. No code changed across any of the observations.** Do not read the later
clean runs as a resolution.

**Leading hypothesis, untested:** the WebGL pre-warm's 2000ms fallback firing on a cold load.
**It must be measured before it is believed** — this page has already produced one plausible
cause that measured innocent (Three.js blamed for the opening delay, 0 WebGL contexts during
it). Full record in `current-sprint.md`.

---

## Two traps this session actually fell into

**1. A stale record sent the Builder to work on a fixed defect.** Both `current-sprint.md` and
the timing reference named the Begin button as the next job. It had already been fixed.
**Reading the code would have confirmed the stale record, not corrected it** — the 7400ms
delay and the `beginActive` gate still exist and still look like the described defect. Only
Carl's memory and the button working on localhost settled it.

**A recorded next-step is a claim about the present, and it decays. Confirm it in the running
app.**

**2. Correct sampling, wrong role.** The logo's gold was sampled accurately from 149,431
pixels — and the **median** was applied as the metal's tint, which rendered copper. The
median is the logo's *average*, dragged low by thin dark edges. It was never the logo's gold.

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.** See the top of this file.
- **He leads.** Design, chunking and decisions are his. D-036.
- **He brings references, not adjectives.** Four video stills settled a colour question that
  an exchange of descriptions had not. **Take what he brings seriously and sample it.**
- **Music, DAW and production analogies land.** 45 years a musician. The mix model in
  `working-with-the-builder.md` is his and it is the most useful framing in the repo.
- **He verifies.** Give him evidence, not comfort, and expect what you write to be checked.
- **Answer execution questions yourself.** Ask only about intent and authority.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

*Day 4, 28 July 2026. The retired seat is gone from the repo entirely. Future work is out of
it by policy. Auto mode is on. And the gold rim exists — which is the evidence behind the
biggest change of the day: Carl is in the room now.*
