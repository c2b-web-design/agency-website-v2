"use client";

import { useState } from "react";
import Container from "@/components/layout/container";
import EnquiryOpening from "@/components/enquiry/enquiry-opening";
/* ⚠ THE LIST ONLY — NOT the `SiteHeader` component. ⛔ Importing the component
   here would reintroduce D-062's 81px in-flow band. See the wrapper comment. */
import { NAV_LINKS } from "@/components/layout/nav-links";

/* ⚠⚠ THE NAIL — ONE DECLARED POINT THAT BOTH MARKS HANG FROM.

   Carl's design, 27 August 2026: *"pick a point on the page, both pages, that
   are identical. The exact same spot. Then pick an exact centrepoint for each
   asset. It will be like driving a nail through all 3. Any movement will be
   restricted to scale."*

   ⛔ WHY THIS SHAPE AND NOT MARGINS. Position used to be a DERIVED value here —
   frame height, then a margin to correct for the frames disagreeing, then
   another to correct the correction. Every step carried its own rounding, and
   the errors compounded into a visible jump on a hard cut. Now the point is
   DECLARED ONCE and both marks are placed FROM it, so the only thing that can
   differ between them is scale — and scale cannot produce a jump in position.

   ⚠ THE ORIGIN IS THE CONTAINER'S CONTENT BOX, WHICH IS THE SAME ELEMENT ON
   BOTH PAGES. Measured identical: content-left 92.363, top 19.9908 at 1440px.
   ⛔ THAT IS WHY THE REFERENCE IS THE PAGE AND NOT THE IMAGE — the landing page
   positions its mark through the same Container, so the two pages agree by
   construction rather than by two numbers being kept in step by hand. */
const NAIL_X = 35.0;      // px right of the Container's content-left edge
const NAIL_Y = 18.3456;   // px below the Container's content-top edge

/* ⚠ WHERE EACH ASSET'S LETTERFORMS SIT INSIDE ITS OWN FRAME, as a fraction of
   that frame. Measured at alpha>=250 — the solid letterforms, excluding the
   soft shadow falloff.

   ⛔ THE TWO FRAMES DISAGREE, AND THAT IS THE WHOLE PROBLEM THIS SOLVES: the
   gold's letterforms sit at 0.4586 of its frame height (the shadow is heavier
   below), the blue's at 0.5080. Frame-centring the two is therefore NOT the
   same as centring the two MARKS, and doing it drops the blue by ~5% of its
   height. These fractions are what make the distinction explicit.

   ⚠ IF EITHER PNG IS EVER RE-EXPORTED OR RE-CROPPED, THESE NUMBERS ARE STALE.
   Re-measure; do not assume. */
const MARK = {
  gold: { fw: 951, fh: 544, cx: 0.500526, cy: 0.458640, coreH: 481 / 544 },
  blue: { fw: 969, fh: 503, cx: 0.500000, cy: 0.507952, coreH: 495 / 503 },
} as const;

/* ⛔ THE SHARED LETTERFORM HEIGHT — D-060's 40px EXPRESSED AS INK, NOT FRAME.
   The landing page renders the gold frame at 40px tall, and 88.42% of that
   frame is letterform, so the ink is 35.3676px. Both marks are scaled to put
   their letterforms at exactly this height.

   ⚠ THE GOLD IS UNCHANGED BY THIS: 35.3676 / 0.884191 = 40.0000px of frame,
   which is D-060 exactly. The constant is written this way so the BLUE is
   sized by the same rule rather than by a number copied across. */
const CORE_H = 35.3676;

function place(m: (typeof MARK)[keyof typeof MARK]) {
  const frameH = CORE_H / m.coreH;
  const frameW = frameH * (m.fw / m.fh);
  return {
    width: `${frameW}px`,
    height: `${frameH}px`,
    left: `${NAIL_X - m.cx * frameW}px`,
    top: `${NAIL_Y - m.cy * frameH}px`,
  };
}

const GOLD = place(MARK.gold);
const BLUE = place(MARK.blue);

