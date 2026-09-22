# Current Sprint — Sprint 2

---

## Sprint Goal

Build the homepage to a complete, production-quality state and begin the `/start` guided enquiry experience. Establish the visual and interaction foundation that the rest of the site will extend.

## Sprint Period

2026-05-23 → Open

---

## Completed

| Task | Output | Notes |
|---|---|---|
| Governance normalization | `context-rules.md`, `decisions.md`, `handoff-protocol.md` | Status vocabulary unified — `Active` replaced by `APPROVED` throughout |
| D-004 authority corrected | `decisions.md` D-004 DEPRECATED, D-010 added | Human Founder re-attributed as authority; history preserved |
| D-011 logged | `decisions.md` | Geist font loading pattern — `<html>` not `<body>` |
| Sprint 1 archived | `active-sprints/archive/sprint-1.md` | Archive structure created |
| Font variables applied to `<html>` | `app/layout.tsx` | Resolves R-001 F-001 — see D-011 |
| `--font-sans` circular reference fixed | `app/globals.css` | Resolves R-001 F-002 — `--font-heading` also corrected |
| Services section | `app/page.tsx` | D-012 service model: Premium Website Design, Website Transformation, Intelligent Enquiry Systems, Ongoing Growth & Improvement — 2-col card grid |
| Work/Proof section | `app/page.tsx` | D-013: agency website as first proof piece — 3-col card grid: Design Standard, Business Thinking, Modern Capability |
| Final CTA section | `app/page.tsx` | D-014: consultative closing invitation; links to `/start` |
| `/start` Stage 1 opening reveal | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-015: legato clip-path mask sequence; Begin button; ~11.5s phrase; full reduced-motion support |
| `/start` Stage 2 — Q5 guided question | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-016: multi-select cards, Q5 orientation cue, frosted glass card surface, "Next step" trigger |
| Q5 → Q4 transition design | `project-intelligence/decisions.md` | D-017: layered attention model, Q4 question and options, motion principles, open items documented |
| Wire "Next step" to Q4 | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-018: Q5 settles into compact memory summary; Q4 single-select enters with calm overlap; full reduced-motion support |
| Refine Q5 memory field + Q4 options | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-019: bounded quiet memory field (card echoes replace compact text); Q4 reduced to 5 options; three-layer hierarchy enforced with `.enquiry-context-faintest` |
| Q5 → Q4 handoff motion correction | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-020: per-element settling transitions + spatial recede; seamless DOM swap at 1200ms; static transform on memory field |
| Q5 → Q4 choreography correction | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-021: transform-origin: top center (eliminates DOM-swap jump); compact memory field (q5Selections only, no placeholders); Next step scrollIntoView with reduced-motion support |
| Persistent Q5 element + compact memory rail | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-022: persistent Q5 DOM node (no unmount/remount — eliminates snap); q5Phase state model; chip-style memory echoes (.enquiry-memory-chip, reusable pattern); opening context chain reaction; Q4 layout-first + block:nearest safety scroll |
| Shared corridor architecture | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-023: shared CSS variables for corridor depth; opening heading + Q5 + Q4 three-slot corridor proved and approved |
| Full Q5→Q1 corridor + completion state | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-024: all five questions complete; Q labels match question size at all depths; "Understood" completion handoff; Send button position; Begin/Next step/Send visibility consistent |
| Mobile nav | `components/layout/header.tsx` | Mobile header navigation and opening reveal refinements approved |
| Homepage + start flow QA polish | `app/page.tsx`, `components/enquiry/enquiry-opening.tsx` | Milestone commit 2152e6e — all sections and flow mechanics approved |
| Selected-card filament border | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-029: single SVG rect, pathLength="1", draw on select, hold completed border, fade on deselect. Muted Q-label gold. Approved Q5–Q1. See R-011. |
| Site headers on `/start` and `/about` | `app/start/page.tsx`, `app/about/page.tsx`, `components/layout/nav-links.ts` (new), `components/layout/about-nav.tsx` (new), `components/layout/site-header.tsx` | Nav links placed **out of flow, hanging from the nail** — ⛔ **`SiteHeader` is NOT rendered on either route**; D-062's 81px band is not reincurred and `/start` stays **900px**. `Home` added and filtered from `/` (*"you cant navigate to where you already are"*); the three in-page anchors route-qualified (Architect **F9**, closed). On `/about` `About` → **`Roles`** with a hover dropdown to `Examples`/`TBD` — ⚠ **the site's first hover nav, built over a stated objection; Rule 8 satisfied by its "explicitly requested" clause.** Alignment settled by Carl's eye: **Δleft 0.000, uniform Δtop 0.500** (the approved `NAV_DROP_PX`). ⚠ **`w-[38.293px]` on the trigger is font-dependent and will go stale when the font changes — Carl accepts.** Section 2 named **"Roles"**; the section rail **DEFERRED** until content exists. ⛔ **No mobile nav below `md` on either route.** |
| `/about` scaffolding | `app/about/page.tsx` (new), `components/layout/site-header.tsx` (one line) | **D-066.** The dead `href="#"` is fixed; the page exists with four sections mirroring the landing page — the fourth a rendered **TBD** Carl authorised knowing it deploys. Mark gold and nailed: **left/top identical across `/`, `/start`, `/about` at 1440 AND 375**, centre spread 0.0058px h / 0.0000px v, measured **headed**. ⚠ **Scaffolding, not the About section.** ⛔ **No `SiteHeader` on `/about`** — the header question is Carl's next body of work. ⛔ **Invariant still UNASSERTED**; no harness added (`proven.json` is empty). Unlock opened and **closed with a verified denial**. |
| Sections 2, 3 + 4 discussed and recorded | `live-work/about-section-thinking.md` (2,283 → 3,336 lines) | Commits `2fe0bed`, `8a3da14`. ⛔ **Item 12 REVERSED by Carl — the four roles are NAMED and described expansively.** *"How would a client know what the system is if we dont tell them... We cant just say - made with AI, trust us."* Front half **CS + CD**, back half **CA + CB**, connected THROUGH the bridge, not to each other — ⛔ which rules out a diagram of four boxes with arrows. Order is the argument: CS → discovery meeting → CD → CA + CB. Each role described **by what the client gets**, not by its configuration. Section 2 layout: **2+2, boxes not necessarily cards**; the section 1 image **travels through 1 and 2 and stops at the 2/3 divider** — no morph, teal. Section 3: four examples (**blue platinum button** and **CD** named, two TBD), layout four pressable video boxes left + centred viewer right. ⚠ **The showroom screen is briefed to the Builder with an explicit creative grant** — 16:9, not a video, never blank, no Three.js, *"slop is definately not needed"*. The gold mark in section 1 is **SETTLED as a poster, faded, in the world of the image**; whether it reaches the TV is the Builder's call, with Carl's clue (*"Connectivity. Same world"*) recorded verbatim and unconfirmed. ⛔ **The factory model is REASONING, never page content** — Carl's ruling. |
| Navigation — the site reads as one journey | `app/page.tsx`, `app/about/page.tsx`, `app/start/page.tsx`, `components/layout/nav-links.ts`, `components/layout/about-nav.tsx` | Commit `089015a`, **deployed.** ⛔ **Home = who we are and what we do · About = HOW · `/start` = the conversation.** The landing page's CTA is **"Who we are" → `/about`** — not a softer label but the argument: Carl is a solo proprietor and the About page's thesis is that *"we"* is nonetheless accurate. Section 4 of `/about` is the **conclusion** and carries the matching **"Start a conversation" → `/start`**, same dimensions, colour and position. `Contact` → `/start` in `NAV_LINKS`, filtered on `/start` itself. ⛔ **`/about` now carries its OWN four-link nav** — Home · Roles · Examples · Start — and **the hover dropdown is GONE.** ⚠⚠ **That is the mobile fix, not a deferral:** it was the site's only hover-revealed control and its links were unreachable on touch. Gone with it: the 120ms close delay, `wasOpenOnPress`, `aria-expanded`/`haspopup`, Escape, and **`w-[38.293px]`** — the measured width of the word "About", which existed only to hold the row still while `Roles` sat in `About`'s slot in the shared list. Section 4's id renamed `tbd` → `start`. Three protected paths unlocked by name and **each re-locked with a verified denial.** |
| Landing page resized — every screen one viewport | `app/page.tsx` | Commit `67d8181`, **deployed.** ⛔ **Found by Carl's eye:** the page ran past the window — the thin grey line at the bottom was the footer's `border-t`, 101px above where the screen ended. Chrome was **additive** when it should be **inclusive**. Measured before: header 81 + hero 564 · `#services` 737.5 · `#work` 587.25 · `#contact` 900 + footer 101 = **1001 in a 900 window**, document 2971. After: **81+819 · 900 · 900 · 839+61 — every screen exactly 900, document 3600, identical to `/about`.** Footer `py-10` → `py-5` (101px → 61px). ⚠⚠ **TWO UNASSERTED PAIRS, commented in place:** 81px is the header's measured height and 61px the footer's; nothing in code checks either, and changing one silently stales the other's `calc()`. ⛔ **A mistake worth recording: the first pass CENTRED ALL THE COPY.** `flex items-center` made `<Container>` a flex item and its `mx-auto` centred it. **The guard already existed** — `/about` uses `[&>div]:w-full` everywhere and `app/about/page.tsx` documents the mechanism — and was not carried across. Carl caught it by eye: *"i did not say to put the text in the middle... This is vital for what i have planned for the hero."* Now applied to all four sections. Layouts and copy untouched — this was **preparation for the copy chunk.** |
| Homepage section 2 copy — the four services | `app/page.tsx` | Commit `fb732d9`, **deployed. APPROVED by Carl on the rendered build.** ⛔ **Reasoning: D-067.** All four service cards rewritten; **card 3 unchanged by decision**; the section heading and intro **settled at the outset and untouched** — *"I agree with the headline and subtext, iy doesnt need editing."* ⛔⛔ **THE SECTION USES TWO REGISTERS AND IT IS A RULE:** cards **1+3 are STATEMENTS with no "we" at all**, cards **2+4 SPEAK**. Carl: *"On 2+4, that is enough. 1+3 should be statements like the sections main headline and subtext."* ⚠⚠ **The foreseeable future edit is someone "tidying" 1 and 3 to match — it would read as consistency work and destroy the pattern.** Card 4 renamed **Ongoing Growth & Improvement → Ongoing Long Term Care**: Carl named the fault — *"Are we shipping a product that needs improvement?"* — and *improvement* contradicted card 1. ⛔ **Its body opens with an OFFER, not a diagnosis, because support is a CHOICE** the client can decline. **Four drafts were rejected for planting a problem so the service could solve it** (*"websites drift"*, *"a website does not change on its own"*, *"Business decisions come first"*) — Carl: *"Dont tell people how to run a business."* ⚠ *"Websites drift"* also failed on **accuracy**: a site is static, not drifting. ⛔ **No prediction, no fear** — *"Were not gonna tell them about a world where shit happens."* ⚠ **The Builder proposed elevating card 3 visually and Carl ruled against it:** the hero is the showpiece and *"this next section must follow it and not compete"* — *"the shire after the opening exposition."* **Tone: businesslike but not corporate, personal, confident, "we got your back".** Layout and structure untouched. |
| Homepage section 3 copy — the cards removed, the argument merged | `app/page.tsx` | Commit `93ad412`, **deployed.** ⛔ **THE COPY IS APPROVED; THE LAYOUT IS PROVISIONAL** — Carl separated the two: *"Sec 3 is approved. Layout work to be done at a later date."* ⛔ **Reasoning: D-068, review R-022.** **The three cards are GONE** — Carl: *"cards will be gone, that is a decision."* `Design Standard` / `Business Thinking` / `Modern Capability` survive as **phrases inside one merged paragraph**. ⚠⚠ **THE REASON IS STRUCTURAL AND SETS A PRECEDENT FOR SECTION 4:** two grids of bordered boxes on consecutive full-viewport screens — the eye learns the pattern and skims the second, so the harder argument landed on the least attention. ⛔ **Section 2's evenness only reads as restraint if it happens ONCE.** ⚠ **The form was also false here:** section 2's four cards are four different services; these three were three **lenses on one thing** — this site. **Heading "Built to set the standard." → "Quality Without Exception."** ⛔⛔ **The old intro DATED ON THE FIRST SALE and that is why it went** — *"Before we bring this level of thinking to client projects... This site is the first expression of the C2B approach"* conceded the absent portfolio twice. Carl: *"This is a problem. A line like this shouldnt be used."* ⚠ **The idea survived; the TENSE was the fault** — *"We will/can do for you what we do for ourselves is a good philosophy."* ⚠ **The register turns inside the section:** heading and subtext **state** with no "we" (*"its more than implied 'our own' and 'yours'"*), the paragraph **speaks** — consistent with D-067, not an exception. |
| Homepage section 4 — copy approved as it stood; the button decided for later | `app/page.tsx` | Commit `0f606b8`, **deployed.** ⛔ **Reasoning: D-069.** ⚠ **TWO STANDINGS:** the **COPY is APPROVED** — Carl: *"I think Sec 4s copy doesnt need changing, its already good."* — and the **BUTTON is PROVISIONAL and NOT AUTHORISED TO BUILD.** **One word changed: "premium" → "bespoke".** ⚠ **The reason is FREQUENCY, not the word** — Carl: *"Mentioned once - its there. Mentioned again - reinforces it. Mentioned again - lets not labour the point."* ⛔ **"Premium" REMAINS twice in body copy and in card 1's heading — do not sweep the rest.** ⛔⛔ **THE `Who we are` BUTTON IS TO BE REBUILT IN THREE.JS reusing existing geometry from elsewhere on the site; MATERIAL and LIGHTING are explicitly undetermined.** Carl: *"We are not redesigning now but in later sessions."* ⚠⚠ **IT DOES NOT GET BUILT WITHOUT STRUCTURAL REVIEW (rule 5a): a Three.js button is a NEW WebGL SURFACE on a page that currently has none** — the same shape as the warm-up canvas (four sessions to diagnose) and `NextStepMeshButton` (a button, eight contexts across a five-question walk). ⚠ **`nextstep-geometry.ts` and `contact-field-geometry.ts` are both PROTECTED: reading them is free, changing them is an unlock and an approved-layer question.** ⚠ **Flagged and not acted on:** the hero's CTA reads `See our work` → `#work`, which after D-068 contains no work. **The hero is deferred and is Carl's.** |
| Hero CTA — label to `TBD`, and the button ruled non-navigational | `app/page.tsx` | Commit `1541a12`, **deployed.** ⛔ **Reasoning: D-070**, which supersedes D-069's closing note. ⛔⛔ **CARL'S RULING IS A NEGATIVE ONE AND IT IS SETTLED:** *"I can definately say the button wont be navigational."* ⚠ **Only two outcomes remain** — **KEPT**, performing *"some function in the hero section"* (undetermined), or **DELETED**. ⛔ **There is no third outcome where it navigates; proposing one re-opens a closed question.** **Label `See our work` → `TBD`**, because D-068 emptied `#work` of work — the label promised a portfolio and delivered a philosophy. ⚠ **The element is DAY-1 SCAFFOLDING**, present by convention rather than decision. ⛔ **`href="#work"` is LEFT and is KNOWN-STALE — do not tidy it:** the destination is undecided by ruling and the header nav already reaches `#work`. ⚠ **A Builder claim that the button was the only way down the page was WRONG and Carl corrected it.** ⛔⛔ **THE HERO'S BRIEF IS NOT IN THIS REPOSITORY — Carl had it stricken deliberately.** **On the record ONLY:** the hero is a **video background**, `/about` §1 is **static**, ⛔ **two separate pieces of work with different images**, possibly sharing layout. ⚠⚠ **This corrects a coupling the Builder assumed twice: the travelling-image dependency belongs to `/about` ALONE.** ⚠ **A session reading these files CANNOT plan the hero — ask Carl.** |
| `/about` §1 + §2 — the record caught up, lint to zero, §2 copy drafted, wall geometry solved | `CLAUDE.md`, `app/about/page.tsx`, `app/start/page.tsx`, `components/layout/site-header.tsx`, `app/proto/wall/` (new), D-071→D-077, R-023/R-024 | ⛔ **Reasoning: D-071 (§10a broadened), D-072 (§1 copy), D-073 (the room), D-074 (the record gap), D-075 (lint), D-076 (measurement), D-077 (§2 copy + placement).** ⚠⚠ **THREE APPROVALS HAD LIVED ONLY IN A HANDOFF SCHEDULED FOR DELETION** — §1's copy, the room image and §10a — now written into `decisions.md`/`review-log.md` (D-074). ⛔ **§10a BROADENED, NOT REVERSED** — Carl: *"is not a reversal, its the broadening of a concept."* **It governs what C2B CLAIMS TO HAVE MADE, not where pixels sit: a background photograph is MATERIAL; a screen playing content is CONTENT. The C2B TV refusal stands.** Licence question closed — *"not a concern."* ⛔ **LINT AT ZERO WARNINGS** — room image to `next/image` (459KB → 105KB at 1440, −77%; 22KB at 750, −95%), four gold marks suppressed by decision, dead `showBlue` deleted. ⚠ **A non-zero baseline had gone stale twice in a week; zero is a number the tool maintains.** ⛔ **§2 COPY DRAFTED, PROVISIONAL** — CA 64 / CB 84 / CD 49 / CS 55 words. **The tooling is NOT named on the page**, and ⛔ **Anthropic's marks may not appear at all** — no "powered by" badge, no logo strip. **Four lines named as uncuttable; if a card cannot fit while keeping its line, the CARD SIZE is wrong.** ⛔ **PLACEMENT SETTLED — CA wall-left, CB wall-right, CD floor-left, CS floor-right:** *"the Architect begins the work. You cannot code if youve no idea what to code."* ⛔⛔ **NO CARD IS A STEP** — *"Dont think in linear terms… Thats why the chair sits in the middle."* **Two desks, four positions, a chair that moves between them: the room already contains the argument.** ⚠⚠ **THE BUILDER PRODUCED FOUR WRONG CEILING ANGLES AND VERIFIED EACH AGAINST ITS OWN FIGURE (D-076)** — the check could never fail. **Carl found it in one move: lift a supposedly-parallel line onto the seam and see whether it traces it.** ⛔ **Replaced by a 4-point pinning tool at `/proto/wall`; the corners are Carl's and are locked in `live-work/wall-card-corners-4-september.md`.** ⚠ **THE CARDS ARE STILL THREE.JS** — a plano-convex face refracts backlight and no CSS filter does. ⛔ **§5a write-up still owed; nothing is authorised to build.** |
| `/about` §2 — the wall pair has geometry; the lighting settles at two directional lights | `components/about/about-card-geometry.ts`, `about-card-canvas.tsx`, `app/about/page.tsx`, D-082 | Commits `ac4a4c8`, `30442e2`. ⛔ **Reasoning: D-082.** ⛔⛔ **`WALL_CARD_ASPECT = 1.615` WAS WRONG BY 42%** — it came from a CSS text box and had never been measured against the plate. Solved from Carl's pinned corners: **CA 2.327, CB 2.248**; the dead value is kept as `WALL_CARD_ASPECT_DEPRECATED`. ⚠⚠ **CARL CHOSE THE SLOWER ROUTE AND IT IS WHAT FOUND IT** — *"getting it right is more important than how fast."* **The quads are PROJECTED trapezoids; a bounding box returned CA and CB overlapping, which is impossible.** Five independent checks, including **Carl's own** — two flat cards should be ~89.4° apart, measured **96.10°**, and ⚠ **the 6.7° residual is stated, not dressed up.** ⛔⛔ **FOUR SPOTLIGHT RIGS WERE BUILT AND REJECTED ON SIGHT** — Carl: *"its acting like a street light."* ⚠⚠ **THE FAULT WAS THE LIGHT TYPE, NOT ITS PLACEMENT:** a `spotLight` has a position so it pools; a `directionalLight` has none, **so the only thing varying across a face is the face.** ⚠ **Four measured iterations, EVERY ONE CLEAN AND EVERY ONE WORSE — Rule 9.** Built: key `[1,2,2]` at **0.5**, fill `[5,2,-2]` at **2.6**. ⚠ **The obvious mirror `[-1,2,2]` is WRONG** — the cards are yawed to their desks, not mirrored about the room. ⚠ **The key had to come DOWN, which was not part of the request:** at 1.2 it supplied **88% of CD's light at near head-on**, so most of the left pair's light carried no gradient. ⛔ **CARL ACCEPTS THE TRADE** — the right pair drops ~0.03 from approved values: *"It is a trade off, but all 4 are now visible."* ⚠ **Do not "fix" the imbalance later.** ⛔ **The clean plate: wall guides gone, floor rails kept — the guides were CONSUMED, not discarded.** ⚠ **`WallCardText` stays commented out; its 420x260 box is the aspect the solve disproved.** |
| Chunk 2a — CS's frosted face, built and gated. ⚠ **IMPLEMENTED, NOT APPROVED** | `components/about/about-card-glass.ts` (new), `about-card-mesh.tsx`, `card-bench.tsx`, `verify/about-cards-still-grey.mjs` (new), D-083 | ⛔ **Reasoning: D-083.** ⛔⛔ **COMMITTED BUT NOT APPROVED — CARL'S VERDICT CANNOT BE GIVEN YET**, because the material is not judgeable. ⚠ **Committing is not approving: the work is on `main` so the record and the code travel together, and D-083 holds the status.** ⛔⛔ **TRANSMISSION TAKES ITS SPECULAR AND IBL FROM AN ENVIRONMENT MAP AND THE BENCH HAS NONE**, so the face renders near-black: **glass OFF 113.2 · glass ON 2.2 · roughness 0→0.5 gives 2.2→3.1 · thickness 0→40mm gives NO response · an `<Environment>` gives 2.2→56.8.** ⚠⚠ **THE PARAMETERS ARE NOT THE VARIABLE** — `thickness: 0` and `roughness: 0` render identically black. ⚠ **This is why `/start`'s glass BUILDS one deliberately** (~572ms of PMREM). ⛔ **What that env map should be is CARL'S and is §5a-shaped** — a new expensive GPU resource; the drei preset was a diagnostic and is removed (it lit the whole bench, 113→225). ⛔ **Built and holding:** thickness is a **typed 9.80mm constant, NOT `heightMm * TENT_POLE_RATIO`** (which gives 28.6mm) so **the crown coupling is declined**; the face is **WHITE not `#c8c8c8`** (the grey would tint "colourless" glass to 78%); **only `GLASS_THICKNESS_MM` is Carl's** and the rest are marked a starting point in the file and the UI. ⛔ **THE A2 GATE HOLDS** — the mesh is shared by all four room cards, so the glass sits behind an **off-by-default prop**, ⚠ **verified by LOADING `/about` and measuring** (CD 112.0, CS 37.4). ⛔ **The stale `card-bench.tsx:109` comment is corrected** — it claimed `TENT_POLE_RATIO = 0.025` against 0.073 and produced a 2.92x error in a plan put to Carl. ⚠⚠ **THREE BUILDER ERRORS, and the third is the lesson: the A2 harness's first threshold was 170, chosen by assertion, and RETURNED PASS ON A DEFECT MEASURING 167.2** — it missed the fault it exists to catch, by 2.8 points. **Now 140, measured between both populations.** ⚠ **The harness was proven red→green but is NOT admissible** — `proven.json` is empty (D-064) and no entry was filed. |
| `/about` §2+§3 — the mark travels from the desk into the player. ⛔ **PROPOSED** | `project-intelligence/decisions.md`, D-088 | ⛔ **Reasoning: D-088. PROPOSED, not approved — Carl expects to run with it but has not ruled.** ⛔⛔ **THE POSTER IS RULED OUT: *"The cards are bigger than the first iteration, theres no room for a poster but that doesnt mean the logo cant be used."*** ⚠ **This supersedes *"Its going in there"* (1 September), which is otherwise still written as settled** — the poster argument depended on negative space behind the setup, and the wall cards now occupy it. **The reasoning did not fail; its premise moved.** ⛔ **THE PLACE: the right desk, right of the mouse** — measured and there IS room; right of the iMac the surface runs out empty before the snake plant, and ⚠ **CB's lowest point is y 0.3785 against a desk surface at y 0.50–0.62, so it is clear of the cards.** **Three reasons it beats the poster on merit, not just space:** the desktop is a **lit** surface so a reflective mark picks up the room; **an object on a desk is what the mark already IS** (both files are physical half-tube objects with real specular, the same construction as the answer card); and it **starts in the right half of the frame**, the side it must exit from. ⛔⛔ **THE TRAVEL ANSWERS CARL'S OWN §3 CLUE** — *"The gold logo already exists in some form in 1 and 2. It stops at 2. How would it get in the TV?"* ⚠ **It carries itself there: ONE OBJECT the whole way down, which is what *"Connectivity. Same world."* demands** — and it **solves §3's idle-player problem in the same move**, so §2's mark and §3's placeholder are **one piece of work, not two.** ⚠ **FOUR NEON COLOURS IS NOW DOUBTED BY ITS AUTHOR** — *"I did rule 4 colours but i think that would be too much."* **D-087 is not withdrawn and no new number is chosen**; two strong neon objects already exist (*"The Gold and Blue are strong"*). ⛔⛔ **§5a APPLIES AND IT IS NOT AUTHORISED:** a scroll-linked animation is a **new mechanism with no precedent on this site**; **the 3D→DOM hand-off is the hard part** (two coordinate spaces); `prefers-reduced-motion`; what the neon spill does to the mark's colour; and ⚠ **whether a second, travelling instance enriches D-065's immobile mark or contradicts it.** |
| `/about` §2 — the neon timing model recorded, and a standing rule about brainstorms | `project-intelligence/decisions.md`, `ai-system/context-rules.md`, D-087 | ⛔ **Reasoning: D-087.** ⛔⛔ **THE NEON IS A LOOP OF INCOMMENSURATE PERIODS.** Carl raised three options on 11 September — *"a loop, or mouse proximity, or add an element of randomness"* — then **expanded only on the loop**, giving its mechanism (*"on/off for 4,5,6,7,8s"*), its musical frame (*"It's like writing a song in 5/4"*) and its durations. ⚠⚠ **THE EXPANSION WAS THE DECISION**, but **nothing anywhere recorded that the other two were dead** — mouse proximity survived in one quoted sentence in a gitignored file and was never mentioned again. ⛔ **A session planning chunk 3 would have found three live options and asked Carl to re-decide something he settled a week earlier.** ⚠ **NO RANDOMNESS IS NEEDED — incommensurate periods do it:** LCM 840s for {5,6,7,8}, but ⛔ **4 and 8 are a bad pair because 8 is a MULTIPLE of 4**, and two similar-looking sets differ five-fold. **A loop beats randomness on three properties: reproducible (a screenshot is comparable), no bad states by accident (all-dark is computable in advance), tunable by ear.** ⛔⛔ **ARCHITECT'S CORRECTION, ACCEPTED: length past a couple of minutes is VANITY — duty cycle is the real lever.** Nobody tracks 14 minutes; what they notice is how often the room goes dark. At 50% duty each that is **6.25%, a rest every few seconds**; on/off (4,1)(5,2)(6,2)(7,2) gives **0.32%, a rest once every ~5 minutes.** ⛔ **Compute the rest pattern from the duties FIRST, then pick periods — the plan had that backwards.** ⚠ **All-four-dark is a REST, not a fault** — in the 5/4 frame a rest before a downbeat is what makes the downbeat land. ⛔ **`prefers-reduced-motion` is UNHANDLED and belongs with the mechanism, not chunk 3.** ⚠ **The clock must not be a mount time** — stop when hidden, phase-correct on return, `?neon=<seconds>` freeze, or the reproducibility argument is void. ⛔⛔ **STANDING RULE ADDED TO `context-rules.md` ON CARL'S INSTRUCTION:** a brainstorm is a source of record, provisional ideas included — and ⚠⚠ **an idea can be chosen by being EXPANDED ON rather than by the others being explicitly rejected.** **The test: if a future reader cannot tell which option is live, the record has failed even though every word is true.** ⛔ **Third instance of D-074's failure mode in this chunk.** |
| `/about` §2 — the baked-text ruling recorded four days late; the rails restored | `components/about/wall-card-text.tsx`, `app/about/page.tsx`, `about-card-canvas.tsx`, D-086 | ⛔ **Reasoning: D-086.** ⛔⛔ **THE CARD COPY IS BAKED INTO THE FACE — Carl's ruling of 14 September, APPROVED, and it had NO `decisions.md` ENTRY.** *"If its a simple text overlay the light from the rim will have no effect... this will have echoes of what im gonna do as part of the hero section."* ⚠ **And the light is not only the rim — four individual lights are planned, one per card. A DOM overlay forfeits both.** ⚠⚠ **THE GAP MISLED THIS SESSION:** asked whether the card text reads without the neon, the Builder read `wall-card-text.tsx`, found DOM `text-white`, and answered *"Yes — legibility does not depend on the neon at all."* ⛔ **That file is the SUPERSEDED approach and nothing canonical said so.** Carl: *"This is out of date, i decided to use three js text that is affected by the scene."* ⛔ **The correct answer is UNKNOWN and is a real design constraint — the text and the neon are ONE problem, not two.** ⚠ **Second instance of D-074's failure mode in this chunk** — an approval living only in a gitignored `live-work/` file. ⛔ **Also recorded from the same source, none of it previously canonical:** accessibility is **not** a trade-off (an `sr-only` copy closes D-051-A11Y's shape rather than repeating it four times); the **texture budget is UNMEASURED and is the real constraint** — the answer card bakes ONE LINE into 4 MiB RGBA at +108ms, while these cards carry **49–84 words**, a naive scale-up being **32 MiB per card before mips, four times over**; the **hero callback** — *"The About section can be seen as the child of the Hero"*; **four neon colours, all different, NONE chosen**, and ⛔ **red must not be inherited from the diagrams.** ⚠⚠ **EVERY NUMBER IN THE SOURCE NOTES IS HELD** — the precedent cost a day when the crown opened at a recommended 0.015–0.03 and Carl settled it at **0.073**. ⛔ **Separately: the floor rails are back and PERSISTENT.** They were never removed — `AboutCardCanvas` sits later in the DOM with an exactly-overlapping box, so at `z-index: auto` it painted over them; fixed with `z-20`. ⚠ **Measured angles unchanged: PL −15.8809°, PR 34.9716°.** ⛔ **Blue and pink ONLY — the green card quads are a consumed placement check and stay OFF**, and the distinction is now written at both sites because the Builder turned on the wrong one. |
| `/about` §2 — the depth proxy was never visible; its triangles were wound backwards. ⚠ **IMPLEMENTED, NOT APPROVED** | `components/about/about-card-canvas.tsx`, D-085 | ⛔ **Reasoning: D-085.** ⛔⛔ **THE PROXY BUILT IN D-084 NEVER RENDERED ONE PIXEL.** The index order wound every triangle clockwise from this camera, so the GPU back-face-culled all **4,608** under the default `FrontSide`. ⚠⚠ **IT WAS NEVER FRUSTUM-CULLED AND NEVER HIDDEN — `onBeforeRender` FIRED EVERY FRAME.** It reached `renderObject()`, was handed to the GPU, and was discarded at face culling; `visible: true`, texture bound, `frustumCulled={false}` changed nothing. ⛔⛔ **IT HID BECAUSE THE ROOM LOOKED RIGHT** — the DOM `<img>` was still painting the same photograph behind a transparent canvas, exactly as before the proxy existed. **A layer contributing nothing is indistinguishable from one that works when something else draws the same picture.** ⚠⚠ **AND IT EXPLAINS THE CONTRADICTION: CS refracted a room that was not on screen**, because three's transmission pass flips `material.side` to `BackSide` — **visible to the GLASS, culled in the MAIN pass.** The unexplained `side: 1` in a live scene dump was that flip caught mid-pass. ⛔ **FIXED BY REVERSING THE INDEX ORDER ONLY — positions and UVs untouched, so no vertex moves and no card can shift.** `side` is deliberately **not** set: `FrontSide` now works because the winding is right, rather than being papered over with `DoubleSide`. ⛔ **SECOND, SEPARATE DEFECT: the horizon sign.** `nyHorizon` returned **-0.33794** where the horizon is **+0.33794** — verified by substitution (y = 2.8e-17 vs **-0.43901**). ⚠⚠ **NOT the cause of the invisibility** — both grids built finite, NaN-free vertices either way, so **fixing it alone would have changed nothing on screen, a real bug that would have looked like a failed fix.** `WALL_Z` -2.04 → -78.68. ⚠ **The comment said *"ny ~= 0.400"* — positive — above a line computing negative; nothing checked they agreed.** ⛔⛔ **D-084's ACCEPTANCE TEST IS WITHDRAWN AS EVIDENCE: it compared the DOM photograph with ITSELF**, the proxy contributing nothing to either side — **a control comparing an image with itself returns 0.000 and proves nothing.** The NDC round-trip at 2.22e-16 verified the maths of a mesh that never drew. ⚠ **D-084's ARCHITECTURE STANDS; only the claim that it was verified working is gone.** ⚠⚠ **A BUILDER PROBE THAT COULD NOT FAIL, CAUGHT BY ITS OWN CONTROL:** an r3f-internals harness reported 0.0 for hiding the backplate — **and 0.0 for its control too** (`frameloop="demand"`, nothing repainted). **Every number it produced was fiction; without the control it would have been reported as a finding.** A second harness was discarded for measuring dashed guide lines. ⛔ **THE CARDS DID NOT MOVE — MEASURED:** three silhouette fingerprints pixel-identical including CD (`112,489,609,664 area 56817`); CS's region cropped from both frames shows **same outline, same corners, same slant**, face only changing from milky slab to transparent frosted glass. `tsc` clean, lint at baseline. |
| `/about` §2 — the room becomes a camera-matched depth proxy; CS's glass in the scene. ⚠ **IMPLEMENTED, NOT APPROVED** | `components/about/about-card-canvas.tsx`, `room-environment.tsx` (new), D-084 | Commit `f51e865`, **pushed**. ⛔ **Reasoning: D-084.** ⚠ **Carl has not passed the room by eye — verified for FRAMING only.** ⛔⛔ **A DOM `<img>` BEHIND A TRANSPARENT CANVAS IS INVISIBLE TO THE GLASS** — three never renders it, so transmission samples an empty target cleared to 50% white and CS reads as a milky slab. **The photograph had to become geometry.** ⛔ **FIVE ATTEMPTS:** flat plane at exact FOV (bottom third BLACK) · overscan 2.2 (filled the frame but **scaled the IMAGE**, zooming the room so every card sat against a framing its position was never solved from) · **flat plane at depth 6 — PIXEL-IDENTICAL to the first**, ⚠⚠ **and that is the result that diagnosed it: a change that should have mattered did not, which proved the variable being tuned was never the cause** · projected from plate fractions (framing lost) · **projected from screen NDC — works.** ⛔ **Measured: the bottom of the frame meets the floor at t = 1.38 camera units while the back wall is ~16. No single flat plane at one depth can be both.** ⛔⛔ **THE BUG WORTH REMEMBERING:** past a `FAR` limit it **clamped `z` and scaled `x` while leaving `y` untouched**, lifting the vertex **off the camera ray that generated its UV** — so it drew its photograph pixel at the wrong screen position, non-uniformly. ⚠⚠ **THE CARDS NEVER MOVED; THE BACKGROUND'S CAMERA-TO-IMAGE MAPPING DID.** ⛔ **THE FIX: every vertex is an unprojected screen point** — NDC → camera ray → plane intersection → vertex, with the SAME NDC point giving the UV. **Correct by construction; round-trip verified at 2.22e-16.** ⚠⚠ **THE METHOD CAME FROM OUTSIDE** — Carl took the problem to ChatGPT and pasted the answer back (the second outside contribution to this chunk). ⛔ **Its first DIAGNOSIS was wrong** — missing `object-contain` offsets, **measured ZERO here** because the wrapper is `aspect-[3/2]` and the boxes agree to 0.00px at 1440 and 1920. ⚠ **The method is still right and for a better reason: it survives the 800x1200 case where the boxes DO diverge by 338px.** ⛔ **ACCEPTANCE TEST PASSED** — unlit proxy vs the CSS photograph, card-free regions: ceiling **8.93**, far-left wall **4.70**, far-right wall **2.71** on 0-255, with the control at **0.000**. ⚠ **Resampling noise, not displacement.** ⛔⛔ **AND IT EXPOSED TWO FAULTS IN COMMITTED DATA THAT PREDATE IT — both now Blockers: WALL-QUADS-STALE and CB-CEILING-DROP.** ⚠ `?guides=1` draws the quads, floor rects and PL/PR rails; **they must come out before this ships.** |

---

## Sprint 2 Closed — Milestone 2152e6e

Sprint 2 is complete. All success criteria met. Milestone commit: **2152e6e** (2026-06-14).

**Closed criteria:**
1. Homepage production-quality at all breakpoints — complete
2. `/start` Stage 1 opening reveal approved — complete
3. `/start` Stage 2 Q5 guided question approved — complete
4. Q4 transition designed, approved, and implemented — complete
5. Mobile navbar resolved — complete
6. Full Q5→Q1 corridor + completion state — complete (exceeded original scope)

---

## Current work

## ⛔ BUILDING HAS RESTARTED — 27 August 2026. THE PAUSE IS LIFTED

**Carl, 27 August 2026, stated explicitly and confirmed when restated back.** Ruling recorded
as **D-061**.

The pause stood from **25 July 2026** and was reaffirmed on 21 August. It is ended by the only
thing that could end it: **Carl saying so.** The exit condition ran in its stated sequence and
completed — governance work, then the working-process session (**D-059** came out of it), then
the explicit restart.

### ⛔⛔ WHAT DID NOT LIFT WITH IT

⛔ **"NO CHUNK IS AUTHORISED" IS UNCHANGED. It was never part of the pause.**

It is **the permanent arrangement, not a pause condition** — it does not expire and it is not
dated. **No chunk is ever authorised until Carl authorises one**, and that is as true now that
building has restarted as it was before.

⚠ **THE FAILURE MODE THIS GUARDS AGAINST IS SPECIFIC:** reading *"building has restarted"* as
*"therefore I may begin building"*. ⛔ **It does not follow.** The pause governed **whether**
new building could happen at all; the chunk rule governs **what** may be built and **when it
may start.** **Two separate controls. Only one moved.**

### The verify runner — FOUR DEFECTS FIXED, 28 August 2026

**The first item of the session on Carl's ruling of 27 August, and the pre-condition for
trusting anything `verify/` says.** Three commits, all pushed to `main`.

| commit | defect | file |
|---|---|---|
| `a374aa2` | **3** — a flag in `argv[2]` made `RUNS` NaN | `verify/lib/args.mjs` (new) + 3 harnesses |
| `301b605` | **1 and 2** — a prose ⛔ read as a product failure | `verify/run.mjs` |
| `843eee4` | **4** — the proven credential described the wrong script | `verify/proven.json`, `reveal-stall.mjs` |

⚠ **Reasoning: D-064** (defect 4) and the commit messages. Not repeated here.

**Defect 3 — `Number(process.argv[2] ?? 3)`.** Invoked as `one-context.mjs --falsify`, `argv[2]`
was the *string* `"--falsify"`, so `??` never reached the default. ⛔ **NaN did not produce a bad
number — it produced a SILENT NO-OP:** `1 <= NaN` is false, so the loop never ran. No browser, no
measurement. It then reached **both** verdicts wrongly — a red in falsify mode (the artefact a
proof is filed from) and a **green** in normal mode. Guard lands before the parse, exits 2.

**Defects 1 and 2 — `FAIL_MARK` matched any line-leading ⛔ even on exit 0.** ⚠⚠ **Complying with
`context-rules.md` — declare your blind spots IN THE OUTPUT — is what tripped it.** Now returns a
fourth outcome, **`"disagree"`** (exit 4), which suppresses the pass without manufacturing a red.
A **`##VERDICT:` sentinel** was added so a harness can declare its result instead of having it
inferred. ⛔ **Defect 2 deliberately NOT fixed** — the 38 harnesses printing `✅` mid-line fail
*closed*, and sentinel adoption rides on admission rather than a 131-file sweep.

**Defect 4 — `proven.json`'s one entry named `reveal-stall.mjs`, which FILMS.** Every arm of the
proof came from `reveal-stall-measure.mjs`. **Demoted, not re-filed** — full reasoning in D-064.

### ⛔⛔ THE PROVEN LIST IS 0. NO HARNESS PASS IS ADMISSIBLE

⚠ **This is the true state made visible, not a regression.** `verify/` can still tell you
something went **red** — reds always pass through unchanged. ⛔ **It cannot currently certify that
anything is right.** Restore route: **D-064**, `reveal-stall-measure.mjs` first.

### ✔ VERIFIED ON A LIVE BUILD — nothing is owed

⛔ **`reveal-stall.mjs` WAS RUN** against a clean production build on :3100 (build
`iOsmvS1MD1SxA1PjrhCFd`, ANGLE / AMD Radeon, 1440x900). **Result exactly as predicted:
`⚠ NO VERDICT DETECTED`, exit 3.** ⛔ **Correct, not a fault — the script films, it does not
report a verdict. Do not "fix" it back.**

⚠⚠ **THE WHOLE CHAIN WAS EXERCISED.** `reveal-stall-measure.mjs` was then run on that film and
behaved correctly as the measuring pass — a real `── DISTRIBUTION, 1 of 1 runs ──`, freeze found
at **200ms (bounded 200-240)**, blind-spot caveat printed, exit **1**, passed through unsuppressed
as a red from an unproven instrument.

⚠ **That is defect 4 shown corrected from BOTH ENDS in one run.** The filming pass now yields no
verdict; the measuring pass produces the real one. **Before the fix it was exactly backwards.**

- **The `##VERDICT:` sentinel is defined but unemitted** — untested in a real run. The honest
  one-line follow-up is `##VERDICT: NONE` in `reveal-stall.mjs` (unprotected).

⚠ **Both protected-path unlocks were closed and RE-VERIFIED BY OBSERVING A REAL DENIAL** —
`verify/run.mjs` and `verify/proven.json`. `chunk-scope.json` is deleted; no unlock is live.

---

### The logo work — DONE on `/start`, 27 August 2026

**The gold mark is top-left on the landing page and on `/start`, and on `/start` it changes
colour by section: gold → blue → gold.** Approved by Carl's eye on a running production build.

⚠ **Reasoning, measurements and the rejected alternatives: `decisions.md` D-062 and D-063.**
Not repeated here.

| Section | Mark | Changes on |
|---|---|---|
| Opening | Gold | — |
| Q+A | Platinum-blue | the Begin press |
| Client info | Gold | the start of the completion fade |

- **D-062** — the mark alone on `/start` (no header, no nav, no text), and
  `scrollbar-gutter: stable` site-wide, which is what made the two pages agree.
- **D-063** — the colour journey, the nail, the radial edge, and the easing that was built and
  rejected on measurement.
- **The blue asset shipped:** `public/c2b-logo-blue-mark.png`, cropped from Carl's DaVinci
  Resolve key with the floor reflection removed. Source committed alongside at
  `brand-assets/logo/`.

⚠ **THE STRUCTURAL QUESTION D-061 FLAGGED NEVER AROSE, AND THAT IS WHY.** Extending
`SiteHeader` beyond the landing page would have been structural — but ⛔ **the header is not
used on `/start` at all.** Carl's instruction narrowed to the mark alone, so only
`app/start/page.tsx` was touched. **No protected path was unlocked and none needed to be.**

⛔ **CLIENT INFO IS A SECTION, NOT A PAGE — corrected 27 August.** It is the `complete` stage on
`/start`: the four-box contact field. ⚠ **The record's "client information page not yet built"
refers to something else, and reading it as this section produced a wrong answer during the
session.**

### ⚠ Still open on the logo

- **The return to gold exists only on `/start`.** Whether a standalone client info page ever
  carries its own logo is undecided.
- **Three unasserted dependencies**, all stated in code and in D-063: the 1300ms against
  `Q5_REVEAL_CLEAR_MS`; the 1341ms margin against the field cascade's 3600ms first delay; and
  the `MARK` letterform fractions, which go stale the moment either PNG is re-exported.
- ⚠ **`app/page.tsx`, `app/layout.tsx` and `components/layout/site-header.tsx` remain PROTECTED
  PATHS.** Any future logo work touching the landing page's header still needs Carl to name the
  exact path under `"unlocked"` in `live-work/chunk-scope.json`.

**Also queued:** **four-box geometry in Three.js, on the client info page** — where sustained
work resumes.

---

### Superseded — the pause entry, preserved for its reasoning

> **BUILDING IS PAUSED — reaffirmed by Carl on 21 August 2026.** Original instruction
> 25 July 2026. ⛔ **New building restarts only when Carl says so explicitly, and he will be
> explicit.**
>
> **What the pause covers: NEW BUILDING ONLY.**
>
> **What it does not cover** — these have continued throughout and do not need the pause lifted:
>
> - governance work
> - tooling
> - documentation corrections
> - fixes to existing faults
>
> ⚠ **RECENT COMMITS ARE NOT EVIDENCE THAT THE PAUSE HAS LAPSED.** Commits have continued to
> land under approved decisions without contradicting it, because **the work they carry is
> governance, documentation, tooling or fixes to existing faults — none of which the pause
> covers.** **This file's former silence on scope is what made that look like a conflict.** Do
> not read commit activity as a restart.
>
> **The exit condition, in sequence:** the remaining governance work → a session on how Carl's
> working process with the Architect and the Builder can be improved → **Carl explicitly restarts
> building.** Not before, and not in any other order.

⚠ **Kept, not deleted.** The scope distinction it draws — that governance, tooling, docs and
fixes were never paused — is the reasoning that let work continue lawfully for a month, and it
is why the commit record does not contradict the pause.

---

### Answer card exit — DONE. Built 18 August 2026, approved 23 August

**The cards leave as a compressed reversal of their arrival.** Built **2026-08-18** —
`d008b4d`, `c831bf9`, `387653a`. Live since.

**Approved by Carl on 23 August 2026**, by eye on the running product: *"I am more than happy
with how it turned out."*

⚠ **Reasoning, mechanism and figures: `decisions.md` D-056. Review: R-019.** Not repeated here.

⚠ **It was built before it was recorded** — the spec said not authorised to build, the work went
in two days later, and no entry existed for five days. **The work is fine; the record was the
fault.** Second instance of the write-back gap at **D-048** — ⛔ **not closed by these entries.**

---

### Begin button, 7.4-second delay — CLOSED by D-055, 21 August 2026. NOT repaired

⛔ **THE GATING IS THE INTENDED DESIGN.** Carl walked a clean production build on 21 August
2026 and ruled that the Begin button is not meant to be immediately clickable. **Approved —
do not unweld it, do not decouple the hit target from the mask, and do not shorten the delay
to make the button available earlier.** Any of those is a change to approved work and needs
Carl.

⚠ **YOU WILL SEE THE DELAY IF YOU LOAD THE PAGE. That is the design working, not evidence
that this entry is stale.** The gate lifts at **+7711ms desktop** and **+10259ms mobile**,
measured 21 August 2026 on a clean production build.

**Ruling: `decisions.md` D-055. Mechanism and measurements:
`live-work/enquiry-opening-timing-reference.md`.** Not re-argued here.

#### ⚠⚠ CORRECTED 21 August 2026 — this entry said "RESOLVED". NOTHING WAS EVER FIXED

**It read:** *"~~Begin button, 7.4-second delay~~ — RESOLVED before 28 July 2026"*, and below
it, *"Carl confirmed on 28 July that this was fixed in an earlier session."*

⛔ **NO FIX WAS EVER MADE.** What happened on 28 July was **Carl looking at the button and
being satisfied with it** — the same ruling he made on 21 August, **misfiled as a fix.**

**The history this entry exists to keep, and it stands:** the Day 3 handoff and this file both
listed the delay as the first job when building resumed, and **the Builder began working from
it before Carl caught the error.** `enquiry-opening.tsx:259` and the 7400ms delay at
`globals.css:185` still exist and still gate `beginActive` on the mask's `animationstart`, so
**reading the code alone would have confirmed the record rather than corrected it.**

⚠⚠ **BUT THE 28 JULY DIAGNOSIS OF *WHY* WAS ITSELF WRONG.** It concluded the record was stale
about a **fix**. The record was stale about a **classification** — reading the code confirmed
the defect *because the mechanism is real and still there*, not because the record had decayed.

> ### ⚠ A SATISFACTION IS NOT A FIX — AND FILING ONE AS THE OTHER IS WHY THIS ITEM RETURNED TWICE.
> **"Fixed" is a claim about the build.** It decays, and anyone can refute it by loading the
> page and still seeing the delay — which is how the item came back on 19 August 2026.
> **"Approved" is a design decision.** Observing the delay *confirms* it.

### ⚠ Q5 stutter — RETURNED 9 August 2026. Largely fixed again; the 30 July EVIDENCE was void

> **Carl, 9 August:** *"Q5 stuttered half way through its reveal on first run."*
> **Commit `3a7cf1f`.** Measured on the real GPU, cold: a **~580ms freeze at +114–203ms**
> after Begin, inside a 1300ms wipe that starts at +60ms — 40 of an expected 78 frames.
>
> **Cause:** the warm-up canvas renders only while `stage === "opening"`, the real Q5 canvas
> only after it. **Mutually exclusive** — so Begin destroyed the warm WebGL context in the same
> commit that created the real one, and the real one rebuilt everything from scratch. **Shader
> compilation was not the cost** (0.2–0.5ms inside the reveal); Three.js CPU-side
> initialisation was. Fixed with a 900ms overlap on the warm node's lifetime; `stage` flips
> exactly when it always did.
>
> | | before | after |
> |---|---:|---:|
> | Worst frame gap, cold | 584ms | **86ms** |
> | Worst frame gap, warm | 591ms | **73ms** |
> | Frames of ~78 | 40 | **76** |
>
> ⚠ **NOT ELIMINATED.** ~70ms still lands in the wipe, above the ~50ms visible threshold.
> Removing it needs a canvas host that never unmounts — a restructure of approved layout,
> deliberately not attempted. **Carl by eye: *"it looks pretty clean"*.**
>
> ⚠ **AND DELETING THE WARM-UP WOULD HAVE MADE IT TWICE AS BAD.** The obvious reading — a
> WebGL context is per-canvas and dies with the node, so the warm-up buys nothing — is
> **refuted by measurement**. `verify/warmup-value.mjs`, 3 runs per arm, cold GPU profile
> each: mount→compiled is **161ms with** the warm-up and **919ms without**. ANGLE's on-disk
> binary shader cache survives the context's death and is worth ~758ms.

#### ⚠⚠ THE PARAGRAPH ABOVE IS SUPERSEDED — it reads as standing guidance and is not

**Two separate things overtook it, on two different dates, for two different reasons. They
are recorded apart on purpose.**

**1. The instruction — overtaken 18 August 2026.** ⛔ **The warm-up canvas WAS deleted**, in
commit **`98429af`**, whose own message reads *"the second context is gone, the freeze is
not"*. The second WebGL context and the redundant second link of all 17 programs went; **the
freeze survived the deletion** — median unmoved. It was run as a measured experiment, not as
a fix. **Full record, including the prediction written before the measurement:
`live-work/step5-warmup-deletion-18-august.md`.** ⚠ **Nothing here says whether deleting it
was right.** That is not what this records.

**2. The ~758ms figure — contested since 13 August 2026, and SEPARATELY.** The attribution to
ANGLE's on-disk cache is disputed by
`live-work/q5-stage1-resolution-and-cache-13-august.md` **§FINDING 2**, which puts the disk
cache's actual worth at **~53ms**. ⚠ **Contested, not settled — and not adjudicated here.
That is Carl's.**

⚠ **THE MEASUREMENT ITSELF STANDS AND IS DELIBERATELY NOT DELETED.** 161ms with / 919ms
without was really measured, and the reasoning is worth keeping. **What changed is that the
paragraph reads as a live instruction — "must not be deleted" — to a reader who will never
reach the commit that deleted it.** `live-work/` is gitignored and no rule requires reading it.

### ⚠⚠ THE 30 JULY "RESOLVED" ENTRY BELOW CITED EVIDENCE THAT NEVER TOUCHED A GPU

**`verify/q5-stutter.mjs` launched headless until 9 August 2026.** Bare `chromium.launch()`,
while fourteen other harnesses in `verify/` launch headed with `--enable-gpu` and print the
renderer string. **Headless Chromium silently substitutes SwiftShader**, which compiles all 120
shaders on the CPU — measured as a flat ~2000ms freeze, *identical on cold and warm runs*.

⚠ **So the "0/3 CLEAN, worst gap 18–36ms" table below describes a software rasteriser, not
Carl's machine. It is not evidence and must not be cited.** The `Q5_REVEAL_CLEAR_MS` 700→1300
correction it accompanied is still believed correct — it is derived from `.enquiry-q-text-reveal`
and was verified by Carl's eye — but it was never verified against a GPU.

**A second, independent defect in the same file:** its overlap assertion was
`firstCtx.at <= Q5_REVEAL_MS`, and `at` is clamped at t=0 (set just before the Begin click). A
context created *before* Begin therefore reported +0ms and tripped the flag. On 9 August it
printed **OVERLAP on all three runs while shader time inside the reveal was 0.5 / 0.2 / 0.0ms** —
the flag said guilty while the quantity it exists to detect was zero.

Both fixed in `3a7cf1f`. **This is the fifth and sixth recorded instance of this project's
harness-lies class**, after `q5-stutter.mjs`'s own 700ms window (30 July), `cross-section.mjs`'s
duplicated `BEVEL_WIDTH` and `opening-arm.mjs` running only at 1440px (both 7 August).

⚠ **AND THE CLASS HAS NOW BROADENED TWICE.** The first three were harnesses holding a stale
**copy of a value**. These two are different failures wearing the same coat:

| | the lie |
|---|---|
| **Wrong environment** | headless has no GPU, so a GPU defect is invisible by construction |
| **Wrong assertion** | the flag fired on a *pre-existing* context — a **false positive**, which sends the next session hunting a suspect the numbers had already cleared |

⚠ **A SEVENTH WAS CAUGHT THE SAME DAY, BEFORE IT COULD MISLEAD ANYONE — and how it was caught
is the transferable part.** `verify/approved-timings.mjs` was run **twice on identical code** as
a deliberate no-change control *before* being trusted. It reported four opening rows "SHIFTED"
by +74–92ms; the cause was its own t=0, measured from page load, which varies with server
warmth and font loading. Re-anchored to the opening's first reveal, the control now returns
22ms worst.

⚠ **RUN EVERY NEW HARNESS AS A NO-CHANGE CONTROL BEFORE TRUSTING IT.** A harness that reports
drift on unchanged code cannot certify a change — and had that control been skipped, an
ordinary boot-time wobble would have been read as the fix breaking Carl's constraint.

### Superseded — the 30 July entry, preserved for its reasoning, NOT for its numbers

> **The 29 July fix (`a6f84fb`) was incomplete — right cause, wrong boundary.** Completed
> 30 July. **Full record: `live-work/q5-stutter-diagnosis.md`.**
>
> **Two animations start on Begin and are not the same length:** `.enquiry-q5-block` is a
> **700ms** opacity fade; `.enquiry-q-text-reveal` is the **1300ms** wipe that reveals the
> phrase. The guard was derived from the 700ms fade. **700ms is ~54% through a 1300ms wipe**, so
> the Three.js work was pushed out of the first 700ms and into the remaining 600ms.
>
> **Carl caught it by eye:** the stutter had *moved* from the "Wh" of "What" to the "h" of
> "here". ⚠ **A moved symptom is not a fixed symptom — where it lands tells you where the work
> landed.**
>
> ⚠ **And `verify/q5-stutter.mjs` reported 0/3 CLEAN while the defect was visible**, because its
> window was the same wrong 700ms. **The harness and the fix shared one assumption, so the check
> confirmed the bug.** "Measure first" was followed and still gave a false pass, because the
> instrument carried the error. **A harness derived from the same constant as the fix is not an
> independent check.**
>
> **Fix:** `Q5_REVEAL_CLEAR_MS` 700 → **1300**, read off `.enquiry-q-text-reveal`; harness
> window likewise. No logic changed, no approved visual layer touched.
>
> | Measured across the full 1300ms phrase, 3/3 runs | 700ms | **1300ms** |
> |---|---:|---:|
> | WebGL context created | +825–841ms | **+1438–1446ms** |
> | WebGL ms inside the phrase | present | **0.0ms** |
> | Worst frame gap | 81ms | **18–36ms** |
>
> Reduced motion still correct — `.enquiry-q-text-reveal` is disabled under
> `prefers-reduced-motion` (globals.css:1420), verified 30 July.

**Superseded entry, preserved — the incomplete 29 July fix:**

### Q5 stutter — CAUSE MEASURED, FIX APPLIED 29 July 2026. Awaiting Carl's eye

> **Commit `a6f84fb`.** Full record: `live-work/q5-stutter-diagnosis.md`. Harness:
> `verify/q5-stutter.mjs`.
>
> **The hypothesis below was half wrong, and the half that was wrong is the interesting
> part.** The pre-warm *is* the cause. **Shader compilation is not** — measured at **0.1ms**
> inside the reveal, with all GPU API work totalling **0.1ms**. The cost is Three.js's
> CPU-side initialisation: **`onFirstUse` at 55.4ms**, plus geometry construction —
> **~197ms** landing at +200–500ms inside a 700ms fade.
>
> **It reproduced on a production build too** (81ms worst gap vs 113ms dev), so "only a
> dev-server artefact" is ruled out.
>
> **Fix:** one guard — `Q5_REVEAL_CLEAR_MS = 700`, read off `.enquiry-q5-block`'s existing
> declaration — mirroring the `CHOREOGRAPHY_CLEAR_MS` guard that already protects
> completion. The pre-warm predates Three.js being on the page, so it guarded the stage its
> author knew about and not this one.
>
> | Production, 3 runs | Before | After |
> |---|---:|---:|
> | Worst frame gap in reveal | 81ms | **18–19ms** |
> | Frames of ~42 | 35–38 | **42/42/42** |
> | WebGL inside reveal | 3/3 | **0/3** |
>
> Reduced motion **+143ms** — correctly does not wait. Completion still protected: canvas
> warm at **+820ms** on a fastest-possible run.
>
> ⚠ **Not approved.** Numbers are clean; Carl has not judged it by eye, and Rule 9 makes
> rendered output the truth for visual work.

**Original entry, preserved — the record of what was believed before it was measured:**

### ⚠ Q5 stutter — REAL, intermittent, OPEN. Deferred by Carl, not resolved

**Symptom:** a stutter as the first question's text appears — Carl described the "W" and "h"
of the Q5 phrase arriving raggedly.

**Confirmed intermittent, and the pattern is the useful part.** Observed across two sessions
on 28 July:

| Attempt | Result |
|---|---|
| First load, degraded dev server | stutter |
| Fresh server, first load | **stutter** |
| Fresh server, 2nd and 3rd loads | clean |

**It favours the first load after a server start, then stops.** That pattern is evidence, and
it points away from the earlier dev-server-degradation theory as a *complete* explanation —
a fresh, healthy server still produced it once.

⚠ **Nothing has been fixed.** No code changed across any of these observations. Do not read
the later clean runs as a resolution.

**The leading hypothesis, untested:** the WebGL pre-warm. `requestIdleCallback` schedules
shader compilation into an idle gap, but a **2000ms fallback fires it regardless** of whether
the thread is free. On a cold first load — nothing cached, Turbopack compiling, shaders not
yet in the driver cache — that work is at its most expensive and most likely to land on Q5.
Subsequent loads hit warm caches, which fits "first load only" exactly.

**This is a hypothesis and must be measured before it is believed.** This project has already
been burned once by a plausible cause on this very page: Three.js was blamed for the opening
delay and measured innocent — 0 WebGL contexts during the opening. The rule stands: measure
first.

**How to measure it:** a `verify/` script that loads `/start` **cold** (fresh context, cache
disabled), presses Begin, and captures long tasks and frame gaps across the Q5 reveal, plus
the timestamp of WebGL context creation. The question it must answer is whether shader
compilation overlaps the Q5 phrase animation. Run it repeatedly — a fault that appears once
per server start needs more than one sample.

**Status:** deferred on Carl's instruction, 28 July 2026 — *"We will have to get to the bottom
of this, for now it can wait."*

---

## At site completion — the workshop/template separation

**Recorded 30 July 2026 on Carl's instruction, to be implemented at completion. Not now.**

**Full record: `live-work/references/workshop-template-and-client-delivery.md`.**

Carl's intent: the template is a **permanent workshop** holding tools, ethos and methodology.
Site code — C2B's own as well as a client's — is packaged and shipped out, leaving the workshop
free. A new client means an identical workshop copied alongside, running in parallel.

⚠ **`.gitignore` cannot achieve this.** It governs future commits, not existing history.
**83 of this repo's 144 commits touch `project-intelligence/`**, so a clone delivers them all
while the working tree looks clean. The record explains the mechanism and the three safe routes.

**Direction decided 30 July 2026:** the C2B site code is extracted out into a new repo of its
own; **what remains, keeping this repo's 144 commits, is the workshop.** The workshop holds the
history worth consulting — methodology, decisions, corrections. Open Question 3 in the record.

**Question 3a also decided:** the workshop keeps the C2B site's source in its *history*, and
every client workshop copies that. **Carl accepts it.** Not a client-exposure risk — the
delivered repo is a fresh `git init` with no ancestry, so there is no history to mine — and it
does not grow with each client.

⚠ **Two beliefs recorded alongside that decision must not be inherited:** git history leaks
**complete** files, not fragments, and `git log` fluency cannot be assumed absent in a
non-AI developer. The decision holds because exposure is **zero**, not because partial exposure
is survivable. **The real trade-secret risk is the extraction step**, not history — Question 3a
in the record.

**Nothing here is authorised and nothing changes about current work.** Its only bearing on the
build: extraction gets harder as site code and reusable scaffolding entangle — `app/globals.css`
is already 2,012 lines of both.

---

## Future work — deliberately not recorded here

**Carl keeps the future-work record outside this repository**, for the site and for the
wider business. This is a standing policy, applied 28 July 2026.

**Do not reconstruct it here, do not treat its absence as a gap, and do not plan against
it.** A session that reads these files should see current and previous work only. When a
future direction becomes current scope, Carl introduces it as a chunk with its own brief.

**One constraint survives because it protects built work:** the hero's right-side space is
**intentionally empty and must not be filled** without a brief from Carl — D-026.

---

## Blockers

**⛔⛔ PROXY-INVISIBLE — RESOLVED 18 September 2026, same day it was found.** The depth proxy built in D-084 **never rendered a single pixel**: its triangles were wound backwards and the GPU back-face-culled all 4,608 of them. ⚠ **`onBeforeRender` fired every frame** — it was submitted and discarded, never culled by frustum and never hidden. ⛔ **It hid because the DOM `<img>` was still drawing the same room behind a transparent canvas**, so a layer contributing nothing looked identical to one that worked. ⚠⚠ **And it is why CS refracted a room that was not on screen: three's transmission pass flips `side` to `BackSide`, making the proxy visible to the GLASS and culled in the MAIN pass.** **Fixed by reversing the index order only — no vertex moved. Reasoning: D-085.**

**⛔ HORIZON-SIGN — RESOLVED 18 September 2026.** `nyHorizon` was `SIN_P / (COS_P * tanV)` and returned **-0.33794**; the horizon is **+0.33794**. ⚠ **A real bug and NOT the cause of the invisibility** — both grids built finite vertices either way, so fixing it alone would have changed nothing on screen. ⛔ **The comment above the line said *"ny ~= 0.400"* — positive — while the code computed negative, and nothing checked they agreed.** `WALL_Z` moves -2.04 → -78.68. **Reasoning: D-085.**

**✔ GUIDES-WITHOUT-FLAG — CLOSED 22 September 2026, BY REMOVAL RATHER THAN BY FIX.** The 1,025 guide-coloured pixels on a plain `/about` load were the dashed PL/PR floor rails, which were **unconditional by design** — Carl, 18 September: *"they should be on until i instruct to remove them."* ⛔ **It was never a flag fault: the rails had no flag to be missing from.** ⚠⚠ **They were the TRACK the floor cards would have slid along, and on 22 September Carl approved the placement — *"the cards are essentially 2+2... they dont need moving. The original calculations were done accurately"* — so the instrument's job was done and it came out.** ⚠ The green card quads in `about-card-canvas.tsx` are a **different** instrument, still gated behind `?guides=1`, untouched. **The angles survive in `app/proto/wall/page.tsx` (`INITIAL_RAIL`); restoring the rails is a revert, not a re-measurement.**

**⛔ CHUNK-2a-ENVMAP — RESOLVED 18 September 2026.** The env map was built (D-084) and the room now has a camera-matched depth proxy. ⚠ **Kept for one cycle rather than deleted, because the reason it closed matters: the env map turned out to be required for the CLEAR RIM, not for the frosted face the blocker was raised about.**

> ⛔⛔ **BOTH BLOCKERS BELOW ARE FALSE AND ARE WITHDRAWN — 18 September 2026, verified before being
> put to Carl.** They compare `about-card-geometry.ts` against the **4 September hand-pinned corners,
> which Carl DISCARDED on 10 September** — *"the original hand drawn is discarded, the perspective is
> wrong"* (commit `910c92a`). The live numbers were re-derived from the calculated plate by hue
> segmentation and per-edge line fitting: **all eight edges under 1px rms**, CA's edges converging at
> (2523,397) and CB's at (374,397) — **opposite sides of the frame on a COMMON HORIZON**, unforced.
> ⛔ **Against that measured set the code agrees to within 0.003 in x and 0.005 in y on all eight
> corners**, and **CB's TR is at y=0.11912, not y=0** — it is the *higher* of the two cards, so the
> equal-drop rule is not violated. ⚠ **The vertical-edge rule does not apply to the solved set
> either:** the cards are projected trapezoids on a common horizon, so the edges lean because the
> perspective is real. **That lean was read as the defect. It is the fix.**
>
> ⚠⚠ **THE REAL FAULT IS IN THE RECORD, NOT THE CODE:** `wall-card-corners-4-september.md` still
> says *"DO NOT EDIT THESE NUMBERS. THEY ARE CARL'S, SET BY EYE."* and **carries no trace in its 690
> lines that it was superseded.** ⛔ **A session following the rules — read the source of truth,
> trust the locked file — reconstructs a fixed fault and files it as two blockers.** That is exactly
> what happened. **A supersession notice on that file is owed and is Carl's to authorise.**

**⛔⛔ WALL-QUADS-STALE — WITHDRAWN, see above. Preserved for its reasoning, not its conclusion.** `GUIDE_CA_QUAD` / `GUIDE_CB_QUAD` in `about-card-geometry.ts` do not match the pinned corners in `live-work/wall-card-corners-4-september.md`. ⚠ **The tell is Carl's own vertical-edge correction** — every bottom node should share its top node's x, and his file has that while the code does not (`CA TL.x 0.17333` vs `BL.x 0.18944`; his: both `0.19766`). **Worst error: CB's TR, out by 0.043 in x and 0.028 in y.** ⛔ Carl: *"CB is way out of alignment, the distance from the top edge to the ceiling is the giveaway."* ⚠⚠ **FIXING THE QUADS ALSO REQUIRES RE-DERIVING `CA_CARD_ASPECT`, `CB_CARD_ASPECT` AND BOTH HEIGHTS**, which were computed from the wrong quads (D-082). **Reasoning: D-084.**

**⛔⛔ CB-CEILING-DROP — WITHDRAWN, see the note above. Preserved for its reasoning, not its conclusion.** ⚠ **Carl does NOT need to re-pin CB.** `wall-card-corners-4-september.md` lists it under *"What is still open"*: **CB's TR sits at y = 0, hard against the pinning tool's top edge**, while CA's TL is at 0.02849 — so Carl's rule *"The distance from the ceiling must be the same for CA and CB. Its like hanging a picture"* **was never satisfied.** ⚠ The old letterboxed framing hid it; the corrected framing shows it. ⛔ **Waiting on Carl to re-pin CB in `/proto/wall`. Do not invent the number** — that file says these are his, set by eye, and the Builder lost them twice already.

---

*Last updated: 2026-09-22 — **the glass rolled out to all four cards, and Carl's acceptance test is
FAMILY RESEMBLANCE, NOT MATCHED NUMBERS** — *"they feel all part of the same family except CA."*
⛔ **D-089 APPROVED the face transmission split** (rim clear at 1.0, face+bevel 0.86); **CD 0.95 and
CA 0.95 followed, CB and CS stay 0.86.** ⚠⚠ **A fixed material over a VARYING background reads as a
VARYING material** — dark featureless backgrounds go milky at 0.86. ⛔ **D-090** records the lighting
questions; ⛔ **D-091** the neon's ONE BRIGHTNESS TRACK — ⚠ **amended: the `/start` Send opal already
does this in production and nothing pointed to it** (D-074 again). ⛔ **D-092**: the room may begin
FADED in §1 and solidify into §2, and ⚠⚠ **there is NO activation mechanism in this codebase at
all** — `Roles` is a plain anchor, so click and scroll are ONE unhandled case. ⚠ **Two new defects:
ENVMAP-STALE and RIM-DARK (parked by Carl).** ⛔ **Nothing but D-089 is approved.***

*Previously: 2026-09-18 (second session) — **D-088**: ⛔ **the poster is RULED OUT — the cards grew
and took its space** — and the mark instead **stands on the right desk in §2 and TRAVELS into §3's
player**, which answers Carl's own clue (*"It stops at 2. How would it get in the TV?"*) and solves
the idle-player problem in one move. ⚠ **PROPOSED, not approved** — *"We will probably run with
this."* ⛔ **§5a applies: a scroll-linked animation is a new mechanism and the 3D→DOM hand-off is
unsolved.** ⚠ **Four neon colours is now doubted by its author.***

*Previously: 2026-09-18 (second session) — **D-087**: the neon is a **LOOP of incommensurate
periods**; ⛔ **mouse proximity and real randomness were RAISED AND NOT CHOSEN**, and nothing said so
until now. ⚠⚠ **A standing rule follows, added to `context-rules.md` on Carl's instruction: a
brainstorm is a source of record, and an idea can be chosen by being EXPANDED ON** — so the options
he does not pick must be recorded as not picked. **Third instance of D-074's failure mode in this
chunk.***

*Previously: 2026-09-18 (second session) — **D-086**: the card copy is **BAKED INTO THE FACE**,
Carl's ruling of 14 September, **recorded four days late from a gitignored file.** ⚠⚠ **The gap
actively misled this session** — the Builder read the superseded DOM overlay and told Carl the text
is legible without the neon. ⛔ **It is not known, and the text and the neon are ONE problem.**
**Second instance of D-074's failure mode in this chunk.** ⛔ **The floor rails are also back and
persistent** — they were being painted over by the canvas, not removed; angles unchanged.*

*Previously: 2026-09-18 (second session) — **D-085**: the depth proxy was never visible. ⛔⛔ **Its
triangles were wound backwards and the GPU culled all 4,608 of them on every frame** — `onBeforeRender`
fired throughout, so it was submitted and discarded, never frustum-culled. ⚠⚠ **It hid because the DOM
`<img>` kept drawing the same room, so a dead layer looked identical to a working one** — and it is why
**CS refracted a room that was not on screen** (the transmission pass flips `side` to `BackSide`).
**Fixed by reversing the index order only; no vertex moved and the cards are MEASURED unmoved.** ⛔ **A
second, separate defect — the horizon sign — is fixed and was NOT the cause.** ⛔⛔ **D-084's acceptance
test is WITHDRAWN as evidence: it compared the photograph with itself.** ⚠⚠ **AND THE TWO BLOCKERS
RAISED LAST SESSION ARE BOTH FALSE AND WITHDRAWN** — they measured the code against corners Carl
discarded on 10 September; **the record file carries no notice of its own supersession, which is the
real fault.** ⚠ **Carl has NOT approved the result by eye.***

*Previously: 2026-09-18 — **D-084**: the room becomes a camera-matched depth proxy after five
attempts, and CS's glass goes into the scene. ⛔ **IMPLEMENTED, NOT APPROVED — Carl has not passed
the room by eye; it is verified for FRAMING only.** ⚠⚠ **THE BLOCKER THAT CLOSED WAS REPLACED BY
TWO WORSE ONES:** CHUNK-2a-ENVMAP is resolved, and the corrected framing exposed **WALL-QUADS-STALE**
and **CB-CEILING-DROP** — ⛔ **both faults in COMMITTED data, both predating this work, and neither
fixable without Carl.** ⚠ **The method for the fix came from OUTSIDE (ChatGPT), and its first
diagnosis was wrong — recorded in D-084 so the wrong cause is not inherited as fact.***

*Previously: 2026-09-18 — **the record caught up on TWO sessions, not one.** D-082 (the wall
pair's geometry, the 42% aspect error, the two directional lights) and D-083 (chunk 2a, built and
gated, and the environment-map finding). ⛔ **A blocker is open for the first time since 28 August:
CHUNK-2a-ENVMAP.** ⚠⚠ **THE GAP IS THE POINT — today's entries describe work from 17 AND 18
September, and D-074 exists because approvals living only in a handoff is a recorded failure of
this project.** ⛔ **Chunk 2a is COMMITTED and NOT approved — the two are different things.***

*Previously: 2026-08-28 — **four defects fixed in the verify harness** (`a374aa2`, `301b605`,
`843eee4`), recorded above and in **D-064**. ⛔ **The proven list is 0 — no harness pass is
admissible.** ✔ **Verified end-to-end on a live production build — nothing is owed.***

*Previously: 2026-08-27 (second pass) — **the logo work landed and is APPROVED**: D-062 places
the mark on `/start`, D-063 records the gold → blue → gold journey, the nail, and the radial edge.
The "next body of work" section is replaced by what was actually built. ⛔ **Client info is a
SECTION — the `complete` stage on `/start` — not a page.***

*Earlier the same day: **building restarted on Carl's explicit ruling (D-061)**; the pause
entry is superseded and preserved, not deleted. "No chunk is authorised" is unchanged and did not
lift with the pause.*

*Previously: 2026-07-28 — future-work items removed on Carl's instruction; next two steps
recorded. Sprint 2 closed at milestone commit 2152e6e.*
