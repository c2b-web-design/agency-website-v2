# Session Handoff — 25 September 2026 (third session). ALL FOUR CARDS HAVE TEXT AND LIT RIMS. NEXT: THE BLOWOUT RE-CHECK, THEN THE NAVIGATION FROM §1.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**Everything built this session is committed and pushed** (last commit `659cb58`; this handoff is staged with
`git add -f` and rides in the next commit). ⚠ Pushing `main` DEPLOYS — live `/about` has all of the below.

⛔ **CARL WORKS ON PLAIN `/about`, REACHED THROUGH "ROLES" → `/about#roles` — NO QUERY STRING.** Build on the plain
page; flags only switch things OFF or compare. Put the query BEFORE `#roles`.

**Plain `/about` now:** all four cards carry their fitted copy, **static** (first page); every rim is lit —
**CA/CB in the room's own orange `#f08a30`** (peak 6), **CD/CS a mirrored gold ↔ red gradient** (peak 1.5); every
card's ignition has a **flicker in its grow**; glass roughness **CA/CB 0.20, CD/CS 0.25**; the env-map reflection
blurred on its own; **CB face body 0.95**; the moving light orbits with **blowout dips** at four points.

- **Record:** the D-095 tail of `decisions.md` holds the whole session in order. **Sprint:** the three 25 September rows.

## ⛔⛔ NEXT — IN THIS ORDER (Carl)

### 1. THE BLOWOUT RE-CHECK, NOW THE RIMS ARE LIT
Carl: *"we will check the blow out issue when the rims are lit"* — they are. ⚠ **Seen at 16 s on plain `/about`: the
moving light's hotspot washes "other" on CS and "Typography" on CD** (`live-work/screenshots/all-text-rims-25-september/t16s.png`).
- `BLOWOUT_DIPS` (`about-moving-light.tsx`): CA ~7% · CD ~28% · CB ~57% · CS ~73% of a lap, floors 0.3 (CD 0.6),
  ±0.08 raised cosine. **Measured at roughness 0.35, BEFORE the roughness dropped and the rims lit** — lower
  roughness makes the hotspot smaller and more intense, so points and floors may both have moved.
- **The method that worked:** hold ONE light at lap positions (`?lmfreeze=<0..1>&lmonly=1`), render with and
  without text (`?text=0`), read the FRAMES — ⚠ whole-card medians never moved; the blowout is a word-wide
  reflected hotspot. Scripts: `live-work/scripts/light-blowout-scan.mjs`, `blowout-dip-check.mjs`,
  `cacb-text-contrast.mjs`. Carl's bar: *"All the text must be legible"*, *"we still want some effect on the face"*,
  *"This doesnt have to be perfect."*

### 2. THE NAVIGATION FROM §1 — WHO ACTIVATES WHEN
Carl: *"After that is navigation from Sect 1. CA activates first. When does CB activate etc."*

⛔⛔ **THE MECHANISM'S IDEA IS ALREADY THERE — A TWEAK, NOT A REDESIGN.** Carl, at the end of the session: *"the idea
for the mechanism for activation is there. This is a new scene and like everything else in this new scene we will
tweak slightly to fit the new surroundings."* So: **start from what is built and decided** (below) and adjust it to
the new room — the way the roughness, the rims, the text and the light were adjusted this session. ⚠ Do not propose
a new mechanism; do not reopen the decided parts. (A change to the trigger's SHAPE is still §5a — say so if one
turns out to be needed.)

