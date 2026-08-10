/**
 * The Next step button, as geometry — a domed pill in chrome blue metal.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * WHERE THE SHAPE COMES FROM
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ THE CSS BUTTON IS THE GEOMETRY REFERENCE AND NOT THE MATERIAL REFERENCE.
 * Carl, 10 August 2026, correcting an assumption made here first:
 *
 * > *"Even though the CSS next step button was blue, it was not opal. It was the
 * > same material as the old CSS cards. Trying to be frosted glass. Opal is in
 * > the client info section. Ivory on the start page. The Q button (next step)
 * > must follow the same implied geometry but in three js. Similarly, the
 * > material should be something equally exotic as ivory and opal."*
 *
 * And then, decisively: *"only the next step button wont be frosted glass."*
 *
 * So the CSS button is the thing being REPLACED. Its shadow stack is still the
 * best description of the form, because that stack is a lighting model of a
 * solid object and can be read backwards into one.
 *
 * ── READING THE SHADOW STACK AS A SOLID ──────────────────────────────────
 *
 * `.enquiry-nextstep-btn`, and `.enquiry-begin-btn` (ivory) shares the pattern —
 * the CSS itself says *"same domed pill architecture... bevel offsets/blurs,
 * footprint, geometry, text, transition timing all unchanged"*:
 *
 *     inset  0  1px 0    rgba(235,248,255,0.72)   a SHARP top rim, no blur
 *     inset  0  2px 4px  rgba(  8, 28, 70,0.30)   the dome falling away beneath it
 *     inset  0 -2px 3px  rgba(  4, 12, 32,0.55)   the lower bevel turning back
 *     inset  0 -1px 0    rgba( 70,110,170,0.18)   a BOUNCE edge underneath
 *            0  2px 8px  rgba(  0,  0,  0,0.40)   a contact shadow below it
 *
 * ⚠ EACH LINE IS A SURFACE. A 1px unblurred inset highlight is a crisp edge
 * catching a light from above; a 2-3px blurred one is a curve falling away from
 * that edge. The negative-offset pair is the underside turning back toward the
 * viewer. **The bounce edge is the tell that the button sits ABOVE something
 * reflective** — light returning onto its underside.
 *
 * ⚠ AND THE HOVER STATE CONFIRMS IT IS A SOLID IN SPACE. Hover does not add
 * colour, it adds DEPTH: bevels strengthen and the contact shadow grows and
 * drops (`0 2px 8px` -> `0 4px 12px`). The object moves toward the viewer.
 *
 * ── THE MATERIAL: CHROME BLUE METAL ──────────────────────────────────────
 *
 * ⚠ ESTABLISHED FROM CARL'S OWN REFERENCES, not chosen from a list. He supplied
 * six renders of the C2B logo plus two photographs of Joe Satriani's guitars —
 * the "Chrome Boy" and its gold twin — and named it: **"its chrome blue metal."**
 *
 * ⚠⚠ THE CRITICAL READING, AND IT DECIDES THE WHOLE IMPLEMENTATION: across the
 * six renders **the material never changes. The SCENE changes.** The blue-only
 * render is chrome in a blue-lit environment; the amber ones are the SAME chrome
 * with warm sources added to that environment. The Chrome Boy reads grey because
 * it is photographed against a grey backdrop.
 *
 * **So chrome has no colour of its own. It reports the room.** The blue is an
 * environment map, not a body tint, and the amber — if and when it arrives — is
 * another source in that same room rather than a property of the button.
 *
 * ⚠ THIS IS WHY THE OLD CSS REFLECTION TABLE WAS SO ELABORATE. `GRID_REFL` in
 * `enquiry-opening.tsx` fakes per-card amber contributions with a hand-authored
 * per-index lookup. That is 2D standing in for what a mirror does by itself.
 *
 * ── ⚠ BUT "THE PHYSICS WILL DO IT" IS NOT A SAFE ASSUMPTION ──────────────
 *
 * `contact-field-light-rig.tsx` is direct evidence against it. True proximity
 * driving for the opal's shine was BUILT, MEASURED AND REJECTED:
 *
 *   - closest approach landed at phase 0.953, inside the HIDDEN half of the
 *     orbit, so a physical shine would have peaked while the boxes were dark
 *   - the distance range was only 489-625 units, a **1.3x swing** — far too flat
 *     to read
 *
 * The shine follows the visible front pass instead. Carl's bar, in his words:
 * *"The user won't know about the ellipse, all they will see is its effects."*
 * **Belonging, not accuracy.**
 *
 * ⚠ AND HE HAS ALREADY AUTHORISED THE SAME LICENCE HERE, 10 August: *"If the
 * filament light cannot reach the button it can be simulated by putting an amber
 * light next to the button and activating it when certain cards are pressed.
 * Belonging in the same world is what counts."*
 *
 * So a real-light attempt is measured FIRST, and a placed light is the sanctioned
 * fallback rather than a compromise.
 *
 * ⚠ ONE LAYER RESPONDS, NOT THE WHOLE BUTTON. The opal rig's hardest-won lesson:
 * *"a single specular catch responding reads as a material; the whole button
 * animating reads as a light show."* Chrome's temptation is to move everything.
 */

