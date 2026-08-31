# Run log — site header on `/start`, plus the Home link. 31 August 2026

**Carl's instruction, verbatim:** *"in the start section let us put the site header with the same
font for now in exactly the same place, as we have done with the Logo. With one addition. Before the
word Services we need text saying 'Home'. The user must have the ability to return home at any
point."*

⚠ **No plan was written — Carl's ruling:** *"No need to plan, this is work already approved."*

---

## ⛔ THE CONFLICT RAISED BEFORE BUILDING, AND HOW CARL SETTLED IT

**`app/start/page.tsx:135` carried a standing instruction: *"DO NOT REINTRODUCE `SiteHeader` ON
THIS PAGE"*** — with a measured cost in **D-062**: nav links, a "Web Design" span, and an **81px
band that pushed the questions and answers down**, document to 981px.

**Two readings of the instruction, put to Carl rather than resolved by the Builder:**

| reading | consequence |
|---|---|
| `SiteHeader` rendered in flow | the 81px band returns; D-062 reopened |
| ⛔ **the LINKS placed like the mark — out of flow** | **corridor untouched; D-062 intact** |

⛔ **Carl chose out of flow.** ⚠ **The operative words in his own instruction were *"in exactly the
same place, as we have done with the Logo"*, and the logo is out of flow precisely to avoid that
band.**

⚠⚠ **THE DISTINCTION THAT MATTERS: D-062 FORBIDS THE 81px COST, NOT THE LINKS.** Placing them out
of flow does not reincur it. ⛔ **The document height is the test, and it is asserted below.**

---

## What was built

| # | change | file |
|---|---|---|
| 1 | `Home` added before `Services`, pointing at `/` | `components/layout/site-header.tsx` |
| 2 | the three in-page anchors route-qualified — `#services` → `/#services` | `components/layout/site-header.tsx` |
| 3 | `NAV_LINKS` **exported** so `/start` renders the same list, not a copy | `components/layout/site-header.tsx` |
| 4 | the links rendered out of flow, inside the mark's existing wrapper | `app/start/page.tsx` |
| 5 | the "NO NAV LINKS" comment amended — it went false today | `app/start/page.tsx` |

### ⚠ Why the anchors were route-qualified (Architect F9, arriving)

⛔ **`#services` resolves against the CURRENT page.** On `/start` it became `/start#services` —
**no target, does nothing.** ⚠ **That is the exact dead-link behaviour the `About` fix removed
hours earlier.** ⛔ **Carl's "return home at any point" requirement is what makes it necessary: a
nav reachable from a route with no sections must not contain links that silently fail.**

⚠ **F9 was recorded in D-066 as a cost the header chunk would inherit. It arrived on the first
header chunk and is now closed.**

### ⚠ Why `NAV_LINKS` is exported rather than copied

**A second hardcoded array would drift the moment a link is added** — and a link was added in this
very chunk. **One list, three routes.**

---

## ⛔⛔ THE ASSERTION THAT MATTERS — D-062's 81px

| viewport | document height | verdict |
|---|---|---|
| **1440 × 900** | **900px** | ✅ **unchanged. D-062 intact.** |
| 768 × 812 | 812px | ✅ |
| 375 × 812 | 812px | ✅ |

⛔ **981px would mean the header had gone back into flow and D-062 was reopened.** ⚠ **This is
written into the code comment as the test, not only recorded here.**

**And the mark did not move:**

| route | mark left / top @1440 |
|---|---|
| `/` | 104.8598 / 19.9908 |
| `/start` | **104.8598 / 19.9908** |
| `/about` | 104.8598 / 19.9908 |

⛔ **Identical. D-065 holds with the links added.**

---

## ⚠⚠ A DEFECT FOUND BY SCREENSHOT THAT THE NUMBERS MISSED

⛔ **At 375px the nav ran from x=32.8 while the mark ends at x=85.9 — "Home" printed straight over
the mark.**

