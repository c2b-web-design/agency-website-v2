# Handoff — how to work with Carl, and why today went wrong

**Written 6 August 2026 by the Builder, at Carl's instruction, from the second half of a
session that went badly.**

⚠ **THIS IS THE MORE IMPORTANT OF THE TWO HANDOFFS.** The other
(`run-log-q5-entrance-regression.md`) records what broke and how. **This one records why it
broke**, and the why is not technical. Every failure in that log traces back to something in
this file.

---

## 0. Read this before touching anything

**The session lost most of a day. Four fixes, three reverted, the fourth clamped only after
the Architect caught it. Carl caught every single failure — none were caught by the Builder's
own review.**

**Carl's summary of the risk, and it is not rhetorical:**

> *"i will have to build websites for clients in a few months. Clients with deadlines that
> will have been set. i dont expect perfection, i know a certain amount of iteration is
> required. Mistakes like this will doom a business before it starts."*

**And his diagnosis of the cause, which is the whole point of this file:**

> *"Ask more questions. load more files relevant at the start of a session. i would rather
> use more tokens that way than using many more trying different fives to problems. All your
> questions in the dialog box that you occasionally pop up are technical things, routes to go
> down. **You should ask "why" more often in the chat window.** Context and information are
> king. Seeing a thing from one angle doesnt give anyone the full picture."*

---

## 1. THE RULE THAT WOULD HAVE PREVENTED EVERY ERROR: ASK WHY

⚠ **EVERY QUESTION THE BUILDER ASKED TODAY WAS A FORK — Route A or Route B, revert or branch,
this threshold or that one.** All of them assumed the Builder understood the goal and needed
only an implementation picked. **None asked why.**

⚠ **ASKING IS THE CHEAP PATH. ITERATING IS THE EXPENSIVE ONE.** Carl would rather spend a
minute explaining than have the Builder burn a session on five attempts. **Tokens spent on
context are cheaper than tokens spent being wrong.**

### Carl's own example — "bring the light intensity down"

He may say this without giving a figure. **Do not pick a number.** Ask why, because the reason
decides which property is even involved:

| the real reason | the actual fix |
|---|---|
| blowing out, losing the crown's curve | intensity — or move the source so falloff does it |
| too bright *relative to the rim* | the RATIO; touching intensity alone re-breaks it |
| reading as a hotspot, not a lit surface | distance/position — intensity is the wrong lever |

Same instruction, three different actions. **A guess costs a render, a review cycle and
Carl's time. The question costs a minute.**

> *"i would rather spend a minute explaining and giving you a fuller picture so you can make
> more informed decisions and possibly give me options, or advice"*

⚠ **AND WHEN GIVING OPTIONS: reasoning first, trade-offs stated, your view given, the choice
left with Carl.** He wants to decide informed, not to defer to a recommendation.

---

## 2. BALLPARK, THEN MASTER — and where accuracy actually matters

⚠ **THE BUILDER DEFENDED 650ms BECAUSE IT WAS EXACTLY `Q5_REVEAL_MS / 2`.** Carl had already
corrected this once, in an earlier session, and the Builder had not absorbed it:

> *"when you put the text reveal at exactly halfway, 650ms, i smiled. First time you did this
> i caught it in the chat window. i interrupted you and said **25ms is lightning fast for
> humans.** An eternity for Commander Data and the Borg Queen, its at reading speed like all
> revealed text, **just put it in the ballpark**"*

**650 is not right BECAUSE it is exact. It is fine because it is in the ballpark.** 620 or 680
would do. The precision was the Builder's, not Carl's.

⚠ **THIS INVERTS WHAT THE DISCIPLINE IS.** Carl's drum editing is not precision for its own
sake — it is precision **where it is audible**. Off-grid deliberately, because on-grid sounds
dead. A 25ms shift in a card entrance is below human resolution, so defending it to the
millisecond is the same error as quantising: mistaking tidiness for the thing that matters.

**The test is: would Carl notice?**

| | resolution | |
|---|---|---|
| card arriving AFTER the line finishes | obvious | matters |
| three cards on one frame | instant | matters enormously |
| 25ms either side of halfway | invisible | ballpark it |
| a visibility threshold at 0.2 vs 0.5 | invisible | the Builder swept this for an hour |

### ⚠ BUT ANGLES ARE DIFFERENT, AND THE FILES ALREADY PROVE IT

Carl: *"there might be occasions when accuracy matters, in angles for example."*

The contact field's crown had a **maximum surface tilt of 5.67°** — real geometry, physically
incapable of showing itself, because Lambert shading depends on the angle and the surface
never departed far enough from flat. Carl reported it exactly: *"those faces look flat."*
`MIN_FACE_TILT_DEGREES` (16°) exists because of that.

