# Session Handoff — 31 August 2026. The scaffolding and the site headers were BUILT. Six commits, two of them code.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

⚠⚠ **THE LAST SESSION CHANGED NO CODE. THIS ONE DID.** ⛔ **`app/` and `components/` were both
touched, and two commits deployed to Vercel.**

---

# ⛔⛔ WHAT THE NEXT SESSION DOES — CARL'S INSTRUCTION

> *"The next work is discussion on Sections 2, 3 and 4."*

⛔ **DISCUSSION, NOT BUILDING.** ⚠ **Section 1's development landed this session (commit `570e622`)
and is the model: what it ARGUES was already settled; this pass settled WHERE THINGS GO.**

⚠⚠ **BEFORE DISCUSSING SECTION 3, READ THIS:** ⛔ **its layout and design are CARL'S — *"i will take
care of the design of section 3."*** **Do not propose arrangements there.**

⚠ **Section 4's SUBJECT is undecided and is Carl's.** ⛔ **Do not invent one. The page renders a
literal "TBD — To Be Determined" heading, authorised by Carl knowing it deploys publicly.**

⛔ **THE ONE OPEN SHAPE QUESTION ON SECTION 2:** "the roles" must be described **in principle, never
by roster** (item 12), and yet must **add structure** to earn its place. ⚠ **A diagram of four seats
IS the roster. That tension is unresolved and is the substance of the section 2 discussion.**

---

# ⛔ WHAT WAS BUILT — and it is live

| commit | what | deploys? |
|---|---|---|
| `24dc907` | `/about` scaffolding — link hot, page created, mark nailed | ⛔ **YES** |
| `1939d93` | site headers on `/start` and `/about`, plus the `Roles` dropdown | ⛔ **YES** |
| `10b7a19` | three header files added to the permanent protected list | no |
| `4216fdd` | the 31 August live-work records | no |
| `5213259` | **D-035 amended** — mastering covers all devices | no |
| `570e622` | **section 1's layout and image** — development pass | no |

**`main` = `570e622`, fully pushed, working tree clean.**

## The state of the site

- ⛔ **`/about` EXISTS** — four `min-h-screen` sections: the founder and the process (sharing a
  canvas with the page title), the roles, what a website can actually do, and **TBD**.
- ⛔ **Site headers on `/start` AND `/about`** — nav links **OUT OF FLOW, hanging from the nail**.
  ⚠⚠ **`SiteHeader` IS NOT RENDERED ON EITHER.** **D-062's 81px in-flow band is not reincurred and
  `/start`'s document is still 900px.**
- ⛔ **`Home` is filtered from the landing page** — *"you cant navigate to where you already are."*
- ⛔ **On `/about`, `About` becomes `Roles`** with a hover dropdown to `Examples` / `TBD`.
- **The mark is identical on all three routes: `104.8598 / 19.9908` at 1440.**

---

# ⚠⚠ FIVE THINGS THE NEXT SESSION MUST NOT GET WRONG

## 1. ⛔⛔ A DELIBERATE SILENCE IS NOT A GAP — THE BUILDER GOT THIS WRONG TWICE IN ONE SITTING

**Carl:** *"i have discussed the hero with you several times. I had to find out if it was technically
feasible. I then had it stricken from the record. i need to keep you focused."*

⚠ **The Builder observed that `app/page.tsx` has no right-side element and inferred the arrangement
did not exist. Corrected — then wrote that "the repo is simply behind", which was ALSO wrong.**
⛔ **Both treated the absence as something to EXPLAIN. It was something to RESPECT.**

⛔ **THE RULE: when something Carl references is missing from the record, assume it was REMOVED ON
PURPOSE.** ⚠ **Do not reconstruct it, do not infer its contents, do not write a sentence explaining
its absence. ASK, or leave it alone.** **`current-sprint.md` has said so since 28 July.**

## 2. ⛔ MOBILE IS NOT AN OPEN DEFECT — IT IS THE MASTERING PASS

**Carl:** *"we could of optimised for mobile while building but that would of slowed the process
down. Its right that we should get the site built in one medium first before optimising for others."*

