# Q5's reveal stall — FILMED, 15 August 2026

**First visual record of a defect chased for four sessions and never captured.**
Recorded against the pre-fix build, which is the last build where it exists.

⛔ **THIS IS A RECORD, NOT A DIAGNOSIS.** No attribution, no trace, no cause. What follows is
what the frames show and how they were obtained. Nothing here says why.

---

## ⚠ WHAT THIS DOES NOT COVER — read before any result

- **Desktop 1440x900 ONLY.** No mobile capture. Nothing here says what the reveal does at
  ≤639px, where the corridor's other known defect measures ~29% larger.
- **ONE RUN.** Not repeated, not reproduced across runs, not averaged. A single capture.
- **NO ATTRIBUTION.** Nothing here identifies a cause, names a component, or apportions time.
  Deliberately so — the instruction was to record, not to investigate.
- **THE REVEAL ONLY, NOT THE CORRIDOR STEP.** This window is Begin -> Q5's question text
  wiping in. The Q5->Q4 step and everything about it is out of scope for this file.
- **40ms SAMPLING CANNOT RESOLVE ANYTHING SHORTER THAN 40ms.** At 25fps a sub-frame event is
  invisible. This capture can show a ~700ms hold; it could not show a 20ms one.
- **NO NUMBER HERE IS EXACT.** Every duration is bounded by the frame interval — see the
  bounding below.

---

## THE BUILD

**Build ID `jDrD-05vIuNLxHLfOlGpe`, stamped 14 August 2026 22:20:27.**

`:3100` was verified to be serving that build **three independent ways**, before capture:

1. **`.next/BUILD_ID` mtime vs source mtime.** BUILD_ID stamped `2026-08-14 22:20:27`;
   `app/globals.css` in the working tree stamped `2026-08-15 14:20:48`. The build predates the
   working-tree edits by roughly sixteen hours.
2. **The new class is absent from the compiled output.** `grep -rl "enquiry-phrase-travel"`
   across `.next/static` returns **zero matches**. The decoupling CSS does not exist in the
   bundle being served.
3. **The served payload carries that same build ID.** `curl http://localhost:3100/` returns
   `jDrD-05vIuNLxHLfOlGpe` in the page itself — the running server is serving that build, not
   merely holding it on disk.

**The working tree was NOT reverted, rebuilt or restarted at any point.** The fix is present in
source and absent from the running build; that is exactly why this window existed.

---

## THE ARTEFACTS, AND WHY THEY WERE COPIED OUT

⚠⚠ **`verify/out/` IS SCRATCH AND IS DESTROYED ON EVERY FILMSTRIP RUN.**
`corridor-filmstrip.mjs` calls `rmSync(OUT, { recursive: true, force: true })` before it
records. **The next run of that harness would have deleted this recording.** It was copied out
**before any analysis was performed**, not after.

    ⛔ ORIGINAL (volatile — DESTROYED BY THE NEXT FILMSTRIP RUN):
      verify/out/corridor-frames/page@1750cb97f90c45f5a4a4510cfc822660.webm

    ✅ THE RECORD — IN THE REPOSITORY, 15 August 2026:
      project-intelligence/live-work/screenshots/
        q5-reveal-stall-prefix-build-15-august.webm

    EXTRACTED FRAMES (477 PNGs, the whole 19.08s) — session scratch, NOT preserved:
      ...\scratchpad\scan\scan_001.png ... scan_477.png
      THE STALL WINDOW:  scan_204.png ... scan_221.png

**Video:** VP8, **1440x900**, **25 fps**, **19.08 seconds**, 1,412,623 bytes (1.38 MB).

**The repository copy is verified identical to the source — SHA256
`E6B3A884BC60D954EEC1171831B876FB97490133C02522EE75B3260730D41A22`**, matched against the
scratchpad copy, not merely equal in size.

⚠ **THE FRAMES ARE NOT PRESERVED, ONLY THE VIDEO.** The 477 extracted PNGs live in the
session-scoped scratchpad and will go. They are reproducible from the `.webm` at any time
(`ffmpeg -r 2 -i <webm> -s 560x350 scan_%03d.png`, using Playwright's bundled ffmpeg at
`%LOCALAPPDATA%\ms-playwright\ffmpeg-1011\ffmpeg-win64.exe` — there is no system ffmpeg on
this machine). **The video is the artefact; the stills are derived.**

⚠ **`live-work/` IS GITIGNORED.** This file and the `.webm` are both force-added (`git add -f`).
A binary in `live-work/screenshots/` survives only as long as someone keeps force-adding it —
**if this recording is to outlive the branch it needs a decision from Carl about where it
belongs**, because the build it documents is about to stop existing.

---

## WHAT THE FRAMES SHOW

**The question text stalls inside its first word.**

At 25fps, **one frame = 40ms**.

| frames | what is on screen |
|---|---|
| f195–f200 | the wipe is running; content changes every frame |
| f201–f203 | the wipe reaches the first word |
| **f204–f221** | **STATIC. `Q5  Wh` — the wipe is in only as far as "Wh", mid-word.** The word "What" is incomplete. **Eighteen consecutive frames.** |
| f222 | **breaks out** — resumes to `What brought you her` |
| f223–f235 | the wipe completes normally to the full question |

**Duration of the hold: 18 frames x 40ms = ~720ms.**