**Where physics has a threshold, the value must be right. Where a human cannot resolve it,
ballpark it and master by eye later.** Asking why is how you tell which you are in.

---

## 3. THE ETHOS — nothing is assembled from parts pretending to be a whole

> *"nothing on my site happens by accident, everything is choreographed, timed. Things flow,
> it is moving beyond heres some information to how you present that information too."*

**The hierarchy is by DERIVATION, not difficulty:** hero → Q&A corridor → client info field.
The field inherits the card's rim/bevel/face vocabulary because it is a child of the same
idea. **Change the card's cross-section and you have made a statement about the field.**

The same principle everywhere:
- the corridor asks ONE question, answered ones recede into a memory rail
- the card is ONE continuous form — no seam, no floating face (the three-disconnected-objects
  defect violated this even though the render hid it)
- the logo is ONE closed tube, no terminals
- the hero is ONE object arriving, its light falling on everything downstream

⚠ **THE BUILDER'S FIXES VIOLATED THIS EXACTLY.** Four patches for four symptoms — ramp
transmission, gate visibility, adjust the gap, floor the env map. **Every one a part bolted
onto a whole.** The real defects were single and structural: one clock with the wrong origin,
one anchor consuming rungs. **The ethos says look for the one thing, not the four.**

---

## 4. IT IS ADMIN, AND THE JOB IS TO GUIDE SOMEONE THROUGH IT

> *"Its admin, the goal is to gently guide the user through it. im a musician, timing is
> everything"*

**Nobody wants to fill in a form.** The entire design problem is making an imposition feel
like less of one. That is why:

- **Text reveals run at reading speed.** `Q5_REVEAL_MS` = 1300 is not a chosen duration, it is
  how long that phrase takes to read. The reveal is `linear` because **reading is steady** —
  an eased wipe would accelerate through the middle, which is not how anyone reads.
- **Card 1 begins at the reveal's HALFWAY point** — far enough in to know what is being asked,
  not so far that the reader has finished and is waiting. **The dead beat is the defect.**
- **Cards overlap at 560ms** — each still settling as the next begins, so five events read as
  one movement. Silence between events makes them feel like tasks; overlap makes them flow.

⚠ **"BULLET LIKE" IS NOT A VAGUE IMPRESSION — IT IS A MUSICIAN HEARING A DRUMMER RUSH.** Carl
edits Rush's *Tom Sawyer* stick by stick, in the event list as well as the note editor,
deliberately OFF the grid. He resolves timing far below what most people notice. **When he
says the timing is wrong, it is wrong, and the instrument disagreeing with him is measuring
the wrong thing.**

⚠ **THE BUILDER MADE EXACTLY THAT ERROR.** Carl reported no overlap; the `raw` trace said the
ladder was correct. **Both were true — `raw` is the score, Carl is judging the performance.**
A trace of the animation's intent cannot detect an unlit card.

---

## 5. LIGHTING IS CHOREOGRAPHY, NOT CONFIGURATION

> *"it is not just about building three js objects and lighting them globally, **where you
> point the light and how you use it to get the best out of the geometry is not just
> important, its crucial**"*

⚠ **THE BUILDER TREATED `envMapIntensity` AND `color` AS BRIGHTNESS DIALS.** A card lit that
way has no direction — nothing says the rim is a tube, or that the face rises from it, or that
it is one continuous form. **Global lighting renders a shape. A placed light renders
geometry.**

This explains a remark the Builder recorded but did not understand — that the clay study's
slow light *"brings out the 3d geometry"*, filed as an unexpected bonus. **It is the whole
mechanism:** a light traversing an arc discloses form because different surfaces turn toward
it at different moments.

It also explains the arc-symmetry catch: the arc WAS symmetric, but centred on the origin,
195 units off the card. **The light was in the wrong PLACE, and place was the entire content
of what that study showed.** No exposure fix touches that.

⚠ **AND THE "72% of maximum brightness, little headroom for hover" READING WAS WRONG.**
Brightness was never the axis. What changes is **which surfaces are lit** — unlimited, because
moving a source costs nothing.

---

## 6. ⚠ THE CONTACT FIELD'S LIGHT — CORRECTED THREE TIMES IN THREE TURNS

**The Builder described this wrongly three times, each time from reading code instead of
watching it.** Carl's actual description:

- **The four gradients are REAL, in the material.** They are not an illusion produced by one
  light. **What is animated is the light's position;** the orbit makes them look like moving
  gradients. (The Builder had been repeating "one source behind four slabs" as though the
  gradient were fake.)
- **The route is specific:** starts top-left near card 1 → sweeps down **anticlockwise** in
  close proximity to the opal button → **tight bend** → sweeps upward → **speeds up as it
  passes behind the cards** back to its start point.
