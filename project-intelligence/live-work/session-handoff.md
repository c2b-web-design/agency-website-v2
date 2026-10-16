# Session Handoff — 16 October 2026. THE PLANET ON BEGIN (APPROVED, PUSHED). NEXT: THE CORRIDOR TEXT'S COLOUR — DOM, NOT THREE.JS.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 15 October's (session 3).

---

## ⛔⛔ NEXT SUBJECT (Carl)

**The corridor text's COLOUR. It stays DOM.** The three.js conversion was attempted on 16 October and WITHDRAWN by Carl; its code, plan and discussion were deleted on his instruction. Carl: *"what this section needs is just a colour change to the text."*

The colours, decided and re-confirmed (*"the colours decided on today are right… the ice blue that should be used is the same as the text on the next step button"*): **`decisions.md`, D-023 "THE THREE.JS CONVERSION WITHDRAWN; A COLOUR CHANGE ONLY"** — focus question + its number ICE BLUE #CFE6FF; answered question + its number PLATINUM BLUE #3F6DB8; its answer a shade paler (reads as just in front); teal and gold retired; the cards' labels ice blue at rest, platinum on hover AND while selected; the recession by opacity and size, unchanged. The problems they answer and the measured contrasts are in the same entry.

- ⛔ **The scope is CLOSED TO CODE** (`chunk-scope.json`, `closed-to-code`, records only). Carl names every file. The corridor's colours live in `app/globals.css` (the `.enquiry-pdepth-*` rules); the cards' labels in `components/enquiry/answer-card-mesh.tsx` (PROTECTED — baked into the face texture, D-051; `LABEL_INK_REST`, `LABEL_INK_HOVER`, and the hover only today — selection must now hold platinum too).
- ⚠ **Clarity bound (Carl):** the current and previous question must stay clear — platinum blue is quieter on space than today's teal (4.0 vs 11.7 : 1). Judge on the page.

**The order after it (Carl):** `/about` §3 (film 01, the four boxes, the player) → two home sections → the hero, last. ⛔ Deadline 19 November 2026; mastering after it.

## WHERE THINGS STAND — all PUSHED

| commit | what | verdict |
|---|---|---|
| `653ca99` | the planet OUT of the opening, fading in on Begin over the crawl's 2.6 s with the logo's crossing; the space images requested on existing beats (the planet when the opening arms, the galactic centre on Begin) | R-072 *"fade is good… approved"*; the loading delegated, A/B measured |
| `0159c9b` | records: the corridor stays DOM, colour only; protected files relocked and tested | — |

## ⚠ STANDING / LESSONS FROM 16 OCTOBER

- ⛔ **Not every section needs three.js** (Carl — *"another VST in the mix"*; memory `feedback_not_every_section_needs_threejs`). Ask whether an element's size lets an effect be SEEN before proposing a mechanism.
- ⛔ **Never hand Carl a panel of parameters to tune.** He judges one finished take; the technical values are the Builder's. And a change to how approved work LOOKS (today: thinner letterforms) is never slipped in under a technical choice — measured fidelity first.
- **Lock probes must change a NON-whitespace character** — the Edit tool strips trailing spaces and refuses before the guard runs (memory updated). All 31 protected files + three code files probed today: denied.
- **The dev server served stale `globals.css` again** after an Edit — a second edit woke it. Check the served stylesheet after CSS edits.
- The guard covers Edit/Write only; shell writes are behavioural (Carl asked; options offered — OS read-only flags, a shell-aware guard, a pre-commit check — none chosen).
- Servers STOPPED (:3000 and :3100 free). Lint baseline 1 error, 0 warnings.

---

*Written 16 October 2026, end of session. Replaces 15 October's (session 3).*
