# Structural note — a CAMERA BENCH, driven by Carl's Xbox controller (26 October 2026) — VERSION 3

**For:** Carl, to route to the Architect. **Status:** PROPOSED — nothing built.
**Versions.** **3 (26 October): THE ARCHITECT's REVIEW FOLDED IN** — Carl: *"V3"*. The lift's reach corrected (it touches
viewport 1 — §5b); the camera's interface out of the lifted piece stated; the shot's UNITS raised as a decision (the
approved journey scales with the window, a recorded take in layout px would not); the take simplified against TIME; the
export route's permission surface stated; the second camera mechanism named; the look-at, shake, unknown-track and pad
mapping gaps closed. Each change marked **(v3)**. **2 (26 October): RESERVED TRACKS** — Carl asked what else a camera can
do; the Builder listed it (optics, image, movement, cameras seen through — below, *What else a camera can do*) and proposed
reserving the tracks now so a take recorded today can gain them later without the format changing. Carl: *"Yes, add to
the note."* **1:** the workflow, the controller, the options, §5b.
**Carl:** *"Yes write the note. Heres how we should do it. i explain to you verbally what the shot is. If it uses multiple
cameras we break it down in chunks. I execute the movement to get us in the ballpark. We then discuss, fine tune and edit."*
Before it: *"When building on the proto bench i take it is possible to build controls to aid in the movement of the
camera."* → *"Im on a Win PC. I have an XBox controller. Can it be intergrated so movements can get you in the ballpark
ready for fine tuning?"* Context: film 4's camera journey APPROVED (R-093); the hero is all code with the camera central
(D-098, D-101); Carl's principle — camera moves *"sparingly and appropriately"*.

