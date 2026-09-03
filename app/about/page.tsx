import Container from "@/components/layout/container";
/* ⚠ THE `/about` NAV — a CLIENT component, deliberately kept in its own file so
   THIS page stays a static prerendered server component. ⛔ NOT `SiteHeader`:
   that would place the links in flow, at a different point from `/start`. */
import AboutNav from "@/components/layout/about-nav";

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

/* ⚠⚠ THE NAV LINKS HANG FROM THE SAME NAIL AS THE MARK — identical to
   `app/start/page.tsx`. Carl, 31 August 2026: *"The Home should be in exactly
   the same place it is in the start section."*

   ⛔ COMPUTED FROM THE MARK'S FRAME, NOT COPIED AS A LITERAL. If D-060's 40px is
   ever revisited this follows it; a hardcoded number would go stale silently,
   and a stale value here is invisible until someone navigates between routes and
   watches the words move. That is exactly how the `/start` defect was found. */
const GOLD_TOP = parseFloat(GOLD.top);
const GOLD_H = parseFloat(GOLD.height);

/* ⚠⚠ THE SAME OPTICAL CORRECTION AS `/start`, AND FOR THE SAME REASON.
   ⛔ APPROVED THERE BY CARL'S EYE, 31 August 2026 — bisected 0 (*"a smidgeon too
   high"*) / 1 (*"a smidgeon too low"*) / 0.5 (*"Nailed it"*).

   ⚠ THE CAUSE IS ARITHMETIC, NOT TASTE: `place()` computes the frame as
   `CORE_H / coreH`, giving 39.984px against the landing page's round 40px.
   Everything hung off that centre inherits the 0.016px shortfall as a SYSTEMATIC
   UPWARD BIAS. ⛔ `/about` USES THE SAME `place()`, SO IT CARRIES THE SAME
   RESIDUE — the correction is required here for the same reason, not copied as
   a superstition.

   ⛔⛔ THIS IS A CORRECTION, NOT A FIX, AND IT IS NOW IN TWO FILES. The proper
   fix removes the residue so no correction is needed anywhere. That touches
   D-060/D-063 approved work and is CARL'S TO AUTHORISE. ⚠ If it is ever done,
   BOTH copies go — grep `NAV_DROP_PX`.

   ⚠ TUNED TO ONE SETUP: 0.484px rounds consistently at 1920x1080 / 100% scale,
   Carl's display. It may tip the other way at a different zoom. Unasserted. */
const NAV_DROP_PX = 0.5;

