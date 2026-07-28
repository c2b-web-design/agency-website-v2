# Current Sprint — Sprint 2

---

## Sprint Goal

Build the homepage to a complete, production-quality state and begin the `/start` guided enquiry experience. Establish the visual and interaction foundation that the rest of the site will extend.

## Sprint Period

2026-05-23 → Open

---

## Completed

| Task | Output | Notes |
|---|---|---|
| Governance normalization | `context-rules.md`, `decisions.md`, `handoff-protocol.md` | Status vocabulary unified — `Active` replaced by `APPROVED` throughout |
| D-004 authority corrected | `decisions.md` D-004 DEPRECATED, D-010 added | Human Founder re-attributed as authority; history preserved |
| D-011 logged | `decisions.md` | Geist font loading pattern — `<html>` not `<body>` |
| Sprint 1 archived | `active-sprints/archive/sprint-1.md` | Archive structure created |
| Font variables applied to `<html>` | `app/layout.tsx` | Resolves R-001 F-001 — see D-011 |
| `--font-sans` circular reference fixed | `app/globals.css` | Resolves R-001 F-002 — `--font-heading` also corrected |
| Services section | `app/page.tsx` | D-012 service model: Premium Website Design, Website Transformation, Intelligent Enquiry Systems, Ongoing Growth & Improvement — 2-col card grid |
| Work/Proof section | `app/page.tsx` | D-013: agency website as first proof piece — 3-col card grid: Design Standard, Business Thinking, Modern Capability |
| Final CTA section | `app/page.tsx` | D-014: consultative closing invitation; links to `/start` |
| `/start` Stage 1 opening reveal | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-015: legato clip-path mask sequence; Begin button; ~11.5s phrase; full reduced-motion support |
| `/start` Stage 2 — Q5 guided question | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-016: multi-select cards, Q5 orientation cue, frosted glass card surface, "Next step" trigger |
| Q5 → Q4 transition design | `project-intelligence/decisions.md` | D-017: layered attention model, Q4 question and options, motion principles, open items documented |
| Wire "Next step" to Q4 | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-018: Q5 settles into compact memory summary; Q4 single-select enters with calm overlap; full reduced-motion support |
| Refine Q5 memory field + Q4 options | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-019: bounded quiet memory field (card echoes replace compact text); Q4 reduced to 5 options; three-layer hierarchy enforced with `.enquiry-context-faintest` |
| Q5 → Q4 handoff motion correction | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-020: per-element settling transitions + spatial recede; seamless DOM swap at 1200ms; static transform on memory field |
| Q5 → Q4 choreography correction | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-021: transform-origin: top center (eliminates DOM-swap jump); compact memory field (q5Selections only, no placeholders); Next step scrollIntoView with reduced-motion support |
| Persistent Q5 element + compact memory rail | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-022: persistent Q5 DOM node (no unmount/remount — eliminates snap); q5Phase state model; chip-style memory echoes (.enquiry-memory-chip, reusable pattern); opening context chain reaction; Q4 layout-first + block:nearest safety scroll |
| Shared corridor architecture | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-023: shared CSS variables for corridor depth; opening heading + Q5 + Q4 three-slot corridor proved and approved |
| Full Q5→Q1 corridor + completion state | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-024: all five questions complete; Q labels match question size at all depths; "Understood" completion handoff; Send button position; Begin/Next step/Send visibility consistent |
| Mobile nav | `components/layout/header.tsx` | Mobile header navigation and opening reveal refinements approved |
| Homepage + start flow QA polish | `app/page.tsx`, `components/enquiry/enquiry-opening.tsx` | Milestone commit 2152e6e — all sections and flow mechanics approved |
| Selected-card filament border | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-029: single SVG rect, pathLength="1", draw on select, hold completed border, fade on deselect. Muted Q-label gold. Approved Q5–Q1. See R-011. |

---

## Sprint 2 Closed — Milestone 2152e6e

Sprint 2 is complete. All success criteria met. Milestone commit: **2152e6e** (2026-06-14).

