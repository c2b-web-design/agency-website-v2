# Review 5 — `structural-note-renderer-webgpu-5-november.md` (v1.4)

**Filed by the Builder, 5 November 2026, verbatim** as Carl pasted it (its last word cut off in the paste: "Wa"). The
Builder's notes are at the END, separate.

---

Verdict on v1.4: It's ready for the Architect. All four review-4 findings are folded in, and what the note says matches the code I read last round (corner-canvas.tsx:116, lettering-piece.tsx:277–278 and :291 with its dependency list). The three points below are small. Fold them in or let them ride; none of them blocks it.

Small points

1. Say where ArchMediumContext is defined, because that decides which file loads which. If the context lives in the medium module, LetteringPiece has to import that module to read it. That breaks the note's own rule (line 107, "LetteringPiece never imports the medium module"), and film 4's page could end up loading the WebGPU half. Define the context, with its WebGL default, in a small file that LetteringPiece owns or sits next to. The medium module then imports it to provide the WebGPU twins, never the other way round.

2. The wrapper must render the body before the texture is ready.
- Today: the grain and lamps (lettering-piece.tsx:308–310) mount right away, and only the metal waits for the environment (env starts as null).
- The risk: a wrapper that renders the body only once the texture exists would mount the grain and lamps late. That changes film 4's timing, which is what v1.4 says it keeps.
- The fix: state that the body is always rendered and receives the texture or null, as now.

3. One leftover phrase contradicts §3. Line 131 still says the WebGL column "really is today's code and today's weight". Since v1.3 the note says the WebGL code is refactored and only its behaviour is unchanged. "Today's weight" is still true; "today's code" isn't.

Wa

---

## The Builder's notes (separate from the review)

- **Verdict: ready for the Architect.** All three small points taken in **v1.5** (cheap, and each closes a way the note could
  mislead the build).
- **Point 2 — confirmed:** `lettering-piece.tsx:308–310` mount `ArchGrain`, `SignLamps`, `AxisLamps` at once; the metal waits
  (`material` undefined until `metal`).
- **Point 3 — confirmed** at the note's line 131.
