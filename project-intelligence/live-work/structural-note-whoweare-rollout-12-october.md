# Structural note — the `Who we are` button onto the home page (plan v2, Q2). 12 October 2026

**Builder. CLAUDE.md §5a: a structural decision, written before it is built.** Carl: *"We will stick with 1. Put it on the site and show the light helpers."* The Architect's points 7 (bundle, fallback, visibility gating, mount cost) are folded in.

## The decision

1. **One shared scene module**, `components/home/whoweare-button-scene.tsx` — the pill, the studio, the teal metal, the extruded label, the static key light, the light helpers. **The bench (`/proto/button`) and the home page both import it.** ⚠ Rejected: the home page importing the bench, or a second copy of the scene in a new component (§5a, "a second source of truth"). Moving the pieces out of `whoweare-bench.tsx` is the cost.
2. **One client component**, `components/home/whoweare-button.tsx`: the real `<a href="/about">Who we are</a>` with the family's box rule; the canvas sized to the button, BEHIND the link, `aria-hidden`.
3. **Loaded lazily** — `next/dynamic` with `ssr: false` inside that client component, so three.js and R3F load only in that chunk; the home page ships none today (Architect, point 7).
4. **Lifetime: the page's.** A child of `#contact`, never keyed, mounted once. **Contexts on the home page: 1** — counted when built.
5. **Fallback:** until the first frame, with no WebGL, or after a lost context, the link shows a CSS teal pill with the ice-blue label (never a bare label on dark). The label's DOM text is visually hidden only once the extruded label is drawn, and stays in the accessibility tree throughout (not to repeat D-051-A11Y).
6. **Frames:** the scene is STATIC (one light, not moving yet), so `frameloop="demand"` with an `invalidate()` on mount and on resize — no continuous frames, so no visibility gating is needed **yet**. ⚠ When the moving light arrives it needs frames, and gating then REUSES `/about`'s mechanism rather than a new one.
7. **Light helpers:** behind `?lighthelpers=1` only (as `/about`), never on a plain visit — the canvas grows to show the light's position and direction as a marker and a line to the button.
8. **`app/page.tsx` — LOCKED.** The change: the white pill's `<a>` (L≈486–494) replaced by `<WhoWeAreButton />`; the pairing comment updated (`/about` §4 knowingly out of step, recorded).

## What the white pill provides, and how each survives (§5b)

| Provided today | After |
|---|---|
| A real link to `/about` | Kept — the DOM `<a>` |
| Keyboard focus and a visible ring | Kept — the `<a>` keeps focus; the ring drawn round the pill (checked, Rule 8) |
| Hover (`bg-neutral-100`) | ⚠ **No hover designed yet** — Carl's call; deferred to the moving-light step or by his word |
| Centred in the section, `mt-10` | Kept — same wrapper; the box ~137×44 → 129.5×41, checked by eye |
| The pair with `/about` §4 | Knowingly out of step until that button (recorded) |
| No JavaScript needed to see it | The CSS fallback (5) |

## Not done in this step

The moving light, its path, hover, reduced motion's resting position, the contrast measured along the path, and a push to production (Carl's word).
