# Architect Plan Response: R1, the camera recorder (26 October 2026)

**Plan-review gate, `handoff-protocol.md` §2.5.** The plan: `live-work/plan-camera-recorder-r1-26-october.md` (v2.3),
under the approved structural note `live-work/structural-note-camera-recorder-26-october.md` v2.2.

⚠ **PROVENANCE: read before trusting the authorship.** These findings are the Architect's (Claude chat, read-only),
delivered in its own window and pasted by Carl into the Builder's session. **They were TRANSCRIBED into this file by the
Builder**, an interested party in its own review. Each review's VERDICT and every numbered finding are kept as given; the
long prose is condensed where noted. **If this file and the Architect's window differ, the window is the authority.**

The previous contents of this file (30 July 2026, the satin blue field) are in git history (`fb889ff`).

**Outcome:** five rounds; every finding accepted and folded into the plan, marked [A1]–[A9], [B1]–[B6], [C1]–[C3],
[D1]–[D2]. **Carl: "Approved and proceed."**

---

## Review 1, the plan v1. Verdict: *"approve once the amendments below are made."*

*"The plan matches note v2.2 closely ... Moving the chain into pure functions in bench-chain.ts and testing them under
Node is a good call."*

1. **[A1] Which camera a punch-in records on:** a punch-in continues the punched clip's camera unless NEW CAMERA is
   armed; check a punch into a Cam 1 clip with a Cam 2 clip after it.
2. **[A2] R1's chain format must leave room for R2:** reserve `refined: null` (and the comp) now, or let `parseChain`
   accept unknown optional fields without a version bump. Otherwise R2 refuses Carl's first real takes.
3. **[A3] Every overlay a sibling of the drag surface;** the overlay layer `pointer-events: none`, only its controls take
   clicks; check a drag on bare picture turns the camera and a click on any overlay control does not.
4. **[A4] A focused button plus Space may fire twice** (a question, not a finding): check Space and Enter with a
   transport button focused.
5. **[A5] Edge states:** clamp the playhead after delete; a punch at a clip's start leaves zero samples, so remove the
   clip; "at the end" a fact the store records, not a float compare; controls disabled while recording; Y on an empty
   chain to the default view; a join between cameras labelled a cut.
6. **[A6] A pad dropping out mid-recording** stops the recording, the status saying why.
7. **[A7] Scope:** name all six files for R1 (camera-bench.tsx and camera-pad.ts were open only under the scale's
   authorisation) and lock them after; keep the noindex metadata; chunk-scope.json's stale name and comment.
8. **[A8] SVG icons, not emoji glyphs;** an aria-label and a tooltip naming each control's bindings.
9. **[A9] Verification:** a hitch test (a 0.5 s frame advances 0.1 s); bench-chain.ts imports nothing at runtime (Node's
   type stripping handles neither `@/` aliases nor extensionless imports); confirm `node --version`; stop servers
   before the checkpoint.

*"Amendments 1, 2 and 5 decide whether Carl's first takes survive and whether punch-ins behave as he expects."*

## Review 2, the plan v2. Verdict: *"approve once two fixes are made."*

1. **[B1] Stopping a punch-in set `atEnd` with the playhead mid-chain:** only an appending stop sets it; a punch-in's
   stop leaves the playhead parked unless no clips follow; check OVERWRITE, A, A with a clip following, then a third A
   does nothing.
2. **[B2] View while recording teleported the camera inside a clip:** stop the recording first (or disable View); check
   no clip holds a jump.
- Small: **[B3]** the no-focus-on-mouse-click rule for EVERY control (clips, "?", "i", the grid checkbox); **[B4]** only a
  play reaching the chain's end sets `atEnd`; **[B5]** a delete leaving no clip after T sets `atEnd`; **[B6]** the
  Persistence section to carry the reserved fields.

## Review 3, the plan v2.1. Verdict: *"approved. I'd send it to Carl as it stands."*

The Builder's correction to [B2]'s figure accepted (*"Your correction to my [B2] figure is right, and so is your
threshold"*). Build notes: **[C1]** test SPEED, not distance (25 m/s limit), so RB + a trigger or a slow harness frame
cannot trip it; **[C2]** the Sampler below 60 Hz: at most one sample per frame, stamped with the clamped time; add a
30 Hz case; **[C3]** preventing mousedown's default breaks a native range input, so the playhead and sliders get their
own pointer handling.

## Review 4, the plan v2.2 (with Carl's two calls). Verdict: *"still approved."*

The harness checked: no kept check presses LB or RB. **[D1]** the bumpers are fly inputs (leave scrub, stop
playback); **[D2]** check RB + full forward moves at walking pace, not × 3. For Carl: the turn is the rig's 75°/s, already
called too fast, and a bumper is on / off; it returns at item 3.

## Review 5, the plan v2.3 (tidy pass, then final). Verdict: *"approved. Ready for Carl."* / *"Approved ... I have
nothing further on this plan."*

The earlier text brought into line with the answered calls (title, scope, files header, camera-pad.ts, the fly-input
line, the [C1] note); one leftover (the Chain's three-field form in the bench-chain.ts row) fixed.