/* ⚠⚠ THE NAV LINKS HANG FROM THE SAME NAIL — Carl, 31 August 2026:
   *"The 4 words move upwards when going back and forth between the home page and
   start page. We need to use the same principle as the logo so that they appear
   immobile."*

   ⛔ THE DEFECT, MEASURED: the links sat at top 29.986 on `/` and 19.991 here —
   a 9.995px UPWARD JUMP on navigation. Horizontal was already identical; this
   was purely vertical.

   ⚠ WHY IT HAPPENED. On the landing page the links are CENTRED IN A FLOW ROW
   whose height is the mark's own 40px frame: row top 20, height 40, link height
   20, so 20 + (40-20)/2 = 30. Here they were the first thing in an out-of-flow
   wrapper and simply started at its top. ⛔ THE POSITION WAS DERIVED ON ONE PAGE
   AND ARBITRARY ON THE OTHER — the exact shape D-065 names as why marks drift:
   *"they drift because POSITION IS DERIVED."*

   ⛔⛔ THE FIX IS THE NAIL'S OWN PRINCIPLE: DECLARE THE POINT, HANG THE ELEMENT
   FROM IT. The links' resting line is the MARK'S VERTICAL CENTRE — a point that
   already exists and that the landing page independently resolves to.

   ⚠ IT IS COMPUTED FROM THE MARK'S FRAME, NOT COPIED AS 30px. `GOLD.top` and
   `GOLD.height` are strings ending in "px" from `place()`; parsing them keeps
   this in step with D-060 automatically. ⛔ IF THE MARK'S SIZE EVER CHANGES,
   THIS FOLLOWS IT. A literal 30 would silently go stale — and a stale number
   here is invisible until someone navigates and watches the words move. */
const GOLD_TOP = parseFloat(GOLD.top);
const GOLD_H = parseFloat(GOLD.height);
/* ⚠⚠ AN OPTICAL CORRECTION, SET BY CARL'S EYE — 31 August 2026. APPROVED:
   *"Nailed it, well done."*

   ⛔ THE VALUE WAS BISECTED AGAINST CARL'S EYE, not derived:

       0    → *"a smidgeon too high"*
       1    → *"a smidgeon too low"*
       0.5  → APPROVED

   ⚠ MEASURED RESULT: the nav row on `/start` sits 0.484px BELOW the landing
   page's, at 1920x1080 / 100% scale — Carl's actual display.

   ⛔⛔ WHY A CORRECTION IS NEEDED AT ALL, AND IT IS A REAL ARITHMETIC RESIDUE,
   NOT A GUESS. `place()` computes the mark's frame as `CORE_H / coreH`, which
   yields 39.984px here against the landing page's round 40px. Everything hung
   off that centre inherits the 0.016px shortfall as a SYSTEMATIC UPWARD BIAS —
   which is exactly why it read as consistently-slightly-high rather than as
   noise.

   ⚠⚠ THE INSTRUMENT MISSED THIS AND THE EYE DID NOT. Six measurements at
   1440x900 — anchor box, text box via Range, over-time sampling, a real click
   navigation, container edges, and a pixel comparison of identical crops — all
   reported 0.006px and all were TRUE. They compared the row against the NAIL,
   which carries the same 0.016px shortfall, so the error was invisible to every
   one of them. ⛔ A measurement sharing a constant with the thing it checks
   cannot see that constant's error — the harness-lies class, arriving in a
   place nobody had thought to look. Rule 9 settled it: Carl looked at the
   screen.

   ⚠ A FRACTIONAL PIXEL IS ROUNDED WHEN PAINTED. 0.484px rounds consistently at
   Carl's 1920x1080 at 100% scale; it may tip the other way at a different zoom
   or on a different display. ⛔ THIS IS TUNED TO ONE SETUP AND IS NOT ASSERTED
   ANYWHERE.

   ⛔ THE PROPER FIX IS TO REMOVE THE RESIDUE, NOT TO CORRECT IT — the links
   should hang off the landing page's 40px reference so no correction is needed.
   That touches D-060/D-063 approved work and is Carl's to authorise. Raised
   31 August; see the run log. */
const NAV_DROP_PX = 0.5;

const NAV_CENTRE_Y = GOLD_TOP + GOLD_H / 2 + NAV_DROP_PX;

