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
            <span className="text-lg font-semibold tracking-tight">Agency</span>
            <div className="flex items-center gap-8">
              <a href="#work"     className="text-sm text-neutral-400 hover:text-white transition-colors">Work</a>
              <a href="#services" className="text-sm text-neutral-400 hover:text-white transition-colors">Services</a>
              <a href="#"         className="text-sm text-neutral-400 hover:text-white transition-colors">About</a>
              <a href="#"         className="text-sm text-neutral-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </Container>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────────
          py-32: generous vertical space — the hero sets the premium tone
          max-w-3xl on h1: keeps long headlines from stretching too wide to read   */}
      <section className="py-32">
        <Container>
          <h1 className="text-6xl font-bold tracking-tight leading-tight max-w-3xl">
            We build brands that mean something.
          </h1>
          {/* mt-6: breathing room between headline and subtext
              max-w-xl: shorter line length for the paragraph improves readability  */}
          <p className="mt-6 text-lg text-neutral-400 max-w-xl">
            A creative agency focused on strategy, design, and digital experiences that connect with people.
          </p>
          {/* mt-10: more space before the CTA to give it visual weight
              inline-block: lets the link behave like a button with padding
              rounded-full: pill shape — modern and clean                           */}
          <div className="mt-10">
            <a
              href="#work"
              className="inline-block bg-white text-black text-sm font-medium px-6 py-3 rounded-full hover:bg-neutral-200 transition-colors"
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
            © 2026 Agency. All rights reserved.
          </p>
        </Container>
      </footer>

    </div>
  );
}
