# Architect Plan Response — Satin blue field, four boxes as windows onto one shared gradient

**Reviewed 30 July 2026 by the read-only Architect instance.** Plan-review gate,
`handoff-protocol.md` §2.5. Findings only — nothing here is an instruction to build. Carl
decides what is actioned.

**Reviewed against the code, not against the plan's own description of it.** Every line
reference was opened and checked; the load-bearing numbers were re-derived independently.

⚠ **PROVENANCE — read this before trusting the file's authorship.** The Architect session had
**no Write tool** and could not save this itself. The findings below are the Architect's,
delivered in its own window and passed through Carl; they were **transcribed into this file by
the Builder**. The Builder is an interested party in this review, so the transcription is
recorded rather than left implicit. The original is in Carl's Architect panel and is the
authority if the two ever differ.

**The standing correction that follows from it is in `handoff-protocol.md` §2.5** — the
Architect presents all findings in its own window for review, and they are copied across from
there. Carl's instruction, 30 July 2026.

---

## Verdict

**APPROVED WITH AMENDMENTS.**

The core idea — one field, four apertures, variation falling out of position rather than
authorship — is well argued, and the plan is right that it is materially different from
D-028's five authored variants rotated across cards. That difference is Carl's call, and the
plan states it plainly rather than smuggling it past.

**B-1 below is blocking.** As written, the scope guard would deny the Builder's own required
live-work writes. It must be corrected before execution or the chunk cannot complete its
protocol obligations.

---

## What was verified as sound

| Claim in the plan | Verdict |
|---|---|
| `uvs.push(tx, 1 - ty)` at `contact-field-mesh.tsx:377`; world x/y in scope at 376 | Exact |
| `fieldPlacements` at `contact-field-geometry.ts:133-145` | Exact |
| `useStudioEnvMap` at `contact-field-canvas.tsx:371-464` | Exact |
| Shared field spans 576 x 96 world units | **Confirmed.** Row 0 centre y = +23, row 1 y = -35, each +/-19 half-height, so the pair spans +42 to -54 = 96. Width 284 + 8 + 284 = 576. Aspect 6:1 |
| Crown angular signal 7.4 deg short axis, 2.8 deg long | **Re-derived from `crownZ`.** Short: 1.2 x (pi/2) / 14.5 = 0.130 -> 7.4 deg. Long: roll-off band (1 - 0.72) x 137.5 = 38.5 units -> 1.885/38.5 = 0.049 -> 2.8 deg. Correct |
| Corner rows are 93.1% as wide as the centre | **Confirmed.** At the extreme row `roundedRectHalfWidthAt` returns 137.5 - 9.5 = 128; 128/137.5 = 93.09%. The latent UV stretch is real |
| `map` and `normalMap` carry independent transform uniforms | Correct, and a genuine trap |
| Texture density 4 texels/world unit is sufficient | **Confirmed.** Face is 275 x 29 units per box -> 1100 x 116 texels against 550 x 58 device px at DPR 2. ~2x device density, comfortably above Nyquist |
| `enquiry-opening.tsx` requires no edit | **Correct.** `ContactFieldCanvas` already accepts `active`; the mount is wired. Right call to protect it |
| Texture lifecycle should follow `useStudioEnvMap` | Correct, and the stated divergence (one shared texture, no per-box refs) is right |

The diagnostic quality of this plan is high. The findings below are not about carelessness.

---

## Amendments

### B-1 — BLOCKING. The scope guard as proposed stops the Builder recording its own work

`protected: project-intelligence/**` will deny **every** write under `project-intelligence/`.

Verified by reading the hook rather than inferring from the protocol. `chunk-scope-guard.js`
evaluates `unlocked` -> `protected` -> `files`, and the **only** exemption is
`chunk-scope.json` itself (line 89). There is no built-in `live-work/` carve-out. The
"`live-work/` prefix rule — allowed" row in the §8 attack table passed because that test's
scope file *declared* it, not because the hook knows about it.

**Consequence.** The Builder is denied on `claude-run-log.md`, `claude-chat-window.md`,
`checkpoint-request.md` and `session-handoff.md` — all four required by `CLAUDE.md` rules 6
and 7, and by `live-work-protocol.md`. It meets that wall at the checkpoint, with the work
done and nothing recorded.

