# Session Handoff — 17 October 2026. `/start` CLOSED OUT ("FAR EXCEEDED THAT VISION"). NEXT: ACTIVATING SEND — CARL WILL ASK ABOUT THE PROCESS.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.** Replaces 16 October's.

---

## ⛔⛔ NEXT SUBJECT (Carl)

**`/start` is complete for all intents and purposes** — Carl: *"from what i first envisaged it, despite the trials and tribulations we have gone through, it has far exceeded that vision."* One item open: **activating the Send button** — *"that can wait, i will ask about the process next."*

**What was established about Send (information only — Carl: *"Lets not do anything yet, i just need info atm"*):**
- **Today Send does NOTHING** — a styled `<button>` with no handler, no API route, no email service in the repo.
- **Route chosen: 1 — an email to Carl per enquiry, WITH a confirmation email to the visitor.** Through an email-sending service (Resend named as the fit for Next.js/Vercel; not decided).
- **Prerequisite — Carl's, not code:** C2B needs **its own domain and a business mailbox** first. Carl: a Gmail address *"is the kiss of death for a business"*; the `c2bwebdesign` Gmail was **never shared** — a clean start. He looked at **Hostinger** at the outset (domains, not bought). Advice given: buy the **domain only** there (watch bundles and renewal prices; do NOT buy Hostinger web hosting — the site stays on Vercel); mailbox = Hostinger email or Google Workspace (undecided). Order: domain → mailbox → point the site at the domain (Vercel) → verify the domain with the sending service → the Builder builds Send. Also: spam protection (an invisible check) and a short privacy note (UK) are needed.
- ⚠ **Nothing is decided beyond route 1 + confirmation.** Prices and provider choices were explicitly left to Carl.

**The order after it (Carl, standing):** `/about` §3 (film 01, the four boxes, the player) → two home sections → the hero, last. ⛔ **Deadline 19 November 2026**; mastering after it; **then** the template extraction (below).

## WHERE THINGS STAND — all PUSHED (`8f735f8`), chunk CLOSED TO CODE

| commit | what | verdict |
|---|---|---|
| `88e37dc` | cards' labels at rest → ice blue (after lighting, scaled to land ON #CFE6FF) | R-073 *"They look good"* |
| `01961b8` | the question in focus + its Q number → ice (the Q number's 0.75 step retired) | R-074 *"a lot better"* |
| `66a0497` | answered lines + Q numbers → platinum #3F6DB8, answers #5F88C8; teal/gold retired | R-075 **approved** |
| `0950aca` | labels on hover AND selected → the answer shade #5F88C8 (platinum first take too dark); teal path retired | R-076 **approved** |
| `1be48f0` | records: the "hover fault" was Playwright only — Carl's mouse holds it | — |
| `07dfb01` | the heading travels as ONE element (ghosts gone), ice from Begin over 2.6 s, opacity on the corridor ladder | committed without verdict, then praised |
| `414dd89` | the recession at half speed: 900 → 1800 ms; step 1150 → 2050; Q1 → complete hold = the step | R-077 *"a lot better… more Gilmour, less Malmsteen"* |
| `4282528` | nav (an animation, after a pulse fix), "Understood." + its line, field labels (full ice), Send's text → ice | R-078 *"Thats fixed it"* |
| `8f735f8` | records: 31/31 protected files relocked and tested; the chunk closed to code | — |

**Not yet committed (records, written after `8f735f8`):** `decisions.md` (the section-complete line), `current-sprint.md`, `starter-content/c2b-ethos-and-vision.md` **§4a — Carl's business plan in his words**, `live-work/references/workshop-template-and-client-delivery.md` (**the extraction comes after mastering; the template must be as error-free as possible — a template defect is cloned into every client**), this handoff. Commit on Carl's word.

## OPEN — with owners

- **Send activation** — Carl (domain, mailbox, accounts), then the Builder. Above.
- **The field labels at FULL ice** are a take (*"try b, we will see how it looks"*) — Carl's eye; 0.75 is the way back (recorded in `contact-field-inputs.tsx`).
- **`verify/hover-teal.mjs`, `verify/teal-core.mjs`** test the RETIRED teal hover and will now fail — correctly. Retire or rewrite: Carl's call; untouched.
- **Phone block** (`@media (max-width: 639px)`) keeps its own heading opacities, off the ladder — mastering (D-094).
- **`CARD_EXIT_HEADROOM_MS`** now 1149 (was Carl's 18 August 249 ms "breathing beat") — the settled beat before the reveal is still 250 ms; recorded for his eye.
- **Stale production manifests** in `.next/` still name the deleted `/proto/corridor` — harmless; the next `npm run build` rewrites them.

## CLIENT ACQUISITION / CD — DISCUSSED, INFORMATION ONLY

- **The July outreach work lives OUTSIDE the repo**, by design: `C:\Users\Carl Buckley\C2B-Strategist\outreach\` — report first (`2026-07-26-REPORT-prospecting-and-site-assessment.md`), 19 ledger items all `pending`. Its premise (*no portfolio*) is expiring as the site ships. **Carl: a Strategist refresh will happen — later.** Flagged: UK PECR (sole traders count as individuals for unsolicited email — check ICO guidance).
- **Carl's idea:** per sector (e.g. restaurants) ~3 **starting points** (never shipped templates), the prospect's name/brand dropped in, shown as what their site could be; **the standard is our site**. Phone-first; a still cannot show motion.
- **Claude Design (CD)** now lives inside Claude (standalone `claude.ai/design` closes 14 December 2026); design systems, prototypes, HTML export, hand-off to Claude Code, `/design-sync` (the `DesignSync` tool is loaded on demand in this environment). ⛔ **Carl is NOT interested in Claude Motion** (*"cartoon mp4s"* — memory `feedback_no_ai_motion_clips`). **CD is where a client's SITE process starts; other client processes start here with the Builder and CA; "you only know what you need to know"** (memory `project_seats_whole_picture`). CD's role is still undefined (`ai-roles.md`; July ledger item 19).

## ⚠ STANDING / LESSONS FROM 17 OCTOBER

- ⛔ **The dev server served STALE CSS four times today** — after Edit-tool writes, and once a whole fix was measured on the OLD stylesheet. **After every CSS edit, grep the SERVED stylesheet before measuring;** a one-character comment Edit wakes it.
- ⛔ **A Playwright still pointer is not Carl's mouse** — a hover that drops only under automation is an instrument finding (memory `reference_playwright_pointer_is_not_carls_mouse`). Read hover colours settled through SELECTION.
- **An inherited colour transition + Tailwind `transition-colors` on the children = a chase and a pulse.** Animate the children instead (the nav fix, `globals.css` `.start-nav-ice`).
- **A `.claude/settings.json` lock probe must stay schema-valid** (change a character inside an allow rule) — a key rename is refused by Claude Code's schema check before the guard (memory updated; it happened again today).
- **Direct Edit of `live-work/chunk-scope.json`** with Carl's named files worked all day — no classifier refusal.
- Lint baseline **1 error, 0 warnings**; `tsc` clean. **Servers STOPPED** (:3000 and :3100 free).

---

*Written 17 October 2026, end of session. Replaces 16 October's.*
