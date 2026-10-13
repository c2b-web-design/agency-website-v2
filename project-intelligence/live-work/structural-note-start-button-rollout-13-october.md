# Structural note: the gold `Start a conversation` button onto `/about` §4 (13 October 2026)

CLAUDE.md §5a / §5b. Written before anything is built. For Carl's word.

## The decision

**One family button component, two looks.** `components/home/whoweare-button.tsx` becomes the family's button: it takes the label, the link and the look as props. The home page keeps calling it exactly as now (`<WhoWeAreButton />`, its defaults unchanged), so `app/page.tsx` (locked) is not touched. `/about` §4 calls the same component with `Start a conversation`, `/start` and a `START_LOOK` (gold #FFE39E, metalness 1, roughness 0.4, words and sides #1E1E24, the teal's lamp), defined next to `WHOWEARE_LOOK` in the scene module.

**A second WebGL canvas on `/about`.** The page already runs the room canvas (`AboutCardCanvas`, `frameloop="demand"`). The button adds one more: one canvas, the page's lifetime, never keyed, loaded lazily, drawing only while on screen (`lib/canvas-on-screen.ts`, as on the home page). **Two contexts on `/about`.** Under reduced motion it is still.

## Rejected

- **A copy of the teal component for the gold one.** Two copies of the measuring, the hold, the fallback and the on-screen gate: a second source of truth that drifts (Next step's family-geometry copy is the standing example).
- **Drawing the button inside the room canvas.** That canvas ends one screen into §3 and does not reach §4; stretching it would change the approved journey (D-088, R-041).

## What it couples to

The scene module (shared with the live home button), `lib/canvas-on-screen.ts`, `app/about/page.tsx` (not locked), the home page's verify script (re-run after: 9/9 required).

## What the white pill provides today (§5b), and how each is kept

| provided now | kept by |
|---|---|
| a real link to `/start`, keyboard focus, what a screen reader reads | the same real `<a>`; the canvas behind it, aria-hidden, pointer-events none (the teal's rule) |
| a visible button with no JavaScript or no WebGL | a CSS fallback: a gold gradient with #1E1E24 words until the 3D letters draw |
| a hover (`bg-neutral-100`) | **lost**, as on the teal; the hold (pointer within 60 px, or focus) replaces it. Hover is Carl's open point |
| the section's centring and spacing | the button keeps the family's 1× box (190.5 × 41, was 198.6 × 44); §4's text unchanged until Carl judges the size on the page |

## To measure once built

Contexts on `/about` (expect 2); whether the room canvas draws while §4 is on screen (it is demand-driven; to be confirmed, not assumed); the button draws nothing when scrolled away; the link, focus, fallback and reduced motion, as the home script checks them.