/**
 * The button's footprint in CSS pixels, MEASURED from the live DOM at 1440x900
 * rather than computed from the padding.
 *
 * ⚠ MEASURE, DO NOT DERIVE. The text is "Next step" at 14px/600 with
 * `padding: 10px 24px`, and the rendered width depends on font metrics that are
 * not knowable from the CSS. Measured: **116.3 x 41**.
 *
 * ⚠ AND THE WIDTH IS CONTENT-DEPENDENT, WHICH MATTERS FOR THE ROLLOUT. Carl:
 * *"When this next step button is built all the Q5 components will be cloned and
 * rolled out to the other Qs."* The label is "Next step" on Q5-Q2 and "Send" on
 * completion, so the geometry must be built from a MEASURED box per instance and
 * never from this constant alone. This is the reference size, not the only size.
 */
export const NEXTSTEP_WIDTH_PX = 116.3;
export const NEXTSTEP_HEIGHT_PX = 41;

/**
 * The pill's corner radius.
 *
 * ⚠ A TRUE PILL: the CSS is `border-radius: 9999px`, which clamps to half the
 * height. Deriving it keeps that true at any label width.
 */
export const NEXTSTEP_RADIUS_PX = NEXTSTEP_HEIGHT_PX / 2;

/**
 * How far the dome stands proud of the button's base plane, in world units
 * (== CSS px, under the orthographic camera at zoom 1).
 *
 * ⚠ DERIVED FROM THE SHADOW STACK, NOT PICKED. The inset pair reads `+2px` down
 * from the top rim and `-2px` up from the bottom, so the CSS is describing a
 * crown roughly 2px proud at its highest. 2.4 is that, rounded up slightly
 * because a real curved surface needs a little more depth than its shadow
 * suggests to read as curved rather than as a chamfer.
 */
export const NEXTSTEP_CROWN_PX = 8.5;

/**
 * ⚠⚠ 2.4 WAS THE SHADOW STACK'S NUMBER AND IT RENDERED AN INVISIBLE BUTTON.
 *
 * The CSS insets describe a crown ~2px proud, and that reading is correct FOR A
 * PAINTED SURFACE — the gradient does the shaping and the geometry only has to
 * imply it. **A mirror has no such licence.** At 2.4 units the surface is nearly
 * flat, so it returns the environment shell (black) across almost its whole
 * area and the button disappeared against the #101010 ground.
 *
 * ⚠ THE DEPTH IS WHAT SWEEPS THE ENVIRONMENT. A chrome surface only shows a
 * travelling highlight where its normal turns through the angles that face a
 * light source. A flat mirror facing the camera reflects one thing, everywhere.
 * 8.5 against a 20.5 half-height is roughly the tube proportion in Carl's logo
 * renders, where every stroke is a rounded extrusion rather than a low dome.
 *
 * ⚠ SO THE CSS AND THE MESH DISAGREE ON DEPTH BY DESIGN, and that is not drift.
 * They are solving the same appearance with different physics: the CSS fakes a
 * dome it does not have, and the mesh needs the dome it is faking. Matching the
 * number would have matched the wrong thing.
 */

/**
 * The flat plateau at the top of the crown, as a fraction of the half-width.
 *
 * ⚠ THE LOGO RENDERS ARE ROUNDED EXTRUSIONS, NOT FLAT FACES WITH A BEVEL. Every
 * stroke in Carl's references is a tube with a soft crown; the specular runs as
 * a hairline ALONG that crown. A large plateau flattens the highlight into a
 * broad sheen and loses the line that makes it read as chrome.
 *
 * ⚠⚠ IT WAS 0.35, DEFENDED AS *"a small flat for the label to sit on"*, AND THAT
 * JUSTIFICATION WAS FALSE. The label is not on the mesh at all — it is a DOM
 * `<span>` at `inset: 0` layered OVER the canvas (`app/proto/nextstep/page.tsx`).
 * **Nothing sits on that flat.** Caught by the Architect, 10 August 2026.
 *
 * ⚠ AND A LARGE PLATEAU IS ACTIVELY HARMFUL UNDER AN ORTHOGRAPHIC CAMERA. A flat
 * face whose normal is (0,0,1) reflects straight back along +Z, so every plateau
 * pixel returns the same thing — one flat colour across the middle of the
 * button. The curvature is what sweeps the environment and makes a mirror read
 * as a mirror.
 *
 * ⚠ THE REAL CONSTRAINT BEHIND THE OLD NUMBER IS TEXT LEGIBILITY over a bright
 * curved surface. That is genuine, but it is solved by PLACING THE KEY so the
 * hot band runs above and below the text — not by flattening the geometry.
 */
