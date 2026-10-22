# Session Handoff — 22 October 2026, session 2. FILM 4: THE SHOWCASE BENCH, PASS 1 APPROVED AS THE RESTAURANT'S ARCH. NEXT: PASS 2, THE MATERIAL.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 22 October session 1's.

---

## ⛔⛔ NEXT SUBJECT — FILM 4, PASS 2: THE MATERIAL (Carl: *"we will pick it up in the bext session"*)

**Through the normal process** (Carl: *"Discusion. Plan. Architect. Development. Implementation."*): discuss → plan in
Plan Mode → Carl routes it to the Architect (he pastes the responses back) → Carl approves → build → judged by eye.

- **The materials are RULED:** **brushed brass leads, gold leaf second** (blackened bronze and copper raised, not chosen).
  Chosen for the business — *an established, higher-end restaurant* — not for novelty. Carl on his gilded arch
  reference: *"the aesthetic is good"* (gilt) — a note for gold leaf.
- ⚠ **OPEN, Carl's, carried since R-088:** the curved side walls are FACETED (three's text gives each triangle its own
  normal) — faint in clay, it will band under metal. The Builder's offer: smooth them (creased normals, chamfer edges kept
  sharp) as part of this pass. Not yet ruled.
- The template rule stands: every part swappable (the material becomes a part of `LetteringSpec`).

## WHAT HAPPENED — the build, all on `/proto/showcase` (to be pushed with this handoff)

| | what | verdict |
|---|---|---|
| Discussion | Film 4 widened to a two-viewport showcase of modern web dev (three.js text + WebGL light first; themed stock images later); a `/proto` bench a client can be sent; "Your company", never invented names | recorded, D-088 |
| Pass 1 | "Your company", Geist SemiBold, set by the BROWSER (`measureLabel`, full kerning), extruded per character; a narrow chamfer holding the outline; the overlap check `scripts/check-typeface-overlaps.mjs` (red on Google Fonts' Geist after a first-take miss, then fixed); plan v4.1 through FOUR Architect rounds | **R-088** *"a great start… The bevel looks good"* |
| Takes 2–5 | The restaurant's lockup: "YOUR" the lintel, "COMPANY" an arch (Carl's reference: `live-work/references/film04/arch-form-reference-22-october.png`); every letter UPRIGHT; CAPITALS (take 3); EQUAL ANGLE STEPS, P at the crown, pairs level (take 4); the P nudged +0.11 em (take 5). The arch's size set by a collision check that can SEE an overlap (red run first). Plan v2.1, three Architect rounds | **R-089** *"Thats got it, theres more balance there now."* |

Records: D-088's 22 October session-2 entries (the whole trail, every measurement), R-088, R-089; plans
`live-work/film04-pass1-mesh-plan-22-october.md`, `live-work/film04-pass1-take2-arch-plan-22-october.md`; Architect
responses (the Builder's transcriptions) `live-work/architect-plan-response-film04-*.md`.

**Switches** (`/proto/showcase`): `?layout=line` take 1 · `?caps=0&steps=font&archtrack=0.16` take 2 ·
`?steps=font&archtrack=0.26` take 3 · `?nudge=` take 4 · default = take 5. Measuring: `live-work/scripts/film04-*.mjs`
(`window.__showcaseBench.probe(track, patch)` runs the same layout and check).

**The film:** `Videos\C2B Films\04 Extruded lettering\` — bins 00–04, every take captured (stills, orbits, the bend,
the swap, the measurements), `shot-list.md` with subtitle drafts. Carl records the discussions live.

## OPEN — with owners

- The faceted side walls — **Carl** (above).
- **Sending the link to a client** conflicts with the 28 July position in `app/robots.ts` (*"no one sees the site until it
  is finished"*) — **Carl** to reconcile; nothing sent yet.
- **At launch:** `/proto` must stay out of search when the site-wide blocks are removed — the bench's own `robots` is set.
- The lintel ("YOUR", ~340 px) is narrower than the arch (~550 px); Carl's reference spans it — raised, not ruled.
- The film's discussion and plan beats are captured; Carl's own recordings of the discussion are his.
- Carried from session 1 (unchanged): the structural note `structural-note-viewer-on-about-21-october.md` to amend
  (Builder); Send (domain, mailbox) after the films' edit; the films' hosting (ask before research); `neon-bloom.tsx`
  re-arm; phones in mastering (D-094).

## ⚠ STANDING / LESSONS FROM THIS SESSION

- **The Architect round is part of the film** — Carl pastes each response; the Builder saves them as transcriptions.
- **An identical result is the moment to check the comparison changed something** (the chamfer's 0.000 px: the two builds
  were proven different, 13,676 vs 6,828 triangles).
- **A check must be seen red** — the overlap check's first red run MISSED h, r, B (a tolerance that depended on where
  flattening put a point); the arch's collision check fired before its pick was trusted.
- **"Measured, it was centred. Seen, it wasn't."** — the P's ink already sat right of centre; the gap was optical. Carl's
  eye set the bar; the measurement found the value.
- ⛔ **Shell-written text:** a `\04` in a Python string inside a Bash heredoc wrote a 0x04 BYTE into `current-sprint.md`
  (and again into the memory index). Found by a control-character scan, fixed with `chr()`. Use Edit/Write for text with
  backslashes; scan after scripted writes. **No Prettier in this repo** — it reflowed a file once today.
- Scope OPEN (Carl: *"keep open until i ask you to lock and test them"*): `scripts/check-typeface-overlaps.mjs`,
  `components/showcase/lettering-geometry.ts`, `components/showcase/showcase-bench.tsx`, `app/proto/showcase/page.tsx`.
  Protected files untouched; `unlocked` empty.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Servers STOPPED** (port 3000 confirmed free).

---

*Written 22 October 2026, end of session 2. Replaces 22 October session 1's.*