⚠ **The 1440 measurements were completely clean and said nothing about it.** ⛔ **It was caught by
taking a screenshot at 375 and looking at it** — the same class as every instrument failure on this
project's record: *a true answer to a narrower question than the one that mattered.*

**Fixed** by `hidden md:flex`, matching `site-header.tsx`'s own breakpoint — that component hides
its links below `md` and shows a "Menu" button instead.

### ⛔ AND THE GAP THAT LEAVES, STATED RATHER THAN PAPERED OVER

⚠⚠ **BELOW `md` THIS PAGE HAS THE MARK AND NO NAV AT ALL.** ⛔ **There is no "Menu" button here.**

**That is a KNOWN GAP, not an oversight.** ⚠ **A mobile control is a design decision belonging to
the header work Carl has deferred — he is weighing a font and a design against context not yet
shared with the Builder. Inventing one here would settle it while implementing something else
(CLAUDE.md §5a).**

⚠ **The user-facing consequence, stated plainly: on a narrow viewport a user cannot leave `/start`
via the nav.** **The corridor itself is fully usable.** ⛔ **Carl's "return home at any point"
requirement is therefore met at `md` and above, and NOT below it.** **This needs his ruling.**

---

## ⚠ A NON-DEFECT, CHECKED RATHER THAN ASSUMED

**The first screenshot appeared to show `Home` rendering blue** while the other four were grey.
⛔ **Measured before "fixing" it: all five compute to the identical `neutral-400`.** ⚠ **The blue
was the screenshot catching the cursor's hover state.** **No change made.**

---

## Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run lint` | **1 error, 5 warnings — identical to before this chunk.** The error is the known `enquiry-opening.tsx` baseline. |
| `npm run build` | **compiled successfully** |
| **`/start` document height @1440** | ⛔ **900px — D-062 intact** |
| mark position, 3 routes | ⛔ **identical — D-065 holds** |
| 375 / 768 / 1440 | ✅ **no mark/nav collision at any width** |

---

## The unlock — closed, then REOPENED ON CARL'S INSTRUCTION

⛔⛔ **READ THE AMENDMENT AT THE END OF THIS FILE BEFORE ACTING ON THIS SECTION. The table below
describes the FIRST cycle only. Carl reopened the unlock afterwards and it is CURRENTLY LIVE:**
*"Open site-header.tsx again, but dont lock it until i say. We will need it in the about section
when start is done."* ⚠ **`chunk-scope.json` EXISTS and must NOT be deleted until Carl says so.**

⛔ **Carl, 31 August 2026:** *"you have authorisation to unlock site-header.tsx  Loock after use."*

| step | evidence |
|---|---|
| scope file written | authority recorded in `_comment`; `app/start/page.tsx` added to `files` as a deliberate widening |
| edits made | `site-header.tsx` (NAV_LINKS + export), `app/start/page.tsx` (links, comments) |
| scope file deleted | absent |
| ⛔ **lock re-verified BY A REAL DENIAL** | probe `Edit` → **SCOPE GUARD denied**; file untouched |

⚠⚠ **The guard fails OPEN on an absent scope file, so deletion alone proves nothing.** **Only the
permanent list denies there, and only an attempt shows it firing.**

---

## ⛔ NOT DONE, and owed

- ⛔ **The header's DESIGN and FONT.** ⚠ **Carl: *"with the same font for now"* — the classes are
  copied from `site-header.tsx` so the two agree today. **PROVISIONAL, and the code says so.**
- ⛔ **A mobile control for `/start`.** **The gap above. Carl's ruling needed.**
- ⛔ **`/about` has NO header** — 0 nav links, verified. **Not in this chunk's scope.** ⚠ **Whether
  the header goes on all routes is still Carl's deferred question.**
- ⛔ **The D-065 harness.** Still unasserted, still owed. **A third route now carries the mark AND a
  fourth element that must not collide with it.**
