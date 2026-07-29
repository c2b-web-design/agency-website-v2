# Session Handoff — Day 5

**Written at the end of Day 5, 29 July 2026. For the session that picks up next.**

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

## Where the project is

**Building resumes next session.** Day 5 was deliberately a review-and-cleanup day: *"the last
session before building work resumes."*

**Repo:** `main`, clean. **Head: `f7c9ac2`. Four commits ahead of `origin/main` — not pushed**,
because Carl did not ask. Lint at the recorded baseline (1 accepted error).

⚠ **The orphaned-port problem affects `npx next start` too, not only `npm run dev`.** The Day 4
handoff recorded it for dev only. Both leave a `node` process holding port 3000 after the task
is stopped. **Check the port and kill the PID; do not assume it was released.**

---

## What happened today

| What | Where |
|---|---|
| Six-finding staleness audit — **two findings withdrawn as wrong** | This file, below |
| Strategist added to the authority file; `strategist-role.md` **APPROVED** | **`decisions.md` D-042** |
| PM/A · CB · CS · CD shorthand; what CS may be given | **D-042**, `ai-roles.md` |
| A one-page map of the system | **`ai-system/README.md`** |
| Scope-guard rule made a **Mandatory field** | `handoff-protocol.md` §2 |
| The portrait renamed, rehoused, three questions settled | **`ai-system/working-with-carl.md`** |
| Forward-creep rule graduated to a real rule | `prompt-protocol.md` **Stage 3** |
| npm/npx pre-approvals narrowed to this repo | Commit `8c2c25b` |
| **Q5 stutter — cause measured, fix applied** | **`live-work/q5-stutter-diagnosis.md`** |

---

## ⚠ The Q5 stutter is FIXED but NOT APPROVED

**Commit `a6f84fb`.** Carl: *"I can check it when I next visit the site. I will trust my
builder."*

**That trust is not an approval and must not be recorded as one.** Rule 9 makes rendered
output the truth for visual work; the evidence here is frame counts.

**Measured, production build, 3/3 runs:** worst frame gap **81ms → 18–19ms**; frames **35–38 →
42 of 42**; WebGL inside the reveal **3/3 → 0/3**. Reduced motion +143ms (correctly does not
wait). Completion still protected, canvas warm at +820ms.

**How to judge it:** first load after a server start — that is the one that stuttered.

⚠ **If Carl still sees something, the fix is not wrong — there is a second cause.** Do not
revert on one sighting; re-run `verify/q5-stutter.mjs` first.

**The recorded hypothesis was half wrong**, and that is the useful part: shader compilation
measured **0.1ms** and all GPU work **0.1ms**. The cost is Three.js **CPU** initialisation —
`onFirstUse` at 55.4ms plus geometry construction, ~197ms inside a 700ms fade. **Every check
aimed at the GPU came back clean.**

⚠ **`enterActive()` is now the single entry into the questionnaire**, mirroring
`enterComplete()`. **A future route in — resume link, deep link — must go through it** or the
guard will not see it.

---

## What building resumes on

**The orbiting light.** One light across three layers — logo (background), boxes (middle),
opal (foreground). Momentary aimed glint, not a constant key. Bloom coupled to the metal and
light intensity. **Full brief: `live-work/contact-field-gold-and-light-reference.md`.**

⚠ **The scope-guard field is now Mandatory.** Authorising this chunk **includes** PM/A
drafting `chunk-scope.json` values and Carl approving them. Without it the guard is inert and
every edit passes. Tested by firing it today: in-scope allowed, protected denied, out-of-scope
denied.

⚠ **The forward-creep rule now applies** (`prompt-protocol.md` Stage 3). This chunk arrives
with a whole-arc brief, which is exactly the condition it guards: *the intent governs, the
chunk executes.* **Guard against the helpful kind — it looks like good engineering.**

---

## Open items

| Item | Owner | Note |
|---|---|---|
| **Judge the Q5 fix by eye** | Carl | First load after a server start |
| **Claude Design — information, not implementation** | Carl | **Parked mid-conversation today.** Nothing recorded, deliberately. CD can now connect to Claude Code directly via an MCP server; whether this project uses it is undecided |
| Own-repo rule → its own decision | Carl | `strategist-role.md` §11. Repo-wide rule living in a role file. Carried since Day 2 |
| `/mcp` — Google Drive connector | Carl | Never completed auth. Codex measured **absent**, nothing to remove |
| Push 4 commits | Carl | Not pushed; not asked |
| Route the outreach folder | Carl | `C2B-Strategist/outreach/`. Since Day 2 |
| Plugin marketplace removal | Carl | **From an Architect session** — installed under `~/.claude-architect/` |
| Verify prices + Playwright licence | Carl → CS | Research mode |
| OpenAI app uninstall | Carl | ~14 Aug. Checklist outside this repo |
| Delete GSD backup | Carl | After ~3 August |

---

## The two findings I got WRONG today — read this before trusting an audit

**1. The review log's five-week gap.** I raised it as staleness. **It is correct**: every
decision since 22 June is governance or tooling, and the visual work is PROVISIONAL under
D-035. **I was about to become the third reviewer to flag the same non-problem** — the 24 July
architect review and a 25 July repo pass did it first, and D-035 exists because of them. The
log now carries a warning naming all three. **Check decision statuses before calling that gap
a gap.**

**2. The scope guard as an undocumented hole.** Overstated. `live-work-protocol.md` §8
documented it thoroughly on 27 July. The real defect was narrower and more interesting: **the
rule had no field in the form PM/A fills in**, so it was never reached. **A rule with no slot
in the form does not get followed.**

**And one thing Carl corrected.** I recorded CS's isolation as a *technical limitation*. It is
a **decision** — CS has what Carl decides it has, and no connection except through him. **CD
is the proof**: it launched in the same position and can now connect directly. **A new
capability is not its own authorisation.**

---

## How to work with Carl — carried forward

- **⛔ Never comment on his working hours.** See the top of this file.
- **He leads.** Design, chunking and decisions are his. D-036.
- **He asks for the principle before the decision.** *"I need to understand the principles
  first, before I make a decision. Explain simply."* **Explain, then let him choose** — do not
  present a recommendation as a fait accompli.
- **He brings references, not adjectives.** Take what he brings seriously and sample it.
- **Music, DAW and production analogies land.** 45 years a musician.
- **He verifies.** Give him evidence, not comfort.
- **Answer execution questions yourself.** Ask only about intent and authority.
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

*Day 5, 29 July 2026. The system now has a map, the Strategist is in the file that defines
authority, the scope guard has a slot in the form, and the stutter that hid for two days is
measured and fixed. Two of my six findings were wrong — which is the part worth keeping.*