⚠⚠ **D-035 WAS AMENDED THIS SESSION (`5213259`) AND DEVICE COVERAGE IS NOW IN ITS `PROVISIONAL`
LIST.** ⛔ **A route that works at 1440 and not at 375 is *in place, deliberately untuned* — the same
standing as the provisional gold on `/about`.** **Do not raise it as a defect. Do not "fix it while
passing."**

⚠ **The Builder first wrote this up as a separate "mobile optimisation pass" and Carl corrected it:
there is no such pass, it is D-035's.** ⛔ **"All devices" is wider than mobile — nothing in this repo
has been measured above 1920, and Carl walks the site on a 4K TV.**

## 3. ⚠ THE `/start` AND `/about` NAV HAS NO MOBILE ROUTE

⛔ **Below `md`, neither route has any nav or menu button** — `hidden md:flex`, after a measured
collision with the mark at 375px. ⚠ **`site-header.tsx` DOES have one, so the site has one mobile
nav pattern and two routes with none.** **Carried into mastering; not a defect.**

## 4. ⛔ `NAV_DROP_PX = 0.5` IS AN OPTICAL CORRECTION IN TWO FILES

⚠ **Carl set it by eye — 0 *"a smidgeon too high"*, 1 *"a smidgeon too low"*, 0.5 *"Nailed it"*.**
⛔ **The cause is real: `place()` computes the mark's frame as `CORE_H / coreH` = 39.984px against
the landing page's round 40px, and everything hung off that centre inherits the 0.016px shortfall as
a systematic upward bias.**

⚠⚠ **SIX MEASUREMENTS MISSED IT AND ALL SIX WERE TRUE** — they compared the row against the NAIL,
which carries the same shortfall. ⛔ **A measurement sharing a constant with the thing it checks
cannot see that constant's error.** **Rule 9 settled it: Carl looked at the screen.**

⛔ **THE PROPER FIX REMOVES THE RESIDUE AND BOTH COPIES. It touches D-060/D-063 and is CARL'S TO
AUTHORISE.** **Grep `NAV_DROP_PX`.**

## 5. ⚠ `w-[38.293px]` ON THE `Roles` TRIGGER IS FONT-DEPENDENT

⛔ **It is the measured width of the word "About" in this font at this size**, holding the row still
so the other links do not shift between routes. ⚠ **When the nav font changes it goes stale and the
row moves again.** **Carl: *"understood. We will cross that bridge when we come to it."***

---

# ⛔ THE SCOPE GUARD FIRED THREE TIMES AND WAS RIGHT EVERY TIME

⚠⚠ **IT DENIED THE BUILDER TWICE FOR CREATING FILES OUTSIDE THE DECLARED SCOPE** — `nav-links.ts`
and `about-nav.tsx`. **Both were genuinely needed; both went to Carl, who granted them by name.**
⛔ **Widening scope is not the Builder's to do, and the guard's message says so explicitly.**

**Three files were added to the PERMANENT protected list this session (`10b7a19`):**
`app/start/page.tsx`, `components/layout/nav-links.ts`, `components/layout/about-nav.tsx`.

⚠⚠ **WHY, AND IT IS A TRAP WORTH KNOWING:** the header chunk touched five files and only ONE was
permanently protected. **The other four were held by the chunk's own scope file — gitignored scratch
that vanished when the chunk closed.** ⛔ **CLOSING AN UNLOCK THEREFORE LEAVES FILES OPEN, while
reading as "locked" to anyone who assumes chunk protections persist. They do not.**

⛔ **`app/about/page.tsx` was DELIBERATELY NOT locked** — its content is scaffolding expected to be
rewritten when the section is developed.

⚠ **Every unlock this session was closed and RE-VERIFIED BY OBSERVING A REAL DENIAL.** ⛔ **The guard
FAILS OPEN on an absent scope file, so deletion alone proves nothing.**

---

# ⛔ SECTION 1 — SETTLED THIS SESSION, and it is the model for 2/3/4

