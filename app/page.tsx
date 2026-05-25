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
                premium interfaces avoid binary on/off color states.                 */}
            <div className="flex items-center gap-6">
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

          {/* Headline:
              text-5xl md:text-6xl: responsive sizing prevents the headline from being oversized
              on mobile where long lines collapse into unreadable stacks. The md: breakpoint
              lets it open up on wider screens where the space is available.
              max-w-2xl (down from max-w-3xl): a narrower column feels curated and editorial.
              Wide headlines read as startup marketing; tight columns read as considered craft.
              leading-[1.1] (tighter than leading-tight = 1.25): at large display sizes, tight
              line-height reads as confident and magazine-like. It only reads as cramped at
              smaller body sizes — here it increases visual tension in a good way.             */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-2xl">
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
          border-t: visual rhythm — each section is separated by a hairline rule
          py-24: consistent section spacing (slightly less than hero)              */}
      <section id="services" className="py-24 border-t border-neutral-800">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight">Services</h2>
          <p className="mt-4 text-sm text-neutral-500">Coming soon.</p>
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