- ⚠ **F8 — full navigation.** Every one of these links is a plain `<a>`, so each is a full document
  navigation. ⛔ **`Home` from `/start` blanks and repaints.** **Unchanged by this chunk and still
  open.**

---

*31 August 2026. **The header is on `/start`, out of flow, and the corridor did not move.**
⚠ **Below `md` there is no nav and no menu — a known gap awaiting Carl's ruling.***

---

# ⛔ AMENDMENT — THE FOUR WORDS WERE MOVING. FIXED 31 August 2026.

**Carl, on navigating between `/` and `/start`:** *"The 4 words move upwards when going back and
forth between the home page and start page. We need to use the same principle as the logo so that
they appear immobile."*

⚠⚠ **FOUND BY EYE, ON NAVIGATION. Every number this chunk had already reported was correct and
none of them looked at this** — the document height was 900, the mark was identical to four decimal
places, and there was no mark/nav collision at any width. ⛔ **The links' agreement with the landing
page was never measured, because nothing had thought to ask.**

## The defect, measured

| word | `/` top | `/start` top | Δ |
|---|---|---|---|
| Services | 29.986 | 19.991 | **9.995px** |
| Work | 29.986 | 19.991 | **9.995px** |
| About | 29.986 | 19.991 | **9.995px** |
| Contact | 29.986 | 19.991 | **9.995px** |

⚠ **Horizontal was already identical. The jump was purely vertical, and upward — exactly as Carl
described it.**

## The cause — and it is D-065's own diagnosis

**On the landing page the links are CENTRED IN A FLOW ROW whose height is the mark's 40px frame:**
row top 20, height 40, link height 20 → **20 + (40−20)/2 = 30.** **On `/start` they were the first
element in the out-of-flow wrapper and simply started at its top: 20.**

⛔⛔ **THE POSITION WAS DERIVED ON ONE PAGE AND ARBITRARY ON THE OTHER.** ⚠ **That is precisely what
D-065 says causes drift everywhere else on the web:** *"Sites do not drift because nobody wanted
precision. They drift because POSITION IS DERIVED."*

## The fix — the nail's principle, applied to the nav

**`NAV_CENTRE_Y` is declared in `app/start/page.tsx` as the MARK'S VERTICAL CENTRE**, and the link
row is absolutely positioned on it with `-translate-y-1/2` so it **centres on** that line rather
than starting at it.

⛔ **IT IS COMPUTED FROM THE MARK'S OWN FRAME, NOT COPIED AS `30px`:**

    const GOLD_TOP    = parseFloat(GOLD.top);
    const GOLD_H      = parseFloat(GOLD.height);
    const NAV_CENTRE_Y = GOLD_TOP + GOLD_H / 2;

⚠⚠ **A LITERAL 30 WOULD HAVE WORKED TODAY AND GONE STALE SILENTLY.** If D-060's 40px is ever
revisited, this follows it. ⛔ **And a stale value here is invisible until somebody navigates and
watches the words move — which is exactly how this defect was found in the first place.**

## Result

| word | `/` top | `/start` top | Δ |
|---|---|---|---|
| Services / Work / About / Contact | 29.986 | 29.980 | **0.006px** |

⛔ **9.995px → 0.006px.** ⚠ **Sub-pixel, and the same order as the mark's own 0.0058px spread — it
is frame arithmetic, not drift.**

**Unchanged by the fix, re-verified:**

| check | result |
|---|---|
| `/start` document height @1440 | **900px** — ⛔ D-062 intact |
| mark top, `/` vs `/start` | **19.9908 / 19.9908** — identical |
| 375 / 768 / 1440 | no collision, no horizontal overflow |
| `npx tsc --noEmit` | clean |

## ⚠ WHAT IS STILL OWED

- ⛔ **`Home` IS NOT YET ALIGNED TO ANYTHING.** Carl: *"Leave the 'home' text for now. You can fit it
  in when the 4 words are aligned."* **It renders and works; its placement is not settled.**
