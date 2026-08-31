# Run log — the `/about` scaffolding chunk. 31 August 2026

**Chunk:** `about-scaffolding`. **Plan:** written in Plan Mode, reviewed by the Architect, approved
by Carl. **Measurement record:** `about-scaffold-measurement-31-august.md`. **Decision:** **D-066**.

---

## What was built

| # | step | file | result |
|---|---|---|---|
| 1 | the link made hot | `components/layout/site-header.tsx` | **one line**: `href="#"` → `href="/about"` |
| 2 | the page created | `app/about/page.tsx` | **new**, 4 sections, server component |
| 3 | the mark nailed | `app/about/page.tsx` | gold, second copy of the nail constants |
| 4 | the measurement | — | headed, 2 viewports, 3 routes |

**`git diff --stat` on the protected file: `1 file changed, 1 insertion(+), 1 deletion(-)`.**

---

## The order things happened, and one thing that went wrong

1. Read the handoff, `open-defects.md`, `current-sprint.md`, `context-rules.md` in full.
2. Verified session-start state: tree clean at `285702a`, `chunk-scope.json` absent, `/about` absent.
3. Wrote the Architect prompt (`architect-prompt-about-scaffolding.md`), Carl approved it.
4. Wrote the plan in Plan Mode. Carl carried it to the Architect; findings came back as F1–F10.
5. **Applied F1–F6 and F10 to the plan before writing any code.** F7 and F8 went to Carl.
6. Carl authorised the F7 heading and the `site-header.tsx` unlock.
7. Wrote `chunk-scope.json` recording Carl's grant, made the one-line edit, deleted the scope file,
   **re-verified the lock by a real denial.**
8. Gates, headed measurement, screenshots, acceptance test, server killed by PID.
9. Records amended in the same chunk.

### ⚠ A SELF-INFLICTED ERROR, RECORDED BECAUSE IT COST A STEP

**The page was written referencing `MARK` and `GOLD` before those constants were defined in it.**
The file was created, then the constants were spliced in above. ⛔ **It would not have compiled had
it been left that way, and `tsc` would have caught it** — but the cause was writing the JSX and the
constants as two separate passes and not checking the first would stand alone. **No harm reached the
build; the sequencing was wrong and the fix was trivial.**

---

## Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run lint` | **1 error** — the known baseline, unchanged. ⚠ **5 warnings, 4 of them pre-existing; 1 is this chunk's `<img>` on `/about`.** See the measurement record for the full attribution and the CLAUDE.md baseline discrepancy. |
| `npm run build` | **compiled successfully**, `/about` prerendered static |
| acceptance test | ✅ **the `About` link navigates to `/about`** |
| port 3100 | ✅ **freed, killed by PID 10080, confirmed by `netstat`** |

---

## The unlock — opened and closed inside the chunk

⛔ **Carl, 31 August 2026:** *"You are authorised to use site-header.tsx  Lock it after use."*

| step | evidence |
|---|---|
| scope file written, one path named | `_comment` records Carl's words as the authority |
| edit made | one line, confirmed by `git diff --stat` |
| scope file deleted | `chunk-scope.json` absent |
| ⛔ **lock re-verified BY A REAL DENIAL** | probe `Edit` to `site-header.tsx` → **SCOPE GUARD denied**; file untouched |

⚠⚠ **THE DENIAL IS THE PROOF, NOT THE DELETION.** The guard **fails open on an absent scope file**
(`chunk-scope-guard-match.js`: *"Absent or malformed leaves `scope` empty, which is the original
fail-open"*), so **a closed lock and a broken guard look identical from the outside.** Only the
permanent list denies there, and only an attempt shows it firing.

---

## Files touched

**Code (2):** `app/about/page.tsx` (new), `components/layout/site-header.tsx` (1 line).

**Record (5):** `decisions.md` (D-066 added, D-065's *"prospectively"* corrected),
`active-sprints/current-sprint.md` (Completed row), and in `live-work/`:
`architect-prompt-about-scaffolding.md`, `about-scaffold-measurement-31-august.md`, this log.

**Screenshots (3):** `shots/about-scaffold-1440-viewport.png`, `-full.png`,
`about-header-link-1440.png`.

**Deliberately NOT touched:** `app/page.tsx`, `app/start/page.tsx`, `app/layout.tsx`,
`components/layout/container.tsx`, `app/globals.css`, `verify/`, `open-defects.md`,
`about-section-thinking.md`.

⚠ **`app/start/page.tsx` was locked by the scope file's `protected` array on the Architect's
recommendation** — it holds D-062/D-063 approved work **and** the constants this chunk copied,
making it the most plausible accidental edit. **The lock was never tested against, because no
attempt was made.**

---

## ⛔ What is NOT done, and is not owed by this chunk

- **The About section itself** — the argument, the examples, C2B TV, section 4's subject.
- **The header question.** ⛔ **`SiteHeader` is not on `/about`.** Carl, 31 August: *"We will
  probably add a site header to all the pages. What i have to decide is what font to use and the
  design."* **Next body of work.**
- **The D-065 harness.** ⛔ **Still owed, still unasserted.** `proven.json` is empty; nothing
  admissible could have been filed.
- **Two things the header chunk inherits** — full navigation defeating D-065's demonstration (F8),
  and the three remaining anchor links going dead if the header goes site-wide (F9). **Both in
  D-066.**

---

*31 August 2026. **Scaffolding delivered: the link is hot, the page exists, the mark does not move.**
⚠ **The section itself is untouched and remains Carl's to develop.***
