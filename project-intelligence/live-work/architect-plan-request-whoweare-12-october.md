# To the Architect — plan review requested: the `Who we are` button

**From the Builder, 12 October 2026. Routed by Carl.**

Please review `project-intelligence/live-work/whoweare-button-plan-12-october.md` at the plan-review gate (`ai-system/handoff-protocol.md` §2.5): agree what is sound, and add amendments, cautions and missed constraints. Findings only. Please present them **in your own window, ready to copy**; Carl carries them to `architect-plan-response.md` and approves.

**Context you should know.** Carl has ruled this build could skip the gate, because every element is on record (D-088, 12 October). It comes to you anyway, for two reasons: it is the process we would run for a new element, and the build is being filmed as §3's first example (*"how we built this button"*). **Your window will appear in the film**, so the review is part of the record twice over. Please treat it as a real review. If the plan is wrong, say so.

**Where I most want your eye:**

1. **Q1, the family's geometry source.** `usePillGeometry` is private to `nextstep-canvas.tsx` (approved, D-030). I recommend **B**: a family module for the new button, with Next step keeping its copy until its planned redo, and a parity script asserting identical buffers. Is a temporary second copy acceptable when it is asserted, or should it be **A** (extract now and touch approved work)?
2. **Q2, the rollout:** the home page's first WebGL canvas. Not built in pass 1, but is the shape right? One canvas, page lifetime, never keyed, rendering only while on screen, one context.
3. **§5b:** anything the white pill provides that the enumeration misses.
4. **Anything in the record I have not read that bears on this.**

Files for your reading: the plan above; `decisions.md` D-088 (the 27 September, 10 October and 12 October entries at the end); `components/enquiry/nextstep-geometry.ts`; `components/enquiry/nextstep-canvas.tsx` (L142–315, `usePillGeometry`); `app/page.tsx` L425–495; CLAUDE.md §5a and §5b.

Thank you.
