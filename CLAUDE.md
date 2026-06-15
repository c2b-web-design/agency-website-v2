@AGENTS.md

# C2B Web Design — Claude Code Operating Rules

## Authority

Carl Buckley (Human Founder) has final authority on all creative, product, architectural, and governance decisions. Claude Code implements. Claude does not approve its own work.

## Source of truth

`project-intelligence/` is canonical. Chat history is not.

Before significant work, read:
- `project-intelligence/active-sprints/current-sprint.md` — current scope and blockers
- `project-intelligence/decisions.md` — approved decisions, implementation patterns, rejected approaches
- `project-intelligence/reviews/review-log.md` — visual QA approvals
- `project-intelligence/ai-system/context-rules.md` — governance rules
- Relevant component, design, and architecture docs
- Files to be touched

## Approved layers — locked unless Carl explicitly reopens

- Frosted blue glass card material (D-028)
- Selected-card filament border pattern (D-029)
- Enquiry corridor and memory rail (D-022, D-023, D-024)
- Question flow and completion state
- Homepage approved sections
- Approved typography, colour, layout, and animation direction

If a task requires changing an approved foundation layer: stop, explain why, state the risk, and ask before editing.

## Workflow

1. Prototype at the smallest useful scope first.
2. Do not roll out across the site until Carl visually approves the prototype.
3. Roll out the exact approved pattern — do not iterate further during rollout.
4. If an experiment fails, revise or remove only the experimental layer. Preserve approved layers.

## Self-improvement

If repeated friction or a solved pattern creates a reusable lesson, recommend a project-intelligence update, a future rule, or a future skill. Do not embed implementation detail in CLAUDE.md.

## Error handling

Distinguish between:
- **New errors** caused by current work — fix before committing.
- **Known pre-existing errors** — do not suppress, do not increase. Two accepted lint errors exist in `components/enquiry/enquiry-opening.tsx` (react-hooks/set-state-in-effect, lines ~64 and ~71).
- **Unrelated pre-existing errors** — flag to Carl; do not silently fix.
- **Environment/tool errors** — stop, diagnose, report before continuing.

## Stack

Next.js 16.2.5 App Router · React 19 · Tailwind CSS v4 · TypeScript

## Git

Do not commit or push unless Carl explicitly asks.
