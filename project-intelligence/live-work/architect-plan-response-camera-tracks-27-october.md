# Architect Review: the camera recorder note v3, CAMERA TRACKS (27 October 2026)

**Structural-note review** (CLAUDE.md §5a). The note: `live-work/structural-note-camera-recorder-26-october.md` (v3 →
v3.1).

⚠ **PROVENANCE: read before trusting the authorship.** These findings are the Architect's (Claude chat, read-only),
delivered in its own window and pasted by Carl into the Builder's session. **They were TRANSCRIBED into this file by the
Builder**, an interested party in its own review. The verdict and every numbered finding are kept as given; the prose is
condensed. **If this file and the Architect's window differ, the window is the authority.**

**Outcome:** two rounds. Every finding folded into the note as v3.1. **Carl answered C3, C8 and C11 on 27 October**
(the question dialog, verbatim): *"Drop it (Recommended)"* (Overwrite retired), *"Cover it, as a new take
(Recommended)"* (a run-on), *"The clip solo (Recommended)"* (a selection plays solo), *"Yes: T1a then T1b
(Recommended)"*; and on D5, *"Only when I say so (Recommended)"* (the v1 copy kept). Round 2: *"Ready for the T1a plan
once D1 to D5 are in"*; they are.

---

## Review 1, the note v3. Verdict: *"Sound in principle, but not ready to build."*

*"v3-1 (clips placed in time, in a flat list) and v3-2 (one pure sourceAt) are the right shape. The rejected alternatives
are argued correctly."* Checked against the code: R1 is end to end (`clipStarts`, `locate`); `CHAIN_VERSION` 1 and
`parseChain` refuses any other; `refined` / `comp` reserved null; the key `c2b-camera-bench-chain-v1`; the pad's free
buttons Start (9), LS (10), RS (11), so v3-6 is available.

**Must amend**
- **C1.** The PiP is understated: (1) drawing twice takes over R3F's render (a priority `useFrame` calling `gl.render`
  stops R3F's automatic render for the whole canvas): structural; `LetteringPiece`'s ready report assumes R3F renders
  after the callbacks; a §5b row needed; the context-loss history a reason for care. (2) Values set per frame from the
  main camera (the 10 cm lines' thickness): list each, re-set between passes or accept wrong and say so on screen. Blocks
  T2's plan, not T1.
- **C2.** Two joins inside a track are missing: a new take's start and end over an older take (the old resumes
  mid-move). The commonest joins in the take model. Define them, show them, derive them from `sourceAt`.
- **C3.** Overwrite decided again: the gap (a recording begun on an empty stretch can run into a clip and cover it
  unarmed: stop at the next clip, or allow covering and guard only the start); and Carl's call whether Overwrite still
  earns its place now nothing is lost.
- **C4.** Take lanes described two incompatible ways ("one per pass" and "packed"). Choose; "one per pass" matches
  Carl's Logic reference.

**Should amend**
- **C5.** Half-open intervals with `EDGE_S`, trimmed spans too; prove the migration by number (v1 `poseAt` vs v2
  `sourceAt` at every sample and boundary of a real R1 chain).
- **C6.** A gap with no previous picture: *"Suggestion: hold the last picture before T; if there is none, hold the first
  one after T. State it either way."* (A suggestion, not an instruction; the note states it.)
- **C7.** Storage: covered takes kept forever; the migration doubles R1's footprint; measure the quota and Carl's chain
  size before T1; define a failed v2 write during migration.
- **C8.** Play the selection with precedence: solo (Resolve's solo-on-select) or as the edit plays. Say which.
  *Corrected by the Architect, 27 October [D1]: Resolve has no solo-on-select; the parallel is the Source viewer.*
- **C9.** Clamp `start ≥ 0`; a minimum trimmed length (≥ 1 sample interval); say whether T1 removes empty clips.
- **C10.** Start while recording does nothing, with a status message.
- **C11.** Split T1: T1a the model (proven by the chain check and the R1 parity check; Carl flies it), T1b the editing.

**Records:** cite the harness count's run (58 vs the handoff's 52); one line confirming track reordering is out of T1;
the verbatim answers including "(Recommended)" are *"the honest record"*.

*"Before T1 can be planned: C2 to C4 need writing into the note, and C3 needs Carl's answer. C1 is needed before T2's
plan."*

