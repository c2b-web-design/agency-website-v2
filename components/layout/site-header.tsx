"use client";

import { useState } from "react";
import Container from "@/components/layout/container";

const NAV_LINKS = [
  { label: "Work",     href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About",    href: "#" },
  { label: "Contact",  href: "#" },
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
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">C2B</span>
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

      {/* Mobile dropdown — full-width, sits below the header bar */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden absolute top-full left-0 right-0 border-b border-neutral-800 bg-neutral-950 z-50"
        >
          <Container>
            <div className="flex flex-col py-4 gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors duration-200 py-2"
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
