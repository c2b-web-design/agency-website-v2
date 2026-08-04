# Session Handoff — 4 August 2026 (second session of the day)

**Written at the end of the filament session. For the session that picks up next.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical
(D-006). **Delete this file at the end of the session that reads it, once its replacement is
written** — `live-work-protocol.md` §3a.

**This file points at records; it does not restate them.**

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Do not mention the time of day, suggest
stopping, wrapping up, resuming tomorrow, or ask whether to carry on. **Carl decides when a
session ends and will say so.** It was not broken today.

---

## Where things stand

**Repo: `main`, head `2a3d0a8`, COMMITTED and clean. NOTHING IS PUSHED** — the last push was
`f57b6db`, so four commits are local only. Lint at the recorded baseline; `npx tsc --noEmit` clean.

⚠ **`chunk-scope.json` IS STILL DELETED — the repo is FAIL-OPEN.** Unchanged all day. Carl has
been directing chunks conversationally and approving as he goes; **no scope file was drafted and
he did not ask for one.**

⚠ **THE PAGE STILL DOES NOT ADVANCE PAST Q5.** Clicking a card now fires its filament, but that is
NOT selection — no Next step, no Q4, no contact field.

### What this session did

**Two chunks, both by Carl's direction, both approved by eye as they went.**

1. **`97b987d` — the inactive state.** Rim as unlit tungsten, bevel as its glass holder, plus the
   light fader. Carl: *"That looks a lot better."*
2. **`1dfce8a` — the filament circuit.** Travel, bevel latch, uniform fade-out on a second press.
3. **`2a3d0a8` — the open-defect record.**

**Full records: the commit messages themselves are detailed, and
`live-work/references/opening-stutter.md` carries the outstanding defect.**

---

## ⚠ THE OUTSTANDING DEFECT — the opening stutters

### → `live-work/references/opening-stutter.md`

**Read it before touching this.** Carl: *"the text on the start page, where the ivory button is,
stutters."* The OPENING, before Begin — not Q5.

⚠ **THE BUILDER CAUSED IT.** The warm-up canvas compiles the filament's two new custom shaders
during the opening. That was cheap when it compiled one plain material.

⚠ **THREE FIXES ARE MEASURED AND DEAD.** The record lists them so they are not retried as fresh
ideas. **The most important lesson in it: the compile is ~1.6s and no gap that size exists in the
opening, so RESCHEDULING CANNOT WORK.** Three rounds went into treating a size problem as a timing
problem, and one of those rounds moved the stutter onto the Begin reveal — a moved symptom.

**Untested, in the order the Builder would try them:** simplify the bevel's shader (it carries a
full copy of the circuit function and only needs a latch); retry the single shared light with the
position maths corrected (it helped, 900ms → 645ms, but broke the spill onto card 2); or do not
warm during the opening at all and take the cost at Q5.

⚠ **AND ONE QUESTION IS CARL'S, NOT THE BUILDER'S:** whether the filament is worth a ~1.6s compile
on every page load.

---

## ⚠ Also open — the head does not read as a hot core

**Only ~8 points brighter than its own trail**, so it reads closer to a uniform fill than the
*"hot core and bloom"* the design reference asks for. Four values were tried; the contrast moved
from 4 to 8 points. **Something else pins the head near the top of the range and it was not
found.** Detail in the same reference file.

---

## The sequence, as it now stands

1. ~~Clone the cards~~ — done, earlier session
2. ~~Inactive rim and bevel~~ — done, `97b987d`
3. ~~The filament circuit~~ — done, `1dfce8a`, **with the two defects above**
4. **The two faders** — lockup opacity down, frost up. **Still not started**, and still what Carl
   named as next before the filament took priority.
5. **New button design** — Next step, in WebGL

---

## ⚠ How Carl worked today — this is the most useful part of this file

- ⚠ **HE GIVES CONSTRUCTIONS, NOT ADJECTIVES.** *"The N of DESIGN can end at the same distance
  from the perceived edge as when the c starts"*; *"put that half way point at the half way point
  in the gap between the cards."* **Both were exactly buildable and both worked first time.** Ask
  for the construction.
- ⚠ **HE SETTLES DESIGN QUESTIONS WITH PHYSICS.** Asked whether the bevel should be metal too:
  *"What would some metal be doing connected to a metal filament that is about to heat up?...
  i would imagine that the bevel is some sort of 'holder'... If its made of glass it would conduct
  and reflect the heat/light."* **His answer was better than either option offered.**
- ⚠ **HE CORRECTS FALSE PRECISION.** *"it doesnt have to be exact, im looking for ball park
  figures."*
- ⚠ **HE BRACKETS NUMBERS RATHER THAN GUESSING THEM.** *"if we change 1100ms to 1500ms and its too
  slow we will have a range to work with."*
- ⚠ **HE READS THE SCREEN BETTER THAN THE INSTRUMENTS DO.** Today he caught: a phantom second
  filament head, a section losing intensity mid-circuit, a 15px lag between bevel and rim, and the
  opening stutter — **all before any probe found them, and all real.**
- **No ASCII diagrams or box-drawing characters.**
- **Do not commit or push unless he explicitly asks.**

---

## ⚠ The session's lesson — four defects, each caused by the previous fix

**`ai-system/working-with-the-builder.md` HAS THE SHARED CORRECTIONS RECORD.** Entry 5 was added
this morning. **This session earns another, and it is a new shape:**

1. The tail **wrapped** → a phantom second head at the far end of the loop.
2. Removing the wrap → the origin became **a hard edge**. Carl: *"the effect of heat doesnt
   diminish in a straight line."*
3. The back-bleed was **a fixed constant** → that section dropped to it and stayed pinned. Carl:
   *"as if some of the juice has been turned down for that section."*
4. The bevel lagged 15px — **not the trigger width**, which was blamed first and changed nothing.
   The rim and bevel are swept along **different rectangles** (perimeters 433 vs 408), so equal
   fractions land in different places.

⚠ **THE PATTERN: EACH FIX WAS LOCALLY CORRECT AND CREATED THE NEXT DEFECT.** None was a careless
error; each followed from the last. **The check that would have caught them earlier is to ask what
the fix makes true that was not true before**, rather than only whether it removes the symptom.

⚠ **AND THE ASSUMED-GEOMETRY TRAP RECURRED.** A probe sampled the right edge at t=0.30 and called
it "the head" — but the top edge alone is **0 → 0.356** of this card's circuit, so the head was
still on it. That probe reported the head as **119 points dimmer than its trail**, a defect that
did not exist, and it was acted on twice before the segment proportions were computed rather than
assumed. **Find the edge; do not place it.**

---

## How to look at it

```
http://localhost:3000/start                  the walk; click a card to fire its filament
http://localhost:3000/start?cardrig=1        [1-6] geometry, [7-9] glass/light,
                                             [r] rim roughness, [m] cycle metal,
                                             [f] filament intensity, [0] print
http://localhost:3000/start?light=0.6        hold a light level across reloads
http://localhost:3000/start?beattrace=1      performance.mark per entrance beat
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`, AND PRINT THE RENDERER STRING.** Headless Playwright has
no GPU and silently substitutes SwiftShader — it invalidated a whole investigation this morning.
See corrections-record entry 5.

---

*4 August 2026, second session. The rim is tungsten, the bevel is its glass holder, and the
filament runs a circuit that latches the bevel behind it and fades out on a second press.
Committed at `2a3d0a8`, **unpushed**.*

*Next: the opening stutter — and it is a size problem, not a timing one.*