**Closed criteria:**
1. Homepage production-quality at all breakpoints — complete
2. `/start` Stage 1 opening reveal approved — complete
3. `/start` Stage 2 Q5 guided question approved — complete
4. Q4 transition designed, approved, and implemented — complete
5. Mobile navbar resolved — complete
6. Full Q5→Q1 corridor + completion state — complete (exceeded original scope)

---

## Current work

**Building is paused** — Carl's instruction of 25 July 2026. No chunk is authorised.

**When it resumes:**

**Four-box geometry in Three.js, on the client info page.** The current state of the site
build, and where sustained work resumes.

---

### ~~Begin button, 7.4-second delay~~ — RESOLVED before 28 July 2026

**Carl confirmed on 28 July that this was fixed in an earlier session.** The Day 3 handoff
and this file both still listed it as the first job when building resumed; **that record was
stale, and the Builder began working from it before Carl caught the error.**

**The lesson is the one this project already holds:** a recorded next-step is a claim about
the present, and it decays. `enquiry-opening.tsx:259` and the 7400ms delay at
`globals.css:185` still exist and still gate `beginActive` on the mask's `animationstart` —
so **reading the code alone would have confirmed the stale record rather than corrected it.**
Only Carl's memory of the fix, and the button working on localhost, settled it.

### ⚠ Q5 stutter — REAL, intermittent, OPEN. Deferred by Carl, not resolved

**Symptom:** a stutter as the first question's text appears — Carl described the "W" and "h"
of the Q5 phrase arriving raggedly.

**Confirmed intermittent, and the pattern is the useful part.** Observed across two sessions
on 28 July:

| Attempt | Result |
|---|---|
| First load, degraded dev server | stutter |
| Fresh server, first load | **stutter** |
| Fresh server, 2nd and 3rd loads | clean |

**It favours the first load after a server start, then stops.** That pattern is evidence, and
it points away from the earlier dev-server-degradation theory as a *complete* explanation —
a fresh, healthy server still produced it once.

⚠ **Nothing has been fixed.** No code changed across any of these observations. Do not read
the later clean runs as a resolution.

**The leading hypothesis, untested:** the WebGL pre-warm. `requestIdleCallback` schedules
shader compilation into an idle gap, but a **2000ms fallback fires it regardless** of whether
the thread is free. On a cold first load — nothing cached, Turbopack compiling, shaders not
yet in the driver cache — that work is at its most expensive and most likely to land on Q5.
Subsequent loads hit warm caches, which fits "first load only" exactly.

**This is a hypothesis and must be measured before it is believed.** This project has already
been burned once by a plausible cause on this very page: Three.js was blamed for the opening
delay and measured innocent — 0 WebGL contexts during the opening. The rule stands: measure
first.

**How to measure it:** a `verify/` script that loads `/start` **cold** (fresh context, cache
disabled), presses Begin, and captures long tasks and frame gaps across the Q5 reveal, plus
the timestamp of WebGL context creation. The question it must answer is whether shader
compilation overlaps the Q5 phrase animation. Run it repeatedly — a fault that appears once
per server start needs more than one sample.

**Status:** deferred on Carl's instruction, 28 July 2026 — *"We will have to get to the bottom
of this, for now it can wait."*

---

## Future work — deliberately not recorded here

**Carl keeps the future-work record outside this repository**, for the site and for the
wider business. This is a standing policy, applied 28 July 2026.

**Do not reconstruct it here, do not treat its absence as a gap, and do not plan against
it.** A session that reads these files should see current and previous work only. When a
future direction becomes current scope, Carl introduces it as a chunk with its own brief.

**One constraint survives because it protects built work:** the hero's right-side space is
**intentionally empty and must not be filled** without a brief from Carl — D-026.

---

## Blockers

*None.*

---

*Last updated: 2026-07-28 — future-work items removed on Carl's instruction; next two steps
recorded. Sprint 2 closed at milestone commit 2152e6e.*