**The Builder, on folding it in:** both code citations checked (the `LetteringPiece` ready report; the
`webglcontextlost` handler, now at `camera-bench.tsx:871`). C7's quota MEASURED: 5,242,880 characters per origin
(Playwright's Chromium). C2, C4–C7, C9, C10 written into the note; C1 into §5b for T2. **The two Records items, resolved
in the note:** the harness count is 52 at R1 + 6 on 27 October = 58/58 (D-104; the note's §5b row); track reordering is
OUT of T1 (the fold-in section, and Carl's answer 9).

---

## Review 2, the transcript and the note at v3.1. Verdict: *"the transcript is faithful, and the fold-in is mostly sound."*

The one shift found in the transcript: C6 was a suggestion, recorded as an instruction (now quoted as given).

**Must amend**
- **D1.** *"My mistake: 'Resolve's solo-on-select' is wrong."* Resolve's timeline always plays the edit with
  precedence; to see one clip alone, it is loaded into the Source viewer. Carl's decision stands; only the reference
  changes: *"a selection plays solo, as a clip opened in Resolve's Source viewer; the timeline (nothing selected) plays
  the edit"*.
- **D2.** The fold-in still presented C3, C8, C11 as open, pointing at an Open list that does not exist; Carl's answers
  6–9 belong with 1–5, verbatim.
- **D3.** v3-1 still said take lanes are "packed": change to "a view of order".
- **D4.** v3-3 ("the v1 copy LEFT") and C7 ("removed only after a v2 save ... read back") disagreed.
- **D5.** *"Removing the v1 copy deletes Carl's R1 takes. Make it Carl's word"*: keep it until Carl says otherwise, or
  until a downloaded v1 file exists (R2); either way the quota counts the doubling.

**Should amend:** define "identical" in the parity check (bit-exact or a tolerance, e.g. ≤ 1e-9); point the Gaps row to
C6; carry Carl's chain size in the handoff, Carl the owner; mark v3-4's "Carl's call" answered; the title still read
VERSION 3.

**The Builder, on folding it in:** D1 corrected in the note (Behaviour table, fold-in, answer 8) and here (under C8);
a sweep for the phrase found no other copy (⚠ the Grep tool skips gitignored `live-work/`; found with `grep -rn`). D2:
answers 6–10 added verbatim; C3, C8, C11 marked ANSWERED. D3, D4 fixed. **D5 put to Carl: *"Only when I say so
(Recommended)"*** — v3-3, §5b and C7 now agree: v1 kept, never removed by the bench, the doubling counted. "Identical" =
every field within 1e-9, a wider difference fails. The Gaps row points to C6; v3-4 marked answered; the title v3.1. The
chain size goes in the handoff.

---

## Review 3, the T1a PLAN v1 (`live-work/plan-camera-tracks-t1a-27-october.md`). Verdict: *"Approve with amendments."*

*"The plan follows note v3.1 closely. sourceAt is the single rule everything reads. Trim is read by every rule but
written only in T1b, so T1b changes no rule. The parity check runs in Carl's own browser. v1 is never removed. The planted
fault turns the check red first."* Checked: `fb86684` exists and `bench-chain.ts` is unchanged since; R1's `locate` gives
a boundary to the later clip; `KeyC` unused; `BTN.START` defined and unused; R1's `…-refused` set-aside.

**Must amend**
- **E1.** The parity check as specified fails at every cut and mismatch: the v2 rule moves each boundary `EDGE_S`
  earlier, so at boundary − `EDGE_S` v2 gives the later clip and v1 the earlier: the join's full mismatch, red on Carl's
  real chain, v2 never written. Probe at ± 2·`EDGE_S` and exactly at the boundary; state that v2 deliberately rounds to
  the later clip inside the band; name the offset in `poseAtT` and `joinsOf`.
- **E2.** On a parity failure, say what happens to new work: saves held (lost on reload) or written to v2 (the
  unverified migration persisted). Recommended: saves continue to v2, v1 untouched, a persistent differences line until
  Carl decides. Rule out holding saves silently.
- **E3.** A v2 that exists but cannot be read must not fall back to v1 (R1's state presented as current, then written
  over Carl's v2 work): start empty, say so, name both kept copies; a harness check.
- **E4.** "Delete the newer take to reach it" is destructive, against *"Non destructive is always better"*: click-to-cycle,
  or the inspector lists every take under the playhead, each clickable.

**Should amend:** a status line for recording UNDER a higher track; a gap edge is not a join; name "the playhead stays
parked while Carl re-frames" as kept (it now decides where a take lands); joins and gaps memoised on chain change; the
default arm on load (top track, or last-armed saved: Carl's call, the default stated); em dashes in status strings.

**Verification additions:** E1 probes green on a real R1 chain with a cut and a mismatch; E2 forced (record, reload, the
take present, v1 byte-identical, the line showing); E3 as above; E4 a covered take selectable without deleting.

**Scope:** add a `_cameraTracksT1a` entry with Carl's words.

*"With E1 to E4 in the plan, I have nothing further. It goes to Carl."*

**The Builder, on folding it in (plan v2):** ⛔ **E1 CONFIRMED BY NUMBER first** (R1's code under Node, a boundary B:
at B − `EDGE_S` v1 → clip 0, v2 → clip 1; at B − 2·`EDGE_S`, B and B + 2·`EDGE_S` both agree). Named offset `PROBE =
2·EDGE_S`; the band's divergence ASSERTED in the chain check. E2: saves continue to v2, the persistent line. E3: as
specified, never v1. E4: the inspector lists the takes under the playhead (`takesAt`), each clickable. All should-amends
in; the default arm stays the top track, stated, Carl's call. Scope: the `_cameraTracksT1a` entry was already added with
Carl's words when he named the four files (the review saw the file before it); the `"chunk"` name moves at the build.
