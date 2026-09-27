# Session Handoff — 27 September 2026. THE §2 SEQUENCE IS BUILT AND LOOPING; THE BLOWOUT IS FIXED. FOUR BRAINSTORMS RECORDED, NOTHING OF THEM BUILT.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**

---

## ⛔ WHERE THINGS STAND

**Everything is committed and pushed** (this handoff rides in the last commit of the session). ⚠ Pushing `main`
DEPLOYS — live `/about` has all of the below. **No server is running.**

⛔ **CARL WORKS ON PLAIN `/about`, and now STARTS AT THE TOP and presses "Roles"** — the sequence begins from there.
Flags only switch things off or compare; put the query BEFORE `#roles`.

**Built this session, on plain `/about`** (record: the 27 September entries in the D-095 tail of `decisions.md`;
sprint: the moving-light row and the new SEQUENCE row):

1. **THE FACE'S HIGHLIGHT CAP** (`HIGHLIGHT_CAP` 0.1, `about-card-mesh.tsx`) — the moving light's reflected hotspot
   (the dome's DIRECT SPECULAR — proven: the white spot stays with the text removed) is limited, never white; the
   sheen stays. Worst word CS 0.24 → 1.00. **The blowout dips are OFF by default** (`?lmdip=1`). `?hlcap=0` removes
   the cap. ✔ Carl: *"yes, that looks a lot better."* Carl's four suggested routes (penumbra, text roughness,
   emissive text, three.js layers) are recorded with why each misses — layers cannot keep a light off one mesh in
   three r185.
2. **THE §2 SEQUENCE** — press Roles (or scroll: D-092's trigger, once per visit, unchanged) → CA's rim ignites →
   CA's text writes → **the next card strikes as this card's FIRST cycle reaches its 3rd-last word** → each card
   writes **TWO cycles** and goes **OUT: a reverse flicker (its ignition played backwards) ending on the same frame
   as its text vanishing** → **CS's first cycle strikes CA again: a LOOP, one period of 85.3 s.** ✔ Carl on the
   steps: *"Thats better"*, *"Thats good"*, and *"The timing between CS off and CB activation is great, it happens
   almost as one continuous action."*
   - **Architecture (structural, Carl approved it — *"Yes, build it"*):** ONE timeline set once by the trigger
     (`sequencePlan`, `about-neon.ts`), read off EACH CARD'S OWN chase via ONE shared layout (`layoutCardText`,
     `card-extrude.tsx`); the clock is a ref per canvas mount (`sequenceRef`), set by `NeonBloom` in the frame the
     ignition starts. Faders: `?seq=` (order), `?seqfew=` (words left), `?seqloop=0`, `?textstatic=1`.
   - **Walked from Roles** (`live-work/scripts/sequence-loop-walk.mjs`): every mark within a frame of the plan;
     every exit rim + text in one frame; CA comes round at 85.28 s.
3. **The light's trajectory guides OFF everywhere** (`?lighthelpers=1` draws them).
4. **§1's em dashes removed** — Carl chose *"Separate the roles into brand strategy, design, technical architecture
   and execution, and…"*; line counts identical before and after (`live-work/scripts/s1-line-count.mjs`).

## ⚠ OPEN ON WHAT WAS BUILT — CARL'S

- ⛔ **FLASH CAP AT 3 — AT THE CAP, NOT OVER** (2 before the loop): CA's lap-2 grow runs into CD's reverse flicker
  (~87–88 s). The file says author to ≤2 and bring anything more to Carl. **Reported, not altered.**
- ⚠ **Continuous rendering, off screen too:** the looping text and neon ask for a frame every frame and neither
  checks visibility (the moving light does). Raised, not changed.
- The trigger still fires once per visit; the sequence it starts now runs for ever — recorded as overtaking D-092's
  *"no need to labour the point"* for the sequence.

## ⛔⛔ BRAINSTORMS — RECORDED, NOT CHUNKS, NOTHING BUILT. DO NOT START ANY UNASKED

- **D-092 DEVELOPED — the room from §1 into §2.** Consolidated in D-092 (*"DEVELOPED BY CARL, 27 SEPTEMBER 2026"*).
  Carl's model, as he CORRECTED the Builder: *"the image is faded in Sect 1, its opaque in Sect 2 and cards come
  into view as the wipe happens. When the wipe clears the bottom of CA, the rim is activated."* The wipe's edge is a
  **gradual gradient**. ⚠ Two Builder readings were REJECTED (recorded there). A static faded look (0.2) was tried
  — ✔ *"That looks good"* for the logo and nav — **and removed.** ⚠ The black side bands: Carl's read, *"a design
  choice then"* — not ruled; the parked viewport-fill problem may dissolve into it.