- ⛔ **`/about` HAS NO HEADER.** Carl: *"We will need it in the about section when start is done."*
- ⛔⛔ **THE UNLOCK ON `site-header.tsx` IS DELIBERATELY STILL OPEN.** Carl: *"Open site-header.tsx
  again, but dont lock it until i say."* ⚠ **`chunk-scope.json` EXISTS and is live. It is NOT to be
  deleted until Carl says so** — this is the one case in this project where an open unlock is
  correct, and it is recorded here so a later reader does not close it as an oversight.
- ⚠ **THE D-065 HARNESS IS MORE OWED THAN IT WAS.** ⛔ **A second element now hangs from the nail,
  and its agreement across routes is asserted by nothing.** **This defect existed for the length of
  one chunk and was caught by Carl's eye, not by any instrument.**

---

# ⛔ THE ALIGNMENT, SETTLED BY CARL'S EYE — 31 August 2026

**Carl's verdict:** *"Nailed it, well done."*

## The value, and how it was reached

⛔ **`NAV_DROP_PX = 0.5` in `app/start/page.tsx`.** ⚠ **Bisected against Carl's eye, not derived:**

| setting | Carl's verdict |
|---|---|
| 0 | *"a smidgeon too high"* |
| 1 | *"a smidgeon too low"* |
| **0.5** | ⛔ **APPROVED** |

**Measured result: the nav row on `/start` sits 0.484px BELOW the landing page's, at 1920×1080 /
100% scale — Carl's actual display, confirmed from his Windows display settings.**

## ⛔⛔ THE CAUSE — a real arithmetic residue, found only after the eye insisted

**`place()` computes the mark's frame as `CORE_H / coreH`, giving 39.984px here against the landing
page's round 40px.** ⚠ **Everything hung off that centre inherits the 0.016px shortfall as a
SYSTEMATIC UPWARD BIAS** — which is why it read as consistently-slightly-high rather than as noise.

## ⚠⚠ WHY SIX MEASUREMENTS ALL MISSED IT, AND ALL WERE TRUE

**At 1440×900 the Builder measured the anchor box, the text box via `Range`, the position sampled
every 250ms through the opening, a real click navigation, the container edges, and a pixel
comparison of identical crops. Every one reported 0.006px. Every one was correct.**

⛔⛔ **THEY ALL COMPARED THE ROW AGAINST THE NAIL — WHICH CARRIES THE SAME 0.016px SHORTFALL.** ⚠ **A
measurement that shares a constant with the thing it checks cannot see that constant's error.**

⚠⚠ **THIS IS THE HARNESS-LIES CLASS ARRIVING IN A NEW PLACE** — the same shape as
`cross-section.mjs`'s duplicated `BEVEL_WIDTH` and the F2 finding on the `/about` chunk hours
earlier, **where the Architect caught it BEFORE it was built. Here it was not caught, because
nobody thought to ask whether the reference itself was exact.**

⛔ **RULE 9 SETTLED IT: Carl looked at the screen.** ⚠ **And two Builder theories were wrong before
the cause was found — that the 4K TV explained it (Carl was on the PC), and that the landing page's
81px bordered band was the visual reference (a real difference, but not this one).**

## ⚠ WHAT IS STILL OWED — the correction is not the fix

⛔ **`NAV_DROP_PX` is a magic number correcting a computation. That is the pattern D-063's nail was
built to ELIMINATE** — *"margins correcting margins"*, whose compounding rounding produced a visible
jump.

⛔⛔ **THE PROPER FIX IS TO REMOVE THE RESIDUE, NOT TO CORRECT IT:** the links should hang off the
landing page's 40px reference so no correction is needed at all. ⚠ **That touches D-060/D-063
approved work and is CARL'S TO AUTHORISE. Raised, not done.**

⚠ **AND IT IS TUNED TO ONE SETUP.** A fractional pixel is rounded when painted: 0.484px rounds
consistently at 1920×1080 / 100%, and **may tip the other way at a different zoom or on a different
display.** ⛔ **Nothing asserts it.**