**CLAUDE.md §5a triggers:** a NEW INPUT MECHANISM (the browser's Gamepad API); a RECORDING mechanism; a SHOT FORMAT — a
camera move as DATA, read by the bench AND by a page (one source of truth, or two); where a recorded take PERSISTS (state
surviving a reload, and reaching the repository — **(v3)** through a route that WRITES TO THE REPO, its own permission
statement below); **(v3)** a SECOND WAY TO DRIVE A CAMERA (shots as data beside `journeyPose` as code — below, *Two camera
mechanisms*); **(v3)** a CHANGE TO WHAT OWNS THE CAMERA in film 4's canvas (the lift); possibly a SECOND VIEW of the scene
(a second canvas is the warm-up canvas's worked case). §5b below.

## The workflow (Carl's), and what each step needs

| Step | Who | Needs |
|---|---|---|
| 1. The shot described in words | Carl | — (recorded in `decisions.md` as given) |
| 2. Several cameras → one chunk per camera | Carl + Builder | A shot holds N cameras and a CUT track; v1 builds ONE camera per take, the format already allows N |
| 3. The move performed — "the ballpark" | Carl, on the pad | Fly, capture poses, record a live take, play it back |
| 4. Discuss, fine-tune, edit | Together | A scrubber; the take as KEYFRAMES with dials; the lens editable after the fact |
| 5. Onto the page | Builder | The page plays the approved shot's data — not a re-typed copy. **(v3)** Which page: the HERO's (D-101), when it is built — ⛔ NOT `/proto/your-words` (*Lifetime*) |

## The controller (what the browser gives, stated plainly)

- Chrome reads the Xbox pad through the **Gamepad API** — Windows drives it, nothing to install. ⚠ The browser exposes it
  only after a button press ON THE PAD while the page is open; the sticks are POLLED each frame (no events). Standard
  mapping, so the layout below holds for an Xbox pad.
  **(v3)** ⚠ Believed, NOT TESTED: Chrome serves the Gamepad API only to a SECURE page — `http://localhost` is one; the
  dev server opened by its network address over plain http (a phone, another PC) is not. The bench is for Carl's PC.
- **Proposed mapping:** left stick move (dolly / truck), right stick look (pan / tilt), triggers rise / sink (crane, analogue),
  bumpers slow / fast, **A** capture a keyframe, **B** remove the last, **X** play / stop, **Y** back to the shot's first frame,
  **(v3)** D-pad **LEFT / RIGHT** step between keyframes, D-pad **UP / DOWN** the lens while held (longer / wider) — or the
  lens left to the edit step and up/down left free, Carl's choice. **Start** record a live take, **View** toggle the overview
  (if built).
- **Feel:** a dead zone (a resting stick does not drift), a response curve (fine near the centre, fast at full throw), and
  smoothing as a weighted rig (a critically damped spring, no overshoot) — so it operates like a camera, not a game. Speeds
  scale to the scene's size (the arch is in layout px; the hero will differ).
- **Rumble (optional):** a short pulse on capture, and as playback passes a keyframe (Chrome's `vibrationActuator`).
- **A mouse/keyboard fallback** (WASD + drag) so the bench works without the pad and can be driven by tests.
- **(v3) FRAMES:** film 4's page draws on demand (`frameloop="demand"` + the family `Ticker`, frames only while on screen).
  The pad must be READ EVERY FRAME, so the bench draws CONTINUOUSLY while it is open — a bench's cost, accepted on a
  `/proto` route, never carried to a page. The pad is read inside the frame callback only — no second loop.

## Options

### Where the bench lives

| | For | Against |
|---|---|---|
| **A. A new route `/proto/camera`** — **proposed** | The instrument apart from the client page; `/proto/your-words` (R-092, R-093) untouched but for the lift; the hero's set can be loaded into it later | A third place drawing the arch — must share the arch's build, not copy it (below) |
| B. Controls added to `/proto/your-words` | One page | A client-facing page carrying an editor; its approved state shares a file with tooling |
| C. Added to `/proto/showcase` | The existing bench | That bench is the LETTERING's instrument (its 20 regression frames, D-088); a camera editor moves its baseline |

### What the bench draws — one mechanism

The arch, lit as R-093, built by the SAME code: **proposed** — lift the scene out of `your-words-canvas.tsx` into an
exported piece both use, the camera left to the caller (the page's `Journey`, the bench's controller). Rejected: a copy of
the scene on the bench (two copies drift — the font-proof argument of 23 October).

**(v3) ⚠ WHAT THE LIFT ACTUALLY TOUCHES — more than v1/v2 said:**
- **ONE `Scene` component draws BOTH pieces** (`piece: "line" | "arch"`) — viewport 1's line (R-092, approved) as well as
  the arch. Lifting "viewport 2's scene" either splits that component or lifts it whole; **either way viewport 1 is
  touched**, so it is in the comparison (§5b).
- **The camera is made INSIDE `Scene` today** — `<PerspectiveCamera makeDefault>` at `[0, 0, d]`, `fov` `FRONT_FOV`,
  `near` 1, `far` `d × 10`. The lift moves it OUT, to the caller. That is a change to what OWNS the camera — §5a.
- **The compile gate needs a camera** — `whenLinked(gl, gl.compile(scene, camera), …)` compiles against the default
  camera; the piece stays hidden until it reports linked. After the lift it compiles against whichever camera the caller
  made default — the caller must have made one BEFORE the piece mounts, or the gate compiles against R3F's own.
- **The journey's inputs are measured INSIDE `Scene`** — `d` (`frontDistance` at the canvas's size), `zc` (the depth's
  middle), `up` (the piece raised to its `PLACE`), the curve centre, the crown's underside (`crownUnderside`). So the lifted
  piece takes NOTHING about the camera and HANDS BACK its measurements — **an interface, stated here:** the piece reports
  `{ d, zc, up, curveCentre, crownUnderside, widthPx }`; the caller drives the camera from them.
- **`far = d × 10`** is the page's framing; a camera flown freely on the bench can leave it. The bench sets its own
  near/far; the page's stay as they are.

### The shot as data — the format

A **shot** = **(v3)** a `version` number, then one or more **cameras**, each a set of keyframed **tracks** over time:
position (x, y, z), turn (yaw), tilt (pitch), roll, LENS, and an ease per segment; plus a **cut** track (which camera is
live when). ⛔ the angles driven AS ANGLES, unwrapped (never a slerp — R-093's lesson: a 180° turn has no "shortest
way", so the data keeps which way it went).

**(v3) ⛔ THE UNITS — A DECISION BEFORE CHUNK 1 FIXES THE FORMAT.** The approved journey is not in fixed pixels: its
radius is `d − zc`, and `d` comes from `frontDistance(w, h, size)` — it CHANGES WITH THE WINDOW. A take recorded in layout
px at the bench's window would frame differently at any other size, and badly on a phone (D-094, open).

| | For | Against |
|---|---|---|
| **A. Positions in units of `d`** (the front distance at the PLAYING canvas's size), measured from the piece's centre — **proposed** | The approved journey's own convention (`r = d − zc`): a shot scales with the fit exactly as R-093 does | On a portrait window `d` grows, so the shot plays from further out — as the journey already does |
| B. Positions in WORD WIDTHS | The lamps' convention (`1.5` widths — R-092, `AxisLamps`) | Ignores the window's height: on a portrait window the piece overflows |
| C. Layout px | What the bench reads directly | Framed for one window only — ⛔ rejected |

Focus distance (reserved, below) takes the same unit.

**(v3) ⚠ THE LENS: what the mm means.** three's focal length is computed against a film height of `filmGauge /
max(aspect, 1)` — so for one field of view the mm SHOWN CHANGES WITH THE WINDOW's SHAPE. Unreal's filmback is a fixed
sensor, so Carl's Unreal mm would mislead on three's readout. **Proposed:** the track STORES the vertical field of view
(what three draws with); the bench DISPLAYS mm against ONE FIXED SENSOR, set to match the Unreal filmback preset Carl
works with (his to name), never three's aspect-dependent figure. ⚠ Verified by reading three r185's `PerspectiveCamera.js`
(`getFilmHeight`, `setFocalLength`).

**(v3) THE CURVE AND THE EASES.** Position interpolated through the keyframes as a smooth curve (Catmull-Rom),
**parameterised by the keyframes' TIMES** — so the speed is continuous through a keyframe and the camera does not stop at
each one. An ease per segment is an EDIT applied by choice, not a default (an ease-in-out on every segment would stop the
camera at every key); a keyframe can be marked HOLD (a deliberate stop).

**(v3) A LIVE TAKE.** RAW samples, each STAMPED WITH ITS TIME (`performance.now`), not counted in frames — and ⛔ NOT
clamped as `Journey` clamps its clock (`Math.min(delta, 0.05)`): a slow frame during a take is real time Carl's hands
spent. Then **simplified to keyframes** within a tolerance (Ramer–Douglas–Peucker) ⛔ **RUN ON EACH TRACK AGAINST TIME**
— each channel as a curve of (time, value), its tolerance in that channel's unit — NOT on the path's shape: simplifying
the path alone keeps where the camera went and throws away HOW FAST, which is most of a take's feel. The take becomes a
handful of editable points per track, its timing kept.

**⛔ RESERVED TRACKS (v2).** The format carries these from the first version, each optional with a neutral default (absent =
no effect), so adding one to a shot later is an EDIT, not a format change:

| Track | Unit | What it does | Unreal twin | Cost when used |
|---|---|---|---|---|
| Lens | stored as the vertical field of view; shown as mm against a fixed sensor **(v3)** | Wide to long | Cine Camera Focal Length + Filmback | None |
| Roll | degrees | The dutch angle | Roll | None |
| Lens shift | fraction of the frame, x / y — **(v3)** x by `filmOffset` (horizontal only), y by `setViewOffset` | Slides the picture without changing perspective (a SHIFT lens: verticals kept straight looking up) | Lens offset / crop | None |
| Exposure | stops (the renderer's `toneMappingExposure`) | Brighter / darker; a fade from or to black in camera | Exposure | None |
| Shake | amount, frequency, **(v3)** SEED | Handheld life layered on the move (smooth noise on the angles) — **(v3)** seeded, so the same time gives the same frame (`?t=` stills and pixel comparisons depend on it) | Camera Shake | None |
| Focus distance | **(v3)** the position unit (above) | Where the image is sharp — a RACK FOCUS when keyed | Focus Settings | ⚠ Needs DEPTH OF FIELD |
| Aperture | f-stop | How shallow the sharp zone is | Aperture | ⚠ Needs DEPTH OF FIELD |
| Look-at target | **(v3)** a point (keyed) and a WEIGHT 0–1 (keyed) | The camera aims itself while the body flies (an operator holding the subject) | Lookat Tracking | None |

**(v3) LOOK-AT — which wins.** At weight 1 the target REPLACES turn and tilt; at 0 they rule; between, the aim is blended.
Roll applies on top either way. The weight is what lets a shot SLIDE its aim from one subject to another — R-093's journey
does exactly that (level at the arch's centre → the N's underside → back); "a point, or none" could not express it.

⚠ **Depth of field (and motion blur, bloom, vignette, grain, flares) need a POST-PROCESSING stage** — a new mechanism on a
page, so its own §5a step when a shot first asks for one; the tracks are reserved, the stage is not built.
**(v3) A TRACK NOTHING CAN DRAW YET:** the BENCH draws the shot without it and SAYS SO on screen; a PAGE ⛔ REFUSES the shot
and names the track (`onFailed`, the page's existing failure path) — never a silent drop. A shot whose `version` the page
does not know is refused the same way.
⚠ The optics in three (lens, roll, shift, exposure, near clip, orthographic) are expected to cost nothing per frame —
**(v3) NOT MEASURED; a reading of how three works, to be measured when the first is built.**

### Where a take persists

| | For | Against |
|---|---|---|
| **A. Autosave in the browser + "Export" to a JSON file in the repo through a DEV-ONLY route** — **proposed** | Nothing lost on a reload; an exported shot is a reviewable, versioned file the page imports — one source of truth | A dev-only API route is a new mechanism, and a NEW WAY TO WRITE INTO THE REPOSITORY (below) |
| B. Download the JSON; the Builder moves it into the repo | No server code | A manual step between Carl and the page — the remembered-step failure mode |
| C. Browser storage only | Simplest | Lives only in that browser; never reaches the page or the record |

**(v3) ⚠ OPTION A's PERMISSION SURFACE — stated per CLAUDE.md *Authority*.** While `next dev` runs, the route lets
ANYTHING THAT CAN SEND A REQUEST TO THE DEV SERVER write a file into the repository — Carl's browser, and equally any seat's
`curl` through Bash, a Playwright script, or another device on the network. **A seat denied `Write` gains a write path
through it.** And ⚠ the dev server LISTENS ON THE NETWORK: `package.json` runs plain `next dev`, whose host defaults to
`0.0.0.0` (Next 16's CLI docs) — so a `NODE_ENV` gate limits the route to DEV, NOT TO THIS MACHINE. Required, each
ASSERTED by a test, not assumed:
- inert outside development (`NODE_ENV` gate);
- refused unless the request comes from LOOPBACK (127.0.0.1 / ::1) — not by changing the dev server's host, which phone
  testing over the network may need (D-094; Carl's call);
- writes ONE FIXED FOLDER only; the file name a slug checked against `^[a-z0-9-]+$` — no path from the client, ever;
- JSON parsed and checked against the format before it is written.
⚠ If the bench IMPORTS that folder, every export hot-reloads the bench mid-session — the bench reads takes from its own
autosave, never from the folder.

⚠ An exported shot is DATA, reviewed in a diff like code; the page reads only shots that Carl has approved (named in the
review log). **(v3) ⚠ THAT IS BEHAVIOURAL, NOT ENFORCED** — nothing in code stops a page importing an unapproved shot.

### The overview (optional, chunk 4)

To SEE the move from outside: the camera's path as a line, its lens as a small pyramid, the lamps marked. **Proposed: the
same canvas split in two rects** (two renders per frame, scissored) — ONE context. Rejected: a second canvas (a second
context — §5a worked cases 1 and 2).
**(v3)** ⚠ The path, the pyramid and the markers must be INVISIBLE to the main view — three's LAYERS (a camera sees only
the layers it is set to), the overview's objects on a layer the shot's camera does not see. Layers are listed below as a
future capability; the overview needs them first.
**(v3)** ⚠ An EXISTING mechanism to weigh at chunk 4 (§5a: *a new mechanism where an existing one could have served*):
drei's `View` — one canvas, several views by scissor, already installed. Hand-rolled scissoring vs `View` decided then.
⚠ A vertical lens shift (`setViewOffset`) and the split's scissor both act on the view's rectangle — check they compose.

## Can a camera be zoomed after the event? — YES (recorded with Carl's question)

Nothing is baked: the frame is re-rendered from the take every time it plays. The LENS is one more track — it can be added,
keyed or changed after the move is recorded, and so can the path, the timing and the eases. ⚠ A ZOOM (lens) and a DOLLY
(moving closer) frame alike but are not the same picture — the dolly changes the perspective (near grows faster than far;
R-093's flight is why the arch stopped being ambiguous), the zoom does not. Mixing the two against each other is the DOLLY
ZOOM (`frontDistance` is its formula).

## What else a camera can do (v2 — the Builder's list for Carl, recorded as given; ⚠ RAISED, NOT CHOSEN beyond the reserved tracks)

- **Optics:** focal length in mm; depth of field and rack focus; lens shift; roll; ORTHOGRAPHIC (no perspective — a technical
  drawing's look); the NEAR CLIP as a cutaway (a plane slicing into an object as the camera pushes in).
- **The image (post-processing):** exposure; motion blur (a real shutter's smear); bloom (as `/about`'s neon), vignette,
  grain, chromatic aberration, lens flares.
- **Movement:** rigs (rail, crane, orbit, follow) so a move behaves like equipment; look-at tracking; shake; DRIVEN BY THE
  VISITOR (the scroll scrubs the shot — reversible, the desk mark's precedent — or a slight parallax to the pointer); CUTS and
  BLENDS between cameras.
- **Seeing through cameras:** a camera rendered onto a surface (a screen in the scene showing another angle — Unreal's Scene
  Capture 2D); live reflections (a six-way capture so the metal reflects the moving world, not only the fixed studio —
  Scene Capture Cube); LAYERS (an object visible to one camera, not another — **(v3)** the overview needs these first).
- Principle for all of it (Carl, R-093): *"sparingly and appropriately"*.

## (v3) Two camera mechanisms — named, not hidden

After this work a camera is driven TWO WAYS: film 4's journey AS CODE (`journeyPose`, approved, kept — *Lifetime*) and
shots AS DATA (the bench, then the hero). §5a asks *"why is there a second X?"* — the answer: the journey is approved work
and re-expressing it is a re-track (Carl's word); the format is for what comes next. **Proposed:** accepted as two, on
the record; the journey moves to the shot format only if Carl re-tracks it. Carl's to rule.

## Lifetime

- `/proto/camera` new, noindex. **(v3)** Nothing else moves BUT THE LIFT (the scene out of `your-words-canvas.tsx`, the
  camera to its callers — above). `/proto/your-words` keeps its approved journey AS CODE (`journeyPose`, `Journey` — they
  stay in `your-words-canvas.tsx`) — ⛔ NOT migrated to the shot format in this work (re-expressing approved work is a
  re-track, Carl's word).
- The pad is read only while the bench is open and focused; nothing survives navigation except the autosaved takes.

## §5b — what depends on what this touches

| Touched | What it provides today | How it is kept |
|---|---|---|
| `your-words-canvas.tsx` — **(v3)** the ONE `Scene` both pieces share | Viewport 1 as approved (R-092): the line, `SignLamps`, `?wing=` `?front=` | **(v3)** In the pixel comparison — viewport 1 captured before and after |
| The same — viewport 2 | As approved (R-093): letters, metal, `AxisLamps` (`?top=` `?bottom=` `?back=`), the journey, the still under `?cam=0` / reduced motion | Pixel-compared before and after at `?cam=0` and **(v3)** `?t=` 1 (hold), 9 (mid-orbit), 15.75 (rest behind), 20 (approaching), 23.5 (under the N), 28 (backing out) — the loop is 30.5 s. The journey and its clock (a ref, nothing on screen) stay in `your-words-canvas.tsx` |
| **(v3)** The camera's ownership | Made in `Scene` (`makeDefault`, `FRONT_FOV`, near 1, far `d × 10`) | Made by each CALLER; the page's values unchanged; the comparison above proves it |
| **(v3)** The compile gate | The piece hidden until its programs link, compiled against the default camera; `onReady` after the first frame drawn with it | The caller's camera is default before the piece mounts; `onReady` timing checked in the page check (`film04-*` scripts) |
| **(v3)** The journey's inputs | `d`, `zc`, `up`, curve centre, crown underside — measured in `Scene` | Reported by the lifted piece (the interface above); `Journey`'s arguments unchanged |
| **(v3)** Failure | `Guard` and `onFailed` (a throw, a lost context, the font check, a collision, the words asserted against the section's) → the section shows the words as text | Unchanged on the page. The BENCH reuses `Guard` and the no-WebGL net — `webglcontextcreationerror` caught in the CAPTURE phase (`your-words-section.tsx`; the handoff: reuse on any new canvas) — and shows the failure in plain words |
| **(v3)** Frames | `frameloop="demand"` + `Ticker`, frames only on screen | Unchanged on the page; the bench draws continuously (*The controller*) |
| The lettering build (`lettering-hooks.tsx`) | The font proof, the collision check, the accessible text | Used, not changed — so the bench `/proto/showcase` and its 20 regression frames are NOT re-run. **(v3)** The 23 October precedent (24/24 identical) compared the BENCH because that lift moved the bench's code; this one compares the PAGE |
| The scope guard / protected files | — | No protected file touched |
| `/proto` noindex | — | The new route carries its own `robots` like the others |

## Proposed chunks (each its own approval)

0. **(v3) Decisions before chunk 1:** the UNITS (A proposed); the lens's display sensor (Carl names his Unreal preset);
   the two camera mechanisms accepted; the lens on the pad or in the edit step.
1. The LIFT (the comparison above) → `/proto/camera` with the arch, the pad + mouse fallback: free fly with the feel
   above, **capture poses (A)**, playback between them, the scrubber and dials (durations, eases, lens).
2. **Record a live take** (Start) → simplified to keyframes against time → edited as chunk 1's.
3. **Export / a page reads a shot** (the dev-only route under its four requirements, the JSON format) — the step to a page.
4. The overview (one canvas, split; layers; `View` weighed).
5. Several cameras and cuts.

⚠ **NOT WATCHED by any test:** how the pad FEELS — only Carl's hands (`reference_playwright_pointer_is_not_carls_mouse`).
Tests drive the bench through a stubbed `navigator.getGamepads` and the mouse fallback.
⚠ **(v3) Verified for v3 by the Architect, 26 October:** three r185's `getFilmHeight` / `filmOffset` (source read);
`next dev`'s `0.0.0.0` default (Next 16 CLI docs) and `package.json`'s plain `next dev`; drei's `View` installed; the
journey's segment times (`JOURNEY` in `your-words-canvas.tsx`). **NOT verified:** the Gamepad API's secure-page rule;
the optics' per-frame cost.

---

## The Builder's response to v3 (26 October 2026) — one disagreement, stated once; the decision is Carl's

*Saved above verbatim as the Architect wrote it (the Architect's seat cannot write; Carl relayed it). The Builder had
drafted its own v3 from the same review in parallel; where the two agreed or the Architect's is better, the Architect's
stands as written. One point differs.*

**⚠ Where a take persists — the Builder recommends B (download), not A (the dev-only route), and asks that it be a chunk 0
decision.** The Architect's own permission statement names the reason: *"A seat denied `Write` gains a write path through
it."* The four requirements close the NETWORK (loopback only) and the PATH (one folder, a slug) — they do not close that:
every process on this machine reaches loopback — any seat's `curl`, any Playwright script, and the Builder's own test
harnesses. B adds NO write path: Export downloads `c2b-shot-<name>-<date>.json`; the Builder imports it on Carl's word,
checked against the format, through the ordinary edit the scope guard already sees. The "remembered step" A avoids is,
here, also the REVIEW point (an approved shot is named in the review log anyway, so a hand-off happens either way). Nothing
hot-reloads. ⚠ Cost of B: one hand-off per shot (Carl names the file; the Builder imports it).

**Agreed, noted for the record (the Builder's draft had them differently; the Architect's text is better):** the pad is woken
by a press ON THE PAD; the secure-page rule is believed, not tested; the lens sensor is Carl's to name (the Builder had
proposed a fixed 36 mm full-frame); `View` is weighed at chunk 4, not assumed; `/proto/showcase`'s 20 frames need no re-run.

**Proposed addition to chunk 0:** *where a take persists — A (the route, under its four requirements) or B (download + the
Builder's import).*
