import Container from "@/components/layout/container";
import SiteHeader from "@/components/layout/site-header";

export default function Home() {
  return (
    // bg-neutral-950: forces a near-black background regardless of system dark mode
    // text-white: sets the default text color for the whole page
    // min-h-screen: ensures the dark background fills the viewport even on short pages
    <div className="bg-neutral-950 text-white min-h-screen">

      <SiteHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────────
          ⛔⛔ THE HEADER IS INCLUDED IN THIS SCREEN, NOT ADDED TO IT. Carl,
          1 September 2026: *"The header should be included in the height and
          width of the section. As with the footer."*

          ⚠⚠ MEASURED FAULT, and it is what Carl saw: every screen was
          `min-h-screen` PLUS its chrome, so the page ran 101px past the window
          on the last screen — the thin grey line at the bottom was the FOOTER'S
          `border-t`, sitting where the section should have ended. Before:
          header 81 (in flow) + hero 564; #contact 900 + footer 101 = 1001 in a
          900 window.

          ⛔ `min-h-[calc(100vh-81px)]` — 81px is the header's MEASURED height in
          flow (`border-b` + `py-5`), not a guess. ⚠ IT IS UNASSERTED: nothing in
          code checks that the header is still 81px. If the header's padding,
          border or font changes, THIS VALUE GOES STALE AND THE HERO OVERSHOOTS
          BY THE DIFFERENCE. Re-measure, do not adjust by eye.

          ⚠ `min-h-` NOT `h-`: a floor, not a ceiling. Content taller than the
          viewport grows the section rather than being clipped — which matters
          because the copy is about to be rewritten.

          ⛔ `flex items-center` centres the content in the taller frame. `py-32`
          is REPLACED by it: fixed padding in a viewport-height box would push
          the block off-centre. THE LAYOUT IS UNCHANGED — same Container, same
          max-widths, same order. Carl: *"i like the layout of each section.
          Keep it."*

          ⛔⛔ `[&>div]:w-full` IS NOT OPTIONAL AND IT IS NOT COSMETIC. `flex
          items-center` makes `<Container>` a FLEX ITEM, and Container carries
          `mx-auto` — so it STOPS FILLING THE WIDTH and centres itself, dragging
          every line of copy to the middle of the page.

          ⚠⚠ THAT IS EXACTLY WHAT HAPPENED ON 1 SEPTEMBER 2026 AND CARL CAUGHT IT
          BY EYE. The vertical resize was correct; the horizontal alignment was
          collateral damage nobody asked for. ⛔ Carl: *"i did not say to put the
          text in the middle. The text should be on the left. This is vital for
          what i have planned for the hero."*

          ⚠ THE MECHANISM WAS ALREADY DOCUMENTED — `app/about/page.tsx` explains
          it, and every `/about` section already carries this guard. It was not
          carried across with the flex change. ⛔ ANY FUTURE SECTION THAT GAINS
          `flex` NEEDS THIS TOO.                                                 */}
      <section className="min-h-[calc(100vh-81px)] flex items-center [&>div]:w-full">
        <Container>

          {/* Headline — three-step responsive scale:
              text-4xl (36px): mobile base — small enough at ~378px that the line breaks
              fall naturally without orphaning a single word on its own line.
              sm:text-5xl (48px): kicks in at 640px — large phones in landscape and small
              tablets where the extra space makes the bigger size work.
              md:text-6xl (60px): the full display size at 768px+ — strong and editorial on
              desktop without imposing that scale on smaller viewports.
              max-w-2xl: a narrower column feels curated. Wide headlines read as startup
              marketing; tight columns read as considered craft.
              leading-[1.1] (tighter than leading-tight = 1.25): at display sizes, tight
              line-height reads as confident and magazine-like, not cramped.                  */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-2xl">
            We build brands that mean something.
          </h1>

          {/* Subtext:
              mt-8 (up from mt-6): more breathing room between the headline and paragraph
              reinforces that these are distinct hierarchy levels, not a continuous block.
              text-base (down from text-lg): the size step between h1 and this paragraph
              must be large enough to read as subordinate. text-lg was too close in scale.
              max-w-lg (down from max-w-xl): shorter line length improves readability in
              body copy — the ideal measure is ~65 characters per line.
              leading-relaxed: adds vertical air inside the paragraph, making it easier to scan
              without increasing the font size.                                               */}
          <p className="mt-8 text-base text-neutral-400 max-w-lg leading-relaxed">
            A creative agency focused on strategy, design, and digital experiences that connect with people.
          </p>

          {/* CTA:
              mt-12 (up from mt-10): the CTA needs generous separation from the paragraph
              so it reads as a deliberate action, not an afterthought.
              font-semibold (up from font-medium): at text-sm, medium weight can look weak.
              Semibold gives the label authority without going bold.
              px-7 (up from px-6): slightly wider pill to balance the heavier label weight.
              tracking-wide: adds subtle intentionality — button labels at this size benefit
              from a touch of letter-spacing to feel considered.
              hover:bg-neutral-100 (was neutral-200): softer hover destination — the shift
              is noticeable but not jarring. Premium transitions are never loud.
              duration-200: explicit and smooth without being slow.                          */}
          <div className="mt-12">
            <a
              href="#work"
              className="inline-block bg-white text-black text-sm font-semibold px-7 py-3 rounded-full tracking-wide hover:bg-neutral-100 transition-colors duration-200"
            >
              See our work
            </a>
          </div>

        </Container>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────────
          id="services": anchor target for the navbar link
          border-t: hairline rule continues the visual rhythm established between all sections
          py-24: consistent section spacing — slightly less than the hero's py-32 because
          sections are supporting content, not the primary statement                */}
      {/* ⛔ ONE VIEWPORT, NO CHROME. Carl, 1 September 2026: *"2+3 should be a
          section with no headers or footers. More real estate to work in."*
          ⚠ MEASURED BEFORE: 737.5px — 162.5px short of the window. The padding
          pair `pt-16 pb-24` is replaced by `flex items-center`, which centres the
          block in the full-height frame; fixed padding would push it off-centre.
          ⛔ THE LAYOUT INSIDE IS UNTOUCHED.                                     */}
      <section id="services" className="min-h-screen flex items-center [&>div]:w-full border-t border-neutral-800">
        <Container>

          {/* Section intro block: max-w-2xl keeps the heading and paragraph from stretching
              full-width on desktop. A constrained column reads as considered and editorial —
              the same principle applied to the hero headline above.                         */}
          <div className="max-w-2xl">

            {/* Section heading: text-3xl is clearly secondary to the hero's md:text-6xl,
                but large enough to anchor the section. The period makes the heading read
                as a confident statement rather than a label. tracking-tight is consistent
                with all headings on the page.                                              */}
            <h2 className="text-3xl font-semibold tracking-tight">
              Websites built for how business works today.
            </h2>

            {/* Intro paragraph: same text-base / neutral-400 / leading-relaxed pattern as
                the hero subtext — this creates a consistent hierarchy language across the
                page so visitors learn the visual system without noticing it.
                max-w-lg (512px): constrains the paragraph independently of the wrapper's
                max-w-2xl (672px), keeping the heading wide while bringing the paragraph
                measure into the card text rhythm (card paragraphs are max-w-sm = 384px). */}
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              A modern website should do more than look good online. We build premium websites
              and intelligent digital systems that help businesses make a stronger impression,
              respond to enquiries faster, and turn more interest into real opportunities.
            </p>
          </div>

          {/* Service cards grid:
              mt-16: generous gap between the intro text and the cards — they are distinct
              elements and the separation reinforces that the cards are the substance being
              described, not a continuation of the paragraph.
              grid-cols-1: single column on mobile so each card has full width and room.
              md:grid-cols-2: two columns at 768px+ — four cards in a 2×2 grid reads as
              intentional and balanced. One column on desktop would feel stretched; four
              columns would feel cramped and lose the card structure entirely.
              gap-8: 32px between cards — consistent with the premium, spacious page feel. */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card: border border-neutral-800 uses the same hairline-rule vocabulary as
                section separators, unifying the visual system. p-6 md:p-8 matches the
                Work card padding rhythm — generous on desktop, compact on mobile.
                No border-radius — sharp corners feel more architectural on a dark background. */}

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Premium Website Design</h3>
              {/* max-w-sm (384px) constrains the line length on wide desktop cards —
                  the card stays architecturally wide but the text sits in a controlled
                  column, leaving intentional whitespace to the right. */}
              {/* ⛔ CARL'S WORDS, 2 September 2026 — approved verbatim.

                  ⛔⛔ THE SECTION USES TWO REGISTERS AND THIS IS THE RULE. Carl: *"On 2+4, that
                  is enough. 1+3 should be statements like the sections main headline and
                  subtext."*

                    cards 2 + 4  →  WE SPEAK   ("We turn...", "We offer...")
                    cards 1 + 3  →  STATEMENTS, no "we" at all

                  ⚠ DO NOT "FIX" CARDS 1 OR 3 BY ADDING A "WE" TO MATCH THE OTHERS. The absence
                  is deliberate and it mirrors the section heading and intro, which also state
                  rather than speak. Carl: *"We shouldnt overuse the word 'we'."*

                  ⚠ "UNIQUE", NOT "PREMIUM", CLOSES IT. Premium bookended the heading and made a
                  claim the body did not support; custom / tailor-made / bespoke all argue
                  one-of-a-kind, so unique is what the sentence actually earns.

                  ⚠ "YOUR brand identity" — the ownership matters. An earlier draft read "our",
                  which reverses the promise: the client's site shaped by C2B's identity rather
                  than their own.                                                             */}
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                Custom, tailor-made architecture designed specifically around your brand identity.
                Bespoke quality designed to make your business look trusted, credible, and unique.
              </p>
            </div>

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Website Transformation</h3>
              {/* ⛔ CARL'S WORDS, 2 September 2026 — approved verbatim.

                  ⚠ "We turn", not "Turning". The original was a GERUND WITH NO ACTOR — nobody
                  was doing it — which reads as a service-catalogue entry rather than a person
                  speaking. Cards 2 and 4 now both put us in the sentence.

                  ⛔ "TIRED", NOT "DATED". Carl chose it over "dated", "older" and deleting the
                  judgement altogether. Tired is the word a client would use about their OWN
                  site: it diagnoses without blaming anyone, where "dated" implies neglect.
                  ⚠ "Underperforming" is kept alongside it deliberately — tired is about
                  APPEARANCE, underperforming is about RESULTS. Two different reasons a client
                  arrives here, and dropping either narrows the card.

                  ⚠ SINGULAR THROUGHOUT: "a tired... website" → "a ... presence". The plural
                  form ("tired websites into a presence") disagreed in number.

                  ⚠ "Same business, stronger first impression" is UNCHANGED from the original
                  and was the strongest line in the section — it tells a client who fears a
                  redesign means becoming someone else that it does not.                      */}
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                We turn a tired or underperforming website into a sharper, more persuasive
                digital presence. Same business, stronger first impression.
              </p>
            </div>

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Intelligent Enquiry Systems</h3>
              {/* "Intelligent Enquiry Systems" is the one service that ventures furthest from
                  traditional web design. The copy describes business outcomes only — faster
                  response, less admin, better opportunities — without naming any specific tool
                  or technology. This is intentional: the mechanism is irrelevant to the client. */}
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                Smarter forms, faster follow-up, and qualification journeys that help you
                respond to interest sooner, reduce manual admin, and turn more enquiries
                into real opportunities.
              </p>
            </div>

            <div className="border border-neutral-800 p-6 md:p-8">
              {/* ⛔ CARL'S HEADING, 2 September 2026. Was "Ongoing Growth & Improvement".

                  ⚠ "IMPROVEMENT" WAS THE FAULT, and Carl named it: *"Are we shipping a product
                  that needs improvement?"* It concedes a deficit at launch, which contradicts
                  card 1 asserting the site was built properly in the first place — the two
                  cards were arguing against each other.

                  ⚠ "CARE" IS THE RELATIONSHIP WORD, and it carries the section's tone directly.
                  "Growth" framed the service as financial return; Carl ruled the value is *"not
                  just from a financial sense."*                                               */}
              <h3 className="text-lg font-semibold tracking-tight">Ongoing Long Term Care</h3>
              {/* ⛔ CARL'S WORDS, 2 September 2026 — approved verbatim, not paraphrased.
                  ⚠ THE OPENING SENTENCE IS AN OFFER, NOT A DIAGNOSIS, AND THAT IS THE POINT.
                  Support is a CHOICE the client makes — they buy the site, host it where they
                  like, and take the retainer or not. Four earlier drafts opened by telling the
                  client something about their situation ("websites drift", "a website does not
                  change on its own", "as the business changes...") so the service could be the
                  answer to a problem the copy had just planted. ⛔ Carl rejected every one:
                  *"Dont tell people how to run a business."* An offer states what is available
                  and lets them decline.

                  ⛔ NO PREDICTION AND NO FEAR. Earlier drafts carried "if something goes wrong",
                  "small faults can appear", "not starting again with a stranger". Carl:
                  *"Were not gonna tell them about a world where 'shit happens'."* The difficulty
                  is placed in the WORLD — "in an ever changing world" — never in the client's
                  business. ⚠ "Ready for whatever comes next" SURVIVED that cut deliberately: it
                  promises presence, it does not predict trouble. Carl: *"Its honest."*

                  ⚠ "Endeavour" is the honest verb — it promises effort, which is what a retainer
                  buys, not outcomes it cannot guarantee.

                  ⚠ TONE FOR THE WHOLE SECTION, Carl's words: *"businesslike but not corporate.
                  Personal, confident that says in every way 'we got your back'."*             */}
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                We offer ongoing maintenance, updates and support. In an ever changing world we
                endeavour to keep your site current, capable, and ready for whatever comes next.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ── Work / Proof ──────────────────────────────────────────────────────
          id="work" preserved: navbar "Work" link targets this anchor.
          Until client case studies exist, this section positions the C2B
          website itself as the first demonstration of the agency standard.
          Heading and intro follow the same max-w-2xl / max-w-lg pattern as
          the Services section.                                              */}
      {/* ⛔ ONE VIEWPORT, NO CHROME — the same change as `#services` above.
          ⚠ MEASURED BEFORE: 587.25px, the shortest screen on the page and
          312.75px short of the window.                                          */}
      <section id="work" className="min-h-screen flex items-center [&>div]:w-full border-t border-neutral-800">
        <Container>

          <div className="max-w-2xl">
            {/* ⛔ CARL'S WORDS, 2 September 2026 — approved verbatim. Was "Built to set the
                standard." over a two-sentence intro.

                ⛔⛔ THE OLD COPY DATED ON THE FIRST SALE, AND THAT IS WHY IT WENT. It read
                "Before we bring this level of thinking to client projects, we apply it to our
                own. This site is the FIRST EXPRESSION of the C2B approach..." ⚠ Both halves
                CONCEDED THE ABSENCE OF A PORTFOLIO: "before" means not yet, and "first
                expression" is a count whose value is one. ⛔ Carl: *"This is a problem. A line
                like this shouldnt be used."* Nobody arrives counting the portfolio — that line
                handed the reader the thought.

                ⚠ THE IDEA SURVIVED; ONLY THE TENSE WAS WRONG. Carl: *"We will/can do for you
                what we do for ourselves is a good philosophy."* ⛔ A PERMANENT commitment, not a
                stage the business is passing through. "One standard, applied to our own work and
                to yours" says it without a date in it.

                ⛔ NO "WE" HERE, AND IT IS DELIBERATE — the statement register (D-067). Carl:
                *"No need for a 'we' here, its more than implied 'our own' and 'yours'."*
                ⚠ THE SPEAKER IS CARRIED BY THE POSSESSIVES. Do not add one.

                ⚠ THE HEADING NO LONGER SAYS "STANDARD" because the body now does. Carl chose
                "Quality Without Exception" over "Built Without Compromise" and "Guided by
                Principle" — it is the same claim as the body's, so heading and paragraph make
                ONE argument rather than two. ⛔ "Guided by Principle" was ruled out as METHOD
                language: how the work is done is /about's subject, not the landing page's.    */}
            <h2 className="text-3xl font-semibold tracking-tight">
              Quality Without Exception.
            </h2>
            {/* max-w-lg: mirrors the Services intro paragraph constraint —
                heading stays wide (672px via wrapper), paragraph pulls in to
                512px, consistent with the established hierarchy language.   */}
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              One standard, applied to our own work and to yours — clear positioning, premium
              design, intelligent enquiry thinking, and careful ongoing refinement.
            </p>

            {/* ⛔⛔ THE THREE CARDS ARE GONE. Carl's decision, 2 September 2026: *"cards will be
                gone, that is a decision."* Their content is MERGED into the paragraph below —
                the three headings survive as PHRASES inside it ("Our design standards...",
                "In business thinking we...", "We apply modern capabilities..."), which is how
                Carl specified the merge.

                ⚠⚠ WHY THEY WENT, AND IT IS A STRUCTURAL REASON, NOT A COPY ONE. Section 2 is a
                2×2 grid of bordered boxes; this was a 1×3 grid of bordered boxes on the very
                next screen. Same border vocabulary, same heading-plus-paragraph shape, same scan
                pattern — ⛔ BY THE SECOND GRID THE EYE RECOGNISES THE PATTERN AND SKIMS, so the
                harder argument landed on the least attention. ⚠ Section 2's evenness only reads
                as restraint if it happens ONCE; twice and it is the site's default way of
                presenting anything.

                ⛔ AND THE FORM WAS SLIGHTLY FALSE HERE. Section 2's four cards are four
                DIFFERENT services. These three were three LENSES ON ONE THING — this site — so
                the grid presented a single piece of evidence as three parallel items.

                ⚠ THE LAYOUT BELOW IS PROVISIONAL AND CARL SAID SO: *"The layout in 3 will be
                redesigned at a later date."* The paragraph sits under the subtext in the same
                max-w-2xl column, on the left. ⛔ Do not treat this arrangement as approved
                design — only the COPY is approved.

                ⚠ THE REGISTER TURNS HERE, DELIBERATELY. The heading and subtext STATE
                ("Quality Without Exception", "One standard..."); this paragraph SPEAKS. Carl:
                *"we can be a bit personal here."* ⛔ That is consistent with D-067's two-register
                rule, not an exception to it — a commitment is something a person makes.

                ⚠ "An asset, as well as a brochure" is CARL'S AMENDMENT to the draft's "an asset,
                not a brochure". It concedes the presentational role on purpose rather than
                denying it.                                                                    */}
            <p className="mt-6 text-base text-neutral-400 leading-relaxed max-w-lg">
              Our design standards come down to restraint and deliberate detail: nothing on a page
              that has not earned its place. Trust gets built before a word is exchanged, and that
              only happens when the work is careful enough to notice. In business thinking we begin
              with what the site has to do — how the business is seen, how enquiries come in, how
              fast they are answered, and what it is still worth years from now. A website is an
              asset, as well as a brochure. We apply modern capabilities where they earn their keep,
              so the site can qualify interest, reduce admin, and take on more without taking more
              of your time. We hold our own work to this, which is the only honest way to offer it
              to anyone else. Everything here was built the way we would build your website.
            </p>
          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────
          text-center: centering the closing CTA shifts the page from delivering
          information to addressing the visitor directly — a premium closing
          register distinct from the left-aligned content sections above.
          max-w-2xl mx-auto: keeps the column intimate, not sprawling.
          href="#": placeholder until a real contact flow is built.             */}
      {/* ⛔⛔ THE LAST SCREEN IS THE HERO INVERTED. Carl, 1 September 2026:
          *"In 4 the footer should be the same size as the header. Basically as
          dimensions go, an upside down version of the hero."*

          ⚠⚠ THIS IS THE SCREEN THE FAULT WAS VISIBLE ON. `min-h-screen` claimed
          the whole 900px window and the footer's 101px then sat BELOW it — 1001px
          of content in a 900px viewport. Scrolled to the bottom, the section's
          top 101px was off-screen and the footer's `border-t` was the thin grey
          line Carl saw sitting where the screen should have ended.

          ⛔ `min-h-[calc(100vh-61px)]` — 61px is the footer's height below, and
          the two MUST sum to exactly 100vh. ⚠ UNASSERTED, AND IT IS A PAIR:
          nothing in code checks that the footer is still 61px. Change one and
          this screen overshoots or leaves a gap. THEY MOVE TOGETHER.

          ⚠ `py-24` REMOVED from the inner block — `flex items-center` on the
          section already centres it, and the fixed padding was fighting it.     */}
      {/* ⚠ `[&>div]:w-full` HERE TOO — see the hero. ⛔ THIS SECTION'S CONTENT
          STAYS CENTRED and always was (`text-center max-w-2xl mx-auto` on the
          inner block, unchanged since it was built). The guard makes the
          Container fill the width so that centring happens against the PAGE
          rather than against a shrunk flex item. Same class, different reason. */}
      <section id="contact" className="min-h-[calc(100vh-61px)] flex items-center [&>div]:w-full">
        <Container>
          <div className="text-center max-w-2xl mx-auto">

            <h2 className="text-3xl font-semibold tracking-tight">
              Start with a sharper digital presence.
            </h2>

            {/* max-w-xl mx-auto: center-aligned body copy needs a shorter line
                measure than left-aligned copy — wide centered lines read as
                unintentional, not editorial.                                   */}
            {/* ⛔ "bespoke", NOT "premium" — Carl, 2 September 2026. THE ONLY CHANGE to this
                section; its copy is otherwise APPROVED AS IT STOOD.

                ⚠ THE REASON IS FREQUENCY, NOT THE WORD. Carl: *"Mentioned once - its there.
                Mentioned again - reinforces it. Mentioned again - lets not labour the point."*
                "Premium" survives TWICE on this page — the `#services` intro and the `#work`
                subtext — and this was the third. ⛔ Card 1's heading "Premium Website Design"
                also keeps it, so the word is not being retired; only the third body mention is.

                ⚠ AND "BESPOKE" IS ALREADY THE ARGUMENT card 1's body makes. A claim a
                competitor cannot honestly copy, where "premium" only asks to be believed.    */}
            <p className="mt-6 text-base text-neutral-400 leading-relaxed max-w-xl mx-auto">
              Whether you need a bespoke website, a stronger first impression, or a smarter
              way to handle enquiries, C2B begins with understanding what your business
              needs to become.
            </p>

            {/* ⛔⛔ THIS BUTTON OPENS `/about`, NOT `/start`. Carl's navigation
                ruling, 1 September 2026, and the reasoning is load-bearing:

                  Home  = who we are and what we do
                  About = HOW  ("expands on the Home")
                  /start = the conversation, ending at the send button

                ⚠⚠ THE FAULT IT FIXES: this was the strongest CTA on the page,
                positioned exactly where a convinced reader lands — so a visitor
                scrolling straight down reached `/start` having NEVER SEEN
                `/about`. The header's `About` sits third but its content is a
                separate route, so the page delivered four sections against a
                five-item promise. Anyone who did reach About arrived AFTER the
                invitation to start.

                ⛔ "WHO WE ARE" IS NOT A SOFTER LABEL — IT IS THE ARGUMENT.
                Carl is a solo proprietor, and the About page's whole thesis is
                that "we" is nonetheless the accurate word: a team with defined
                roles, each knowing what it needs to know, with Carl as the
                bridge. ⚠ "Who I am" would contradict that page BEFORE the reader
                arrived. Carl, 1 September 2026: *"My thoughts on the matter are
                crystal clear - its 'who we are'!"*

                ⚠ The label sets up a small expectation gap — a reader may expect
                faces and find roles. THAT GAP IS WHERE THE ARGUMENT LANDS. Do
                not "fix" it by renaming this to `How we work`.

                ⛔ THE MATCHING BUTTON IS IN `/about` SECTION 4 and carries
                `Start a conversation` to `/start`. The two are a PAIR: same
                dimensions, colour and position, deliberately. Change one and the
                other goes stale. Reasoning: `live-work/about-section-thinking.md`
                → the navigation ruling.                                          */}
            <div className="mt-10">
              <a
                href="/about"
                className="inline-block bg-white text-black text-sm font-semibold px-7 py-3 rounded-full tracking-wide hover:bg-neutral-100 transition-colors duration-200"
              >
                Who we are
              </a>
            </div>

          </div>
        </Container>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────
          ⛔ `py-5` — SHRUNK FROM `py-10` on 1 September 2026. Carl: *"The footer
          doesnt have to be that big."* ⚠ It was 101px; `py-5` brings it to 61px,
          matching the header's own `py-5` padding so the two ends of the page are
          built the same way. ⛔ The header measures 81px because it also carries
          the mark; the footer is one line of text, so the same padding yields a
          shorter box. THAT IS INTENTIONAL — Carl asked for a smaller footer, not
          an identical one.

          ⚠⚠ 61px IS PAIRED WITH `#contact`'s `calc(100vh-61px)` ABOVE. The two
          must sum to exactly 100vh, and NOTHING IN CODE ASSERTS IT. Change this
          padding and that calc goes stale silently — the page will overshoot the
          window again, which is the exact fault this chunk fixed.               */}
      <footer className="border-t border-neutral-800 py-5">
        <Container>
          <p className="text-center text-sm text-neutral-500">
            © 2026 C2B Web Design. All rights reserved.
          </p>
        </Container>
      </footer>

    </div>
  );
}