## ⚠ TWO THINGS SEEN IN CARL'S SCREENSHOTS, NEITHER ACTIONED

1. ⛔ **`/` has an 81px bordered band and a "Web Design" span beside the mark. `/start` has neither.**
   ⚠ **The elements are in the same place; the FRAME around them is not.** **Not raised as a defect —
   D-062 stripped that band from `/start` deliberately. Carl's to rule on when the header design is
   settled.**
2. ⚠ **`Home` renders and is aligned with the other four.** ⛔ **Its PLACEMENT is still not settled —
   Carl: *"You can fit it in when the 4 words are aligned."* They are now aligned.**

---

# ⛔ THE `/about` HEADER, AND TWO DECISIONS CARL SETTLED — 31 August 2026

## What Carl decided

**Asked whether `/about` should carry the site-wide links or links to its own sections, Carl chose
BOTH:** the site-wide header now, plus a section rail as a separate element.

| decision | ruling |
|---|---|
| `/about` header contents | ⛔ **SITE-WIDE links** — same list as `/start`, including `Home` |
| `/about` header placement | ⛔ **OUT OF FLOW**, hanging off the nail — the same mechanism as `/start` |
| section 2's name | ⛔ **"Roles"** — the open title question is CLOSED |
| the section rail | ⚠ **DEFERRED** until the sections have real content |
| the rail's contents, when built | **Roles, Examples, TBD** — section 1 excluded |

### ⚠ Why section 1 is excluded from the rail — Carl's own logic, applied twice

⛔ **Carl: *"We dont need section 1 Founder, we are already there."*** ⚠ **The same reasoning that
removed `Home` from the landing page's header: you cannot navigate to where you already are.**
**Section 1 is the top of the page; arriving there is what loading the page does.**

### ⚠ Why the rail is deferred, and it is not reluctance

⛔ **The four sections are `min-h-screen` SPECIFICALLY so Carl can see the design canvas at real
size** — his instruction of the same day. ⚠⚠ **A rail permanently occupies part of that canvas.**
**Designing it against placeholder copy would mean designing for content that does not exist yet,
and the canvas would be judged with an element in it that may not survive.**

⚠ **It is also a NEW MECHANISM — structural under CLAUDE.md §5a.** ⛔ **Where it sits, whether it
tracks scroll, what it looks like at rest are all undecided, and scroll-tracking would convert
`/about` from a static prerendered SERVER component into a client one.**

---

## ⛔⛔ THE CLIENT/SERVER BOUNDARY — a build failure, and the scope guard firing correctly

**The `/about` header could not simply import `NAV_LINKS` from `site-header.tsx`.**

    TypeError: g.NAV_LINKS.map is not a function
    Error occurred prerendering page "/about"

⚠⚠ **`site-header.tsx` carries `"use client"`. A SERVER component importing a value from a client
module does not get the value — it gets a CLIENT REFERENCE PROXY, and the array's methods are
missing.** ⛔ **`/start` never hit this because it is itself a client component, so the import
resolved normally. `/about` is a server component and broke immediately.**

### ⚠ THE SCOPE GUARD DENIED THE FIX, AND WAS RIGHT TO

**The Builder attempted to create `components/layout/nav-links.ts` without declaring it:**

    SCOPE GUARD: 'components/layout/nav-links.ts' is outside the declared scope
    of chunk 'site-headers'. ... do not widen it yourself.

⛔ **Creating a new shared module is a structural change. The guard stopped it, three options went
to Carl, and he chose the extraction.** ⚠ **`chunk-scope.json` was then widened WITH THE REASON
RECORDED, including that the Builder had been denied first.**

**The two rejected options, recorded so they are not revisited blindly:**

- ⛔ **Make `/about` a client component** — one line, but it converts a static prerendered page to
  client-rendered for an import, on a page with no interactivity.
