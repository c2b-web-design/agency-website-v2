# Run log — chunk A: real text inputs over the contact field

**31 July 2026.** Chunk `contact-field-text-inputs`, the first of three.
**Plan:** `C:\Users\Carl Buckley\.claude\plans\plan-mode-selected-declarative-valley.md`

⚠ **Not approved.** This records what was built and measured. Carl judges whether it is right.

---

## What was built

Four real DOM text inputs and four labels, positioned over the WebGL boxes.

| File | Change |
|---|---|
| `contact-field-inputs.tsx` | **NEW.** The whole chunk — host, placement, focus gate, value state |
| `contact-field-geometry.ts` | `fieldDomPlacements()` + `LABEL_BLOCK_PX`. Pure addition |
| `contact-field-canvas.tsx` | ⚠ **One word:** `const FIELD_ENTRANCES` → `export const`. Plus its type |
| `enquiry-opening.tsx` | ⚠ **Two lines:** one import, one sibling element |

**Out of scope and untouched:** rim behaviour (chunk B), masked reveal and autofill cascade
(chunk C), and submission — Carl: what happens to the Q&A answers and personal information is
**a later session**.

---

## The load-bearing fact

⚠ **1 world unit == 1 CSS pixel exactly**, because the canvas uses an orthographic camera at
`zoom: 1`. That is the only reason DOM elements can be positioned over WebGL geometry with plain
pixel arithmetic. **Measured 0.00px delta on all four boxes** — not "close enough", exact.

**Placement inverts `fieldPlacements()` output rather than re-deriving from the constants**, the
rule `sharedFieldWindow` already follows. A CSS grid reproducing the original form would have
expressed the placement in a second language: agreeing today by coincidence of shared inputs, and
silently disagreeing the moment `ROW_PITCH_PX` moved.

⚠ **Verified with a throwaway probe BEFORE any JSX existed**, with two independent checks —
round-trip at five widths, and hand-computed values at 576×184. **The round-trip alone would
have passed on a sign error**, which is the failure mode that recurred three times earlier today.

---

## Labels fade in with their own boxes

Carl: *"All labels can arrive on screen with their respective boxes. Fade in with them."*

Label and input share **one clock**, reading the same `FIELD_ENTRANCES` entry the WebGL box
reads. A retimed cascade moves all three together.

⚠ **This is why the export was needed.** `FIELD_ENTRANCE_END_MS` carries only the aggregate; a
per-box fade needs per-box delays. **Exported rather than copied** — restating 3600/4100/4600/5100
in the DOM layer would have been the **fourth** hard-coded copy of a timing that went stale three
times today, including the one that had Carl judging screenshots taken mid-cascade.

### ⚠ THE GUARD BLOCKED THIS, AND THE BUILDER STOPPED

The scope guard denied the edit: `contact-field-canvas.tsx` was `protected`. **The Builder had
written that scope file itself an hour earlier.**

⚠ **It did not edit its own scope file to proceed.** Unlocking is Carl's call, and routing around
a self-authored control would be the DL-1 pattern *deliberately* rather than accidentally. It
stopped, stated the change, the reason and the risk, and asked. Carl: *"add."*

**Both unlocks are narrow and recorded in `chunk-scope.json` with their authorisation.** No
value, ordering or masking behaviour changed; the *"close enough is not approved"* reservation on
the entrance timings is untouched.

---

## The white labels — built wrong, corrected by eye

**Built at full white**, on Carl's instruction that they take *"the same colour as the
questions"*. ⚠ **Rendered, that was too strong** — the labels became the loudest element in the
composition, competing with the gold rim rather than serving it. **The Builder flagged it rather
than letting it pass.**

Carl: *"the white is a little prominent and competing. Needs to be toned down a little. **Not
grey. Grey only works when its subtext.**"*

⚠ **The distinction is the whole finding.** Grey says *de-emphasised background information*;
these are **field names that must be read**. The fix is to lower white's weight, not to change
its family.

**Bracketed by eye at 1.0 / 0.85 / 0.75 / 0.65.** 0.85 was indistinguishable from full white.
**Settled at `white/75`.**

⚠ **AND THAT VALUE WAS ALREADY ON THIS SITE.** 0.75 is the corridor's active Q-label
(`.enquiry-pdepth-0 .enquiry-phrase-cue`), whose comment records the identical finding in almost
the same words: *"Was 0.28, which read as grey rather than quiet."* **The same question was asked
and answered here once before.** Reused rather than re-invented.

---

## The plan-review gate found six things; two inverted the Builder's reasoning

Full detail in the plan file. The two that mattered most:

⚠ **B-2 — `readOnly` was self-defeating.** The plan rejected `disabled` because disabled inputs
are excluded from autofill, **then chose `readOnly`, which Chrome also declines to autofill** —
`readonly` plus a focus handler is the standard published trick for *suppressing* autofill.
**Verified against external sources rather than accepted on recollection.** It would have broken
chunk C's foundation and not surfaced until chunk C.
**Corrected: gate REACHABILITY, not editability** — `tabIndex` and `pointerEvents`. A password
manager's programmatic fill is unimpeded.

⚠ **★ The labels would have appeared 3.6s before their boxes.** The layer becomes visible at
completion-clock zero; box 1 starts fading at 3600ms. **The plan's "labels fill a reserved gap"
claim was true spatially and false temporally** — and the plan never noticed. Carl chose the
per-box fade, which resolves it.

**F-1 invalidated earlier work:** `verify/field-colour.mjs` waited 5200ms for an 8100ms cascade.
Corrected, with a guard that re-reads `FIELD_ENTRANCES` from source and exits non-zero if its
copy drifts. See the correction at the top of `run-log-field-step3.md`.

