# `/about` scaffolding — the D-065 delivery measurement. 31 August 2026

**This is how D-065's approval-on-delivery is discharged.** Carl: *"If, and excuse the pun, you are
given instructions to nail the about logo and you do, then approved. By what method? Thats your
domain, i care about outcome."* ⚠ **The figures are reported alongside the visual evidence, as part
of the chunk's delivery — not as a later step. That is what makes it checkable rather than the
Builder's word (Rule 9).**

**Build:** production (`npm run build`), served `npx next start -p 3100`.
**Browser:** Chromium, **HEADED**, `deviceScaleFactor: 1`.
**Script:** written to the scratchpad and run from the repo root for module resolution, **then
deleted. Deliberately NOT filed in `verify/`** — see *On the harness* below.

---

## ⛔⛔ WHY HEADED, AND WHY IT IS NOT OPTIONAL

**Headless Chromium has no scrollbar.** On 27 August it reported `x=112` on both routes and a
**0.00px difference while the real defect was 7.35px** — half a scrollbar, because `Container` is
`mx-auto` and the loss splits evenly. ⛔ **A headless green here is the instrument being blind, not
the page being correct** (D-062).

⚠⚠ **AND THIS CHUNK WALKED STRAIGHT INTO THE CONDITION THAT PRODUCES IT.** The measured document
heights below show **`/about` SCROLLS (1511px) while `/start` DOES NOT (900px)** — exactly the
asymmetry that put the landing page and `/start` 7.35px apart before `scrollbar-gutter: stable`.
⛔ **The gutter rule is what makes them agree, and a headless run could not have shown it working.**

---

## The figures — RAW `getBoundingClientRect()`, four browser-reported numbers per route

### 1440 × 900

| route | left | top | width | height | scrolls | doc |
|---|---|---|---|---|---|---|
| `/` | **104.8598** | **19.9908** | 69.9104 | 39.9931 | true | 2968 |
| `/start` | **104.8598** | **19.9908** | 69.9219 | 39.9931 | false | 900 |
| `/about` | **104.8598** | **19.9908** | 69.9219 | 39.9931 | true | **1511** |

### 375 × 812

| route | left | top | width | height | scrolls | doc |
|---|---|---|---|---|---|---|
| `/` | **15.9926** | **19.9908** | 69.9104 | 39.9931 | true | 3877 |
| `/start` | **15.9926** | **19.9908** | 69.9219 | 39.9931 | false | 812 |
| `/about` | **15.9926** | **19.9908** | 69.9219 | 39.9931 | true | 1781 |

⛔ **`left` and `top` are IDENTICAL across all three routes at both viewports.** Not approximately —
the same number.

### Derived letterform centre — computed FROM the rects above, for presentation only

| viewport | `/` | `/start` | `/about` | spread |
|---|---|---|---|---|
| 1440 | cx 139.8518 | cx 139.8575 | cx 139.8575 | **0.0058px horizontal** |
| 1440 | cy 38.3332 | cy 38.3332 | cy 38.3332 | **0.0000px vertical** |
| 375 | cx 50.9846 | cx 50.9904 | cx 50.9904 | **0.0058px horizontal** |
| 375 | cy 38.3332 | cy 38.3332 | cy 38.3332 | **0.0000px vertical** |

⚠ **The 0.0058px horizontal spread is between `/` and the two nail-placed routes, and it is the
KNOWN artefact D-063 already records** — the landing page's `<img>` renders at width 69.9104 against
the nail's 69.9219, a 0.0115px frame difference resolving to 0.0058px at the centre. ⛔ **`/start`
and `/about` agree to 0.0000px on both axes.** **D-062 recorded 0.0058 horizontal / 0.0064 vertical
across the three states then existing; this measurement is inside that.**

---

## ⚠⚠ THE MEASUREMENT DOES NOT SHARE A CONSTANT WITH THE IMPLEMENTATION