- ⛔ **A second hardcoded array on `/about`** — drifts the moment a link changes, **and the links
  changed TWICE on the day this was written.**

---

## Result — measured at 1920×1080, Carl's display

| route | mark left / top | `Home` top / left | links |
|---|---|---|---|
| `/` | 344.933 / 19.991 | *absent* | Services, Work, About, Contact |
| `/start` | 344.933 / 19.991 | **30.486 / 1249.426** | all five |
| `/about` | 344.933 / 19.991 | **30.486 / 1249.426** | all five |

⛔ **`Home` is IDENTICAL on `/start` and `/about` to three decimals** — Carl's requirement: *"The
Home should be in exactly the same place it is in the start section."*

⚠ **`SiteHeader` IS NOT RENDERED ON `/about`, and the reason is NOT D-062** — there is no corridor
here to push down, so the 81px band would be legal. ⛔ **But the links would then sit at the FLOW
position rather than the nail's, which is a THIRD placement mechanism and would put `Home` somewhere
other than where it sits on `/start`.**

## ⚠ `NAV_DROP_PX` IS NOW IN TWO FILES

⛔ **`app/start/page.tsx` AND `app/about/page.tsx`, both 0.5.** ⚠ **It is needed on `/about` for the
SAME arithmetic reason — same `place()`, same 0.016px residue — not copied as a superstition.**
⛔ **The proper fix removes the residue and BOTH copies go. Grep `NAV_DROP_PX`. Carl's to
authorise.**

## Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **compiled successfully** — the prerender error is gone |
| `npm run lint` | **1 error, 5 warnings — unchanged baseline** |

⚠ **A stray measuring script (`wide.mjs`) was left in the repo root during diagnosis and has been
removed.** ⛔ **Temp scripts belong in the scratchpad; this one was written to the repo root to
resolve `@playwright/test` and then not cleaned up.**

---

# ⛔ THE `/about` DROPDOWN — BUILT OVER A STATED OBJECTION, THEN TUNED BY EYE

**Carl's decision, 31 August 2026:** *"Seeing as we are already in the about section, having about
there seems a bit redundant. What if we replaced about with Roles and hovering over it would produce
a drop down list of Examples and TBD?"*

⚠⚠ **THE BUILDER OBJECTED AND CARL PROCEEDED. Recorded because the objection was sound and is not
withdrawn:** this is the site's **first hover-revealed navigation** — a new interaction mechanism
(§5a) — and **Rule 8 says hover-only appearance is a regression *"unless explicitly requested"*.**
⛔ **THE RULE IS SATISFIED BY THAT CLAUSE, NOT BY THE PATTERN BEING SAFE.** ⚠ **Carl's own framing
of why it is acceptable here: *"because of the site structure this is the first time when weve
needed it."*** **Do not read it as house style.**

⛔ **HOVER IS NOT THE ONLY PATH, AND MUST NOT BECOME ONE** — pointer, keyboard (focus + Escape,
`aria-expanded`), and click for touch, where hover does not exist at all.

## ⚠⚠ THE TOUCH PATH WAS DEAD ON THE FIRST BUILD

⛔ **Clicking the trigger did NOTHING**, while hover and keyboard both worked. **A click focuses the
button first, `onFocus` opened the panel, and `setOpen(v => !v)` closed it in the same gesture.**

⚠ **On a phone, click is the ONLY route** — so the feature was unreachable there while looking
complete on the desktop. ⛔ **Found by testing each path SEPARATELY rather than assuming one implied
the others.** Fixed by capturing the pre-press state on `pointerdown`, which fires before focus.

## Three tuning passes, all by Carl's eye

| # | Carl | fix |
|---|---|---|
| 1 | *"should be centered. Below the word roles, its too much to the left"* | `right-0` → `left-1/2 -translate-x-1/2`; items `items-end` → `items-center` |
| 2 | *"should be closer to the word roles... they look disconnected"* | outer `pt-2` → `pt-1` → **none**; inner `py-3` → `pt-1.5 pb-2`; `gap-2` → `gap-1.5` |
| 3 | *"does not correspond to the home page... drop a little and move slighly right"* | see below |

