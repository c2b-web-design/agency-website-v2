# Plan: THE CLIENT FILM — a short, captioned MP4 of a feature, to email a client for approval. 27 October 2026, v3

**For:** Carl, for approval (the Architect: *"Once B1–B3 are in the plan, I have nothing further to raise. It goes to
Carl for approval."*). **Status:** PROPOSED. Nothing built. Copied to `live-work/plan-client-film-27-october.md`; both
reviews transcribed to `live-work/architect-plan-response.md` (by the Builder, so marked; the Architect's window is the
authority).

**Versions.** **v3:** the Architect's second review (*"Approve with three amendments (B1–B3) before building"*). B1–B7
and the two record points folded in, each marked. **B2 answered by the Builder before building:** Next's
`geist-latin.woff2` loaded as bytes and drawn at 400 / 600 / 700 gives three distinct ink coverages (7,489 / 10,495 /
11,922 px) and widening advances: a VARIABLE font, 600 is real (the screenshot in the session scratchpad,
`geist-weights.png`). Its licence is NOT in Next's package: `OFL.txt` fetched from Geist's official repository
(vercel/geist-font) at build. **v2:** the Architect's review (*"Approve with amendments"*), pasted by Carl. A1–A12 and the smaller points
folded in, each marked. The Builder checked the review's repo claims: `eslint.config.mjs` does not ignore `scripts/`;
`.gitignore` is in `chunk-scope.json`; `public/c2b-logo-mark.png` exists; `Videos\C2B Films` exists. Found in checking:
a Geist `.woff2` ships inside Next (`node_modules/next/dist/next-devtools/server/font/geist-latin.woff2`), the source
for A4. **v1:** the plan.

## Context

Carl, 27 October 2026: *"Can Playright or ffmpeg be used in here. Im thinking of a scenario where a client asked for a
feature and it could be sent to them for approval."* / *"If i have a back and forth with a client it would be a very
useful tool to have. to email them a short mp4"* / *"We can fit a new chunk in, we are ahead of schedule. A title card is
more professional. ... The email would give a top level view, captions help to walk them through it."*

**The outcome:** one command films a feature on a page in scripted steps and hands back an email-ready MP4: a title card,
captions walking the client through each step, a visible cursor.

**What exists and why it is not enough.** Playwright 1.62.0 and ffmpeg 9.0.1 are installed. `verify/`'s films use
`recordVideo`: out of process (it does not disturb the animation) but VP8 WebM at 25 fps, fit for measuring, not for a
client. ⛔ Screenshot-per-frame is ruled out by the record (40–84 ms per capture on the animation's thread,
`verify/reveal-stall.mjs`). A new tool (§5a: a new mechanism where none serves); it touches NO site code.

## The approach

**1. Capture: CDP `Page.startScreencast`, read directly.** JPEG frames with the compositor's timestamps, out of process.
- **[A3] Each frame:** `Page.screencastFrameAck` sent IMMEDIATELY (Chrome sends the next frame only after it), THEN the
  frame STREAMED to disk (never held in memory: ~900 frames, ~250 MB per 30 s) in a folder under the OS temp dir, deleted
  when the run succeeds.
- **[A1] ⚠ `recordVideo` is NOT a fallback:** in Chromium it IS this screencast, at 25 fps with VP8 softening. If the
  measurement (Verification 1) shows the screencast cannot hold about 30 fps at 1920 × 1080, the fallbacks that actually
  differ, in order: (a) a smaller capture viewport (1600 × 900) scaled up to 1080p by ffmpeg; (b) a lower JPEG quality
  (the encode is most of the cost); (c) OS capture (ffmpeg `ddagrab`), a different channel, but the window must be
  visible and uncovered and it films the REAL cursor. Chosen by the numbers, and the report says which.
- At 1920 × 1080, DPR 1 (Carl's density), headed Chrome with the harnesses' GPU flags (headless can fall back to software
  WebGL: Carl's 3 October Chrome).

**2. Timestamps to a constant 30 fps [A7]:** the ffmpeg concat demuxer, a `duration` per frame (the gap to the next
frame's timestamp), ⚠ the LAST frame listed twice (concat ignores the last duration otherwise), then
`-fps_mode cfr -r 30`.

**3. The film definition, one small module per film:**
```js
export default {
  url: "http://localhost:3100/start",
  title: "Start a conversation", client: "C2B Web Design",
  // [A12][B3] the title card fades in to the first frame after the page is SETTLED: `{ selector, settleMs }` or a function
  // the film supplies. Playwright's "visible" counts opacity 0. On /start, Begin's hit control drops `aria-disabled` as its
  // reveal STARTS (`enquiry-opening.tsx`, `setBeginActive`), so the settle covers the reveal; its length set at build and
  // checked by B3's first-frame still.
  ready: { selector: ".enquiry-begin-hit:not([aria-disabled])", settleMs: 1500 },
  scenes: [
    { caption: "Press Begin to open the conversation.", run: async (h) => { await h.click("text=Begin"); await h.wait(8000); } },
    { caption: "Hover an answer: it lifts and lights.", captionPosition: "top",   // [A11] off the cards
      run: async (h) => { await h.hover("[data-card='2']"); await h.wait(1500); } },
  ],
};
```
Helpers (`h`): `wait`, `glide`, `click`, `hover`, `scroll` (smooth), `type` (typing pace), `press`.
- **[A9] `glide` is its own timed loop** (Playwright's `mouse.move` steps run back to back, in a straight line, at a
  constant speed): an ease-in-out, ~36 moves, ~16 ms apart, ~0.6 s. `click` and `hover` glide first.
- **[A11] `captionPosition`:** `"bottom"` (default) or `"top"`, per scene, so a caption never covers what it points at.

**4. The cursor: a dot in the filmed page.** An init script **[A10]**: skipped in iframes (`window !== window.top`);
attached on `DOMContentLoaded` (init scripts run before `<body>`); hidden until the first `mousemove`; maximum z-index;
`pointer-events: none`; a pulse on `mousedown`. ⚠ The only change made to the page under film; `cursor: false` turns it
off. **Why in the page and not drawn in post [A10]:** the dot sits exactly where the page's own hover states think the
pointer is, by construction; drawing it afterwards means compositing a moving dot into every frame from a logged path,
with no image library in the repo and a second clock to align.

**5. The title card and captions: ONE HTML template, rendered to PNG, laid over by ffmpeg.**
- **[A4] Geist from a pinned local copy:** `geist-latin.woff2` copied from Next's package to beside the template, with
  **[B2] `OFL.txt`** (OFL 1.1 requires the notice and licence to travel with every copy, and this folder is copied into
  every workshop). B2's weight check: done, variable (Versions).
- **[B1] Loaded EXPLICITLY, asserted POSITIVELY** (⚠ `document.fonts.check()` returns TRUE when no `@font-face` matches
  the family at all, and `fonts.ready` resolves when nothing was requested, so neither can catch a missing font): Node
  reads the `.woff2` and passes the BYTES in; the page runs `new FontFace("Geist", bytes, { weight: "100 900" })`,
  `await f.load()` (a failed load throws and the run STOPS), `document.fonts.add(f)`; then asserts
  `[...document.fonts].some(f => f.family === "Geist" && f.status === "loaded")`. Bytes, not a `file://` URL, so no
  file-origin question arises. (Proved on the scratch weight test: `loaded: true`.)
- **Title card** (~3 s, crossfading into the film): the gold mark, Geist, the title, the client, the date and the
  version or "Draft" (A5). ⚠ The look is the Builder's take, judged by Carl's eye.
- **Captions:** lower or upper third (A11), a dark translucent band, from the scene's start to its end, short fades.
- **[A8][B3] Timing anchored to t0: the FIRST screencast frame for the proof film, the CUT frame (after `ready`) for a
  client film** (else every caption arrives early by the cold load's length): each scene logged against t0 (Chrome's frame timestamps
  and Node's `Date.now()` read the same system clock; a scene starts when Node issues the action, a few to tens of ms
  before the page responds).
- ⛔ No em dashes in the template's own words.

**6. The file, email-ready.** H.264 High, `+faststart`, 1920 × 1080, 30 fps, no audio. **[A6] Colour tagged**
(screencast JPEGs are full-range BT.601; an untagged file shifts the gold and the dark between phone and desktop):
**[B4] ONE filter graph, the colour converted ONCE, LAST:** decode the frames → overlay the title card and caption PNGs
(their fades in RGBA) → `scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`, then `-colorspace bt709
-color_primaries bt709 -color_trc bt709` (converting the PNGs separately would convert twice and could step the gold
where a caption fades). CRF 20; over **10 MB** (Gmail takes 25 MB) → two-pass to 9.5 MB. **[size]**
⚠ Above ~60 s the report WARNS (9.5 MB over 2 min is ~630 kbit/s and the dark grounds band); the fallback is **720p**,
not a starved bitrate.
- **[A5] Drafts and versions (Carl's call, Open 2):** by default `<feature>-draft.mp4`, overwritten, "Draft" on the
  card; `--release` claims the next version (`-v1`, `-v2` …). Written to a temporary name and RENAMED at the end, so a
  failed run claims nothing. **[B6] The rename on Windows:** over a draft open in a player it fails (EBUSY / EPERM); caught
  and reported in words, *"Close <file> and re-run"*, the finished film KEPT under its temporary name so the capture is
  not lost; never a raw stack trace.
- **[B7] `--out` may not point INSIDE the repo:** the runner REFUSES an `--out` that resolves under the repo root
  (Carl's answer 1 would be undone silently). Paths built with `path.join`; ffmpeg spawned with an ARGUMENT ARRAY, never a
  shell string (`C:\Users\Carl Buckley\Videos\C2B Client Films\…` has spaces).
- **ffmpeg:** found on PATH, or the `FFMPEG` environment variable; its version printed in the report.

**7. The proof film:** `/start` from the opening through Begin to a first answer hovered and chosen, against a
production build (`npm run build && npm start`, port 3100), the COLD LOAD included (it tests the capture; A12 keeps it
out of client films).

## Files

| File | |
|---|---|
| `scripts/client-film/film.mjs` | NEW. The runner: `node scripts/client-film/film.mjs <film module> [--release]` |
| `scripts/client-film/cards.html` | NEW. The title card and caption template |
| `scripts/client-film/geist-latin.woff2` | NEW. The pinned Geist (A4), variable (B2) |
| `scripts/client-film/OFL.txt` | NEW. Geist's licence, from vercel/geist-font (B2) |
| `scripts/client-film/films/start-opening.film.mjs` | NEW. The proof film |
| ~~`.gitignore`~~ | Not touched: the output is outside the repo (Carl's answer 1) |

**Scope bookkeeping:** this chunk runs ALONGSIDE the bench polish (`camera-pad.ts`, `camera-bench.tsx` open on Carl's
"Keep open until i ask you to close them", both with uncommitted changes), with its own `_clientFilm` entry in
`chunk-scope.json` and the new paths added to `files` once Carl names them. None protected. ⚠ `npm run build` compiles
the bench's in-progress changes too: if they are broken mid-edit, the proof film cannot run (`tsc` and lint MEASURED at
the checkpoint, not asserted here: the bench files have uncommitted changes). **Servers:** the proof uses production on 3100, the bench dev on 3000; before the checkpoint both are killed by
PID and the ports confirmed free (CLAUDE.md workflow 5).

**Workshop rule** (`live-work/references/workshop-template-and-client-delivery.md`): the runner, template and font are
TOOLS and stay with the workshop; a client's film definitions and MP4s are what was made. ⚠ `films/start-opening.film.mjs`
is C2B-specific code in a tool folder: the same open question as the reference's Open Question 2 (`verify/`).

**Record:** a new D-entry in `decisions.md` when Carl approves, not only this plan.

## §5b: what depends on the current structure

Nothing: no existing file changes. `verify/`'s films keep
`recordVideo`, which is right for measuring. The harnesses' port 3100 convention is reused, not changed.

## Verification

1. **[A2][B5] The capture, measured first, DURING MOTION, ON THE HARDEST PAGE** (the screencast sends frames only when
   the compositor draws, so a still page's gaps are idle, not drops): a temporary `requestAnimationFrame` ticker injected
   for the measurement only, on `/start` (production, 3100) through the opening and Begin, WebGL active, at 1080p. Reported: frames per second, and the COUNT of gaps over 50 ms (not only the longest). The capture choice
   (A1) stated with the numbers.
2. **[A4][B1] The font check** passes before any card is rendered; **broken on purpose** (a wrong font path) the run
   STOPS. **[B2]** the 400 / 600 / 700 comparison saved as a screenshot (done once at planning; repeated against the
   pinned copy).
2a. **[B3] The first frame after the cut** saved as a still: Carl checks it is settled, not mid-fade.
3. **The file, by `ffprobe`, in the runner's report:** h264, 1920 × 1080, 30 fps constant, **color_space=bt709,
   color_range=tv** (A6), under 10 MB; **duration = title + film − the crossfade (±0.2 s)** (A8); each caption's on / off
   times against its scene's log, from t0.
4. **[A3] Clean-up:** the temporary frame folder gone after success; nothing but the MP4 in the output folder.
5. **[A5] A failed run claims no version** (forced failure: a selector that does not exist); `--release` twice gives v1
   then v2, v1 untouched; a draft overwrites the draft. **[B6]** a draft run with the previous draft OPEN in a player:
   a clear message, no crash, the capture kept. **[B7]** `--out` inside the repo: refused.
6. `npm run lint`: 1 error 0 warnings.
7. ⚠ **The report declares what it does NOT watch:** how the film LOOKS (Carl's eye), whether it plays in a client's mail
   app (Carl emails it to himself and opens it on his phone), the feel of the scripted cursor.
8. **Carl watches the proof film** (one take, its folder opened) and judges the title card, captions and cursor by eye.

## Carl's answers (27 October 2026)

Given in the question dialog, each by choosing one option; his choices, verbatim: *"Videos\C2B Client Films
(Recommended)"*, *"Drafts, --release numbers (Recommended)"*, *"Cut in when the page is ready (Recommended)"*, *"No end
card (Recommended)"*. The fifth (the title card's look) was not asked: agreed by the Architect as the Builder's take.

1. **Where the MP4s go: `Videos\C2B Client Films\<client>\<feature>\`**, outside the repo, beside `Videos\C2B Films`.
   Reason: workshops are made by COPYING, and `.gitignore` is "a convenience, never the protection" (the workshop
   reference); a folder in the repo would travel into the blueprint and the next client's workshop. ⇒ **No `.gitignore`
   change**; the runner takes `--out` to override.
2. **Drafts by default, `--release` numbers (A5)**, so the client only ever sees v1, v2, v3 in order.
3. **Client films start from a readiness cut (A12)** (`ready`); the cold load only in the proof.
4. **No end card.**
5. **The title card's look:** the Builder's first take, by Carl's eye (agreed by the Architect).
