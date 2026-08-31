import Container from "@/components/layout/container";

/* ⚠⚠ THIS PAGE IS SCAFFOLDING. IT IS NOT THE ABOUT SECTION.
   Carl's instruction, 28 August 2026: *"we must 'set up' the about page in the
   same manner [as the landing page]. Once done, we will return to it in good
   time to develop it. Its the same principles i use when producing music in a
   DAW. Lets get the bare bones in there and then zero in and focus at the right
   time."*

   ⛔ THE COPY BELOW CONVEYS POSITION AND IS NOT FINAL. That is the standard the
   landing page is currently held to, in Carl's own words — its text "can be seen
   to convey positions and ideas" while "the text wording will be edited, refined
   and focused". This page is at the same stage on purpose.

   ⛔ DO NOT DEVELOP THIS PAGE INTO THE ARGUMENT WITHOUT A CHUNK FROM CARL. The
   thinking behind the eventual section runs to 2,020 lines in
   `project-intelligence/live-work/about-section-thinking.md` — which is IDEA
   STAGE and AUTHORISES NOTHING. ⚠ That file names itself as the most persuasive
   material in the repo for talking a Builder into building more than was asked.

   ⚠ SECTION TITLES ARE PROVISIONAL. Section 2's is explicitly open — Carl:
   *"Does it have to be called 'meet the team?' No."*

   ⚠ THE FOUR SECTIONS MIRROR THE LANDING PAGE'S FOUR. That is a STRUCTURAL
   instruction, not a visual one: it does not license copying the landing page's
   layout, and `app/page.tsx` is a protected path. */

/* ⚠⚠ THE NAIL — A SECOND COPY OF /start's CONSTANTS, AND THE DUPLICATION IS
   DELIBERATE. D-065 clause 4 leaves the MECHANISM to the Builder and rules only
   on the OUTCOME — Carl: *"By what method? Thats your domain, i care about
   outcome."* The nail (D-063) is the method that has worked.

   ⛔ THE COUNT, STATED ACCURATELY: this is the SECOND copy of these constants,
   not the third. They live in exactly one other file, `app/start/page.tsx`. THE
   LANDING PAGE DOES NOT USE THE NAIL AT ALL — it reaches the same point through
   `SiteHeader`'s flow layout, which is why D-065 clause 4 was redrafted away
   from naming the nail as a requirement.

   ⚠ SO THE TRUE STATE OF THE SITE IS: TWO COPIES OF THE CONSTANTS, THREE
   MECHANISMS REACHING ONE POINT. That is what the header work inherits.

   ⛔ WHY NOT A SHARED MODULE, given the duplication is real. Extracting one
   would edit `app/start/page.tsx` — approved work under D-062/D-063 — and would
   be a structural decision taken inside a chunk that did not authorise it
   (CLAUDE.md §5a). It would also pre-empt the header work, which is where the
   sharing question belongs. ⚠ THE DEBT'S OWNER IS THE HEADER CHUNK.

   ⚠⚠ THE INVARIANT IS UNASSERTED — VERIFY BEFORE RELYING ON THIS. Nothing in
   code checks that these three mechanisms agree; they agree because all three
   resolve through `Container`. D-065 records that the harness is owed when the
   header work lands.

   ⛔ IF EITHER PNG IS RE-EXPORTED OR RE-CROPPED THESE NUMBERS ARE STALE.
   Re-measure; do not assume. Source of truth for the reasoning: D-063. */
const NAIL_X = 35.0;      // px right of the Container's content-left edge
const NAIL_Y = 18.3456;   // px below the Container's content-top edge

/* Where the gold's letterforms sit inside its own frame, as a fraction of that
   frame — measured at alpha>=250, the solid letterforms, excluding the soft
   shadow falloff. ⚠ `cy` is NOT 0.5: the shadow is heavier below, so the ink
   sits above the frame's centre. */
const MARK = {
  gold: { fw: 951, fh: 544, cx: 0.500526, cy: 0.458640, coreH: 481 / 544 },
} as const;

/* ⛔ D-060's 40px EXPRESSED AS INK, NOT FRAME. The landing page renders the gold
   frame at 40px tall and 88.42% of that frame is letterform, so the ink is
   35.3676px. ⚠ 35.3676 / 0.884191 = 40.0000px of frame — D-060 exactly. */
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

export const metadata = {
  title: "About — C2B Web Design",
  description:
    "How C2B Web Design works: the founder, the process, the roles, and what modern websites can actually do.",
};

