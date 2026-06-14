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
          py-32: generous vertical space — spaciousness signals confidence and quality  */}
      <section className="py-32">
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
      <section id="services" className="pt-16 pb-24 border-t border-neutral-800">
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
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                A high-quality website that makes your business look more trusted, credible,
                and worth the investment. Built with the attention to detail that reflects
                well on your brand.
              </p>
            </div>

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Website Transformation</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                Turning a dated or underperforming website into a sharper, more persuasive
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
              <h3 className="text-lg font-semibold tracking-tight">Ongoing Growth & Improvement</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                Your website should improve over time, not sit still after launch. We continue
                refining, optimising, and updating so your digital presence keeps working harder.
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
      <section id="work" className="py-24 border-t border-neutral-800">
        <Container>

          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              Built to set the standard.
            </h2>
            {/* max-w-lg: mirrors the Services intro paragraph constraint —
                heading stays wide (672px via wrapper), paragraph pulls in to
                512px, consistent with the established hierarchy language.   */}
            <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-lg">
              Before we bring this level of thinking to client projects, we apply it to our own.
              This site is the first expression of the C2B approach: clear positioning, premium design,
              intelligent enquiry thinking, and careful ongoing refinement.
            </p>
          </div>

          {/* 3-col on desktop: visually distinct from Services 2-col grid,
              same border/padding/type vocabulary. At desktop card width (~384px)
              the text area is ~320px — already tighter than max-w-sm, so no
              per-paragraph width constraint is needed here.                 */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Design Standard</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                A restrained, premium visual system built to create trust before a conversation begins.
              </p>
            </div>

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Business Thinking</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                A website structured around perception, enquiries, response, and long-term value —
                not decoration for its own sake.
              </p>
            </div>

            <div className="border border-neutral-800 p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">Modern Capability</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
                A foundation for smarter enquiry journeys and digital systems that help reduce manual
                work as the business grows.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────
          text-center: centering the closing CTA shifts the page from delivering
          information to addressing the visitor directly — a premium closing
          register distinct from the left-aligned content sections above.
          max-w-2xl mx-auto: keeps the column intimate, not sprawling.
          href="#": placeholder until a real contact flow is built.             */}
      <section id="contact" className="min-h-screen flex items-center">
        <Container>
          <div className="text-center max-w-2xl mx-auto py-24">

            <h2 className="text-3xl font-semibold tracking-tight">
              Start with a sharper digital presence.
            </h2>

            {/* max-w-xl mx-auto: center-aligned body copy needs a shorter line
                measure than left-aligned copy — wide centered lines read as
                unintentional, not editorial.                                   */}
            <p className="mt-6 text-base text-neutral-400 leading-relaxed max-w-xl mx-auto">
              Whether you need a premium website, a stronger first impression, or a smarter
              way to handle enquiries, C2B begins with understanding what your business
              needs to become.
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

      {/* ── Footer ────────────────────────────────────────────────────────────
          py-10: less space than sections — footer is a quiet ending             */}
      <footer className="border-t border-neutral-800 py-10">
        <Container>
          <p className="text-center text-sm text-neutral-500">
            © 2026 C2B Web Design. All rights reserved.
          </p>
        </Container>
      </footer>

    </div>
  );
}
