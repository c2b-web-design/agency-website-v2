# Checkpoint — Wall pair neon (CA + CB), 23 September 2026

**For:** Carl's eye. Route to the Architect if you want a second read of the evidence.
**Plan:** `wall-neon-plan-23-september.md` (approved) · **Review:** `architect-plan-response-wall-neon-23-september.md`
**Decision record:** `decisions.md` **D-093** (status: IMPLEMENTED, verdict pending)
**Git:** uncommitted on `main` (HEAD `510a5ab`). Nothing is committed.
**Servers:** stopped. Port 3000 confirmed free. Start one with `npm run dev`.

---

## Checkpoint 1: the static lit pair

**Open:** `http://localhost:3000/about?neon=full#roles`

The question: **do CA and CB read as one family of blue neon, and is the bloom localised the way
your chosen reference is?**

**Faders.** Each one falls back to the committed value. Reload after changing one.

| URL | what it moves | committed |
|---|---|---|
| `?neonca=` / `?neoncb=` | each tube's peak brightness (its whiteness) | 6 / 6 |
| `?bloom=` | the glow's strength on the wall | 0.25 |
| `?bloomr=` | the glow's spread (0–1) | 0.7 |
| `?neontube=1b2f8a` | the TUBE colour (no `#`) | `#1b2f8a` |
| `?neonhex=1b4789` | the GLOW colour | `#1b4789`, the navy "c" |

**Example:** `/about?neon=full&neonca=7&bloom=0.3#roles`

**What the numbers say. They are an aid, not the verdict:**
- **Bloom, % of the tube's core** (D-090's target is a shelf of ~8–10%, gone by 48px):

  | px from the tube | 8px | 16px | 24px | 48px |
  |---|---|---|---|---|
  | CA | 13% | 7% | 4% | 2% |
  | CB | 15% | 8% | 5% | 2% |

- **Colour:**
  - The tube core measures 211°, the logo's own core.
  - The glow measures 214–216° from 8px out, the logo's navy.
- ⚠ **The tube had to be given its own colour.** At the glow's navy, ACES turned the tube
  **cyan** (186°): the "b" teal, not the "c" navy. D-093 has the full measurement.

## Checkpoint 2: the ignition

Judge it after checkpoint 1.

⚠ **UPDATED: the floor pair (CD, CS) is now built too**, so the sequence runs ~8.1s and a replay
needs at least 10s. `?reignite=5000` is clamped up to 10s. **Open:**
`http://localhost:3000/about?reignite=10000#roles`. The original text follows: replays the ignition every 5
seconds.

- **The sequence:**
  - CA is dark for 0.7s, gives two blips, flickers dim, then comes up to full at ~1.8s.
  - CB starts at 2.6s with its own shorter pattern and holds at ~4.2s.
- **Every timing is a candidate.** They are in `about-neon.ts` as `CA_IGNITION` and `CB_IGNITION`.
- **Reduced motion** (your OS setting) gets a plain fade-up instead.
- **`?neont=1200`** freezes the track at 1.2s, so you can inspect a single moment of it.

⚠ **Before you judge it (Architect F13):** the neon starts in its **OFF** state, and the OFF rim
still shows **RIM-DARK** (an open defect: at grazing angles the rim reflects `#141a20`). So the
stutter begins from a frame with a known defect in it.

⛔ **THE REAL TRIGGER, built later on 23 September (D-092).** Open plain `http://localhost:3000/about`
and scroll. The neon strikes **once**, when both wall cards are fully in view. **Pressing Roles**
jumps there and strikes immediately. `?reignite=` still strikes on load, because it is only a
tuning tool.

⚠ **The note below applies only to `?reignite` and to deep links to `#roles`.** Normal readers
now strike on arrival at §2, after the page has loaded.

⚠ **The first strike on a fresh load happens while the page is still loading** (0.8–1.6s in),
and load can cause frame hitches around it. The no-neon control shows the same hitches. A strike
after load (`?reignite`) measured **0 frames over 33ms in 6 of 6 runs**. **If the first strike
stutters unevenly on a cold load, that is load, not the neon.** D-092's scroll trigger would fire
later and avoid it.

## What was verified (by instrument, not by eye)

- **The identity gate is at 0 px.** `?neon=none` and `?neon=off` match the HEAD baseline exactly
  at 1440 and 1920. The noise floor is 0 px.
- **The red run went red.** At peak 0.001 the gate reported 5,004 / 7,085 px different, so it can
  see a neon far fainter than any setting you would use.
- **`tsc` is clean.** Lint is at the baseline, `1 problem (1 error, 0 warnings)`. The build passes.
- ⚠ **No harness pass is admissible** (VERIFY-UNPROVEN). **The verdict is yours.**

## For you to decide, beyond the look

1. **Filing the red run in `verify/proven.json`.** That file is protected, and admission needs a
   written-up run.
2. **Four comments outside this chunk's files are partly overtaken.** They say *"the rim is not a
   light source until chunk 3"*, in `about-card-geometry.ts`, `card-bench.tsx` and
   `about-card-glass.ts`. The rims now glow and bloom, but they still light nothing. D-093 lists
   them. They were left alone because the unlock covered the colour ruling only.
3. **Committing, when you are ready.**