const NAV_CENTRE_Y = GOLD_TOP + GOLD_H / 2 + NAV_DROP_PX;

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

            {/* ⚠⚠ THE NAV LINKS — same list, same mechanism, same place as
                `/start`. Carl, 31 August 2026: the `/about` header carries the
                SITE-WIDE links, and *"The Home should be in exactly the same
                place it is in the start section."*

                ⛔ `HEADER_LINKS` IS NOT USED HERE — that filtered list drops
                `Home`, which is correct on the landing page only, because you
                cannot navigate to where you already are. On `/about` `Home` is
                needed, so this renders the full `NAV_LINKS`, exactly as `/start`
                does.

                ⛔⛔ `SiteHeader` IS NOT RENDERED ON THIS PAGE, AND THE REASON IS
                NOT D-062. There is no corridor here to push down, so the 81px
                band would be legal — but the links would then sit at the FLOW
                position rather than the nail's, which is a THIRD placement
                mechanism and would put `Home` somewhere other than where it sits
                on `/start`. ⚠ Carl asked for exactly the same place; this is what
                delivers it.

                ⚠ `hidden md:flex` matches `/start` and `site-header.tsx`. Below
                `md` there is no nav and no menu button on this page either —
                the same KNOWN GAP recorded for `/start`, awaiting the mobile
                control that belongs to the deferred header design. */}
            <div
              className="absolute left-0 right-0 -translate-y-1/2 hidden md:flex items-center justify-end gap-6"
              style={{ top: `${NAV_CENTRE_Y}px` }}
            >
              {/* ⚠ THE LINKS COME FROM A CLIENT COMPONENT, THE ROW DOES NOT.
                  `AboutNav` needs `useState` for the dropdown; keeping it to its
                  own file leaves THIS PAGE a static prerendered server component.
                  ⛔ Inlining that state here would convert the whole page to
                  client rendering — the same server/client boundary that broke
                  the build earlier today. */}
              <AboutNav />
            </div>
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
          {/* ⚠⚠ TWO EQUAL COLUMNS — Carl, 3 September 2026, and the SYMMETRY IS
              THE POINT: *"make both headline font size the same. Space them out
              equally."* ⛔ Carl balanced the two paragraphs BY EYE against this
              arrangement, then added a sentence to text 1 to even them up. Change
              the column widths, the gap or either heading's size and the balance
              he approved is gone.

              ⛔ THE h1 IS `text-3xl`, DOWN FROM `text-4xl md:text-5xl`, TO MATCH
              THE h2. ⚠ It is the PAGE's h1 and it now heads the LEFT COLUMN rather
              than spanning the page — an h1 and an h2 sitting as visual equals is
              deliberate, not an oversight.

              ⚠ `max-w-2xl` was REMOVED from this block — it was sized for one
              column and would squeeze both into half the page. */}
          <div className="pt-32 pb-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
            <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              How the work gets done.
            </h1>
            {/* ⛔⛔ TEXT 1 — A STATEMENT. NO FIRST PERSON, AND THAT IS A RULING.
                Carl, 3 September 2026: *"Statement. No i or we."*

                ⚠⚠ THIS IS NOT THE THIRD-PERSON DRIFT THE FILE WARNS ABOUT. The
                first-person ruling (`about-section-thinking.md` L1183–1214) governs
                copy about THIS OPERATION — Carl himself, the seats, who approves.
                ⛔ THIS PARAGRAPH IS NOT ABOUT THIS OPERATION. It is about how the
                tools behave in general, and it is impersonal BY INSTRUCTION.

                ⛔ THE SAME TWO-REGISTER SPLIT AS THE HOMEPAGE (D-067, D-068):
                statements state, and the speaking happens in the block that follows.
                ⚠ TEXT 2 CARRIES THE "I". Do not "harmonise" the two — the change of
                register between them is the design, not an inconsistency.

                ⚠⚠ CARL WROTE THIS. The Builder drafted three options; he selected,
                cut and pasted back the final wording. ⛔ It is not a paraphrase of
                his intent — it is his text.

                ⚠ TWO CLAIMS WERE DELIBERATELY NOT MADE, and both were in earlier
                drafts he rejected:
                  • "control over every pixel and line of code" — a claim about
                    client work, on a site with no client work on it yet. Same defect
                    as the line struck from the homepage on 2 September.
                  • "cutting-edge execution with uncompromised artistry" — asserts
                    what the page beneath it is supposed to demonstrate.
                ⛔ DO NOT REINTRODUCE EITHER WHEN POLISHING. */}
            <p className="mt-4 text-base text-neutral-400 leading-relaxed">
              Most AI-driven web development yields generic outcomes because it
              relies on prompting rather than deliberate structure. AI is not a
              shortcut. It is a specialised workforce, and it requires
              architecture, governance and strategic direction to be worth
              anything. Left to itself it will always produce the most likely
              answer, which is another way of saying the most ordinary one.
              Separate the roles &mdash; brand strategy, design,
              technical architecture, execution &mdash; and creative control stays
              where it belongs at every stage. Supported by a deep project
              intelligence system, that framework holds each decision to a
              brand&rsquo;s own positioning rather than to an automated average.
              Governed with intention, AI does not replace craft. It carries it.
            </p>
            </div>

            {/* ⛔⛔ TEXT 2 — THE PERSON. FIRST PERSON, AND IT IS THE RULING
                (`about-section-thinking.md` L1183–1214). ⚠ TEXT 1 ABOVE IS
                IMPERSONAL BY A SEPARATE RULING — Carl, 3 September 2026:
                *"Statement. No i or we."* ⛔ THE TWO REGISTERS ARE THE DESIGN.
                Do not harmonise them; the homepage runs the same split (D-067,
                D-068).

                ⚠⚠ CARL WROTE THIS PARAGRAPH. The Builder proposed edits — the
                "we"/"I" mix, "pristine, production-ready code", "my exact
                standards" — and Carl kept his own wording. ⛔ THOSE ARE HIS
                CHOICES, NOT OVERSIGHTS. Do not "fix" them on a later pass.

                ⚠ THE h2 WAS REMOVED AND THEN RESTORED ON CARL'S INSTRUCTION —
                *"restore the headline for text 2"*. ⛔ The Builder had cut it on
                the grounds that the paragraph opens *"As the founder"* and the
                heading said it twice. That reasoning was NOT accepted; the heading
                is load-bearing for the two-column symmetry, because text 1 has one.

                ⚠ PLACED RIGHT, ON CARL'S INSTRUCTION — and the file's section-1
                layout put an IMAGE in this slot (text left, image right, fading as
                it meets the text). ⛔ THAT ARRANGEMENT IS NOW OPEN: if the image
                returns to this section it needs somewhere else to go. Carl's call,
                not settled here. */}
            <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              The founder and the process.
            </h2>
            <p className="mt-4 text-base text-neutral-400 leading-relaxed">
              As the founder, my role is to act as the creative director to a
              digital workforce. By organizing our AI environment into specialized
              roles of Strategist, Designer, Architect, and Builder we eliminate
              automated guesswork and maintain strict standards. I
              actively collaborate with the Architect to map out complex site
              structures, debate brand positioning with the Strategist, push the
              Designer for unique visual aesthetics, and oversee the Builder as it
              writes pristine, production-ready code. Through our rigorous project
              governance and deep file architecture, this framework allows me to focus
              entirely on the nuance, curation, and craftsmanship of the project,
              refining every output until it meets my exact standards for a truly
              bespoke website.
            </p>
            </div>
            </div>
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
      {/* ⚠⚠ THE ROOM — A REAL PHOTOGRAPH, AND THAT IS THE WHOLE POINT OF IT.
          Carl approved this framing and this image, 4 September 2026: *"im happy
          with the way you framed it on the site. the middle plant can stay."*

          ⛔⛔ FOUR AI-GENERATED ROOMS WERE TRIED AND REJECTED FIRST, AND THE REASON
          IS THE SECTION'S OWN ARGUMENT. Carl: *"If anything says 'made with AI',
          its this picture. Exactly the thing we are arguing against in this
          section."* ⚠ The tells were real — frames at disagreeing angles, rack
          gear that dissolves into noise, cabling going nowhere, repeated speakers
          at wrong scales. ⛔ A PAGE ARGUING THAT UNGOVERNED AI YIELDS GENERIC
          OUTPUT CANNOT ILLUSTRATE ITSELF WITH GENERIC OUTPUT. It is the same
          defect as the homepage line struck on 2 September, arriving in a picture
          instead of a sentence.

          ⚠⚠ DO NOT REPLACE THIS WITH A GENERATED IMAGE, however good it looks in
          isolation. This section is where a sceptic checks, and a photoreal render
          is claiming to be a photograph — so it can be caught. This cannot.

          ⛔ SOURCE OF TRUTH: `brand-assets/reddit-original.jpg`, 6158x4105, the
          photographer's own upload (r/workstations). ⚠ `public/about-studio-source.jpg`
          is a 2560px 16:9 crop of it — sharp at 1920 and on retina at 460KB.
          RE-CUT FROM THE MASTER; never upscale the crop.

          ⚠⚠ THE COLOUR NEEDED NO GRADING, AND THAT WAS MEASURED, NOT ASSUMED.
          The untouched wall reads H200-206 S32-43% L12-17%. The interaction teal
          on `/start` is H186 S66% L35% (D-053). ⛔ So the field is already at HALF
          the saturation and a THIRD of the lightness of the state colour — which
          is exactly what the record asks of a large teal area: *"well below them
          in saturation, nearer a duck-egg tint over near-black."* No collision.

          ⚠ A TEAL REGRADE WAS BUILT AND ABANDONED. It moved the hue about FIVE
          DEGREES and cost 94% of the resolution, because each pass ran through a
          generator at 1264px on an upscaled 699px thumbnail. ⛔ THE LESSON IS
          GENERAL: every generative round-trip is destructive, and the chain here
          ran 699 -> upscale -> regrade -> plant removal -> figure. Edit the master.

          ⛔ BING'S BROWSER EDITOR SAVES AT 1080x719 — it works on Reddit's
          display-size webp, not the original, whatever zoom it reports. Do not
          crop there. Resolve, Photopea or ffmpeg against the master.

          ⚠⚠ §10a IS UNRESOLVED AND IS CARL'S. *"Every example is our own work"* —
          this is someone else's room. Whether that rule covers BACKGROUNDS or only
          WORK EXAMPLES has not been ruled on. ⛔ Raised three times; not settled.

          ⚠⚠ `public/about-studio-figure.jpg` IS KEPT ON PURPOSE AND IS NOT USED BY
          ANY ROUTE. ⛔ DO NOT DELETE IT AS A STRAY. Carl, 4 September 2026:
          *"keep it in the files for now."*

          ⛔ IT IS A LIGHTING REFERENCE, NOT AN ASSET. It is the room with a figure
          composited in, and the figure was GENERATED INTO THIS SCENE — so its rim
          light and shadow direction already answer to these downlights and these
          monitors. ⚠ That is the hard part of compositing a person into a dark
          room, and it is worth keeping even though the pixels are not usable.

          ⚠⚠ WHY THE PIXELS ARE NOT USABLE: the file is 1264px and the figure is
          roughly 300x400 of it. On the 6158px master that is a 5x upscale of the
          one thing a viewer looks at — soft against a sharp room, which reads
          worse than either image alone.

          ⛔ TWO ROUTES IF THE FIGURE PROCEEDS, neither of them "paste this in":
            1. Composite at 1264 throughout — consistently soft rather than
               mismatched. Viable if the room ends up behind glass at low opacity.
            2. Use this only to READ the lighting, and rebuild the figure from a
               sharp source (a real photo) matched to it. ⚠ Also fixes the two
               tells in this composite: the chair back reads IN FRONT OF the torso,
               and there is no contact shadow on chair or floor.

          ⚠ THE ARRIVAL ITSELF — the figure appearing as the image travels from
          section 1 to section 2 — IS IDEA ONLY. Scroll-driven behaviour spanning
          sections is structural under CLAUDE.md §5a, and it would end this route's
          static prerender. Not built, not authorised.

          ⚠ IF THE CROP CHANGES, ANY CARD POSITIONS TUNED AGAINST IT GO STALE. */}
      <section id="roles" className="relative min-h-screen flex flex-col justify-center [&>div]:w-full border-t border-neutral-800">
        <img
          src="/about-studio-source.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-950/25" />

        <Container>
          <div className="relative max-w-2xl">
            {/* ⛔⛔ THE SECTION IS DELIBERATELY EMPTY OF COPY. Carl, 3 September
                2026: *"remove 'the roles' text"* — the heading went the same way
                as the paragraph before it.

                ⚠ THE WALL IS BEING KEPT CLEAR ON PURPOSE, so the room's negative
                space can be judged for the FOUR ROLE CARDS. ⛔ This is not an
                unfinished section that someone forgot to fill; it is a section
                held empty while its layout is decided.

                ⚠⚠ WHAT WAS REMOVED, so it is not reconstructed from memory:
                  h2  "The roles."
                  p   "The work is split across defined roles, each one knowing
                       what it needs to know. This section will expand the process
                       above into that structure."
                ⛔ Both were setup-pass scaffolding. The paragraph's second
                sentence described what the section WOULD do rather than doing it
                — the same defect as the two replaced in section 1.

                ⚠ THE HEADING WAS ALREADY PROVISIONAL BEFORE IT WENT. Carl,
                30 August: *"Does it have to be called 'meet the team?' No."*
                ⛔ Section 2's copy — the four seats — is NOT YET WRITTEN. */}
          </div>
        </Container>
      </section>

      {/* ── 3. What modern websites can do ──────────────────────────────────
          ⚠ PLAIN LANGUAGE IS THE RULE. Carl: not Three.js geometry but *"a
          wireframe like is used in video games with a material put on it and lit
          with an invisible orbital light."*

          ⛔ NO EXAMPLES ARE EMBEDDED YET. Their selection, recolouring and
          recording is development-pass work and is not authorised. */}
      <section id="examples" className="min-h-screen flex flex-col justify-center [&>div]:w-full border-t border-neutral-800">
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
      {/* ⛔⛔ SECTION 4 IS THE CONCLUSION, AND IT CARRIES THE CONVERSATION.
          Carl, 1 September 2026: *"4. Should be a conclusion, much lighter after
          the information dump."* ⚠ Sections 1–3 are a RISING information load —
          a top level view, then text info, then video info. This section's job is
          to STOP that, not to add a fifth block of content.

          ⛔ "MUCH LIGHTER" IS A DESCRIPTION OF WHAT THE READER NEEDS, not a style
          preference. ⚠ Sections 2 and 3 are both four-of-something; a section 4
          with four of anything would make the page read as a list of lists.

          ⛔⛔ THE BUTTON IS THE PAIR OF THE ONE ON THE LANDING PAGE (`app/page.tsx`,
          the `#contact` section). SAME dimensions, colour and position — Carl's
          instruction, and the position is why this block is `text-center
          max-w-2xl mx-auto py-24` rather than the left-aligned `max-w-2xl` the
          three sections above use. ⚠ THE TWO BUTTONS ARE A DELIBERATE PAIR:
          `Who we are` opens this page, `Start a conversation` closes it. Change
          one and the other goes stale.

          ⛔ THE JOURNEY THIS COMPLETES:
              Home  = who we are and what we do
              About = HOW
              /start = the conversation, ending at the send button
          ⚠ Nobody now reaches `/start` without having been offered the HOW first.

          ⚠⚠ THE COPY BELOW IS SCAFFOLDING AND CONVEYS POSITION ONLY — the same
          standard as the rest of this page. ⛔ THE SUBJECT of the conclusion is
          settled (it concludes, and it opens the conversation); its WORDING is
          not. Carl: *"We will put some text and subtext above it."*

          ⛔ AND DO NOT LET IT RESTATE SECTIONS 1–3. The reader has just done the
          work; summarising it back is the information dump continuing under a
          lighter name.                                                           */}
      {/* ⛔ THE ID IS `start`, RENAMED FROM `tbd` ON 1 SEPTEMBER 2026 (Carl).
          ⚠ It is the anchor the header's `Start` entry targets — the label and
          the target must not drift apart again. `components/layout/about-nav.tsx`
          is the only consumer; both moved in one change. */}
      <section id="start" className="min-h-screen flex flex-col justify-center [&>div]:w-full border-t border-neutral-800">
        <Container>
          <div className="text-center max-w-2xl mx-auto py-24">

            <h2 className="text-3xl font-semibold tracking-tight">
              That is how the work gets done.
            </h2>

            {/* max-w-xl mx-auto: matches the landing page's centred body measure —
                centre-aligned copy needs a shorter line than left-aligned copy. */}
            <p className="mt-6 text-base text-neutral-400 leading-relaxed max-w-xl mx-auto">
              A team with defined roles, a process that does not skip a stage, and
              nothing built before it is agreed. If that is the way you would want
              your own site made, the next step is a conversation.
            </p>

            <div className="mt-10">
              <a
                href="/start"
                className="inline-block bg-white text-black text-sm font-semibold px-7 py-3 rounded-full tracking-wide hover:bg-neutral-100 transition-colors duration-200"
              >
                Start a conversation
              </a>
            </div>

          </div>
        </Container>
      </section>

    </div>
  );
}