⛔ **An earlier draft of the plan specified "the letterform centre", and that was a defect.** The
centre is not something a browser reports — it is derived through `MARK.gold.cx/cy`, **the very
fractions copied into the new file.** Computing it on all three routes would put the same value on
both sides of the comparison: **a mis-transcribed fraction would have produced three agreeing numbers
and a mark in the wrong place.**

⚠ **This is the recorded harness-lies class** — `cross-section.mjs`'s duplicated `BEVEL_WIDTH`, and
the rule from the Q5 stutter: *a harness derived from the same constant as the fix is not an
independent check.* **Caught by the Architect (F2), not by the Builder.**

**So the rects are published raw.** The centre is derived afterwards, from those published numbers.
⛔ **A wrong constant would show as disagreeing rects, and the rects agree.**

---

## The containing-block check (F3)

⚠ **`context-rules.md` records the 18 August failure: computed `left/top` read 654.7 / 616.8 —
correct — while the element PAINTED at 1080 / 879**, because an ancestor established a containing
block. *"Caught by Carl looking at the screen, not by any instrument."* ⛔ **The `/about` wrapper is
new code written in this chunk.**

| viewport | computed | painted |
|---|---|---|
| 1440 | `left: 2.9952e-05px, top: 2.44099e-05px` (position: absolute) | left 104.8598, top 19.9908 |
| 375 | `left: 2.9952e-05px, top: 2.44099e-05px` | left 15.9926, top 19.9908 |

⚠ **The two are in different coordinate spaces by design** — computed is relative to the offset
parent, painted is viewport. **The check is that the PAINTED position matches the other routes, and
it does, at both widths.** ⛔ **A containing-block fault would show as a painted position
disagreeing with `/` and `/start` while computed looked correct. It does not.**

⚠⚠ **AND THE COMPUTED VALUE IS ITSELF CONFIRMATION:** `left` and `top` resolve to **~0.00003px —
effectively zero**, which is D-062's independent finding restated. *"The gold's placement computes
to `left: 0, top: 0`, independently confirming the nail agrees with the landing page's approved
position."* **The nail lands on `Container`'s content origin exactly.**

---

## Two viewports, not one (F4)

⛔ **D-065 says the mark occupies the same point on EVERY route — not "at 1440px."** `Container` is
`px-4 sm:px-6 lg:px-8`, so **the content-left edge moves at breakpoints** (104.8598 → 15.9926), and
the three routes agree at every width only because all three resolve through `Container` —
**precisely the coincidence D-065 calls unasserted.**

⚠ **`opening-arm.mjs` running only at 1440px is on this project's record as one of the seven harness
lies.** **Measured at 375 as well: the routes still agree exactly.**

---

## ⛔ On the harness — the honest status, unchanged

⚠⚠ **THIS IS A ONE-OFF DELIVERY MEASUREMENT. IT IS NOT AN ASSERTION OF THE INVARIANT.**

⛔ **No `verify/` script was added, deliberately.** `verify/proven.json` lists **ZERO** proven
instruments, and `run.mjs` suppresses the pass verdict of any unlisted script. A new script would be
**unproven by construction** — no red run, no empty-input control, no stability declaration — and
filing it would manufacture the exact false credential that file exists to prevent (D-064).

⛔ **D-065'S STATUS IS UNCHANGED: UNASSERTED — VERIFY BEFORE RELYING ON THIS.** Nothing in code
checks that the three mechanisms agree. **They agree because all three resolve through `Container`,
not because they share code** — and after this chunk that is **two copies of the nail constants and
three mechanisms reaching one point.**

⚠ **The harness is owed when the header work lands**, because that is when the sharing question is
settled. Recorded in D-065 and unchanged by this measurement.

### ⚠ What this measurement does NOT watch

**It reads RECTS.** It says nothing about colour, opacity, paint, z-order, or whether the mark is
visible at all — **it would pass on a page rendering a transparent image.** ⛔ **It is not a
substitute for looking at the screenshots**, which is why they are part of the same delivery.