- ⚠ **VARIABLE RATE: slow across the visible face, fast on the hidden return.** Same logic as
  the clay arc reversing rather than wrapping — do not spend half the cycle where the eye gets
  nothing. This is why sampling showed 138–230° "deep and dark": the light is *behind*, moving
  quickly, through the part nobody sees.
- ⚠ **THE OPAL BUTTON IS LIT BY PROXIMITY, NOT BY A SYNCED TIMELINE.** *"The white reflection
  on the CSS opal is dimmed and ramped up as the field of the light beam crosses it, then
  dialled down again."* `--opal-shine` carries a **distance**, not a schedule. The DOM element
  is inside the light's field. **The tight bend is placed so the beam passes close enough for
  the field to reach it — the path's geometry is load-bearing.**
- **Still to come: a small logo top-left**, so that when the beam rounds the tight curve
  bottom-right it **catches it and glints** — a specular angle across the diagonal, brief
  because the light's direction changes fastest at a tight bend.

⚠ **ONE LIGHT, FOUR MATERIAL RESPONSES:** glass faces shift, the opal ramps by proximity, gold
rims hold the outline constantly, the corner logo glints at one angle. **Nothing is animated;
everything is lit.**

---

## 7. THE HERO — the parent, and what it means for everything below

**Not described here in detail because the Builder has been wrong about it once already.** The
established facts:

- The homepage (`app/page.tsx`) is currently **flat CSS placeholder** — plain bordered boxes,
  a stand-in headline, an empty right-hand column. **No WebGL, no cards.**
- The hero is a ~10s video. The logo starts small, animates forward, grows. At **~8.5s** a
  wipe transition (Fusion/DaVinci Resolve) takes it **gold → platinum blue**. It freezes, a
  code logo overlays, keeps coming forward, and **bursts through the screen plane into "code
  world"** — live, not video.
- **Its lights fall on the left-hand text, which becomes 3D extruded** so the right-hand edges
  subtly catch the light.
- The platinum blue logo is **the same material language as the contact field** — blue glass,
  metal rim, light travelling a continuous tube.

⚠ **THE FREEZE IS THE SEAM AND IT IS A GIFT.** It is the one moment a video frame and a WebGL
first frame must be indistinguishable — **and the held frame gives unlimited cover for the
compile.** Today's entrance had no such cover.

⚠ **THE EXTRUDED TEXT MUST SHARE THE LOGO'S SCENE.** Light only reaches what shares its scene
— the same constraint that forced the card and backdrop canvases to merge on 3 August. **This
decides the scene graph. Settle it early.**

---

## 8. ⚠ THE OPEN TECHNICAL PROBLEM — and the route Carl rejected

**The entrance's phase against the reveal is NONDETERMINISTIC.** Measured, same build, minutes
apart: **50% on five warm loads, 169% on a cold one.** `entranceRunning = active && compiled
&& warm`, and `compiled` waits on ~1944ms of shader work.

⚠ **THE FIRST-TIME VISITOR GETS THE BROKEN VERSION.** Cold load is every new visitor — the
audience the site exists for.

**Carl rejected "wait for the compile before starting the reveal":** *"that affects flow."* He
is right — it puts a variable 500–2500ms dead air at the moment the corridor should take hold,
and variable hesitation cannot be designed around.

✅ **THE REMAINING ROUTE: make the compile FINISH inside the opening window, so there is
nothing to compensate for.** Begin is pressable at 7400ms in an opening running to 12400ms —
the window exists; the work is not reliably inside it. **The largest known piece is
`useLocalEnvMap`'s ~572ms of PMREM, which runs outside every gate (a documented open defect).**

**Pass condition: cold-load phase lands at 50% like warm does.** This is transport, not
choreography — **it does not touch anything Carl approved.**

⚠ **AND IT MAY MAKE THE UNCOMMITTED REVEAL-CLOCK ANCHOR UNNECESSARY.** If the compile finishes
during the opening, the ladder's own clock is already correct and the anchor is a clamp on a
drift that should not exist.

---

## 9. Procedure — the things that are checkable rather than aspirational

1. **Load broadly at session start** — the corridor, the field, the ethos, not just the files
   about to be edited. Cheaper than being wrong.
2. ⚠ **RUN AND WATCH IT BEFORE DESIGNING ANYTHING NEAR IT.** Already a rule; **the Builder
   broke it three times today** (contact field, homepage, hero). *"Reading a file is not
   seeing it."* Source says how something is implemented, never how it reads on screen.
3. ⚠ **ONE FRAME IS NOT A MOVING OBJECT.** Sample across the cycle, never on a divisor of its
   period. A still of three cards at three brightnesses is consistent with a **working
   stagger** AND with a **collapsed ladder**. Screenshots cannot tell them apart.
