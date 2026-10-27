# Architect Plan Response: THE CLIENT FILM (27 October 2026)

**Plan-review gate, `handoff-protocol.md` §2.5.** The plan: `live-work/plan-client-film-27-october.md` (v3).

⚠ **PROVENANCE: read before trusting the authorship.** These findings are the Architect's (Claude chat, read-only),
delivered in its own window and pasted by Carl into the Builder's session. **They were TRANSCRIBED into this file by the
Builder**, an interested party in its own review. Each review's VERDICT and every numbered finding are kept as given; the
prose is condensed. **If this file and the Architect's window differ, the window is the authority.**

The previous contents of this file (R1, the camera recorder, five reviews, 26 October 2026) are in git history
(`7f564b2`).

**Outcome:** two rounds; every finding accepted and folded into the plan, marked [A1]–[A12], [B1]–[B7]. Awaiting Carl's
approval.

---

## Review 1, the plan v1. Verdict: *"Approve with amendments."*

*"The scope is right: no site code changes, a new tool, and the §5a note is honestly stated."* Checked in the repo:
Playwright 1.62.0 a root devDependency; `eslint.config.mjs` does not ignore `scripts/`; `.gitignore` in
`chunk-scope.json`; `public/c2b-logo-mark.png` exists; Geist reaches the site only through `next/font/google`.

**Must amend**
- **A1.** `recordVideo` IS the screencast in Chromium (25 fps VP8), so it cannot be the fallback for a frame-rate
  shortfall. Real fallbacks: a smaller viewport scaled up; lower JPEG quality; OS capture (ffmpeg `ddagrab` / `gdigrab`:
  window visible and uncovered, films the real cursor). Measure first, choose by the numbers.
- **A2.** The capture test must tell idle from dropped frames: measure during continuous motion (or a temporary rAF
  ticker); report fps during motion and the COUNT of gaps over 50 ms.
- **A3.** Frame handling: ack immediately, before any disk write; stream frames to disk (~900 frames, ~250 MB per 30 s);
  a temp folder under the OS temp dir, deleted on success.
- **A4.** Geist has no source for `cards.html`: name one (a Google Fonts link, or a pinned local `.woff2`); gate on
  `document.fonts.ready` and `document.fonts.check('600 48px Geist')`, stop if it fails.
- **A5.** A version number per run shows the client takes they were never sent: drafts by default (overwritten, "Draft"
  on the card), `--release` numbers, a number claimed only on success (temp name, rename at the end). Carl's call.

**Should amend**
- **A6.** Colour: screencast JPEGs are full-range BT.601; convert and tag BT.709 limited range; `ffprobe` checks
  `color_space=bt709`, `color_range=tv`.
- **A7.** Timestamps to CFR: the concat demuxer with per-frame durations, the last frame listed twice, then
  `-fps_mode cfr -r 30`.
- **A8.** Captions anchored to the first screencast frame (t0); the duration check is title + film − crossfade.
- **A9.** `glide` needs its own timed loop (an easing, ~36 moves, ~16 ms apart); `click` and `hover` glide first.
- **A10.** Cursor init script: attach on `DOMContentLoaded`, hidden until the first `mousemove`, max z-index, skip
  iframes. Drawing the cursor in post is an alternative; the Builder's choice, stated with its reason.
- **A11.** A per-scene `captionPosition` ("top" | "bottom") so a caption never hides what it points at.
- **A12.** A client film should cut in after a readiness condition; the cold load only in the proof. Carl's call.

**Smaller points:** warn above ~60 s, fall back to 720p rather than a starved bitrate; run alongside the bench polish
with its own `_clientFilm` scope entry (`npm run build` compiles the bench's in-progress changes); kill both servers by
PID before the checkpoint; state how ffmpeg is found and print its version; the proof film is C2B-specific code in a tool
folder (the workshop reference's Open Question 2); a D-entry on approval.

**For Carl, with recommendations:** MP4s outside the repo (`Videos\C2B Client Films\<client>\<feature>\`; workshops are
made by copying, and `.gitignore` is "a convenience, never the protection"); drafts and `--release`; a readiness cut for
clients; no end card; the title card the Builder's take, by eye. → **Carl chose all four recommendations** (plan v3,
"Carl's answers").

---

## Review 2, the plan v2. Verdict: *"Approve with three amendments (B1–B3) before building."*

*"A1–A12 and the smaller points are folded in correctly."* Checked: Next's `geist-latin.woff2` exists; `Videos\C2B Films`
exists and is not redirected to OneDrive.

**Must amend**
- **B1.** `document.fonts.check()` returns true when no `@font-face` matches the family, and `fonts.ready` resolves when
  nothing was requested: the gate passes with no Geist. Load explicitly from bytes (`new FontFace(...)`, `await
  f.load()`, `document.fonts.add`), then assert a loaded Geist face exists.
- **B2.** Confirm the pinned file covers weight 600 (variable, or Chromium fakes the bold): render 400 / 600 / 700 and
  compare. Add `OFL.txt` beside the font (OFL 1.1 travels with every copy). → **Answered by the Builder before
  building:** three distinct ink coverages (7,489 / 10,495 / 11,922 px), widening advances: variable.
- **B3.** `ready: "text=Begin"` fires mid-fade (opacity 0 counts as visible): `{ selector, settleMs }` or a function.
  Re-base captions and the duration check to the CUT frame in client films.

**Should amend**
- **B4.** Composite first, convert colour once, last, in one filter graph.
- **B5.** Run the A2 measurement on `/start` (production, 3100) with WebGL active, through the opening and Begin.
- **B6.** The rename over a draft open in a player fails on Windows (EBUSY / EPERM): catch it, say "close <file> and
  re-run", no raw stack trace.
- **B7.** Refuse an `--out` inside the repo; `path.join`; spawn ffmpeg with an argument array (spaces in the path).

**Records:** quote Carl's answers, not "all four as recommended"; measure `tsc` and lint at the checkpoint rather than
assert them in the plan.

*"Once B1–B3 are in the plan, I have nothing further to raise. It goes to Carl for approval."*
