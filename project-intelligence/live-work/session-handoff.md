# Session Handoff — 1 September 2026. Sections 2 and 3 were DISCUSSED. The site was REWIRED and RESIZED. Four commits, two of them live.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

⚠⚠ **THIS SESSION BOTH DISCUSSED AND BUILT.** ⛔ **Five code files changed across two deploying
commits, and `about-section-thinking.md` grew by 1,053 lines.**

---

# ⛔⛔ WHAT THE NEXT SESSION DOES — CARL'S INSTRUCTION

> ⛔ ***"The next work. Home page. Write and finalise the copy for Sections 2, 3 + 4. 1, the hero, is
> an exception and a special case that will be built last. Also included for next work. The About
> page. Write and finalise the copy for Sections 1, 2 + 4. 3 is video work and your 'piece de
> resistance'."***

**SIX SECTIONS OF COPY. Two exclusions, and they are NOT the same kind:**

| excluded | why |
|---|---|
| **Home — the hero** | ⛔ **DEFERRED.** *"an exception and a special case that will be built last."* ⚠ **Carl has plans for it he has deliberately not shared. Do not ask, do not infer.** |
| **About — section 3** | ⛔ **DELEGATED to the Builder** — video work, *"your piece de resistance."* |

⚠⚠ **THE TWO PAGES ARE NOT THE SAME TASK.** ⛔ **Home's copy is from MONTHS AGO, pre-governance — a
rewrite from scratch. About has 3,336 lines of recorded thinking — a COMPRESSION of settled
material.** **Full brief: `about-section-thinking.md` → *THE NEXT PHASE OF WORK*.**

⛔⛔ **POSITIONING IS RULED. C2B IS A WEBSITE AGENCY.** Carl: *"We are a website agency for the
foreseeable future. Lets keep focused."* ⚠ **The copy does not hedge and does not hint at anything
else.** ⛔ **Carl holds a longer roadmap OUTSIDE this repository and has ruled that none of it
reaches the site or the record.** **Do not ask about it; do not reconstruct it. D-038 already
governs.**

⚠ **CARL IS RESEARCHING COMPETITORS FIRST** — local, national, international; copy, aesthetics,
positioning, target market. ⛔ **Strategist work, upstream of the chunk. What reaches the Builder is
Carl's CONCLUSION, not the survey.**

⚠ **AUTHORSHIP IS NOT SETTLED — who DRAFTS the copy is Carl's to say when the chunk opens.**
⛔ **Everything the Builder wrote today was RECORDING. The one exception is `/about` section 4's
placeholder, which Carl accepted as an indication and which this chunk replaces.**

---

# ⛔ WHAT WAS BUILT — and two commits are live

| commit | what | deploys? |
|---|---|---|
| `2fe0bed` | section 2 — the roles named, item 12 reversed, the travelling image | no |
| `8a3da14` | section 3 — the examples, the layout, the mark's journey | no |
| `089015a` | ⛔ **the navigation journey** — 5 code files | ⛔ **YES** |
| `67d8181` | ⛔ **the landing page resize** | ⛔ **YES** |

**`main` = `67d8181`, fully pushed, working tree clean.**

## ⛔ THE JOURNEY — the site now reads as one line

⛔ **Home = who we are and what we do → `Who we are` → About = HOW → `Start a conversation` →
`/start` = the conversation.** ⚠ **`Contact` in the header is the shortcut for a reader who skips
the walk.**

⚠⚠ **THE FAULT IT FIXED:** the landing page's strongest CTA sat at the foot of `#contact` and went
straight to `/start`, so a reader scrolling down reached the conversation **having never seen
`/about`.** Anyone who did reach About arrived **after** the invitation.

⛔ **"Who we are" IS NOT A SOFTER LABEL — IT IS THE ARGUMENT.** ⚠ **Carl is a solo proprietor and the
About page's thesis is that *"we"* is nonetheless accurate.** **Carl: *"My thoughts on the matter are
crystal clear - its 'who we are'!"*** ⛔ **Do not rename it to `How we work`.**

## ⛔ THE `/about` HEADER IS ITS OWN — and the dropdown is GONE

| label | goes to |
|---|---|
| **Home** | `/` |
| **Roles** | `#roles` — section 2 |
| **Examples** | `#examples` — section 3 |
| **Start** | `#start` — section 4 |

⚠⚠ **REMOVING THE DROPDOWN IS THE MOBILE FIX, NOT A DEFERRAL.** ⛔ **It was the site's only
hover-revealed control, built 31 August over a stated objection. Hover does not exist on touch, so
its links were effectively unreachable on a phone.** **Four plain links have no reveal step to
fail.**