⚠ **On pass 2 the INNER padding mattered as much as the outer gap** — the perceived distance is
trigger-to-**text**, not trigger-to-border. **Trigger → "Examples" went 21.8px → 13.79px → 7.79px.**

## ⛔⛔ PASS 3 — TWO FAULTS, TWO DIFFERENT CAUSES, BOTH MEASURED

**Carl saw one symptom; it was two.**

| fault | measured | cause |
|---|---|---|
| **moves right** | **+2.447px** on `Home`, `Services`, `Work` — ⚠ **but NOT `Contact`** | "Roles" is 35.846px wide, "About" 38.293px. The row is `justify-end`, so the 2.447px deficit pushed everything LEFT OF THE TRIGGER rightward. **Contact sits right of it and did not move — that asymmetry is what identified the cause.** |
| **drops** | **0.942px** (31.428 vs 30.486) | ⛔ **`Roles` is a `<button>`, its siblings are `<a>`.** A button is an inline-block with its own line-height metrics rather than the anchors' 20px line box. |

**Fixed:** `block leading-5` puts the button on the anchors' baseline; `w-[38.293px]` holds the
trigger at the width of the word it replaced.

**Result — `/` vs `/about`, at 1920×1080:**

    Services   Δtop 0.500   Δleft 0.000
    Work       Δtop 0.500   Δleft 0.000
    Contact    Δtop 0.500   Δleft 0.000
    About/Roles Δtop 0.500  Δleft 0.000

⛔ **Δleft is 0.000 on every word.** ⚠ **The uniform 0.500 is the APPROVED `NAV_DROP_PX` optical
correction, applied deliberately — not drift.** **Carl: *"Nailed it again."***

⚠ **The dropdown still centres on the WORD, not the widened box: 0.00px.** ⛔ **Checked because
widening the trigger could have centred it on the box instead.**

## ⚠⚠ A FRAGILITY CARL HAS ACCEPTED KNOWINGLY

⛔ **`w-[38.293px]` IS THE MEASURED WIDTH OF "About" IN THIS FONT AT THIS SIZE.** ⚠ **If the nav font
changes — the decision Carl is currently weighing — THE VALUE IS STALE AND THE ROW SHIFTS AGAIN.**

**Carl, told before the commit:** *"On the font issue- understood. We will cross that bridge when we
come to it."* ⛔ **Accepted, not overlooked.** ⚠ **The durable fix at that point is to re-measure, or
to give every nav item a shared fixed width so no item's text can move its neighbours.**

---

## ⛔ STATE AT COMMIT

| | |
|---|---|
| scaffolding | `/about` exists, four full-viewport sections, mark nailed |
| site headers | on `/start` and `/about`, out of flow, hanging from the nail |
| `Home` | absent from `/`, present on `/start` and `/about` at **30.486 / 1251.873** |
| `About` → `Roles` | on `/about` only, with the dropdown |
| the section rail | ⛔ **DEFERRED** until the sections have real content |
| section 2's name | ⛔ **"Roles"** — settled |
| `chunk-scope.json` | ⚠ **STILL OPEN — Carl has not said to close it** |

⚠ **`NAV_DROP_PX = 0.5` IS NOW IN TWO FILES** (`app/start/page.tsx`, `app/about/page.tsx`).
⛔ **Both carry the same comment; the proper fix removes the 0.016px residue and BOTH copies.
Carl's to authorise.**

⚠ **THE MOBILE GAP IS NOW ON TWO ROUTES.** ⛔ **Below `md`, neither `/start` nor `/about` has any nav
or menu button.** **Carl's *"return home at any point"* holds at `md` and above, NOT below.**
**Awaiting the deferred header design.**

---

# ⛔ THE MOBILE GAP IS SCHEDULED, NOT OPEN — Carl, 31 August 2026