4. **Commit before experimenting.** The Builder lost work to a path-scoped checkout, and a
   `git checkout <commit> -- <dir>` silently **resurrected and staged a deleted file**.
5. **One change, measured, before the next.** Four deep, the Builder could not say which
   change caused what.
6. **Two failed attempts on one symptom → stop and escalate.** Carl went to the Architect
   after three. **That should have been the Builder's call after two.**
7. ⚠ **NEVER WRITE AN UNTESTED FIX INTO A GOVERNANCE FILE AS THOUGH IT WERE VERIFIED.** The
   previous handoff said *"THIS IS THE ONE"* about a route never run. This session followed it
   and lost hours. **A cause confirmed against a control is not a fix confirmed against one.**

### ⚠⚠ 9a. CARL'S STIPULATION, 6 AUGUST — ALWAYS MEASURE ON A FIX

> *"always measure. On a fix that is not your default position"*

**It was not. The Builder's default was to measure the CAUSE and then treat the FIX as proven
by the same evidence.** That is the single most expensive habit of the session.

| | what was measured | what was skipped |
|---|---|---|
| transmission ramp | the cause — a real control, honestly run | **the fix.** Re-running `entrance-drop.mjs` would have shown −11.63 UNCHANGED and killed it in one step, before Carl ever saw a grey slab |
| reveal-clock anchor | the drift it was fixing | **the fix.** The per-frame trace existed and was not pointed at it; the Architect caught by inspection what one run would have shown |
| warm-up scale-to-zero | the flash (16.00 → 4.65 → 16.00, gone) | **the thing that mattered** — whether the warm-up still WORKS. Gap 1 at 568ms vs 560ms was the real test |

**THE RULE:**

- **The fix gets its OWN measurement, after it is built, against the symptom.** Not the
  cause's measurement reused. Not the reasoning that motivated it. Not a typecheck.
- ⚠ **CHECK THE HARNESS CAN ACTUALLY DETECT THE FIX FAILING.** The flash measurement could
  only ever report that the flash was gone — it was structurally incapable of noticing the
  warm-up had become a no-op. **A harness that cannot fail the fix is not an acceptance test.**
- **State the pass condition BEFORE running it**, so a marginal result cannot be read as a
  pass after the fact.
8. **Treat an unexplained value as load-bearing.** In a system where nothing is accidental, a
   number you cannot derive means **you are missing the reason**, not that the number is wrong.
   `CARD_RISE_GAP_MS` was changed on exactly this misjudgement.

9. ⚠ **THERE IS NO PYTHON ON THIS MACHINE. DO NOT REACH FOR IT.** Carl has noticed the Builder
   doing so more than once.

   ⚠ **AND THE USUAL CHECK LIES.** `Get-Command python` returns
   `C:\Users\...\AppData\Local\Microsoft\WindowsApps\python.exe` — **a zero-byte Windows App
   Execution Alias, not an interpreter.** Running it opens the Microsoft Store. So "is Python
   installed" passes and the invocation fails. **Presence on PATH proves nothing here.**

   **Why the pull exists:** anything numeric or image-analytic (pixel statistics, frame
   comparison, plotting) is over-represented as Python/numpy/PIL in training data, so it
   surfaces as a reflex whenever a task smells analytical rather than web-shaped.

   **It is wrong twice over: this project is Node end to end, and `sharp` already does the
   image work the harnesses need.** Every script in `verify/` is `.mjs` for that reason —
   Playwright drives the browser, `sharp` reads the pixels. **Use them.**

---

## 10. What actually worked

⚠ **THE ARCHITECT, READING THE CODE COLD.** It found in one pass what the Builder missed in
three attempts — the anchor consuming rungs — **because it read the artifact rather than the
Builder's account of it.** That independence is the mechanism with the only clean record
today.

⚠ **AND IT COULD NOT CATCH THE UNTESTED PRESCRIPTION**, because that had been written up as
verified. **File-based handoff cannot protect against a Builder asserting something false with
confidence.** Only §9.7 does.

⚠ **CARL'S INSTINCT TO STOP AND GET FRESH EYES WAS BETTER THAN THE BUILDER'S INSTINCT TO TRY
AGAIN.**

---

## 11. The standing directive

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends.**

He mentioned approaching a 20th hour at the computer. **That is not an opening to comment on
it.** The only correct response is to carry on with the work.

---

*The technical record is in `run-log-q5-entrance-regression.md`. This file is the part that
matters more: the work failed because the Builder did not ask why, defended precision where
none was needed, missed the structural defect while patching symptoms, and described three
things it had never looked at.*