⚠⚠ **~720ms IS NOT AN EXACT FIGURE. IT IS BOUNDED ~680–760ms BY THE 40ms SAMPLING INTERVAL.**
The true value lies somewhere in that range; the frame grid cannot narrow it further. **Do not
quote 720 as measured.** What is *not* in doubt is the existence and the order of magnitude:
eighteen consecutive static frames is far beyond any sampling ambiguity.

**This matches Carl's report by eye exactly — *"at or just after the first word."*** It is at
"Wh", inside the first word.

---

## THE METHOD — and why it takes two parts, not one

**Part 1 — the size plateau, as the LOCATOR.** The extracted PNGs were compared by file size
across the window. Frames 204–221 alternate between exactly **19910 and 19911 bytes** — a
dead-flat plateau. Frames either side move by hundreds of bytes per frame (f195–f203 climb
21316 -> 21465; f222+ climb 21489 -> 24094). The one-byte alternation is VP8 encoder noise on a
static image, not motion.

⚠ **MD5 hashes were NOT usable and this matters.** Every frame hashed differently, including
the static ones, because of that encoder noise. **A hash comparison would have reported
"CHANGED" for all eighteen static frames and missed the stall entirely.** File size was the
signal that worked; hashing was the instrument that would have lied.

**Part 2 — reading the frames directly, which is what makes Part 1 TRUSTWORTHY.** Frames
**f207, f209, f210, f211 and f214** were opened and viewed individually. **All five show the
identical `Q5  Wh`.** Frames f222 and beyond were viewed and show the text resumed.

⚠ **BOTH PARTS ARE REQUIRED AND NEITHER IS SUFFICIENT.** A size plateau alone is an inference
about bytes, not a statement about what is on screen — this project has a documented history of
byte-level and rect-level checks passing on visibly broken builds. Looking at the pictures is
what converts "the file sizes stopped changing" into "the text stopped moving."

---

## ⚠⚠ THE GAP THIS OPENS — OPEN, AND NOT ANSWERED HERE

**THIS IS THE REVEAL. EVERY PRIOR FIGURE IS FROM THE CORRIDOR STEP.**

    ~720ms (bounded 680-760)   THIS — the reveal, Q5's question text, FILMED
    ---------------------------------------------------------------------
    ~240ms per step            the corridor step
    ~180ms                     the step gap
    67.2ms                     the Next step button's per-question context
    ~112ms                     still unattributed, inside PutChanged

**The filmed figure is an order of magnitude larger than anything measured all week.**

⚠ **Whether these are TWO SEPARATE FAULTS, or whether the step probes were never measuring
what Carl was seeing, is OPEN AND IS NOT ANSWERED HERE.** Both readings fit the evidence in
this file. **Do not reconcile them.** The gap is recorded so that whoever takes it next starts
from the discrepancy rather than from an assumption that the numbers describe one thing.

---

## ⚠⚠ THE METHOD LESSON — this is the part worth keeping

**This was found on the video track of `corridor-filmstrip.mjs` — a harness that had never
been run, whose recording nobody had ever looked at.**

- The harness was committed **UNFALSIFIED AND NEVER RUN**, by its own header.
- Its `recordVideo` is configured **on the CONTEXT**, so recording began at context creation
  and ran to close — **19.08 seconds**, while its screenshot loop covered only **1.8 seconds**
  and started *after* a 6200ms wait that skipped the entire reveal.
- **The recording was rolling through the Begin click and the whole of Q5's reveal the entire
  time.** The defect was already on disk before anyone went looking for it.

⚠ **EVERY PURPOSE-BUILT PROBE THIS WEEK SAMPLED RECTS ON THE MAIN THREAD AND REPORTED GREEN.**

⚠⚠ **`page.screenshot()` COULD NOT HAVE SHOWN THIS.** It forces a surface readback and costs
40–80ms of **the same main thread the stall lives on** — measured at ~84ms per capture in this
very run. **An instrument that blocks the thread it is measuring can create, mask or displace
the thing it is looking for.** That is a validity problem, not a resolution problem, and it
does not improve by sampling harder.

**The video track is captured OUT-OF-PROCESS and is therefore unperturbing.** It is the only
instrument in `verify/` that was capable of seeing this, and it was capable by accident rather
than design — nobody chose it for this, and its output had never been examined.

**The lesson, stated for the next reader: when a defect resists a week of main-thread probes,
the probe is a suspect. Look for an out-of-process observer before building a better
in-process one — and look at the recordings you already have before capturing more.**

---

## STATE AT TIME OF WRITING

- `:3100` **still serving `jDrD-05vIuNLxHLfOlGpe`, untouched.** Not rebuilt, not restarted.
- Working tree **not modified** by this capture — three files remain modified from the
  decoupling implementation (`app/globals.css`, `components/enquiry/answer-card-canvas.tsx`,
  `components/enquiry/enquiry-opening.tsx`). `tsc` clean; **lint unrun**.
- **The decoupling fix is unverified.** Nothing in this file bears on it.
- ✅ **The `.webm` is out of the scratchpad and in the repository** at
  `live-work/screenshots/q5-reveal-stall-prefix-build-15-august.webm`, hash-verified, and
  force-added. ⚠ **Still inside a gitignored folder — see the note above.**

*15 August 2026. ⚠ **The reveal stall is filmed. It is ~720ms (bounded 680–760), at "Wh",
inside the first word. It is an order of magnitude larger than every corridor-step figure
recorded this week, and that discrepancy is unresolved.***