export default function StartPage() {
  /* ⚠ THE STAGE IS MIRRORED HERE, NOT OWNED HERE. `EnquiryOpening` remains the
     only thing that sets it; this is a copy kept in step by its `onStageChange`
     callback, which fires from the same two entry points that call `setStage`.
     ⛔ DO NOT ADD A SECOND WAY TO SET THIS — a second source of truth for a
     state is exactly what CLAUDE.md §5a calls structural. */
  const [stage, setStage] = useState<"opening" | "active" | "complete">("opening");

  /* ⚠⚠ GOLD -> BLUE -> GOLD. Blue belongs to the Q+A and NOTHING ELSE.
     Gold through the opening, blue from the Begin press, and gold again the
     moment the client info section begins — which is `stage === "complete"`,
     the four-box contact field.

     ⛔ THE RETURN IS TIED TO THE START OF THE FADE, AND THAT IS CARL'S DESIGN
     ARGUMENT, NOT AN ARBITRARY BEAT. His reasoning, 27 August 2026:

       - Client info box 1 (Name) ALREADY CARRIES A GOLD RIM, signalling it is
         the field to fill first. ⛔ THE LOGO MUST BE GOLD BEFORE THAT ARRIVES —
         "its a much stronger design choice to have the logo already
         transitioned back to gold by this point."
       - At the fade, the amber Q-numbers are dissolving. ⚠ THE LOGO IS
         THEREFORE NOT INTRODUCING A NEW COLOUR — it joins one already on
         screen and already leaving. "The amber of the Q(n) is close to gold and
         its fading. Why not at this point change the blue to gold logo."

     ⚠ NO NEW TIMING, AGAIN. `enterComplete()` is called from a
     `setTimeout(..., COMPLETE_HOLD_MS)` — 900ms, the corridor move in which Q1
     travels into the rail and the cards leave 5->1. The stage flips at the END
     of that hold, which is EXACTLY when `.enquiry-phrase-complete` starts its
     2600ms fade. ⛔ SO THE CALLBACK ALREADY FIRES ON THE RIGHT BEAT and needs
     no delay of its own. Measured at +966ms from the Q1 Next step click (900ms
     plus click-to-timer overhead).

     ⚠ THE ARITHMETIC THAT MAKES IT WORK: the cross runs the same 1300ms as
     gold->blue, so gold is fully established at ~+2266ms. The Name box's
     entrance does not begin until +3600ms. ⛔ 1334ms OF MARGIN — "thats enough
     time to become established before card 1 with its gold rim appears."
     ⚠ UNASSERTED: nothing in code checks that 3600ms field delay against this.
     If the field cascade is re-timed, verify this margin still holds. */
  const showBlue = stage === "active";

  /* ⚠⚠ THE MASK NEEDS THE DIRECTION, NOT JUST THE STATE — the two radials are
     opposite gestures, so `showBlue` alone cannot choose between them.
     Carl, 27 August 2026: gold->blue OUTSIDE IN, blue->gold INSIDE OUT.

     ⛔ THE MASK ALWAYS RIDES THE GOLD LAYER, in both directions. Entering the
     Q+A the gold is clipped 150% -> 0%, so it is the LAST THING TO DISAPPEAR AT
     THE CENTRE — Carl: *"right at the centre of the logo the gold would be the
     last thing to disappear."* Returning to client info the gold is clipped
     0% -> 150%, opening out from the same point. The blue never carries a mask;
     it simply cross-fades underneath.

     ⚠ `stage` IS ENOUGH TO NAME THE DIRECTION because the journey is one-way:
     opening -> active -> complete. "active" means the gold is leaving,
     "complete" means it is returning. ⛔ There is no path back to `active`, so
     no case where this is ambiguous. */
  const goldMask =
    stage === "active"
      ? "enquiry-logo-radial-in"
      : stage === "complete"
        ? "enquiry-logo-radial-out"
        : "none";

  return (
    <>
      {/* ⚠⚠ THE MARK AND THE NAV LINKS — BOTH OUT OF FLOW. NO "Web Design" TEXT.

          ⛔ AMENDED 31 August 2026. This comment previously read "THE LOGO ONLY
          — NO HEADER, NO NAV LINKS", which was Carl's instruction of 27 August
          and was true until today. ⚠ THE ORIGINAL CLAIM IS KEPT HERE AS HISTORY
          because a reader reaches this comment before any governance file, and
          a stale one is an instrument that lies (`context-rules.md`).

          ⚠ WHAT CHANGED: Carl, 31 August 2026 — *"in the start section let us
          put the site header with the same font for now in exactly the same
          place, as we have done with the Logo."* ⛔ THE OPERATIVE WORDS ARE
          "AS WE HAVE DONE WITH THE LOGO": the links hang from this same
          out-of-flow wrapper.

          ⛔⛔ WHAT HAS *NOT* CHANGED, AND MUST NOT: `SiteHeader` IS STILL NOT
          RENDERED ON THIS PAGE. It brought a "Web Design" span and an 81px
          BAND IN FLOW that PUSHED THE QUESTIONS AND ANSWERS DOWN (the document
          went to 981px). See D-062. ⚠ THE 81px COST IS THE THING D-062 FORBIDS,
          NOT THE LINKS THEMSELVES — and placing them out of flow does not
          reincur it. ⛔ THE DOCUMENT MUST STAY 900px. If it reads 981px, the
          header has gone back into flow and D-062 has been reopened.

          ⚠ THE MARK IS ABSOLUTELY POSITIONED AND OUT OF FLOW, so it occupies no
          vertical space and the enquiry corridor sits exactly where it did
          before any of this work.

          ⚠ `Container` IS REUSED RATHER THAN HARDCODING x=112 — it is also what
          makes the nail above meaningful, because the landing page positions
          its own mark through the same component. ⛔ DO NOT REPLACE IT WITH A
          LITERAL left-[112px]: it would be correct at one viewport width and
          wrong at every other. The site-wide `scrollbar-gutter: stable` in
          `globals.css` is the other half of that agreement — see D-062.

          ⚠⚠ `absolute` DELIBERATELY HAS NO POSITIONED ANCESTOR, so it resolves
          against the initial containing block. ⛔ DO NOT WRAP THIS AND
          `EnquiryOpening` IN A DIV CARRYING `transform`, `filter`,
          `perspective`, `contain` OR `will-change`. The enquiry holds a shared
          card host resolving `position: fixed` against the VIEWPORT, and
          `verify/` asserts `offsetParent === null` on it. Any of those
          properties makes the wrapper its containing block and breaks card
          positioning from a distance, with nothing looking wrong in the DOM —
          the failure that sank 12 August 2026. See D-048. */}
      <div className="absolute top-5 left-0 right-0 z-10">
        <Container>
          {/* ⚠ A ZERO-HEIGHT `relative` ORIGIN. Both marks are positioned
              against it in absolute px from the nail. It has no size of its own
              on purpose — a sized box would reintroduce exactly the
              "which edge does the difference land on" question the nail exists
              to remove.

              ⚠ `position: relative` does NOT create a containing block for
              `fixed`, and this is not an ancestor of the card host in any case.

              ⛔ STAGE 2 REPLACES THE GOLD LAYER'S OPACITY FADE WITH AN INVERTED
              RADIAL MASK — `circle(150% -> 0%)`, gold surviving LONGEST AT THE
              CENTRE while blue arrives from the edges inward. Carl: *"The
              crossfade for the button was inside out, maybe switch it up for
              the logo and go outside in."* The button's existing
              `enquiry-mask-reveal-radial` runs `circle(0% -> 150%)`; the logo's
              is its reverse. ⚠ THE NAIL MATTERS MORE THERE, NOT LESS: a radial
              reveals the centre last, so any residual sits exactly where the
              eye is held longest with no fade to cover it. */}
          <div className="relative" style={{ height: 0 }}>
            {/* ⚠⚠ THE BLUE IS ALWAYS FULLY PRESENT, UNDERNEATH, AND NEVER FADES.
                Carl, 27 August 2026: *"The crossfade can go. If the edge is much
                sharper so the blue is sitting over the gold all the time, the
                radial reveals the blue."*

                ⛔ IT IS RENDERED FIRST SO IT PAINTS BENEATH THE GOLD. Both
                layers are `absolute` with no z-index, so DOM order IS paint
                order — moving this element below the gold would invert the
                effect and the mask would cut into nothing.

                ⚠ opacity 1 AT ALL TIMES, DELIBERATELY. There is no crossfade
                any more: the gold's clip-path alone decides how much blue shows.
                ⛔ Do not reintroduce an opacity transition here — a fade running
                under the mask is exactly what softened the edge and made the
                radial read as a blend rather than a travelling edge.

                ⚠⚠ THE ONE THING THE NAIL CANNOT FIX, STATED SO NOBODY CHASES IT:
                the two marks have genuinely different letterform aspect ratios —
                gold 1.94364, blue 1.92525. With their centres nailed and their
                letterform HEIGHTS matched, the blue's letterform box is 0.58px
                narrower, i.e. 0.29px per side, symmetric about the nail.
                ⛔ THAT IS A PROPERTY OF THE ARTWORK. Squaring all four edges
                would mean distorting one mark, and it is not a positioning bug
                to be fixed. Carl: *"Any movement will be restricted to scale."*
                ⚠ IT MATTERS MORE NOW THAN IT DID UNDER THE CROSSFADE: with the
                blue permanently underneath, that 0.29px rim is visible around
                the gold at rest rather than hidden by a fade. */}
            <img
              src="/c2b-logo-blue-mark.png"
              alt=""
              aria-hidden="true"
              width={969}
              height={503}
              className="absolute max-w-none"
              style={{ ...BLUE, opacity: 1 }}
            />
            {/* ⚠⚠ THE GOLD SITS ON TOP AT FULL OPACITY AND IS THE ONLY MASKED
                LAYER. The radial clips IT, revealing the blue beneath — which is
                why the edge is hard: there is no fade running underneath it.

                ⛔ NO `enquiry-logo-cross` CLASS HERE ANY MORE. That class carries
                `transition: opacity 1300ms`, which is exactly the crossfade Carl
                removed. Reduced motion is handled by `.enquiry-logo-radial`
                instead — see globals.css. */}
            <img
              src="/c2b-logo-mark.png"
              alt="C2B"
              width={951}
              height={544}
              className="enquiry-logo-radial absolute max-w-none"
              style={{
                ...GOLD,
                opacity: 1,
                /* ⚠ THE CIRCLE'S CENTRE IS THE NAIL EXPRESSED AS A PERCENTAGE
                   OF THIS BOX — not 50% 50%. See the keyframe note in
                   globals.css: the two marks' boxes differ, so a box-centred
                   circle would not be concentric between them. */
                ["--logo-nail-x" as string]: `${MARK.gold.cx * 100}%`,
                ["--logo-nail-y" as string]: `${MARK.gold.cy * 100}%`,
                /* ⚠ THE RESTING CLIP MATTERS AS MUCH AS THE ANIMATION. In the
                   opening the gold must be FULLY VISIBLE (150%); once the Q+A is
                   running it must be FULLY GONE (0%), or the gold would snap
                   back the instant the animation's `both` fill released. */
                clipPath:
                  stage === "active"
                    ? "circle(0% at var(--logo-nail-x) var(--logo-nail-y))"
                    : "circle(75% at var(--logo-nail-x) var(--logo-nail-y))",
                animation:
                  goldMask === "none"
                    ? undefined
                    : `${goldMask} 1300ms linear both`,
              }}
            />

          {/* ⚠⚠ THE NAV LINKS — Carl, 31 August 2026: *"put the site header with
              the same font for now in exactly the same place, as we have done
              with the Logo. With one addition. Before the word Services we need
              text saying 'Home'. The user must have the ability to return home
              at any point."*

              ⛔ "THE SAME FONT FOR NOW" IS PROVISIONAL AND SAYS SO. The classes
              below are copied from `site-header.tsx` so the two agree today.
              ⚠ Carl is weighing a FONT DECISION against context not yet shared
              with the Builder, and the header's DESIGN is TBD — his word. THIS
              IS THE PLACEHOLDER TREATMENT, NOT AN APPROVED HEADER DESIGN.

              ⛔⛔ THEY ARE IN THE OUT-OF-FLOW WRAPPER ON PURPOSE. Rendering
              `SiteHeader` here would reintroduce D-062's 81px in-flow band and
              push the corridor down. ⚠ Sitting inside the ZERO-HEIGHT context
              above's PARENT — not the `relative` origin itself, which is
              reserved for the two marks — they cost the document nothing.

              ⚠ `justify-end` puts them opposite the mark, which occupies the
              left of this same `Container`. The mark is absolutely positioned
              out of this row, so there is nothing here to space against — hence
              a plain flex row rather than `justify-between`.

              ⛔⛔ ABSOLUTELY POSITIONED ON `NAV_CENTRE_Y`, WHICH IS THE MARK'S
              VERTICAL CENTRE. See the constant's derivation above. The row is
              `top: NAV_CENTRE_Y` with `-translate-y-1/2`, so it CENTRES ON that
              line rather than starting at it — which is what makes it agree with
              the landing page, where the links are centred in a 40px flow row.
              ⚠ `right-0 left-0` keeps `justify-end` meaningful now that the row
              is out of flow and would otherwise shrink to its content.

              ⛔⛔ HIDDEN BELOW `md`, AND THE REASON IS A MEASURED COLLISION.
              At 375px the five links ran from x=32.8 while the mark ends at
              x=85.9 — "Home" printed straight over the mark. ⚠ CAUGHT BY
              SCREENSHOT AT 375px; the 1440 numbers were clean and said nothing
              about it.

              ⚠ `md:flex` MATCHES `site-header.tsx`'s OWN BREAKPOINT — that
              component hides its links below `md` and shows a "Menu" button
              instead. ⛔ THERE IS NO MENU BUTTON HERE, so below `md` this page
              has the mark and no nav at all. THAT IS A KNOWN GAP, NOT AN
              OVERSIGHT: a mobile control is a design decision for the header
              work Carl has deferred, and inventing one here would settle it.
              ⚠ A user on a narrow viewport cannot currently leave `/start` by
              the nav — the corridor is still fully usable. */}
          <div
            className="absolute left-0 right-0 -translate-y-1/2 hidden md:flex items-center justify-end gap-6"
            style={{ top: `${NAV_CENTRE_Y}px` }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>
          </div>
        </Container>
      </div>

      <EnquiryOpening onStageChange={setStage} />
    </>
  );
}