⛔ **GONE WITH IT: `w-[38.293px]`.** ⚠ **The 31 August handoff flagged it as font-dependent and
fragile. It existed ONLY to hold the row still while `Roles` occupied `About`'s slot in the SHARED
list. `/about` no longer renders `NAV_LINKS`, so there is no shared slot and no constraint.**
⛔ **Do not reintroduce it.**

⚠ **Section 4's id renamed `tbd` → `start`. The nav href and that id are A PAIR — move one without
the other and the link goes nowhere silently.**

## ⛔⛔ EVERY SCREEN IS NOW EXACTLY ONE VIEWPORT — both routes

**Found by Carl's eye: the page ran past the window, and the thin grey line at the bottom was the
footer's `border-t` sitting 101px above where the screen ended.**

| | before | after |
|---|---|---|
| header + hero | 81 + 564 | ⛔ **81 + 819 = 900** |
| `#services` | 737.5 | ⛔ **900** |
| `#work` | 587.25 | ⛔ **900** |
| `#contact` + footer | 900 + 101 = **1001 in a 900 window** | ⛔ **839 + 61 = 900** |
| document | 2971 | ⛔ **3600 = 4 × 900, identical to `/about`** |

⚠⚠ **TWO UNASSERTED PAIRS, COMMENTED IN PLACE.** ⛔ **81px is the header's MEASURED height; 61px is
the footer's. Nothing in code checks either.** **Change the header's padding and the hero overshoots;
change the footer's and `#contact`'s `calc()` goes stale SILENTLY — the exact fault this fixed.**
**Re-measure; do not adjust by eye.**

⛔ **THE COPY IS BEING WRITTEN INTO A FIXED FRAME. That is why the resize was done first.**

---

# ⚠⚠ FOUR THINGS THE NEXT SESSION MUST NOT GET WRONG

## 1. ⛔⛔ ITEM 12 WAS REVERSED. THE FOUR ROLES ARE NAMED

**Carl: *"Its simple, ive changed my mind."*** ⚠ **The Builder first tried to make his instruction
and item 12 both true by reading item 12's target as *naming without substance*. ⛔ Carl did not take
that route and the record follows Carl.**

> ⛔ ***"How would a client know what the system is if we dont tell them, albeit basically, what it
> is. We cant just say - made with AI, trust us."***

⚠ **A page that describes a structure in principle and never shows it asks for trust on the same
terms — just with more words.**

## 2. ⛔ THE SEATS CONNECT THROUGH THE BRIDGE, NOT TO EACH OTHER

⛔ **Front half CS + CD (before the repo), back half CA + CB (in it).** ⚠ **Carl confirmed the
reading: *"an accurate description."*** ⛔⛔ **THIS RULES OUT A DIAGRAM OF FOUR BOXES WITH ARROWS
BETWEEN ALL OF THEM** — that picture shows parallel agents, which Carl said it is not.

⚠ **Each role is described BY WHAT THE CLIENT GETS, not by its configuration.** ⛔ **Per-seat config
— settings files, the scope guard, project instructions — IS THE FACTORY IN ANOTHER FORM and does
not reach the page.**

## 3. ⛔⛔ THE FACTORY MODEL IS REASONING, NEVER PAGE CONTENT

**Carl's ruling.** ⚠ **Same standing as the football reference.** ⛔ **If a client asks, Carl raises
it in a meeting.**

⚠⚠ **AND ITS BLUEPRINT DOES NOT EXIST YET.** ⛔ **The factory and the product are still ONE REPO,
entangled. "We clone it" is a PLAN, NOT A CAPABILITY.** **Recorded in those words so a later session
does not read it as done.**

## 4. ⚠⚠ A GUARD THAT ALREADY EXISTED WAS NOT CARRIED ACROSS — and Carl caught it by eye

⛔ **The resize's first pass CENTRED ALL THE COPY.** `flex items-center` makes `<Container>` a flex
item, and Container carries `mx-auto`, so it stopped filling the width and centred itself.

⚠⚠ **`/about` HAS USED `[&>div]:w-full` FOR THIS SINCE IT WAS BUILT, AND `app/about/page.tsx`
DOCUMENTS THE MECHANISM.** ⛔ **The Builder applied the vertical change without the guard.**
**Carl: *"i did not say to put the text in the middle. The text should be on the left. This is vital
for what i have planned for the hero."***

⛔ **ANY FUTURE SECTION THAT GAINS `flex` NEEDS `[&>div]:w-full`.** ⚠ **Now commented in the hero.**

---

# ⛔ THE BUILDER HOLDS A CREATIVE GRANT — the showroom screen