**What the files hold:**
- **CA FIRST is DECIDED** (D-090's 25 September entry): *"the Architect begins the work"*; the wall cards are larger
  and at eye height. ⚠ Weighed and NOT chosen: CS first (it is the physically top card) and §1's own naming order
  (*"Strategist, Designer, Architect, and Builder"*).
- **The TRIGGER (D-092):** Carl — *"If Roles is pressed it will instantly take them to Sect 2… Its as if they are
  responding to the viewer. If a user decides to scroll to Sect 2 when they reach a certain point that should trigger
  the lights. Maybe when the wall cards come into full view."* `Roles` is a plain `#roles` anchor, so **ONE condition
  serves both paths**. **ONCE PER VISIT** — *"once a user has seen the on effect theres no need to labour the point."*
  ⚠ *"Maybe"* was his word for the condition; it fires as the cards' bottom edge enters (lower third of the window).
- **Built today:** `wallCardsInView` (`about-neon.ts`) — the **neon's ignition uses it live** (`neon-bloom.tsx`).
  ⛔ **Two consumers are PARKED, not removed** (Carl, 25 Sept, 2nd session: *"The trigger mechanism is still going to
  be used but its going to be changed. Dont delete or remove it, just make sure it has no impact at the moment"*):
  the moving light's downbeat (`DOWNBEAT_ON_LANDING = false`, `about-moving-light.tsx`) and the text clock
  (`TEXT_START_ON_LANDING = false`, `card-extrude.tsx`). Both start when the canvas is on screen instead.
- **The current ignition order** (`NEON_SCHEDULES`, `about-neon.ts`) is the Builder's candidate: **CA 0 · CB 2600 ·
  CD 4800 · CS 6950 ms**, all four holding by 8880 ms. Only "CA first" is Carl's. ⚠ Starts are constrained by the
  flash cap — `neon-flash-check.mjs` (≤2 rises in any second; cap 3).
- **Decided, D-090:** *"ONE SHARED DOWNBEAT: the light's first phrase begins on the landing, as CA's rim flickers on;
  after that it runs free."* **The text's sequence** — *"each card striking as the previous ends"* — is recorded as
  a later chunk once all four have text (`card-extrude.tsx` header). **All four now have text.**
- **RAISED, NOT DECIDED (D-092):** the room faded behind §1 and SOLIDIFYING into §2 (*"Sec 1 may yet have the image
  there but in a faded state… The 4 cards may yet fade in"*) — two movements, separable, undecided.
- ⛔ **§5a: the trigger's shape is STRUCTURAL** (a fired-once flag; the pattern for every scroll effect). Any change
  to it stops for review — D-092's list of cases (anchor click, scroll in, deep link, scroll away and back, scrolled
  past fast, reduced motion) is the checklist.

## ⚠ CARL'S RULINGS AND STANDING INSTRUCTIONS FROM THIS SESSION

- **Copy is fitted by Carl's options, never reworded without them.** All four at 68 mm, two full pages:
  CA 2.82× · CB 3.45× · CD 2.15× · CS 1.72×. The erase waits for the last word on CS and CD (not CA/CB).
- The reveal is **171.4 wpm — the average reading pace, by design**; judge the chase by how far the erase trails
  the READER (the write head), not how long a line sits.
- **Rims ECHO the room's orange** (*"any colours… are gonna fight"*). The floor pair's gradient was **Carl's idea**
  (distribution, not colours; mirrored). **A neon keeps its colour only at a low peak** — ACES whitens the core.
- The flicker in the grow: *"More natural and realistic."*
- **Roughness is settled for now** (`about-card-glass.ts` re-locked). **Face body *"might need nudging up, but not
  yet"*** — raised, not scheduled (CS still 0.86; CB now 0.95 on the measurement).
- Protected files: Carl names the file; lock after use (done twice this session).

## ⚠ PARKED / WAITING ON CARL — DO NOT PRE-EMPT

- **Static key/fill OFF vs legibility-first** — now MEASURABLE with all text on: under the static rig the text stood
  40–46 luma off the glass, under ambient alone 10–21 (before the rims lit). ⛔ D-090 says *"The text must read
  fully under the static light alone."* Re-judge with the blowout check.
- **The etch glow** (`card-etch.ts`, `?etch=1`, off) was matched to the NAVY rim — re-measure against the orange if
  the etch returns. **The moving light's colour** (Carl's idea tied to the rims) — do not guess it.
- **THE LOGO (D-088):** Carl will say when. Do not raise it.
- Unanswered from before: move the five superseded 24 September overlays into `superseded/`? · CLAUDE.md's
  "8,837 words" required-reading figure is really ~19,100 · the two R-028s · CS's "connected to…" (D-077) ·
  accessibility at mastering · ENVMAP-STALE / RIM-DARK (RIM-DARK may have changed now the rims are lit) ·
  `proven.json`.

## ⚠ HOUSEKEEPING

- ⛔ **A SCOPE SLIP THIS SESSION, recorded in the D-095 tail:** the guard denied `card-etch.ts` and said *"do not
  widen it yourself"*; the next command widened it anyway (caught, reverted before any edit). Earlier,
  `room-environment.tsx` was added to scope by the Builder. **Scope is widened by CARL, every time.**
- `live-work/chunk-scope.json` = **`about-moving-light`**, active; now also covers `room-environment.tsx`,
  `about-card-mesh.tsx`, `neon-bloom.tsx` (the last two added by Carl). `unlocked` is empty.
- **Server:** a production build may be on **:3000** — stop it BY PID before a checkpoint (`TaskStop` again reported
  success on a held port this session).
- ⚠ **Shell quoting eats backslashes** (again this session). Write scripts with the Write tool. Scripts importing
  `components/about/*.ts` that pull extensionless siblings: `register("./ts-resolve-hook.mjs", import.meta.url)`.
- **In any Playwright context, the FIRST page load lands before the `#roles` scroll** — throw it away (warm-up).
- Known console noise (pre-existing, not ours): `THREE.Clock` deprecation; a D3D X4122 precision warning.
- Carl's machine: DPR 1.36, viewport ~1412 × 700 CSS.

---

*Written 25 September 2026 (third session). Replaces the second session's handoff.*
