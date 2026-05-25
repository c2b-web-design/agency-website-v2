import Container from "@/components/layout/container";

export default function Home() {
  return (
    // bg-neutral-950: forces a near-black background regardless of system dark mode
    // text-white: sets the default text color for the whole page
    // min-h-screen: ensures the dark background fills the viewport even on short pages
    <div className="bg-neutral-950 text-white min-h-screen">

      {/* ── Navbar ────────────────────────────────────────────────────────────
          border-b: subtle bottom line separates nav from content without a shadow
          py-5: compact vertical padding keeps the nav from dominating the page      */}
      <nav className="border-b border-neutral-800 py-5">
        <Container>
          {/* flex + justify-between: pushes logo to the left, links to the right
              items-center: vertically aligns logo and links on the same baseline    */}
          <div className="flex items-center justify-between">

            {/* Brand lockup: C2B is the logo mark; Web Design is a supporting descriptor that
                trains brand association while the identity is still being established.
                The long-term goal is C2B standing alone — for now, "Web Design" makes the
                pairing legible to new visitors without requiring prior familiarity.
                items-baseline: aligns both spans on the text baseline, which is more precise
                than items-center when pairing different visual weights.
                gap-2 (8px): tight enough to read as one compound name, not two separate labels. */}
            <div className="flex items-baseline gap-2">
              {/* Logo mark: bold, uppercase, tracked-out — the dominant brand element.
                  All the visual weight lives here; "Web Design" defers to it.           */}
              <span className="text-xs font-bold tracking-[0.2em] uppercase">C2B</span>
              {/* Descriptor: quieter companion. font-normal and neutral-500 make it clearly
                  subordinate. No uppercase or wide tracking — those would create competition
                  with the mark and make the lockup read as two items rather than one.    */}
              <span className="text-xs font-normal tracking-normal text-neutral-500">Web Design</span>
            </div>

            {/* gap-6 (down from gap-8): gap-8 was loose enough to feel unresolved.
                gap-6 tightens the group into a deliberate cluster without crowding.
                duration-200 on hover: an explicit transition duration makes the hover feel smooth
                rather than a hard snap. neutral-100 (not pure white) softens the arrival —
                premium interfaces avoid binary on/off color states.
                hidden md:flex: on mobile the links are hidden entirely — four nav items in a
                single row at 400px competes with the brand lockup and feels cramped. The brand
                lockup alone is sufficient at small sizes. A hamburger menu will be added later
                when the site has real navigation depth to justify the interaction cost.        */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#work"     className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200">Work</a>
              <a href="#services" className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200">Services</a>
              <a href="#"         className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200">About</a>
              <a href="#"         className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200">Contact</a>
            </div>
          </div>
        </Container>
      </nav>

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
      <section id="services" className="py-24 border-t border-neutral-800">
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
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Card: border border-neutral-800 uses the same hairline-rule vocabulary as
                section separators, unifying the visual system. p-8 gives the text generous
                internal breathing room. No border-radius — sharp corners feel more
                architectural and editorial on a dark background.                          */}

            <div className="border border-neutral-800 p-8">
              {/* Card heading: text-lg is one clear step above the card body text.
                  font-semibold and tracking-tight match the heading style used elsewhere. */}
              <h3 className="text-lg font-semibold tracking-tight">Premium Website Design</h3>
              {/* Card body: text-sm keeps each card compact. leading-relaxed maintains
                  readability. max-w-sm (384px) constrains the line length on wide desktop
                  cards — the card stays architecturally wide but the text sits in a
                  controlled column, leaving intentional whitespace to the right.          */}
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                A high-quality website that makes your business look more trusted, credible,
                and worth the investment. Built with the attention to detail that reflects
                well on your brand.
              </p>
            </div>

            <div className="border border-neutral-800 p-8">
              <h3 className="text-lg font-semibold tracking-tight">Website Transformation</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                Turning a dated or underperforming website into a sharper, more persuasive
                digital presence. Same business, stronger first impression.
              </p>
            </div>

            <div className="border border-neutral-800 p-8">
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

            <div className="border border-neutral-800 p-8">
              <h3 className="text-lg font-semibold tracking-tight">Ongoing Growth & Improvement</h3>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-sm">
                Your website should improve over time, not sit still after launch. We continue
                refining, optimising, and updating so your digital presence keeps working harder.
              </p>
            </div>

          </div>
        </Container>
      </section>

      {/* ── Work ──────────────────────────────────────────────────────────── */}
      <section id="work" className="py-24 border-t border-neutral-800">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight">Work</h2>
          <p className="mt-4 text-sm text-neutral-500">Coming soon.</p>
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
