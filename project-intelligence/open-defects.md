# Open defects — live product faults awaiting action

**One entry per fault. Format is fixed: what, where, found, waiting on. No narrative.**
If an entry needs explaining, the explanation goes in an incident record and the entry links to it.

## ⚠ THE LIMITS, AND WHY THEY EXIST

- **This file stays under 400 words.** A file that grows stops being read, and **an unread list is
  worse than none, because it looks like coverage.**
- **A resolved defect is REMOVED** — not struck through, not marked done. The resolution belongs
  wherever the work is recorded.
- **Only live PRODUCT faults.** Not process gaps, not ideas, not open questions awaiting Carl's eye.
  Those have homes already.

## ⚠ NOTHING ENFORCES THIS FILE

**It is reachability, not a gate.** No hook checks it, no harness reads it, nothing fails when a
fault is missing from it. **It works only if someone files into it and someone reads it** — and it
will be out of date the moment either stops. Do not assume it is maintained; check the date on an
entry against the code before trusting it.

**This is not a consolidation.** Incident records stay where they are, unmerged and unrewritten.
This file is forward-looking only: what is still wrong, now.

---

## D-051-A11Y — answer text is not in the accessibility tree

- **What:** The answer card labels are baked into the face's albedo texture, so the visible answer
  text does not exist as text to a screen reader.
- **Where:** `components/enquiry/answer-card-mesh.tsx` (`buildLabelTexture`, the face `map`).
- **Found:** 2026-08-09, landed in `1c9b8d7`. Recorded in **D-051** (`decisions.md`), which
  describes the material and keeps the note as part of that description.
- **Waiting on:** Mandatory before these become real controls. Not scheduled. No owner assigned.

---

*Seeded 19 August 2026 with one entry. Candidates for this file exist in the record and are*
*Carl's to admit — the list was put to him separately, not added here.*
