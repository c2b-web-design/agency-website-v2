"use client";

import { useState } from "react";
import Container from "@/components/layout/container";
import EnquiryOpening from "@/components/enquiry/enquiry-opening";

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

  return (
    <>
      {/* ⚠⚠ THE LOGO ONLY — NO HEADER, NO NAV LINKS, NO "Web Design" TEXT.
          Carl's instruction, 27 August 2026, narrowed three times. ⛔ DO NOT
          REINTRODUCE `SiteHeader` ON THIS PAGE: it brought nav links, a "Web
          Design" span, and an 81px band that PUSHED THE QUESTIONS AND ANSWERS
          DOWN (the document went to 981px). See D-062.

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
            <img
              src="/c2b-logo-mark.png"
              alt="C2B"
              width={951}
              height={544}
              className="enquiry-logo-cross absolute max-w-none"
              style={{ ...GOLD, opacity: showBlue ? 0 : 1 }}
            />
            {/* ⚠⚠ THE ONE THING THE NAIL CANNOT FIX, STATED SO NOBODY CHASES IT:
                the two marks have genuinely different letterform aspect ratios —
                gold 1.94364, blue 1.92525. With their centres nailed and their
                letterform HEIGHTS matched, the blue's letterform box is 0.58px
                narrower, i.e. 0.29px per side, symmetric about the nail.
                ⛔ THAT IS A PROPERTY OF THE ARTWORK. Squaring all four edges
                would mean distorting one mark, and it is not a positioning bug
                to be fixed. Carl: *"Any movement will be restricted to scale."*
                This is that residual, and it is the intended trade. */}
            <img
              src="/c2b-logo-blue-mark.png"
              alt=""
              aria-hidden="true"
              width={969}
              height={503}
              className="enquiry-logo-cross absolute max-w-none"
              style={{ ...BLUE, opacity: showBlue ? 1 : 0 }}
            />
          </div>
        </Container>
      </div>

      <EnquiryOpening onStageChange={setStage} />
    </>
  );
}