⛔⛔ **CARL: *"Im gonna oversee this but im going to let you come up with the creative part, as well
as build it... Lets see what you come up with - organise those pixels."*** ⚠ **And separately:
*"i might give you a nudge now and again but not to the extent when i am coming up with the creative
vision."***

⚠⚠ **THE BUILDER FIRST READ THIS TOO NARROWLY** — as the *how* delegated while the *what* stayed
Carl's. ⛔ **THE CREATIVE CALL IS THE BUILDER'S. THE OVERSIGHT IS CARL'S.**

⛔ **SO THAT SESSION BRINGS A PROPOSAL AND ITS REASONING — NOT THREE OPTIONS TO CHOOSE FROM.**
⚠ **Offering a menu looks respectful and is actually handing the decision back, which is what the
grant removed.**

**Constraints:** never blank · **not a video** · 16:9 · ~5s loop if it loops · **no Three.js** ·
⛔ **"Slop is definately not needed."**

**Carl's steers, recorded verbatim and NOT confirmed:** ⛔ *"Connectivity. Same world."* and *"The
gold logo already exists in some form in 1 and 2. It stops at 2. How would it get in the TV?"*
⚠ **Carl knows what he would do and has deliberately not said. The Builder's reasoning is preserved
in the file, marked UNRATIFIED.**

---

# ⚠⚠ ONE DEPENDENCY WITH A DEADLINE

⛔⛔ **IF THE MARK TRAVELS TO THE TV SCREEN, IT CANNOT BE BAKED INTO THE RESOLVE RENDER** — the image
and the mark must be separable.

⚠ **THEREFORE THE SECTION 3 DECISION MUST BE MADE BEFORE SECTION 1'S IMAGE IS RENDERED.** ⛔ **It
joins the aspect-ratio question, which tightened today: the image must work as a RIGHT-HAND SLOT in
section 1 AND as a FULL-WIDTH GROUND behind section 2's 2+2.**

---

# ⚠ STATE AT SESSION END

- **Working tree clean. `main` = `67d8181`. Fully pushed.**
- ⛔ **NO UNLOCK IS LIVE** — `chunk-scope.json` absent, and every lock this session was **verified by
  observing a real denial**: `app/page.tsx` (×2), `site-header.tsx`, `nav-links.ts`,
  `about-nav.tsx` (×3), `app/start/page.tsx`.
- ⚠ **`app/about/page.tsx` IS NOT ON THE PERMANENT LIST** — deliberate from 31 August (scaffolding).
  ⛔ **It now holds a real approved arrangement — section 4's button and the anchor ids. Carl's call
  whether that changes.**
- ⛔ **Temp harnesses `tmp-measure-sections.mjs`, `tmp-balance.mjs`, `tmp-geometry.mjs` were created
  in `verify/` and DELETED.** `verify/` is back to its 131.
- ⚠ **A production server may still be running on :3100** — kill by PID and confirm with `netstat`
  before any checkpoint.
- **`npx tsc --noEmit` clean. `npm run build` compiles, 8/8 static, `/about` still prerendered.
  `npm run lint` = 1 error, 5 warnings.**

⚠⚠ **THE LINT BASELINE IN CLAUDE.md IS STILL STALE AND STILL ONLY FLAGGED.** ⛔ **CLAUDE.md records
*"1 problem (1 error, 0 warnings)"*, verified 24 July. Today: 1 error (the known
`enquiry-opening.tsx` baseline, UNCHANGED) and 5 warnings.** ⚠ **The ERROR count is what the baseline
pins and it is intact. CLAUDE.md is a protected path; correcting the figure needs Carl.**

⚠ **`open-defects.md` was NOT touched. Nothing this session produced a live product fault.**

⚠ **A MEASUREMENT SCRIPT WAS WRONG AND WAS CORRECTED BEFORE ITS NUMBERS WERE REPORTED AS FINDINGS.**
⛔ **`tmp-balance.mjs` first measured `div > div` — an inner wrapper, not the content — and printed
skews of 264 and 419.5px. Had those been reported, Carl would have been sent chasing a balance
problem that does not exist.** ⚠ **The corrected version measured all four screens centred within a
pixel.**

---

*1 September 2026. **The About page stopped being a page and became a destination.** The site reads
as one journey, every screen is exactly one viewport, and the header that had a hover dropdown now
has four links that work everywhere.*

*⚠ **Carl found two faults by eye that no instrument was watching for** — a page that ran past the
window, and copy that had silently centred itself. ⛔ **The second had a guard already written, in a
file that already explained why. It simply was not carried across.** **Rule 9 again: the rendered
screen is the truth.***

*⛔ **NEXT: the copy. Six sections, two pages, both exclusions deliberate.** ⚠ **Carl researches
competitors first; what reaches the Builder is his conclusion, not the survey.***