- **D-088 — THE DESK MARK IS BACK, in the new room.** Right of the monitor (measured: two spots split by the mic-arm
  clamp; the one right of the clamp is clear overhead — `live-work/screenshots/desk-space-27-september/`). Carl:
  2D, face-on; **the SCROLL dislodges it and it FALLS into §3's video player** (the files: it lands as the
  player's idle content, *"before a video is chosen"*). ⚠ Later the same day: *"The desk Logo might well use this
  technique"* — the 3D half-pipe below. Open: D-065 (a moving mark), D-063 (blue), reduced motion, one scroll
  mechanism shared with D-092's wipe.
- **§3's CONTENT — FILMED BUILDS.** The home page's closing **"Who we are"** button becomes a three.js build, *"similar
  to the 'next step' in q+a. Different material, colour and use of light"*; **each stage (mesh, material, lights)
  filmed** — one of **FOUR** examples in §3's player. *"We walk the walk."* Answers D-071's refusal (the films ARE
  C2B's work). ⚠ The button is ONE OF A PAIR with `/about` §4's "Start a conversation"; `app/page.tsx` is
  PROTECTED. ⛔ **Carl: *"We will work out the details when sect 2 is completed."***
- **A 3D HALF-PIPE MARK IN THE BOOKCASE CUBBY** (the empty compartment by the clock reading 12:40): *"Leaning against
  it, inside. A half pipe. Flat back."* — a small **proof of concept for a larger ANIMATED mark in the HERO.** Source:
  `brand-assets/logo/c2b-flat-white-alpha-cleaned-1x.png` (measured: ONE closed outline; two tight spots; there is NO
  vector logo — the "gold hero SVG" is a PNG in a wrapper). ⛔⛔ **Carl: *"this is a new type of build. We need all
  the scrutiny and planning. its just brainstorming at the moment."*** → when it becomes a chunk: **Plan Mode, the
  Architect's plan-review gate, checkpoints — NOT waived.**

## ⚠ STANDING INSTRUCTIONS AND CORRECTIONS FROM THIS SESSION

- ⛔ **No em dashes in site copy** (Carl: *"if anything screams AI its that"*). When removing one from Carl's own
  words, OFFER rewordings; he checks line counts. Metadata still carries them (the tab title *"About — C2B Web
  Design"*; og tags in protected `app/layout.tsx`) — raised, not changed. Hyphens in compounds are fine.
- ⚠ **Twice this session the Builder mis-read Carl and built or wrote the wrong thing**: CB was moved to CA's SECOND
  cycle (Carl: *"It should activate on CA first cycle"* — it also breached the flash cap), and the §1→§2 idea was
  restated as a moving border (Carl: *"NO"*). **Restate in HIS terms, and when an answer is ambiguous, ask once
  rather than build on a reading.**
- Scope is widened by Carl: he added `app/about/page.tsx` (*"yes, of course"*). `live-work/chunk-scope.json` is still
  labelled `about-moving-light`; its files now cover the sequence work too. `unlocked` is empty.

## ⚠ PARKED / STILL CARL'S (carried)

- The logo on `/about` otherwise (D-088 above). Static key/fill off vs legibility-first (D-090) — re-judge with the
  cap. The etch glow (off). The moving light's colour. ENVMAP-STALE / RIM-DARK. `proven.json` (VERIFY-UNPROVEN).
  Superseded 24 September overlays → `superseded/`? CLAUDE.md's required-reading word count (~19,100, not 8,837).

## ⚠ HOUSEKEEPING

- ⚠ **Shell quoting eats backslashes and `$`** (bit again): write multi-line edits as `.cjs` files with the Write
  tool and run them with node.
- Measurement scripts from this session are in `live-work/scripts/` (force-added); two big scan folders
  (`blowout-scan-27-september`, `highlight-cap-27-september`, ~230 MB) are NOT committed.
- Playwright: the first page load of a context lands before the `#roles` scroll — throw it away. Known console
  noise: `THREE.Clock` deprecation; a D3D X4122 warning.
- Lint baseline holds: `1 problem (1 error, 0 warnings)`. Carl's machine: DPR 1.36, viewport ~1412 × 700 CSS.

---

*Written 27 September 2026. Replaces the 25 September (third session) handoff.*
