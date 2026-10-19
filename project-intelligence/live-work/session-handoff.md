# Session Handoff — 19 October 2026. HOME §2 + §3 REWRITTEN; THE ORNATE CORNERS DESIGNED (SHAPE + BOTH MATERIALS APPROVED). NEXT: THE ARCHITECT'S REVIEW OF THE STRUCTURAL NOTE, THEN THE CORNERS ON THE PAGE + PASS 3 (THE LIGHT).

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 17 October's.

---

## ⛔⛔ NEXT SUBJECT (Carl)

**The Architect reviews `live-work/structural-note-ornate-corners-on-home-19-october.md` (VERSION 3 — a second review folded in, after
Carl's answers; see its last section).** Carl: *"we will consult the architect, get another pair of eyes on it."* Carl routes it; findings come back to
Carl; Carl decides; THEN he names the files and the Builder builds. ⛔ **Nothing of the corners is on the page. Do not build
before Carl's word.**

**The note's proposal:** one canvas per section's GRID (B) — with the hero now confirmed WebGL, **four contexts on home** (hero,
§2 grid, §3 grid, teal button); C (one fixed canvas) = three, weighed against its scroll sync. Open for the Architect: B vs C
with the hero in view; the relief built at runtime (cache) / baked offline (byte-compare) / in a worker; the ~687k sub-pixel
triangles (a coarser mesh = a BENCH TAKE for Carl, not a quiet change); §5b gaps.

**✔ Carl ANSWERED review 2 (in the note):** arrived at = the grid's centre crossing a line; the sequence plays ONCE and the
corners STAY; reduced motion delegated (Builder: all at once, one ~300 ms fade); ⛔ **NO BORDER AT ALL** — *"The box shape is
implied by the corners"* (so no handover; ⚠ no-WebGL / the deep link's wait show bare text — accepted). ⚠ The fade must NOT be
an opacity fade (the alpha test erodes it — verified) — a per-box uniform after the test.

**Settled by Carl (in the note):** the border stays in the server HTML and is hidden per box after the corners draw (fallback
for no-JS / no-WebGL / lost context); the corners **FADE IN BOX BY BOX, IN SEQUENCE** (§2's four, §3's three) — *"it would add
to the effect instead of them all just being there when navigated to"*. Order, pace (`/start`'s phrasing the precedent),
replay and reduced motion are the build's to settle in pass 3.

**After the corners:** Send (needs C2B's domain + mailbox — Carl's steps) and `/about` §3 remain in Carl's order; the hero last;
⛔ deadline 19 November 2026; mastering after.

## WHAT HAPPENED TODAY — all PUSHED

| commit | what | verdict |
|---|---|---|
| `cc0ce01` | `/start`'s three open takes closed (field labels full ice, hover shade, card exit); `verify/hover-teal.mjs` + `teal-core.mjs` DELETED | R-079 approved |
| `6c011d6` | **Home §2 rewritten as us** — *"A front door worth knocking on."* (Carl's own metaphor), 2-sentence intro, cards *Bespoke Website Design / Website Transformation / Guided Enquiries / Ongoing Long Term Care* (*"Smart where it helps, human where it matters"*); everything centred | R-080 *"looks better… a family tree"* |
| `062ece2` | **Home §3 rewritten** — *"Quality without exception."* + *"One standard… This site is the proof"*; three BOXED subjects *Made from scratch / Proven on ourselves first / Built to last* at §2's lengths; space above/below measured equal | *"looks better"* |
| `12f9f13` | `/proto/corner` — **pass 1, the SHAPE**: Carl's acanthus bracket (`brand-assets/c4bf3a09-…jpg`, *"Its ours, i made it with gemini. Copy it."*) traced as a RELIEF; 24-px reach, long arm along the top | R-081 approved |
| `eb4b494` | **pass 2, §2's GOLD** — satin gilt (gold F0, roughness 0.45, the buttons' studio room 0.1 / strength 1 / 150°) | R-082 approved |
| `5b9d512` | **pass 2, §3's PLATINUM BLUE** — enamel over metal (tint 0.75, roughness 0.35, clear coat 1 / 0.06, strength 2) | R-083 approved — ⚠ *"a bit dark, some of the detail is being lost"* → for the LIGHT to fix |
| `f2a6aff` `9e03057` `3066eaf` | the structural note v1 → v2 (a pre-review Carl pasted, checked and folded in) → Carl's two answers | for the Architect |

Records: **D-099** (§2/§3 copy, the Shire), **D-100** (the corners, every take and verdict), R-079 – R-083, the sprint.

## OPEN — with owners

- **The Architect's review** of the structural note — Carl routes.
- **Pass 3, the light** (and the blue's darkness) — on the page, after the structure is approved.
- **Phone clearance:** at 390 px the text sits 27 px from a box's edge → ~3 px of air at the 24-px reach. Measured, recorded;
  mastering (D-094) unless Carl raises it.
- **§3's layout note** in `app/page.tsx` still says *"redesigned at a later date"* — the boxes were added today; amend when the
  corners land.
- Takes 1 and 2 of the corner (tubes) are RETIRED; their code was only in the scratchpad (gone with the session) — the record is
  D-100 and `live-work/screenshots/corner-bench-19-october/take{1,2}-*.png`.

## ⚠ STANDING / LESSONS FROM 19 OCTOBER

- ⛔ **The scope is OPEN:** `chunk-scope.json` has `app/page.tsx` (PROTECTED, unlocked) and the three bench files in `files`.
  Carl: *"Keep open until i ask you to lock and test."* Do NOT lock without his word.
- **Two of the Builder's assumptions were wrong today and Carl corrected both:** the bracket was "someone's product" (it was
  Carl's own); the scale was wrong (it was right — Gemini's was wrong). ⛔ Check provenance by asking; read a reference for
  principles. New memory: *inspiration means "something like this" — we design our own.*
- **Carl went elsewhere (Gemini) when the Builder's takes 1–2 missed** — the miss was MASS and CARVING (bent tubes read
  Victorian). The fix that worked: copy Carl's own design as a relief (height field + normal map), not invent from paths.
- **A blue metal is dark:** the swatch blue measured a third of the gold's brightness and vanished; enamel's physics (blue glass
  over bright metal) fixed it. Measure brightness before showing a dark colour.
- **"Fewer clients" is internal** — ethos §4a marked; never client copy.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Server STOPPED** (:3000 free).

---

*Written 19 October 2026, end of session. Replaces 17 October's.*