| | |
|---|---|
| **Layout** | Text **left**, static image **right**, ⚠ **the image FADES as it meets the text** |
| **Subject** | ⛔ **SETTLED** — a representation of Carl at a desk, **back to camera**, two screens; a second desk **at 90°** with the music rig. Made in **DaVinci Resolve**. **Static.** |
| **Treatment** | **Translucent layered colour, NOT a photograph.** ⛔ **Teal-led** (D-025 already assigns teal to this register) |
| **Why not amber** | ⚠ **Warm is already spoken for** — gold is the mark, warm/salmon is the selection state |
| **Video** | ⛔ **The hero's alone.** Section 1 gets a still. |

⚠ **THE MUSIC RIG DOES ARGUMENTATIVE WORK THE COPY IS FORBIDDEN FROM DOING** — two workstations show
a system with more than one discipline in it **without naming anything**, which is what item 12
requires.

**Open, and Carl's:** two colours or three; whether the gold mark appears and as poster or object;
all exact values (**PROVISIONAL**, D-035); ⚠ **and the IMAGE'S ASPECT RATIO — raised as worth
settling BEFORE Resolve, since a wide L-shaped setup in a tall slot will crop hard or read small.**

⛔ **THE SCROLL-AND-MORPH IDEA IS EXPLICITLY NOT RESOLVED** — Carl: *"It could also move down the
page with us and morph into something else."* ⚠⚠ **That is not a treatment, it is a scroll-driven
behaviour spanning sections: structural under §5a, needing client-side observation on a page that is
currently a STATIC PRERENDERED SERVER COMPONENT, and *"something else"* must exist first.**
**Its own conversation.**

---

# ⚠ OTHER RECORDS TOUCHED

- **`decisions.md`** — **D-066** added (the scaffolding); **D-065** amended (*"prospectively"*
  removed, `/about` has landed); **D-035** amended (all devices). **3,406 lines.**
- **`review-log.md`** — **R-020** added, Carl's eye-confirmation on the mark. ⚠ **Its footer was
  STALE — it named R-018 while R-019 already existed, and the Builder nearly filed a duplicate ID
  because of it. Corrected.**
- **`about-section-thinking.md`** — **2,283 lines**, up from 2,020. Section 1's layout pass.
- **`current-sprint.md`** — both chunks in Completed.

⚠ **`open-defects.md` was NOT touched. Nothing this session produced a live product fault.**

---

# ⚠ STATE AT SESSION END

- **Working tree clean. `main` = `570e622`. Fully pushed.**
- ⛔ **NO UNLOCK IS LIVE** — `chunk-scope.json` absent, verified.
- ⛔ **Nothing running on :3100** — killed by PID, confirmed by `netstat`.
- **`npx tsc --noEmit` clean. `npm run build` compiles. `npm run lint` = 1 error, 5 warnings.**

⚠⚠ **THE LINT BASELINE IN CLAUDE.md IS STALE AND IT IS FLAGGED, NOT FIXED.** ⛔ **CLAUDE.md records
*"1 problem (1 error, 0 warnings)"*, verified 24 July.** **Today: 1 error (the known
`enquiry-opening.tsx` baseline, UNCHANGED) and 5 warnings — four pre-existing, one from
`app/about/page.tsx:132`, the same `<img>` pattern both approved routes already use.** ⚠ **The ERROR
count is what the baseline pins and it is intact. CLAUDE.md is a protected path; correcting the
figure needs Carl.**

---

*31 August 2026. **The About section stopped being a discussion and became a page.** The link is
hot, the mark does not move across three routes, and the site has headers on the two routes that had
none.*

*⚠ **Carl confirmed the mark by eye — *"Excuse the pun - nailed it"* — and then found, by eye, two
faults six measurements had missed.** ⛔ **Both times the instrument was true and blind: it shared a
constant with the thing it was checking.** **That is now the third recorded instance of that
failure class on this project.***

*⛔ **NEXT: discussion on sections 2, 3 and 4.** ⚠ **Section 3's design is Carl's. Section 4's
subject is undecided. Section 2's shape — structure without roster — is the real question.***