export const NEXTSTEP_PLATEAU = 0.15;

/**
 * Segment counts for the swept pill.
 *
 * ⚠ THE CROWN NEEDS REAL RESOLUTION AND THE PERIMETER NEEDS MORE THAN IT LOOKS.
 * A mirror shows its own faceting: too few segments and the specular line breaks
 * into steps as the light travels. These are the cheapest values at which the
 * highlight stayed continuous across a full traveller orbit.
 */
export const NEXTSTEP_PERIMETER_SEGMENTS = 192;
export const NEXTSTEP_CROWN_SEGMENTS = 24;

/**
 * The canvas is inset around the button so the contact shadow and any bloom have
 * room to fall outside the pill without being clipped.
 *
 * ⚠ THE CARD CANVAS LEARNED THIS THE EXPENSIVE WAY — see `protoCanvasBox` in
 * `answer-card-geometry.ts`, where a canvas sized exactly to the grid left the
 * logo unable to reach its own edges.
 */
export const NEXTSTEP_CANVAS_PAD_PX = 14;

/**
 * The crown's height profile across the pill's short axis.
 *
 * ⚠ A RAISED COSINE WITH A PLATEAU, matching the card face's `crownZ`. Copied in
 * SHAPE deliberately: the two objects are in the same scene under the same
 * travelling light, and two different curvature models would catch that light
 * differently enough to read as two different worlds.
 *
 * @param t  -1 at one edge of the short axis, 0 at the centre, +1 at the other.
 */
export function crownHeight(t: number): number {
  const a = Math.abs(t);
  if (a <= NEXTSTEP_PLATEAU) return NEXTSTEP_CROWN_PX;
  const u = (a - NEXTSTEP_PLATEAU) / (1 - NEXTSTEP_PLATEAU);
  return NEXTSTEP_CROWN_PX * ((1 + Math.cos(u * Math.PI)) / 2);
}

/**
 * The pill's outline as a closed path of points with outward normals.
 *
 * ⚠ SAMPLED, NOT ASSEMBLED FROM PRIMITIVES. Two straight runs plus two semicircle
 * caps would need their joins reconciled by hand, and a seam in a mirror is
 * visible as a broken highlight. One parameterised walk cannot have a seam.
 *
 * @param w  full width in px
 * @param h  full height in px
 */
export function pillPath(
  w: number = NEXTSTEP_WIDTH_PX,
  h: number = NEXTSTEP_HEIGHT_PX,
  segments: number = NEXTSTEP_PERIMETER_SEGMENTS,
): Array<{ x: number; y: number; nx: number; ny: number }> {
  const r = h / 2;
  // The centres of the two end caps, in a box centred on the origin.
  const cx = w / 2 - r;

  // Arc length of the whole outline: two straight runs plus two semicircles.
  const straight = 2 * cx;
  const arc = Math.PI * r;
  const total = 2 * straight + 2 * arc;

  const pts: Array<{ x: number; y: number; nx: number; ny: number }> = [];

  for (let i = 0; i < segments; i++) {
    // Walk the perimeter at constant ARC LENGTH, so segments are evenly spaced
    // in space rather than in parameter. Uneven spacing would bunch triangles at
    // the caps and thin them along the straights, which a mirror would show.
    const s = (i / segments) * total;

    if (s < straight) {
      // Top edge, left to right.
      const x = -cx + s;
      pts.push({ x, y: r, nx: 0, ny: 1 });
    } else if (s < straight + arc) {
      // Right cap, sweeping from top to bottom.
      const a = (s - straight) / r; // 0..PI
      const th = Math.PI / 2 - a;
      pts.push({ x: cx + r * Math.cos(th), y: r * Math.sin(th), nx: Math.cos(th), ny: Math.sin(th) });
    } else if (s < 2 * straight + arc) {
      // Bottom edge, right to left.
      const x = cx - (s - straight - arc);
      pts.push({ x, y: -r, nx: 0, ny: -1 });
    } else {
      // Left cap, sweeping from bottom to top.
      const a = (s - 2 * straight - arc) / r; // 0..PI
      const th = -Math.PI / 2 - a;
      pts.push({ x: -cx + r * Math.cos(th), y: r * Math.sin(th), nx: Math.cos(th), ny: Math.sin(th) });
    }
  }

  return pts;
}