⚠ **And the documented DL-1 Bash bypass is sitting right there.** A guard that blocks an
agent from writing a log it has been ordered to write is precisely the pressure that finds
the bypass. A control that makes the correct action impossible teaches the agent to route
around the control.

**Fix — either works; the second is truer to intent:**

1. Add `project-intelligence/live-work/` to `unlocked` (the trailing slash triggers the
   prefix rule at line 92). `unlocked` is Carl's lever, which is the correct seat for this.
2. Narrow `protected` to what genuinely needs it — `project-intelligence/decisions.md`,
   `project-intelligence/ai-system/**`, `project-intelligence/reviews/**`,
   `project-intelligence/active-sprints/**` — and put `project-intelligence/live-work/` in
   `files`.

Option 2 states the actual rule: the Builder must not edit canonical governance, and must
write live-work scratch.

**Screenshots are a lesser case of the same thing.** `live-work/screenshots/` sits under the
same protected prefix. Playwright writes PNGs through `Bash`, which the hook does not match,
so it will not actually block — but it is blocked in principle and allowed only by an
acknowledged gap. Covered by the same fix.

### F-1 — The brightness-ordering mitigation cannot work as stated

The plan identifies the inversion risk correctly, then proposes to answer it by pitching the
field's peak at roughly half the rendered gold's (~80 against 168). **That mitigation is
structurally incapable of holding, and the reason is arithmetic rather than tuning.**

During entrance the gold's rendered brightness is `opacity x envMapIntensity`. Opacity is
linear and `setBevelEnvIntensity` (line 597) applies `sqrt(t)`, so gold goes as **t^1.5**.
The face is diffuse at `metalness: 0`, so it goes as **t**.

Setting them equal gives `sqrt(t) = F/G`. At F=80, G=168 the crossover sits at **t ~ 0.227** —
the face out-luminates the gold for roughly the **first 680ms of every 3000ms fade**, which
is exactly the window in which each box emerges into visibility and establishes whether it
reads as a window or a tile.

⚠ **It generalises.** Gold >= face for all t requires `F <= G x sqrt(t)`, which fails as
t -> 0 for **any** positive F. Lowering the field's peak moves the crossover earlier; it can
never remove it. The peak value is not the lever.

**The two real escapes:**

- Give the face's brightness a matching or steeper ramp, so the ratio stops depending on t.
- Or establish that the crossover falls below the visibility threshold. The canvas's own
  measurements say the rim reads as "nothing there" below opacity 0.30, and 0.227 is just
  under that — so this is plausible, but it is currently an assumption and must be measured.

**Verification consequence.** "Verify the ordering at several points during the entrance" will
not catch this if the sample points miss the first quarter. The check needs a specific
target: sample the face:gold luminance ratio across t, find the crossover, and state where it
falls relative to the visibility threshold.

**Also re-measure the 168.** It does not appear in the source — `contact-field-canvas.tsx`
records the rim spanning luminance 18 -> 174, and the logo at body 125 / champagne 195. F-1's
whole argument keys off that number, so it should be measured rather than carried forward.

### F-2 — The entrance timings are described as approved. They are not.

The plan lists under *What must not change*: "All approved entrance timings —
3600/4100/4600/5100, 3000ms fades."

The code's own record says the opposite, twice, in the file the chunk will edit:

- *"'CLOSE ENOUGH' IS NOT APPROVED, and the reservation is recorded because it is specific:
  the overlap is still less discernible than Carl wants, and the boxes do not read like the
  other elements' fades. That is the outstanding gap."*
- *"50% is RETAINED AS THE BEST-JUDGED VALUE, NOT AS AN APPROVED ONE."*

⚠ **This is the exact failure D-035 exists to prevent** — a provisional value acquiring
approved status by being written down as approved, in a document the next reader will trust
because it is written down. Freezing the values for this chunk is correct and the regression
check should stay. **Relabel them: current, best-judged, NOT approved.**

### F-3 — The aspect-correction split is unnecessary, and it creates the hazard the plan flags

