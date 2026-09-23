# Session Handoff — 23 September 2026. THE NEON IS BUILT (ALL FOUR). NEXT: THE CARD TEXT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**All four `/about` §2 cards have neon.** The palette is **APPROVED AS A STARTING POINT (R-028)**:
navy "c" on the wall pair, teal "b" on the floor pair. Carl: *"Its a great colour combination and the
neon palette works very well in the room. its a good starting point… they still need working on."*
⚠ **That approves the PALETTE only.** Peaks, bloom, the ignition patterns and the order are
**not individually approved**, and **the ignition has no verdict**.

- **Record:** **D-093** (the neon, and every measurement), **D-092** (the trigger), **D-094** (the text
  direction, new), **D-077** amended (Carl's copy-setting rules), **R-028**.
- **Code:** `components/about/about-neon.ts` (values and track), `neon-bloom.tsx` (the frame owner),
  `about-card-mesh.tsx` (`neon` prop), `about-card-canvas.tsx` (wiring), `verify/about-neon.mjs`
  (identity / floor / profile / frames).
- **To view:** `npm run dev` (the server is STOPPED and port 3000 is free).
  - `/about?neon=full#roles` holds all four lit.
  - `/about?reignite=10000#roles` replays the ignition.
  - Plain `/about` then scroll or press Roles gives the real trigger.
  - The faders are listed at `about-card-canvas.tsx` (`neonChannels`).

## ⛔ THE NEXT SUBJECT: THE CARD TEXT — D-094

Carl opened it: *"Talk to me about three js text."* It was discussed, not built.

**Carl's rules. They are RULED and bind any route:**
1. **The copy is crafted; its SETTING is part of the edit.** Size and word spacing matter, and it
   must sit within the card.
2. **JUSTIFIED.** Not left-aligned, which reads *"like a letter or memo"*. Centred was raised and not
   chosen.
3. ⛔ **REWORDING IS THE LAST RESORT.** The order is: setting first, then card size (D-077), then the
   words, taken to Carl. **The Builder never trims copy to fit.**

**The recommended route, NOT yet confirmed by Carl:** the browser's own text engine draws each card
into its **own** texture, on its **own** surface (the face's geometry, lifted a hair). The line breaks
are chosen for even justified gaps, a gap cap is set, and a fit check fails loudly. It has its **own
material**, driven from the D-091 track (the opal route), and an `sr-only` DOM copy. ⚠ **troika was
measured unable to guarantee a crafted setting:** it has no word-spacing control, its own layout
engine, and no `woff2` support.

**First step, per §14a: CA alone.** Measure the dome under the text block and the texture budget
**before** building. Move all four copies into **one module** first. ⚠ CD's and CS's copy exists
only in `live-work/about-section-thinking.md` (D-077's pointer).

**Open, and Carl's:**
- the route
- role names: same setting, or a title that *"catches the light"*
- is the text readable before the neon strikes, or revealed by it?
- the font (Geist?)
- the last line of each paragraph
- the gap cap, set by eye

⚠ **The plan-review gate applies unless Carl waives it.** He waived it twice this session, for the
trigger and for the floor pair, each time for that piece only. **A waiver is not standing.**

---

## ✔ WHAT THIS SESSION DID — all committed and pushed

1. **The wall pair's neon (CA, CB) went through the plan-review gate.** The Architect found 14 things;
   F1 was a build blocker (the ignition would never have fired). All were taken. Files:
   `live-work/wall-neon-plan-23-september.md`, `architect-plan-response-wall-neon-23-september.md`.
2. **Neon-only bloom, not `EffectComposer`** (Carl's choice). The composer would have stripped ACES
   from D-089's glass. The identity gate measures the room with the neon off as **0 px different**,
   with a noise floor of 0, and a red run was seen to go red.
3. **The trigger (D-092): the wall cards fully in view, ONCE per visit** (Carl ruled). The Roles jump
   and scrolling are the same check.
4. **The floor pair (CD, CS)**, on Carl's instruction without the gate.
5. **`about-card-glass.ts` was unlocked for comments only**, to correct the retired "four colours"
   ruling, and **relocked. The relock was verified by a real guard denial.**
6. `##VERDICT:` sentinel: used for the first time in real runs, and the sprint item is retired.

## ⛔ CORRECTIONS AND FINDINGS THIS SESSION, so they are not repeated

1. ⛔ **The Builder first led with in-shader bloom to avoid a new mechanism. It was wrong:** a
   material can't draw outside its mesh, and the chosen bloom target sits on the wall. **Carl: the
   site SHOWCASES techniques** (saved to memory). Cheapest is not automatically right.
2. ⛔ **Carl said "activate on landing", then revised it on seeing the consequence:** *"The flicker is
   wasted."* Both readings are in D-092.
3. ⚠ **Measured: ACES turns a saturated navy tube CYAN**, not white. The wall tube is pre-shifted
   (`#1b2f8a`, core 211°). **Measure colour on screen; luma-only instruments can't see hue.**
4. ⚠ **Measured: the teal is ~4.75x brighter than the navy at the same peak**, so the floor pair runs
   at 1.8, not 6.
5. ⚠ **Builder bug, caught by the identity gate:** an inline ref callback that didn't guard `null`
   took the whole canvas down, OUTSIDE the frame's try/catch. **The frame's isolation can't protect
   React callbacks.**
6. ⚠ **The face-colour shift Carl saw on ignition is the BLOOM'S GLARE, not light.** `bloom=0` made it
   byte-identical to neon-off. **The neon still lights nothing.**

## ⚠ OPEN — owners in brackets

1. **The ignition verdict** (checkpoint 2) and the **scroll strike point**: it fires when the cards'
   bottom edge enters, with the cards in the lower third of the screen. Carl said *"maybe"*. [Carl]
2. ⚠ **Intermittent 1920 frame drops:** 2 of 6 four-card runs showed 17–25 frames over 33ms and 1
   over 50ms; 4 runs were clean. Not attributed. **Watch it; don't dismiss it** (Q5 history). [Builder]
3. **D-087's loop is unbuilt.** Its type exists (hold/loop tails). **Hidden-tab pause is unbuilt:**
   the track reads `performance.now()`, so a hidden tab skips ahead. [next neon chunk]
4. **The rim lighting the face** (D-090's second source), **D-090's four lights**, and the **spill**
   (D-091, backplate route; the ceiling is unmodelled). [Carl]
5. **RIM-DARK and ENVMAP-STALE** (open defects). The ignition begins in RIM-DARK's off state. [Carl]
6. **Filing the red run in `verify/proven.json`:** the file is protected and needs a written-up run.
   [Carl]
7. **Partly-stale "the rim is not a light source until chunk 3" comments** in
   `about-card-geometry.ts`, `card-bench.tsx`, and `about-card-glass.ts` (locked). They are listed in
   D-093. [Carl, for the unlock]
8. Carried from before: the **accessibility items** (now partly pulled forward: the flash cap and the
   reduced-motion fade), the **`wall-card-corners-4-september.md` supersession notice**, and D-088's
   travelling mark. [Carl]

---

*Written 23 September 2026. ⛔ **Everything is pushed; no chunk is scoped; no protected file is open.***
