"use client";

import { useState } from "react";
import Container from "@/components/layout/container";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Work",     href: "#work" },
  { label: "About",    href: "#" },
  { label: "Contact",  href: "#contact" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);


  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="border-b border-neutral-800 py-5 relative">
      <Container>
        <div className="flex items-center justify-between">

          {/* Brand lockup */}
          {/* ⚠ THE LOGO RUNS AT 40px TALL — D-060, Carl's ruling of 25 August
              2026, judged by eye on a running production build. This is the
              STANDARD SIZE FOR THE LOGO ON PAGES, not a value local to this
              header.

              ⛔ 40px IS THE HEIGHT. The width follows from the aspect ratio
              (69.9px at 40, from the 951x544 mark). ⚠ SET THE HEIGHT AND LET
              THE WIDTH FALL OUT — never the reverse.

              ⛔ THE NAV GROWS 61px -> 81px AND THAT IS ACCEPTED, not a cost to
              recover. Carl let it grow deliberately. Do not shrink the mark to
              protect the old height.

              ⚠⚠ DO NOT "CORRECT" THIS BACK TO CAP-HEIGHT. A first pass derived
              24px by matching the cap-height of the 12px `C2B` text this
              replaced. Sound arithmetic, wrong target, and Carl rejected it as
              too small. ⛔ THE c AND THE b ARE OPEN LOOPS: only 38.4% of the
              mark's ink box is ink — 61.6% is background showing through the
              letterforms, where the text it replaced was solid. Equal
              cap-height therefore delivers a fraction of the visual weight, so
              the mark must run LARGER than the text it stands in for.

              ⚠ The transparent margin was NOT the problem: 5.7% empty width,
              9.6% empty height, hard edges. Cropping helped a little; the
              open-loop nature is the reason. Full reasoning: D-060.

              ⛔ 40px ON DARK. Every page is dark today and this assumes it. On
              a light background the gold loses contrast and the white specular
              highlights (11,219 opaque pixels at luminance 255) vanish
              entirely. A LIGHT-BACKGROUND TREATMENT IS UNDECIDED and D-060 does
              not cover it.

              ⚠ UNDECIDED, NOT OMITTED: whether "Web Design" stays at all —
              ⛔ AND IF IT DOES IT WILL ALMOST CERTAINLY BE A 3D TEXT FONT,
              which makes this a lockup of two extruded objects in one material
              world rather than a metal mark beside flat grey text. THE SPAN
              BELOW IS A PLACEHOLDER; its awkwardness at 40px is NOT evidence
              against the size. Also undecided: animation, hover, and whether
              the orbital light catches the mark.

              `items-baseline` cannot align a replaced element the way it aligns
              text, so the row is `items-center` while the mark is present.

              /c2b-logo-mark.png was EXTRACTED from
              brand-assets/logo/c2b-logo-gold-hero.svg — which is NOT a vector,
              but one <image> element wrapping a base64 PNG, as its own <desc>
              says — then cropped to 951x544 keeping 8px of breathing room.
              Precedent for serving it from public/: /contact-field-source.jpg. */}
          <div className="flex items-center gap-2">
            <img
              src="/c2b-logo-mark.png"
              alt="C2B"
              width={951}
              height={544}
              className="h-10 w-auto"
            />
            <span className="text-xs font-normal tracking-normal text-neutral-500">Web Design</span>
          </div>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
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

          {/* Mobile menu button — hidden on desktop */}
          <button
            className="md:hidden text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            Menu
          </button>

        </div>
      </Container>

      {/* Mobile nav row — slim horizontal bar sitting below the header */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden absolute top-full left-0 right-0 border-b border-neutral-800 bg-neutral-950 z-50"
        >
          <Container>
            <div className="flex items-center justify-between py-3">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
}