The plan keeps baked UVs and `repeat`/`offset` strictly separate, then warns — correctly — that
`map` and `normalMap` carry independent transforms and will silently desynchronise if only
one is updated, sliding the relief off the colour.

**But the face geometry already rebuilds on every resize**: `useMemo(..., [width, height])` at
`contact-field-mesh.tsx:512-520`. The UVs are not durable across resize in the first place, so
the separation is protecting something that does not persist.

**Bake the aspect correction into the UVs and leave `repeat`/`offset` at their defaults.** The
dual-transform desync then becomes structurally impossible rather than a thing to remember —
the same move the codebase already makes elsewhere (deriving face z from the bevel's measured
bounding box rather than hand arithmetic, to remove a whole class of error).

Cost: recomputing ~1,650 UV pairs inside a rebuild that already happens. The texture itself
still never regenerates, which was the actual goal.

### F-4 — `FIELD_GRAIN_RELIEF = 0.03` is not reproducible as specified

The derivation (normalScale 1 perturbs ~45 deg, so 0.03 gives ~1.8 deg) holds **only if the
encoded gradient saturates at +/-1**, which depends on how the Sobel output is normalised —
and the plan does not specify that. Change the height-field amplitude, the kernel, or the
divisor later and 0.03 silently means a different angle, with nothing to signal that the
by-eye result has been invalidated.

State the normalisation as part of the constant's contract: a named reference slope mapping
to a named encoded value, recorded beside `FIELD_GRAIN_RELIEF`. Every other tuning constant
in these files is held to that standard.

### F-5 — Arc direction is deferrable as a decision, not as a value

The plan defers arc direction to the light brief, which is right as a matter of authority. But
step 3 tunes `FIELD_GRAIN_RELIEF` **by eye**, and how visible the grain is depends on arc
orientation relative to the key light at `[-160, 120, 40]`. So the relief would be tuned
against a direction nobody chose, and the light chunk may then change it underneath the
result.

Something must be drawn. **Make it an explicit named constant with a provisional value chosen
against the current static key, recorded as provisional-pending-light** — rather than a
property that falls out of arc-centre placement unremarked. The decision stays Carl's; only
the value is provisional.

### F-6 — Add a sign check that no numeric verification can catch

`CanvasTexture` defaults to `flipY: true`, and the normal map's green-channel convention must
agree with how the Sobel `dy` is encoded through that flip. Get it wrong and the relief
inverts: ridges render as grooves.

**Every numeric check in the plan's verification list passes either way.** It is visible only
by eye, under the raking key, and only if someone is looking for it. Add it as an explicit
verification item.

### Minor

- **Texture memory.** The plan quotes 13.5 MB for the rejected 8px/unit option but not its
  own cost. Two textures at 2304 x 384 RGBA is ~7 MB, ~9.4 MB with mipmaps. Still the right
  call — see the density check above — but state the real figure.

---

## Drift Risks

**1. Pre-existing documentation drift in the file this chunk edits.** Flagged, not fixed —
`CLAUDE.md` error handling: unrelated pre-existing issues go to Carl.

| Location | Says | Code actually does |
|---|---|---|
| `contact-field-canvas.tsx:44-113` header | 3600/4600/5600/6600, **2000ms** fades, 1000ms apart | 3600/4100/4600/5100, **3000ms** fades, 500ms apart (lines 194-216) |
| `contact-field-canvas.tsx:607` | "static again after 5800ms" | `FIELD_ENTRANCE_END_MS` computes **8100** |
| `contact-field-canvas.tsx:849` | "~2.2s entrance" | ~4.5s from first start to last finish |

The chunk edits this file, so the drift will be read by whoever works in it next. Carl's call
whether it is corrected inside this chunk or raised as its own item.

**2. Forward creep — the condition `prompt-protocol.md` Stage 3 guards.** This chunk arrives
under a whole-arc brief (the orbiting light follows it), and the plan repeatedly and correctly
justifies choices by what the light will need. That reasoning is sound, but it is exactly the
condition where the helpful kind of creep looks like good engineering. **The relief depth and
the arc direction are the two places it would enter.** The plan already holds relief open;
F-5 asks the same discipline of direction.