> *"we will optimise for mobile at the end of construction"*

⛔⛔ **THIS SUPERSEDES EVERY "AWAITING CARL'S RULING" NOTE ABOUT MOBILE IN THIS FILE.** ⚠ **Three
places above say the mobile control needs his ruling — lines ~100, ~157 and ~169. THEY ARE NOW
STALE. The ruling has been given: it is deferred to a MOBILE OPTIMISATION PASS at the end of
construction.**

⚠ **The earlier text is left in place rather than rewritten, per the file-integrity rule — the
record shows what was believed when it was written, and this entry shows what changed.**

## What is settled

| | |
|---|---|
| **Below `md`, `/start` and `/about` have the mark and NO nav** | ⛔ **ACCEPTED, not a defect** |
| **When it is addressed** | ⛔ **A mobile pass at the END of construction** |
| **Carl's *"return home at any point"*** | ⚠ **Holds at `md` and above. Below it, deferred to that pass.** |

⚠⚠ **DO NOT RAISE THIS AS AN OPEN DEFECT, AND DO NOT INVENT A MOBILE CONTROL IN PASSING.** ⛔ **It
is a scheduled body of work with its own time, in the same way the header design and the mastering
pass (D-035) are.**

⚠ **THE CODE COMMENTS IN `app/start/page.tsx` AND `components/layout/about-nav.tsx` STILL SAY THE
MOBILE CONTROL "BELONGS TO THE HEADER DESIGN CARL HAS DEFERRED".** ⛔ **That is now imprecise —
it belongs to the MOBILE PASS. Both files are PERMANENTLY PROTECTED as of `10b7a19`, so correcting
them needs Carl to name them. ⚠ Not urgent: the comments say the work is deferred, which is true;
they name the wrong future pass, which is not.** **Recorded so it is fixed the next time either file
is legitimately open.**

## ⚠ WHAT THE MOBILE PASS WILL FIND ALREADY WAITING FOR IT

- ⛔ **No nav and no menu button below `md` on `/start` and `/about`.**
- ⚠ **The `375px` collision that forced `hidden md:flex` in the first place** — the nav overlapped
  the mark at x=32.8 against the mark's right edge at 85.9. **Hiding the links was the stopgap; the
  pass decides the real answer.**
- ⚠ **`site-header.tsx` DOES have a mobile route** — a "Menu" button and a slim horizontal bar. ⛔ **The
  two out-of-flow routes have no equivalent, so the site currently has one mobile nav pattern and two
  routes with none.**

## ⛔ CORRECTED THE SAME DAY — IT IS THE MASTERING PASS, NOT A SEPARATE ONE

**Carl, 31 August 2026:** *"At the end of construction there will be a 'mastering' phase where we
will fine tune and also optimise for all devices."*

⚠⚠ **THE ENTRY ABOVE CALLED IT "A MOBILE OPTIMISATION PASS", AS IF IT WERE ITS OWN BODY OF WORK.
IT IS NOT.** ⛔ **It is part of the MASTERING PASS already on record as D-035** — the phase where
Carl and the Builder fine-tune the whole site together once the skeleton is complete.

⚠ **This is not a small distinction.** ⛔ **D-035 already governs the status of everything
deliberately untuned: `PROVISIONAL` means *in place, deliberately untuned, awaiting the mastering
pass*.** ⚠⚠ **So the mobile gap is not a defect with a deferral attached — it has the same standing
as the provisional gold on `/about` and the landing page's stale copy. The record already had a word
for it.**

⛔ **AND MASTERING IS WIDER THAN MOBILE:** Carl's words are *"fine tune AND ALSO optimise for all
devices"* — **all devices, not phones.** ⚠ **The 4K TV Carl uses for ballpark spacing is one of
them, and this site has been judged at 1440 and 1920 only.**

⛔ **DO NOT create a separate "mobile pass" item anywhere in the record.** ⚠ **It is D-035's scope,
and D-035 is already written.**
