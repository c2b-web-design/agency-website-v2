# Verification harness

**The feedback loop.** Scripts here let the Builder *see* what a change actually renders,
rather than reasoning about what it probably renders.

Added 27 July 2026. Playwright is pinned to an exact version — see "Why the version is
pinned" below.

---

## Why this exists

Boris Cherny, who created Claude Code, on the single biggest lever for output quality:

> *"Probably the most important thing to get great results out of Claude Code — give Claude a
> way to verify its work. If Claude has that feedback loop, it will 2-3x the quality of the
> final result."*

And the framing that sharpens it: **the prompt matters, but the feedback loop matters more by
a wide margin.**

Without a loop, the Builder writes CSS and *reasons* about the result. That is a guess. For a
project whose work is glass materials, filament borders, gold bevels and choreographed timing,
guessing is the weakest possible position — and it is weak in exactly the place the work is
most demanding.

---

## What this is NOT

**Verification is not approval.** This is the line that matters, and it does not move.

A loop closes the gap between *"I wrote code"* and *"I saw what the code does."* It does not
close the gap between *"it renders"* and *"Carl approves it."*

- **The loop answers:** is it what I think it is? Measurable, repeatable, no opinion involved.
- **The Architect answers:** did this chunk honour the design intent, hold its scope, and is
  the evidence file's claim actually true?
- **Carl answers:** is it right?

`architect-role.md` §1 is unchanged by any of this: *a reviewer who has been implementing
approves; one reasoning independently from files catches drift.* **A Builder that can see its
own output is still the Builder.** Better input to review — never a substitute for it.

**Nothing here may conclude "done."** It reports *"these measurements now pass."*
Definition-of-done is a chunk field Carl approves, not something a script discovers.

---

## Why the version is pinned

`@playwright/test` is `"1.62.0"` — **exact, no caret.**

The project's evidence includes claims like *"0 differing pixels of 3,686,400 vs approved
baseline"* (24 July). **A baseline is only meaningful if the thing generating it is fixed.** A
caret range would let `npm install` shift the renderer, and a pixel diff against a baseline
drawn by a different Chromium is not a comparison — it is noise that looks like a finding.

Earlier sessions ran Playwright through `npx playwright@latest`, which resolves to whatever is
newest that day. That produced the screenshots in `live-work/screenshots/` but left nothing in
`package.json`, so the version behind those images is unrecorded and unrecoverable.

**Browsers are cached at `~/AppData/Local/ms-playwright` (~690 MB) and were already present** —
installing added 3 packages and no download.

---

## Usage

The dev server must be running (`npm run dev`) unless a script starts one itself.

```
npm run verify:shot -- <url-path> <output-name>     capture a screenshot
npm run verify:responsive -- <url-path> <name>      capture at 4 widths
```

Output goes to `project-intelligence/live-work/screenshots/`, matching the existing
convention: name by **what it shows**, not when it was taken — `contact-field-gold-closeup`,
not `screenshot-3`.

---

## Reporting into a checkpoint

State **what was measured and what was not.** A reviewer must be able to tell a measured claim
from the Builder's opinion — that separation is what caught a false "byte-identical" claim in
D-032.

Good: *"Silhouette 284 × 38 at left 0, top 50, measured. Responsive 1440→284, 900→284,
600→272, 390→167, measured. Whether the gold reads as architectural rather than brassy is not
measured and is Carl's call."*

Bad: *"Verified and working."*

---

## Known limits

- **Screenshots prove rendering, not intent.** A perfectly-rendered wrong design passes.
- **A pixel diff is only as good as its baseline.** An approved baseline is approved; a
  convenient one is a trap.
- **Cropped comparisons have burned this project before.** On 22 July a close-up crop taken at
  a different origin than its baseline reported 53–59% of pixels differing — a measurement
  error, not a change. Full-page comparison gave 0. **Derive close-ups from the verified
  full-page image so framing cannot diverge.**
- **`readPixels` on the WebGL canvas returns empty** — `preserveDrawingBuffer` defaults to
  false, so the buffer is cleared after compositing. This looks exactly like "nothing
  rendered" and is not. Measure from a screenshot.