**3. Relief depth cannot be settled here, and must not be recorded as settled.** The plan says
this itself and is right. Noted so the checkpoint does not quietly promote a by-eye starting
value into an approved one — the F-2 failure, one layer down.

**4. Verification is not approval.** The plan states this. Holding it: rendered output is the
truth for visual work (`context-rules.md` Rule 9), and Carl judges whether it is right.

---

## Instructions For Claude Code

None. **This is a findings document, not an instruction to build.** Findings go to Carl, who
decides what is actioned and in what order. The Builder should treat everything above as
input to a revised plan, not as authorisation to start.

---

## Carl Decision Needed

1. **B-1 — which scope-guard fix.** Unlock `project-intelligence/live-work/`, or narrow
   `protected` to the canonical governance paths. Blocking either way; nothing should start
   until `chunk-scope.json` is written and approved.
2. **F-2 — the stale timing comments.** Corrected inside this chunk, or raised as a separate
   item? The chunk touches the file, so the opportunity is here, but folding it in widens
   scope.
3. **F-1 — how the ordering question is settled.** Give the face its own ramp, or measure the
   crossover and accept it if it falls below the visibility threshold. The second is cheaper
   and may well be sufficient, but it is a measurement that has not been taken.
4. **F-5 — whether arc direction may be set provisionally now**, recorded as
   pending-the-light-brief, so relief has something fixed to be judged against.

---

## Builder's response to the findings — added on transcription

Recorded separately from the Architect's text above, and clearly marked, so the two are never
confused.

**B-1 and F-1 were independently re-verified against the code by the Builder before amending
the plan.** Both hold.

- **B-1:** `chunk-scope-guard.js:89` is the only exemption, and the evaluation order at lines
  104-106 is `unlocked` -> `protected` -> `files` as described. Confirmed.
- **F-1:** `setBevelEnvIntensity` at line 597 applies `Math.sqrt(progress)` to
  `envMapIntensity`, and opacity is linear, so gold does render as `t^1.5` against a diffuse
  face's `t`. The generalisation holds: `F <= G x sqrt(t)` fails as `t -> 0` for any positive
  F.

⚠ **F-1 is a consequence of a change the Builder made earlier the same day.** The `sqrt` lead
was added to widen the rim's perceptible band (1094ms -> 1682ms) and it did that. Its
side-effect — making the gold's ramp non-linear — was not considered at the time. The
Architect found it from the code, not from the plan's description of the code, which is the
whole point of the gate.

### F-1 was then MEASURED, and the predicted inversion does not occur

**The arithmetic is right; the premise is not.** Measured on box 1's actual entrance, rim
luminance as a percentage of its own final value:

| t | 0.058 | 0.221 | 0.385 | 0.548 | 0.711 | 0.876 |
|---|---:|---:|---:|---:|---:|---:|
| gold | 12% | 28% | 44% | 62% | 80% | 99% |

**Essentially linear, not `t^1.5`.** At t=0.058 the gold already measures **35.4** against a
floor of 17.0, while a face peaking at 100 would be at **5.8** — the gold leads by 6x. No
crossover occurs at any tested face peak (40 / 60 / 80 / 100).

**Why the prediction missed:** the bevel's brightness is not only
`opacity x envMapIntensity`. It also receives the **direct key/fill/ambient rig**, which
`envMapIntensity` does not touch and which scales with opacity alone. The `sqrt` shapes one
*component* of the gold's brightness, not the whole of it.

⚠ **This does not diminish the finding.** F-1 identified a real mechanism from the code and
was specific enough to be testable — which is exactly what made it cheap to settle. The
ordering check stays in verification as a **regression guard**, and the field's peak can now
be pitched on appearance rather than against a risk that does not exist.

**Also re-measured, per the Architect's note:** the "168" in the plan does not appear in
source. The rim's measured full value is **172.9** against a floor of **17.0**.

---

*Reviewed by the read-only Architect instance, 30 July 2026. Line references verified against
working-tree state at `4ff88c1`. The plan's own factual claims were checked rather than
trusted, and all of them held — the findings concern what follows from those facts, not their
accuracy.*