export default function About() {
  return (
    /* Same page-level treatment as `/` and `/start`. ⚠ `app/layout.tsx` sets NO
       background on <body>, so a route that omits this renders on the default
       ground. Every existing route sets it at page level. */
    <div className="bg-neutral-950 text-white min-h-screen">

      {/* ⚠⚠ THE MARK — GOLD, AND IT MUST NOT MOVE. D-065: *"No movement, only
          change."* The mark occupies the same point on every route; colour may
          change, position may not.

          ⛔ THE COLOUR IS PROVISIONAL — Carl: *"In the about section it is
          provisionary gold. It may not stay that way."* PROVISIONAL is a defined
          status: in place, deliberately untuned, awaiting the mastering pass
          (D-035). ⚠ NOT a gap, and not an approval that is missing.

          ⛔ NO `SiteHeader` ON THIS PAGE, AND ITS ABSENCE IS DELIBERATE. Carl has
          DEFERRED whether the header goes on all routes — he is weighing a font
          decision and design against context not yet shared with the Builder, and
          site headers are the NEXT body of work. ⚠ Rendering `SiteHeader` here as
          a convenience would settle that question while implementing something
          else (CLAUDE.md §5a). It is not an oversight; do not "fix" it. */}
      <div className="absolute top-5 left-0 right-0 z-10">
        <Container>
          {/* ⚠ A ZERO-HEIGHT `relative` ORIGIN, so the mark is placed in absolute
              px from the nail and occupies no vertical space. A sized box would
              reintroduce the "which edge does the difference land on" question
              the nail exists to remove.

              ⛔⛔ DO NOT WRAP THIS IN AN ANCESTOR CARRYING `transform`, `filter`,
              `perspective`, `contain` OR `will-change`. Any of them becomes the
              containing block for `absolute`, which resolves the mark against
              THAT ANCESTOR instead of the initial containing block and moves it
              off the nail.

              ⚠⚠ THE REASON HERE IS D-065 ITSELF — the mark not moving between
              routes. ⛔ THIS IS NOT `/start`'s REASON. There the same constraint
              protects a shared card host resolving `position: fixed` against the
              viewport (D-048); there is no card host on this page. The constraint
              is identical, the reason is different, and copying that page's
              explanation across would assert something untrue of this one. */}
          <div className="relative" style={{ height: 0 }}>
            <img
              src="/c2b-logo-mark.png"
              alt="C2B"
              width={MARK.gold.fw}
              height={MARK.gold.fh}
              className="absolute max-w-none"
              style={GOLD}
            />
          </div>
        </Container>
      </div>

      {/* ── Opening ─────────────────────────────────────────────────────────
          ⚠ FULL-VIEWPORT SECTIONS — Carl, 31 August 2026: *"make them larger
          like on the home page… If i can see all the real estate that gives a
          better size canvas to design in. Rather than thinner 'strips'."*

          ⛔ THE REASON IS THE DEVELOPMENT PASS, NOT THIS ONE. The height is not
          a styling preference — it is so the canvas each section will eventually
          be designed into is VISIBLE AT ITS REAL SIZE while it is being designed.
          ⚠ A section sized to its placeholder copy would have to be resized once
          real content arrives, and the design would have been judged against the
          wrong dimensions the whole time.

          `min-h-screen flex items-center` is the landing page's own pattern for
          a full-canvas section (`#contact`, app/page.tsx:226). ⚠ It is a FLOOR,
          not a fixed height: a section whose content exceeds the viewport grows.

          ⛔ THE CLEARANCE FOR THE MARK GOES ON THE INNER DIV, NOT THE SECTION.
          The mark above is absolutely positioned and out of flow, so it reserves
          no vertical space and the h1 would otherwise sit under it.

          ⚠⚠ `[&>div]:w-full` IS LOAD-BEARING. DO NOT REMOVE IT.
          ⛔ MEASURED: without it the heading rendered at left 442.5 against the
          landing page's 104.5 — the text visibly detached from the mark it aligns
          under, and `Container` computed to 603.9px instead of 1280px.

          ⚠ THE MECHANISM: `Container` carries `mx-auto`. An auto inline margin
          makes the box size to its CONTENT and then centres the shrunken result,
          and it does this REGARDLESS of the parent's alignment — `align-items`
          and `justify-items` do not override it. Giving the child an explicit
          `w-full` means the auto margins have a full-width box to distribute
          around instead of a shrink-to-fit one.

          ⛔ THREE THINGS WERE TRIED AND MEASURED FAILING, so they are not
          alternatives: `flex items-center`, `flex flex-col items-stretch`, and
          `grid content-center justify-items-stretch`. The grid track WAS the
          full 1425px with `justify-items: stretch` applied, and the container
          still computed 603.9px. THE AUTO MARGIN IS THE CAUSE, not the layout mode.

          ⚠ The landing page's own full-canvas section (`app/page.tsx:226`) uses
          plain `flex items-center` and does NOT hit this, because its content is
          deliberately `text-center mx-auto`. This page is left-aligned to the
          mark, so it does. ⛔ `components/layout/container.tsx` is a PROTECTED
          path — the fix belongs here, not there. */}
      {/* ⛔ THE PAGE TITLE AND SECTION 1 SHARE ONE SECTION — Carl, 31 August 2026:
          *"Lose the dividing line that runs through the middle of section 1."*
          ⚠ They were two full-height sections with a rule between them, which cut
          the opening statement in half: the title and the section it introduces
          read as one thing and are now on one canvas.

          ⚠ FIRST PERSON — "I", never the third. Carl's ruling, 30 August 2026:
          third-person copy reads *"as if someone else or AI wrote it"*.
          ⛔ THIS IS THE ITEM MOST LIKELY TO ERODE — polished copy drifts into the
          third person on its own. */}
      <section className="min-h-screen flex flex-col justify-center [&>div]:w-full">
        <Container>
          <div className="max-w-2xl pt-32 pb-24">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              How the work gets done.
            </h1>
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              What we build is covered elsewhere on this site. This page is about
              the way it is built — the process, the people, and what a website
              can actually do once it stops being a template.
            </p>

            <h2 className="mt-24 text-3xl font-semibold tracking-tight">
              The founder and the process.
            </h2>
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              I run C2B, and I build with a system rather than by hand alone. This
              section will set out how that works and why I chose it.
            </p>
          </div>
        </Container>
      </section>

      {/* ── 2. The roles ────────────────────────────────────────────────────
          ⚠⚠ DESCRIBED IN PRINCIPLE, NEVER BY ROSTER. Carl's ruling, 30 August
          2026: *"a team with defined roles, and each member knows what they need
          to know."* ⛔ A section that only listed the seats by name would be the
          exact thing that ruling forbids. Recognition is the mechanism — a
          business owner already runs this shape.

          ⚠ THE TITLE IS OPEN. Carl: *"Does it have to be called 'meet the team?'
          No."* */}
      <section className="min-h-screen flex flex-col justify-center [&>div]:w-full border-t border-neutral-800">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              The roles.
            </h2>
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              The work is split across defined roles, each one knowing what it
              needs to know. This section will expand the process above into that
              structure.
            </p>
          </div>
        </Container>
      </section>

      {/* ── 3. What modern websites can do ──────────────────────────────────
          ⚠ PLAIN LANGUAGE IS THE RULE. Carl: not Three.js geometry but *"a
          wireframe like is used in video games with a material put on it and lit
          with an invisible orbital light."*

          ⛔ NO EXAMPLES ARE EMBEDDED YET. Their selection, recolouring and
          recording is development-pass work and is not authorised. */}
      <section className="min-h-screen flex flex-col justify-center [&>div]:w-full border-t border-neutral-800">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              What a website can actually do.
            </h2>
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              Most reference points are a decade old, so the current ceiling is
              hard to picture. This section will show it rather than describe it.
            </p>
          </div>
        </Container>
      </section>

      {/* ── 4. TBD ──────────────────────────────────────────────────────────
          ⛔⛔ THE HEADING IS DELIBERATE AND CARL AUTHORISED IT ON 31 AUGUST 2026.
          The fourth section is named in the structure but its SUBJECT is
          undecided — Carl's, explicitly. ⚠ Inventing a subject here would decide
          it by default, which is the one thing this placeholder exists to
          prevent.

          ⚠ THIS SHIPS. Every push to `main` deploys, and the production alias
          returns HTTP 200 with no authentication (`app/robots.ts` blocks crawlers
          and says of itself that it is NOT access control). The heading was put
          back to Carl with that exposure stated, and he authorised it. */}
      <section className="min-h-screen flex flex-col justify-center [&>div]:w-full border-t border-neutral-800">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-500">
              TBD — To Be Determined
            </h2>
          </div>
        </Container>
      </section>

    </div>
  );
}