---

## Visual evidence

| file | what |
|---|---|
| `shots/about-scaffold-1440-viewport.png` | `/about` at rest, 1440×900 — mark gold, top-left |
| `shots/about-scaffold-1440-full.png` | full page — all four sections including the TBD placeholder |
| `shots/about-header-link-1440.png` | the landing-page header showing `About` |

**Inspected, per Rule 9.** The mark renders gold at the top left in the same position as the other
routes; the four sections read in sequence; the TBD heading is dimmed (`text-neutral-500`) and reads
as a deliberate placeholder rather than an unfinished heading.

## Acceptance test — the originating defect

⛔ **The defect that started this chunk is a link that READS AS BROKEN**, so only navigating it
proves the fix.

    About href = /about
    landed on  = http://localhost:3100/about
    h1         = How the work gets done.
    ✅ PASSED

---

## Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run lint` | **1 error** — the known accepted baseline (`enquiry-opening.tsx`, `react-hooks/set-state-in-effect`). ⚠ **Unchanged.** |
| `npm run build` | **compiled successfully**; `/about` prerendered static |

⚠⚠ **A DISCREPANCY IN THE RECORDED BASELINE, FLAGGED NOT FIXED.** CLAUDE.md records the baseline as
**`1 problem (1 error, 0 warnings)`**, verified 24 July 2026. **Today's run reports 6 problems
(1 error, 5 warnings).** ⛔ **The ERROR count is unchanged and is what the baseline pins.** The five
warnings are `@next/next/no-img-element` ×4 and one unused variable:

| warning | file | mine? |
|---|---|---|
| `no-img-element` | `app/start/page.tsx:209`, `:226` | **no** — pre-existing |
| `no-img-element` | `components/layout/site-header.tsx:76` | **no** — pre-existing |
| `'showBlue' unused` | `app/start/page.tsx:109` | **no** — pre-existing |
| `no-img-element` | **`app/about/page.tsx:132`** | ⚠ **YES — this chunk** |

⛔ **Four of the five pre-date this chunk and are not mine to fix** (CLAUDE.md: *unrelated
pre-existing errors — flag to Carl; do not silently fix*). **The fifth is mine, and it is the
identical `<img>` pattern both approved routes already use** — `next/image` on the mark would change
how it loads and is not a decision for a scaffolding chunk. ⚠ **The "0 warnings" figure in CLAUDE.md
appears to have gone stale rather than a regression having occurred; the error count it pins is
intact. Carl's to rule on.**

---

## The unlock — opened and closed

⛔ **Carl authorised `components/layout/site-header.tsx` on 31 August 2026:** *"You are authorised
to use site-header.tsx  Lock it after use."*

| step | result |
|---|---|
| `chunk-scope.json` written, naming that one path | done — authority recorded in its `_comment` |
| the edit | **one line**: `href="#"` → `href="/about"`. `git diff --stat`: **1 file changed, 1 insertion(+), 1 deletion(-)** |
| `chunk-scope.json` deleted | done |
| ⛔ **re-verified BY A REAL DENIAL** | **SCOPE GUARD denied an Edit to `site-header.tsx`** — probe refused, file untouched |

⚠⚠ **THE DENIAL IS THE POINT, NOT THE DELETION.** The guard **fails OPEN on an absent scope file**,
so a deleted file and a broken guard look identical from the outside. **Only the permanent list
denies there, and only a real attempt proves it.** This is the standard set on 28 August: unlocks are
*"closed and RE-VERIFIED BY OBSERVING A REAL DENIAL."*

---

*31 August 2026. **The mark lands on the same point at both viewports, and `/about` scrolls where
`/start` does not — the exact condition that produced the 7.35px defect, held by
`scrollbar-gutter: stable`.** ⛔ **The invariant remains UNASSERTED; the harness is owed when the
header work lands.***