---

## Verification

| Check | Result |
|---|---|
| Alignment at 1440 | **0.00px** delta, all four boxes |
| **WebGL render unchanged** | ⚠ **0 differing subpixels** across both box rows; gold metrics identical (19504 lit px, 50th 173, 95th 191) |
| Focus gate | `tabindex=-1` at 1000ms; `0` after the cascade |
| Typing | Works |
| Tab order | name → business → website → email (row-major) |
| Reduced motion | Reachable at 600ms — **no 8.1s wait** |
| `npx tsc --noEmit` | clean |
| `npm run lint` | **1 problem (1 error, 0 warnings)** — recorded baseline |

**Two lint errors were introduced and FIXED, not suppressed:** a ref written during render (a
discarded render would have left a stale callback) and an unnecessary disable directive.

⚠ **The pixel-identical result is the decisive check** — it proves the DOM layer composites above
the canvas without disturbing it. No stray background, no `backdrop-filter`, nothing bleeding
through.

---

## For Carl's eye

1. **The labels at `white/75`** — the value above, now rendered.
2. ⚠ **Narrow viewports.** At 390px each box is 167px wide, ~143px of text room, so a long
   business name scrolls horizontally. **Inherited geometry, not new** — the removed CSS form had
   the same dimensions and was approved — but it was approved as a *flat surface*, and scrolling
   text inside a rendered object with a gold rim is more noticeable.
3. ✅ **Autofill appearance — VERIFIED IN REAL CHROME, 31 July 2026. The defeat HOLDS.**

   Carl's result: **"Box interiors are unchanged during all previous processes described."**

   Chrome forces `background-color: rgb(232,240,254)` on an autofilled input through a UA style
   that ordinary CSS cannot beat. On this design that would have been a flat pale rectangle over
   the satin field, inside the gold rim, on every filled box — **the most likely visual
   regression in the chunk.** The defeat (a 600000s `background-color` transition so the colour
   never visibly arrives, plus `-webkit-text-fill-color` for the text) works.

   **Also confirmed by the same run:** the `autoComplete` tokens are right. Chrome recognised
   the four boxes as a fillable field set and offered Name and Email. ⚠ Had the tokens been
   wrong — the `organization`-not-`company` trap — **no dropdown would have appeared at all.**

   ⚠ **ONLY A HUMAN COULD HAVE VERIFIED THIS.** Playwright setting an input's value takes a
   different code path and never applies `:-webkit-autofill`, so the pseudo-class this entire
   defeat targets would never have fired in an automated test. **An automated pass would have
   been meaningless, not reassuring** — the same shape of false confidence as the harness that
   sampled mid-cascade.

   ### ⚠ AND IT SURFACED A REQUIREMENT FOR CHUNK C

   Carl's description of the interaction, which is more detailed than the pass/fail:

   > *"Click inside Box 1. Text box appears. **Hover over text box and saved information is
   > displayed in the fields.** Pressing the text box and the text expands slightly in the
   > fields."*

   ⚠ **HOVERING A SUGGESTION PREVIEWS IT INTO THE REAL FIELDS, WITH NO COMMITMENT** — and moving
   away withdraws it. So values can appear in all four boxes and then vanish, without the user
   having chosen anything.

   ⚠ **Chunk C's cascade must not fire on a preview.** The rims and the masked reveal would run
   for text that disappears a moment later. **This is the same class of problem as IME
   composition — a real value in a provisional state** — and the same answer applies: the signal
   must distinguish committed content from in-flight content, not merely observe that a field
   is non-empty.

   ⚠ **The Builder misread this exchange twice before Carl corrected it**, first treating the
   dropdown's appearance as proof of the fill and then treating a hover as a non-event. **The
   requirement above exists only because Carl described what he actually saw rather than
   answering the question that was asked.**

   ### The committed fill, screenshotted — all four boxes, localhost

   Carl then completed a real autofill. **All four boxes filled, all four rims lit, satin
   intact behind every one.** The chain had run correctly: content in boxes 1–3 lit rims 2, 3
   and 4. **Chunks A and B verified together, under real use.**

   Also visible: **the white input text reads well over the satin** — better than the luminance
   margin predicted — and legibly in all four boxes despite each being a different window onto
   the field.

   ⚠ **AND THE OVERFLOW RISK APPEARED AT FULL DESKTOP WIDTH, not just at 390px.** The saved
   Website value (`agency-website-v2-awjv.vercel.app/start`) is longer than the 284px box, so
   the text scrolled and **clipped at the LEFT edge — the visible portion is the END of the
   string, not the start.**

   **This was a genuine saved value, not a contrived test string**, which is what makes it
   worth recording: a real URL someone would really autofill overflows the approved box at the
   widest layout. The risk was logged as inherited geometry and a narrow-viewport concern; it
   is neither. **Open for Carl — no change made.**
4. **Mobile keyboard** behaviour on a real device — Playwright cannot emulate the keyboard inset.

---

## Built for chunk B, consumed by nothing

`FieldStateSnapshot` is computed and exposed via an optional `onFieldStateChange`. **Chunk A
passes nothing.** State-based, not event-based, per the design record — so paste, dictation, IME,
browser-restore and password managers stop being special cases.

⚠ **`becameFilled` is included now because it is structurally uncomputable downstream:** a
consumer given only `values` must diff against a remembered previous, so every consumer would
hold its own history and they would drift.

**IME composition and the mount-time restored-value sweep are both built** — the latter because
browser-restored values fire **no event at all**, which the design record names as the worst
failure mode precisely because it fails silently.

---

*Chunk A complete. **No commit made** — Carl has not asked for one.*
